'use client';

import { useContext, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CART_SHEET_ROUTE_KEY } from '@/consts/route-open-keys';
import { useRouteOpenState } from '@/hooks/use-route-open-state';

import { useCartPopupSlot } from '../../hooks/use-cart-popup-slot';
import {
  REDCLIFFE_POPUP,
  type CartPopupStatus,
} from '../../utils/popup-arbitration/consts';
import {
  markCartVisitBusy,
  setCartPopupBlocker,
} from '../../utils/popup-arbitration/store';
import { CartPopupArbitrationContext } from '../popup-arbitration/provider';

import { scenario } from './scenario';

function SimpleSheet({
  open,
  onClose,
  title,
  description,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** A user sheet that lives in the URL (?coupons=true), like the real coupons drawer. */
export function CouponsSheet() {
  const [open, setOpen] = useRouteOpenState(CART_SHEET_ROUTE_KEY.COUPONS);

  useEffect(() => {
    if (scenario.openSheetAfterMs == null) return;
    const timer = window.setTimeout(
      () => setOpen(true),
      scenario.openSheetAfterMs
    );
    return () => window.clearTimeout(timer);
    // Once per visit, like a user tap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SimpleSheet
      open={open}
      onClose={() => setOpen(false)}
      title="All coupons (user sheet)"
      description="Opened through the URL. If it opens before the decision, the provider marks the visit busy."
    />
  );
}

/** A user sheet that lives in the URL (?manage-address=true), like the real address panel. */
export function AddressSheet() {
  const [open, setOpen] = useRouteOpenState(CART_SHEET_ROUTE_KEY.MANAGE_ADDRESS);
  return (
    <SimpleSheet
      open={open}
      onClose={() => setOpen(false)}
      title="Change address (user sheet)"
      description="Opened through the URL. If it opens before the decision, the provider marks the visit busy."
    />
  );
}

/**
 * Header buttons, wired like flexipill-ui: address and coupons push their
 * key into the URL; Download App is not in the URL, so the click itself
 * calls markCartVisitBusy() (same as useHeaderHandlers.handleDownloadApp).
 */
export function CartHeader() {
  const [, openAddress] = useRouteOpenState(CART_SHEET_ROUTE_KEY.MANAGE_ADDRESS);
  const [, openCoupons] = useRouteOpenState(CART_SHEET_ROUTE_KEY.COUPONS);
  const [downloadOpen, setDownloadOpen] = useState(false);

  return (
    <header className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/5">
      <span className="font-semibold">Demo pharmacy</span>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => openAddress(true)}>
          Change address
        </Button>
        <Button variant="outline" size="sm" onClick={() => openCoupons(true)}>
          View coupons
        </Button>
        <Button
          size="sm"
          onClick={() => {
            markCartVisitBusy();
            setDownloadOpen(true);
          }}
        >
          Download App
        </Button>
      </div>
      <SimpleSheet
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        title="Download the app (non-URL modal)"
        description="Not in the URL, so the click itself marks the visit busy, like the real Download App button."
      />
    </header>
  );
}

const COLD_CHAIN_BLOCKER = 'cold_chain';

/**
 * Same arbiter wiring as useColdChainServiceability: a blocker while the
 * check runs, busy before the drawer opens when unserviceable.
 */
export function ColdChainCheck() {
  const arbitrated = useContext(CartPopupArbitrationContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [routeOpen, setRouteOpen] = useRouteOpenState(
    CART_SHEET_ROUTE_KEY.COLD_CHAIN_OPTIONS
  );
  const { enabled, checkMs, unserviceable } = scenario.coldChain;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    if (arbitrated) setCartPopupBlocker(COLD_CHAIN_BLOCKER, true);
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      if (unserviceable) {
        setDrawerOpen(true);
        if (arbitrated) markCartVisitBusy();
      }
      if (arbitrated) setCartPopupBlocker(COLD_CHAIN_BLOCKER, false);
    }, checkMs);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [arbitrated, enabled, checkMs, unserviceable]);

  // Like the real host: the drawer reaches the URL one render later.
  useEffect(() => {
    if (drawerOpen) setRouteOpen(true);
  }, [drawerOpen, setRouteOpen]);

  return (
    <SimpleSheet
      open={drawerOpen && routeOpen}
      onClose={() => {
        setDrawerOpen(false);
        setRouteOpen(false);
      }}
      title="Cold-chain options (system sheet)"
      description="This pincode can't take cold-chain items. Remove them or change the address."
    />
  );
}

/**
 * Redcliffe skips priority, but like flexipill-ui's host it opens only when
 * the arbiter allows it: no sheet open and no system check running.
 */
export function RedcliffeHost() {
  const [slotStatus, setSlotStatus] = useState<CartPopupStatus>('pending');
  const [open, setOpen] = useState(false);
  const canOpen = useCartPopupSlot(REDCLIFFE_POPUP, slotStatus);
  const openedRef = useRef(false);

  useEffect(() => {
    const { status, resolveAfterMs } = scenario.redcliffe;
    if (status === 'pending') return;
    const timer = window.setTimeout(() => setSlotStatus(status), resolveAfterMs);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!canOpen || openedRef.current) return;
    openedRef.current = true;
    setOpen(true);
  }, [canOpen]);

  // Like the real modal: closes itself after 3 seconds.
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setOpen(false), 3000);
    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <SimpleSheet
      open={open}
      onClose={() => setOpen(false)}
      title="RC10 applied (Redcliffe)"
      description="Partner coupon auto-applied. Opens only when no sheet is open and no system check is running; every other auto pop-up is suppressed and nothing is recorded."
    />
  );
}
