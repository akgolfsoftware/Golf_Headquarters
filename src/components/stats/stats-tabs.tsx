"use client";

/**
 * StatsTabs — sticky tab-bar med lime underline på aktiv fane
 * Client component (bruker URL-state via searchParams).
 */

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface Tab {
  id: string;
  label: string;
}

interface StatsTabsProps {
  tabs: Tab[];
  activeTab: string;
  paramName?: string;
}

export function StatsTabs({
  tabs,
  activeTab,
  paramName = "tab",
}: StatsTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClick = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(paramName, id);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams, paramName],
  );

  return (
    <div className="stats-tabs" role="tablist" aria-label="Profil-seksjoner">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={`stats-tab${isActive ? " stats-tab-active" : ""}`}
            onClick={() => handleClick(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
