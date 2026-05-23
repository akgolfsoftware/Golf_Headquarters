/**
 * <SgInline> — inline Strokes Gained-content for Analysere-tab.
 *
 * Viser SG-tall direkte i tabben (ikke et "Åpne"-kort som tidligere).
 * For full breakdown og historikk: link til /portal/mal/sg-hub.
 */

import Link from "next/link";
import { ArrowUpRight, Target, TrendingUp, TrendingDown } from "lucide-react";
import { prisma } from "@/lib/prisma";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
});

type SgKategori = {
  label: string;
  kort: string;
  snitt: number | null;
  beste: number | null;
};

export async function SgInline({ userId }: { userId: string }) {
  // Hent siste 10 runder med SG-data
  const runder = await prisma.round.findMany({
    where: {
      userId,
      sgTotal: { not: null },
    },
    orderBy: { playedAt: "desc" },
    take: 10,
    select: {
      id: true,
      playedAt: true,
      sgTotal: true,
      sgOtt: true,
      sgApp: true,
      sgArg: true,
      sgPutt: true,
    },
  });

  if (runder.length === 0) {
    return <TomTilstand />;
  }

  // Beregn snitt + beste for hver kategori
  const omrader: SgKategori[] = [
    {
      label: "Off the tee",
      kort: "OTT",
      snitt: snitt(runder.map((r) => r.sgOtt)),
      beste: beste(runder.map((r) => r.sgOtt)),
    },
    {
      label: "Approach",
      kort: "APP",
      snitt: snitt(runder.map((r) => r.sgApp)),
      beste: beste(runder.map((r) => r.sgApp)),
    },
    {
      label: "Around green",
      kort: "ARG",
      snitt: snitt(runder.map((r) => r.sgArg)),
      beste: beste(runder.map((r) => r.sgArg)),
    },
    {
      label: "Putting",
      kort: "PUTT",
      snitt: snitt(runder.map((r) => r.sgPutt)),
      beste: beste(runder.map((r) => r.sgPutt)),
    },
  ];

  const sgTotalSnitt = snitt(runder.map((r) => r.sgTotal));

  // Finn beste og svakeste område (basert på snitt)
  const sorted = [...omrader]
    .filter((o) => o.snitt !== null)
    .sort((a, b) => (b.snitt ?? 0) - (a.snitt ?? 0));
  const beste_omr = sorted[0]?.label ?? "—";
  const svakest = sorted[sorted.length - 1]?.label ?? "—";

  return (
    <div className="space-y-6">
      {/* Topp-rad: SG Total + beste/svakest */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiBoks
          eyebrow="SG total · snitt 10"
          verdi={formaterSg(sgTotalSnitt)}
          farge={sgTotalSnitt !== null && sgTotalSnitt > 0 ? "positive" : "negative"}
        />
        <KpiBoks
          eyebrow="Sterkeste område"
          verdi={beste_omr}
          farge="positive"
          ikon={<TrendingUp className="h-4 w-4" strokeWidth={1.75} />}
        />
        <KpiBoks
          eyebrow="Trenger fokus"
          verdi={svakest}
          farge="negative"
          ikon={<TrendingDown className="h-4 w-4" strokeWidth={1.75} />}
        />
      </div>

      {/* SG-breakdown — 4 områder */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Per kategori · snitt siste {runder.length} runder
          </h3>
          <Link
            href="/portal/mal/sg-hub"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:gap-2"
          >
            Full breakdown
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {omrader.map((o) => (
            <SgKort key={o.kort} omrade={o} />
          ))}
        </div>
      </section>

      {/* Siste runder med SG */}
      <section>
        <h3 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Siste runder
        </h3>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                <th className="px-4 py-2 text-left font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Dato
                </th>
                <th className="px-2 py-2 text-right font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  OTT
                </th>
                <th className="px-2 py-2 text-right font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  APP
                </th>
                <th className="px-2 py-2 text-right font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  ARG
                </th>
                <th className="px-2 py-2 text-right font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  PUTT
                </th>
                <th className="px-4 py-2 text-right font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {runder.slice(0, 5).map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border/50 last:border-b-0"
                >
                  <td className="px-4 py-2 text-foreground">
                    {NB_DATE.format(r.playedAt)}
                  </td>
                  <td className="px-2 py-2 text-right font-mono tabular-nums text-foreground">
                    {formaterSg(r.sgOtt)}
                  </td>
                  <td className="px-2 py-2 text-right font-mono tabular-nums text-foreground">
                    {formaterSg(r.sgApp)}
                  </td>
                  <td className="px-2 py-2 text-right font-mono tabular-nums text-foreground">
                    {formaterSg(r.sgArg)}
                  </td>
                  <td className="px-2 py-2 text-right font-mono tabular-nums text-foreground">
                    {formaterSg(r.sgPutt)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-semibold tabular-nums text-foreground">
                    {formaterSg(r.sgTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function KpiBoks({
  eyebrow,
  verdi,
  farge,
  ikon,
}: {
  eyebrow: string;
  verdi: string;
  farge: "positive" | "negative" | "neutral";
  ikon?: React.ReactNode;
}) {
  const fargeKlasse =
    farge === "positive"
      ? "text-primary"
      : farge === "negative"
        ? "text-destructive"
        : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {eyebrow}
      </p>
      <div className="mt-1 flex items-center gap-2">
        {ikon && <span className={fargeKlasse}>{ikon}</span>}
        <span
          className={`font-display text-2xl font-semibold tabular-nums ${fargeKlasse}`}
        >
          {verdi}
        </span>
      </div>
    </div>
  );
}

function SgKort({ omrade }: { omrade: SgKategori }) {
  const positiv = omrade.snitt !== null && omrade.snitt > 0;
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {omrade.kort}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        {omrade.label}
      </p>
      <div className="mt-2 flex items-baseline justify-between">
        <span
          className={`font-display text-xl font-semibold tabular-nums ${
            positiv ? "text-primary" : "text-destructive"
          }`}
        >
          {formaterSg(omrade.snitt)}
        </span>
        {omrade.beste !== null && (
          <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
            best {formaterSg(omrade.beste)}
          </span>
        )}
      </div>
    </div>
  );
}

function TomTilstand() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <Target className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">
        Ingen runder med SG-data ennå
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Logg en runde med shot-by-shot for å se din strokes gained-fordeling.
      </p>
      <Link
        href="/portal/ny-okt?type=runde"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Logg første runde
        <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
      </Link>
    </div>
  );
}

function snitt(vals: (number | null)[]): number | null {
  const v = vals.filter((x): x is number => x !== null);
  if (v.length === 0) return null;
  return v.reduce((s, x) => s + x, 0) / v.length;
}

function beste(vals: (number | null)[]): number | null {
  const v = vals.filter((x): x is number => x !== null);
  if (v.length === 0) return null;
  return Math.max(...v);
}

function formaterSg(v: number | null): string {
  if (v === null) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}`;
}
