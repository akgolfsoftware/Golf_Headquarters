"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Tall } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";
import "@/styles/precision-live.css";

export type BriefDrill = { id: string; name: string; meta: string[]; notes?: string | null; target?: string | null };
export type SessionBriefProps = {
  title: string; durationMin: number; scheduledAtISO: string; location?: string | null; context: string;
  drills: BriefDrill[]; sections: { label: string; text: string }[]; action: ReactNode;
  message?: string | null; provenance?: string | null; odId: string;
};
const clock = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });

export function SessionBrief({ title, durationMin, scheduledAtISO, location, context, drills, sections, action, message, provenance, odId }: SessionBriefProps) {
  const start = new Date(scheduledAtISO);
  const valid = Number.isFinite(start.getTime());
  const end = new Date(start.getTime() + Math.max(0, durationMin) * 60000);
  const time = valid ? clock.format(start) + (durationMin > 0 ? "–" + clock.format(end) : "") : null;
  return <div className="pa-root pa-live ph04" data-theme="night" data-design="precision-athletics" data-od-id={odId}>
    <header className="pa-live__top"><Link className="pa-iconbtn" href="/portal/planlegge/workbench" aria-label="Til planen"><ArrowLeft size={20} /></Link><span className="pa-live__context">Før økta</span></header>
    <main className="pa-live__main pa-live__main--brief">
      <div><p className="pa-live__source">{context}</p><h1>{title}</h1></div>
      <dl className="pa-live__summary">
        <div><dt>Planlagt tid</dt><dd>{durationMin > 0 ? durationMin + " min" : "—"}</dd></div>
        {time && <div><dt>Tidspunkt</dt><dd><Tall>{time}</Tall></dd></div>}
        {location && <div><dt>Sted</dt><dd style={{ font: "var(--type-title-s)" }}>{location}</dd></div>}
        <div><dt>Øvelser</dt><dd>{drills.length}</dd></div>
      </dl>
      {sections.map((s) => <section key={s.label}><h2>{s.label}</h2><p className="pa-live__instruction">{s.text}</p></section>)}
      {drills.length > 0 ? <section aria-labelledby="ph04-drills"><h2 id="ph04-drills">Dette skal du gjøre</h2><div className="pa-live__rows">
        {drills.map((d, index) => <article key={d.id}><div><h3>{index + 1}. {d.name}</h3><p className="pa-live__help">{d.meta.join(" · ")}</p>{(d.notes || d.target) && <details className="pa-live__notes"><summary>Instruksjon</summary>{d.notes && <p className="pa-live__instruction">{d.notes}</p>}{d.target && <p className="pa-live__instruction">{d.target}</p>}</details>}</div></article>)}
      </div></section> : <section><h2>Ingen øvelser lagt til</h2><p className="pa-live__instruction">Du kan åpne økta i Workbench og legge til øvelser.</p></section>}
      {message && <p className="pa-live__status" role="status">{message}</p>}
      {provenance && <p className="pa-live__source">{provenance}</p>}
    </main>
    <footer className="pa-live__footer"><div style={{ display: "block" }}>{action}</div></footer>
  </div>;
}
