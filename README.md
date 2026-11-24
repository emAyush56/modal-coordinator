# Cart pop-up arbiter demo

An add-on demo at `/race`: a dummy cart with four competing auto pop-ups, run
through the **same arbiter code as flexipill-ui** (PRX-I6218). The original
race demo at `/cart` is unchanged. The arbiter files are copied byte-for-byte;
`pnpm parity` proves it.

## Run

```bash
pnpm install
pnpm dev            # arbiter demo: http://localhost:3000/race  (Cart button → /race/cart)
                    # original race demo (no arbiter): http://localhost:3000/cart
pnpm parity         # diff the arbiter files against ../flexipill-ui
```

## Change the scenario

Edit `mock/popup-scenario.json`, save, then click **Reset + re-run** in the
"Arbiter debug" panel (clears the 3-day cool-off and the session count, then
reloads). **Re-run** reloads without clearing them, to test cool-off / session cap.

| Field | Meaning |
|---|---|
| `popups.<type>.status` | What the host reports: `eligible`, `ineligible`, or `pending` (never resolves) |
| `popups.<type>.resolveAfterMs` | How long the host stays `pending` first |
| `popups.<type>.autoCloseMs` | Auto-close time (`auto_close` action), or `null` |
| `redcliffe.status` | `eligible` opens the Redcliffe modal and suppresses everyone |
| `coldChain` | `enabled`, `checkMs` (blocker time), `unserviceable` (busy) |
| `openSheetAfterMs` | Opens the coupons sheet (`?coupons=true`) at this time, or `null` |

Priority: `reorder_brand_review` > `dynamic_coupon` > `edge_plus` > `coins_auto_apply`.

## What is shared and what is demo-only

- **Same as flexipill-ui:** `modules/cart/utils/popup-arbitration/*`,
  `modules/cart/components/popup-arbitration/provider.tsx`,
  `modules/cart/hooks/use-cart-popup-slot.ts`, `hooks/use-route-open-state.ts`,
  `consts/route-open-keys.ts`, `utils/storageUtils.js`.
- **Demo stand-ins:** `store/cartStore.ts`, `utils/customWebEvent.ts` (logs to the
  panel instead of Metabase), `utils/runtimeContext.ts` (always web),
  `utils/appWebview/WebViewPRx/hashParams.ts`, `modules/cart/utils/cart-analytics.ts`.
- **Demo hosts:** `modules/cart/components/demo-popups/*` follow the real hosts'
  pattern: start `pending`, report the scenario status, open only when granted.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
