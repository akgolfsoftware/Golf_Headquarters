/** Prøvefil for Stats › Resultater (pakke 6). Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH16Resultater } from "@/components/portal/precision/PH16Resultater";
import { TmLaster } from "@/components/portal/precision/PH17TmFelles";
import { SdFeil } from "@/components/portal/precision/PHStatsDybdeFelles";
import { byggResultater, type ResultatRundeInn } from "@/lib/portal-analyse/resultater-data";
import type { TurneringsRad } from "@/lib/domain/turneringshistorikk";

export const sti = "/portal/analysere/resultater";

const par18 = Array.from({ length: 18 }, (_, i) => ({ par: [4, 4, 3, 5][i % 4]! }));
const runder: ResultatRundeInn[] = [73, 72, 71, 74, 73, 72, 74, 73, 75, 76, 74, 75].map((score, i) => ({
  id: `r${i}`, playedAt: new Date(Date.UTC(2026, 9, 3 - i * 14)), score, roundType: i % 3 ? "trening" : "turnering",
  courseName: ["Gamle Fredrikstad GK", "Onsøy GK", "Hvaler GK"][i % 3]!, holeScores: par18,
}));
const t = (navn: string, dato: string, r: number[], plass: number | null, klasse: string, status = "FINISHED"): TurneringsRad => ({
  turneringId: navn, navn, kilde: "GOLFBOX", tour: null, startDato: new Date(dato), plassering: plass, motPar: r.reduce((a, b) => a + b, 0) - 72 * r.length,
  status, brutto: null, klasse, kildeUrl: null, runder: r.map((brutto, i) => ({ nummer: i + 1, brutto, motPar: brutto - 72, hull: 18, fullfort: true })),
});
const turn: TurneringsRad[] = [
  t("Srixon Tour 4", "2026-09-26", [73, 72], 11, "Gutter 17–19"),
  t("Srixon Tour 3", "2026-09-12", [74, 72], 9, "Gutter 17–19"),
  t("Østlandstour 5", "2026-08-29", [71], 4, "Gutter 17–19"),
  t("Klubbmesterskap", "2026-08-15", [72, 75], 2, "Herrer"),
  t("Klubbmesterskap netto", "2026-08-15", [66, 69], 1, "Herrer Netto"),
  t("Østlandstour 3", "2026-07-11", [76], null, "Gutter 17–19", "CUT"),
];

const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>{n}</PlayerHQSkall>;
export const tilstander = {
  data: skall(<PH16Resultater data={byggResultater(runder, turn)} koblet />),
  "ikke-koblet": skall(<PH16Resultater data={byggResultater(runder.slice(0, 3), [])} koblet={false} />),
  tom: skall(<PH16Resultater data={byggResultater([], [])} koblet={false} />),
  laster: skall(<TmLaster tekst="Henter resultatene" />),
  feil: skall(<SdFeil tittel="Resultatene kunne ikke hentes" tekst="Rundene og turneringene dine er trygge. Prøv igjen om litt." reset={() => {}} />),
};
