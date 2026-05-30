/**
 * <PlanleggeShell> — felles hero + tab-bar for PlayerHQ Planlegge.
 *
 * 5 tabs: Årsplan · Treningsplan · Mål · Turneringer · Drills
 * URL-state via ?tab=X
 */

import { CalendarRange } from "lucide-react";
import { AthleticEyebrow } from "@/components/athletic";
import { TabBar, type TabItem } from "@/components/athletic/tab-bar";

const TABS: TabItem[] = [
  { id: "arsplan", label: "Årsplan" },
  { id: "treningsplan", label: "Treningsplan" },
  { id: "mal", label: "Mål" },
  { id: "turneringer", label: "Turneringer" },
  { id: "drills", label: "Drills" },
];

export function PlanleggeShell({
  children,
  counts,
}: {
  children: React.ReactNode;
  counts?: Partial<Record<string, number>>;
}) {
  const tabsWithCounts = TABS.map((t) =>
    typeof counts?.[t.id] === "number" ? { ...t, count: counts[t.id] } : t,
  );

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 md:py-8 lg:px-12">
      {/* Hero */}
      <section className="flex items-center gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-accent">
          <CalendarRange className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div>
          <AthleticEyebrow>PLAYERHQ · PLANLEGGE</AthleticEyebrow>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Plan din{" "}
            <em
              className="font-normal not-italic"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontStyle: "italic",
                color: "hsl(var(--primary))",
              }}
            >
              utvikling
            </em>
          </h1>
          <p className="text-sm text-muted-foreground">
            Sesong, økter, mål og turneringer — alt på ett sted.
          </p>
        </div>
      </section>

      {/* Tab-bar */}
      <TabBar tabs={tabsWithCounts} defaultTab="arsplan" />

      {/* Tab-innhold */}
      <div className="min-h-[400px]">{children}</div>
    </div>
  );
}
