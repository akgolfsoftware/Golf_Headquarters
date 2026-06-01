/**
 * Data-loader for /portal/analysere — Treningsanalyse "Utforsk".
 *
 * Bygger ÉN flat økt-logg (sannhetskilden) som klient-komponenten aggregerer
 * live på hvilken som helst akse — slik at ingen to tall kan være uenige.
 *
 * Ekte data:
 *   - TrainingPlanSession (via plan.userId)  → timer per akse/kategori/område/type
 *   - TrainingPlanSessionLog                  → faktisk varighet for fullførte økter
 *   - BrukerSgInput / Round                   → Strokes Gained per SG-kategori
 *
 * Viktig ærlighet: SG finnes KUN per SG-kategori (OTT/APP/ARG/PUTT) i datamodellen
 * — det finnes ingen SG per treningsøkt. Derfor kobles SG bare til kategori-rader.
 * Andre grupperinger viser timer ærlig, og netto-SG vises separat som KPI.
 *
 * Alt er null-safe. Ingen treningsdata → tom logg, ALDRI utdiktede tall.
 */

import { prisma } from "@/lib/prisma";

/** Antall dager som regnes som "sesong" (matcher periode-velgeren). */
export const SESONG_DAGER = 92;

/** SG-kategori-nøkler. "ovrig" = fys/turnering uten SG. */
export type KatKey = "ott" | "app" | "arg" | "putt" | "ovrig";
export type AkseKey = "fys" | "tek" | "slag" | "spill" | "turn";
export type OmradeKey = "flat" | "gress" | "bane-tren" | "bane-scoring" | "gym" | "annet";
export type TypeKey = "egen" | "coachet" | "test" | "turnering";

/** Én treningsøkt, normalisert til klientens aggregat-akser. */
export type OktLogg = {
  /** Dager siden økten (heltall ≥ 0). Styrer periode-filter. */
  d: number;
  axis: AkseKey;
  /** SG-kategori utledet fra skillArea. */
  kat: KatKey;
  venue: OmradeKey;
  type: TypeKey;
  /** Timer (faktisk for fullførte økter, ellers planlagt varighet). */
  t: number;
};

/** SG per kategori (snitt) — kobles til kategori-rader i breakdown. */
export type SgPerKat = Record<Exclude<KatKey, "ovrig">, number | null>;

export type TreningsanalyseData = {
  /** Flat økt-logg innenfor sesong-vinduet (sortert nyest først). */
  okter: OktLogg[];
  /** Netto SG (sum av tilgjengelige kategori-snitt). null hvis ingen SG. */
  sgNetto: number | null;
  /** SG-snitt per kategori (for SG-kategori-grupperingen). */
  sgPerKat: SgPerKat;
  /** Antall SG-kilder bak snittene (runder + manuelle input). */
  sgKilder: number;
};

// ── enum → aggregat-akse-mapping ────────────────────────────────
function akseFra(pyramidArea: string): AkseKey {
  switch (pyramidArea) {
    case "FYS":
      return "fys";
    case "TEK":
      return "tek";
    case "SLAG":
      return "slag";
    case "SPILL":
      return "spill";
    case "TURN":
      return "turn";
    default:
      return "tek";
  }
}

function katFra(skillArea: string | null): KatKey {
  switch (skillArea) {
    case "TEE_TOTAL":
      return "ott";
    case "TILNAERMING":
      return "app";
    case "AROUND_GREEN":
      return "arg";
    case "PUTTING":
      return "putt";
    default:
      // SPILL og null har ingen SG-kategori → øvrig
      return "ovrig";
  }
}

function omradeFra(environment: string | null): OmradeKey {
  switch (environment) {
    case "RANGE":
      return "flat";
    case "BANE":
      return "bane-tren";
    case "GYM":
      return "gym";
    case "STUDIO":
    case "SIMULATOR":
      return "gress";
    case "HJEM":
      return "annet";
    default:
      return "annet";
  }
}

/** Økt-type fra status + miljø. TEST/TURN utledes ikke fra session-modellen
 *  (ingen type-felt), så vi klassifiserer pragmatisk: gym→egen, ellers egen.
 *  Coachet = økt har coach-feedback i loggen. */
function typeFra(harCoachFeedback: boolean, pyramidArea: string): TypeKey {
  if (pyramidArea === "TURN") return "turnering";
  if (harCoachFeedback) return "coachet";
  return "egen";
}

function dagerSiden(dato: Date, naa: Date): number {
  const ms = naa.getTime() - dato.getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

// ── SG-snitt helper ─────────────────────────────────────────────
function snitt(verdier: (number | null | undefined)[]): number | null {
  const gyldige = verdier.filter((v): v is number => typeof v === "number");
  if (gyldige.length === 0) return null;
  return gyldige.reduce((sum, v) => sum + v, 0) / gyldige.length;
}

/**
 * Henter og normaliserer all treningsanalyse-data for én spiller.
 * Vindu: siste {SESONG_DAGER} dager (klienten filtrerer videre på 7/30/sesong).
 */
export async function hentTreningsanalyse(userId: string): Promise<TreningsanalyseData> {
  const naa = new Date();
  const fra = new Date(naa);
  fra.setDate(fra.getDate() - SESONG_DAGER);

  // 90-dagers SG-vindu (matcher Stats-oversikten for konsistens).
  const sgFra = new Date(naa);
  sgFra.setDate(sgFra.getDate() - 90);

  const [sessions, rounds, sgInputs] = await Promise.all([
    prisma.trainingPlanSession.findMany({
      where: { plan: { userId }, scheduledAt: { gte: fra } },
      select: {
        scheduledAt: true,
        durationMin: true,
        pyramidArea: true,
        skillArea: true,
        environment: true,
        log: { select: { startedAt: true, completedAt: true, coachFeedback: true } },
      },
      orderBy: { scheduledAt: "desc" },
    }),
    prisma.round.findMany({
      where: { userId, playedAt: { gte: sgFra } },
      select: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
    }),
    prisma.brukerSgInput.findMany({
      where: { userId, dato: { gte: sgFra } },
      select: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
    }),
  ]);

  // ── normaliser økter ──────────────────────────────────────────
  const okter: OktLogg[] = sessions.map((s) => {
    // Faktisk varighet for fullførte økter, ellers planlagt.
    let minutter = s.durationMin;
    if (s.log?.completedAt && s.log.startedAt) {
      const faktisk = Math.round(
        (s.log.completedAt.getTime() - s.log.startedAt.getTime()) / 60_000,
      );
      if (faktisk > 0) minutter = faktisk;
    }
    return {
      d: dagerSiden(s.scheduledAt, naa),
      axis: akseFra(s.pyramidArea),
      kat: katFra(s.skillArea),
      venue: omradeFra(s.environment),
      type: typeFra(Boolean(s.log?.coachFeedback), s.pyramidArea),
      t: minutter / 60,
    };
  });

  // ── SG per kategori (runder + manuelle input slått sammen) ─────
  const sgPerKat: SgPerKat = {
    ott: snitt([...rounds.map((r) => r.sgOtt), ...sgInputs.map((i) => i.sgOtt)]),
    app: snitt([...rounds.map((r) => r.sgApp), ...sgInputs.map((i) => i.sgApp)]),
    arg: snitt([...rounds.map((r) => r.sgArg), ...sgInputs.map((i) => i.sgArg)]),
    putt: snitt([...rounds.map((r) => r.sgPutt), ...sgInputs.map((i) => i.sgPutt)]),
  };

  const sgVerdier = Object.values(sgPerKat).filter((v): v is number => v != null);
  const sgNetto = sgVerdier.length > 0 ? sgVerdier.reduce((a, v) => a + v, 0) : null;

  return {
    okter,
    sgNetto,
    sgPerKat,
    sgKilder: rounds.length + sgInputs.length,
  };
}
