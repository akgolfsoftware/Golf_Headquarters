/**
 * /stats/turneringer/[slug]/statistikk — Scorefordeling i feltet.
 *
 * Ekte data fra PublicPlayerEntry (scoreToPar per spiller). Viser median,
 * beste, kutt, score-til-par-histogram, og norske vs feltet.
 * Server Component. ISR 900 sek.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, TrendingDown, Trophy, Users, Flag } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const revalidate = 900;

type Props = { params: Promise<{ slug: string }> };

const fmtScore = (n: number): string => (n === 0 ? "E" : n > 0 ? `+${n}` : `−${Math.abs(n)}`);

// scoreToPar-kolonnen er tom — utled fra rounds-JSON ({n, par:"-2"|"+2"|"Par", score}).
// Defensiv runtime-parsing (ingen blind cast av hele blobben).
function roundsParSum(rounds: unknown): number | null {
  if (!Array.isArray(rounds) || rounds.length === 0) return null;
  let sum = 0;
  let any = false;
  for (const r of rounds) {
    if (r && typeof r === "object" && "par" in r) {
      const p = (r as { par: unknown }).par;
      if (typeof p === "string") {
        const v = p === "Par" || p === "E" ? 0 : Number.parseInt(p, 10);
        if (!Number.isNaN(v)) {
          sum += v;
          any = true;
        }
      }
    }
  }
  return any ? sum : null;
}

function median(sorted: number[]): number | null {
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await prisma.tournament.findUnique({ where: { slug }, select: { name: true } });
  if (!t) return { title: "Turnering ikke funnet | AK Golf Stats" };
  return {
    title: `${t.name} — statistikk | AK Golf Stats`,
    description: `Scorefordeling, median og norske spilleres resultat i feltet for ${t.name}.`,
    alternates: { canonical: `https://akgolf.no/stats/turneringer/${slug}/statistikk` },
  };
}

export default async function TurneringStatistikk({ params }: Props) {
  const { slug } = await params;

  const t = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      publicEntries: {
        select: {
          rounds: true,
          status: true,
          player: { select: { country: true } },
        },
      },
    },
  });
  if (!t) notFound();

  const utledet = t.publicEntries.map((e) => ({
    stp: roundsParSum(e.rounds),
    country: e.player.country,
  }));
  const ferdige = utledet.filter(
    (e): e is { stp: number; country: string } => e.stp !== null,
  );
  const scores = ferdige.map((e) => e.stp).sort((a, b) => a - b);
  const norske = ferdige
    .filter((e) => e.country === "NO")
    .map((e) => e.stp)
    .sort((a, b) => a - b);
  const kuttet = t.publicEntries.filter((e) => e.status === "CUT").length;

  const feltMedian = median(scores);
  const norskMedian = median(norske);
  const beste = scores.length ? scores[0] : null;

  // Histogram-buckets (bredde 2 slag).
  const W = 2;
  let buckets: { lo: number; count: number }[] = [];
  let medianIdx = -1;
  if (scores.length) {
    const minB = Math.floor(scores[0] / W) * W;
    const maxB = Math.floor(scores[scores.length - 1] / W) * W;
    const n = (maxB - minB) / W + 1;
    buckets = Array.from({ length: n }, (_, i) => ({ lo: minB + i * W, count: 0 }));
    for (const s of scores) buckets[Math.floor((s - minB) / W)].count++;
    if (feltMedian != null) medianIdx = Math.floor((feltMedian - minB) / W);
  }
  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  const harData = scores.length > 0;
  const norskDelta = feltMedian != null && norskMedian != null ? norskMedian - feltMedian : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <Link
        href={`/stats/turneringer/${slug}`}
        className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        {t.name}
      </Link>

      <header className="mt-4">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Turneringsstatistikk
        </div>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Hvor hardt slo <em className="font-normal italic text-primary">feltet</em>?
        </h1>
      </header>

      {!harData ? (
        <div className="mt-6 rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Ingen ferdigspilte resultater registrert ennå. Statistikken fylles når feltet har
            levert score.
          </p>
        </div>
      ) : (
        <>
          {/* KPI-strip */}
          <section className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Kpi icon={Users} label="Spillere" value={String(scores.length)} />
            <Kpi icon={TrendingDown} label="Median" value={feltScore(feltMedian)} />
            <Kpi icon={Trophy} label="Beste" value={feltScore(beste)} tone="good" />
            <Kpi icon={Flag} label="Kuttet" value={String(kuttet)} />
          </section>

          {/* Histogram */}
          <section className="mt-4 rounded-2xl border border-border bg-card p-6">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Score til par · fordeling
            </div>
            <div className="mt-5 flex h-40 items-end gap-1">
              {buckets.map((b, i) => (
                <div
                  key={b.lo}
                  className="group relative flex-1"
                  style={{ height: "100%" }}
                  title={`${fmtScore(b.lo)} til ${fmtScore(b.lo + W - 1)}: ${b.count} spillere`}
                >
                  <div
                    className={`absolute bottom-0 w-full rounded-t-sm ${i === medianIdx ? "bg-primary" : "bg-secondary"}`}
                    style={{ height: `${Math.max((b.count / maxCount) * 100, 3)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] tabular-nums text-muted-foreground">
              <span>{fmtScore(buckets[0].lo)}</span>
              <span className="text-primary">Median {feltScore(feltMedian)}</span>
              <span>{fmtScore(buckets[buckets.length - 1].lo + W - 1)}</span>
            </div>
          </section>

          {/* Norske vs feltet */}
          {norske.length > 0 && (
            <section className="mt-4 rounded-2xl border border-border bg-card p-6">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Norske vs feltet
              </div>
              <div className="mt-3 flex items-baseline gap-4">
                <div>
                  <div className="font-mono text-2xl font-bold tabular-nums text-foreground">
                    {feltScore(norskMedian)}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    {norske.length} norske · median
                  </div>
                </div>
                {norskDelta != null && (
                  <div
                    className={`font-mono text-sm font-semibold ${norskDelta < 0 ? "text-success" : norskDelta > 0 ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {norskDelta === 0
                      ? "på linje med feltet"
                      : `${fmtScore(norskDelta)} vs feltets median`}
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

const feltScore = (n: number | null) => (n == null ? "—" : fmtScore(n));

function Kpi({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  tone?: "good";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </span>
        <Icon size={14} strokeWidth={1.75} className="text-muted-foreground" />
      </div>
      <div
        className={`mt-2 font-mono text-2xl font-semibold tabular-nums leading-none ${tone === "good" ? "text-success" : "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}
