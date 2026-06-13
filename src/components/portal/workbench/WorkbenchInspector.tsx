"use client";

import { useEffect, useState } from "react";
import { ClipboardList, MessageSquare, CheckCircle, Video, FileText, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getSessionDrills } from "@/app/portal/planlegge/actions";
import type { WorkbenchDrill, WorkbenchSession } from "./types";

type WorkbenchInspectorProps = {
  session: WorkbenchSession | null;
  weekNumber: number;
};

const PYR_SHORT: Record<string, string> = {
  FYS: "FYS",
  TEK: "TEK",
  SLAG: "SLAG",
  SPILL: "SPILL",
  TURN: "TURN",
};

export function WorkbenchInspector({ session, weekNumber }: WorkbenchInspectorProps) {
  const [drills, setDrills] = useState<WorkbenchDrill[]>([]);

  useEffect(() => {
    if (!session) return;
    const load = async () => {
      try {
        const rows = await getSessionDrills(session.id);
        setDrills(rows);
      } catch {
        setDrills([]);
      }
    };
    void load();
  }, [session]);

  if (!session) {
    return (
      <aside className="w-80 shrink-0 border-l border-border bg-card p-6">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary">
            <ClipboardList size={24} strokeWidth={1.5} />
          </div>
          <div className="font-display text-base font-bold text-foreground">Ingen økt valgt</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Klikk på en økt i kalenderen for å se detaljer.
          </p>
        </div>
      </aside>
    );
  }

  const d = new Date(session.scheduledAt);
  const end = new Date(d.getTime() + session.durationMin * 60_000);
  const when = `${dowLabel(d.getDay())} ${d.getDate()}/${d.getMonth() + 1} · ${String(
    d.getHours(),
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}–${String(end.getHours()).padStart(
    2,
    "0",
  )}:${String(end.getMinutes()).padStart(2, "0")}`;

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Valgt · økt
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Uke {weekNumber}
          </span>
        </div>
        <h2 className="mt-2 font-display text-lg font-bold text-foreground">{session.title}</h2>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              session.pyramidArea === "FYS" && "bg-[var(--pyr-fys)]",
              session.pyramidArea === "TEK" && "bg-[var(--pyr-tek)]",
              session.pyramidArea === "SLAG" && "bg-[var(--pyr-slag)]",
              session.pyramidArea === "SPILL" && "bg-[var(--pyr-spill)]",
              session.pyramidArea === "TURN" && "bg-[var(--pyr-turn)]",
            )}
          />
          {PYR_SHORT[session.pyramidArea]} · {when}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 border-b border-border">
        <div className="border-r border-border p-3 text-center">
          <div className="font-display text-base font-bold text-foreground">
            {session.environment ?? "—"}
          </div>
          <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Sted
          </div>
        </div>
        <div className="border-r border-border p-3 text-center">
          <div className="font-display text-base font-bold text-foreground">{session.durationMin}</div>
          <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Min
          </div>
        </div>
        <div className="p-3 text-center">
          <div className="font-display text-base font-bold text-foreground">{drills.length}</div>
          <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Drills
          </div>
        </div>
      </div>

      {/* Drills */}
      <div className="border-b border-border p-4">
        <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Drills
        </div>
        {drills.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ingen drills registrert på denne økten.</p>
        ) : (
          <div className="space-y-2">
            {drills.map((d) => (
              <div key={d.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      d.pyramidArea === "FYS" && "bg-[var(--pyr-fys)]",
                      d.pyramidArea === "TEK" && "bg-[var(--pyr-tek)]",
                      d.pyramidArea === "SLAG" && "bg-[var(--pyr-slag)]",
                      d.pyramidArea === "SPILL" && "bg-[var(--pyr-spill)]",
                      d.pyramidArea === "TURN" && "bg-[var(--pyr-turn)]",
                    )}
                  />
                  <span className="text-sm font-semibold text-foreground">{d.name}</span>
                </div>
                <div className="mt-0.5 pl-3.5 text-xs text-muted-foreground">
                  {d.durationMin && `${d.durationMin} min`}
                  {d.repsSets && ` · ${d.repsSets}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Periode-pyramide */}
      <div className="border-b border-border p-4">
        <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Periode-fordeling · u. {weekNumber}
        </div>
        <div className="space-y-2">
          {(["TURN", "SPILL", "SLAG", "TEK", "FYS"] as const).map((area, i) => {
            const width = 42 + ((hash(area, weekNumber) + i * 7) % 38);
            const hours = 10 + ((hash(area, weekNumber) + i * 3) % 18);
            return (
              <div key={area} className="flex items-center gap-3">
                <span className="w-8 font-mono text-[10px] font-bold uppercase text-muted-foreground">
                  {area}
                </span>
                <div className="flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn("h-2 rounded-full", pyrColor(area))}
                    style={{ width: `${width}%` }}
                  />
                </div>
                <span className="w-14 text-right font-mono text-[10px] text-muted-foreground">
                  {hours} t
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coach actions */}
      <div className="p-4">
        <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Coach-handlinger
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" className="h-9 gap-1.5 rounded-lg text-[11px]">
            <FileText size={14} />
            Notat
          </Button>
          <Button variant="secondary" size="sm" className="h-9 gap-1.5 rounded-lg text-[11px]">
            <Video size={14} />
            Video
          </Button>
          <Button variant="secondary" size="sm" className="h-9 gap-1.5 rounded-lg text-[11px]">
            <Upload size={14} />
            Link
          </Button>
          <Button variant="secondary" size="sm" className="h-9 gap-1.5 rounded-lg text-[11px]">
            <MessageSquare size={14} />
            Melding
          </Button>
          <Button variant="primary" size="sm" className="col-span-2 h-9 gap-1.5 rounded-lg text-[11px]">
            <CheckCircle size={14} />
            Godkjenn endring
          </Button>
        </div>
      </div>
    </aside>
  );
}

function dowLabel(day: number): string {
  const labels = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];
  return labels[day];
}

function pyrColor(area: string): string {
  switch (area) {
    case "FYS":
      return "bg-[var(--pyr-fys)]";
    case "TEK":
      return "bg-[var(--pyr-tek)]";
    case "SLAG":
      return "bg-[var(--pyr-slag)]";
    case "SPILL":
      return "bg-[var(--pyr-spill)]";
    case "TURN":
      return "bg-[var(--pyr-turn)]";
    default:
      return "bg-muted";
  }
}

function hash(input: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}
