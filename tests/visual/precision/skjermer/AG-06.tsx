/** Prøvefil for AG-06 Booking (+NY, detalj, tjenester). Syntetiske data, ingen ekte spillere. */
import { CalendarX } from "lucide-react";
import { AG06Booking } from "@/components/admin/precision/AG06Booking";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand, FeilTilstand } from "@/components/precision/pa";
import type { AG06Booking as Booking, AG06Tjeneste } from "@/app/admin/bookinger/data";
import type { NyBookingData } from "@/app/admin/bookinger/ny-data";

export const sti = "/admin/bookinger";

export const bookinger: Booking[] = [
  { id: "b1", who: "Ola Testesen", guardian: null, svcId: "s1", svcNavn: "Privattime 60 min", min: 60, priceOre: 80000, where: "Teststudio", date: "29.09", t: "17:00", dato: "2026-09-29", pay: "Ikke betalt", src: "PlayerHQ", note: "Vil jobbe med wedge.", at: "26.09", st: "Venter", harSpiller: true, forslag: null },
  { id: "b2", who: "Kari Gjest", guardian: "kari@eksempel.no", svcId: "s2", svcNavn: "Drop-in range", min: 30, priceOre: 25000, where: "Testbanen", date: "30.09", t: "10:00", dato: "2026-09-30", pay: "Betalt", src: "Gjest", note: null, at: "25.09", st: "Bekreftet", harSpiller: false, forslag: null },
  { id: "b3", who: "Per Eksempel", guardian: null, svcId: "s1", svcNavn: "Privattime 60 min", min: 60, priceOre: 0, where: "Teststudio", date: "01.10", t: "09:00", dato: "2026-10-01", pay: "Klipp", src: "PlayerHQ", note: null, at: "20.09", st: "Bekreftet", harSpiller: true, forslag: "02.10 11:00" },
  { id: "b4", who: "Lise Prøve", guardian: null, svcId: "s1", svcNavn: "Privattime 60 min", min: 60, priceOre: 80000, where: "Teststudio", date: "02.10", t: "15:00", dato: "2026-10-02", pay: "Faktura", src: "PlayerHQ", note: null, at: "27.09", st: "Bekreftet", harSpiller: true, forslag: null },
];

export const tjenester: AG06Tjeneste[] = [
  { id: "s1", navn: "Privattime 60 min", beskrivelse: "Én til én med coach.", varighetMin: 60, prisOre: 80000, maksDeltakere: 1, aktiv: true },
  { id: "s2", navn: "Drop-in range", beskrivelse: null, varighetMin: 30, prisOre: 25000, maksDeltakere: 4, aktiv: true },
  { id: "s3", navn: "Gammel pakke", beskrivelse: null, varighetMin: 90, prisOre: 120000, maksDeltakere: 1, aktiv: false },
];

export const nyBooking: NyBookingData = {
  erAdmin: true,
  coachId: "c1",
  policy: "Avbestilling senere enn 24 timer før gir ingen refusjon.",
  spillere: [
    { id: "p1", navn: "Ola Testesen", epost: "ola@eksempel.no", klubb: "Testklubben", klippIgjen: 2 },
    { id: "p2", navn: "Kari Prøvesen", epost: "kari@eksempel.no", klubb: null, klippIgjen: null },
    { id: "p3", navn: "Per Eksempel", epost: "per@eksempel.no", klubb: "Prøve GK", klippIgjen: 0 },
  ],
  grupper: [{ id: "g1", navn: "Testgruppe U16", maksDeltakere: 8 }],
  tjenester: [
    { id: "s1", navn: "Privattime 60 min", varighetMin: 60, prisOre: 80000, maksDeltakere: 1, coachId: "c1", coachNavn: "Test Coach" },
    { id: "s2", navn: "Drop-in range", varighetMin: 30, prisOre: 25000, maksDeltakere: 4, coachId: null, coachNavn: null },
  ],
  steder: [{ id: "l1", navn: "Teststudio", adresse: "Testveien 1", fasiliteter: [{ id: "f1", navn: "Bås 1", kapasitet: 1 }, { id: "f2", navn: "Bås 2", kapasitet: 2 }] }],
  coacher: [{ id: "c1", navn: "Test Coach", fasilitetIder: [] }, { id: "c2", navn: "Annen Coach", fasilitetIder: ["f1"] }],
};

const felles = { navn: "Test Coach", bookinger, tjenester, nyBooking };

export const tilstander = {
  data: <AG06Booking {...felles} fane="foresp" />,
  detaljVenter: <AG06Booking {...felles} fane="foresp" valgtId="b1" />,
  alle: <AG06Booking {...felles} fane="alle" />,
  detaljBetalt: <AG06Booking {...felles} fane="alle" valgtId="b2" />,
  detaljForslag: <AG06Booking {...felles} fane="alle" valgtId="b3" />,
  ny: <AG06Booking {...felles} fane="ny" />,
  tj: <AG06Booking {...felles} fane="tj" />,
  laster: <AgencyOSSkall navn="Test Coach"><div className="pa-side"><LasterTilstand text="Henter bookinger …" /></div></AgencyOSSkall>,
  feil: <AgencyOSSkall navn="Test Coach"><div className="pa-side"><FeilTilstand icon={CalendarX} title="Bookingene kunne ikke hentes" text="Ingen bookinger er endret. Spillerne ser fortsatt sine bekreftede timer." /></div></AgencyOSSkall>,
  tom: <AG06Booking {...felles} bookinger={[]} fane="foresp" />,
  tomTj: <AG06Booking {...felles} tjenester={[]} fane="tj" />,
};
