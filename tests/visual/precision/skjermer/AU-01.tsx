/** Prøvefil for AU-01 til AU-03 og AU-05 i nytt design. Syntetiske data, ingen Auth-kall. */
import { Innlogging, LoggetUt, Registrering, SjekkEpost, GlemtPassord, NyttPassord } from "@/components/auth/precision/KontoSkjermer";
import { ForelderGodkjenner } from "@/components/auth/precision/ForelderGodkjenner";
import { SpillerVenter } from "@/components/auth/precision/SpillerVenter";
import { LydSamtykkeForm } from "@/app/auth/lyd-samtykke/[token]/lyd-samtykke-form";

export const sti = "/auth/login";

export const tilstander = {
  login: <Innlogging />,
  loginFeil: <Innlogging feilkode="invalid-code" />,
  loggetut: <LoggetUt />,
  registrer: <Registrering />,
  registrerFull: <Registrering subscribe="pro" />,
  registrerForelder: <Registrering startRolle="PARENT" forelderGodkjent />,
  sjekkepost: <SjekkEpost />,
  glemt: <GlemtPassord />,
  nytt: <NyttPassord />,
  godkjenn: <ForelderGodkjenner state="form" token="prove" playerName="Testspiller Prøvesen" playerAge={14} guardianEmail="forelder@example.invalid" fristTekst="tor. 8. oktober" />,
  godkjennUtlopt: <ForelderGodkjenner state="expired" playerName="Testspiller Prøvesen" />,
  godkjennFerdig: <ForelderGodkjenner state="success" playerName="Testspiller Prøvesen" />,
  venter: <SpillerVenter spillerNavn="Testspiller Prøvesen" invitasjonEmail="forelder@example.invalid" fristTekst="torsdag 8. oktober" loggUt={async () => {}} />,
  lyd: <LydSamtykkeForm token="prove" spillerNavn="Testspiller" ordlyd="Syntetisk samtykketekst for prøven." />,
};
