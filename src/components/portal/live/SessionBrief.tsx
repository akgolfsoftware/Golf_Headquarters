/**
 * PH-04 Før start i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-live.jsx › PH04). Natt, en kolonne, Start nederst.
 *
 * Felles innhold for V2-, plan- og Workbench-økter. Modellenes handlinger beholdes hos
 * kalleren; bare presentasjonen deles.
 *
 * Bevisste avvik fra tegningen:
 *   - AK-formelen per drill og «Teknisk oppgave» vises ikke: live-modellen har ingen slik felt.
 *   - L-fase og CS-mål i drill-metaen er fjernet (utgåtte begreper, beslutninger.md §Treningsfag).
 */
import type { ReactNode } from "react";
import { List, ListPlus } from "lucide-react";
import { AkseMerke, Meta, TomTilstand, type Akse } from "@/components/precision/pa";
import { PHFokus, PHLukk } from "@/components/portal/precision/PHFokus";

export type BriefDrill = { id: string; name: string; meta: string[]; notes?: string | null; target?: string | null };
export type SessionBriefProps = {
  title: string;
  durationMin: number;
  scheduledAtISO: string;
  location?: string | null;
  context: string;
  akse?: Akse | null;
  drills: BriefDrill[];
  sections: { label: string; text: string }[];
  action: ReactNode;
  message?: string | null;
  provenance?: string | null;
  odId: string;
};
const day = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Oslo" });
const clock = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });

export function SessionBrief({ title, durationMin, scheduledAtISO, location, context, akse, drills, sections, action, message, provenance, odId }: SessionBriefProps) {
  const start = new Date(scheduledAtISO);
  const validDate = Number.isFinite(start.getTime());
  const end = new Date(start.getTime() + Math.max(0, durationMin) * 60_000);
  const klokke = validDate ? `${clock.format(start)}${durationMin > 0 ? `–${clock.format(end)}` : ""}` : null;
  const topLinje = [location, klokke].filter(Boolean).join(" · ");
  return <PHFokus odId={odId} label="Før start" max={600}
    topp={<>
      <PHLukk href="/portal" label="Lukk og gå til I dag" />
      <div className="pa-fokus__topp-tekst"><div className="kicker">Før start</div>{topLinje && <Meta>{topLinje.toUpperCase()}</Meta>}</div>
    </>}
    handling={<>
      {message && <p className="pa-okt-dempet" role="status">{message}</p>}
      {action}
    </>}>
    <header className="pa-okt-hode">
      <Meta>{context.toUpperCase()}</Meta>
      <h1 className="pa-okt-stor">{title}</h1>
      <div className="pa-okt-merker">
        {akse && <AkseMerke axis={akse} />}
        <Meta>{[durationMin > 0 ? `${durationMin} MIN` : null, validDate ? day.format(start).toUpperCase() : null].filter(Boolean).join(" · ") || "—"}</Meta>
      </div>
    </header>
    {drills.length === 0
      ? <TomTilstand icon={ListPlus} title="Ingen øvelser i økta" text="Ingen øvelser er lagt til i denne økta. Du kan bygge økta selv i Workbench." />
      : <section aria-label="Øvelser i økta" className="pa-card pa-okt-kort"><ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {drills.map((d, i) => <li key={d.id} className="pa-okt-rad pa-okt-rad--hoy" style={{ ["--rad-mal" as string]: "28px minmax(0,1fr)" }}>
          <Meta style={{ font: "var(--type-num-s)" }}>{String(i + 1).padStart(2, "0")}</Meta>
          <span className="pa-okt-rad__tekst">
            <h2 className="pa-okt-rad__navn" style={{ margin: 0 }}>{d.name}</h2>
            {d.meta.length > 0 && <Meta>{d.meta.join(" · ").toUpperCase()}</Meta>}
            {d.notes && <span className="pa-okt-dempet" style={{ whiteSpace: "pre-wrap" }}>{d.notes}</span>}
            {d.target && <Meta>{d.target.toUpperCase()}</Meta>}
          </span>
        </li>)}
      </ol></section>}
    {sections.map((s) => <section key={s.label} className="pa-okt-seksjon" aria-label={s.label}>
      <span className="kicker"><List size={12} aria-hidden style={{ verticalAlign: "-2px", marginRight: 6 }} />{s.label}</span>
      <p className="pa-okt-tekst">{s.text}</p>
    </section>)}
    {provenance && <Meta>{provenance.toUpperCase()}</Meta>}
  </PHFokus>;
}
