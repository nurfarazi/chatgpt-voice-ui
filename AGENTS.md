# Repository Guidelines

## Project Structure & Module Organization
- `src/background/serviceWorker.ts` handles extension lifecycle, persona state, and Chrome event wiring.
- `src/content` mounts the voice overlay (`index.tsx`, `overlay.tsx`, `overlay.css`) that modifies the ChatGPT page.
- `src/ui/popup` and `src/ui/options` contain the React entry points for user-facing controls; shared utilities live in `src/libs` and `src/types`.
- Build artifacts land in `dist/`, release-ready ZIPs in `releases/`, and automation lives under `scripts/` (see `scripts/pack-extension.mjs`).
- Static brand assets live in `assets/`; keep large generated files out of version control unless referenced by the manifest.

## Build, Test & Development Commands
- `npm run dev`: launches Vite in extension mode and regenerates bundles in `dist/` while you iterate.
- `npm run build`: runs `tsc -b` for type safety, then creates a production build.
- `npm run lint`: executes ESLint across `src/` and `scripts/`, failing on warnings.
- `npm run test`: runs Vitest with the jsdom environment defined in `vitest.setup.ts`.
- `npm run pack`: builds and zips the extension into `releases/chatgpt-voice-ui-<version>.zip`; use before tagging a release.
- `npm run clean`: removes `dist/`, `.turbo/`, and `.vite/` artifacts.

## Coding Style & Naming Conventions
- TypeScript and React are the defaults; keep modules ESM (`type: "module"`).
- Prettier enforces 2-space indentation, semicolons, and single quotes—run `npm run format` before opening a PR touching front-end code.
- React components use PascalCase file names (`PersonaPanel.tsx`), hooks/utilities use camelCase, and constants go SCREAMING_SNAKE_CASE when shared across modules.
- Prefer colocating component styles (`styles.css`) with their entry point and exporting only the minimum surface from shared libs.

## Testing Guidelines
- Write unit and integration tests with Vitest; the existing pattern is `src/**/*.test.ts`. Import helpers from `@testing-library/react` for DOM assertions.
- Use the configured jsdom setup (`vitest.setup.ts`) for matcher extensions like `toBeInTheDocument`.
- Target Chrome extension behaviors (storage sync, messaging) with mocked Chrome APIs from `@types/chrome`; avoid reliance on real browser globals.
- Keep coverage expectations pragmatic but meaningful—high-risk modules such as `src/libs/storage.ts` and background messaging should have regression tests before merging.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `chore:`) as seen in the history, and keep subjects under 72 characters.
- Squash locally when practical, but preserve logical boundaries if multiple features ship together.
- PRs should include: scope summary, testing notes (`npm run test`, `npm run lint`), linked issues when applicable, and screenshots or screen recordings for UI/overlay changes.
- Tag reviewers responsible for the touched surface (background, content, UI) and flag any required Chrome permissions or manifest changes in the description.
