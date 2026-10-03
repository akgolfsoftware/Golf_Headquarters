/** Prøvefil for PH-24 Meg. Syntetiske data, demo: Øyvind Rohjan. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH24Meg, type PH24Props } from "@/components/portal/precision/PH24Meg";

export const sti = "/portal/meg";
export const natt = ["data-natt"];

const hrefs: PH24Props["hrefs"] = { profil: "#", fasiliteter: "#", book: "#", bookinger: "#", abo: "#", foreldre: "#", deling: "#", fravaer: "#", helse: "#", utstyr: "#", utfordringer: "#", venner: "#", hjelp: "#", innstillinger: "#", mal: "#", personvern: "#" };
const base: PH24Props = {
  tilstand: "data",
  profil: { navn: "Øyvind Rohjan", alder: 17, klubb: "Gamle Fredrikstad Golfklubb med et langt navn", fodt: "14.03.2009", hcp: "3,4", golfId: "123-4567", epost: "oyvind.rohjan@eksempel.no", telefon: "900 00 000" },
  fasiliteter: [{ id: "1", navn: "Mulligan Indoor Golf" }, { id: "2", navn: "GFGK range og puttinggrønn" }],
  bookinger: [
    { id: "b1", tittel: "Privattime 60 min", status: { tekst: "Bekreftet", tone: "ok" }, meta: "02.10 KL 16:00 · MULLIGAN INDOOR GOLF" },
    { id: "b2", tittel: "Trackman-økt", status: { tekst: "Venter på betaling", tone: "neutral" }, meta: "09.10 KL 17:00 · MULLIGAN" },
  ],
  klipp: { igjen: 3, totalt: 4, fornyes: "01.11.2026" },
  abo: { plan: "Performance Pro", fornyes: "01.11.2026", pris: null },
  foreldre: [{ id: "f1", tittel: "Kari Rohjan", meta: "MOR · KARI.ROHJAN@EKSEMPEL.NO" }],
  helse: { samtykke: true, sovnSnitt: "7,6 t", skadeNa: false, fravaer: [{ id: "l1", tittel: "Sykdom · 12.09–14.09", status: { tekst: "Avsluttet", tone: "neutral" }, meta: "FORKJØLET" }] },
  utstyr: [{ kode: "Dr", spec: "TaylorMade Qi10 9°", carry: null }, { kode: "Jn", spec: "Titleist T100 4-PW", carry: null }, { kode: "Pt", spec: "Scotty Cameron", carry: null }],
  utstyrMalt: null,
  coach: { navn: "Anders Kristiansen", program: "AK Golf Academy", siden: "AUGUST 2025" },
  venner: 6,
  utfordringer: [{ id: "u1", tittel: "Færrest putter på 9 hull med et langt navn", status: { tekst: "Pågår", tone: "neutral" }, meta: "SLUTT 05.10.2026 · TELLER IKKE SOM TRENING" }],
  hrefs,
};
const tom: Partial<PH24Props> = {
  profil: { navn: "Øyvind Rohjan", alder: null, klubb: null, fodt: null, hcp: null, golfId: null, epost: "oyvind.rohjan@eksempel.no", telefon: null },
  fasiliteter: [], bookinger: [], klipp: null, abo: { plan: "TALENT · gratis", fornyes: null, pris: null }, foreldre: [],
  helse: { samtykke: false, sovnSnitt: null, skadeNa: false, fravaer: [] }, utstyr: [], coach: null, venner: 0, utfordringer: [],
};
const Vis = (p: Partial<PH24Props>) => <PlayerHQSkall innboksHref="#" uleste={0}><PH24Meg {...base} {...p} /></PlayerHQSkall>;
export const tilstander = {
  data: <Vis />,
  "data-natt": <Vis />,
  tom: <Vis {...tom} />,
  feil: <Vis tilstand="feil" ukjentKode="FEIL 503 · PROFIL" />,
};
