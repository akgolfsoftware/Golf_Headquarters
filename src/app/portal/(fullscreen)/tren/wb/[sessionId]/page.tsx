/**
 * PH03WbArk — spillerens Workbench-øktark i PlayerHQSkall.
 * Start, fullfør og hopp over er beholdt. Utkast er fortsatt usynlig.
 * Tegningen ui_kits/playerhq/screens/PH-03.jsx ligger ikke i git.
 */

import Link from "next/link";
import { Eye, TriangleAlert } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { loadPlayerSession } from "@/lib/workbench/wb-actions";
import { UI } from "@/lib/domain/workbench/labels";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FeilTilstand } from "@/components/precision/pa";
import { OktArk } from "@/components/portal/workbench/OktArk";

export const dynamic = "force-dynamic";

export default async function WorkbenchOktPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  const { sessionId } = await params;
  const [res, ulest] = await Promise.all([
    loadPlayerSession(sessionId),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        {!res.ok ? (
          <FeilTilstand icon={TriangleAlert} title="Kunne ikke hente økten" text={res.error} />
        ) : !res.data ? (
          <FeilTilstand
            icon={Eye}
            title={UI.sessionNotFoundTitle}
            text={UI.sessionNotFoundBody}
            retry={<Link href="/portal" className="pa-btn pa-btn--primary">{UI.backToToday}</Link>}
          />
        ) : (
          <OktArk session={res.data} />
        )}
      </div>
    </PlayerHQSkall>
  );
}
