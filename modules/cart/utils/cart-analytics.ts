/** Same value as flexipill-ui: cart instrumentation goes to Metabase only. */
export const METABASE_ONLY_SOURCES = {
  ga: false,
  we: false,
  ct: false,
  mb: true,
} as const;
