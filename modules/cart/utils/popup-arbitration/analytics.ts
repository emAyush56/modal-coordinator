import useCartStore from '@/store/cartStore';
import { customWebEvent } from '@/utils/customWebEvent';
import { isAppRuntime } from '@/utils/runtimeContext';

import { METABASE_ONLY_SOURCES } from '../cart-analytics';

import type { CartPopupType } from './consts';

export type CartPopupSuppressReason =
  | 'cooloff'
  | 'session_cap'
  | 'priority'
  | 'busy'
  | 'redcliffe';

export type CartPopupAction = 'cta' | 'dismiss' | 'outside_tap' | 'auto_close';

const getPlatform = () => (isAppRuntime() ? 'webview' : 'web');

const getUserEdgeState = () =>
  (useCartStore.getState().edge as { state?: string } | null)?.state ?? null;

export function trackCartPopupEligible(popupType: CartPopupType) {
  customWebEvent(
    'cart_popup_eligible',
    {
      popup_type: popupType,
      user_edge_state: getUserEdgeState(),
      cart_value: Number(
        useCartStore.getState().priceDetails?.totalAmountToBePaid || 0
      ),
      platform: getPlatform(),
    },
    METABASE_ONLY_SOURCES
  );
}

export function trackCartPopupSuppressed(
  popupType: CartPopupType,
  reason: CartPopupSuppressReason
) {
  customWebEvent(
    'cart_popup_suppressed',
    { popup_type: popupType, reason, platform: getPlatform() },
    METABASE_ONLY_SOURCES
  );
}

export function trackCartPopupShown(popupType: CartPopupType) {
  customWebEvent(
    'cart_popup_shown',
    {
      popup_type: popupType,
      user_edge_state: getUserEdgeState(),
      platform: getPlatform(),
    },
    METABASE_ONLY_SOURCES
  );
}

export function sendCartPopupAction(
  popupType: CartPopupType,
  action: CartPopupAction
) {
  customWebEvent(
    'cart_popup_action',
    { popup_type: popupType, action, platform: getPlatform() },
    METABASE_ONLY_SOURCES
  );
}
