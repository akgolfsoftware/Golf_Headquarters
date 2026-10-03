/** Tidsformatering for offentlig booking. Alltid Europe/Oslo (Vercel kjører UTC). */
const TZ = "Europe/Oslo";

export function klokkeslett(iso: string): string {
  return new Intl.DateTimeFormat("nb-NO", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

/** «Ma 28.09 · 15:00» (som i tegningen BK.jsx) */
export function tidTekst(iso: string): string {
  const dato = new Date(iso);
  const uke = new Intl.DateTimeFormat("nb-NO", { timeZone: TZ, weekday: "short" }).format(dato).replace(".", "");
  const del = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "2-digit", month: "2-digit" }).formatToParts(dato);
  const dm = `${del.find((x) => x.type === "day")?.value}.${del.find((x) => x.type === "month")?.value}`;
  const ukeKort = uke.slice(0, 1).toUpperCase() + uke.slice(1, 2);
  return `${ukeKort} ${dm} · ${klokkeslett(iso)}`;
}

export function krTekst(ore: number): string {
  return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(ore / 100);
}
