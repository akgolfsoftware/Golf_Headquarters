/**
 * /admin/workspace/prosjekter — Prosjekt-grid
 *
 * Pixel-perfekt fra Claude Design-bundle _SEBg4QyodvbW2k06JWiGw
 * (workspace/s4-prosjekter.jsx).
 *
 * 3-kol grid. Per card: top-strip i selskaps-farge, eyebrow (selskap +
 * status), tittel + desc, 4 stats (open/doing/done/total), progress-bar,
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
import {
  SAMPLE_PROJECTS,
  SAMPLE_PEOPLE,
  type SampleProject,
} from "@/components/workspace/sample-data";

export const dynamic = "force-dynamic";

export default async function WorkspaceProsjekterPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const sp = await searchParams;
  const filter = sp.filter ?? "alle";

  const filtered = SAMPLE_PROJECTS.filter((p) => {
    if (filter === "alle") return true;
    if (filter === "aktive") return p.status === "AKTIV";
    if (filter === "pause") return p.status === "PAUSE";
    if (filter === "arkiv") return p.status === "ARKIVERT";
    return true;
  });

  const counts = {
    alle: SAMPLE_PROJECTS.length,
    aktive: SAMPLE_PROJECTS.filter((p) => p.status === "AKTIV").length,
    pause: SAMPLE_PROJECTS.filter((p) => p.status === "PAUSE").length,
    arkiv: SAMPLE_PROJECTS.filter((p) => p.status === "ARKIVERT").length,
  };

  return (
    <div className="space-y-6">
      <header className="-mx-4 -mt-4 border-b border-border bg-gradient-to-b from-[#FBFAF5] to-background px-4 py-8 md:-mx-8 md:-mt-8 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <AthleticEyebrow>CoachHQ · Workspace · Prosjekter</AthleticEyebrow>
            <h1 className="font-display mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              Prosjekter
            </h1>
            <div className="font-mono mt-2.5 text-[11.5px] uppercase tracking-[0.04em] text-muted-foreground">
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
        <label className="ml-auto flex items-center gap-2 rounded-md border border-input bg-muted/30 px-2.5 py-1">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Søk prosjekt …"
            className="w-48 bg-transparent text-[12.5px] outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
          />
        </label>
      </div>

      {/* Grid */}
      <div className="grid gap-4 pb-12 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
        <NewProjectCard />
      </div>
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
          ? "border-primary bg-primary text-accent"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      {typeof count === "number" ? (
        <span
          className={`rounded-full px-1.5 py-px tabular-nums ${
            active ? "bg-white/20" : "bg-muted"
          }`}
        >
          {count}
        </span>
      ) : null}
    </Tag>
  );
}

function ProjectCard({ project: p }: { project: SampleProject }) {
  const barClass = getCompanyBar(p.company);
  const statusTone =
    p.status === "AKTIV"
      ? "text-emerald-700"
      : p.status === "PAUSE"
        ? "text-amber-700"
        : "text-muted-foreground";

  return (
    <article className="flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-md">
      {/* Cover-strip */}
      <div className={`h-2 ${barClass}`} />

      <div className="flex flex-1 flex-col gap-2 p-4.5" style={{ padding: 18 }}>
        <div className="flex items-center justify-between gap-2">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {p.company === "AK"
              ? "AK GOLF"
              : p.company === "MULLIGAN"
                ? "MULLIGAN"
                : p.company === "WANG"
                  ? "WANG TOPP"
                  : p.company === "SKARP"
                    ? "SKARPNORD"
                    : "PRIVAT"}{" "}
            · <span className={statusTone}>{p.status}</span>
          </div>
          <VisibilityIcon kind={p.vis} />
        </div>

        <div>
          <h3 className="font-display text-base font-bold leading-tight tracking-tight">
            {p.title}
          </h3>
          <p
            className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground"
          >
            {p.desc}
          </p>
        </div>

        {/* Stats */}
        <div className="font-mono grid grid-cols-4 gap-2 text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
          <div>
            <strong className="block text-sm font-bold text-foreground">{p.open}</strong>
            open
          </div>
          <div>
            <strong className="block text-sm font-bold text-foreground">{p.doing}</strong>
            doing
          </div>
          <div>
            <strong className="block text-sm font-bold text-emerald-700">{p.done}</strong>
            done
          </div>
          <div>
            <strong className="block text-sm font-bold text-muted-foreground">
              {p.total}
            </strong>
            total
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              FREMDRIFT
            </span>
            <span className="font-mono text-[11px] font-bold tabular-nums">
              {p.pct}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${p.pct}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-2">
          <AvatarStack
            items={p.assigned.map((k) => ({
              name: SAMPLE_PEOPLE[k]?.name ?? k,
              initials: SAMPLE_PEOPLE[k]?.initials ?? k,
            }))}
            size={22}
          />
          <div className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
            FRIST {p.due}
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
      className="flex min-h-[260px] flex-col items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-dashed border-border bg-muted/30 p-6 text-muted-foreground hover:bg-muted/50"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card">
        <Plus className="h-4 w-4" />
      </span>
      <div className="font-display text-sm font-semibold text-foreground">
        Nytt prosjekt
      </div>
      <div className="font-mono text-center text-[10.5px] leading-relaxed tracking-[0.04em] text-muted-foreground">
        Sync med Notion eller
        <br />
        opprett manuelt
      </div>
    </button>
  );
}
