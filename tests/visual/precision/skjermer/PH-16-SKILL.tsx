/** Prøvefil for Skill map (pakke 13). Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH16bSkillMap } from "@/components/portal/precision/PH16bSkillMap";
import { TmLaster } from "@/components/portal/precision/PH17TmFelles";
import { SdFeil } from "@/components/portal/precision/PHStatsDybdeFelles";
import { byggPH16Stats, type PH16RundeInn } from "@/lib/portal-analyse/ph16-stats-data";

export const sti = "/portal/analysere/skill-map";

const runder: PH16RundeInn[] = Array.from({ length: 12 }, (_, i) => ({
  id: `r${i}`, playedAt: new Date(Date.UTC(2026, 9, 4 - i * 10)), score: 73, roundType: "trening", courseName: "Fredrikstad GK",
  sgTotal: -1.2, sgSource: "beregnet", benchmarkLevelSnapshot: "PGA_TOUR", holeScores: Array.from({ length: 18 }, () => ({ par: 4 })),
  sgTee: -0.3, sgApp200: -0.4, sgApp150: -0.6, sgApp100: -0.9 + i * 0.02, sgApp50: -0.4,
  sgChip: -0.2, sgPitch: -0.3, sgLob: i < 5 ? -0.1 : null, sgBunker: -0.2,
  sgPutt0_3: 0, sgPutt3_5: -0.1, sgPutt5_10: -0.2, sgPutt10_15: -0.05, sgPutt15_25: 0, sgPutt25_40: -0.1, sgPutt40plus: i < 2 ? 0 : null,
}));
const data = byggPH16Stats({ navn: "Øyvind Rohjan", runder, tmSlag: [] });
const g = (antall: number) => ({ antall, periode: antall ? "2. jun.–4. okt." : null });
const grunnlag = { tee: g(12), innspill: g(12), naer: g(12), putt: g(12) };

const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>{n}</PlayerHQSkall>;
export const tilstander = {
  data: skall(<PH16bSkillMap data={data} grunnlag={grunnlag} />),
  tom: skall(<PH16bSkillMap data={byggPH16Stats({ navn: "Ny", runder: [], tmSlag: [] })} grunnlag={{ tee: g(0), innspill: g(0), naer: g(0), putt: g(0) }} />),
  laster: skall(<TmLaster tekst="Henter skill map" />),
  feil: skall(<SdFeil tittel="Skill map kunne ikke hentes" tekst="Rundene dine er trygge. Prøv igjen om litt." reset={() => {}} />),
};
