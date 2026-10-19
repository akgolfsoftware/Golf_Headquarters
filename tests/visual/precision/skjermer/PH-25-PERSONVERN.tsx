/** Prøvefil for PH-25 Samtykker (personvern) i nytt design. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Personvern } from "@/components/portal/precision/PH25Personvern";

const t = (tittel: string) => ({ tittel, forklaring: "Forklaring på én setning om hva samtykket betyr for deg.", punkter: ["Lagres kryptert i EU", "Du kan trekke det når som helst"] });
const tekst = {
  helse: { WEARABLE_HELSE: t("Hent data fra klokka"), MANUELL_HELSE: t("Fyll ut selv"), COACH_INNSYN: t("Coachen ser status"), COACH_DETALJ: t("Coachen ser tallene bak") },
  deling: { TEST_RESULTATER: t("Testresultater"), STATS: t("Statistikk") },
};

export const sti = "/portal/meg/innstillinger/personvern";
const Skall = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;

export const tilstander = {
  data: <Skall><PH25Personvern data={{
    helse: { wearable: true, manuell: true, coachInnsyn: true, coachDetalj: false, sistGittAt: "2026-09-14T10:00:00.000Z", krevesForesatt: false },
    grupper: [{ gruppeId: "g1", gruppeNavn: "Team Norway Junior Øst med et veldig langt gruppenavn", testResultater: true, stats: false }, { gruppeId: "g2", gruppeNavn: "WANG Toppidrett Fredrikstad", testResultater: false, stats: false }],
    delingKrevesForesatt: false, tekst,
  }} /></Skall>,
  tom: <Skall><PH25Personvern data={{
    helse: { wearable: false, manuell: false, coachInnsyn: false, coachDetalj: false, sistGittAt: null, krevesForesatt: false },
    grupper: [], delingKrevesForesatt: false, tekst,
  }} /></Skall>,
  u16: <Skall><PH25Personvern data={{
    helse: { wearable: false, manuell: false, coachInnsyn: false, coachDetalj: false, sistGittAt: null, krevesForesatt: true },
    grupper: [{ gruppeId: "g2", gruppeNavn: "WANG Toppidrett Fredrikstad", testResultater: false, stats: false }], delingKrevesForesatt: true, tekst,
  }} /></Skall>,
};
