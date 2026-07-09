/**
 * PlayerHQ — Feiringsside når en treningsplan er fullført.
 *
 * Vises automatisk etter siste økt i en plan markeres COMPLETED. Auto-arkiverer
 * planen, beregner PlanEffectiveness og oppretter en achievement-notifikasjon.
 * Her viser vi spilleren resultatene visuelt og inviterer til å be om en ny plan.
 */

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { computeEffectiveness } from "@/lib/ai-plan/effectiveness";

type Params = Promise<{ planId: string }>;

function formatDelta(v: number | null): string {
  if (v === null) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2).replace(".", ",")}`;
}

function deltaKlasse(v: number | null): string {
  if (v === null) return "text-muted-foreground";
  if (v > 0.05) return "text-success";
  if (v < -0.05) return "text-destructive";
  return "text-muted-foreground";
}

export default async function PlanFeiring({ params }: { params: Params }) {
  const user = await requirePortalUser();
  const { planId } = await params;

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    select: {
      id: true,
      userId: true,
      name: true,
      startDate: true,
      endDate: true,
      status: true,
      sessions: {
        select: { id: true, status: true },
      },
    },
  });
  if (!plan) notFound();

  // Bare eier eller coach kan se siden.
  const erEier = plan.userId === user.id;
  const erCoach = user.role === "COACH" || user.role === "ADMIN";
  if (!erEier && !erCoach) redirect("/portal/tren");

  // Sjekk om planen faktisk er fullført. Hvis ikke, redirect tilbake.
  if (plan.status !== "ARCHIVED" && plan.sessions.length > 0) {
    const alle = plan.sessions.length;
    const ferdige = plan.sessions.filter((s) => s.status === "COMPLETED").length;
    if (ferdige !== alle) {
      redirect("/portal/tren");
    }
  }

  // Forsøk å hente PlanEffectiveness. Hvis den ikke finnes ennå, regn den ut
  // best-effort her — feiringssiden bør alltid kunne vise data.
  let eff = await prisma.planEffectiveness.findUnique({ where: { planId } });
  if (!eff) {
    try {
      eff = await computeEffectiveness(planId);
    } catch (err) {
      console.error("[feiring] computeEffectiveness failed", err);
    }
  }

  const totalSesjoner = plan.sessions.length;
  const ferdigeSesjoner = plan.sessions.filter(
    (s) => s.status === "COMPLETED",
  ).length;

  const prosent =
    totalSesjoner > 0 ? Math.round((ferdigeSesjoner / totalSesjoner) * 100) : 0;

  // Ring SVG — circumference for r=50: 2π×50 ≈ 314
  const circumference = 314;
  const dashoffset = circumference - (circumference * prosent) / 100;

  // Personlig rekord — sammenlign SG-Total-delta med tidligere planer.
  const tidligere = await prisma.planEffectiveness.findMany({
    where: { userId: plan.userId, planId: { not: planId } },
    orderBy: { computedAt: "desc" },
    select: { sgTotalDelta: true },
    take: 20,
  });
  const tidligereSgTotal = tidligere
    .map((t) => t.sgTotalDelta)
    .filter((v): v is number => v !== null);
  const personligRekord =
    tidligereSgTotal.length === 0 ? null : Math.max(...tidligereSgTotal);
  const erRekord =
    eff?.sgTotalDelta !== null &&
    eff?.sgTotalDelta !== undefined &&
    personligRekord !== null &&
    eff.sgTotalDelta > personligRekord;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dark hero section — bg-primary (deep forest) with lime text */}
      <section className="bg-primary text-primary-foreground px-5 pb-10 pt-16 text-center flex flex-col items-center">
        {/* Completion ring */}
        <svg viewBox="0 0 120 120" className="h-28 w-28 mb-6">
          {/* Track */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="10"
          />
          {/* Fill */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#D1F843"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            transform="rotate(-90 60 60)"
          />
          {/* Labels */}
          <text
            x="60"
            y="56"
            textAnchor="middle"
            fill="#D1F843"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="8"
            fontWeight="600"
            letterSpacing="0.12em"
          >
            PERIODE
          </text>
          <text
            x="60"
            y="76"
            textAnchor="middle"
            fill="#D1F843"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="20"
            fontWeight="700"
          >
            {prosent}%
          </text>
        </svg>

        {/* Eyebrow */}
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-accent mb-3">
          Periode fullført
        </div>

        {/* h1 */}
        <h1 className="font-display text-[28px] font-semibold leading-tight text-primary-foreground mb-3">
          Utrolig{" "}
          <em className="text-accent not-italic font-semibold">gjennomkjøring!</em>
        </h1>

        {/* Subtitle */}
        <p className="text-[14px] text-primary-foreground/70 max-w-xs">
          {plan.name} er fullført.{" "}
          {ferdigeSesjoner} av {totalSesjoner} økter gjennomført.
        </p>
      </section>

      {/* PersonalBest card — overlaps hero bottom */}
      {erRekord && (
        <div className="mx-4 -mt-4 rounded-2xl bg-accent p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Star
              className="h-5 w-5 text-accent-foreground shrink-0"
              strokeWidth={1.75}
            />
            <div>
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-foreground">
                Personlig rekord
              </div>
              <div className="text-[13px] text-accent-foreground/80 mt-0.5">
                Beste SG-Total-delta hittil — bygg videre på dette.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GoalProgress card */}
      <div className={`mx-4 rounded-2xl border border-border bg-card p-4 ${erRekord ? "mt-3" : "mt-4"}`}>
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">
          Planfremgang
        </div>
        <div className="font-mono text-[28px] font-bold tabular-nums text-success leading-none mb-3">
          {ferdigeSesjoner}
          <span className="text-[16px] text-muted-foreground font-medium">
            /{totalSesjoner} fullført
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
            style={{ width: `${prosent}%` }}
          />
        </div>
        <div className="text-[12px] text-muted-foreground">
          {plan.name} · {totalSesjoner} {totalSesjoner === 1 ? "uke" : "uker"}
        </div>
      </div>

      {/* SG data card */}
      {eff ? (
        <div className="mx-4 mt-3 rounded-2xl border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
            Strokes Gained — utvikling
          </div>
          <div className="grid grid-cols-5 gap-2">
            <SgCell label="Total" v={eff.sgTotalDelta} />
            <SgCell label="OTT" v={eff.sgOttDelta} />
            <SgCell label="APP" v={eff.sgAppDelta} />
            <SgCell label="ARG" v={eff.sgArgDelta} />
            <SgCell label="PUTT" v={eff.sgPuttDelta} />
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Snitt SG — 5 runder før vs. etter planen.
          </p>
        </div>
      ) : (
        <div className="mx-4 mt-3 rounded-2xl border border-dashed border-border bg-card p-4 text-center text-[13px] text-muted-foreground">
          Ikke nok runde-data ennå til å beregne SG-deltaer. Spill noen runder
          så regner vi dette automatisk.
        </div>
      )}

      {/* Tidligere planer */}
      {personligRekord !== null && eff?.sgTotalDelta !== null && (
        <div className="mx-4 mt-3 rounded-2xl border border-border bg-card p-4">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
            Mot tidligere planer
          </div>
          <div className="flex gap-6">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground mb-1">
                Denne planen
              </div>
              <div
                className={`font-mono text-[22px] font-semibold tabular-nums ${deltaKlasse(eff?.sgTotalDelta ?? null)}`}
              >
                {formatDelta(eff?.sgTotalDelta ?? null)}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground mb-1">
                Beste tidligere
              </div>
              <div
                className={`font-mono text-[22px] font-semibold tabular-nums ${deltaKlasse(personligRekord)}`}
              >
                {formatDelta(personligRekord)}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground mb-1">
                Planer totalt
              </div>
              <div className="font-mono text-[22px] font-semibold tabular-nums text-foreground">
                {tidligere.length + 1}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="mx-4 mt-4 flex flex-col gap-3 pb-16">
        <Link
          href="/portal/tren"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 font-mono text-[12px] font-bold uppercase tracking-[0.10em] text-accent-foreground transition-opacity hover:opacity-90"
        >
          Be om ny plan
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </Link>
        <Link
          href="/portal"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-transparent px-6 font-mono text-[12px] font-bold uppercase tracking-[0.10em] text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Tilbake til hjem
        </Link>
      </div>
    </div>
  );
}

function SgCell({ label, v }: { label: string; v: number | null }) {
  const Ikon = v === null ? null : v >= 0 ? TrendingUp : TrendingDown;
  const farge = deltaKlasse(v);

  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-background/60 py-3 px-1">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      {Ikon && (
        <Ikon className={`h-3.5 w-3.5 ${farge}`} strokeWidth={1.75} />
      )}
      <div className={`font-mono text-[13px] font-semibold tabular-nums ${farge}`}>
        {formatDelta(v)}
      </div>
    </div>
  );
}
