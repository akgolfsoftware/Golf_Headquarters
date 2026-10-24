/** Use after the authorized, locked domain decision. This is a receipt check,
 * never an access guard. Domain retries keep returning UNCHANGED without writes;
 * interactive entry points must not turn that into a success or redirect.
 */
export function krevRegistrertAkBeslutning(resultat: { status: string; questionRecorded?: boolean }, valg: "ACCEPTED" | "REJECTED" | "QUESTION") {
  const registrert = valg === "QUESTION"
    ? resultat.status === "UNCHANGED" && resultat.questionRecorded === true
    : resultat.status === valg;
  if (!registrert) {
    throw Error("Forslaget er allerede behandlet eller erstattet. Oppdater oversikten før du prøver igjen.");
  }
}
