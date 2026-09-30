/** Prøvefil for PH-03 Øktark. Syntetiske data, ingen ekte spillere. */
import { Play, SkipForward } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { Knapp, KnappLenke } from "@/components/precision/pa";
import { PH03Oktark, type PH03Props } from "@/components/portal/precision/PH03Oktark";

export const sti = "/portal/gjennomfore/x";
export const natt = ["pagar"];

const base: PH03Props = {
  tilstand: "data",
  kicker: "Lørdag 26.09 · Uke 39 · 09:00–10:15 · Range 3",
  tittel: "Wedge 50–90 m med et langt navn som må brytes pent",
  status: "Planlagt",
  ovelser: [
    { id: "e1", akse: "slag", navn: "Avstandskontroll 60 m", kode: "SLAG_RANGE_LAV-HAST_ALENE", mengde: "20 slag", min: 15, gjort: null },
    { id: "e2", akse: "tek", navn: "Vinkel på slagflaten", kode: "TEK_RANGE_UTEN-BALL_ALENE", mengde: "3 sett", min: 20, gjort: null },
    { id: "e3", akse: "spill", navn: "Wedge mot mål under press", kode: null, mengde: null, min: null, gjort: null },
  ],
  nokler: [["Fokus", "Avstandskontroll"], ["Belastning", "Treningsområde"], ["Press", "Alene"], ["Mål", "Bedre avstandskontroll"], ["Coach", "Anders Kristiansen"], ["Varighet", "1 t 15 min"], ["Sted", "Range 3"]],
  notatTittel: "Fra coach",
  notat: { tekst: "Hold rytmen jevn. Logg hvert femte slag og noter hvilken kølle du bruker.", kilde: "ANDERS KRISTIANSEN" },
  tilbake: { href: "#", label: "Plan" },
  handlinger: <>
    <KnappLenke href="#" icon={Play} iconName="play">Start økt</KnappLenke>
    <Knapp variant="ghost" icon={SkipForward} iconName="skip-forward">Hopp over</Knapp>
  </>,
  feilKode: "FEIL · ØKT · 1A2B3C4D",
};

const Vis = (p: Partial<PH03Props>) => <PlayerHQSkall innboksHref="#" uleste={0}><PH03Oktark {...base} {...p} /></PlayerHQSkall>;

export const tilstander = {
  data: <Vis />,
  pagar: <Vis status="Pågår" statusMeta="3 ØVELSER" />,
  gjennomfort: <Vis status="Gjennomført" statusMeta="2 AV 3 ØVELSER" ovelser={base.ovelser.map((o, i) => ({ ...o, gjort: i < 2 }))} />,
  tom: <Vis ovelser={[]} notat={null} nokler={[["Målsetning", null], ["Varighet", "1 t 15 min"]]} />,
  feil: <Vis tilstand="feil" />,
};
