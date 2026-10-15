/** Prøvefil for AG-06 Booking. Syntetiske data, ingen ekte spillere. */
import { CalendarX } from "lucide-react";
import { AG06Booking, TjenesteArk } from "@/components/admin/precision/AG06Booking";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand, FeilTilstand } from "@/components/precision/pa";
import type { AG06Booking as Booking, AG06Tjeneste, AG06TjenesteValg } from "@/app/admin/bookinger/data";
import type { BookingValg } from "@/app/admin/kalender/booking-actions";

export const sti = "/admin/bookinger";

const bookinger: Booking[] = [
  { id: "b1", who: "Ola Testesen", guardian: null, svcId: "s1", svcNavn: "Privattime 60 min", min: 60, priceOre: 80000, where: "Studio 1", date: "29.09", t: "17:00", pay: "Ikke betalt", src: "PlayerHQ", note: "Vil jobbe med wedge.", at: "26.09", st: "Venter" },
  { id: "b2", who: "Kari Gjest", guardian: "kari@eksempel.no", svcId: "s2", svcNavn: "Drop-in range", min: 30, priceOre: 25000, where: "Range", date: "30.09", t: "10:00", pay: "Betalt", src: "Gjest", note: null, at: "25.09", st: "Bekreftet" },
  { id: "b3", who: "Per Avvist", guardian: null, svcId: "s1", svcNavn: "Privattime 60 min", min: 60, priceOre: 80000, where: "Studio 1", date: "27.09", t: "09:00", pay: "Klipp", src: "PlayerHQ", note: null, at: "20.09", st: "Avvist" },
];

const valg: BookingValg = {
  tjenester: [
    { id: "s1", navn: "Privattime 60 min", varighetMin: 60, prisOre: 80000, maxDeltakere: 1 },
    { id: "s2", navn: "Drop-in range", varighetMin: 30, prisOre: 25000, maxDeltakere: 4 },
  ],
  steder: [{ id: "l1", navn: "Fredrikstad" }],
  spillere: [
    { id: "p1", navn: "Ola Testesen" },
    { id: "p2", navn: "Kari Gjest" },
  ],
};

const tjenester: AG06Tjeneste[] = [
  { id: "s1", slug: "privattime-60-min", navn: "Privattime 60 min", beskrivelse: "Én spiller, én coach.", prisOre: 80000, varighetMin: 60, maxDeltakere: 1, coachUserId: "c1", coachNavn: "Test Coach", locationId: "l1", stedNavn: "Fredrikstad", kategori: "drop-in", bufferForMin: 0, bufferEtterMin: 15, minVarselTimer: 24, maksDagerFram: 14, aktiv: true, antallBookinger: 3 },
  { id: "s2", slug: "drop-in-range", navn: "Drop-in range", beskrivelse: null, prisOre: 25000, varighetMin: 30, maxDeltakere: 4, coachUserId: null, coachNavn: null, locationId: null, stedNavn: null, kategori: null, bufferForMin: 0, bufferEtterMin: 0, minVarselTimer: 24, maksDagerFram: 7, aktiv: true, antallBookinger: 0 },
  { id: "s3", slug: "gammel-pakke", navn: "Gammel pakke", beskrivelse: null, prisOre: 120000, varighetMin: 90, maxDeltakere: 1, coachUserId: null, coachNavn: null, locationId: "l1", stedNavn: "Fredrikstad", kategori: "abonnement", bufferForMin: 0, bufferEtterMin: 0, minVarselTimer: 24, maksDagerFram: 7, aktiv: false, antallBookinger: 12 },
];
const tjenesteValg: AG06TjenesteValg = { coacher: [{ id: "c1", navn: "Test Coach" }], steder: [{ id: "l1", navn: "Fredrikstad" }] };
const felles = { navn: "Test Coach", bookinger, valg, tjenester, tjenesteValg } as const;

export const tilstander = {
  data: <AG06Booking {...felles} fane="foresp" />,
  alle: <AG06Booking {...felles} fane="alle" />,
  ny: <AG06Booking {...felles} fane="ny" />,
  tj: <AG06Booking {...felles} fane="tj" />,
  "tj-ny": <AgencyOSSkall navn="Test Coach"><div className="agn-s"><TjenesteArk tjeneste={null} valg={tjenesteValg} feil={null} pending={false} onClose={() => {}} onLagre={() => {}} onAktiv={() => {}} onSlett={() => {}} /></div></AgencyOSSkall>,
  "tj-rediger": <AgencyOSSkall navn="Test Coach"><div className="agn-s"><TjenesteArk tjeneste={tjenester[0]!} valg={tjenesteValg} feil="Stedet finnes ikke." pending={false} onClose={() => {}} onLagre={() => {}} onAktiv={() => {}} onSlett={() => {}} /></div></AgencyOSSkall>,
  laster: <AgencyOSSkall navn="Test Coach"><div className="pa-side"><LasterTilstand text="Henter bookinger …" /></div></AgencyOSSkall>,
  feil: <AgencyOSSkall navn="Test Coach"><div className="pa-side"><FeilTilstand icon={CalendarX} title="Bookingene kunne ikke hentes" text="Ingen bookinger er endret. Spillerne ser fortsatt sine bekreftede timer." /></div></AgencyOSSkall>,
  tom: <AG06Booking {...felles} bookinger={[]} fane="foresp" />,
};
