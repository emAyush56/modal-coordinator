import * as React from "react";
import { CartPopupArbitrationProvider } from "@/modules/cart/components/popup-arbitration/provider";

// Same wiring as flexipill-ui's src/app/cart/layout.tsx.
export default function CartLayout({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense>
      <CartPopupArbitrationProvider>{children}</CartPopupArbitrationProvider>
    </React.Suspense>
  );
}
