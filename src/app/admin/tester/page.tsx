/**
 * CoachHQ — Tester (Bølge B)
 *
 * Coach-view over alle testresultater fra spillere. KPI-strip, filter,
 * og tabell med kategori-pills og rangering. Server component, tokens-only.
 *
 * Design: wireframe/design-package/project/final/12-tester.html
 */
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { avatarBg } from "@/lib/avatar-colors";

const PYR_LABEL: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const PYR_COLOR: Record<string, string> = {
  FYS: "bg-[color:var(--color-pyramid-fys,#a14b30)]/15 text-[color:var(--color-pyramid-fys,#a14b30)]",
  TEK: "bg-primary/15 text-primary",
  SLAG: "bg-primary/15 text-primary",
  SPILL: "bg-accent/30 text-accent-foreground",
  TURN: "bg-secondary text-foreground",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function rankPill(score: number): { label: string; cls: string } {
  if (score >= 75) return { label: "Topp 25%", cls: "bg-primary/15 text-primary" };
  if (score >= 50) return { label: "Topp 50%", cls: "bg-secondary text-foreground" };
  return { label: "Under snitt", cls: "bg-destructive/15 text-destructive" };
}

export default async function TesterPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [results, definitions, playerCount] = await Promise.all([
    prisma.testResult.findMany({
      orderBy: { takenAt: "desc" },
      take: 50,
      include: {
        user: { select: { id: true, name: true, hcp: true } },
        test: {
          select: { id: true, name: true, pyramidArea: true },
        },
      },
    }),
    prisma.testDefinition.count(),
    prisma.user.count({ where: { role: "PLAYER" } }),
  ]);

  // KPI: siste 30d
  // eslint-disable-next-line react-hooks/purity
  const trettiSiden = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const siste30d = results.filter((r) => r.takenAt.getTime() >= trettiSiden);
  const snittScore =
    results.length === 0
      ? 0
      : results.reduce((s, r) => s + r.score, 0) / results.length;

  const uniquePlayers = new Set(results.map((r) => r.userId)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · /admin/tester"
        titleLead="Test-"
        titleItalic="resultater"
        sub={`${results.length} resultater fra ${uniquePlayers} spillere · ${definitions} testdefinisjoner i katalog`}
        actions={
          <span className="font-mono text-[11px] text-muted-foreground">
            {playerCount} aktive spillere
          </span>
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-foreground to-foreground/90 p-4 text-white">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent/70">
            Resultater · 30d
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-white">
            {siste30d.length}
          </div>
          <div className="font-mono text-[11px] text-background/70">
            Tester fullført siste måned
          </div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Snitt-score
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {snittScore.toFixed(1).replace(".", ",")}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            Akkumulert siste 50 resultater
          </div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Aktive spillere
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {uniquePlayers}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            Har minst ett resultat
          </div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Testkatalog
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {definitions}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            NGF-standard + egendefinerte
          </div>
        </div>
      </div>

      {/* Filter-rad */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px]">
          <Search className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
          <input
            type="search"
            placeholder="Søk spiller eller test"
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            aria-label="Søk spiller eller test"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Kategori <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Spiller <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Periode <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
        </button>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          Sortert: sist tatt
        </span>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={Activity}
          titleItalic="Ingen"
          titleTrail="testresultater ennå"
          sub="Når spillere fullfører tester fra NGF-katalogen eller egendefinerte tester vises de her."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-3 border-b border-border bg-secondary/40 px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            <div>Spiller / test</div>
            <div>Kategori</div>
            <div>Tatt</div>
            <div>Score</div>
            <div>Rangering</div>
            <div className="w-16" />
          </div>

          {/* Rows */}
          <ul className="divide-y divide-border">
            {results.map((r) => {
              const rank = rankPill(r.score);
              return (
                <li
                  key={r.id}
                  className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                      style={{ background: avatarBg(r.user.name) }}
                      aria-hidden="true"
                    >
                      {initials(r.user.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">
                        {r.user.name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {r.test.name}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${
                        PYR_COLOR[r.test.pyramidArea] ?? "bg-secondary text-foreground"
                      }`}
                    >
                      {PYR_LABEL[r.test.pyramidArea] ?? r.test.pyramidArea}
                    </span>
                  </div>
                  <div className="font-mono text-xs tabular-nums text-muted-foreground">
                    {formatDate(r.takenAt)}
                  </div>
                  <div className="font-mono text-sm font-semibold tabular-nums text-foreground">
                    {r.score.toFixed(1).replace(".", ",")}
                  </div>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold ${rank.cls}`}
                    >
                      {rank.label}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
