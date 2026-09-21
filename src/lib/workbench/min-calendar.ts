import type { PyramidArea, WorkbenchSession } from "@/lib/domain/workbench/types";

export type MinKalenderItem = {
  id: string;
  kind: "WORKBENCH" | "BOOKING";
  date: string;
  startMinute: number;
  durationMinutes: number;
  title: string;
  subtitle?: string;
  pyramid?: PyramidArea;
  href: string;
  session?: WorkbenchSession;
};

export type MinKalenderKilde = {
  id: string;
  title: string;
  subtitle: string;
};

export type MinKalenderData = {
  weekStart: string;
  days: Array<{ date: string; items: MinKalenderItem[] }>;
  templates: MinKalenderKilde[];
  bookings: MinKalenderKilde[];
  todayIso: string;
  nowMinute: number;
};

const OSLO_DATE = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const OSLO_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Oslo",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function osloDatoOgMinutt(date: Date): { date: string; minute: number } {
  const [hour, minute] = OSLO_TIME.format(date).split(":").map(Number);
  return { date: OSLO_DATE.format(date), minute: hour * 60 + minute };
}

