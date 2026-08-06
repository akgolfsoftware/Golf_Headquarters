#!/usr/bin/env tsx
/**
 * Coach-eval — kvalitetsrapport for AI-forslagene (PlanAction-beslutninger).
 *
 *   npx tsx scripts/coach-eval.ts             # rapport til konsoll + docs/coach-eval-rapport.md
 *   npm run qa:coach
 *   npm run qa:coach -- --judge               # + LLM-dommer på siste forslag
 *
 * KUN LESING uten flagg. Med --judge skrives dommerscoringer til
 * ai_eval_results (og ingenting annet). Dommerscore er KUN veiledende til
 * ≥50 ekte coach-beslutninger foreligger som kalibrering (Fable 5-syntesen).
 *
 * Hovedmetrikk (Fable 5-syntesen): «godkjent uendret»-rate ≥ 60 % per agent.
 * Rapporterer også redigert-rate, avvisningsgrunner, beslutningslatens og
 * tommel-labels fra AuditLog (action "agent.feedback").
 *
 * Feltene decidedAt/editedBeforeApproval/rejectReason kom 2026-07-27 — saker
 * besluttet FØR det telles med i ratene, men mangler latens/grunn (ærlig hull,
 * rapporteres separat).
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  computeAgentMetrics,
  totalsummer,
  type DecisionRow,
} from "../src/lib/evals/coach-metrics";

loadEnv({ path: ".env.local" });
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const MAAL_GODKJENT_UENDRET = 0.6;

function pct(v: number | null): string {
  return v === null ? "–" : `${Math.round(v * 100)} %`;
}

async function main() {
  const siden = new Date();
  siden.setDate(siden.getDate() - 30);

  const [alle, siste30, feedback] = await Promise.all([
    prisma.planAction.findMany({
      select: {
        agentName: true,
        actionType: true,
        status: true,
        editedBeforeApproval: true,
        rejectReason: true,
        createdAt: true,
        decidedAt: true,
      },
    }),
    prisma.planAction.count({ where: { createdAt: { gte: siden } } }),
    prisma.auditLog.findMany({
      where: { action: "agent.feedback" },
      select: { metadata: true },
    }),
  ]);

  const rows: DecisionRow[] = alle;
  const metrics = computeAgentMetrics(rows);
  const totalt = totalsummer(metrics);
  const udaterte = rows.filter(
    (r) => r.status !== "PENDING" && r.decidedAt === null,
  ).length;

  const tommel = { opp: 0, ned: 0 };
  for (const f of feedback) {
    const rating =
      f.metadata && typeof f.metadata === "object" && !Array.isArray(f.metadata)
        ? (f.metadata as Record<string, unknown>).rating
        : null;
    if (rating === 1) tommel.opp++;
    else if (rating === -1) tommel.ned++;
  }

  const linjer: string[] = [];
  const log = (s: string) => {
    linjer.push(s);
    console.log(s);
  };

  log(`# Coach-eval — AI-forslagenes kvalitet`);
  log(``);
  log(`Generert: ${new Date().toISOString().slice(0, 16).replace("T", " ")} · KUN LESING`);
  log(``);
  log(`## Totalt`);
  log(``);
  log(`- PlanActions totalt: ${rows.length} (${siste30} siste 30 dager)`);
  log(`- Besluttet: ${totalt.decided} · Godkjent uendret-rate: ${pct(totalt.approvedUnchangedRate)} (mål ≥ ${MAAL_GODKJENT_UENDRET * 100} %)`);
  log(`- Tommel fra agent-panelet: ${tommel.opp} opp / ${tommel.ned} ned`);
  if (udaterte > 0) {
    log(`- NB: ${udaterte} beslutninger er fra FØR beslutningsfangsten (mangler decidedAt/grunn)`);
  }
  log(``);
  log(`## Per agent og handlingstype (verst først)`);
  log(``);
  log(`| Agent | Type | Besluttet | Godkjent uendret | Redigert | Avvist | Median latens (t) |`);
  log(`|---|---|---|---|---|---|---|`);
  for (const m of metrics) {
    const decided = m.accepted + m.rejected;
    const flagg =
      m.approvedUnchangedRate !== null && m.approvedUnchangedRate < MAAL_GODKJENT_UENDRET
        ? " ⚠" : "";
    log(
      `| ${m.agentName} | ${m.actionType} | ${decided} | ${pct(m.approvedUnchangedRate)}${flagg} | ${m.acceptedEdited} | ${m.rejected} | ${m.medianDecisionHours !== null ? m.medianDecisionHours.toFixed(1) : "–"} |`,
    );
  }
  log(``);

  const grunner = metrics.flatMap((m) =>
    m.rejectReasons.map((r) => `- [${m.agentName}/${m.actionType}] ${r}`),
  );
  log(`## Avvisningsgrunner (${grunner.length})`);
  log(``);
  if (grunner.length > 0) grunner.forEach((g) => log(g));
  else log(`Ingen registrerte grunner ennå — feltet kom 2026-07-27.`);
  log(``);
  if (process.argv.includes("--judge")) {
    const { judgeSubject, judgePromptHash } = await import("../src/lib/evals/judge");
    const kandidater = await prisma.planAction.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, agentName: true, actionType: true, suggestion: true },
    });
    const decidedTotalt = totalt.decided;
    const kalibrert = decidedTotalt >= 50;

    log(``);
    log(`## LLM-dommer (${kandidater.length} siste forslag · prompt ${judgePromptHash()})`);
    log(``);
    log(
      kalibrert
        ? `Kalibreringsgrunnlag: ${decidedTotalt} coach-beslutninger.`
        : `⚠ KUN VEILEDENDE: bare ${decidedTotalt} coach-beslutninger — dommer er ukalibrert til ≥50 foreligger.`,
    );
    log(``);
    log(`| Agent | Type | Metodikk | Ekst. fokus | Alder | Sikkerhet |`);
    log(`|---|---|---|---|---|---|`);

    const snitt = { metodikkTroskap: 0, eksterntFokus: 0, alderstilpasning: 0, sikkerhet: 0 };
    let dømte = 0;
    for (const k of kandidater) {
      const res = await judgeSubject({
        subjectType: "plan-action",
        subjectId: k.id,
        innhold: JSON.stringify(k.suggestion),
        kontekst: `agent: ${k.agentName}, handlingstype: ${k.actionType}`,
      });
      if (!res.ok) {
        log(`| ${k.agentName} | ${k.actionType} | – | – | – | – |`);
        continue;
      }
      const r = res.rubrikk;
      await prisma.$executeRaw`
        INSERT INTO ai_eval_results (id, "subjectType", "subjectId", rubric, model, "promptHash")
        VALUES (gen_random_uuid()::text, 'plan-action', ${k.id}, ${JSON.stringify(r)}::jsonb, ${res.model}, ${res.promptHash})
      `;
      snitt.metodikkTroskap += r.metodikkTroskap;
      snitt.eksterntFokus += r.eksterntFokus;
      snitt.alderstilpasning += r.alderstilpasning;
      snitt.sikkerhet += r.sikkerhet;
      dømte++;
      log(`| ${k.agentName} | ${k.actionType} | ${r.metodikkTroskap} | ${r.eksterntFokus} | ${r.alderstilpasning} | ${r.sikkerhet} |`);
    }
    if (dømte > 0) {
      log(``);
      log(
        `Snitt (${dømte} dømt): metodikk ${(snitt.metodikkTroskap / dømte).toFixed(1)} · eksternt fokus ${(snitt.eksterntFokus / dømte).toFixed(1)} · alder ${(snitt.alderstilpasning / dømte).toFixed(1)} · sikkerhet ${(snitt.sikkerhet / dømte).toFixed(1)}`,
      );
    }
    log(``);
  }

  log(`## Slik leses rapporten`);
  log(``);
  log(`Under ${MAAL_GODKJENT_UENDRET * 100} % godkjent-uendret (⚠): les redigeringene og`);
  log(`grunnene — det er treningsdata for agent-prompten, ikke et nederlag.`);

  const rapportSti = join(process.cwd(), "docs", "coach-eval-rapport.md");
  writeFileSync(rapportSti, linjer.join("\n") + "\n");
  console.log(`\nRapport skrevet til ${rapportSti}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
