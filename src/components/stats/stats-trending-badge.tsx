"use client";

/**
 * StatsTrendingBadge — lime pille med puls-animasjon
 * Client component (trenger CSS animation).
 */

interface TrendingBadgeProps {
  label?: string;
  className?: string;
}

export function StatsTrendingBadge({
  label = "Trending",
  className = "",
}: TrendingBadgeProps) {
  return (
    <span
      className={`stats-trending-badge${className ? ` ${className}` : ""}`}
      aria-label="Trending"
    >
      <span className="stats-trending-dot" />
      {label}
    </span>
  );
}
