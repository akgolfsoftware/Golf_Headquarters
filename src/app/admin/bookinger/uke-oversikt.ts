/** Uka øverst i AG-06 Booking (designløftet 20.10): bookinger per dag de neste sju dagene og fordelingen på betalingsmåte. */
import type { AG06Booking } from "./data";

const BET_REKKE = ["Betalt", "Klipp", "Faktura", "Gratis", "Ikke betalt"] as const;
const BET_NAVN: Record<(typeof BET_REKKE)[number], string> = { Betalt: "Stripe", Klipp: "Klipp", Faktura: "Faktura", Gratis: "Gratis", "Ikke betalt": "Ikke betalt" };

/** Uka fra i dag: bookinger per dag (ikke avlyste) og fordelingen på betalingsmåte. */
export function ukeOversikt(bookinger: readonly AG06Booking[], naaMs: number) {
  const dag0 = Math.floor(naaMs / 86_400_000) * 86_400_000;
  const dager = Array.from({ length: 7 }, (_, i) => ({ fra: dag0 + i * 86_400_000, antall: 0, navn: "" }));
  const bet: Record<string, number> = {};
  for (const b of bookinger) {
    if (b.st === "Avlyst") continue;
    const i = Math.floor((b.startMs - dag0) / 86_400_000);
    if (i < 0 || i > 6) continue;
    dager[i].antall++;
    if (!dager[i].navn) dager[i].navn = b.ukedag;
    bet[b.pay] = (bet[b.pay] ?? 0) + 1;
  }
  return { dager, betaling: BET_REKKE.filter((k) => bet[k]).map((k) => ({ navn: BET_NAVN[k], antall: bet[k] })), totalt: dager.reduce((s, d) => s + d.antall, 0) };
}

