/** Prøvefil for PH-23 Bookingen (/portal/booking/[id]), pakke 11. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23BookingDetalj, type PH23BookingDetaljData } from "@/components/portal/precision/PH23BookingDetalj";

export const sti = "/portal/booking/b1";
const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>{n}</PlayerHQSkall>;
const D: PH23BookingDetaljData = {
  bookingId: "b1", tjeneste: "Performance Pro", status: "Bekreftet", dag: "Fredag 9. oktober", klokkeslett: "16:00", tid: "16:00–17:30",
  varighetMin: 90, sted: "Simulator 2, Fredrikstad", stedId: "l1", coachNavn: "Anders Kristiansen", coachId: "c1", betaling: "1 klipp",
  notat: null, kanAvbestille: true, kanFlytte: true, kanFaaRefusjon: true, avbestillingTimer: 24, flytteforslag: null,
};

export const tilstander = {
  data: skall(<PH23BookingDetalj data={D} />),
  forslag: skall(<PH23BookingDetalj data={{ ...D, flytteforslag: "mandag 12. oktober kl. 17:00" }} />),
  avbestilt: skall(<PH23BookingDetalj data={{ ...D, status: "Avbestilt", kanAvbestille: false, kanFlytte: false, sted: null, stedId: null, betaling: null }} />),
};
