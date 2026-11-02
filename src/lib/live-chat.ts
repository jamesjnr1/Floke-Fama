/**
 * Live chat with Flokefama's staff: Crisp (crisp.chat: answers from the browser or the Crisp phone app) once its
 * website ID is set, otherwise Tawk.to (tawk.to dashboard).
 *
 * Crisp's bubble sits bottom-right on a computer and bottom-left on a phone (clear of the product pages' Order now bar).
 * Its colour and greeting are set in the Crisp dashboard (Settings → Chatbox).
 *
 * Tawk.to's own bubble is the chat button (the site's own one was removed, Nov 2026: the two showed at once). On a
 * computer it sits bottom-right, under the cart; on a phone bottom-left, in the space product pages' bottom bar keeps free.
 *
 * Switches (env, all optional):
 *   NEXT_PUBLIC_CRISP_WEBSITE_ID  Crisp's website ID (Crisp → Settings → Website settings → Setup instructions); when set,
 *                             Crisp is used instead of Tawk.to
 *   NEXT_PUBLIC_LIVE_CHAT     crisp · tawk · assistant (the older built-in question flow) · off; unset: crisp when its ID
 *                             is set, else tawk
 *   (the older NEXT_PUBLIC_CHAT is no longer read, so a value left in Vercel cannot hide the chat)
 *   NEXT_PUBLIC_TAWK_PROPERTY Tawk.to property ID (defaults to Flokefama's)
 *   NEXT_PUBLIC_TAWK_WIDGET   Tawk.to widget ID (defaults to Flokefama's)
 */
const CRISP_ID = (process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID ?? '').trim();
const chosen = (process.env.NEXT_PUBLIC_LIVE_CHAT ?? '').trim();
export const chatMode: 'crisp' | 'tawk' | 'assistant' | 'off' =
  chosen === 'off' ? 'off' : chosen === 'assistant' ? 'assistant' : chosen === 'tawk' ? 'tawk' : CRISP_ID ? 'crisp' : 'tawk';

declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
  }
}

/** Loads Crisp once: its bubble bottom-right on a computer, bottom-left on a phone. */
function loadCrisp() {
  window.$crisp = window.$crisp || [];
  window.CRISP_WEBSITE_ID = CRISP_ID;
  if (window.matchMedia('(max-width: 767px)').matches) window.$crisp.push(['config', 'position:reverse', [true]]);
  const s = document.createElement('script');
  s.src = 'https://client.crisp.chat/l.js';
  s.async = true;
  s.onerror = () => {
    failed = true;
  };
  document.head.appendChild(s);
}

const PROPERTY = process.env.NEXT_PUBLIC_TAWK_PROPERTY || '6ae754427ef3933c394c3bbd';
const WIDGET = process.env.NEXT_PUBLIC_TAWK_WIDGET || '1k6bq292a';

type TawkApi = {
  onLoad?: () => void;
  onChatMinimized?: () => void;
  onChatMaximized?: () => void;
  onChatMessageAgent?: () => void;
  customStyle?: unknown;
  hideWidget?: () => void;
  showWidget?: () => void;
  maximize?: () => void;
  isChatMaximized?: () => boolean;
};
declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
  }
}

let started = false;
let ready = false;
let failed = false;
let openWhenReady = false;

/** Loads Tawk.to once (after the page has loaded), with its bubble hidden. */
export function loadLiveChat() {
  if (started || typeof window === 'undefined' || (chatMode !== 'tawk' && chatMode !== 'crisp')) return;
  started = true;
  if (chatMode === 'crisp') return loadCrisp();
  const api: TawkApi = (window.Tawk_API = window.Tawk_API || {});
  window.Tawk_LoadStart = new Date();
  // Above the maintenance banner and the menu bar; bottom-left on phones (clear of the product pages' Order now bar)
  api.customStyle = {
    zIndex: 1000,
    visibility: {
      desktop: { position: 'br', xOffset: '24px', yOffset: '24px' },
      mobile: { position: 'bl', xOffset: '10px', yOffset: '10px' },
    },
  };
  api.onLoad = () => {
    ready = true;
    if (openWhenReady) openLiveChat();
  };
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://embed.tawk.to/${PROPERTY}/${WIDGET}`;
  s.charset = 'UTF-8';
  s.setAttribute('crossorigin', '*');
  // Blocked (ad blocker, firewall) or offline: the Chat button falls back to WhatsApp
  s.onerror = () => {
    failed = true;
  };
  document.body.appendChild(s);
}

/** Opens the chat window. Returns false when Tawk.to cannot load (e.g. blocked), so the caller can offer WhatsApp. */
export function openLiveChat(): boolean {
  if (chatMode !== 'tawk' && chatMode !== 'crisp') return false;
  loadLiveChat();
  if (failed) return false;
  if (chatMode === 'crisp') {
    window.$crisp?.push(['do', 'chat:open']);
    return true;
  }
  const api = window.Tawk_API;
  if (!ready || !api?.maximize) {
    openWhenReady = true;
    return true;
  }
  openWhenReady = false;
  api.showWidget?.();
  api.maximize();
  return true;
}

