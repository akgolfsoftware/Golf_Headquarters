import { formatHours } from "@/lib/domain/workbench/labels";
import type { MonthViewModel, PyramidArea } from "@/lib/domain/workbench/types";

export const timer = (minutter: number): string => (minutter > 0 ? `${formatHours(minutter)} t` : "—");

/** Tester og turneringer: dagens hairline-linjer i måneden, kronologisk. */
export function hentHendelser(maned: MonthViewModel): { dato: string; tittel: string; pyramid: PyramidArea }[] {
  const ut: { dato: string; tittel: string; pyramid: PyramidArea }[] = [];
  for (const uke of maned.weeks) for (const dag of uke.days) {
    if (!dag.inMonth) continue;
    for (const l of dag.lines) if (l.hairline) ut.push({ dato: dag.date, tittel: l.title, pyramid: l.pyramid });
  }
  return ut.sort((a, b) => a.dato.localeCompare(b.dato));
}

/** Kalenderen kutter til tre linjer per dag; sant når noe er skjult. */
export const harSkjulteLinjer = (maned: MonthViewModel): boolean =>
  maned.weeks.some((u) => u.days.some((d) => d.inMonth && d.restCount > 0));
