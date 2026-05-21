/**
 * Teknisk plan — Plan-liste (PlayerHQ)
 * Implementering av "AK Golf Plan-liste.html" fra design-bundle.
 *
 * Live data fra TechnicalPlan-modellen. Gruppert per periodefase
 * (Spesialisering · Turnering · Grunntrening).
 */

import { Plus, Calendar, Check, ChevronRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHead } from "@/components/teknisk-plan/page-head";
import { PlanCard, type PlanCardStatus } from "@/components/teknisk-plan/plan-card";
import "@/components/teknisk-plan/teknisk-plan.css";

export const dynamic = "force-dynamic";

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
  archivedAt?: string;
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
    <div className="tp-scope">
      <PageHead
        crumb={
          <>
            <span>Tren</span>
            <span style={{ color: "hsl(var(--muted-foreground))" }}>›</span>
            <b>Tekniske planer</b>
          </>
        }
        title={
          <>
            Tekniske <em>planer</em>
          </>
        }
        sub="Strukturerte utviklingsplaner per periodefase. Planene er knyttet til P-posisjoner i golfsving og spilles inn med Mac O'Grady-skalaen for trenings-modalitet."
        actions={
          <>
            <button className="tp-btn outline" type="button">
              <Calendar size={13} aria-hidden /> Periodisering
            </button>
            <button className="tp-btn primary" type="button">
              <Plus size={13} aria-hidden /> Ny plan
            </button>
          </>
        }
      />

      <main className="tp-wrap">
        {groups.map((g) => (
          <section key={g.eyebrow}>
            <header className="tp-group-head">
              <span className="tp-group-eyebrow">
                PERIODE · <b>{g.eyebrow}</b>
              </span>
              <span className={`tp-group-pill ${g.pill}`}>
                {g.pill === "done" ? (
                  <Check size={10} aria-hidden />
                ) : (
                  <span className="dot" />
                )}
                {g.pillLabel}
              </span>
              <span className="tp-group-meta">{g.span}</span>
            </header>

            {g.plans.length === 0 ? (
              <div className="tp-empty-state">
                <div className="ic" aria-hidden>
                  <Calendar size={18} />
                </div>
                <div className="body">
                  <span className="ttl">Ingen plan for {g.eyebrow.toLowerCase()} enda.</span>
                  <span className="desc">
                    Opprett en plan for denne fasen. Anbefaler maintenance + nærspill
                    (rundt grønt + putt 0–5 m).
                  </span>
                </div>
                <button className="tp-btn outline" type="button">
                  <Plus size={13} aria-hidden /> Opprett plan
                </button>
              </div>
            ) : (
              <div className="tp-plan-grid">
                {g.plans.map((p, i) => (
                  <PlanCard
                    key={p.id}
                    href={`/portal/tren/teknisk-plan/${p.id}`}
                    title={p.navn}
                    periodLabel={p.periodLabel}
                    status={p.status}
                    oppgaveCount={p.oppgaveCount}
                    pPositionCount={p.pPositionCount}
                    pPositionTotal={10}
                    metaLabel={
                      p.status === "ARCHIVED"
                        ? "Varighet"
                        : p.status === "ACTIVE"
                        ? "Opprettet"
                        : "Opprettet"
                    }
                    metaValue={
                      p.status === "ARCHIVED"
                        ? formatMonths(p.startDato, p.sluttDato)
                        : formatDateRelative(p.startDato)
                    }
                    authorAvatar={p.authorInitials}
                    authorName={p.authorName}
                    authorRole={p.authorRole}
                    progressLabel={p.status === "ARCHIVED" ? "Reps · sluttsum" : "Reps · totalt"}
                    progressCurrent={p.repsCurrent}
                    progressTarget={p.repsTarget}
                    progressTailLeft={
                      p.status === "ACTIVE"
                        ? `~${p.weeklyReps?.toLocaleString("nb-NO") ?? 0} reps · uke`
                        : p.status === "ARCHIVED"
                        ? "Avsluttet"
                        : "Ikke startet"
                    }
                    progressTailRight={
                      p.status === "ACTIVE" && p.estimertFerdig
                        ? `estim. ferdig ${p.estimertFerdig}`
                        : ""
                    }
                    footRole={footRoleFor(p)}
                    footAvatars={footAvatarsFor(p, user)}
                    featured={i === 0 && p.status === "ACTIVE"}
                  />
                ))}
              </div>
            )}
          </section>
        ))}

        {enriched.length === 0 ? (
          <section>
            <div className="tp-empty-state">
              <div className="ic" aria-hidden>
                <ChevronRight size={18} />
              </div>
              <div className="body">
                <span className="ttl">Ingen tekniske planer enda.</span>
                <span className="desc">
                  Kontakt coach for å sette opp din første plan, eller opprett et utkast selv.
                </span>
              </div>
              <button className="tp-btn primary" type="button">
                <Plus size={13} aria-hidden /> Opprett din første plan
              </button>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function formatPeriode(d: Date): string {
  const month = d.getMonth();
  const year = d.getFullYear();
  if (month >= 2 && month <= 5) return `vår ${year}`;
  if (month >= 6 && month <= 8) return `sommer ${year}`;
  if (month >= 9 && month <= 10) return `høst ${year}`;
  return `vinter ${year}/${(year + 1).toString().slice(2)}`;
}

function formatDateRelative(d: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return "i dag";
  if (diffDays === 1) return "i går";
  if (diffDays < 14) return `${diffDays}d siden`;
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

function formatMonths(start: Date, slutt: Date | null): string {
  const end = slutt ?? new Date();
  const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / (30 * 86_400_000)));
  return `${months} mnd`;
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

function footRoleFor(p: PlanWithStats) {
  if (p.status === "ARCHIVED") return <>Arkivert · skrivebeskyttet</>;
  if (p.status === "DRAFT" && p.isCreatedByPlayer)
    return (
      <>
        Sendt til <b>{p.authorName.split(" ")[0]}</b> for review
      </>
    );
  return (
    <>
      <b>{p.authorName}</b> · felles redigering
    </>
  );
}

function footAvatarsFor(p: PlanWithStats, user: { name: string | null }) {
  const playerInitials = (user.name ?? "??")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (p.status === "DRAFT" && p.isCreatedByPlayer) {
    return [{ initials: p.authorInitials, role: "player" as const }];
  }
  return [
    { initials: p.authorInitials, role: p.authorRole },
    { initials: playerInitials, role: "player" as const },
  ];
}
