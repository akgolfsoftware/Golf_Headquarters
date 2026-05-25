/**
 * CoachSpillerHero — hero-komponent for spilleren coach jobber med.
 *
 * Viser:
 *  - Stor avatar (80px) med PRO-pill hvis tier === "PRO"
 *  - Spillernavn i Inter Tight italic
 *  - Sub-metadata: nivå, HCP med trend, dager til neste turnering
 *  - 3 action-CTAer (Send melding, Ny økt, Generer plan)
 *
 * Pure presentational — koordinator henter data og sender props.
 */

import Link from "next/link";
import {
  ChevronUp,
  ChevronDown,
  Minus,
  MessageSquare,
  Plus,
  Sparkles,
  Trophy,
} from "lucide-react";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";
import { cn } from "@/lib/utils";

// ---------- Types ----------

type Tier = "GRATIS" | "PRO" | "ELITE";

export type CoachSpillerHeroProps = {
  spiller: {
    id: string;
    name: string;
    avatarUrl?: string;
    tier: Tier;
    nivaa?: string; // A1, A2, B1, etc.
    hcp: number | null;
    hcpTrend?: number; // positivt = HCP gått ned (bedre i golf)
  };
  nesteTurnering?: {
    navn: string;
    dato: Date;
  };
  className?: string;
};

// ---------- Helpers ----------

function daysUntil(target: Date): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

function formatHcp(hcp: number | null): string {
  if (hcp === null) return "—";
  return hcp.toFixed(1);
}

function formatHcpTrend(trend: number): string {
  const sign = trend > 0 ? "+" : "";
  return `${sign}${trend.toFixed(1)}`;
}

// ---------- Komponent ----------

export function CoachSpillerHero({
  spiller,
  nesteTurnering,
  className,
}: CoachSpillerHeroProps) {
  const initials = initialsFromName(spiller.name);
  const isPro = spiller.tier === "PRO";

  // HCP-trend: positiv = forbedring (grønn pil opp), negativ = forverring (rød pil ned)
  let HcpTrendIcon = Minus;
  let hcpTrendColor = "text-muted-foreground";
  if (spiller.hcpTrend !== undefined) {
    if (spiller.hcpTrend > 0) {
      HcpTrendIcon = ChevronUp;
      hcpTrendColor = "text-success";
    } else if (spiller.hcpTrend < 0) {
      HcpTrendIcon = ChevronDown;
      hcpTrendColor = "text-destructive";
    }
  }

  const daysToTournament = nesteTurnering ? daysUntil(nesteTurnering.dato) : null;

  return (
    <section
      role="region"
      aria-label={`Spillerprofil for ${spiller.name}`}
      className={cn(
        "rounded-2xl border border-border bg-card p-4 md:p-6",
        "flex flex-col gap-4 md:flex-row md:items-center md:gap-6",
        className,
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0 self-start md:self-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-semibold text-white"
          style={
            spiller.avatarUrl
              ? {
                  backgroundImage: `url(${spiller.avatarUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : { background: avatarBg(spiller.name) }
          }
          aria-label={`Avatar for ${spiller.name}`}
        >
          {!spiller.avatarUrl ? initials : null}
        </div>

        {isPro ? (
          <span
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-accent-foreground"
            aria-label="PRO-medlem"
          >
            PRO
          </span>
        ) : null}
      </div>

      {/* Tekst-kolonne */}
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-2xl font-bold leading-tight tracking-tight md:text-3xl">
          <em className="not-italic" style={{ fontStyle: "italic" }}>
            {spiller.name}
          </em>
        </h2>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {isPro ? (
            <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
              PRO
            </span>
          ) : null}

          {spiller.nivaa ? (
            <span className="font-mono text-xs font-medium text-foreground">
              {spiller.nivaa}
            </span>
          ) : null}

          {spiller.nivaa && spiller.hcp !== null ? (
            <span className="text-muted-foreground">·</span>
          ) : null}

          {spiller.hcp !== null ? (
            <span className="inline-flex items-center gap-1">
              <span className="font-mono">HCP {formatHcp(spiller.hcp)}</span>
              {spiller.hcpTrend !== undefined && spiller.hcpTrend !== 0 ? (
                <span
                  className={cn(
                    "inline-flex items-center font-mono text-xs",
                    hcpTrendColor,
                  )}
                >
                  <HcpTrendIcon
                    className="h-3.5 w-3.5"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  {formatHcpTrend(spiller.hcpTrend)}
                </span>
              ) : null}
            </span>
          ) : null}

          {nesteTurnering && daysToTournament !== null ? (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Trophy
                  className="h-3.5 w-3.5 text-muted-foreground"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="font-medium text-foreground">
                  {daysToTournament}
                </span>{" "}
                dager til{" "}
                <span className="font-medium text-foreground">
                  {nesteTurnering.navn}
                </span>
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 md:flex-nowrap md:justify-end">
        <ActionLink
          href={`/portal/coach/melding/ny?to=${spiller.id}`}
          icon={<MessageSquare className="h-4 w-4" strokeWidth={1.75} />}
          label="Send melding"
          variant="ghost"
        />
        <ActionLink
          href={`/admin/plans/new?spiller=${spiller.id}`}
          icon={<Plus className="h-4 w-4" strokeWidth={1.75} />}
          label="Ny økt"
          variant="ghost"
        />
        <ActionLink
          href={`/admin/plans/new?spiller=${spiller.id}&ai=true`}
          icon={<Sparkles className="h-4 w-4" strokeWidth={1.75} />}
          label="Generer plan"
          variant="primary"
        />
      </div>
    </section>
  );
}

// ---------- Sub: ActionLink ----------

function ActionLink({
  href,
  icon,
  label,
  variant,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  variant: "primary" | "ghost";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold tracking-tight transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        variant === "primary"
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border border-border bg-card text-foreground hover:bg-secondary",
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
