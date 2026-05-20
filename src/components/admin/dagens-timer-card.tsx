import Link from "next/link";
import type { DagensTime } from "@/lib/admin-hub-data";

const STATUS_FARGE: Record<string, string> = {
  CONFIRMED: "bg-primary/10 text-primary",
  PENDING: "bg-accent/30 text-foreground",
  CANCELLED: "bg-muted text-muted-foreground",
  COMPLETED: "bg-muted text-muted-foreground",
};

export function DagensTimerCard({ timer }: { timer: DagensTime[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Dagens timer
        </span>
        <Link
          href="/admin/bookinger"
          className="text-xs text-primary hover:underline active:text-primary/80 focus-visible:underline focus-visible:outline-none"
        >
          Alle →
        </Link>
      </div>

      {timer.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Ingen timer i dag.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {timer.map((t) => (
            <li key={t.id} className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/elever/${t.userId}`}
                    className="font-medium text-foreground hover:text-primary active:text-primary/80 focus-visible:underline focus-visible:outline-none"
                  >
                    {t.userName}
                  </Link>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {t.serviceName} · {t.locationName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-base font-semibold tabular-nums text-foreground">
                    {t.startAt.toLocaleTimeString("nb-NO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    –
                    {t.endAt.toLocaleTimeString("nb-NO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <span
                    className={`mt-0.5 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                      STATUS_FARGE[t.status] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
