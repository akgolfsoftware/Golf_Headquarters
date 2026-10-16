/** Prøvefil for PH-23 Bekreft booking (/portal/booking/ny/bekreft), pakke 11. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23NyBekreft } from "@/components/portal/precision/PH23NyBekreft";
import type { BookingBekreftData } from "@/lib/portal-booking/bekreft-typer";

export const sti = "/portal/booking/ny/bekreft";
const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>{n}</PlayerHQSkall>;
const D: BookingBekreftData = {
  modus: "credits", prisOre: 0, serviceTypeId: "s1", coachId: "c1", startIso: "2026-10-07T10:30:00", backHref: "/portal/booking/ny?service=pro",
  ledig: true, creditsRemaining: 3, saldoEtter: 2,
  rader: [{ label: "Tjeneste", verdi: "Performance Pro" }, { label: "Coach", verdi: "Anders Kristiansen" }, { label: "Tid", verdi: "Onsdag 7. oktober · 10:30" }, { label: "Varighet", verdi: "90 min" }, { label: "Betaling", verdi: "1 klipp" }],
};

export const tilstander = {
  klipp: skall(<PH23NyBekreft data={D} avbestillingTimer={24} />),
  kort: skall(<PH23NyBekreft data={{ ...D, modus: "betaling", prisOre: 150000, rader: [...D.rader.slice(0, 4), { label: "Betaling", verdi: "Kort · 1 500 kr" }] }} avbestillingTimer={24} />),
  opptatt: skall(<PH23NyBekreft data={{ ...D, ledig: false }} avbestillingTimer={24} />),
};
