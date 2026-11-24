"use client"

import { ArrowDataTransferHorizontalIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  fetchBrandSubstitute,
  formatINR,
  type BrandSubstitute,
  type CartItem,
} from "@/lib/mock-cart-api"
import { cn } from "@/lib/utils"
import { IconBadge } from "./dialog-parts"
import { useDialogOnLoad, type DialogEvent } from "./use-dialog-on-load"

function MedicineCard({
  label,
  item,
  qty,
  highlight,
  badge,
}: {
  label: string
  item: Omit<CartItem, "qty">
  qty: number
  highlight?: boolean
  badge?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-2xl border px-4 py-3",
        highlight
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-border bg-muted/50"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        {badge && (
          <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
            {badge}
          </span>
        )}
      </div>
      <div className="font-medium">{item.name}</div>
      <div className="text-xs text-muted-foreground">
        {item.manufacturer} · {item.pack}
      </div>
      <div className="mt-1 flex items-baseline gap-2 tabular-nums">
        <span className="font-semibold">{formatINR(item.price * qty)}</span>
        <span className="text-xs text-muted-foreground">
          {formatINR(item.price)} × {qty}
        </span>
      </div>
    </div>
  )
}

export function ReplaceBrandDialog({
  items,
  onReplace,
  onEvent,
}: {
  items: CartItem[]
  onReplace: (offer: BrandSubstitute) => void
  onEvent?: (event: DialogEvent) => void
}) {
  const { data, open, close } = useDialogOnLoad(
    "Replace brand",
    fetchBrandSubstitute,
    { onEvent }
  )

  const original = data && items.find((item) => item.id === data.itemId)
  if (!data || !original) return null

  const { substitute } = data
  const savings = (original.price - substitute.price) * original.qty
  const savingsPct = Math.round((1 - substitute.price / original.price) * 100)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close("dismissed")
      }}
    >
      <DialogContent>
        <DialogHeader>
          <IconBadge
            icon={ArrowDataTransferHorizontalIcon}
            className="mb-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
          />
          <DialogTitle className="text-lg">
            Save {formatINR(savings)} with a substitute
          </DialogTitle>
          <DialogDescription>
            Same salt (
            <span className="font-medium text-foreground">
              {original.composition}
            </span>
            ) at the same strength, from a different manufacturer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <MedicineCard label="In your cart" item={original} qty={original.qty} />
          <MedicineCard
            label="Recommended"
            item={substitute}
            qty={original.qty}
            highlight
            badge={`Save ${savingsPct}%`}
          />
        </div>

        <DialogFooter className="*:sm:flex-1">
          <Button variant="outline" onClick={() => close("kept original")}>
            Keep original
          </Button>
          <Button
            className="bg-emerald-600 text-white hover:bg-emerald-600/85"
            onClick={() => {
              onReplace(data)
              close("replaced brand")
            }}
          >
            Replace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
