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
  CheckCircle2,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { computeEffectiveness } from "@/lib/ai-plan/effectiveness";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";

type Params = Promise<{ planId: string }>;

function formatDelta(v: number | null): string {
  if (v === null) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2).replace(".", ",")}`;
}

function deltaKlasse(v: number | null): string {
  if (v === null) return "text-muted-foreground";
  if (v > 0.05) return "text-primary";
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
    tidligereSgTotal.length === 0
      ? null
      : Math.max(...tidligereSgTotal);
  const erRekord =
    eff?.sgTotalDelta !== null &&
    eff?.sgTotalDelta !== undefined &&
    personligRekord !== null &&
    eff.sgTotalDelta > personligRekord;

  return (
    <div className="space-y-8">
      <Link
        href="/portal/tren"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Tilbake til trening
      </Link>

      <PageHeader
        eyebrow="PlayerHQ · Trening · Fullført"
        titleLead="Du fullførte"
        titleItalic={plan.name}
        sub={
          erRekord
            ? "Ny personlig rekord på SG-Total-delta. Bygg videre på dette."
            : "Se hvordan du har utviklet deg gjennom planen og ta neste steg."
        }
      />

      {/* Hovedkort — fullført */}
      <section className="overflow-hidden rounded-2xl border border-primary/40 bg-card">
        <div className="bg-primary/8 px-6 py-8 sm:px-10">
          <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-primary">
            <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
            Fullført treningsplan
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-6">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Økter gjennomført
              </div>
              <div className="mt-1 font-mono text-[40px] font-semibold leading-none tabular-nums">
                {ferdigeSesjoner}
                <span className="text-[18px] text-muted-foreground">
                  /{totalSesjoner}
                </span>
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Completion-rate
              </div>
              <div className="mt-1 font-mono text-[40px] font-semibold leading-none tabular-nums">
                {totalSesjoner > 0
                  ? Math.round((ferdigeSesjoner / totalSesjoner) * 100)
                  : 0}
                <span className="text-[18px] text-muted-foreground"> %</span>
              </div>
            </div>
            {erRekord && (
              <div className="rounded-full border border-accent bg-accent/20 px-4 py-2 font-mono text-[11px] font-semibold text-accent-foreground">
                <Sparkles className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.75} />
                Personlig rekord
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SG-deltas som progress-rings */}
      {eff ? (
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-[18px] font-semibold leading-tight">
            Din utvikling — Strokes Gained
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <SgRing label="Total" v={eff.sgTotalDelta} />
            <SgRing label="OTT" v={eff.sgOttDelta} />
            <SgRing label="APP" v={eff.sgAppDelta} />
            <SgRing label="ARG" v={eff.sgArgDelta} />
            <SgRing label="PUTT" v={eff.sgPuttDelta} />
          </div>
          <p className="mt-4 text-[12px] text-muted-foreground">
            Sammenligning av snitt-SG fra de 5 rundene før og etter planen.
          </p>
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-[13px] text-muted-foreground">
          Vi har ikke nok runde-data ennå til å beregne SG-deltaer. Spill noen
          runder så regner vi dette automatisk.
        </section>
      )}

      {/* Personlig rekord — sammenligning med tidligere planer */}
      {personligRekord !== null && eff?.sgTotalDelta !== null && (
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-2 font-display text-[16px] font-semibold leading-tight">
            Sammenlignet med tidligere planer
          </h2>
          <div className="flex flex-wrap items-center gap-6 font-mono">
            <div>
              <div className="text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Denne planen
              </div>
              <div
                className={`mt-1 text-[24px] font-semibold tabular-nums ${deltaKlasse(eff?.sgTotalDelta ?? null)}`}
              >
                {formatDelta(eff?.sgTotalDelta ?? null)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Beste tidligere
              </div>
              <div
                className={`mt-1 text-[24px] font-semibold tabular-nums ${deltaKlasse(personligRekord)}`}
              >
                {formatDelta(personligRekord)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Antall fullførte planer
              </div>
              <div className="mt-1 text-[24px] font-semibold tabular-nums text-foreground">
                {tidligere.length + 1}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link
          href="/portal/tren"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Til trening
        </Link>
        <Link
          href="/portal/tren/kalender"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Be om ny plan
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
      </section>
    </div>
  );
}

function SgRing({ label, v }: { label: string; v: number | null }) {
  const positiv = v !== null && v >= 0;
  const Ikon = v === null ? null : positiv ? TrendingUp : TrendingDown;
  const farge = deltaKlasse(v);

  // Ring-progress: prosent basert på absoluttverdi (kapret på 1.0 SG).
  const prosent =
    v === null ? 0 : Math.min(100, Math.round((Math.abs(v) / 1.0) * 100));
  const stroke = positiv ? "stroke-primary" : "stroke-destructive";

  return (
    <article className="flex flex-col items-center gap-2 rounded-md border border-border bg-background/40 p-4">
      <div className="relative h-20 w-20">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            className="stroke-border"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            className={stroke}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 42}
            strokeDashoffset={(2 * Math.PI * 42 * (100 - prosent)) / 100}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {Ikon && <Ikon className={`h-4 w-4 ${farge}`} strokeWidth={1.75} />}
        </div>
      </div>
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`font-mono text-[16px] font-semibold tabular-nums ${farge}`}
      >
        {formatDelta(v)}
      </div>
    </article>
  );
}
