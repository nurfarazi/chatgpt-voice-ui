import type { StorageSchema } from './storage';

export type RuntimeMessage =
  | { type: 'GET_STATE' }
  | { type: 'SET_ACTIVE_PERSONA'; personaId: string }
  | { type: 'TOGGLE_OVERLAY'; visible?: boolean }
  | { type: 'PING' }
  | { type: 'RELOAD_THEMES' };

export type RuntimeResponse =
  | { ok: true; state?: StorageSchema }
  | { ok: false; error: string };
