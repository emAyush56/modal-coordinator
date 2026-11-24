// Demo stand-in for flexipill-ui's `@/utils/customWebEvent`. Instead of
// sending to Metabase it logs the event and keeps it for the debug panel.
export type DemoAnalyticsEvent = {
  id: number;
  at: number;
  eventName: string;
  data: Record<string, unknown>;
};

const listeners = new Set<() => void>();
let events: DemoAnalyticsEvent[] = [];
let nextId = 0;

export const customWebEvent = (
  eventName: string,
  data: Record<string, unknown>,
  _sources?: unknown
) => {
  const event = {
    id: nextId++,
    at: Math.round(performance.now()),
    eventName,
    data,
  };
  events = [...events, event];
  console.info('[analytics]', eventName, data);
  listeners.forEach((listener) => listener());
};

export const getDemoAnalyticsEvents = () => events;

export const subscribeDemoAnalytics = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
