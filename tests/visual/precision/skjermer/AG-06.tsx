/** Prøvefil for AG-06 Booking. Syntetiske data, ingen ekte spillere. */
import { CalendarX } from "lucide-react";
import { AG06Booking, TjenesteArk } from "@/components/admin/precision/AG06Booking";
import { AG06Bookingen, type AG06BookingenData } from "@/components/admin/precision/AG06Bookingen";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { LasterTilstand, FeilTilstand } from "@/components/precision/pa";
import type { AG06Booking as Booking, AG06Tjeneste, AG06TjenesteValg } from "@/app/admin/bookinger/data";
import type { BookingValg } from "@/app/admin/kalender/booking-actions";

export const sti = "/admin/bookinger";

const N = Date.UTC(2026, 9, 5, 8, 0);
const ekstra = (dag: string, ukedag: string, slutt: string, coach: string | null, startMs: number) => ({ dag, ukedag, slutt, coach, startMs, kontaktSok: "", datoIso: new Date(startMs).toISOString().slice(0, 10) });
const bookinger: Booking[] = [
  { id: "b1", who: "Ola Testesen", guardian: null, svcId: "s1", svcNavn: "Privattime 60 min", min: 60, priceOre: 80000, where: "Studio 1", date: "06.10", t: "17:00", pay: "Ikke betalt", src: "PlayerHQ", note: "Vil jobbe med wedge.", at: "26.09", st: "Venter", kommende: false, harKonto: true, forslag: null, ...ekstra("6", "tir", "18:00", "Test Coach", N + 86_400_000) },
  { id: "b2", who: "Kari Gjest med et ganske langt navn", guardian: "kari@eksempel.no", svcId: "s2", svcNavn: "Drop-in range", min: 30, priceOre: 25000, where: "Range", date: "07.10", t: "10:00", pay: "Betalt", src: "Gjest", note: null, at: "25.09", st: "Bekreftet", kommende: true, harKonto: false, forslag: null, ...ekstra("7", "ons", "10:30", "Prøve Assistent", N + 2 * 86_400_000) },
  { id: "b4", who: "Per Prøve", guardian: null, svcId: "s1", svcNavn: "Performance Pro", min: 90, priceOre: 0, where: "Simulator 2", date: "09.10", t: "16:00", pay: "Klipp", src: "PlayerHQ", note: null, at: "20.09", st: "Bekreftet", kommende: true, harKonto: true, forslag: null, ...ekstra("9", "fre", "17:30", "Test Coach", N + 4 * 86_400_000) },
  { id: "b3", who: "Per Avlyst", guardian: null, svcId: "s1", svcNavn: "Privattime 60 min", min: 60, priceOre: 80000, where: "Studio 1", date: "27.09", t: "09:00", pay: "Klipp", src: "PlayerHQ", note: null, at: "20.09", st: "Avlyst", kommende: false, harKonto: true, forslag: null, ...ekstra("27", "søn", "10:00", "Test Coach", N - 8 * 86_400_000) },
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
  { id: "s1", slug: "privattime-60-min", navn: "Privattime 60 min", beskrivelse: "Én spiller, én coach.", prisOre: 80000, varighetMin: 60, facilityType: null, maxDeltakere: 1, coachUserId: "c1", coachNavn: "Test Coach", locationId: "l1", stedNavn: "Fredrikstad", kategori: "drop-in", bufferForMin: 0, bufferEtterMin: 15, minVarselTimer: 24, maksDagerFram: 14, aktiv: true, antallBookinger: 3 },
  { id: "s2", slug: "drop-in-range", navn: "Drop-in range", beskrivelse: null, prisOre: 25000, varighetMin: 30, facilityType: null, maxDeltakere: 4, coachUserId: null, coachNavn: null, locationId: null, stedNavn: null, kategori: null, bufferForMin: 0, bufferEtterMin: 0, minVarselTimer: 24, maksDagerFram: 7, aktiv: true, antallBookinger: 0 },
  { id: "s3", slug: "gammel-pakke", navn: "Gammel pakke", beskrivelse: null, prisOre: 120000, varighetMin: 90, facilityType: null, maxDeltakere: 1, coachUserId: null, coachNavn: null, locationId: "l1", stedNavn: "Fredrikstad", kategori: "abonnement", bufferForMin: 0, bufferEtterMin: 0, minVarselTimer: 24, maksDagerFram: 7, aktiv: false, antallBookinger: 12 },
];
const tjenesteValg: AG06TjenesteValg = { coacher: [{ id: "c1", navn: "Test Coach" }], steder: [{ id: "l1", navn: "Fredrikstad" }] };
const felles = { navn: "Test Coach", bookinger, valg, tjenester, tjenesteValg, naaMs: N } as const;

const detalj: AG06BookingenData = { id: "b4", hvem: "Per Prøve", tjeneste: "Performance Pro", status: "CONFIRMED", datoLang: "Fredag 9. oktober", tid: "16:00", datoIso: "2026-10-09", varighetMin: 90, sted: "Simulator 2, Fredrikstad", coach: "Test Coach", betaling: "Klipp", pris: "0 kr", kontakt: null, spillerHref: "/admin/spillere/p1", notat: "Jobber med P7.0.", bestilt: "20. sep.", forslag: null, kommende: true, harKonto: true, kanLageBetalingslenke: false };

export const tilstander = {
  data: <AG06Booking {...felles} fane="bookinger" />,
  bookingen: <AG06Bookingen navn="Test Coach" b={detalj} />,
  "bookingen-venter": <AG06Bookingen navn="Test Coach" b={{ ...detalj, status: "PENDING", betaling: "Ikke betalt", pris: "800 kr", kommende: true }} />,
  ny: <AG06Booking {...felles} fane="ny" />,
  tj: <AG06Booking {...felles} fane="tj" />,
  "tj-ny": <AgencyOSSkall navn="Test Coach"><div className="agn-s"><TjenesteArk tjeneste={null} valg={tjenesteValg} feil={null} pending={false} onClose={() => {}} onLagre={() => {}} onAktiv={() => {}} onSlett={() => {}} /></div></AgencyOSSkall>,
  "tj-rediger": <AgencyOSSkall navn="Test Coach"><div className="agn-s"><TjenesteArk tjeneste={tjenester[0]!} valg={tjenesteValg} feil="Stedet finnes ikke." pending={false} onClose={() => {}} onLagre={() => {}} onAktiv={() => {}} onSlett={() => {}} /></div></AgencyOSSkall>,
  laster: <AgencyOSSkall navn="Test Coach"><div className="pa-side"><LasterTilstand text="Henter bookinger …" /></div></AgencyOSSkall>,
  feil: <AgencyOSSkall navn="Test Coach"><div className="pa-side"><FeilTilstand icon={CalendarX} title="Bookingene kunne ikke hentes" text="Ingen bookinger er endret. Spillerne ser fortsatt sine bekreftede timer." /></div></AgencyOSSkall>,
  tom: <AG06Booking {...felles} bookinger={[]} fane="bookinger" />,
};
