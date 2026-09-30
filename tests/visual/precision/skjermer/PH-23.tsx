/** Prøvefil for PH-23 Booking (spiller). Syntetiske data: demospiller Øyvind Rohjan, coach Anders Kristiansen. */
import { useEffect, type ReactNode } from "react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import {
  PH23Anlegg, PH23Bekreft, PH23Bookinger, PH23Bytt, PH23Coach, PH23Detalj, PH23Hub, PH23Kvittering, PH23Ny,
  type PH23Klipp, type PH23Rad,
} from "@/components/portal/precision/PH23Booking";
import type { BookingNyV2Data } from "@/components/portal/v2/BookingNyV2";
import type { BookingNyBekreftV2Data } from "@/components/portal/v2/BookingNyBekreftV2";

export const sti = "/portal/booking";
export const natt = ["hub-natt", "ny-tid-natt", "bekreft-natt"];

const klipp: PH23Klipp = { total: 4, igjen: 3, pakke: "Performance Pro", fornyesTekst: "1. okt." };
const ingenKlipp: PH23Klipp = { total: 0, igjen: 0, pakke: null, fornyesTekst: null };
const rad = (id: string, o: Partial<PH23Rad> = {}): PH23Rad => ({
  id, tjeneste: "Privattime", dato: "Man 5. okt.", kl: "15:00", varighetMin: 60, sted: "Gamle Fredrikstad Golfklubb", coach: "Anders Kristiansen",
  status: "CONFIRMED", betaling: "Klipp", kanBytte: true, kanAvbestille: true, kanRefusjon: true, href: "#", byttHref: "#", ...o,
});
const kommende = [rad("b1"), rad("b2", { tjeneste: "TrackMan-bay", dato: "Ons 7. okt.", kl: "18:00", sted: "Mulligan Indoor Golf med et langt stedsnavn som må brytes", betaling: "600 kr", status: "PENDING" }), rad("b3", { dato: "Tir 6. okt.", kanBytte: false, kanRefusjon: false })];
const tidligere = [rad("p1", { status: "COMPLETED", dato: "Man 21. sep.", kanAvbestille: false }), rad("p2", { status: "CANCELLED", dato: "Man 14. sep.", kanAvbestille: false })];
const coaches = [{ id: "c1", name: "Anders Kristiansen", initials: "AK", serviceCount: 3, fromPrice: "600 kr" }];
const forsteLedige = { serviceId: "s1", serviceName: "Privattime", datoIso: "2026-10-05", kl: "15:00", ukedagKort: "man", coachNavn: "Anders Kristiansen" };
const Skall = ({ children }: { children: ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;
// Nattema ligger på .pa-root[data-theme="night"], ikke på html: prøven setter det selv.
function NattSkall({ children }: { children: ReactNode }) {
  useEffect(() => { document.querySelectorAll(".pa-root").forEach((e) => e.setAttribute("data-theme", "night")); }, []);
  return <Skall>{children}</Skall>;
}

const hubBase = { tilstand: "data" as const, klipp, kommende, tidligere, forsteLedige, coaches, melding: null, tomForKlipp: false };

const tjenester = [
  { id: "s1", slug: "privattime", navn: "Privattime", varighetMin: 60, prisOre: 0, beskrivelse: "Individuell coaching med fokus på teknikk og spill.", stedNavn: "Gamle Fredrikstad GK" },
  { id: "s2", slug: "trackman-bay", navn: "TrackMan-bay med et ganske langt navn på tjenesten", varighetMin: 60, prisOre: 60000, beskrivelse: null, stedNavn: "Mulligan Indoor Golf" },
  { id: "s3", slug: "kort-time", navn: "Kort time", varighetMin: 30, prisOre: 0, beskrivelse: null, stedNavn: null },
];
const slotIso = (t: string) => `2026-10-05T${t}:00`;
const nyBase: BookingNyV2Data = {
  wizardBase: "/portal/booking/ny", modus: "credits", betalingGrunn: null, tjenester, valgtServiceId: "s1", valgtServiceNavn: "Privattime", valgtServiceVarighetMin: 60,
  valgtServicePrisOre: 0, datoParam: null, serviceParamSatt: false, valgtDatoIso: "2026-10-05T00:00:00", valgtDatoLang: "mandag 5. oktober", aktivtSteg: 1, isFree: false,
  slots: [], creditsRemaining: 3, monthlyCredits: 4, fornyerLabel: "01. okt.", stedNavn: "Gamle Fredrikstad GK", stedId: "l1", saldoEtter: 2, sisteCredit: false,
};
const dag = (d: number, aktiv = false) => ({ iso: `2026-10-${String(d).padStart(2, "0")}`, ukedag: ["Sø", "Ma", "Ti", "On", "To", "Fr", "Lø"][new Date(2026, 9, d).getDay()]!, dag: d, mnd: "okt.", aktiv });
const dager = Array.from({ length: 14 }, (_, i) => dag(5 + i, i === 0));
const tidData: BookingNyV2Data = {
  ...nyBase, serviceParamSatt: true, datoParam: "2026-10-05", aktivtSteg: 3,
  slots: ["09:00", "10:00", "11:30", "13:00", "15:00", "16:30"].map((t) => ({ startIso: slotIso(t), coachId: "c1", coachNavn: "Anders Kristiansen" }))
    .concat(["12:00", "14:00"].map((t) => ({ startIso: slotIso(t), coachId: "c2", coachNavn: "Markus Roinas Pedersen" }))),
};
const bekreftData: BookingNyBekreftV2Data = {
  modus: "credits", prisOre: 0, serviceTypeId: "s1", coachId: "c1", startIso: slotIso("15:00"), backHref: "#", ledig: true,
  rader: [{ label: "Økt-type", verdi: "Privattime" }, { label: "Coach", verdi: "Anders Kristiansen" }, { label: "Dato/tid", verdi: "Mandag 5. oktober · 15:00" }, { label: "Varighet", verdi: "60 min" }, { label: "Kostnad", verdi: "1 av månedens timer" }],
  creditsRemaining: 3, saldoEtter: 2,
};

const detalj = { bookingId: "b1", tjeneste: "Privattime", status: "CONFIRMED" as const, dato: "Mandag 5. oktober", tid: "15:00–16:00", varighetMin: 60, sted: "Gamle Fredrikstad Golfklubb", stedId: "l1", coachNavn: "Anders Kristiansen", coachId: "c1", notat: "Jobbe med innspill fra 100 til 130 meter.", kanAvbestille: true, kanRefusjon: true, betaling: "Klipp" };

export const tilstander = {
  hub: <Skall><PH23Hub {...hubBase} /></Skall>,
  "hub-natt": <NattSkall><PH23Hub {...hubBase} /></NattSkall>,
  "hub-tom": <Skall><PH23Hub {...hubBase} klipp={ingenKlipp} kommende={[]} tidligere={[]} forsteLedige={null} coaches={[]} /></Skall>,
  "hub-feil": <Skall><PH23Hub {...hubBase} tilstand="feil" feilKode="FEIL 502 · BOOKING" /></Skall>,
  "ny-tjeneste": <Skall><PH23Ny data={nyBase} dager={dager} klipp={klipp} /></Skall>,
  "ny-tid": <Skall><PH23Ny data={tidData} dager={dager} klipp={klipp} /></Skall>,
  "ny-tid-natt": <NattSkall><PH23Ny data={tidData} dager={dager} klipp={klipp} /></NattSkall>,
  "ny-ingen-tider": <Skall><PH23Ny data={{ ...tidData, slots: [] }} dager={dager} klipp={klipp} /></Skall>,
  "ny-betaling": <Skall><PH23Ny data={{ ...tidData, modus: "betaling", betalingGrunn: "BRUKT_OPP" }} dager={dager} klipp={klipp} /></Skall>,
  bekreft: <Skall><PH23Bekreft data={bekreftData} klipp={klipp} /></Skall>,
  "bekreft-natt": <NattSkall><PH23Bekreft data={bekreftData} klipp={klipp} /></NattSkall>,
  "bekreft-betaling": <Skall><PH23Bekreft data={{ ...bekreftData, modus: "betaling", prisOre: 60000 }} klipp={klipp} /></Skall>,
  "bekreft-opptatt": <Skall><PH23Bekreft data={{ ...bekreftData, ledig: false }} klipp={klipp} /></Skall>,
  kvittering: <Skall><PH23Kvittering data={{ linje: "Privattime · Mandag 5. oktober kl. 15:00", coachNavn: "Anders Kristiansen", sted: "Gamle Fredrikstad Golfklubb", varighetMin: 60, betaling: "Klipp", kalenderUrl: "#" }} /></Skall>,
  detalj: <Skall><PH23Detalj data={detalj} /></Skall>,
  bookinger: <Skall><PH23Bookinger tilstand="data" kommende={kommende} historikk={tidligere} /></Skall>,
  "bookinger-tom": <Skall><PH23Bookinger tilstand="data" kommende={[]} historikk={[]} /></Skall>,
  "bookinger-feil": <Skall><PH23Bookinger tilstand="feil" kommende={[]} historikk={[]} /></Skall>,
  bytt: <Skall><PH23Bytt tilstand="data" bookingId="b1" tjeneste="Privattime" naaTekst="Mandag 5. oktober kl. 15:00" sted="Gamle Fredrikstad Golfklubb" varighetMin={60} dager={dager} slots={["09:00", "10:00", "11:30"].map((t) => ({ start: slotIso(t), coachId: "c1", coachName: "Anders Kristiansen", kl: t, datoTid: `Tir 6. okt. kl. ${t}` }))} /></Skall>,
  "bytt-feil": <Skall><PH23Bytt tilstand="feil" bookingId="b1" tjeneste="Privattime" naaTekst="Mandag 5. oktober kl. 15:00" sted="Gamle Fredrikstad Golfklubb" varighetMin={60} dager={dager} slots={[]} /></Skall>,
  coach: <Skall><PH23Coach data={{ navn: "Anders Kristiansen", ambition: "Head coach ved AK Golf Academy.", epost: "anders@example.no", fellesOkter: 12, visProKrav: false, tjenester: [{ id: "s1", navn: "Privattime", varighetMin: 60, beskrivelse: "Individuell coaching.", prisTekst: "1 klipp", href: "#" }, { id: "s2", navn: "TrackMan-bay", varighetMin: 60, beskrivelse: null, prisTekst: "600 kr", href: "#" }], wizardHref: "#", meldingHref: "#" }} /></Skall>,
  anlegg: <Skall><PH23Anlegg data={{ navn: "Gamle Fredrikstad Golfklubb", adresse: "Bossumveien 1, Fredrikstad", fasiliteter: [{ id: "f1", navn: "Driving range", typeLabel: "Driving range (1. etg)", inne: false, beskrivelse: "Åpen for alle spillere." }, { id: "f2", navn: "Performance Studio", typeLabel: "Performance Studio", inne: true, beskrivelse: null }] }} /></Skall>,
};
