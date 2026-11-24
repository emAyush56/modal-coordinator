"use client"

import { MoneyBag02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { fetchCashOffer, formatINR } from "@/lib/mock-cart-api"
import { BalanceRow, IconBadge } from "./dialog-parts"
import { useDialogOnLoad, type DialogEvent } from "./use-dialog-on-load"

export function CashAppliedDialog({
  onApply,
  onRemove,
  onEvent,
}: {
  onApply: (amount: number) => void
  onRemove: () => void
  onEvent?: (event: DialogEvent) => void
}) {
  const { data, open, close } = useDialogOnLoad(
    "Cash auto-applied",
    fetchCashOffer,
    { onLoaded: (offer) => onApply(offer.amount), onEvent }
  )

  if (!data) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close("dismissed")
      }}
    >
      <DialogContent>
        <DialogHeader className="items-center text-center">
          <IconBadge
            icon={MoneyBag02Icon}
            className="mb-2 bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400"
          />
          <DialogTitle className="text-lg">
            {formatINR(data.amount)} cash applied
          </DialogTitle>
          <DialogDescription>
            Your wallet cash expires on{" "}
            <span className="font-medium text-foreground">
              {data.expiresOn}
            </span>
            , so we applied it to this order before it runs out.
          </DialogDescription>
        </DialogHeader>

        <BalanceRow
          label="Wallet cash"
          from={formatINR(data.balance)}
          to={formatINR(data.balance - data.amount)}
        />

        <DialogFooter className="*:sm:flex-1">
          <Button
            variant="outline"
            onClick={() => {
              onRemove()
              close("removed cash")
            }}
          >
            Don&apos;t use cash
          </Button>
          <Button onClick={() => close("kept cash")}>Okay</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
