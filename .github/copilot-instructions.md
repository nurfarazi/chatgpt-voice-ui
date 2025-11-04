# Copilot instructions for chatgpt-voice-ui

This repo is a Chrome MV3 extension that personalizes the ChatGPT UI with personas, themes, and a voice-friendly overlay. Use these project-specific notes to be productive fast.

## Big picture architecture
- Build tooling: Vite + React + @crxjs/vite-plugin bundles to `dist/` (Manifest V3).
- Manifest: `src/manifest.ts` defines MV3 config, host/matches for ChatGPT, commands, and content scripts.
- Background service worker: `src/background/serviceWorker.ts` initializes default state, handles runtime messages, updates active persona, and broadcasts to ChatGPT tabs.
- Content script: `src/content/index.tsx` injects a Shadow DOM overlay (`overlay.tsx` + `overlay.css`), applies themes to the page with CSS variables, and reacts to runtime messages.
- UI surfaces: Popup (`src/ui/popup`) for switching personas/toggling overlay; Options (`src/ui/options`) for browsing presets and defaults.
- State and types: `src/libs/storage.ts` (chrome.storage sync/local, schema migration, history), `src/libs/personas.ts`, `src/libs/themes.ts`, and `src/types/*`.

## Key flows and contracts
- Messaging types live in `src/types/messages.ts`. Background listens for:
  - `GET_STATE` → returns `StorageSchema`.
  - `SET_ACTIVE_PERSONA` → updates state, appends history (max 50), broadcasts `RELOAD_THEMES`.
  - `TOGGLE_OVERLAY` / `RELOAD_THEMES` → broadcast to all ChatGPT tabs.
- Content script handles:
  - `RELOAD_THEMES` → re-read state and re-apply theme/overlay.
  - `TOGGLE_OVERLAY` → show/hide overlay.
- Apply theme via `applyThemeToDocument(doc, theme, target)` from `src/libs/themes.ts`; theme variables are prefixed `--codex` (`THEME_VARIABLE_PREFIX`).
- Storage shape is in `src/types/storage.ts`. When changing it: bump `STORAGE_VERSION` and update `migrateState` in `src/libs/storage.ts` (keep `history` to last 50, ensure presets present).

## Conventions (project-specific)
- CSS and DOM markers: `--codex*` custom properties, `data-codex-*` attributes, and class `codex-theme-active`; overlay host id `codex-overlay-host`.
- Shadow DOM overlay: content script mounts React inside a shadow root and inlines `overlay.css` via `?inline` import; add new injected assets to `web_accessible_resources` in `manifest.ts`.
- Use `@/*` path alias (see `tsconfig.json`). Strict TypeScript is enabled.
- Prefer `sendRuntimeMessage` in `src/libs/messaging.ts` when code might run where `chrome.runtime` is unavailable (tests/non-extension contexts).
- Only target ChatGPT domains: keep `host_permissions` and `content_scripts.matches` in sync for `chat.openai.com` and `chatgpt.com`.

## Developer workflows
- Dev: `npm run dev` produces fresh bundles in `dist/`. Load unpacked from `chrome://extensions` → Developer mode → Load `dist/`.
- Build: `npm run build`. Package: `npm run pack` → zipped archive in `releases/`.
- Tests: `npm run test` (Vitest + jsdom; see `vitest.config.ts` and `vitest.setup.ts`). In Node tests `chrome` is undefined—storage/messaging utilities fall back safely; stub if you need explicit behavior.
- Lint/format: `npm run lint`, `npm run format`.

## Extension wiring examples
- Add a persona: edit `src/libs/personas.ts` (`personaPresets`, `defaultPersonaId`). Ensure `themeId` exists in `src/libs/themes.ts` presets.
- Add a message:
  1) Extend `RuntimeMessage`/`RuntimeResponse` in `src/types/messages.ts`.
  2) Handle it in `serviceWorker.ts` and (if relevant) in `content/index.tsx`.
  3) Use `sendRuntimeMessage` for calls from UI/content.
- Add new CSS variables: update `createThemeVariableMap` in `src/libs/themes.ts`, then use them in your overlay/styles.
- Keyboard commands: defined in `src/manifest.ts` (`commands`). If you add behavior, wire `chrome.commands.onCommand` in `serviceWorker.ts` and use `getPersonaCycle` from `src/libs/personas.ts`.

## Gotchas and guardrails
- Manifest version is hardcoded in `src/manifest.ts`; the pack script names the zip from `package.json` version—keep them in sync manually.
- HMR is disabled for the dev server (MV3); reload the unpacked extension after changes.
- Content runs at `document_idle`; if you need earlier hooks, adjust `run_at` and ensure idempotent initialization.
- When changing overlay assets (CSS/HTML), ensure they remain listed in `web_accessible_resources`.
