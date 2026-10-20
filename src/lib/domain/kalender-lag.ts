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
  /**
   * AG-05 (pakke 3, natt 17.10): coachen som eier hendelsen. Satt på bookinger
   * (`Booking.coachId`) og Workbench-økter (`WorkbenchSession.coachId`).
   */
  coachId?: string | null;
  /** Akse fra pyramiden (økter) eller tjenestenavnet (bookinger). null = nøytral. */
  akse?: KalenderAkse | null;
  /** Gruppeøkt: alle spillerne i gruppa samlet i én blokk. */
  gruppe?: boolean;
  /** Antall spillere i en gruppeøkt («8 spillere»). */
  antallSpillere?: number;
  /** Maskert for assistant coach: bare at tiden er opptatt, ingen navn. */
  opptatt?: boolean;
  /** Workbench-økt som kan flyttes fra kalenderen (id på én rad i økta). */
  flyttOktId?: string;
  /** Booking: betalingsmåten (`Booking.paymentMethod`). null = ikke satt. */
  betaling?: KalenderBetaling | null;
  /** Booking: gjennomført (status COMPLETED). Tegnes lysere i kalenderen. */
  gjennomfort?: boolean;
  /** Booking: coachen har foreslått ny tid som venter på spilleren. */
  nyTidForeslatt?: boolean;
}

export type KalenderBetaling = "STRIPE" | "KLIPP" | "FAKTURA" | "GRATIS" | "GAVEKORT";

/** Betalingsmåten slik den står på skjerm. */
export const BETALING_LABEL: Record<KalenderBetaling, string> = {
  STRIPE: "Stripe",
  KLIPP: "Klipp",
  FAKTURA: "Faktura",
  GRATIS: "Gratis",
  GAVEKORT: "Gavekort",
};

/** Betalingsmåten på skjerm; mangler den, står «—», aldri en gjettet verdi. */
export function betalingTekst(b: KalenderBetaling | null | undefined): string {
  return b ? BETALING_LABEL[b] : "—";
}

export type KalenderAkse = "fys" | "tek" | "slag" | "spill" | "turn";

const PYRAMIDE_AKSE: Record<string, KalenderAkse> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };

/** Workbench-øktas pyramide («TEK») som akse. Ukjent verdi gir null, aldri en gjettet akse. */
export function akseFraPyramide(p: string | null | undefined): KalenderAkse | null {
  return p ? (PYRAMIDE_AKSE[p.toUpperCase()] ?? null) : null;
}

/** Hvem som ser kalenderen. Head coach er ADMIN (samme regel som Økonomi). */
export type KalenderSeer = { id: string; erHeadCoach: boolean };

/**
 * Head coach ser alt. Assistant coach ser egne økter og bookinger og alle
 * gruppeøkter (beslutninger.md §SKJERMENE … RUNDE 8, Kalender). Andre coachers
 * bookinger står som «Opptatt» uten navn; andre coachers enkeltøkter (spillerens
 * egen plan) tas ut, fordi de ikke binder tid for noen coach. Lag uten coach
 * (skole, turnering, tester) er uendret.
 *
 * Kjøres på serveren før data sendes til klienten, så navnene aldri forlater huset.
 */
export function maskerForSeer(hendelser: readonly KalenderHendelse[], seer: KalenderSeer): KalenderHendelse[] {
  if (seer.erHeadCoach) return [...hendelser];
  const ut: KalenderHendelse[] = [];
  for (const h of hendelser) {
    const harCoach = h.lag === "BOOKING" || h.lag === "OEKTER";
    if (!harCoach || h.gruppe || h.coachId === seer.id) {
      ut.push(h);
      continue;
    }
    if (h.lag === "OEKTER") continue;
    ut.push({
      id: h.id,
      lag: h.lag,
      dato: h.dato,
      tittel: "Opptatt",
      startMin: h.startMin,
      sluttMin: h.sluttMin,
      heldag: h.heldag,
      coachId: h.coachId ?? null,
      akse: null,
      opptatt: true,
      lesevisning: true,
    });
  }
  return ut;
}

/** Coachfilteret i AG-05: null = alle coacher. Lag uten coach vises alltid. */
export function filtrerCoach(hendelser: readonly KalenderHendelse[], coachId: string | null): KalenderHendelse[] {
  if (!coachId) return [...hendelser];
  return hendelser.filter((h) => (h.lag !== "BOOKING" && h.lag !== "OEKTER") || h.coachId === coachId);
}

/**
 * Hendelser som hører hjemme i en coachkolonne i dagvisningen: bookinger og
 * gruppeøkter med coach og klokkeslett. Enkeltøkter fra spillerens plan og lag
 * uten coach står i lista under rutenettet.
 */
export function iCoachKolonne(h: KalenderHendelse): boolean {
  return !!h.coachId && !h.heldag && h.startMin != null && (h.lag === "BOOKING" || (h.lag === "OEKTER" && !!h.gruppe));
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
