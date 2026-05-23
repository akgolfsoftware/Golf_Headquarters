/**
 * PlayerHQ · Tren · Test-detalj for spiller
 *
 * Design: 05 Tester-modul.html · Skjerm 4 (Spiller-detalj) + Test-detalj CMJ.html
 * 3 progress-rings + historikk-line-graf + kvartil-plot
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList, Info, Table2, BarChart3 } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";
import "@/components/tester/tester.css";
import { Scorekort } from "./scorekort";

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slagteknikk",
  SPILL: "Spillforståelse",
  TURN: "Turneringsmodus",
};

const BADGE_CLASS: Record<PyramidArea, string> = {
  FYS:   "te-badge te-badge-fys",
  TEK:   "te-badge te-badge-tek",
  SLAG:  "te-badge te-badge-slag",
  SPILL: "te-badge te-badge-spill",
  TURN:  "te-badge te-badge-turn",
};

type Protocol = {
  totalShots: number;
  shots: Array<{ nr: number; label: string; target?: number; category?: string }>;
  inputFields: Array<{ key: string; label: string; unit: string }>;
  scoring: string;
  scoringDescription: string;
};

/** Konverterer score 0-100 til SVG stroke-dashoffset for r=42 sirkel (omfang ≈ 263.9) */
function ringOffset(pct: number): number {
  const circumference = 2 * Math.PI * 42;
  return circumference * (1 - Math.max(0, Math.min(1, pct / 100)));
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

export default async function TestDetaljSpillerPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const user = await requirePortalUser();
  const { testId } = await params;

  const test = await prisma.testDefinition.findUnique({ where: { id: testId } });
  if (!test) notFound();

  const resultater = await prisma.testResult.findMany({
    where: { userId: user.id, testId: test.id },
    orderBy: { takenAt: "asc" },
  });

  const rawProtocol = test.protocol as unknown as
    | (Protocol & { steps?: unknown; equipment?: string[]; expectedDurationMin?: number; pgaBenchmark?: string })
    | null;
  // Ny NGF-protokoll har 'steps', gammel har 'shots'. Bruk Scorekort kun for gammel.
  const protocol: Protocol | null =
    rawProtocol && Array.isArray((rawProtocol as { shots?: unknown[] }).shots)
      ? (rawProtocol as Protocol)
      : null;
  const newProtocol =
    rawProtocol && Array.isArray((rawProtocol as { steps?: unknown[] }).steps)
      ? rawProtocol
      : null;

  // Beregn nøkkeltall
  const scores = resultater.map((r) => r.score);
  const minScore = scores.length ? Math.min(...scores) : 0;
  const maxScore = scores.length ? Math.max(...scores) : 100;
  const span = Math.max(maxScore - minScore, 1);

  const snitt = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const best = scores.length > 0 ? maxScore : 0;
  const siste = resultater.length > 0 ? resultater[resultater.length - 1] : null;

  // Delta mot forrige
  const delta = resultater.length >= 2
    ? resultater[resultater.length - 1].score - resultater[resultater.length - 2].score
    : null;

  // "Percentil" — her bruker vi kohort fra alle spillere som har tatt testen
  const alleResultaterForTest = await prisma.testResult.findMany({
    where: { testId: test.id },
    select: { score: true },
    orderBy: { takenAt: "desc" },
  });

  // Beregn percentil (prosentandel som scorer lavere enn siste resultat)
  let percentil: number | null = null;
  if (siste && alleResultaterForTest.length > 1) {
    const lavere = alleResultaterForTest.filter((r) => r.score < siste.score).length;
    percentil = Math.round((lavere / alleResultaterForTest.length) * 100);
  }

  // Ring-verdier (normalisert 0-100)
  // Siste måling: prosent av beste (personlig)
  const sistePct = best > 0 && siste ? Math.round((siste.score / best) * 100) : 0;
  // Snitt-prosent
  const snittPct = best > 0 ? Math.round((snitt / best) * 100) : 0;
  // (progresjonsprosent brukes evt. i fremtidig ring 3 — placeholder)

  const navnOrd = test.name.trim().split(" ");
  const titleItalic = navnOrd.length > 1 ? navnOrd[navnOrd.length - 1] : test.name;
  const titleLead = navnOrd.length > 1 ? navnOrd.slice(0, -1).join(" ") : undefined;

  // For kvartil-plot: finn min/median/maks for kohort
  const kohortScores = alleResultaterForTest.map((r) => r.score).sort((a, b) => a - b);
  const q1 = kohortScores.length > 0 ? kohortScores[Math.floor(kohortScores.length * 0.25)] : 0;
  const median = kohortScores.length > 0 ? kohortScores[Math.floor(kohortScores.length * 0.5)] : 0;
  const q3 = kohortScores.length > 0 ? kohortScores[Math.floor(kohortScores.length * 0.75)] : 0;
  const kohortMin = kohortScores[0] ?? 0;
  const kohortMax = kohortScores[kohortScores.length - 1] ?? 100;
  const plotSpan = Math.max(kohortMax - kohortMin, 1);

  // SVG x-posisjon (0-560 range)
  function plotX(v: number): number {
    return 20 + ((v - kohortMin) / plotSpan) * 560;
  }

  return (
    <div className="space-y-8">
      <Link
        href="/portal/tren/tester"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Alle tester
      </Link>

      {/* Hero */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className={`${BADGE_CLASS[test.pyramidArea]} mb-2`}>
            {PYR_LABEL[test.pyramidArea]}
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            {titleLead && <>{titleLead} </>}
            <em className="font-serif italic font-normal text-primary">{titleItalic}</em>
          </h1>
          {test.description && (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {test.description}
            </p>
          )}
        </div>
        <Link
          href={`/portal/test/${test.id}/live`}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Start test
        </Link>
      </div>

      {/* 3 progress-rings */}
      {resultater.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Ring 1: Siste vs beste */}
          <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5">
            <div className="te-ring-wrap shrink-0">
              <svg viewBox="0 0 100 100" className="te-ring-svg" aria-hidden="true">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="hsl(var(--accent))" strokeWidth="8"
                  strokeDasharray="263.9"
                  strokeDashoffset={ringOffset(sistePct)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="te-ring-label font-mono tabular-nums text-foreground">
                {siste!.score.toFixed(0)}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Siste måling
              </div>
              <div className="mt-1 font-mono text-2xl font-semibold tabular-nums leading-none text-foreground">
                {siste!.score.toFixed(1).replace(".", ",")}
              </div>
              <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                {formatDate(siste!.takenAt)}
              </div>
              {delta !== null && (
                <div className={`mt-1 font-mono text-[11px] font-semibold ${delta >= 0 ? "text-primary" : "text-destructive"}`}>
                  {delta >= 0 ? "+" : ""}{delta.toFixed(1).replace(".", ",")} mot forrige
                </div>
              )}
            </div>
          </div>

          {/* Ring 2: Beste (PR) */}
          <div className="flex items-center gap-4 rounded-lg border border-accent/40 bg-accent/10 p-5">
            <div className="te-ring-wrap shrink-0">
              <svg viewBox="0 0 100 100" className="te-ring-svg" aria-hidden="true">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,88,64,0.15)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="8"
                  strokeDasharray="263.9"
                  strokeDashoffset={ringOffset(100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="te-ring-label font-mono tabular-nums text-primary">
                {best.toFixed(0)}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Personlig rekord
              </div>
              <div className="mt-1 font-mono text-2xl font-semibold tabular-nums leading-none text-foreground">
                {best.toFixed(1).replace(".", ",")}
              </div>
              <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                {resultater.length} forsøk totalt
              </div>
            </div>
          </div>

          {/* Ring 3: Snitt / percentil */}
          <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5">
            <div className="te-ring-wrap shrink-0">
              <svg viewBox="0 0 100 100" className="te-ring-svg" aria-hidden="true">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="hsl(var(--foreground))" strokeWidth="8"
                  strokeDasharray="263.9"
                  strokeDashoffset={ringOffset(snittPct)}
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </svg>
              <div className="te-ring-label font-mono tabular-nums text-foreground">
                {snitt.toFixed(0)}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Snitt
              </div>
              <div className="mt-1 font-mono text-2xl font-semibold tabular-nums leading-none text-foreground">
                {snitt.toFixed(1).replace(".", ",")}
              </div>
              {percentil !== null && (
                <div className="mt-1 font-mono text-[11px] text-primary font-semibold">
                  {percentil}. percentil (n={alleResultaterForTest.length})
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Forklaring */}
      {test.description && (
        <section className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Info size={16} strokeWidth={1.5} className="text-muted-foreground" />
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Forklaring
            </span>
          </div>
          <div className="mt-4 rounded-md bg-secondary/40 px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Scoring
            </span>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {test.scoringRule}
            </p>
          </div>
          {protocol && (
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span><strong className="text-foreground">{protocol.totalShots}</strong> slag totalt</span>
              {protocol.inputFields.map((f) => (
                <span key={f.key}>{f.label} ({f.unit})</span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Ny NGF-protokoll: vis info + live-test-CTA */}
      {newProtocol && (
        <section className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table2 size={16} strokeWidth={1.5} className="text-muted-foreground" />
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Protokoll
              </span>
            </div>
            {newProtocol.expectedDurationMin != null && (
              <span className="font-mono text-[11px] text-muted-foreground">
                ~{newProtocol.expectedDurationMin} min
              </span>
            )}
          </div>

          <ol className="mt-4 space-y-3">
            {(newProtocol.steps as Array<{ id: string; label: string; instruction: string; shots: number; target?: string }>).map((s, i) => (
              <li key={s.id} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="font-display text-sm font-semibold text-foreground">{s.label}</h4>
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      {s.shots} slag
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.instruction}</p>
                  {s.target && (
                    <span className="mt-1.5 inline-block rounded-full bg-secondary px-2.5 py-0.5 font-mono text-[10px] font-semibold text-foreground">
                      Mål: {s.target}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {Array.isArray(newProtocol.equipment) && newProtocol.equipment.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                Utstyr
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {newProtocol.equipment.map((e: string) => (
                  <span
                    key={e}
                    className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-foreground"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}

          {newProtocol.pgaBenchmark && (
            <div className="mt-4 rounded-lg bg-accent/10 px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-accent-foreground">
                PGA Benchmark
              </span>
              <p className="mt-1 text-sm text-foreground">{newProtocol.pgaBenchmark}</p>
            </div>
          )}

          <Link
            href={`/portal/test/${test.id}/live`}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
          >
            Start test →
          </Link>
        </section>
      )}

      {/* Gammel Scorekort (legacy) */}
      {!newProtocol && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Table2 size={16} strokeWidth={1.5} className="text-muted-foreground" />
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Scorekort — Ta testen
            </span>
          </div>
          {protocol ? (
            <Scorekort testId={test.id} protocol={protocol} />
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card/40 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Denne testen har ikke et digitalt scorekort ennå. Kontakt coach for å registrere resultat manuelt.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Historikk-line-graf */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} strokeWidth={1.5} className="text-muted-foreground" />
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Min historikk
          </span>
          {resultater.length > 0 && (
            <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
              {resultater.length} forsøk
            </span>
          )}
        </div>

        {resultater.length === 0 ? (
          <div className="mt-6">
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <ClipboardList size={28} strokeWidth={1.5} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Ingen forsøk ennå. Fyll inn scorekortet over for å registrere ditt første forsøk.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Linje-graf */}
            <div className="mt-4 h-40 w-full overflow-hidden rounded-lg border border-border bg-secondary/20">
              <svg viewBox="0 0 600 120" className="h-full w-full" preserveAspectRatio="none">
                {/* Bakgrunnslinje for snitt */}
                <line
                  x1="0" y1={100 - ((snitt - minScore) / span) * 80 - 10}
                  x2="600" y2={100 - ((snitt - minScore) / span) * 80 - 10}
                  stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 3"
                />
                {/* Fyllt areal */}
                {resultater.length > 1 && (
                  <path
                    d={[
                      `M 0 120`,
                      ...resultater.map((r, i) => {
                        const x = (i / (resultater.length - 1)) * 600;
                        const y = 100 - ((r.score - minScore) / span) * 80 - 10;
                        return `L ${x} ${y}`;
                      }),
                      `L 600 120 Z`,
                    ].join(" ")}
                    fill="hsl(var(--primary))"
                    opacity="0.08"
                  />
                )}
                {/* Linje */}
                {resultater.map((r, i) => {
                  if (i === 0) return null;
                  const prev = resultater[i - 1];
                  const x1 = ((i - 1) / Math.max(resultater.length - 1, 1)) * 600;
                  const x2 = (i / Math.max(resultater.length - 1, 1)) * 600;
                  const y1 = 100 - ((prev.score - minScore) / span) * 80 - 10;
                  const y2 = 100 - ((r.score - minScore) / span) * 80 - 10;
                  return (
                    <line
                      key={r.id}
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round"
                    />
                  );
                })}
                {/* Punkter */}
                {resultater.map((r, i) => {
                  const x = (i / Math.max(resultater.length - 1, 1)) * 600;
                  const y = 100 - ((r.score - minScore) / span) * 80 - 10;
                  const isSiste = i === resultater.length - 1;
                  return (
                    <circle
                      key={r.id}
                      cx={x} cy={y} r={isSiste ? 5 : 3.5}
                      fill={isSiste ? "hsl(var(--accent))" : "hsl(var(--primary))"}
                      stroke={isSiste ? "hsl(var(--primary))" : "none"}
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Resultatliste */}
            <ul className="mt-4 divide-y divide-border">
              {[...resultater].reverse().slice(0, 8).map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {formatDate(r.takenAt)}
                    </div>
                    {r.notes && (
                      <div className="mt-0.5 text-xs italic text-muted-foreground">{r.notes}</div>
                    )}
                  </div>
                  <div className="font-display text-lg font-semibold tabular-nums text-foreground">
                    {r.score.toFixed(1).replace(".", ",")}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* Kvartil-plot mot kohort */}
      {kohortScores.length > 3 && siste && (
        <section className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-1 font-display text-base font-semibold">
            Kvartil-plot — deg vs alle
          </h3>
          <p className="mb-4 font-mono text-[10.5px] text-muted-foreground">
            {kohortScores.length} målinger totalt · grønn sirkle = din siste
          </p>
          <svg viewBox="0 0 600 80" className="h-20 w-full" aria-label="Kvartil-plot">
            {/* Base-linje */}
            <line x1="20" y1="40" x2="580" y2="40" stroke="hsl(var(--border))" strokeWidth="1" />
            {/* Whiskers */}
            <line x1={plotX(kohortMin)} y1="40" x2={plotX(q1)} y2="40" stroke="hsl(var(--primary))" strokeWidth="2" />
            <line x1={plotX(kohortMin)} y1="34" x2={plotX(kohortMin)} y2="46" stroke="hsl(var(--primary))" strokeWidth="2" />
            <line x1={plotX(q3)} y1="40" x2={plotX(kohortMax)} y2="40" stroke="hsl(var(--primary))" strokeWidth="2" />
            <line x1={plotX(kohortMax)} y1="34" x2={plotX(kohortMax)} y2="46" stroke="hsl(var(--primary))" strokeWidth="2" />
            {/* IQR boks */}
            <rect
              x={plotX(q1)} y="24" width={plotX(q3) - plotX(q1)} height="32"
              fill="hsl(var(--primary))" fillOpacity="0.6" rx="3"
            />
            {/* Median */}
            <line x1={plotX(median)} y1="22" x2={plotX(median)} y2="58" stroke="hsl(var(--accent))" strokeWidth="3" />
            {/* Deg */}
            <circle
              cx={plotX(siste.score)} cy="40" r="12"
              fill="hsl(var(--accent))" stroke="hsl(var(--primary))" strokeWidth="2"
            />
            <text
              x={plotX(siste.score)} y="44"
              textAnchor="middle"
              fontFamily="var(--font-jetbrains-mono, monospace)"
              fontSize="9" fontWeight="700"
              fill="hsl(var(--accent-foreground))"
            >
              {siste.score.toFixed(0)}
            </text>
            {/* Labels */}
            <text x={plotX(kohortMin)} y="68" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="hsl(var(--muted-foreground))">
              min {kohortMin.toFixed(0)}
            </text>
            <text x={plotX(median)} y="68" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="hsl(var(--muted-foreground))">
              median {median.toFixed(0)}
            </text>
            <text x={plotX(kohortMax)} y="68" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="hsl(var(--muted-foreground))">
              maks {kohortMax.toFixed(0)}
            </text>
          </svg>
        </section>
      )}
    </div>
  );
}
