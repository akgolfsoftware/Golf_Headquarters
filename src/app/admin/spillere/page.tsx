/**
 * v2-preview: AgencyOS Stall (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell
 * leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data følger den ekte /admin/spillere-flaten: samme
 * requirePortalUser-guard (ADMIN/COACH) og loadStallen-loaderen.
 * Mapper StallenData → StallV2Data (ærlige tomrom, ingen fabrikerte tall).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadStallen, type StatusKind, type Axis } from "@/lib/admin/stallen-data";
import { fmtSg, type AkseKey } from "@/lib/v2/tokens";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { StallV2, type StallV2Data, type StallV2Player } from "@/components/admin/v2/StallV2";
import type { SevKey } from "@/components/v2";

export const dynamic = "force-dynamic";

/** StatusKind (loader) → SevChip-kategori (klarspråk, aldri sperre-språk). */
const SEV_MAP: Record<StatusKind, SevKey> = {
  bak: "sterk",
  inaktiv: "medium",
  veil: "lav",
  aktiv: "ok",
};

/** Akse-nøkkel lowercase (loader) → AkseKey (pyramide-kanon). */
const AKSE_MAP: Record<Axis, AkseKey> = {
  fys: "FYS",
  tek: "TEK",
  slag: "SLAG",
  spill: "SPILL",
  turn: "TURN",
};

const GRUPPE_LABEL: Record<string, string> = {
  WANG: "WANG",
  GFGK: "GFGK",
  AKA: "AK Academy",
};

export default async function V2StallPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const stall = await loadStallen({ id: user.id, role: user.role }, {});

  const spillere: StallV2Player[] = stall.rows.map((r) => {
    const form = r.sgTrend.length > 0 ? r.sgTrend[r.sgTrend.length - 1] : null;
    const visDelta = r.sgDelta != null && Math.abs(r.sgDelta) >= 0.05;
    return {
      id: r.id,
      navn: r.name,
      hcp: r.hcp,
      gruppe: r.group ? (GRUPPE_LABEL[r.group] ?? r.group) : "Uten gruppe",
      sg: form != null ? fmtSg(form) : "—",
      delta: visDelta ? fmtSg(r.sgDelta as number) : null,
      dir: (r.sgTone === "neg" ? "down" : "up") as "up" | "down",
      sev: SEV_MAP[r.status],
      statusLabel: r.statusLabel,
      trenger: r.status !== "aktiv",
      sgTrend: r.sgTrend,
      adherence: r.adherence.map((a) => ({ akse: AKSE_MAP[a.axis], pct: a.pct })),
      adhPct: r.adhPct,
      venter: r.neverLoggedIn,
    };
  });

  const grupper = (["WANG", "GFGK", "AKA"] as const)
    .filter((g) => stall.counts[g] > 0)
    .map((g) => GRUPPE_LABEL[g]);

  const data: StallV2Data = { total: stall.total, grupper, spillere };

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <StallV2 data={data} />
    </V2Shell>
  );
}
