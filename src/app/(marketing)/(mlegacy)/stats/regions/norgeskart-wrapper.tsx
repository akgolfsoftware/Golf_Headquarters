"use client";

/**
 * StatsNorgeskartWrapper — client wrapper for the Norgeskart
 * Handles navigation on region click.
 */

import { useRouter } from "next/navigation";
import { StatsNorgeskart } from "@/components/stats/stats-norgeskart";
import type { RegionSlug } from "@/lib/stats/klubb-til-region";

export function StatsNorgeskartWrapper() {
  const router = useRouter();

  const handleClick = (slug: RegionSlug) => {
    router.push(`/stats/regions/${slug}`);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <StatsNorgeskart onRegionClick={handleClick} size={260} />
    </div>
  );
}
