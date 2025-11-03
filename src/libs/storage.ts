import { defaultPersonaId, personaPresets } from './personas';
import { themePresets } from './themes';
import type { Persona, StorageSchema, ThemePalette } from '../types/storage';

export const STORAGE_KEY = 'codexState';
export const STORAGE_VERSION = 1;

const clone = <T>(value: T): T => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const buildDefaultThemes = () =>
  themePresets.reduce<Record<string, ThemePalette>>((acc, theme) => {
    acc[theme.id] = clone(theme);
    return acc;
  }, {});

const buildDefaultPersonas = () =>
  personaPresets.reduce<Record<string, Persona>>((acc, persona) => {
    acc[persona.id] = clone(persona);
    return acc;
  }, {});

export const createDefaultState = (): StorageSchema => ({
  version: STORAGE_VERSION,
  activePersonaId: defaultPersonaId ?? null,
  themes: buildDefaultThemes(),
  personas: buildDefaultPersonas(),
  history: [],
  flags: {
    onboardingComplete: false,
    experimentalFeatures: [],
  },
});

const ensureChromeStorage = () => {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return null;
  }
  return chrome.storage.sync ?? chrome.storage.local ?? null;
};

const resolveStorageArea = () => {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return null;
  }
  return chrome.storage.sync ?? chrome.storage.local;
};

const resolveStorageAreaName = (): 'sync' | 'local' => {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return 'local';
  }
  return chrome.storage.sync ? 'sync' : 'local';
};

const fallbackState = createDefaultState();

const migrateState = (state: StorageSchema | null | undefined): StorageSchema => {
  if (!state) {
    return clone(fallbackState);
  }

  let current = { ...clone(fallbackState), ...state };

  if (!current.themes || Object.keys(current.themes).length === 0) {
    current.themes = buildDefaultThemes();
  }

  if (!current.personas || Object.keys(current.personas).length === 0) {
    current.personas = buildDefaultPersonas();
  }

  if (!current.activePersonaId || !current.personas[current.activePersonaId]) {
    current.activePersonaId = defaultPersonaId ?? null;
  }

  if (current.version !== STORAGE_VERSION) {
    current = {
      ...current,
      version: STORAGE_VERSION,
    };
  }

  current.history = current.history?.slice?.(-50) ?? [];

  return current;
};

export const getState = async (): Promise<StorageSchema> => {
  const storage = resolveStorageArea();
  if (!storage) {
    return clone(fallbackState);
  }

  try {
    const result = await storage.get(STORAGE_KEY);
    const rawState = (result?.[STORAGE_KEY] as StorageSchema | undefined) ?? null;
    return migrateState(rawState);
  } catch (error) {
    console.warn('Failed to read personalization state, falling back to defaults', error);
    return clone(fallbackState);
  }
};

export const setState = async (state: StorageSchema): Promise<void> => {
  const storage = resolveStorageArea();
  if (!storage) {
    return;
  }
  await storage.set({ [STORAGE_KEY]: state });
};

export const updateState = async (
  mutate: (state: StorageSchema) => StorageSchema | void,
): Promise<StorageSchema> => {
  const current = await getState();
  const result = mutate(current);
  const next = result ? migrateState(result) : migrateState(current);
  await setState(next);
  return next;
};

export const pushHistoryEntry = async (personaId: string) => {
  await updateState((state) => {
    state.history = [
      ...state.history,
      {
        timestamp: Date.now(),
        personaId,
      },
    ].slice(-50);
  });
};

export type StorageChangeListener = (state: StorageSchema) => void;

export const watchState = (listener: StorageChangeListener) => {
  const storage = ensureChromeStorage();
  if (!storage || !chrome.storage.onChanged) {
    return () => {};
  }

  const areaName = resolveStorageAreaName();

  const handler: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (changes, area) => {
    if (area !== areaName) {
      return;
    }

    const change = changes[STORAGE_KEY];
    if (!change) {
      return;
    }

    const value = change.newValue ?? change.oldValue;
    if (!value) {
      return;
    }

    listener(migrateState(value as StorageSchema));
  };

  chrome.storage.onChanged.addListener(handler);

  return () => {
    chrome.storage.onChanged.removeListener(handler);
  };
};

export const getActivePersona = async () => {
  const state = await getState();
  if (!state.activePersonaId) {
    return null;
  }
  return state.personas[state.activePersonaId] ?? null;
};
