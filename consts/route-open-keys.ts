/**
 * URL keys for sheets opened with `useRouteOpenState` (`?key=true`).
 * Every key used with that hook lives here.
 */

/** Sheets on the cart that the user or the system opens. */
export const CART_SHEET_ROUTE_KEY = {
  MANAGE_ADDRESS: 'manage-address',
  COUPONS: 'coupons',
  RX_SELECT: 'rx-select',
  EDGE_P2P: 'edge-p2p',
  EDGE_BENEFITS: 'edge-benefits',
  EDGE_REMOVE_CONFIRM: 'edge-remove-confirm',
  EDGE_BENEFITS_NUDGE: 'edge-benefits-nudge',
  EDGE_REMOVE_NUDGE: 'edge-remove-nudge',
  COD_CONFIRMATION: 'cod-confirmation',
  PARTIAL_PAYMENT: 'partial-payment',
  COD_CONFIRMATION_PAYMENT: 'cod-confirmation-payment',
  PARTIAL_PAYMENT_PAYMENT: 'partial-payment-payment',
  COD_CONFIRMATION_PAYMENT_FAILURE: 'cod-confirmation-payment-failure',
  PARTIAL_PAYMENT_PAYMENT_FAILURE: 'partial-payment-payment-failure',
  PAYMENT_FAILURE: 'payment-failure',
  PAYMENT_PENDING: 'payment-pending',
  DUPLICATE_ORDER: 'duplicate-order',
  COLD_CHAIN_OPTIONS: 'cold-chain-options',
} as const;

/** Per-item cart sheets: the key is the prefix plus the item's id. */
export const CART_ITEM_SHEET_ROUTE_KEY_PREFIX = {
  SUBSTITUTE_POPUP: 'cart-substitute-popup-',
  SUBSTITUTE_SWAP_ITEM: 'cart-substitute-swap-item-',
  SUBSTITUTE_SWAP_BACK: 'cart-substitute-swap-back-',
} as const;

/** The cart's auto pop-ups, which the pop-up arbiter decides on. */
export const CART_AUTO_POPUP_ROUTE_KEY = {
  TIME_LIMITED_OFFER: 'time-limited-offer',
  EDGE_AUTO: 'edge-auto',
  EDGE_BENEFITS_AUTO: 'edge-benefits-auto',
} as const;

/** Sheets on the Edge landing page (/loyalty). */
export const EDGE_LANDING_ROUTE_KEY = {
  CALCULATOR: 'edge-calculator',
  SAVINGS_BREAKDOWN: 'edge-savings-breakdown',
  CONSULT: 'edge-consult',
  FAQ: 'edge-faq',
  PRICE_SHEET: 'edge-price-sheet',
} as const;
