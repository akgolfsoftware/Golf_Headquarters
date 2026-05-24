"use client";

// Liten klient-knapp som åpner global Cmd+K søk-modal for PlayerHQ
// via custom-event. Speilet fra admin-versjonen.

import { Search } from "lucide-react";

const ICON_STROKE = 1.75;

export function PortalSearchTriggerButton() {
  function open() {
    window.dispatchEvent(new CustomEvent("portal-search:open"));
  }

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Åpne globalt søk (Cmd+K)"
      className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9"
    >
      <Search className="h-4 w-4" strokeWidth={ICON_STROKE} aria-hidden />
      <span className="hidden sm:inline">Søk</span>
      <span className="ml-1 hidden rounded border border-border bg-card px-1.5 font-mono text-[10px] text-muted-foreground sm:inline">
        ⌘K
      </span>
    </button>
  );
}
