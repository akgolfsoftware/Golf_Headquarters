/** Prøvefil for PH-21 Spørsmål (coach) i nytt design. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH21CoachSporsmal } from "@/components/portal/precision/PH21CoachSporsmal";

export const sti = "/portal/coach/sporsmal";
const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;

export const tilstander = {
  data: <Skall><PH21CoachSporsmal sporsmal={[
    { id: "1", navn: "Magnus Aasheim", tittel: "Hvor mye skal jeg putte før turneringen på lørdag, og bør jeg trene wedge i tillegg?", besvart: false, tid: "18.10 14:20" },
    { id: "2", navn: "Øyvind Rohjan", tittel: "Endring i ukeplanen", besvart: true, tid: "17.10 09:05" },
  ]} /></Skall>,
  tom: <Skall><PH21CoachSporsmal sporsmal={[]} /></Skall>,
};
