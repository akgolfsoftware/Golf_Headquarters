/**
 * Teknisk reisekart for innlogget PlayerHQ-økt.
 * Tre modeller holdes adskilt. Ingen visuell fasit.
 */

import { idagNaaCta } from "@/lib/portal/idag-visning";
import { liveHrefForStatus, type LiveSessionKind } from "./live-route";

export type PersistensStatus = "usent" | "lagrer" | "lagret" | "feilet";
export type OktLiv = "planlagt" | "pagar" | "fullfort" | "avbrutt";
export type ReiseSteg = "router" | "ph04" | "ph05" | "ph06" | "utenfor-live";

export function liveRouterHref(sessionId: string): string {
  return `/portal/live/${sessionId}`;
}

export function idagCtaForOkt(kind: LiveSessionKind, sessionId: string, status: string) {
  return idagNaaCta({ id: sessionId, modell: kind, status });
}

export function stegFraLiveHref(href: string): ReiseSteg {
  if (href.endsWith("/summary")) return "ph06";
  if (href.endsWith("/tapper") || href.endsWith("/active")) return "ph05";
  if (href.endsWith("/brief")) return "ph04";
  if (/^\/portal\/live\/[^/]+$/.test(href)) return "router";
  return "utenfor-live";
}

export function liveSteg(kind: LiveSessionKind, sessionId: string, status: string) {
  const href = liveHrefForStatus(kind, status, sessionId);
  return { href, steg: stegFraLiveHref(href) };
}

export function oktLivFraStatus(kind: LiveSessionKind, status: string): OktLiv {
  if (kind === "v2") {
    if (status === "IN_PROGRESS") return "pagar";
    if (status === "COMPLETED") return "fullfort";
    if (status === "CANCELLED" || status === "SKIPPED") return "avbrutt";
    return "planlagt";
  }
  if (status === "IN_PROGRESS" || status === "ACTIVE" || status === "PAUSED") return "pagar";
  if (status === "COMPLETED") return "fullfort";
  if (status === "CANCELLED" || status === "SKIPPED" || status === "ABANDONED") return "avbrutt";
  return "planlagt";
}

/** Øktens liv og lagringsforsøket er ulike felt. De skal aldri slås sammen. */
export function skillOktOgPersistens(liv: OktLiv, persistens: PersistensStatus) {
  return { liv, persistens };
}

export function registrerteTapperTall(counts: ReadonlyArray<{ count: number }>): number {
  return counts.reduce((sum, rad) => sum + rad.count, 0);
}

export function registrerteV2Tall(completedSummary: unknown): {
  totalReps: number;
  drillsCompleted: number;
  durationSec: number;
} | null {
  if (!completedSummary || typeof completedSummary !== "object" || Array.isArray(completedSummary)) {
    return null;
  }
  const live = (completedSummary as { liveSummary?: unknown }).liveSummary;
  if (!live || typeof live !== "object" || Array.isArray(live)) return null;
  const rad = live as {
    totalReps?: unknown;
    drillsCompleted?: unknown;
    durationSec?: unknown;
  };
  if (typeof rad.totalReps !== "number" || typeof rad.drillsCompleted !== "number" || typeof rad.durationSec !== "number") {
    return null;
  }
  return {
    totalReps: rad.totalReps,
    drillsCompleted: rad.drillsCompleted,
    durationSec: rad.durationSec,
  };
}
