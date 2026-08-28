/**
 * Økonomiflate (EC-01 / C10) — rene visningsregler.
 *
 * FORFALT er eneste danger-farge. «Forfalt» kommer fra Stripe-status ved
 * visning (PAST_DUE / FAILED). Invoice-modell mangler — vi gjetter ikke
 * forfallsdato. Tripletex-tall som mangler vises som «mangler».
 */

export type FakturaStatusVisning = "Betalt" | "Sendt" | "Forfalt";

export type StripePaymentStatus =
  | "SUCCEEDED"
  | "PENDING"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export function fakturaStatusFraStripe(input: {
  paymentStatus?: StripePaymentStatus | null;
  subscriptionStatus?: string | null;
}): FakturaStatusVisning {
  if (input.subscriptionStatus === "PAST_DUE") return "Forfalt";
  switch (input.paymentStatus) {
    case "FAILED":
      return "Forfalt";
    case "SUCCEEDED":
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      return "Betalt";
    case "PENDING":
      return "Sendt";
    default:
      return "Sendt";
  }
}

export function erForfalt(status: FakturaStatusVisning): boolean {
  return status === "Forfalt";
}

/** Norsk kronebeløp med to desimaler. null = «mangler», aldri 0,00. */
export function fmtKrNb(kr: number | null | undefined): string {
  if (kr == null || !Number.isFinite(kr)) return "mangler";
  return `${new Intl.NumberFormat("nb-NO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(kr)} kr`;
}

export function ytdAvvik(
  budsjettKr: number | null,
  resultatKr: number | null,
): { kr: number; pct: number } | null {
  if (budsjettKr == null || resultatKr == null) return null;
  if (!Number.isFinite(budsjettKr) || !Number.isFinite(resultatKr)) return null;
  if (budsjettKr === 0) return null;
  return { kr: resultatKr - budsjettKr, pct: ((resultatKr - budsjettKr) / budsjettKr) * 100 };
}

export function ytdAvvikTekst(avvik: { kr: number; pct: number } | null): string {
  if (!avvik) return "mangler";
  const plus = avvik.kr > 0;
  const minus = avvik.kr < 0;
  const fortegn = plus ? "+" : minus ? "−" : "";
  const kr = fmtKrNb(Math.abs(avvik.kr));
  const pct = Math.abs(avvik.pct).toFixed(1).replace(".", ",");
  const retning = avvik.kr >= 0 ? "over budsjett" : "under budsjett";
  return `${fortegn}${kr} · ${fortegn}${pct} % ${retning}`;
}

/** Andel av den største YTD-linjen, til progresjonsbar. Mangler = null. */
export function ytdBarPct(verdi: number | null, tak: number | null): number | null {
  if (verdi == null || tak == null || tak <= 0) return null;
  return Math.max(0, Math.min(100, (verdi / tak) * 100));
}

export function klippBrukt(monthlyCredits: number, creditsRemaining: number): number {
  const totalt = Math.max(0, monthlyCredits);
  const igjen = Math.max(0, creditsRemaining);
  return Math.min(totalt, Math.max(0, totalt - igjen));
}

/** Fylte prikker først. totalt 0 = ingen prikker (ikke et oppdiktet 10-klipp). */
export function klippPrikker(brukt: number, totalt: number, maks = 12): boolean[] {
  const n = Math.min(Math.max(totalt, 0), maks);
  const fylt = Math.min(Math.max(brukt, 0), n);
  return Array.from({ length: n }, (_, i) => i < fylt);
}

export function oreTilKr(ore: number | null | undefined): number | null {
  if (ore == null || !Number.isFinite(ore)) return null;
  return ore / 100;
}
