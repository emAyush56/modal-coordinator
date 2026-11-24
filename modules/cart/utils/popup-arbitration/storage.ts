import { getAppProvidedSessionId } from '@/utils/appWebview/WebViewPRx/hashParams';
import { isAppRuntime } from '@/utils/runtimeContext';
import { safeLocalStorage, safeSessionStorage } from '@/utils/storageUtils';

// Device level (PRD R6): web and webview keep their own copies.
const LAST_SHOWN_KEY = 'cartPopupLastShownAt';
const SESSION_KEY = 'cartPopupSession';

const HOUR_MS = 60 * 60 * 1000;

/**
 * The app sends a new session id on every launch, so in the webview a session
 * is one app launch. The website has no session of its own, so there it is
 * one browser tab (sessionStorage), also the fallback when the app sends none.
 */
function getAppSessionId(): string | null {
  if (!isAppRuntime()) return null;
  const sessionId = getAppProvidedSessionId();
  return typeof sessionId === 'string' && sessionId ? sessionId : null;
}

export function getSessionShownCount(): number {
  const sessionId = getAppSessionId();
  if (sessionId) {
    const saved = safeLocalStorage.getItem(SESSION_KEY);
    return saved?.sessionId === sessionId ? Number(saved.count) || 0 : 0;
  }
  return Number(safeSessionStorage.getItem(SESSION_KEY)) || 0;
}

/** Unreadable or future timestamps count as no pop-up shown. */
export function isInCooloff(cooloffHours: number): boolean {
  const shownAt = Number(safeLocalStorage.getItem(LAST_SHOWN_KEY));
  if (!Number.isFinite(shownAt) || shownAt <= 0) return false;

  const elapsed = Date.now() - shownAt;
  return elapsed >= 0 && elapsed < cooloffHours * HOUR_MS;
}

/** Starts the cool-off and counts the pop-up against the session. */
export function recordCartPopupShown() {
  safeLocalStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));

  const count = getSessionShownCount() + 1;
  const sessionId = getAppSessionId();
  if (sessionId) {
    safeLocalStorage.setItem(SESSION_KEY, { sessionId, count });
  } else {
    safeSessionStorage.setItem(SESSION_KEY, String(count));
  }
}
