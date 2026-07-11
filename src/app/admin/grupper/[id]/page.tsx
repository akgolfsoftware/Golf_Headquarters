/**
 * AgencyOS Gruppe-detalj — v2. Auth/Prisma-loader bevart 1:1 fra legacy-
 * skjermen (admin/(legacy)/grupper/[id]). gruppe-actions.tsx (StartOkt/
 * LeggTilSpiller/FjernMedlem/SeAlleTimePlan/Detaljer/Aapne) er tailwind-
 * only og gjenbrukes uendret.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  GruppeDetaljV2,
  type GruppeDetaljV2Data,
} from "@/components/admin/v2/GruppeDetaljV2";
import {
  StartOktButton,
  LeggTilSpillerButton,
  FjernMedlemButton,
  SeAlleTimePlanButton,
  DetaljerButton,
  AapneButton,
} from "./gruppe-actions";

export const dynamic = "force-dynamic";

function fmtHcp(h: number | null): string {
  if (h == null) return "—";
  return h >= 0 ? h.toFixed(1).replace(".", ",") : `+${Math.abs(h).toFixed(1).replace(".", ",")}`;
}

function snittHcp(hcps: Array<number | null>): string {
  const valid = hcps.filter((h): h is number => h != null);
  if (valid.length === 0) return "—";
  const avg = valid.reduce((s, n) => s + n, 0) / valid.length;
  return fmtHcp(avg);
}

function typeLabel(level: string | null): string {
  if (!level) return "Klubb";
  if (level.startsWith("S")) return "Skole";
  if (level.startsWith("A")) return "Selektert";
  return "Klubb";
}

export default async function GruppeDetaljPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ trinn?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;
  const { trinn } = await searchParams;

  const gruppe = await prisma.group.findUnique({
    where: { id },
    include: {
      coach: { select: { id: true, name: true, email: true, avatarUrl: true } },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              hcp: true,
              avatarUrl: true,
              homeClub: true,
              tier: true,
              schoolYear: true,
            },
          },
        },
      },
      schedules: { orderBy: { startAt: "asc" } },
      _count: { select: { members: true, schedules: true } },
    },
  });

  if (!gruppe) notFound();

  const memberIds = gruppe.members.map((m) => m.userId);
  const naa = new Date();
  const nittiDagerSiden = new Date(naa.getTime() - 90 * 24 * 60 * 60 * 1000);

  const [runderPerMedlem, planerPerMedlem] = await Promise.all([
    memberIds.length > 0
      ? prisma.round.groupBy({
          by: ["userId"],
          where: { userId: { in: memberIds }, playedAt: { gte: nittiDagerSiden } },
          _count: { _all: true },
          _avg: { score: true },
        })
      : Promise.resolve([] as Array<{ userId: string; _count: { _all: number }; _avg: { score: number | null } }>),
    memberIds.length > 0
      ? prisma.trainingPlan.findMany({
          where: { userId: { in: memberIds }, isActive: true },
          select: { id: true, userId: true, name: true, sessions: { select: { status: true } } },
        })
      : Promise.resolve([]),
  ]);

  const runderMap = new Map(runderPerMedlem.map((r) => [r.userId, r]));
  const planMap = new Map(planerPerMedlem.map((p) => [p.userId, p]));

  const kandidaterRaw = await prisma.user.findMany({
    where: { role: "PLAYER", deletedAt: null, id: { notIn: memberIds } },
    select: { id: true, name: true, hcp: true, homeClub: true },
    orderBy: { name: "asc" },
  });
  const kandidater = kandidaterRaw.map((k) => ({ ...k, name: k.name ?? "Ukjent" }));

  const nesteSamling = gruppe.schedules.find((s) => s.startAt > naa) ?? gruppe.schedules[0] ?? null;
  const kommendeSamlinger = gruppe.schedules.filter((s) => s.startAt > naa).slice(0, 5);

  const snittHcpVerdi = snittHcp(gruppe.members.map((m) => m.user.hcp));
  const proAndel =
    gruppe.members.length > 0
      ? Math.round((gruppe.members.filter((m) => m.user.tier === "PRO").length / gruppe.members.length) * 100)
      : 0;
  const totalRunder = runderPerMedlem.reduce((s, r) => s + r._count._all, 0);

  const visteMedlemmer = trinn ? gruppe.members.filter((m) => m.user.schoolYear === trinn) : gruppe.members;
  const trinnValg = [...new Set(gruppe.members.map((m) => m.user.schoolYear).filter((v): v is string => !!v))].sort();

  const data: GruppeDetaljV2Data = {
    id: gruppe.id,
    navn: gruppe.name,
    type: typeLabel(gruppe.level),
    antallMedlemmer: gruppe._count.members,
    antallHjelpetrenere: gruppe.members.filter((m) => m.role === "ASSISTANT").length,
    snittHcp: snittHcpVerdi,
    totalRunder,
    proAndel,
    antallSamlinger: gruppe._count.schedules,
    coachNavn: gruppe.coach?.name ?? null,
    coachEpost: gruppe.coach?.email ?? null,
    nesteSamling: nesteSamling
      ? {
          id: nesteSamling.id,
          title: nesteSamling.title,
          startAt: nesteSamling.startAt.toISOString(),
          location: nesteSamling.location,
          recurring: nesteSamling.recurring,
          maxParticipants: nesteSamling.maxParticipants,
          description: nesteSamling.description,
        }
      : null,
    kommendeSamlinger: kommendeSamlinger.map((s) => ({
      id: s.id,
      title: s.title,
      startAt: s.startAt.toISOString(),
      location: s.location,
      recurring: s.recurring,
      maxParticipants: s.maxParticipants,
    })),
    medlemmer: visteMedlemmer.map((m) => {
      const runder = runderMap.get(m.userId);
      const plan = planMap.get(m.userId);
      const planTotal = plan?.sessions.length ?? 0;
      const planDone = plan?.sessions.filter((s) => s.status === "COMPLETED").length ?? 0;
      const planAndel = planTotal === 0 ? 0 : Math.round((planDone / planTotal) * 100);
      return {
        id: m.id,
        userId: m.userId,
        navn: m.user.name ?? "Ukjent",
        avatarUrl: m.user.avatarUrl,
        homeClub: m.user.homeClub,
        erHjelpetrener: m.role === "ASSISTANT",
        erPro: m.user.tier === "PRO",
        schoolYear: m.user.schoolYear,
        hcp: m.user.hcp,
        runder90d: runder?._count._all ?? 0,
        planNavn: plan?.name ?? null,
        planAndel,
        planDone,
        planTotal,
      };
    }),
    trinnValg,
    aktivtTrinn: trinn ?? null,
    kandidater,
  };

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <GruppeDetaljV2
        data={data}
        actions={{
          StartOktButton,
          LeggTilSpillerButton,
          FjernMedlemButton,
          SeAlleTimePlanButton,
          DetaljerButton,
          AapneButton,
        }}
      />
    </V2Shell>
  );
}
