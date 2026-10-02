/**
 * AgencyOS · GDPR-kø (/admin/gdpr) — ADMIN-only.
 * AG-24 i Precision Athletics: visningen ligger i AG24Drift.
 * Uløste DataExportRequest.
 */

import type { Metadata } from "next";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG24Gdpr, type GdprData as AdminGdprData } from "@/components/admin/precision/AG24Drift";
import { utforSletteforesporsel, avvisForesporsel } from "./actions";

export const metadata: Metadata = {
  title: "GDPR · AgencyOS",
};

function dagerSiden(d: Date): number {
  return Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
}

export default async function GdprKoPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  const pending = await prisma.dataExportRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  const brukerIder = [
    ...new Set(
      pending.flatMap((r) => [r.userId, r.subjectUserId].filter(Boolean) as string[]),
    ),
  ];
  const brukere = await prisma.user.findMany({
    where: { id: { in: brukerIder } },
    select: { id: true, name: true, email: true },
  });
  const navnFor = (id: string | null) => {
    if (!id) return "—";
    const u = brukere.find((b) => b.id === id);
    return u ? `${u.name ?? "?"} (${u.email ?? id})` : id;
  };

  const data: AdminGdprData = {
    rader: pending.map((r) => {
      const alder = dagerSiden(r.createdAt);
      return {
        id: r.id,
        type: r.type,
        alder,
        forsinket: alder >= 25,
        bedtAv: navnFor(r.userId),
        gjelder: navnFor(r.subjectUserId ?? r.userId),
      };
    }),
  };

  return (
    <AgencyOSSkall navn={user.name ?? "Admin"}>
      <AG24Gdpr
        data={data}
        utforSletteforesporsel={utforSletteforesporsel}
        avvisForesporsel={avvisForesporsel}
      />
    </AgencyOSSkall>
  );
}
