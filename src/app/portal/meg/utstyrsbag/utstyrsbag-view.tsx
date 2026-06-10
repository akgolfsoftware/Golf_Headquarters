"use client";

/**
 * Utstyrsbag-visning — fasit: ph-screens.jsx · UtstyrScreen.
 *
 * Kølle-rader (set-group uten label) → SetGroup «BALL & ØVRIG» → knapperad:
 * primær «Legg til kølle» (åpner eksisterende redigeringsskjema) + sekundær
 * «Se TrackMan-tall» (/portal/analysere).
 *
 * EKTE EquipmentBag-data: modellen har ETT fritekstfelt per kølle-kategori
 * (ikke spec + modell separat) — verdien vises derfor som mono-meta under
 * tittelen, ikke som høyre-verdi. Tomstate-rad når en gruppe mangler data.
 * Fasitens Hanske/Sko finnes ikke i modellen — vises ikke (aldri fake data).
 */

import { useState } from "react";
import Link from "next/link";
import {
  Backpack,
  Circle,
  GitCommitHorizontal,
  Plus,
  Radar,
  StickyNote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SetGroup, SetRow } from "@/components/portal/meg/meg-sub";
import { UtstyrsbagForm } from "./utstyrsbag-form";
import type { UtstyrsbagInput } from "./actions";

type Felt = {
  key: keyof UtstyrsbagInput;
  label: string;
  icon: LucideIcon;
};

const KOLLER: Felt[] = [
  { key: "driver", label: "Driver", icon: GitCommitHorizontal },
  { key: "fairwayWoods", label: "Fairway-køller", icon: GitCommitHorizontal },
  { key: "hybrids", label: "Hybrider", icon: GitCommitHorizontal },
  { key: "irons", label: "Jernsett", icon: GitCommitHorizontal },
  { key: "wedges", label: "Wedger", icon: GitCommitHorizontal },
  { key: "putter", label: "Putter", icon: GitCommitHorizontal },
];

const OVRIG: Felt[] = [
  { key: "ball", label: "Ball", icon: Circle },
  { key: "bag", label: "Bag", icon: Backpack },
  { key: "notes", label: "Notater", icon: StickyNote },
];

function medVerdi(initial: UtstyrsbagInput, felter: Felt[]): Felt[] {
  return felter.filter((f) => {
    const v = initial[f.key];
    return v != null && v.trim().length > 0;
  });
}

/** Tomstate-rad i set-group-stil (fasit-raden uten data). */
function TomRad({ tekst }: { tekst: string }) {
  return (
    <div className="px-4 py-[15px] text-sm italic text-muted-foreground sm:px-[18px]">
      {tekst}
    </div>
  );
}

export function UtstyrsbagView({ initial }: { initial: UtstyrsbagInput }) {
  const [redigerer, setRedigerer] = useState(false);

  if (redigerer) {
    return (
      <UtstyrsbagForm initial={initial} onAvbryt={() => setRedigerer(false)} />
    );
  }

  const koller = medVerdi(initial, KOLLER);
  const ovrig = medVerdi(initial, OVRIG);

  return (
    <div>
      {/* Kølle-rader — set-group uten label */}
      <SetGroup>
        {koller.length === 0 ? (
          <TomRad tekst="Ingen køller registrert ennå." />
        ) : (
          koller.map((f) => (
            <SetRow
              key={f.key}
              icon={f.icon}
              title={f.label}
              meta={initial[f.key] ?? undefined}
            />
          ))
        )}
      </SetGroup>

      <SetGroup label="BALL & ØVRIG">
        {ovrig.length === 0 ? (
          <TomRad tekst="Ikke registrert ennå." />
        ) : (
          ovrig.map((f) => (
            <SetRow
              key={f.key}
              icon={f.icon}
              title={f.label}
              meta={initial[f.key] ?? undefined}
            />
          ))
        )}
      </SetGroup>

      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => setRedigerer(true)}
          className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-[18px] font-display text-sm font-semibold tracking-[-0.005em] text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
          Legg til kølle
        </button>
        <Link
          href="/portal/analysere"
          className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-primary px-[18px] font-display text-sm font-semibold tracking-[-0.005em] text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <Radar className="h-4 w-4" strokeWidth={2} aria-hidden />
          Se TrackMan-tall
        </Link>
      </div>
    </div>
  );
}
