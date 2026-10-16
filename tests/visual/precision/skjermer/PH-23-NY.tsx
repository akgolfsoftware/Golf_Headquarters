/** Prøvefil for PH-23 Book time (/portal/booking/ny), pakke 11. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23Booking } from "@/components/portal/precision/PH23Booking";
import { getSyntheticPH23Data } from "@/lib/portal-booking/ph23-booking-data";

export const sti = "/portal/booking/ny";
const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>{n}</PlayerHQSkall>;
const ok = async () => ({ type: "feil" as const, grunn: "prøve" });

export const tilstander = {
  data: skall(<PH23Booking initialData={getSyntheticPH23Data()} start="ny" onConfirmBooking={ok} />),
  kort: skall(<PH23Booking initialData={{ ...getSyntheticPH23Data(), startServiceId: "bay" }} start="ny" startBetaling="Kort" onConfirmBooking={ok} />),
  tom: skall(<PH23Booking initialData={getSyntheticPH23Data(true)} start="ny" onConfirmBooking={ok} />),
  laster: skall(<PH23Booking state="laster" />),
  feil: skall(<PH23Booking state="feil" />),
};
