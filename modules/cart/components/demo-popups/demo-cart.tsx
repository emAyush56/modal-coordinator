'use client';

import { ArbiterDebugPanel } from './arbiter-debug-panel';
import { CartAutoPopups } from './popup-hosts';
import {
  AddressSheet,
  CartHeader,
  ColdChainCheck,
  CouponsSheet,
  RedcliffeHost,
} from './system-sheets';

const ITEMS = [
  { name: 'Dolo 650 Tablet', price: 30 },
  { name: 'Pan 40 Tablet', price: 109 },
  { name: 'Vitamin D3 Sachet', price: 55 },
];

export function DemoCart() {
  const total = ITEMS.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="flex flex-1 justify-center bg-muted/40 px-4 py-8">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_380px]">
        <section className="flex flex-col gap-4">
          <CartHeader />
          <h1 className="text-2xl font-semibold">Cart</h1>
          <ul className="flex flex-col divide-y rounded-2xl bg-card ring-1 ring-foreground/5">
            {ITEMS.map((item) => (
              <li key={item.name} className="flex justify-between p-4">
                <span>{item.name}</span>
                <span className="font-medium">₹{item.price}</span>
              </li>
            ))}
            <li className="flex justify-between p-4 font-semibold">
              <span>To pay</span>
              <span>₹{total}</span>
            </li>
          </ul>
        </section>

        <aside>
          <ArbiterDebugPanel />
        </aside>
      </div>

      <CartAutoPopups />
      <RedcliffeHost />
      <CouponsSheet />
      <AddressSheet />
      <ColdChainCheck />
    </div>
  );
}
