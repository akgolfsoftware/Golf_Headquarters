/** Legg varighet til en datetime-local-verdi uten å endre veggklokken til en tidssone. */
export function lokalSlutt(start: string, minutter: number): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(start)
    || !Number.isInteger(minutter) || minutter < 1 || minutter > 1440) {
    throw new Error("Ugyldig starttid eller varighet.");
  }
  // UTC brukes bare til kalenderregning. Resultatet har fortsatt ingen offset.
  const dato = new Date(`${start}:00Z`);
  if (!Number.isFinite(dato.getTime()) || dato.toISOString().slice(0, 16) !== start) {
    throw new Error("Ugyldig starttid eller varighet.");
  }
  return new Date(dato.getTime() + minutter * 60_000).toISOString().slice(0, 16);
}
