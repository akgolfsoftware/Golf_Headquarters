/**
 * PH02WbDag — dagens Workbench-økter i PlayerHQSkall.
 * Kun PUBLISHED, IN_PROGRESS og COMPLETED. Lenker til øktarket.
 * Øktarket selv er ikke portet. Tegningen ui_kits/playerhq/screens/PH-02.jsx ligger ikke i git.
 */

import Link from "next/link";
import { CalendarDays, Check } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { loadPlayerDay } from "@/lib/workbench/wb-actions";
import { UI, PYRAMID_LABEL, formatMinutes, formatTime } from "@/lib/domain/workbench/labels";
import { harHake, STATUS_CAPS } from "@/components/workbench/wb-visuelt";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { AkseMerke, FeilTilstand, Ikon, Sidehode, StatusPille, TomTilstand, type Akse } from "@/components/precision/pa";
import type { PyramidArea } from "@/lib/domain/workbench/types";
import type { SessionStatus } from "@/lib/domain/workbench/types";

export const dynamic = "force-dynamic";

const AKSE: Record<PyramidArea, Akse> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };

export default async function WorkbenchDagensOkterPage() {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  const iDag = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date());
  const [res, ulest] = await Promise.all([
    loadPlayerDay({ playerId: user.id, date: iDag }),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side ph-wbdag">
        <Sidehode kicker="Workbench" title={UI.today} />
        {!res.ok ? (
          <FeilTilstand icon={CalendarDays} title="Kunne ikke hente dagens økter" text={res.error} />
        ) : res.data.sessions.length === 0 ? (
          <TomTilstand icon={CalendarDays} title={UI.playerNoSessions} text="Nye økter vises her når de er publisert." />
        ) : (
          <ul className="ph-wbdag-liste">
            {res.data.sessions.map((s) => {
              const status = s.status as SessionStatus;
              const akse = s.pyramid as PyramidArea;
              return (
                <li key={s.id}>
                  <Link href={`/portal/tren/wb/${s.id}`}>
                    <span className="ph-wbdag-kl">{formatTime(s.startMinute)}</span>
                    <span className="ph-wbdag-tekst">
                      <strong>{s.title}</strong>
                      <small>{PYRAMID_LABEL[akse] ?? s.pyramid} · {formatMinutes(s.durationMinutes)}</small>
                    </span>
                    {AKSE[akse] && <AkseMerke axis={AKSE[akse]} size="sm" />}
                    <StatusPille tone={status === "IN_PROGRESS" ? "live" : "neutral"}>
                      {harHake(status) && <Ikon icon={Check} size={12} name="check" />}
                      {STATUS_CAPS[status]}
                    </StatusPille>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PlayerHQSkall>
  );
}
