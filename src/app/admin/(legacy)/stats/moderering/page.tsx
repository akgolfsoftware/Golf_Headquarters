/**
 * /admin/stats/moderering — moderering-/GDPR-kø (D5, koblet 17. juli 2026).
 *
 * Krever ADMIN eller COACH. Leser ModerationCase:
 *   - Kø: OPEN-saker + APPROVED GDPR-saker som venter på «Bekreft sletting»
 *   - Historikk: avviste/utførte saker + godkjente rapporter, nyeste først
 *
 * Leseveien er defensiv: moderation_cases opprettes av
 * scripts/create-moderation-cases-2026-07-17.ts FØR deploy, men preview-miljøer
 * kan mangle tabellen — da vises ærlig tomtilstand med feilmelding i stedet
 * for krasj. Saker opprettes ennå ikke i appen (rapporteringsflyt er egen jobb).
 */

import type { Metadata } from "next";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { startOfWeek } from "@/lib/uke-helpers";
import {
  ModeringClientV2,
  type ModereringSakV2,
  type ModereringStatsV2,
} from "@/components/admin/v2/AdminStatsModereringV2";
import type { ModerationCase } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stats moderering | AgencyOS",
  description: "Modereringskø for AK Golf Stats.",
  robots: { index: false },
};

// Gotcha: server kjører UTC, appen tenker Oslo — formatering MÅ sette timeZone.
const OSLO_TID_FMT = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const MAL_LABELS: Record<string, string> = {
  VIDEO: "Video",
  KOMMENTAR: "Kommentar",
  PROFIL: "Profil",
  TURNERING: "Turnering",
  RESULTAT: "Resultat",
};

function formatMal(targetType: string | null, targetId: string | null): string | null {
  if (!targetType) return null;
  const label = MAL_LABELS[targetType] ?? targetType;
  return targetId ? `${label} · ${targetId}` : label;
}

function formatSnittTid(msVerdier: number[]): string {
  if (msVerdier.length === 0) return "—";
  const snitt = msVerdier.reduce((a, b) => a + b, 0) / msVerdier.length;
  const timer = snitt / 3_600_000;
  if (timer < 1) return `${Math.max(1, Math.round(snitt / 60_000))} min`;
  if (timer < 48) return `${timer.toFixed(1).replace(".", ",")} t`;
  return `${Math.round(timer / 24)} d`;
}

function tilSak(sak: ModerationCase, navn: Map<string, string>): ModereringSakV2 {
  return {
    id: sak.id,
    type: sak.type === "GDPR_SLETTING" ? "GDPR_SLETTING" : "RAPPORTERT_INNHOLD",
    status:
      sak.status === "APPROVED" || sak.status === "REJECTED" || sak.status === "EXECUTED"
        ? sak.status
        : "OPEN",
    spillerNavn: navn.get(sak.userId) ?? "Ukjent bruker",
    rapportertAv: sak.reporterId ? (navn.get(sak.reporterId) ?? "Ukjent bruker") : null,
    mal: formatMal(sak.targetType, sak.targetId),
    begrunnelse: sak.begrunnelse,
    mottatt: OSLO_TID_FMT.format(sak.createdAt),
    behandlet: sak.resolvedAt ? OSLO_TID_FMT.format(sak.resolvedAt) : null,
  };
}

export default async function ModeringPage() {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  let saker: ModereringSakV2[] = [];
  let historikk: ModereringSakV2[] = [];
  let stats: ModereringStatsV2 = {
    rapporter: 0,
    slett: 0,
    godkjentDenneUka: 0,
    avvistDenneUka: 0,
    snittTid: "—",
  };
  let lasteFeil: string | null = null;

  try {
    const ukeStart = startOfWeek(new Date());
    const [aapne, lukkede, godkjentDenneUka, avvistDenneUka] = await Promise.all([
      // Kø: åpne saker + godkjente GDPR-saker som venter på utførelse (eldst først).
      prisma.moderationCase.findMany({
        where: {
          OR: [{ status: "OPEN" }, { status: "APPROVED", type: "GDPR_SLETTING" }],
        },
        orderBy: { createdAt: "asc" },
        take: 100,
      }),
      // Historikk: ferdigbehandlede saker, nyest behandlet først.
      prisma.moderationCase.findMany({
        where: {
          OR: [
            { status: { in: ["REJECTED", "EXECUTED"] } },
            { status: "APPROVED", type: "RAPPORTERT_INNHOLD" },
          ],
        },
        orderBy: { resolvedAt: "desc" },
        take: 25,
      }),
      prisma.moderationCase.count({
        where: { resolvedAt: { gte: ukeStart }, status: { in: ["APPROVED", "EXECUTED"] } },
      }),
      prisma.moderationCase.count({
        where: { resolvedAt: { gte: ukeStart }, status: "REJECTED" },
      }),
    ]);

    const brukerIder = [
      ...new Set(
        [...aapne, ...lukkede].flatMap((s) => [s.userId, s.reporterId]).filter((id): id is string => Boolean(id)),
      ),
    ];
    const brukere =
      brukerIder.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: brukerIder } },
            select: { id: true, name: true },
          })
        : [];
    const navn = new Map(brukere.map((b) => [b.id, b.name]));

    saker = aapne.map((s) => tilSak(s, navn));
    historikk = lukkede.map((s) => tilSak(s, navn));
    stats = {
      rapporter: saker.filter((s) => s.type === "RAPPORTERT_INNHOLD").length,
      slett: saker.filter((s) => s.type === "GDPR_SLETTING").length,
      godkjentDenneUka,
      avvistDenneUka,
      snittTid: formatSnittTid(
        lukkede
          .flatMap((s) => (s.resolvedAt ? [s.resolvedAt.getTime() - s.createdAt.getTime()] : []))
          .filter((ms) => ms >= 0),
      ),
    };
  } catch (err) {
    console.error("[moderering] kunne ikke lese moderering-køen", err);
    lasteFeil =
      "Kunne ikke lese moderering-køen. Tabellen moderation_cases finnes " +
      "kanskje ikke i dette miljøet ennå (opprettes av migrasjonsscriptet før deploy).";
  }

  return <ModeringClientV2 saker={saker} historikk={historikk} stats={stats} lasteFeil={lasteFeil} />;
}
