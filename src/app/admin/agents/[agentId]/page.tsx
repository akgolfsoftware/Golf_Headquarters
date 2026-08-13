/**
 * AgencyOS Agent-detalj — v2 pixel-pass mot Paper-fasiten. Auth/Prisma-loader
 * og agent-konfig (statisk beskrivelse per agent) bevart 1:1 fra forrige
 * versjon. AgentRunPanel (manuell kjøring for plan-revisjon/peaking) og
 * ApprovalActions (godkjenn/avvis forslag) gjenbrukes uendret — begge har
 * ekte server actions bak seg (run-actions.ts / approval-actions.tsx).
 *
 * Fasit: designsystem/paper/fase2/agencyos/agencyos-agent-detalj.html.
 * Visning: AdminAgentDetaljV2 (src/components/admin/v2/) — samme
 * server-fetcher/client-view-oppdeling som AdminAgenticosHubV2.
 *
 * FeedbackForm (tommel opp/ned per kjøring) er IKKE lenger montert her —
 * fasiten har ingen slik affordance, og Paper vinner alltid ved konflikt
 * (CLAUDE.md invariant 2). Selve komponenten og `gisFeedback`-actionen er
 * urørt i tilfelle den tas i bruk igjen et annet sted.
 */

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminAgentDetaljV2,
  type AgentDetaljData,
  type AgentDetaljKjoring,
  type AgentDetaljForslag,
  type AgentDetaljSteg,
  type AgentDetaljTilstand,
} from "@/components/admin/v2/AdminAgentDetaljV2";

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
  "turnering-agent": {
    navn: "Turnering-agent",
    beskrivelse: "Spillere med turnering innen 7 dager får PERIOD_SWITCH-forslag.",
    status: "aktiv",
    trigger: "Cron daglig 07:00",
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

const NB_KORT = { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" } as const;
const NB_DATO = { day: "2-digit", month: "2-digit", year: "2-digit" } as const;

function fmtVarighet(ms: number): string {
  return `${(ms / 1000).toFixed(1).replace(".", ",")} s`;
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

  const na = new Date();
  const tretti_dager_siden = new Date();
  tretti_dager_siden.setDate(tretti_dager_siden.getDate() - 30);

  const [sisteKjoring, kjoringerVindu, planActions, pendingCount, acceptedCount, rejectedCount, eldstePending] =
    await Promise.all([
      prisma.agentRun.findFirst({ where: { agentName: agentId }, orderBy: { createdAt: "desc" } }),
      prisma.agentRun.findMany({
        where: { agentName: agentId, createdAt: { gte: tretti_dager_siden } },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.planAction.findMany({
        where: { agentName: agentId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { id: true, name: true } } },
      }),
      prisma.planAction.count({ where: { agentName: agentId, status: "PENDING" } }),
      prisma.planAction.count({ where: { agentName: agentId, status: "ACCEPTED" } }),
      prisma.planAction.count({ where: { agentName: agentId, status: "REJECTED" } }),
      prisma.planAction.findFirst({
        where: { agentName: agentId, status: "PENDING" },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
    ]);

  // Steg for agent-team-kjøringer (KommandoAgentStep). Ingen av de 13
  // registrerte agentene skriver disse i dag — AgentRun har ingen kobling
  // til KommandoAgentRun i schema — men oppslaget gjøres ærlig i tilfelle
  // det legges til senere, i stedet for å anta at det aldri skjer.
  const kommandoSteg = sisteKjoring
    ? await prisma.kommandoAgentStep.findMany({
        where: { runId: sisteKjoring.id },
        orderBy: { orderIndex: "asc" },
      })
    : [];

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
        where: { AND: [coachScopedPlayerWhere(user), { deletedAt: null }] },
        orderBy: { name: "asc" },
        take: 200,
        select: { id: true, name: true },
      }),
      prisma.tournament.findMany({
        where: { startDate: { gte: new Date() } },
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

  // ── Tilstand ────────────────────────────────────────────
  const erManuell = konfig.trigger.toLowerCase().startsWith("manuell");
  let tilstand: AgentDetaljTilstand;
  if (erManuell) tilstand = "manuell";
  else if (!sisteKjoring) tilstand = "ingen";
  else if (sisteKjoring.status === "ERROR") tilstand = "feilet";
  else tilstand = "aktiv";

  // ── KPI ─────────────────────────────────────────────────
  const kjoringerOk = kjoringerVindu.filter((k) => k.status === "OK").length;
  const kjoringerFeil = kjoringerVindu.length - kjoringerOk;
  const snittTidMs =
    kjoringerVindu.length > 0
      ? Math.round(kjoringerVindu.reduce((sum, k) => sum + k.duration, 0) / kjoringerVindu.length)
      : null;
  const forslagLaget = pendingCount + acceptedCount + rejectedCount;

  // ── Kjøringer-liste (maks 10 i vinduet) ────────────────
  const kjoringer: AgentDetaljKjoring[] = kjoringerVindu.slice(0, 10).map((k) => {
    const output = (k.output as Record<string, unknown> | null) ?? null;
    const snippet = k.status === "ERROR" ? k.error : lagSnippet(output);
    return {
      id: k.id,
      naar: k.createdAt.toLocaleString("nb-NO", NB_KORT),
      varighetTekst: fmtVarighet(k.duration),
      ok: k.status !== "ERROR",
      outputTekst: snippet,
    };
  });

  // ── Siste kjøring i detalj ──────────────────────────────
  let sisteSteg: { naarTekst: string; steg: AgentDetaljSteg[] } | null = null;
  if (sisteKjoring) {
    const naarTekst = `${sisteKjoring.createdAt.toLocaleString("nb-NO", NB_KORT)} · ${fmtVarighet(sisteKjoring.duration)}`;
    if (kommandoSteg.length > 0) {
      sisteSteg = {
        naarTekst,
        steg: kommandoSteg.map((s) => ({
          rolle: s.role,
          tekst: s.output ? s.output.slice(0, 220) : `Modell: ${s.model}`,
          ok: s.status !== "failed",
        })),
      };
    } else {
      const output = (sisteKjoring.output as Record<string, unknown> | null) ?? null;
      const ok = sisteKjoring.status !== "ERROR";
      sisteSteg = {
        naarTekst,
        steg: [
          {
            rolle: "kjøring",
            tekst: ok ? (lagSnippet(output) ?? "Fullført uten forslag.") : (sisteKjoring.error ?? "Feilet."),
            ok,
          },
        ],
      };
    }
  }

  // ── Forslag ──────────────────────────────────────────────
  const forslag: AgentDetaljForslag[] = planActions.map((a) => {
    const sugg = a.suggestion as { forklaring?: string } | null;
    const tone: "warn" | "up" | "info" = a.status === "PENDING" ? "warn" : a.status === "ACCEPTED" ? "up" : "info";
    return {
      id: a.id,
      actionTypeLabel: ACTION_LABEL[a.actionType] ?? a.actionType,
      statusLabel: a.status === "PENDING" ? "Venter" : a.status === "ACCEPTED" ? "Godkjent" : "Avvist",
      tone,
      brukerNavn: a.user.name ?? "Ukjent",
      playerId: a.user.id,
      naar: a.createdAt.toLocaleDateString("nb-NO", NB_DATO),
      forklaring: sugg?.forklaring ?? null,
      pending: a.status === "PENDING",
    };
  });

  // ── Inspektørpanel ───────────────────────────────────────
  const avgjorte = acceptedCount + rejectedCount;
  const godkjentRateTekst = avgjorte === 0 ? "—" : `${Math.round((100 * acceptedCount) / avgjorte)} %`;
  const godkjentSub = avgjorte === 0 ? "Ingen avgjort ennå" : `${acceptedCount} av ${avgjorte} avgjorte`;
  const eldsteDager = eldstePending
    ? Math.max(0, Math.floor((na.getTime() - eldstePending.createdAt.getTime()) / 86_400_000))
    : null;
  const eldsteIKoTekst = eldsteDager === null ? "—" : `${eldsteDager} dg`;
  const eldsteSub = pendingCount === 0 ? "Ingen venter" : `${pendingCount} forslag venter`;

  // ── Feilkort ──────────────────────────────────────────────
  let feil: AgentDetaljData["feil"] = null;
  if (tilstand === "feilet" && sisteKjoring) {
    const forrigeOk = kjoringerVindu.find((k) => k.status === "OK" && k.id !== sisteKjoring.id);
    const sidenTekst = forrigeOk
      ? `Forrige vellykkede kjøring var ${forrigeOk.createdAt.toLocaleDateString("nb-NO", NB_DATO)} — forslagene derfra står fortsatt i køen`
      : "Ingen vellykket kjøring i vinduet";
    feil = {
      naarTekst: `${sisteKjoring.createdAt.toLocaleString("nb-NO", NB_KORT)} etter ${fmtVarighet(sisteKjoring.duration)}`,
      sidenTekst,
      melding: sisteKjoring.error,
    };
  }

  const data: AgentDetaljData = {
    agentId,
    navn: konfig.navn,
    beskrivelse: konfig.beskrivelse,
    trigger: konfig.trigger,
    statusBadge: konfig.status,
    tilstand,
    agentDetaljHref: "/admin/agenticos",
    godkjenningerHref: "/admin/godkjenninger",
    feilloggHref: "/admin/audit-log",
    kpi: {
      kjoringer30d: kjoringerVindu.length,
      kjoringerSub: `${kjoringerOk} OK · ${kjoringerFeil} feil`,
      snittTidTekst: snittTidMs != null ? fmtVarighet(snittTidMs) : "—",
      forslagLaget,
      forslagSub: `${acceptedCount} godkjent · ${rejectedCount} avvist`,
    },
    kjoringer,
    kjoringerVindusTekst: "siste 30 dager",
    sisteSteg,
    forslag,
    panel: { godkjentRateTekst, godkjentSub, eldsteIKoTekst, eldsteSub },
    feil,
    manuell: erManuell ? { plans: planValg, players: playerValg, tournaments: tournamentValg } : null,
  };

  return (
    <V2Shell bredde="kolonne" aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminAgentDetaljV2 data={data} />
    </V2Shell>
  );
}
