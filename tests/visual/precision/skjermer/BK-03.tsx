/** Prøvefil for BK-03 Kvittering. Syntetiske data (demo: Anders Kristiansen). */
import { BK03Kvittering, type BK03Detaljer } from "@/components/marketing/precision/BK03Kvittering";

export const sti = "/booking/kvittering/demo";
export const natt = ["data-natt"];

const detaljer: BK03Detaljer = {
  ref: "#a1b2c3d4", tjeneste: "Privattime 60 min", tid: "tirsdag 29. september 2026 · 17:00–18:00", sted: "Mulligan Indoor Golf, Fredrikstad",
  coach: "Anders Kristiansen", betalt: "950 kr", betaltVedStripe: true, epost: "demo@example.no",
  fristTekst: "GRATIS AVBESTILLING TIL MANDAG 28.09.2026 KL. 17:00 (24 TIMER FØR)",
  ics: { start: "20260929T170000", slutt: "20260929T180000", tittel: "Privattime · AK Golf", sted: "Studio 1", fil: "ak-golf-a1b2c3d4" },
};
const base = { innlogget: false, signupHref: "/auth/signup?epost=demo%40example.no", detaljer };

export const tilstander = {
  data: <BK03Kvittering {...base} tilstand="data" />,
  "data-innlogget": <BK03Kvittering {...base} innlogget tilstand="data" />,
  "data-natt": <BK03Kvittering {...base} tilstand="data" />,
  "data-lang": <BK03Kvittering {...base} tilstand="data" detaljer={{ ...detaljer, tjeneste: "Banecoaching med et veldig langt navn som må brytes 150 min", sted: "Gamle Fredrikstad Golfklubb, Bossum, Fredrikstad", epost: "et.veldig.langt.navn.som.ma.brytes@eksempel-domene.no" }} />,
  pending: <BK03Kvittering {...base} tilstand="pending" />,
  tom: <BK03Kvittering {...base} tilstand="tom" detaljer={null} />,
  feil: <BK03Kvittering {...base} tilstand="feil" detaljer={null} />,
  laster: <BK03Kvittering {...base} tilstand="laster" detaljer={null} />,
};
