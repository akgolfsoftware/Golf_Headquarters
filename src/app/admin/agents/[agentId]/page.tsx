/**
 * AgencyOS Agent-detalj — v2. Auth/Prisma-loader og agent-konfig (statisk
 * beskrivelse per agent) bevart 1:1 fra legacy-skjermen. AgentRunPanel
 * (manuell kjøring for plan-revisjon/peaking), FeedbackForm (tommel opp/ned
 * per kjøring) og ApprovalActions (godkjenn/avvis forslag) er tailwind-only
 * og gjenbrukes som de er.
 */

import { dagensStartUTC } from "@/lib/dato";
import { coachedPlayerWhere } from "@/lib/auth/coached";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import {
  Caps,
  Tittel,
  Kort,
  KpiFlis,
  StatusPill,
  MikroMeta,
  TomTilstand,
} from "@/components/v2";
import { FeedbackForm } from "./feedback-form";
import { AgentRunPanel } from "./agent-run-panel";
import { ApprovalActions } from "@/app/admin/(legacy)/approvals/approval-actions";

type AgentKonfig = {
  navn: string;
  beskrivelse: string;
  status: "aktiv" | "beta" | "planlagt";
  trigger: string;
};

const AGENT_KONFIG: Record<string, AgentKonfig> = {
  "round-agent": {
    navn: "Round Agent",
    beskrivelse:
      "Beregner SG-snitt siste 30 dager og skriver SG_TOTAL/OTT/APP/ARG/PUTT til Signal-tabellen etter at spiller logger en ny runde.",
    status: "aktiv",
    trigger: "Etter ny runde (event)",
  },
  "test-agent": {
    navn: "Test Agent",
    beskrivelse:
      "Sammenligner siste testresultat mot snitt av forrige 3 og skriver TEST_TREND-signal. Krever minst 1 tidligere resultat.",
    status: "aktiv",
    trigger: "Etter ny test (event)",
  },
  "trackman-agent": {
    navn: "TrackMan Agent",
    beskrivelse: "Grupperer slag per kølle fra rawJson etter CSV-import og skriver CLUB_AVG-signal per kølle.",
    status: "aktiv",
    trigger: "Etter CSV-import (event)",
  },
  "plan-watcher": {
    navn: "Plan Watcher",
    beskrivelse:
      "Sjekker forrige ukes pyramide-fordeling mot måltall (FYS15/TEK20/SLAG35/SPILL20/TURN10). Genererer PYRAMID_ADJUST-forslag ved >8 pp avvik.",
    status: "aktiv",
    trigger: "Cron mandag 06:00",
  },
  periodiseringsagent: {
    navn: "Periodiseringsagent",
    beskrivelse:
      "Foreslår initial uke-allokering for nye treningsplaner basert på MAL_PROSENT-fordeling. Kjører kun for planer uten eksisterende økter.",
    status: "aktiv",
    trigger: "Ved ny TrainingPlan (event)",
  },
  "achievement-agent": {
    navn: "Achievement Agent",
    beskrivelse:
      "Sjekker milepæler (FIRST_ROUND, FIRST_TEST, SG_POSITIVE_30D, STREAK_7/14) etter runde eller test. Dedup mot eksisterende achievements.",
    status: "aktiv",
    trigger: "Etter runde/test (event)",
  },
  "training-gap": {
    navn: "Training Gap",
    beskrivelse:
      "Finner svakeste SG-område og sjekker om spillere trener nok der. Genererer TRAINING_GAP-forslag hvis svakeste område får < 20 % av treningstid.",
    status: "aktiv",
    trigger: "Cron mandag 06:30",
  },
  "calendar-sync": {
    navn: "Calendar Sync",
    beskrivelse:
      "2-veis synkronisering med Google Calendar hvert 15. minutt. Pull: henter events oppdatert siden siste sync og reflekterer kansellering/tidsendring tilbake til Booking-tabellen. Push: reparerer bookinger som mangler googleEventId (missede push-forsøk).",
    status: "aktiv",
    trigger: "Cron hvert 15. min",
  },
  "daily-brief": {
    navn: "Daily Brief",
    beskrivelse:
      "Genererer morgenbrief per coach (dagens økter, flagg, neste turnering) og varsler coach + Anders på Telegram ved hastefunn (severity 4+).",
    status: "aktiv",
    trigger: "Cron daglig 05:30",
  },
  "drill-forslag": {
    navn: "Drill-forslag",
    beskrivelse:
      "Finner stallens svakeste SG-område siste 60 dager og foreslår 5 driller via Claude (YouTube-video når YOUTUBE_API_KEY er satt). Godkjennes på /admin/drills/forslag.",
    status: "aktiv",
    trigger: "Cron mandag 08:00",
  },
  "plan-revisjon": {
    navn: "Plan-revisjon",
    beskrivelse:
      "Foreslår konkrete plan-justeringer for en valgt treningsplan og trigger (siste runde / skade / turneringsprep). Velg plan under og kjør.",
    status: "aktiv",
    trigger: "Manuell (velg plan)",
  },
  peaking: {
    navn: "Peaking",
    beskrivelse:
      "Foreslår uke-for-uke periodisering (Bompa) frem mot en valgt turnering for en spiller. Velg spiller og turnering under og kjør.",
    status: "aktiv",
    trigger: "Manuell (velg spiller)",
  },
};

const STATUS_TONE: Record<AgentKonfig["status"], "up" | "warn" | "info"> = {
  aktiv: "up",
  beta: "warn",
  planlagt: "info",
};

const ACTION_LABEL: Record<string, string> = {
  PYRAMID_ADJUST: "Juster pyramide",
  TRAINING_GAP: "Treningsgap",
  SESSION_ADD: "Legg til økt",
  SESSION_REMOVE: "Fjern økt",
  INTENSITY_ADJUST: "Juster intensitet",
  TAPER_ENGAGE: "Start taper",
  WITHDRAW: "Trekk fra",
  DRILL_SUGGEST: "Drill-forslag",
  TEST_SCHEDULE: "Planlegg test",
  PEER_COMPARE: "Sammenlign",
  RECOVERY_ADD: "Legg til hvile",
  ESCALATION: "Eskalering",
  DELOAD: "Pauseuke",
};

function lagSnippet(meta: Record<string, unknown> | null): string | null {
  if (!meta) return null;

  if (Array.isArray(meta.briefs)) {
    const n = meta.briefs.length;
    const varsler = typeof meta.varsler === "number" ? meta.varsler : 0;
    const first = meta.briefs[0] as { brief?: string } | undefined;
    const preview =
      typeof first?.brief === "string" ? ` — ${first.brief.replace(/\s+/g, " ").slice(0, 180)}` : "";
    return `${n} brief${n === 1 ? "" : "er"} · ${varsler} varsel${varsler === 1 ? "" : "er"}${preview}`;
  }

  if (typeof meta.svakesteLabel === "string" && Array.isArray(meta.driller)) {
    const n = meta.driller.length;
    const video = typeof meta.medVideo === "number" && meta.medVideo > 0 ? `, ${meta.medVideo} m/video` : "";
    return `Svakest: ${meta.svakesteLabel} · ${n} drill${n === 1 ? "" : "er"}${video}`;
  }

  if (Array.isArray(meta.endringer) && typeof meta.spillerNavn === "string") {
    const n = meta.endringer.length;
    const anbef =
      typeof meta.samletAnbefaling === "string"
        ? ` — ${meta.samletAnbefaling.replace(/\s+/g, " ").slice(0, 160)}`
        : "";
    return `${meta.spillerNavn} · ${n} endring${n === 1 ? "" : "er"}${anbef}`;
  }

  if (Array.isArray(meta.fasePerUke) && typeof meta.tournamentNavn === "string") {
    const uker = typeof meta.ukerTilTurnering === "number" ? ` · ${meta.ukerTilTurnering} uker` : "";
    return `${meta.spillerNavn ?? "Spiller"} → ${meta.tournamentNavn}${uker}`;
  }

  if (typeof meta.melding === "string" && meta.melding.trim().length > 0) {
    return meta.melding.slice(0, 240);
  }

  const kandidater = [
    "suggestion",
    "result",
    "summary",
    "snippet",
    "signalsWritten",
    "planActionsWritten",
    "brukerPrompt",
    "prompt",
    "feedback",
  ];
  for (const k of kandidater) {
    const v = meta[k];
    if (typeof v === "string" && v.trim().length > 0) return v.slice(0, 240);
    if (typeof v === "number") return `${k}: ${v}`;
  }
  const json = JSON.stringify(meta);
  return json.length > 4 ? json.slice(0, 240) : null;
}

export default async function AgentDetaljPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { agentId } = await params;
  const konfig = AGENT_KONFIG[agentId];
  if (!konfig) notFound();

  const [kjoringer, planActions] = await Promise.all([
    prisma.agentRun.findMany({
      where: { agentName: agentId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.planAction.findMany({
      where: { agentName: agentId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { id: true, name: true } } },
    }),
  ]);

  let planValg: { id: string; label: string }[] = [];
  let playerValg: { id: string; label: string }[] = [];
  let tournamentValg: { id: string; label: string }[] = [];
  if (agentId === "plan-revisjon") {
    const plans = await prisma.trainingPlan.findMany({
      where: { isActive: true },
      orderBy: { startDate: "desc" },
      take: 50,
      select: { id: true, name: true, user: { select: { name: true } } },
    });
    planValg = plans.map((p) => ({ id: p.id, label: `${p.user.name ?? "Ukjent"} — ${p.name}` }));
  } else if (agentId === "peaking") {
    const [players, tournaments] = await Promise.all([
      prisma.user.findMany({
        where: { AND: [coachedPlayerWhere(), { deletedAt: null }] },
        orderBy: { name: "asc" },
        take: 200,
        select: { id: true, name: true },
      }),
      prisma.tournament.findMany({
        where: { startDate: { gte: dagensStartUTC() } },
        orderBy: { startDate: "asc" },
        take: 50,
        select: { id: true, name: true, startDate: true },
      }),
    ]);
    playerValg = players.map((p) => ({ id: p.id, label: p.name ?? "Ukjent" }));
    tournamentValg = tournaments.map((t) => ({
      id: t.id,
      label: `${t.name} — ${t.startDate.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" })}`,
    }));
  }

  const sistKjort = kjoringer[0]?.createdAt
    ? kjoringer[0].createdAt.toLocaleString("nb-NO", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Ikke kjørt";

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <Link href="/admin/agents" style={{ textDecoration: "none", alignSelf: "flex-start" }}>
          <MikroMeta icon="arrow-left">Agenter</MikroMeta>
        </Link>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Caps>AgencyOS · Agenter</Caps>
            <StatusPill tone={STATUS_TONE[konfig.status]}>{konfig.status}</StatusPill>
          </div>
          <div style={{ marginTop: 10 }}>
            <Tittel>{konfig.navn}</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0", maxWidth: "62ch" }}>
            {konfig.beskrivelse}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: T.gap }}>
          <KpiFlis label="Trigger" value={konfig.trigger} />
          <KpiFlis label="Sist kjørt" value={sistKjort} />
          <KpiFlis label="Kjøringer" value={String(kjoringer.length)} />
        </div>

        <AgentRunPanel agentId={agentId} plans={planValg} players={playerValg} tournaments={tournamentValg} />

        {/* Siste forslag fra agenten */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <MikroMeta icon="sparkles">Siste forslag fra agenten</MikroMeta>
            </span>
            <Link href="/admin/godkjenninger" style={{ textDecoration: "none" }}>
              <MikroMeta icon="arrow-right">Se alle ventende</MikroMeta>
            </Link>
          </div>

          {planActions.length === 0 ? (
            <Kort>
              <TomTilstand icon="sparkles" title="Ingen forslag ennå" sub="Forslag fra denne agenten dukker opp her." />
            </Kort>
          ) : (
            planActions.map((a) => {
              const sugg = a.suggestion as { forklaring?: string } | null;
              const tone: "warn" | "up" | "info" =
                a.status === "PENDING" ? "warn" : a.status === "ACCEPTED" ? "up" : "info";
              return (
                <Kort key={a.id} pad="14px 18px">
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span
                          style={{
                            fontFamily: T.mono,
                            fontSize: 9,
                            textTransform: "uppercase",
                            letterSpacing: "0.10em",
                            color: T.mut,
                            background: T.panel2,
                            borderRadius: 4,
                            padding: "2px 7px",
                          }}
                        >
                          {ACTION_LABEL[a.actionType] ?? a.actionType}
                        </span>
                        <StatusPill tone={tone}>
                          {a.status === "PENDING" ? "Venter" : a.status === "ACCEPTED" ? "Godkjent" : "Avvist"}
                        </StatusPill>
                        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{a.user.name}</span>
                        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginLeft: "auto" }}>
                          {a.createdAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                        </span>
                      </div>
                      {sugg?.forklaring && (
                        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, lineHeight: 1.6, margin: 0 }}>
                          {sugg.forklaring}
                        </p>
                      )}
                    </div>
                    {a.status === "PENDING" && (
                      <div style={{ flexShrink: 0 }}>
                        <ApprovalActions actionId={a.id} playerId={a.user.id} />
                      </div>
                    )}
                  </div>
                </Kort>
              );
            })
          )}
        </div>

        {/* Siste kjøringer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <MikroMeta icon="bot">Siste kjøringer</MikroMeta>

          {kjoringer.length === 0 ? (
            <Kort>
              <TomTilstand
                icon="bot"
                title="Ingen kjøringer ennå"
                sub="Når agenten kjøres, dukker den opp her med feedback-mulighet."
              />
            </Kort>
          ) : (
            kjoringer.map((k) => {
              const output = (k.output as Record<string, unknown> | null) ?? null;
              const snippet = lagSnippet(output);
              const erFeil = k.status === "ERROR";
              return (
                <Kort key={k.id} pad="14px 18px">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <StatusPill tone={erFeil ? "down" : "up"}>{erFeil ? "Feil" : "OK"}</StatusPill>
                        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{k.duration} ms</span>
                      </div>
                      {erFeil && k.error && (
                        <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.down, marginTop: 6 }}>{k.error}</p>
                      )}
                    </div>
                    <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, textAlign: "right", whiteSpace: "nowrap" }}>
                      {k.createdAt.toLocaleString("nb-NO", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {!erFeil && snippet && (
                    <p
                      style={{
                        fontFamily: T.ui,
                        fontSize: 11.5,
                        color: T.mut,
                        lineHeight: 1.6,
                        marginTop: 8,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {snippet}
                    </p>
                  )}
                  <FeedbackForm auditId={k.id} />
                </Kort>
              );
            })
          )}
        </div>
      </div>
    </V2Shell>
  );
}
