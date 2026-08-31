/**
 * Kø · fane «Moderering» — datalasting (MASTERPLAN 15.13).
 *
 * Flyttet ORDRETT ut av src/app/admin/(legacy)/stats/moderering/page.tsx —
 * samme spørringer, samme feilhåndtering. Kun rolle-guarden er løftet ut
 * (siden holder allerede ADMIN/COACH-basisgaten). Actions
 * (godkjennSak/avvisSak/utforGdprSletting) og komponenten
 * (ModeringClientV2) er UENDRET og bor fortsatt i den gamle mappen — de
 * importeres derfra, ikke duplisert.
 */

import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/error-tracking";
import { startOfWeek } from "@/lib/uke-helpers";
import type { ModereringSakV2, ModereringStatsV2 } from "@/components/admin/v2/AdminStatsModereringV2";
import type { ModerationCase } from "@/generated/prisma/client";

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

export interface ModereringData {
  saker: ModereringSakV2[];
  historikk: ModereringSakV2[];
  stats: ModereringStatsV2;
  lasteFeil: string | null;
}

export async function lastModerering(): Promise<ModereringData> {
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
      prisma.moderationCase.findMany({
        where: {
          OR: [{ status: "OPEN" }, { status: "APPROVED", type: "GDPR_SLETTING" }],
        },
        orderBy: { createdAt: "asc" },
        take: 100,
      }),
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
  } catch (error) {
    await logError({ context: "admin.ko.moderering.les", error, severity: "warn" });
    lasteFeil =
      "Kunne ikke lese moderering-køen. Tabellen moderation_cases finnes " +
      "kanskje ikke i dette miljøet ennå (opprettes av migrasjonsscriptet før deploy).";
  }

  return { saker, historikk, stats, lasteFeil };
}
