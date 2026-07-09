/**
 * AgencyOS — Runder på tvers (/admin/runder)
 *
 * v13-kalibrert (design-bølge D2): AgPage + AgPageHead + KPI-kort (fasit
 * /admin/analyse) + AgTable/AgPlayerCell for tabellen. Coach-view over alle
 * registrerte runder fra hele stallen — score, SG-total og baner.
 * Server component — ekte Prisma (Round), ingen falske tall.
 */
import Link from "next/link";
import {
  ChevronRight,
  Flag,
  Minus,
  Search,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  AgPage,
  AgPageHead,
  AgSpark,
  AgTable,
  AgTableToolbar,
  AgTd,
  AgTh,
  AgPlayerCell,
  agTrClass,
} from "@/components/admin/agencyos/ui";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { RunderFilterChip } from "./runder-actions";

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

// ── KPI-kort (fasit .kpi — samme anatomi som /admin/analyse) ────
function KpiCard({
  label,
  icon: Icon,
  value,
  unit,
  delta,
  dir,
  spark,
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  unit?: string;
  delta?: string;
  dir?: "up" | "down";
  spark?: number[];
}) {
  const DeltaIcon = dir === "up" ? TrendingUp : dir === "down" ? TrendingDown : Minus;
  return (
    <div className="relative flex flex-col gap-2.5 overflow-hidden rounded-xl border border-border bg-card px-[18px] py-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-muted-foreground">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        </span>
      </div>
      <div className="font-mono text-[32px] font-bold leading-none tracking-[-0.02em] tabular-nums text-foreground">
        {value}
        {unit && <span className="ml-[3px] text-[15px] font-bold text-muted-foreground">{unit}</span>}
      </div>
      {delta && (
        <div
          className={cn(
            "inline-flex items-center gap-[5px] font-mono text-[11px] font-bold tracking-[0.04em]",
            dir === "up" ? "text-success" : dir === "down" ? "text-destructive" : "text-muted-foreground",
          )}
        >
          <DeltaIcon className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
          {delta}
        </div>
      )}
      {spark && (
        <div className="pointer-events-none absolute bottom-4 right-4 opacity-60">
          <AgSpark points={spark} w={72} h={22} />
        </div>
      )}
    </div>
  );
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
    <AgPage>
      <AgPageHead
        eyebrow="Analysere · Runder"
        title={
          <>
            Hele stallen, <em className="font-normal italic text-primary">én kolonne</em> for
            score.
          </>
        }
        lead={
          <>
            Registrerte runder fra alle spillere — score, avvik mot par og SG-total per runde.{" "}
            <b className="font-semibold text-foreground">{rounds.length}</b> nyeste av{" "}
            <b className="font-semibold text-foreground">{totalRounds}</b> totalt ·{" "}
            {uniquePlayers} spillere.
          </>
        }
      />

      {/* KPI-strip (fasit .kpis) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Snitt-score"
          icon={Flag}
          value={snittScore === 0 ? "—" : snittScore.toFixed(1).replace(".", ",")}
          delta={`Siste ${validScores.length} runder`}
        />
        <KpiCard
          label="Vs par · snitt"
          icon={Target}
          value={validScores.length === 0 ? "—" : formatNum(vsPar, true)}
          delta="Aggregert avvik fra par"
          dir={validScores.length === 0 ? undefined : vsPar < 0 ? "up" : vsPar > 0 ? "down" : undefined}
        />
        <KpiCard
          label="Beste runde"
          icon={Trophy}
          value={beste ? String(beste.score) : "—"}
          unit={beste ? `${beste.score - beste.course.par > 0 ? "+" : ""}${beste.score - beste.course.par}` : undefined}
          delta={beste ? `${beste.user.name} · ${beste.course.name}` : "Ingen data"}
        />
        <KpiCard
          label="SG total · snitt"
          icon={TrendingUp}
          value={sgSnitt == null ? "—" : formatNum(sgSnitt, true)}
          delta={`${sgRunder.length} runder med SG-data`}
          spark={sgTrend.length >= 2 ? sgTrend : undefined}
        />
      </div>

      {rounds.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Flag}
            titleItalic="Ingen"
            titleTrail="runder registrert"
            sub="Når spillere registrerer runder fra portalen eller via WAGR-import vises de her."
          />
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
          <AgTableToolbar>
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 text-[13px]">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
              <input
                type="search"
                placeholder="Søk spiller eller bane"
                className="h-8 w-full bg-transparent outline-none placeholder:text-muted-foreground focus-visible:outline-none"
                aria-label="Søk spiller eller bane"
              />
            </div>
            <RunderFilterChip label="Spiller" />
            <RunderFilterChip label="Bane" />
            <RunderFilterChip label="Periode" />
            <span className="ml-auto font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              Sortert · nyeste
            </span>
          </AgTableToolbar>

          <div className="overflow-x-auto">
            <AgTable className="min-w-[720px]">
              <thead>
                <tr>
                  <AgTh>Spiller</AgTh>
                  <AgTh>Bane</AgTh>
                  <AgTh>Dato</AgTh>
                  <AgTh num>Score</AgTh>
                  <AgTh num>Vs par</AgTh>
                  <AgTh num>SG total</AgTh>
                  <AgTh />
                </tr>
              </thead>
              <tbody>
                {rounds.map((r) => {
                  const diff = r.score - r.course.par;
                  return (
                    <tr key={r.id} className={agTrClass}>
                      <AgTd>
                        <AgPlayerCell
                          initials={initials(r.user.name)}
                          name={r.user.name}
                          sub={
                            r.user.hcp != null
                              ? `HCP ${r.user.hcp.toFixed(1).replace(".", ",")}`
                              : undefined
                          }
                          tone="neu"
                        />
                      </AgTd>
                      <AgTd>
                        <span className="block truncate text-[13px] text-foreground">
                          {r.course.name}
                        </span>
                        <span className="mt-px block font-mono text-[10px] leading-[1.2] text-muted-foreground">
                          Par {r.course.par}
                        </span>
                      </AgTd>
                      <AgTd>
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                          {formatDate(r.playedAt)}
                        </span>
                      </AgTd>
                      <AgTd num>{r.score}</AgTd>
                      <AgTd num>
                        <span
                          className={cn(
                            diff < 0
                              ? "text-primary"
                              : diff === 0
                                ? "text-foreground"
                                : "text-muted-foreground",
                          )}
                        >
                          {diff > 0 ? "+" : ""}
                          {diff}
                        </span>
                      </AgTd>
                      <AgTd num>{formatNum(r.sgTotal, true)}</AgTd>
                      <AgTd className="w-12">
                        <Link
                          href={`/admin/spillere/${r.user.id}`}
                          aria-label={`Profil for ${r.user.name}`}
                          className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <ChevronRight className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
                        </Link>
                      </AgTd>
                    </tr>
                  );
                })}
              </tbody>
            </AgTable>
          </div>
        </div>
      )}
    </AgPage>
  );
}
