import rawScenario from '@/mock/popup-scenario.json';

import type {
  CartPopupStatus,
  CartPopupType,
} from '../../utils/popup-arbitration/consts';

export type DemoPopupConfig = {
  /** What the host reports once it has "worked it out". `pending` never resolves. */
  status: CartPopupStatus;
  /** How long the host stays `pending` before reporting `status`. */
  resolveAfterMs: number;
  /** Close the pop-up by itself after this long (`auto_close`), or never. */
  autoCloseMs: number | null;
};

export type DemoScenario = {
  popups: Record<CartPopupType, DemoPopupConfig>;
  redcliffe: { status: CartPopupStatus; resolveAfterMs: number };
  coldChain: { enabled: boolean; checkMs: number; unserviceable: boolean };
  /** Opens the coupons sheet (a URL sheet) at this time, or never. */
  openSheetAfterMs: number | null;
};

export const scenario = rawScenario as DemoScenario;
