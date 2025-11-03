import { describe, expect, it } from 'vitest';
import { createDefaultState } from './storage';
import { personaPresets } from './personas';
import { themePresets } from './themes';

describe('storage defaults', () => {
  it('includes preset personas and themes', () => {
    const state = createDefaultState();
    personaPresets.forEach((persona) => {
      expect(state.personas[persona.id]).toBeDefined();
    });
    themePresets.forEach((theme) => {
      expect(state.themes[theme.id]).toBeDefined();
    });
  });

  it('sets a default active persona', () => {
    const state = createDefaultState();
    expect(state.activePersonaId).toBeTruthy();
    expect(state.personas[state.activePersonaId ?? '']).toBeDefined();
  });
});
