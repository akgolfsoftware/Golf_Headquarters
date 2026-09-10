import { OSLO_YMD_FMT } from "@/lib/jarvis/dagen";

/** Lokal kalenderdato i ny-økt-lenken, uavhengig av nettleserens tidssone.
 * En lenke utenfor den viste uken skal aldri flyttes til en annen dag. */
export function parseWorkbenchStart(raw: string | null, weekStartISO?: string) {
  if (!raw || !weekStartISO) return null;
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, y, month, day, h, minute] = m.map(Number);
  if (h > 23 || minute > 59 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const target = new Date(Date.UTC(y, month - 1, day));
  if (target.toISOString().slice(0, 10) !== raw.slice(0, 10)) return null;
  const start = new Date(weekStartISO);
  if (!Number.isFinite(start.getTime())) return null;
  const mandag = new Date(`${OSLO_YMD_FMT.format(start)}T00:00:00Z`);
  const dayIndex = Math.round((target.getTime() - mandag.getTime()) / 86_400_000);
  if (dayIndex < 0 || dayIndex > 6) return null;
  const min = Math.min(1410, Math.round((h * 60 + minute) / 30) * 30);
  return { dayIndex, tid: `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}` };
}
