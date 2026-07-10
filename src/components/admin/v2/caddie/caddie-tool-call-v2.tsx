"use client";

/**
 * Caddie · tool-call-visning (v2). Rekomponert fra
 * src/components/admin/caddie/caddie-tool-call.tsx med v2-tokens — samme
 * TOOL_LABEL-oppslag og summarizeOutput-logikk, kun restylet.
 */

import { useState } from "react";
import { T, Icon } from "@/components/v2";
import type { CaddieToolCall } from "@/components/admin/caddie/types";

const TOOL_LABEL: Record<string, string> = {
  searchPlayers: "søkte i spillerlista",
  getPlayer: "hentet spillerprofil",
  getPlayerSessions: "hentet treningsøkter",
  getPlayerStats: "hentet spillerstatistikk",
  getUpcomingBookings: "hentet kommende bookinger",
  getOutstandingInvoices: "hentet utestående fakturaer",
  getRound: "hentet runde",
  getTournaments: "hentet turneringer",
  getActiveSubscriptions: "hentet abonnementer",
  getPlayerLatestSession: "hentet siste økt",
  draftPlayerMessage: "forberedte melding",
  draftBookingProposal: "forberedte booking",
  draftInvoiceReminder: "forberedte purring",
  draftPlayerNote: "forberedte notat",
  draftPlanAdjustment: "foreslo plan-endring",
};

function summarizeOutput(toolCall: CaddieToolCall): string {
  if (toolCall.state === "calling") return "Kjører…";
  if (toolCall.state === "error") return "Feilet";
  if (toolCall.needsApproval) return "Venter på godkjenning";
  const out = toolCall.output;
  if (!out || typeof out !== "object") return "Fullført";
  const o = out as Record<string, unknown>;
  if (typeof o.totalInactive === "number") return `${o.totalInactive} spillere funnet`;
  if (typeof o.count === "number") return `${o.count} treff`;
  if (typeof o.totalOre === "number") return `${((o.totalOre as number) / 100).toLocaleString("nb-NO")} kr`;
  return "Fullført";
}

export function CaddieToolCallV2({ toolCall }: { toolCall: CaddieToolCall }) {
  const [open, setOpen] = useState(false);
  const label = TOOL_LABEL[toolCall.toolName] ?? `kjørte ${toolCall.toolName}`;

  return (
    <div style={{ marginBottom: 8, borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="v2-focus"
        aria-expanded={open}
        style={{
          display: "flex", width: "100%", alignItems: "center", gap: 8, padding: "8px 12px", textAlign: "left",
          fontFamily: T.ui, fontSize: 12, color: T.fg, background: "none", border: "none", cursor: "pointer",
        }}
      >
        <Icon name="cog" size={13} style={{ color: T.mut }} />
        <span style={{ fontWeight: 600 }}>Caddie {label}</span>
        <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mut }}>
          {summarizeOutput(toolCall)}
        </span>
        <Icon name={open ? "chevron-down" : "chevron-right"} size={13} style={{ color: T.mut }} />
      </button>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: `1px solid ${T.border}`, padding: "8px 12px" }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.mut }}>Input</div>
            <pre style={{ marginTop: 4, overflowX: "auto", borderRadius: 6, background: T.panel3, padding: "8px 10px", fontFamily: T.mono, fontSize: 11, color: T.fg }}>
              {JSON.stringify(toolCall.input, null, 2)}
            </pre>
          </div>
          {toolCall.output !== undefined && (
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.mut }}>Output</div>
              <pre style={{ marginTop: 4, overflowX: "auto", borderRadius: 6, background: T.panel3, padding: "8px 10px", fontFamily: T.mono, fontSize: 11, color: T.fg }}>
                {JSON.stringify(toolCall.output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
