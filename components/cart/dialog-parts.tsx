import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { cn } from "@/lib/utils"

export function IconBadge({
  icon,
  className,
}: {
  icon: IconSvgElement
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex size-12 items-center justify-center rounded-2xl",
        className
      )}
    >
      <HugeiconsIcon icon={icon} strokeWidth={1.8} className="size-6" />
    </div>
  )
}

export function BalanceRow({
  label,
  from,
  to,
}: {
  label: string
  from: string
  to: string
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 font-medium tabular-nums">
        <span className="text-muted-foreground line-through">{from}</span>
        <span aria-hidden>→</span>
        <span>{to}</span>
      </span>
    </div>
  )
}
