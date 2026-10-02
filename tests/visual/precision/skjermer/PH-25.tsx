/** Prøvefil for PH-25 Abonnement og innstillinger. Syntetiske data: demospiller Øyvind Rohjan. */
import { useEffect, type ReactNode } from "react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import {
  PH25Abonnement, PH25Avbestill, PH25Feedback, PH25Feil, PH25Hjelp, PH25Innstillinger, PH25Personvern, PH25Sikkerhet,
  type PH25AbonnementData, type PH25InnstillingerData,
} from "@/components/portal/precision/PH25Abonnement";
import { HJELP_ARTIKLER, HJELP_FAQ, HJELP_KATEGORIER } from "@/app/portal/meg/help/data";

export const sti = "/portal/meg/abonnement";
export const natt = ["abonnement-natt", "innstillinger-natt", "avbestill-natt"];

const Skall = ({ children }: { children: ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;
// Nattema ligger på .pa-root[data-theme="night"], ikke på html: prøven setter det selv.
function NattSkall({ children }: { children: ReactNode }) {
  useEffect(() => { document.querySelectorAll(".pa-root").forEach((e) => e.setAttribute("data-theme", "night")); }, []);
  return <Skall>{children}</Skall>;
}

const flagg = { ok: false, avbrutt: false, avbestilt: false };
const fakturaer = [
  { id: "f1", dato: "26.09.2026", tekst: "PlayerHQ FULL, september med et litt langt navn på betalingen", belopKr: 299 },
  { id: "f2", dato: "26.08.2026", tekst: "PlayerHQ FULL, august", belopKr: 299 },
  { id: "f3", dato: "26.07.2026", tekst: "Betaling", belopKr: 2690 },
];
const full: PH25AbonnementData = {
  nivaa: "FULL", pakkeNavn: null, inkludert: false, prisMndKr: 299, prisAarKr: 2690, fornyes: "26.10.2026", betalingFeilet: false,
  kanOppgradere: false, kanEndreKort: true, kanAvbestille: true, fakturaer, flagg,
};
const talent: PH25AbonnementData = { ...full, nivaa: "TALENT", fornyes: null, kanOppgradere: true, kanEndreKort: false, kanAvbestille: false, fakturaer: [] };

const innst: PH25InnstillingerData = {
  epost: "oyvind.rohjan@eksempel.no",
  notif: { epost: true, push: false, paaminnelse: true, nyMeldingFraCoach: true, treningsplanOppdatert: true, bookingbekreftelse: true, ukentligRapport: false, turneringsresultater: false },
  venneOktSynlig: false,
  samtykke: { kreves: true, godkjentDato: "12. januar 2026", godkjentAv: "Forelder" },
  abonnement: { nivaa: "FULL", tekst: "299 kr per mnd · fornyes 26. oktober 2026" },
};

const helseTekst = {
  WEARABLE_HELSE: { tittel: "Hent helsedata fra klokka mi", forklaring: "Vi henter døgnverdiene fra treningsklokka di og bruker dem til å tilpasse treningen din.", punkter: ["Vi henter: timer søvn, restitusjon, HRV og hvilepuls, én verdi per døgn.", "Vi henter ikke detaljerte pulskurver eller posisjon."] },
  MANUELL_HELSE: { tittel: "Fyll ut helsedata selv", forklaring: "Du registrerer søvn, energi og form selv.", punkter: ["Bare det du selv skriver inn."] },
  COACH_INNSYN: { tittel: "Coachen ser status", forklaring: "Coachen ser om du er uthvilt, ikke tallene bak.", punkter: [] },
  COACH_DETALJ: { tittel: "Coachen ser tallene", forklaring: "Coachen ser tallene bak statusen.", punkter: ["Du kan trekke dette tilbake når som helst."] },
};
const delingTekst = {
  TEST_RESULTATER: { tittel: "Del testresultater", forklaring: "Miljøet ser testresultatene dine." },
  STATS: { tittel: "Del statistikk", forklaring: "Miljøet ser statistikken din." },
};
const personvern = {
  helseTekst, delingTekst,
  helse: { wearable: true, manuell: false, coachInnsyn: true, coachDetalj: false, sistGittAt: "2026-09-01T10:00:00.000Z", krevesForesatt: false },
  delingGrupper: [{ gruppeId: "g1", gruppeNavn: "WANG Toppidrett Fredrikstad med et langt gruppenavn", testResultater: true, stats: false }],
  krevesForesatt: false,
};

const avbestill = {
  ukedag: "søndag", dato: "25. oktober 2026", dagerIgjen: 25,
  konsekvenser: [
    { tittel: "Coaching-pakken Performance Pro", detalj: "fra 4 økter per måned til 0" },
    { tittel: "AI-coach", detalj: "låses når perioden utløper" },
    { tittel: "Treningsplan og Workbench", detalj: "låses når perioden utløper" },
  ],
};
const hjelp = { faq: HJELP_FAQ, kategorier: HJELP_KATEGORIER, artikler: HJELP_ARTIKLER };

export const tilstander = {
  abonnement: <Skall><PH25Abonnement data={full} /></Skall>,
  "abonnement-natt": <NattSkall><PH25Abonnement data={full} /></NattSkall>,
  "abonnement-tom": <Skall><PH25Abonnement data={talent} /></Skall>,
  "abonnement-feil": <Skall><PH25Feil reset={() => {}} kicker="Meg · Abonnement" title="Abonnement" tittel="Abonnementet kunne ikke hentes" tekst="Ingenting er endret og ingenting er trukket. Prøv igjen." kode="FEIL 502 · BETALING" tilbake={{ href: "#", tekst: "Til Meg" }} /></Skall>,
  "abonnement-betaling-feilet": <Skall><PH25Abonnement data={{ ...full, betalingFeilet: true, flagg: { ok: true, avbrutt: true, avbestilt: true } }} /></Skall>,
  avbestill: <Skall><PH25Avbestill data={avbestill} /></Skall>,
  "avbestill-natt": <NattSkall><PH25Avbestill data={avbestill} /></NattSkall>,
  innstillinger: <Skall><PH25Innstillinger data={innst} /></Skall>,
  "innstillinger-natt": <NattSkall><PH25Innstillinger data={innst} /></NattSkall>,
  "innstillinger-tom": <Skall><PH25Innstillinger data={{ ...innst, samtykke: { kreves: false, godkjentDato: null, godkjentAv: null }, abonnement: { nivaa: "TALENT", tekst: "Gratis nivå" } }} /></Skall>,
  sikkerhet: <Skall><PH25Sikkerhet sisteInnlogging="30.09.2026 · 07:42" /></Skall>,
  personvern: <Skall><PH25Personvern data={personvern} /></Skall>,
  "personvern-tom": <Skall><PH25Personvern data={{ ...personvern, helse: { ...personvern.helse, wearable: false, coachInnsyn: false, sistGittAt: null, krevesForesatt: true }, delingGrupper: [], krevesForesatt: true }} /></Skall>,
  hjelp: <Skall><PH25Hjelp data={hjelp} /></Skall>,
  feedback: <Skall><PH25Feedback takk={false} /></Skall>,
  "feedback-takk": <Skall><PH25Feedback takk /></Skall>,
};
