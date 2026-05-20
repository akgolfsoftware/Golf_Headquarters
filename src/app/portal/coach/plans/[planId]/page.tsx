import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Quote,
  Target,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  aggregateByArea,
  prosentPerArea,
  PYR_REKKEFOLGE,
  PYR_LABEL,
} from "@/lib/pyramide";
import type { PyramidArea } from "@/generated/prisma/client";
import { PlayerPlanActions } from "./player-plan-actions";

// 5-fase-stripen — semantisk navngitt fra perioderings-skissen
// (generell → spesifikk → taper → toppform → restitusjon).
const FASER = [
  { key: "GEN", label: "Generell" },
  { key: "SPE", label: "Spesifikk" },
  { key: "TAP", label: "Taper" },
  { key: "TOP", label: "Toppform" },
  { key: "RES", label: "Restitusjon" },
] as const;

const TYPE_TAG_KLASSE: Record<PyramidArea | "TEST", string> = {
  FYS: "bg-primary/10 text-primary",
  TEK: "bg-primary/15 text-primary",
  SLAG: "bg-accent/30 text-foreground",
  SPILL: "bg-accent/20 text-accent-foreground",
  TURN: "bg-secondary text-muted-foreground",
  TEST: "bg-destructive/10 text-destructive",
};

function fmtDato(d: Date) {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" });
}

function fmtDatoLang(d: Date) {
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function ukedag(d: Date, idag: Date) {
  const sameDay =
    d.getFullYear() === idag.getFullYear() &&
    d.getMonth() === idag.getMonth() &&
    d.getDate() === idag.getDate();
  if (sameDay) {
    return `I dag · ${d.toLocaleDateString("nb-NO", { weekday: "short" })}`;
  }
  return d.toLocaleDateString("nb-NO", { weekday: "long" });
}

function fmtKlokke(d: Date) {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

function initialer(navn: string) {
  return navn
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// Beregn fase ut fra hvor langt vi er i periode (start → slutt).
function aktivFase(start: Date, slutt: Date | null, naa: Date) {
  if (!slutt) return 0;
  const total = slutt.getTime() - start.getTime();
  if (total <= 0) return 0;
  const passert = Math.max(0, naa.getTime() - start.getTime());
  const andel = Math.min(1, passert / total);
  const idx = Math.floor(andel * FASER.length);
  return Math.min(FASER.length - 1, idx);
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
      <p className="text-sm text-muted-foreground">Krever Pro-abonnement.</p>
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

  // Coach-info (createdById er en User.id-streng, ikke FK-relasjon)
  const coach = plan.createdById
    ? await prisma.user.findUnique({
        where: { id: plan.createdById },
        select: { id: true, name: true },
      })
    : null;

  // Siste coach-melding for quote-kort (kun direkte coach→spiller)
  const sisteCoachingSession = plan.createdById
    ? await prisma.coachingSession.findFirst({
        where: {
          userId: plan.userId,
          coachId: plan.createdById,
          kind: "DIRECT",
        },
        orderBy: { updatedAt: "desc" },
        select: { messages: true, updatedAt: true },
      })
    : null;

  type MsgRolle = "user" | "assistant" | "coach" | "system";
  type Msg = { role: MsgRolle; content: string; ts?: string };
  const meldinger = Array.isArray(sisteCoachingSession?.messages)
    ? (sisteCoachingSession?.messages as unknown as Msg[])
    : [];
  const sisteCoachMelding = [...meldinger]
    .reverse()
    .find((m) => m?.role === "coach" || m?.role === "assistant");

  // Spillerens aktive mål (HCP, SG, etc.)
  const maal = await prisma.goal.findMany({
    where: { userId: plan.userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  // Statistikk
  const fordeling = prosentPerArea(aggregateByArea(plan.sessions));
  const fullført = plan.sessions.filter((s) => s.status === "COMPLETED").length;
  const total = plan.sessions.length;
  const gjennomforing = total === 0 ? 0 : Math.round((fullført / total) * 100);

  // Fase-progresjon
  const naa = new Date();
  const fasenIdx = aktivFase(plan.startDate, plan.endDate, naa);
  const faseAndelPct =
    plan.endDate && plan.endDate.getTime() > plan.startDate.getTime()
      ? Math.min(
          100,
          Math.max(
            0,
            ((naa.getTime() - plan.startDate.getTime()) /
              (plan.endDate.getTime() - plan.startDate.getTime())) *
              100,
          ),
        )
      : 0;

  // Kommende økter (max 6)
  const kommende = plan.sessions
    .filter((s) => s.status === "PLANNED" || s.status === "ACTIVE")
    .filter((s) => s.scheduledAt.getTime() >= naa.getTime() - 24 * 3600 * 1000)
    .slice(0, 6);

  // Hero stat-pills
  const nesteØkt = kommende[0];

  const coachNavn = coach?.name ?? "Coach";

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <Link
        href="/portal/coach/plans"
        className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronRight size={14} strokeWidth={1.5} className="rotate-180" />
        Alle coaching-planer
      </Link>

      <PageHeader
        eyebrow="PlayerHQ · Min plan"
        titleLead="Sommer"
        titleItalic="toppform"
        sub={`Coachet av ${coachNavn} · ${fmtDatoLang(plan.startDate)}${
          plan.endDate ? ` – ${fmtDatoLang(plan.endDate)}` : ""
        } · Fase ${fasenIdx + 1} av ${FASER.length}`}
        actions={
          erEier && (plan.status === "ACCEPTED" || plan.status === "ACTIVE") ? (
            <PlayerPlanActions
              planId={plan.id}
              status={plan.status}
              playerComment={plan.playerComment}
              acceptedAt={plan.updatedAt}
            />
          ) : undefined
        }
      />

      {erEier &&
        (plan.status === "PENDING_PLAYER" || plan.status === "REJECTED") && (
          <PlayerPlanActions
            planId={plan.id}
            status={plan.status}
            playerComment={plan.playerComment}
            acceptedAt={plan.updatedAt}
          />
        )}

      {/* Hero-stat-pills */}
      <div className="flex flex-wrap items-center gap-2">
        <StatPill label="Ferdige økter" value={`${fullført} / ${total}`} />
        {nesteØkt && (
          <StatPill
            label="Neste"
            value={nesteØkt.title}
            tone="accent"
          />
        )}
        {plan.endDate && (
          <StatPill
            label="Til slutt"
            value={`${Math.max(
              0,
              Math.ceil(
                (plan.endDate.getTime() - naa.getTime()) /
                  (24 * 3600 * 1000),
              ),
            )} d`}
          />
        )}
        <StatPill label="Gjennomføring" value={`${gjennomforing} %`} />
      </div>

      {/* Insight-banner */}
      {total > 0 && gjennomforing >= 50 && (
        <div className="flex items-center gap-4 rounded-md border border-accent/50 bg-accent/15 px-6 py-4">
          <TrendingUp
            size={18}
            strokeWidth={1.5}
            className="text-foreground"
          />
          <p className="text-sm text-foreground">
            Du er <b>{gjennomforing}% gjennom planen</b>. Hold tempoet —
            konsistens er det som flytter handicap.
          </p>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Plan-overview med 5-fase-stripe */}
        <section className="col-span-12 rounded-lg border border-border bg-card p-4 md:p-6 lg:col-span-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Plan-oversikt
              </div>
              <h2 className="mt-1 font-display text-[20px] font-semibold leading-snug">
                {plan.name}
              </h2>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Coach: {coachNavn}
                {plan.endDate
                  ? ` · ${fmtDatoLang(plan.startDate)} – ${fmtDatoLang(
                      plan.endDate,
                    )}`
                  : ` · start ${fmtDatoLang(plan.startDate)}`}
              </p>
            </div>
            {plan.isActive && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                Aktiv
              </span>
            )}
          </div>

          {/* 5-fase progress-stripe */}
          <div className="mt-6">
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
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 text-center font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              {FASER.map((f, i) => (
                <span
                  key={f.key}
                  className={
                    i === fasenIdx ? "font-semibold text-foreground" : ""
                  }
                >
                  F{i + 1} · {f.label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-md bg-secondary/60 px-4 py-4">
            <span className="text-[12px] text-muted-foreground">Fremdrift</span>
            <span className="font-mono text-[14px] font-semibold tabular-nums">
              {Math.round(faseAndelPct)} %
            </span>
          </div>

          {/* Pyramide-fordeling — kompakt */}
          <div className="mt-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Pyramide-fordeling
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {PYR_REKKEFOLGE.map((omr) => (
                <div
                  key={omr}
                  className="rounded-md border border-border bg-secondary/40 p-4 text-center"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    {PYR_LABEL[omr]}
                  </div>
                  <div className="mt-1 font-mono text-[16px] font-semibold tabular-nums">
                    {fordeling[omr]}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coach-quote */}
        <section className="col-span-12 rounded-lg border border-border bg-card p-4 md:p-6 lg:col-span-4">
          <Quote size={20} strokeWidth={1.5} className="text-accent" />
          <p className="mt-4 font-display text-[18px] italic leading-snug text-foreground">
            {sisteCoachMelding?.content
              ? `«${sisteCoachMelding.content}»`
              : `«${coachNavn.split(" ")[0]} har lagt opp denne planen for deg. Følg fasene — det er der utviklingen ligger.»`}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary font-mono text-[11px] font-semibold text-primary-foreground">
              {initialer(coachNavn)}
            </div>
            <div>
              <div className="text-[12px] font-semibold leading-none">
                {coachNavn}
              </div>
              {sisteCoachingSession?.updatedAt && (
                <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  {fmtDato(sisteCoachingSession.updatedAt)} ·{" "}
                  {fmtKlokke(sisteCoachingSession.updatedAt)}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Kommende økter denne uka */}
        <section className="col-span-12 rounded-lg border border-border bg-card p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Kommende økter
              </div>
              <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
                Hva du skal gjøre
              </h3>
            </div>
            <Calendar
              size={16}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          </div>

          {kommende.length === 0 ? (
            <EmptyState
              icon={Calendar}
              titleItalic="Ingen"
              titleTrail="planlagte økter"
              sub="Coachen din legger inn nye økter etter hvert som planen utvikler seg."
            />
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border">
              {kommende.map((s, i) => (
                <li
                  key={s.id}
                  className="grid grid-cols-[80px_1fr_auto] items-center gap-3 px-3 py-4 transition-colors hover:bg-secondary/60 sm:grid-cols-[120px_1fr_auto_auto] sm:gap-4 sm:px-4"
                >
                  <span
                    className={`font-mono text-[11px] uppercase tracking-[0.08em] ${
                      i === 0
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {ukedag(s.scheduledAt, naa)}
                  </span>
                  <div className="flex min-w-0 items-center gap-2">
                    <TypeTag type={s.pyramidArea} />
                    <Link
                      href={`/portal/tren/${s.id}`}
                      className="truncate text-[13px] font-medium text-foreground hover:text-primary"
                    >
                      {s.title}
                    </Link>
                  </div>
                  <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
                    {fmtKlokke(s.scheduledAt)}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    {s.durationMin} min
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Plan-mål */}
        <section className="col-span-12 rounded-lg border border-border bg-card p-4 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Target
              size={16}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Plan-mål
            </span>
          </div>

          {maal.length === 0 ? (
            <EmptyState
              icon={Target}
              titleItalic="Ingen"
              titleTrail="aktive mål"
              sub="Sett mål for handicap, scoring-snitt eller SG-områder, så følger vi dem opp i planen."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {maal.slice(0, 6).map((m) => (
                <Goal
                  key={m.id}
                  title={m.title}
                  value={formaterMaalverdi(m.type, m.targetValue)}
                  sub={formaterMaalSub(m.type, m.targetDate)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function formaterMaalverdi(type: string, v: number | null) {
  if (v === null || v === undefined) return "—";
  switch (type) {
    case "HCP_TARGET":
      return v.toFixed(1);
    case "SG_AREA":
      return `${v >= 0 ? "+" : ""}${v.toFixed(1)}`;
    case "ROUNDS_PER_MONTH":
      return `${Math.round(v)} / mnd`;
    default:
      return v.toString();
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
  return `${label} · innen ${fmtDato(date)}`;
}

function StatPill({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: "muted" | "accent";
}) {
  const styles: Record<NonNullable<typeof tone>, string> = {
    muted: "bg-secondary text-foreground border-border",
    accent: "bg-accent/30 text-foreground border-accent/40",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1 text-[12px] ${styles[tone]}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <span className="max-w-[200px] truncate font-mono font-semibold tabular-nums">
        {value}
      </span>
    </span>
  );
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

function Goal({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-4">
      <div className="text-[12px] font-medium text-muted-foreground">
        {title}
      </div>
      <div className="mt-2 font-mono text-[22px] font-semibold tabular-nums leading-none">
        {value}
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
