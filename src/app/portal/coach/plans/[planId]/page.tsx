/**
 * PlayerHQ Coach Plan-detalj (/portal/coach/plans/[planId]) — hybrid-design 2026-06-17.
 *
 * Layout: tilbake-pil → display-tittel → coach-notat (lime left-border) →
 * progress-kort (forest→lime bar) → drill-liste med "Utfør"-knapper.
 * Matcher fasit B5 · Planer (Detalj-fane).
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Target, TrendingUp } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AthleticBadge } from "@/components/athletic/badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  aggregateByArea,
  prosentPerArea,
  PYR_REKKEFOLGE,
  PYR_LABEL,
} from "@/lib/pyramide";
import type { PyramidArea } from "@/generated/prisma/client";
import { PlayerPlanActions } from "./player-plan-actions";

const FASER = [
  { key: "GEN", label: "Generell" },
  { key: "SPE", label: "Spesifikk" },
  { key: "TAP", label: "Taper" },
  { key: "TOP", label: "Toppform" },
  { key: "RES", label: "Restitusjon" },
] as const;

const TYPE_TAG_KLASSE: Record<PyramidArea | "TEST", string> = {
  FYS:  "bg-primary/10 text-primary",
  TEK:  "bg-primary/15 text-primary",
  SLAG: "bg-accent/30 text-foreground",
  SPILL:"bg-accent/20 text-accent-foreground",
  TURN: "bg-secondary text-muted-foreground",
  TEST: "bg-destructive/10 text-destructive",
};

function fmtDatoLang(d: Date) {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function ukedag(d: Date, idag: Date) {
  const sameDay =
    d.getFullYear() === idag.getFullYear() &&
    d.getMonth() === idag.getMonth() &&
    d.getDate() === idag.getDate();
  if (sameDay) return `I dag · ${d.toLocaleDateString("nb-NO", { weekday: "short" })}`;
  return d.toLocaleDateString("nb-NO", { weekday: "long" });
}

function fmtKlokke(d: Date) {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

function initialer(navn: string) {
  return navn.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function aktivFase(start: Date, slutt: Date | null, naa: Date) {
  if (!slutt) return 0;
  const total = slutt.getTime() - start.getTime();
  if (total <= 0) return 0;
  const passert = Math.max(0, naa.getTime() - start.getTime());
  const andel = Math.min(1, passert / total);
  return Math.min(FASER.length - 1, Math.floor(andel * FASER.length));
}

export default async function CoachPlanDetalj({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const user = await requirePortalUser();
  const { planId } = await params;

  if (user.tier === "GRATIS") {
    return (
      <div className="mx-auto max-w-[430px] px-4 py-8 md:max-w-[1240px] md:px-0">
        <p className="text-[13px] text-muted-foreground">Krever Pro-abonnement.</p>
      </div>
    );
  }

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    include: {
      sessions: {
        include: { drills: { include: { exercise: true } } },
        orderBy: { scheduledAt: "asc" },
      },
    },
  });
  if (!plan) notFound();

  const erEier = plan.userId === user.id;
  const erStab = user.role === "ADMIN" || user.role === "COACH";
  if (!erEier && !erStab) notFound();

  const coach = plan.createdById
    ? await prisma.user.findUnique({
        where: { id: plan.createdById },
        select: { id: true, name: true },
      })
    : null;

  const sisteCoachingSession = plan.createdById
    ? await prisma.coachingSession.findFirst({
        where: { userId: plan.userId, coachId: plan.createdById, kind: "DIRECT" },
        orderBy: { updatedAt: "desc" },
        select: { messages: true, updatedAt: true },
      })
    : null;

  type Msg = { role: string; content: string; ts?: string };
  const rawMeldinger: unknown = sisteCoachingSession?.messages;
  const meldinger = Array.isArray(rawMeldinger) ? (rawMeldinger as Msg[]) : [];
  const sisteCoachMelding = [...meldinger].reverse().find((m) => m?.role === "coach" || m?.role === "assistant");

  const maal = await prisma.goal.findMany({
    where: { userId: plan.userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const fordeling = prosentPerArea(aggregateByArea(plan.sessions));
  const fullfort = plan.sessions.filter((s) => s.status === "COMPLETED").length;
  const total = plan.sessions.length;
  const gjennomforing = total === 0 ? 0 : Math.round((fullfort / total) * 100);

  const naa = new Date();
  const fasenIdx = aktivFase(plan.startDate, plan.endDate, naa);
  const faseAndelPct = plan.endDate && plan.endDate.getTime() > plan.startDate.getTime()
    ? Math.min(100, Math.max(0, ((naa.getTime() - plan.startDate.getTime()) / (plan.endDate.getTime() - plan.startDate.getTime())) * 100))
    : 0;

  const kommende = plan.sessions
    .filter((s) => s.status === "PLANNED" || s.status === "ACTIVE")
    .filter((s) => s.scheduledAt.getTime() >= naa.getTime() - 24 * 3600 * 1000)
    .slice(0, 6);

  const coachNavn = coach?.name ?? "Coach";
  const dagerIgjen = plan.endDate
    ? Math.max(0, Math.ceil((plan.endDate.getTime() - naa.getTime()) / (24 * 3600 * 1000)))
    : null;

  const alleDrills = plan.sessions.flatMap((s) => s.drills.map((d) => ({
    id: d.id,
    title: d.exercise?.name ?? d.notes ?? "Øvelse",
    meta: [d.exercise?.pyramidArea, d.repsSets].filter(Boolean).join(" · "),
    sessionId: s.id,
  }))).slice(0, 8);

  return (
    <div className="mx-auto max-w-[430px] pb-24 pt-2 md:max-w-[1240px] md:pb-8">

      {/* Tilbake */}
      <div className="mb-3 px-4 md:px-0">
        <Link
          href="/portal/coach/plans"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Planer
        </Link>
      </div>

      {/* Plan-tittel + meta */}
      <div className="mb-4 px-4 md:px-0">
        <h1 className="font-display text-[18px] font-bold leading-[1.06] tracking-[-0.02em] text-foreground">
          {plan.name}
        </h1>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          {dagerIgjen != null
            ? `${fmtDatoLang(plan.startDate)} – ${plan.endDate ? fmtDatoLang(plan.endDate) : "?"}`
            : `Fra ${fmtDatoLang(plan.startDate)}`}
          {" · "}Coach: {coachNavn}
        </p>
        {plan.isActive && (
          <div className="mt-2">
            <AthleticBadge variant="ok">AKTIV</AthleticBadge>
          </div>
        )}
      </div>

      {/* Player plan accept/reject actions */}
      {erEier && (plan.status === "PENDING_PLAYER" || plan.status === "REJECTED") && (
        <div className="mx-3 mb-3.5 md:mx-0">
          <PlayerPlanActions
            planId={plan.id}
            status={plan.status}
            playerComment={plan.playerComment}
            acceptedAt={plan.updatedAt}
          />
        </div>
      )}

      <div className="space-y-3 px-3 md:px-0">

        {/* Coach-notat — lime left-border */}
        <div
          className="rounded-xl border border-border bg-card p-3.5 shadow-sm"
          style={{ borderLeft: "3px solid #D1F843" }}
        >
          <div className="mb-1.5 font-display text-[13px] font-bold text-foreground">
            Coach-notat
          </div>
          <p className="text-[13px] leading-[1.55] text-foreground">
            {sisteCoachMelding?.content
              ? sisteCoachMelding.content
              : `${coachNavn.split(" ")[0]} har lagt opp denne planen for deg. Følg fasene — det er der utviklingen ligger.`}
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <div
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-[10px] font-semibold"
              style={{ background: "#005840", color: "#D1F843" }}
            >
              {initialer(coachNavn)}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground">{coachNavn}</div>
          </div>
        </div>

        {/* Planfremgang */}
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Planfremgang
            </span>
            <span className="font-mono text-[12px] font-semibold text-foreground">
              {gjennomforing} %
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full"
              style={{
                width: `${gjennomforing}%`,
                background: "linear-gradient(90deg,#005840,#b5d629)",
              }}
            />
          </div>
          <div className="mt-1.5 font-mono text-[12px] text-muted-foreground">
            {fullfort} / {total} økter fullfort
            {dagerIgjen != null && ` · ${dagerIgjen} dager igjen`}
          </div>
        </div>

        {/* Fase-strip */}
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
          <div className="mb-2 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            5-fase progresjon
          </div>
          <div className="relative h-2 w-full rounded-full bg-secondary">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${faseAndelPct}%` }}
            />
            {[20, 40, 60, 80].map((p) => (
              <span
                key={p}
                className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 bg-border"
                style={{ left: `${p}%` }}
              />
            ))}
          </div>
          <div className="mt-2 grid grid-cols-5 gap-0.5 text-center font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
            {FASER.map((f, i) => (
              <span key={f.key} className={i === fasenIdx ? "font-semibold text-foreground" : ""}>
                F{i + 1} {f.label}
              </span>
            ))}
          </div>
        </div>

        {/* Drills */}
        {alleDrills.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
            <div className="mb-2.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Drills
            </div>
            <div className="divide-y divide-border">
              {alleDrills.map((d) => (
                <div key={d.id} className="flex items-center gap-2.5 py-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: "#005840" }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-foreground">{d.title}</div>
                    {d.meta && (
                      <div className="font-mono text-[10px] text-muted-foreground">{d.meta}</div>
                    )}
                  </div>
                  <Link
                    href={`/portal/tren/${d.sessionId}`}
                    className="shrink-0 rounded-full px-3 py-[6px] font-mono text-[10px] font-bold uppercase tracking-[0.06em] transition hover:brightness-95"
                    style={{ background: "#005840", color: "#D1F843" }}
                  >
                    Utfør
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kommende økter */}
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Kommende økter
            </div>
            <Calendar size={14} strokeWidth={1.5} className="text-muted-foreground" />
          </div>
          {kommende.length === 0 ? (
            <EmptyState
              icon={Calendar}
              titleItalic="Ingen"
              titleTrail="planlagte økter"
              sub="Coachen din legger inn nye økter etter hvert som planen utvikler seg."
            />
          ) : (
            <div className="divide-y divide-border">
              {kommende.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2.5 py-2"
                >
                  <span
                    className={`w-[80px] shrink-0 font-mono text-[10px] uppercase tracking-[0.06em] ${
                      i === 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {ukedag(s.scheduledAt, naa)}
                  </span>
                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <TypeTag type={s.pyramidArea} />
                    <Link
                      href={`/portal/tren/${s.id}`}
                      className="truncate text-[13px] font-medium text-foreground hover:text-primary"
                    >
                      {s.title}
                    </Link>
                  </div>
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    {fmtKlokke(s.scheduledAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pyramide-fordeling */}
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
          <div className="mb-2 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Pyramide-fordeling
          </div>
          <div className="grid grid-cols-5 gap-2">
            {PYR_REKKEFOLGE.map((omr) => (
              <div key={omr} className="rounded-lg border border-border bg-secondary/40 p-2.5 text-center">
                <div className="font-mono text-[8px] uppercase tracking-[0.06em] text-muted-foreground">
                  {PYR_LABEL[omr]}
                </div>
                <div className="mt-0.5 font-mono text-[14px] font-semibold tabular-nums">
                  {fordeling[omr]}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maal */}
        {maal.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
            <div className="mb-2.5 flex items-center gap-2">
              <Target size={14} strokeWidth={1.5} className="text-muted-foreground" />
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Plan-mål
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {maal.slice(0, 6).map((m) => (
                <div key={m.id} className="rounded-lg border border-border bg-secondary/40 p-3">
                  <div className="text-[12px] font-medium text-muted-foreground">{m.title}</div>
                  <div className="mt-1.5 font-mono text-[18px] font-semibold tabular-nums leading-none">
                    {formaterMaalverdi(m.type, m.targetValue)}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {formaterMaalSub(m.type, m.targetDate)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insight-banner */}
        {total > 0 && gjennomforing >= 50 && (
          <div className="flex items-center gap-3 rounded-xl border border-accent/50 bg-accent/15 px-4 py-3.5">
            <TrendingUp size={16} strokeWidth={1.5} className="shrink-0 text-foreground" />
            <p className="text-[13px] text-foreground">
              Du er <b>{gjennomforing}% gjennom planen</b>. Hold tempoet.
            </p>
          </div>
        )}

        {/* Start ny økt-knapp */}
        <div className="pb-2">
          <Link
            href={`/portal/coach/plans/${plan.id}/ny-okt`}
            className="flex w-full items-center justify-center rounded-full py-3.5 font-mono text-[13px] font-bold uppercase tracking-[0.08em] transition hover:brightness-95"
            style={{ background: "#D1F843", color: "#0A1F17" }}
          >
            Start ny økt fra plan
          </Link>
        </div>

        {/* Accept/feedback actions (desktop) */}
        {erEier && (plan.status === "ACCEPTED" || plan.status === "ACTIVE") && (
          <PlayerPlanActions
            planId={plan.id}
            status={plan.status}
            playerComment={plan.playerComment}
            acceptedAt={plan.updatedAt}
          />
        )}
      </div>
    </div>
  );
}

function formaterMaalverdi(type: string, v: number | null) {
  if (v === null || v === undefined) return "—";
  switch (type) {
    case "HCP_TARGET":      return v.toFixed(1);
    case "SG_AREA":         return `${v >= 0 ? "+" : ""}${v.toFixed(1)}`;
    case "ROUNDS_PER_MONTH":return `${Math.round(v)} / mnd`;
    default:                return v.toString();
  }
}

function formaterMaalSub(type: string, date: Date | null) {
  const typeLabel: Record<string, string> = {
    HCP_TARGET: "Handicap-mål",
    SG_AREA: "Strokes Gained",
    ROUNDS_PER_MONTH: "Runder per måned",
    FREE_TEXT: "Mål",
  };
  const label = typeLabel[type] ?? "Mål";
  if (!date) return label;
  return `${label} · innen ${date.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" })}`;
}

function TypeTag({ type }: { type: PyramidArea }) {
  return (
    <span
      className={`shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
        TYPE_TAG_KLASSE[type] ?? "bg-secondary"
      }`}
    >
      {type}
    </span>
  );
}
