import './styles.css';
import { createRoot, Root } from 'react-dom/client';
import OverlayApp from './overlay';
import overlayStyles from './overlay.css?inline';
import { applyThemeToDocument, resolveTheme } from '../libs/themes';
import { getState } from '../libs/storage';
import type { Persona, StorageSchema } from '../types/storage';
import type { RuntimeMessage } from '../types/messages';

const CODex_ACTIVE_CLASS = 'codex-theme-active';
const OVERLAY_HOST_ID = 'codex-overlay-host';

let overlayRoot: Root | null = null;
let overlayContainer: HTMLElement | null = null;
let overlayVisible = false;
let stateCache: StorageSchema | null = null;
let sidebarCollapsed = false;

const getPersonas = (): Persona[] =>
  stateCache ? Object.values(stateCache.personas) : [];

const ensureOverlayMount = () => {
  if (overlayContainer && overlayRoot) {
    return { container: overlayContainer, root: overlayRoot };
  }

  const host = document.createElement('div');
  host.id = OVERLAY_HOST_ID;
  host.style.position = 'fixed';
  host.style.top = '16px';
  host.style.right = '16px';
  host.style.zIndex = '999999';
  host.style.pointerEvents = 'none';

  const shadowRoot = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = overlayStyles;
  shadowRoot.appendChild(style);

  const container = document.createElement('div');
  shadowRoot.appendChild(container);

  document.body.append(host);

  overlayContainer = container;
  overlayRoot = createRoot(container);

  return { container, root: overlayRoot };
};

const renderOverlay = () => {
  if (!stateCache || !overlayVisible) {
    destroyOverlay();
    return;
  }

  const { root } = ensureOverlayMount();

  root.render(
    <OverlayApp
      activePersonaId={stateCache.activePersonaId}
      personas={getPersonas()}
      onClose={() => toggleOverlay(false)}
      onPersonaSelect={(personaId) => {
        void chrome.runtime.sendMessage({ type: 'SET_ACTIVE_PERSONA', personaId });
      }}
      onSidebarToggle={() => toggleSidebar()}
      sidebarCollapsed={sidebarCollapsed}
    />,
  );
};

const destroyOverlay = () => {
  if (!overlayContainer || !overlayRoot) {
    return;
  }
  overlayRoot.unmount();
  overlayContainer = null;
  overlayRoot = null;
  const host = document.getElementById(OVERLAY_HOST_ID);
  if (host?.isConnected) {
    host.remove();
  }
};

const applyLayoutAttributes = () => {
  document.documentElement.toggleAttribute('data-codex-sidebar-collapsed', sidebarCollapsed);
};

const applyPersonaTheme = () => {
  if (!stateCache) {
    return;
  }

  const persona = stateCache.activePersonaId ? stateCache.personas[stateCache.activePersonaId] : null;
  const theme = persona ? resolveTheme(stateCache.themes, persona.themeId) : null;

  if (!theme) {
    return;
  }

  applyThemeToDocument(document, theme, document.documentElement);
  document.documentElement.dataset.codexPersona = persona?.id ?? 'default';
  document.documentElement.dataset.codexTheme = theme.id;
  document.documentElement.classList.add(CODex_ACTIVE_CLASS);
  applyLayoutAttributes();
};

const syncState = async () => {
  const current = await getState();
  stateCache = current;
  applyPersonaTheme();
  renderOverlay();
};

const toggleOverlay = (visible?: boolean) => {
  overlayVisible = typeof visible === 'boolean' ? visible : !overlayVisible;
  renderOverlay();
};

const toggleSidebar = (forced?: boolean) => {
  sidebarCollapsed = typeof forced === 'boolean' ? forced : !sidebarCollapsed;
  applyLayoutAttributes();
};

const handleRuntimeMessage = async (message: RuntimeMessage) => {
  switch (message.type) {
    case 'RELOAD_THEMES':
      await syncState();
      break;
    case 'TOGGLE_OVERLAY':
      toggleOverlay();
      break;
    default:
      break;
  }
};

const observeChatRoot = () => {
  const applyClasses = () => {
    document.documentElement.classList.add(CODex_ACTIVE_CLASS);
    applyLayoutAttributes();
  };

  applyClasses();

  const observer = new MutationObserver(() => {
    applyClasses();
  });

  observer.observe(document.documentElement, {
    childList: true,
    attributes: false,
    subtree: true,
  });
};

const bootstrap = async () => {
  try {
    observeChatRoot();
    await syncState();
    chrome.runtime.onMessage.addListener((message: RuntimeMessage) => {
      void handleRuntimeMessage(message);
    });
  } catch (error) {
    console.warn('Failed to initialize ChatGPT UI Personalizer', error);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void bootstrap();
  });
} else {
  void bootstrap();
}
