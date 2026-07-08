/**
 * /admin/talent/radar/[playerId] — Radar-vurdering per spiller (M13 K2)
 *
 * Stor pentagonal radar (5 akser, 1–10) for én spiller, med
 * snitt for samme nivå som sammenlignings-overlay.
 * Form for å oppdatere verdier via server action `oppdaterRadar`.
 *
 * Roller: ADMIN, COACH.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Target, TrendingUp } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { DetailShell } from "@/components/shared/detail-shell";
import { KPICard } from "@/components/ui/kpi-card";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { AthleticBadge } from "@/components/athletic/badge";
import {
  RadarChart,
  AXIS_KEYS,
  AXIS_LABELS,
} from "@/components/portal/talent/radar-chart";

import { RadarForm } from "./radar-form";

function snitt(v: Array<number | null | undefined>): number | null {
  const tall = v.filter((n): n is number => typeof n === "number");
  if (tall.length === 0) return null;
  return tall.reduce((a, b) => a + b, 0) / tall.length;
}

export default async function TalentRadarSpiller({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const { playerId } = await params;

  const tracking = await prisma.talentTracking.findUnique({
    where: { userId: playerId },
    include: { user: { select: { id: true, name: true, hcp: true } } },
  });

  if (!tracking) notFound();

  // Hent peer-data for samme nivå (men ikke spilleren selv)
  const peers = await prisma.talentTracking.findMany({
    where: { niva: tracking.niva, NOT: { userId: playerId } },
    select: {
      fysisk: true,
      teknikk: true,
      taktikk: true,
      mental: true,
      motivasjon: true,
    },
  });

  // Per-akse peer-snitt
  const peerSnitt = {
    fysisk: snitt(peers.map((p) => p.fysisk)),
    teknikk: snitt(peers.map((p) => p.teknikk)),
    taktikk: snitt(peers.map((p) => p.taktikk)),
    mental: snitt(peers.map((p) => p.mental)),
    motivasjon: snitt(peers.map((p) => p.motivasjon)),
  };

  const spillerVerdier = {
    fysisk: tracking.fysisk,
    teknikk: tracking.teknikk,
    taktikk: tracking.taktikk,
    mental: tracking.mental,
    motivasjon: tracking.motivasjon,
  };

  const spillerSum = AXIS_KEYS.reduce(
    (sum, k) => sum + (spillerVerdier[k] ?? 0),
    0,
  );
  const spillerSnitt = snitt(Object.values(spillerVerdier));

  const peerTotalSnitt = snitt(Object.values(peerSnitt));

  return (
    <DetailShell
      breadcrumb={[
        { label: "Talent", href: "/admin/talent" },
        { label: "Radar", href: "/admin/talent" },
        { label: tracking.user.name },
      ]}
      backHref="/admin/talent"
      title={`Radar for ${tracking.user.name}`}
      subtitle={`${peers.length} andre spillere på ${tracking.niva}-nivå brukes som referanse.`}
      statusPill={
        <AthleticBadge variant="primary">
          {tracking.niva}
          {tracking.region ? ` · ${tracking.region}` : ""}
        </AthleticBadge>
      }
      actions={
        <Link
          href="/admin/talent"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Tilbake til oversikt
        </Link>
      }
      kpiRow={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <KPICard
            eyebrow="Sum radar"
            value={spillerSum > 0 ? `${spillerSum}/50` : "—"}
            footnote="alle 5 akser"
            icon={<Target size={18} strokeWidth={1.5} aria-hidden />}
            variant="hero"
          />
          <KPICard
            eyebrow="Snitt spiller"
            value={
              spillerSnitt ? spillerSnitt.toFixed(1).replace(".", ",") : "—"
            }
            footnote="av 10"
            icon={<TrendingUp size={18} strokeWidth={1.5} aria-hidden />}
          />
          <KPICard
            eyebrow={`Snitt ${tracking.niva}`}
            value={
              peerTotalSnitt
                ? peerTotalSnitt.toFixed(1).replace(".", ",")
                : "—"
            }
            footnote={`${peers.length} peers`}
            icon={<TrendingUp size={18} strokeWidth={1.5} aria-hidden />}
          />
          <KPICard
            eyebrow="HCP"
            value={tracking.user.hcp?.toFixed(1).replace(".", ",") ?? "—"}
            footnote={tracking.klubb ?? "—"}
            icon={<Target size={18} strokeWidth={1.5} aria-hidden />}
          />
        </div>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Radar-chart */}
        <section className="rounded-lg border border-border bg-card p-8">
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            <Target className="h-3 w-3" strokeWidth={1.5} />
            Pentagonal radar · 5 akser · 1–10
          </div>
          <div className="flex justify-center">
            <RadarChart
              series={[
                {
                  label: `${tracking.niva}-snitt`,
                  values: peerSnitt,
                  fillClass: "fill-secondary",
                  strokeClass: "stroke-muted-foreground",
                },
                {
                  label: tracking.user.name,
                  values: spillerVerdier,
                  fillClass: "fill-primary",
                  strokeClass: "stroke-primary",
                },
              ]}
              size={420}
            />
          </div>

          {/* Tegnforklaring */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-[12px]">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-primary/40" />
              <span className="font-medium">{tracking.user.name}</span>
            </span>
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span className="h-3 w-3 rounded-sm bg-secondary" />
              <span>{tracking.niva}-snitt ({peers.length})</span>
            </span>
          </div>

          {/* Per-akse-sammenligning */}
          <div className="mt-8 space-y-2">
            {AXIS_KEYS.map((k) => {
              const v = spillerVerdier[k];
              const p = peerSnitt[k];
              return (
                <div
                  key={k}
                  className="flex items-center justify-between gap-4 border-b border-border pb-2 last:border-b-0 last:pb-0"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
                    {AXIS_LABELS[k]}
                  </span>
                  <div className="flex items-center gap-6 font-mono text-[13px] tabular-nums">
                    <span className="text-foreground">
                      {v != null ? v : "—"}
                    </span>
                    <span className="text-muted-foreground">
                      {p != null ? p.toFixed(1).replace(".", ",") : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Form */}
        <RadarForm
          playerId={tracking.user.id}
          initial={spillerVerdier}
        />
      </div>
    </DetailShell>
  );
}
