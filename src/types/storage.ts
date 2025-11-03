export type ThemeSurface = {
  background: string;
  foreground: string;
  accent: string;
  muted: string;
  success?: string;
  warning?: string;
  danger?: string;
};

export type ThemeTypography = {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
};

export type ThemeSpacing = {
  borderRadius: string;
  gutter: string;
  inputHeight: string;
  sidebarWidth: string;
};

export type ThemeBackground = {
  type: 'color' | 'gradient' | 'image';
  value: string;
  blur?: number;
  opacity?: number;
};

export type ThemePalette = {
  id: string;
  name: string;
  surfaces: ThemeSurface;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  background: ThemeBackground;
  metadata?: {
    createdAt: number;
    updatedAt: number;
    preset?: boolean;
  };
};

export type Persona = {
  id: string;
  name: string;
  themeId: string;
  promptPrefix?: string;
  defaultVoice?: string;
  shortcut?: string;
};

export type StorageHistoryEntry = {
  timestamp: number;
  personaId: string;
};

export type StorageFlags = {
  onboardingComplete: boolean;
  experimentalFeatures: string[];
};

export type StorageSchema = {
  version: number;
  activePersonaId: string | null;
  themes: Record<string, ThemePalette>;
  personas: Record<string, Persona>;
  history: StorageHistoryEntry[];
  flags: StorageFlags;
};

export type StoragePayload = {
  state: StorageSchema;
};
