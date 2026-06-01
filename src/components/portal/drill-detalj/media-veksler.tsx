"use client";

/**
 * Media-veksler — tab-bytte mellom video og foto for en drill.
 *
 * Brukes kun når drillen har mer enn ett medium. Ved ett medium rendrer
 * server-komponenten rammen direkte (ingen klient-JS). Port av media-veksleren
 * i components-drill-detalj.html.
 */

import { useState } from "react";
import { Play, Image as ImageIcon } from "lucide-react";
import { safeUrl } from "@/lib/security/safe-url";
import { cn } from "@/lib/utils";
import type { DrillMedia } from "@/lib/portal-drilldetalj/drill-detalj-data";

export function MediaVeksler({ media }: { media: DrillMedia[] }) {
  const [aktiv, setAktiv] = useState(0);
  const valgt = media[aktiv] ?? media[0];
  const url = safeUrl(valgt.url);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Media"
        className="mb-2.5 inline-flex gap-1 rounded-[10px] bg-secondary p-1"
      >
        {media.map((m, i) => {
          const Icon = m.kind === "video" ? Play : ImageIcon;
          const active = i === aktiv;
          return (
            <button
              key={m.kind}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setAktiv(i)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.06em] transition-colors",
                active
                  ? "bg-card text-foreground shadow-[0_1px_2px_hsl(var(--foreground)/0.08)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3 w-3" strokeWidth={2} aria-hidden />
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="relative h-[188px] overflow-hidden rounded-xl border border-border bg-secondary/40">
        {valgt.kind === "video" && url ? (
          <video
            key={url}
            src={url}
            controls
            className="h-full w-full object-cover"
          />
        ) : valgt.kind === "foto" && url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={url}
            src={url}
            alt={`Foto for ${valgt.label}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              <Play className="h-3 w-3 text-primary" strokeWidth={2} aria-hidden />
              Media kommer
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
