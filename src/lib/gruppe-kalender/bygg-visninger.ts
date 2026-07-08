// Rene funksjoner (ingen server-only imports) — kjører trygt i klient-komponenter.
// Oversetter FastTid[]/Periode[] til props for YearPlanGantt/MonthGrid/WeekGrid.

// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import type { YearPhase } from "@/components/athletic/calendars/year-plan-gantt";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import type { MonthDayCell } from "@/components/athletic/calendars/month-grid";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import type { WeekEvent } from "@/components/athletic/calendars/week-grid";
import type { FastTid, Periode } from "./types";

type Tone = "primary" | "accent" | "moss" | "gold" | "muted";
type MonthTone = "primary" | "accent" | "muted" | "destructive";

function tilTone(tone: string | null, fallback: Tone): Tone {
  const gyldige: Tone[] = ["primary", "accent", "moss", "gold", "muted"];
  return gyldige.includes(tone as Tone) ? (tone as Tone) : fallback;
}

// MonthGrid har kun 4 toner (ikke moss/gold som YearPlanGantt) — map ned.
function tilMonthTone(tone: string | null): MonthTone {
  switch (tone) {
    case "primary":
    case "moss":
      return "primary";
    case "accent":
    case "gold":
      return "accent";
    default:
      return "muted";
  }
}

function erSammeDag(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Perioder som overlapper et gitt kalenderår, klippet til år-grensene (for YearPlanGantt). */
export function byggArsfaser(perioder: Periode[], year: number): YearPhase[] {
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year + 1, 0, 1));

  const faser: YearPhase[] = [];
  for (const p of perioder) {
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    if (end <= yearStart || start >= yearEnd) continue;
    const klippetStart = start < yearStart ? yearStart : start;
    // endDate er eksklusiv — trekk fra én dag før vi leser måned, ellers
    // "peker" en periode som slutter 1. jan neste år feilaktig inn i januar.
    const klippetSlutt = end > yearEnd ? yearEnd : end;
    const sisteDagIPerioden = new Date(klippetSlutt.getTime() - 24 * 60 * 60 * 1000);
    faser.push({
      key: p.id,
      label: p.name,
      // YearPlanGantt er 1-indeksert (1=januar) — se startMonth-1 i komponenten.
      startMonth: klippetStart.getUTCMonth() + 1,
      endMonth: sisteDagIPerioden.getUTCMonth() + 1,
      tone: tilTone(p.tone, "muted"),
    });
  }
  return faser;
}

/** Alle dager i en måned med treningsdag-markering + periodefarge (for MonthGrid). */
export function byggManedceller(
  faste: FastTid[],
  perioder: Periode[],
  year: number,
  month: number, // 1-indeksert (1=januar) — matcher MonthGrid sin konvensjon
): MonthDayCell[] {
  const maanedIndex = month - 1; // 0-indeksert for Date.UTC
  const antallDager = new Date(Date.UTC(year, maanedIndex + 1, 0)).getUTCDate();
  const idag = new Date();

  const celler: MonthDayCell[] = [];
  for (let dag = 1; dag <= antallDager; dag++) {
    const dato = new Date(Date.UTC(year, maanedIndex, dag));
    const ukedag = (dato.getUTCDay() + 6) % 7; // søn(0)->6, man(1)->0

    const periode = perioder.find((p) => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      return dato >= start && dato < end;
    });

    const treningIDag = faste.filter((f) => f.weekday === ukedag);

    celler.push({
      date: dato,
      highlight: erSammeDag(dato, idag) ? "today" : undefined,
      events: treningIDag.map((f) => ({
        key: f.id,
        label: `${f.startTime}–${f.endTime}`,
        tone: tilMonthTone(periode?.tone ?? null),
      })),
    });
  }
  return celler;
}

/** Faste treningstider for én uke (for WeekGrid) — samme rader hver uke. */
export function byggUkehendelser(faste: FastTid[]): WeekEvent[] {
  return faste.map((f) => ({
    key: f.id,
    dayIndex: f.weekday,
    startHour: Number(f.startTime.split(":")[0]) + Number(f.startTime.split(":")[1]) / 60,
    endHour: Number(f.endTime.split(":")[0]) + Number(f.endTime.split(":")[1]) / 60,
    title: f.title,
    tone: "primary",
  }));
}
