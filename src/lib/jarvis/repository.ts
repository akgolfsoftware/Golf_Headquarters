// Ekte (Prisma-baserte) implementasjon av JarvisRepository — se
// src/fixtures/jarvis-demo.ts for grensesnittet og demo-varianten.
//
// hentAvvik(): ingen tabell ennå (kalendervakt-agenten er ikke bygget) —
// returnerer tom liste, ærlig, ikke oppdiktet.
// hentLogg(): ingen egen revisjonslogg-tabell — utledes av Sak sin egen
// status+oppdatert-historikk. /meg er ADMIN-only (kun Anders), så
// godkjentAv er alltid ham; feltet persisteres ikke separat.
// hentSystemHelse(): ekte AgentRun-/AiCost-spørringer for maskinrom-skjermen.
// Innsamlerne (Gmail/iMessage) logger nå til AgentRun via runAgent() — se
// scripts/saker-innsamling/gmail.ts og imessage.ts. Kalendervakt/Anrop/
// Telegram har ingen kjørende innsamler i kode ennå og listes derfor ikke
// her (MaskinromArtefakt viser dem separat som "ikke bygget", ikke som
// oppdiktede statusrader). Ollama/LaunchAgent-helse kan aldri leses herfra
// — Vercel når aldri Tailscale-nettet på Mac Minien (se gotchas.md).
import "server-only";
import { prisma } from "@/lib/prisma";
import { SakStatus } from "@/generated/prisma/enums";
import type { Avvik, InnsamlerStatus, LoggRad, SystemHelse } from "@/lib/jarvis/types";
import type { JarvisRepository } from "@/fixtures/jarvis-demo";
import { JARVIS_AGENT_NAVN } from "@/lib/jarvis/agent-navn";
import { avledInnsamlerHelse } from "@/lib/jarvis/innsamler-helse";

const AVGJORTE_STATUSER = [SakStatus.GODKJENT, SakStatus.AVVIST, SakStatus.UTFORT] as const;

const HANDLING_FOR_STATUS: Partial<Record<SakStatus, string>> = {
  [SakStatus.GODKJENT]: "Godkjent",
  [SakStatus.AVVIST]: "Avvist",
  [SakStatus.UTFORT]: "Utført",
};

const TI_MIN_MS = 10 * 60 * 1000;

async function hentInnsamlerStatus(
  id: string,
  navn: string,
  agentName: string,
  frekvens: string,
  forventetIntervallMs: number | null,
): Promise<InnsamlerStatus> {
  const siste = await prisma.agentRun.findFirst({
    where: { agentName },
    orderBy: { createdAt: "desc" },
    select: { status: true, createdAt: true, error: true },
  });
  return {
    id,
    navn,
    helse: avledInnsamlerHelse(siste, new Date(), forventetIntervallMs),
    sistKjort: siste?.createdAt.toISOString() ?? null,
    feilmelding: siste?.error ?? null,
    frekvens,
  };
}

export function lagPrismaRepository(): JarvisRepository {
  return {
    async hentSaker() {
      return prisma.sak.findMany({ orderBy: { opprettet: "desc" } });
    },
    async hentSak(id: string) {
      return prisma.sak.findUnique({ where: { id } });
    },
    async hentAvvik(): Promise<Avvik[]> {
      return [];
    },
    async hentLogg(): Promise<LoggRad[]> {
      const avgjorte = await prisma.sak.findMany({
        where: { status: { in: [...AVGJORTE_STATUSER] } },
        orderBy: { oppdatert: "desc" },
        take: 50,
      });
      return avgjorte.map((s) => ({
        id: `logg-${s.id}`,
        tidspunkt: s.oppdatert.toISOString(),
        handling: HANDLING_FOR_STATUS[s.status] ?? s.status,
        kanal: s.kanal,
        godkjentAv: "Anders Kristiansen",
        sakId: s.id,
      }));
    },
    async hentSystemHelse(): Promise<SystemHelse> {
      const [gmail, imessage, kost] = await Promise.all([
        hentInnsamlerStatus("gmail", "Gmail", JARVIS_AGENT_NAVN.gmail, "hvert 10. min", TI_MIN_MS),
        hentInnsamlerStatus(
          "imessage",
          "iMessage/SMS",
          JARVIS_AGENT_NAVN.imessage,
          "manuell (ingen LaunchAgent ennå)",
          null,
        ),
        prisma.aiCost.aggregate({
          where: { agentName: { startsWith: "jarvis" }, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
          _sum: { inputTokens: true, outputTokens: true, costUsd: true },
          _count: true,
        }),
      ]);
      return {
        innsamlere: [gmail, imessage],
        aiKostSum: {
          inputTokens: kost._sum.inputTokens ?? 0,
          outputTokens: kost._sum.outputTokens ?? 0,
          costUsd: kost._sum.costUsd,
          antallKall: kost._count,
        },
        lokalHelseTilgjengelig: false,
      };
    },
  };
}
