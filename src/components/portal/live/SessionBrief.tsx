/**
 * PH-04 Live-økt: før start. Portert fra Claude Design «AK Golf Precision
 * Athletics» (7d7c2994), ui_kits/playerhq/screens/PH-live.jsx, runde 24.
 * Natt, én kolonne, ingen fanelinje, én fullbredde primærhandling nederst.
 *
 * Avvik fra tegningen (verdier finnes ikke i appens data, vises ikke):
 *   - AK-formelen under tittelen og «teknisk oppgave» per drill.
 *   - Mål/fokus/coachkommentar vises som kort under drillene (funksjon som
 *     fantes før porteringen, ikke fjernet).
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ListPlus, X } from "lucide-react";
import { AkseMerke, Ikon, KnappLenke, Meta, TomTilstand, type Akse } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";
import styles from "./session-brief.module.css";

export type BriefDrill = {
  id: string;
  name: string;
  /** Undertekst i store bokstaver, f.eks. akse og fase. */
  meta: string[];
  /** Planlagte repetisjoner; null vises som «—». */
  reps: number | null;
  /** Planlagt tid i minutter; null eller 0 vises som «—». */
  min: number | null;
  notes?: string | null;
  target?: string | null;
};
export type SessionBriefProps = {
  title: string;
  durationMin: number;
  scheduledAtISO: string;
  location?: string | null;
  axes: Akse[];
  /** Spillerens navn og coachens navn, hvis kjent. */
  who?: string | null;
  coach?: string | null;
  drills: BriefDrill[];
  sections: { label: string; text: string }[];
  /** Handlingen nederst. Erstattes av «Tilbake til I dag» når økta kan startes uten driller. */
  action: ReactNode;
  /** True når `action` starter økta. */
  startable?: boolean;
  /** Ekstra sekundærhandling under primærknappen. */
  secondary?: ReactNode;
  message?: string | null;
  provenance?: string | null;
  odId: string;
};
const clock = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });
const AKSER: readonly string[] = ["fys", "tek", "slag", "spill", "turn"];
export const tilAkse = (value: string | null | undefined): Akse[] => (value && AKSER.includes(value.toLowerCase()) ? [value.toLowerCase() as Akse] : []);

/** Primær- eller sekundærlenke nederst, med Precision-knappestil og 64 px høyde. */
export function BriefLenke({ href, children, odId, variant = "primary" }: { href: string; children: ReactNode; odId?: string; variant?: "primary" | "secondary" | "ghost" }) {
  return <Link href={href} data-od-id={odId} className={`pa-btn pa-btn--${variant} pa-btn--xl pa-btn--full`} style={{ height: 64 }}>{children}</Link>;
}

/** Felles innhold for V2-, plan- og Workbench-økter. Modellenes handlinger
 * beholdes hos kalleren; bare presentasjonen deles. */
export function SessionBrief({ title, durationMin, scheduledAtISO, location, axes, who, coach, drills, sections, action, startable, secondary, message, provenance, odId }: SessionBriefProps) {
  const start = new Date(scheduledAtISO);
  const valid = Number.isFinite(start.getTime());
  const end = new Date(start.getTime() + Math.max(0, durationMin) * 60_000);
  const clockText = valid ? `${clock.format(start)}${durationMin > 0 ? `–${clock.format(end)}` : ""}` : "—";
  const empty = drills.length === 0;
  const blockedEmpty = empty && startable;
  const byline = [who ? who.toUpperCase() : null, coach ? `MED ${coach.toUpperCase()}` : null].filter(Boolean).join(" · ");
  return <div className="pa-root" data-theme="night" data-design="precision-athletics" data-od-id={odId}>
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <Link href="/portal" aria-label="Lukk" className={styles.close}><Ikon icon={X} size={22} name="x" /></Link>
          <div className={styles.topText}><div className="kicker">Før start</div><Meta>{[clockText, location ? location.toUpperCase() : null].filter(Boolean).join(" · ")}</Meta></div>
        </div>
        <header className={styles.head}>
          {byline && <Meta>{byline}</Meta>}
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.badges}>
            {axes.map((a) => <AkseMerke key={a} axis={a} />)}
            <Meta>{durationMin > 0 ? `${durationMin} MIN` : "— MIN"} · {clockText}</Meta>
          </div>
        </header>
        {empty ? <TomTilstand icon={ListPlus} title="Ingen driller i økta" text="Coachen har ikke lagt inn driller ennå. Du kan bygge økta selv i Workbench."
          actions={<KnappLenke variant="secondary" href="/portal/planlegge/workbench">Åpne Workbench</KnappLenke>} />
          : <section aria-label="Driller" className="pa-card" style={{ padding: "8px 16px" }}>
            <ol className={styles.list}>{drills.map((d, i) => <li key={d.id} className={styles.row}>
              <Meta style={{ font: "var(--type-num-s)" }}>{String(i + 1).padStart(2, "0")}</Meta>
              <span className={styles.cell}>
                <span className={styles.drillName}>{d.name}</span>
                {d.meta.length > 0 && <Meta>{d.meta.join(" · ").toUpperCase()}</Meta>}
                {d.target && <Meta>{d.target.toUpperCase()}</Meta>}
                {d.notes && <span className={styles.note}>{d.notes}</span>}
              </span>
              <span className={`${styles.cell} ${styles.right}`}>
                <span className={styles.reps}>{d.reps != null && d.reps > 0 ? d.reps : "—"}</span>
                <Meta>REPS · {d.min != null && d.min > 0 ? `${d.min} MIN` : "— MIN"}</Meta>
              </span>
            </li>)}</ol>
          </section>}
        {sections.map((s) => <section key={s.label} className="pa-card" style={{ padding: 16, gap: 8 }}><span className="kicker">{s.label}</span><p className={styles.cardText}>{s.text}</p></section>)}
        {provenance && <span className={styles.prov}>{provenance.toUpperCase()}</span>}
      </div>
      <div className={styles.bar}><div className={styles.barInner}>
        {message && <p className={styles.message} role="status">{message}</p>}
        {blockedEmpty ? <KnappLenke size="xl" fullWidth icon={ArrowLeft} href="/portal">Tilbake til I dag</KnappLenke> : action}
        {secondary}
      </div></div>
    </div>
  </div>;
}
