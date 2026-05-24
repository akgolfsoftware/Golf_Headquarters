"use client";

/**
 * Anlegg 3-kol grid — pixel-perfekt PR5.
 * Cover-bilde (gradient placeholder) + navn + type + fasiliteter + dagens utnyttelse.
 */

import Link from "next/link";
import { Plus, MapPin, Activity } from "lucide-react";

export type AnleggKort = {
  id: string;
  navn: string;
  type: "indoor" | "hybrid" | "bane" | "range";
  adresse: string | null;
  fasiliteter: string[];
  utnyttelsePct: number; // 0-100 dagens utnyttelse
  aktiv: boolean;
};

const TYPE_LABEL: Record<AnleggKort["type"], string> = {
  indoor: "Indoor",
  hybrid: "Hybrid",
  bane: "Bane",
  range: "Range",
};

// Cover-gradient per type
const COVER_GRADIENT: Record<AnleggKort["type"], string> = {
  indoor: "linear-gradient(135deg, #003A2A 0%, #005840 60%, #1A7D56 100%)",
  hybrid: "linear-gradient(135deg, #1A7D56 0%, #005840 60%, #BFE933 130%)",
  bane: "linear-gradient(135deg, #2C7D52 0%, #1A7D56 60%, #BFE933 130%)",
  range: "linear-gradient(135deg, #005840 0%, #2C7D52 60%, #D1F843 130%)",
};

export function AnleggGrid({ anlegg }: { anlegg: AnleggKort[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {anlegg.map((a) => (
        <Link
          key={a.id}
          href={`/admin/anlegg/${a.id}`}
          className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 hover:shadow-lg"
        >
          {/* Cover */}
          <div
            className="relative h-40 overflow-hidden"
            style={{ background: COVER_GRADIENT[a.type] }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-foreground">
              {TYPE_LABEL[a.type]}
            </div>
            {!a.aktiv && (
              <div className="absolute right-4 top-4 rounded-full bg-[#A32D2D] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-white">
                Inaktiv
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="font-display text-xl font-semibold leading-tight tracking-tight text-white">
                {a.navn}
              </h3>
              {a.adresse && (
                <div className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-white/80">
                  <MapPin size={10} /> {a.adresse}
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="space-y-4 p-5">
            <div>
              <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Fasiliteter ({a.fasiliteter.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {a.fasiliteter.slice(0, 4).map((f) => (
                  <span
                    key={f}
                    className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    {f}
                  </span>
                ))}
                {a.fasiliteter.length > 4 && (
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    +{a.fasiliteter.length - 4}
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  <Activity size={10} />
                  Dagens utnyttelse
                </div>
                <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                  {a.utnyttelsePct}%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${a.utnyttelsePct}%`,
                    background:
                      a.utnyttelsePct >= 80
                        ? "linear-gradient(90deg, #B8852A, #A32D2D)"
                        : a.utnyttelsePct >= 50
                        ? "linear-gradient(90deg, #005840, #D1F843)"
                        : "linear-gradient(90deg, #005840, #1A7D56)",
                  }}
                />
              </div>
            </div>
          </div>
        </Link>
      ))}

      {/* + Nytt anlegg-CTA */}
      <Link
        href="/admin/locations"
        className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 text-muted-foreground transition hover:border-primary/50 hover:bg-card hover:text-foreground"
      >
        <span className="rounded-full bg-primary p-3 text-primary-foreground">
          <Plus size={20} />
        </span>
        <span className="font-display text-base font-semibold">Nytt anlegg</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em]">
          Legg til lokasjon
        </span>
      </Link>
    </div>
  );
}
