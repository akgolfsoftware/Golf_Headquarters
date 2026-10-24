const ALLEREDE_BEHANDLET = "Forslaget er allerede behandlet eller erstattet. Oppdater oversikten før du prøver igjen.";

export class AkBeslutningAlleredeBehandlet extends Error {
  constructor() { super(ALLEREDE_BEHANDLET); }
}

export type AkBeslutningskvittering =
  | { ok: true }
  | { ok: false; kode: "ALLEREDE_BEHANDLET"; feil: string; oppdater: true };

/** Only translate this known receipt failure after the original access checks.
 * Never serialize arbitrary errors, database details or denied access.
 */
export async function medAkBeslutningskvittering(handling: () => Promise<void>): Promise<AkBeslutningskvittering> {
  try {
    await handling();
    return { ok: true };
  } catch (error) {
    if (!(error instanceof AkBeslutningAlleredeBehandlet)) throw error;
    return { ok: false, kode: "ALLEREDE_BEHANDLET", feil: ALLEREDE_BEHANDLET, oppdater: true };
  }
}

/** Use after the authorized, locked domain decision. This is a receipt check,
 * never an access guard. Domain retries keep returning UNCHANGED without writes;
 * interactive entry points must not turn that into a success or redirect.
 */
export function krevRegistrertAkBeslutning(resultat: { status: string; questionRecorded?: boolean }, valg: "ACCEPTED" | "REJECTED" | "QUESTION") {
  const registrert = valg === "QUESTION"
    ? resultat.status === "UNCHANGED" && resultat.questionRecorded === true
    : resultat.status === valg;
  if (!registrert) {
    throw new AkBeslutningAlleredeBehandlet();
  }
}
