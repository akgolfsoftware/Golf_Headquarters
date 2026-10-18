/**
 * Stats › Resultater (pakke 6, godkjent av Anders 14.10.2026): turneringer og runder, bare brutto.
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, malen «resultater».
 * Ren funksjon. Snittet følger Stats-regelen (byggPH16Stats): siste 10 18-hullsrunder, minst 4.
 * Turneringer i nettoklasser tas ikke med (erNettoKlasse speiler ak-golf-pipelines).
 */
import { erNettoKlasse } from "@/lib/stats/profil-resultater";
import { MIN_RUNDER_FOR_KONKLUSJON, SNITT_VINDU } from "./ph16-stats-data";
import type { TurneringsRad } from "@/lib/domain/turneringshistorikk";
import type { MinKurve } from "@/lib/domain/min-kurve";

export type ResultatRundeInn = {
  id: string;
  playedAt: Date;
  score: number;
  roundType: string | null;
  courseName: string | null;
  /** Par per hull fra hullscoren. Tom når hullene ikke er ført. */
  holeScores: { par: number }[];
};

export type ResultatTurnering = {
  id: string;
  navn: string;
  dato: string;
  /** Sesongen turneringen startet i (Oslo-tid), for sesongvalget i Turneringer. */
  aar: number;
  klasse: string | null;
  /** Plassering slik arrangøren har publisert den. null = ikke publisert eller ikke fullført. */
  plass: number | null;
  plassTekst: string | null;
  status: string | null;
  runder: { nr: number; brutto: number | null }[];
  sum: number | null;
  motPar: number | null;
  kildeUrl: string | null;
};

export type ResultatRunde = {
  id: string;
  type: "turn" | "egen";
  tittel: string;
  sted: string;
  dato: string;
  /** For sortering, nyeste først. */
  tid: number;
  brutto: number;
  motPar: number | null;
  href: string | null;
};

export type ResultaterData = {
  snitt: number | null;
  forrigeSnitt: number | null;
  antallSnittRunder: number;
  turneringer: ResultatTurnering[];
  runder: ResultatRunde[];
  bestePlassering: { plass: number; navn: string } | null;
};

const KORT = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short", year: "numeric" });
const AAR = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", year: "numeric" });
const KORT_UTEN_AAR = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });
const UKEDAG = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "long", day: "numeric", month: "short" });
const UTEN_RESULTAT = new Set(["WITHDREW", "CUT", "REGISTERED", "TEED_OFF", "DQ", "DNF", "PLANNED", "CONFIRMED", "WITHDRAWN"]);
const snittAv = (xs: number[]) => (xs.length >= MIN_RUNDER_FOR_KONKLUSJON ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length * 10) / 10 : null);

export function byggResultater(runderInn: readonly ResultatRundeInn[], turneringerInn: readonly TurneringsRad[]): ResultaterData {
  const nyeste = [...runderInn].sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime());
  const atten = nyeste.filter((r) => r.holeScores.length === 18 && r.score > 0).map((r) => r.score);

  const turneringer: ResultatTurnering[] = turneringerInn
    .filter((t) => !erNettoKlasse(t.klasse))
    .filter((t) => (t.runder ?? []).some((r) => r.brutto != null) || t.plassering != null)
    .sort((a, b) => b.startDato.getTime() - a.startDato.getTime())
    .map((t) => {
      const runder = (t.runder ?? []).map((r) => ({ nr: r.nummer, brutto: r.brutto }));
      const kjente = runder.filter((r) => r.brutto != null).map((r) => r.brutto!);
      const sum = t.brutto ?? (kjente.length && kjente.length === runder.length ? kjente.reduce((a, b) => a + b, 0) : null);
      const fullfort = !UTEN_RESULTAT.has(t.status ?? "");
      return {
        id: t.turneringId,
        navn: t.navn,
        dato: KORT.format(t.startDato),
        aar: Number(AAR.format(t.startDato)),
        klasse: t.klasse ?? null,
        plass: fullfort && t.plassering != null && t.plassering > 0 ? t.plassering : null,
        plassTekst: t.plasseringTekst ?? null,
        status: t.status,
        runder,
        sum,
        motPar: t.motPar,
        kildeUrl: t.kildeUrl ?? null,
      };
    });

  const turnRunder: ResultatRunde[] = turneringerInn
    .filter((t) => !erNettoKlasse(t.klasse))
    .flatMap((t) => (t.runder ?? []).filter((r) => r.brutto != null).map((r) => ({
      id: `${t.turneringId}-${r.nummer}`,
      type: "turn" as const,
      tittel: `${t.navn}, runde ${r.nummer}`,
      sted: t.klasse ?? "Turnering",
      dato: KORT.format(t.startDato),
      tid: t.startDato.getTime() + r.nummer,
      brutto: r.brutto!,
      motPar: r.motPar,
      href: null,
    })));

  const egne: ResultatRunde[] = nyeste.filter((r) => r.score > 0).map((r) => {
    const kjent = r.holeScores.length === 9 || r.holeScores.length === 18;
    const par = kjent ? r.holeScores.reduce((a, h) => a + h.par, 0) : null;
    const t = r.roundType?.toLowerCase();
    const navn = t === "turnering" || t === "tournament" ? "Turneringsrunde" : t === "trening" || t === "practice" ? "Treningsrunde" : "Egen runde";
    return {
      id: r.id,
      type: "egen" as const,
      tittel: `${navn}${r.holeScores.length === 9 ? " · 9 hull" : ""}`,
      sted: r.courseName ?? "—",
      dato: KORT.format(r.playedAt),
      tid: r.playedAt.getTime(),
      brutto: r.score,
      motPar: par != null ? r.score - par : null,
      href: `/portal/mal/runder/${r.id}`,
    };
  });

  const medPlass = turneringer.filter((t) => t.plass != null).sort((a, b) => a.plass! - b.plass!)[0];
  return {
    snitt: snittAv(atten.slice(0, SNITT_VINDU)),
    forrigeSnitt: snittAv(atten.slice(SNITT_VINDU, SNITT_VINDU * 2)),
    antallSnittRunder: Math.min(atten.length, SNITT_VINDU),
    turneringer,
    runder: [...turnRunder, ...egne].sort((a, b) => b.tid - a.tid),
    bestePlassering: medPlass ? { plass: medPlass.plass!, navn: medPlass.navn } : null,
  };
}

/** «+3», «E» eller «−2». */
export function motParTekst(v: number | null): string {
  if (v == null) return "—";
  return v === 0 ? "E" : v > 0 ? `+${v}` : `−${Math.abs(v)}`;
}

/** Ett punkt i turneringskurven: snitt til par per runde, og beste og verste runde når båndet er kjent. */
export type TurnKurvePunkt = { id: string; navn: string; dato: string; snitt: number; beste: number | null; verste: number | null };

/** Kurven øverst i Resultater › Turneringer (vedtak 16.10, §STATS-RESTEN punkt 1). */
export type TurnKurveData = {
  koblet: boolean;
  sesonger: number[];
  valgt: number | "alle";
  punkter: TurnKurvePunkt[];
  /** Snitt til par per runde i utvalget, vektet med antall runder. */
  snittPerRunde: number | null;
  /** Samme snitt sesongen før, når en sesong er valgt og den har turneringer. */
  forrige: { sesong: number; snitt: number } | null;
  antallTurneringer: number;
  antallRunder: number;
  oppdatert: string | null;
  tomGrunn: string;
};

function snittPerRunde(k: MinKurve): number | null {
  const runder = k.punkter.reduce((a, p) => a + p.runder, 0);
  if (!runder) return null;
  return Math.round(k.punkter.reduce((a, p) => a + p.snitt * p.runder, 0) / runder * 10) / 10;
}

export function byggTurnKurve(kurve: MinKurve, forrige: MinKurve | null, sistHentet: Date | null): TurnKurveData {
  const forrigeSnitt = forrige ? snittPerRunde(forrige) : null;
  return {
    koblet: kurve.koblet,
    sesonger: kurve.sesonger,
    valgt: kurve.valgtSesong,
    punkter: kurve.punkter.map((p) => ({ id: p.turneringId, navn: p.navn, dato: KORT_UTEN_AAR.format(p.dato), snitt: p.snitt, beste: p.beste, verste: p.verste })),
    snittPerRunde: snittPerRunde(kurve),
    forrige: forrigeSnitt != null && typeof forrige?.valgtSesong === "number" ? { sesong: forrige.valgtSesong, snitt: forrigeSnitt } : null,
    antallTurneringer: kurve.grunnlag.turneringer,
    antallRunder: kurve.grunnlag.runder,
    oppdatert: sistHentet ? UKEDAG.format(sistHentet) : null,
    tomGrunn: kurve.tomGrunn,
  };
}

/** «+3,4», «0,0» eller «−1,2» med ekte minustegn. */
export function motParDesimal(v: number | null): string {
  if (v == null) return "—";
  const s = Math.abs(v).toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return v > 0 ? `+${s}` : v < 0 ? `−${s}` : s;
}
