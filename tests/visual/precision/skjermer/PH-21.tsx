/** Prøvefil for PH-21 Innboks. Syntetiske data (demo: Øyvind Rohjan / Anders Kristiansen). */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH21Ramme, PH21Meldinger, PH21SporsmalFane, PH21Tilbakemeldinger, PH21Videoer, PH21Planer, PH21Onske, type PH21Fane, type PH21Tilstand } from "@/components/portal/precision/PH21Innboks";

export const sti = "/portal/coach";
export const natt = ["meldinger-natt", "onske-natt"];

const ingen = async () => {};
const boble = (id: string, meg: boolean, tekst: string, tid: string) => ({ id, meg, tekst, tid });
const trad = [
  boble("1", false, "Hei Øyvind. Jeg la inn en kort putteøkt før torsdag, og en lang tekst uten mellomrom for å teste brekking: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "25.09 · 18:02"),
  boble("2", true, "Takk. Skal jeg bruke samme ballkvalitet på treningsbanen?", "26.09 · 07:41"),
];

function Vis({ fane, tilstand = "data", children }: { fane: PH21Fane; tilstand?: PH21Tilstand; children?: React.ReactNode }) {
  return <PlayerHQSkall innboksHref="#" uleste={2}><PH21Ramme aktiv={fane} coachNavn="Anders Kristiansen" tilstand={tilstand}>{children}</PH21Ramme></PlayerHQSkall>;
}
const msg = (m = trad) => <Vis fane="msg"><PH21Meldinger coachId="c1" coachNavn="Anders Kristiansen" meldinger={m} send={ingen} kanSende /></Vis>;
const q = (mine = [{ id: "a", tittel: "Hvordan varmer jeg opp før tidlig start, med et langt tema som må brytes pent på mobil?", besvart: false, tid: "26.09.2026" }, { id: "b", tittel: "Ballposisjon i wedge", besvart: true, tid: "20.09.2026" }]) => <Vis fane="q"><PH21SporsmalFane mine={mine} sendt still={ingen} /></Vis>;
const fb = (l = [{ oktId: "o1", tittel: "Putting 3 m · 10 slag", dato: "24.09.2026", snippet: "Fin rytme, hold blikket på ballen etter treff." }]) => <Vis fane="fb"><PH21Tilbakemeldinger liste={l} /></Vis>;
const vid = (v = [{ id: "v1", tittel: "Driver bakfra", coach: "Anders Kristiansen", dato: "22.09.2026", varighet: "1:30", bilde: null }, { id: "v2", tittel: "Wedge 50 m med lang tittel som må brytes", coach: "Anders Kristiansen", dato: "18.09.2026", varighet: "0:45", bilde: null }]) => <Vis fane="vid"><PH21Videoer videoer={v} hentUrl={async () => "#"} /></Vis>;
const plan = (p = [{ id: "p1", navn: "Uke 40 · Spesialisering", periode: "28.09.2026 – 04.10.2026", fullfort: 1, total: 5, status: "Aktiv" as const }, { id: "p2", navn: "Uke 39", periode: "21.09.2026 – 27.09.2026", fullfort: 4, total: 4, status: "Fullført" as const }]) => <Vis fane="plan"><PH21Planer planer={p} /></Vis>;
const onske = <Vis fane="onske"><PH21Onske coachNavn="Anders Kristiansen" coachId="c1" iDag="2026-09-30" send={ingen} /></Vis>;

export const tilstander = {
  meldinger: msg(),
  "meldinger-natt": msg(),
  "meldinger-tom": msg([]),
  sporsmal: q(),
  "sporsmal-tom": q([]),
  tilbakemelding: fb(),
  "tilbakemelding-tom": fb([]),
  videoer: vid(),
  "videoer-tom": vid([]),
  planer: plan(),
  "planer-tom": plan([]),
  onske: onske,
  "onske-natt": onske,
  laster: <Vis fane="msg" tilstand="laster" />,
  feil: <Vis fane="msg" tilstand="feil" />,
};

import { PH21Varsler, type PH21Varsel } from "@/components/portal/precision/PH21Innboks";
const v = (id: string, k: PH21Varsel["kategori"], tittel: string, ulest: boolean, gruppe: PH21Varsel["gruppe"]): PH21Varsel => ({ id, kategori: k, tittel, tekst: "Anders la inn en ny øktplan for uke 40 med et langt navn som må brytes pent på smal skjerm.", tid: "08:14", ulest, lenke: null, gruppe });
const varslerListe = [v("1", "coach", "Ny melding fra Anders", true, "I dag"), v("2", "timer", "Time i morgen 16:00", false, "Denne uka"), v("3", "tester", "Test forfaller", false, "Tidligere")];
const Var = (p: { l?: PH21Varsel[]; t?: PH21Tilstand }) => <PlayerHQSkall innboksHref="#" uleste={1}><PH21Varsler varsler={p.l ?? varslerListe} lesVarsel={ingen} lesAlle={ingen} tilstand={p.t} /></PlayerHQSkall>;
Object.assign(tilstander, { varsler: <Var />, "varsler-natt": <Var />, "varsler-tom": <Var l={[]} />, "varsler-laster": <Var t="laster" />, "varsler-feil": <Var t="feil" /> });
natt.push("varsler-natt");
