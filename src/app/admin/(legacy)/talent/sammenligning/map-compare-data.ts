/**
 * Oversetter ekte MultiCompareData (loadMultiCompare) → v10 CompareData
 * (TalentSammenligning-komponenten). Tom-tilstander bevares (tomme arrays,
 * «—»-meta). v10-komponenten rendrer selv SG-verdier som tom-tilstand
 * («—» / «ingen data»), så her mappes kun struktur: spillere, metrikk-rader,
 * kohort-rekkefølge og region-fordeling — aldri oppdiktede tall.
 */

import type {
  CompareData,
  CompareMetricRow,
  CohortRow as V10CohortRow,
  RegionBar,
} from "@/components/admin/talent/sammenligning";
import type {
  MultiCompareData,
  CompareAxis,
} from "@/lib/admin-compare/multi-compare-data";

type AxisTone = CompareMetricRow["axisTone"];

/** Loader-akse → v10 axisTone. «fys» finnes ikke i v10-paletten → fall til «slag». */
function toAxisTone(axis: CompareAxis): AxisTone {
  switch (axis) {
    case "sg":
      return "sg";
    case "slag":
      return "slag";
    case "tek":
      return "tek";
    case "spill":
      return "spill";
    case "turn":
      return "turn";
    case "fys":
      return "slag";
  }
}

/** Formaterer en referanseverdi (null → «—»). */
function fmtRef(reference: number | null, decimals: number): string {
  if (reference == null) return "—";
  return reference.toLocaleString("nb-NO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Mono under-linje: «nivå · klubb», «—» der felt mangler. */
function metaLine(niva: string | null, klubb: string | null): string {
  return `${niva?.trim() || "—"} · ${klubb?.trim() || "—"}`;
}

/** HCP-pill: «HCP 4,2» eller «HCP —». */
function hcpPill(hcp: number | null): string {
  return `HCP ${hcp != null ? hcp.toLocaleString("nb-NO") : "—"}`;
}

const TONES = ["pri", "alt"] as const;

export function mapCompareData(data: MultiCompareData): CompareData {
  const n = data.players.length;

  const players: CompareData["sideBySide"]["players"] = data.players.map(
    (p, i) => ({
      id: p.id,
      initials: p.initials,
      name: p.name,
      meta: metaLine(p.niva, p.klubb),
      sub: hcpPill(p.hcp),
      avatarTone: TONES[i % 2],
      href: `/admin/spillere/${p.userId}`,
    }),
  );

  const metrics: CompareMetricRow[] = data.metrics.map((m) => ({
    id: m.key,
    axisTone: toAxisTone(m.axis),
    name: m.label,
    sub: m.sub,
    refLabel: m.referenceLabel,
    refValue: fmtRef(m.reference, m.decimals),
  }));

  const cohortRows: V10CohortRow[] = data.cohort.map((c, i) => ({
    id: c.userId,
    rank: i + 1,
    initials: c.initials,
    name: c.name,
    sub: c.klubb?.trim()
      ? `${c.klubb.trim().toUpperCase()} · ${hcpPill(c.hcp)}`
      : hcpPill(c.hcp),
    avatarTone: TONES[i % 2],
    tagged: c.selected || undefined,
    href: c.selected ? `/admin/spillere/${c.userId}` : undefined,
  }));

  const regionTotal = data.totalPlayers;
  const bars: RegionBar[] = data.regions.map((r, i) => ({
    id: `region-${i}`,
    name: r.region,
    count: r.count,
    pct: regionTotal > 0 ? Math.round((r.count / regionTotal) * 100) : 0,
  }));

  const cohortAvg =
    data.cohortStats.avg != null
      ? data.cohortStats.avg.toLocaleString("nb-NO", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "—";

  return {
    eyebrow: "TALENT · B10 SAMMENLIGNING",
    title: {
      lead: "Side om side",
      rest: n >= 2 ? ` · ${n} spillere` : " · kohort & region",
    },
    helper:
      "Tre nivåer: 2–4 spillere parallelt, hele stallen rangert på SG, og geografisk fordeling. Referanse er PGA Tour-baseline.",
    backHref: "/admin/talent",

    sideBySide: {
      heading: { lead: "Talent-kohort", rest: " · konkurranseprofiler" },
      sub: `${n} ${n === 1 ? "spiller" : "spillere"} i sammenligning · SG fra siste registrerte periode · referanse PGA Tour-baseline`,
      editHref: "/admin/talent/sammenligning",
      players,
      refTop: { label: "REFERANSE", value: "PGA Tour", valueSub: "BASELINE 0,0" },
      metrics,
      frule:
        "Hver rad er én metrikk, kolonnene er spillerne. Referanse-kolonnen helt til høyre er PGA Tour-baseline (0,0). Verdier vises kun der spilleren har registrert SG i perioden.",
    },

    pyramid: {
      heading: { lead: "Pyramide", rest: "-fordeling" },
      sub: "ANDEL ØKTER PER AKSE · ALLE PLANER",
      emptyText: "Ingen treningsplaner registrert for de valgte spillerne.",
    },

    cohort: {
      count: data.cohortStats.count,
      heading: { lead: "Hele stallen", rest: " · SG total" },
      sub: `${data.cohortStats.count} SPILLERE I KOHORT · SNITT ${cohortAvg} · SORTERT HØYEST FØRST`,
      rows: cohortRows,
      frule:
        "Én metrikk, hele kohorten på én skjerm. Søylene er tegnet mot skalaen −2,0 → +2,0 med den svarte senterlinjen som nullpunkt (Tour-baseline) — søylen henger til høyre hvis positiv, venstre hvis negativ. Lime-merkede rader er med i side-om-side over. Spillere uten registrert SG vises nederst uten søyle.",
    },

    region: {
      count: bars.length,
      heading: { lead: "Spiller", rest: "-geografi" },
      sub: `VÅR STALL · ${regionTotal} spillere · ${bars.length} ${bars.length === 1 ? "REGION" : "REGIONER"}`,
      bars,
      frule:
        "Fordelingen viser hvor i landet stallen er — basert på registrert region (talent-program) eller hjemmeklubb. Spillere uten region samles under «Uten region». Geografi er kontekst, ikke uttaks-grunnlag.",
    },
  };
}
