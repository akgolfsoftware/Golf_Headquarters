"use client";

// Tynn URL-synk rundt golfdata SegmentedTabs: aktiv fane leses fra ?tab= og
// skrives tilbake med router.replace — samme adferd som gamle TabBar (lenkebasert),
// men på DS-komponenten. Ingen egen UI.

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SegmentedTabs } from "@/components/athletic/golfdata";

export type PlanTab = { id: string; label: string };

export function PlanTabs({
  tabs,
  defaultTab,
  paramName = "tab",
}: {
  tabs: PlanTab[];
  defaultTab?: string;
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const active = params.get(paramName) ?? defaultTab ?? tabs[0]?.id;

  return (
    <SegmentedTabs
      options={tabs.map((t) => ({ value: t.id, label: t.label }))}
      value={active}
      onChange={(v) => {
        const next = new URLSearchParams(params.toString());
        next.set(paramName, v);
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      }}
    />
  );
}
