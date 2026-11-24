'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getDemoAnalyticsEvents,
  subscribeDemoAnalytics,
  type DemoAnalyticsEvent,
} from '@/utils/customWebEvent';

import {
  DEFAULT_CART_POPUP_CONFIG,
  REDCLIFFE_POPUP,
} from '../../utils/popup-arbitration/consts';
import { useCartPopupArbitrationStore } from '../../utils/popup-arbitration/store';

import { scenario } from './scenario';

const LAST_SHOWN_KEY = 'cartPopupLastShownAt';
const SESSION_KEY = 'cartPopupSession';
const NO_EVENTS: DemoAnalyticsEvent[] = [];

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-700',
  eligible: 'bg-emerald-500/15 text-emerald-700',
  ineligible: 'bg-zinc-500/15 text-zinc-600',
};

function readStorage() {
  const shownAt = Number(localStorage.getItem(LAST_SHOWN_KEY));
  const hoursLeft =
    shownAt > 0
      ? DEFAULT_CART_POPUP_CONFIG.cooloffHours -
        (Date.now() - shownAt) / 3_600_000
      : 0;
  return {
    cooloff: hoursLeft > 0 ? `${hoursLeft.toFixed(1)}h left` : 'none',
    session: sessionStorage.getItem(SESSION_KEY) ?? '0',
  };
}

export function ArbiterDebugPanel() {
  const state = useCartPopupArbitrationStore();
  const events = useSyncExternalStore(
    subscribeDemoAnalytics,
    getDemoAnalyticsEvents,
    () => NO_EVENTS
  );
  const [storage, setStorage] = useState({ cooloff: '…', session: '…' });

  useEffect(() => {
    const tick = () => setStorage(readStorage());
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, []);

  const resetAndRerun = () => {
    localStorage.removeItem(LAST_SHOWN_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = '/cart';
  };

  const rows = [...state.config.priority, REDCLIFFE_POPUP] as const;

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-dashed border-violet-500/40 bg-violet-500/5 p-5 text-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-medium">Arbiter debug</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = '/cart')}
          >
            Re-run
          </Button>
          <Button size="sm" onClick={resetAndRerun}>
            Reset + re-run
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-xs">
        <span className="text-muted-foreground">active</span>
        <span>{String(state.active)}</span>
        <span className="text-muted-foreground">busy</span>
        <span className={cn(state.busy && 'font-semibold text-red-600')}>
          {String(state.busy)}
        </span>
        <span className="text-muted-foreground">blockers</span>
        <span>{Object.keys(state.blockers).join(', ') || '—'}</span>
        <span className="text-muted-foreground">granted</span>
        <span className="font-semibold text-emerald-700">
          {state.granted ?? '—'}
        </span>
        <span className="text-muted-foreground">cool-off (72h)</span>
        <span>{storage.cooloff}</span>
        <span className="text-muted-foreground">session count</span>
        <span>
          {storage.session} / {state.config.sessionCap}
        </span>
      </div>

      <ol className="flex flex-col gap-1 font-mono text-xs">
        {rows.map((type, index) => {
          const status = state.statuses[type];
          return (
            <li key={type} className="flex items-center justify-between">
              <span>
                {type === REDCLIFFE_POPUP ? '★' : `${index + 1}.`} {type}
              </span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5',
                  status ? STATUS_STYLE[status] : 'text-muted-foreground'
                )}
              >
                {status ?? 'not reported'}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-medium">Analytics events</h3>
        <ol className="flex max-h-56 flex-col gap-1 overflow-auto font-mono text-xs">
          {events.length === 0 && (
            <li className="text-muted-foreground">No events yet…</li>
          )}
          {events.map((event) => (
            <li key={event.id} className="flex gap-2">
              <span className="w-12 shrink-0 text-right text-muted-foreground">
                {event.at}ms
              </span>
              <span className="min-w-0 break-all">
                <span className="font-semibold">
                  {event.eventName.replace('cart_popup_', '')}
                </span>{' '}
                {String(event.data.popup_type)}
                {'reason' in event.data && ` · ${String(event.data.reason)}`}
                {'action' in event.data && ` · ${String(event.data.action)}`}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer font-medium">
          Scenario (mock/popup-scenario.json)
        </summary>
        <pre className="mt-2 overflow-auto rounded-xl bg-muted p-3">
          {JSON.stringify(scenario, null, 2)}
        </pre>
      </details>

    </div>
  );
}
