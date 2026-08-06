/**
 * Vertikal tidslinje for forløp — øktlogg, testhistorikk, agentkjøringer,
 * live-øktens hendelser (~10 skjermer). Ren VISNING: radene er ikke treffmål.
 * IKKE AgendaRow (klikkbar kronologisk rad) og IKKE Stepper (flersteg-flyt
 * fremover) — Tidslinje ser BAKOVER på det som har skjedd.
 */
export interface TidslinjeItem {
  id?: string;
  /** «09:41» eller «3. aug» */
  time: string;
  title: string;
  /** Prosa (Lora) — én–to setninger */
  body?: string;
  /** Mono-verdi: «+0,8 SG · 74 slag» */
  value?: string;
  /** Toner prikken — aldri teksten */
  tone?: "up" | "dn" | "info" | "naa";
}
export interface TidslinjeProps {
  items: TidslinjeItem[];
  dense?: boolean;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
