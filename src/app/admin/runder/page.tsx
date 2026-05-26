/**
 * CoachHQ — Runder (Bølge B)
 *
 * Coach-view over alle registrerte runder på tvers av spillere. KPI-strip,
 * filter og tabell med score, SG-total og baner. Server component.
 *
 * Design: wireframe/design-package/project/final/13-runder.html
 */
import {
  ChevronDown,
  ChevronRight,
  Flag,
  Search,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { avatarBg } from "@/lib/avatar-colors";

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

function formatNum(n: number | null, withSign = false): string {
  if (n == null) return "—";
  const s = n.toFixed(1).replace(".", ",");
  if (withSign && n > 0) return `+${s}`;
  return s;
}

export default async function RunderPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const rounds = await prisma.round.findMany({
    orderBy: { playedAt: "desc" },
    take: 50,
    include: {
      user: { select: { id: true, name: true, hcp: true } },
      course: { select: { id: true, name: true, par: true } },
    },
  });

  const totalRounds = await prisma.round.count();

  const validScores = rounds.filter((r) => r.score != null);
  const snittScore =
    validScores.length === 0
      ? 0
      : validScores.reduce((s, r) => s + r.score, 0) / validScores.length;

  const vsPar =
    validScores.length === 0
      ? 0
      : validScores.reduce((s, r) => s + (r.score - r.course.par), 0) /
        validScores.length;

  const sgRunder = rounds.filter((r) => r.sgTotal != null);
  const sgSnitt =
    sgRunder.length === 0
      ? null
      : sgRunder.reduce((s, r) => s + (r.sgTotal ?? 0), 0) / sgRunder.length;

  const beste = rounds.reduce<typeof rounds[number] | null>(
    (b, r) => (b == null || r.score - r.course.par < b.score - b.course.par ? r : b),
    null,
  );

  const uniquePlayers = new Set(rounds.map((r) => r.userId)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · /admin/runder"
        titleLead={`${rounds.length}`}
        titleItalic="runder"
        titleTrail={`· ${uniquePlayers} spillere · totalt ${totalRounds}`}
        sub="Coach-view over registrerte runder fra alle spillere. Score, SG-total og baner per runde."
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-foreground to-foreground/90 p-4 text-white">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent/70">
            Snitt-score
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-white">
            {snittScore.toFixed(1).replace(".", ",")}
          </div>
          <div className="font-mono text-[11px] text-background/70">
            Siste {validScores.length} runder
          </div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Vs par snitt
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {formatNum(vsPar, true)}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            Aggregert avvik fra par
          </div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Beste runde
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {beste ? beste.score : "—"}
            {beste && (
              <span className="ml-1 font-mono text-xs text-muted-foreground">
                {beste.score - beste.course.par > 0 ? "+" : ""}
                {beste.score - beste.course.par}
              </span>
            )}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            {beste ? `${beste.user.name} · ${beste.course.name}` : "Ingen data"}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            SG total snitt
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {sgSnitt == null ? "—" : formatNum(sgSnitt, true)}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">
            {sgRunder.length} runder med SG-data
          </div>
        </div>
      </div>

      {/* Filter-rad */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px]">
          <Search className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
          <input
            type="search"
            placeholder="Søk spiller eller bane"
            className="w-full bg-transparent outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
            aria-label="Søk spiller eller bane"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Spiller <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Bane <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Periode <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
        </button>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          Sortert: nyeste
        </span>
      </div>

      {rounds.length === 0 ? (
        <EmptyState
          icon={Flag}
          titleItalic="Ingen"
          titleTrail="runder registrert"
          sub="Når spillere registrerer runder fra portalen eller via WAGR-import vises de her."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
          <div className="grid grid-cols-[2fr_1.5fr_1fr_0.8fr_0.8fr_1fr_auto] gap-2 border-b border-border bg-secondary/40 px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            <div>Spiller</div>
            <div>Bane</div>
            <div>Dato</div>
            <div>Score</div>
            <div>Vs par</div>
            <div>SG total</div>
            <div className="w-16" />
          </div>

          <ul className="divide-y divide-border">
            {rounds.map((r) => {
              const diff = r.score - r.course.par;
              return (
                <li
                  key={r.id}
                  className="grid grid-cols-[2fr_1.5fr_1fr_0.8fr_0.8fr_1fr_auto] items-center gap-2 px-4 py-2 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex min-w-0 items-center gap-2">
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
                      {r.user.hcp != null && (
                        <div className="font-mono text-[11px] text-muted-foreground">
                          HCP {r.user.hcp.toFixed(1).replace(".", ",")}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm text-foreground">
                      {r.course.name}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      Par {r.course.par}
                    </div>
                  </div>
                  <div className="font-mono text-xs tabular-nums text-muted-foreground">
                    {formatDate(r.playedAt)}
                  </div>
                  <div className="font-mono text-sm font-semibold tabular-nums text-foreground">
                    {r.score}
                  </div>
                  <div
                    className={`font-mono text-sm font-semibold tabular-nums ${
                      diff < 0 ? "text-primary" : diff === 0 ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {diff > 0 ? "+" : ""}
                    {diff}
                  </div>
                  <div className="font-mono text-sm tabular-nums text-foreground">
                    {formatNum(r.sgTotal, true)}
                  </div>
                  <div className="text-muted-foreground">
                    <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                </li>
              );
            })}
          </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
