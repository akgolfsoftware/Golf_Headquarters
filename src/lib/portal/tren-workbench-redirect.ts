/**
 * Legacy /portal/tren/* planleggingsruter → Workbench hub.
 * Session-/test-gjennomføring (cuid-økt, test-wizard) beholdes uendret.
 */

const TAB_BY_PREFIX: [string, string][] = [
  ["/portal/tren/aarsplan", "gantt"],
  ["/portal/tren/teknisk-plan", "tek"],
  ["/portal/tren/turneringer", "seson"],
  ["/portal/tren/kalender", "uke"],
  ["/portal/tren/fys-plan", "std"],
  ["/portal/tren/ovelser", "std"],
];

/** cuid-lignende segment etter /portal/tren/ — live økt-detalj. */
const SESSION_ID = /^\/portal\/tren\/c[a-z0-9]{20,}(\/|$)/;

/** Tester under gjennomføring/opprettelse — ikke redirect. */
const TESTER_KEEP =
  /^\/portal\/tren\/tester\/(ny|egen|c[a-z0-9]{20,}|katalog\/)/;

/**
 * TesterV2/TurneringerV2 er ferdigbygde v2-skjermer på disse eksakte basene —
 * ikke redirect selve basen. Undersider/legacy-lenker under kan fortsatt gå
 * til Workbench (se TESTER_KEEP for tester, TAB_BY_PREFIX for turneringer).
 */
const TREN_V2_BASE = /^\/portal\/tren\/(tester|turneringer)\/?$/;

export function workbenchRedirectForTrenPath(path: string): string | null {
  if (!path.startsWith("/portal/tren")) return null;
  if (SESSION_ID.test(path)) return null;
  if (TESTER_KEEP.test(path)) return null;
  if (TREN_V2_BASE.test(path)) return null;
  if (path.startsWith("/portal/tren/feiring")) return null;

  if (path === "/portal/tren" || path === "/portal/tren/") {
    return "/portal/planlegge/workbench?tab=uke";
  }

  for (const [prefix, tab] of TAB_BY_PREFIX) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return `/portal/planlegge/workbench?tab=${tab}`;
    }
  }

  return null;
}