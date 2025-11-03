import type { Persona } from '../types/storage';
import { defaultThemeId, themePresets } from './themes';

const fallbackThemeId = defaultThemeId || themePresets[0]?.id || 'focus-minimal';

export const personaPresets: Persona[] = [
  {
    id: 'productive-pro',
    name: 'Productive Pro',
    themeId: fallbackThemeId,
    promptPrefix: 'You are a concise and pragmatic assistant focused on productivity.',
    shortcut: 'Alt+Shift+1',
  },
  {
    id: 'creator',
    name: 'Creator',
    themeId: 'creator-neon',
    promptPrefix:
      'Respond with a playful, visually imaginative tone and include ideas for multimedia presentation when relevant.',
    defaultVoice: 'alloy',
    shortcut: 'Alt+Shift+2',
  },
  {
    id: 'accessibility-ally',
    name: 'Accessibility Ally',
    themeId: 'accessibility-high-contrast',
    promptPrefix:
      'Favor plain language explanations, list formatting, and highlight accessibility callouts when applicable.',
    defaultVoice: 'verse',
    shortcut: 'Alt+Shift+3',
  },
];

export const defaultPersonaId = personaPresets[0]?.id ?? 'productive-pro';

export const getPersonaCycle = (personas: Record<string, Persona>): Persona[] => {
  const ids = Object.keys(personas);
  return ids.map((id) => personas[id]).filter(Boolean);
};
