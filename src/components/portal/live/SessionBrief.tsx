/**
 * PH-04 før økta — Precision Athletics.
 * Tegningen ui_kits/playerhq/screens/PH-04.jsx ligger ikke i git.
 * Handlinger og data-od-id beholdes hos kalleren.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import "@/styles/precision-athletics.css";

export type BriefDrill = { id: string; name: string; meta: string[]; notes?: string | null; target?: string | null };
export type SessionBriefProps = {
  title: string;
  durationMin: number;
  scheduledAtISO: string;
  location?: string | null;
  context: string;
  drills: BriefDrill[];
  sections: { label: string; text: string }[];
  action: ReactNode;
  message?: string | null;
  provenance?: string | null;
  odId: string;
};
const day = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Oslo" });
const clock = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });

export function SessionBrief({ title, durationMin, scheduledAtISO, location, context, drills, sections, action, message, provenance, odId }: SessionBriefProps) {
  const start = new Date(scheduledAtISO);
  const validDate = Number.isFinite(start.getTime());
  const end = new Date(start.getTime() + Math.max(0, durationMin) * 60_000);
  const clockText = validDate ? `${clock.format(start)}${durationMin > 0 ? `–${clock.format(end)}` : ""}` : null;
  return (
    <div className="pa-root ph04" data-od-id={odId}>
      <header className="ph04-top">
        <Link href="/portal/planlegge" aria-label="Tilbake til Plan" className="ph04-tilbake">Plan</Link>
        <span>Før økta</span>
      </header>
      <main className="ph04-scene">
        <article className="pa-card ph04-ark" aria-labelledby="brief-title">
          <p className="ph04-kicker">Økt{durationMin > 0 ? ` · ${durationMin} min planlagt` : ""}</p>
          <h1 id="brief-title">{title}</h1>
          {validDate && <p className="ph04-dato"><time dateTime={scheduledAtISO}>{day.format(start)}</time></p>}
          <p className="ph04-meta">{[location, clockText].filter(Boolean).join(" · ")}</p>
          <p className="ph04-meta">{context}</p>
          <ol className="ph04-ovelser" aria-label="Øvelser i økta">
            {drills.map((drill, i) => (
              <li key={drill.id}>
                <span className="ph04-nr" aria-hidden="true">{i + 1}</span>
                <div>
                  <h2>{drill.name}</h2>
                  {drill.meta.length > 0 && <p className="ph04-meta">{drill.meta.join(" · ")}</p>}
                  {drill.notes && <p className="ph04-notat">{drill.notes}</p>}
                  {drill.target && <p className="ph04-meta">{drill.target}</p>}
                </div>
              </li>
            ))}
          </ol>
          {drills.length === 0 && <p className="ph04-tom">Ingen øvelser er lagt til i denne økta.</p>}
          {sections.map((section) => (
            <section key={section.label}>
              <h2>{section.label}</h2>
              <p>{section.text}</p>
            </section>
          ))}
          {provenance && <p className="ph04-kilde">{provenance}</p>}
          <footer>
            {message && <p className="ph04-melding">{message}</p>}
            {action}
            <Link href="/portal/planlegge" className="pa-btn pa-btn--ghost pa-btn--full">Tilbake til Plan</Link>
          </footer>
        </article>
      </main>
    </div>
  );
}
