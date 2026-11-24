import {
  CART_ITEM_SHEET_ROUTE_KEY_PREFIX,
  CART_SHEET_ROUTE_KEY,
} from '@/consts/route-open-keys';

const CART_POPUP_PRIORITY = [
  'reorder_brand_review',
  'dynamic_coupon',
  'edge_plus',
  'coins_auto_apply',
] as const;

export type CartPopupType = (typeof CART_POPUP_PRIORITY)[number];

/**
 * Redcliffe is outside the priority list: it does not wait for higher pop-ups
 * and writes no counters, but like the rest it waits for system checks and is
 * skipped on a busy visit. Once it opens, every other pop-up stands down.
 */
export const REDCLIFFE_POPUP = 'redcliffe_auto_apply';

export type CartPopupCandidate = CartPopupType | typeof REDCLIFFE_POPUP;

/** What a pop-up's host knows: still working it out, wants to open, or not. */
export type CartPopupStatus = 'pending' | 'eligible' | 'ineligible';

export type CartPopupConfig = {
  /** No cart pop-up for this long after any cart pop-up is shown. */
  cooloffHours: number;
  sessionCap: number;
  priority: readonly CartPopupType[];
};

export const DEFAULT_CART_POPUP_CONFIG: CartPopupConfig = {
  cooloffHours: 72,
  sessionCap: 1,
  priority: CART_POPUP_PRIORITY,
};

/** Cart sheets that, when open in the URL, make the visit busy. */
export const CART_SHEET_ROUTE_KEYS: readonly string[] =
  Object.values(CART_SHEET_ROUTE_KEY);
export const CART_ITEM_SHEET_ROUTE_KEY_PREFIXES: readonly string[] =
  Object.values(CART_ITEM_SHEET_ROUTE_KEY_PREFIX);
