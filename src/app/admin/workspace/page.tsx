/**
 * /admin/workspace — Min uke (default tab)
 *
 * v13-kalibrert (design-bølge D2): AgPage + AgPageHead + KPI-kort (fasit
 * /admin/okonomi) + lokale tabs med tokens (erstatter bespoke WorkspaceHero
 * med hardkodet gradient/hex). Task-radene (TaskRow) beholdes — Notion-synket
 * arbeidsverktøy, se .claude/rules/design-produktbeslutninger.md.
 *
 * 3-kol layout (I dag · Denne uka · Senere), brenner-strip øverst.
 * Bruker sample-data inntil NotionConnection er på plass.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgPage, AgPageHead } from "@/components/admin/agencyos/ui";
import { TaskRow } from "@/components/workspace/primitives";
import { type SampleTask } from "@/components/workspace/sample-data";
import { getTasksForUser } from "@/lib/notion/queries";
import { cn } from "@/lib/utils";
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
    <AgPage>
      <AgPageHead
        eyebrow="AgencyOS · Workspace"
        title="Min"
        italic="uke"
        lead={
          <>
            <b className="font-semibold text-foreground">{åpneTotalt}</b> åpne oppgaver ·{" "}
            <b className="font-semibold text-foreground">{forfallerIDag}</b> forfaller i dag ·{" "}
            <b className="font-semibold text-foreground">{brenner.length}</b> brenner.
          </>
        }
        actions={<WorkspaceHeaderActions />}
      />

      {/* KPI-strip (fasit /admin/okonomi) */}
      <div className="mb-4 grid grid-cols-2 gap-[10px] lg:grid-cols-4">
        <KpiCard label="I dag" value={String(today.length)} delta={`${todayDone} fullført`} deltaTone="success" />
        <KpiCard label="Denne uka" value={String(denneUkaAntall)} delta={`${doingAntall} doing · ${todoAntall} todo`} />
        <KpiCard
          label="Blokkert"
          value={String(blokkertAntall)}
          delta={blokkertAntall > 0 ? "venter" : "ingen"}
          deltaTone={blokkertAntall > 0 ? "warning" : undefined}
        />
        <KpiCard label="Delt" value={String(deltAntall)} delta="flere tildelt" deltaTone="success" />
      </div>

      <WsTabs active="uke" counts={{ tildelt: deltAntall }} />

      <div className="space-y-6 pb-12 pt-5">
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
              className="mt-2.5 inline-block font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-primary"
            >
              VIS ALLE {tasks.length} →
            </Link>

            <EmptyStatePreview />
          </section>
        </div>
      </div>
    </AgPage>
  );
}

// ──────────────────────────────────────────────────────────────── helpers ──

/** KPI-kort — fasit /admin/okonomi (kompakt mono-KPI). */
function KpiCard({
  label,
  value,
  delta,
  deltaTone,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "success" | "warning";
}) {
  return (
    <div className="rounded-[10px] border border-border bg-card p-[14px] pb-3">
      <div className="font-mono text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-[7px] font-mono text-[24px] font-semibold leading-none tabular-nums text-foreground">
        {value}
      </div>
      {delta && (
        <div
          className={cn(
            "mt-[6px] font-mono text-[10px]",
            deltaTone === "success"
              ? "text-success"
              : deltaTone === "warning"
                ? "text-warning"
                : "text-muted-foreground",
          )}
        >
          {delta}
        </div>
      )}
    </div>
  );
}

/** Workspace-tabs — lokal v13-komposisjon (tokens, ingen negative marger). */
function WsTabs({
  active,
  counts,
}: {
  active: "uke" | "oppgaver" | "prosjekter" | "tildelt" | "notion";
  counts?: Partial<Record<"uke" | "oppgaver" | "prosjekter" | "tildelt" | "notion", number>>;
}) {
  const tabs = [
    { id: "uke", label: "Min uke", href: "/admin/workspace" },
    { id: "oppgaver", label: "Oppgaver", href: "/admin/workspace/oppgaver" },
    { id: "prosjekter", label: "Prosjekter", href: "/admin/workspace/prosjekter" },
    { id: "tildelt", label: "Tildelt meg", href: "/admin/workspace/tildelt-meg" },
    { id: "notion", label: "Notion", href: "/admin/workspace/notion" },
  ] as const;

  return (
    <nav
      role="tablist"
      aria-label="Workspace seksjoner"
      className="flex items-center gap-0 overflow-x-auto border-b border-border"
    >
      {tabs.map((t) => {
        const isActive = active === t.id;
        const count = counts?.[t.id];
        return (
          <Link
            key={t.id}
            href={t.href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-display text-[13px] font-semibold transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {typeof count === "number" ? (
              <span
                className={cn(
                  "rounded px-1.5 py-px font-mono text-[10px] tabular-nums",
                  isActive ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground",
                )}
              >
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

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
        className={cn(
          "rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums",
          accent ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
        )}
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
            <div className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
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
      <p className="mt-2 font-display text-[13.5px] italic leading-relaxed text-foreground">
        «Du har ingen oppgaver tildelt deg ennå. Anders får varsel når du har ledig
        kapasitet.»
      </p>
    </div>
  );
}
