'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { CartPopupType } from '../../utils/popup-arbitration/consts';

import { useDemoPopup } from './use-demo-popup';

const POPUP_COPY: Record<CartPopupType, { title: string; text: string }> = {
  reorder_brand_review: {
    title: '1. Reorder brand review',
    text: 'Some medicines from your reorder have a new brand.',
  },
  dynamic_coupon: {
    title: '2. Dynamic coupon',
    text: 'A time-limited offer was applied to your cart.',
  },
  edge_plus: {
    title: '3. Edge+',
    text: 'Join Edge+ and save more on this order.',
  },
  coins_auto_apply: {
    title: '4. Coins auto-applied',
    text: 'Your PRx coins were applied to this order.',
  },
};

/** One static pop-up that competes for the cart's single slot. */
function ArbitratedPopup({ type }: { type: CartPopupType }) {
  const { open, close } = useDemoPopup(type);
  const copy = POPUP_COPY[type];

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close('outside_tap')}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">{copy.title}</DialogTitle>
          <DialogDescription>{copy.text}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => close('dismiss')}>
            Not now
          </Button>
          <Button onClick={() => close('cta')}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CartAutoPopups() {
  return (
    <>
      <ArbitratedPopup type="reorder_brand_review" />
      <ArbitratedPopup type="dynamic_coupon" />
      <ArbitratedPopup type="edge_plus" />
      <ArbitratedPopup type="coins_auto_apply" />
    </>
  );
}
