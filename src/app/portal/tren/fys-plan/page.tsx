/**
 * FYS-plan — hub-side (PlayerHQ).
 *
 * Hybrid design: editorial lys header (eyebrow + display-tittel) → terminal
 * datakort nedenfor. FYS-resultatformel er IKKE låst — plassholder-tekst brukes
 * overalt. Ingen hardkodede referanseverdier.
 *
 * Prisma-spørring: FysiskPlan → uker → okter (uendret fra tidligere).
 */

import Link from "next/link";
import { Dumbbell, Plus, ChevronRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AthleticEyebrow } from "@/components/athletic";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PlanStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

interface EnrichedPlan {
  id: string;
  navn: string;
  status: PlanStatus;
  startDato: Date;
  sluttDato: Date | null;
  ukerCount: number;
  okterCount: number;
  /** Fremgang: antall fullførte uker / totale uker (0–100) */
  pct: number;
  currentWeek: number;
}

type RawFysPlan = {
  id: string;
  navn: string;
  status: string;
  startDato: Date;
  sluttDato: Date | null;
  uker: { okter: { id: string }[] }[];
};

// Modulnivå-helper: Date.now() kan ikke kalles i render-body (react-hooks/purity).
function enrichPlaner(planer: RawFysPlan[]): EnrichedPlan[] {
  const now = Date.now();
  return planer.map((p) => {
    const ukerCount = p.uker.length;
    const okterCount = p.uker.reduce((s, u) => s + u.okter.length, 0);
    // Beregn hvilken uke vi er i basert på startdato
    const start = p.startDato.getTime();
    const weeksElapsed = Math.max(0, Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000)));
    const currentWeek = Math.min(weeksElapsed + 1, ukerCount);
    const pct = ukerCount > 0 ? Math.round((currentWeek / ukerCount) * 100) : 0;

    const status: PlanStatus =
      p.status === "ACTIVE" ? "ACTIVE" : p.status === "ARCHIVED" ? "ARCHIVED" : "DRAFT";

    return {
      id: p.id,
      navn: p.navn,
      status,
      startDato: p.startDato,
      sluttDato: p.sluttDato,
      ukerCount,
      okterCount,
      pct: Math.min(100, pct),
      currentWeek,
    };
  });
}

export default async function FysPlanListePage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const planer = await prisma.fysiskPlan.findMany({
    where: { userId: user.id },
    orderBy: { startDato: "desc" },
    include: {
      uker: {
        select: {
          id: true,
          okter: { select: { id: true } },
        },
      },
    },
  });

  const enriched = enrichPlaner(planer);

  const aktive = enriched.filter((p) => p.status !== "ARCHIVED");
  const arkiverte = enriched.filter((p) => p.status === "ARCHIVED");
  const harNoen = enriched.length > 0;

  return (
    <div className="mx-auto max-w-[430px] space-y-6 px-4 pb-24 md:pb-8">
      {/* ── Editorial hero ── */}
      <header className="flex items-start justify-between gap-4 pt-1">
        <div>
          <AthleticEyebrow>Tren · Fysisk plan</AthleticEyebrow>
          <h1 className="font-display mt-1.5 text-[26px] font-bold leading-tight tracking-[-0.025em] text-foreground">
            FYS
            <em
              className="font-medium not-italic"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontStyle: "italic",
                color: "hsl(var(--primary))",
              }}
            >
              -plan
            </em>
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Plassholderverdier · formelen ikke låst
          </p>
        </div>
        <Link
          href="/portal/tren/fys-plan/ny"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-accent transition-opacity hover:opacity-90"
        >
          <Plus className="h-3 w-3" strokeWidth={2.4} aria-hidden />
          Ny test
        </Link>
      </header>

      {/* ── Mastery rings — FYS-score per område (plassholder) ── */}
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <AthleticEyebrow className="mb-3 block">
          FYS-score per område · plassholder
        </AthleticEyebrow>
        <div className="flex justify-around">
          <MasteryRing label="Styrke" pct={62} color="#005840" />
          <MasteryRing label="Mobilitet" pct={78} color="#B8852A" />
          <MasteryRing label="Uthold." pct={55} color="#2563EB" />
          <MasteryRing label="Spenst" pct={70} color="#D1F843" />
        </div>
      </section>

      {/* ── Aktive planer ── */}
      {aktive.length > 0 && (
        <section className="space-y-3">
          <AthleticEyebrow>
            Aktive · {aktive.length}
          </AthleticEyebrow>
          <div className="space-y-3">
            {aktive.map((p, i) => (
              <PlanCard key={p.id} plan={p} featured={i === 0 && p.status === "ACTIVE"} />
            ))}
          </div>
        </section>
      )}

      {/* ── Arkiverte planer ── */}
      {arkiverte.length > 0 && (
        <section className="space-y-3">
          <AthleticEyebrow>
            Arkiverte · {arkiverte.length}
          </AthleticEyebrow>
          <div className="space-y-3">
            {arkiverte.map((p) => (
              <PlanCard key={p.id} plan={p} featured={false} />
            ))}
          </div>
        </section>
      )}

      {/* ── Tom tilstand ── */}
      {!harNoen && (
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
            <Dumbbell size={22} strokeWidth={1.5} aria-hidden />
          </div>
          <div>
            <p className="font-display text-[16px] font-bold text-foreground">
              Ingen aktiv plan
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground max-w-[26ch] mx-auto">
              Lag din første fysiske treningsplan for å begynne å logge styrke- og kondisjonsøkter.
            </p>
          </div>
          <Link
            href="/portal/tren/fys-plan/ny"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-accent transition-opacity hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
            Lag din første plan
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Delkomponenter ────────────────────────────────────────────────

function MasteryRing({
  label,
  pct,
  color,
}: {
  label: string;
  pct: number;
  color: string;
}) {
  const C = 175; // stroke circumference (2πr, r=28 i 72×72 viewBox)
  const dash = C * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg viewBox="0 0 72 72" className="h-16 w-16">
        {/* Bakgrunnsring */}
        <circle
          cx="36"
          cy="36"
          r="28"
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth="9"
        />
        {/* Fremdriftsring */}
        <circle
          cx="36"
          cy="36"
          r="28"
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={dash}
          transform="rotate(-90 36 36)"
        />
        {/* Plassholder-tall */}
        <text
          x="36"
          y="40"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="12"
          fontWeight="700"
          fill="hsl(var(--muted-foreground))"
        >
          —
        </text>
      </svg>
      <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.04em] text-muted-foreground text-center">
        {label}
      </span>
    </div>
  );
}

const STATUS_CFG: Record<PlanStatus, { label: string; cls: string }> = {
  ACTIVE: {
    label: "Aktiv",
    cls: "bg-[rgba(0,88,64,0.1)] text-primary",
  },
  DRAFT: {
    label: "Utkast",
    cls: "bg-secondary text-muted-foreground",
  },
  ARCHIVED: {
    label: "Arkivert",
    cls: "bg-secondary text-muted-foreground",
  },
};

function PlanCard({
  plan,
  featured,
}: {
  plan: EnrichedPlan;
  featured: boolean;
}) {
  const s = STATUS_CFG[plan.status];

  return (
    <Link
      href={`/portal/tren/fys-plan/${plan.id}`}
      className={cn(
        "block rounded-xl border border-border bg-card p-4 shadow-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        featured && "border-l-[3px] border-l-primary",
      )}
    >
      {/* Topplinje: tittel + status-badge */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-[14px] font-semibold text-foreground leading-tight">
          {plan.navn}
        </p>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.04em]",
            s.cls,
          )}
        >
          {s.label}
        </span>
      </div>

      {/* Meta */}
      <p className="font-mono text-[10.5px] text-muted-foreground mb-3">
        {plan.ukerCount} uker · {plan.okterCount} økter
      </p>

      {/* Fremdriftslinje */}
      <div
        className="h-[7px] overflow-hidden rounded-full bg-secondary border border-border"
        role="progressbar"
        aria-valuenow={plan.pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(2, plan.pct)}%`,
            background:
              "linear-gradient(90deg, #005840, #B9E022)",
          }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground">
          {plan.pct} % fullført
          {plan.ukerCount > 0
            ? ` · uke ${plan.currentWeek} av ${plan.ukerCount}`
            : ""}
        </span>
        <ChevronRight
          className="h-4 w-4 text-muted-foreground"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
    </Link>
  );
}
