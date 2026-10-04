/** Visningshjelpere for PH-24d Utfordringer. Datoer vises alltid i Oslo-tid. */
const OSLO = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" });

// Bygges av delene, ikke av språkets ferdige mønster: nb-NO gir «30.9.» uten fulle ICU-data.
function deler(d: Date) {
  const p = Object.fromEntries(OSLO.formatToParts(d).map((x) => [x.type, x.value]));
  return { dd: p.day!, mm: p.month!, yyyy: p.year! };
}

/** «30.09.2026», eller null uten dato. */
export const datoLang = (d: Date | null | undefined): string | null => {
  if (!d) return null;
  const { dd, mm, yyyy } = deler(d);
  return `${dd}.${mm}.${yyyy}`;
};
/** «30.09», eller null uten dato. */
export const datoKort = (d: Date | null | undefined): string | null => {
  if (!d) return null;
  const { dd, mm } = deler(d);
  return `${dd}.${mm}`;
};
/** Plassering som tekst; manglende plassering er «—», aldri gjetning. */
export const plassTekst = (rank: number | null | undefined): string => (rank == null ? "—" : String(rank));
