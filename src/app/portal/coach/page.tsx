/**
 * PlayerHQ · Coach-hub
 *
 * Executive overhaul (AK Golf v2): hero med profilkort for hovedcoach,
 * aktiv treningsplan-status, uleste meldinger, dual CTA-rad og siste
 * coaching-tråder + besvarelser.
 */
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  MessageSquare,
  NotebookPen,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
});

export default async function CoachOversikt() {
  const user = await requirePortalUser();

  if (user.tier === "GRATIS") {
    return <Paywall />;
  }

  const naa = new Date();
  const trediagSiden = new Date(naa.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [coacher, mineSesjoner, aktivPlan, coachFeedback] = await Promise.all([
    prisma.user.findMany({
      where: { role: "COACH" },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        homeClub: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.coachingSession.findMany({
      where: {
        userId: user.id,
        updatedAt: { gte: trediagSiden },
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        id: true,
        kind: true,
        messages: true,
        updatedAt: true,
        coach: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    }),
    prisma.trainingPlan.findFirst({
      where: { userId: user.id, isActive: true },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        createdById: true,
        sessions: {
          select: { id: true, status: true, scheduledAt: true },
        },
      },
    }),
    prisma.trainingPlanSessionLog.findMany({
      where: {
        session: { plan: { userId: user.id } },
        coachFeedback: { not: null },
        coachFeedbackAt: { gte: trediagSiden },
      },
      orderBy: { coachFeedbackAt: "desc" },
      take: 5,
      select: {
        id: true,
        coachFeedback: true,
        coachFeedbackAt: true,
        rating: true,
        session: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            pyramidArea: true,
          },
        },
      },
    }),
  ]);

  const hovedcoach = coacher[0];
  const andreCoacher = coacher.slice(1);

  // Tell uleste meldinger (siste meldingsforfatter er ikke spilleren).
  const ulesteMeldinger = mineSesjoner.reduce((sum, s) => {
    const msgs = Array.isArray(s.messages)
      ? (s.messages as Array<{ role: string }>)
      : [];
    const sisteIkkePlayer = msgs.length > 0 && msgs[msgs.length - 1].role !== "user";
    return sum + (sisteIkkePlayer ? 1 : 0);
  }, 0);

  // Plan-fremdrift
  const planTotal = aktivPlan?.sessions.length ?? 0;
  const planDone =
    aktivPlan?.sessions.filter((s) => s.status === "COMPLETED").length ?? 0;
  const planAndel = planTotal === 0 ? 0 : Math.round((planDone / planTotal) * 100);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="PlayerHQ · /portal/coach"
        titleLead="Min"
        titleItalic="coach"
        sub={
          hovedcoach
            ? `Direkte linje til ${hovedcoach.name} · AI-coach 24/7`
            : "Direkte linje til din tilknyttede coach"
        }
      />

      {/* HERO — profil-kort + KPI-strip */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        {hovedcoach ? (
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start gap-5">
              <CoachAvatar src={hovedcoach.avatarUrl} name={hovedcoach.name} size={72} />
              <div className="min-w-0 flex-1">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  Min coach
                </span>
                <h2 className="mt-1 font-display text-2xl font-semibold leading-tight tracking-tight">
                  {hovedcoach.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hovedcoach.homeClub
                    ? `${hovedcoach.homeClub} · ${hovedcoach.email}`
                    : hovedcoach.email}
                </p>
              </div>
            </div>

            {/* Dual CTA */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href="/portal/coach/melding?type=hjelp"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <HelpCircle size={14} strokeWidth={1.75} />
                Be om hjelp
              </Link>
              <Link
                href={`/portal/coach/${hovedcoach.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                <MessageSquare size={14} strokeWidth={1.75} />
                Send melding
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Ingen tilknyttet coach
            </span>
            <p className="mt-2 text-sm text-muted-foreground">
              Det er ingen coacher registrert i plattformen ennå. Ta kontakt
              med klubben for å koble til en coach.
            </p>
          </div>
        )}

        {/* KPI-strip */}
        <div className="grid grid-cols-2 gap-3">
          <KpiTile
            label="Uleste"
            value={String(ulesteMeldinger)}
            sub="fra coach"
            highlight={ulesteMeldinger > 0}
          />
          <KpiTile
            label="Aktive tråder"
            value={String(mineSesjoner.length)}
            sub="siste 30 d"
          />
          <KpiTile
            label="Plan"
            value={
              aktivPlan ? `${planAndel}%` : "—"
            }
            sub={
              aktivPlan
                ? `${planDone}/${planTotal} økter`
                : "Ingen aktiv plan"
            }
          />
          <KpiTile
            label="Feedback"
            value={String(coachFeedback.length)}
            sub="siste 30 d"
          />
        </div>
      </section>

      {/* Aktiv plan */}
      {aktivPlan && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ClipboardList
                size={14}
                strokeWidth={1.75}
                className="text-muted-foreground"
              />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Aktiv treningsplan
              </span>
            </div>
            <Link
              href="/portal/tren"
              className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-primary hover:underline"
            >
              Åpne plan
              <ArrowRight size={11} strokeWidth={1.75} />
            </Link>
          </div>
          <h3 className="font-display text-lg font-semibold">{aktivPlan.name}</h3>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            {NB_DATE.format(aktivPlan.startDate)} —{" "}
            {aktivPlan.endDate ? NB_DATE.format(aktivPlan.endDate) : "løpende"} ·{" "}
            <span className="text-foreground">{aktivPlan.status}</span>
          </p>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
              <span>Fremdrift</span>
              <span className="font-semibold text-foreground">
                {planDone}/{planTotal} økter · {planAndel}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${planAndel}%` }}
              />
            </div>
          </div>
        </section>
      )}

      {/* AI-coach + andre coacher */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/portal/coach/ai"
          className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              <Bot size={12} strokeWidth={1.75} className="text-accent-foreground" />
              AI-coach
            </span>
            <span className="rounded-full bg-accent/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
              24/7
            </span>
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold leading-snug">
            Spør om{" "}
            <em className="font-normal italic text-primary">hva som helst</em>
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Personlig analyse basert på profil, plan og siste runder.
          </p>
          <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
            Start samtale
            <ArrowUpRight size={14} strokeWidth={1.75} />
          </span>
        </Link>

        {andreCoacher.length > 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              <Sparkles
                size={12}
                strokeWidth={1.75}
                className="text-muted-foreground"
              />
              Andre coacher du har tilgang til
            </span>
            <ul className="mt-4 space-y-2">
              {andreCoacher.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/portal/coach/${c.id}`}
                    className="group flex items-center gap-3 rounded-md border border-border bg-background p-3 transition-colors hover:border-primary"
                  >
                    <CoachAvatar src={c.avatarUrl} name={c.name} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold leading-none">
                        {c.name}
                      </div>
                      <div className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                        {c.email}
                      </div>
                    </div>
                    <ArrowUpRight
                      size={14}
                      strokeWidth={1.75}
                      className="text-muted-foreground transition-colors group-hover:text-foreground"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/30 p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Andre coacher
            </span>
            <p className="mt-3 text-sm text-muted-foreground">
              Du har én tilknyttet coach. Be klubben legge til flere hvis du
              ønsker mer enn ett perspektiv.
            </p>
          </div>
        )}
      </section>

      {/* Coaching-tråder */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare
              size={14}
              strokeWidth={1.75}
              className="text-muted-foreground"
            />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Coaching-tråder siste 30 dager
            </span>
          </div>
          {hovedcoach && (
            <Link
              href={`/portal/coach/${hovedcoach.id}`}
              className="font-mono text-[11px] font-semibold text-primary hover:underline"
            >
              Se alle →
            </Link>
          )}
        </div>
        {mineSesjoner.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            titleItalic="Ingen tråder"
            titleTrail="siste 30 d"
            sub="Start en AI-samtale eller send melding til coachen din."
          />
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {mineSesjoner.map((s) => {
              const meldinger = Array.isArray(s.messages)
                ? s.messages.length
                : 0;
              const sisteMelding = Array.isArray(s.messages) && s.messages.length > 0
                ? (s.messages[s.messages.length - 1] as { content?: string; role?: string })
                : null;
              const fraCoach = sisteMelding?.role && sisteMelding.role !== "user";
              return (
                <li key={s.id}>
                  <Link
                    href={
                      s.kind === "AI"
                        ? "/portal/coach/ai"
                        : `/portal/coach/${s.coach.id}`
                    }
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30"
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-xs font-bold ${
                        s.kind === "AI"
                          ? "bg-accent text-accent-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {s.kind === "AI" ? "AI" : s.coach.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {s.kind === "AI" ? "AI-coach" : s.coach.name}
                        </span>
                        {fraCoach && (
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-primary">
                            Nytt svar
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {sisteMelding?.content?.slice(0, 80) ?? `${meldinger} meldinger`}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                      {NB_DATE.format(s.updatedAt)}
                    </span>
                    <ArrowUpRight
                      size={14}
                      strokeWidth={1.75}
                      className="text-muted-foreground"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Coach-feedback */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <NotebookPen
            size={14}
            strokeWidth={1.75}
            className="text-muted-foreground"
          />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Mine besvarelser fra coach
          </span>
        </div>
        {coachFeedback.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Coachen har ikke skrevet feedback på fullførte økter ennå. Fullfør
              en økt i planen for å motta tilbakemelding.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {coachFeedback.map((f) => (
              <li
                key={f.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-sm font-semibold">
                    {f.session.title}
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    {f.session.pyramidArea}
                    {f.coachFeedbackAt ? ` · ${NB_DATE.format(f.coachFeedbackAt)}` : ""}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  &ldquo;{f.coachFeedback}&rdquo;
                </p>
                {f.rating != null && (
                  <div className="mt-3 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                    <CheckCircle2 size={11} strokeWidth={1.75} />
                    Min mood-rating: {f.rating}/5
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ─────────── Sub-komponenter ─────────── */

function CoachAvatar({
  src,
  name,
  size,
}: {
  src: string | null;
  name: string;
  size: number;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full bg-primary font-display font-semibold text-primary-foreground"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function KpiTile({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-primary/40 bg-primary/[0.05]"
          : "border-border bg-card"
      }`}
    >
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <div
        className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
      <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
        {sub}
      </span>
    </div>
  );
}

function Paywall() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PlayerHQ · Coach"
        titleLead="Få en"
        titleItalic="personlig coach"
        sub="AI-coach 24/7, direkte kontakt med tilknyttet coach, og full innsikt i plan og fremgang. Alt for 300 kr/mnd."
      />
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Pro-funksjon
        </span>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
          Oppgrader for å chatte med AI-coach, sende meldinger til coachen din
          og motta planer og notater.
        </p>
        <Link
          href="/portal/meg/abonnement"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Oppgrader til Pro
          <ArrowUpRight size={16} strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  );
}
