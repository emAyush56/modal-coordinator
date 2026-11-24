import { CART_AUTO_POPUP_ROUTE_KEY } from '@/consts/route-open-keys';

import type { CartPopupType } from '../../utils/popup-arbitration/consts';

/**
 * URL keys for the demo pop-ups. Coupon and Edge+ use the real keys from the
 * constants file; reorder and coins have no URL key in flexipill-ui yet, so the
 * demo gives them one. None of these count as a "busy" cart sheet.
 */
export const DEMO_POPUP_ROUTE_KEY: Record<CartPopupType, string> = {
  reorder_brand_review: 'reorder-review',
  dynamic_coupon: CART_AUTO_POPUP_ROUTE_KEY.TIME_LIMITED_OFFER,
  edge_plus: CART_AUTO_POPUP_ROUTE_KEY.EDGE_AUTO,
  coins_auto_apply: 'coins-auto-apply',
};
