/**
 * Stall-radens fire ting (MASTERPLAN 15.11, beslutning 6.5): navn, neste
 * økt, siste aktivitet, én prikk. Ikke mer. Rene, testbare formatterings-
 * funksjoner — ingen Prisma, ingen React.
 *
 * Tidssone-gotcha (gotchas.md §Tidssone): all dato/klokke-formattering går
 * via Intl med eksplisitt `timeZone: "Europe/Oslo"` — server (Vercel, UTC)
 * og klient (Oslo) skal aldri kunne avvike.
 */

const OSLO_DATO_NOKKEL = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const OSLO_TID = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  hour: "2-digit",
  minute: "2-digit",
});
const OSLO_UKEDAG_KORT = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  weekday: "short",
});
const OSLO_KORT_DATO = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "numeric",
  month: "numeric",
});

/** Antall Oslo-kalenderdager mellom to tidspunkt (kan være negativt). */
function oslodagerFrem(fra: Date, naa: Date): number {
  const a = new Date(`${OSLO_DATO_NOKKEL.format(fra)}T00:00:00Z`).getTime();
  const b = new Date(`${OSLO_DATO_NOKKEL.format(naa)}T00:00:00Z`).getTime();
  return Math.round((a - b) / 86_400_000);
}

export type NesteOktRadInput = { startTime: Date } | null;

/**
 * «Neste: i dag 13.00» / «Neste: i morgen 07.30» / «Neste: man 07.30» /
 * «Neste: 12.9 15.00» / «Ingen økt planlagt» — coachens klarspråk for
 * Stall-raden (skiller seg fra portal/neste-okt-tekst.ts, som viser
 * ØKTTITTELEN til spilleren; her er klokkeslettet det som teller).
 */
export function nesteOktRadTekst(nesteOkt: NesteOktRadInput, naa: Date): string {
  if (!nesteOkt) return "Ingen økt planlagt";
  const tid = OSLO_TID.format(nesteOkt.startTime).replace(":", ".");
  const dagerFrem = oslodagerFrem(nesteOkt.startTime, naa);
  if (dagerFrem <= 0) return `Neste: i dag ${tid}`;
  if (dagerFrem === 1) return `Neste: i morgen ${tid}`;
  if (dagerFrem <= 6) {
    const dag = OSLO_UKEDAG_KORT.format(nesteOkt.startTime).replace(/\.$/, "");
    return `Neste: ${dag} ${tid}`;
  }
  const dato = OSLO_KORT_DATO.format(nesteOkt.startTime).replace(/\.$/, "");
  return `Neste: ${dato} ${tid}`;
}

/** «logget i dag» / «logget i går» / «8 dg siden» / «aldri logget inn». */
export function sisteAktivitetTekst(dagerSiden: number | null): string {
  if (dagerSiden == null) return "aldri logget inn";
  if (dagerSiden <= 0) return "logget i dag";
  if (dagerSiden === 1) return "logget i går";
  return `${dagerSiden} dg siden`;
}

export type PrikkTilstand = "fylt" | "aapen" | "ingen";

/**
 * Radens prikk (beslutning 6.5): fylt = trenger deg, åpen ring = følg med,
 * ingen = på planen. Utleder direkte av sev-rangeringen Stall allerede
 * bruker (SEV_MAP i page.tsx) — ingen ny klassifisering funnet opp.
 */
export function prikkFraSev(sev: "sterk" | "medium" | "lav" | "ok"): PrikkTilstand {
  if (sev === "sterk" || sev === "medium") return "fylt";
  if (sev === "lav") return "aapen";
  return "ingen";
}
