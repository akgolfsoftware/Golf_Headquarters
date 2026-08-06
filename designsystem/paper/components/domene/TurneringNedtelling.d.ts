/**
 * Nedtelling til neste turnering: dager igjen som hero + navn + frist
 * (~5 skjermer — I dag, konsoll, turneringsplanlegger). daysLeft regnes av
 * konsumenten (Oslo-datologikk bor i appen). Ved 0: «I dag» i --up.
 * Chromeless — Panel eier flaten.
 */
export interface TurneringNedtellingProps {
  /** Hele dager igjen — regnet av konsumenten */
  daysLeft: number;
  name: string;
  /** «Srixon Tour #4 · Miklagard · 15.–16. august» */
  meta?: string;
  deadlineLabel?: string;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
