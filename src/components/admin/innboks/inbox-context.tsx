/**
 * COL 3 — Kontekst-panel for AgencyOS Innboks.
 *
 * Kompakt sniktitt på spilleren samtalen gjelder, uten å forlate innboksen:
 *   - Spillerhode (avatar + navn + meta-rad)
 *   - Neste time-minikort (lys-lime bg) — kun hvis spilleren har en kommende booking
 *   - 3 KPI-rader (TIMER 30 D / SG 7 D / PYRAMIDE), etikett venstre + verdi høyre
 *   - Hurtig-aksjoner: Book ny time / Send notat / Åpne Workbench
 *
 * Ren presentasjon (server-renderbar). Verdier kommer ferdig-utledet fra
 * data-loaderen — ingen tall dikter denne komponenten opp.
 */

import Link from "next/link";
import { CalendarClock, CalendarPlus, FileText, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { AthleticAvatar } from "@/components/athletic";
import type { InboxContextData, ContextKpi } from "./inbox-screen";

const kpiToneClass: Record<ContextKpi["tone"], string> = {
  up: "text-success",
  down: "text-destructive",
  neutral: "text-foreground",
};

export function InboxContext({ data }: { data: InboxContextData }) {
  return (
    <aside className="flex flex-col gap-3 overflow-y-auto border-l border-border bg-secondary/40 px-4 py-4">
      <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        KONTEKST
      </div>

      {/* Spillerhode */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
        <AthleticAvatar
          src={data.avatarUrl ?? undefined}
          initials={data.initials}
          size="md"
          borderColor="card"
          className="h-11 w-11 border-0 shadow-none"
        />
        <div className="min-w-0">
          <div className="truncate font-display text-[15px] font-bold leading-tight tracking-[-0.015em] text-foreground">
            {data.name}
          </div>
          {data.meta && (
            <div className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              {data.meta}
            </div>
          )}
        </div>
      </div>

      {/* Neste time */}
      {data.nextSession && (
        <div className="flex items-center gap-2.5 rounded-xl border border-accent/40 bg-accent/15 px-3 py-2.5">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
            <CalendarClock className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-primary">
              NESTE TIME
            </div>
            <div className="mt-0.5 truncate text-[13px] font-semibold text-foreground">
              {data.nextSession.when} · {data.nextSession.title}
            </div>
          </div>
        </div>
      )}

      {/* KPI-rader */}
      <div className="rounded-xl border border-border bg-card px-3 py-1">
        {data.kpis.map((k) => (
          <div
            key={k.label}
            className="flex items-center justify-between border-t border-border py-2.5 first:border-t-0"
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              {k.label}
            </span>
            <span
              className={cn(
                "font-mono text-sm font-bold tabular-nums",
                kpiToneClass[k.tone],
              )}
            >
              {k.value}
            </span>
          </div>
        ))}
      </div>

      {/* Hurtig-aksjoner */}
      <div className="flex flex-col gap-2">
        <QuickAction
          href={`/admin/kalender?player=${data.playerId}`}
          icon={CalendarPlus}
          label="Book ny time"
        />
        <QuickAction
          href={`/admin/spillere/${data.playerId}`}
          icon={FileText}
          label="Send notat"
        />
        <QuickAction
          href={`/admin/spillere/${data.playerId}`}
          icon={LayoutDashboard}
          label="Åpne Workbench"
          primary
        />
      </div>
    </aside>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  primary,
}: {
  href: string;
  icon: typeof CalendarPlus;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-[34px] items-center justify-center gap-2 rounded-lg px-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] transition-colors",
        primary
          ? "border border-primary bg-primary text-primary-foreground hover:opacity-90"
          : "border border-border bg-card text-foreground hover:bg-secondary",
      )}
    >
      <Icon className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
      {label}
    </Link>
  );
}
