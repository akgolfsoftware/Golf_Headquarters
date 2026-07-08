// Rene funksjoner (ingen server-only imports) — kjører trygt i klient-komponenter.
// Oversetter FastTid[]/Periode[] til props for golfdata MaanedKalender/TidsGrid
// (+ YearPlanGantt for årsvisningen — golfdata mangler AK-periode-gantt, gap meldt).

// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): golfdata mangler AK-periode-årsgantt (gap meldt) — YearPlanGantt beholdes til DS får en
import type { YearPhase } from "@/components/athletic/calendars/year-plan-gantt";
import type { MaanedDag } from "@/components/athletic/golfdata";
import type { FastTid, Periode } from "./types";

type Tone = "primary" | "accent" | "moss" | "gold" | "muted";

function tilTone(tone: string | null, fallback: Tone): Tone {
  const gyldige: Tone[] = ["primary", "accent", "moss", "gold", "muted"];
  return gyldige.includes(tone as Tone) ? (tone as Tone) : fallback;
}

/** Én fast treningstid plassert i TidsGrid (ukevisningen). */
export type UkeBlokk = {
  id: string;
  /** 0=man .. 6=søn. */
  dag: number;
  /** Desimaltimer, f.eks. 8 og 10. */
  fra: number;
  til: number;
  tittel: string;
  tid: string;
};

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

/** Alle dager i en måned med treningsøkter som piller (for MaanedKalender, piller-modus). */
export function byggManedsdager(
  faste: FastTid[],
  year: number,
  month: number, // 1-indeksert (1=januar)
): MaanedDag[] {
  const maanedIndex = month - 1; // 0-indeksert for Date.UTC
  const antallDager = new Date(Date.UTC(year, maanedIndex + 1, 0)).getUTCDate();
  const idag = new Date();

  const dager: MaanedDag[] = [];
  for (let dag = 1; dag <= antallDager; dag++) {
    const dato = new Date(Date.UTC(year, maanedIndex, dag));
    const ukedag = (dato.getUTCDay() + 6) % 7; // søn(0)->6, man(1)->0
    const treningIDag = faste.filter((f) => f.weekday === ukedag);
    dager.push({
      date: dag,
      today: erSammeDag(dato, idag),
      okter: treningIDag.map((f) => ({
        id: f.id,
        tittel: f.title,
        tid: f.startTime,
      })),
    });
  }
  return dager;
}

/** Faste treningstider som TidsGrid-blokker — samme rader hver uke. */
export function byggUkeblokker(faste: FastTid[]): UkeBlokk[] {
  return faste.map((f) => ({
    id: f.id,
    dag: f.weekday,
    fra: Number(f.startTime.split(":")[0]) + Number(f.startTime.split(":")[1]) / 60,
    til: Number(f.endTime.split(":")[0]) + Number(f.endTime.split(":")[1]) / 60,
    tittel: f.title,
    tid: `${f.startTime}–${f.endTime}`,
  }));
}
