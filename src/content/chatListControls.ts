const NAV_SELECTOR = "[data-testid='left-nav'], nav[aria-label='ChatGPT sidebar']";
const CONVERSATION_LINK_SELECTOR = "a[href*='/c/']";
const HOST_ATTRIBUTE = 'data-codex-chat-delete';
const BUTTON_CLASS = 'codex-chat-delete-button';
const BUTTON_STATE_ATTRIBUTE = 'data-codex-delete-state';

type DeleteButtonState = 'idle' | 'pending' | 'error';

type AuthTokens = {
  accessToken?: string;
  csrfToken?: string;
};

let cachedAuthTokens: AuthTokens | null = null;

const extractConversationId = (href: string): string | null => {
  try {
    const url = new URL(href, window.location.origin);
    const match = url.pathname.match(/\/c\/([^/]+)/i);
    if (match && match[1]) {
      return match[1];
    }
    const fromQuery = url.searchParams.get('conversationId');
    return fromQuery;
  } catch {
    return null;
  }
};

const parseAuthTokens = (): AuthTokens => {
  if (cachedAuthTokens) {
    return cachedAuthTokens;
  }

  const tokens: AuthTokens = {};
  const nextDataElement = document.getElementById('__NEXT_DATA__');

  if (!nextDataElement?.textContent) {
    cachedAuthTokens = tokens;
    return tokens;
  }

  try {
    const payload = JSON.parse(nextDataElement.textContent) as {
      props?: {
        pageProps?: {
          session?: {
            accessToken?: string;
          };
          csrfToken?: string;
        };
      };
    };

    tokens.accessToken = payload?.props?.pageProps?.session?.accessToken;
    tokens.csrfToken = payload?.props?.pageProps?.csrfToken;
  } catch (error) {
    console.warn('codex: failed to parse auth tokens from __NEXT_DATA__', error);
  }

  cachedAuthTokens = tokens;
  return tokens;
};

const buildAuthHeaders = (): Record<string, string> => {
  const { accessToken, csrfToken } = parseAuthTokens();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const deviceId = window.localStorage.getItem('oai-device-id') ?? window.localStorage.getItem('device-id');
  if (deviceId) {
    headers['OAI-Device-Id'] = deviceId;
  }

  return headers;
};

const requestDeleteConversation = async (conversationId: string) => {
  const response = await fetch(`${window.location.origin}/backend-api/conversation/${conversationId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      is_visible: false,
      is_archived: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete conversation (${response.status})`);
  }
};

const setButtonState = (button: HTMLButtonElement, state: DeleteButtonState) => {
  if (state === 'idle') {
    button.removeAttribute(BUTTON_STATE_ATTRIBUTE);
    return;
  }
  button.setAttribute(BUTTON_STATE_ATTRIBUTE, state);
};

const handleDeleteClick = async (
  conversationId: string,
  host: HTMLElement,
  button: HTMLButtonElement,
) => {
  if (!conversationId) {
    return;
  }

  if (button.getAttribute(BUTTON_STATE_ATTRIBUTE) === 'pending') {
    return;
  }

  button.disabled = true;
  setButtonState(button, 'pending');

  try {
    await requestDeleteConversation(conversationId);
    host.remove();
    window.dispatchEvent(
      new CustomEvent('codex:conversationDeleted', {
        detail: { conversationId },
      }),
    );
  } catch (error) {
    console.warn('codex: failed to delete conversation', error);
    button.disabled = false;
    setButtonState(button, 'error');
    window.setTimeout(() => {
      if (button.getAttribute(BUTTON_STATE_ATTRIBUTE) === 'error') {
        setButtonState(button, 'idle');
      }
    }, 2500);
  }
};

const createDeleteButton = (
  conversationId: string,
  host: HTMLElement,
  menuButton: HTMLButtonElement,
): HTMLButtonElement => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = BUTTON_CLASS;
  button.textContent = 'Delete';
  button.setAttribute('aria-label', 'Delete conversation');
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    void handleDeleteClick(conversationId, host, button);
  });

  menuButton.before(button);

  return button;
};

const decorateConversationLink = (anchor: HTMLAnchorElement) => {
  const conversationId = extractConversationId(anchor.href);
  if (!conversationId) {
    return;
  }

  const host = (anchor.closest(`[${HOST_ATTRIBUTE}]`) as HTMLElement | null) ?? anchor.closest('li') ?? anchor;
  if (host.hasAttribute(HOST_ATTRIBUTE)) {
    return;
  }

  const menuButton =
    host.querySelector<HTMLButtonElement>("button[aria-label*='options' i]") ??
    host.querySelector<HTMLButtonElement>("button[aria-label*='action' i]") ??
    host.querySelector<HTMLButtonElement>("button[data-testid*='conversation-options']");

  if (!menuButton) {
    return;
  }

  createDeleteButton(conversationId, host, menuButton);
  host.setAttribute(HOST_ATTRIBUTE, 'true');
};

const scanSidebar = () => {
  const navRoots = document.querySelectorAll<HTMLElement>(NAV_SELECTOR);
  navRoots.forEach((root) => {
    root.querySelectorAll<HTMLAnchorElement>(CONVERSATION_LINK_SELECTOR).forEach((anchor) => {
      decorateConversationLink(anchor);
    });
  });
};

export const initializeChatListControls = (): (() => void) => {
  let rafId: number | null = null;

  const scheduleScan = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      scanSidebar();
      rafId = null;
    });
  };

  const observer = new MutationObserver(scheduleScan);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  scheduleScan();

  return () => {
    observer.disconnect();
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
  };
};
