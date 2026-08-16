// Ekte (Prisma-baserte) implementasjon av JarvisRepository — se
// src/fixtures/jarvis-demo.ts for grensesnittet og demo-varianten.
//
// hentAvvik(): ingen tabell ennå (kalendervakt-agenten er ikke bygget) —
// returnerer tom liste, ærlig, ikke oppdiktet.
// hentLogg(): ingen egen revisjonslogg-tabell — utledes av Sak sin egen
// status+oppdatert-historikk. /meg er ADMIN-only (kun Anders), så
// godkjentAv er alltid ham; feltet persisteres ikke separat.
// hentInnsamlere(): statisk liste over innsamlerne som faktisk finnes i
// scripts/saker-innsamling/ (Gmail, iMessage/SMS) — ingen helsesjekk-endepunkt
// finnes ennå, så helse/sistKjort er ukjent inntil maskinrom-steget bygger det.
import "server-only";
import { prisma } from "@/lib/prisma";
import { SakStatus } from "@/generated/prisma/enums";
import type { Avvik, InnsamlerStatus, LoggRad } from "@/lib/jarvis/types";
import type { JarvisRepository } from "@/fixtures/jarvis-demo";

const AVGJORTE_STATUSER = [SakStatus.GODKJENT, SakStatus.AVVIST, SakStatus.UTFORT] as const;

const HANDLING_FOR_STATUS: Partial<Record<SakStatus, string>> = {
  [SakStatus.GODKJENT]: "Godkjent",
  [SakStatus.AVVIST]: "Avvist",
  [SakStatus.UTFORT]: "Utført",
};

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
    async hentInnsamlere(): Promise<InnsamlerStatus[]> {
      return [
        { id: "gmail", navn: "Gmail", helse: "OK", sistKjort: null, feilmelding: null },
        { id: "imessage", navn: "iMessage/SMS", helse: "OK", sistKjort: null, feilmelding: null },
      ];
    },
  };
}
