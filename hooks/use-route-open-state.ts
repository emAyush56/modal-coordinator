/* eslint-disable import/no-unused-modules */
'use client';

import * as React from 'react';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

/**
 * Keys whose open state was created via `router.push` (or inherited via swap).
 * Closing those must `router.back()` so we don't leave an orphan history entry
 * (push + replace left users needing an extra system back to leave cart).
 *
 * Keys that arrived via a deep/direct URL (e.g. `?payment-failure=true`) are
 * not tracked — closing those uses `replace` so back doesn't leave the page.
 */
const pushedRouteOpenKeys = new Set<string>();

function transferPushedRouteOpenKey(fromKey: string, toKey: string) {
  if (!pushedRouteOpenKeys.has(fromKey)) return;
  pushedRouteOpenKeys.delete(fromKey);
  pushedRouteOpenKeys.add(toKey);
}

export function useRouteOpenState(
  key: string
): [boolean, React.Dispatch<React.SetStateAction<boolean>>, () => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const open = searchParams.get(key) === 'true';

  // Keep a ref so setOpen doesn't need `open` in its closure deps,
  // avoiding stale-value bugs when called rapidly (e.g. trigger click).
  const openRef = React.useRef(open);
  openRef.current = open;

  // Clear ownership only on true → false (system back / external URL change).
  // Do not clear whenever `open` is false — that races with setOpen(true),
  // which marks the key before searchParams have caught up.
  const prevOpenRef = React.useRef(open);
  const pendingCloseRef = React.useRef(false);
  React.useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;
    if (wasOpen && !open) {
      pushedRouteOpenKeys.delete(key);
      pendingCloseRef.current = false;
    }
  }, [open, key]);

  const closeReplace = React.useCallback(() => {
    if (!openRef.current) return;
    // TODO: Use Nuqs
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [key, pathname, router, searchParams]);

  const setOpen = React.useCallback<
    React.Dispatch<React.SetStateAction<boolean>>
  >(
    (value) => {
      const next =
        typeof value === 'function'
          ? (value as (prev: boolean) => boolean)(openRef.current)
          : value;

      if (next === openRef.current) return;

      if (next) {
        // TODO: replace with nuqs if we use in future to save component memory it is cheap but it is.
        pendingCloseRef.current = false;
        const params = new URLSearchParams(searchParams);
        params.set(key, 'true');
        pushedRouteOpenKeys.add(key);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
        return;
      }

      // Ignore duplicate closes while back/replace is in flight (openRef is
      // reset from searchParams each render, so it can still look "open").
      if (pendingCloseRef.current) return;
      pendingCloseRef.current = true;

      // We pushed (or inherited a push via swap) — pop that entry.
      if (pushedRouteOpenKeys.has(key)) {
        pushedRouteOpenKeys.delete(key);
        router.back();
        return;
      }

      // Deep/direct URL open: strip the key in place. Using back() here would
      // leave the page (e.g. payment → /cart?payment-failure=true).
      const params = new URLSearchParams(searchParams);
      params.delete(key);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [key, pathname, router, searchParams]
  );

  return [open, setOpen, closeReplace];
}

/** Atomically close one route drawer and open another without history races. */
export function useSwapRouteOpenState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return React.useCallback(
    (closeKey: string, openKey: string) => {
      // Keep a single history entry: the replacement drawer owns the push.
      transferPushedRouteOpenKey(closeKey, openKey);
      const params = new URLSearchParams(searchParams);
      params.delete(closeKey);
      params.set(openKey, 'true');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );
}
