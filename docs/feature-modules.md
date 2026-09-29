# Feature Modules and Settings

This document describes the contract for adding a feature to Bing Enhanced. The settings interface is generic: it reads feature metadata and setting schemas from registered feature descriptors. Do not add feature names, descriptions, or feature-specific controls to `src/core/settings-ui.js`.

## Runtime Model

Each registered feature is started independently. A synchronous exception or rejected startup promise is recorded for that feature and does not stop other features. Keep modules independent: a module should own its behavior and state, must not import another feature's implementation or mutate another feature's state, and should communicate with shared infrastructure only through documented contracts such as its descriptor, settings, logger, and cleanup result. Do not put feature-specific branches in shared core/UI code. A feature may use several implementation methods; the method runner tries them in order, catches each failure, and continues until one reports success. Failures are logged with the feature and method names.

The settings gear is added beside `#sb_form` only on `/search`, `/videos` (including its subroutes), `/images` (including its subroutes), and `/news` (including its subroutes). Settings are stored by stable feature ID with Tampermonkey storage. A user change is persisted immediately. Changing a setting on a running feature cleans it up and starts it again with the new values; disabling a feature runs its cleanup and leaves it stopped.

## Feature Descriptor

Create a module in its own directory under `src/features/<feature-name>/` and export a descriptor. Keep its implementation, helpers, and focused tests in that directory; group multiple modules together only when they are closely related, as with `video-link-rewriter/`:

| Property | Required | Purpose |
| --- | --- | --- |
| `id` | Yes | Stable, unique storage key, such as `video-links-search`. Do not rename it casually or users will lose its saved settings. |
| `name` | Yes | Short display name shown in the settings dialog and logs. |
| `description` | Yes | User-facing summary of the feature. |
| `settings` | No | Array of setting schemas owned by this feature. Every feature already has an enable/disable switch. |
| `matches(context)` | No | Return whether the feature applies to the current route. Keep this synchronous and side-effect free. |
| `start(context)` | Yes | Start the feature and return its result, optionally including cleanup. |

The runtime passes `logger` and a normalized `settings` object to `start()`. A feature should not read Tampermonkey storage directly; declare settings and let the feature manager own persistence and validation.

```js
export const exampleFeature = {
  id: 'example-feature',
  name: 'Example feature',
  description: 'A concise description shown to users.',
  settings: [
    {
      key: 'methodOrder',
      type: 'method-order',
      label: 'Implementation order',
      description: 'Choose which implementation is attempted first.',
      options: [
        { value: 'early-hook', label: 'Early hook' },
        { value: 'dom-fallback', label: 'DOM post-processing' },
      ],
      defaultValue: ['early-hook', 'dom-fallback'],
    },
  ],
  matches() {
    return location.pathname === '/example';
  },
  start({ logger, settings }) {
    return runMethods(
      this.name,
      orderMethods(implementationMethods, settings.methodOrder),
      { logger },
    );
  },
};
```

Register the descriptor in `src/features/index.js`. Use a distinct ID for every independently configurable feature, even when two features share implementation utilities.

## Setting Schemas

Each schema uses a unique `key`, a supported `type`, a user-facing `label`, and a type-appropriate `defaultValue`. Add an optional `description` to explain non-obvious behavior. The settings UI renders these schemas without knowing which module declared them.

| Type | Schema-specific properties | Value |
| --- | --- | --- |
| `toggle` | Optional `toolbarToggle: { trueLabel, falseLabel, trueIcon, falseIcon, routes }` | Boolean |
| `select` | `options: [{ value, label }]` | One listed option value |
| `method-order` | `options: [{ value, label }]` | Ordered array of method IDs |
| `text` | Optional `maxLength` (default 2000), `placeholder` | String |
| `number` | Optional `min`, `max`, `step` | Finite number |

Invalid or stale stored values are replaced with defaults. A method-order value is filtered to known method IDs, duplicates are removed, and any newly added methods are appended so a stored preference cannot permanently omit a fallback. Unknown setting types are not rendered; add a generic control type to the settings UI only when it is reusable across modules.

A `toggle` may declare `toolbarToggle` metadata to opt into a compact icon control beside the settings gear. Supply localized string keys (`trueLabel`, `falseLabel`) and SVG path data (`trueIcon`, `falseIcon`) for both states. Optional `routes` restricts the control to those route prefixes; without it, the control is shown whenever its feature is active. The shared settings UI renders these declarations generically and persists changes through the feature manager; feature IDs and behavior remain outside the UI.

## Implementation Methods and Fault Isolation

Give each method a stable `id`, a descriptive `name`, and a `run(context)` function. `orderMethods(methods, preferredOrder)` applies the configured order and appends methods omitted from the preference. `runMethods(featureName, methods, context)` expects a method to return `{ applied: true, ... }` when it successfully installs the feature, or `{ applied: false }` when it cannot apply. Throwing or rejecting is also treated as a failed attempt. The next method is then tried; if all methods fail, the feature is marked as an error in the settings dialog.

When a method installs a listener, observer, or other long-lived resource, return a `cleanup()` function with its successful result. Cleanup must be safe to call once and should disconnect/remove everything the method installed. The feature manager calls it before a setting-triggered restart and when the feature is disabled.

The runner isolates feature startup and method attempts, but cannot automatically catch exceptions thrown later by arbitrary event handlers or observers. Guard asynchronous callbacks at their boundary, log the feature and operation with `logger.error()`, and keep the failure local. A failure in one module must not stop or alter other features; avoid cross-feature imports, shared mutable feature state, and feature-specific logic in core modules. Prefer a narrow `MutationObserver` over page-wide observation or polling.

## Adding a Module

1. Create a dedicated directory under `src/features/<feature-name>/` and place the implementation, helpers, and focused tests there.
2. Define the name, description, defaults, options, and any feature-specific setting schemas in that module.
3. Give every implementation method a stable ID. If fallback order should be user-configurable, expose a `method-order` setting and pass the ordered methods to `runMethods()`.
4. Make startup idempotent where practical and return cleanup for every active observer/listener/resource.
5. Register the descriptor in `src/features/index.js`.
6. Add focused tests for setting normalization, method order/fallback, route matching, and cleanup as appropriate.
7. Run `npm run check`.

Keep user-facing settings relevant: do not expose a method-order control when there is only one meaningful strategy unless it helps communicate an intended fallback extension. Never hardcode a module-specific branch in the generic settings UI; extend shared UI only with reusable descriptor-driven capabilities.