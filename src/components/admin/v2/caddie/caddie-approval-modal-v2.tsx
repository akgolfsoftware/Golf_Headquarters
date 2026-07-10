"use client";

/**
 * Caddie · godkjenningsmodal (v2). Rekomponert fra
 * src/components/admin/caddie/caddie-approval-modal.tsx med v2-tokens —
 * samme faseflyt (idle → executing → done/rejected/failed), samme
 * auto-lukk-timing.
 */

import { useEffect, useRef, useState } from "react";
import { T, Icon, Knapp } from "@/components/v2";
import type { CaddieToolCall } from "@/components/admin/caddie/types";
import type { ToolApprovalState } from "@/components/admin/caddie/use-caddie-chat";

type Props = {
  toolCall: CaddieToolCall | null;
  onApprove: (toolCallId: string) => Promise<ToolApprovalState>;
  onReject: (toolCallId: string) => Promise<ToolApprovalState>;
  onClose: () => void;
};

export function CaddieApprovalModalV2({ toolCall, onApprove, onReject, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "executing" | "done" | "rejected" | "failed">("idle");
  const [resultText, setResultText] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (toolCall) {
      setPhase("idle");
      setResultText(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolCall?.id]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!toolCall) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "executing") onClose();
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [toolCall, onClose, phase]);

  if (!toolCall || !toolCall.approvalPreview) return null;

  const { title, body, recipient } = toolCall.approvalPreview;

  const handleApprove = async () => {
    setPhase("executing");
    const result = await onApprove(toolCall.id);
    setResultText(result.summary ?? result.error ?? null);
    if (result.status === "done") {
      setPhase("done");
      setTimeout(() => onClose(), 1500);
    } else if (result.status === "failed") {
      setPhase("failed");
    } else {
      setPhase("idle");
    }
  };

  const handleReject = async () => {
    setPhase("executing");
    const result = await onReject(toolCall.id);
    setResultText(result.summary ?? null);
    setPhase("rejected");
    setTimeout(() => onClose(), 800);
  };

  const isBusy = phase === "executing";
  const isFinished = phase === "done" || phase === "rejected";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="caddie-approval-title-v2"
      className="fixed inset-0 z-[80] flex items-center justify-center px-4"
      style={{ background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }}
      onClick={() => {
        if (!isBusy) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 520, borderRadius: 20, border: `1px solid ${T.borderS}`, background: T.panel, boxShadow: "0 24px 60px rgba(0,0,0,0.5)", outline: "none" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${T.border}`, padding: "16px 22px" }}>
          <Icon name="mail" size={16} style={{ color: T.lime }} />
          <h2 id="caddie-approval-title-v2" style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", color: T.fg, margin: 0 }}>
            Caddie vil sende e-post
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "16px 22px" }}>
          {recipient && (
            <div style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mut }}>
              Til: <span style={{ color: T.fg }}>{recipient}</span>
            </div>
          )}
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mut }}>Emne</div>
            <div style={{ marginTop: 4, fontFamily: T.ui, fontSize: 13.5, fontWeight: 700, color: T.fg }}>{title}</div>
          </div>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mut }}>Forhåndsvisning</div>
            <pre style={{ marginTop: 4, maxHeight: 260, overflowY: "auto", whiteSpace: "pre-wrap", borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 14px", fontFamily: T.ui, fontSize: 13, color: T.fg }}>
              {body}
            </pre>
          </div>
          {resultText && (
            <div
              role="status"
              style={{
                borderRadius: 10, border: `1px solid ${phase === "failed" ? T.down : T.lime}`, padding: "10px 14px", fontFamily: T.ui, fontSize: 13,
                background: phase === "failed" ? `color-mix(in srgb, ${T.down} 10%, transparent)` : `color-mix(in srgb, ${T.lime} 6%, transparent)`,
                color: phase === "failed" ? T.down : T.fg,
              }}
            >
              {resultText}
            </div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: `1px solid ${T.border}`, padding: "14px 22px" }}>
          <Knapp ghost icon="x" disabled={isBusy || isFinished} onClick={handleReject}>Avvis</Knapp>
          <Knapp
            icon={isBusy ? "loader" : "check"}
            disabled={isBusy || isFinished}
            onClick={handleApprove}
          >
            {isBusy ? "Utfører…" : phase === "done" ? "Utført" : "Godkjenn og send"}
          </Knapp>
        </div>
      </div>
    </div>
  );
}
