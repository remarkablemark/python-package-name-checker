# Contracts: Dark Mode

No API contracts are required for this feature. Dark mode is entirely client-side:

- **State storage**: `localStorage` (key: `"theme"`, values: `"system"` | `"light"` | `"dark"`)
- **OS detection**: `window.matchMedia('(prefers-color-scheme: dark)')` browser API
- **DOM mutation**: `.dark` class on `document.documentElement`

All interactions are between the React component tree and browser APIs — no network endpoints are involved.
