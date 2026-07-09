"use client";

import { useTransition, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { acceptPlanAction, rejectPlanAction } from "@/lib/agents/actions";
import type { WorkbenchAgentFeed } from "@/lib/workbench/agent-feed";
import { FONT, WB } from "./theme";

type Props = {
  feed: WorkbenchAgentFeed | null;
  coachMode?: boolean;
};

export function SignalFeedPanel({ feed, coachMode }: Props): ReactElement | null {
  const router = useRouter();
  const [pending, start] = useTransition();

  if (!feed || (feed.signals.length === 0 && feed.planActions.length === 0)) {
    return null;
  }

  return (
    <div
      style={{
        flexShrink: 0,
        padding: "10px 14px",
        borderBottom: `1px solid ${WB.panelBorder}`,
        background: WB.railBg,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: FONT.mono,
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: WB.muted,
        }}
      >
        Agent-feed
      </p>

      {feed.signals.slice(0, 5).map((s) => (
        <div
          key={s.id}
          style={{
            fontFamily: FONT.mono,
            fontSize: 10.5,
            color: WB.muted,
            lineHeight: 1.4,
          }}
        >
          <span style={{ color: WB.lime }}>{s.kind}</span>
          {s.value != null ? ` · ${s.value.toFixed(2)}` : ""}
        </div>
      ))}

      {feed.planActions.map((a) => (
        <div
          key={a.id}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            padding: "6px 8px",
            borderRadius: 8,
            border: `1px solid ${WB.panelBorder}`,
            background: WB.panelBg,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: WB.lime,
                textTransform: "uppercase",
              }}
            >
              {a.actionType.replace(/_/g, " ")}
            </div>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 11,
                lineHeight: 1.45,
                color: WB.text,
              }}
            >
              {a.forklaring}
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontFamily: FONT.mono,
                fontSize: 9,
                color: WB.muted,
              }}
            >
              {a.agentName}
            </p>
          </div>
          {coachMode ? (
            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await acceptPlanAction(a.id);
                    router.refresh();
                  })
                }
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "none",
                  background: WB.lime,
                  color: WB.limeDark,
                  cursor: pending ? "wait" : "pointer",
                }}
              >
                OK
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await rejectPlanAction(a.id);
                    router.refresh();
                  })
                }
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: `1px solid ${WB.panelBorder}`,
                  background: "transparent",
                  color: WB.muted,
                  cursor: pending ? "wait" : "pointer",
                }}
              >
                Avvis
              </button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}