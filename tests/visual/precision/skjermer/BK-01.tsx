/** Prøvefil for BK-01 Velg tjeneste. Syntetiske data. */
import { BK01Booking, type BK01Props } from "@/components/booking/precision/BK01Booking";

export const sti = "/booking";

const base: BK01Props = {
  lokasjon: "Gamle Fredrikstad GK",
  tjenester: [
    { slug: "pt60", navn: "Privattime", coachNavn: null, pris: 950, varighetMin: 60, beskrivelse: "Én spiller, én coach. Studio 1 eller bane." },
    { slug: "pt30", navn: "Privattime", coachNavn: null, pris: 550, varighetMin: 30, beskrivelse: "Kort økt med ett fokus." },
    { slug: "bane", navn: "Banecoaching 9 hull med et langt navn som må brytes riktig", coachNavn: "Anders", pris: 1900, varighetMin: 150, beskrivelse: "Strategi og slagvalg på banen." },
    { slug: "flex", navn: "Flex 20 min", coachNavn: null, pris: 350, varighetMin: 20, beskrivelse: null },
  ],
  abonnement: [{ slug: "perf", navn: "Performance", coachNavn: null, pris: 1490, beskrivelse: null }],
};

export const tilstander = {
  data: <BK01Booking {...base} />,
  tom: <BK01Booking {...base} tjenester={[]} abonnement={[]} />,
};

const dager = [["man", "28.9", ["15:00", "16:00", "18:00"]], ["tir", "29.9", ["17:00"]], ["ons", "30.9", ["14:00", "15:00"]], ["tor", "1.10", ["18:00", "19:00"]], ["fre", "2.10", []], ["lør", "3.10", ["13:00", "14:00"]], ["søn", "4.10", []]]
  .map(([dw, dd, t]) => ({ dw: dw as string, dd: dd as string, navn: `${dw} ${dd}`, tider: (t as string[]).map((kl) => ({ kl, startIso: `2026-09-28T${kl}:00Z`, coachId: "c1" })) }));
const fra = (steg: number, extra = {}) => <BK01Booking {...base} forhandsvis={{ steg, slug: "pt60", dager, ...extra }} />;
Object.assign(tilstander, {
  tid: fra(1),
  "tid-valgt": fra(1, { dag: "29.9", kl: "17:00" }),
  "tid-ingen": <BK01Booking {...base} forhandsvis={{ steg: 1, slug: "pt60", dager: dager.map((d) => ({ ...d, tider: [] })) }} />,
  deg: fra(2, { dag: "29.9", kl: "17:00", skjema: { navn: "Anders Kristiansen", epost: "demo@example.no", tlf: "911 22 110", barn: true, spiller: "Øyvind Rohjan" } }),
  "deg-feil": fra(2, { dag: "29.9", kl: "17:00", feil: { navn: "Skriv fullt navn.", epost: "Skriv en gyldig e-postadresse. Bekreftelsen sendes dit.", tlf: "Skriv et telefonnummer vi kan nå deg på." } }),
  betal: fra(3, { dag: "29.9", kl: "17:00" }),
  laster: fra(1, { tilstand: "laster" }),
  feil: fra(1, { tilstand: "feil" }),
});
