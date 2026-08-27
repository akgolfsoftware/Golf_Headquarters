/**
 * Kalender-lag — AgencyOS Kalender uten Google (Loop 7/C3, natt-plan bølge 2).
 *
 * Fasit: `designsystem/train-lock/KA-01 Agency Kalender uke Mac.dc.html` §Lag —
 * fem lag med et øye-ikon som viser/skjuler: Økter · Skole · Turneringer ·
 * Tester · Booking. Google («Møter · Google», merket LES) er et sjette lag i
 * fasiten, men Loop 7 bygger UTEN Google-API — se OVERNIGHT-CODING-LOOP-BOLGE2.md
 * («Ingen Google-API») og anti-scope-regelen som forbyr å røre
 * `google-calendar-*`-filene. Google-laget er derfor bevisst utelatt her, ikke
 * en forglemmelse.
 *
 * Rene funksjoner uten Prisma og uten Date — kalleren (data.ts) gjør all
 * database- og tidssone-håndtering og gir ferdige `KalenderHendelse`.
 */

export type KalenderLag = "OEKTER" | "SKOLE" | "TURNERING" | "TESTER" | "BOOKING";

export const ALLE_LAG: readonly KalenderLag[] = ["OEKTER", "SKOLE", "TURNERING", "TESTER", "BOOKING"];

export function erKalenderLag(v: string): v is KalenderLag {
  return (ALLE_LAG as readonly string[]).includes(v);
}

/** Caps-etikett vist på hendelses-chippen, f.eks. «ØKT · ØYVIND». */
export const LAG_LABEL: Record<KalenderLag, string> = {
  OEKTER: "ØKT",
  SKOLE: "SKOLE",
  TURNERING: "TURN",
  TESTER: "TEST",
  BOOKING: "BOOKING",
};

/** Menyetiketten i lag-lista (venstre kolonne), norsk bokmål. */
export const LAG_MENY_LABEL: Record<KalenderLag, string> = {
  OEKTER: "Økter",
  SKOLE: "Skole",
  TURNERING: "Turneringer",
  TESTER: "Tester",
  BOOKING: "Booking",
};

export interface KalenderHendelse {
  id: string;
  lag: KalenderLag;
  /** Lokal dato (Oslo), YYYY-MM-DD. */
  dato: string;
  tittel: string;
  undertekst?: string;
  /** Minutter siden midnatt. `null` = heldags/ingen klokkeslett (frist, ferie). */
  startMin: number | null;
  sluttMin: number | null;
  heldag: boolean;
  href?: string;
  /**
   * SKOLE er alltid lesevisning — fasitens «LÅST»-merke i lag-lista. Andre lag
   * kan være lesevisning uten å være låst (booking redigeres andre steder).
   */
  lesevisning?: boolean;
  /** KA-05: id-ene til hendelsene denne kolliderer med (kun BOOKING). */
  kollidererMed?: string[];
}

/** Behold kun hendelser fra synlige lag — komponenten eier `synligeLag`-state. */
export function synlige(
  hendelser: readonly KalenderHendelse[],
  synligeLag: ReadonlySet<KalenderLag>,
): KalenderHendelse[] {
  return hendelser.filter((h) => synligeLag.has(h.lag));
}

/**
 * Kronologisk sortering for én dag: heldagshendelser først (samme uttrykk
 * som Google-speilet i `admin/kalender/data.ts` — «heldag sorteres først»),
 * deretter etter starttid.
 */
export function sorterDag(hendelser: readonly KalenderHendelse[]): KalenderHendelse[] {
  return [...hendelser].sort((a, b) => {
    const am = a.startMin ?? -1;
    const bm = b.startMin ?? -1;
    if (am !== bm) return am - bm;
    return a.tittel.localeCompare(b.tittel, "nb-NO");
  });
}

/** Grupper hendelser per lokal dato (YYYY-MM-DD), kronologisk sortert innad. */
export function grupperPerDato(
  hendelser: readonly KalenderHendelse[],
): Map<string, KalenderHendelse[]> {
  const ut = new Map<string, KalenderHendelse[]>();
  for (const h of hendelser) {
    const liste = ut.get(h.dato) ?? [];
    liste.push(h);
    ut.set(h.dato, liste);
  }
  for (const [dato, liste] of ut) ut.set(dato, sorterDag(liste));
  return ut;
}

/** «09.00» fra minutter siden midnatt — norsk klokkeslett-notasjon (punktum, ikke kolon). */
export function klokkeslett(minutter: number): string {
  const t = Math.floor(minutter / 60);
  const m = minutter % 60;
  return `${String(t).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
}
