'use client';

import * as React from 'react';

import { CartPopupArbitrationContext } from '../components/popup-arbitration/provider';
import type {
  CartPopupCandidate,
  CartPopupStatus,
} from '../utils/popup-arbitration/consts';
import {
  setCartPopupStatus,
  useCartPopupArbitrationStore,
} from '../utils/popup-arbitration/store';

export const useCartPopupSlot = (
  type: CartPopupCandidate,
  status: CartPopupStatus
): boolean => {
  const arbitrated = React.useContext(CartPopupArbitrationContext);
  const granted = useCartPopupArbitrationStore(
    (state) => state.granted === type
  );

  React.useEffect(() => {
    if (arbitrated) setCartPopupStatus(type, status);
  }, [arbitrated, type, status]);

  React.useEffect(() => {
    if (!arbitrated) return;
    return () => setCartPopupStatus(type, null);
  }, [arbitrated, type]);

  return arbitrated ? granted : status === 'eligible';
};
