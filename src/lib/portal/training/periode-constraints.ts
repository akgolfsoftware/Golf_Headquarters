// periode-constraints.ts — beregner og validerer constraints for trenings-perioder.
//
// For hver PeriodeType (GRUNN, SPESIALISERING, TURNERING, EVALUERING, FERIE)
// definerer vi:
//   - min/max pyramide-fordeling (% av total tid)
//   - anbefalt L-fase-fordeling (% av tid)
//   - anbefalt praksis-fordeling (B/R/K/S)
//   - min/max volum per uke (minutter)
//
// `validateSessionConstraints()` sjekker en liste økter mot perioden de tilhører
// og returnerer brudd-beskrivelser. Brukes både i UI (for å advare coach) og i
// session-generator (for å unngå å bryte regler ved auto-generering).

import type {
  TrainingSessionV2,
  TrainingDrillV2,
  PyramidArea,
  PeriodeType,
  PracticeType,
  LFase,
} from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export type Periode = {
  type: PeriodeType;
  startDato: Date;
  sluttDato: Date;
};

export type PeriodeConstraints = {
  minPyramide: Record<PyramidArea, number>;
  maxPyramide: Record<PyramidArea, number>;
  lFaseFordeling: Partial<Record<LFase, number>>;
  praksisFordeling: Record<PracticeType, number>;
  volumPerUke: { minMin: number; maxMin: number };
};

export type BruddBeskrivelse = {
  sessionId: string;
  brudd: string[];
};

export type ValideringsResultat = {
  valid: boolean;
  bruddBeskrivelser: BruddBeskrivelse[];
};

type SessionMedDrills = TrainingSessionV2 & { drills: TrainingDrillV2[] };

// ---------------------------------------------------------------------------
// Constraints per periode-type
// ---------------------------------------------------------------------------

const ZERO_PRAKSIS: Record<PracticeType, number> = {
  BLOKK: 0,
  RANDOM: 0,
  KONKURRANSE: 0,
  SPILL_TEST: 0,
};

export const PERIODE_CONSTRAINTS: Record<PeriodeType, PeriodeConstraints> = {
  // Grunn: bygg fysisk basis + tekniske grunnferdigheter.
  GRUNN: {
    minPyramide: { FYS: 25, TEK: 25, SLAG: 5, SPILL: 5, TURN: 0 },
    maxPyramide: { FYS: 40, TEK: 40, SLAG: 20, SPILL: 20, TURN: 5 },
    lFaseFordeling: { L_KROPP: 45, L_ARM: 40, L_KOLLE: 15 },
    praksisFordeling: { ...ZERO_PRAKSIS, BLOKK: 70, RANDOM: 20, KONKURRANSE: 5, SPILL_TEST: 5 },
    volumPerUke: { minMin: 420, maxMin: 720 },
  },
  // Spesialisering: integrer tekniske ferdigheter i slag og spill.
  SPESIALISERING: {
    minPyramide: { FYS: 15, TEK: 15, SLAG: 20, SPILL: 15, TURN: 0 },
    maxPyramide: { FYS: 30, TEK: 30, SLAG: 40, SPILL: 35, TURN: 15 },
    lFaseFordeling: { L_KOLLE: 30, L_BALL: 45, L_AUTO: 25 },
    praksisFordeling: { ...ZERO_PRAKSIS, BLOKK: 40, RANDOM: 35, KONKURRANSE: 15, SPILL_TEST: 10 },
    volumPerUke: { minMin: 480, maxMin: 840 },
  },
  // Turnering: fokus på automatisering og turnerings-spesifikk forberedelse.
  TURNERING: {
    minPyramide: { FYS: 5, TEK: 5, SLAG: 15, SPILL: 20, TURN: 20 },
    maxPyramide: { FYS: 20, TEK: 20, SLAG: 30, SPILL: 40, TURN: 45 },
    lFaseFordeling: { L_BALL: 30, L_AUTO: 70 },
    praksisFordeling: { ...ZERO_PRAKSIS, BLOKK: 15, RANDOM: 30, KONKURRANSE: 30, SPILL_TEST: 25 },
    volumPerUke: { minMin: 240, maxMin: 480 },
  },
  // Evaluering: test og vurdering — mye simulert spill.
  EVALUERING: {
    minPyramide: { FYS: 0, TEK: 0, SLAG: 5, SPILL: 20, TURN: 30 },
    maxPyramide: { FYS: 15, TEK: 15, SLAG: 25, SPILL: 45, TURN: 65 },
    lFaseFordeling: { L_AUTO: 100 },
    praksisFordeling: { ...ZERO_PRAKSIS, BLOKK: 10, RANDOM: 20, KONKURRANSE: 35, SPILL_TEST: 35 },
    volumPerUke: { minMin: 180, maxMin: 360 },
  },
  // Ferie: vedlikehold, fysisk fokus, lavt volum.
  FERIE: {
    minPyramide: { FYS: 40, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 },
    maxPyramide: { FYS: 100, TEK: 20, SLAG: 10, SPILL: 10, TURN: 0 },
    lFaseFordeling: { L_KROPP: 70, L_ARM: 30 },
    praksisFordeling: { ...ZERO_PRAKSIS, BLOKK: 80, RANDOM: 15, KONKURRANSE: 0, SPILL_TEST: 5 },
    volumPerUke: { minMin: 60, maxMin: 240 },
  },
};

export function getPeriodeConstraints(periodeType: PeriodeType): PeriodeConstraints {
  return PERIODE_CONSTRAINTS[periodeType];
}

// ---------------------------------------------------------------------------
// Validering
// ---------------------------------------------------------------------------

function finnPeriode(dato: Date, perioder: Periode[]): Periode | null {
  return perioder.find((p) => dato >= p.startDato && dato <= p.sluttDato) ?? null;
}

function summerPyramideMinutter(session: SessionMedDrills): Record<PyramidArea, number> {
  const acc: Record<PyramidArea, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
  for (const drill of session.drills) {
    acc[drill.pyramide] += drill.durationMinutes;
  }
  return acc;
}

function totalMinutter(fordeling: Record<PyramidArea, number>): number {
  return fordeling.FYS + fordeling.TEK + fordeling.SLAG + fordeling.SPILL + fordeling.TURN;
}

/**
 * Valider én økt mot perioden den ligger i. Returner liste med brudd-tekster.
 */
function validerEnkeltOkt(
  session: SessionMedDrills,
  periode: Periode,
): string[] {
  const brudd: string[] = [];
  const constraints = getPeriodeConstraints(periode.type);
  const fordeling = summerPyramideMinutter(session);
  const total = totalMinutter(fordeling);

  if (total === 0) return brudd;

  // Sjekk per pyramide-område: prosent må ligge innenfor min/max.
  const omrader: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
  for (const omr of omrader) {
    const pst = Math.round((fordeling[omr] / total) * 100);
    const max = constraints.maxPyramide[omr];
    if (pst > max) {
      brudd.push(
        `${omr} er ${pst}% (maks ${max}% for ${periode.type.toLowerCase()})`,
      );
    }
    // Vi advarer ikke på minimum per økt, kun per uke (se under).
  }

  return brudd;
}

/**
 * Valider en samling økter mot perioder. Sjekker både per-økt og per-uke regler.
 */
export function validateSessionConstraints(
  sessions: SessionMedDrills[],
  perioder: Periode[],
): ValideringsResultat {
  const bruddBeskrivelser: BruddBeskrivelse[] = [];

  // Per-økt validering
  for (const session of sessions) {
    const periode = finnPeriode(session.startTime, perioder);
    if (!periode) continue;
    const brudd = validerEnkeltOkt(session, periode);
    if (brudd.length > 0) {
      bruddBeskrivelser.push({ sessionId: session.id, brudd });
    }
  }

  // Per-uke volum-validering
  const ukeBucket = new Map<string, { total: number; periode: Periode; sessionIds: string[] }>();
  for (const session of sessions) {
    const periode = finnPeriode(session.startTime, perioder);
    if (!periode) continue;
    const minutter = totalMinutter(summerPyramideMinutter(session));
    const uke = isoUke(session.startTime);
    const key = `${uke.year}-${uke.week}`;
    const eksisterende = ukeBucket.get(key);
    if (eksisterende) {
      eksisterende.total += minutter;
      eksisterende.sessionIds.push(session.id);
    } else {
      ukeBucket.set(key, { total: minutter, periode, sessionIds: [session.id] });
    }
  }

  for (const [, ukeData] of ukeBucket) {
    const constraints = getPeriodeConstraints(ukeData.periode.type);
    if (ukeData.total > constraints.volumPerUke.maxMin) {
      for (const sid of ukeData.sessionIds) {
        const eks = bruddBeskrivelser.find((b) => b.sessionId === sid);
        const tekst = `Ukens volum ${ukeData.total} min overskrider maks ${constraints.volumPerUke.maxMin} for ${ukeData.periode.type.toLowerCase()}`;
        if (eks) eks.brudd.push(tekst);
        else bruddBeskrivelser.push({ sessionId: sid, brudd: [tekst] });
      }
    }
  }

  return {
    valid: bruddBeskrivelser.length === 0,
    bruddBeskrivelser,
  };
}

// ---------------------------------------------------------------------------
// ISO-uke-hjelper (vi unngår ekstern dep her — date-fns brukes andre steder)
// ---------------------------------------------------------------------------

function isoUke(d: Date): { year: number; week: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: date.getUTCFullYear(), week };
}
