/**
 * AgencyOS — Talent · Kohort-analyse (`/admin/talent/kohort`), v2.
 * Port av `(legacy)/talent/kohort/page.tsx` (2026-07-14, AgencyOS
 * Bølge 3.20) — aggregeringslogikken er 100% uendret, ny v2-presentasjon
 * i `AdminTalentKohortV2`.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminTalentKohortV2, type KohortAggV2, type NivaV2 } from "@/components/admin/v2/AdminTalentKohortV2";

const NIVAER: NivaV2[] = ["U10", "U12", "U14", "U16", "U18", "Senior"];

type RadarKey = "fysisk" | "teknikk" | "taktikk" | "mental" | "motivasjon";

function avg(values: Array<number | null | undefined>): number | null {
  const filtered = values.filter((v): v is number => typeof v === "number");
  if (filtered.length === 0) return null;
  return filtered.reduce((sum, v) => sum + v, 0) / filtered.length;
}

export default async function TalentKohort() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const tracking = await prisma.talentTracking.findMany({
    select: { niva: true, fysisk: true, teknikk: true, taktikk: true, mental: true, motivasjon: true, inkludertFra: true },
  });

  const tre_mnd_siden = new Date();
  tre_mnd_siden.setMonth(tre_mnd_siden.getMonth() - 3);

  const kohorter: KohortAggV2[] = NIVAER.map((niva) => {
    const rader = tracking.filter((t) => t.niva === niva);
    const snitt: Record<RadarKey, number | null> = {
      fysisk: avg(rader.map((r) => r.fysisk)),
      teknikk: avg(rader.map((r) => r.teknikk)),
      taktikk: avg(rader.map((r) => r.taktikk)),
      mental: avg(rader.map((r) => r.mental)),
      motivasjon: avg(rader.map((r) => r.motivasjon)),
    };
    const totalSnitt = avg(Object.values(snitt));
    const progresjon = rader.filter((r) => new Date(r.inkludertFra) >= tre_mnd_siden).length;
    return { niva, antall: rader.length, snitt, total: totalSnitt, progresjon };
  });

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminTalentKohortV2 kohorter={kohorter} totalSpillere={tracking.length} />
    </V2Shell>
  );
}
