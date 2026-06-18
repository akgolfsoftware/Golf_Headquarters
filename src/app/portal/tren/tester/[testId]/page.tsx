/**
 * PlayerHQ · Trening · Tester · Detalj (/portal/tren/tester/[testId]).
 *
 * Header (pyramide-chip m/ pyr-fargedot + navn + description som lead) →
 *   SLIK GJENNOMFØRES TESTEN: protokoll-steg (label / mål / antall slag)
 *   zod-parset fra protocol — uten protocol vises scoringRule + NGF-lenke →
 *   SLIK SCORES DEN: accent-kort (scoringRule + scoringDescription + enhet) →
 *   DIN HISTORIKK: alle egne resultater, nyeste først, trend ↑/↓ mot forrige →
 *   referanse-rad (formel ikke låst — aldri fasit-tall) →
 *   [Start test] → gjennomfor/ + sekundær NGF-lenke.
 *
 * `?lagret=1` viser grønn kvittering + «Del med coach»-lenke.
 * Server component. Auth + datahenting beholdt (requirePortalUser + Prisma).
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck, ExternalLink, Play, Ruler, Share2 } from "lucide-react";
import type { PyramidArea } from "@/generated/prisma/client";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { testTilgangWhere } from "@/lib/portal-tester/test-tilgang";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { SetGroup, SetRow, SetVal } from "@/components/portal/meg/meg-sub";
import { parseProtocol, type ScorekortForsok } from "@/lib/portal-tester/protocol";
import { parseForScoring, lavereErBedre } from "@/lib/portal-tester/test-scoring";

/** Grupper forsøk på label → steg-liste (erstatter gamle protokollSteg). */
function grupperSteg(
  forsok: ScorekortForsok[],
): { label: string; antall: number; target: string | null }[] {
  const m = new Map<string, { label: string; antall: number; target: string | null }>();
  for (const f of forsok) {
    const ex = m.get(f.label);
    if (ex) ex.antall += 1;
    else m.set(f.label, { label: f.label, antall: 1, target: f.target ?? null });
  }
  return [...m.values()];
}

export const dynamic = "force-dynamic";

const NGF_URL = "https://www.golfforbundet.no/spiller/toppidrett/skjemaer";

/** Pyramide-chip per område — pyr-tokens fra globals.css, aldri hex. */
const OMRADE: Record<PyramidArea, { label: string; dot: string }> = {
  FYS: { label: "Fysisk", dot: "bg-pyr-fys" },
  TEK: { label: "Teknisk", dot: "bg-pyr-tek" },
  SLAG: { label: "Golfslag", dot: "bg-pyr-slag" },
  SPILL: { label: "Spill", dot: "bg-pyr-spill" },
  TURN: { label: "Turnering", dot: "bg-pyr-turn" },
};

/** Norsk tall-format: maks 2 desimaler, komma som desimalskille. */
function fmtNum(n: number): string {
  return (Math.round(n * 100) / 100).toLocaleString("nb-NO", { maximumFractionDigits: 2 });
}

function fmtDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

export default async function TestDetaljSpillerPage({
  params,
  searchParams,
}: {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ lagret?: string }>;
}) {
  const user = await requirePortalUser();
  const [{ testId }, sp] = await Promise.all([params, searchParams]);
  const lagret = sp.lagret === "1";

  // Tilgang: samme regel som katalogen — andres private tester gir 404 (K6).
  const test = await prisma.testDefinition.findFirst({
    where: { id: testId, AND: [testTilgangWhere(user.id)] },
  });
  if (!test) notFound();

  const resultater = await prisma.testResult.findMany({
    where: { userId: user.id, testId },
    orderBy: { takenAt: "desc" },
    select: { id: true, score: true, takenAt: true },
  });

  const spec = parseProtocol(test.protocol);
  const scoringSpec = parseForScoring(test.protocol);
  const steg = spec ? grupperSteg(spec.forsok) : [];
  const enhet = scoringSpec.unit;
  // Retning fra scoring-typen (motoren). Ukjent (fallback/uten protokoll) → nøytral trend.
  const lavere = scoringSpec.kind === "fallback" ? null : lavereErBedre(scoringSpec.kind);
  const omrade = OMRADE[test.pyramidArea];

  const metaBiter = [
    steg.length > 0 ? `${steg.length} ${steg.length === 1 ? "øvelse" : "øvelser"}` : null,
    enhet ? `Enhet ${enhet}` : null,
    resultater.length > 0
      ? `${resultater.length} ${resultater.length === 1 ? "resultat" : "resultater"}`
      : null,
  ].filter((b): b is string => b !== null);

  return (
    <div className="mx-auto w-full max-w-[460px] px-1 pb-8 pt-3 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6">
      {lagret && (
        <div className="mb-5 rounded-xl border border-success/30 bg-success/10 px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-success">
              <CircleCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
              Test fullført
            </span>
            <Link
              href="/portal/coach/melding"
              className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-success underline decoration-success/40 underline-offset-4 hover:decoration-success"
            >
              <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              Del med coach
            </Link>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-success">Resultat lagret</p>
        </div>
      )}

      <div className="mb-[18px]">
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
          <span className={`h-2 w-2 shrink-0 rounded-full ${omrade.dot}`} aria-hidden />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground">
            {omrade.label}
          </span>
        </span>
        <h1 className="mt-3 font-display text-[26px] font-bold leading-[1.04] tracking-[-0.025em] text-foreground md:text-[30px]">
          {test.name}
        </h1>
        {metaBiter.length > 0 && (
          <p className="mt-2.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
            {metaBiter.join(" · ")}
          </p>
        )}
        {test.description && (
          <p className="mt-2.5 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
            {test.description}
          </p>
        )}
      </div>

      <div className="max-w-[680px]">
        <SetGroup label="SLIK GJENNOMFØRES TESTEN">
          {steg.length > 0 ? (
            steg.map((s) => (
              <SetRow
                key={s.label}
                title={s.label}
                meta={s.target != null ? `Mål ${s.target}` : undefined}
                right={<SetVal>× {s.antall}</SetVal>}
              />
            ))
          ) : (
            <div className="px-[18px] py-[15px]">
              <p className="text-sm leading-relaxed text-foreground">{test.scoringRule}</p>
              <a
                href={NGF_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-2.5 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-primary"
              >
                Protokoller hos NGF
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              </a>
            </div>
          )}
        </SetGroup>

        <div className="mb-[22px]">
          <div className="mb-2 mt-1 flex items-baseline justify-between pt-2">
            <AthleticEyebrow>Slik scores den</AthleticEyebrow>
          </div>
          <div className="rounded-xl border border-border border-l-[3px] border-l-accent bg-card px-4 py-3.5">
            <p className="text-[13px] leading-[1.55] text-foreground">{test.scoringRule}</p>
            {enhet && (
              <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                Enhet: {enhet}
              </p>
            )}
          </div>
        </div>

        <SetGroup label="DIN HISTORIKK">
          {resultater.length === 0 ? (
            <p className="px-[18px] py-6 text-center text-sm text-muted-foreground">
              Ingen resultater ennå. Ta testen for å starte historikken.
            </p>
          ) : (
            <div className="flex items-center justify-between border-b border-border px-[18px] py-2.5 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              <span>Resultat</span>
              <span>Endring</span>
            </div>
          )}
          {resultater.length > 0 &&
            resultater.map((r, i) => {
              const forrige = resultater[i + 1] ?? null;
              let trend: { tekst: string; klass: string } | null = null;
              if (forrige) {
                const diff = r.score - forrige.score;
                if (diff === 0) {
                  trend = { tekst: "± 0", klass: "text-muted-foreground" };
                } else {
                  const pil = diff > 0 ? "↑" : "↓";
                  const bedre = lavere == null ? null : lavere ? diff < 0 : diff > 0;
                  trend = {
                    tekst: `${pil} ${diff > 0 ? "+" : "−"}${fmtNum(Math.abs(diff))}`,
                    klass:
                      bedre == null
                        ? "text-muted-foreground"
                        : bedre
                          ? "text-success"
                          : "text-destructive",
                  };
                }
              }
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3.5 border-b border-border px-[18px] py-[15px] last:border-b-0"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[15px] font-semibold tracking-[-0.01em] text-foreground">
                      {fmtNum(r.score)}
                      {enhet && (
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          {enhet}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
                      {fmtDato(r.takenAt)}
                    </span>
                  </span>
                  {trend ? (
                    <span className={`shrink-0 font-mono text-xs font-semibold ${trend.klass}`}>
                      {trend.tekst}
                    </span>
                  ) : (
                    <SetVal>Første</SetVal>
                  )}
                </div>
              );
            })}
        </SetGroup>

        <div className="mb-[22px] flex items-center gap-3 rounded-xl border border-dashed border-border bg-card px-4 py-3.5">
          <Ruler className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          <p className="text-[13px] leading-[1.55] text-muted-foreground">
            {test.pyramidArea === "FYS"
              ? "Referanseverdier kommer — FYS-resultatformelen er ikke låst ennå."
              : "Referanseverdier: kommer (formel ikke låst)."}
          </p>
        </div>

        <Link
          href={`/portal/tren/tester/${test.id}/gjennomfor`}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Play className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Start test
        </Link>

        <div className="mt-3 flex justify-center">
          <a
            href={NGF_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-4 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Protokoller hos NGF
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          </a>
        </div>
      </div>
    </div>
  );
}
