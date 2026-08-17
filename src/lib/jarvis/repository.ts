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
// hentBrief(): leser siste lagrede morgenbrief/kveldsjournal fra me_brief —
// EGET Supabase-prosjekt (src/lib/meg/supabase.ts), ikke golf-DB'en resten
// av denne fila bruker. hentBriefer() returnerer allerede ærlig tom liste
// hvis Meg-databasen ikke er konfigurert eller ingen brief er generert —
// innhold:null dekker begge tilfellene identisk (samme prinsipp som
// InnsamlerHelse sin UKJENT-verdi).
// hentUkesreview(): kalenderavvikFanget er hardkodet 0 — samme grunn som
// hentAvvik() over, ingen kalendervakt-agent finnes. "Tre ting som
// gledet"/"til neste uke" og 150M-tokenbudsjettet fra fasiten er utelatt
// helt (se UkesreviewData sin doc-kommentar i types.ts).
import "server-only";
import { prisma } from "@/lib/prisma";
import { SakStatus } from "@/generated/prisma/enums";
import type { Sak } from "@/generated/prisma/client";
import type { Avvik, BriefKind, BriefSnapshot, DagenData, InnsamlerStatus, LoggRad, SystemHelse, UkesreviewData } from "@/lib/jarvis/types";
import type { JarvisRepository } from "@/fixtures/jarvis-demo";
import { JARVIS_AGENT_NAVN } from "@/lib/jarvis/agent-navn";
import { avledInnsamlerHelse } from "@/lib/jarvis/innsamler-helse";
import { hentKalenderHendelser } from "@/lib/meg/connectors/google";
import { hentBriefer } from "@/lib/meg/read";
import { adminSubject } from "@/lib/meg/access";
import { ukenummer } from "@/lib/uke-helpers";
import {
  osloDagGrenser,
  byggAvtaleElementer,
  byggInnboksblokker,
  byggLedigElementer,
  summerLedigMinutterIgjen,
} from "@/lib/jarvis/dagen";
import { osloUkeGrenser, beregnSlaEtterlevelse, tellPerKanal } from "@/lib/jarvis/ukesreview";

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
    async hentDagen(saker: Sak[]): Promise<DagenData> {
      const na = new Date();
      const grenser = osloDagGrenser(na);
      const res = await hentKalenderHendelser(grenser.start, grenser.slutt);

      if (!res.ok) {
        return { kalenderTilgjengelig: false, kalenderFeil: res.feil, elementer: [], ledigMinutterIgjen: 0 };
      }

      const avtaler = byggAvtaleElementer(res.hendelser, na);
      const innboksblokker = byggInnboksblokker(saker, grenser.start, na);
      const opptatt = [...avtaler, ...innboksblokker];
      const ledig = byggLedigElementer(opptatt, grenser, na);
      const elementer = [...opptatt, ...ledig].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );

      return {
        kalenderTilgjengelig: true,
        kalenderFeil: null,
        elementer,
        ledigMinutterIgjen: summerLedigMinutterIgjen(ledig, na),
      };
    },
    async hentBrief(kind: BriefKind): Promise<BriefSnapshot> {
      const subject = adminSubject();
      if (!subject) return { innhold: null, generert: null };
      const [siste] = await hentBriefer(subject, 1, kind);
      if (!siste) return { innhold: null, generert: null };
      return { innhold: siste.content, generert: siste.created_at };
    },
    async hentUkesreview(): Promise<UkesreviewData> {
      const na = new Date();
      const denneUken = osloUkeGrenser(na);
      const forrigeUken = osloUkeGrenser(new Date(denneUken.start.getTime() - 24 * 60 * 60 * 1000));

      const [mottattDenneUken, avgjortDenneUken, avgjortForrigeUken, kost] = await Promise.all([
        prisma.sak.findMany({ where: { opprettet: { gte: denneUken.start, lt: denneUken.slutt } } }),
        prisma.sak.findMany({
          where: {
            status: { in: [...AVGJORTE_STATUSER] },
            oppdatert: { gte: denneUken.start, lt: denneUken.slutt },
          },
        }),
        prisma.sak.findMany({
          where: {
            status: { in: [...AVGJORTE_STATUSER] },
            oppdatert: { gte: forrigeUken.start, lt: forrigeUken.slutt },
          },
        }),
        prisma.aiCost.aggregate({
          where: { agentName: { startsWith: "jarvis" }, createdAt: { gte: denneUken.start, lt: denneUken.slutt } },
          _sum: { inputTokens: true, outputTokens: true, costUsd: true },
          _count: true,
        }),
      ]);

      const sla = beregnSlaEtterlevelse(avgjortDenneUken);
      const slaForrige = beregnSlaEtterlevelse(avgjortForrigeUken);

      return {
        ukenummer: ukenummer(na),
        periodeStart: denneUken.start.toISOString(),
        periodeSlutt: denneUken.slutt.toISOString(),
        slaEtterlevelse: {
          prosentUnderFrist: sla.prosentUnderFrist,
          avgjorteMedFrist: sla.antall,
          medianSvartidMin: sla.medianSvartidMin,
          prosentUnderFristForrigeUke: slaForrige.prosentUnderFrist,
        },
        sakerPerKanal: tellPerKanal(mottattDenneUken),
        kalenderavvikFanget: 0,
        aiKost: {
          inputTokens: kost._sum.inputTokens ?? 0,
          outputTokens: kost._sum.outputTokens ?? 0,
          costUsd: kost._sum.costUsd,
          antallKall: kost._count,
        },
      };
    },
  };
}
