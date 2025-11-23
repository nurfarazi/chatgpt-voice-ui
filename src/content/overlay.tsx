import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ThemeSelector } from './ThemeSelector';
import type { Persona, ThemePalette } from '../types/storage';
import { AudioAnalyzer } from '../libs/voice';

type VoiceMode = 'idle' | 'listening' | 'responding';

type OverlayProps = {
  personas: Persona[];
  activePersonaId: string | null;
  activeTheme: ThemePalette | null;
  sidebarCollapsed: boolean;
  onPersonaSelect: (personaId: string) => void;
  onSidebarToggle: () => void;
  onClose: () => void;
};

const OverlayApp: React.FC<OverlayProps> = ({
  personas,
  activePersonaId,
  activeTheme,
  sidebarCollapsed,
  onPersonaSelect,
  onSidebarToggle,
  onClose,
}) => {
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('idle');
  const [levels, setLevels] = useState<number[]>(() => Array(7).fill(0.1));
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const activePersona = useMemo(
    () => personas.find((persona) => persona.id === activePersonaId) ?? null,
    [activePersonaId, personas],
  );

  const visualizerStyle = activeTheme?.voice.visualizerStyle ?? 'bars';

  useEffect(() => {
    return () => {
      if (analyzerRef.current) {
        analyzerRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (voiceMode === 'listening') {
      const startListening = async () => {
        if (!analyzerRef.current) {
          analyzerRef.current = new AudioAnalyzer();
        }
        try {
          await analyzerRef.current.start();
          
          const animate = () => {
            if (analyzerRef.current) {
              const newLevels = analyzerRef.current.getLevels(visualizerStyle === 'wave' ? 32 : 7);
              setLevels(newLevels);
            }
            animationFrameRef.current = requestAnimationFrame(animate);
          };
          animate();
        } catch (error) {
          console.error('Failed to start audio analyzer', error);
          setVoiceMode('idle');
        }
      };
      void startListening();
    } else {
      if (analyzerRef.current) {
        analyzerRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Reset levels
      setLevels(Array(visualizerStyle === 'wave' ? 32 : 7).fill(0.1));
    }
  }, [voiceMode, visualizerStyle]);

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
      if (current === 'idle') return 'listening';
      if (current === 'listening') return 'idle'; // Simplified for visualizer demo
      return 'idle';
    });
  };

  const resetVoiceMode = () => {
    setVoiceMode('idle');
  };

  const voiceCardClass = `codex-overlay__voice-card codex-overlay__voice-card--${voiceMode}`;

  const renderVisualizer = () => {
    if (visualizerStyle === 'ring') {
      // Calculate average level for ring scale
      const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
      const scale = 1 + avg * 1.5; // Scale between 1 and 2.5
      
      return (
        <div className="codex-overlay__voice-ring-container">
           <div 
             className="codex-overlay__voice-ring-pulse"
             style={{ transform: `scale(${scale})`, opacity: 0.5 + avg * 0.5 }}
           />
           <div className="codex-overlay__voice-orb-core" />
        </div>
      );
    }

    if (visualizerStyle === 'wave') {
       return (
         <div className="codex-overlay__voice-wave">
           {levels.map((level, i) => (
             <div 
               key={i} 
               className="codex-overlay__voice-wave-bar"
               style={{ 
                 height: `${level * 100}%`,
                 opacity: 0.3 + level * 0.7 
               }} 
             />
           ))}
         </div>
       );
    }

    // Default 'bars'
    return (
      <div className="codex-overlay__voice-bars" aria-hidden="true">
        {levels.map((level, index) => (
          <span
            key={`voice-bar-${index}`}
            className="codex-overlay__voice-bar"
            style={{ '--voice-level': level } as React.CSSProperties}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="codex-overlay" role="dialog" aria-label="ChatGPT UI personalization controls">
        <header className="codex-overlay__header">
          <span className="codex-overlay__title">Personas</span>
          <button className="codex-overlay__close" onClick={onClose} aria-label="Close personalization overlay">
            x
          </button>
        </header>
        {/* Theme selector */}
        <ThemeSelector />
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
              {visualizerStyle !== 'ring' && (
                <>
                  <span className="codex-overlay__voice-orb-glow" aria-hidden="true" />
                  <span className="codex-overlay__voice-orb-core" aria-hidden="true" />
                </>
              )}
            </button>
            
            {renderVisualizer()}

          </div>
          <div className="codex-overlay__voice-info">
            <span className="codex-overlay__voice-title">Interactive Bard</span>
            <span className="codex-overlay__voice-status">{voiceStatusText}</span>
            <span className="codex-overlay__voice-hint">{voiceHintText}</span>
          </div>
          <div className="codex-overlay__voice-actions">
            <button className="codex-overlay__voice-button" type="button" onClick={cycleVoiceMode}>
              {voiceMode === 'listening' ? 'Pause listening' : 'Begin listening'}
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
