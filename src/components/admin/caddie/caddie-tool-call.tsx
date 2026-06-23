"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Cog } from "lucide-react";
import type { CaddieToolCall } from "./types";

type Props = {
  toolCall: CaddieToolCall;
};

const TOOL_LABEL: Record<string, string> = {
  // Lese-verktøy
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
  // Skrive-verktøy (forslag)
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
  if (typeof o.totalOre === "number")
    return `${((o.totalOre as number) / 100).toLocaleString("nb-NO")} kr`;
  return "Fullført";
}

export function CaddieToolCall({ toolCall }: Props) {
  const [open, setOpen] = useState(false);
  const label = TOOL_LABEL[toolCall.toolName] ?? `kjørte ${toolCall.toolName}`;

  return (
    <div className="mb-2 rounded-md border border-border bg-background/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-foreground transition-colors hover:bg-secondary/40"
        aria-expanded={open}
      >
        <Cog className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="font-medium">
          Caddie {label}
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {summarizeOutput(toolCall)}
        </span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        )}
      </button>
      {open && (
        <div className="space-y-2 border-t border-border px-4 py-2">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Input
            </div>
            <pre className="mt-1 overflow-x-auto rounded-sm bg-muted px-2 py-2 font-mono text-[11px] text-foreground">
              {JSON.stringify(toolCall.input, null, 2)}
            </pre>
          </div>
          {toolCall.output !== undefined && (
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Output
              </div>
              <pre className="mt-1 overflow-x-auto rounded-sm bg-muted px-2 py-2 font-mono text-[11px] text-foreground">
                {JSON.stringify(toolCall.output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
