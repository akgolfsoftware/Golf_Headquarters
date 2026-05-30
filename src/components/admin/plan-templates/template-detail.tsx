"use client";

/**
 * Klient-komponent for mal-detalj-siden.
 * - Gantt-strip for uker × dager med drill-bokser.
 * - Donut for discipline-fordeling.
 * - Action-knapper kobler til server actions.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  Copy,
  Edit3,
  TrendingUp,
  X,
} from "lucide-react";
import {
  archiveTemplate,
  duplicateTemplate,
  unarchiveTemplate,
} from "@/app/admin/plan-templates/actions";
import {
  DAG_LABEL,
  ENV_LABEL,
  PYR_COLOR,
  PYR_LABEL,
  SKILL_LABEL,
  donutGradient,
  formatPct,
  type DisciplinFordeling,
  type DrillEntry,
} from "./shared";
import type {
  LPhase,
  NgfKategori,
  PyramidArea,
  SessionEnvironment,
  SkillArea,
} from "@/generated/prisma/client";
import Link from "next/link";

export type SessionData = {
  id: string;
  ukeNr: number;
  dagNr: number;
  title: string;
  varighetMin: number;
  pyramidArea: PyramidArea;
  skillArea: SkillArea | null;
  environment: SessionEnvironment;
  drills: Array<DrillEntry & { exerciseName: string | null }>;
  focus: string | null;
  notes: string | null;
};

export type TemplateData = {
  id: string;
  name: string;
  description: string | null;
  kategori: NgfKategori;
  lPhase: LPhase;
  varighetUker: number;
  ukentligOktAntall: number;
  fordeling: DisciplinFordeling;
  anbefaltFordeling: DisciplinFordeling;
  minAlder: number | null;
  maxAlder: number | null;
  approved: boolean;
  usageCount: number;
  effectivenessAvg: number | null;
  sessions: SessionData[];
};

export function TemplateDetail({ template }: { template: TemplateData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [aktivSession, setAktivSession] = useState<SessionData | null>(null);

  function onDuplicate() {
    startTransition(async () => {
      const res = await duplicateTemplate(template.id);
      if (res.ok) {
        router.push(`/admin/plan-templates/${res.data.templateId}`);
      } else {
        alert(`Kunne ikke duplisere: ${res.error}`);
      }
    });
  }

  function onToggleArchive() {
    startTransition(async () => {
      const res = template.approved
        ? await archiveTemplate(template.id)
        : await unarchiveTemplate(template.id);
      if (!res.ok) {
        alert(res.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* KPI-strip */}
        <KpiStrip template={template} />

        {/* Gantt-strip */}
        <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Uke-program
            </h2>
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              {template.sessions.length} økter · {template.varighetUker} uker
            </div>
          </div>

          <GanttStrip
            varighetUker={template.varighetUker}
            sessions={template.sessions}
            onSelectSession={setAktivSession}
          />

          <Legend />
        </section>

        {/* Discipline-fordeling */}
        <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Discipline-fordeling
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sammenlignet med anbefalt baseline for nivå {template.kategori}.
            </p>
          </div>
          <FordelingDonut
            fordeling={template.fordeling}
            anbefalt={template.anbefaltFordeling}
          />
        </section>

        {/* Action-rad */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href={`/admin/plan-templates/${template.id}/rediger`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Edit3 className="h-4 w-4" strokeWidth={1.75} />
            Rediger struktur
          </Link>
          <button
            type="button"
            onClick={onDuplicate}
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground transition hover:bg-secondary disabled:opacity-50"
          >
            <Copy className="h-4 w-4" strokeWidth={1.75} />
            Dupliser
          </button>
          <button
            type="button"
            onClick={onToggleArchive}
            disabled={isPending}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-6 text-sm font-medium transition disabled:opacity-50 ${
              template.approved
                ? "border-destructive/30 bg-card text-destructive hover:bg-destructive/10"
                : "border-primary/30 bg-card text-primary hover:bg-primary/10"
            }`}
          >
            <Archive className="h-4 w-4" strokeWidth={1.75} />
            {template.approved ? "Arkiver" : "Gjenåpne"}
          </button>
          <Link
            href={`/admin/analytics?templateId=${template.id}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground transition hover:bg-secondary"
          >
            <TrendingUp className="h-4 w-4" strokeWidth={1.75} />
            Se effekt-historikk
          </Link>
        </div>
      </div>

      {aktivSession && (
        <SessionModal
          session={aktivSession}
          onClose={() => setAktivSession(null)}
        />
      )}
    </>
  );
}

function KpiStrip({ template }: { template: TemplateData }) {
  const totalSessions = template.sessions.length;
  const completionRate = 0.87; // placeholder — kunne beregnes fra effectiveness
  const rating =
    template.effectivenessAvg != null
      ? Math.min(5, Math.max(1, 3 + template.effectivenessAvg))
      : null;

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
      <KpiCard
        eyebrow="Brukt"
        value={template.usageCount.toString()}
        unit="ganger"
      />
      <KpiCard
        eyebrow="SG-Total-delta"
        value={
          template.effectivenessAvg != null
            ? `${template.effectivenessAvg >= 0 ? "+" : ""}${template.effectivenessAvg.toFixed(1)}`
            : "—"
        }
        tone={
          template.effectivenessAvg != null && template.effectivenessAvg >= 0
            ? "positive"
            : template.effectivenessAvg != null
              ? "negative"
              : "neutral"
        }
      />
      <KpiCard
        eyebrow="Completion-rate"
        value={`${Math.round(completionRate * 100)}%`}
      />
      <KpiCard eyebrow="Antall økter" value={totalSessions.toString()} />
      <KpiCard
        eyebrow="Effektivitet"
        value={rating != null ? `${rating.toFixed(1)}/5` : "—"}
      />
    </div>
  );
}

function KpiCard({
  eyebrow,
  value,
  unit,
  tone = "neutral",
}: {
  eyebrow: string;
  value: string;
  unit?: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  const toneClass =
    tone === "positive"
      ? "text-primary"
      : tone === "negative"
        ? "text-destructive"
        : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        {eyebrow}
      </div>
      <div className={`mt-2 font-mono text-2xl font-bold leading-none ${toneClass}`}>
        {value}
      </div>
      {unit && <div className="mt-1 text-xs text-muted-foreground">{unit}</div>}
    </div>
  );
}

function GanttStrip({
  varighetUker,
  sessions,
  onSelectSession,
}: {
  varighetUker: number;
  sessions: SessionData[];
  onSelectSession: (s: SessionData) => void;
}) {
  const uker = Array.from({ length: varighetUker }, (_, i) => i + 1);
  const dager = [1, 2, 3, 4, 5, 6, 7];

  function getSession(uke: number, dag: number): SessionData | undefined {
    return sessions.find((s) => s.ukeNr === uke && s.dagNr === dag);
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        {/* Dag-header */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1">
          <div />
          {dager.map((d) => (
            <div
              key={d}
              className="rounded-md bg-secondary px-2 py-1.5 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-secondary-foreground"
            >
              {DAG_LABEL[d - 1]}
            </div>
          ))}
        </div>

        {uker.map((uke) => (
          <div
            key={uke}
            className="mt-1 grid grid-cols-[60px_repeat(7,1fr)] gap-1"
          >
            <div className="flex items-center justify-center rounded-md bg-secondary/60 font-mono text-xs font-semibold">
              Uke {uke}
            </div>
            {dager.map((dag) => {
              const s = getSession(uke, dag);
              return (
                <div key={dag} className="min-h-[64px]">
                  {s ? (
                    <button
                      type="button"
                      onClick={() => onSelectSession(s)}
                      className="group flex h-full w-full flex-col items-start gap-1 rounded-md border-l-[3px] bg-card p-2 text-left transition hover:bg-secondary"
                      style={{ borderLeftColor: PYR_COLOR[s.pyramidArea] }}
                    >
                      <div className="line-clamp-2 text-[11px] font-semibold leading-tight">
                        {s.title}
                      </div>
                      <div className="mt-auto font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        {s.varighetMin} min · {s.drills.length}d
                      </div>
                    </button>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-md border border-dashed border-border/60 text-[10px] text-muted-foreground/50">
                      —
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function Legend() {
  const omr: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.08em] text-muted-foreground">
      {omr.map((o) => (
        <span key={o} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: PYR_COLOR[o] }}
          />
          {PYR_LABEL[o]}
        </span>
      ))}
    </div>
  );
}

function FordelingDonut({
  fordeling,
  anbefalt,
}: {
  fordeling: DisciplinFordeling;
  anbefalt: DisciplinFordeling;
}) {
  const omr: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[180px_1fr]">
      <div className="relative flex h-[180px] w-[180px] items-center justify-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{ background: donutGradient(fordeling) }}
        />
        <div className="relative z-10 flex h-[100px] w-[100px] flex-col items-center justify-center rounded-full bg-card">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            5 disipliner
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {omr.map((o) => {
          const a = fordeling[o];
          const b = anbefalt[o];
          const diff = a - b;
          return (
            <div key={o} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-sm"
                style={{ background: PYR_COLOR[o] }}
              />
              <span className="w-20 font-mono text-xs">{PYR_LABEL[o]}</span>
              <div className="flex-1">
                <div className="relative h-2 rounded-full bg-secondary">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${a * 100}%`,
                      background: PYR_COLOR[o],
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-y-[-2px] w-px bg-foreground/50"
                    style={{ left: `${b * 100}%` }}
                    title={`Anbefalt ${formatPct(b)}`}
                  />
                </div>
              </div>
              <span className="w-16 text-right font-mono text-xs">
                {formatPct(a)}
              </span>
              <span
                className={`w-14 text-right font-mono text-[10px] ${
                  Math.abs(diff) < 0.03
                    ? "text-muted-foreground"
                    : diff > 0
                      ? "text-primary"
                      : "text-destructive"
                }`}
              >
                {diff >= 0 ? "+" : ""}
                {Math.round(diff * 100)}pp
              </span>
            </div>
          );
        })}
        <p className="mt-2 text-[10px] text-muted-foreground">
          Vertikal linje = anbefalt baseline for nivå.
        </p>
      </div>
    </div>
  );
}

function SessionModal({
  session,
  onClose,
}: {
  session: SessionData;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-lg sm:max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Uke {session.ukeNr} · {DAG_LABEL[session.dagNr - 1]} ·{" "}
              {session.varighetMin} min · {ENV_LABEL[session.environment]}
            </div>
            <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
              {session.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-secondary"
            aria-label="Lukk"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className="rounded-full px-4 py-1 font-mono text-[10px] uppercase tracking-wider"
            style={{
              background: PYR_COLOR[session.pyramidArea],
              color: "var(--color-card)",
            }}
          >
            {PYR_LABEL[session.pyramidArea]}
          </span>
          {session.skillArea && (
            <span className="rounded-full bg-secondary px-4 py-1 font-mono text-[10px] uppercase tracking-wider text-secondary-foreground">
              {SKILL_LABEL[session.skillArea]}
            </span>
          )}
        </div>

        {session.focus && (
          <div className="mt-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Fokus
            </div>
            <p className="mt-1 text-sm">{session.focus}</p>
          </div>
        )}

        <div className="mt-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Drills ({session.drills.length})
          </div>
          <ul className="mt-2 space-y-2">
            {session.drills.map((d, i) => (
              <li
                key={`${d.exerciseId}-${i}`}
                className="rounded-md border border-border bg-background/40 p-4"
              >
                <div className="text-sm font-medium">
                  {d.exerciseName ?? d.exerciseId}
                </div>
                <div className="mt-1 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {d.sets != null && <span>{d.sets} sett</span>}
                  {d.reps != null && <span>{d.reps} reps</span>}
                  {d.csTarget != null && <span>CS {d.csTarget}</span>}
                </div>
                {d.notes && (
                  <p className="mt-2 text-xs text-muted-foreground">{d.notes}</p>
                )}
              </li>
            ))}
            {session.drills.length === 0 && (
              <li className="text-xs text-muted-foreground">
                Ingen drills definert for økten.
              </li>
            )}
          </ul>
        </div>

        {session.notes && (
          <div className="mt-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Notater
            </div>
            <p className="mt-1 text-sm whitespace-pre-wrap">{session.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
