import { createDefaultState, getState, setState, updateState } from '../libs/storage';
import { getPersonaCycle } from '../libs/personas';
import type { RuntimeMessage } from '../types/messages';

const ensureStateInitialized = async () => {
  const state = await getState();
  if (!state) {
    await setState(createDefaultState());
  }
};

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    await setState(createDefaultState());
  } else {
    await ensureStateInitialized();
  }
});

const broadcastToTabs = async (message: RuntimeMessage) => {
  const tabs = await chrome.tabs.query({
    url: ['https://chat.openai.com/*', 'https://chatgpt.com/*'],
  });

  await Promise.all(
    tabs.map(async (tab) => {
      if (!tab.id) {
        return;
      }
      try {
        await chrome.tabs.sendMessage(tab.id, message);
      } catch (error) {
        console.warn('Failed to send message to tab', tab.id, error);
      }
    }),
  );
};

const setActivePersona = async (personaId: string) => {
  const state = await getState();
  if (!state.personas[personaId]) {
    throw new Error('persona_not_found');
  }

  const next = await updateState((draft) => {
    draft.activePersonaId = personaId;
    draft.history = [
      ...draft.history,
      {
        timestamp: Date.now(),
        personaId,
      },
    ].slice(-50);
  });

  await broadcastToTabs({ type: 'RELOAD_THEMES' });

  return next;
};

chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse) => {
  const respond = (state?: Awaited<ReturnType<typeof getState>>) => {
    sendResponse({ ok: true, state });
  };

  const respondError = (error: string) => {
    sendResponse({ ok: false, error });
  };

  (async () => {
    switch (message.type) {
      case 'GET_STATE': {
        const state = await getState();
        respond(state);
        break;
      }
      case 'SET_ACTIVE_PERSONA': {
        try {
          const state = await setActivePersona(message.personaId);
          respond(state);
        } catch (error) {
          const reason = error instanceof Error ? error.message : 'unknown_error';
          respondError(reason);
        }
        break;
      }
      case 'TOGGLE_OVERLAY':
      case 'RELOAD_THEMES': {
        await broadcastToTabs(message);
        respond();
        break;
      }
      case 'PING': {
        respond();
        break;
      }
      default: {
        respondError('unknown_message');
      }
    }
  })();

  return true;
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'persona-next' && command !== 'persona-previous') {
    if (command === 'toggle-layout-overlay') {
      await broadcastToTabs({ type: 'TOGGLE_OVERLAY' });
    }
    return;
  }

  const state = await getState();
  const personas = getPersonaCycle(state.personas);
  if (personas.length === 0) {
    return;
  }

  const activeIndex = personas.findIndex((persona) => persona.id === state.activePersonaId);
  const delta = command === 'persona-next' ? 1 : -1;
  const nextIndex = activeIndex === -1 ? 0 : (activeIndex + delta + personas.length) % personas.length;
  const nextPersona = personas[nextIndex];
  if (!nextPersona) {
    return;
  }

  await setActivePersona(nextPersona.id);
});
