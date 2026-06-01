"use client";

/**
 * COL 1 — Trådliste for AgencyOS Innboks.
 *
 * Header ("ALLE (n)") + filter-pills (Alle / Uleste / Spillere / Foresatte) +
 * scrollbar liste av trådrader. Hver rad: hastegrads-fargeprikk (rød/gul/grønn),
 * avatar, navn + tid, snippet (én linje ellipsis). Aktiv tråd: lime venstre-
 * strek + cream bg. Filter er ren client-state; valg av tråd navigerer via
 * ?thread= slik at server re-henter samtale + kontekst.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AthleticAvatar } from "@/components/athletic";
import type { InboxThread, ThreadDot } from "./inbox-screen";

type FilterKey = "alle" | "ulest" | "spillere" | "foresatte";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "ulest", label: "Uleste" },
  { key: "spillere", label: "Spillere" },
  { key: "foresatte", label: "Foresatte" },
];

const dotClass: Record<ThreadDot, string> = {
  red: "bg-destructive shadow-[0_0_6px_hsl(var(--destructive)/0.4)]",
  yellow: "bg-warning",
  green: "bg-success",
};

function matchFilter(t: InboxThread, filter: FilterKey): boolean {
  switch (filter) {
    case "ulest":
      return t.unread;
    case "spillere":
      return !t.hasGuardian;
    case "foresatte":
      return t.hasGuardian;
    default:
      return true;
  }
}

export function InboxThreadList({
  threads,
  activeThreadId,
  unreadCount,
}: {
  threads: InboxThread[];
  activeThreadId: string | null;
  unreadCount: number;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("alle");

  const synlige = useMemo(
    () => threads.filter((t) => matchFilter(t, filter)),
    [threads, filter],
  );

  const tellFor = (key: FilterKey) =>
    key === "alle"
      ? threads.length
      : key === "ulest"
        ? unreadCount
        : threads.filter((t) => matchFilter(t, key)).length;

  return (
    <section className="flex min-w-0 flex-col bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 pb-3 pt-3.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
            ALLE
          </span>
          <span className="font-mono text-[10px] font-bold text-muted-foreground tabular-nums">
            {threads.length}
          </span>
        </div>

        {/* Filter-pills */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const on = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={on}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full px-3 font-mono text-[10px] font-bold uppercase tracking-[0.08em] transition-colors",
                  on
                    ? "border border-primary bg-primary text-accent"
                    : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "tabular-nums",
                    on ? "text-accent/80" : "text-muted-foreground/70",
                  )}
                >
                  {tellFor(f.key)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trådliste */}
      <div className="flex-1 overflow-y-auto">
        {synlige.length === 0 ? (
          <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">
            Ingen tråder matcher filteret.
          </p>
        ) : (
          synlige.map((t) => {
            const aktiv = t.id === activeThreadId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => router.push(`/admin/innboks?thread=${t.id}`)}
                className={cn(
                  "relative grid w-full grid-cols-[8px_32px_1fr] items-center gap-x-2.5 border-b border-border px-4 py-3 text-left transition-colors",
                  aktiv ? "bg-secondary" : "hover:bg-secondary/60",
                )}
              >
                {/* Aktiv-strek venstre */}
                {aktiv && (
                  <span className="absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-accent" />
                )}

                {/* Hastegrads-prikk */}
                <span
                  aria-hidden
                  className={cn("h-2 w-2 shrink-0 rounded-full", dotClass[t.dot])}
                />

                {/* Avatar */}
                <AthleticAvatar
                  src={t.avatarUrl ?? undefined}
                  initials={t.initials}
                  size="sm"
                  borderColor="card"
                  className="h-8 w-8 border-0 shadow-none"
                />

                {/* Navn + tid + snippet */}
                <div className="flex min-w-0 flex-col leading-tight">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "truncate text-[13px] tracking-[-0.005em] text-foreground",
                        t.unread ? "font-bold" : "font-semibold",
                      )}
                    >
                      {t.name}
                    </span>
                    <span className="ml-auto shrink-0 font-mono text-[10px] font-semibold tracking-[0.04em] text-muted-foreground tabular-nums">
                      {t.when}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "mt-0.5 truncate text-[12px] tracking-[-0.005em]",
                      t.unread ? "font-medium text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {t.preview}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
