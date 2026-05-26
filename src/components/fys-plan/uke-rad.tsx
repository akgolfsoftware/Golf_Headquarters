"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { OktKort, type OktKortData } from "./okt-kort";

export type UkeRadData = {
  id: string;
  ukeNr: number;
  label: string;
  okter: OktKortData[];
};

export function UkeRad({
  uke,
  defaultOpen = false,
  onOktClick,
}: {
  uke: UkeRadData;
  defaultOpen?: boolean;
  onOktClick?: (oktId: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors",
          "hover:bg-secondary/40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        )}
      >
        <div className="flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-secondary">
            <span className="font-mono text-xs font-bold tabular-nums text-foreground">
              U{uke.ukeNr}
            </span>
          </div>
          <div className="space-y-0.5">
            <h3 className="font-display text-base font-semibold leading-tight text-foreground">
              {uke.label}
            </h3>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              {uke.okter.length} {uke.okter.length === 1 ? "økt" : "økter"}
            </p>
          </div>
        </div>
        <ChevronDown
          size={18}
          strokeWidth={1.5}
          className={cn(
            "text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div className="border-t border-border bg-background/50 px-6 py-4">
          {uke.okter.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Ingen økter i denne uka enda.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {uke.okter.map((okt) => (
                <OktKort
                  key={okt.id}
                  okt={okt}
                  onClick={() => onOktClick?.(okt.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
