/**
 * PlayerHeroV2 — utvidet hero-komponent for Player Workbench.
 *
 * Erstatter standard PageHeader for hjem-siden. Viser:
 *  - Stor avatar (med PRO-pill hvis tier === "PRO")
 *  - Hilsen + greeting + dropdown-marker (vises kun visuelt)
 *  - Sub-metadata: nivå, HCP m/trend, countdown til neste turnering
 *  - Wellness-rad (kun hvis wearable er koblet og data foreligger)
 *
 * Pure presentational — koordinator henter data og sender props.
 */

import {
  ChevronDown as ChevronDownIcon,
  ChevronUp,
  ChevronDown,
  Minus,
  Heart,
  Moon,
  Battery,
} from "lucide-react";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";
import { cn } from "@/lib/utils";

// ---------- Types ----------

type Tier = "GRATIS" | "PRO" | "ELITE";

type WellnessTrend = "OPP" | "FLAT" | "NED";

export type PlayerHeroV2Props = {
  user: {
    name: string;
    tier: Tier;
    nivaa?: string; // A1, A2, B1, etc.
    hcp: number | null;
    hcpTrend?: number; // endring siste 30 dager (positivt = lavere HCP er bedre)
    avatarUrl?: string;
  };
  neste_turnering?: {
    navn: string;
    dato: Date;
  };
  wellness?: {
    energi?: number; // 0-10
    sovn?: number; // timer
    hrv?: number; // ms (HRV i RMSSD)
    hrvTrend?: WellnessTrend;
  };
  className?: string;
};

// ---------- Helpers ----------

/** Antall dager fra nå til target. Returnerer 0 hvis target er i dag eller tidligere */
function daysUntil(target: Date): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  );
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

/** Formaterer HCP — golf-konvensjon: negativt = pluss, vises som "-2.1" */
function formatHcp(hcp: number | null): string {
  if (hcp === null) return "—";
  return hcp.toFixed(1);
}

/** HCP-trend som +0.3 / -0.5 / 0.0 */
function formatHcpTrend(trend: number): string {
  const sign = trend > 0 ? "+" : "";
  return `${sign}${trend.toFixed(1)}`;
}

/** Wellness HRV trend label */
function hrvTrendIcon(trend: WellnessTrend) {
  switch (trend) {
    case "OPP":
      return { Icon: ChevronUp, color: "text-primary" };
    case "NED":
      return { Icon: ChevronDown, color: "text-destructive" };
    case "FLAT":
    default:
      return { Icon: Minus, color: "text-muted-foreground" };
  }
}

// ---------- Komponent ----------

export function PlayerHeroV2({
  user,
  neste_turnering,
  wellness,
  className,
}: PlayerHeroV2Props) {
  const initials = initialsFromName(user.name);
  const isPro = user.tier === "PRO";
  const firstName = user.name.split(/\s+/)[0] || user.name;

  // HCP-trend: positiv verdi = HCP gått ned (bedre i golf) → vis grønn pil ned
  // Vi bruker "↗ +0.3" som visuell konvensjon der + = forbedring
  // Bruker ChevronUp for positiv forbedring, ChevronDown for forverring
  let HcpTrendIcon = Minus;
  let hcpTrendColor = "text-muted-foreground";
  if (user.hcpTrend !== undefined) {
    if (user.hcpTrend > 0) {
      HcpTrendIcon = ChevronUp;
      hcpTrendColor = "text-primary";
    } else if (user.hcpTrend < 0) {
      HcpTrendIcon = ChevronDown;
      hcpTrendColor = "text-destructive";
    }
  }

  const daysToTournament = neste_turnering ? daysUntil(neste_turnering.dato) : null;

  const hasWellness =
    wellness &&
    (wellness.energi !== undefined ||
      wellness.sovn !== undefined ||
      wellness.hrv !== undefined);

  return (
    <header
      role="banner"
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6",
        className
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0 self-start sm:self-center">
        <div
          className="flex h-[60px] w-[60px] items-center justify-center rounded-full text-lg font-semibold text-white sm:h-[100px] sm:w-[100px] sm:text-2xl"
          style={
            user.avatarUrl
              ? {
                  backgroundImage: `url(${user.avatarUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : { background: avatarBg(user.name) }
          }
          aria-label={`Avatar for ${user.name}`}
        >
          {!user.avatarUrl ? initials : null}
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
        {/* Hilsen */}
        <div className="flex items-baseline gap-2">
          <h1 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
            Hei,{" "}
            <em className="font-normal italic text-primary">{firstName}</em>
          </h1>
          {/* Visuell dropdown-marker (ikke-interaktiv her — koordinator kan koble) */}
          <ChevronDownIcon
            className="h-5 w-5 shrink-0 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>

        {/* Sub-metadata */}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {user.nivaa ? (
            <span className="font-mono text-xs font-medium text-foreground">
              {user.nivaa}
            </span>
          ) : null}

          {user.nivaa && user.hcp !== null ? (
            <span className="text-muted-foreground">·</span>
          ) : null}

          {user.hcp !== null ? (
            <span className="inline-flex items-center gap-1">
              <span className="font-mono">HCP {formatHcp(user.hcp)}</span>
              {user.hcpTrend !== undefined && user.hcpTrend !== 0 ? (
                <span
                  className={cn(
                    "inline-flex items-center font-mono text-xs",
                    hcpTrendColor
                  )}
                >
                  <HcpTrendIcon
                    className="h-3.5 w-3.5"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  {formatHcpTrend(user.hcpTrend)}
                </span>
              ) : null}
            </span>
          ) : null}

          {neste_turnering && daysToTournament !== null ? (
            <>
              <span className="text-muted-foreground">·</span>
              <span>
                <span className="font-medium text-foreground">
                  {daysToTournament}
                </span>{" "}
                dager til{" "}
                <span className="font-medium text-foreground">
                  {neste_turnering.navn}
                </span>
              </span>
            </>
          ) : null}
        </div>

        {/* Wellness-rad (kun hvis data foreligger) */}
        {hasWellness ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            {wellness?.energi !== undefined ? (
              <span className="inline-flex items-center gap-1.5">
                <Battery
                  className="h-3.5 w-3.5 text-muted-foreground"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="text-muted-foreground">Energi:</span>
                <span className="font-mono font-medium text-foreground">
                  {wellness.energi}/10
                </span>
              </span>
            ) : null}

            {wellness?.sovn !== undefined ? (
              <span className="inline-flex items-center gap-1.5">
                <Moon
                  className="h-3.5 w-3.5 text-muted-foreground"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="text-muted-foreground">Søvn:</span>
                <span className="font-mono font-medium text-foreground">
                  {wellness.sovn.toFixed(1)}t
                </span>
              </span>
            ) : null}

            {wellness?.hrv !== undefined ? (
              <span className="inline-flex items-center gap-1.5">
                <Heart
                  className="h-3.5 w-3.5 text-muted-foreground"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="text-muted-foreground">HRV:</span>
                <span className="font-mono font-medium text-foreground">
                  {wellness.hrv}
                </span>
                {wellness.hrvTrend ? (
                  <HrvTrendBadge trend={wellness.hrvTrend} />
                ) : null}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}

// ---------- Sub-komponenter ----------

function HrvTrendBadge({ trend }: { trend: WellnessTrend }) {
  const { Icon, color } = hrvTrendIcon(trend);
  return (
    <Icon
      className={cn("h-3.5 w-3.5", color)}
      strokeWidth={2}
      aria-label={`HRV-trend ${trend.toLowerCase()}`}
    />
  );
}
