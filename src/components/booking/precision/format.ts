/** Tidsformatering for offentlig booking. Alltid Europe/Oslo (Vercel kjører UTC). */
const TZ = "Europe/Oslo";

export function klokkeslett(iso: string): string {
  return new Intl.DateTimeFormat("nb-NO", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

/** «man. 28. sep. · 17:00» */
export function tidTekst(iso: string): string {
  const d = new Intl.DateTimeFormat("nb-NO", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" }).format(new Date(iso));
  return `${d} · ${klokkeslett(iso)}`;
}

export function krTekst(ore: number): string {
  return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(ore / 100);
}
