/** Prøvefil for PH-25 Varsler i nytt design. Syntetiske data. */
import "./_process-shim";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Varsler } from "@/components/portal/precision/PH25Varsler";

export const sti = "/portal/meg/innstillinger/varsler";
const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;
const notif = { epost: true, push: false, paaminnelse: true, nyMeldingFraCoach: true, treningsplanOppdatert: true, bookingbekreftelse: true, ukentligRapport: false, turneringsresultater: false };

export const tilstander = {
  data: <Skall><PH25Varsler data={{ notif }} startPush="off" /></Skall>,
  pushPaa: <Skall><PH25Varsler data={{ notif: { ...notif, push: true } }} startPush="on" /></Skall>,
  blokkert: <Skall><PH25Varsler data={{ notif }} startPush="blocked" /></Skall>,
  laster: <Skall><PH25Varsler data={{ notif }} startPush="loading" /></Skall>,
};
