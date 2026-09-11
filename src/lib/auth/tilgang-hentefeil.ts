/**
 * Skiller «ingen abonnementsrad» (null) fra «kunne ikke hente».
 * Databasen nede skal gi nytt forsøk, ikke betalingskrav eller utvidet tilgang.
 */
export class TilgangHentefeil extends Error {
  readonly kode = "TILGANG_HENTEFEIL" as const;
  constructor(melding = "Kunne ikke hente abonnement. Prøv igjen.") {
    super(melding);
    this.name = "TilgangHentefeil";
  }
}

export function erTilgangHentefeil(e: unknown): e is TilgangHentefeil {
  return (
    e instanceof TilgangHentefeil ||
    (typeof e === "object" &&
      e !== null &&
      "name" in e &&
      (e as { name: string }).name === "TilgangHentefeil")
  );
}
