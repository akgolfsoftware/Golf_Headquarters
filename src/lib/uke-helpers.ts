// Uke-helpers for treningsplanlegging.
// Norsk konvensjon: uka starter mandag.

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dag = d.getDay(); // 0 = søndag
  const diff = dag === 0 ? 6 : dag - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

export function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return end;
}

export function dagerIUken(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function ukenummer(date: Date): number {
  // ISO-uke (mandag-start)
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function startOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function sammeDag(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const DAGNAVN_KORT = ["man", "tir", "ons", "tor", "fre", "lør", "søn"] as const;
const DAGNAVN_LANG = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
  "Søndag",
] as const;

export function dagNavnKort(date: Date): string {
  // 0 = søndag i JS, men vi vil ha mandag = 0
  const dag = date.getDay();
  const idx = dag === 0 ? 6 : dag - 1;
  return DAGNAVN_KORT[idx];
}

export function dagNavnLang(date: Date): string {
  const dag = date.getDay();
  const idx = dag === 0 ? 6 : dag - 1;
  return DAGNAVN_LANG[idx];
}

export function formatPeriode(start: Date, slutt: Date): string {
  const formatter = new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
  });
  // Slutt er eksklusiv, så trekk 1 dag for visning
  const sluttVist = new Date(slutt);
  sluttVist.setDate(slutt.getDate() - 1);
  return `${formatter.format(start)}–${formatter.format(sluttVist)}`;
}
