import { create } from 'zustand';

import {
  sendCartPopupAction,
  trackCartPopupEligible,
  trackCartPopupShown,
  trackCartPopupSuppressed,
  type CartPopupAction,
  type CartPopupSuppressReason,
} from './analytics';
import {
  DEFAULT_CART_POPUP_CONFIG,
  REDCLIFFE_POPUP,
  type CartPopupCandidate,
  type CartPopupConfig,
  type CartPopupStatus,
  type CartPopupType,
} from './consts';
import {
  getSessionShownCount,
  isInCooloff,
  recordCartPopupShown,
} from './storage';

type CartPopupArbitrationState = {
  /** True while a cart page is open; outside it nothing is decided. */
  active: boolean;
  config: CartPopupConfig;
  /** No pop-up is given the slot until the config is known. */
  configReady: boolean;
  statuses: Partial<Record<CartPopupCandidate, CartPopupStatus>>;
  /** System checks still running that may open a sheet (cold chain). */
  blockers: Record<string, true>;
  /**
   * A sheet opened before a pop-up was picked: nothing shows this visit and
   * nothing is recorded, as if the visit never happened.
   */
  busy: boolean;
  /** The pop-up shown this visit, if any (Redcliffe included). */
  granted: CartPopupCandidate | null;
  /** Each event fires once per pop-up per visit. */
  eligibleTracked: Partial<Record<CartPopupType, true>>;
  suppressedTracked: Partial<Record<CartPopupType, true>>;
};

const getInitialState = (): CartPopupArbitrationState => ({
  active: false,
  config: DEFAULT_CART_POPUP_CONFIG,
  configReady: true,
  statuses: {},
  blockers: {},
  busy: false,
  granted: null,
  eligibleTracked: {},
  suppressedTracked: {},
});

export const useCartPopupArbitrationStore =
  create<CartPopupArbitrationState>(getInitialState);

const { getState, setState } = useCartPopupArbitrationStore;

function suppress(types: CartPopupType[], reason: CartPopupSuppressReason) {
  const { suppressedTracked } = getState();
  const fresh = types.filter((type) => !suppressedTracked[type]);
  if (fresh.length === 0) return;

  fresh.forEach((type) => trackCartPopupSuppressed(type, reason));
  setState({
    suppressedTracked: {
      ...suppressedTracked,
      ...Object.fromEntries(fresh.map((type) => [type, true])),
    },
  });
}

/**
 * Gives the slot to the highest-priority eligible pop-up once no pop-up above
 * it is still pending. Pending pop-ups below it never hold it up.
 */
function evaluate() {
  const state = getState();
  if (!state.active || !state.configReady) return;

  const { config, statuses } = state;
  const eligible = config.priority.filter(
    (type) => statuses[type] === 'eligible'
  );

  const untracked = eligible.filter((type) => !state.eligibleTracked[type]);
  if (untracked.length > 0) {
    untracked.forEach(trackCartPopupEligible);
    setState({
      eligibleTracked: {
        ...state.eligibleTracked,
        ...Object.fromEntries(untracked.map((type) => [type, true])),
      },
    });
  }

  const redcliffe = statuses[REDCLIFFE_POPUP];
  const blocked = Object.keys(state.blockers).length > 0;
  let reason: CartPopupSuppressReason | null = null;
  if (state.granted === REDCLIFFE_POPUP) reason = 'redcliffe';
  else if (state.granted) reason = 'session_cap';
  else if (state.busy) reason = 'busy';
  else if (redcliffe === 'pending') return;
  else if (redcliffe === 'eligible') {
    // Redcliffe skips priority and writes no counters, but still waits for
    // system checks and never opens over a sheet.
    if (blocked) return;
    setState({ granted: REDCLIFFE_POPUP });
    reason = 'redcliffe';
  } else if (getSessionShownCount() >= config.sessionCap)
    reason = 'session_cap';
  else if (isInCooloff(config.cooloffHours)) reason = 'cooloff';

  if (reason) {
    suppress(eligible, reason);
    return;
  }

  if (blocked) return;

  for (const type of config.priority) {
    const status = statuses[type];
    if (status === 'pending') return;
    if (status !== 'eligible') continue;

    recordCartPopupShown();
    trackCartPopupShown(type);
    setState({ granted: type });
    suppress(
      eligible.filter((other) => other !== type),
      'priority'
    );
    return;
  }
}

let evaluateQueued = false;

// Hosts report from their effects; deciding after the whole commit lets every
// host that reports in the same render be counted.
function scheduleEvaluate() {
  if (evaluateQueued) return;
  evaluateQueued = true;
  queueMicrotask(() => {
    evaluateQueued = false;
    evaluate();
  });
}

export function startCartVisit() {
  setState({ active: true });
  scheduleEvaluate();
}

/** Clears the visit so the next cart visit starts fresh. */
export function endCartVisit() {
  setState(getInitialState());
}

export function setCartPopupStatus(
  type: CartPopupCandidate,
  status: CartPopupStatus | null
) {
  const statuses = { ...getState().statuses };
  if (status) statuses[type] = status;
  else delete statuses[type];
  setState({ statuses });
  scheduleEvaluate();
}

export function setCartPopupBlocker(key: string, pending: boolean) {
  const blockers = { ...getState().blockers };
  if (pending) blockers[key] = true;
  else delete blockers[key];
  setState({ blockers });
  scheduleEvaluate();
}

/** A sheet was opened. Safe to call from anywhere: off the cart it does nothing. */
export function markCartVisitBusy() {
  const { active, busy } = getState();
  if (!active || busy) return;
  setState({ busy: true });
  scheduleEvaluate();
}

/** Sent only for the pop-up this visit actually showed. */
export function trackCartPopupAction(
  type: CartPopupType,
  action: CartPopupAction
) {
  if (getState().granted !== type) return;
  sendCartPopupAction(type, action);
}
