'use client';

import * as React from 'react';

import { useSearchParams } from 'next/navigation';

import {
  CART_ITEM_SHEET_ROUTE_KEY_PREFIXES,
  CART_SHEET_ROUTE_KEYS,
} from '../../utils/popup-arbitration/consts';
import {
  endCartVisit,
  markCartVisitBusy,
  startCartVisit,
} from '../../utils/popup-arbitration/store';

export const CartPopupArbitrationContext = React.createContext(false);

const isCartSheetKey = (key: string) =>
  CART_SHEET_ROUTE_KEYS.includes(key) ||
  CART_ITEM_SHEET_ROUTE_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));

function hasOpenSheet(searchParams: URLSearchParams) {
  let open = false;
  searchParams.forEach((value, key) => {
    if (value === 'true' && isCartSheetKey(key)) open = true;
  });
  return open;
}

export function CartPopupArbitrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const sheetOpen = hasOpenSheet(searchParams);

  React.useEffect(() => {
    startCartVisit();
    return endCartVisit;
  }, []);

  React.useEffect(() => {
    if (sheetOpen) markCartVisitBusy();
  }, [sheetOpen]);

  return (
    <CartPopupArbitrationContext.Provider value>
      {children}
    </CartPopupArbitrationContext.Provider>
  );
}
