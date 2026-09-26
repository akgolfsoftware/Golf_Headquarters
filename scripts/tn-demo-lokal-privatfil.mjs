/**
 * Delt, liten hjelper for de lokale TN-demoskriptene — kun disse to tingene:
 *
 *  - skrivPrivatFil: skriver en lokal privat fil (credentials/status/pid)
 *    trygt. `writeFileSync(..., { mode: 0o600 })` alene er IKKE nok — Node
 *    bruker `mode` bare når filen OPPRETTES; en fil som allerede finnes med
 *    løsere rettigheter (f.eks. fra en eldre kjøring, eller kopiert inn) blir
 *    ikke strammet inn. `writeFileSync` følger dessuten symlinker, så et
 *    filnavn som er byttet ut med en lenke ville skrevet et annet, ukjent
 *    sted. Denne hjelperen åpner uten å følge symlinker, kontrollerer den
 *    åpne filen og setter 0600 FØR gammelt innhold fjernes og nytt skrives.
 *
 *  - renFeilmelding: fjerner det mest sannsynlige hemmelighet-formede
 *    innholdet (URL med akkreditiv, JWT-lignende nøkler) fra en feilmelding
 *    før den skrives til stderr. Dette er IKKE en fullstendig rensing — bare
 *    et grovt filter mot de vanligste formatene i denne stacken (Postgres-
 *    URL med bruker:passord, Supabase JWT-nøkler).
 */
import { constants, openSync, closeSync, fstatSync, fchmodSync, ftruncateSync, writeFileSync } from "node:fs";

export function skrivPrivatFil(sti, innhold) {
  let fd;
  try {
    // Ingen O_TRUNC: filtype, eierskap og rettigheter må sjekkes først.
    // O_NONBLOCK hindrer at en FIFO kan henge skriveprosessen.
    fd = openSync(sti, constants.O_WRONLY | constants.O_CREAT | constants.O_NOFOLLOW | constants.O_NONBLOCK, 0o600);
  } catch (feil) {
    if (feil.code === "ELOOP") {
      throw new Error(`${sti} er en symlink — avviser å skrive gjennom den. Fjern lenken manuelt hvis dette er tilsiktet.`);
    }
    throw feil;
  }
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.nlink !== 1 || stat.uid !== process.getuid()) {
      throw new Error("Privat fil må være en vanlig fil eid av denne brukeren, uten ekstra hardlenker.");
    }
    // Bruk samme åpne fil gjennom hele operasjonen, aldri sti etter åpning.
    fchmodSync(fd, 0o600);
    ftruncateSync(fd, 0);
    writeFileSync(fd, innhold);
  } finally {
    closeSync(fd);
  }
}

export function renFeilmelding(feil) {
  const raw = feil instanceof Error ? feil.message : String(feil);
  return raw
    .replace(/[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s"']*@[^\s"']*/g, "[URL med akkreditiv fjernet]")
    .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, "[JWT-aktig nøkkel fjernet]");
}
