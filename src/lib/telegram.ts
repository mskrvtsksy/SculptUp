import { TelegramUser } from '../types';

type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending';
type HapticType = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type NotificationType = 'error' | 'success' | 'warning';
export type TelegramHapticType = HapticType | 'success' | 'warning' | 'error' | 'selection';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: TelegramUser;
          query_id?: string;
          auth_date?: string;
          hash?: string;
          start_param?: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor?: string;
        backgroundColor?: string;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        setBottomBarColor?: (color: string) => void;
        contentSafeAreaInset?: { top: number; bottom: number; left: number; right: number };
        safeAreaInset?: { top: number; bottom: number; left: number; right: number };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
          setText: (text: string) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: HapticType) => void;
          notificationOccurred: (type: NotificationType) => void;
          selectionChanged: () => void;
        };
        openInvoice: (url: string, callback?: (status: InvoiceStatus) => void) => void;
        onEvent?: (event: 'viewportChanged' | 'themeChanged' | 'backButtonClicked', callback: () => void) => void;
        offEvent?: (event: 'viewportChanged' | 'themeChanged' | 'backButtonClicked', callback: () => void) => void;
        disableVerticalSwipes?: () => void;
        enableClosingConfirmation?: () => void;
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && Boolean(window.Telegram?.WebApp?.initData);
}

function syncTelegramViewport() {
  const tg = window.Telegram?.WebApp;
  const height = tg?.viewportStableHeight || tg?.viewportHeight;
  if (height && Number.isFinite(height)) {
    document.documentElement.style.setProperty('--tg-viewport-height', `${height}px`);
  }
  const inset = tg?.contentSafeAreaInset ?? tg?.safeAreaInset;
  if (inset) {
    for (const side of ['top', 'right', 'bottom', 'left'] as const) {
      document.documentElement.style.setProperty(`--tg-safe-${side}`, `${inset[side] || 0}px`);
    }
  }
}

/** Initialize Telegram-specific visual behavior and return a cleanup callback. */
export function initTelegramApp(): (() => void) | undefined {
  if (typeof window === 'undefined') return undefined;

  const tg = window.Telegram?.WebApp;
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      tg.disableVerticalSwipes?.();
      tg.setHeaderColor?.('#000000');
      tg.setBackgroundColor?.('#000000');
      tg.setBottomBarColor?.('#000000');
      tg.headerColor = '#000000';
      tg.backgroundColor = '#000000';
      syncTelegramViewport();
      tg.onEvent?.('viewportChanged', syncTelegramViewport);
      tg.onEvent?.('themeChanged', syncTelegramViewport);
      return () => {
        tg.offEvent?.('viewportChanged', syncTelegramViewport);
        tg.offEvent?.('themeChanged', syncTelegramViewport);
      };
    } catch {
      // safe fallback if iframe restrictions prevent specific properties
    }
  }

  return undefined;
}

export function getTelegramUser(): TelegramUser {
  const tgUser = typeof window !== 'undefined'
    ? window.Telegram?.WebApp?.initDataUnsafe?.user
    : undefined;

  if (tgUser) {
    return tgUser;
  }

  throw new Error('Telegram user not found. Open the app from Telegram and validate initData on the server.');
}

/** Returns null in a regular browser instead of throwing during preview or SSR. */
export function getTelegramUserOrNull(): TelegramUser | null {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp?.initDataUnsafe?.user ?? null;
}

export type TelegramSession = {
  user: TelegramUser;
};

/**
 * Exchanges Telegram's signed initData for a server-verified session.
 *
 * `initDataUnsafe` is useful for rendering a name while the app boots, but it
 * must never be treated as authentication. The Vercel handler validates the
 * HMAC with the bot token before returning a user.
 */
export async function authenticateTelegramSession(signal?: AbortSignal): Promise<TelegramSession> {
  const initData = typeof window === 'undefined' ? '' : window.Telegram?.WebApp?.initData;
  if (!initData) {
    throw new Error('TELEGRAM_CONTEXT_REQUIRED');
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12_000);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  let response: Response;
  try {
    response = await fetch('/api/telegram/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ initData }),
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as DOMException).name === 'AbortError') throw new Error('TELEGRAM_AUTH_TIMEOUT');
    throw new Error('TELEGRAM_AUTH_NETWORK');
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }

  if (!response.ok) {
    throw new Error('TELEGRAM_AUTH_FAILED');
  }

  return response.json() as Promise<TelegramSession>;
}

/** Attach Telegram's native BackButton to the active in-app navigation state. */
export function bindTelegramBackButton(onBack: () => void, visible: boolean): () => void {
  const button = typeof window === 'undefined' ? undefined : window.Telegram?.WebApp?.BackButton;
  if (!button) return () => undefined;
  if (visible) button.show(); else button.hide();
  button.onClick(onBack);
  return () => {
    button.offClick(onBack);
    button.hide();
  };
}

export function triggerHaptic(type: TelegramHapticType = 'medium') {
  const haptic = typeof window !== 'undefined'
    ? window.Telegram?.WebApp?.HapticFeedback
    : undefined;
  if (!haptic) return;

  try {
    if (type === 'success' || type === 'warning' || type === 'error') {
      haptic.notificationOccurred(type);
    } else if (type === 'selection') {
      haptic.selectionChanged();
    } else {
      haptic.impactOccurred(type);
    }
  } catch {
    // ignore in browsers without haptics
  }
}

/**
 * Opens an invoice URL issued by the backend.
 *
 * Telegram Stars payments must be created and verified server-side. A product
 * title and amount are not enough to construct a valid invoice URL in the
 * client, so this function deliberately never simulates a successful payment.
 */
export async function openTelegramStarsCheckout(
  invoiceUrl: string,
  callback?: (success: boolean) => void,
): Promise<boolean>;
/** @deprecated Pass a server-created Telegram invoice URL instead. */
export async function openTelegramStarsCheckout(
  invoiceTitle: string,
  starsAmount: number,
  callback?: (success: boolean) => void,
): Promise<boolean>;
export async function openTelegramStarsCheckout(
  invoiceUrlOrTitle: string,
  amountOrCallback?: number | ((success: boolean) => void),
  legacyCallback?: (success: boolean) => void,
): Promise<boolean> {
  triggerHaptic('heavy');
  const callback = typeof amountOrCallback === 'function' ? amountOrCallback : legacyCallback;
  const invoiceUrl = typeof amountOrCallback === 'number' ? undefined : invoiceUrlOrTitle;
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;

  if (!tg?.openInvoice || !invoiceUrl) {
    callback?.(false);
    return false;
  }

  return new Promise((resolve) => {
    try {
      tg.openInvoice(invoiceUrl, (status) => {
        const isPaid = status === 'paid';
        if (isPaid) triggerHaptic('success');
        callback?.(isPaid);
        resolve(isPaid);
      });
    } catch {
      callback?.(false);
      resolve(false);
    }
  });
}
