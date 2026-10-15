/** Prøvefil for PH-24 Helse og fravær i nytt design. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH24Helse, type PH24HelseData } from "@/components/portal/precision/PH24Helse";
import { PH24MegFeil, PH24MegLaster } from "@/components/portal/precision/PH24MegTilstand";

export const sti = "/portal/meg/helse";

const data: PH24HelseData = {
  samtykke: true,
  dagerBorte: 0,
  fravaer: [
    { id: "l1", tittel: "Høstferie med familien", periode: "Reise · 12. okt.–16. okt.", type: "annet", status: "Planlagt" },
    { id: "l2", tittel: "Vond venstre håndledd etter mye range", periode: "Skade · 8. aug.–14. aug.", type: "skade", status: "Over" },
  ],
  sistLogget: "4. okt.",
  sovnSnitt: 7.4, sovnAntall: 5,
  siste: { restingHr: 52, hrv: 68 },
  belastningPst: 104, fysScore: 71,
  initial: { date: "2026-10-05", restingHr: 52, hrv: 68, sleepHours: 7.5, weightKg: null, notes: null },
};
const tom: PH24HelseData = { ...data, fravaer: [], sistLogget: null, sovnSnitt: null, sovnAntall: 0, siste: null, belastningPst: null, fysScore: null };
const av: PH24HelseData = { ...tom, samtykke: false };
const lagre = async () => {};
const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;

export const tilstander = {
  data: <Skall><PH24Helse data={data} lagre={lagre} /></Skall>,
  tom: <Skall><PH24Helse data={tom} lagre={lagre} /></Skall>,
  "uten-samtykke": <Skall><PH24Helse data={av} lagre={lagre} /></Skall>,
  laster: <Skall><PH24MegLaster /></Skall>,
  feil: <Skall><PH24MegFeil tittel="Helse og fravær kunne ikke hentes" /></Skall>,
};
