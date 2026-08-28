"use client";

/**
 * PortalStegListe — viser AI-ens verktøykall som en liste ("Leste ukeplanen
 * · 0,3 s"), matcher Paper-fasitens .steps-mønster (playerhq-chat-desktop.html).
 * Tiden er EKTE — målt server-side i hvert tool (tookMs, se
 * src/lib/portal-chat/tools.ts) — aldri en oppdiktet verdi.
 */

import { Check, Loader2, X } from "lucide-react";
import { TL } from "@/lib/v2/train-lock";

import { PORTAL_CHAT_TOOL_LABEL, type PortalChatToolName } from "@/lib/portal-chat/labels";
import type { PortalToolCall } from "./types";

function sekunder(ms: number): string {
  return `${(ms / 1000).toFixed(1).replace(".", ",")} s`;
}

function labelFor(toolName: string): string {
  return PORTAL_CHAT_TOOL_LABEL[toolName as PortalChatToolName] ?? `kjørte ${toolName}`;
}

export function PortalStegListe({ steg }: { steg: PortalToolCall[] }) {
  if (steg.length === 0) return null;
  return (
    <ul style={{ listStyle: "none", margin: "0 0 12px", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
      {steg.map((s) => {
        const feilet = s.state === "error" || s.output?.ok === false;
        const ferdig = s.state === "result";
        return (
          <li key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: TL.mute }}>
            {feilet ? (
              <X size={14} style={{ color: TL.danger, flex: "none" }} />
            ) : ferdig ? (
              <Check size={14} style={{ color: TL.ok, flex: "none" }} />
            ) : (
              <Loader2 size={14} style={{ color: TL.mute, flex: "none" }} className="animate-spin" />
            )}
            <span>{labelFor(s.toolName)}</span>
            {ferdig && typeof s.output?.tookMs === "number" && (
              <span style={{ marginLeft: "auto", fontFamily: TL.font.mono, fontSize: 11.5, color: TL.mute }}>
                {sekunder(s.output.tookMs)}
              </span>
            )}
            {feilet && (
              <span style={{ marginLeft: "auto", fontFamily: TL.font.mono, fontSize: 11.5, color: TL.danger }}>Feilet</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
