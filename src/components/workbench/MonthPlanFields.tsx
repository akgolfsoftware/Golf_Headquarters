"use client";

import { OMRAADER, PYRAMIDE_LABEL } from "@/lib/domain/ak-formel-v2";
import { MONTH_AXES, MONTH_PRIORITIES, type MonthDetails } from "@/lib/domain/month-plan";

export type MonthPart = "fokus" | "ramme" | "prioriteringer" | "notat";
export const MONTH_PART_LABEL: Record<MonthPart, string> = { fokus: "Fokus og målsetninger", ramme: "Formål, sted og mengderamme", prioriteringer: "Prioriter de 19 områdene", notat: "Månedsnotat" };
const PRIORITY_LABEL = { UTVIKLE: "Utvikle", VEDLIKEHOLDE: "Vedlikeholde", REDUSERE: "Redusere" };

export function MonthPlanFields({ part, value, onChange }: { part: MonthPart; value: MonthDetails; onChange: (next: MonthDetails) => void }) {
  return <div className="month-fields">
    {part === "fokus" && <>
      <label className="ws-field">Månedens fokus<input value={value.focus} maxLength={80} onChange={e => onChange({ ...value, focus: e.target.value })} /><small>Maksimalt 80 tegn. Ett tydelig fokus for måneden.</small></label>
      <label className="ws-field">Målsetninger<textarea rows={5} value={value.goals.join("\n")} onChange={e => onChange({ ...value, goals: e.target.value.split("\n") })} /><small>Én målsetning per linje. Maksimalt 20 målsetninger med 400 tegn hver.</small></label>
    </>}
    {part === "ramme" && <>
      <label className="ws-field">Formål<textarea rows={4} maxLength={1000} value={value.purpose} onChange={e => onChange({ ...value, purpose: e.target.value })} /></label>
      <label className="ws-field">Sted<input maxLength={300} value={value.location} onChange={e => onChange({ ...value, location: e.target.value })} /></label>
      <h3>Ønsket mengderamme</h3><p className="ws-muted">Dette er rammen for måneden. Planlagte timer kommer fra ukeplanene. Ukeplaner og økter endres separat.</p>
      <div className="month-volume-fields">{MONTH_AXES.map(axis => <label key={axis} className="ws-field">{PYRAMIDE_LABEL[axis]} · timer<input type="number" min={0} max={744} step="0.25" inputMode="decimal" value={value.volumeHours[axis] ?? ""} onChange={e => onChange({ ...value, volumeHours: { ...value.volumeHours, [axis]: e.target.value === "" ? null : Number(e.target.value) } })} /></label>)}</div>
    </>}
    {part === "prioriteringer" && <><p className="ws-muted">Velg en prioritet per område. La feltet stå åpent når det ikke er vurdert.</p><div className="month-priority-fields">{OMRAADER.map(area => <label className="ws-field" key={area.kode}>{area.label}<select value={value.priorities[area.kode] ?? ""} onChange={e => onChange({ ...value, priorities: { ...value.priorities, [area.kode]: e.target.value === "" ? null : MONTH_PRIORITIES.find(p => p === e.target.value) ?? null } })}><option value="">Ikke vurdert</option>{MONTH_PRIORITIES.map(priority => <option key={priority} value={priority}>{PRIORITY_LABEL[priority]}</option>)}</select></label>)}</div></>}
    {part === "notat" && <label className="ws-field">Månedsnotat<textarea maxLength={1000} rows={7} value={value.note} onChange={e => onChange({ ...value, note: e.target.value })} /><small>{value.note.length} av 1000 tegn</small></label>}
  </div>;
}

export function MonthPlanContent({ details }: { details: MonthDetails }) {
  const priorities = OMRAADER.filter(area => details.priorities[area.kode]);
  return <div className="month-content">
    <p>{details.focus || "Fokus er ikke satt."}</p>
    {details.goals.length > 0 && <ul>{details.goals.map((goal, i) => <li key={`${i}-${goal}`}>{goal}</li>)}</ul>}
    {(details.purpose || details.location) && <dl className="ws-kv">{details.purpose && <div><dt>Formål</dt><dd>{details.purpose}</dd></div>}{details.location && <div><dt>Sted</dt><dd>{details.location}</dd></div>}</dl>}
    {MONTH_AXES.some(axis => details.volumeHours[axis] !== null) && <details><summary>Ønsket mengderamme</summary><dl className="ws-kv">{MONTH_AXES.map(axis => <div key={axis}><dt>{PYRAMIDE_LABEL[axis]}</dt><dd>{details.volumeHours[axis] === null ? "Ikke satt" : <span className="pa-coach-live__data">{new Intl.NumberFormat("nb-NO").format(details.volumeHours[axis])} t</span>}</dd></div>)}</dl></details>}
    <details><summary>Prioriteringer · {priorities.length} av 19 vurdert</summary>{priorities.length ? <dl className="ws-kv">{priorities.map(area => <div key={area.kode}><dt>{area.label}</dt><dd>{PRIORITY_LABEL[details.priorities[area.kode]!]}</dd></div>)}</dl> : <p className="ws-muted">Ingen prioriteringer er satt.</p>}</details>
    {details.note && <details><summary>Månedsnotat</summary><p className="month-note">{details.note}</p></details>}
  </div>;
}
