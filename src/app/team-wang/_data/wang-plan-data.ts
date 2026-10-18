// Server-only: elevenes delte plan i WANG-trenerflaten (W1, nattkjøring 18.10.2026).
// Kalles etter hentWangCoachGruppeId: treneren er allerede sluppet inn i `gruppeId`.
// Planen leses bare for elever med gyldig plansamtykke mot denne gruppa; for andre
// leses ingenting, og skjermen viser «—». Samme etterlevelse som PlayerHQ
// (loadVisibleSessionRange + etterlevelse, fire uker).

import "server-only";

import { prisma } from "@/lib/prisma";
import { maaHaForesattSamtykke } from "@/lib/auth/minor";
import { harGyldigSamtykke, WANG_PLAN_SCOPE } from "@/lib/deling/samtykke-regler";
import { etterlevelseFra } from "@/lib/domain/etterlevelse";
import { loadVisibleSessionRange } from "@/lib/portal/visible-session-range";
import { tilDatoKolonne } from "@/lib/workbench/wb-map";
import { OSLO_YMD_FMT } from "@/lib/jarvis/dagen";
import { byggWangPlanData, type WangPlanData, type WangPlanGrunnlag } from "./wang-plan-visning";

export async function hentWangPlanData(gruppeId: string, now = new Date()): Promise<WangPlanData> {
  const medlemmer = await prisma.groupMember.findMany({
    where: {
      groupId: gruppeId,
      role: "PLAYER",
      endedAt: null,
      user: { deletedAt: null, anonymisertAt: null, role: "PLAYER" },
    },
    select: { userId: true, user: { select: { requiresGuardianConsent: true, dateOfBirth: true } } },
  });
  const ider = [...new Set(medlemmer.map((m) => m.userId))];
  const rader = ider.length
    ? await prisma.delingsSamtykke.findMany({
        where: { userId: { in: ider }, scope: WANG_PLAN_SCOPE, mottakerGruppeId: gruppeId },
        select: { userId: true, scope: true, mottakerGruppeId: true, gitt: true, gittAvRolle: true, createdAt: true },
      })
    : [];

  const fra = etterlevelseFra(now);
  const grunnlag: WangPlanGrunnlag[] = [];
  for (const m of medlemmer) {
    if (grunnlag.some((g) => g.id === m.userId)) continue;
    const elevRader = rader.filter((r) => r.userId === m.userId);
    const kreverForesatt = maaHaForesattSamtykke(m.user);
    const delt = harGyldigSamtykke(elevRader, {
      scope: WANG_PLAN_SCOPE,
      mottakerGruppeId: gruppeId,
      kreverForesatt,
      fodselsdato: m.user.dateOfBirth,
    });
    grunnlag.push({
      id: m.userId,
      kreverForesatt,
      fodselsdato: m.user.dateOfBirth,
      samtykkeRader: elevRader,
      okter: delt ? await hentOkter(m.userId, gruppeId, fra, now) : [],
    });
  }
  return byggWangPlanData(grunnlag, gruppeId, now);
}

async function hentOkter(userId: string, gruppeId: string, fra: Date, now: Date): Promise<WangPlanGrunnlag["okter"]> {
  const [okter, gruppeKopier] = await Promise.all([
    loadVisibleSessionRange(userId, fra.toISOString(), now.toISOString()),
    // Kopier av økter WANG-gruppa la inn i elevens plan: morgentreningen.
    prisma.workbenchSession.findMany({
      where: {
        playerId: userId,
        groupId: gruppeId,
        sourceGroupSessionId: { not: null },
        date: { gte: tilDatoKolonne(OSLO_YMD_FMT.format(fra)), lte: tilDatoKolonne(OSLO_YMD_FMT.format(now)) },
      },
      select: { id: true },
    }),
  ]);
  const fraGruppa = new Set(gruppeKopier.map((o) => o.id));
  return okter.map((o) => ({
    scheduledAt: o.startTime,
    durationMin: o.durationMin,
    status: o.status,
    akse: o.pyramidArea,
    fraGruppa: o.model === "wb" && fraGruppa.has(o.id),
  }));
}
