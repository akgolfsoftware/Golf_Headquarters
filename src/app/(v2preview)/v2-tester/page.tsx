/**
 * v2-forhåndsvisning — PlayerHQ Tester (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), TesterV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt fra den ekte siden (src/app/portal/tren/tester):
 *   - loadTesterScreen  → scorekort-seksjoner, dekning, fremgang, innsikt
 *   - TestAssignment    → «Tildelt deg»
 *   - TestResult (logg) → «Resultater over tid» (Historikk-fanen)
 *
 * All mapping til TesterV2Data skjer her (serverside) så klientkomponenten er
 * ren presentasjon. Ingen fabrikkerte tall — mangler i schemaet vises ærlig.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadTesterScreen } from "@/lib/portal-tester/tester-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TesterV2, type TesterV2Data, type EndringVerdi } from "@/components/portal/v2/TesterV2";

export const dynamic = "force-dynamic";

const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

/** Norsk tall-format: maks 2 desimaler, komma som desimalskille. */
function fmtNum(n: number): string {
  return (Math.round(n * 100) / 100).toLocaleString("nb-NO", { maximumFractionDigits: 2 });
}

function dateLabel(d: Date): string {
  return `${d.getDate()}. ${MND_KORT[d.getMonth()]}`;
}

/** Heuristikk (speiler tester-data.tsx): tid/avvik/spredning = lavere er bedre. */
function deriveLowerIsBetter(scoringRule: string): boolean {
  const t = scoringRule.toLowerCase();
  return /(spredning|avvik|sekund|\bsek\b|\bs\b|\btid\b|dispersion|spread|deviation|sideavvik|laser)/.test(t);
}

/** Endring mellom to målinger → fortegns-tekst + tone (mennesket avgjør). */
function endringAv(current: number, previous: number, lowerIsBetter: boolean): EndringVerdi {
  const raw = current - previous;
  const improved = lowerIsBetter ? raw < 0 : raw > 0;
  const worsened = lowerIsBetter ? raw > 0 : raw < 0;
  const sign = raw > 0 ? "+" : raw < 0 ? "−" : "±";
  return {
    text: `${sign}${fmtNum(Math.abs(raw))}`,
    tone: improved ? "pos" : worsened ? "neg" : "flat",
  };
}

export default async function V2TesterPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [screen, tildelinger, resultater] = await Promise.all([
    loadTesterScreen({ id: user.id, name: user.name, hcp: user.hcp, tier: user.tier }),
    prisma.testAssignment.findMany({
      where: { playerId: user.id, status: "OPEN" },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      take: 6,
      select: {
        id: true,
        dueDate: true,
        note: true,
        test: { select: { name: true } },
        coach: { select: { name: true } },
      },
    }),
    // Kronologisk logg for Historikk-fanen. asc → beregn endring per test, snu til desc.
    prisma.testResult.findMany({
      where: { userId: user.id },
      orderBy: { takenAt: "asc" },
      select: {
        score: true,
        takenAt: true,
        test: { select: { name: true, scoringRule: true } },
      },
    }),
  ]);

  // ── Scorekort-seksjoner: kun tester med minst ett resultat ────────
  const seksjoner: TesterV2Data["seksjoner"] = screen.groups
    .map((g) => ({
      label: g.label,
      rader: g.rows
        .filter((r) => r.attempts > 0)
        .map((r) => ({
          test: r.name,
          res: r.latest,
          forrige: r.history.length >= 2 ? fmtNum(r.history[r.history.length - 2]) : null,
          endring: r.delta ? { text: r.delta.text, tone: r.delta.tone } : null,
        })),
    }))
    .filter((s) => s.rader.length > 0);

  // ── Fremgang: tester som ble bedre / har to+ målinger ─────────────
  const alleRader = screen.groups.flatMap((g) => g.rows.filter((r) => r.attempts > 0));
  const medEndring = alleRader.filter((r) => r.delta != null);
  const improvedCount = medEndring.filter((r) => r.delta!.tone === "pos").length;

  // ── Innsikt: mest forbedrede test (reell endring fra history) ─────
  let innsikt: string | null = null;
  let bestGain = 0;
  for (const r of alleRader) {
    if (r.delta?.tone !== "pos" || r.history.length < 2) continue;
    const prev = r.history[r.history.length - 2];
    const last = r.history[r.history.length - 1];
    const gain = Math.abs(last - prev);
    if (gain > bestGain) {
      bestGain = gain;
      innsikt = `${r.name} gikk fra ${fmtNum(prev)} til ${fmtNum(last)} siden forrige måling — den sterkeste fremgangen din.`;
    }
  }

  // ── Tildelt deg ───────────────────────────────────────────────────
  const kommende = tildelinger.map((a) => ({
    d: a.dueDate ? dateLabel(a.dueDate) : "—",
    navn: a.test.name,
    sub: a.note ? `${a.coach.name} · ${a.note}` : a.coach.name,
  }));

  // ── Historikk: kronologisk logg, nyeste først, med per-test-endring ─
  const forrigePerTest = new Map<string, number>();
  const logg = resultater.map((r) => {
    const forrige = forrigePerTest.get(r.test.name);
    const endring =
      forrige != null ? endringAv(r.score, forrige, deriveLowerIsBetter(r.test.scoringRule)) : null;
    forrigePerTest.set(r.test.name, r.score);
    return { d: dateLabel(r.takenAt), navn: r.test.name, poeng: fmtNum(r.score), endring };
  });
  const historikk = logg.reverse().slice(0, 12);

  const data: TesterV2Data = {
    playerName: screen.playerName,
    hcp: screen.hcp,
    totalTests: screen.totalTests,
    testedCount: screen.testedCount,
    totalAttempts: screen.totalAttempts,
    lastResultLabel: screen.lastResultLabel,
    seksjoner,
    improvedCount,
    withDeltaCount: medEndring.length,
    kommende,
    historikk,
    innsikt,
  };

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TesterV2 data={data} />
    </V2Shell>
  );
}
