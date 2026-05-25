/**
 * StatsSpillerRad — tabular row for leaderboard
 * Server component.
 */

import Link from "next/link";
import { StatsInitialAvatar } from "./stats-initial-avatar";

interface SpillerRadProps {
  rank: number;
  navn: string;
  slug: string;
  klubb?: string | null;
  tier: string;
  antallTurneringer: number;
  besteSnitt?: string | null;
  birthYear?: number | null;
}

function tierBadgeClass(tier: string): string {
  switch (tier) {
    case "pro-pga":
      return "stats-tier-badge stats-tier-pro-pga";
    case "pro-dp":
    case "pro-lpga":
      return "stats-tier-badge stats-tier-pro";
    case "college":
      return "stats-tier-badge stats-tier-college";
    case "junior":
      return "stats-tier-badge stats-tier-junior";
    default:
      return "stats-tier-badge stats-tier-amateur";
  }
}

function tierLabel(tier: string): string {
  switch (tier) {
    case "pro-pga":  return "PRO PGA";
    case "pro-dp":   return "DP WORLD PRO";
    case "pro-lpga": return "LPGA PRO";
    case "college":  return "COLLEGE";
    case "junior":   return "JUNIOR";
    case "amateur":  return "AMATØR";
    default:         return tier.toUpperCase();
  }
}

export function StatsSpillerRad({
  rank,
  navn,
  slug,
  klubb,
  tier,
  antallTurneringer,
  besteSnitt,
  birthYear,
}: SpillerRadProps) {
  return (
    <tr className="stats-dtable-row">
      <td className="stats-dtable-rank">{rank}</td>
      <td className="stats-dtable-name-cell">
        <Link href={`/stats/spillere/${slug}`} className="stats-dtable-name-link">
          <StatsInitialAvatar name={navn} size="sm" />
          <span>{navn}</span>
        </Link>
      </td>
      <td className="stats-dtable-cell">{klubb ?? "—"}</td>
      <td className="stats-dtable-cell">
        <span className={tierBadgeClass(tier)}>{tierLabel(tier)}</span>
      </td>
      {birthYear !== undefined && (
        <td className="stats-dtable-cell stats-mono-cell">{birthYear ?? "—"}</td>
      )}
      <td className="stats-dtable-num">{besteSnitt ?? "—"}</td>
      <td className="stats-dtable-num">{antallTurneringer}</td>
      <td className="stats-dtable-action">
        <Link href={`/stats/spillere/${slug}`} className="stats-dtable-se-profil">
          Se profil
        </Link>
      </td>
    </tr>
  );
}
