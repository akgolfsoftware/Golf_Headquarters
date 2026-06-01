/**
 * AgencyOS — Runder på tvers (/admin/runder)
 *
 * Coach-view over alle registrerte runder fra hele stallen. Data-tett tabell
 * med score, SG-total og baner, KPI-strip med athletic Sparkline for SG-trend.
 * Server component — ekte Prisma (Round), ingen falske tall.
 */
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Flag,
  Search,
  TrendingDown,
  TrendingUp,
  Minus,
  type LucideIcon,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { Sparkline } from "@/components/athletic";
import { EmptyState } from "@/components/shared/empty-state";
import { avatarBg } from "@/lib/avatar-colors";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

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

  // SG-trend: kronologisk (eldst→nyest) for sparkline-retning.
  const sgTrend = sgRunder
    .map((r) => r.sgTotal ?? 0)
    .slice()
    .reverse();

  const beste = rounds.reduce<typeof rounds[number] | null>(
    (b, r) => (b == null || r.score - r.course.par < b.score - b.course.par ? r : b),
    null,
  );

  const uniquePlayers = new Set(rounds.map((r) => r.userId)).size;

  return (
    <div className="space-y-1">
      {/* header */}
      <div className="mb-3">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          AGENCYOS · RUNDER
        </span>
        <h1 className="mt-2 font-display text-[30px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground">
          Hele stallen, <em className="font-normal italic text-primary">én kolonne</em> for score.
        </h1>
        <p className="mt-1.5 max-w-[780px] text-sm leading-relaxed text-muted-foreground">
          Registrerte runder fra alle spillere — score, avvik mot par og SG-total per runde.{" "}
          <b className="font-semibold text-foreground">{rounds.length}</b> nyeste av{" "}
          <b className="font-semibold text-foreground">{totalRounds}</b> totalt ·{" "}
          {uniquePlayers} spillere.
        </p>
      </div>

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-3 pt-3 lg:grid-cols-4">
        <KpiDark
          label="SNITT-SCORE"
          value={snittScore === 0 ? "—" : snittScore.toFixed(1).replace(".", ",")}
          foot={`Siste ${validScores.length} runder`}
        />
        <KpiCard
          label="VS PAR · SNITT"
          value={validScores.length === 0 ? "—" : formatNum(vsPar, true)}
          foot="Aggregert avvik fra par"
          delta={validScores.length === 0 ? "flat" : vsPar < 0 ? "up" : vsPar > 0 ? "down" : "flat"}
        />
        <KpiCard
          label="BESTE RUNDE"
          value={beste ? String(beste.score) : "—"}
          unit={beste ? `${beste.score - beste.course.par > 0 ? "+" : ""}${beste.score - beste.course.par}` : undefined}
          foot={beste ? `${beste.user.name} · ${beste.course.name}` : "Ingen data"}
        />
        <KpiCard
          label="SG TOTAL · SNITT"
          value={sgSnitt == null ? "—" : formatNum(sgSnitt, true)}
          foot={`${sgRunder.length} runder med SG-data`}
          spark={sgTrend.length >= 2 ? sgTrend : undefined}
        />
      </div>

      {/* Filter-rad */}
      <div className="flex flex-wrap items-center gap-2 pt-5">
        <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2 text-[13px]">
          <Search className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden />
          <input
            type="search"
            placeholder="Søk spiller eller bane"
            className="w-full bg-transparent outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
            aria-label="Søk spiller eller bane"
          />
        </div>
        <FilterChip label="Spiller" />
        <FilterChip label="Bane" />
        <FilterChip label="Periode" />
        <span className="ml-auto font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Sortert · nyeste
        </span>
      </div>

      {rounds.length === 0 ? (
        <div className="pt-5">
          <EmptyState
            icon={Flag}
            titleItalic="Ingen"
            titleTrail="runder registrert"
            sub="Når spillere registrerer runder fra portalen eller via WAGR-import vises de her."
          />
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[2fr_1.5fr_1fr_0.8fr_0.8fr_1fr_auto] gap-2 border-b border-border bg-background px-4 py-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
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
                      className="grid grid-cols-[2fr_1.5fr_1fr_0.8fr_0.8fr_1fr_auto] items-center gap-2 px-4 py-2.5 transition-colors hover:bg-primary/[0.025]"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-[11px] font-bold text-white"
                          style={{ background: avatarBg(r.user.name) }}
                          aria-hidden="true"
                        >
                          {initials(r.user.name)}
                        </div>
                        <div className="min-w-0 leading-tight">
                          <div className="truncate text-[13px] font-bold text-foreground">
                            {r.user.name}
                          </div>
                          {r.user.hcp != null && (
                            <div className="font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
                              HCP {r.user.hcp.toFixed(1).replace(".", ",")}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 leading-tight">
                        <div className="truncate text-[13px] text-foreground">{r.course.name}</div>
                        <div className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
                          Par {r.course.par}
                        </div>
                      </div>
                      <div className="font-mono text-xs tabular-nums text-muted-foreground">
                        {formatDate(r.playedAt)}
                      </div>
                      <div className="font-mono text-sm font-bold tabular-nums text-foreground">
                        {r.score}
                      </div>
                      <div
                        className={cn(
                          "font-mono text-sm font-bold tabular-nums",
                          diff < 0 ? "text-primary" : diff === 0 ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {diff > 0 ? "+" : ""}
                        {diff}
                      </div>
                      <div className="font-mono text-sm tabular-nums text-foreground">
                        {formatNum(r.sgTotal, true)}
                      </div>
                      <Link
                        href={`/admin/spillere/${r.user.id}`}
                        aria-label={`Profil for ${r.user.name}`}
                        className="inline-flex h-[26px] w-[26px] items-center justify-center justify-self-end rounded-md border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <ChevronRight className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
                      </Link>
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

// ── byggeklosser ─────────────────────────────────────────────────
function FilterChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
    >
      {label}
      <ChevronDown className="h-3 w-3" strokeWidth={2} aria-hidden />
    </button>
  );
}

function KpiDark({ label, value, foot }: { label: string; value: string; foot: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-primary px-[18px] py-4 text-primary-foreground">
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent">
        {label}
      </span>
      <span className="font-mono text-[32px] font-bold leading-none tracking-[-0.02em] tabular-nums">
        {value}
      </span>
      <span className="font-mono text-[11px] font-bold tracking-[0.04em] text-primary-foreground/70">
        {foot}
      </span>
    </div>
  );
}

function KpiCard({
  label,
  value,
  unit,
  foot,
  delta,
  spark,
}: {
  label: string;
  value: string;
  unit?: string;
  foot: string;
  delta?: "up" | "down" | "flat";
  spark?: number[];
}) {
  const deltaIcon: Record<"up" | "down" | "flat", LucideIcon> = {
    up: TrendingUp,
    down: TrendingDown,
    flat: Minus,
  };
  const deltaClass = { up: "text-success", down: "text-destructive", flat: "text-muted-foreground" } as const;
  const DeltaIcon = delta ? deltaIcon[delta] : null;
  return (
    <div className="relative flex flex-col gap-2 overflow-hidden rounded-xl border border-border bg-card px-[18px] py-4">
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-[32px] font-bold leading-none tracking-[-0.02em] tabular-nums text-foreground">
        {value}
        {unit && <span className="ml-1.5 text-sm font-bold text-muted-foreground">{unit}</span>}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.04em]",
          delta ? deltaClass[delta] : "text-muted-foreground",
        )}
      >
        {DeltaIcon && <DeltaIcon className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />}
        {foot}
      </span>
      {spark && (
        <div className="pointer-events-none absolute bottom-3.5 right-3.5 h-6 w-20 opacity-60">
          <Sparkline values={spark} width={80} height={24} color="hsl(var(--primary))" className="h-6 w-20" />
        </div>
      )}
    </div>
  );
}
