import Link from "next/link";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { aggregateSg, formatSg } from "@/lib/sg";

type Periode = "30d" | "90d" | "ar";

const PERIODER: { key: Periode; label: string; dager: number }[] = [
  { key: "30d", label: "Siste 30 d", dager: 30 },
  { key: "90d", label: "Siste 90 d", dager: 90 },
  { key: "ar", label: "Siste år", dager: 365 },
];

type SearchParams = Promise<{ periode?: string }>;

export default async function StatistikkPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { periode: periodeParam } = await searchParams;
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const periode: Periode =
    periodeParam === "90d" || periodeParam === "ar" ? periodeParam : "30d";
  const valgt = PERIODER.find((p) => p.key === periode) ?? PERIODER[0];

  const naa = new Date();
  const fra = new Date(naa);
  fra.setDate(naa.getDate() - valgt.dager);

  // Forrige periode (for trend-sammenligning) — like lang, før denne
  const fraForrige = new Date(fra);
  fraForrige.setDate(fra.getDate() - valgt.dager);

  const [denne, forrige] = await Promise.all([
    prisma.round.findMany({
      where: { userId: user.id, playedAt: { gte: fra, lte: naa } },
      orderBy: { playedAt: "desc" },
    }),
    prisma.round.findMany({
      where: { userId: user.id, playedAt: { gte: fraForrige, lt: fra } },
    }),
  ]);

  const sg = aggregateSg(denne);
  const sgForrige = aggregateSg(forrige);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PlayerHQ · Mål · Statistikk"
        titleLead="Slik utvikler"
        titleItalic="du deg"
        sub={`Strokes Gained, score-trend og runder. ${denne.length} runder i valgt periode.`}
      />

      {/* Periode-velger */}
      <div className="inline-flex rounded-md border border-border bg-card p-0.5">
        {PERIODER.map((p) => {
          const aktiv = p.key === periode;
          return (
            <Link
              key={p.key}
              href={`/portal/mal/statistikk?periode=${p.key}`}
              className={`rounded-sm px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.10em] transition-colors ${
                aktiv
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </Link>
          );
        })}
      </div>

      {denne.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          titleItalic="Ingen runder"
          titleTrail="i perioden"
          sub="Registrer runder under Runder for å se SG-trender her."
          cta={
            <Link
              href="/portal/mal/runder"
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Registrer runde
            </Link>
          }
        />
      ) : (
        <>
          {/* SG-kort */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <SgKort label="SG Total" naa={sg.total} forrige={sgForrige.total} primary />
            <SgKort label="OTT" naa={sg.ott} forrige={sgForrige.ott} />
            <SgKort label="APP" naa={sg.app} forrige={sgForrige.app} />
            <SgKort label="ARG" naa={sg.arg} forrige={sgForrige.arg} />
            <SgKort label="PUTT" naa={sg.putt} forrige={sgForrige.putt} />
          </div>

          {/* Score-trend (linje av prikker) */}
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-base font-semibold tracking-tight">
              Runde-historikk
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {denne.length} runder · snitt-score{" "}
              <span className="font-mono tabular-nums text-foreground">
                {sg.snittScore?.toFixed(1) ?? "—"}
              </span>
            </p>
            <ScoreTrend rounds={denne} />
          </section>

          {/* Runde-tabell */}
          <section className="rounded-lg border border-border bg-card">
            <header className="border-b border-border px-6 py-4">
              <h2 className="font-display text-base font-semibold tracking-tight">
                Alle runder
              </h2>
            </header>
            {/* Desktop: tabell */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40">
                  <tr>
                    <Th>Dato</Th>
                    <Th>Score</Th>
                    <Th>SG Total</Th>
                    <Th>OTT</Th>
                    <Th>APP</Th>
                    <Th>ARG</Th>
                    <Th>PUTT</Th>
                  </tr>
                </thead>
                <tbody>
                  {denne.slice(0, 20).map((r) => (
                    <tr key={r.id} className="border-t border-border/60">
                      <Td>
                        {r.playedAt.toLocaleDateString("nb-NO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Td>
                      <Td mono>{r.score}</Td>
                      <Td mono>{formatSg(r.sgTotal)}</Td>
                      <Td mono>{formatSg(r.sgOtt)}</Td>
                      <Td mono>{formatSg(r.sgApp)}</Td>
                      <Td mono>{formatSg(r.sgArg)}</Td>
                      <Td mono>{formatSg(r.sgPutt)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobil: kort */}
            <div className="space-y-4 p-4 sm:hidden">
              {denne.slice(0, 20).map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-baseline justify-between">
                    <div className="font-semibold text-foreground">
                      {r.playedAt.toLocaleDateString("nb-NO", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="font-mono text-sm tabular-nums text-muted-foreground">
                      Score {r.score}
                    </div>
                  </div>
                  <div className="mt-2 font-mono text-[11px] tabular-nums text-foreground">
                    SG Total: {formatSg(r.sgTotal)}
                  </div>
                </div>
              ))}
            </div>
            {denne.length > 20 && (
              <div className="border-t border-border px-6 py-4 text-center">
                <Link
                  href="/portal/mal/runder"
                  className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline"
                >
                  Se alle {denne.length} runder →
                </Link>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function SgKort({
  label,
  naa,
  forrige,
  primary,
}: {
  label: string;
  naa: number | null;
  forrige: number | null;
  primary?: boolean;
}) {
  const diff = naa !== null && forrige !== null ? naa - forrige : null;
  const Icon =
    diff === null || Math.abs(diff) < 0.05
      ? Minus
      : diff > 0
        ? TrendingUp
        : TrendingDown;
  const trendKlasse =
    diff === null
      ? "text-muted-foreground"
      : diff > 0.05
        ? "text-primary"
        : diff < -0.05
          ? "text-destructive"
          : "text-muted-foreground";

  return (
    <div
      className={`rounded-lg border p-4 ${
        primary
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-semibold tabular-nums">
        {formatSg(naa)}
      </div>
      <div
        className={`mt-1 inline-flex items-center gap-1 font-mono text-[10px] tabular-nums ${trendKlasse}`}
      >
        <Icon className="h-3 w-3" strokeWidth={2} />
        {diff === null
          ? "Ingen sammenligning"
          : diff === 0
            ? "Uendret"
            : `${diff > 0 ? "+" : ""}${diff.toFixed(2)} vs forrige`}
      </div>
    </div>
  );
}

function ScoreTrend({
  rounds,
}: {
  rounds: { playedAt: Date; score: number }[];
}) {
  if (rounds.length === 0) return null;
  const sortert = [...rounds].sort(
    (a, b) => a.playedAt.getTime() - b.playedAt.getTime(),
  );
  const max = Math.max(...sortert.map((r) => r.score));
  const min = Math.min(...sortert.map((r) => r.score));
  const span = max - min || 1;
  const w = 100; // viewbox-w
  const h = 60;

  const points = sortert
    .map((r, i) => {
      const x = (i / Math.max(1, sortert.length - 1)) * w;
      const y = h - ((r.score - min) / span) * h;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`-2 -4 ${w + 4} ${h + 8}`}
      role="img"
      aria-label="Score-trend"
      className="mt-4 h-24 w-full"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="text-primary"
      />
      {sortert.map((r, i) => {
        const x = (i / Math.max(1, sortert.length - 1)) * w;
        const y = h - ((r.score - min) / span) * h;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={1.5}
            className="fill-primary"
          />
        );
      })}
    </svg>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
      {children}
    </th>
  );
}

function Td({
  children,
  mono = false,
}: {
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <td className={`px-4 py-2.5 ${mono ? "font-mono tabular-nums" : ""}`}>
      {children}
    </td>
  );
}
