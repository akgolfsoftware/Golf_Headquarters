/**
 * Teknisk plan — Plan-liste (PlayerHQ), mobile-first 430px.
 *
 * Live data fra TechnicalPlan-modellen, gruppert per periodefase
 * (Spesialisering · Turnering · Grunntrening). Re-stylet til athletic
 * DS-tokens (tidligere tp-*-CSS). Logikk og Prisma-spørringen er uendret —
 * kun presentasjonslaget er byttet. Reps-progresjon + P-posisjoner per kort.
 */

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero } from "@/components/portal/player-hero";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { Card } from "@/components/athletic/golfdata";
import { cn } from "@/lib/utils";
import { PlanHandlinger } from "./plan-handlinger";

export const dynamic = "force-dynamic";

type PlanCardStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

interface GroupBucket {
  eyebrow: string;
  pill: "active" | "upcoming" | "done";
  pillLabel: string;
  span: string;
  plans: PlanWithStats[];
}

interface PlanWithStats {
  id: string;
  navn: string;
  status: PlanCardStatus;
  periodLabel?: string;
  startDato: Date;
  sluttDato: Date | null;
  oppgaveCount: number;
  pPositionCount: number;
  repsCurrent: number;
  repsTarget: number;
  authorName: string;
  authorInitials: string;
  authorRole: "coach" | "player";
  isCreatedByPlayer: boolean;
  weeklyReps?: number;
  estimertFerdig?: string;
}

export default async function TekniskPlanListePage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const plans = await prisma.technicalPlan.findMany({
    where: { userId: user.id },
    orderBy: { startDato: "desc" },
    include: {
      opprettetAv: { select: { name: true, role: true } },
      positions: {
        include: {
          tasks: {
            select: {
              repsMaalDry: true,
              repsMaalLav: true,
              repsMaalFull: true,
              repsGjortDry: true,
              repsGjortLav: true,
              repsGjortFull: true,
            },
          },
        },
      },
    },
  });

  const enriched: PlanWithStats[] = plans.map((p) => {
    const tasks = p.positions.flatMap((pp) => pp.tasks);
    const target = tasks.reduce(
      (s, t) => s + (t.repsMaalDry ?? 0) + (t.repsMaalLav ?? 0) + (t.repsMaalFull ?? 0),
      0,
    );
    const current = tasks.reduce(
      (s, t) => s + (t.repsGjortDry ?? 0) + (t.repsGjortLav ?? 0) + (t.repsGjortFull ?? 0),
      0,
    );

    const authorRole = p.opprettetAv?.role === "PLAYER" ? "player" : "coach";
    const initials = (p.opprettetAv?.name ?? "??")
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const periodLabel = formatPeriode(p.startDato);
    const status: PlanCardStatus =
      p.status === "ACTIVE" ? "ACTIVE" : p.status === "ARCHIVED" ? "ARCHIVED" : "DRAFT";

    return {
      id: p.id,
      navn: p.navn,
      status,
      periodLabel,
      startDato: p.startDato,
      sluttDato: p.sluttDato,
      oppgaveCount: tasks.length,
      pPositionCount: p.positions.length,
      repsCurrent: current,
      repsTarget: target,
      authorName: p.opprettetAv?.name ?? "Ukjent",
      authorInitials: initials,
      authorRole,
      isCreatedByPlayer: authorRole === "player",
      weeklyReps: Math.round(current / 14) * 7,
      estimertFerdig: target > 0 ? estimateFerdig(p.startDato, current, target) : undefined,
    };
  });

  const groups: GroupBucket[] = [
    {
      eyebrow: "Spesialisering",
      pill: "active",
      pillLabel: "Aktiv",
      span: spanFromPlans(enriched.filter((p) => p.status === "ACTIVE")),
      plans: enriched.filter((p) => p.status === "ACTIVE" || p.status === "DRAFT"),
    },
    {
      eyebrow: "Turnering",
      pill: "upcoming",
      pillLabel: "Kommer 1. juli",
      span: "1. juli → 31. aug · uke 27–35",
      plans: [],
    },
    {
      eyebrow: "Grunntrening",
      pill: "done",
      pillLabel: "Avsluttet",
      span: "1. nov → 31. mars · uke 44–13",
      plans: enriched.filter((p) => p.status === "ARCHIVED"),
    },
  ];

  return (
    <div className="golfdata-scope mx-auto max-w-[430px] space-y-6 px-4 pb-24 md:pb-8">
      <PlayerHero
        eyebrow="PlayerHQ · Tren · Tekniske planer"
        titleLead="Tekniske"
        titleItalic="planer"
        sub="Strukturerte utviklingsplaner per periodefase, knyttet til P-posisjoner i svingen."
      />

      <PlanHandlinger />

      <div className="space-y-7">
        {groups.map((g) => (
          <section key={g.eyebrow}>
            <header className="mb-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 border-b border-border pb-2.5">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                Periode · <span className="text-foreground">{g.eyebrow}</span>
              </span>
              <GroupPill pill={g.pill} label={g.pillLabel} />
              <span className="ml-auto font-mono text-[10px] tabular-nums tracking-[0.04em] text-muted-foreground">
                {g.span}
              </span>
            </header>

            {g.plans.length === 0 ? (
              <EmptyRow
                icon={Calendar}
                title={`Ingen plan for ${g.eyebrow.toLowerCase()} ennå.`}
                desc="Opprett en plan for denne fasen — coachen kan også sette den opp for deg."
              />
            ) : (
              <div className="flex flex-col gap-2.5">
                {g.plans.map((p, i) => (
                  <PlanCard key={p.id} plan={p} featured={i === 0 && p.status === "ACTIVE"} />
                ))}
              </div>
            )}
          </section>
        ))}

        {enriched.length === 0 && (
          <EmptyRow
            icon={ChevronRight}
            title="Ingen tekniske planer ennå."
            desc="Kontakt coach for å sette opp din første plan, eller opprett et utkast selv."
          />
        )}
      </div>
    </div>
  );
}

// ── Presentasjon ────────────────────────────────────────────────

const STATUS_META: Record<
  PlanCardStatus,
  { label: string; cls: string; dot: boolean }
> = {
  ACTIVE: { label: "Aktiv", cls: "bg-accent text-accent-foreground", dot: true },
  DRAFT: { label: "Utkast", cls: "bg-secondary text-muted-foreground", dot: true },
  ARCHIVED: { label: "Avsluttet", cls: "bg-[var(--color-pyr-spill-track)] text-primary", dot: false },
};

const AV_TONE: Record<"coach" | "player", string> = {
  coach: "bg-primary text-accent",
  player: "bg-accent text-accent-foreground",
};

function PlanCard({ plan, featured }: { plan: PlanWithStats; featured: boolean }) {
  const pct =
    plan.repsTarget > 0 ? Math.min(100, Math.round((plan.repsCurrent / plan.repsTarget) * 100)) : 0;
  const status = STATUS_META[plan.status];
  const archived = plan.status === "ARCHIVED";

  return (
    <Link href={`/portal/tren/teknisk-plan/${plan.id}`} className="block">
     <Card
       interactive
       compact
       className={cn(featured && "border-l-[3px] border-l-primary", archived && "opacity-90")}
     >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[16px] font-bold leading-tight tracking-[-0.015em] text-foreground">
          {plan.navn}
          {plan.periodLabel && (
            <em className="ml-1 font-medium italic text-muted-foreground">
              · {plan.periodLabel}
            </em>
          )}
        </h3>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
            status.cls,
          )}
        >
          {archived ? (
            <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
          )}
          {status.label}
        </span>
      </div>

      {/* Meta-rad */}
      <div className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-2">
        <Stat label="Oppgaver" value={String(plan.oppgaveCount)} />
        <Stat label="P-posisjoner" value={`${plan.pPositionCount}`} unit="/10" />
        <div className="ml-auto flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex h-5 w-5 items-center justify-center rounded-full font-mono text-[9px] font-extrabold",
              AV_TONE[plan.authorRole],
            )}
          >
            {plan.authorInitials}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">{plan.authorName}</span>
        </div>
      </div>

      {/* Reps-progresjon */}
      <div className="mt-3">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
            {archived ? "Reps · sluttsum" : "Reps · totalt"}
          </span>
          <span className="font-mono text-[12px] font-bold tabular-nums text-foreground">
            {plan.repsCurrent.toLocaleString("nb-NO")}{" "}
            <span className="font-medium text-muted-foreground">
              / {plan.repsTarget.toLocaleString("nb-NO")}
            </span>
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn("h-full rounded-full", pct === 0 ? "bg-border" : "bg-primary", archived && "opacity-60")}
            style={{ width: `${Math.max(2, pct)}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] tabular-nums text-muted-foreground">
          <span>
            {plan.status === "ACTIVE"
              ? `~${plan.weeklyReps?.toLocaleString("nb-NO") ?? 0} reps · uke`
              : archived
                ? "Avsluttet"
                : "Ikke startet"}
          </span>
          <span>
            <span className="font-bold text-foreground">{pct} %</span>
            {plan.status === "ACTIVE" && plan.estimertFerdig
              ? ` · est. ferdig ${plan.estimertFerdig}`
              : ""}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
          {footRoleText(plan)}
        </span>
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary">
          Åpne plan
          <ArrowRight className="h-3 w-3" strokeWidth={2.5} aria-hidden />
        </span>
      </div>
     </Card>
    </Link>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <span className="font-display text-[17px] font-bold leading-none tracking-[-0.01em] text-foreground">
        {value}
        {unit && <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">{unit}</span>}
      </span>
    </div>
  );
}

function GroupPill({ pill, label }: { pill: "active" | "upcoming" | "done"; label: string }) {
  const cls =
    pill === "active"
      ? "bg-accent text-accent-foreground"
      : pill === "done"
        ? "bg-[var(--color-pyr-spill-track)] text-primary"
        : "bg-secondary text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
        cls,
      )}
    >
      {pill === "done" ? (
        <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
      )}
      {label}
    </span>
  );
}

function EmptyRow({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-dashed border-border bg-card/40 px-4 py-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
        <Icon size={18} strokeWidth={1.5} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[14px] font-semibold leading-tight text-foreground">{title}</p>
        <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function footRoleText(p: PlanWithStats): string {
  if (p.status === "ARCHIVED") return "Arkivert · skrivebeskyttet";
  if (p.status === "DRAFT" && p.isCreatedByPlayer)
    return `Sendt til ${p.authorName.split(" ")[0]} for review`;
  return `${p.authorName} · felles redigering`;
}

// ── Helpers (uendret logikk) ────────────────────────────────────

function formatPeriode(d: Date): string {
  const month = d.getMonth();
  const year = d.getFullYear();
  if (month >= 2 && month <= 5) return `vår ${year}`;
  if (month >= 6 && month <= 8) return `sommer ${year}`;
  if (month >= 9 && month <= 10) return `høst ${year}`;
  return `vinter ${year}/${(year + 1).toString().slice(2)}`;
}

function spanFromPlans(plans: PlanWithStats[]): string {
  if (plans.length === 0) return "";
  const start = plans.reduce((min, p) => (p.startDato < min ? p.startDato : min), plans[0].startDato);
  return `${start.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })} → pågående`;
}

function estimateFerdig(start: Date, current: number, target: number): string {
  if (current <= 0) return "—";
  const now = Date.now();
  const elapsed = now - start.getTime();
  const totalEstimateMs = (elapsed / current) * target;
  const ferdigDate = new Date(start.getTime() + totalEstimateMs);
  return ferdigDate.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}
