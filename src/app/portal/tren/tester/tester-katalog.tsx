"use client";

/**
 * Klient-katalog for /portal/tren/tester: lite søkefelt som filtrerer på
 * testnavn + én gruppe per pyramide-område (fys→turn). Rad = navn + kort
 * scoringRule-meta + chevron → testdetalj.
 *
 * Gruppe/rad gjenspeiler SetGroup/SetRow-stilen fra meg-sub, men er
 * reimplementert her fordi raden er en <Link> og gruppe-headeren har
 * pyr-fargedot — det støtter ikke primitivene.
 */

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

export type KatalogRad = {
  id: string;
  name: string;
  /** Kort scoringRule-utdrag (første setning). */
  meta: string;
  href: string;
};

export type KatalogGruppe = {
  axis: "fys" | "tek" | "slag" | "spill" | "turn";
  label: string;
  rows: KatalogRad[];
};

/** Pyr-fargedot per akse — tokens fra globals.css, aldri hex. */
const DOT: Record<KatalogGruppe["axis"], string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
};

export function TesterKatalog({ grupper }: { grupper: KatalogGruppe[] }) {
  const [sok, setSok] = useState("");
  const q = sok.trim().toLowerCase();

  const filtrert = grupper
    .map((g) => ({
      ...g,
      rows: q ? g.rows.filter((r) => r.name.toLowerCase().includes(q)) : g.rows,
    }))
    .filter((g) => g.rows.length > 0);

  const totalt = grupper.reduce((sum, g) => sum + g.rows.length, 0);

  return (
    <div>
      <div className="mb-2 mt-1 flex items-baseline justify-between pt-2">
        <AthleticEyebrow>Katalog</AthleticEyebrow>
        <span className="font-mono text-xs text-muted-foreground">{totalt} tester</span>
      </div>

      <label className="mb-4 flex h-10 items-center gap-2.5 rounded-full border border-border bg-card px-4">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />
        <input
          type="search"
          value={sok}
          onChange={(e) => setSok(e.target.value)}
          placeholder="Søk etter test …"
          aria-label="Søk i testkatalogen"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>

      {filtrert.length === 0 && (
        <p className="px-1 py-6 text-center text-sm text-muted-foreground">
          Ingen tester matcher «{sok.trim()}».
        </p>
      )}

      {filtrert.map((g) => (
        <div key={g.axis} className="mb-[22px]">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="inline-flex items-center gap-2">
              <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[g.axis]}`} aria-hidden />
              <AthleticEyebrow>{g.label}</AthleticEyebrow>
            </span>
            <span className="font-mono text-xs text-muted-foreground">{g.rows.length}</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {g.rows.map((r) => (
              <Link
                key={r.id}
                href={r.href}
                className="flex items-center gap-3.5 border-b border-border px-[18px] py-[15px] transition-colors last:border-b-0 hover:bg-secondary/50"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-semibold tracking-[-0.005em] text-foreground">
                    {r.name}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground">
                    {r.meta}
                  </span>
                </span>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-muted-foreground/60"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
