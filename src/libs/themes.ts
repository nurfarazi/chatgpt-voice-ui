import type { ThemePalette, ThemeSpacing, ThemeTypography } from '../types/storage';

export const THEME_VARIABLE_PREFIX = '--codex';

const now = () => Date.now();

const typography = (partial: Partial<ThemeTypography>): ThemeTypography => ({
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: '15px',
  lineHeight: '1.6',
  letterSpacing: '0.01em',
  ...partial,
});

const spacing = (partial: Partial<ThemeSpacing>): ThemeSpacing => ({
  borderRadius: '12px',
  gutter: '16px',
  inputHeight: '54px',
  sidebarWidth: '280px',
  ...partial,
});

export const themePresets: ThemePalette[] = [
  {
    id: 'focus-minimal',
    name: 'Focus Minimal',
    surfaces: {
      background: '#0f172a',
      foreground: '#f8fafc',
      accent: '#38bdf8',
      muted: '#1e293b',
      success: '#34d399',
      warning: '#facc15',
      danger: '#f87171',
    },
    typography: typography({
      fontSize: '16px',
      letterSpacing: '0.02em',
    }),
    spacing: spacing({
      gutter: '20px',
      sidebarWidth: '240px',
    }),
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(30,64,175,1) 100%)',
      blur: 0,
      opacity: 1,
    },
    voice: {
      visualizerStyle: 'bars',
      micPosition: 'bottom-right',
    },
    metadata: {
      createdAt: now(),
      updatedAt: now(),
      preset: true,
    },
  },
  {
    id: 'creator-neon',
    name: 'Creator Neon',
    surfaces: {
      background: '#050505',
      foreground: '#fdfdfd',
      accent: '#f472b6',
      muted: '#111827',
      success: '#22d3ee',
      warning: '#fbbf24',
      danger: '#fb7185',
    },
    typography: typography({
      fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif",
      fontSize: '15px',
    }),
    spacing: spacing({
      borderRadius: '24px',
      gutter: '18px',
    }),
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(76,29,149,0.85) 100%)',
      blur: 8,
      opacity: 0.95,
    },
    voice: {
      visualizerStyle: 'wave',
      micPosition: 'bottom-right',
    },
    metadata: {
      createdAt: now(),
      updatedAt: now(),
      preset: true,
    },
  },
  {
    id: 'accessibility-high-contrast',
    name: 'Accessibility High Contrast',
    surfaces: {
      background: '#ffffff',
      foreground: '#0f172a',
      accent: '#1d4ed8',
      muted: '#e2e8f0',
      success: '#15803d',
      warning: '#b45309',
      danger: '#b91c1c',
    },
    typography: typography({
      fontFamily: "'Atkinson Hyperlegible', 'Segoe UI', sans-serif",
      fontSize: '17px',
      lineHeight: '1.8',
    }),
    spacing: spacing({
      inputHeight: '60px',
      gutter: '22px',
    }),
    background: {
      type: 'color',
      value: '#ffffff',
      blur: 0,
      opacity: 1,
    },
    voice: {
      visualizerStyle: 'ring',
      micPosition: 'bottom-right',
    },
    metadata: {
      createdAt: now(),
      updatedAt: now(),
      preset: true,
    },
  },
];

export const defaultThemeId = themePresets[0]?.id ?? 'focus-minimal';

export const createThemeVariableMap = (theme: ThemePalette): Record<string, string> => ({
  [`${THEME_VARIABLE_PREFIX}-bg`]: theme.surfaces.background,
  [`${THEME_VARIABLE_PREFIX}-fg`]: theme.surfaces.foreground,
  [`${THEME_VARIABLE_PREFIX}-accent`]: theme.surfaces.accent,
  [`${THEME_VARIABLE_PREFIX}-muted`]: theme.surfaces.muted,
  [`${THEME_VARIABLE_PREFIX}-success`]: theme.surfaces.success ?? theme.surfaces.accent,
  [`${THEME_VARIABLE_PREFIX}-warning`]: theme.surfaces.warning ?? theme.surfaces.accent,
  [`${THEME_VARIABLE_PREFIX}-danger`]: theme.surfaces.danger ?? theme.surfaces.accent,
  [`${THEME_VARIABLE_PREFIX}-font-family`]: theme.typography.fontFamily,
  [`${THEME_VARIABLE_PREFIX}-font-size`]: theme.typography.fontSize,
  [`${THEME_VARIABLE_PREFIX}-line-height`]: theme.typography.lineHeight,
  [`${THEME_VARIABLE_PREFIX}-letter-spacing`]: theme.typography.letterSpacing,
  [`${THEME_VARIABLE_PREFIX}-border-radius`]: theme.spacing.borderRadius,
  [`${THEME_VARIABLE_PREFIX}-gutter`]: theme.spacing.gutter,
  [`${THEME_VARIABLE_PREFIX}-input-height`]: theme.spacing.inputHeight,
  [`${THEME_VARIABLE_PREFIX}-sidebar-width`]: theme.spacing.sidebarWidth,
  [`${THEME_VARIABLE_PREFIX}-background-type`]: theme.background.type,
  [`${THEME_VARIABLE_PREFIX}-background-value`]: theme.background.value,
  [`${THEME_VARIABLE_PREFIX}-background-blur`]: `${theme.background.blur ?? 0}px`,
  [`${THEME_VARIABLE_PREFIX}-background-opacity`]: `${theme.background.opacity ?? 1}`,
});

export const applyThemeToDocument = (
  doc: Document | ShadowRoot,
  theme: ThemePalette,
  target: HTMLElement = doc instanceof Document ? doc.documentElement : (doc as ShadowRoot).host as HTMLElement,
) => {
  const variables = createThemeVariableMap(theme);
  Object.entries(variables).forEach(([key, value]) => {
    target.style.setProperty(key, value);
  });
};

export const resolveTheme = (themes: Record<string, ThemePalette>, themeId?: string): ThemePalette | null => {
  if (!themeId) {
    return null;
  }
  return themes[themeId] ?? null;
};
