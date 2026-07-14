/**
 * AgencyOS — Talent · Sammenligning (`/admin/talent/sammenligning`), v2.
 * Port av `(legacy)/talent/sammenligning/page.tsx` + `map-compare-data.ts`
 * (2026-07-14, AgencyOS Bølge 3.37) — samme `loadMultiCompare`-datakilde
 * (`@/lib/admin-compare/multi-compare-data`, uendret), men denne gangen
 * mappet til FAKTISKE per-spiller-verdier i stedet for å kastes bort (se
 * MERK i `AdminTalentSammenligningV2.tsx` for hva som var galt før).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadMultiCompare, type CompareAxis } from "@/lib/admin-compare/multi-compare-data";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminTalentSammenligningV2,
  type SammenligningDataV2,
  type SammenligningMetrikkV2,
  type SammenligningKohortRadV2,
} from "@/components/admin/v2/AdminTalentSammenligningV2";
import type { HjelpNokkel } from "@/lib/v2/hjelpetekster";

export const dynamic = "force-dynamic";

type Search = Promise<{ ids?: string }>;

const PYR_LABELS: { key: CompareAxis; label: string }[] = [
  { key: "fys", label: "FYS" },
  { key: "tek", label: "TEK" },
  { key: "slag", label: "SLAG" },
  { key: "spill", label: "SPILL" },
  { key: "turn", label: "TURN" },
];

function fmtVerdi(v: number | null, decimals: number): string | null {
  if (v == null) return null;
  const tekst = v.toLocaleString("nb-NO", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return v > 0 ? `+${tekst}` : tekst;
}

function fmtRef(reference: number | null, decimals: number): string {
  if (reference == null) return "—";
  return reference.toLocaleString("nb-NO", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function metaLine(niva: string | null, klubb: string | null): string {
  return `${niva?.trim() || "—"} · ${klubb?.trim() || "—"}`;
}

function hcpPill(hcp: number | null): string {
  return `HCP ${hcp != null ? hcp.toLocaleString("nb-NO") : "—"}`;
}

const METRIKK_HJELP: Record<string, HjelpNokkel> = {
  sg_total: "sgTotal",
  sg_ott: "sgOmrade",
  sg_app: "sgOmrade",
  sg_arg: "sgOmrade",
  sg_putt: "sgOmrade",
};

export default async function TalentSammenligningPage({ searchParams }: { searchParams: Search }) {
  const viewer = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const sp = await searchParams;
  const ids = (sp.ids ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  let data = await loadMultiCompare(ids, viewer);
  if (data.players.length === 0) {
    const standard = data.cohort.slice(0, 3).map((c) => c.userId);
    if (standard.length > 0) data = await loadMultiCompare(standard, viewer);
  }

  const n = data.players.length;

  const players: SammenligningDataV2["players"] = data.players.map((p) => ({
    id: p.id,
    initials: p.initials,
    name: p.name,
    metaTekst: metaLine(p.niva, p.klubb),
    hcpTekst: hcpPill(p.hcp),
    href: `/admin/spillere/${p.userId}`,
  }));

  const metrics: SammenligningMetrikkV2[] = data.metrics.map((m) => {
    const verdier = m.values.map((v) => fmtVerdi(v, m.decimals));
    let besteIndex: number | null = null;
    const medVerdi = m.values.map((v, i) => ({ v, i })).filter((x): x is { v: number; i: number } => x.v != null);
    if (medVerdi.length >= 2) {
      const best = medVerdi.reduce((a, b) => (m.higherIsBetter ? (b.v > a.v ? b : a) : (b.v < a.v ? b : a)));
      besteIndex = best.i;
    }
    return {
      id: m.key,
      akse: m.axis,
      navn: m.label,
      sub: m.sub,
      refLabel: m.referenceLabel,
      refValueTekst: fmtRef(m.reference, m.decimals),
      verdier,
      besteIndex,
      hjelp: METRIKK_HJELP[m.key],
    };
  });

  const pyramide: SammenligningDataV2["pyramide"] = PYR_LABELS.map(({ key, label }) => ({
    akse: key,
    axisLabel: label,
    perSpiller: data.players.map((p) => p.pyramide.find((ax) => ax.axis === key)?.count ?? 0),
  }));

  const kohort: SammenligningKohortRadV2[] = data.cohort.map((c, i) => ({
    userId: c.userId,
    rank: i + 1,
    initials: c.initials,
    navn: c.name,
    subTekst: c.klubb?.trim() ? `${c.klubb.trim().toUpperCase()} · ${hcpPill(c.hcp)}` : hcpPill(c.hcp),
    sgTotal: c.sgTotal,
    sgTekst: c.sgTotal != null ? fmtVerdi(c.sgTotal, 2)! : "—",
    tagged: c.selected,
    href: c.selected ? `/admin/spillere/${c.userId}` : undefined,
  }));

  const kohortSnittTekst = data.cohortStats.avg != null
    ? data.cohortStats.avg.toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "—";

  const regionTotal = data.totalPlayers;
  const region: SammenligningDataV2["region"] = data.regions.map((r, i) => ({
    id: `region-${i}`,
    navn: r.region,
    count: r.count,
    pct: regionTotal > 0 ? Math.round((r.count / regionTotal) * 100) : 0,
  }));

  const kandidater: SammenligningDataV2["kandidater"] = data.cohort.map((c) => ({
    id: c.userId,
    navn: c.name,
    hcpTekst: hcpPill(c.hcp),
  }));

  const sammenligningData: SammenligningDataV2 = {
    verdict: n >= 2 ? data.verdict : null,
    players,
    metrics,
    pyramide,
    kohortCount: data.cohortStats.count,
    kohortSnittTekst,
    kohort,
    region,
    kandidater,
    valgteIds: data.players.map((p) => p.userId),
  };

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={viewer.name} avatarUrl={viewer.avatarUrl}>
      <AdminTalentSammenligningV2 data={sammenligningData} />
    </V2Shell>
  );
}
