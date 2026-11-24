"use client";

import { useEffect, useRef, useState } from "react";
import {
  CrownIcon,
  Delete02Icon,
  Medicine02Icon,
  MinusSignIcon,
  PlusSignIcon,
  RepeatIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  formatINR,
  initialCartItems,
  type BrandSubstitute,
  type CartItem,
} from "@/lib/mock-cart-api";
import { cn } from "@/lib/utils";
import { CashAppliedDialog } from "./cash-applied-dialog";
import { CoinsAppliedDialog } from "./coins-applied-dialog";
import { RenewEdgeDialog } from "./renew-edge-dialog";
import { ReplaceBrandDialog } from "./replace-brand-dialog";
import type { DialogEvent } from "./use-dialog-on-load";

type LogEntry = DialogEvent & { id: number; at: number };

const EDGE_DISCOUNT = 0.05;

export function CartView() {
  const [runId, setRunId] = useState(0);
  const [items, setItems] = useState<CartItem[]>(initialCartItems);
  const [coins, setCoins] = useState(0);
  const [cash, setCash] = useState(0);
  const [edge, setEdge] = useState<{ fee: number; label: string }>({
    fee: 0,
    label: "Expires in 3 days",
  });
  const [log, setLog] = useState<LogEntry[]>([]);
  const runStartedAt = useRef(0);
  const nextLogId = useRef(0);

  useEffect(() => {
    runStartedAt.current = performance.now();
  }, []);

  function record(event: DialogEvent) {
    const entry: LogEntry = {
      ...event,
      id: nextLogId.current++,
      at: Math.round(performance.now() - runStartedAt.current),
    };
    setLog((prev) => [...prev, entry]);
  }

  function rerun() {
    setItems(initialCartItems);
    setCoins(0);
    setCash(0);
    setEdge({ fee: 0, label: "Expires in 3 days" });
    setLog([]);
    runStartedAt.current = performance.now();
    setRunId((id) => id + 1);
  }

  function updateQty(id: string, delta: number) {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item,
        )
        .filter((item) => item.qty > 0),
    );
  }

  function replaceBrand({ itemId, substitute }: BrandSubstitute) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...substitute, qty: item.qty } : item,
      ),
    );
  }

  const mrpTotal = items.reduce((sum, i) => sum + i.mrp * i.qty, 0);
  const priceTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const edgeSavings = Math.round(priceTotal * EDGE_DISCOUNT);
  const payable = Math.max(
    0,
    priceTotal - edgeSavings - coins - cash + edge.fee,
  );
  const openCount = countOpen(log);

  return (
    <div className="flex flex-1 justify-center bg-muted/40 px-4 py-8 sm:py-12">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_360px]">
        <section className="flex flex-col gap-4">
          <header className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Cart</h1>
              <p className="text-sm text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-300">
              <HugeiconsIcon
                icon={CrownIcon}
                strokeWidth={2}
                className="size-3.5"
              />
              Edge · {edge.label}
            </div>
          </header>

          <ul className="flex flex-col divide-y rounded-3xl bg-card ring-1 ring-foreground/5">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 p-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <HugeiconsIcon
                    icon={Medicine02Icon}
                    strokeWidth={1.6}
                    className="size-6"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate font-medium">{item.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {item.composition} · {item.pack}
                  </span>
                  <span className="mt-1 flex items-baseline gap-2 text-sm tabular-nums">
                    <span className="font-semibold">
                      {formatINR(item.price)}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      {formatINR(item.mrp)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1 self-center rounded-full bg-muted p-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={
                      item.qty === 1
                        ? `Remove ${item.name}`
                        : `Decrease ${item.name}`
                    }
                    onClick={() => updateQty(item.id, -1)}
                  >
                    <HugeiconsIcon
                      icon={item.qty === 1 ? Delete02Icon : MinusSignIcon}
                      strokeWidth={2}
                    />
                  </Button>
                  <span className="w-5 text-center text-sm font-medium tabular-nums">
                    {item.qty}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Increase ${item.name}`}
                    onClick={() => updateQty(item.id, 1)}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="flex flex-col gap-4 lg:pt-14">
          <div className="flex flex-col gap-3 rounded-3xl bg-card p-5 text-sm ring-1 ring-foreground/5">
            <h2 className="font-medium">Bill summary</h2>
            <BillRow label="Item total (MRP)" value={formatINR(mrpTotal)} />
            <BillRow
              label="Product discount"
              value={`−${formatINR(mrpTotal - priceTotal)}`}
              positive
            />
            <BillRow
              label="Edge savings (5%)"
              value={`−${formatINR(edgeSavings)}`}
              positive
            />
            {coins > 0 && (
              <BillRow label="Coins" value={`−${formatINR(coins)}`} positive />
            )}
            {cash > 0 && (
              <BillRow
                label="Wallet cash"
                value={`−${formatINR(cash)}`}
                positive
              />
            )}
            {edge.fee > 0 && (
              <BillRow label="Edge renewal" value={formatINR(edge.fee)} />
            )}
            <BillRow label="Delivery" value="Free" positive />
            <div className="mt-1 flex items-center justify-between border-t pt-3 text-base font-semibold tabular-nums">
              <span>To pay</span>
              <span>{formatINR(payable)}</span>
            </div>
            <Button size="lg" className="mt-1 w-full">
              Proceed to checkout
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-dashed border-amber-500/40 bg-amber-500/5 p-5 text-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Dialog race log</h2>
              <Button variant="outline" size="sm" onClick={rerun}>
                <HugeiconsIcon
                  icon={RepeatIcon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Re-run
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Four dialogs each fetch on load and open as soon as their own
              response lands, with no coordination.{" "}
              <span
                className={cn(
                  "font-medium",
                  openCount > 1
                    ? "text-red-600 dark:text-red-400"
                    : "text-foreground",
                )}
              >
                {openCount} open right now.
              </span>
            </p>
            <ol className="flex flex-col gap-1.5 font-mono text-xs">
              {log.length === 0 && (
                <li className="text-muted-foreground">
                  Waiting for responses…
                </li>
              )}
              {log.map((entry) => (
                <li key={entry.id} className="flex gap-2">
                  <span className="w-14 shrink-0 text-right text-muted-foreground tabular-nums">
                    {entry.at}ms
                  </span>
                  <span
                    className={cn(
                      "w-11 shrink-0 font-semibold",
                      entry.type === "open"
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {entry.type}
                  </span>
                  <span className="min-w-0">
                    {entry.dialog}
                    {entry.detail && (
                      <span className="text-muted-foreground">
                        {" "}
                        · {entry.detail}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      {/* All four mount together and race each other to open. */}
      <div key={runId}>
        <CoinsAppliedDialog
          onApply={setCoins}
          onRemove={() => setCoins(0)}
          onEvent={record}
        />
        <RenewEdgeDialog
          onRenew={(membership) =>
            setEdge({
              fee: membership.renewPrice,
              label: `Renewed till ${membership.renewedTill}`,
            })
          }
          onEvent={record}
        />
        <ReplaceBrandDialog
          items={items}
          onReplace={replaceBrand}
          onEvent={record}
        />
        <CashAppliedDialog
          onApply={setCash}
          onRemove={() => setCash(0)}
          onEvent={record}
        />
      </div>
    </div>
  );
}

function BillRow({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between tabular-nums">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(positive && "text-emerald-600 dark:text-emerald-400")}
      >
        {value}
      </span>
    </div>
  );
}

function countOpen(log: LogEntry[]) {
  const open = new Set<string>();
  for (const entry of log) {
    if (entry.type === "open") open.add(entry.dialog);
    else open.delete(entry.dialog);
  }
  return open.size;
}
