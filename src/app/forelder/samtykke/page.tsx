/**
 * v2-forhåndsvisning — Foreldreportal · Samtykke (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver forelder-layouten — kun root-layout.
 * V2Shell leverer chrome-en (IkonRail/BunnNav med FORELDER_NAV), ForelderSamtykkeV2
 * rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden (src/app/forelder/samtykke/page.tsx):
 * kun PARENT slippes inn, relasjoner + siste slette-forespørsel hentes uendret, og
 * samtykke-håndhevelsen bor uendret i server-actionene komponenten kaller.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, FORELDER_NAV } from "@/components/v2/shell";
import {
  ForelderSamtykkeV2,
  type ForelderSamtykkeData,
} from "@/components/portal/v2/ForelderSamtykkeV2";

export const dynamic = "force-dynamic";

export default async function V2ForelderSamtykkePreviewPage() {
  const user = await requirePortalUser({ allow: ["PARENT"] });

  const relasjoner = await prisma.parentRelation.findMany({
    where: { parentId: user.id, approved: true },
    include: {
      child: {
        select: { id: true, name: true, email: true, preferences: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const sisteSletting = await prisma.dataExportRequest.findFirst({
    where: { userId: user.id, type: "DELETE" },
    orderBy: { createdAt: "desc" },
    select: { type: true, status: true, createdAt: true },
  });

  // Alle påkrevde samtykker aktive på alle barn (uendret regel fra ekte skjerm).
  const requiredKeys = ["dataDeling", "fotoBruk", "thirdParty"];
  const alleAktive =
    relasjoner.length > 0 &&
    relasjoner.every((r) => {
      const prefs =
        (r.child.preferences as Record<string, boolean> | null) ?? {};
      return requiredKeys.every((k) => prefs[k] !== false);
    });

  const barnNavn =
    relasjoner.length === 1
      ? (relasjoner[0]?.child.name.split(" ")[0] ?? "barnet") + "s"
      : "barnas";

  const data: ForelderSamtykkeData = {
    barn: relasjoner.map((r) => ({
      id: r.child.id,
      name: r.child.name,
      email: r.child.email,
      prefs: (r.child.preferences as Record<string, boolean> | null) ?? {},
    })),
    barnNavn,
    alleAktive,
    sisteSletting: sisteSletting
      ? {
          type: sisteSletting.type,
          status: sisteSletting.status,
          createdAt: sisteSletting.createdAt.toISOString(),
        }
      : null,
  };

  return (
    <V2Shell
      aktiv="oversikt"
      nav={FORELDER_NAV}
      navn={user.name}
      avatarUrl={user.avatarUrl}
    >
      <ForelderSamtykkeV2 data={data} />
    </V2Shell>
  );
}
