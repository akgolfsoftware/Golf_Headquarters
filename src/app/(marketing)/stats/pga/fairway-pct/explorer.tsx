"use client";

/**
 * FairwayPctExplorer — interaktiv sammenligning med slider.
 *
 * Bruker:
 *   1. Drar slider mellom min/maks fairway-prosent
 *   2. Ser percentile (andel PGA-spillere som treffer lavere %)
 *   3. Ser nærmeste proff på samme nivå
 *   4. Ser distribusjonsgraf
 *
 * Også: Topp 20-toppliste under slideren.
 */

import { useMemo, useState } from "react";
import { ArrowUp, MapPin, Sparkles } from "lucide-react";

type Datapunkt = {
  navn: string;
  land: string | null;
  verdi: number;
};

const TOPP_N = 20;
const BUCKET_SIZE = 2; // prosentpoeng-bøtter

export function FairwayPctExplorer({
  datapunkter,
}: {
  datapunkter: Datapunkt[];
}) {
  const sortert = useMemo(
    () => [...datapunkter].sort((a, b) => b.verdi - a.verdi),
    [datapunkter],
  );

  const min = Math.floor(Math.min(...datapunkter.map((p) => p.verdi)));
  const max = Math.ceil(Math.max(...datapunkter.map((p) => p.verdi)));

  // Default: norsk amatør-snitt ~55 %
  const [dittTall, setDittTall] = useState(55);

  // Percentile: andel spillere med LAVERE verdi (høyere er bedre)
  const antallLavere = datapunkter.filter((p) => p.verdi < dittTall).length;
  const percentile = Math.round((antallLavere / datapunkter.length) * 100);

  // Nærmeste proff
  const naermeste = useMemo(() => {
    let best = sortert[0];
    let bestDiff = Math.abs(sortert[0].verdi - dittTall);
    for (const p of sortert) {
      const d = Math.abs(p.verdi - dittTall);
      if (d < bestDiff) {
        best = p;
        bestDiff = d;
      }
    }
    return { spiller: best, diff: bestDiff };
  }, [sortert, dittTall]);

  // Histogram-data
  const histogram = useMemo(() => {
    const buckets: Record<number, number> = {};
    for (const p of datapunkter) {
      const b = Math.floor(p.verdi / BUCKET_SIZE) * BUCKET_SIZE;
      buckets[b] = (buckets[b] ?? 0) + 1;
    }
    const sorted = Object.entries(buckets)
      .map(([k, v]) => ({ start: Number(k), count: v }))
      .sort((a, b) => a.start - b.start);
    const maxCount = Math.max(...sorted.map((b) => b.count));
    return { buckets: sorted, maxCount };
  }, [datapunkter]);

  const sliderMin = Math.max(0, min - 10);
  const sliderMax = Math.min(100, max + 5);

  return (
    <>
      {/* INTERAKTIV SLIDER */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Hvor ofte treffer{" "}
              <em className="font-normal italic text-primary">du</em> fairway?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Dra slideren til din gjennomsnittlige fairway-prosent, og se
              hvor du står sammenlignet med PGA Tour.
            </p>
          </div>

          {/* Slider + verdi */}
          <div className="mt-10">
            <div className="text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Din fairway-prosent
              </p>
              <p className="mt-1 font-mono text-5xl font-semibold tabular-nums text-foreground sm:text-6xl">
                {dittTall.toFixed(1)}
                <span className="ml-1 text-2xl text-muted-foreground">%</span>
              </p>
            </div>

            <div className="mt-6">
              <input
                type="range"
                min={sliderMin}
                max={sliderMax}
                step={0.5}
                value={dittTall}
                onChange={(e) => setDittTall(Number(e.target.value))}
                className="w-full accent-primary"
                aria-label="Din fairway-prosent"
              />
              <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
                <span>{sliderMin} %</span>
                <span>{sliderMax} %</span>
              </div>
            </div>

            {/* Resultat */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/20 text-primary">
                    <ArrowUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                      Percentile på PGA Tour
                    </p>
                    <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-foreground">
                      P{percentile}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Du treffer fairway oftere enn {percentile}% av PGA-spillere.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-secondary/30 p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-accent/40 text-accent-foreground">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Nærmeste PGA-spiller
                    </p>
                    <p className="mt-1 truncate font-display text-xl font-semibold text-foreground">
                      {naermeste.spiller.navn}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {naermeste.spiller.verdi.toFixed(1)}% (
                      {naermeste.diff < 0.1
                        ? "samme"
                        : `${naermeste.diff.toFixed(1)} pp ${
                            naermeste.spiller.verdi > dittTall
                              ? "bedre"
                              : "dårligere"
                          }`}
                      )
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Histogram-bar */}
          <div className="mt-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Fordeling — {datapunkter.length} PGA-spillere
            </p>
            <div className="mt-3 flex h-24 items-end gap-px">
              {histogram.buckets.map((b) => {
                const inBucket =
                  dittTall >= b.start && dittTall < b.start + BUCKET_SIZE;
                const heightPct = (b.count / histogram.maxCount) * 100;
                return (
                  <div
                    key={b.start}
                    className={`flex-1 rounded-sm transition-colors ${
                      inBucket ? "bg-primary" : "bg-secondary"
                    }`}
                    style={{ height: `${heightPct}%`, minHeight: "2px" }}
                    title={`${b.start}–${b.start + BUCKET_SIZE}%: ${b.count} spillere`}
                  />
                );
              })}
            </div>
            <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>{histogram.buckets[0]?.start ?? min} %</span>
              <span>
                {(histogram.buckets[histogram.buckets.length - 1]?.start ?? max) +
                  BUCKET_SIZE}{" "}
                %
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* TOPPLISTE */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Topp {TOPP_N} på{" "}
                <em className="font-normal italic text-primary">Tour</em>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sesong 2026 · minst 20 runder spilt
              </p>
            </div>
          </div>

          <ol className="overflow-hidden rounded-lg border border-border bg-card">
            {sortert.slice(0, TOPP_N).map((p, idx) => (
              <li
                key={p.navn}
                className="grid grid-cols-[40px_1fr_auto] items-center gap-3 border-b border-border/60 px-4 py-3 last:border-0 sm:px-6"
              >
                <span className="font-mono text-sm tabular-nums text-muted-foreground">
                  #{idx + 1}
                </span>
                <span className="flex items-center gap-2 truncate">
                  <span className="truncate font-medium text-foreground">
                    {p.navn}
                  </span>
                  {p.land && (
                    <span className="inline-flex items-center gap-0.5 font-mono text-[10px] text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {p.land}
                    </span>
                  )}
                </span>
                <span className="shrink-0 font-mono text-base font-semibold tabular-nums text-primary">
                  {p.verdi.toFixed(1)}
                  <span className="ml-0.5 text-xs text-muted-foreground">%</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
