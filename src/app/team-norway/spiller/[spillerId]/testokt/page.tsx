import { notFound, redirect } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnSpillerTester, medTnSpillerData } from "@/lib/domain/tn-arbeidsflate";
import { batteritestFor } from "@/lib/portal-tester/testbatteri";
import { tnProtocol, tnVersion } from "@/lib/portal-tester/tn-catalog";
import { tnComparableResult, tnDefinitionId } from "@/lib/portal-tester/tn-integration";
import { tnFormat } from "@/lib/portal-tester/tn-scoring";
import { TnSessionSchema } from "@/lib/portal-tester/tn-session";
import { lesTestokt, skrivTestokt, testoktUtvalg } from "@/lib/portal-tester/tn-testokt";
import { ph15TnType } from "@/components/portal/precision/PH15TnTest";
import { TnIupLaastSkjerm } from "@/components/team-norway/skjermer/tn-iup-laast-skjerm";
import { TnTestoktFerdigVisning, TnTestoktStartVisning, type TestoktOppsummering } from "@/components/team-norway/skjermer/tn-testokt-visning";
import { TnTestoktTest } from "@/components/team-norway/tn-testokt-test";

export const dynamic = "force-dynamic";

/**
 * Testøkt uten testdag (utkast 3, Anders 22.10.2026, §TRACKMAN I TEAM NORWAY-TESTENE punkt 1).
 *   - uten `t`: velg tester («Start test»). Skjemaet sender `p=…` og siden lager løpet med én økt-ID per test.
 *   - `t` og `steg` < antall: testen i steget, ett slag om gangen (PH15TnTest med trenerens lagring).
 *   - `t` og `steg` = antall: oppsummering («Ferdig med løpet»), også pause.
 * Krever navngitt deling og gruppe-rolle COACH (Assist Coach leser bare). Lagringen sjekker det samme på nytt.
 */
export default async function TestoktPage({ params, searchParams }: {
  params: Promise<{ spillerId: string }>;
  searchParams: Promise<{ t?: string; steg?: string; p?: string | string[] }>;
}) {
  const [{ spillerId }, sp] = await Promise.all([params, searchParams]);
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "TALENT" });
  const data = await hentTnSpillerTester(bruker, spillerId);
  if (!data) return <TnIupLaastSkjerm bruker={bruker} spillerId={spillerId} aktiv="tester" />;
  const { tilgang } = data;
  const kanFore = !tilgang.kontekst.erSpiller && (bruker.role === "ADMIN" || tilgang.kontekst.rolle === "COACH");
  if (!kanFore) redirect(`/team-norway/spiller/${spillerId}/tester`);
  const base = `/team-norway/spiller/${spillerId}/testokt`;
  const kanVises = (p: NonNullable<ReturnType<typeof tnProtocol>>) => ph15TnType(p) !== null;

  // Skjemaet: lag løpet og send videre, så adressen kan åpnes igjen etter pause.
  const valgt = (Array.isArray(sp.p) ? sp.p : sp.p ? [sp.p] : []).filter((id, i, a) => a.indexOf(id) === i);
  if (valgt.length) {
    const t = lesTestokt(valgt.map((id) => `${id}:${crypto.randomUUID()}`).join(","));
    if (t) redirect(`${base}?t=${encodeURIComponent(skrivTestokt(t))}&steg=0`);
  }

  const lop = lesTestokt(sp.t);
  if (!lop) {
    const antall = new Map<string, number>();
    for (const r of data.rader) {
      const b = batteritestFor({ id: r.testId, name: r.protokollNavn });
      if (b) antall.set(b.id, (antall.get(b.id) ?? 0) + r.antall);
    }
    return <TnTestoktStartVisning brukerNavn={bruker.name ?? "Ukjent"} spillerId={spillerId} tilgang={tilgang} utvalg={testoktUtvalg(antall, kanVises)} feil={sp.p !== undefined || sp.t ? "Velg minst én test treneren kan føre." : undefined} />;
  }

  const lopHref = (steg: number) => `${base}?t=${encodeURIComponent(skrivTestokt(lop))}&steg=${steg}`;
  const okter = await medTnSpillerData(bruker, spillerId, async (tx) => {
    const rader = await tx.testSession.findMany({ where: { id: { in: lop.map((s) => s.sessionId) }, userId: spillerId } });
    const resultater = await tx.testResult.findMany({ where: { id: { in: rader.flatMap((r) => (r.testResultId ? [r.testResultId] : [])) }, userId: spillerId }, select: { id: true, testId: true, score: true, details: true } });
    return { rader, resultater };
  });
  if (!okter) return <TnIupLaastSkjerm bruker={bruker} spillerId={spillerId} aktiv="tester" />;

  const steg = Math.max(0, Math.min(lop.length, Number.parseInt(sp.steg ?? "0", 10) || 0));
  if (steg === lop.length) {
    const tester: TestoktOppsummering[] = lop.map((s, i) => {
      const p = tnProtocol(s.protokollId)!;
      const rad = okter.rader.find((r) => r.id === s.sessionId);
      const res = rad?.testResultId ? okter.resultater.find((r) => r.id === rad.testResultId) : undefined;
      const sammenlignbar = res ? tnComparableResult(res.testId, res.score, res.details) : null;
      const status = (rad?.status ?? "IKKE_STARTET") as TestoktOppsummering["status"];
      return {
        navn: p.name,
        status,
        resultat: sammenlignbar?.metrics[0] ? tnFormat(sammenlignbar.metrics[0]) : null,
        href: status === "COMPLETED" ? `/team-norway/spiller/${spillerId}/tester/${tnDefinitionId(p)}` : lopHref(i),
      };
    });
    return <TnTestoktFerdigVisning brukerNavn={bruker.name ?? "Ukjent"} spillerId={spillerId} tilgang={tilgang} tester={tester} />;
  }

  const naa = lop[steg]!;
  const p = tnProtocol(naa.protokollId);
  if (!p || !kanVises(p)) notFound();
  const rad = okter.rader.find((r) => r.id === naa.sessionId);
  const state = rad ? TnSessionSchema.safeParse(rad.scoringData) : null;
  const initial = rad && state?.success && state.data.protocolId === p.id && state.data.version === tnVersion(p) && state.data.count === p.rows.length
    ? { sessionId: rad.id, revision: state.data.revision, values: state.data.values, notes: state.data.notes, status: rad.status }
    : undefined;
  if (rad && !initial) notFound();
  const res = rad?.testResultId ? okter.resultater.find((r) => r.id === rad.testResultId) : undefined;
  const lagret = res ? tnComparableResult(res.testId, res.score, res.details) ?? undefined : undefined;
  const siste = steg === lop.length - 1;
  return (
    <TnTestoktTest
      key={naa.sessionId}
      spillerId={spillerId}
      protocol={p}
      initial={initial}
      lagretResultat={lagret}
      sessionId={naa.sessionId}
      kontekst={`Testøkt · ${tilgang.spillerNavn} · Test ${steg + 1} av ${lop.length}`}
      pauseHref={lopHref(lop.length)}
      nesteHref={lopHref(steg + 1)}
      nesteTekst={siste ? "Ferdig med løpet" : "Neste test"}
    />
  );
}
