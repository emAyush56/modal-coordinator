"use client"

import { useEffect, useEffectEvent, useState } from "react"

export type DialogEvent = {
  dialog: string
  type: "open" | "close"
  detail?: string
}

/**
 * Fires `request` on mount and opens the dialog as soon as it resolves.
 * Each dialog uses this on its own, with no shared coordination, which is
 * the race condition the cart page reproduces.
 */
export function useDialogOnLoad<T>(
  name: string,
  request: () => Promise<T>,
  options: {
    onLoaded?: (data: T) => void
    onEvent?: (event: DialogEvent) => void
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [open, setOpen] = useState(false)

  const handleLoaded = useEffectEvent((result: T, elapsedMs: number) => {
    options.onLoaded?.(result)
    options.onEvent?.({
      dialog: name,
      type: "open",
      detail: `response after ${elapsedMs}ms`,
    })
  })

  useEffect(() => {
    let cancelled = false
    const startedAt = performance.now()

    request().then((result) => {
      if (cancelled) return
      setData(result)
      setOpen(true)
      handleLoaded(result, Math.round(performance.now() - startedAt))
    })

    return () => {
      cancelled = true
    }
  }, [request])

  function close(reason: string) {
    setOpen(false)
    options.onEvent?.({ dialog: name, type: "close", detail: reason })
  }

  return { data, open, close }
}
