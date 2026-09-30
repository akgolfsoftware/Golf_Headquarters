/** Syntetiske bookingdata til skjermprøvene BK-01 til BK-03. Ingen ekte kunder. */
import type { BkAbonnement, BkTjeneste } from "@/components/booking/precision/BookingFlyt";
import type { LedigDag } from "@/app/(marketing)/booking/ledige-tider";

export const tjenester: BkTjeneste[] = [
  { slug: "drop-in", navn: "Drop-in range", coach: null, pris: 250, varighetMin: 30, beskrivelse: "Kort økt på range. Delt økt, pris per spiller." },
  { slug: "flex-50", navn: "Flex 50 min", coach: "Anders", pris: 850, varighetMin: 50, beskrivelse: "Nok tid til å måle, se på tallene og legge en plan." },
  { slug: "privat-60", navn: "Privattime 60 min med et langt navn som må brytes riktig", coach: "Anders", pris: 1200, varighetMin: 60, beskrivelse: null },
];

export const abonnement: BkAbonnement[] = [
  { slug: "performance", navn: "Performance", pris: 2900, beskrivelse: "Fire klipp per måned." },
];

const dag = (dw: string, dd: string, navn: string, kl: string[]): LedigDag => ({
  dw, dd, navn, tider: kl.map((k) => ({ kl: k, startIso: `2026-09-${dd.split(".")[0].padStart(2, "0")}T${k}:00`, coachId: "c1" })),
});

export const dager: LedigDag[] = [
  dag("tir", "29.9", "tirsdag 29. september", ["15:00", "16:00", "17:00"]),
  dag("ons", "30.9", "onsdag 30. september", ["15:00", "18:00"]),
  dag("tor", "1.10", "torsdag 1. oktober", []),
  dag("fre", "2.10", "fredag 2. oktober", ["09:00", "10:00", "11:00", "12:00", "13:00"]),
  dag("lør", "3.10", "lørdag 3. oktober", ["10:00"]),
  dag("søn", "4.10", "søndag 4. oktober", []),
  dag("man", "5.10", "mandag 5. oktober", ["17:00", "18:00"]),
];

export const ingenDager: LedigDag[] = dager.map((d) => ({ ...d, tider: [] }));
