/**
 * Mål og planleggingsnivå — kobler en Goal til år, periode, måned, uke eller økt
 * uten ny modell eller nytt databasefelt.
 *
 * Valgt nivå lagres som `planNivaa` i `Goal.payload` (Json, finnes fra før).
 * Er ingenting valgt, foreslås nivået ut fra fristen. Kilden («valgt» eller
 * «foreslatt») følger alltid med, slik at visningen aldri utgir et forslag for
 * et valg.
 *
 * Gjennomføringssporet (planlagt / gjennomført / uteblitt) regnes kun for mål
 * som er koblet til et pyramide-område (`linkedPyramidArea`). For øvrige mål
 * finnes ingen ærlig kobling til enkeltøkter, og sporet er da null — ikke en
 * oppdiktet null-telling.
 *
 * Alle datoer er «YYYY-MM-DD» (norsk kalenderdag). Ren logikk, ingen I/O.
 */

export const PLAN_NIVAAER = ["AAR", "PERIODE", "MANED", "UKE", "OKT"] as const;
export type PlanNivaa = (typeof PLAN_NIVAAER)[number];

export const PLAN_NIVAA_LABEL: Record<PlanNivaa, string> = {
  AAR: "År",
  PERIODE: "Periode",
  MANED: "Måned",
  UKE: "Uke",
  OKT: "Økt",
};

export const GOAL_TYPE_LABEL: Record<string, string> = {
  HCP_TARGET: "Handicap",
  ROUNDS_PER_MONTH: "Runder per måned",
  SG_AREA: "Strokes Gained",
  SESSION_FREQUENCY: "Øktfrekvens",
  TEST_SCORE: "Testresultat",
  FREE_TEXT: "Fritekst",
};

export type PlanNivaaKilde = "valgt" | "foreslatt";

export function erPlanNivaa(verdi: unknown): verdi is PlanNivaa {
  return typeof verdi === "string" && (PLAN_NIVAAER as readonly string[]).includes(verdi);
}

/** Leser valgt nivå fra `Goal.payload`. Ukjent eller ugyldig verdi gir null. */
export function lesPlanNivaa(payload: unknown): PlanNivaa | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const verdi = (payload as Record<string, unknown>).planNivaa;
  return erPlanNivaa(verdi) ? verdi : null;
}

/**
 * Setter eller fjerner `planNivaa` i en payload uten å røre andre nøkler
 * (sgOmrade, sgStart, abandonReason …).
 */
export function medPlanNivaa<T extends Record<string, unknown>>(
  payload: T,
  nivaa: PlanNivaa | null | undefined,
): Omit<T, "planNivaa"> & { planNivaa?: PlanNivaa } {
  const { planNivaa: _gammelt, ...rest } = payload;
  return nivaa ? { ...rest, planNivaa: nivaa } : rest;
}

function dagerMellom(fraIso: string, tilIso: string): number {
  const fra = Date.parse(`${fraIso}T00:00:00Z`);
  const til = Date.parse(`${tilIso}T00:00:00Z`);
  return Math.round((til - fra) / 86_400_000);
}

/**
 * Foreslår nivå fra fristen. Ingen frist = retning for året. Forfalt frist
 * behandles som ukesaken den nå er.
 */
export function foreslaPlanNivaa(fristIso: string | null, idagIso: string): PlanNivaa {
  if (!fristIso) return "AAR";
  const dager = dagerMellom(idagIso, fristIso);
  if (dager < 0) return "UKE";
  if (dager <= 1) return "OKT";
  if (dager <= 7) return "UKE";
  if (dager <= 35) return "MANED";
  if (dager <= 120) return "PERIODE";
  return "AAR";
}

export function losPlanNivaa(
  payload: unknown,
  fristIso: string | null,
  idagIso: string,
): { nivaa: PlanNivaa; kilde: PlanNivaaKilde } {
  const valgt = lesPlanNivaa(payload);
  if (valgt) return { nivaa: valgt, kilde: "valgt" };
  return { nivaa: foreslaPlanNivaa(fristIso, idagIso), kilde: "foreslatt" };
}

// ─── Vindu per nivå ───────────────────────────────────────────────

function leggTilDager(iso: string, antall: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + antall);
  return d.toISOString().slice(0, 10);
}

/**
 * Tidsvinduet (begge ender inkludert) et nivå omfatter rundt «i dag».
 * Periode har fritt datospenn i modellen, så det brukes et rullerende vindu
 * på seks uker bakover og seks uker fremover.
 */
export function planVindu(nivaa: PlanNivaa, idagIso: string): { fra: string; til: string } {
  const [aar, maned] = idagIso.split("-").map(Number);
  switch (nivaa) {
    case "OKT":
      return { fra: idagIso, til: idagIso };
    case "UKE": {
      const ukedag = new Date(`${idagIso}T00:00:00Z`).getUTCDay(); // 0 = søndag
      const tilbake = ukedag === 0 ? 6 : ukedag - 1;
      const mandag = leggTilDager(idagIso, -tilbake);
      return { fra: mandag, til: leggTilDager(mandag, 6) };
    }
    case "MANED": {
      const fra = `${String(aar).padStart(4, "0")}-${String(maned).padStart(2, "0")}-01`;
      const sisteDag = new Date(Date.UTC(aar, maned, 0)).getUTCDate();
      return { fra, til: `${fra.slice(0, 8)}${String(sisteDag).padStart(2, "0")}` };
    }
    case "PERIODE":
      return { fra: leggTilDager(idagIso, -42), til: leggTilDager(idagIso, 42) };
    case "AAR":
      return { fra: `${aar}-01-01`, til: `${aar}-12-31` };
  }
}

// ─── Gjennomføringsspor ───────────────────────────────────────────

export type SporOkt = { date: string; status: string };

export type MaalSpor = {
  /** Ikke utkast, ikke avlyst. */
  planlagt: number;
  gjennomfort: number;
  /** Planlagt, dato passert, ikke gjennomført. */
  uteblitt: number;
  /** Planlagt fra i dag og fremover, ikke gjennomført. */
  gjenstar: number;
};

const IKKE_PLANLAGT = new Set(["DRAFT", "CANCELLED"]);

export function beregnMaalSpor(okter: SporOkt[], idagIso: string): MaalSpor {
  const spor: MaalSpor = { planlagt: 0, gjennomfort: 0, uteblitt: 0, gjenstar: 0 };
  for (const okt of okter) {
    if (IKKE_PLANLAGT.has(okt.status)) continue;
    spor.planlagt += 1;
    if (okt.status === "COMPLETED") {
      spor.gjennomfort += 1;
    } else if (okt.date < idagIso) {
      spor.uteblitt += 1;
    } else {
      spor.gjenstar += 1;
    }
  }
  return spor;
}

/**
 * Neste tiltak som regelbasert forslag — aldri et tall coachen ikke kan
 * spore, og aldri en konklusjon uten data.
 */
export function foreslaNesteTiltak(input: {
  fremdriftStatus: "on-track" | "behind" | "achieved" | "no-data";
  spor: MaalSpor | null;
}): string {
  const { fremdriftStatus, spor } = input;
  if (fremdriftStatus === "achieved") return "Målet er nådd. Sett neste mål.";
  if (spor) {
    if (spor.planlagt === 0) return "Ingen økter er planlagt mot området. Planlegg minst én økt.";
    if (spor.uteblitt > 0) {
      return fremdriftStatus === "behind"
        ? "Bak plan med uteblitte økter. Få dem inn før volumet økes."
        : "Uteblitte økter. Avklar med spilleren om de skal flyttes eller tas ut.";
    }
    if (fremdriftStatus === "behind") return "Bak plan uten uteblitte økter. Vurder å øke volumet eller justere målet.";
  } else if (fremdriftStatus === "behind") {
    return "Bak plan. Vurder om planen dekker målet.";
  }
  if (fremdriftStatus === "no-data") return "Ingen målinger ennå. Følg opp manuelt.";
  return "På sporet. Fortsett som planlagt.";
}
