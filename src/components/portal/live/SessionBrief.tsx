/** Valgt ZIP (4): PH-04 Okt-ark og B2 PH-04 Okt-ark iPad Mac.
 * Avvik:
 *   - Direkte rute bruker egen side; bevart bakgrunn og Mac-overlegg gjenstår.
 *   - Geist, tema og hjørner følger valgt v3. Ingen syntetiske øvelser/verdier.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./session-brief.module.css";

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

/** Felles innhold for V2-, plan- og Workbench-økter. Modellenes handlinger
 * beholdes hos kalleren; bare presentasjonen deles. */
export function SessionBrief({ title, durationMin, scheduledAtISO, location, context, drills, sections, action, message, provenance, odId }: SessionBriefProps) {
  const start = new Date(scheduledAtISO);
  const validDate = Number.isFinite(start.getTime());
  const end = new Date(start.getTime() + Math.max(0, durationMin) * 60_000);
  const clockText = validDate ? `${clock.format(start)}${durationMin > 0 ? `–${clock.format(end)}` : ""}` : null;
  return <div className={styles.page} data-od-id={odId} data-train-lock-brief>
    <header className={styles.top}><Link href="/portal/planlegge" aria-label="Tilbake til Plan" className={styles.back}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>Plan</Link><span>Før økta</span></header>
    <main className={styles.stage}>
      <article className={styles.sheet} aria-labelledby="brief-title">
        <div className={styles.handle} aria-hidden="true" />
        <div className={styles.body}>
          <p className={styles.eyebrow}>Økt{durationMin > 0 ? ` · ${durationMin} min planlagt` : ""}</p>
          <h1 id="brief-title">{title}</h1>
          {validDate && <p className={styles.date}><time dateTime={scheduledAtISO}>{day.format(start)}</time></p>}
          <p className={styles.meta}>{[location, clockText].filter(Boolean).join(" · ")}</p>
          <p className={styles.context}>{context}</p>
          <ol className={styles.drills} aria-label="Øvelser i økta">
            {drills.map((drill, i) => <li key={drill.id} className={styles.drill}><span className={styles.number} aria-hidden="true">{i + 1}</span><div><h2>{drill.name}</h2>{drill.meta.length > 0 && <p className={styles.meta}>{drill.meta.join(" · ")}</p>}{drill.notes && <p className={styles.note}>{drill.notes}</p>}{drill.target && <p className={styles.meta}>{drill.target}</p>}</div></li>)}
          </ol>
          {drills.length === 0 && <p className={styles.empty}>Ingen øvelser er lagt til i denne økta.</p>}
          {sections.map((section) => <section className={styles.section} key={section.label}><h2>{section.label}</h2><p>{section.text}</p></section>)}
          {provenance && <p className={styles.provenance}>{provenance}</p>}
        </div>
        <footer className={styles.footer}>
          {message && <p className={styles.message}>{message}</p>}
          {action}
          <Link href="/portal/planlegge" className={styles.cancel}>Tilbake til Plan</Link>
        </footer>
      </article>
    </main>
  </div>;
}
