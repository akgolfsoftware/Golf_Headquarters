/** Saksnummeret spilleren ser for en melding til AK Golf: de seks siste tegnene i id-en. */
export function saksnummer(id: string): string {
  return `AK-${id.slice(-6).toUpperCase()}`;
}

/** Typene i «Skriv til oss», slik de lagres i AppFeedback.type, og navnet spilleren ser. */
export const SKRIV_TYPE_NAVN = { sporsmal: "Spørsmål", bug: "Feil i appen", forslag: "Forslag", ros: "Ros" } as const;
export type SkrivTilOssType = keyof typeof SKRIV_TYPE_NAVN;
