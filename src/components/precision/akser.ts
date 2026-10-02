import type { Akse } from "./pa";

/** Rene verdier og formatering som kan brukes både på server og i nettleser. */
export const AKSER: readonly Akse[] = ["fys", "tek", "slag", "spill", "turn"];

export function akseFra(pyramide: string | null | undefined): Akse | null {
  const a = (pyramide ?? "").toLowerCase();
  return (AKSER as readonly string[]).includes(a) ? (a as Akse) : null;
}
