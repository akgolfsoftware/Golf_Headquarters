// src/lib/agents/mulligan-vaskeliste-agent.ts
// Vaskeliste-rytmen fra .claude/rules/mulligan-drift.md:
//   «Vaskeliste: ukentlig rullering mellom Anders og Christoffer. Ved
//    planlegging: sjekk hvem som står for uka FØR påminnelse sendes — aldri
//    dobbeltvarsle begge.»
//
// Samme mønster som gfgk-ballplukking-agent.ts (torsdag-ballplukking):
// regelen sier IKKE hvilken ukedag/klokkeslett sjekken skal kjøre — denne
// agenten gjetter derfor ALDRI en fast rotasjonstabell (hvem sin tur det er
// beregnes ALDRI av systemet, samme aldri-gjett-prinsipp). Kjøretidspunktet
// (mandag 08:00 UTC, se vercel.json) er en EKSPLISITT FLAGGET DEFAULT-antakelse
// — start av uka, god margin — Anders justerer med ett tall i vercel.json,
// samme mønster som TODO(verifiser-mot-api)-antakelsene i Tripletex-bølgen.
//
// «Aldri dobbeltvarsle begge» er arkitektonisk allerede umulig å bryte i
// dette systemet: Meg sin Telegram-kanal har kun ÉN mottaker (Anders,
// MEG_TELEGRAM_ALLOWED_CHAT_ID er single-chat) — systemet kan ikke varsle
// Christoffer direkte i det hele tatt. Varselet ber derfor Anders koordinere
// med Christoffer, det later ALDRI som om systemet vet eller bestemmer hvem
// sin tur det er.
//
// Bekreftelsen gjenbruker AgentRun-tabellen (ingen schema-endring — Prisma
// migrate/db push er blokkert, se .claude/rules/gotchas.md): en AgentRun-rad
// med agentName "vaskeliste-bekreftet" i inneværende Oslo-uke regnes som
// bekreftet.
import "server-only";
import { prisma } from "@/lib/prisma";
import { runAgent, type AgentResult } from "./agent-runner";
import { varsleAgentFunn } from "./agent-notify";
import { startOfWeek, ukenummer } from "@/lib/uke-helpers";

export const SJEKK_AGENT_NAME = "mulligan-vaskeliste-sjekk";
export const BEKREFTET_AGENT_NAME = "vaskeliste-bekreftet";

const ADMIN_LENKE = "/admin/agencyos";

/**
 * Er minst én av bekreftelsestidspunktene i samme Oslo-kalenderuke som `now`?
 * Ren funksjon (ingen DB) — bruker EKSISTERENDE `startOfWeek()` fra
 * uke-helpers.ts (Oslo-korrekt, mandag-start) i stedet for å bygge egen
 * uke-logikk, se .claude/rules/mulligan-drift.md-oppgaven.
 */
export function harBekreftetIUka(bekreftelser: Date[], now: Date): boolean {
  const maalUke = startOfWeek(now).getTime();
  return bekreftelser.some((d) => startOfWeek(d).getTime() === maalUke);
}

// ── Sjekk + varsel (kjøres mandag — se antakelse-kommentaren over) ─────────

export async function runVaskelisteSjekk(now: Date = new Date()): Promise<AgentResult> {
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
      console.warn("[mulligan-vaskeliste-agent] fant ingen ADMIN-bruker — kan ikke varsle");
      return { output: { varslet: false, aarsak: "ingen admin-bruker funnet" } };
    }

    const uke = ukenummer(now);
    await varsleAgentFunn({
      coachId: admin.id,
      tittel: `Vaskeliste uke ${uke}: ikke bekreftet`,
      tekst:
        `Ansvarlig for ukas vask av Mulligan Indoor Golf-simulatorene er ikke bekreftet for ` +
        `uke ${uke} ennå. Koordiner med Christoffer om hvem som tar den, og bekreft med ` +
        "«vaskeliste bekreftet», «jeg tar vaskelista» eller «Christoffer tar vaskelista» til Meg.",
      lenke: ADMIN_LENKE,
    });

    return { output: { varslet: true, uke } };
  });
}

// ── Bekreftelse (kalt fra Meg-tool `vaskeliste_bekreft`, se
//    src/lib/meg/tools.ts) ───────────────────────────────────────────────────

/**
 * Skriver bekreftelsen som en AgentRun-rad ("vaskeliste-bekreftet") for
 * inneværende Oslo-uke. Kalles KUN når Anders selv bekrefter via Meg — aldri
 * automatisk, og aldri med en rotasjon systemet har regnet ut selv.
 */
export async function bekreftVaskeliste(
  ansvarlig?: string,
  now: Date = new Date(),
): Promise<string> {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const uke = ukenummer(now);
  await runAgent(BEKREFTET_AGENT_NAME, admin?.id ?? null, async () => ({
    output: { ansvarlig: ansvarlig?.trim() || null, uke },
  }));
  return ansvarlig?.trim()
    ? `Vaskeliste bekreftet for uke ${uke} — ${ansvarlig.trim()} har ansvaret denne uka.`
    : `Vaskeliste bekreftet for uke ${uke}.`;
}
