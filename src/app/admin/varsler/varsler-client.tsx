"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, ArrowRight, Bell, Check, Sparkles, X } from "lucide-react";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { AthleticAvatar } from "@/components/athletic/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import type { VarslerData } from "@/lib/admin/load-varsler";
import { avvisPlanAction, godtaPlanAction, markerVarselLest } from "./actions";

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <AthleticEyebrow>{label}</AthleticEyebrow>
      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 font-mono text-[10px] font-bold text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

export function VarslerClient({ data }: { data: VarslerData }) {
  const router = useRouter();
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  function run(id: string, fn: () => Promise<unknown>) {
    setRemoved((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }

  const planActions = data.planActions.filter((a) => !removed.has(a.id));
  const notifications = data.notifications.filter((n) => !removed.has(n.id));
  const { signals } = data;

  return (
    <div className="space-y-8">
      {/* Venter på deg — agent-forslag som krever handling */}
      <section>
        <GroupHeader label="VENTER PÅ DEG" count={planActions.length} />
        {planActions.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={Check}
              title="Ingenting venter"
              description="Ingen agent-forslag krever handling akkurat nå."
            />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {planActions.map((a) => (
              <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                <AthleticAvatar initials={a.initials} size="sm" status="none" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold leading-tight text-foreground">
                    {a.playerName}
                    <span className="font-normal text-muted-foreground"> · {a.actionLabel}</span>
                  </p>
                  {a.summary && (
                    <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
                      {a.summary}
                    </p>
                  )}
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                    {a.agentName} · {a.when}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="lime"
                    disabled={pending}
                    onClick={() => run(a.id, () => godtaPlanAction(a.id))}
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={2} />
                    Godta
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost-light"
                    disabled={pending}
                    onClick={() => run(a.id, () => avvisPlanAction(a.id))}
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2} />
                    Avvis
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Signaler — siste signal pr spiller/kind (faktisk verdi, ingen terskel) */}
      <section>
        <GroupHeader label="SIGNALER" count={signals.length} />
        {signals.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={Activity}
              title="Ingen ferske signaler"
              description="Ingen signaler er beregnet for stallen siste 14 dager."
            />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {signals.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                <AthleticAvatar initials={s.initials} size="sm" status="none" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
                    {s.playerName}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                    {s.kindLabel} · {s.when}
                  </p>
                </div>
                {s.value !== null && (
                  <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-foreground">
                    {s.value.toFixed(2)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Meldinger — coachens egne uleste varsler */}
      <section>
        <GroupHeader label="MELDINGER" count={notifications.length} />
        {notifications.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={Bell}
              title="Innboksen er tom"
              description="Du har ingen uleste varsler."
            />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold leading-tight text-foreground">{n.title}</p>
                  {n.body && (
                    <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
                      {n.body}
                    </p>
                  )}
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                    {n.when}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {n.link && (
                    <Link
                      href={n.link}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-foreground transition hover:bg-muted"
                    >
                      Åpne
                      <ArrowRight className="h-3 w-3" strokeWidth={2} />
                    </Link>
                  )}
                  <Button
                    size="sm"
                    variant="ghost-light"
                    disabled={pending}
                    onClick={() => run(n.id, () => markerVarselLest(n.id))}
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={2} />
                    Lest
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
