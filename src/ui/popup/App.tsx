import React, { useEffect, useMemo, useState } from 'react';
import type { Persona, StorageSchema } from '../../types/storage';
import type { RuntimeResponse } from '../../types/messages';

const fetchState = async (): Promise<StorageSchema | null> => {
  try {
    const response = (await chrome.runtime.sendMessage({ type: 'GET_STATE' })) as RuntimeResponse;
    if (!response?.ok) {
      return null;
    }
    return response.state ?? null;
  } catch (error) {
    console.warn('Failed to load state in popup', error);
    return null;
  }
};

const App: React.FC = () => {
  const [state, setState] = useState<StorageSchema | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setState(await fetchState());
      setLoading(false);
    })();
  }, []);

  const personas = useMemo((): Persona[] => {
    if (!state) {
      return [];
    }
    return Object.values(state.personas);
  }, [state]);

  const handlePersonaSelect = async (personaId: string) => {
    setLoading(true);
    try {
      const response = (await chrome.runtime.sendMessage({
        type: 'SET_ACTIVE_PERSONA',
        personaId,
      })) as RuntimeResponse;

      if (response.ok) {
        setState(response.state ?? (await fetchState()));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  const activePersonaId = state?.activePersonaId ?? null;

  return (
    <div className="popup">
      <header className="popup__header">
        <div>
          <h1 className="popup__title">Personas</h1>
          <span className="popup__subtitle">Switch in two clicks</span>
        </div>
        <button className="popup__options" onClick={handleOpenOptions}>
          Options
        </button>
      </header>
      <section className="popup__content">
        {loading && <p className="popup__status">Updating personas...</p>}
        {!loading && personas.length === 0 && <p className="popup__status">Add a persona from the options page.</p>}
        <div className="popup__personas">
          {personas.map((persona) => {
            const active = persona.id === activePersonaId;
            return (
              <button
                key={persona.id}
                className={`popup__persona ${active ? 'popup__persona--active' : ''}`}
                onClick={() => handlePersonaSelect(persona.id)}
              >
                <span className="popup__persona-name">{persona.name}</span>
                {persona.defaultVoice && (
                  <span className="popup__persona-tag" aria-label="Preferred voice">
                    Mic: {persona.defaultVoice}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
      <footer className="popup__footer">
        <button
          className="popup__footer-button"
          onClick={() => chrome.runtime.sendMessage({ type: 'TOGGLE_OVERLAY' })}
        >
          Toggle overlay
        </button>
        <small className="popup__hint">Use Alt+N / Alt+Shift+N to cycle personas</small>
      </footer>
    </div>
  );
};

export default App;
