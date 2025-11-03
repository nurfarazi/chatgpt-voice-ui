import '@testing-library/jest-dom';

const noop = () => undefined;

if (typeof globalThis.chrome === 'undefined') {
  globalThis.chrome = {
    storage: {
      sync: {
        get: async () => ({}),
        set: async () => {},
      },
      local: {
        get: async () => ({}),
        set: async () => {},
      },
      onChanged: {
        addListener: noop,
        removeListener: noop,
      },
    },
    runtime: {
      sendMessage: async () => ({ ok: true }),
      openOptionsPage: noop,
      onInstalled: { addListener: noop },
    },
    tabs: {
      query: async () => [],
      sendMessage: async () => {},
    },
    commands: {
      onCommand: {
        addListener: noop,
      },
    },
  } as unknown as typeof chrome;
}
