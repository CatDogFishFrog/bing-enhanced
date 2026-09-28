# Bing Environment Recorder

The recorder is a standalone Tampermonkey diagnostic userscript. It records general Bing page lifecycle, interactions, navigation, DOM mutations, scripts, resources, console messages, and optional full HTML snapshots. It is not included in the Bing Enhanced userscript build and does not depend on any specific Bing feature or page type.

## Install and Record

1. Install `tools/bing-environment-recorder.user.js` as a separate userscript in Tampermonkey.
2. Open a Bing page and use the Tampermonkey menu to configure the four `Toggle ... for next recording` options. Defaults preserve the original broad capture behavior: all options are on.
3. Select **Start tracking after next reload**, then reload the page. Recording starts at `document-start`.
4. Perform the navigation or interaction to diagnose. The report can span full document navigations while tracking remains active.
5. Select **Stop tracking and download report**. The recorder captures its final snapshot if enabled, flushes the report, and downloads JSON.

Options are saved in Tampermonkey storage and apply to a new recording after reload; changing them does not alter a capture already in progress. **Reset tracking data** clears the report and any pending start, but keeps the options.

## Capture Options

| Option | Default | Captures |
| --- | --- | --- |
| Interaction events | On | Clicks on links, buttons, inputs, labels, tabs, and other common interactive elements. Each `user:click` includes a short element summary, link URL when applicable, mouse button, and modifier keys. Form values are not recorded. |
| URL navigation events | On | Same-document URL changes from Tampermonkey `urlchange` when available, browser `popstate` and `hashchange`, and a post-click URL check. Each `navigation:urlchange` has `from`, `to`, and `source`. |
| DOM mutation events | On | `childList`, `attributes`, and `characterData` changes observed across the document. Added element HTML is truncated to 10,000 characters per node. |
| Full HTML snapshots | On | Full-document HTML at lifecycle points, after DOM settles, and when tracking stops. At most 16 snapshots are stored per page. |

Disabling DOM mutation events does not disable lifecycle, interaction, navigation, console, error, or CSP events. Full snapshots can be disabled independently; when enabled, a DOM observer is still used to detect settled DOM. The report also collects script-tag observations, JavaScript resource timing, and navigation timing as before.

## Reading Reports

New reports have `schemaVersion: 2`, top-level `captureOptions`, and a `pages` array. Each page records its own effective `captureOptions`, initial URL/title, start time, events, observed scripts/resources, snapshots, and notes. Full navigation can add another page entry to the same report; same-document route changes stay in the current page's event list.

Every new event keeps the flat `{ timeMs, type, ...details }` shape and adds a `tags` array for filtering. `timeMs` is relative to that document's `performance.now()` clock; it is not comparable across page entries. The stable tags are:

| Tag | Event types |
| --- | --- |
| `interaction` | `user:click` |
| `navigation` | `navigation:urlchange` |
| `dom` | `dom:attributes`, `dom:characterData`, `dom:childList` |
| `console` | `console:log`, `console:info`, `console:warn`, `console:error`, `console:debug`, `console:trace` |
| `error` | `window:error`, `window:unhandledrejection` |
| `security` | `csp:violation` |
| `lifecycle` | `lifecycle:DOMContentLoaded`, `lifecycle:load`, `lifecycle:pageshow`, `lifecycle:pagehide` |

Legacy reports may have no `schemaVersion`, `captureOptions`, or event `tags`. Parsers should tolerate missing arrays and use `event.tags ?? []`. Some entries in a resumed legacy report may lack fields that were added later.

### Useful Event Fields

- `user:click`: `element.tag`, `element.id`, `element.classes`, `element.role`, `element.ariaLabel`, `element.ariaCurrent`, `element.title`, short `element.text`, and `element.href` when the clicked control is an anchor.
- `navigation:urlchange`: `from`, `to`, and `source` (`urlchange`, `popstate`, `hashchange`, or `after-click`). The click event itself retains the target anchor URL even if a full navigation unloads the document before a same-document URL-change event can be recorded.
- DOM events: `target` is a compact element path; attribute changes include `attribute`, `oldValue`, and `newValue`; child-list events include truncated `added` and `removed` node descriptions.
- Snapshots: `stage`, `capturedAt`, `timeMs`, `url`, and `html`.

The event cap is 20,000 per page. The recorder notes when it is reached. Script order means the order script tags were observed, not guaranteed execution order. Cross-origin script response bodies are not readable, and page-world console instrumentation is best effort.

### Node.js Search Cheat Sheet

For a large report, parse it once and print only the relevant events. Save this as `inspect-report.mjs`, then run `node inspect-report.mjs path/to/report.json`:

```js
import { readFile } from 'node:fs/promises';

const report = JSON.parse(await readFile(process.argv[2], 'utf8'));

for (const [pageIndex, page] of (report.pages ?? []).entries()) {
  const events = page.events ?? [];
  const interactions = events.filter((event) => (event.tags ?? []).includes('interaction'));
  const navigation = events.filter((event) => (event.tags ?? []).includes('navigation'));

  console.log({
    pageIndex,
    url: page.url,
    eventCount: events.length,
    interactionCount: interactions.length,
    navigationCount: navigation.length,
    snapshotStages: (page.snapshots ?? []).map((snapshot) => snapshot.stage),
  });

  for (const event of [...interactions, ...navigation].sort((a, b) => a.timeMs - b.timeMs)) {
    console.log({
      timeMs: event.timeMs,
      type: event.type,
      element: event.element,
      from: event.from,
      to: event.to,
      source: event.source,
    });
  }
}
```

To inspect a different category, filter by tag, for example `(event.tags ?? []).includes('dom')`, or by `event.type`. Avoid printing `snapshot.html` or full DOM `added` values unless needed; those fields can be extremely large. Use `timeMs` to order events within a page and correlate a click, URL change, and subsequent DOM mutations.

## Privacy and Sharing

Reports can contain search terms and other page data in URLs, visible labels, snapshots, DOM fragments, script URLs, and console output. The recorder does not collect input values, but that does not make a report safe to publish. Disable DOM events and full snapshots before starting when they are not needed, inspect the JSON locally, and redact sensitive data before sharing it with another person or an AI agent.