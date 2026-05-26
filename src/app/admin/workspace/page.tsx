/**
 * /admin/workspace — Min uke (default tab)
 *
 * Pixel-perfekt fra Claude Design-bundle _SEBg4QyodvbW2k06JWiGw
 * (workspace/s1-workspace-min-uke.jsx).
 *
 * 3-kol layout (I dag · Denne uka · Senere), brenner-strip sticky øverst,
 * KPI-strip i hero. Bruker sample-data inntil NotionConnection er på plass.
 */

import Link from "next/link";
import { Plus, Filter, ExternalLink, Flame, Check } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticButton } from "@/components/athletic";
import {
  WorkspaceHero,
  WorkspaceTabs,
  TaskRow,
} from "@/components/workspace/primitives";
import { type SampleTask } from "@/components/workspace/sample-data";
import { getTasksForUser } from "@/lib/notion/queries";

export const dynamic = "force-dynamic";

export default async function WorkspaceMinUkePage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // Henter tasks fra OppgaveCache hvis Notion er koblet til, ellers SAMPLE_TASKS.
  const tasks = await getTasksForUser(user.id);
  const today = tasks.filter((t) => t.today);
  const brenner = tasks.filter((t) => t.prio === "BRENNER" && !t.done);
  const week = tasks.filter((t) => !t.today && !t.done).slice(0, 5);
  const later = tasks.slice(10);

  const todayDone = today.filter((t) => t.done).length;

  return (
    <div className="space-y-6">
      <WorkspaceHero
        eyebrow="CoachHQ · Workspace"
        title="Min"
        titleItalic="uke"
        sub="23 OPPGAVER · 5 FORFALLER I DAG · 3 BRENNER"
        actions={
          <>
            <AthleticButton variant="ghost-light" size="sm">
              <Filter className="h-3.5 w-3.5" /> Filter
            </AthleticButton>
            <AthleticButton variant="ghost-light" size="sm">
              <ExternalLink className="h-3.5 w-3.5" /> Åpne Notion
            </AthleticButton>
            <AthleticButton variant="lime" size="sm">
              <Plus className="h-3.5 w-3.5" /> Ny oppgave
            </AthleticButton>
          </>
        }
        kpis={[
          { label: "I DAG", value: today.length, delta: `${todayDone} fullført`, deltaTone: "success" },
          { label: "DENNE UKA", value: 12, delta: "4 doing · 8 todo", deltaTone: "muted" },
          { label: "BLOKKERT", value: 2, delta: "venter på spiller", deltaTone: "warning" },
          { label: "DELT MED MARKUS", value: 4, delta: "1 ny i dag", deltaTone: "success" },
        ]}
      />

      <WorkspaceTabs active="uke" counts={{ tildelt: 4 }} />

      <div className="space-y-6 pb-12">
        {/* Brenner-strip */}
        {brenner.length > 0 ? <BrennerStrip tasks={brenner} /> : null}

        {/* 3-kol layout */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr_0.95fr]">
          {/* Kol 1: I dag */}
          <section>
            <ColumnHeader title="I dag" sub="TIR 27.05" count={today.length} accent />
            <div className="space-y-2">
              {today.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </div>
            <button
              type="button"
              className="font-mono mt-2 inline-flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-[11px] uppercase tracking-[0.04em] text-muted-foreground hover:bg-muted/30"
            >
              <Plus className="h-3.5 w-3.5" /> Legg til oppgave for i dag …
            </button>
          </section>

          {/* Kol 2: Denne uka */}
          <section>
            <ColumnHeader title="Denne uka" count={week.length} />
            <DenneUkaList tasks={week} />
          </section>

          {/* Kol 3: Senere */}
          <section>
            <ColumnHeader title="Senere" sub="JUNI →" count={later.length} />
            <div className="space-y-1.5">
              {later.map((t) => (
                <TaskRow key={t.id} task={t} dense />
              ))}
            </div>
            <Link
              href="/admin/workspace/oppgaver"
              className="font-mono mt-2.5 inline-block text-[11px] font-bold uppercase tracking-[0.04em] text-primary"
            >
              VIS ALLE 38 →
            </Link>

            <EmptyStatePreview />
          </section>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────── helpers ──

function ColumnHeader({
  title,
  sub,
  count,
  accent = false,
}: {
  title: string;
  sub?: string;
  count: number;
  accent?: boolean;
}) {
  return (
    <header className="mb-2 flex items-baseline justify-between">
      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
        {sub ? (
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {sub}
          </div>
        ) : null}
      </div>
      <span
        className={`font-mono rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
          accent
            ? "bg-primary text-accent"
            : "bg-muted/60 text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </header>
  );
}

function BrennerStrip({ tasks }: { tasks: SampleTask[] }) {
  return (
    <div className="rounded-2xl border border-destructive/20 border-l-[4px] border-l-destructive bg-gradient-to-br from-destructive/[0.06] to-destructive/[0.02] p-4">
      <div className="mb-2 flex items-baseline gap-2.5">
        <Flame className="h-3.5 w-3.5 text-destructive" fill="currentColor" />
        <span className="font-display text-sm font-bold tracking-tight text-destructive">
          {tasks.length} brenner
        </span>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
          må håndteres i dag
        </span>
      </div>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li
            key={t.id}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-lg border border-destructive/20 bg-card p-2.5"
          >
            <div className="text-[13.5px] font-semibold">{t.title}</div>
            <button
              type="button"
              className="font-mono inline-flex h-7 items-center gap-1 rounded-full bg-primary px-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-accent"
            >
              <Check className="h-3 w-3" /> Fullfør
            </button>
            <button
              type="button"
              className="font-mono inline-flex h-7 items-center rounded-full border border-border bg-card px-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground"
            >
              Snooze
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DenneUkaList({ tasks }: { tasks: SampleTask[] }) {
  const days = ["Onsdag 29", "Torsdag 30", "Fredag 31", "Lørdag 01.06"];
  // Distribuer tasks pseudo-tilfeldig over dagene (samme algoritme som JSX-mockupen)
  const groups = days.map((d, i) => {
    const dayTasks = tasks.filter((_, idx) => idx % 4 === i).slice(0, i === 0 ? 2 : 1);
    return { day: d, tasks: dayTasks };
  });

  return (
    <div className="space-y-4">
      {groups.map((g) =>
        g.tasks.length === 0 ? null : (
          <div key={g.day}>
            <div className="font-mono mb-1.5 text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              {g.day}
            </div>
            <div className="space-y-1.5">
              {g.tasks.map((t) => (
                <TaskRow key={t.id} task={t} dense />
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function EmptyStatePreview() {
  return (
    <div className="mt-7 rounded-xl border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        EMPTY-STATE · NY COACH
      </div>
      <p
        className="mt-2 text-[13.5px] leading-relaxed"
        style={{ fontFamily: "'Inter Tight', sans-serif", fontStyle: "italic" }}
      >
        «Du har ingen oppgaver tildelt deg ennå. Anders får varsel når du har ledig
        kapasitet.»
      </p>
    </div>
  );
}
