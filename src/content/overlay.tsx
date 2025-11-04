import React, { useEffect, useMemo, useState } from 'react';
import type { Persona } from '../types/storage';

type VoiceMode = 'idle' | 'listening' | 'responding';

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
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('idle');
  const [levels, setLevels] = useState<number[]>(() => Array.from({ length: 7 }, (_, index) => 0.2 + index * 0.03));

  const activePersona = useMemo(
    () => personas.find((persona) => persona.id === activePersonaId) ?? null,
    [activePersonaId, personas],
  );

  useEffect(() => {
    if (voiceMode !== 'listening') {
      setLevels((previous) =>
        previous.map((_, index) => (voiceMode === 'responding' ? 0.7 - index * 0.07 : 0.18 + index * 0.02)),
      );
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const animate = () => {
      setLevels((prev) => prev.map(() => 0.25 + Math.random() * 0.75));
      timeoutId = setTimeout(animate, 140 + Math.random() * 140);
    };

    animate();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [voiceMode]);

  useEffect(() => {
    if (voiceMode !== 'responding') {
      return;
    }

    const timeoutId = setTimeout(() => {
      setVoiceMode('idle');
    }, 3400);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [voiceMode]);

  const voiceStatusText = useMemo(() => {
    const personaName = activePersona?.name ?? 'your muse';
    switch (voiceMode) {
      case 'listening':
        return `Listening as ${personaName}`;
      case 'responding':
        return `${personaName} is composing a reply`;
      default:
        return `Ready to riff with ${personaName}`;
    }
  }, [activePersona, voiceMode]);

  const voiceHintText = useMemo(() => {
    switch (voiceMode) {
      case 'listening':
        return 'Speak freely—the visualizer pulses with your cadence.';
      case 'responding':
        return 'Synthesizing verses from the last prompt.';
      default:
        return 'Tap the orb or press begin to awaken the bard.';
    }
  }, [voiceMode]);

  const cycleVoiceMode = () => {
    setVoiceMode((current) => {
      if (current === 'idle') {
        return 'listening';
      }
      if (current === 'listening') {
        return 'responding';
      }
      return 'idle';
    });
  };

  const resetVoiceMode = () => {
    setVoiceMode('idle');
  };

  const voiceCardClass = `codex-overlay__voice-card codex-overlay__voice-card--${voiceMode}`;

  return (
    <div className="codex-overlay" role="dialog" aria-label="ChatGPT UI personalization controls">
      <header className="codex-overlay__header">
        <span className="codex-overlay__title">Personas</span>
        <button className="codex-overlay__close" onClick={onClose} aria-label="Close personalization overlay">
          x
        </button>
      </header>
      <div className="codex-overlay__body">
        <section className={voiceCardClass} aria-live="polite">
          <div className="codex-overlay__voice-display">
            <button
              className="codex-overlay__voice-orb"
              onClick={cycleVoiceMode}
              aria-pressed={voiceMode !== 'idle'}
              aria-label="Toggle voice capture"
              type="button"
            >
              <span className="codex-overlay__voice-orb-glow" aria-hidden="true" />
              <span className="codex-overlay__voice-orb-core" aria-hidden="true" />
            </button>
            <div className="codex-overlay__voice-bars" aria-hidden="true">
              {levels.map((level, index) => (
                <span
                  key={`voice-bar-${index}`}
                  className="codex-overlay__voice-bar"
                  style={{ '--voice-level': level } as React.CSSProperties}
                />
              ))}
            </div>
            <span className="codex-overlay__voice-ring" aria-hidden="true" />
          </div>
          <div className="codex-overlay__voice-info">
            <span className="codex-overlay__voice-title">Interactive Bard</span>
            <span className="codex-overlay__voice-status">{voiceStatusText}</span>
            <span className="codex-overlay__voice-hint">{voiceHintText}</span>
          </div>
          <div className="codex-overlay__voice-actions">
            <button className="codex-overlay__voice-button" type="button" onClick={cycleVoiceMode}>
              {voiceMode === 'listening'
                ? 'Pause listening'
                : voiceMode === 'responding'
                  ? 'Interrupt reply'
                  : 'Begin listening'}
            </button>
            <button
              className="codex-overlay__voice-button codex-overlay__voice-button--ghost"
              type="button"
              onClick={resetVoiceMode}
              disabled={voiceMode === 'idle'}
            >
              Reset
            </button>
          </div>
        </section>
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
