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
  const bruker = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  const spillerNavn = bruker?.name ?? "Spiller";

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
    // Vis logget data hvis den finnes; ellers plan-stillas (planlagt antall sett,
    // logget kg om satt / 0, planlagt rep-mål). Ikke fabrikkering — plan-tall + 0.
    const startSett: FysSettRad[] =
      logget.length > 0
        ? logget
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
