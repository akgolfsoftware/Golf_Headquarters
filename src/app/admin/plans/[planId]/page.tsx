/**
 * AgencyOS Plan-detalj — v2. Auth/Prisma-loader og all avledet data
 * (faser, pyramide-fordeling, draggable sessions, fullførte økter) bevart
 * 1:1 fra legacy. Rike interaktive delkomponenter (DraggableSessions,
 * PlanActions, AddSessionModal, FaseTimeline, PhaseCard, lokal KpiCard,
 * PyramideFordeling, AgentStrip, CompletedSessions, RejectedBanner) er
 * tailwind-only (ingen golfdata) og gjenbrukes uendret — kun ytre
 * DetailShell/KPICard/Tag/tab-nav er byttet til v2-chrome.
 */

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, BookOpen } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { aggregateByArea, prosentPerArea, totalMinutter } from "@/lib/pyramide";
import { EmptyState } from "@/components/shared/empty-state";
import { AddSessionModal } from "@/components/admin/add-session-wizard";
import { AgentStrip } from "@/components/coachhq/agent-strip";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, KpiFlis, StatusPill, MikroMeta } from "@/components/v2";
import { PlanActions } from "./plan-actions";
import { DraggableSessions, type DraggableSession } from "./draggable-sessions";
import { RejectedBanner } from "./rejected-banner";
import { buildFaser } from "./_faser";
import { FaseTimeline } from "./_timeline";
import { PhaseCard } from "./_phase-card";
import { KpiCard } from "./_kpi-card";
import { PyramideFordeling } from "./_pyramide-fordeling";
import { CompletedSessions, type CompletedSession } from "./_completed-sessions";

const TABS = [
  { key: "oversikt", label: "Oversikt" },
  { key: "ovelser", label: "Øvelser" },
  { key: "notater", label: "Notater" },
  { key: "rapport", label: "Rapport" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_TONE: Record<string, "up" | "down" | "warn" | "info"> = {
  ACTIVE: "up",
  REJECTED: "down",
  PENDING_PLAYER: "warn",
};

export default async function AdminPlanDetalj({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const me = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { planId } = await params;
  const sp = await searchParams;
  const tab: TabKey = (TABS.map((t) => t.key).includes(sp.tab as TabKey) ? sp.tab : "oversikt") as TabKey;

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    include: {
      user: { select: { id: true, name: true, hcp: true, tier: true } },
      sessions: {
        include: {
          drills: { include: { exercise: true }, orderBy: { orderIndex: "asc" } },
          log: true,
        },
        orderBy: { scheduledAt: "asc" },
      },
    },
  });
  if (!plan) notFound();

  const exercises = await prisma.exerciseDefinition.findMany({
    orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
  });

  const spillere = await prisma.user.findMany({
    where: coachScopedPlayerWhere(me),
    select: { id: true, name: true, hcp: true, homeClub: true },
    orderBy: { name: "asc" },
  });

  const spillereMedPlaner = await prisma.user.findMany({
    where: coachScopedPlayerWhere(me),
    select: {
      id: true,
      name: true,
      hcp: true,
      homeClub: true,
      tier: true,
      trainingPlans: {
        where: { isActive: true, status: { in: ["ACTIVE", "PENDING_PLAYER"] } },
        select: { id: true, name: true },
      },
    },
    orderBy: { name: "asc" },
  });
  const assignSpillere = spillereMedPlaner.map((s) => ({
    id: s.id,
    name: s.name,
    hcp: s.hcp,
    homeClub: s.homeClub,
    tier: s.tier,
    aktivePlaner: s.trainingPlans,
  }));

  const msPerUke = 7 * 24 * 60 * 60 * 1000;
  const planSluttForVarighet = plan.endDate ?? plan.sessions.at(-1)?.scheduledAt ?? plan.startDate;
  const planVarighetUker = Math.max(
    1,
    Math.round((planSluttForVarighet.getTime() - plan.startDate.getTime()) / msPerUke),
  );

  const totalt = plan.sessions.length;
  const fullført = plan.sessions.filter((s) => s.status === "COMPLETED").length;
  const aktiv = plan.sessions.filter((s) => s.status === "ACTIVE").length;
  const gjennomforing = totalt === 0 ? 0 : Math.round((fullført / totalt) * 100);
  const totMinutter = totalMinutter(aggregateByArea(plan.sessions));
  const totTimer = (totMinutter / 60).toFixed(1).replace(".", ",");
  const fordeling = prosentPerArea(aggregateByArea(plan.sessions));

  const draggableSessions: DraggableSession[] = plan.sessions
    .filter((s) => s.status !== "COMPLETED")
    .map((s) => ({
      id: s.id,
      scheduledAt: s.scheduledAt.toISOString(),
      durationMin: s.durationMin,
      title: s.title,
      pyramidArea: s.pyramidArea,
      skillArea: s.skillArea ?? null,
      environment: s.environment ?? null,
      lPhase: s.lPhase ?? null,
      status: s.status,
      drillCount: s.drills.length,
      rationale: s.rationale ?? null,
    }));

  const faser = buildFaser(plan.sessions);

  const fullforteSessions: CompletedSession[] = plan.sessions
    .filter((s) => s.status === "COMPLETED" && s.log != null)
    .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())
    .slice(0, 8)
    .map((s) => ({
      id: s.id,
      title: s.title,
      scheduledAt: s.scheduledAt,
      durationMin: s.durationMin,
      pyramidArea: s.pyramidArea,
      log: s.log
        ? {
            startedAt: s.log.startedAt,
            completedAt: s.log.completedAt,
            csAchieved: s.log.csAchieved,
            rating: s.log.rating,
            coachFeedback: s.log.coachFeedback,
            coachFeedbackAt: s.log.coachFeedbackAt,
          }
        : null,
    }));

  const periodeFra = plan.startDate.toLocaleDateString("nb-NO", { day: "numeric", month: "long" });
  const periodeTil = plan.endDate
    ? plan.endDate.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" })
    : "åpen";

  const planTittel = plan.name.trim() || "Treningsplan";

  return (
    <V2Shell aktiv="planlegge" nav={AGENCYOS_NAV} navn={me.name} avatarUrl={me.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <Link href="/admin/plans" style={{ textDecoration: "none", alignSelf: "flex-start" }}>
          <MikroMeta icon="arrow-left">Planer</MikroMeta>
        </Link>

        {/* Hode */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Caps>AgencyOS · Planer</Caps>
              <StatusPill tone={STATUS_TONE[plan.status] ?? "info"}>{plan.status}</StatusPill>
            </div>
            <div style={{ marginTop: 10 }}>
              <Tittel>{planTittel}</Tittel>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
              {plan.user.name}
              {plan.user.hcp != null ? ` · HCP ${plan.user.hcp}` : ""} · {periodeFra} – {periodeTil} · {totalt} økter
            </p>
          </div>
          <PlanActions
            planId={plan.id}
            isActive={plan.isActive}
            status={plan.status}
            isAdmin={me.role === "ADMIN"}
            originalPlanNavn={plan.name}
            originalUserId={plan.userId}
            spillere={spillere}
            assignSpillere={assignSpillere}
            planVarighetUker={planVarighetUker}
            planTier={plan.user.tier ?? "PRO"}
          />
        </div>

        {/* KPI-rad */}
        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: T.gap }}>
          <KpiFlis label="Total tid" value={`${totTimer} t`} delta={`${totMinutter} min planlagt`} />
          <KpiFlis label="Økter" value={String(totalt)} delta={`${aktiv} aktive · ${fullført} fullført`} />
          <KpiFlis label="Gjennomføring" value={`${gjennomforing} %`} delta={`${fullført} av ${totalt} fullført`} />
          <KpiFlis label="SG-utvikling" value="—" delta="Krever round-data" />
        </div>

        {/* Faner */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TABS.map(({ key, label }) => {
            const active = tab === key;
            return (
              <Link key={key} href={`/admin/plans/${planId}?tab=${key}`} style={{ textDecoration: "none" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "7px 16px",
                    borderRadius: 9999,
                    fontFamily: T.ui,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: active ? T.onLime : T.mut,
                    background: active ? T.lime : T.panel2,
                    border: `1px solid ${active ? "transparent" : T.border}`,
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>

        {plan.status === "REJECTED" && plan.playerComment && (
          <RejectedBanner planId={plan.id} playerComment={plan.playerComment} playerName={plan.user.name} />
        )}

        <AgentStrip label="Periodiserings-agent">
          Overvåker fasebytter og foreslår justeringer hvis planen sklir. Klikk på en fase under for å se status og
          blokker.
        </AgentStrip>

        <FaseTimeline faser={faser} />

        {/* Tab: OVERSIKT */}
        {tab === "oversikt" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr]" style={{ gap: T.gap }}>
            <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
              {faser.length === 0 ? (
                <Kort>
                  <EmptyState
                    icon={CalendarClock}
                    titleItalic="Ingen økter"
                    titleTrail="lagt til ennå"
                    sub="Legg til økter for å bygge fase-strukturen og pyramide-vektingen."
                  />
                </Kort>
              ) : (
                faser.map((f, idx) => (
                  <PhaseCard
                    key={f.key}
                    num={`Uke ${idx + 1}`}
                    statusTone={f.status}
                    name={f.ukeLabel}
                    dates={f.dateRangeLabel}
                    pct={f.totalSessions === 0 ? "—" : `${Math.round((f.done / f.totalSessions) * 100)} %`}
                    pctLabel={f.status === "current" ? "På plan" : "Fullført"}
                    pctMuted={f.totalSessions === 0}
                    current={f.status === "current"}
                    pyr={f.pyrFordeling}
                    sessions={[
                      { value: `${f.done}/${f.totalSessions}`, label: "Økter" },
                      { value: `${(f.totMin / 60).toFixed(1).replace(".", ",")} t`, label: "Volum" },
                      {
                        value: f.totalSessions === 0 ? "—" : `${Math.round((f.done / f.totalSessions) * 100)} %`,
                        label: "Adherence",
                      },
                      { value: f.dominantArea ?? "—", label: "Fokus" },
                    ]}
                  />
                ))
              )}
            </div>

            <aside style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
              <div className="grid grid-cols-2" style={{ gap: 8 }}>
                <KpiCard label="Total tid" value={`${totTimer} t`} sub={`${totMinutter} min planlagt`} />
                <KpiCard label="Økter" value={`${totalt}`} sub={`${aktiv} aktive · ${fullført} fullført`} />
                <KpiCard label="Gjennomføring" value={`${gjennomforing} %`} sub={`${fullført} av ${totalt} fullført`} />
                <KpiCard label="SG-utvikling" value="—" sub="Krever round-data" />
              </div>

              <PyramideFordeling fordeling={fordeling} />

              <CompletedSessions sessions={fullforteSessions} playerName={plan.user.name} />

              <Kort
                eyebrow="Kommende økter"
                action={<AddSessionModal planId={plan.id} exercises={exercises} triggerLabel="Legg til økt" />}
              >
                <p style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut, marginBottom: 10 }}>
                  Dra for å flytte · rediger med blyant-ikon
                </p>
                <DraggableSessions sessions={draggableSessions} />
              </Kort>
            </aside>
          </div>
        )}

        {/* Tab: ØVELSER */}
        {tab === "ovelser" && (
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
            {plan.sessions.length === 0 ? (
              <Kort>
                <EmptyState icon={BookOpen} titleItalic="Ingen øvelser" titleTrail="lagt til" sub="Legg til økter med øvelser via Oversikt-fanen." />
              </Kort>
            ) : (
              plan.sessions.map((s) => {
                const NB_SHORT = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short" });
                return (
                  <Kort key={s.id} pad="0">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", borderBottom: `1px solid ${T.border}`, background: T.panel2 }}>
                      <div>
                        <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{s.title}</span>
                        <span style={{ marginLeft: 8, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", color: T.mut }}>{s.pyramidArea}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>
                          {NB_SHORT.format(s.scheduledAt)} · {s.durationMin} min
                        </span>
                        <StatusPill tone={s.status === "COMPLETED" ? "up" : "info"}>{s.status}</StatusPill>
                      </div>
                    </div>
                    {s.drills.length === 0 ? (
                      <p style={{ padding: "16px 18px", fontFamily: T.ui, fontSize: 12, color: T.mut, margin: 0 }}>Ingen øvelser lagt til for denne økten.</p>
                    ) : (
                      <div style={{ padding: "0 18px" }}>
                        {s.drills.map((d, i) => (
                          <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i === s.drills.length - 1 ? "none" : `1px solid ${T.border}` }}>
                            <span style={{ width: 20, textAlign: "center", fontFamily: T.mono, fontSize: 10, color: T.mut }}>{i + 1}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{d.exercise.name}</div>
                              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>
                                {d.exercise.pyramidArea} · {d.repsSets}
                              </div>
                            </div>
                            {d.notes && <p style={{ maxWidth: 280, fontFamily: T.ui, fontSize: 11, color: T.mut, margin: 0 }}>{d.notes}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </Kort>
                );
              })
            )}
          </div>
        )}

        {/* Tab: NOTATER */}
        {tab === "notater" && (
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
            <Kort eyebrow="Coach-notater · fullførte økter">
              {fullforteSessions.filter((s) => s.log?.coachFeedback).length === 0 ? (
                <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0 }}>
                  Ingen coach-notater ennå. Send feedback på fullførte økter via Oversikt-fanen.
                </p>
              ) : (
                fullforteSessions
                  .filter((s) => s.log?.coachFeedback)
                  .map((s, i, arr) => {
                    const NB_SHORT = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long" });
                    return (
                      <div key={s.id} style={{ paddingBottom: i === arr.length - 1 ? 0 : 14, marginBottom: i === arr.length - 1 ? 0 : 14, borderBottom: i === arr.length - 1 ? "none" : `1px solid ${T.border}` }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
                          <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{s.title}</span>
                          <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, whiteSpace: "nowrap" }}>
                            {s.log?.coachFeedbackAt ? NB_SHORT.format(s.log.coachFeedbackAt) : NB_SHORT.format(s.scheduledAt)}
                          </span>
                        </div>
                        <p style={{ fontFamily: T.ui, fontSize: 13, lineHeight: 1.6, color: T.fg, margin: 0 }}>{s.log?.coachFeedback}</p>
                      </div>
                    );
                  })
              )}
            </Kort>

            <Kort eyebrow="Spiller-notater · live-logger">
              {fullforteSessions.filter((s) => s.log && "notes" in s.log && s.log.notes).length === 0 ? (
                <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0 }}>Ingen spillernotater registrert fra live-logger.</p>
              ) : (
                fullforteSessions
                  .filter((s) => s.log && "notes" in s.log && s.log.notes)
                  .map((s, i, arr) => (
                    <div key={s.id} style={{ padding: "10px 0", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${T.border}` }}>
                      <div style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", color: T.mut }}>
                        {s.title} · {new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short" }).format(s.scheduledAt)}
                      </div>
                    </div>
                  ))
              )}
            </Kort>
          </div>
        )}

        {/* Tab: RAPPORT */}
        {tab === "rapport" && (
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
            <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: T.gap }}>
              <Kort>
                <Caps>Total økt-tid</Caps>
                <div style={{ fontFamily: T.mono, fontSize: 30, fontWeight: 700, color: T.fg, marginTop: 8 }}>{totTimer} t</div>
                <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 6 }}>{totMinutter} min planlagt totalt</p>
              </Kort>
              <Kort>
                <Caps>Fullføringsprosent</Caps>
                <div style={{ fontFamily: T.mono, fontSize: 30, fontWeight: 700, color: gjennomforing >= 75 ? T.up : T.fg, marginTop: 8 }}>
                  {gjennomforing} %
                </div>
                <div style={{ height: 6, borderRadius: 9999, background: T.track, overflow: "hidden", marginTop: 8 }}>
                  <div style={{ height: "100%", borderRadius: 9999, width: `${gjennomforing}%`, background: T.lime }} />
                </div>
                <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 6 }}>
                  {fullført} av {totalt} økter fullført
                </p>
              </Kort>
              <Kort>
                <Caps>Trend</Caps>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 30, fontWeight: 700, color: T.fg }}>
                    {gjennomforing >= 75 ? "↑" : gjennomforing >= 50 ? "→" : "↓"}
                  </span>
                  <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
                    {gjennomforing >= 75 ? "God fremgang" : gjennomforing >= 50 ? "På rett vei" : "Behov for oppfølging"}
                  </span>
                </div>
                <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 6 }}>Basert på gjennomføring hittil</p>
              </Kort>
            </div>

            <Kort eyebrow="Pyramide-fordeling">
              <PyramideFordeling fordeling={fordeling} />
            </Kort>

            <Kort eyebrow={`Per-uke oppsummering · ${faser.length} uker`}>
              {faser.length === 0 ? (
                <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0 }}>Ingen uker i planen ennå.</p>
              ) : (
                faser.map((f, idx, arr) => (
                  <div
                    key={f.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "9px 0",
                      borderBottom: idx === arr.length - 1 ? "none" : `1px solid ${T.border}`,
                    }}
                  >
                    <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg, minWidth: 56 }}>Uke {idx + 1}</span>
                    <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, flex: 1 }}>{f.dateRangeLabel}</span>
                    <span style={{ fontFamily: T.mono, fontSize: 12, color: T.fg, minWidth: 50, textAlign: "right" }}>
                      {(f.totMin / 60).toFixed(1).replace(".", ",")} t
                    </span>
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: 12,
                        minWidth: 40,
                        textAlign: "right",
                        color: f.totalSessions > 0 && Math.round((f.done / f.totalSessions) * 100) >= 75 ? T.up : T.mut,
                      }}
                    >
                      {f.done}/{f.totalSessions}
                    </span>
                    <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, minWidth: 60, textAlign: "right" }}>{f.dominantArea ?? "—"}</span>
                  </div>
                ))
              )}
            </Kort>
          </div>
        )}
      </div>
    </V2Shell>
  );
}
