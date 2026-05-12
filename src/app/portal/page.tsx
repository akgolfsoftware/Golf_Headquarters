/**
 * PRODUKSJON — PlayerHQ Hjem (/portal)
 * Endelig design migrert fra wireframe/design-files-v2/pilot/02-playerhq-hjem.html.
 *
 * Server-component med:
 *  - Italic Instrument Serif-hero ("Onsdag, Markus. To dager siden sist.")
 *  - KPI-strip med 4 kort (HCP dark-gradient, SG, Streak m/dag-strip, Pyramide-mini)
 *  - Dagens fokus-card med vertikal aksent-stripe og target-%
 *  - Bento: Pyramide-progresjon (span-2 m/ringer) + SG-fordeling
 *  - Sist registrert-liste, Coach-melding-banner og Plan-actions
 *
 * Auth: requirePortalUser() med rolle-redirect (COACH/ADMIN -> /admin, GUEST -> /admin/calendar).
 */

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  ChevronRight,
  Clock,
  Dumbbell,
  Flag,
  MessageSquare,
  Plus,
  Search,
  Star,
  Target,
  Trophy,
  Zap,
  Lock,
  Play,
  Calendar as CalendarIcon,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  getDashboardData,
  type SistRegistrert,
} from "@/lib/dashboard-data";
import { aktivStreak } from "@/lib/streak";
import { totalMinutter, prosentPerArea } from "@/lib/pyramide";
import { formatSg } from "@/lib/sg";
import { PlanActionsCard } from "@/components/portal/plan-actions-card";
import {
  SkeletonKpi,
  SkeletonCard,
} from "@/components/shared/loading-skeleton";
import type {
  PyramidArea,
  TrainingPlanSession,
  SessionDrill,
  ExerciseDefinition,
} from "@/generated/prisma/client";

type PortalUser = Awaited<ReturnType<typeof requirePortalUser>>;
type DrillMedDef = SessionDrill & { exercise: ExerciseDefinition };
type SesjonMedDrills = TrainingPlanSession & { drills: DrillMedDef[] };

const DAGNAVN = [
  "Søndag",
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
];

const MND = [
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
];

const PYR_REKKEFOLGE: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

const PYR_LABEL_KORT: Record<PyramidArea, string> = {
  FYS: "FYS",
  TEK: "TEK",
  SLAG: "SLAG",
  SPILL: "SPILL",
  TURN: "TURN",
};

// Pyramide-farger fra designet (CSS-vars fra @theme).
const PYR_COLOR: Record<PyramidArea, string> = {
  FYS: "var(--color-pyr-fys)",
  TEK: "var(--color-pyr-tek)",
  SLAG: "var(--color-pyr-slag)",
  SPILL: "var(--color-pyr-spill)",
  TURN: "var(--color-pyr-turn)",
};

export default async function PortalHjem() {
  const user = await requirePortalUser();

  // Rolle-basert redirect: coacher/admin -> CoachHQ, gjester -> kalender.
  // /portal er forbeholdt PLAYER og PARENT.
  if (user.role === "COACH" || user.role === "ADMIN") redirect("/admin");
  if (user.role === "GUEST") redirect("/admin/calendar");

  return (
    <div className="space-y-6 md:space-y-8">
      <Hero user={user} />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardSeksjoner user={user} />
      </Suspense>
    </div>
  );
}

async function DashboardSeksjoner({ user }: { user: PortalUser }) {
  const data = await getDashboardData(user);
  const streakAktivAntall = aktivStreak(data.streak14);
  const ukeMinutter = totalMinutter(data.pyramideUke);
  const pyramide14dProsent = prosentPerArea(data.pyramide14d);
  const pyramideSnitt = beregnSnitt(pyramide14dProsent);
  const kanStarteLive = user.tier !== "GRATIS";

  return (
    <div className="space-y-6 md:space-y-8">
      <KpiStrip
        hcp={user.hcp}
        sgTotal={data.sgAggregate.total}
        streak14={data.streak14}
        streakAktiv={streakAktivAntall}
        pyramide={pyramide14dProsent}
        pyramideSnitt={pyramideSnitt}
        ukeMinutter={ukeMinutter}
        tier={user.tier}
      />

      {data.pendingActions.length > 0 && (
        <PlanActionsCard actions={data.pendingActions} />
      )}

      <DagensFokus
        session={data.dagensSesjon}
        kanStarte={kanStarteLive}
        tier={user.tier}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-6">
        <PyramideProgresjon
          data={pyramide14dProsent}
          snitt={pyramideSnitt}
          tier={user.tier}
        />
        <SgFordeling sg={data.sgAggregate} tier={user.tier} />
      </div>

      <SistRegistrert items={data.sisteRegistrerte} />

      {data.sisteCoachMelding && (
        <CoachMelding melding={data.sisteCoachMelding} tier={user.tier} />
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8">
      <SkeletonKpi count={4} />
      <SkeletonCard height="h-44" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SkeletonCard height="h-64" />
        <SkeletonCard height="h-64" />
        <div className="hidden lg:block">
          <SkeletonCard height="h-64" />
        </div>
      </div>
      <SkeletonCard height="h-56" />
    </div>
  );
}

// --- HERO ----------------------------------------------------------------

function Hero({ user }: { user: PortalUser }) {
  const idag = new Date();
  const dagnavn = DAGNAVN[idag.getDay()];
  const datoTekst = `${dagnavn} ${idag.getDate()}. ${MND[idag.getMonth()]} ${idag.getFullYear()}`;
  const fornavn = user.name.split(" ")[0] ?? user.name;
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";
  const klokke = `${String(idag.getHours()).padStart(2, "0")}:${String(idag.getMinutes()).padStart(2, "0")}`;
  const isFree = user.tier === "GRATIS";

  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
      <div className="flex min-w-0 items-start gap-4 sm:gap-5">
        <span className="relative shrink-0">
          <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-primary text-xl font-semibold text-primary-foreground md:h-20 md:w-20 md:text-2xl">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt=""
                width={80}
                height={80}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              initial
            )}
          </span>
          <span
            className="absolute -bottom-1 -right-1 rounded-sm border-2 border-background px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider"
            style={{
              background: isFree ? "hsl(var(--secondary))" : "hsl(var(--accent))",
              color: isFree ? "hsl(var(--muted-foreground))" : "hsl(var(--accent-foreground))",
            }}
          >
            {isFree ? "Free" : "Pro"}
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Hjem · {datoTekst}
          </span>
          <h1 className="mt-2 font-display text-3xl font-normal italic leading-[1.05] tracking-tight text-foreground md:text-[42px]">
            {dagnavn}, {fornavn}.{" "}
            <span className="not-italic font-semibold text-primary">
              {user.ambition ? "Vi bygger videre." : "Klar for dagen?"}
            </span>
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <span>{klokke}</span>
            {user.homeClub && (
              <>
                <span className="text-foreground/30">·</span>
                <span>{user.homeClub}</span>
              </>
            )}
            {user.hcp != null && (
              <>
                <span className="text-foreground/30">·</span>
                <span className="font-mono">
                  HCP {user.hcp.toFixed(1).replace(".", ",")}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/portal/sok"
          aria-label="Søk"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-input bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <Search className="h-4 w-4" strokeWidth={1.75} />
          <span className="hidden sm:inline">Søk</span>
        </Link>
        <Link
          href="/portal/ny-okt"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Logg runde
        </Link>
      </div>
    </header>
  );
}

// --- KPI ----------------------------------------------------------------

function KpiStrip({
  hcp,
  sgTotal,
  streak14,
  streakAktiv,
  pyramide,
  pyramideSnitt,
  ukeMinutter,
  tier,
}: {
  hcp: number | null;
  sgTotal: number | null;
  streak14: boolean[];
  streakAktiv: number;
  pyramide: ReturnType<typeof prosentPerArea>;
  pyramideSnitt: number;
  ukeMinutter: number;
  tier: PortalUser["tier"];
}) {
  const isFree = tier === "GRATIS";
  const sgLocked = isFree;
  const pyramideLocked = isFree;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
      {/* HCP - dark gradient */}
      <article
        className="relative flex min-h-36 flex-col gap-2 overflow-hidden rounded-xl p-5 text-white"
        style={{
          background:
            "linear-gradient(135deg, #005840 0%, #003B2A 100%)",
        }}
      >
        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-white/70">
          <Trophy className="h-3.5 w-3.5" strokeWidth={1.75} />
          Handicap
        </div>
        <div className="font-mono text-5xl font-medium leading-none tabular-nums tracking-tight text-white">
          {hcp != null ? hcp.toFixed(1).replace(".", ",") : "—"}
        </div>
        <div
          className="mt-auto flex items-center gap-1 font-mono text-xs text-accent"
        >
          <span>Nåverdi · oppdatert i dag</span>
        </div>
      </article>

      {/* SG total */}
      <article className="relative flex min-h-36 flex-col gap-2 overflow-hidden rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          <Star className="h-3.5 w-3.5" strokeWidth={1.75} />
          SG total
        </div>
        <div
          className={`font-mono text-4xl font-medium leading-none tabular-nums tracking-tight ${sgLocked ? "blur-[2px]" : ""}`}
          style={{
            color:
              sgTotal != null
                ? sgTotal >= 0
                  ? "var(--color-pyr-tek)"
                  : "hsl(var(--destructive))"
                : "hsl(var(--foreground))",
          }}
        >
          {sgLocked ? "+0,4" : formatSg(sgTotal)}
        </div>
        {!sgLocked && (
          <div className="mt-auto font-mono text-xs text-muted-foreground">
            Siste 30 dager
          </div>
        )}
        {sgLocked && <LockOverlay label="SG kun for Pro" cta="Oppgrader" />}
      </article>

      {/* Streak */}
      <article className="relative flex min-h-36 flex-col gap-2 overflow-hidden rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          <Zap className="h-3.5 w-3.5" strokeWidth={1.75} />
          Streak
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-4xl font-medium leading-none tabular-nums text-foreground">
            {streakAktiv}
          </span>
          <span className="text-sm text-muted-foreground">
            {streakAktiv === 1 ? "dag" : "dager"}
          </span>
        </div>
        <StreakStrip streak={streak14} />
      </article>

      {/* Pyramide-mini */}
      <article className="relative flex min-h-36 flex-col gap-2 overflow-hidden rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          <Target className="h-3.5 w-3.5" strokeWidth={1.75} />
          Pyramide
        </div>
        <div
          className={`mt-1 flex items-end gap-1.5 ${pyramideLocked ? "blur-[2px]" : ""}`}
        >
          {PYR_REKKEFOLGE.map((area, idx) => {
            const size = 38 - idx * 4;
            return (
              <span
                key={area}
                className="flex flex-col items-center justify-center rounded-full text-[8px] font-bold leading-tight text-white"
                style={{
                  background: PYR_COLOR[area],
                  width: `${size}px`,
                  height: `${size}px`,
                  fontFamily: "var(--font-geist-mono)",
                }}
              >
                <span>{PYR_LABEL_KORT[area]}</span>
                <span className="text-[7px] font-medium">
                  {pyramide[area]}
                </span>
              </span>
            );
          })}
        </div>
        {!pyramideLocked && (
          <div className="mt-auto font-mono text-xs text-muted-foreground">
            Snitt {pyramideSnitt} % · {ukeMinutter} min uke
          </div>
        )}
        {pyramideLocked && (
          <LockOverlay label="Pyramide kun for Pro" cta="Oppgrader" />
        )}
      </article>
    </div>
  );
}

function StreakStrip({ streak }: { streak: boolean[] }) {
  // Vis siste 7 dager
  const siste7 = streak.slice(-7);
  const dagBokstaver = ["M", "T", "O", "T", "F", "L", "S"];
  // Beregn ukedager bakover fra i dag
  const idag = new Date();
  const startDag = idag.getDay() === 0 ? 6 : idag.getDay() - 1; // 0=man
  const labels = Array.from({ length: 7 }, (_, i) => {
    return dagBokstaver[(startDag - (6 - i) + 7) % 7];
  });

  return (
    <div className="mt-1 flex gap-1">
      {siste7.map((on, i) => {
        const isToday = i === siste7.length - 1;
        const cls = isToday
          ? "outline outline-2 outline-offset-2 outline-primary"
          : "";
        return (
          <span
            key={i}
            className={`flex h-7 flex-1 items-center justify-center rounded-sm font-mono text-[9px] font-semibold uppercase tracking-wider ${cls}`}
            style={{
              background: isToday
                ? "hsl(var(--accent))"
                : on
                  ? "hsl(var(--primary))"
                  : "hsl(var(--secondary))",
              color: isToday
                ? "hsl(var(--accent-foreground))"
                : on
                  ? "hsl(var(--primary-foreground))"
                  : "hsl(var(--muted-foreground))",
            }}
          >
            {labels[i]}
          </span>
        );
      })}
    </div>
  );
}

function LockOverlay({ label, cta }: { label: string; cta: string }) {
  return (
    <Link
      href="/portal/meg/abonnement"
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl bg-card/90 backdrop-blur-sm transition-colors hover:bg-card/95"
    >
      <span className="grid h-10 w-10 place-items-center rounded-md bg-foreground text-accent">
        <Lock className="h-5 w-5" strokeWidth={2} />
      </span>
      <span className="font-display text-sm font-semibold italic text-foreground">
        {label}
      </span>
      <span
        className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-accent-foreground"
      >
        {cta} →
      </span>
    </Link>
  );
}

// --- DAGENS FOKUS -------------------------------------------------------

function DagensFokus({
  session,
  kanStarte,
  tier,
}: {
  session: SesjonMedDrills | null;
  kanStarte: boolean;
  tier: PortalUser["tier"];
}) {
  if (!session) {
    return (
      <article className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-gradient-to-br from-background to-secondary px-6 py-10 text-center dark:from-card dark:to-card">
        <span
          className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground"
        >
          <Zap className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <h2 className="font-display text-2xl font-normal italic leading-tight text-foreground">
          Ingen økt planlagt i dag.
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Bygg en økt på 2 minutter — velg fokus, sett varighet, så bygger vi
          en plan rundt det.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Link
            href="/portal/ny-okt"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Sett opp første økt
          </Link>
          <Link
            href="/portal/tren"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-input bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Se planen
          </Link>
        </div>
      </article>
    );
  }

  const start = new Date(session.scheduledAt);
  const klokke = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
  const visibleDrills = session.drills.slice(0, 3);
  const fokusUrl = kanStarte
    ? `/portal/sesjon/${session.id}/live`
    : "/portal/meg/abonnement";
  const isFree = tier === "GRATIS";

  return (
    <article className="relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-background to-secondary p-6 shadow-sm md:flex-row md:items-end md:justify-between md:gap-8 md:p-8 dark:from-card dark:to-card">
      {/* Vertikal aksent-stripe */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1.5"
        style={{
          background:
            "linear-gradient(180deg, #D1F843 0%, #005840 100%)",
        }}
      />

      <div className="flex-1 pl-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
            Dagens fokus
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-card px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" strokeWidth={1.75} />
            {klokke} · {session.durationMin} min
          </span>
        </div>
        <h2 className="mt-3 font-display text-3xl font-normal italic leading-[1.1] tracking-tight text-foreground md:text-[34px]">
          {session.title.split(" — ")[0] ?? session.title}
          {session.title.includes(" — ") && (
            <span className="not-italic font-semibold">
              {" "}
              — {session.title.split(" — ").slice(1).join(" — ")}.
            </span>
          )}
        </h2>
        {session.rationale && (
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {session.rationale}
          </p>
        )}

        {visibleDrills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {visibleDrills.map((d) => (
              <span
                key={d.id}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs font-medium text-foreground"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: PYR_COLOR[session.pyramidArea] }}
                />
                {d.exercise.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link
            href={fokusUrl}
            className={`inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors ${
              kanStarte
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-input bg-card text-foreground hover:bg-secondary"
            }`}
          >
            {kanStarte ? (
              <>
                Start økt
                <Play className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" strokeWidth={2} />
                Live krever Pro
              </>
            )}
          </Link>
          <Link
            href={`/portal/sesjon/${session.id}/flytt`}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-input bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <CalendarIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
            Flytt
          </Link>
          {isFree && (
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              Free-plan
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-start gap-1 md:items-end md:text-right">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          Pyramide
        </span>
        <span className="font-display text-4xl font-semibold leading-none tracking-tight text-primary">
          {PYR_LABEL_KORT[session.pyramidArea]}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {session.durationMin} min planlagt
        </span>
      </div>
    </article>
  );
}

// --- PYRAMIDE-PROGRESJON --------------------------------------------------

function PyramideProgresjon({
  data,
  snitt,
  tier,
}: {
  data: ReturnType<typeof prosentPerArea>;
  snitt: number;
  tier: PortalUser["tier"];
}) {
  const locked = tier === "GRATIS";
  const allOver50 = PYR_REKKEFOLGE.every((a) => data[a] >= 50);

  return (
    <article className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 lg:col-span-2">
      <header className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-sm bg-secondary">
          <Target
            className="h-3.5 w-3.5 text-foreground"
            strokeWidth={1.75}
          />
        </span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          Pyramide-progresjon
        </span>
        <span
          className="ml-auto rounded-sm bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold text-accent-foreground"
        >
          PRO
        </span>
      </header>
      <h3 className="mt-3 font-display text-xl font-semibold leading-tight tracking-tight text-foreground">
        {locked
          ? "Lås opp full disiplin-oversikt."
          : allOver50
            ? "5 disipliner — alt over 50 %."
            : `Snitt ${snitt} % — bygger jevnt.`}
      </h3>

      <div
        className={`mt-5 grid grid-cols-5 gap-2 ${locked ? "blur-[3px] opacity-50" : ""}`}
      >
        {PYR_REKKEFOLGE.map((area) => (
          <PyramideRing
            key={area}
            area={area}
            value={data[area]}
          />
        ))}
      </div>

      {locked && (
        <LockOverlay label="Pyramide kun for Pro" cta="Oppgrader" />
      )}
    </article>
  );
}

function PyramideRing({
  area,
  value,
}: {
  area: PyramidArea;
  value: number;
}) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius; // ~87.96
  const dash = (Math.min(100, value) / 100) * circumference;
  const color = PYR_COLOR[area];

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="relative h-16 w-16">
        <svg
          viewBox="0 0 36 36"
          className="h-full w-full -rotate-90"
          aria-hidden
        >
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="4"
          />
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-mono text-xs font-semibold text-foreground">
          {value} %
        </span>
      </span>
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
        {PYR_LABEL_KORT[area]}
      </span>
    </div>
  );
}

// --- SG FORDELING --------------------------------------------------------

type SgRow = { k: string; v: number | null };

function SgFordeling({
  sg,
  tier,
}: {
  sg: { ott: number | null; app: number | null; arg: number | null; putt: number | null; total: number | null };
  tier: PortalUser["tier"];
}) {
  const locked = tier === "GRATIS";
  const rows: SgRow[] = [
    { k: "Off Tee", v: sg.ott },
    { k: "Approach", v: sg.app },
    { k: "Around Green", v: sg.arg },
    { k: "Putting", v: sg.putt },
  ];

  return (
    <article className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
      <header className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-sm bg-secondary">
          <Star
            className="h-3.5 w-3.5 text-foreground"
            strokeWidth={1.75}
          />
        </span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          SG-fordeling
        </span>
        <span
          className="ml-auto rounded-sm bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold text-accent-foreground"
        >
          PRO
        </span>
      </header>
      <h3
        className={`mt-3 font-display text-xl font-semibold leading-tight tracking-tight text-foreground ${locked ? "blur-[2px]" : ""}`}
      >
        {sg.total != null
          ? `${formatSg(sg.total)} mot benchmark.`
          : "Ingen runder ennå."}
      </h3>

      <div
        className={`mt-5 grid grid-cols-2 gap-4 ${locked ? "blur-[2px] opacity-50" : ""}`}
      >
        {rows.map((row) => (
          <SgRowItem key={row.k} k={row.k} v={row.v} />
        ))}
      </div>

      {locked && <LockOverlay label="SG kun for Pro" cta="Sammenlign" />}
    </article>
  );
}

function SgRowItem({ k, v }: SgRow) {
  const isNeg = v != null && v < 0;
  const bredde = v != null ? Math.min(100, Math.abs(v) * 100) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {k}
      </span>
      <span
        className="font-mono text-base font-semibold tabular-nums"
        style={{
          color:
            v != null
              ? isNeg
                ? "hsl(var(--destructive))"
                : "var(--color-pyr-tek)"
              : "hsl(var(--muted-foreground))",
        }}
      >
        {formatSg(v)}
      </span>
      <span className="relative mt-0.5 block h-1 overflow-hidden rounded-sm bg-secondary">
        <span
          className="absolute inset-y-0 left-0 rounded-sm"
          style={{
            width: `${bredde}%`,
            background: isNeg ? "hsl(var(--destructive))" : "hsl(var(--primary))",
          }}
        />
      </span>
    </div>
  );
}

// --- SIST REGISTRERT -----------------------------------------------------

function SistRegistrert({ items }: { items: SistRegistrert[] }) {
  if (items.length === 0) {
    return (
      <article className="rounded-2xl border border-border bg-card p-6">
        <header className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Sist registrert
          </h3>
          <Link
            href="/portal/tren"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Se alle <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </header>
        <p className="mt-4 text-sm text-muted-foreground">
          Ingen registreringer ennå — første økt eller runde dukker opp her.
        </p>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
          Sist registrert{" "}
          <span className="ml-1 font-sans text-sm font-normal italic text-muted-foreground">
            {items.length} av {items.length} siste
          </span>
        </h3>
        <Link
          href="/portal/tren"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Se alle <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </header>
      <ul>
        {items.slice(0, 5).map((item, i) => (
          <SistRegistrertRow key={i} item={item} />
        ))}
      </ul>
    </article>
  );
}

function SistRegistrertRow({ item }: { item: SistRegistrert }) {
  const dato = new Date(item.dato);
  const idag = new Date();
  const diff = Math.floor(
    (idag.getTime() - dato.getTime()) / (1000 * 60 * 60 * 24)
  );
  const datoLabel =
    diff === 0
      ? "i dag"
      : diff === 1
        ? "i går"
        : diff < 7
          ? `${diff} dgr siden`
          : `${dato.getDate()}.${dato.getMonth() + 1}`;

  const iconBg =
    item.type === "round"
      ? { bg: "var(--color-pyr-spill-track)", fg: "var(--color-pyr-spill)", icon: Flag }
      : item.type === "test"
        ? { bg: "var(--color-pyr-slag-track)", fg: "var(--color-pyr-fys)", icon: Target }
        : { bg: "var(--color-pyr-tek-track)", fg: "var(--color-pyr-tek)", icon: Dumbbell };

  const Ic = iconBg.icon;

  return (
    <li className="grid grid-cols-[80px_36px_1fr_auto] items-center gap-3 border-b border-border/60 px-6 py-3.5 transition-colors last:border-0 hover:bg-secondary/40 sm:gap-4">
      <span className="font-mono text-[11px] text-muted-foreground">
        {datoLabel}
      </span>
      <span
        className="grid h-9 w-9 place-items-center rounded-md"
        style={{ background: iconBg.bg, color: iconBg.fg }}
      >
        <Ic className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium leading-tight text-foreground">
          {item.tittel}
        </p>
        <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
          {item.detalj}
        </p>
      </div>
      <ChevronRight
        className="h-4 w-4 text-foreground/30"
        strokeWidth={1.75}
      />
    </li>
  );
}

// --- COACH MELDING ------------------------------------------------------

function CoachMelding({
  melding,
  tier,
}: {
  melding: { content: string; ts: Date; coachNavn: string };
  tier: PortalUser["tier"];
}) {
  const tekst =
    melding.content.length > 240
      ? melding.content.slice(0, 240) + "…"
      : melding.content;
  const navnInit =
    melding.coachNavn
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("") || "AK";
  const dato = new Date(melding.ts);
  const naar =
    dato.toLocaleDateString("nb-NO", {
      day: "2-digit",
      month: "2-digit",
    });

  return (
    <article
      className="relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl px-6 py-5 text-[#F5F4EE] sm:flex-row sm:items-center sm:gap-5"
      style={{
        background: "linear-gradient(135deg, #0F2A22 0%, #163027 100%)",
      }}
    >
      <span
        aria-hidden
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(209,248,67,0.10) 0%, transparent 70%)",
        }}
      />
      <span
        className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 font-display text-sm font-semibold text-white"
        style={{
          background: "linear-gradient(135deg, #7A998C, #36685A)",
          borderColor: "rgba(209,248,67,0.3)",
        }}
      >
        {navnInit}
      </span>
      <div className="relative z-10 min-w-0 flex-1">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.08em]"
          style={{ color: "rgba(209,248,67,0.7)" }}
        >
          {melding.coachNavn} · hovedcoach
          <span
            className="ml-2"
            style={{ color: "rgba(245,244,238,0.5)" }}
          >
            {naar}
          </span>
        </p>
        <p className="mt-1 font-display text-lg font-normal italic leading-snug text-[#F5F4EE]">
          «{tekst}»
        </p>
      </div>
      <Link
        href={
          tier === "GRATIS" ? "/portal/meg/abonnement" : "/portal/coach/ai"
        }
        className="relative z-10 inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground"
      >
        <MessageSquare className="h-3.5 w-3.5" strokeWidth={2} />
        Svar
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
      </Link>
    </article>
  );
}

// --- Helpers --------------------------------------------------------------

function beregnSnitt(prosent: ReturnType<typeof prosentPerArea>): number {
  const verdier = Object.values(prosent);
  if (verdier.length === 0) return 0;
  return Math.round(verdier.reduce((a, b) => a + b, 0) / verdier.length);
}
