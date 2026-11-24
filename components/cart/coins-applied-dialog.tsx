"use client"

import { Coins01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { fetchCoinsOffer, formatINR } from "@/lib/mock-cart-api"
import { BalanceRow, IconBadge } from "./dialog-parts"
import { useDialogOnLoad, type DialogEvent } from "./use-dialog-on-load"

export function CoinsAppliedDialog({
  onApply,
  onRemove,
  onEvent,
}: {
  onApply: (value: number) => void
  onRemove: () => void
  onEvent?: (event: DialogEvent) => void
}) {
  const { data, open, close } = useDialogOnLoad(
    "Coins auto-applied",
    fetchCoinsOffer,
    { onLoaded: (offer) => onApply(offer.value), onEvent }
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
            icon={Coins01Icon}
            className="mb-2 bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
          />
          <DialogTitle className="text-lg">
            {data.coinsApplied} coins auto-applied
          </DialogTitle>
          <DialogDescription>
            We used your coins to take{" "}
            <span className="font-medium text-foreground">
              {formatINR(data.value)}
            </span>{" "}
            off this order. 1 coin = ₹1.
          </DialogDescription>
        </DialogHeader>

        <BalanceRow
          label="Coin balance"
          from={String(data.balance)}
          to={String(data.balance - data.coinsApplied)}
        />

        <DialogFooter className="*:sm:flex-1">
          <Button
            variant="outline"
            onClick={() => {
              onRemove()
              close("removed coins")
            }}
          >
            Remove coins
          </Button>
          <Button onClick={() => close("kept coins")}>Great, continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
