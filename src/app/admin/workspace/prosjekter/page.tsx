/**
 * /admin/workspace/prosjekter — Prosjekt-grid (AgencyOS)
 *
 * Ekte data fra ProsjektCache (Notion-sync) via getProjectsForUser().
 * Faller tilbake til SAMPLE_PROJECTS kun i dev når ingen Notion-tilkobling.
 *
 * 3-kol grid, athletic data-tett. Per card: top-strip i selskaps-farge,
 * eyebrow (selskap + status), tittel + desc, 4 stats, fremdriftsbar,
 * footer med tildelt-avatar-stack + frist + arrow.
 */

import { Plus, Search, ExternalLink, ArrowRight } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticButton, AthleticEyebrow } from "@/components/athletic";
import {
  AvatarStack,
  VisibilityIcon,
  WorkspaceTabs,
  getCompanyBar,
} from "@/components/workspace/primitives";
import { SAMPLE_PEOPLE, type SampleProject } from "@/components/workspace/sample-data";
import { getProjectsForUser } from "@/lib/notion/queries";

export const dynamic = "force-dynamic";

const COMPANY_LABEL: Record<SampleProject["company"], string> = {
  AK: "AK GOLF",
  MULLIGAN: "MULLIGAN",
  WANG: "WANG TOPP",
  SKARP: "SKARPNORD",
  PRIVAT: "PRIVAT",
};

export default async function WorkspaceProsjekterPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const sp = await searchParams;
  const filter = sp.filter ?? "alle";

  const projects = await getProjectsForUser();

  const filtered = projects.filter((p) => {
    if (filter === "aktive") return p.status === "AKTIV";
    if (filter === "pause") return p.status === "PAUSE";
    if (filter === "arkiv") return p.status === "ARKIVERT";
    return true;
  });

  const counts = {
    alle: projects.length,
    aktive: projects.filter((p) => p.status === "AKTIV").length,
    pause: projects.filter((p) => p.status === "PAUSE").length,
    arkiv: projects.filter((p) => p.status === "ARKIVERT").length,
  };

  return (
    <div className="space-y-6">
      <header className="-mx-4 -mt-4 border-b border-border bg-gradient-to-b from-secondary/40 to-background px-4 py-8 md:-mx-8 md:-mt-8 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <AthleticEyebrow>AgencyOS · Workspace · Prosjekter</AthleticEyebrow>
            <h1 className="font-display mt-2 text-3xl font-bold leading-tight tracking-[-0.02em] md:text-4xl">
              Prosjekter
            </h1>
            <div className="font-mono mt-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {counts.alle} TOTALT · {counts.aktive} AKTIVE · {counts.pause} PÅ PAUSE
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AthleticButton variant="ghost-light" size="sm">
              <ExternalLink className="h-3.5 w-3.5" /> Notion
            </AthleticButton>
            <AthleticButton variant="lime" size="sm">
              <Plus className="h-3.5 w-3.5" /> Nytt prosjekt
            </AthleticButton>
          </div>
        </div>
      </header>

      <WorkspaceTabs active="prosjekter" />

      {/* Filter-strip */}
      <div className="-mx-4 flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2 md:-mx-8 md:px-8">
        <FilterChip label="Alle" count={counts.alle} active={filter === "alle"} href="?filter=alle" />
        <FilterChip label="Aktive" count={counts.aktive} active={filter === "aktive"} href="?filter=aktive" />
        <FilterChip label="Pause" count={counts.pause} active={filter === "pause"} href="?filter=pause" />
        <FilterChip label="Arkivert" count={counts.arkiv} active={filter === "arkiv"} href="?filter=arkiv" />
        <span className="mx-1 h-5 w-px bg-border" />
        <FilterChip label="Selskap" />
        <FilterChip label="Eier · Meg" />
        <label className="ml-auto flex items-center gap-2 rounded-md border border-input bg-secondary/40 px-2.5 py-1">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Søk prosjekt …"
            className="w-48 bg-transparent text-[12.5px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
          />
        </label>
      </div>

      {/* Grid */}
      {projects.length === 0 ? (
        <EmptyProjects />
      ) : (
        <div className="grid gap-4 pb-12 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
          <NewProjectCard />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────── helpers ──

function FilterChip({
  label,
  count,
  active = false,
  href,
}: {
  label: string;
  count?: number;
  active?: boolean;
  href?: string;
}) {
  const Tag: "a" | "button" = href ? "a" : "button";
  return (
    <Tag
      {...(href ? { href } : { type: "button" })}
      className={`font-mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      {typeof count === "number" ? (
        <span
          className={`rounded-full px-1.5 py-px tabular-nums ${
            active ? "bg-accent/25 text-accent" : "bg-secondary"
          }`}
        >
          {count}
        </span>
      ) : null}
    </Tag>
  );
}

function StatusBadge({ status }: { status: SampleProject["status"] }) {
  const tone =
    status === "AKTIV"
      ? "bg-success/10 text-success"
      : status === "PAUSE"
        ? "bg-warning/15 text-warning"
        : "bg-secondary text-muted-foreground";
  return (
    <span className={`rounded-full px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] ${tone}`}>
      {status}
    </span>
  );
}

function ProjectCard({ project: p }: { project: SampleProject }) {
  const barClass = getCompanyBar(p.company);

  return (
    <article className="flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-md">
      {/* Cover-strip */}
      <div className={`h-1.5 ${barClass}`} />

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {COMPANY_LABEL[p.company]}
            <span className="text-border">·</span>
            <StatusBadge status={p.status} />
          </div>
          <VisibilityIcon kind={p.vis} />
        </div>

        <div>
          <h3 className="font-display text-base font-bold leading-tight tracking-[-0.01em]">
            {p.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
            {p.desc}
          </p>
        </div>

        {/* Stats */}
        <div className="font-mono grid grid-cols-4 gap-2 text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          <div>
            <strong className="block font-mono text-sm font-bold tabular-nums text-foreground">{p.open}</strong>
            open
          </div>
          <div>
            <strong className="block font-mono text-sm font-bold tabular-nums text-foreground">{p.doing}</strong>
            doing
          </div>
          <div>
            <strong className="block font-mono text-sm font-bold tabular-nums text-success">{p.done}</strong>
            done
          </div>
          <div>
            <strong className="block font-mono text-sm font-bold tabular-nums text-muted-foreground">
              {p.total}
            </strong>
            total
          </div>
        </div>

        {/* Fremdrift */}
        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              FREMDRIFT
            </span>
            <span className="font-mono text-[11px] font-bold tabular-nums">
              {p.pct}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${p.pct}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-2.5">
          {p.assigned.length > 0 ? (
            <AvatarStack
              items={p.assigned.map((k) => ({
                name: SAMPLE_PEOPLE[k]?.name ?? k,
                initials: SAMPLE_PEOPLE[k]?.initials ?? k,
              }))}
              size={22}
            />
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground/60">
              Ikke tildelt
            </span>
          )}
          <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            {p.due}
          </div>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>
    </article>
  );
}

function NewProjectCard() {
  return (
    <button
      type="button"
      className="flex min-h-[260px] flex-col items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-dashed border-border bg-secondary/30 p-6 text-muted-foreground hover:bg-secondary/50"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card">
        <Plus className="h-4 w-4" />
      </span>
      <div className="font-display text-sm font-semibold text-foreground">
        Nytt prosjekt
      </div>
      <div className="font-mono text-center text-[10px] leading-relaxed uppercase tracking-[0.06em] text-muted-foreground">
        Sync med Notion eller
        <br />
        opprett manuelt
      </div>
    </button>
  );
}

function EmptyProjects() {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
          <ExternalLink className="h-6 w-6" strokeWidth={1.5} aria-hidden />
        </span>
        <div>
          <p className="font-display text-lg font-bold tracking-[-0.01em] text-foreground">
            Ingen prosjekter ennå
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Koble til Notion for å synke prosjekter automatisk, eller opprett et
            prosjekt manuelt.
          </p>
        </div>
        <AthleticButton variant="lime" size="sm">
          <Plus className="h-3.5 w-3.5" /> Nytt prosjekt
        </AthleticButton>
      </div>
    </div>
  );
}
