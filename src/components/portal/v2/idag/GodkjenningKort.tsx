"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TL } from "@/lib/v2/train-lock";
import { resolvePlayerApproval } from "@/lib/workbench/wb-actions";
import { UI as WB_UI, PYRAMID_LABEL, formatMinutes, formatTime } from "@/lib/domain/workbench/labels";
import type { PlayerDaySession } from "@/lib/workbench/wb-actions";

export function GodkjenningKort({ okt, onFerdig }: { okt: PlayerDaySession; onFerdig: (id: string) => void }) {
  const router = useRouter();
  const [travel, start] = useTransition();
  const [handling, setHandling] = useState<"ACCEPTED" | "REJECTED" | null>(null);
  const kilde = okt.origin === "GROUP" ? WB_UI.approvalFromGroup : WB_UI.approvalFromCoach;

  function svar(decision: "ACCEPTED" | "REJECTED") {
    setHandling(decision);
    start(async () => {
      try {
        const res = await resolvePlayerApproval({ sessionId: okt.id, decision });
        if (!res.ok) {
          toast.error(res.error);
          setHandling(null);
          return;
        }
        toast.success(decision === "ACCEPTED" ? WB_UI.approvalAccepted : WB_UI.approvalRejected);
        onFerdig(okt.id);
        router.refresh();
      } catch {
        toast.error(WB_UI.unknownError);
        setHandling(null);
      }
    });
  }

  return (
    <div
      data-od-id="wb-idag-godkjenning"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: TL.elev,
        borderRadius: TL.radius.card,
        padding: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: TL.warm, flex: "none" }} aria-hidden />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: TL.mute,
          }}
        >
          {kilde}
        </span>
      </div>
      <div>
        <h3 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 16, fontWeight: 600, color: TL.text }}>{okt.title}</h3>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: TL.mute }}>
          {formatTime(okt.startMinute)} · {formatMinutes(okt.durationMinutes)} ·{" "}
          {PYRAMID_LABEL[okt.pyramid as keyof typeof PYRAMID_LABEL] ?? okt.pyramid}
        </p>
      </div>
      {okt.drillsCount > 0 && (
        <p style={{ margin: 0, fontSize: 13, color: TL.mute }}>
          {WB_UI.approvalDrillsCount(okt.drillsCount)}
        </p>
      )}
      {okt.notes && (
        <p
          style={{
            margin: 0,
            background: TL.dock,
            borderRadius: TL.radius.row,
            padding: "10px 12px",
            fontSize: 13,
            color: TL.text,
            lineHeight: 1.5,
          }}
        >
          «{okt.notes}»
        </p>
      )}
      <p style={{ margin: 0, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>{WB_UI.approvalRejectHint}</p>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          type="button"
          className="v2-press v2-focus"
          disabled={travel}
          onClick={() => svar("ACCEPTED")}
          data-od-id="wb-idag-godkjenning-godta"
          style={{
            flex: 1,
            minHeight: 48,
            borderRadius: TL.radius.pill,
            border: "none",
            background: TL.ok,
            color: TL.scene,
            fontFamily: TL.font.sans,
            fontSize: 16,
            fontWeight: 700,
            cursor: travel ? "default" : "pointer",
            opacity: travel && handling !== "ACCEPTED" ? 0.5 : 1,
          }}
        >
          {handling === "ACCEPTED" ? WB_UI.approvalAccepting : WB_UI.approvalAccept}
        </button>
        <button
          type="button"
          className="v2-press v2-focus"
          disabled={travel}
          onClick={() => svar("REJECTED")}
          data-od-id="wb-idag-godkjenning-avvis"
          style={{
            flex: 1,
            minHeight: 48,
            borderRadius: TL.radius.pill,
            border: `1px solid ${TL.hair}`,
            background: "transparent",
            color: TL.mute,
            fontFamily: TL.font.sans,
            fontSize: 15,
            fontWeight: 600,
            cursor: travel ? "default" : "pointer",
            opacity: travel && handling !== "REJECTED" ? 0.5 : 1,
          }}
        >
          {handling === "REJECTED" ? WB_UI.approvalRejecting : WB_UI.approvalReject}
        </button>
      </div>
    </div>
  );
}
