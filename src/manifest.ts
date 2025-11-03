import { defineManifest } from '@crxjs/vite-plugin';

const manifest = defineManifest({
  manifest_version: 3,
  name: 'ChatGPT UI Personalizer',
  description:
    'Restyle ChatGPT with customizable themes, personas, and voice-first controls tailored to your workflow.',
  version: '0.1.0',
  icons: {
    '16': 'assets/icons/icon-16.png',
    '32': 'assets/icons/icon-32.png',
    '48': 'assets/icons/icon-48.png',
    '128': 'assets/icons/icon-128.png',
  },
  background: {
    service_worker: 'src/background/serviceWorker.ts',
    type: 'module',
  },
  action: {
    default_popup: 'src/ui/popup/index.html',
    default_icon: {
      '16': 'assets/icons/icon-16.png',
      '32': 'assets/icons/icon-32.png',
    },
  },
  options_page: 'src/ui/options/index.html',
  permissions: ['storage', 'scripting', 'tabs'],
  host_permissions: ['https://chat.openai.com/*', 'https://chatgpt.com/*'],
  content_scripts: [
    {
      matches: ['https://chat.openai.com/*', 'https://chatgpt.com/*'],
      js: ['src/content/index.ts'],
      css: ['src/content/styles.css'],
      run_at: 'document_idle',
    },
  ],
  commands: {
    'persona-next': {
      suggested_key: {
        default: 'Alt+N',
        mac: 'Option+N',
      },
      description: 'Activate the next persona',
    },
    'persona-previous': {
      suggested_key: {
        default: 'Alt+Shift+N',
        mac: 'Option+Shift+N',
      },
      description: 'Activate the previous persona',
    },
    'toggle-layout-overlay': {
      suggested_key: {
        default: 'Alt+L',
        mac: 'Option+L',
      },
      description: 'Toggle personalization overlay',
    },
  },
  web_accessible_resources: [
    {
      resources: ['src/content/overlay.css'],
      matches: ['https://chat.openai.com/*', 'https://chatgpt.com/*'],
    },
  ],
});

export default manifest;
