import React from 'react';
import type { Persona } from '../types/storage';

type OverlayProps = {
  personas: Persona[];
  activePersonaId: string | null;
  sidebarCollapsed: boolean;
  onPersonaSelect: (personaId: string) => void;
  onSidebarToggle: () => void;
  onClose: () => void;
};

const OverlayApp: React.FC<OverlayProps> = ({
  personas,
  activePersonaId,
  sidebarCollapsed,
  onPersonaSelect,
  onSidebarToggle,
  onClose,
}) => {
  return (
    <div className="codex-overlay" role="dialog" aria-label="ChatGPT UI personalization controls">
      <header className="codex-overlay__header">
        <span className="codex-overlay__title">Personas</span>
        <button className="codex-overlay__close" onClick={onClose} aria-label="Close personalization overlay">
          ×
        </button>
      </header>
      <div className="codex-overlay__body">
        <div className="codex-overlay__personas">
          {personas.map((persona) => {
            const active = persona.id === activePersonaId;
            return (
              <button
                key={persona.id}
                className={`codex-overlay__persona ${active ? 'codex-overlay__persona--active' : ''}`}
                onClick={() => onPersonaSelect(persona.id)}
                aria-pressed={active}
              >
                <span className="codex-overlay__persona-name">{persona.name}</span>
                {persona.promptPrefix && <span className="codex-overlay__persona-meta">Prompt tone</span>}
              </button>
            );
          })}
        </div>
        <div className="codex-overlay__actions">
          <button className="codex-overlay__action" onClick={onSidebarToggle}>
            {sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverlayApp;
