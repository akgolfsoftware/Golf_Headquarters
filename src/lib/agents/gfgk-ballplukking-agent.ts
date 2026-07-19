// src/lib/agents/gfgk-ballplukking-agent.ts
// Ballplukking-rytmen fra .claude/rules/gfgk-junior.md:
//   «Torsdag 20:00: ballplukking. Onsdag: sjekk at ansvarlig er bekreftet for
//    uka (rullering). Ingen bekreftelse → ett varsel til Anders, aldri
//    direkte til juniorer.»
//
// ÉN kombinert sjekk+varsel-kjøring (onsdag) — ikke sjekkliste+purring som to
// separate kjøringer (Tripletex-lønn-mønsteret), fordi regelen selv beskriver
// dette som én sjekk. Regelen sier IKKE hvem sin tur det er i rotasjonen
// (Anders/Christoffer) — denne agenten regner det aldri ut, den kun spør
// (gap-regel/aldri-gjett, samme prinsipp som Tripletex-bølgen).
//
// Bekreftelsen gjenbruker AgentRun-tabellen (ingen schema-endring — Prisma
// migrate/db push er blokkert, se .claude/rules/gotchas.md): en AgentRun-rad
// med agentName "ballplukking-bekreftet" i inneværende Oslo-uke regnes som
// bekreftet.
import "server-only";
import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";
import { varsleAgentFunn } from "./agent-notify";
import { startOfWeek, ukenummer } from "@/lib/uke-helpers";

export const SJEKK_AGENT_NAME = "gfgk-ballplukking-sjekk";
export const BEKREFTET_AGENT_NAME = "ballplukking-bekreftet";

const ADMIN_LENKE = "/admin/agencyos";

/**
 * Er minst én av bekreftelsestidspunktene i samme Oslo-kalenderuke som `now`?
 * Ren funksjon (ingen DB) — bruker EKSISTERENDE `startOfWeek()` fra
 * uke-helpers.ts (Oslo-korrekt, mandag-start) i stedet for å bygge egen
 * uke-logikk, se .claude/rules/gfgk-junior.md-oppgaven.
 */
export function harBekreftetIUka(bekreftelser: Date[], now: Date): boolean {
  const maalUke = startOfWeek(now).getTime();
  return bekreftelser.some((d) => startOfWeek(d).getTime() === maalUke);
}

// ── Sjekk + varsel (kjøres onsdag) ──────────────────────────────────────────

export async function runBallplukkingSjekk(now: Date = new Date()): Promise<AgentResult> {
  return runAgent(SJEKK_AGENT_NAME, null, async () => {
    // Hent bredt (10 dager — mer enn nok margin for én uke, se
    // FERSKHET_DAGER-kommentaren i tripletex-lonn-agent.ts for hvorfor bred
    // henting + presis sammenligning i kode er tryggere enn en DB-spørring
    // bygget på uke-grenser) og la harBekreftetIUka() gjøre den nøyaktige
    // Oslo-ukesammenligningen per rad.
    const FERSKHET_DAGER = 10;
    const bekreftelser = await prisma.agentRun.findMany({
      where: {
        agentName: BEKREFTET_AGENT_NAME,
        status: "OK",
        createdAt: { gte: new Date(now.getTime() - FERSKHET_DAGER * 86_400_000) },
      },
      select: { createdAt: true },
    });

    if (harBekreftetIUka(bekreftelser.map((b) => b.createdAt), now)) {
      return { output: { varslet: false, aarsak: "allerede bekreftet" } };
    }

    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      console.warn("[gfgk-ballplukking-agent] fant ingen ADMIN-bruker — kan ikke varsle");
      return { output: { varslet: false, aarsak: "ingen admin-bruker funnet" } };
    }

    const uke = ukenummer(now);
    await varsleAgentFunn({
      coachId: admin.id,
      tittel: `Ballplukking uke ${uke}: ikke bekreftet`,
      tekst:
        `Ansvarlig for torsdagens ballplukking (kl. 20:00) er ikke bekreftet for uke ${uke} ennå. ` +
        "Bekreft hvem som tar den — Anders eller Christoffer — med «ballplukking bekreftet», " +
        "«jeg tar ballplukking» eller «Christoffer tar ballplukking» til Meg.",
      lenke: ADMIN_LENKE,
    });

    return { output: { varslet: true, uke } };
  });
}

// ── Bekreftelse (kalt fra Meg-tool `ballplukking_bekreft`, se
//    src/lib/meg/tools.ts) ───────────────────────────────────────────────────

/**
 * Skriver bekreftelsen som en AgentRun-rad ("ballplukking-bekreftet") for
 * inneværende Oslo-uke. Kalles KUN når Anders selv bekrefter via Meg — aldri
 * automatisk, og aldri med en rotasjon systemet har regnet ut selv.
 */
export async function bekreftBallplukking(
  ansvarlig?: string,
  now: Date = new Date(),
): Promise<string> {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const uke = ukenummer(now);
  await runAgent(BEKREFTET_AGENT_NAME, admin?.id ?? null, async () => ({
    output: { ansvarlig: ansvarlig?.trim() || null, uke },
  }));
  return ansvarlig?.trim()
    ? `Ballplukking bekreftet for uke ${uke} — ${ansvarlig.trim()} har ansvaret torsdag.`
    : `Ballplukking bekreftet for uke ${uke}.`;
}
