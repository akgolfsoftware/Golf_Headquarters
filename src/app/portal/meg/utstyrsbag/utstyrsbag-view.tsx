"use client";

import { useState } from "react";
import {
  Target,
  Wrench,
  Flag,
  CircleDot,
  Compass,
  StickyNote,
  Pencil,
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
            className="rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sett opp utstyrsbag
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setRedigerer(true)}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <Pencil className="h-4 w-4" strokeWidth={1.5} />
          Rediger
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FELTER.map((f) => {
          const verdi = initial[f.key];
          const harVerdi = verdi != null && verdi.trim().length > 0;
          const Icon = f.icon;
          return (
            <div
              key={f.key}
              className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <div
                  aria-hidden="true"
                  className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-secondary text-primary"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {f.label}
                  </div>
                  <div
                    className={`mt-2 text-sm leading-relaxed ${
                      harVerdi
                        ? "text-foreground"
                        : "italic text-muted-foreground/70"
                    }`}
                  >
                    {harVerdi ? verdi : "Ikke satt"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
