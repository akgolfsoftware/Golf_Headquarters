/**
 * Rom og simulatorer i booking (bookingplanen, steg 2).
 *
 * En tjeneste kan kreve en bestemt type rom (`ServiceType.facilityType`) på tjenestens
 * sted. Da tilbys en tid bare når minst ett rom av typen har ledig plass, og
 * bookingen får tildelt det første ledige rommet.
 * Rene funksjoner uten Prisma, så reglene kan testes alene.
 */

export type RomFasilitet = { id: string; capacity: number };

export type RomBelegg = {
  facilityId: string | null;
  startAt: Date;
  endAt: Date;
};

/**
 * Første rom (i den rekkefølgen de er gitt) som har ledig plass i tidsrommet.
 * Bookinger uten rom teller ikke. `null` betyr at alle rom er fulle.
 */
export function forsteLedigeRom(
  fasiliteter: RomFasilitet[],
  belegg: RomBelegg[],
  startAt: Date,
  endAt: Date,
): string | null {
  for (const rom of fasiliteter) {
    const opptatt = belegg.filter(
      (b) =>
        b.facilityId === rom.id &&
        b.startAt.getTime() < endAt.getTime() &&
        b.endAt.getTime() > startAt.getTime(),
    ).length;
    if (opptatt < Math.max(1, rom.capacity)) return rom.id;
  }
  return null;
}
