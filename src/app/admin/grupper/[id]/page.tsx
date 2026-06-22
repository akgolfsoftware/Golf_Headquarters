/**
 * AgencyOS — Gruppe-detalj (PR9 · Skjerm 9.2)
 *
 * Pixel-perfekt detaljvisning for én treningsgruppe:
 * - Hero med gruppe-navn (Inter Tight italic) + spillere-count + coach
 * - Spiller-grid (mini-cards med avatar + navn + HCP)
 * - Gruppeplan + neste samling (fra GroupSchedule)
 * - Statistikk per spiller (sammenlign HCP, runder, plan-fremdrift)
 *
 * Tokens-only, 8pt-grid, Lucide stroke 1.75.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarClock,
  MapPin,
  Repeat,
  Trophy,
  Users,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { DetailShell } from "@/components/shared/detail-shell";
import { KPICard } from "@/components/ui/kpi-card";
import { AthleticBadge } from "@/components/athletic/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { avatarBg } from "@/lib/avatar-colors";
import {
  StartOktButton,
  LeggTilSpillerButton,
  FjernMedlemButton,
  SeAlleTimePlanButton,
  DetaljerButton,
  AapneButton,
} from "./gruppe-actions";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function fmtHcp(h: number | null): string {
  if (h == null) return "—";
  return h >= 0 ? h.toFixed(1).replace(".", ",") : `+${Math.abs(h).toFixed(1).replace(".", ",")}`;
}

function snittHcp(hcps: Array<number | null>): string {
  const valid = hcps.filter((h): h is number => h != null);
  if (valid.length === 0) return "—";
  const avg = valid.reduce((s, n) => s + n, 0) / valid.length;
  return fmtHcp(avg);
}

function typeLabel(level: string | null): string {
  if (!level) return "Klubb";
  if (level.startsWith("S")) return "Skole";
  if (level.startsWith("A")) return "Selektert";
  return "Klubb";
}

export default async function GruppeDetalj({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const gruppe = await prisma.group.findUnique({
    where: { id },
    include: {
      coach: { select: { id: true, name: true, email: true, avatarUrl: true } },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              hcp: true,
              avatarUrl: true,
              homeClub: true,
              tier: true,
            },
          },
        },
      },
      schedules: {
        orderBy: { startAt: "asc" },
      },
      _count: { select: { members: true, schedules: true } },
    },
  });

  if (!gruppe) notFound();

  // Hent runder + aktive planer per medlem (siste 90 d)
  const memberIds = gruppe.members.map((m) => m.userId);
  const naa = new Date();
  const nittiDagerSiden = new Date(naa.getTime() - 90 * 24 * 60 * 60 * 1000);

  const [runderPerMedlem, planerPerMedlem] = await Promise.all([
    memberIds.length > 0
      ? prisma.round.groupBy({
          by: ["userId"],
          where: { userId: { in: memberIds }, playedAt: { gte: nittiDagerSiden } },
          _count: { _all: true },
          _avg: { score: true },
        })
      : Promise.resolve([] as Array<{ userId: string; _count: { _all: number }; _avg: { score: number | null } }>),
    memberIds.length > 0
      ? prisma.trainingPlan.findMany({
          where: { userId: { in: memberIds }, isActive: true },
          select: {
            id: true,
            userId: true,
            name: true,
            sessions: { select: { status: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  const runderMap = new Map(runderPerMedlem.map((r) => [r.userId, r]));
  const planMap = new Map(planerPerMedlem.map((p) => [p.userId, p]));

  // Kandidater til «Legg til spiller»: aktive spillere som ikke alt er medlem.
  const kandidater = await prisma.user.findMany({
    where: {
      role: "PLAYER",
      deletedAt: null,
      id: { notIn: memberIds },
    },
    select: { id: true, name: true, hcp: true, homeClub: true },
    orderBy: { name: "asc" },
  });

  const nesteSamling = gruppe.schedules.find((s) => s.startAt > naa) ?? gruppe.schedules[0] ?? null;
  const kommendeSamlinger = gruppe.schedules.filter((s) => s.startAt > naa).slice(0, 5);

  const snittHcpVerdi = snittHcp(gruppe.members.map((m) => m.user.hcp));
  const proAndel = gruppe.members.length > 0
    ? Math.round((gruppe.members.filter((m) => m.user.tier === "PRO").length / gruppe.members.length) * 100)
    : 0;
  const totalRunder = runderPerMedlem.reduce((s, r) => s + r._count._all, 0);

  return (
    <DetailShell
      breadcrumb={[
        { label: "Grupper", href: "/admin/grupper" },
        { label: gruppe.name },
      ]}
      backHref="/admin/grupper"
      title={
        <em
          className="not-italic"
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontStyle: "italic",
            color: "hsl(var(--primary))",
          }}
        >
          {gruppe.name}
        </em>
      }
      subtitle={`${gruppe._count.members} medlemmer · Snitt-HCP ${snittHcpVerdi} · ${gruppe._count.schedules} planlagte samlinger · Coach ${gruppe.coach?.name ?? "ikke satt"}`}
      statusPill={<AthleticBadge variant="primary">{typeLabel(gruppe.level).toUpperCase()}</AthleticBadge>}
      actions={
        <>
          <Link
            href={`/admin/bookinger/ny?groupId=${gruppe.id}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:border-primary"
          >
            <CalendarClock className="h-3.5 w-3.5" strokeWidth={1.75} />
            Planlegg samling
          </Link>
          <LeggTilSpillerButton groupId={gruppe.id} kandidater={kandidater} />
        </>
      }
      kpiRow={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <KPICard
            eyebrow="Medlemmer"
            value={String(gruppe._count.members)}
            variant="hero"
            icon={<Users size={18} strokeWidth={1.75} aria-hidden />}
            footnote={`${gruppe.members.filter((m) => m.role === "ASSISTANT").length} hjelpetrener`}
          />
          <KPICard
            eyebrow="Snitt-HCP"
            value={snittHcpVerdi}
            footnote="Median av aktive"
          />
          <KPICard
            eyebrow="Runder · 90 d"
            value={String(totalRunder)}
            footnote="På tvers av medlemmer"
          />
          <KPICard
            eyebrow="PRO-andel"
            value={`${proAndel}%`}
            footnote="Aktive abonnenter"
          />
        </div>
      }
    >

      {/* Neste samling */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Gruppeplan · neste samling
            </span>
          </div>
          <SeAlleTimePlanButton />
        </div>

        {nesteSamling ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-semibold leading-tight">
                  {nesteSamling.title}
                </h3>
                <p className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                  <span className="text-foreground">{NB_DATE.format(nesteSamling.startAt)}</span>
                  {nesteSamling.location && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" strokeWidth={1.75} />
                        {nesteSamling.location}
                      </span>
                    </>
                  )}
                  {nesteSamling.recurring && nesteSamling.recurring !== "NONE" && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Repeat className="h-3 w-3" strokeWidth={1.75} />
                        {nesteSamling.recurring}
                      </span>
                    </>
                  )}
                </p>
                {nesteSamling.description && (
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    {nesteSamling.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <DetaljerButton />
                <StartOktButton />
              </div>
            </div>

            {kommendeSamlinger.length > 1 && (
              <ul className="mt-6 divide-y divide-border border-t border-border">
                {kommendeSamlinger.slice(1).map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">
                        {s.title}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                        {NB_DATE.format(s.startAt)}
                        {s.location && ` · ${s.location}`}
                      </div>
                    </div>
                    <AapneButton />
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Ingen samlinger planlagt. Bruk &laquo;Planlegg samling&raquo;-knappen for å legge inn første økt.
          </p>
        )}
      </section>

      {/* Spiller-grid med statistikk */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Medlemmer · sammenlign statistikk
            </span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            {gruppe.members.length} totalt
          </span>
        </div>

        {gruppe.members.length === 0 ? (
          <EmptyState
            icon={Users}
            titleItalic="Ingen"
            titleTrail="medlemmer ennå"
            sub="Legg til spillere for å se sammenlignet statistikk per medlem."
          />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {gruppe.members.map((m) => {
              const runder = runderMap.get(m.userId);
              const plan = planMap.get(m.userId);
              const planTotal = plan?.sessions.length ?? 0;
              const planDone = plan?.sessions.filter((s) => s.status === "COMPLETED").length ?? 0;
              const planAndel = planTotal === 0 ? 0 : Math.round((planDone / planTotal) * 100);

              return (
                <li
                  key={m.id}
                  className="rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                >
                  <Link href={`/admin/spillere/${m.userId}`} className="flex items-start gap-2">
                    {m.user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.user.avatarUrl}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full font-mono text-xs font-semibold text-white"
                        style={{ background: avatarBg(m.user.name) }}
                      >
                        {initials(m.user.name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-foreground">
                        {m.user.name}
                      </div>
                      <div className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                        {m.user.homeClub ?? "Klubb ukjent"} · {m.role === "ASSISTANT" ? "Hjelpetrener" : "Spiller"}
                      </div>
                    </div>
                    {m.user.tier === "PRO" && (
                      <span className="rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-primary">
                        PRO
                      </span>
                    )}
                    <FjernMedlemButton
                      groupId={gruppe.id}
                      userId={m.userId}
                      navn={m.user.name}
                    />
                  </Link>

                  {/* Mini-stats */}
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        HCP
                      </span>
                      <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                        {fmtHcp(m.user.hcp)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        Runder
                      </span>
                      <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                        {runder?._count._all ?? 0}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        Plan
                      </span>
                      <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                        {plan ? `${planAndel}%` : "—"}
                      </span>
                    </div>
                  </div>

                  {plan && planTotal > 0 && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${planAndel}%` }}
                        />
                      </div>
                      <p className="mt-1.5 truncate font-mono text-[10px] text-muted-foreground">
                        {plan.name} · {planDone}/{planTotal} økter
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Gruppeprestasjon — quick stats */}
      <section className="grid gap-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Beste HCP-utvikling
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Detaljert utvikling per spiller vises i {" "}
            <Link href="/admin/analyse" className="font-medium text-primary hover:underline">
              gruppe-analyse
            </Link>
            .
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Oppmøte siste 30 d
            </span>
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground">—</p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            Aktiveres når oppmøte-logg er fylt ut
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Coach-ressurs
            </span>
          </div>
          <p className="mt-2 text-sm text-foreground">
            {gruppe.coach?.name ?? "Ingen primær-coach satt"}
          </p>
          {gruppe.coach?.email && (
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">{gruppe.coach.email}</p>
          )}
        </div>
      </section>
    </DetailShell>
  );
}
