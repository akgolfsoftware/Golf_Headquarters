/** Prøvefil for Ett område (pakke 13): SG-utgaven og akse-utgaven. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH16cOmrade } from "@/components/portal/precision/PH16cOmrade";
import { TmLaster } from "@/components/portal/precision/PH17TmFelles";
import { SdFeil } from "@/components/portal/precision/PHStatsDybdeFelles";
import { byggPH16Stats, type PH16RundeInn } from "@/lib/portal-analyse/ph16-stats-data";
import { byggOmradeAkse, byggOmradeSg, type AkseOktInn } from "@/lib/portal-analyse/omrade-data";

export const sti = "/portal/statistikk/sg-approach";

const naa = new Date(Date.UTC(2026, 9, 5, 12, 20));
const runder: PH16RundeInn[] = Array.from({ length: 14 }, (_, i) => ({
  id: `r${i}`, playedAt: new Date(Date.UTC(2026, 9, 4 - i * 9)), score: 72 + (i % 4), roundType: "trening", courseName: "Fredrikstad GK",
  sgTotal: -1.2, sgSource: "beregnet", benchmarkLevelSnapshot: "PGA_TOUR", holeScores: Array.from({ length: 18 }, () => ({ par: 4 })),
  sgTee: 0.2, sgApp200: -0.1, sgApp150: -0.2 + i * 0.01, sgApp100: -0.5 - i * 0.02, sgApp50: -0.1,
  sgChip: -0.1, sgPitch: -0.2, sgLob: i < 5 ? 0 : null, sgBunker: -0.1,
  sgPutt0_3: 0.1, sgPutt3_5: 0, sgPutt5_10: -0.1, sgPutt10_15: 0, sgPutt15_25: 0, sgPutt25_40: 0, sgPutt40plus: i < 2 ? 0.1 : null,
}));
const stats = byggPH16Stats({ navn: "Øyvind Rohjan", runder, tmSlag: [] });
const sg = byggOmradeSg({ stats, runder, gruppe: "innspill", trening: { min: 400, okter: 7 }, treningPeriode: "7. sep.–5. okt." });
const tomStats = byggPH16Stats({ navn: "Ny spiller", runder: [], tmSlag: [] });

const DAG = 86_400_000;
const drill = (name: string, d: number) => ({ name, durationMinutes: d });
const okter: AkseOktInn[] = Array.from({ length: 16 }, (_, i) => ({
  start: new Date(naa.getTime() - (2 + i * 1.6) * DAG).toISOString(), min: 45 + (i % 3) * 15,
  status: i % 5 === 4 ? "SKIPPED" : "COMPLETED", akse: i % 4 === 3 ? "fys" : "tek",
  drills: [drill("P6.0 med pinne langs skaftet", 25), drill(i % 2 ? "P6.0 til P7.0 på 75 %" : "Speilarbeid P4.0", 20)],
}));
const akse = byggOmradeAkse(okter, "tek", naa, "7. sep.–5. okt.");

const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>{n}</PlayerHQSkall>;
export const tilstander = {
  data: skall(<PH16cOmrade data={{ type: "sg", sg, fokusHref: "/portal/coach/melding?type=fokus&omrade=sg-approach" }} />),
  akse: skall(<PH16cOmrade data={{ type: "akse", akse }} />),
  putting: skall(<PH16cOmrade data={{ type: "sg", sg: byggOmradeSg({ stats, runder, gruppe: "putt", trening: null, treningPeriode: "7. sep.–5. okt." }), fokusHref: "#" }} />),
  tom: skall(<PH16cOmrade data={{ type: "sg", sg: byggOmradeSg({ stats: tomStats, runder: [], gruppe: "innspill", trening: null, treningPeriode: "7. sep.–5. okt." }), fokusHref: "#" }} />),
  "akse-tom": skall(<PH16cOmrade data={{ type: "akse", akse: byggOmradeAkse([], "fys", naa, "7. sep.–5. okt.") }} />),
  laster: skall(<TmLaster tekst="Henter området" />),
  feil: skall(<SdFeil tittel="Området kunne ikke hentes" tekst="Rundene og øktene dine er trygge. Prøv igjen om litt." reset={() => {}} />),
};
