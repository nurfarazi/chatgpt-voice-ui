## ChatGPT UI Personalizer

Chrome extension that restyles and personalizes the ChatGPT workspace with configurable personas, themes, and voice-first controls.

### Why this matters

- **Reduce cognitive load** by turning ChatGPT into a consistent, branded workspace instead of a generic text box. Each persona carries its own colors, typographic rhythm, and UI chrome, so switching between "research," "manager," or "creator" mode feels tangible.
- **Level up live voice sessions** with a visual overlay that mirrors the active voice persona, mic hints, and shortcut badges—perfect for demos, podcasts, or co-working sessions where you want viewers to know which configuration is active.
- **Accelerate experimentation** thanks to quick persona swapping, persistent defaults, and one-click rollbacks, making it easy to compare prompt framing or tone without dig-through settings.
- **Extend ChatGPT** into niche workflows (teaching assistants, accessibility-first setups, content studios) by duplicating personas and wiring them to custom themes and voices.

### Ideal use cases

1. **Creators streaming or recording ChatGPT voice chats** who need an on-screen indicator of persona/mic state that matches their brand kit.
2. **Product teams running UX reviews** that require repeated, predictable setups (e.g., dark high-contrast layout, specific tone prompts) to evaluate responses apples-to-apples.
3. **Educators or facilitators** who want preset personas for each cohort (helper, challenger, explainer) and an overlay that keeps students oriented.
4. **Accessibility and focus workflows** where quick keyboard cycling between distraction-free and information-dense layouts helps users stay in flow.
5. **Voice-first prototypers** crafting multivoice experiences who need to validate both the audio selection (`Mic:`, `defaultVoice`) and the accompanying visual state without touching the DOM by hand.

### Features Implemented (Phase 1)

- Persona-driven theming with preset palettes.
- Content script overlay for quick persona switching and sidebar toggles.
- Popup for one-click persona switches and overlay toggle.
- Background service worker coordinating state, keyboard shortcuts, and tab broadcasts.
- Options dashboard to inspect personas/themes and restore defaults.

### Getting Started

Install dependencies and start the watcher:

```bash
npm install
npm run dev
```

The dev server writes fresh bundles into `dist/`.

#### Load the unpacked extension

1. Open Chrome and visit `chrome://extensions`.
2. Toggle on **Developer mode** (top right).
3. Click **Load unpacked** and select the `dist/` directory.
4. (Optional) Pin *ChatGPT UI Personalizer* to the toolbar for quick persona switching.

#### Available scripts

- `npm run dev` – Vite watch build for the extension.
- `npm run build` – Production bundle.
- `npm run lint` – ESLint over `src` and `scripts`.
- `npm run test` – Vitest suites (extend as voice features evolve).
- `npm run pack` – Zip the built extension into `releases/`.

### Testing Voice Mode

Follow these steps to exercise the voice-first flow the extension is designed around:

1. **Confirm ChatGPT voice access**  
   Make sure your ChatGPT account has voice conversations enabled (Open the site menu -> *Voice mode*; if you don't see it, request access in ChatGPT's settings or beta programs).
2. **Launch the extension alongside ChatGPT**  
   With `npm run dev` running and the unpacked extension loaded, open `https://chatgpt.com/` (or `https://chat.openai.com/` if still on the legacy domain). Wait for the overlay badge in the top-right corner; this guarantees the content script is active.
3. **Choose or adjust a voice persona**  
   Click the toolbar icon -> pick a persona that lists a `Mic:` tag. In the Options page you can duplicate personas and change the `defaultVoice` (e.g., alloy, verse) to match the voice you want ChatGPT to use.
4. **Grant microphone permissions**  
   In ChatGPT, click the microphone / headset button. Chrome will prompt you the first time; allow microphone access so ChatGPT can capture audio.
5. **Start a live voice chat**  
   Hit “Start voice conversation” (desktop) or the large mic button (voice UI). Speak a prompt. The extension keeps the persona badge and theme synced so you can tell which configuration is applied while you talk.
6. **Validate overlay controls**  
   Use `Alt+N` / `Alt+Shift+N` to cycle personas mid-conversation, or open the overlay (`Toggle overlay` from the popup) to confirm the theme and layout updates without breaking the ChatGPT voice UI.
7. **Optional debugging**  
   Open DevTools -> Console to ensure no `codex` errors appear; if voice mode fails to launch, reload the tab and check the extension popup to confirm the active persona.

### Roadmap

Phase 1 scaffolds the core overlay and persona switching. Phase 2 will ship the live theme editor, advanced voice controls, and import/export pipeline defined in `plan.md`.
