/** Prøvefil for AU-05 Samtykke via lenke. Syntetiske data (demo: Øyvind Rohjan). */
import { GuardianConsentPrecision, LydSamtykkePrecision, LydSamtykkeStatusVisning, SamtykkeVenterPrecision } from "@/components/auth/precision/AuSamtykke";

export const sti = "/auth/guardian-consent/demo";

const skjema = { state: "form", token: "demo-token", playerName: "Øyvind Rohjan", playerAge: 13, playerEmail: "oyvind@example.no", guardianEmail: "forelder@example.no" } as const;
const ordlyd = "Samtykke til lydopptak av trening\n\nAK Golf Academy kan ta lydopptak av coachingøkter med spilleren. Opptaket brukes til å lage notater og oppfølging for spilleren, og deles bare med coach og foresatte.\n\nOpptaket lagres i 12 måneder og slettes deretter. Du kan trekke samtykket når som helst via treneren. Da stoppes nye opptak med en gang.\n\nOpptak av andre spillere i samme økt lagres ikke.\n\nVed spørsmål: post@akgolf.no.";

export const tilstander = {
  forelder: <GuardianConsentPrecision {...skjema} />,
  "forelder-natt": <GuardianConsentPrecision {...skjema} natt />,
  "forelder-utlopt": <GuardianConsentPrecision state="expired" playerName="Øyvind Rohjan" playerAge={13} email="forelder@example.no" />,
  "forelder-gitt": <GuardianConsentPrecision state="success" playerName="Øyvind Rohjan" playerAge={13} />,
  lyd: <LydSamtykkePrecision token="demo-token-1234567890" spillerNavn="Øyvind Rohjan" ordlyd={ordlyd} />,
  "lyd-laster": <LydSamtykkePrecision token="demo-token-1234567890" spillerNavn="Øyvind Rohjan" ordlyd={ordlyd} forhandsvis={{ laster: true }} />,
  "lyd-feil": <LydSamtykkePrecision token="demo-token-1234567890" spillerNavn="Øyvind Rohjan" ordlyd={ordlyd} forhandsvis={{ feil: "Lenken er ugyldig eller utløpt." }} />,
  "lyd-ferdig": <LydSamtykkePrecision token="demo-token-1234567890" spillerNavn="Øyvind Rohjan" ordlyd={ordlyd} forhandsvis={{ ferdig: true }} />,
  "lyd-natt": <LydSamtykkePrecision token="demo-token-1234567890" spillerNavn="Øyvind Rohjan" ordlyd={ordlyd} natt />,
  "lyd-ugyldig": <LydSamtykkeStatusVisning status="ugyldig" />,
  "lyd-gitt": <LydSamtykkeStatusVisning status="gitt" spillerNavn="Øyvind Rohjan" />,
  "lyd-utlopt": <LydSamtykkeStatusVisning status="utlopt" />,
  venter: <SamtykkeVenterPrecision spillerNavn="Øyvind Rohjan" invitasjonEmail="forelder@example.no" />,
  "venter-natt": <SamtykkeVenterPrecision spillerNavn="Øyvind Rohjan" invitasjonEmail="forelder@example.no" natt />,
  "venter-tom": <SamtykkeVenterPrecision spillerNavn="Øyvind Rohjan" invitasjonEmail={null} />,
};
