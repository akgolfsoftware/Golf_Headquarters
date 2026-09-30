/** Prøvefil for BK-03 Kvittering. Syntetiske data. */
import { BookingKvittering, type KvitteringProps } from "@/components/booking/precision/BookingKvittering";
import { LasterTilstand } from "@/components/precision/pa";
import { BookingRamme } from "@/components/booking/precision/BookingRamme";
import IngenBooking from "@/app/(marketing)/booking/kvittering/[bookingId]/not-found";
import KvitteringFeil from "@/app/(marketing)/booking/kvittering/[bookingId]/error";
import { Natt } from "./_natt";

export const sti = "/booking/kvittering/abc";
const base: KvitteringProps = {
  bekreftet: true, innlogget: false, epost: "oyvind@eksempel.no", referanse: "#k3f9a1b2",
  tjeneste: "Flex 50 min", varighetMin: 50, dato: "fredag 2. oktober 2026", klokkeslett: "10:00",
  coach: "Anders Kristiansen", spiller: null, sted: "Gamle Fredrikstad GK", prisTekst: "850 kr",
  fristTekst: "torsdag 1. oktober kl. 10:00", startIso: "2026-10-02T08:00:00.000Z", sluttIso: "2026-10-02T08:50:00.000Z",
};

export const tilstander = {
  gjest: <BookingKvittering {...base} />,
  innlogget: <BookingKvittering {...base} innlogget />,
  manglerVerdier: <BookingKvittering {...base} coach={null} epost={null} />,
  venter: <BookingKvittering {...base} bekreftet={false} />,
  tom: <IngenBooking />,
  laster: <BookingRamme smal><LasterTilstand text="Henter kvitteringen …" /></BookingRamme>,
  feil: <KvitteringFeil error={Object.assign(new Error("x"), { digest: "0917" })} reset={() => {}} />,
  "gjest-natt": <Natt><BookingKvittering {...base} /></Natt>,
  "venter-natt": <Natt><BookingKvittering {...base} bekreftet={false} /></Natt>,
  "feil-natt": <Natt><KvitteringFeil error={new Error("x")} reset={() => {}} /></Natt>,
};
