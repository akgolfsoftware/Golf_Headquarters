/**
 * Dagens Workbench-økter — spiller-liste (Loop 3S), Precision Athletics.
 * Kun PUBLISHED | IN_PROGRESS | COMPLETED (loadPlayerDay skjuler DRAFT).
 * Lenker til økt-arket (PH-03) der Start / Fullfør / Hopp over skjer.
 * Ingen egen tegning: bygd av samme deler som I dag (PH-01) og øktarket.
 */

import Link from "next/link";
import { CircleAlert, ListPlus } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadPlayerDay } from "@/lib/workbench/wb-actions";
import { UI, PYRAMID_LABEL, formatMinutes, formatTime } from "@/lib/domain/workbench/labels";
import type { SessionStatus } from "@/lib/domain/workbench/types";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { AkseMerke, FeilTilstand, KnappLenke, Meta, StatusPille, TomTilstand, type Akse } from "@/components/precision/pa";
import { SideHode } from "@/components/precision/pa-a4";
import "@/styles/precision-ph03.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dagens økter · PlayerHQ" };

const STATUS: Partial<Record<SessionStatus, { navn: string; tone: "neutral" | "live" | "ok" | "warn" }>> = {
  PUBLISHED: { navn: "Planlagt", tone: "neutral" }, SCHEDULED: { navn: "Planlagt", tone: "neutral" },
  IN_PROGRESS: { navn: "Pågår", tone: "live" }, COMPLETED: { navn: "Gjennomført", tone: "ok" },
  SKIPPED: { navn: "Hoppet over", tone: "warn" }, CANCELLED: { navn: "Avlyst", tone: "warn" },
};

export default async function WorkbenchDagensOkterPage() {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  const iDag = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date());
  const [res, uleste] = await Promise.all([
    loadPlayerDay({ playerId: user.id, date: iDag }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  const okter = res.ok ? res.data.sessions : [];

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <div className="pa-side">
        <SideHode kicker="Workbench" title={UI.today} />
        {!res.ok ? (
          <FeilTilstand icon={CircleAlert} title="Kunne ikke hente dagens økter" text={res.error}
            retry={<KnappLenke href="/portal" variant="secondary">{UI.backToToday}</KnappLenke>} />
        ) : okter.length === 0 ? (
          <TomTilstand icon={ListPlus} title={UI.playerNoSessions} text="Coachen legger inn øktene dine i planen."
            actions={<KnappLenke href="/portal/planlegge" variant="secondary">Åpne planen</KnappLenke>} />
        ) : (
          <ul className="pa-card ph03-liste" style={{ padding: "0 16px", margin: 0, listStyle: "none" }}>
            {okter.map((s) => {
              const st = STATUS[s.status as SessionStatus] ?? { navn: String(s.status), tone: "neutral" as const };
              return (
                <li key={s.id}>
                  <Link href={`/portal/tren/wb/${s.id}`} className="ph03-liste__rad">
                    <Meta style={{ font: "var(--type-num-s)" }}>{formatTime(s.startMinute)}</Meta>
                    <span style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                      <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <AkseMerke axis={s.pyramid.toLowerCase() as Akse} />
                        <span style={{ font: "500 15px/1.3 var(--font-sans)", color: "var(--text-primary)", flex: "1 1 160px", minWidth: 0, overflowWrap: "anywhere" }}>{s.title}</span>
                      </span>
                      <Meta>{`${PYRAMID_LABEL[s.pyramid as keyof typeof PYRAMID_LABEL] ?? s.pyramid} · ${formatMinutes(s.durationMinutes)}`.toUpperCase()}</Meta>
                    </span>
                    <StatusPille tone={st.tone}>{st.navn}</StatusPille>
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
