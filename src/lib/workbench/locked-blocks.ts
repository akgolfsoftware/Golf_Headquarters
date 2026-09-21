import type { LockedBlock } from "@/lib/domain/workbench/types";

type BusyRow = {
  id: string; title: string; startAt: Date; endAt: Date;
  recurring: string | null; isPrivate: boolean; kind: string;
};
type SchoolRow = { id: string; title: string; date: Date; category: string };
const DAY = 86_400_000;
const WEEK = 7 * DAY;
const schoolCategories = new Set(["TIME", "PROVE", "HELDAGSPROVE", "EKSAMEN", "SKOLETUR"]);
const oslo = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

// Kalenderkoordinat, ikke et absolutt tidspunkt. Bevarer norsk veggklokke
// også når en ukentlig avtale passerer sommer-/vintertid.
function wallTime(date: Date): number {
  const p = Object.fromEntries(oslo.formatToParts(date).map(x => [x.type, x.value]));
  return Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute));
}

/** Ren visningsmapping. Kalleren må kontrollere spillertilgang før lesing. */
export function weekLockedBlocks(weekStart: string, busy: BusyRow[], school: SchoolRow[]): LockedBlock[][] {
  const start = Date.parse(`${weekStart}T00:00:00Z`);
  const end = start + WEEK;
  const days: LockedBlock[][] = Array.from({ length: 7 }, () => []);
  for (const row of busy) {
    const first = wallTime(row.startAt);
    const length = wallTime(row.endAt) - first;
    if (!Number.isFinite(first) || length <= 0) continue;
    const weekly = row.recurring === "WEEKLY";
    const jump = weekly ? Math.max(0, Math.floor((start - first - length) / WEEK) + 1) : 0;
    for (let occurrence = first + jump * WEEK; occurrence < end; occurrence += WEEK) {
      for (let i = 0; i < 7; i++) {
        const day = start + i * DAY;
        const from = Math.max(day, occurrence);
        const to = Math.min(day + DAY, occurrence + length);
        if (to <= from) continue;
        days[i].push({
          id: `busy-${row.id}-${occurrence}-${i}`, title: row.isPrivate ? "Opptatt" : row.title,
          // Ikke røp kategori (f.eks. helse) fra en privat avtale.
          kind: row.isPrivate ? "OPPTATT" : row.kind === "SKOLE" ? "SKOLE" : row.kind === "REISE" ? "REISE" : "OPPTATT",
          startMinute: (from - day) / 60_000, durationMinutes: (to - from) / 60_000, dimmed: true,
        });
      }
      if (!weekly) break;
    }
  }
  for (const row of school) {
    if (!schoolCategories.has(row.category)) continue;
    // Skolerutens dato er en kalenderdato, ikke et Oslo-klokkeslett.
    const i = Math.floor((Date.parse(row.date.toISOString().slice(0, 10) + "T00:00:00Z") - start) / DAY);
    if (i >= 0 && i < 7) days[i].push({ id: `school-${row.id}`, title: row.title, kind: "SKOLE", startMinute: 0, durationMinutes: 1440, dimmed: true });
  }
  return days.map(day => day.sort((a, b) => a.startMinute - b.startMinute || a.id.localeCompare(b.id)));
}
