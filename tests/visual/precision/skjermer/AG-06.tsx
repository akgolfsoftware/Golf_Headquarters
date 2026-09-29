/** Prøvefil for AG-06 Booking. Syntetiske data, ingen ekte spillere. */
import { AG06Booking } from "@/components/admin/precision/AG06Booking";
import type { AG06Booking as Booking } from "@/app/admin/bookinger/data";
import type { BookingValg } from "@/app/admin/kalender/booking-actions";

export const sti = "/admin/bookinger";

const bookinger: Booking[] = [
  { id: "b1", who: "Ola Testesen", guardian: null, svcId: "s1", svcNavn: "Privattime 60 min", min: 60, priceOre: 95000, where: "Studio 1", date: "29.09", t: "17:00", pay: "Faktura", src: "PlayerHQ", note: "Vil jobbe med wedge.", at: "26.09", st: "Venter" },
  { id: "b2", who: "Kari Gjest", guardian: "kari@eksempel.no", svcId: "s2", svcNavn: "Drop-in range", min: 30, priceOre: 25000, where: "Range", date: "30.09", t: "10:00", pay: "Betalt", src: "Gjest", note: null, at: "25.09", st: "Bekreftet" },
  { id: "b3", who: "Per Avvist", guardian: null, svcId: "s1", svcNavn: "Privattime 60 min", min: 60, priceOre: 95000, where: "Studio 1", date: "27.09", t: "09:00", pay: "Faktura", src: "PlayerHQ", note: null, at: "20.09", st: "Avvist" },
];

const valg: BookingValg = {
  tjenester: [
    { id: "s1", navn: "Privattime 60 min", varighetMin: 60, prisOre: 95000, maxDeltakere: 1 },
    { id: "s2", navn: "Drop-in range", varighetMin: 30, prisOre: 25000, maxDeltakere: 4 },
  ],
  steder: [{ id: "l1", navn: "Fredrikstad" }],
  spillere: [
    { id: "p1", navn: "Ola Testesen" },
    { id: "p2", navn: "Kari Gjest" },
  ],
};

export const tilstander = {
  data: <AG06Booking navn="Test Coach" bookinger={bookinger} valg={valg} fane="foresp" />,
  alle: <AG06Booking navn="Test Coach" bookinger={bookinger} valg={valg} fane="alle" />,
  ny: <AG06Booking navn="Test Coach" bookinger={bookinger} valg={valg} fane="ny" />,
  tj: <AG06Booking navn="Test Coach" bookinger={bookinger} valg={valg} fane="tj" />,
  tom: <AG06Booking navn="Test Coach" bookinger={[]} valg={valg} fane="foresp" />,
};
