/** Prøvefil for PH-21 Spørsmål, én tråd (/portal/coach/sporsmal/[id]), pakke 11. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH21SporsmalTraad, type PH21SporsmalTraadData } from "@/components/portal/precision/PH21SporsmalTraad";

export const sti = "/portal/coach/sporsmal/q1";
const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>{n}</PlayerHQSkall>;
const svar = async () => {};
const D: PH21SporsmalTraadData = {
  id: "q1", askerNavn: "Øyvind Rohjan", tittel: "Hvordan varmer jeg opp før tidlig start?",
  body: "Første start er 07:40 på lørdag. Hvor lang tid trenger jeg på rangen?", besvart: true,
  svar: "Ti minutter mobilitet, så korte slag med økende fart. Avslutt med fem putter fra én meter.", stiltTid: "02.10 18:12", besvartTid: "02.10 20:40",
  erMeg: true, kanSvare: false,
};

export const tilstander = {
  besvart: skall(<PH21SporsmalTraad data={D} svarAction={svar} tilbakeHref="/portal/coach/sporsmal" />),
  venter: skall(<PH21SporsmalTraad data={{ ...D, besvart: false, svar: null, besvartTid: null }} svarAction={svar} tilbakeHref="/portal/coach/sporsmal" />),
  coach: skall(<PH21SporsmalTraad data={{ ...D, besvart: false, svar: null, besvartTid: null, erMeg: false, kanSvare: true }} svarAction={svar} tilbakeHref="/portal/coach/sporsmal" />),
};
