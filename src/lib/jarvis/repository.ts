// Ekte (Prisma-baserte) implementasjon av JarvisRepository — se
// src/fixtures/jarvis-demo.ts for grensesnittet og demo-varianten.
//
// hentAvvik(): kalendervakten — leser neste 7 dagers kalenderhendelser og
// detekterer KONFLIKT/REISETID med finnAvvik() (src/lib/jarvis/kalendervakt.ts,
// se hodekommentaren der for hvorfor VARSEL er utelatt). Fail-closed: feiler
// kalender-kallet returneres tom liste, samme prinsipp som hentDagen() —
// aldri oppdiktede avvik. Funnene persisteres ikke (regnes ut per lasting).
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
// hentUkesreview(): kalenderavvikFanget er fortsatt 0 — «fanget denne uka»
// krever persistens av vaktens funn, og hentAvvik() over regner kun ut
// AKTIVE avvik ved lasting. Å telle dagens funn som ukestall ville vært
// feil etikett, så 0 + ærlig note i UkesreviewArtefakt er minst løgn
// inntil funnene lagres et sted. "Tre ting som
// gledet"/"til neste uke" og 150M-tokenbudsjettet fra fasiten er utelatt
// helt (se UkesreviewData sin doc-kommentar i types.ts).
// hentInnstillinger(): leser JarvisInnstilling via
// src/lib/jarvis/innstillinger.ts. Ingen rad / DB-feil = STANDARD_INNSTILLINGER.
// Feltene styrer kø-filter, kalender, SLA, stille tidsrom og innsamlere.
import "server-only";
import { prisma } from "@/lib/prisma";
import { SakStatus } from "@/generated/prisma/enums";
import type { Sak } from "@/generated/prisma/client";
import type {
  Avvik,
  BriefKind,
  BriefSnapshot,
  DagenData,
  Innstillinger,
  InnsamlerStatus,
  LoggRad,
  SystemHelse,
  UkesreviewData,
} from "@/lib/jarvis/types";
import type { JarvisRepository } from "@/fixtures/jarvis-demo";
import { JARVIS_AGENT_NAVN } from "@/lib/jarvis/agent-navn";
import { avledInnsamlerHelse } from "@/lib/jarvis/innsamler-helse";
import {
  filtrerSakerEtterKanal,
  hentJarvisInnstillinger,
} from "@/lib/jarvis/innstillinger";
import { hentAgenticosBro } from "@/lib/jarvis/agenticos-bro";
import { byggAgenticosInnsamlere } from "@/lib/jarvis/agenticos-visning";
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
import { finnAvvik } from "@/lib/jarvis/kalendervakt";

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
      const [saker, inn] = await Promise.all([
        prisma.sak.findMany({ orderBy: { opprettet: "desc" } }),
        hentJarvisInnstillinger(),
      ]);
      return filtrerSakerEtterKanal(saker, inn);
    },
    async hentSak(id: string) {
      return prisma.sak.findUnique({ where: { id } });
    },
    async hentAvvik(): Promise<Avvik[]> {
      const inn = await hentJarvisInnstillinger();
      if (!inn.kanalKalender) return [];
      const na = new Date();
      const res = await hentKalenderHendelser(na, new Date(na.getTime() + 7 * 24 * 60 * 60 * 1000));
      if (!res.ok) return [];
      return finnAvvik(res.hendelser, na);
    },
    async hentLogg(): Promise<LoggRad[]> {
      const inn = await hentJarvisInnstillinger();
      const avgjorte = await prisma.sak.findMany({
        where: { status: { in: [...AVGJORTE_STATUSER] } },
        orderBy: { oppdatert: "desc" },
        take: 50,
      });
      return filtrerSakerEtterKanal(avgjorte, inn).map((s) => ({
        id: `logg-${s.id}`,
        tidspunkt: s.oppdatert.toISOString(),
        handling: HANDLING_FOR_STATUS[s.status] ?? s.status,
        kanal: s.kanal,
        godkjentAv: "Anders Kristiansen",
        sakId: s.id,
      }));
    },
    async hentSystemHelse(): Promise<SystemHelse> {
      const inn = await hentJarvisInnstillinger();
      const [gmail, imessage, kost, agenticos] = await Promise.all([
        inn.kanalGmail
          ? hentInnsamlerStatus("gmail", "Gmail", JARVIS_AGENT_NAVN.gmail, "hvert 10. min", TI_MIN_MS)
          : Promise.resolve(null),
        inn.kanalImessage
          ? hentInnsamlerStatus(
              "imessage",
              "iMessage/SMS",
              JARVIS_AGENT_NAVN.imessage,
              "manuell (ingen LaunchAgent ennå)",
              null,
            )
          : Promise.resolve(null),
        prisma.aiCost.aggregate({
          where: { agentName: { startsWith: "jarvis" }, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
          _sum: { inputTokens: true, outputTokens: true, costUsd: true },
          _count: true,
        }),
        hentAgenticosBro(),
      ]);
      const innsamlere = [gmail, imessage].filter((r): r is InnsamlerStatus => r != null);
      innsamlere.push(...byggAgenticosInnsamlere(agenticos));
      return {
        innsamlere,
        agenticos,
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
      const inn = await hentJarvisInnstillinger();
      const na = new Date();
      const grenser = osloDagGrenser(na);
      if (!inn.kanalKalender) {
        const innboksblokker = byggInnboksblokker(saker, grenser.start, na);
        const ledig = byggLedigElementer(innboksblokker, grenser, na);
        const elementer = [...innboksblokker, ...ledig].sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
        );
        return {
          kalenderTilgjengelig: false,
          kalenderFeil: "Kalender-kanalen er skrudd av i innstillingene.",
          elementer,
          ledigMinutterIgjen: summerLedigMinutterIgjen(ledig, na),
        };
      }
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

      const inn = await hentJarvisInnstillinger();
      const sla = beregnSlaEtterlevelse(filtrerSakerEtterKanal(avgjortDenneUken, inn));
      const slaForrige = beregnSlaEtterlevelse(filtrerSakerEtterKanal(avgjortForrigeUken, inn));

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
        sakerPerKanal: tellPerKanal(filtrerSakerEtterKanal(mottattDenneUken, inn)),
        kalenderavvikFanget: 0,
        aiKost: {
          inputTokens: kost._sum.inputTokens ?? 0,
          outputTokens: kost._sum.outputTokens ?? 0,
          costUsd: kost._sum.costUsd,
          antallKall: kost._count,
        },
      };
    },
    async hentInnstillinger(userId: string): Promise<Innstillinger> {
      return hentJarvisInnstillinger(userId);
    },
  };
}
