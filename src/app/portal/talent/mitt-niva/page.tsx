/**
 * PlayerHQ — Talent · Mitt nivå
 *
 * Spilleren mot kohort-snitt (samme niva):
 *  - SVG-radar med to serier (deg + kohort-snitt)
 *  - Bar-grafer per akse, med referanselinje for kohort-snitt
 *  - Kort tekstforklaring per dimensjon
 */

import { Users } from "lucide-react";

import { TalentHero } from "@/components/portal/talent/talent-hero";
import {
  AXIS_KEYS,
  AXIS_LABELS,
  RadarChart,
  type AxisKey,
  type RadarValues,
} from "@/components/portal/talent/radar-chart";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

const AKSE_FORKLARING: Record<AxisKey, string> = {
  fysisk:
    "Styrke, mobilitet, utholdenhet og klubbhastighet. Grunnlaget for distanse og skadefri trening.",
  teknikk:
    "Swing-mekanikk, kontakt, ballbane og repeterbarhet på alle køller — fra wedge til driver.",
  taktikk:
    "Beslutninger på banen: course management, vindtilpasning, valg av kølle og lekt risiko.",
  mental:
    "Pre-shot rutine, fokus under press, restitusjon mellom slag og evnen til å lukke en runde.",
  motivasjon:
    "Indre driv, treningsiver og evnen til å holde retning over måneder — ikke bare i gode uker.",
};

export default async function MittNivaPage() {
  const user = await requirePortalUser({ allow: ["PLAYER"] });

  const tracking = await prisma.talentTracking.findUnique({
    where: { userId: user.id },
  });

  if (!tracking) return null;

  const mine: RadarValues = {
    fysisk: tracking.fysisk,
    teknikk: tracking.teknikk,
    taktikk: tracking.taktikk,
    mental: tracking.mental,
    motivasjon: tracking.motivasjon,
  };

  // Kohort-snitt for samme niva — eksluderer egen rad.
  const kohort = await prisma.talentTracking.findMany({
    where: { niva: tracking.niva, NOT: { userId: user.id } },
    select: {
      fysisk: true,
      teknikk: true,
      taktikk: true,
      mental: true,
      motivasjon: true,
    },
  });

  const kohortSnitt: RadarValues = computeAverage(kohort);
  const kohortAntall = kohort.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6 sm:py-8 md:px-8 md:py-12 md:pb-12">
      <TalentHero
        eyebrow="PlayerHQ · Talent · Mitt nivå"
        italic="Mitt"
        rest={`nivå · ${tracking.niva}`}
        lead={`Slik ser dine fem akser ut mot snittet for andre på ${tracking.niva}-nivå. Kohorten består av ${kohortAntall} andre spillere.`}
      />

      {/* Radar + legend */}
      <section
        aria-label="Radar mot kohort-snitt"
        className="mb-12 grid grid-cols-1 gap-6 rounded-lg border border-border bg-card p-6 md:grid-cols-2 md:p-8"
      >
        <div className="flex items-center justify-center">
          <RadarChart
            series={[
              {
                label: "Kohort-snitt",
                values: kohortSnitt,
                fillClass: "fill-muted-foreground",
                strokeClass: "stroke-muted-foreground",
              },
              {
                label: "Deg",
                values: mine,
                fillClass: "fill-primary",
                strokeClass: "stroke-primary",
              },
            ]}
            size={420}
          />
        </div>
        <div className="flex flex-col justify-center gap-6">
          <div className="flex items-center gap-2">
            <Users size={20} strokeWidth={1.5} className="text-primary" aria-hidden />
            <h2 className="font-display text-2xl font-medium tracking-tight">
              Deg mot snittet
            </h2>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-6 rounded-sm bg-primary"
                aria-hidden
              />
              <span>
                <strong className="font-semibold">Deg</strong> — siste evaluering
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-6 rounded-sm bg-muted-foreground"
                aria-hidden
              />
              <span>
                <strong className="font-semibold">Kohort-snitt</strong> — {tracking.niva},{" "}
                {kohortAntall} spillere
              </span>
            </li>
          </ul>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Akser hvor du ligger utenfor snittet er styrker. Akser hvor du ligger
            innenfor er typisk arbeidsområder for neste periode.
          </p>
        </div>
      </section>

      {/* Bar-grafer per akse */}
      <section aria-label="Akser i detalj" className="mb-8">
        <h2 className="mb-6 font-display text-2xl font-medium tracking-tight">
          Akser i detalj
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {AXIS_KEYS.map((k) => (
            <AxisDetail
              key={k}
              label={AXIS_LABELS[k]}
              forklaring={AKSE_FORKLARING[k]}
              you={mine[k] ?? null}
              cohort={kohortSnitt[k] ?? null}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function computeAverage(
  rows: Array<{
    fysisk: number | null;
    teknikk: number | null;
    taktikk: number | null;
    mental: number | null;
    motivasjon: number | null;
  }>,
): RadarValues {
  const result: RadarValues = {
    fysisk: 0,
    teknikk: 0,
    taktikk: 0,
    mental: 0,
    motivasjon: 0,
  };
  if (rows.length === 0) return result;
  for (const k of AXIS_KEYS) {
    const vals = rows
      .map((r) => r[k])
      .filter((v): v is number => typeof v === "number");
    result[k] = vals.length === 0 ? 0 : vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  return result;
}

function AxisDetail({
  label,
  forklaring,
  you,
  cohort,
}: {
  label: string;
  forklaring: string;
  you: number | null;
  cohort: number | null;
}) {
  const youPct = you === null ? 0 : Math.max(0, Math.min(100, (you / 10) * 100));
  const cohortPct =
    cohort === null ? 0 : Math.max(0, Math.min(100, (cohort / 10) * 100));

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-medium leading-snug">{label}</h3>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {you === null ? "—" : you.toFixed(1)} <span className="opacity-50">/</span>{" "}
          {cohort === null ? "—" : cohort.toFixed(1)} snitt
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{forklaring}</p>

      <div
        className="relative mt-4 h-3 w-full overflow-hidden rounded-full bg-secondary"
        role="presentation"
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${youPct}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground/60"
          style={{ left: `${cohortPct}%` }}
          aria-hidden
          title={`Kohort-snitt: ${cohort?.toFixed(1) ?? "—"}`}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>0</span>
        <span>10</span>
      </div>
    </div>
  );
}
