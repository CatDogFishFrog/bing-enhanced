// ==UserScript==
// @name         Bing Environment Recorder
// @namespace    https://github.com/CatDogFishFrog/bing-enhanced
// @version      0.1.0
// @description  Records page lifecycle diagnostics after the next reload
// @match        https://www.bing.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_KEY = 'bing-environment-recorder';
    const MAX_EVENTS = 20000;
    const MAX_SNAPSHOTS = 16;
    const SNAPSHOT_DEBOUNCE_MS = 900;
    const PERSIST_DEBOUNCE_MS = 400;
    const stored = GM_getValue(STORAGE_KEY, { armed: false, report: null });
    let report = stored.report;
    let activePage = null;
    let domObserver = null;
    let bridgeObserver = null;
    let persistTimer = 0;
    let snapshotTimer = 0;
    let bridgeToken = '';

    function elapsed() {
        return Math.round(performance.now() * 100) / 100;
    }

    function isoNow() {
        return new Date().toISOString();
    }

    function persistNow() {
        if (persistTimer) {
            clearTimeout(persistTimer);
            persistTimer = 0;
        }

        try {
            GM_setValue(STORAGE_KEY, { armed: false, report });
        } catch (error) {
            console.error('[Bing Environment Recorder] Could not persist report data.', error);
        }
    }

    function schedulePersist() {
        if (persistTimer) return;
        persistTimer = setTimeout(persistNow, PERSIST_DEBOUNCE_MS);
    }

    function addEvent(type, details = {}) {
        if (!report?.tracking || !activePage) return;

        if (activePage.events.length >= MAX_EVENTS) {
            if (!activePage.eventLimitReached) {
                activePage.eventLimitReached = true;
                activePage.notes.push(`Mutation/event limit reached (${MAX_EVENTS}).`);
                persistNow();
            }
            return;
        }

        activePage.events.push({ timeMs: elapsed(), type, ...details });
        schedulePersist();
    }

    function safeValue(value) {
        if (value instanceof Error) {
            return { name: value.name, message: value.message, stack: value.stack || null };
        }

        try {
            return JSON.parse(JSON.stringify(value));
        } catch {
            return String(value);
        }
    }

    function nodePath(node) {
        if (!(node instanceof Element)) return node.nodeName || '#document';

        const parts = [];
        let current = node;
        while (current instanceof Element && parts.length < 8) {
            let part = current.localName;
            if (current.id) {
                parts.unshift(`${part}#${current.id}`);
                break;
            }

            const parent = current.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children).filter(
                    (sibling) => sibling.localName === current.localName,
                );
                if (siblings.length > 1) {
                    part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
                }
            }

            parts.unshift(part);
            current = parent;
        }

        return parts.join(' > ');
    }

    function describeNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            return { nodeName: node.nodeName, html: node.outerHTML?.slice(0, 10000) || '' };
        }

        return { nodeName: node.nodeName, text: node.textContent?.slice(0, 4000) || '' };
    }

    const recordedScripts = new WeakSet();
    function recordScript(script) {
        if (!(script instanceof HTMLScriptElement) || recordedScripts.has(script)) return;
        recordedScripts.add(script);
        activePage.scripts.push({
            orderObserved: activePage.scripts.length + 1,
            timeMs: elapsed(),
            src: script.src || null,
            type: script.type || 'classic',
            async: script.async,
            defer: script.defer,
            noModule: script.noModule,
            inlineCode: script.src ? null : script.textContent,
        });
    }

    function recordScriptsIn(node) {
        if (!(node instanceof Element)) return;
        if (node instanceof HTMLScriptElement) recordScript(node);
        node.querySelectorAll('script').forEach(recordScript);
    }

    function collectResources() {
        const seen = new Set(activePage.resources.map((entry) => `${entry.name}|${entry.startTime}`));
        performance.getEntriesByType('resource').forEach((entry) => {
            if (entry.initiatorType !== 'script' && !/\.m?js(?:$|[?#])/i.test(entry.name)) return;

            const key = `${entry.name}|${entry.startTime}`;
            if (seen.has(key)) return;
            seen.add(key);
            activePage.resources.push({
                name: entry.name,
                initiatorType: entry.initiatorType,
                startTime: entry.startTime,
                duration: entry.duration,
                responseEnd: entry.responseEnd,
                transferSize: entry.transferSize || null,
            });
        });
    }

    function snapshot(stage) {
        if (!report?.tracking || !activePage) return;
        if (activePage.snapshots.length >= MAX_SNAPSHOTS) {
            if (!activePage.snapshotLimitReached) {
                activePage.snapshotLimitReached = true;
                activePage.notes.push(`Full HTML snapshot limit reached (${MAX_SNAPSHOTS}).`);
                schedulePersist();
            }
            return;
        }

        activePage.snapshots.push({
            stage,
            capturedAt: isoNow(),
            timeMs: elapsed(),
            html: document.documentElement?.outerHTML || null,
        });
        collectResources();
        schedulePersist();
    }

    function scheduleSnapshot() {
        if (snapshotTimer) clearTimeout(snapshotTimer);
        snapshotTimer = setTimeout(() => {
            snapshotTimer = 0;
            snapshot('dom-settled');
        }, SNAPSHOT_DEBOUNCE_MS);
    }

    function captureMutation(mutation) {
        const details = { target: nodePath(mutation.target) };
        if (mutation.type === 'attributes') {
            details.attribute = mutation.attributeName;
            details.oldValue = mutation.oldValue;
            details.newValue = mutation.target.getAttribute(mutation.attributeName);
        } else if (mutation.type === 'characterData') {
            details.oldValue = mutation.oldValue;
            details.newValue = mutation.target.textContent?.slice(0, 4000) || '';
        } else {
            details.added = Array.from(mutation.addedNodes, describeNode);
            details.removed = Array.from(mutation.removedNodes, describeNode);
            mutation.addedNodes.forEach(recordScriptsIn);
        }

        addEvent(`dom:${mutation.type}`, details);
    }

    function captureConsoleInPage() {
        bridgeToken = Array.from(crypto.getRandomValues(new Uint32Array(4)))
            .map((value) => value.toString(16))
            .join('');
        const source = `(() => {
            const token = ${JSON.stringify(bridgeToken)};
            for (const method of ['log', 'info', 'warn', 'error', 'debug', 'trace']) {
                const original = console[method];
                if (typeof original !== 'function') continue;
                console[method] = function (...args) {
                    try {
                        const safeArgs = args.map((value) => {
                            if (value instanceof Error) return { name: value.name, message: value.message, stack: value.stack || null };
                            try { return JSON.parse(JSON.stringify(value)); } catch { return String(value); }
                        });
                        window.postMessage({ source: 'bing-environment-recorder', token, method, args: safeArgs, time: performance.now() }, location.origin);
                    } catch {}
                    return Reflect.apply(original, this, args);
                };
            }
        })();`;

        function inject() {
            if (!document.documentElement) return false;
            const script = document.createElement('script');
            script.textContent = source;
            const nonceSource = document.querySelector('script[nonce]');
            if (nonceSource) script.nonce = nonceSource.nonce;
            document.documentElement.appendChild(script);
            script.remove();
            activePage.consoleBridge = 'injected; page execution cannot be verified';
            return true;
        }

        if (!inject()) {
            activePage.consoleBridge = 'waiting for document element';
            bridgeObserver = new MutationObserver(() => {
                if (inject()) {
                    bridgeObserver.disconnect();
                    bridgeObserver = null;
                }
            });
            bridgeObserver.observe(document, { childList: true, subtree: true });
        }
    }

    function startPageCapture() {
        const page = {
            url: location.href,
            titleAtStart: document.title,
            startedAt: isoNow(),
            events: [],
            scripts: [],
            resources: [],
            snapshots: [],
            notes: [],
            consoleBridge: 'not attempted',
        };
        report.pages.push(page);
        activePage = page;
        persistNow();

        snapshot('document-start');
        document.querySelectorAll('script').forEach(recordScript);
        domObserver = new MutationObserver((mutations) => {
            mutations.forEach(captureMutation);
            scheduleSnapshot();
        });
        domObserver.observe(document, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true,
            characterData: true,
            characterDataOldValue: true,
        });

        document.addEventListener('DOMContentLoaded', () => snapshot('DOMContentLoaded'), { once: true });
        window.addEventListener('load', () => snapshot('load'), { once: true });
        window.addEventListener('pageshow', () => snapshot('pageshow'), { once: true });
        window.addEventListener('error', (event) => {
            addEvent('window:error', {
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                error: safeValue(event.error),
            });
        }, true);
        window.addEventListener('unhandledrejection', (event) => {
            addEvent('window:unhandledrejection', { reason: safeValue(event.reason) });
        });
        window.addEventListener('securitypolicyviolation', (event) => {
            addEvent('csp:violation', {
                directive: event.effectiveDirective,
                blockedURI: event.blockedURI,
                sourceFile: event.sourceFile,
                line: event.lineNumber,
            });
        });
        window.addEventListener('message', (event) => {
            const data = event.data;
            if (event.source !== window || data?.source !== 'bing-environment-recorder' || data.token !== bridgeToken) return;
            addEvent(`console:${data.method}`, { args: data.args, pageTimeMs: data.time });
        });

        captureConsoleInPage();
        collectResources();
        setTimeout(() => snapshot('after-1s'), 1000);
        setTimeout(() => snapshot('after-5s'), 5000);
        setTimeout(() => {
            collectResources();
            page.navigationTiming = performance.getEntriesByType('navigation').map((entry) => ({
                type: entry.type,
                startTime: entry.startTime,
                domInteractive: entry.domInteractive,
                domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
                loadEventEnd: entry.loadEventEnd,
                responseEnd: entry.responseEnd,
            }));
            persistNow();
        }, 6000);
    }

    function downloadReport() {
        if (!report) return;
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const siteName = location.hostname.replace(/[^a-z0-9.-]/gi, '_') || 'bing-page';
        link.href = objectUrl;
        link.download = `${siteName}_${timestamp}.json`;
        (document.body || document.documentElement).appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    }

    GM_registerMenuCommand('Start tracking after next reload', () => {
        const current = GM_getValue(STORAGE_KEY, { armed: false, report: null });
        if (current.report?.tracking) {
            console.warn('[Bing Environment Recorder] Tracking is active. Stop and download it first.');
            return;
        }

        GM_setValue(STORAGE_KEY, { armed: true, report: null });
        console.info('[Bing Environment Recorder] Tracking armed. Reload the page to capture from document-start.');
    });

    GM_registerMenuCommand('Stop tracking and download report', () => {
        const current = GM_getValue(STORAGE_KEY, { armed: false, report: null });
        if (current.armed && !current.report) {
            GM_setValue(STORAGE_KEY, { armed: false, report: null });
            console.info('[Bing Environment Recorder] Pending tracking was cancelled.');
            return;
        }
        if (!report?.tracking) {
            console.info('[Bing Environment Recorder] There is no active report to download.');
            return;
        }

        snapshot('stopped');
        collectResources();
        report.tracking = false;
        report.stoppedAt = isoNow();
        if (activePage) activePage.stoppedAt = report.stoppedAt;
        if (domObserver) domObserver.disconnect();
        if (bridgeObserver) bridgeObserver.disconnect();
        if (snapshotTimer) clearTimeout(snapshotTimer);
        persistNow();
        downloadReport();
    });

    GM_registerMenuCommand('Reset tracking data', () => {
        report = null;
        activePage = null;
        if (domObserver) domObserver.disconnect();
        if (bridgeObserver) bridgeObserver.disconnect();
        if (persistTimer) clearTimeout(persistTimer);
        if (snapshotTimer) clearTimeout(snapshotTimer);
        GM_deleteValue(STORAGE_KEY);
        console.info('[Bing Environment Recorder] Stored tracking data and pending capture were cleared.');
    });

    if (stored.armed || report?.tracking) {
        if (!report || stored.armed) {
            report = {
                recorder: 'Bing Environment Recorder',
                recorderVersion: '0.1.0',
                startedAt: isoNow(),
                tracking: true,
                pages: [],
                limitations: [
                    'Script order is the order tags were observed, not guaranteed execution order.',
                    'Cross-origin script response bodies are not readable by this recorder.',
                    'Inline page-world console instrumentation is best-effort and may be blocked by CSP.',
                    'DOM snapshots may include personal or sensitive page data.',
                ],
            };
        }

        report.tracking = true;
        report.pages ||= [];
        startPageCapture();
    }
})();