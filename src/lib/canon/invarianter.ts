// CANON-invarianter — AK-metodikkens harde og myke regler som rene funksjoner.
//
// Dette er IP-en: selvhåndhevende AK-metodikk. Hver invariant er en ren,
// testbar funksjon uten DB-avhengighet — den tar inn allerede-lest plandata
// (KanonOkt[] + KanonPeriode[] + spillerAlder) og returnerer et resultat.
//
// Reglene er fagdefinert i CANON v3.5 (masterdok) + `docs/ordbok-ak-golf-konsept.md` §13.
// Constraint-DATA (pyramide-min/max, volum-tak, tillatte L-faser) gjenbrukes fra
// `periode-constraints.ts` (PERIODE_CONSTRAINTS) — vi dupliserer den ikke.
//
// 'hard' = kan aldri brytes (blokkér/rød). 'myk' = bør ikke brytes (varsle/amber).

import type {
  PyramidArea,
  LFase,
  CSNivaa,
  PeriodeType,
} from "@/generated/prisma/client";
import { PERIODE_CONSTRAINTS } from "@/lib/portal/training/periode-constraints";

// ---------------------------------------------------------------------------
// Kontrakt
// ---------------------------------------------------------------------------

export type Alvorlighet = "hard" | "myk";
export type Scope = "okt" | "uke" | "periode" | "plan";

/** Allerede-lest øktdata (fra TrainingPlanSession), DB-agnostisk. */
export type KanonOkt = {
  id: string;
  dato: Date;
  varighetMin: number;
  pyramide: PyramidArea;
  lFase: LFase | null;
  csNivaa: CSNivaa | null;
};

export type KanonPeriode = {
  type: PeriodeType;
  startDato: Date;
  sluttDato: Date;
};

export type InvariantKontekst = {
  okter: KanonOkt[];
  perioder: KanonPeriode[];
  /** Spillerens alder i hele år (for aldersregelen). Null = ukjent → regelen hopper over. */
  spillerAlder?: number | null;
};

export type InvariantResultat = {
  ok: boolean;
  melding: string;
  /** Målt verdi (for UI: «X% / Y t»). */
  malt?: number;
  /** Grensen som ble brutt. */
  grense?: number;
  /** Øktene som bryter — UI kan hoppe hit. */
  sessionIds?: string[];
};

export type Invariant = {
  id: string;
  navn: string;
  alvorlighet: Alvorlighet;
  scope: Scope;
  valider(ctx: InvariantKontekst): InvariantResultat;
};

// ---------------------------------------------------------------------------
// Hjelpere
// ---------------------------------------------------------------------------

const OK = (melding = "OK"): InvariantResultat => ({ ok: true, melding });

/** CS-nivå → prosent av maks (CS50 = 50 % … CS100 = 100 %). */
function csProsent(cs: CSNivaa | null): number | null {
  if (!cs) return null;
  const n = Number(String(cs).replace("CS", ""));
  return Number.isFinite(n) ? n : null;
}

/** CS-tak (maks % club speed) per periode. Kilde: ordbok §13 (GRUNN 70 / SPES 90 / TURNERING 100). */
const CS_TAK: Partial<Record<PeriodeType, number>> = {
  GRUNN: 70,
  SPESIALISERING: 90,
  TURNERING: 100,
};

/** Minste hviledager per uke per periode. Kilde: ordbok §13. */
const MIN_HVILEDAGER: Partial<Record<PeriodeType, number>> = {
  GRUNN: 2,
  TURNERING: 2,
  SPESIALISERING: 1,
};

/** L-faser som regnes som «svingendring» (ny innlæring, ikke automatisering). */
const SVINGENDRING_FASER: ReadonlySet<LFase> = new Set([
  "L_KROPP",
  "L_ARM",
  "L_KOLLE",
] as LFase[]);

function periodeFor(dato: Date, perioder: KanonPeriode[]): KanonPeriode | null {
  return perioder.find((p) => dato >= p.startDato && dato <= p.sluttDato) ?? null;
}

function isoUke(d: Date): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-${String(week).padStart(2, "0")}`;
}

function dagNøkkel(d: Date): string {
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

/** Grupper økter per ISO-uke (kun uker som ligger i en kjent periode). */
function perUke(ctx: InvariantKontekst): Map<string, { okter: KanonOkt[]; periode: KanonPeriode }> {
  const m = new Map<string, { okter: KanonOkt[]; periode: KanonPeriode }>();
  for (const o of ctx.okter) {
    const p = periodeFor(o.dato, ctx.perioder);
    if (!p) continue;
    const key = isoUke(o.dato);
    const eks = m.get(key);
    if (eks) eks.okter.push(o);
    else m.set(key, { okter: [o], periode: p });
  }
  return m;
}

/** Grupper økter per periode-instans. */
function perPeriode(ctx: InvariantKontekst): { periode: KanonPeriode; okter: KanonOkt[] }[] {
  return ctx.perioder.map((periode) => ({
    periode,
    okter: ctx.okter.filter((o) => o.dato >= periode.startDato && o.dato <= periode.sluttDato),
  }));
}

function pyramideMinutter(okter: KanonOkt[]): Record<PyramidArea, number> {
  const acc: Record<PyramidArea, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
  for (const o of okter) acc[o.pyramide] += o.varighetMin;
  return acc;
}

function sum(rec: Record<PyramidArea, number>): number {
  return rec.FYS + rec.TEK + rec.SLAG + rec.SPILL + rec.TURN;
}

// ---------------------------------------------------------------------------
// Invariantene (de kode-verifiserte / prompt-spesifiserte)
// ---------------------------------------------------------------------------

/** 1. TEK-min: TEK-andel av periodens volum ≥ periodens min (SPES 15 %, GRUNN 25 %). */
const tekMin: Invariant = {
  id: "tek-min",
  navn: "TEK-minimum per periode",
  alvorlighet: "hard",
  scope: "periode",
  valider(ctx) {
    for (const { periode, okter } of perPeriode(ctx)) {
      const total = sum(pyramideMinutter(okter));
      if (total === 0) continue;
      const tek = pyramideMinutter(okter).TEK;
      const pst = Math.round((tek / total) * 100);
      const grense = PERIODE_CONSTRAINTS[periode.type].minPyramide.TEK;
      if (pst < grense) {
        return {
          ok: false,
          melding: `TEK er ${pst}% (min ${grense}% i ${periode.type.toLowerCase()})`,
          malt: pst,
          grense,
          sessionIds: okter.map((o) => o.id),
        };
      }
    }
    return OK();
  },
};

/** 2. CS50-minimum: ballkontakt/slag-økt må ha CS-nivå satt (≥ CS50). */
const cs50Ballkontakt: Invariant = {
  id: "cs50-ballkontakt",
  navn: "CS50-minimum for ballkontakt",
  alvorlighet: "hard",
  scope: "okt",
  valider(ctx) {
    const brudd = ctx.okter.filter(
      (o) => (o.pyramide === "SLAG" || o.lFase === "L_BALL") && csProsent(o.csNivaa) === null,
    );
    if (brudd.length === 0) return OK();
    return {
      ok: false,
      melding: `CS50 påkrevd for ballkontakt (${brudd.length} økt(er) mangler CS-nivå)`,
      grense: 50,
      sessionIds: brudd.map((o) => o.id),
    };
  },
};

/** 3. Aldersregel: ukentlige treningstimer ≤ spillerens alder i år. */
const alderTimer: Invariant = {
  id: "alder-timer",
  navn: "Aldersregel (timer ≤ alder)",
  alvorlighet: "hard",
  scope: "uke",
  valider(ctx) {
    const alder = ctx.spillerAlder;
    if (alder == null) return OK("Alder ukjent — regelen hoppes over");
    for (const [uke, { okter }] of perUke(ctx)) {
      const timer = okter.reduce((s, o) => s + o.varighetMin, 0) / 60;
      if (timer > alder) {
        return {
          ok: false,
          melding: `Uke ${uke}: ${timer.toFixed(1)} t overstiger alder ${alder} år`,
          malt: Math.round(timer * 10) / 10,
          grense: alder,
          sessionIds: okter.map((o) => o.id),
        };
      }
    }
    return OK();
  },
};

/** 4. Maks 2 svingendringer i TURNERING-periode (kun automatisering ellers). */
const maks2Svingendringer: Invariant = {
  id: "maks-2-svingendringer-turnering",
  navn: "Maks 2 svingendringer i turneringsfase",
  alvorlighet: "hard",
  scope: "periode",
  valider(ctx) {
    for (const { periode, okter } of perPeriode(ctx)) {
      if (periode.type !== "TURNERING") continue;
      const sving = okter.filter((o) => o.lFase != null && SVINGENDRING_FASER.has(o.lFase));
      if (sving.length > 2) {
        return {
          ok: false,
          melding: `${sving.length} svingendringer i turneringsfase (maks 2)`,
          malt: sving.length,
          grense: 2,
          sessionIds: sving.map((o) => o.id),
        };
      }
    }
    return OK();
  },
};

/** 5. CS-tak: en økts CS-nivå kan aldri overstige periodens maks. */
const csTak: Invariant = {
  id: "cs-tak",
  navn: "CS-tak per periode",
  alvorlighet: "hard",
  scope: "okt",
  valider(ctx) {
    const brudd: KanonOkt[] = [];
    for (const o of ctx.okter) {
      const p = periodeFor(o.dato, ctx.perioder);
      if (!p) continue;
      const tak = CS_TAK[p.type];
      const cs = csProsent(o.csNivaa);
      if (tak != null && cs != null && cs > tak) brudd.push(o);
    }
    if (brudd.length === 0) return OK();
    return {
      ok: false,
      melding: `${brudd.length} økt(er) over CS-tak for perioden`,
      sessionIds: brudd.map((o) => o.id),
    };
  },
};

/** 6. Tillatte L-faser: en økts L-fase må være lov i perioden. */
const lFaseTillatt: Invariant = {
  id: "l-fase-tillatt",
  navn: "Tillatte L-faser per periode",
  alvorlighet: "hard",
  scope: "okt",
  valider(ctx) {
    const brudd: KanonOkt[] = [];
    for (const o of ctx.okter) {
      if (o.lFase == null) continue;
      const p = periodeFor(o.dato, ctx.perioder);
      if (!p) continue;
      const tillatt = Object.keys(PERIODE_CONSTRAINTS[p.type].lFaseFordeling) as LFase[];
      if (!tillatt.includes(o.lFase)) brudd.push(o);
    }
    if (brudd.length === 0) return OK();
    return {
      ok: false,
      melding: `${brudd.length} økt(er) bruker L-fase som ikke er tillatt i perioden`,
      sessionIds: brudd.map((o) => o.id),
    };
  },
};

/** 7. Pyramide-maks: ingen pyramide-område over periodens maks-andel. */
const pyramideMaks: Invariant = {
  id: "pyramide-maks",
  navn: "Pyramide-maks per periode",
  alvorlighet: "hard",
  scope: "periode",
  valider(ctx) {
    const omrader: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
    for (const { periode, okter } of perPeriode(ctx)) {
      const fordeling = pyramideMinutter(okter);
      const total = sum(fordeling);
      if (total === 0) continue;
      for (const omr of omrader) {
        const pst = Math.round((fordeling[omr] / total) * 100);
        const maks = PERIODE_CONSTRAINTS[periode.type].maxPyramide[omr];
        if (pst > maks) {
          return {
            ok: false,
            melding: `${omr} er ${pst}% (maks ${maks}% i ${periode.type.toLowerCase()})`,
            malt: pst,
            grense: maks,
            sessionIds: okter.map((o) => o.id),
          };
        }
      }
    }
    return OK();
  },
};

/** 8. Volum-tak: ukentlig volum kan ikke overstige periodens maks. */
const volumUkeMaks: Invariant = {
  id: "volum-uke-maks",
  navn: "Volum-tak per uke",
  alvorlighet: "hard",
  scope: "uke",
  valider(ctx) {
    for (const [uke, { okter, periode }] of perUke(ctx)) {
      const total = okter.reduce((s, o) => s + o.varighetMin, 0);
      const maks = PERIODE_CONSTRAINTS[periode.type].volumPerUke.maxMin;
      if (total > maks) {
        return {
          ok: false,
          melding: `Uke ${uke}: ${total} min over maks ${maks} (${periode.type.toLowerCase()})`,
          malt: total,
          grense: maks,
          sessionIds: okter.map((o) => o.id),
        };
      }
    }
    return OK();
  },
};

/** 9. Hviledager: minst N hviledager per uke (myk). */
const hviledager: Invariant = {
  id: "hviledager-min",
  navn: "Minste hviledager per uke",
  alvorlighet: "myk",
  scope: "uke",
  valider(ctx) {
    for (const [uke, { okter, periode }] of perUke(ctx)) {
      const min = MIN_HVILEDAGER[periode.type];
      if (min == null) continue;
      const treningsdager = new Set(okter.map((o) => dagNøkkel(o.dato))).size;
      const hvile = 7 - treningsdager;
      if (hvile < min) {
        return {
          ok: false,
          melding: `Uke ${uke}: ${hvile} hviledag(er) (min ${min} i ${periode.type.toLowerCase()})`,
          malt: hvile,
          grense: min,
          sessionIds: okter.map((o) => o.id),
        };
      }
    }
    return OK();
  },
};

/** Alle implementerte invarianter (CANON-delmengde funnet i repoet). */
export const INVARIANTER: readonly Invariant[] = [
  tekMin,
  cs50Ballkontakt,
  alderTimer,
  maks2Svingendringer,
  csTak,
  lFaseTillatt,
  pyramideMaks,
  volumUkeMaks,
  hviledager,
];

/** Kjør alle invarianter i et gitt scope (eller alle). Returnerer kun brudd. */
export function kjorInvarianter(
  ctx: InvariantKontekst,
  scope?: Scope,
): Array<{ invariant: Invariant; resultat: InvariantResultat }> {
  return INVARIANTER.filter((inv) => !scope || inv.scope === scope)
    .map((invariant) => ({ invariant, resultat: invariant.valider(ctx) }))
    .filter((r) => !r.resultat.ok);
}
