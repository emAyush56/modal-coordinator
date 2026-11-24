#!/usr/bin/env bash
# Proves the arbiter code here is the same as flexipill-ui's.
# Usage: pnpm parity   (or FLEXIPILL_UI=/path/to/flexipill-ui pnpm parity)
set -u
SRC="${FLEXIPILL_UI:-../flexipill-ui}/src"
FILES=(
  modules/cart/utils/popup-arbitration/consts.ts
  modules/cart/utils/popup-arbitration/storage.ts
  modules/cart/utils/popup-arbitration/analytics.ts
  modules/cart/utils/popup-arbitration/store.ts
  modules/cart/components/popup-arbitration/provider.tsx
  modules/cart/hooks/use-cart-popup-slot.ts
  hooks/use-route-open-state.ts
  consts/route-open-keys.ts
  utils/storageUtils.js
)
status=0
for f in "${FILES[@]}"; do
  if diff -q "$SRC/$f" "$f" >/dev/null 2>&1; then
    echo "same     $f"
  else
    echo "DIFFERS  $f"; status=1
  fi
done
exit $status
