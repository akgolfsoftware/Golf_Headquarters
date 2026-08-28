"use client";

import type { AgenticosBroStatus } from "@/lib/jarvis/types";

/**
 * Jarvis-klientens lese-hook mot Agentic OS-status.
 * Data kommer fra server (hentAgenticosBro) — ingen egen fetch her.
 */
export function useAgenticosBro(data: AgenticosBroStatus): AgenticosBroStatus {
  return data;
}
