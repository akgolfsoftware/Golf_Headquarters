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
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  WorkspaceHero,
  WorkspaceTabs,
  TaskRow,
} from "@/components/workspace/primitives";
import { type SampleTask } from "@/components/workspace/sample-data";
import { getTasksForUser } from "@/lib/notion/queries";
import {
  WorkspaceHeaderActions,
  LeggTilOppgaveButton,
  BrennerStrip,
} from "./workspace-actions";

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

  // Avledede teller — ingen hardkodede tall (samme mønster som oppgaver/page.tsx).
  const åpneTotalt = tasks.filter((t) => !t.done).length;
  const forfallerIDag = today.filter((t) => !t.done).length;
  const denneUkaAntall = tasks.filter((t) => !t.today && !t.done).length;
  const doingAntall = tasks.filter((t) => t.status === "DOING").length;
  const todoAntall = tasks.filter((t) => t.status === "TODO" && !t.done).length;
  const blokkertAntall = tasks.filter((t) => t.status === "BLOKKERT").length;
  const deltAntall = tasks.filter((t) => t.assigned.length > 1).length;

  // Kolonne-subtittel for «I dag» — dagens dato.
  const now = new Date();
  const ukedager = ["SØN", "MAN", "TIR", "ONS", "TOR", "FRE", "LØR"];
  const todaySub = `${ukedager[now.getDay()]} ${String(now.getDate()).padStart(2, "0")}.${String(now.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <WorkspaceHero
        eyebrow="AgencyOS · Workspace"
        title="Min"
        titleItalic="uke"
        sub={`${åpneTotalt} OPPGAVER · ${forfallerIDag} FORFALLER I DAG · ${brenner.length} BRENNER`}
        actions={<WorkspaceHeaderActions />}
        kpis={[
          { label: "I DAG", value: today.length, delta: `${todayDone} fullført`, deltaTone: "success" },
          { label: "DENNE UKA", value: denneUkaAntall, delta: `${doingAntall} doing · ${todoAntall} todo`, deltaTone: "muted" },
          { label: "BLOKKERT", value: blokkertAntall, delta: blokkertAntall > 0 ? "venter" : "ingen", deltaTone: "warning" },
          { label: "DELT", value: deltAntall, delta: "flere tildelt", deltaTone: "success" },
        ]}
      />

      <WorkspaceTabs active="uke" counts={{ tildelt: deltAntall }} />

      <div className="space-y-6 pb-12">
        {/* Brenner-strip */}
        {brenner.length > 0 ? <BrennerStrip tasks={brenner} /> : null}

        {/* 3-kol layout */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr_0.95fr]">
          {/* Kol 1: I dag */}
          <section>
            <ColumnHeader title="I dag" sub={todaySub} count={today.length} accent />
            <div className="space-y-2">
              {today.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </div>
            <LeggTilOppgaveButton />
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
              VIS ALLE {tasks.length} →
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
            ? "bg-primary text-primary-foreground"
            : "bg-muted/60 text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </header>
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
    <div className="mt-8 rounded-xl border border-border bg-card p-4">
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
