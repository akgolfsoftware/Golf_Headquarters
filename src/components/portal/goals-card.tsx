import Link from "next/link";
import type { Goal } from "@/generated/prisma/client";

const TYPE_LABEL: Record<string, string> = {
  HCP_TARGET: "HCP-mål",
  ROUNDS_PER_MONTH: "Runder/mnd",
  SG_AREA: "SG-mål",
  FREE_TEXT: "Mål",
};

export function GoalsCard({ goals }: { goals: Goal[] }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        Mine mål
      </span>

      {goals.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Ingen aktive mål. Sett ett, så kan agentene følge med på fremgangen din.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {goals.map((g) => (
            <li key={g.id} className="py-3">
              <Link
                href={`/portal/mal/goal/${g.id}`}
                className="block hover:text-primary active:text-primary/80 focus-visible:underline focus-visible:outline-none"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{g.title}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {TYPE_LABEL[g.type] ?? g.type}
                  </span>
                </div>
                {g.targetDate && (
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    Frist:{" "}
                    {g.targetDate.toLocaleDateString("nb-NO", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
