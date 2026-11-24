'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouteOpenState } from '@/hooks/use-route-open-state';

import { useCartPopupSlot } from '../../hooks/use-cart-popup-slot';
import type { CartPopupAction } from '../../utils/popup-arbitration/analytics';
import type {
  CartPopupStatus,
  CartPopupType,
} from '../../utils/popup-arbitration/consts';
import { trackCartPopupAction } from '../../utils/popup-arbitration/store';

import { DEMO_POPUP_ROUTE_KEY } from './route-keys';
import { scenario } from './scenario';

/**
 * A demo host, wired the same way as the real ones in flexipill-ui:
 * start `pending`, report the scenario's status, open only when the arbiter
 * grants the slot, and report how the pop-up closed.
 */
export function useDemoPopup(type: CartPopupType) {
  const config = scenario.popups[type];
  const [open, setOpen] = useRouteOpenState(DEMO_POPUP_ROUTE_KEY[type]);
  const [slotStatus, setSlotStatus] = useState<CartPopupStatus>('pending');
  const openedRef = useRef(false);
  const closeMethodRef = useRef<CartPopupAction | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (config.status === 'pending') return;
    const timer = window.setTimeout(
      () => setSlotStatus(config.status),
      config.resolveAfterMs
    );
    return () => window.clearTimeout(timer);
  }, [config.status, config.resolveAfterMs]);

  const canOpen = useCartPopupSlot(type, slotStatus);

  useEffect(() => {
    if (!canOpen || openedRef.current) return;
    openedRef.current = true;
    setOpen(true);
  }, [canOpen, setOpen]);

  useEffect(() => {
    if (!open || config.autoCloseMs == null) return;
    const timer = window.setTimeout(() => {
      closeMethodRef.current = 'auto_close';
      setOpen(false);
    }, config.autoCloseMs);
    return () => window.clearTimeout(timer);
  }, [open, config.autoCloseMs, setOpen]);

  // Back gesture removes the key without a close method: that is `dismiss`.
  useEffect(() => {
    if (wasOpenRef.current && !open) {
      trackCartPopupAction(type, closeMethodRef.current ?? 'dismiss');
      closeMethodRef.current = null;
    }
    wasOpenRef.current = open;
  }, [open, type]);

  const close = (action: CartPopupAction) => {
    closeMethodRef.current ??= action;
    setOpen(false);
  };

  return { open, close, slotStatus };
}
