/**
 * Teknisk Team Norway-reise J05. Ingen visuell fasit.
 * Oversikt → poster/dokumenter → spillerpost → testføring i PlayerHQ → historikk.
 */

import { tnDefinitionId, tnComparableResult } from "@/lib/portal-tester/tn-integration";
import { TN_VERSION, type TnProtocol } from "@/lib/portal-tester/tn-catalog";

export const TN_REISE = [
  { steg: "oversikt", href: "/team-norway", vakt: "hentTnOversiktForBruker" },
  { steg: "gruppeposter", href: "/team-norway/[groupId]", vakt: "hentGruppepostSide + kanonisk slug" },
  { steg: "dokumenter", href: "/team-norway/[groupId]/dokumenter", vakt: "hentGruppeDokumenter + kanonisk slug" },
  { steg: "spillerpost", href: "/team-norway/spiller/[spillerId]", vakt: "hentSpillerpostTidslinje + TN-trener" },
  { steg: "tildeling", href: "/admin/spillere/[id]/tester", vakt: "tildelTest tn-v3 + coach-omfang" },
  { steg: "testforing", href: "/portal/tren/tester/team-norway", vakt: "saveTnTest own session" },
  { steg: "korrigering-angre", href: "/portal/tren/tester/team-norway?test=[protokoll]", vakt: "utkast-revisjon, abort, ny økt etter fullført" },
  { steg: "historikk", href: "/admin/spillere/[id]/tester", vakt: "tnHistorikkRader samme variant" },
] as const;

export function tnGruppeHref(groupId: string): string {
  return `/team-norway/${groupId}`;
}

export function tnDokumenterHref(groupId: string): string {
  return `/team-norway/${groupId}/dokumenter`;
}

export function tnSpillerpostHref(spillerId: string): string {
  return `/team-norway/spiller/${spillerId}`;
}

export function tnTestforingHref(protocolId?: string): string {
  const base = "/portal/tren/tester/team-norway";
  return protocolId ? `${base}?test=${protocolId}` : base;
}

/** Korrigering av en fullført test åpner alltid et nytt forsøk, aldri den gamle økt-id-en. */
export function tnNyForsokHref(protocolId: string): string {
  return tnTestforingHref(protocolId);
}

export function tnKorrigeringGjenbrukerOkt(href: string, sessionId: string): boolean {
  return href.includes(`session=${sessionId}`);
}

/** Testlenken i oversikten vises bare for spillerrollen, ikke for trener eller admin. */
export function tnOversiktTestHref(rolle: string): string | null {
  return rolle === "PLAYER" ? tnTestforingHref() : null;
}

export function tnSammeTestvariant(protokoll: TnProtocol, score: number, details: unknown) {
  const testId = tnDefinitionId(protokoll);
  const sammenlignbar = tnComparableResult(testId, score, details);
  if (!sammenlignbar) return null;
  if (sammenlignbar.version !== TN_VERSION) return null;
  if (sammenlignbar.protocolId !== protokoll.id) return null;
  if (sammenlignbar.count !== protokoll.rows.length) return null;
  return { testId, ...sammenlignbar };
}
