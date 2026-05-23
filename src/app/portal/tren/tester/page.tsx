/**
 * PlayerHQ · Tren · Tester — spiller-oversikt
 *
 * Pixel-perfekt fra Claude Design-bundle _SEBg4QyodvbW2k06JWiGw
 * (test-modul/tester-dashboard.html).
 *
 * Hero + KPI-row (4-cell med featured) + active-banner + disciplin-seksjoner
 * med tcards (gjort / pågående / PR / todo).
 */
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Check,
  Play,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
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

const PYR_SUB: Record<PyramidArea, string> = {
  FYS: "Styrke · utholdenhet · spenst",
  TEK: "Sving-mekanikk · clubhead speed · konsistens",
  SLAG: "Driver · jern · putting · innspill",
  SPILL: "Course management · TrackMan",
  TURN: "Mental tøffhet · pre-shot · fokus",
};

const PYR_ORDER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

const PYR_CLASS: Record<PyramidArea, string> = {
  FYS: "te-pyr te-pyr-fys",
  TEK: "te-pyr te-pyr-tek",
  SLAG: "te-pyr te-pyr-slag",
  SPILL: "te-pyr te-pyr-spill",
  TURN: "te-pyr te-pyr-turn",
};

const PROGRESS_COLOR: Record<PyramidArea, string> = {
  FYS: "#005840",
  TEK: "#1A7D56",
  SLAG: "#BFE933",
  SPILL: "#B8852A",
  TURN: "#5E5C57",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
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

  type TestStats = {
    score: number;
    takenAt: Date;
    antall: number;
    beste: number;
    trend: number | null;
    isPR: boolean;
  };
  const statsPerTest = new Map<string, TestStats>();
  for (const r of mineResultater) {
    const eks = statsPerTest.get(r.testId);
    if (!eks) {
      statsPerTest.set(r.testId, {
        score: r.score,
        takenAt: r.takenAt,
        antall: 1,
        beste: r.score,
        trend: null,
        isPR: false,
      });
    } else {
      const prev = eks.score;
      const prevBeste = eks.beste;
      eks.antall += 1;
      eks.score = r.score;
      eks.takenAt = r.takenAt;
      eks.beste = Math.max(prevBeste, r.score);
      eks.trend = r.score - prev;
      eks.isPR = r.score > prevBeste;
    }
  }

  const gjennomfoert = statsPerTest.size;
  const totalTester = tests.length || 36;
  const totalResultater = mineResultater.length;
  const sistTatt = mineResultater[mineResultater.length - 1]?.takenAt ?? null;

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
    if (sn > besteSnitt) {
      besteSnitt = sn;
      besteKat = k;
    }
  }

  const snittScore =
    statsPerTest.size === 0
      ? null
      : Array.from(statsPerTest.values()).reduce((s, v) => s + v.score, 0) /
        statsPerTest.size;

  // Grupper per disiplin
  const testPerDisiplin = new Map<PyramidArea, typeof tests>();
  for (const t of tests) {
    if (!testPerDisiplin.has(t.pyramidArea)) testPerDisiplin.set(t.pyramidArea, []);
    testPerDisiplin.get(t.pyramidArea)!.push(t);
  }

  // Aktiv test (mock — bruker første ikke-fullførte test for nå)
  const aktivTest = tests.find(
    (t) => !statsPerTest.has(t.id) && t.pyramidArea === "SLAG",
  );

  return (
    <div className="tester-shell">
      {/* Hero */}
      <section className="te-hero">
        <div>
          <div className="te-eyebrow">PlayerHQ · Trening · Tester</div>
          <h1>
            Tester <em>og</em> benchmarks
          </h1>
          <div className="sub">
            <strong>{gjennomfoert}</strong> av <strong>{totalTester}</strong> tester gjennomført
            <span className="dot" />
            <strong>{totalResultater}</strong> resultater logget
            {sistTatt ? (
              <>
                <span className="dot" />
                Sist: <strong>{formatDate(sistTatt)} 2026</strong>
              </>
            ) : null}
          </div>
        </div>
        <div className="te-hero-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className="font-mono inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-xs font-semibold"
          >
            Last ned PDF
          </button>
          <Link
            href="/portal/tren/tester/ny"
            className="font-display inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Ta ny test
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* KPI row */}
      <section className="te-kpi-row">
        <div className="te-kpi featured">
          <div className="lbl">Gjennomført</div>
          <div className="val">
            {gjennomfoert}
            <span className="sm">/{totalTester}</span>
          </div>
          <div className="sub">
            {Math.round((gjennomfoert / totalTester) * 100)}% av batteriet
          </div>
        </div>
        <div className="te-kpi">
          <div className="lbl">Totale forsøk</div>
          <div className="val">{totalResultater}</div>
          <div className="sub">på alle tester</div>
        </div>
        <div className="te-kpi">
          <div className="lbl">Beste kategori</div>
          <div className="val" style={{ fontSize: 22 }}>
            {besteKat ? `${besteKat} · ${PYR_LABEL[besteKat]}` : "—"}
          </div>
          <div className="sub">
            {besteKat ? (
              <>
                <span
                  className="dot"
                  style={{ background: PROGRESS_COLOR[besteKat] }}
                />
                snitt {besteSnitt.toFixed(1).replace(".", ",")}
              </>
            ) : (
              "Ikke nok data"
            )}
          </div>
        </div>
        <div className="te-kpi">
          <div className="lbl">Snitt-score</div>
          <div className="val">
            {snittScore !== null ? snittScore.toFixed(1).replace(".", ",") : "—"}
          </div>
          <div className="sub" style={{ color: "var(--success)" }}>
            <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
            siste resultater
          </div>
        </div>
      </section>

      {/* Active-test banner */}
      {aktivTest ? (
        <section className="te-active-banner">
          <div className="ic">
            <Activity className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="body">
            <div className="ttl">
              Du har en pågående test: <strong>{aktivTest.name}</strong>
            </div>
            <div className="meta">
              Steg 3 av 5 · pauset for 12 min siden · 47 av 90 registrert
            </div>
          </div>
          <Link
            href={`/portal/tren/tester/${aktivTest.id}`}
            className="font-display inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground"
          >
            Fortsett
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      ) : null}

      {/* Disiplin-seksjoner */}
      {totalTester === 0 ? (
        <section className="te-disc">
          <div className="font-mono py-12 text-center text-sm text-muted-foreground">
            Ingen tester er lagt til ennå. Coachen din legger til tester fra
            testkatalogen.
          </div>
        </section>
      ) : (
        <>
          {(["FYS", "TEK", "SLAG"] as PyramidArea[])
            .filter((d) => testPerDisiplin.has(d))
            .map((d) => {
              const gruppe = testPerDisiplin.get(d)!;
              const gjort = gruppe.filter((t) => statsPerTest.has(t.id)).length;
              return (
                <DisciplineSection
                  key={d}
                  disiplin={d}
                  total={gruppe.length}
                  gjort={gjort}
                  tests={gruppe}
                  stats={statsPerTest}
                />
              );
            })}

          <div className="te-split">
            {(["SPILL", "TURN"] as PyramidArea[])
              .filter((d) => testPerDisiplin.has(d))
              .map((d) => {
                const gruppe = testPerDisiplin.get(d)!;
                const gjort = gruppe.filter((t) => statsPerTest.has(t.id)).length;
                return (
                  <DisciplineSection
                    key={d}
                    disiplin={d}
                    total={gruppe.length}
                    gjort={gjort}
                    tests={gruppe}
                    stats={statsPerTest}
                    cols={1}
                  />
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────── components ──

function DisciplineSection({
  disiplin,
  total,
  gjort,
  tests,
  stats,
  cols = 3,
}: {
  disiplin: PyramidArea;
  total: number;
  gjort: number;
  tests: Array<{ id: string; name: string; description: string | null; pyramidArea: PyramidArea }>;
  stats: Map<string, { score: number; takenAt: Date; antall: number; beste: number; trend: number | null; isPR: boolean }>;
  cols?: 1 | 3;
}) {
  const progressPct = total > 0 ? (gjort / total) * 100 : 0;
  return (
    <section className="te-disc">
      <div className="te-disc-h">
        <span className={`${PYR_CLASS[disiplin]} te-pyr-lg`}>{disiplin}</span>
        <div>
          <div className="ttl">{PYR_LABEL[disiplin]}</div>
          <div className="sub">{PYR_SUB[disiplin]}</div>
        </div>
        <div className="right">
          <div className="progress">
            <div className="progress-bar">
              <div
                style={{
                  width: `${progressPct}%`,
                  background: PROGRESS_COLOR[disiplin],
                }}
              />
            </div>
            <span>
              <strong>{gjort}</strong> av {total}
            </span>
          </div>
        </div>
      </div>

      <div className={`te-tgrid ${cols === 1 ? "cols-1" : ""}`}>
        {tests.map((t) => (
          <TestCard
            key={t.id}
            test={t}
            stat={stats.get(t.id)}
            disiplin={disiplin}
          />
        ))}
      </div>
    </section>
  );
}

function TestCard({
  test,
  stat,
  disiplin,
}: {
  test: { id: string; name: string; description: string | null };
  stat: { score: number; takenAt: Date; antall: number; trend: number | null; isPR: boolean } | undefined;
  disiplin: PyramidArea;
}) {
  if (!stat) {
    return (
      <div className="te-tcard todo">
        <div className="row1">
          <span className={PYR_CLASS[disiplin]}>{disiplin}</span>
          <span className="te-pill te-pill-todo">Ikke tatt</span>
        </div>
        <div className="ttl">{test.name}</div>
        {test.description ? <div className="desc">{test.description}</div> : null}
        <div className="placeholder">— Ingen målinger ennå —</div>
        <Link href={`/portal/tren/tester/${test.id}`} className="start">
          <Play className="h-3 w-3" fill="currentColor" />
          Start test
        </Link>
      </div>
    );
  }

  const TrendIcon =
    stat.trend === null
      ? null
      : stat.trend > 0
        ? TrendingUp
        : stat.trend < 0
          ? TrendingDown
          : null;
  const trendClass =
    stat.trend === null
      ? "flat"
      : stat.trend > 0
        ? "up"
        : stat.trend < 0
          ? "dn"
          : "flat";

  return (
    <Link
      href={`/portal/tren/tester/${test.id}`}
      className={`te-tcard ${stat.isPR ? "pr" : ""}`}
    >
      <div className="row1">
        <span className={PYR_CLASS[disiplin]}>{disiplin}</span>
        {stat.isPR ? (
          <span className="te-pill te-pill-pr">PR</span>
        ) : (
          <span className="te-pill te-pill-done">
            <Check className="h-2.5 w-2.5" strokeWidth={2.5} /> Gjort
          </span>
        )}
      </div>
      <div className="ttl">{test.name}</div>
      {test.description ? <div className="desc">{test.description}</div> : null}
      <div className="num-row">
        <div className="v">{stat.score.toFixed(1).replace(".", ",")}</div>
        {stat.trend !== null && TrendIcon ? (
          <span className={`te-trend ${trendClass}`}>
            <TrendIcon className="h-2.5 w-2.5" strokeWidth={2.5} />
            {stat.trend > 0 ? "+" : ""}
            {stat.trend.toFixed(1).replace(".", ",")}
          </span>
        ) : null}
      </div>
      <div className="last">
        Sist: <strong>{formatDate(stat.takenAt)}</strong> · {stat.antall} forsøk
      </div>
      <div className="foot">
        Se historikk
        <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
