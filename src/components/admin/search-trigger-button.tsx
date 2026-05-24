"use client";

// Liten klient-knapp som åpner global Cmd+K søk-modal via custom-event.
// Brukes fra server-components hvor vi ikke kan kalle hooks direkte.

import { Search } from "lucide-react";

const ICON_STROKE = 1.75;

export function SearchTriggerButton() {
  function open() {
    window.dispatchEvent(new CustomEvent("global-search:open"));
  }

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Åpne globalt søk (Cmd+K)"
      className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10"
    >
      <Search className="h-4 w-4" strokeWidth={ICON_STROKE} aria-hidden />
      Søk overalt
      <span className="ml-1 hidden rounded border border-border bg-background px-1 font-mono text-[10px] text-muted-foreground sm:inline">
        ⌘K
      </span>
    </button>
  );
}
