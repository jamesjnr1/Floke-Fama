/**
 * Live chat with Flokefama's staff: Tidio (tidio.com: answers from the browser or the Tidio phone app). Tawk.to
 * (tawk.to dashboard) remains as a switch.
 *
 * The chat's own bubble is the chat button (the site's own one was removed, Nov 2026: the two showed at once). On a
 * computer it sits under the cart. Tidio's side is set in its panel (Settings → Live chat → Appearance → Position:
 * left keeps it clear of the cart on phones; on the right, the cart button moves up). Tawk.to sits bottom-right on a
 * computer and bottom-left on a phone, in the space product pages' Order now bar keeps free. Tidio's colour, greeting and opening hours are set in the Tidio panel (Settings → Live chat → Appearance).
 *
 * Switches (env, all optional):
 *   NEXT_PUBLIC_TIDIO_KEY     Tidio's public key (Tidio → Settings → Developer → Public key, or the 32 letters in its
 *                             install code, code.tidio.co/<key>.js); defaults to Flokefama's
 *   NEXT_PUBLIC_LIVE_CHAT     tidio · tawk · assistant (the older built-in question flow) · off; unset: tidio
 *   (the older NEXT_PUBLIC_CHAT is no longer read, so a value left in Vercel cannot hide the chat)
 *   NEXT_PUBLIC_TAWK_PROPERTY Tawk.to property ID (defaults to Flokefama's)
 *   NEXT_PUBLIC_TAWK_WIDGET   Tawk.to widget ID (defaults to Flokefama's)
 */
// The key is the 32 characters in Tidio's install code; a pasted URL or script tag still works
const TIDIO_KEY = ((process.env.NEXT_PUBLIC_TIDIO_KEY || 'rvpnl6xukgl0bjtyidgk7yplpo7rh6ho').match(/[a-z0-9]{32}/i)?.[0] ?? '').toLowerCase();
const chosen = (process.env.NEXT_PUBLIC_LIVE_CHAT ?? '').trim().toLowerCase();
export const chatMode: 'tidio' | 'tawk' | 'assistant' | 'off' =
  chosen === 'off'
    ? 'off'
    : chosen === 'assistant'
      ? 'assistant'
      : chosen === 'tawk' || !TIDIO_KEY
        ? 'tawk'
        : 'tidio';

type TidioApi = {
  on: (event: string, fn: () => void) => void;
  open: () => void;
};
declare global {
  interface Window {
    tidioChatApi?: TidioApi;
  }
}

/**
 * Loads Tidio once. Its side (left or right) is set in the Tidio panel; on a phone, product pages lift its bubble
 * above the Order now bar, and a bubble on the right lifts the cart button above it.
 */
function loadTidio() {
  const root = document.documentElement;
  const style = document.createElement('style');
  style.textContent =
    '@media (max-width:767px){' +
    'html:not(.tidio-open):has([data-quote-bar]) #tidio-chat-iframe{bottom:76px!important}' +
    'html.chat-right [data-dock]{bottom:104px!important}' +
    'html.chat-right:has([data-quote-bar]) [data-dock]{bottom:180px!important}}';
  document.head.appendChild(style);
  // Which side the bubble is on (Tidio places it after loading its settings)
  const side = () => {
    const r = document.getElementById('tidio-chat-iframe')?.getBoundingClientRect();
    root.classList.toggle('chat-right', !!r && r.width > 0 && r.left + r.width / 2 > window.innerWidth / 2);
  };
  const onReady = () => {
    const api = window.tidioChatApi;
    if (!api) return;
    ready = true;
    api.on('open', () => root.classList.add('tidio-open'));
    api.on('close', () => {
      root.classList.remove('tidio-open');
      side();
    });
    api.on('resize', side);
    window.addEventListener('resize', side);
    for (const ms of [0, 1500, 5000]) setTimeout(side, ms);
    if (openWhenReady) openLiveChat();
  };
  document.addEventListener('tidioChat-ready', onReady, { once: true });
  const s = document.createElement('script');
  s.src = `https://code.tidio.co/${TIDIO_KEY}.js`;
  s.async = true;
  s.onerror = () => {
    failed = true;
  };
  document.body.appendChild(s);
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

/** Loads the live chat (Tidio or Tawk.to) once, after the page has loaded. */
export function loadLiveChat() {
  if (started || typeof window === 'undefined' || (chatMode === 'assistant' || chatMode === 'off')) return;
  started = true;
  if (chatMode === 'tidio') return loadTidio();
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

/** Opens the chat window. Returns false when the chat cannot load (e.g. blocked), so the caller can offer WhatsApp. */
export function openLiveChat(): boolean {
  if (chatMode === 'assistant' || chatMode === 'off') return false;
  loadLiveChat();
  if (failed) return false;
  if (chatMode === 'tidio') {
    if (!ready || !window.tidioChatApi) {
      openWhenReady = true;
      return true;
    }
    openWhenReady = false;
    window.tidioChatApi.open();
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

