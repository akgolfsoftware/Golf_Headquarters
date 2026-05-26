/**
 * <GjennomforeShell> — felles hero + tab-bar for PlayerHQ Gjennomføre.
 *
 * 4 tabs: I dag · Kalender · Live-økt · Booking
 */

import { Play } from "lucide-react";
import { AthleticEyebrow } from "@/components/athletic";
import { TabBar, type TabItem } from "@/components/ds/tab-bar";

const TABS: TabItem[] = [
  { id: "idag", label: "I dag" },
  { id: "kalender", label: "Kalender" },
  { id: "live", label: "Live-økt" },
  { id: "booking", label: "Booking" },
];

export function GjennomforeShell({
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
    <div className="space-y-5 px-4 py-6 md:px-8 md:py-8 lg:px-12">
      <section className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-accent">
          <Play className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div>
          <AthleticEyebrow>PLAYERHQ · GJENNOMFØRE</AthleticEyebrow>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Gjør{" "}
            <em
              className="font-normal not-italic"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontStyle: "italic",
                color: "#005840",
              }}
            >
              jobben
            </em>
          </h1>
          <p className="text-sm text-muted-foreground">
            Dagens økt, ukens kalender, live-logging og booking.
          </p>
        </div>
      </section>

      <TabBar tabs={tabsWithCounts} defaultTab="idag" />

      <div className="min-h-[400px]">{children}</div>
    </div>
  );
}
