"use client";

import { useState } from "react";
import {
  CircleDot,
  Compass,
  Flag,
  Pencil,
  StickyNote,
  Target,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { UtstyrsbagForm } from "./utstyrsbag-form";
import type { UtstyrsbagInput } from "./actions";

type Props = {
  initial: UtstyrsbagInput;
  finnes: boolean;
};

type Felt = {
  key: keyof UtstyrsbagInput;
  label: string;
  icon: LucideIcon;
};

const FELTER: Felt[] = [
  { key: "driver", label: "Driver", icon: Target },
  { key: "fairwayWoods", label: "Fairway-køller", icon: Wrench },
  { key: "hybrids", label: "Hybrider", icon: Wrench },
  { key: "irons", label: "Jernsett", icon: Wrench },
  { key: "wedges", label: "Wedger", icon: Target },
  { key: "putter", label: "Putter", icon: Flag },
  { key: "ball", label: "Ball", icon: CircleDot },
  { key: "bag", label: "Bag", icon: Compass },
  { key: "notes", label: "Notater", icon: StickyNote },
];

export function UtstyrsbagView({ initial, finnes }: Props) {
  const [redigerer, setRedigerer] = useState(!finnes);

  if (redigerer) {
    return (
      <UtstyrsbagForm
        initial={initial}
        onAvbryt={finnes ? () => setRedigerer(false) : undefined}
      />
    );
  }

  const harData = FELTER.some((f) => {
    const v = initial[f.key];
    return v != null && v.trim().length > 0;
  });

  if (!harData) {
    return (
      <EmptyState
        icon={Wrench}
        titleItalic="utstyrsbag"
        titleTrail="ikke registrert"
        sub="Logg kølle-utstyret ditt slik at coach kan tilpasse anbefalinger og fitting-arbeid."
        cta={
          <button
            type="button"
            onClick={() => setRedigerer(true)}
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            Sett opp utstyrsbag
          </button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setRedigerer(true)}
          className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-border bg-card px-3.5 font-mono text-[11px] font-extrabold tracking-[0.04em] text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <Pencil className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
          Rediger
        </button>
      </div>

      <div className="divide-y divide-border overflow-hidden rounded-[14px] border border-border bg-card">
        {FELTER.map((f) => {
          const verdi = initial[f.key];
          const harVerdi = verdi != null && verdi.trim().length > 0;
          const Icon = f.icon;
          return (
            <div
              key={f.key}
              className="grid grid-cols-[34px_1fr] items-start gap-x-3 px-3.5 py-3.5"
            >
              <span
                aria-hidden="true"
                className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-primary/[0.08] text-primary"
              >
                <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
                  {f.label}
                </div>
                <div
                  className={`mt-0.5 text-[14px] leading-snug ${
                    harVerdi
                      ? "font-semibold text-foreground"
                      : "italic text-muted-foreground/70"
                  }`}
                >
                  {harVerdi ? verdi : "Ikke satt"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
