/**
 * PlayerHQ · Utenfor banen (/portal/utenfor-banen) — Precision Athletics PH-26.
 * Kilde: AK Golf Precision Athletics PH-26 (Utenfor banen, ui_kits/playerhq/screens/PH-26.jsx).
 * Hub for FYS-økt, utfordringer, putte-lab, turneringer og ukesdigest.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getFysiskData } from "@/lib/portal-fysisk/fysisk-data";
import { hentVennerData } from "@/lib/venner/actions";
import { startOfDay, endOfDay } from "@/lib/uke-helpers";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH26UtenforBanen } from "@/components/portal/precision/PH26UtenforBanen";

export const dynamic = "force-dynamic";

const OSLO_TID = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Oslo",
});
const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "long",
  timeZone: "Europe/Oslo",
});

export default async function UtenforBanenPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const idag = new Date();

  const [dagensFys, fysisk, venner, utfordringer] = await Promise.all([
    prisma.trainingPlanSession.findFirst({
      where: {
        plan: { userId: user.id },
        pyramidArea: "FYS",
        status: "PLANNED",
        scheduledAt: { gte: startOfDay(idag), lte: endOfDay(idag) },
      },
      orderBy: { scheduledAt: "asc" },
      select: { id: true, title: true, scheduledAt: true, durationMin: true, location: true },
    }),
    getFysiskData(user.id),
    hentVennerData(),
    // Samme spørring som /portal/utfordringer (eier eller deltaker).
    prisma.drillChallenge.findMany({
      where: {
        OR: [{ ownerId: user.id }, { participants: { some: { userId: user.id } } }],
      },
      include: {
        owner: { select: { id: true, name: true } },
        participants: { select: { id: true, userId: true, score: true, rank: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const aktive = utfordringer.filter((u) => u.status === "ACTIVE");
  const mappedChallenges = aktive.map((u) => {
    return {
      id: u.id,
      title: u.name,
      status: "Aktiv" as const,
      win: "hi" as const,
      unit: "treff",
      ends: u.endAt ? OSLO_DATO.format(u.endAt) : "14 dager",
      by: u.owner.name,
      rows: [
        [u.owner.name, null],
        ...u.participants.map((p) => [p.userId === user.id ? user.name : "Deltaker", p.score] as [string, number | null]),
      ] as [string, number | null][],
    };
  });

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH26UtenforBanen
        spillerNavn={user.name}
        dagensFysOkt={
          dagensFys
            ? {
                tittel: dagensFys.title,
                tid: OSLO_TID.format(dagensFys.scheduledAt),
                varighetMin: dagensFys.durationMin,
                sted: dagensFys.location ?? undefined,
                ovelser: fysisk.okt
                  ? fysisk.okt.styrke.map((o) => {
                      const s0 = o.startSett[0];
                      return {
                        navn: o.navn,
                        mengde: s0 ? `${o.startSett.length} × ${s0.reps}${s0.vekt > 0 ? ` @ ${s0.vekt} kg` : ""}` : "Styrke",
                        rir: "RIR 2",
                      };
                    })
                  : undefined!,
              }
            : null
        }
        venner={venner.venner.map((v) => ({ id: v.id, name: v.name }))}
        utfordringer={mappedChallenges}
      />
    </PlayerHQSkall>
  );
}
