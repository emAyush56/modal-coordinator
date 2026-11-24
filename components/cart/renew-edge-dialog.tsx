"use client"

import { CrownIcon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
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
  fetchEdgeMembership,
  formatINR,
  type EdgeMembership,
} from "@/lib/mock-cart-api"
import { IconBadge } from "./dialog-parts"
import { useDialogOnLoad, type DialogEvent } from "./use-dialog-on-load"

export function RenewEdgeDialog({
  onRenew,
  onEvent,
}: {
  onRenew: (membership: EdgeMembership) => void
  onEvent?: (event: DialogEvent) => void
}) {
  const { data, open, close } = useDialogOnLoad(
    "Renew Edge membership",
    fetchEdgeMembership,
    { onEvent }
  )

  if (!data) return null

  const savingsPct = Math.round((1 - data.renewPrice / data.mrp) * 100)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close("dismissed")
      }}
    >
      <DialogContent className="overflow-hidden p-0">
        <div className="bg-linear-to-br from-violet-500/20 via-violet-500/5 to-transparent px-6 pt-6 pb-2">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <IconBadge
                icon={CrownIcon}
                className="bg-violet-600 text-white dark:bg-violet-500"
              />
              <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400">
                Expires in {data.expiresInDays} days
              </span>
            </div>
            <DialogTitle className="mt-3 text-lg">
              Don&apos;t lose your Edge benefits
            </DialogTitle>
            <DialogDescription>
              Renew now to keep saving on this order and every order after it.
            </DialogDescription>
          </DialogHeader>
        </div>

        <ul className="flex flex-col gap-3 px-6">
          {data.benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3">
              <span className="flex size-5 items-center justify-center rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400">
                <HugeiconsIcon icon={Tick02Icon} strokeWidth={2.5} className="size-3" />
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        <div className="mx-6 flex items-end justify-between rounded-2xl border border-violet-500/30 bg-violet-500/5 px-4 py-3">
          <div>
            <div className="text-xs text-muted-foreground">
              {data.durationMonths} months plan
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold tabular-nums">
                {formatINR(data.renewPrice)}
              </span>
              <span className="text-muted-foreground line-through tabular-nums">
                {formatINR(data.mrp)}
              </span>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            {savingsPct}% off
          </span>
        </div>

        <DialogFooter className="px-6 pb-6 *:sm:flex-1">
          <Button variant="outline" onClick={() => close("not now")}>
            Not now
          </Button>
          <Button
            className="bg-violet-600 text-white hover:bg-violet-600/85 dark:bg-violet-500 dark:hover:bg-violet-500/85"
            onClick={() => {
              onRenew(data)
              close("renewed")
            }}
          >
            Renew for {formatINR(data.renewPrice)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
