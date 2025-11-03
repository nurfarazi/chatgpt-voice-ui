## ChatGPT UI Personalizer

Chrome extension that restyles and personalizes the ChatGPT workspace with configurable personas, themes, and voice-first controls.

### Features Implemented (Phase 1)

- Persona-driven theming with preset palettes.
- Content script overlay for quick persona switching and sidebar toggles.
- Popup for one-click persona switches and overlay toggle.
- Background service worker coordinating state, keyboard shortcuts, and tab broadcasts.
- Options dashboard to inspect personas/themes and restore defaults.

### Getting Started

```bash
npm install
npm run dev
```

The dev server rebuilds the extension. Load `dist` as an unpacked extension in Chrome.

### Scripts

- `npm run dev` – Vite watch build for the extension.
- `npm run build` – Production bundle.
- `npm run lint` – ESLint over `src` and `scripts`.
- `npm run test` – Placeholder test runner (configure Vitest suites as features grow).
- `npm run pack` – Zip the built extension into `releases/`.

### Roadmap

Phase 1 scaffolds the core overlay and persona switching. Phase 2 will ship the live theme editor, advanced voice controls, and import/export pipeline defined in `plan.md`.
