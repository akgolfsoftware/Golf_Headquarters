import "server-only";

/**
 * Loader for v2 fysisk-logging-skjermen (bølge 3, ny datamodell 2026-07-09).
 * Henter EN fysisk økt for spilleren fra FysiskPlan → FysUke → FysOkt →
 * FysOvelseRad og mapper til view-modellen FysiskV2 rendrer. Ingen fabrikkering:
 * tonnasje BEREGNES fra loggSettData (sum vekt×reps), aldri lagret felt. Mangler
 * spilleren en fysisk plan/økt returneres `okt: null` → ærlig tom-tilstand i UI.
 *
 * Kjente hull (meldt, ikke fabrikkert):
 *  - «sist»-spøkelsesverdier (forrige økt per øvelse) finnes ikke i modellen ennå
 *    → tom liste (ingen falske ghost-tall).
 *  - auto-progresjon (+2,5 kg-anbefaling) har ingen datakilde → ikke vist.
 */

import { prisma } from "@/lib/prisma";
import { beregnStyrkeprogram, type StyrkeloftKode } from "@/lib/domain/fys/styrkeprogram";

/* Gyldige økt-typer i modellen (FysOkt.type er fri TEXT). */
const FYS_TYPER = ["styrke", "rotasjon", "mobilitet", "kondisjon"] as const;
export type FysType = (typeof FYS_TYPER)[number];
function tilFysType(v: string | null): FysType | null {
  return v != null && (FYS_TYPER as readonly string[]).includes(v) ? (v as FysType) : null;
}

/* Ukedag-enum → JS getDay() (0=søndag). Brukes til å plukke dagens økt. */
const UKEDAG_TIL_JSDAG: Record<string, number> = { SON: 0, MAN: 1, TIR: 2, ONS: 3, TOR: 4, FRE: 5, LOR: 6 };

export interface FysSettRad {
  vekt: number;
  reps: number;
}
export interface FysStyrkeOvelse {
  id: string;
  navn: string;
  muskelgrupper: string[];
  /** Sett å vise i loggeren: logget per-sett-data hvis den finnes, ellers plan-stillas. */
  startSett: FysSettRad[];
  /** Spøkelsesverdier fra forrige økt — tom til modellen bærer historikk. */
  sist: FysSettRad[];
  vektSteg: number;
  prosent1RM?: number;
  anbefaltKg?: number;
}
export interface FysIntervall {
  id: string;
  navn: string;
  serier: number;
  minutter: number;
  sone: string;
  pause: string;
}
export interface FysOktBrikke {
  id: string;
  tittel: string;
  type: FysType;
  varighet: string;
  muskelgrupper: string[];
}
export interface FysiskOktData {
  oktId: string;
  navn: string;
  type: FysType | null;
  varighetMin: number | null;
  planNavn: string;
  ukeLabel: string;
  ukeNr: number;
  styrke: FysStyrkeOvelse[];
  intervaller: FysIntervall[];
  /** Beregnet fra loggSettData (sum vekt×reps) — 0 hvis intet er logget ennå. */
  tonnasje: number;
  settTotalt: number;
  repsTotalt: number;
  /** Søster-økter i samme uke (kilde for FysOktKort-brikkene). */
  ukensOkter: FysOktBrikke[];
}
export interface FysiskViewData {
  spillerNavn: string;
  okt: FysiskOktData | null;
}

/** Trygt uttrekk av per-sett-logg [{vekt,reps}] fra JSON-feltet. */
function lesSettData(raw: unknown): FysSettRad[] {
  if (!Array.isArray(raw)) return [];
  const ut: FysSettRad[] = [];
  for (const r of raw) {
    if (r && typeof r === "object") {
      const o = r as Record<string, unknown>;
      const vekt = typeof o.vekt === "number" ? o.vekt : NaN;
      const reps = typeof o.reps === "number" ? o.reps : NaN;
      if (Number.isFinite(vekt) && Number.isFinite(reps)) ut.push({ vekt, reps });
    }
  }
  return ut;
}

export async function getFysiskData(userId: string): Promise<FysiskViewData> {
  const [bruker, sisteHelse, testDefs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.healthEntry.findFirst({
      where: { userId, weightKg: { not: null } },
      orderBy: { date: "desc" },
      select: { weightKg: true },
    }),
    prisma.testDefinition.findMany({
      where: {
        name: {
          in: ["Trapbar Deadlift", "Benkpress", "Knebøy", "Back Squat", "Markløft"],
        },
      },
      select: { id: true, name: true },
    }),
  ]);
  const spillerNavn = bruker?.name ?? "Spiller";

  const testResults =
    testDefs.length > 0
      ? await prisma.testResult.findMany({
          where: { userId, testId: { in: testDefs.map((d) => d.id) } },
          orderBy: { takenAt: "desc" },
          select: { testId: true, score: true },
        })
      : [];

  const maks1RMMap = new Map<StyrkeloftKode, number>();
  for (const tr of testResults) {
    const def = testDefs.find((d) => d.id === tr.testId);
    if (!def) continue;
    const n = def.name.toLowerCase();
    if ((n.includes("deadlift") || n.includes("markløft")) && !maks1RMMap.has("MARKLOFT")) {
      maks1RMMap.set("MARKLOFT", tr.score);
    } else if (n.includes("benkpress") && !maks1RMMap.has("BENKPRESS")) {
      maks1RMMap.set("BENKPRESS", tr.score);
    } else if ((n.includes("knebøy") || n.includes("squat")) && !maks1RMMap.has("KNEBOY")) {
      maks1RMMap.set("KNEBOY", tr.score);
    }
  }

  // Aktiv plan først (nyeste startdato); ellers nyeste plan uansett status.
  const plan =
    (await prisma.fysiskPlan.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { startDato: "desc" },
      include: {
        uker: {
          orderBy: { sortOrder: "asc" },
          include: { okter: { orderBy: { sortOrder: "asc" }, include: { rader: { orderBy: { sortOrder: "asc" } } } } },
        },
      },
    })) ??
    (await prisma.fysiskPlan.findFirst({
      where: { userId },
      orderBy: { startDato: "desc" },
      include: {
        uker: {
          orderBy: { sortOrder: "asc" },
          include: { okter: { orderBy: { sortOrder: "asc" }, include: { rader: { orderBy: { sortOrder: "asc" } } } } },
        },
      },
    }));

  if (!plan) return { spillerNavn, okt: null };

  // Velg uke + økt: dagens ukedag i første uke med treff, ellers første økt i planen.
  const iDagJs = new Date().getDay();
  let valgtUke = plan.uker.find((u) => u.okter.some((o) => o.dag != null && UKEDAG_TIL_JSDAG[o.dag] === iDagJs)) ?? null;
  let valgtOkt = valgtUke?.okter.find((o) => o.dag != null && UKEDAG_TIL_JSDAG[o.dag] === iDagJs) ?? null;
  if (!valgtOkt) {
    valgtUke = plan.uker.find((u) => u.okter.length > 0) ?? null;
    valgtOkt = valgtUke?.okter[0] ?? null;
  }
  if (!valgtUke || !valgtOkt) return { spillerNavn, okt: null };

  // Del radene i styrke (sett×reps) vs intervall (kondisjon).
  const styrke: FysStyrkeOvelse[] = [];
  const intervaller: FysIntervall[] = [];
  let tonnasje = 0;
  let settTotalt = 0;
  let repsTotalt = 0;

  for (const r of valgtOkt.rader) {
    if (r.intervallSerier != null || r.intervallMinutter != null) {
      intervaller.push({
        id: r.id,
        navn: r.navn,
        serier: r.intervallSerier ?? 0,
        minutter: r.intervallMinutter ?? 0,
        sone: r.pulssone ?? "S3",
        pause: r.pause ?? "",
      });
      continue;
    }

    const logget = lesSettData(r.loggSettData);
    for (const s of logget) {
      tonnasje += s.vekt * s.reps;
      settTotalt += 1;
      repsTotalt += s.reps;
    }

    const n = r.navn.toLowerCase();
    const loftKode: StyrkeloftKode | null =
      n.includes("markløft") || n.includes("deadlift")
        ? "MARKLOFT"
        : n.includes("benkpress") || n.includes("bench")
          ? "BENKPRESS"
          : n.includes("knebøy") || n.includes("squat")
            ? "KNEBOY"
            : null;

    let prosent1RM: number | undefined;
    let anbefaltKg: number | undefined;

    if (loftKode && maks1RMMap.has(loftKode)) {
      const ettRepMaksKg = maks1RMMap.get(loftKode) ?? null;
      const kroppsvektKg = sisteHelse?.weightKg ?? null;
      const ukeNummer = Math.max(1, Math.min(6, (valgtUke.sortOrder ?? 0) + 1));
      const prog = beregnStyrkeprogram({ loft: loftKode, ettRepMaksKg, kroppsvektKg });
      const ukeProg = prog.find((u) => u.uke === ukeNummer) ?? prog[0];
      if (ukeProg && ukeProg.sett.length > 0) {
        prosent1RM = ukeProg.sett[0].belastningPst;
        anbefaltKg = ukeProg.sett[0].belastningKg ?? undefined;
      }
    }

    // Vis logget data hvis den finnes; ellers plan-stillas (planlagt antall sett,
    // beregnet anbefalt vekt eller logget kg, planlagt rep-mål).
    const startSett: FysSettRad[] =
      logget.length > 0
        ? logget
        : anbefaltKg != null && anbefaltKg > 0
          ? [{ vekt: anbefaltKg, reps: r.repsMax ?? r.repsMin ?? 8 }]
          : Array.from({ length: Math.max(1, r.sett) }, () => ({
              vekt: r.loggBelastningKg ?? 0,
              reps: r.repsMax ?? r.repsMin ?? 0,
            }));
    styrke.push({
      id: r.id,
      navn: r.navn,
      muskelgrupper: r.muskelgruppe ? [r.muskelgruppe] : [],
      startSett,
      sist: [],
      vektSteg: 2.5,
      prosent1RM,
      anbefaltKg,
    });
  }

  const ukensOkter: FysOktBrikke[] = valgtUke.okter.map((o) => {
    const muskler = Array.from(
      new Set(o.rader.map((r) => r.muskelgruppe).filter((m): m is string => !!m)),
    ).slice(0, 3);
    return {
      id: o.id,
      tittel: o.navn,
      type: tilFysType(o.type) ?? "styrke",
      varighet: o.estimertMinutter != null ? `${o.estimertMinutter} min` : "–",
      muskelgrupper: muskler,
    };
  });

  return {
    spillerNavn,
    okt: {
      oktId: valgtOkt.id,
      navn: valgtOkt.navn,
      type: tilFysType(valgtOkt.type),
      varighetMin: valgtOkt.estimertMinutter,
      planNavn: plan.navn,
      ukeLabel: valgtUke.label,
      ukeNr: valgtUke.ukeNr,
      styrke,
      intervaller,
      tonnasje,
      settTotalt,
      repsTotalt,
      ukensOkter,
    },
  };
}
