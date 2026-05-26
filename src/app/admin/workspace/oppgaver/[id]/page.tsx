/**
 * /admin/workspace/oppgaver/[id] — Task-detalj
 *
 * Pixel-perfekt fra Claude Design-bundle _SEBg4QyodvbW2k06JWiGw
 * (workspace/s3-task-detalj.jsx).
 *
 * 2-kol: beskrivelse + sub-tasks + aktivitet venstre, metadata-sidebar høyre.
 * Bruker sample-data — erstattes med OppgaveCache når Notion-sync er på plass.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  ExternalLink,
  Flame,
  MoreHorizontal,
  Paperclip,
  Plus,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticButton } from "@/components/athletic";
import {
  ProjectPill,
  SourceBadge,
  StatusPill,
  TaskCheck,
  VisibilityPill,
} from "@/components/workspace/primitives";
import {
  SAMPLE_TASKS,
  SAMPLE_PEOPLE,
} from "@/components/workspace/sample-data";

export const dynamic = "force-dynamic";

const ACTIVITY_FEED: {
  who: string;
  when: string;
  what: string;
  emphasis?: string;
  emKind?: "status-doing" | "text";
}[] = [
  { who: "AK", when: "2 t siden", what: "flyttet til ", emphasis: "DOING", emKind: "status-doing" },
  { who: "MR", when: "i går", what: "la til kommentar: «Jeg har sjekket Trackman-priser for 2026 — sender deg mail.»" },
  { who: "AK", when: "i går", what: "la til ", emphasis: "sub-task «Be om tilbud fra TrackMan Norge»", emKind: "text" },
  { who: "N", when: "tirsdag", what: "synket fra ", emphasis: "Notion · Backlog 2026", emKind: "text" },
];

const SUB_TASKS = [
  { title: "Be om tilbud fra TrackMan Norge", done: true },
  { title: "Snakke med Mulligan-eier om bay-prising", done: true },
  { title: "Avklare data-eierskap med juridisk", done: false },
  { title: "Lage budsjett-forslag til Markus", done: false },
];

export default async function TaskDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const viewer = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  // Mock: task #3 brukes som default. Sample-data er statisk inntil OppgaveCache.
  const task = SAMPLE_TASKS.find((t) => String(t.id) === id) ?? SAMPLE_TASKS[2];

  if (!task) notFound();

  // Synlighet-sjekk: hvis PRIVAT og viewer ikke er Anders (ADMIN) → 404-fallback
  const hasAccess =
    viewer.role === "ADMIN" || task.vis !== "PRIVAT" || task.assigned.includes("AK");

  if (!hasAccess) {
    return <NoAccessFallback />;
  }

  const assignedPeople = task.assigned.map((k) => ({
    key: k,
    name: SAMPLE_PEOPLE[k]?.name ?? k,
    initials: SAMPLE_PEOPLE[k]?.initials ?? k,
  }));

  return (
    <div className="space-y-6">
      {/* Mini-hero */}
      <header className="-mx-4 -mt-4 flex items-center justify-between border-b border-border bg-gradient-to-b from-[#FBFAF5] to-background px-4 py-5 md:-mx-8 md:px-8">
        <Link
          href="/admin/workspace/oppgaver"
          className="font-mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.04em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Tilbake til oppgaver
        </Link>
        <div className="flex items-center gap-2">
          <AthleticButton variant="ghost-light" size="sm">
            <ExternalLink className="h-3.5 w-3.5" /> Åpne i Notion
          </AthleticButton>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
            aria-label="Mer"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="grid gap-8 pb-12 lg:grid-cols-[1.6fr_1fr]">
        {/* VENSTRE — innhold */}
        <div className="space-y-6">
          {/* Tittel-blokk */}
          <div>
            <div className="mb-2.5 flex items-center gap-2">
              {task.brenner ? (
                <Flame
                  className="h-3.5 w-3.5 text-destructive"
                  fill="currentColor"
                />
              ) : null}
              <ProjectPill company={task.project.company} name={task.project.name} />
              <StatusPill kind={task.status} />
              <SourceBadge kind={task.source} />
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {task.title}
            </h1>
            <div className="font-mono mt-2 text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
              OPPRETTET 22.05 · OPPDATERT FOR 4 MIN SIDEN
            </div>
          </div>

          {/* Beskrivelse */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="font-mono mb-3 text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              BESKRIVELSE
            </div>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                Vi må avklare Trackman-leie for sommeren 2026 før <strong>14. juni</strong>.
                Mulligan Studio har Trackman bay 4 reservert, men jeg er usikker på{" "}
                <em style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                  om leien dekker hele AK-pulja eller bare privat-coaching
                </em>
                .
              </p>
              <p>Hovedspørsmål:</p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Pris pr. time vs. fast leie</li>
                <li>Tilgang for Markus + andre coaches</li>
                <li>Data-eierskap (vil vi eksportere TrackMan-rapporter)</li>
              </ul>
              <p className="font-mono inline-flex items-center gap-2 rounded-md border-l-[3px] border-accent bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground">
                <Paperclip className="h-3.5 w-3.5" />
                Synket fra Notion · «Backlog 2026 · drift»
              </p>
            </div>
          </section>

          {/* Sub-tasks */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <header className="mb-3 flex items-baseline justify-between">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                SUB-TASKS · {SUB_TASKS.filter((s) => s.done).length} / {SUB_TASKS.length} FULLFØRT
              </div>
              <div className="flex gap-1">
                {SUB_TASKS.map((s, i) => (
                  <div
                    key={i}
                    className={`h-1 w-5 rounded-sm ${s.done ? "bg-primary" : "bg-border"}`}
                  />
                ))}
              </div>
            </header>
            <ul className="space-y-1.5">
              {SUB_TASKS.map((s, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 ${
                    s.done ? "bg-primary/[0.04]" : ""
                  }`}
                >
                  <TaskCheck done={s.done} size={16} />
                  <span
                    className={`text-[13px] ${
                      s.done ? "text-muted-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {s.title}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-dashed border-border px-2.5 py-2">
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Legg til sub-task …"
                className="flex-1 bg-transparent text-[13px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
              />
            </div>
          </section>

          {/* Aktivitet */}
          <section>
            <div className="font-mono mb-4 text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              AKTIVITET
            </div>
            <ul className="space-y-4 border-l border-border pl-4">
              {ACTIVITY_FEED.map((f, i) => {
                const isNotion = f.who === "N";
                return (
                  <li key={i} className="relative flex items-start gap-3">
                    <span
                      className={`absolute -left-[19px] top-1 h-3.5 w-3.5 rounded-full ${
                        isNotion ? "bg-foreground" : "border-2 border-primary bg-card"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="text-sm leading-relaxed">
                        <strong className="font-display font-semibold">
                          {isNotion ? "Notion" : SAMPLE_PEOPLE[f.who]?.name ?? f.who}
                        </strong>{" "}
                        <span className="text-muted-foreground">{f.what}</span>
                        {f.emphasis ? (
                          f.emKind === "status-doing" ? (
                            <StatusPill kind="DOING" compact />
                          ) : (
                            <strong className="font-display font-semibold">
                              {f.emphasis}
                            </strong>
                          )
                        ) : null}
                      </div>
                      <div className="font-mono mt-1 text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
                        {f.when}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-border bg-card p-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-accent">
                AK
              </div>
              <textarea
                rows={2}
                placeholder="Skriv en kommentar …"
                className="flex-1 resize-none bg-transparent text-[13px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
              />
              <AthleticButton variant="lime" size="sm" className="self-end">
                Send
              </AthleticButton>
            </div>
          </section>
        </div>

        {/* HØYRE — metadata-sidebar */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <MetaCell label="STATUS">
              <select
                defaultValue={task.status}
                className="font-mono w-full rounded-md border border-input bg-card px-2.5 py-2 text-[11px] font-bold tracking-[0.06em] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                <option>TODO</option>
                <option>DOING</option>
                <option>DONE</option>
                <option>BLOKKERT</option>
              </select>
            </MetaCell>

            <MetaCell label="PRIORITET">
              <div className="inline-flex w-full rounded-full border border-border bg-muted/40 p-1">
                {(["LAV", "MED", "HØY", "BRENNER"] as const).map((p) => {
                  const isActive =
                    (p === "HØY" && task.prio === "HOY") ||
                    (p === "BRENNER" && task.prio === "BRENNER") ||
                    p === task.prio;
                  return (
                    <button
                      key={p}
                      type="button"
                      className={`font-mono flex-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] transition ${
                        isActive
                          ? p === "HØY"
                            ? "bg-amber-600 text-white"
                            : p === "BRENNER"
                              ? "bg-destructive text-white"
                              : "bg-foreground text-card"
                          : "text-muted-foreground"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </MetaCell>

            <MetaCell label="PROSJEKT">
              <Link
                href="/admin/workspace/prosjekter"
                className="flex items-center gap-2 rounded-md bg-muted/40 px-2.5 py-2"
              >
                <ProjectPill company={task.project.company} name={task.project.name} />
                <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
              </Link>
            </MetaCell>

            <MetaCell label="FORFALLER">
              <div className="flex items-center gap-2 rounded-md bg-muted/40 px-2.5 py-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono text-xs font-semibold">{task.due}</span>
                <span className="font-mono ml-auto text-[10px] text-destructive">
                  4 t igjen
                </span>
              </div>
            </MetaCell>

            <MetaCell label="TILDELT">
              <div className="flex flex-wrap items-center gap-1.5">
                {assignedPeople.map((p) => (
                  <span
                    key={p.key}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-0.5 pl-0.5 pr-2"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-accent">
                      {p.initials}
                    </span>
                    <span className="font-display text-xs font-semibold">{p.name}</span>
                  </span>
                ))}
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground"
                  aria-label="Legg til tildelt"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </MetaCell>

            <MetaCell label="SYNLIGHET">
              <div className="flex flex-wrap gap-1.5">
                {(["AK", "JUNIOR", "ALLE", "SELSKAP", "PRIVAT"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={`transition ${k === task.vis ? "opacity-100" : "opacity-45 hover:opacity-75"}`}
                  >
                    <VisibilityPill kind={k} />
                  </button>
                ))}
              </div>
            </MetaCell>

            <MetaCell label="ESTIMAT">
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  defaultValue="1"
                  className="font-mono w-16 rounded-md border border-input bg-card px-2.5 py-1.5 text-xs font-bold"
                />
                <span className="font-mono text-[11px] text-muted-foreground">timer</span>
              </div>
            </MetaCell>

            <MetaCell label="TAGGER">
              <div className="flex flex-wrap gap-1.5">
                {["trackman", "leie", "sommer-2026", "drift"].map((tag) => (
                  <span
                    key={tag}
                    className="font-mono rounded bg-muted/60 px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
                <button
                  type="button"
                  className="font-mono rounded border border-dashed border-border px-2 py-0.5 text-[10.5px] text-muted-foreground"
                >
                  +
                </button>
              </div>
            </MetaCell>

            <div className="bg-muted/30 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <SourceBadge kind="N" />
                <div className="flex-1">
                  <div className="font-display text-xs font-semibold">
                    Synket fra Notion
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    sist 4 min siden
                  </div>
                </div>
                <a
                  href="#"
                  className="font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-primary"
                >
                  ÅPNE →
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MetaCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border px-4 py-4 last:border-b-0">
      <div className="font-mono mb-2 text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function NoAccessFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-10">
      <div className="max-w-md text-center">
        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          404 · INGEN TILGANG
        </div>
        <h2 className="font-display mt-3 text-3xl font-bold tracking-tight">
          Denne{" "}
          <em
            className="font-normal not-italic"
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontStyle: "italic",
              color: "hsl(var(--primary))",
            }}
          >
            oppgaven
          </em>{" "}
          er privat
        </h2>
        <p
          className="mt-3.5 text-base leading-relaxed text-muted-foreground"
          style={{ fontFamily: "'Inter Tight', sans-serif", fontStyle: "italic" }}
        >
          «Anders har merket denne som PRIVAT. Du må bli tildelt eksplisitt, eller be
          om å få endret synlighet.»
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/admin/workspace/oppgaver">
            <AthleticButton variant="ghost-light" size="sm">
              Tilbake til oppgaver
            </AthleticButton>
          </Link>
          <AthleticButton variant="lime" size="sm">
            Be om tilgang
          </AthleticButton>
        </div>
      </div>
    </div>
  );
}
