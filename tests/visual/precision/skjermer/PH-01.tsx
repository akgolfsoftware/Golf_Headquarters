/** Prøvefil for PH-01 I dag. Syntetiske data, ingen ekte spillere. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH01IDag, type PH01Props } from "@/components/portal/precision/PH01IDag";

export const sti = "/portal";

const base: PH01Props = {
  tilstand: "data",
  kicker: "Mandag 28.09 · Uke 40",
  tittel: "God morgen, Testspiller",
  sub: "2 økter i dag · 1 igjen · neste 14:30",
  tomTekst: "Du har ingen økter mandag 28.09.",
  feilKode: "FEIL · I DAG · 08:00",
  okter: [
    { id: "o1", tid: "08:00", slutt: "09:00", tittel: "Wedge 50–90 m", akse: "slag", sted: "Range", min: 60, antallOvelser: 4, fokus: "Avstandskontroll", status: "Gjennomført", href: "#" },
    { id: "o2", tid: "14:30", slutt: "15:45", tittel: "Putting under press med et langt navn som må brytes", akse: "spill", sted: "Puttinggreen", min: 75, antallOvelser: 5, fokus: null, status: "Planlagt", href: "#" },
  ],
  nesteId: "o2",
  godkjenninger: [],
  dagsform: null,
  agenda: [{ id: "a1", time: "14:30", title: "Putting", meta: "ØKTER", axis: "spill" }],
  fys: null, turn: null, trening: null, fullfort: null, popup: null,
};

const Vis = (p: Partial<PH01Props>) => <PlayerHQSkall innboksHref="#" uleste={3}><PH01IDag {...base} {...p} /></PlayerHQSkall>;

export const tilstander = {
  data: <Vis />,
  tom: <Vis tilstand="tom" okter={[]} agenda={[]} />,
  feil: <Vis tilstand="feil" />,
};
