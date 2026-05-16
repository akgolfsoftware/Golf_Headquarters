import Link from "next/link";
import { ArrowLeft, Target, Crosshair, Zap } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { extractShots } from "@/lib/sg-hub/extract-shots";
import { computeDPlane, DPLANE_LABELS } from "@/lib/sg-hub/d-plane";
import { computeStrikePattern } from "@/lib/sg-hub/strike-pattern";
import { computeSmashCurve } from "@/lib/sg-hub/smash-curve";
import { DPlanePlot } from "@/components/sg-hub/DPlanePlot";
import { StrikeHeatmap } from "@/components/sg-hub/StrikeHeatmap";
import { SmashCurvePlot } from "@/components/sg-hub/SmashCurvePlot";
import { TempoRibbon } from "@/components/sg-hub/TempoRibbon";

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ club: string }>;
}) {
  const user = await requirePortalUser();
  const { sgHubMode } = lesPreferences(user);
  const { club } = await params;
  const decoded = decodeURIComponent(club);
  const advanced = sgHubMode === "advanced";

  const sessions = await prisma.trackManSession.findMany({
    where: { userId: user.id },
    select: { id: true, rawJson: true, recordedAt: true },
    orderBy: { recordedAt: "desc" },
  });

  const allShots = sessions.flatMap((s) => extractShots(s.rawJson, decoded));

  if (allShots.length === 0) {
    return (
      <div className="space-y-6">
        <Link
          href="/portal/mal/sg-hub"
          className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          SG Hub
        </Link>
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {decoded}
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold">
            Ingen data funnet
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
            Ingen TrackMan-slag registrert for {decoded}. Importer en
            TrackMan-økt som inkluderer denne køllen.
          </p>
          <Link
            href="/portal/mal/trackman"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Importer TrackMan-data
          </Link>
        </div>
      </div>
    );
  }

  const dPlane = computeDPlane(allShots);
  const strike = computeStrikePattern(allShots);
  const smash = computeSmashCurve(allShots);

  return (
    <div className="space-y-8">
      <Link
        href="/portal/mal/sg-hub"
        className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        SG Hub
      </Link>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Per-kølle analyse
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold">
          <em className="font-normal italic">{decoded}</em>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {allShots.length} slag · {sessions.length} økt{sessions.length !== 1 ? "er" : ""}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard
          icon={Crosshair}
          label="D-Plane"
          value={DPLANE_LABELS[dPlane.dominantClass]}
          sub={`${dPlane.consistencyPct}% konsistens`}
        />
        <SummaryCard
          icon={Target}
          label="Sweet Spot"
          value={`${strike.sweetPct}%`}
          sub={`Smash: ${strike.avgSmash}`}
        />
        <SummaryCard
          icon={Zap}
          label="Optimum Speed"
          value={smash.optimumSpeed > 0 ? `${smash.optimumSpeed} mph` : "—"}
          sub={
            smash.aboveOptimumPct > 0
              ? `${smash.aboveOptimumPct}% over optimum`
              : "For lite data"
          }
        />
      </div>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4">
          <h2 className="font-semibold">D-Plane · Kurve-mønster</h2>
          {!advanced && (
            <p className="mt-1 text-sm text-muted-foreground">
              Dominerende mønster:{" "}
              <span className="font-medium text-foreground">
                {DPLANE_LABELS[dPlane.dominantClass]}
              </span>{" "}
              ({dPlane.consistencyPct}% av slagene)
            </p>
          )}
        </div>
        <DPlanePlot result={dPlane} advanced={advanced} />
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4">
          <h2 className="font-semibold">Strike Heatmap · Kontaktpunkt</h2>
          {!advanced && (
            <p className="mt-1 text-sm text-muted-foreground">
              {strike.sweetPct}% sweet spot · Snitt Smash Factor {strike.avgSmash}
            </p>
          )}
        </div>
        <div className="flex justify-center">
          <StrikeHeatmap result={strike} advanced={advanced} />
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="font-semibold">Tempo · Rytme-konsistens</h2>
        </div>
        <TempoRibbon shots={allShots} advanced={advanced} />
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4">
          <h2 className="font-semibold">Smash Curve · Effektivitets-optimum</h2>
          {!advanced && smash.optimumSpeed > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              Optimalt Club Speed:{" "}
              <span className="font-medium text-foreground">
                {smash.optimumSpeed} mph
              </span>
              {smash.aboveOptimumPct > 0 && (
                <> · {smash.aboveOptimumPct}% over optimum</>
              )}
            </p>
          )}
        </div>
        <SmashCurvePlot result={smash} advanced={advanced} />
      </section>

      {advanced && (
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold">Slag-statistikk</h2>
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["#", "Face°", "Path°", "Smash", "Speed", "Ball", "Dist"].map(
                    (h) => (
                      <th
                        key={h}
                        className="pb-2 pr-4 text-right first:text-left font-normal tracking-wide text-muted-foreground"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {allShots.map((s) => (
                  <tr
                    key={s.shotNumber}
                    className="border-b border-border/40 hover:bg-muted/30"
                  >
                    <td className="py-1.5 pr-4 text-muted-foreground">{s.shotNumber}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{s.faceAngle.toFixed(1)}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{s.clubPath.toFixed(1)}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{s.smashFactor.toFixed(2)}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{s.clubSpeed.toFixed(1)}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{s.ballSpeed.toFixed(1)}</td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">{Math.round(s.totalDistance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
