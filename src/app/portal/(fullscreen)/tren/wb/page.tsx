/**
 * Dagens Workbench-økter — spiller-liste (Loop 3S). Kun PUBLISHED |
 * IN_PROGRESS | COMPLETED (loadPlayerDay skjuler DRAFT). Lenker til
 * økt-arket der Start / Fullfør / Hopp over skjer.
 *
 * Egen, midlertidig inngang ved siden av «I dag» (chat-først) — full
 * integrasjon av loadPlayerDay i I dag hører til Loop 3.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadPlayerDay } from "@/lib/workbench/wb-actions";
import { UI, PYRAMID_LABEL, formatMinutes, formatTime } from "@/lib/domain/workbench/labels";
import { T } from "@/lib/v2/tokens";
import { Icon, Kort, Rad } from "@/components/v2";
import { harHake, STATUS_CAPS, WARM } from "@/components/workbench/wb-visuelt";
import type { SessionStatus } from "@/lib/domain/workbench/types";

export const dynamic = "force-dynamic";

export default async function WorkbenchDagensOkterPage() {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  const iDag = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date());
  const res = await loadPlayerDay({ playerId: user.id, date: iDag });

  return (
    <div style={{ minHeight: "100dvh", background: T.bg, color: T.fg, fontFamily: T.ui }}>
      <div
        className="mx-auto w-full max-w-[460px] px-4 pb-8 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6"
        style={{ paddingTop: "calc(12px + env(safe-area-inset-top))" }}
      >
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontFamily: T.disp, fontWeight: 600, fontSize: 17, color: T.fg }}>
            {UI.today}
          </h1>
          <span style={{ display: "block", marginTop: 2, fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>
            Workbench
          </span>
        </header>

        {!res.ok ? (
          <FeilKort melding={res.error} />
        ) : res.data.sessions.length === 0 ? (
          <Kort>
            <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, margin: 0 }}>{UI.playerNoSessions}</p>
          </Kort>
        ) : (
          <Kort eyebrow={UI.today}>
            {res.data.sessions.map((s, i) => {
              const status = s.status as SessionStatus;
              return (
                <Link key={s.id} href={`/portal/tren/wb/${s.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  <Rad
                    leading={
                      <span style={{ width: 44, flex: "none", fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.mut }}>
                        {formatTime(s.startMinute)}
                      </span>
                    }
                    title={s.title}
                    sub={`${PYRAMID_LABEL[s.pyramid as keyof typeof PYRAMID_LABEL] ?? s.pyramid} · ${formatMinutes(s.durationMinutes)}`}
                    trailing={
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontFamily: T.mono,
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          color: harHake(status) ? WARM : T.mut,
                        }}
                      >
                        {harHake(status) && <Icon name="check" size={10} style={{ color: WARM }} />}
                        {STATUS_CAPS[status]}
                      </span>
                    }
                    last={i === res.data.sessions.length - 1}
                  />
                </Link>
              );
            })}
          </Kort>
        )}
      </div>
    </div>
  );
}

function FeilKort({ melding }: { melding: string }) {
  return (
    <Kort>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Icon name="triangle-alert" size={16} style={{ color: T.down }} />
        <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2 }}>{melding}</span>
      </div>
    </Kort>
  );
}
