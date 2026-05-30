"use client";

import {
  X,
  Plus,
  MessageSquare,
  User,
  TrendingUp,
  Clock,
  Flag,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PresenceDot, type PresenceState } from "@/components/athletic/presence-dot";
import { StatusPill, type StatusTone } from "@/components/athletic/status-pill";

const AXES = [
  { key: "fys", label: "FYS", cls: "bg-pyr-fys" },
  { key: "tek", label: "TEK", cls: "bg-pyr-tek" },
  { key: "slag", label: "SLAG", cls: "bg-pyr-slag" },
  { key: "spill", label: "SPILL", cls: "bg-pyr-spill" },
  { key: "turn", label: "TURN", cls: "bg-pyr-turn" },
] as const;

type AxisKey = (typeof AXES)[number]["key"];

export type PlayerDetail = {
  initials: string;
  name: string;
  meta: string;
  presence: PresenceState;
  avatarClass?: string;
  status: { tone: StatusTone; label: string }[];
  kpis: { label: string; value: string; icon: LucideIcon }[];
  pyramid: { actual: Record<AxisKey, number>; plan: Record<AxisKey, number> };
  week: { day: string; pips: AxisKey[] }[];
  nextBooking?: { day: string; date: string; title: string; type: string };
  lastComm?: { initials: string; name: string; preview: string; when: string }[];
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border px-5 py-4">
      <div className="mb-3 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

export function PlayerDetailPanel({
  player,
  open,
  onClose,
}: {
  player: PlayerDetail;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Lukk" onClick={onClose} className="absolute inset-0 bg-foreground/20" />
      <aside className="relative flex h-full w-[400px] max-w-full flex-col overflow-y-auto border-l border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4">
          <span className={cn("relative inline-flex h-12 w-12 items-center justify-center rounded-full font-display text-base font-bold", player.avatarClass ?? "bg-secondary text-foreground")}>
            {player.initials}
            <PresenceDot state={player.presence} overlay ringClassName="ring-card" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-lg font-bold leading-tight tracking-[-0.015em] text-foreground">{player.name}</div>
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">{player.meta}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {player.status.map((s, i) => <StatusPill key={i} tone={s.tone}>{s.label}</StatusPill>)}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Lukk" className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* KPI-rad */}
        <Section title="Nøkkeltall">
          <div className="grid grid-cols-3 gap-2">
            {player.kpis.map((k, i) => (
              <div key={i} className="rounded-lg border border-border bg-background px-2.5 py-2">
                <div className="flex items-center gap-1 font-mono text-[8px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
                  <k.icon className="h-2.5 w-2.5" strokeWidth={1.5} />{k.label}
                </div>
                <div className="mt-1 font-mono text-lg font-bold tabular-nums leading-none text-foreground">{k.value}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Mini-pyramide vs plan */}
        <Section title="Pyramide — faktisk vs plan">
          <div className="space-y-1.5">
            {AXES.map((a) => {
              const act = player.pyramid.actual[a.key];
              const plan = player.pyramid.plan[a.key];
              return (
                <div key={a.key} className="flex items-center gap-2">
                  <span className="w-9 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">{a.label}</span>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <span className="absolute inset-y-0 left-0 rounded-full bg-border" style={{ width: `${plan}%` }} />
                    <span className={cn("absolute inset-y-0 left-0 rounded-full", a.cls)} style={{ width: `${act}%` }} />
                  </div>
                  <span className="w-8 text-right font-mono text-[9px] tabular-nums text-muted-foreground">{act}%</span>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Uke-oversikt */}
        <Section title="Denne uka">
          <div className="grid grid-cols-7 gap-1.5">
            {player.week.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1 rounded-md bg-background py-1.5">
                <span className="font-mono text-[8px] font-bold uppercase text-muted-foreground">{d.day}</span>
                <span className="flex min-h-[10px] flex-wrap justify-center gap-0.5">
                  {d.pips.map((p, j) => (
                    <span key={j} className={cn("h-1.5 w-1.5 rounded-full", AXES.find((a) => a.key === p)?.cls)} />
                  ))}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Neste booking */}
        {player.nextBooking && (
          <Section title="Neste booking">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-2.5">
              <span className="flex h-10 w-10 flex-col items-center justify-center rounded-md bg-secondary">
                <span className="font-mono text-[8px] font-bold uppercase text-muted-foreground">{player.nextBooking.day}</span>
                <span className="font-mono text-sm font-bold tabular-nums leading-none text-foreground">{player.nextBooking.date}</span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-foreground">{player.nextBooking.title}</div>
                <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">{player.nextBooking.type}</div>
              </div>
            </div>
          </Section>
        )}

        {/* Siste kommunikasjon */}
        {player.lastComm && player.lastComm.length > 0 && (
          <Section title="Siste kommunikasjon">
            <div className="space-y-2">
              {player.lastComm.map((c, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-secondary font-display text-[10px] font-bold text-foreground">{c.initials}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] text-foreground"><b>{c.name}</b> {c.preview}</div>
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">{c.when}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Footer */}
        <div className="mt-auto flex gap-2 border-t border-border px-5 py-4">
          <button type="button" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-accent">
            <Plus className="h-3 w-3" strokeWidth={2} />Legg til økt
          </button>
          <button type="button" className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-foreground hover:bg-secondary">
            <MessageSquare className="h-3 w-3" strokeWidth={1.5} />Melding
          </button>
          <button type="button" className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground hover:bg-secondary hover:text-foreground">
            <User className="h-3 w-3" strokeWidth={1.5} />Profil
          </button>
        </div>
      </aside>
    </div>
  );
}

// Re-eksporter ikoner som er nyttige som KPI-ikoner ved kall.
export const PanelKpiIcons = { TrendingUp, Clock, Flag };
