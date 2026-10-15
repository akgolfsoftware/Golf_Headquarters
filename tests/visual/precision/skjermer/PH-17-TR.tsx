/** Prøvefil for PH-17 Trening (pakke 6). Syntetiske data, i dag 5. oktober 2026. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH17Trening } from "@/components/portal/precision/PH17Trening";
import { TmLaster } from "@/components/portal/precision/PH17TmFelles";
import { SdFeil } from "@/components/portal/precision/PHStatsDybdeFelles";
import type { TreningOkt } from "@/lib/portal-analyse/trening-stats";

export const sti = "/portal/analysere?del=tren";

const NAA = "2026-10-05T12:20:00Z";
const STED = ["Range", "Simulator", "Styrkerom", "Nærspillsområde", "Golfbane"];
const AKSER: TreningOkt["akse"][] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const okter: TreningOkt[] = Array.from({ length: 34 }, (_, i) => {
  const akse = AKSER[i % 5]!;
  return {
    start: new Date(Date.parse(NAA) - (i + 1) * 18 * 3_600_000).toISOString(),
    min: akse === "SPILL" ? 120 : akse === "TURN" ? 60 : 75,
    status: akse === "SPILL" && i % 2 ? "SKIPPED" : i % 7 === 3 ? "PLANNED" : "COMPLETED",
    akse,
    sted: akse === "FYS" ? "Styrkerom" : akse === "SPILL" ? "Golfbane" : i % 9 === 0 ? null : STED[i % 2]!,
  } as TreningOkt;
});

const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>{n}</PlayerHQSkall>;
export const tilstander = {
  data: skall(<PH17Trening data={{ okter, naa: NAA, periode: "7. sep.–5. okt.", tm: { okter: 4, slag: 312 } }} />),
  "uten-trackman": skall(<PH17Trening data={{ okter: okter.slice(0, 6), naa: NAA, periode: "7. sep.–5. okt.", tm: null }} />),
  tom: skall(<PH17Trening data={{ okter: [], naa: NAA, periode: "7. sep.–5. okt.", tm: null }} />),
  laster: skall(<TmLaster tekst="Henter treningen" />),
  feil: skall(<SdFeil tittel="Treningen kunne ikke hentes" tekst="Øktene dine er trygge. Prøv igjen om litt." reset={() => {}} />),
};
