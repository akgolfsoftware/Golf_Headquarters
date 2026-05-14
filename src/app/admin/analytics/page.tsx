import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  BarChart3,
  Clock,
  Crown,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

export default async function Analytics() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const tretti = new Date();
  tretti.setDate(tretti.getDate() - 30);

  const [
    totalUsers,
    activeUsers30d,
    proUsers,
    totalRounds30d,
    totalSessions30d,
    totalTests30d,
    aiChatSessions,
    pendingApprovals,
    hcpFordelingRader,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "PLAYER" } }),
    prisma.user.count({
      where: { role: "PLAYER", lastLoginAt: { gte: tretti } },
    }),
    prisma.user.count({ where: { role: "PLAYER", tier: "PRO" } }),
    prisma.round.count({ where: { playedAt: { gte: tretti } } }),
    prisma.trainingPlanSessionLog.count({
      where: { startedAt: { gte: tretti } },
    }),
    prisma.testResult.count({ where: { takenAt: { gte: tretti } } }),
    prisma.coachingSession.count({ where: { kind: "AI" } }),
    prisma.planAction.count({ where: { status: "PENDING" } }),
    prisma.user.findMany({
      where: { role: "PLAYER", hcp: { not: null } },
      select: { hcp: true },
    }),
  ]);

  // HCP-bins: <0, 0-10, 10-20, 20-30, 30+
  const bins = [0, 0, 0, 0, 0];
  const binLabels = ["< 0", "0–10", "10–20", "20–30", "30+"];
  for (const u of hcpFordelingRader) {
    const h = u.hcp ?? 0;
    if (h < 0) bins[0]++;
    else if (h < 10) bins[1]++;
    else if (h < 20) bins[2]++;
    else if (h < 30) bins[3]++;
    else bins[4]++;
  }
  const maxBin = Math.max(...bins, 1);
  const harData = totalUsers > 0;

  const proPercent =
    totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100) : 0;
  const aktivPercent =
    totalUsers > 0 ? Math.round((activeUsers30d / totalUsers) * 100) : 0;

  // Test-completion (testede spillere / total)
  const testRate =
    totalUsers > 0
      ? Math.min(100, Math.round((totalTests30d / totalUsers) * 100))
      : 0;
  const testDashArray = `${(testRate / 100) * 87.96} 87.96`;

  const eyebrowDate = new Date().toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-8">
      {/* HERO */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span
            aria-hidden="true"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            Analytics · {eyebrowDate}
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold italic leading-tight tracking-tight sm:text-4xl">
            Analytics —{" "}
            <em className="font-normal italic text-primary">
              hvordan stallen
            </em>{" "}
            utvikler seg.
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {totalUsers} spillere · {totalSessions30d} økter · siste 30 dager
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Periode
          </span>
          <span className="font-medium">Siste 30 dager</span>
        </div>
      </header>

      {!harData ? (
        <EmptyState
          icon={BarChart3}
          titleItalic="Ingen data"
          titleTrail="ennå"
          sub="Statistikk vises når spillere er registrert og har aktivitet."
        />
      ) : (
        <>
          {/* KPI STRIP — 1 hero + 4 regular */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <HeroKpi
              icon={TrendingUp}
              label="Aktivitet (30d)"
              value={String(totalSessions30d)}
              unit="økter"
              sub={`${aktivPercent}% av stallen aktiv · ${totalRounds30d} runder`}
            />
            <Kpi
              icon={Users}
              label="Totalt spillere"
              value={String(totalUsers)}
              sub="Alle PLAYER-konti"
            />
            <Kpi
              icon={Crown}
              label="Pro-abonnenter"
              value={String(proUsers)}
              sub={`${proPercent}% konvertert`}
              progress={proPercent}
            />
            <Kpi
              icon={AlertCircle}
              label="Pending approvals"
              value={String(pendingApprovals)}
              sub="Krever handling"
              tone={pendingApprovals > 0 ? "warn" : "neutral"}
            />
            <Kpi
              icon={Clock}
              label="Aktive (30d)"
              value={String(activeUsers30d)}
              sub={`${aktivPercent}% av totalt`}
              progress={aktivPercent}
            />
          </section>

          {/* HCP CHART */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-semibold tracking-tight">
                  HCP-fordeling
                  <span className="ml-2 text-xs font-normal italic text-muted-foreground">
                    {hcpFordelingRader.length} spillere med registrert HCP
                  </span>
                </h3>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Stall-snitt
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {bins.map((count, i) => (
                <div key={binLabels[i]} className="flex items-center gap-4">
                  <span className="w-16 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {binLabels[i]}
                  </span>
                  <div className="relative h-6 flex-1 overflow-hidden rounded-sm bg-secondary">
                    <div
                      className="h-full rounded-sm bg-primary transition-all"
                      style={{ width: `${(count / maxBin) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono text-sm tabular-nums text-foreground">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* BENTO — engasjement og test-completion */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            {/* Test completion donut */}
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                Test-completion
              </span>
              <div className="relative mx-auto mt-2 h-32 w-32">
                <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    className="stroke-secondary"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    className="stroke-primary"
                    strokeWidth="3.5"
                    strokeDasharray={testDashArray}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">
                    {testRate}%
                  </span>
                  <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
                    Fullført
                  </span>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                <span>
                  {totalTests30d} av {totalUsers} spillere
                </span>
              </div>
            </div>

            {/* Runder */}
            <BentoStat
              label="Runder loggført"
              value={String(totalRounds30d)}
              sub="Siste 30 dager"
              icon={BarChart3}
            />

            {/* AI-chat */}
            <BentoStat
              label="AI-chat-sesjoner"
              value={String(aiChatSessions)}
              sub="Totalt på plattformen"
              icon={MessageCircle}
            />

            {/* Engasjement */}
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                <Sparkles
                  size={12}
                  strokeWidth={1.75}
                  className="mr-1 inline-block text-muted-foreground"
                />
                Pro-konvertering
              </span>
              <div className="font-mono text-3xl font-semibold tabular-nums text-foreground">
                {proPercent}
                <span className="ml-1 text-lg font-medium text-muted-foreground">
                  %
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${proPercent}%` }}
                />
              </div>
              <div className="mt-auto flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                <span>
                  {proUsers} av {totalUsers}
                </span>
                <span className="font-semibold text-primary">PRO</span>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// ---------- helpers ----------

function HeroKpi({
  icon: Icon,
  label,
  value,
  unit,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  sub?: string;
}) {
  // Mørk hero-KPI med gradient — én av de tre "lime" highlight-punktene på siden.
  return (
    <div
      className="relative overflow-hidden rounded-xl border p-6 shadow-sm sm:col-span-2 lg:col-span-2"
      style={{
        background:
          "linear-gradient(135deg, #0F2A22 0%, #163027 60%, #0A1F18 100%)",
        borderColor: "#274d41",
      }}
    >
      <div
        className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em]"
        style={{ color: "rgba(209,248,67,0.7)" }}
      >
        <Icon size={14} strokeWidth={1.75} />
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className="font-mono text-4xl font-semibold tabular-nums"
          style={{ color: "#F5F4EE" }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-sm font-medium"
            style={{ color: "rgba(245,244,238,0.65)" }}
          >
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <p
          className="mt-2 font-mono text-[11px]"
          style={{ color: "rgba(245,244,238,0.65)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  progress,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  progress?: number;
  tone?: "neutral" | "warn";
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        <Icon
          size={14}
          strokeWidth={1.75}
          className={
            tone === "warn"
              ? "text-destructive"
              : "text-muted-foreground"
          }
        />
        {label}
      </div>
      <div
        className={`mt-1 font-mono text-3xl font-semibold tabular-nums ${
          tone === "warn" ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </div>
      {typeof progress === "number" && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
      {sub && (
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          {sub}
        </p>
      )}
    </div>
  );
}

function BentoStat({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm">
      <span className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        <Icon size={12} strokeWidth={1.75} />
        {label}
      </span>
      <div className="font-mono text-3xl font-semibold tabular-nums text-foreground">
        {value}
      </div>
      <p className="mt-auto font-mono text-[11px] text-muted-foreground">
        {sub}
      </p>
    </div>
  );
}
