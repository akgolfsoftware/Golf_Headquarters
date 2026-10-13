import { gyldigPlanDato } from "./plan-kontekst";
import { osloHendelseTid } from "./hendelser-kontrakt";

/** Skjemaets klokkeslett er norsk lokaltid, uansett hvor serveren kjører. */
export function gruppeSkjemaTid(dato: string, tid: string): Date {
  if (!gyldigPlanDato(dato) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(tid)) throw new Error("Velg en gyldig dato og et klokkeslett.");
  const [timer, minutter] = tid.split(":").map(Number);
  return osloHendelseTid(dato, timer * 60 + minutter);
}
export function gruppeDupliseringTid(verdi: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(verdi)) throw new Error("Velg en gyldig dato og et klokkeslett.");
  return gruppeSkjemaTid(verdi.slice(0,10), verdi.slice(11));
}
const lokal = new Intl.DateTimeFormat("sv-SE", { timeZone:"Europe/Oslo",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23" });
/** Neste kalenderuke beholder norsk klokkeslett over et sommertidsskifte. */
export function gruppeNesteUke(iso: string): string {
  const verdi = lokal.format(new Date(iso));
  const dag = new Date(`${verdi.slice(0,10)}T12:00:00Z`);
  dag.setUTCDate(dag.getUTCDate()+7);
  return `${dag.toISOString().slice(0,10)}T${verdi.slice(11)}`;
}
