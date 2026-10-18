/** Prøvefil for Del runde (pakke 13). Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH18DelRunde } from "@/components/portal/precision/PH18DelRunde";
import { TmLaster } from "@/components/portal/precision/PH17TmFelles";
import { SdFeil } from "@/components/portal/precision/PHStatsDybdeFelles";
import { byggDelRunde } from "@/lib/portal-analyse/del-runde";

export const sti = "/portal/statistikk/runder/r1/del";
const hull = Array.from({ length: 18 }, (_, i) => ({ nr: i + 1, par: [4, 4, 3, 5][i % 4]!, slag: [4, 5, 3, 4][i % 4]! }));
const d = byggDelRunde({ id: "r1", score: hull.reduce((a, h) => a + h.slag, 0), playedAt: new Date("2026-10-04T10:00:00Z"), bane: "Fredrikstad GK", sg: { ott: 0.4, app: -0.6, arg: 0.1, putt: 0.3 }, hull, sharedWithCoach: true });
const uten = byggDelRunde({ id: "r2", score: 81, playedAt: new Date("2026-09-20T10:00:00Z"), bane: "Gamle Fredrikstad Golfklubb", sg: { ott: null, app: null, arg: null, putt: null }, hull: [], sharedWithCoach: false });
const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>{n}</PlayerHQSkall>;
export const tilstander = {
  data: skall(<PH18DelRunde d={d} spiller="Øyvind Rohjan" />),
  "uten-hull": skall(<PH18DelRunde d={uten} spiller="Øyvind Rohjan" />),
  laster: skall(<TmLaster tekst="Henter runden" />),
  feil: skall(<SdFeil tittel="Runden kunne ikke hentes" tekst="Runden din er trygg. Prøv igjen om litt." reset={() => {}} />),
};
