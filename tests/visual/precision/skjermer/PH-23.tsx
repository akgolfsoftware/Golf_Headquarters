/** Prøvefil for PH-23 Booking i nytt design (pakke 7). Syntetiske data: uke 41, oktober 2026. */
import { useEffect, type ReactNode } from "react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23Booking } from "@/components/portal/precision/PH23Booking";
import { PHKommunikasjonLaster } from "@/components/portal/precision/PHKommunikasjonLaster";
import type { PH23BookingData } from "@/lib/portal-booking/ph23-booking-data";

export const sti = "/portal/meg/bookinger";

const DAGER: [string, string][] = [["Man", "05.10"], ["Tir", "06.10"], ["Ons", "07.10"], ["Tor", "08.10"], ["Fre", "09.10"], ["Lør", "10.10"], ["Søn", "11.10"]];
const SLOTS: Record<number, string[]> = { 0: [], 1: ["09:00", "15:00"], 2: ["10:30", "13:00", "15:00"], 3: ["09:00"], 4: [], 5: [], 6: [] };
const slotDetails = Object.fromEntries(Object.entries(SLOTS).flatMap(([d, tider]) => tider.map((t) => [`${d}|${t}`, {
  startIso: `2026-10-${String(5 + Number(d)).padStart(2, "0")}T${t}:00`, coachId: "c1", coachNavn: "Anders Kristiansen",
}])));

const DATA: PH23BookingData = {
  rate: null, cancelHours: 24,
  card: { pkg: "Performance Pro", total: 4, left: 3, valid: "01.11.2026", resets: "01.11.2026", covers: "Én coachet økt trekker ett klipp" },
  services: [
    { id: "pro", name: "Performance Pro", min: 90, coach: "Anders Kristiansen", clip: true, note: "TrackMan, video og skriftlig plan" },
    { id: "flex50", name: "Flex 50 min", min: 50, coach: "Markus Roinas Pedersen", clip: false, price: 1500, note: "Ett tema" },
    { id: "flex20", name: "Flex 20 min", min: 20, coach: "Markus Roinas Pedersen", clip: false, price: null },
  ],
  days: DAGER, slots: SLOTS, slotDetails,
  mine: [
    { id: "b1", svc: "Performance Pro", serviceTypeId: "pro", svcName: "Performance Pro · 90 min", day: "Fre 09.10", t: "16:00", place: "Simulator 2, Fredrikstad", status: "Bekreftet", pay: "Klipp", startIso: "2026-10-09T14:00:00.000Z", coachName: "Anders Kristiansen" },
    { id: "b2", svc: "Flex 50 min", serviceTypeId: "flex50", svcName: "Flex 50 min · 50 min", day: "Tir 20.10", t: "17:00", place: "Golfstudio", status: "Venter", pay: "Kort", startIso: "2026-10-20T15:00:00.000Z", coachName: "Markus Roinas Pedersen" },
  ],
  past: [
    { id: "g1", svc: "Performance Pro", svcName: "Performance Pro · 90 min", day: "Tor 24.09.2026", t: "16:00", ref: "BK-0001A2B3", src: "Simulator 2 · Anders Kristiansen" },
    { id: "g2", svc: "Flex 50 min", svcName: "Flex 50 min · 50 min · Avbestilt", day: "Tor 27.08.2026", t: "17:00", ref: "BK-0000F1E2", src: "Golfstudio · Markus Roinas Pedersen" },
  ],
  playerEmail: "spiller@akgolf.test",
};
const TOM: PH23BookingData = { ...DATA, card: { ...DATA.card, pkg: "Ingen pakke", total: 0, left: 0, resets: "—", valid: "—" }, mine: [], past: [] };

const hent = async () => ({ days: DAGER, slots: SLOTS, slotDetails });

/** Klikker seg fram etter montering (prøven har ingen egen interaksjon). */
function Klikk({ velgere, children }: { velgere: string[]; children: ReactNode }) {
  useEffect(() => {
    let i = 0;
    const steg = () => {
      const [sel, tekst] = velgere[i].split("::");
      const el = [...document.querySelectorAll<HTMLElement>(sel)].find((e) => !tekst || e.textContent?.includes(tekst));
      el?.click();
      i += 1;
      if (i < velgere.length) setTimeout(steg, 15);
    };
    setTimeout(steg, 0);
  }, [velgere]);
  return <>{children}</>;
}

const Vis = ({ data = DATA, start = "oversikt" as const, state = "data" as const, betaling }: {
  data?: PH23BookingData; start?: "oversikt" | "ny"; state?: "data" | "tom" | "laster" | "feil"; betaling?: "betalt" | "avbrutt";
}) => (
  <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>
    <PH23Booking initialData={data} start={start} state={state} betaling={betaling}
      onConfirmBooking={async () => ({ type: "bekreftet", bookingId: "ny1" })} onHentSlots={hent}
      onRescheduleBooking={async () => ({ ok: true })} onCancelBooking={async () => true} />
  </PlayerHQSkall>
);

export const tilstander = {
  oversikt: <Vis />,
  ny: <Klikk velgere={["button::Ons", "button::10:30"]}><Vis start="ny" /></Klikk>,
  bekreftet: <Klikk velgere={["button::Ons", "button::10:30", "button::Bekreft booking"]}><Vis start="ny" /></Klikk>,
  bookingen: <Klikk velgere={[".phn-k-booking-helt"]}><Vis /></Klikk>,
  flytt: <Klikk velgere={[".phn-k-booking-helt", "button::Flytt time", "dialog button::Ons", "dialog button::13:00"]}><Vis /></Klikk>,
  avbestill: <Klikk velgere={[".phn-k-booking-helt", "button::Avbestill"]}><Vis /></Klikk>,
  tom: <Vis data={TOM} />,
  laster: <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}><PHKommunikasjonLaster variant="booking" /></PlayerHQSkall>,
  feil: <Vis state="feil" />,
};
