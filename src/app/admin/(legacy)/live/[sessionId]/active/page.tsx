/**
 * AgencyOS · Live-økt Coach — hybrid terminal design
 *
 * Coach følger spillerens pågående økt i sanntid.
 * Design: [historisk fasit, fjernet 2026-07-03] prosjektgjennomgang-2026-06-17/.../AgencyOS Live-økt Coach (hybrid).dc.html
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { LiveMelding } from "./_live-melding";
import { AgPage } from "@/components/admin/agencyos/ui";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ sessionId: string }> };

const STATUS_LABEL: Record<string, string> = {
  PLANNED: "Planlagt",
  IN_PROGRESS: "Aktiv",
  COMPLETED: "Fullført",
  CANCELLED: "Avlyst",
  SKIPPED: "Hoppet over",
};

const STATUS_TONE: Record<string, string> = {
  IN_PROGRESS: "bg-success/10 text-success",
  PLANNED: "bg-secondary text-muted-foreground",
  COMPLETED: "bg-secondary text-muted-foreground",
  CANCELLED: "bg-destructive/10 text-destructive",
  SKIPPED: "bg-secondary text-muted-foreground",
};

const PRACTICE_LABEL: Record<string, string> = {
  BLOKK: "Blokkpraksis",
  RANDOM: "Tilfeldig",
  KONKURRANSE: "Konkurranse",
  SPILL_TEST: "Spilltest",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function fmtTid(d: Date): string {
  return new Intl.DateTimeFormat("nb-NO", { timeStyle: "short" }).format(d);
}

// Beregn varighet i minutter mellom to tidspunkter
function varighetMinutter(start: Date, slutt: Date): number {
  return Math.round((slutt.getTime() - start.getTime()) / 60000);
}

export default async function CoachLiveActivePage({ params }: Props) {
  const { sessionId } = await params;
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    include: {
      drills: {
        orderBy: { sortOrder: "asc" },
        take: 10,
      },
    },
  });

  if (!session) notFound();

  const spiller = session.studentId
    ? await prisma.user.findUnique({
        where: { id: session.studentId },
        select: { id: true, name: true, hcp: true },
      })
    : null;

  const statusLabel = STATUS_LABEL[session.status] ?? session.status;
  const statusTone = STATUS_TONE[session.status] ?? "bg-secondary text-muted-foreground";
  const erAktiv = session.status === "IN_PROGRESS";
  const varighet = varighetMinutter(session.startTime, session.endTime);
  const spillerInitials = spiller?.name ? initials(spiller.name) : "??";
  const aktivDrill = session.drills[0];
  const antallDrills = session.drills.length;

  // Plan-fremdrift: andel drills (enkel proxy — vi har ikke per-rep-logging her)
  const planFremdrift = antallDrills > 0 ? Math.min(Math.round((antallDrills / 5) * 100), 100) : 0;
  const circumference = 314; // 2 * π * 50
  const dashOffset = Math.round(circumference * (1 - planFremdrift / 100));

  return (
    <AgPage>
      {/* Topbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-border pb-4">
        <Link
          href={`/admin/live/${sessionId}/brief`}
          className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Brief
        </Link>

        {/* Live-indikator + tittel */}
        <div className="flex items-center gap-2.5">
          {erAktiv && (
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
          )}
          <div>
            <span className="font-display text-[19px] font-bold leading-tight tracking-tight text-foreground">
              Live-økt · Coach
            </span>
            {erAktiv && (
              <div className="font-mono text-[10.5px] text-primary">
                Pågår · {fmtTid(session.startTime)} · {varighet} min
              </div>
            )}
          </div>
        </div>

        {/* Spiller-chip */}
        {spiller && (
          <div className="flex items-center gap-2.5 rounded-[14px] border border-border bg-card px-3 py-2">
            <span
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[10px] font-bold text-primary-foreground"
            >
              {spillerInitials}
            </span>
            <div>
              <div className="text-[13px] font-semibold leading-tight text-foreground">
                {spiller.name}
              </div>
              {spiller.hcp !== null && (
                <div className="font-mono text-[9px] text-muted-foreground">
                  HCP {spiller.hcp?.toFixed(1).replace(".", ",")} · {PRACTICE_LABEL[session.practiceType] ?? session.practiceType}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Handlinger */}
        <div className="ml-auto flex gap-2">
          <span
            className={`inline-flex items-center rounded-[14px] px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.04em] ${statusTone}`}
          >
            {statusLabel}
          </span>
          <Link
            href={`/admin/live/${sessionId}/summary`}
            className="inline-flex items-center gap-1.5 rounded-[14px] border border-destructive/30 bg-destructive/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-destructive transition-colors hover:bg-destructive/20"
          >
            Avslutt
          </Link>
        </div>
      </div>

      {/* Innhold: 3-kolonne grid */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
        {/* Aktiv drill — span 2 */}
        <div className="rounded-[14px] border border-border bg-card p-4 md:col-span-2">
          <div className="mb-3 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Aktiv drill
          </div>

          {aktivDrill ? (
            <>
              <div className="font-display text-[22px] font-bold leading-tight text-foreground">
                {aktivDrill.name}
              </div>
              {aktivDrill.notes && (
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {aktivDrill.notes}
                </div>
              )}

              {/* Animerte lyd-bølge-stenger (CSS-animasjon) */}
              <div className="mt-4 flex items-end gap-[3px]" style={{ height: 32 }}>
                {Array.from({ length: 20 }, (_, i) => {
                  const heights = [6, 10, 18, 22, 14, 8, 6, 12, 20, 22, 16, 8, 6, 14, 22, 18, 10, 6, 8, 12];
                  return (
                    <span
                      key={i}
                      className="rep-bar w-1 rounded-sm bg-primary"
                      style={{
                        height: heights[i],
                        animationDelay: `${i * 0.06}s`,
                      }}
                    />
                  );
                })}
              </div>

              {/* KPI-grid */}
              <div className="mt-3.5 grid grid-cols-4 gap-2.5">
                {[
                  { label: "Drills", val: antallDrills.toString(), tone: "text-foreground" },
                  { label: "Økttype", val: PRACTICE_LABEL[session.practiceType]?.slice(0, 6) ?? "—", tone: "text-primary" },
                  { label: "Tid igjen", val: `${Math.max(0, varighetMinutter(new Date(), session.endTime))} min`, tone: "text-muted-foreground" },
                  { label: "Status", val: statusLabel, tone: erAktiv ? "text-success" : "text-muted-foreground" },
                ].map((k) => (
                  <div
                    key={k.label}
                    className="rounded-[8px] border border-border bg-background p-3"
                  >
                    <div className="mb-1 font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                      {k.label}
                    </div>
                    <div className={`font-mono text-[18px] font-semibold leading-none tabular-nums ${k.tone}`}>
                      {k.val}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-6 font-mono text-[12px] text-muted-foreground">
              Ingen drills registrert for denne økten ennå.
            </div>
          )}
        </div>

        {/* Høyre kolonne */}
        <div className="flex flex-col gap-3">
          {/* Plan-fremdrift ring */}
          <div className="rounded-[14px] border border-border bg-card p-4 flex-1">
            <div className="mb-3 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Plan-fremdrift
            </div>
            <div className="flex justify-center">
              <svg viewBox="0 0 120 120" className="h-24 w-24">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 60 60)"
                />
                <text
                  x="60"
                  y="55"
                  textAnchor="middle"
                  fontFamily="var(--font-jetbrains-mono, monospace)"
                  fontSize="9"
                  fill="hsl(var(--muted-foreground))"
                >
                  FULLFØRT
                </text>
                <text
                  x="60"
                  y="72"
                  textAnchor="middle"
                  fontFamily="var(--font-jetbrains-mono, monospace)"
                  fontSize="22"
                  fontWeight="600"
                  fill="hsl(var(--foreground))"
                >
                  {planFremdrift}%
                </text>
              </svg>
            </div>
          </div>

          {/* Status-panel */}
          <div className="rounded-[14px] border border-border bg-card p-4">
            <div className="mb-2.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Status
            </div>
            <div className="flex flex-col gap-2">
              {[
                {
                  label: "Økt-status",
                  val: statusLabel,
                  tone: erAktiv
                    ? "bg-success/10 text-success"
                    : "bg-secondary text-muted-foreground",
                },
                {
                  label: "Miljø",
                  val: session.miljo,
                  tone: "bg-secondary text-muted-foreground",
                },
                {
                  label: "Autosave",
                  val: "På",
                  tone: "bg-card text-muted-foreground border border-border",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-[12px] text-muted-foreground">
                    {s.label}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-bold ${s.tone}`}
                  >
                    {s.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coach-notater / melding — full bredde */}
        <div className="rounded-[14px] border border-border bg-card p-4 md:col-span-3">
          <div className="mb-3 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Send melding til spiller
          </div>
          <LiveMelding sessionId={sessionId} />
        </div>

        {/* Avslutt-knapp */}
        <div className="md:col-span-3">
          <Link
            href={`/admin/live/${sessionId}/summary`}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-border bg-card px-6 py-3 font-display text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <CheckCircle2 className="h-4 w-4 text-success" strokeWidth={1.5} />
            Avslutt og se sammendrag
          </Link>
        </div>
      </div>

      {/* Rep-bar animasjon */}
      <style>{`
        @keyframes barwave { 0%,100%{height:6px} 50%{height:22px} }
        .rep-bar { animation: barwave 1.2s ease-in-out infinite; }
      `}</style>
    </AgPage>
  );
}
