import type { RuntimeMessage, RuntimeResponse } from '../types/messages';

export const sendRuntimeMessage = async (message: RuntimeMessage): Promise<RuntimeResponse> => {
  if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
    return { ok: false, error: 'runtime_unavailable' };
  }

  try {
    const response = (await chrome.runtime.sendMessage(message)) as RuntimeResponse | undefined;
    if (!response) {
      return { ok: true };
    }
    return response;
  } catch (error) {
    console.warn('Failed to send runtime message', message, error);
    return { ok: false, error: 'message_failed' };
  }
};
