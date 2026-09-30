/** Prøvefil for PH-RD-02/03/04/05/08 Runde live (oppsett, slag, putt, hurtig, SG hittil, ferdig). Syntetiske data. */
import { PHRDLive } from "@/components/portal/precision/PHRDLive";
import { PH08RundeLive, type UtkastSlag } from "@/components/portal/precision/PH08RundeLive";
import { PHRD08Ferdig } from "@/components/portal/precision/PHRD08Ferdig";
import type { LoggetHull } from "@/lib/runde-logg/types";
import { syntetiserHurtigHull } from "@/lib/runde-logg/syntetiser-hurtig";

export const sti = "/portal/runde/live";
export const natt = ["slag", "slag-tom", "slag-laster", "slag-feil", "putt", "hurtig", "sg", "sg-tom", "ferdig", "ferdig-delvis", "ferdig-feil", "ferdig-tom"];

const baner = [{ id: "b1", name: "Fredrikstad Golfklubb med et langt banenavn som må brytes" }, { id: "b2", name: "Borregaard GK" }];
const pars = [4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4];
const lengder = [352, 488, 151, 340, 361, 148, 470, 355, 330, 349, 358, 160, 492, 344, 366, 139, 481, 352];
const oppsett = { courseId: "b1", courseNavn: "Fredrikstad Golfklubb", roundType: "turnering" as const, hullValg: "18" as const, playedAt: "2026-09-26" };
const hull = (n: number): LoggetHull[] => pars.map((par, i) => i < n
  ? syntetiserHurtigHull({ holeNumber: i + 1, par, lengdeMeter: lengder[i], strokes: par + (i % 3 === 0 ? 1 : 0) })
  : { holeNumber: i + 1, par, lengdeMeter: lengder[i], slag: [] });

const utkast: UtkastSlag[] = [
  { id: "s1", dist: 352, lie: "TEE", club: "Driver", pen: 0, putt: null },
  { id: "s2", dist: 148, lie: "FAIRWAY", club: "8i", pen: 0, putt: null },
  { id: "s3", dist: 28, lie: "GREEN", club: "Putter", pen: 0, putt: { brk: "VENSTRE_HOYRE", hel: "SVAK", res: "miss", fart: "Kort", miss: "Venstre" } },
];
const spilte = [{ par: 4, slag: 5 }, { par: 5, slag: 5 }, { par: 3, slag: 3 }, { par: 4, slag: 5 }];
const no = () => {};
const Live = (p: Partial<React.ComponentProps<typeof PH08RundeLive>>) => <PH08RundeLive tilstand="data" tema="night" bane="Fredrikstad Golfklubb" hullNr={5} antallHull={18} par={4} lengdeMeter={361} spilte={spilte} onFerdigHull={no} onAvslutt={no} onTilbake={no} {...p} />;
const Ferdig = (p: Partial<React.ComponentProps<typeof PHRD08Ferdig>>) => <PHRD08Ferdig courseId="b1" courseNavn="Fredrikstad Golfklubb" playedAt="2026-09-26" roundType="turnering" hullData={hull(18)} onTilbake={no} onLagret={no} {...p} />;

export const tilstander = {
  oppsett: <PHRDLive baner={baner} />,
  "oppsett-kladd": <PHRDLive baner={baner} prove={{ steg: "oppsett", kladd: true }} />,
  "oppsett-tom": <PHRDLive baner={[]} />,
  slag: <Live utkast={utkast.slice(0, 2)} />,
  "slag-tom": <Live hullNr={1} spilte={[]} lengdeMeter={352} par={4} />,
  "slag-laster": <Live tilstand="laster" />,
  "slag-feil": <Live tilstand="feil" feilKode="FRAKOBLET · 11:20 · 38 SLAG LOKALT" />,
  putt: <Live utkast={utkast} />,
  hurtig: <PHRDLive baner={baner} prove={{ steg: "foring", modus: "hurtig", oppsett, hullData: hull(6), idx: 6 }} />,
  sg: <PHRDLive baner={baner} prove={{ steg: "foring", modus: "hurtig", visning: "sg", oppsett, hullData: hull(6), idx: 6 }} />,
  "sg-tom": <PHRDLive baner={baner} prove={{ steg: "foring", modus: "hurtig", visning: "sg", oppsett, hullData: hull(0), idx: 0 }} />,
  ferdig: <Ferdig />,
  "ferdig-delvis": <Ferdig hullData={hull(11)} />,
  "ferdig-feil": <Ferdig startFeil="Fikk ikke kontakt. Slagene ligger trygt på telefonen. Prøv igjen når du har dekning." />,
  "ferdig-tom": <Ferdig hullData={hull(0)} />,
};
