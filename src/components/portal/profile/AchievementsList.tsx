"use client";

/**
 * AchievementsList — badges/achievements for spilleren.
 *
 * Mapper Achievement.kind til lesbar tittel/beskrivelse. Tom tilstand
 * vises dersom spilleren ikke har oppnådd noen badges ennå.
 */

import { Award } from "lucide-react";
import type { Achievement } from "@/generated/prisma/client";

export type AchievementsListProps = {
  achievements: Pick<Achievement, "id" | "kind" | "earnedAt" | "payload">[];
};

const KIND_LABELS: Record<string, { title: string; description: string }> = {
  STREAK_7: { title: "7-dagers streak", description: "Trening 7 dager på rad" },
  STREAK_14: {
    title: "14-dagers streak",
    description: "Trening 14 dager på rad",
  },
  FIRST_ROUND: { title: "Første runde", description: "Registrert første runde" },
  FIRST_TEST: { title: "Første test", description: "Gjennomført første test" },
  SG_POSITIVE_30D: {
    title: "Strokes Gained +",
    description: "Positiv SG over 30 dager",
  },
};

function labelFor(kind: string) {
  return (
    KIND_LABELS[kind] ?? {
      title: kind.replace(/_/g, " "),
      description: "Oppnådd badge",
    }
  );
}

export function AchievementsList({ achievements }: AchievementsListProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-display text-lg font-bold tracking-[-0.015em] text-foreground">
          Badges
        </h2>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Dine achievements
        </p>
      </div>

      {achievements.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <Award
            className="mx-auto h-8 w-8 text-muted-foreground/50"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="mt-4 text-sm font-semibold text-foreground">
            Ingen badges ennå
          </p>
          <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            Fullfør økter og registrer runder for å låse opp
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {achievements.map((a) => {
            const label = labelFor(a.kind);
            return (
              <div key={a.id} className="flex items-center gap-4 px-4 py-2">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/20 text-primary">
                  <Award
                    className="size-5"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold tracking-[-0.005em] text-foreground">
                    {label.title}
                  </span>
                  <span className="mt-px block font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
                    {label.description}
                  </span>
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {new Date(a.earnedAt).toLocaleDateString("nb-NO", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
