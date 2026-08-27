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
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { harHake, STATUS_CAPS } from "@/components/workbench/wb-visuelt";
import type { SessionStatus } from "@/lib/domain/workbench/types";

export const dynamic = "force-dynamic";

export default async function WorkbenchDagensOkterPage() {
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  const iDag = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date());
  const res = await loadPlayerDay({ playerId: user.id, date: iDag });

  return (
    <div style={{ minHeight: "100dvh", background: TL.scene, color: TL.text, fontFamily: TL.font.sans }}>
      <div
        className="mx-auto w-full max-w-[460px] px-4 pb-8 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6"
        style={{ paddingTop: "calc(12px + env(safe-area-inset-top))" }}
      >
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontWeight: 700, fontSize: 26, letterSpacing: "-0.01em", color: TL.text }}>
            {UI.today}
          </h1>
          <span style={{ display: "block", marginTop: 4, fontFamily: TL.font.mono, fontSize: 11, letterSpacing: TL.track.capsSm, textTransform: "uppercase", color: TL.mute }}>
            Workbench
          </span>
        </header>

        {!res.ok ? (
          <FeilKort melding={res.error} />
        ) : res.data.sessions.length === 0 ? (
          <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>
            <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: 0 }}>{UI.playerNoSessions}</p>
          </div>
        ) : (
          <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 0 }}>
            {res.data.sessions.map((s, i) => {
              const status = s.status as SessionStatus;
              return (
                <Link
                  key={s.id}
                  href={`/portal/tren/wb/${s.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 20px",
                    borderTop: i === 0 ? "none" : `1px solid ${TL.hair}`,
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <span style={{ width: 44, flex: "none", fontFamily: TL.font.mono, fontSize: 12, fontWeight: 700, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                    {formatTime(s.startMinute)}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>{s.title}</span>
                    <span style={{ display: "block", marginTop: 2, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>
                      {PYRAMID_LABEL[s.pyramid as keyof typeof PYRAMID_LABEL] ?? s.pyramid} · {formatMinutes(s.durationMinutes)}
                    </span>
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      flex: "none",
                      fontFamily: TL.font.mono,
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: TL.track.capsSm,
                      color: harHake(status) ? TL.warm : TL.mute,
                    }}
                  >
                    {harHake(status) && <Icon name="check" size={10} style={{ color: TL.warm }} />}
                    {STATUS_CAPS[status]}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function FeilKort({ melding }: { melding: string }) {
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Icon name="triangle-alert" size={16} style={{ color: TL.danger }} />
        <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>{melding}</span>
      </div>
    </div>
  );
}
