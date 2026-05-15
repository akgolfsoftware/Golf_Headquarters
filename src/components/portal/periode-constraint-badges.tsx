"use client";

import type { LPhase } from "@/generated/prisma/client";
import { PERIODE_TYPER, L_FASER } from "@/lib/taxonomy";

export function PeriodeConstraintBadges({
  lPhase,
  compact = false,
}: {
  lPhase: LPhase;
  compact?: boolean;
}) {
  const c = PERIODE_TYPER[lPhase];

  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge>CS ≤ {c.csMax}%</Badge>
      {c.maxVolumMin != null && <Badge>{c.maxVolumMin} min/uke</Badge>}
      {c.maxOkterUke != null && <Badge>≤ {c.maxOkterUke} okter/uke</Badge>}
      <Badge>≥ {c.minHviledager} hviledager</Badge>
      {c.turneringsLaas && <Badge tone="warn">Turneringslås</Badge>}
      {!compact && (
        <Badge tone="subtle">
          {c.lFaserTillatt
            .map((kode) => L_FASER.find((l) => l.kode === kode)?.label ?? kode)
            .join(", ")}
        </Badge>
      )}
    </div>
  );
}

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "warn" | "subtle";
}) {
  const styles = {
    default: "bg-secondary text-foreground border-border",
    warn: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    subtle: "bg-muted text-muted-foreground border-border/60",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium ${styles[tone]}`}>
      {children}
    </span>
  );
}
