/**
 * PlayerHQ Test-detalj — v2. Protokoll-steg (zod-parset fra protocol),
 * scoring-regel, egen historikk med trend mot forrige, og Start test.
 * Auth + datahenting beholdt 1:1 (requirePortalUser + Prisma + testTilgangWhere).
 * `?lagret=1` viser kvittering + «Del med coach».
 * «?»-regelen: pyramide-akse forklares via pyramideAkse, historikk via testbatteri.
 * Referanse-rad: formel ikke låst — aldri fasit-tall.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import type { PyramidArea } from "@/generated/prisma/client";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { testTilgangWhere } from "@/lib/portal-tester/test-tilgang";
import { parseProtocol, type ScorekortForsok } from "@/lib/portal-tester/protocol";
import { parseForScoring, lavereErBedre } from "@/lib/portal-tester/test-scoring";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import {
  Tittel,
  Kort,
  Rad,
  CTAPill,
  StatusPill,
  MikroMeta,
  TomTilstand,
  AkseChip,
  HjelpTips, TilbakeLenke } from "@/components/v2";

/** Grupper forsøk på label → steg-liste. */
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
  const akse = test.pyramidArea as PyramidArea;

  const metaBiter = [
    steg.length > 0 ? `${steg.length} ${steg.length === 1 ? "øvelse" : "øvelser"}` : null,
    enhet ? `Enhet ${enhet}` : null,
    resultater.length > 0
      ? `${resultater.length} ${resultater.length === 1 ? "resultat" : "resultater"}`
      : null,
  ].filter((b): b is string => b !== null);

  return (
    <V2Shell aktiv="gjor" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/tren/tester">Tester</TilbakeLenke>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {lagret && (
          <Kort tint pad="14px 18px">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <StatusPill tone="up">Test fullført · resultat lagret</StatusPill>
              <Link href="/portal/coach/melding" style={{ textDecoration: "none" }}>
                <MikroMeta icon="send">Del med coach</MikroMeta>
              </Link>
            </div>
          </Kort>
        )}

        {/* Hode */}
        <div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <AkseChip a={akse} />
            <HjelpTips k="pyramideAkse" size={11} />
          </span>
          <div style={{ marginTop: 10 }}>
            <Tittel>{test.name}</Tittel>
          </div>
          {metaBiter.length > 0 && (
            <p style={{ fontFamily: T.mono, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut, margin: "10px 0 0" }}>
              {metaBiter.join(" · ")}
            </p>
          )}
          {test.description && (
            <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.6, maxWidth: "62ch", margin: "10px 0 0" }}>
              {test.description}
            </p>
          )}
        </div>

        {/* Slik gjennomføres testen */}
        <Kort eyebrow="Slik gjennomføres testen" pad={steg.length > 0 ? "14px 18px" : undefined}>
          {steg.length > 0 ? (
            steg.map((s, i) => (
              <Rad
                key={s.label}
                last={i === steg.length - 1}
                title={s.label}
                sub={s.target != null ? `Mål ${s.target}` : undefined}
                trailing={
                  <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
                    × {s.antall}
                  </span>
                }
              />
            ))
          ) : (
            <div>
              <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, lineHeight: 1.6, margin: 0 }}>
                {test.scoringRule}
              </p>
              <a href={NGF_URL} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "inline-block", marginTop: 10 }}>
                <MikroMeta icon="external-link">Protokoller hos NGF</MikroMeta>
              </a>
            </div>
          )}
        </Kort>

        {/* Slik scores den */}
        <Kort tint eyebrow="Slik scores den">
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, lineHeight: 1.6, margin: 0 }}>
            {test.scoringRule}
          </p>
          {enhet && (
            <p style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, margin: "8px 0 0" }}>
              Enhet: {enhet}
            </p>
          )}
        </Kort>

        {/* Din historikk */}
        <Kort
          eyebrow={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Din historikk <HjelpTips k="testbatteri" size={11} />
            </span>
          }
        >
          {resultater.length === 0 ? (
            <TomTilstand
              icon="list"
              title="Ingen resultater ennå"
              sub="Ta testen for å starte historikken."
            />
          ) : (
            resultater.map((r, i) => {
              const forrige = resultater[i + 1] ?? null;
              let trendTekst = "Første";
              let trendFarge: string = T.mut;
              if (forrige) {
                const diff = r.score - forrige.score;
                if (diff === 0) {
                  trendTekst = "± 0";
                } else {
                  const pil = diff > 0 ? "↑" : "↓";
                  const bedre = lavere == null ? null : lavere ? diff < 0 : diff > 0;
                  trendTekst = `${pil} ${diff > 0 ? "+" : "−"}${fmtNum(Math.abs(diff))}`;
                  trendFarge = bedre == null ? T.mut : bedre ? T.up : T.down;
                }
              }
              return (
                <Rad
                  key={r.id}
                  last={i === resultater.length - 1}
                  title={
                    <span style={{ fontFamily: T.mono, fontVariantNumeric: "tabular-nums" }}>
                      {fmtNum(r.score)}
                      {enhet && <span style={{ fontSize: 11, fontWeight: 400, color: T.mut }}> {enhet}</span>}
                    </span>
                  }
                  sub={fmtDato(r.takenAt)}
                  trailing={
                    <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 600, color: trendFarge }}>
                      {trendTekst}
                    </span>
                  }
                />
              );
            })
          )}
        </Kort>

        {/* Referanse — formel ikke låst, aldri fasit-tall */}
        <Kort pad="14px 18px">
          <MikroMeta icon="info">
            {test.pyramidArea === "FYS"
              ? "Referanseverdier kommer — FYS-resultatformelen er ikke låst ennå."
              : "Referanseverdier: kommer (formel ikke låst)."}
          </MikroMeta>
        </Kort>

        {/* Handlinger */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Link href={`/portal/tren/tester/${test.id}/gjennomfor`} style={{ textDecoration: "none" }}>
            <CTAPill icon="play">Start test</CTAPill>
          </Link>
          <a href={NGF_URL} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <CTAPill ghost icon="external-link">
              Protokoller hos NGF
            </CTAPill>
          </a>
        </div>
      </div>
    </V2Shell>
  );
}
