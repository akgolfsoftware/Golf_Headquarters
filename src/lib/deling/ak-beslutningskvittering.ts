const ALLEREDE_BEHANDLET = "Forslaget er allerede behandlet eller erstattet. Oppdater oversikten før du prøver igjen.";

export class AkBeslutningAlleredeBehandlet extends Error {
  constructor() { super(ALLEREDE_BEHANDLET); }
}

const GRUNNLAGSUTFALL = {
  "utdatert-ukegrunnlag": { kode: "UKEGRUNNLAG_ENDRET", feil: "Ukegrunnlaget er endret. Forslaget må vurderes på nytt før det kan godkjennes." },
  "utdatert-bankgrunnlag": { kode: "BANKGRUNNLAG_ENDRET", feil: "Øvelsesbanken er endret. Forslaget må vurderes på nytt før det kan godkjennes." },
  "utdatert-faglig-vurdering": { kode: "FAGLIG_VURDERING_ENDRET", feil: "Den faglige vurderingen er endret. Forslaget må vurderes på nytt før det kan godkjennes." },
  "maneds-ukevalg-ikke-stottet": { kode: "PLANVALG_KREVER_GJENNOMGANG", feil: "Dette forslaget støtter ikke egne måneds- eller ukevalg. Planen må gjennomgås før videre behandling." },
} as const;

/** Raised only inside the authorized weekly-proposal transaction. Plain errors
 * with similar messages must never be translated into a public receipt. */
export class AkUkeforslagKanIkkeGodkjennes extends Error {
  constructor(readonly grunn: keyof typeof GRUNNLAGSUTFALL) { super(grunn); }
}

export type AkBeslutningskvittering =
  | { ok: true }
  | { ok: false; kode: "ALLEREDE_BEHANDLET" | (typeof GRUNNLAGSUTFALL)[keyof typeof GRUNNLAGSUTFALL]["kode"]; feil: string; oppdater: true };

/** Only translate known receipt failures after the original access checks.
 * Never serialize arbitrary errors, database details or denied access.
 */
export async function medAkBeslutningskvittering(handling: () => Promise<void>): Promise<AkBeslutningskvittering> {
  try {
    await handling();
    return { ok: true };
  } catch (error) {
    if (error instanceof AkUkeforslagKanIkkeGodkjennes) {
      const utfall = GRUNNLAGSUTFALL[error.grunn];
      return { ok: false, kode: utfall.kode, feil: utfall.feil, oppdater: true };
    }
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
