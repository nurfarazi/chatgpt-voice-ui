import React, { useEffect, useMemo, useState } from 'react';
import { createDefaultState, getState, setState } from '../../libs/storage';
import type { Persona, StorageSchema, ThemePalette } from '../../types/storage';
import type { RuntimeResponse } from '../../types/messages';

const App: React.FC = () => {
  const [state, setExtensionState] = useState<StorageSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const loadState = async () => {
    setLoading(true);
    try {
      const response = (await chrome.runtime.sendMessage({ type: 'GET_STATE' })) as RuntimeResponse;
      if (response.ok && response.state) {
        setExtensionState(response.state);
      } else {
        setExtensionState(await getState());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadState();
  }, []);

  const personas = useMemo<Persona[]>(() => {
    if (!state) {
      return [];
    }
    return Object.values(state.personas);
  }, [state]);

  const themes = useMemo<ThemePalette[]>(() => {
    if (!state) {
      return [];
    }
    return Object.values(state.themes);
  }, [state]);

  const handleReset = async () => {
    setStatus('Resetting to defaults...');
    setLoading(true);
    try {
      const defaults = createDefaultState();
      await setState(defaults);
      await chrome.runtime.sendMessage({ type: 'RELOAD_THEMES' });
      setExtensionState(defaults);
      setStatus('Defaults restored');
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(null), 1500);
    }
  };

  const handleRefresh = async () => {
    setStatus('Refreshing state...');
    await loadState();
    setTimeout(() => setStatus(null), 1500);
  };

  return (
    <div className="options">
      <header className="options__header">
        <h1>ChatGPT Workspace Personas</h1>
        <p>
          Craft distinct layouts and voice-ready themes for every workflow. Phase 1 delivers quick persona switching,
          resilient theming, and sidebar controls.
        </p>
      </header>
      <section className="options__section">
        <h2>Personas</h2>
        {loading && <p>Loading personas...</p>}
        {!loading && (
          <div className="options__grid">
            {personas.map((persona) => (
              <article key={persona.id} className="options__card">
                <h3>{persona.name}</h3>
                <div className="options__pill">Theme - {persona.themeId}</div>
                {persona.promptPrefix && <p>{persona.promptPrefix}</p>}
                {persona.defaultVoice && <p>Preferred voice: {persona.defaultVoice}</p>}
                {persona.shortcut && <p>Shortcut: {persona.shortcut}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="options__section">
        <h2>Theme presets</h2>
        <div className="options__grid">
          {themes.map((theme) => (
            <article key={theme.id} className="options__card">
              <h3>{theme.name}</h3>
              <div className="options__pill">Background</div>
              <p>{theme.background.value}</p>
              <div className="options__pill">Accent</div>
              <p>{theme.surfaces.accent}</p>
            </article>
          ))}
        </div>
        <p>
          Advanced theme editing is coming in Phase 2. Today you can toggle personas via the popup and adjust layout
          live using the overlay.
        </p>
      </section>
      <section className="options__section">
        <h2>Actions</h2>
        <div className="options__actions">
          <button className="options__button" onClick={handleRefresh}>
            Refresh state
          </button>
          <button className="options__button" onClick={handleReset}>
            Restore defaults
          </button>
        </div>
        {status && <p>{status}</p>}
      </section>
    </div>
  );
};

export default App;
