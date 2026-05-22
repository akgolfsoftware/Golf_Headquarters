/**
 * PlayerHQ · Tren · Tester — spiller-oversikt
 *
 * Design: 05 Tester-modul.html · Skjerm 3 (Spiller-oversikt)
 * KPI-strip + filterpills + disciplin-seksjoner med test-cards
 */
import Link from "next/link";
import { Target, Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";
import "@/components/tester/tester.css";

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slagteknikk",
  SPILL: "Spillforståelse",
  TURN: "Turneringsmodus",
};

const PYR_ORDER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

const BADGE_CLASS: Record<PyramidArea, string> = {
  FYS:   "te-badge te-badge-fys",
  TEK:   "te-badge te-badge-tek",
  SLAG:  "te-badge te-badge-slag",
  SPILL: "te-badge te-badge-spill",
  TURN:  "te-badge te-badge-turn",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

export default async function TesterPage() {
  const user = await requirePortalUser();

  const [tests, mineResultater] = await Promise.all([
    prisma.testDefinition.findMany({ orderBy: { name: "asc" } }),
    prisma.testResult.findMany({
      where: { userId: user.id },
      orderBy: { takenAt: "asc" },
    }),
  ]);

  // Aggreger per test: siste, beste, antall, trend (siste - nest siste)
  type TestStats = {
    score: number;
    takenAt: Date;
    antall: number;
    beste: number;
    trend: number | null; // positiv = bedre
  };
  const statsPerTest = new Map<string, TestStats>();
  for (const r of mineResultater) {
    const eks = statsPerTest.get(r.testId);
    if (!eks) {
      statsPerTest.set(r.testId, { score: r.score, takenAt: r.takenAt, antall: 1, beste: r.score, trend: null });
    } else {
      const prev = eks.score;
      eks.antall += 1;
      eks.score = r.score;
      eks.takenAt = r.takenAt;
      eks.beste = Math.max(eks.beste, r.score);
      eks.trend = r.score - prev;
    }
  }

  const gjennomfoert = statsPerTest.size;
  const totalTester = tests.length;
  const totalResultater = mineResultater.length;

  // Beste kategori
  const kategoriStats = new Map<PyramidArea, { snittSum: number; antall: number }>();
  for (const t of tests) {
    const s = statsPerTest.get(t.id);
    if (s) {
      const cur = kategoriStats.get(t.pyramidArea) ?? { snittSum: 0, antall: 0 };
      cur.snittSum += s.score;
      cur.antall += 1;
      kategoriStats.set(t.pyramidArea, cur);
    }
  }
  let besteKat: PyramidArea | null = null;
  let besteSnitt = -1;
  for (const [k, v] of kategoriStats) {
    const sn = v.antall ? v.snittSum / v.antall : 0;
    if (sn > besteSnitt) { besteSnitt = sn; besteKat = k; }
  }

  // Grupper tester per disiplin
  const testPerDisiplin = new Map<PyramidArea, typeof tests>();
  for (const t of tests) {
    if (!testPerDisiplin.has(t.pyramidArea)) testPerDisiplin.set(t.pyramidArea, []);
    testPerDisiplin.get(t.pyramidArea)!.push(t);
  }

  return (
    <div className="space-y-8">
      {/* Eyebrow + heading */}
      <div>
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Trening · Tester
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          Tester <em className="font-serif italic font-normal text-primary">og</em> benchmarks
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {gjennomfoert} av {totalTester} tester gjennomført · {totalResultater} resultat{totalResultater === 1 ? "" : "er"} logget
        </p>
      </div>

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-foreground to-foreground/90 p-4 text-white">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent/70">
            Gjennomført
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-accent">
            {gjennomfoert}
          </div>
          <div className="font-mono text-[11px] text-white/65">av {totalTester} tilgjengelig</div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Totale forsøk
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {totalResultater}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">på alle tester</div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Beste kategori
          </div>
          <div className="font-mono text-[24px] font-semibold leading-none tabular-nums text-foreground">
            {besteKat ?? "—"}
          </div>
          <div className="font-mono text-[11px] text-primary">
            {besteKat ? PYR_LABEL[besteKat] : "Ikke nok data"}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Snitt-score
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {statsPerTest.size === 0
              ? "—"
              : (Array.from(statsPerTest.values()).reduce((s, v) => s + v.score, 0) / statsPerTest.size)
                  .toFixed(1).replace(".", ",")}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">siste resultat per test</div>
        </div>
      </div>

      {/* Disiplin-seksjoner */}
      {totalTester === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-card p-16 text-center">
          <Target size={32} strokeWidth={1.5} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Ingen tester er lagt til ennå. Coachen din legger til tester fra testkatalogen.
          </p>
          <Link
            href="/portal/coach/melding?type=ny-test"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            <Plus size={12} strokeWidth={1.75} /> Be coach legge til
          </Link>
        </div>
      ) : (
        PYR_ORDER.filter((d) => testPerDisiplin.has(d)).map((disiplin) => {
          const gruppe = testPerDisiplin.get(disiplin)!;
          const gjort = gruppe.filter((t) => statsPerTest.has(t.id)).length;
          return (
            <section key={disiplin} className="rounded-lg border border-border bg-card p-5">
              {/* Section header */}
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className={`${BADGE_CLASS[disiplin]} px-3 py-1 text-[11px]`}>
                  {disiplin}
                </span>
                <div>
                  <div className="font-display text-base font-semibold">{PYR_LABEL[disiplin]}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    {gruppe.length} tester · {gjort} gjennomført
                  </div>
                </div>
              </div>

              {/* Test-card grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {gruppe.map((t) => {
                  const stats = statsPerTest.get(t.id);
                  const trend = stats?.trend ?? null;
                  return (
                    <Link
                      key={t.id}
                      href={`/portal/tren/tester/${t.id}`}
                      className="te-card block no-underline"
                    >
                      <div className="flex items-center gap-2">
                        <span className={BADGE_CLASS[disiplin]}>{disiplin}</span>
                        <span className={`ml-auto rounded-full px-2.5 py-0.5 font-mono text-[9.5px] font-semibold ${stats ? "bg-accent/30 text-accent-foreground" : "border border-border bg-background text-muted-foreground"}`}>
                          {stats ? "Gjort" : "Ikke tatt"}
                        </span>
                      </div>
                      <div className="font-display text-[15px] font-semibold leading-tight">
                        {t.name}
                      </div>
                      {t.description && (
                        <div className="font-mono text-[10.5px] leading-snug text-muted-foreground line-clamp-2">
                          {t.description}
                        </div>
                      )}
                      {stats ? (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-[22px] font-semibold tabular-nums leading-none text-foreground">
                              {stats.score.toFixed(1).replace(".", ",")}
                            </span>
                            {trend !== null && (
                              <span className={`flex items-center gap-0.5 font-mono text-[10px] font-semibold ${trend > 0 ? "text-primary" : trend < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                {trend > 0
                                  ? <TrendingUp size={12} strokeWidth={1.75} />
                                  : trend < 0
                                    ? <TrendingDown size={12} strokeWidth={1.75} />
                                    : <Minus size={12} strokeWidth={1.75} />}
                                {trend > 0 ? "+" : ""}{trend.toFixed(1).replace(".", ",")}
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            Sist: <strong className="text-foreground">{formatDate(stats.takenAt)}</strong>
                            &nbsp;·&nbsp;{stats.antall} forsøk
                          </div>
                        </>
                      ) : (
                        <div className="rounded-md border border-dashed border-border bg-background px-3 py-2 font-mono text-[10.5px] text-muted-foreground">
                          Ikke gjennomført ennå
                        </div>
                      )}
                      <div className="border-t border-border/50 pt-2">
                        <span className="font-mono text-[10px] font-semibold text-primary">
                          {stats ? "Se historikk →" : "Start test →"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
