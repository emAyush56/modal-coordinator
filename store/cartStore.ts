// Demo stand-in for flexipill-ui's `@/store/cartStore`. The arbiter's
// analytics only reads `edge.state` and `priceDetails.totalAmountToBePaid`.
import { create } from 'zustand';

type DemoCartState = {
  edge: { state: string } | null;
  priceDetails: { totalAmountToBePaid: number };
};

const useCartStore = create<DemoCartState>(() => ({
  edge: { state: 'EXPIRING_SOON' },
  priceDetails: { totalAmountToBePaid: 428 },
}));

export default useCartStore;
