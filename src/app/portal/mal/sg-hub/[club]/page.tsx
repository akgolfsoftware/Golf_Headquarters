import Link from "next/link";
import { ArrowLeft, Target, Crosshair, Zap, Activity } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { extractShots } from "@/lib/sg-hub/extract-shots";
import { computeDPlane, DPLANE_LABELS } from "@/lib/sg-hub/d-plane";
import { computeStrikePattern } from "@/lib/sg-hub/strike-pattern";
import { computeSmashCurve } from "@/lib/sg-hub/smash-curve";
import { computeFatigueCurve } from "@/lib/sg-hub/fatigue";
import { DPlanePlot } from "@/components/sg-hub/DPlanePlot";
import { StrikeHeatmap } from "@/components/sg-hub/StrikeHeatmap";
import { SmashCurvePlot } from "@/components/sg-hub/SmashCurvePlot";
import { FatigueChart } from "@/components/sg-hub/FatigueChart";
import { TempoRibbon } from "@/components/sg-hub/TempoRibbon";
import { ShotAnnotationPopover } from "@/components/sg-hub/ShotAnnotationPopover";

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
  const isCoach = user.role === "COACH" || user.role === "ADMIN";

  const sessions = await prisma.trackManSession.findMany({
    where: { userId: user.id },
    select: { id: true, rawJson: true, recordedAt: true },
    orderBy: { recordedAt: "desc" },
  });

  const allShots = sessions.flatMap((s) => extractShots(s.rawJson, decoded));

  if (allShots.length === 0) {
    return (
      <div className="mx-auto max-w-[760px] space-y-6 px-4 pb-20 sm:px-6 md:pb-0">
        <Link
          href="/portal/mal/sg-hub"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          SG-hub
        </Link>
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {decoded}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.02em] text-foreground">
            Ingen data funnet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Ingen TrackMan-slag registrert for {decoded}. Importer en
            TrackMan-økt som inkluderer denne køllen.
          </p>
          <Link
            href="/portal/mal/trackman"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-90"
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
  const fatigue = computeFatigueCurve(allShots);

  const latestSession = sessions[0];
  const latestShots = latestSession
    ? extractShots(latestSession.rawJson, decoded)
    : [];

  const annotationsRaw =
    advanced && latestSession
      ? await prisma.shotAnnotation.findMany({
          where: { trackmanSessionId: latestSession.id, clubId: decoded },
          select: {
            id: true,
            shotNumber: true,
            body: true,
            videoUrl: true,
            coachId: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

  // ShotAnnotation har ingen relasjon til User i schema — hent coach-navn separat.
  const coachIds = Array.from(new Set(annotationsRaw.map((a) => a.coachId)));
  const coaches = coachIds.length
    ? await prisma.user.findMany({
        where: { id: { in: coachIds } },
        select: { id: true, name: true },
      })
    : [];
  const coachNameById = new Map(coaches.map((c) => [c.id, c.name ?? "Coach"]));

  const annotationsByShot = new Map<
    number,
    Array<{
      id: string;
      body: string;
      videoUrl: string | null;
      coachName: string;
      createdAt: string;
    }>
  >();
  for (const a of annotationsRaw) {
    const row = {
      id: a.id,
      body: a.body,
      videoUrl: a.videoUrl,
      coachName: coachNameById.get(a.coachId) ?? "Coach",
      createdAt: a.createdAt.toISOString(),
    };
    const existing = annotationsByShot.get(a.shotNumber) ?? [];
    existing.push(row);
    annotationsByShot.set(a.shotNumber, existing);
  }

  return (
    <div className="mx-auto max-w-[760px] space-y-6 px-4 pb-20 sm:px-6 md:pb-0">
      <Link
        href="/portal/mal/sg-hub"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        SG-hub
      </Link>

      {/* Editorial header */}
      <div className="space-y-1">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Per-kølle analyse
        </p>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-foreground">
          <em className="font-medium italic" style={{ color: "#005840" }}>
            {decoded}
          </em>
        </h1>
        <p className="pt-1 text-sm text-muted-foreground">
          {allShots.length} slag · {sessions.length} økt
          {sessions.length !== 1 ? "er" : ""}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
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

      {/* D-Plane */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="font-display text-[15px] font-bold tracking-[-0.01em] text-foreground">
            D-Plane · Kurve-mønster
          </h2>
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

      {/* Strike Heatmap */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="font-display text-[15px] font-bold tracking-[-0.01em] text-foreground">
            Strike Heatmap · Kontaktpunkt
          </h2>
          {!advanced && (
            <p className="mt-1 text-sm text-muted-foreground">
              {strike.sweetPct}% sweet spot · Snitt Smash Factor{" "}
              {strike.avgSmash}
            </p>
          )}
        </div>
        <div className="flex justify-center">
          <StrikeHeatmap result={strike} advanced={advanced} />
        </div>
      </section>

      {/* Smash Curve */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="font-display text-[15px] font-bold tracking-[-0.01em] text-foreground">
            Smash Curve · Effektivitets-optimum
          </h2>
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

      {/* Tempo Ribbon */}
      <TempoRibbon shots={allShots} advanced={advanced} />

      {/* Fatigue Curve */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-display text-[15px] font-bold tracking-[-0.01em] text-foreground">
            Fatigue Curve · Club Speed over tid
          </h2>
        </div>
        {!advanced && (
          <p className="mb-2 text-sm text-muted-foreground">
            {fatigue.fatigueDetected
              ? `Trøtthet oppdaget — drop ${fatigue.dropPer10} mph / 10 slag`
              : "Stabil Club Speed — ingen trøtthet detektert"}
          </p>
        )}
        <FatigueChart result={fatigue} advanced={advanced} />
      </section>

      {/* Advanced: slag-tabell med annotasjoner for siste økt */}
      {advanced && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-1 font-display text-[15px] font-bold tracking-[-0.01em] text-foreground">
            Slag-statistikk
          </h2>
          {latestSession && (
            <p className="mb-4 text-xs text-muted-foreground">
              Siste økt:{" "}
              {new Date(latestSession.recordedAt).toLocaleDateString("nb-NO", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}{" "}
              · {latestShots.length} slag
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "#",
                    "Face°",
                    "Path°",
                    "Smash",
                    "Speed",
                    "Ball",
                    "Dist",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="pb-2 pr-4 text-right first:text-left last:text-center font-normal tracking-wide text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {latestShots.map((s) => (
                  <tr
                    key={s.shotNumber}
                    className="border-b border-border/40 hover:bg-muted/30"
                  >
                    <td className="py-1.5 pr-4 text-muted-foreground">
                      {s.shotNumber}
                    </td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">
                      {s.faceAngle.toFixed(1)}
                    </td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">
                      {s.clubPath.toFixed(1)}
                    </td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">
                      {s.smashFactor.toFixed(2)}
                    </td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">
                      {s.clubSpeed.toFixed(1)}
                    </td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">
                      {s.ballSpeed.toFixed(1)}
                    </td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">
                      {Math.round(s.totalDistance)}
                    </td>
                    <td className="py-1.5 text-center">
                      {latestSession && (
                        <ShotAnnotationPopover
                          trackmanSessionId={latestSession.id}
                          clubId={decoded}
                          shotNumber={s.shotNumber}
                          annotations={
                            annotationsByShot.get(s.shotNumber) ?? []
                          }
                          canEdit={isCoach}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sessions.length > 1 && (
            <details className="mt-6">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Alle slag ({allShots.length} totalt, {sessions.length} økter)
              </summary>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {[
                        "#",
                        "Face°",
                        "Path°",
                        "Smash",
                        "Speed",
                        "Ball",
                        "Dist",
                      ].map((h) => (
                        <th
                          key={h}
                          className="pb-2 pr-4 text-right first:text-left font-normal tracking-wide text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allShots.map((s, i) => (
                      <tr
                        key={i}
                        className="border-b border-border/40 hover:bg-muted/30"
                      >
                        <td className="py-1.5 pr-4 text-muted-foreground">
                          {s.shotNumber}
                        </td>
                        <td className="py-1.5 pr-4 text-right tabular-nums">
                          {s.faceAngle.toFixed(1)}
                        </td>
                        <td className="py-1.5 pr-4 text-right tabular-nums">
                          {s.clubPath.toFixed(1)}
                        </td>
                        <td className="py-1.5 pr-4 text-right tabular-nums">
                          {s.smashFactor.toFixed(2)}
                        </td>
                        <td className="py-1.5 pr-4 text-right tabular-nums">
                          {s.clubSpeed.toFixed(1)}
                        </td>
                        <td className="py-1.5 pr-4 text-right tabular-nums">
                          {s.ballSpeed.toFixed(1)}
                        </td>
                        <td className="py-1.5 pr-4 text-right tabular-nums">
                          {Math.round(s.totalDistance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
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
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="font-mono text-xl font-bold tabular-nums leading-none tracking-[-0.01em] text-foreground">
        {value}
      </p>
      <p className="mt-1.5 font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
        {sub}
      </p>
    </div>
  );
}
