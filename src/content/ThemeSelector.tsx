import React, { useEffect, useState } from 'react';
import { getState } from '../libs/storage';
import { applyThemeToDocument, resolveTheme } from '../libs/themes';
import type { ThemePalette } from '../types/storage';

// Helper to persist selected theme id
const setSelectedThemeId = (themeId: string | null) => {
  if (themeId) {
    void chrome.storage.sync.set({ selectedThemeId: themeId });
  } else {
    void chrome.storage.sync.remove('selectedThemeId');
  }
};

export const ThemeSelector: React.FC = () => {
  const [themes, setThemes] = useState<Record<string, ThemePalette>>({});
  const [selectedId, setSelectedId] = useState<string>('');

  // Load themes and any persisted selection
  useEffect(() => {
    const load = async () => {
      const state = await getState();
      setThemes(state.themes);
      const stored = await new Promise<{ selectedThemeId?: string }>((resolve) => {
        chrome.storage.sync.get(['selectedThemeId'], resolve);
      });
      if (stored.selectedThemeId) {
        setSelectedId(stored.selectedThemeId);
        const theme = resolveTheme(state.themes, stored.selectedThemeId);
        if (theme) {
          applyThemeToDocument(document, theme, document.documentElement);
          document.documentElement.dataset.codexTheme = theme.id;
        }
      }
    };
    void load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeId = e.target.value;
    setSelectedId(themeId);
    const theme = resolveTheme(themes, themeId);
    if (theme) {
      applyThemeToDocument(document, theme, document.documentElement);
      document.documentElement.dataset.codexTheme = theme.id;
      setSelectedThemeId(themeId);
    }
  };

  const reset = () => {
    setSelectedId('');
    setSelectedThemeId(null);
    // Reload to apply persona's default theme
    window.location.reload();
  };

  return (
    <div className="codex-overlay__theme-selector" style={{ marginBottom: '12px' }}>
      <select value={selectedId} onChange={handleChange} style={{ padding: '6px', borderRadius: '6px' }}>
        <option value="" disabled>
          Select theme…
        </option>
        {Object.entries(themes).map(([id, theme]) => (
          <option key={id} value={id}>
            {theme.name ?? id}
          </option>
        ))}
      </select>
      <button onClick={reset} style={{ marginLeft: '8px', padding: '6px 10px' }}>
        Reset to default
      </button>
    </div>
  );
};
