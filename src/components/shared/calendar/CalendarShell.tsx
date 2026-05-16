"use client";

// CalendarShell — felles wrapper for alle kalender-vyer (Aar/Maaned/Uke/Dag).
//
// Innholder topbar (vy-velger, prev/i dag/next, dato-pickup) og children-slot.
// Sidebar-toggle skjuler/viser PlanSidebar via prop.

import { useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type KalenderVy = "AAR" | "MAANED" | "UKE" | "DAG";

type Props = {
  vy: KalenderVy;
  onByttVy: (vy: KalenderVy) => void;
  basisdato: Date;
  onByttDato: (delta: -1 | 0 | 1) => void;
  onValgIdag?: () => void;
  sidebarApent: boolean;
  onToggleSidebar?: () => void;
  children: React.ReactNode;
  className?: string;
};

const VY_KORT: Record<KalenderVy, string> = {
  AAR: "J",
  MAANED: "K",
  UKE: "U",
  DAG: "D",
};

const VY_LABEL: Record<KalenderVy, string> = {
  AAR: "År",
  MAANED: "Måned",
  UKE: "Uke",
  DAG: "Dag",
};

// Tastatursnarvei → vy
const SNARVEI_TIL_VY: Record<string, KalenderVy> = {
  j: "AAR",
  k: "MAANED",
  t: "MAANED",
  u: "UKE",
  d: "DAG",
};

export function CalendarShell({
  vy,
  onByttVy,
  basisdato,
  onByttDato,
  onValgIdag,
  sidebarApent,
  onToggleSidebar,
  children,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Ignorér når brukeren er i input-felt.
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const k = e.key.toLowerCase();
      if (SNARVEI_TIL_VY[k]) {
        e.preventDefault();
        onByttVy(SNARVEI_TIL_VY[k]);
        return;
      }
      if (k === "arrowleft") {
        e.preventDefault();
        onByttDato(-1);
      } else if (k === "arrowright") {
        e.preventDefault();
        onByttDato(1);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onByttVy, onByttDato]);

  const datoTekst = formaterTopbarDato(basisdato, vy);

  return (
    <div ref={containerRef} className={cn("flex h-full flex-col", className)}>
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-2">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label={sidebarApent ? "Skjul sidebar" : "Vis sidebar"}
          >
            {sidebarApent ? (
              <PanelLeftClose size={18} strokeWidth={1.5} />
            ) : (
              <PanelLeftOpen size={18} strokeWidth={1.5} />
            )}
          </button>
        )}

        {/* Forrige / I dag / Neste */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onByttDato(-1)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Forrige"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={onValgIdag ?? (() => onByttDato(0))}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
          >
            I dag
          </button>
          <button
            type="button"
            onClick={() => onByttDato(1)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Neste"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <CalendarDays size={16} strokeWidth={1.5} className="text-muted-foreground" />
          <span>{datoTekst}</span>
        </div>

        <div className="ml-auto flex items-center gap-1">
          {(Object.keys(VY_LABEL) as KalenderVy[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onByttVy(v)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                vy === v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
              aria-pressed={vy === v}
              title={`${VY_LABEL[v]} (${VY_KORT[v]})`}
            >
              {VY_LABEL[v]}
              <span className="ml-1 font-mono text-[10px] text-muted-foreground">
                {VY_KORT[v]}
              </span>
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

function formaterTopbarDato(d: Date, vy: KalenderVy): string {
  if (vy === "AAR") return d.getFullYear().toString();
  if (vy === "MAANED") {
    return d.toLocaleDateString("no-NO", { month: "long", year: "numeric" });
  }
  if (vy === "UKE") {
    const uke = isoUke(d);
    return `Uke ${uke.week} · ${d.getFullYear()}`;
  }
  // DAG
  return d.toLocaleDateString("no-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isoUke(d: Date): { year: number; week: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: date.getUTCFullYear(), week };
}
