/**
 * CoachHQ — Tester · Coach-oversikt
 *
 * Design: 05 Tester-modul.html · Skjerm 1 (Coach-oversikt)
 * KPI-strip + disiplin-seksjoner med test-cards inkl. distribusjonsbar
 */
import Link from "next/link";
import { Activity, Plus, Search, ChevronDown, ChevronRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { avatarBg } from "@/lib/avatar-colors";
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

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

function rankPill(score: number): { label: string; cls: string } {
  if (score >= 75) return { label: "Topp 25%", cls: "bg-primary/15 text-primary" };
  if (score >= 50) return { label: "Topp 50%", cls: "bg-secondary text-foreground" };
  return { label: "Under snitt", cls: "bg-destructive/15 text-destructive" };
}

export default async function TesterPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [results, definitions, playerCount] = await Promise.all([
    prisma.testResult.findMany({
      orderBy: { takenAt: "desc" },
      take: 100,
      include: {
        user: { select: { id: true, name: true, hcp: true } },
        test: { select: { id: true, name: true, pyramidArea: true, scoringRule: true } },
      },
    }),
    prisma.testDefinition.findMany({ orderBy: { name: "asc" } }),
    prisma.user.count({ where: { role: "PLAYER" } }),
  ]);

  // KPI: siste 30 dager (stabil server-side beregning)
  const trettiSiden = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
  const siste30d = results.filter((r) => r.takenAt >= trettiSiden);
  const snittScore = results.length > 0 ? results.reduce((s, r) => s + r.score, 0) / results.length : 0;
  const uniquePlayers = new Set(results.map((r) => r.userId)).size;

  // Grupper definisjoner per disiplin
  const definisjonPerDisiplin = new Map<PyramidArea, typeof definitions>();
  for (const d of definitions) {
    if (!definisjonPerDisiplin.has(d.pyramidArea)) definisjonPerDisiplin.set(d.pyramidArea, []);
    definisjonPerDisiplin.get(d.pyramidArea)!.push(d);
  }

  // Aggreger stats per testdefinisjon
  type TestStat = {
    antallSpillere: number;
    antallMalinger: number;
    sisteDate: Date | null;
    scores: number[];
  };
  const testStats = new Map<string, TestStat>();
  for (const r of results) {
    if (!testStats.has(r.testId)) {
      testStats.set(r.testId, { antallSpillere: 0, antallMalinger: 0, sisteDate: null, scores: [] });
    }
    const s = testStats.get(r.testId)!;
    s.antallMalinger += 1;
    s.scores.push(r.score);
    if (!s.sisteDate || r.takenAt > s.sisteDate) s.sisteDate = r.takenAt;
  }
  // Unike spillere per test
  const spillerPerTest = new Map<string, Set<string>>();
  for (const r of results) {
    if (!spillerPerTest.has(r.testId)) spillerPerTest.set(r.testId, new Set());
    spillerPerTest.get(r.testId)!.add(r.userId);
  }
  for (const [testId, set] of spillerPerTest) {
    const s = testStats.get(testId);
    if (s) s.antallSpillere = set.size;
  }

  // Siste 10 resultater for tabellen
  const siste10 = results.slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · /admin/tester"
        titleLead="Tester"
        titleItalic="og benchmarks"
        titleTrail=" — hele stallen"
        sub={`${definitions.length} aktive tester · ${uniquePlayers} spillere testet siste 30 dager`}
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary"
            >
              <Plus size={12} strokeWidth={1.75} /> Ny test
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              Planlegg test-runde
            </button>
          </div>
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-foreground to-foreground/90 p-4 text-white">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent/70">
            Resultater · 30d
          </div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-accent">
            {siste30d.length}
          </div>
          <div className="font-mono text-[11px] text-white/65">Tester fullført siste måned</div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Snitt-score</div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
            {snittScore.toFixed(1).replace(".", ",")}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">Siste {results.length} resultater</div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Aktive spillere</div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">{uniquePlayers}</div>
          <div className="font-mono text-[11px] text-muted-foreground">Har minst ett resultat</div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Testkatalog</div>
          <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">{definitions.length}</div>
          <div className="font-mono text-[11px] text-muted-foreground">{playerCount} aktive spillere totalt</div>
        </div>
      </div>

      {/* Filter-strip */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">Disiplin</span>
        {PYR_ORDER.map((d) => (
          <button
            key={d}
            type="button"
            className={`${BADGE_CLASS[d]} transition-opacity hover:opacity-80`}
          >
            {d}
          </button>
        ))}
        <div className="mx-1 h-5 w-px bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">Periode</span>
        {["Uke", "Måned", "Kvartal", "Sesong"].map((p) => (
          <button
            key={p}
            type="button"
            className={`rounded-full border border-border bg-background px-3 py-1 font-mono text-[10px] font-semibold hover:border-primary hover:text-primary ${p === "Måned" ? "bg-primary text-primary-foreground border-transparent" : "text-muted-foreground"}`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Disiplin-seksjoner */}
      {definitions.length === 0 ? (
        <EmptyState
          icon={Activity}
          titleItalic="Ingen"
          titleTrail="tester i katalog"
          sub="Legg til tester fra NGF-standarden eller egendefinerte tester."
        />
      ) : (
        PYR_ORDER.filter((d) => definisjonPerDisiplin.has(d)).map((disiplin) => {
          const gruppe = definisjonPerDisiplin.get(disiplin)!;
          const gruppeStats = gruppe.reduce(
            (acc, t) => {
              const s = testStats.get(t.id);
              return {
                spillere: acc.spillere + (spillerPerTest.get(t.id)?.size ?? 0),
                malinger: acc.malinger + (s?.antallMalinger ?? 0),
              };
            },
            { spillere: 0, malinger: 0 },
          );

          return (
            <section key={disiplin} className="rounded-xl border border-border bg-card p-5">
              {/* Section header */}
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className={`${BADGE_CLASS[disiplin]} px-3 py-1 text-[11px]`}>
                  {disiplin}
                </span>
                <div>
                  <div className="font-display text-base font-semibold">{PYR_LABEL[disiplin]}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    {gruppe.length} tester · {gruppeStats.spillere} spillere · {gruppeStats.malinger} målinger siste 30 dager
                  </div>
                </div>
                <Link
                  href={`/admin/tester?disiplin=${disiplin}`}
                  className="ml-auto font-mono text-[10.5px] font-semibold text-primary hover:underline"
                >
                  Se alle {disiplin}-tester →
                </Link>
              </div>

              {/* Test-cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {gruppe.map((t) => {
                  const s = testStats.get(t.id);
                  const spillere = spillerPerTest.get(t.id)?.size ?? 0;
                  const snittT = s && s.scores.length > 0
                    ? s.scores.reduce((a, b) => a + b, 0) / s.scores.length
                    : null;
                  const maksTeo = s && s.scores.length > 0 ? Math.max(...s.scores) : null;
                  const pctStall = maksTeo && snittT ? Math.round((snittT / maksTeo) * 100) : 0;

                  return (
                    <Link
                      key={t.id}
                      href={`/admin/tester/${t.id}`}
                      className="te-card block no-underline"
                    >
                      <div className="flex items-center gap-2">
                        <span className={BADGE_CLASS[disiplin]}>{disiplin}</span>
                        <span className="ml-auto rounded-full bg-accent/30 px-2.5 py-0.5 font-mono text-[9.5px] font-semibold text-accent-foreground">
                          Aktiv
                        </span>
                      </div>
                      <div className="font-display text-[15px] font-semibold leading-tight">{t.name}</div>
                      <div className="rounded-lg border border-border bg-background px-3 py-2">
                        <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                          Scoring
                        </div>
                        <div className="font-mono text-xs font-semibold text-foreground">{t.scoringRule}</div>
                      </div>
                      <div className="flex gap-3 font-mono text-[10px] text-muted-foreground">
                        <span><strong className="text-foreground">{spillere}</strong> spillere</span>
                        {s?.sisteDate && (
                          <span>Sist <strong className="text-foreground">{formatDate(s.sisteDate)}</strong></span>
                        )}
                      </div>
                      {snittT !== null && (
                        <>
                          <div className="te-avg-bar">
                            <div className="te-avg-bar-stall" style={{ width: `${pctStall}%` }} />
                            <div className="te-avg-bar-a1" style={{ width: `${Math.min(100 - pctStall, 30)}%` }} />
                          </div>
                          <div className="flex gap-3 font-mono text-[9.5px] text-muted-foreground">
                            <span>
                              <span className="mr-1 inline-block h-2 w-2 rounded-[2px] bg-accent align-middle" />
                              Stall {snittT.toFixed(1).replace(".", ",")}
                            </span>
                          </div>
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })
      )}

      {/* Siste resultater — liste */}
      {siste10.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Siste resultater
            </span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">Sortert: sist tatt</span>
          </div>

          {/* Filter-rad */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px]">
              <Search className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
              <input
                type="search"
                placeholder="Søk spiller eller test"
                className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                aria-label="Søk spiller eller test"
              />
            </div>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary">
              Kategori <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
            </button>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary">
              Spiller <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-3 border-b border-border bg-secondary/40 px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              <div>Spiller / test</div>
              <div>Kategori</div>
              <div>Tatt</div>
              <div>Score</div>
              <div>Rangering</div>
              <div className="w-4" />
            </div>
            <ul className="divide-y divide-border">
              {siste10.map((r) => {
                const rank = rankPill(r.score);
                return (
                  <li key={r.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/30">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                        style={{ background: avatarBg(r.user.name) }}
                        aria-hidden="true"
                      >
                        {initials(r.user.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-foreground">{r.user.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{r.test.name}</div>
                      </div>
                    </div>
                    <div>
                      <span className={`${BADGE_CLASS[r.test.pyramidArea]}`}>
                        {PYR_LABEL[r.test.pyramidArea]}
                      </span>
                    </div>
                    <div className="font-mono text-xs tabular-nums text-muted-foreground">
                      {formatDate(r.takenAt)}
                    </div>
                    <div className="font-mono text-sm font-semibold tabular-nums text-foreground">
                      {r.score.toFixed(1).replace(".", ",")}
                    </div>
                    <div>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold ${rank.cls}`}>
                        {rank.label}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      <Link href={`/admin/tester/${r.id}`}>
                        <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
