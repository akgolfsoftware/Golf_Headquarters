/** Prøvefil for PH-01 I dag i nytt design (designløftet 20.10, canvaset «PlayerHQ nøkkelskjermer»). Syntetiske data fra utkastet: mandag 5. oktober 2026, uke 41. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH01IDag, type PH01Props } from "@/components/portal/precision/PH01IDag";
import { PH01IDagLaster } from "@/components/portal/precision/PH01IDagLaster";
import { OKT_BILDER } from "@/lib/portal/okt-bilde";

export const sti = "/portal";

const base: PH01Props = {
  tilstand: "data",
  dato: "Mandag 5. oktober · Grunnperiode, uke 3 av 8",
  fornavn: "Øyvind",
  ingress: "2 økter, 2 t totalt.",
  tomTekst: "Du har ingen økter mandag 5. oktober.",
  feilKode: "Feil · I dag · 14:20",
  okter: [
    { id: "o1", tid: "15:30", slutt: "16:45", tittel: "Innspill og nærspill", akse: "slag", sted: "Range 3 · Fredrikstad GK", min: 75, antallOvelser: 4,
      fokus: "Lengdekontroll fra 50–150 m", status: "Planlagt", href: "#", bilde: OKT_BILDER.innspill, om: "Om 1 t 10 min",
      ovelser: [{ navn: "Avstandsstige 50–90 m", min: 10 }, { navn: "Lengdekontroll 70, 85 og 100 m", min: 25 }, { navn: "Startretning med PW", min: 20 }, { navn: "Up and down fra 10–20 m", min: 20 }] },
    { id: "o2", tid: "17:30", slutt: "18:15", tittel: "Styrke bein og kjerne", akse: "fys", sted: "Styrkerommet", min: 45, antallOvelser: 4, fokus: null,
      status: "Planlagt", href: "#", bilde: OKT_BILDER.fys, om: "Om 3 t 10 min", ovelser: [] },
  ],
  nesteId: "o1",
  godkjenninger: [{ id: "g1", tittel: "Bunkerslag 20–40 m", tid: "18:30", min: 45, akse: "slag", sted: "Bunker · Fredrikstad GK", fraGruppe: false }],
  uka: { uke: 41, gjortMin: 0, planMin: 845, akser: [
    { akse: "fys", gjortMin: 0, planMin: 90 }, { akse: "tek", gjortMin: 0, planMin: 180 }, { akse: "slag", gjortMin: 0, planMin: 225 },
    { akse: "spill", gjortMin: 0, planMin: 350 }, { akse: "turn", gjortMin: 0, planMin: 0 }] },
  maal: [
    { id: "m1", tittel: "HCP under 3,0", kategori: "Resultatmål", frist: "31. mai 2027", pct: 50, status: "on-track", href: "#" },
    { id: "m2", tittel: "SG Innspill til 0,0", kategori: "Resultatmål", frist: "31. mai 2027", pct: 25, status: "behind", href: "#" },
  ],
  forbedring: [
    { kode: "APP", navn: "Innspill", akse: "slag", verdi: -0.9, trend: [-1.2, -1.1, -1.3, -1, -1, -0.9, -0.9], runder: 12, forelopigTil: null },
    { kode: "ARG", navn: "Nærspill", akse: "slag", verdi: -0.4, trend: [-0.4, -0.5, -0.3, -0.4, -0.4, -0.5, -0.4], runder: 12, forelopigTil: 24 },
  ],
  etterlevelse: { pct: 92, gjortMin: 2890, planMin: 3140, periode: "siste fire uker, 7. sep.–4. okt." },
  fireukerssjekk: { href: "#" },
  dagsform: 4,
  agenda: [{ id: "a1", time: "08:15", title: "Skole", meta: "SKOLE", axis: null, hollow: true }, { id: "a2", time: "15:30", title: "Innspill og nærspill", meta: "ØKTER", axis: "slag" }],
  fys: { tittel: "Styrke bein og kjerne", meta: "Grunnstyrke · uke 3 · 45 min", rader: [["Knebøy", "4 × 6", "80 kg"], ["Utfall", "3 × 8", "—"]], href: "#" },
  turn: { dager: 12, tittel: "Srixon Tour 6", sted: "Larvik GK", meta: "17.10.2026", href: "#" },
  fullfort: { uke: 41, gjennomfort: 0, totalt: 11, igjen: 11, hoppetOver: 0, total: 64, totalKilde: "Øktlogg · 64 økter siden 03.08.2026", milepaeler: [{ antall: 10, naadd: "14.08" }, { antall: 50, naadd: "22.09" }, { antall: 100, naadd: null }] },
  popup: null,
  snitt: { verdi: 76.4, endring: -0.8, trend: [78, 77, 75, 79, 76, 77, 74, 76, 77, 75], dato: "03.10" },
  dager: [
    { kort: "Man", iDag: true, segmenter: [{ akse: "slag", min: 75, gjort: false }, { akse: "fys", min: 45, gjort: false }] },
    { kort: "Tir", iDag: false, segmenter: [{ akse: "tek", min: 60, gjort: false }, { akse: "fys", min: 45, gjort: false }] },
    { kort: "Ons", iDag: false, segmenter: [{ akse: "tek", min: 60, gjort: false }] },
    { kort: "Tor", iDag: false, segmenter: [{ akse: "tek", min: 60, gjort: false }, { akse: "slag", min: 60, gjort: false }] },
    { kort: "Fre", iDag: false, segmenter: [{ akse: "slag", min: 90, gjort: false }] },
    { kort: "Lør", iDag: false, segmenter: [{ akse: "spill", min: 350, gjort: false }] },
    { kort: "Søn", iDag: false, segmenter: [] },
  ],
  nesteOkt: { dag: "Tir 6", tid: "16:00", tittel: "Svingplan P6.0", akse: "tek", min: 60, sted: "Mulligan", antallOvelser: 4, href: "#" },
  melding: { fra: "Anders Kristiansen", tekst: "Last opp TrackMan-fila etter økta i dag, så ser jeg på spredningen.", tid: "05.10 09:40", href: "#" },
  sg: { runder: 12, dato: "03.10", verdier: [{ navn: "Utslag", verdi: 0.3 }, { navn: "Innspill", verdi: -0.9 }, { navn: "Nærspill", verdi: -0.4 }, { navn: "Putting", verdi: 0.1 }] },
};

const Vis = (p: Partial<PH01Props>) => <PlayerHQSkall innboksHref="#" uleste={2}><PH01IDag {...base} {...p} /></PlayerHQSkall>;

export const tilstander = {
  data: <Vis />,
  utenForslag: <Vis godkjenninger={[]} />,
  tom: <Vis tilstand="tom" ingress="Ingen økter i dag." okter={[]} nesteId={null} godkjenninger={[]} uka={null} maal={[]} forbedring={[]} etterlevelse={null} fireukerssjekk={null} agenda={[]} fys={null} turn={null} fullfort={null} dagsform={null} snitt={null} dager={[]} nesteOkt={null} melding={null} sg={null} />,
  laster: <PlayerHQSkall innboksHref="#" uleste={0}><PH01IDagLaster /></PlayerHQSkall>,
  feil: <Vis tilstand="feil" />,
};
