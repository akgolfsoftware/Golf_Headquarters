/**
 * Data-loader for AgencyOS Caddie / co-agent (/admin/caddie).
 * Pixel-port av public/design-handover/agencyos/components-co-agent.html.
 *
 * Tre primitiver med ekte Prisma-data:
 *   1. Utkast-til-godkjenning  — siste PENDING `planAction` (med kildebruk + diff)
 *   2. Agent-forvaltning        — `agentRun` aggregert per agent (modenhet/treff)
 *   3. Audit-log                — `auditLog` + agent-kjøringer + utkast, samme språk
 *
 * Ingen falske tall: tomme tabeller → tomme/utledede tilstander. Modenhet og
 * treffsikkerhet utledes fra faktisk kjørings-historikk (status OK/ERROR, antall).
 */

import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ── Typer ───────────────────────────────────────────────────────
export type CoAgentStatus = "live" | "draft" | "paused" | "review";

export type FleetAgent = {
  id: string;
  name: string;
  /** Kort beskrivelse av hva agenten gjør (utledet fra navn). */
  role: string;
  icon: "layers" | "mail" | "lightbulb" | "git-compare" | "message-square" | "alert-octagon" | "bot";
  iconTone: "primary" | "warn" | "info" | "muted" | "destructive";
  status: CoAgentStatus;
  /** 1–4, der 4 = autopilot. */
  maturity: number;
  maturityLabel: string;
  /** 0–100, eller null hvis for få kjøringer. */
  accuracy: number | null;
  accuracyN: number;
  accuracyTone: "ok" | "warn" | "bad";
  /** Best-effort beskrivelse av siste handling. */
  lastAction: React.ReactNode;
  lastWhen: string;
  runs7d: number;
  runsLabel: string;
  enabled: boolean;
};

export type DraftSource = {
  id: string;
  icon: "file-text" | "layers" | "line-chart" | "calendar";
  title: string;
  sub: string;
  weight: number; // 0–100
};

export type DraftRow = {
  /** Tekstinnhold per dag i plan-utdraget. */
  day: string;
  text: React.ReactNode;
  sub?: React.ReactNode;
  changed?: boolean;
};

export type CoAgentDraft = {
  id: string;
  agentName: string;
  agentInitials: string;
  title: React.ReactNode;
  rationale: string;
  sources: DraftSource[];
  versionLabel: string;
  changeLabel: string;
  rows: DraftRow[];
  diffSummary: React.ReactNode;
  generatedLabel: string;
  dueLabel?: string;
  confidence: number | null; // 0–100
  confidenceNote: React.ReactNode;
} | null;

export type AuditActor = "agent" | "human";
export type AuditOutcome = "ok" | "appr" | "rej" | "skip" | "draft" | "routed";

export type AuditRow = {
  id: string;
  dayLabel: string;
  timeLabel: string;
  actor: AuditActor;
  actorName: string;
  actorMeta: string;
  what: React.ReactNode;
  outcome: AuditOutcome;
  outcomeLabel: string;
};

export type FleetSummary = {
  total: number;
  active: number;
  draft: number;
  avgAccuracy: number | null;
  runs7d: number;
};

export type CoAgentProps = {
  coachFirstName: string;
  dateLabel: string;
  timeLabel: string;
  draft: CoAgentDraft;
  fleet: FleetAgent[];
  fleetSummary: FleetSummary;
  audit: AuditRow[];
};

// ── Hjelpere ────────────────────────────────────────────────────
const DAGER = ["SØNDAG", "MANDAG", "TIRSDAG", "ONSDAG", "TORSDAG", "FREDAG", "LØRDAG"];
const MND = [
  "JANUAR", "FEBRUAR", "MARS", "APRIL", "MAI", "JUNI",
  "JULI", "AUGUST", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER",
];

function initials(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function firstName(name: string | null | undefined): string {
  return name?.trim().split(/\s+/)[0] ?? "Coach";
}

function hhmm(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

/** Relativ dag-etikett for audit/tabeller — «I dag», «I går», «N d siden», ev. ukedag. */
function dayLabel(d: Date, now: Date): string {
  const a = new Date(d);
  a.setHours(0, 0, 0, 0);
  const b = new Date(now);
  b.setHours(0, 0, 0, 0);
  const diff = Math.round((b.getTime() - a.getTime()) / 86_400_000);
  if (diff <= 0) return "I dag";
  if (diff === 1) return "I går";
  if (diff < 7) return d.toLocaleDateString("nb-NO", { weekday: "short" });
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

/** Kompakt «for N siden»-etikett til siste-kjørt / generert-felt. */
function agoLabel(d: Date, now: Date): string {
  const min = Math.max(0, Math.round((now.getTime() - d.getTime()) / 60_000));
  if (min < 1) return "nå nettopp";
  if (min < 60) return `${min} min siden`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} t siden`;
  const dd = Math.round(h / 24);
  return `${dd} d siden`;
}

/** Pene navn + ikon/rolle ut fra agent-nøkkel. Ukjente agenter får generisk bot. */
function agentMeta(name: string): {
  label: string;
  role: string;
  icon: FleetAgent["icon"];
  iconTone: FleetAgent["iconTone"];
} {
  const t = name.toLowerCase();
  if (/plan|copilot|juster/.test(t))
    return { label: "Plan-copilot", role: "plan-justering · diff", icon: "layers", iconTone: "primary" };
  if (/innboks|inbox|brief|summary|prioritet/.test(t))
    return { label: "Innboks-summary", role: "daglig brief · prioritet", icon: "mail", iconTone: "primary" };
  if (/innsikt|insight|rapport|narrativ|sg/.test(t))
    return { label: "Innsiktskort-bygger", role: "SG-narrativ · ukerapport", icon: "lightbulb", iconTone: "warn" };
  if (/gap|drill|morad|svakhet/.test(t))
    return { label: "Gap-til-drill", role: "SG-svakhet → drill", icon: "git-compare", iconTone: "info" };
  if (/foreldre|parent|melding|gruppe/.test(t))
    return { label: "Foreldre-meldinger", role: "gruppemail · varsel", icon: "message-square", iconTone: "muted" };
  if (/skade|injur|radar|volum/.test(t))
    return { label: "Skader-radar", role: "volum-spike · advarsel", icon: "alert-octagon", iconTone: "destructive" };
  return { label: name, role: "co-agent", icon: "bot", iconTone: "primary" };
}

const MATURITY_LABELS = ["SKISSE", "FORSLAG", "UTKAST", "AUTOPILOT"];

/** Modenhet (1–4) fra status + treff + volum. Kontrakt: ingen promotion < 80 %. */
function deriveMaturity(status: CoAgentStatus, accuracy: number | null, n: number): number {
  if (status === "draft") return 1;
  if (accuracy == null || n < 5) return Math.min(2, status === "live" ? 2 : 1);
  if (status === "live" && accuracy >= 80 && n >= 20) return n >= 50 && accuracy >= 90 ? 4 : 3;
  if (accuracy >= 80) return 3;
  return 2;
}

function accuracyTone(accuracy: number | null): FleetAgent["accuracyTone"] {
  if (accuracy == null) return "warn";
  if (accuracy >= 80) return "ok";
  if (accuracy >= 60) return "warn";
  return "bad";
}

// Zod-skjema for å lese `planAction.suggestion`-bloben trygt (CLAUDE.md-regel:
// JSON-felter fra Prisma valideres, ikke `as unknown as`).
const suggestionSchema = z
  .object({
    summary: z.string().optional(),
    title: z.string().optional(),
    fromVersion: z.string().optional(),
    toVersion: z.string().optional(),
    confidence: z.number().optional(),
    note: z.string().optional(),
    sources: z
      .array(
        z.object({
          title: z.string().optional(),
          sub: z.string().optional(),
          weight: z.number().optional(),
        }),
      )
      .optional(),
    rows: z
      .array(
        z.object({
          day: z.string().optional(),
          text: z.string().optional(),
          sub: z.string().optional(),
          changed: z.boolean().optional(),
        }),
      )
      .optional(),
  })
  .passthrough();

const ACTION_TYPE_LABEL: Record<string, string> = {
  PYRAMID_ADJUST: "Pyramide-justering",
  SESSION_ADD: "Legg til økt",
  SESSION_REMOVE: "Fjern økt",
  INTENSITY_ADJUST: "Intensitets-justering",
  TAPER_ENGAGE: "Taper-fase",
  WITHDRAW: "Trekk fra plan",
  DRILL_SUGGEST: "Drill-forslag",
  TEST_SCHEDULE: "Planlegg test",
  PEER_COMPARE: "Peer-sammenligning",
  RECOVERY_ADD: "Legg til restitusjon",
};

const SOURCE_ICONS: DraftSource["icon"][] = ["file-text", "layers", "line-chart", "calendar"];

// ── Hoved-loader ────────────────────────────────────────────────
export async function loadCoAgent(coach: {
  id: string;
  name: string | null;
}): Promise<CoAgentProps> {
  const now = new Date();
  const sepDager = new Date(now);
  sepDager.setDate(sepDager.getDate() - 7);
  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() - 30);

  const [
    pendingActions,
    runs7d,
    runs30d,
    auditLogs,
    recentActions,
  ] = await Promise.all([
    prisma.planAction.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 1,
      include: { user: { select: { name: true } } },
    }),
    prisma.agentRun.findMany({
      where: { createdAt: { gte: sepDager } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.agentRun.findMany({
      where: { createdAt: { gte: tretti } },
      select: { agentName: true, status: true },
    }),
    prisma.auditLog.findMany({
      where: { createdAt: { gte: tretti } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: { select: { name: true, role: true } } },
    }),
    prisma.planAction.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true } } },
    }),
  ]);

  // ── 1) UTKAST → GODKJENNING ─────────────────────────────
  let draft: CoAgentDraft = null;
  const pa = pendingActions[0];
  if (pa) {
    const parsed = suggestionSchema.safeParse(pa.suggestion);
    const s = parsed.success ? parsed.data : {};
    const meta = agentMeta(pa.agentName);
    const playerName = pa.user?.name ?? "spiller";
    const typeLabel = ACTION_TYPE_LABEL[pa.actionType] ?? pa.actionType;

    const sources: DraftSource[] = (s.sources ?? []).slice(0, 4).map((src, i) => ({
      id: `src-${i}`,
      icon: SOURCE_ICONS[i % SOURCE_ICONS.length],
      title: src.title ?? "Kilde",
      sub: src.sub ?? "",
      weight: typeof src.weight === "number" ? Math.round(src.weight) : 0,
    }));

    const rows: DraftRow[] = (s.rows ?? []).map((r, i) => ({
      day: r.day ?? `#${i + 1}`,
      text: r.text ?? "",
      sub: r.sub,
      changed: Boolean(r.changed),
    }));

    const conf =
      typeof s.confidence === "number"
        ? Math.round(s.confidence <= 1 ? s.confidence * 100 : s.confidence)
        : null;

    draft = {
      id: pa.id,
      agentName: meta.label,
      agentInitials: initials(meta.label),
      title: (
        <>
          {typeLabel} for <em className="font-normal italic text-primary">{firstName(playerName)}</em>
        </>
      ),
      rationale: s.summary ?? `Foreslått av ${meta.label}. Krever godkjenning før den sendes.`,
      sources,
      versionLabel:
        s.fromVersion && s.toVersion ? `${s.fromVersion} → ${s.toVersion}` : "Nytt utkast",
      changeLabel: rows.filter((r) => r.changed).length
        ? `ENDRING ${rows.filter((r) => r.changed).length} ØKT`
        : typeLabel.toUpperCase(),
      rows,
      diffSummary: s.summary ? (
        <>{s.summary}</>
      ) : (
        <>
          {typeLabel} for <b className="font-bold">{playerName}</b> · <b className="font-bold">plan-mål uendret</b>.
        </>
      ),
      generatedLabel: agoLabel(pa.createdAt, now),
      confidence: conf,
      confidenceNote: parsed.success ? (
        <>konsistent med agentens forslags-mal</>
      ) : (
        <>kildebruk ikke strukturert — les diff nøye</>
      ),
    };
  }

  // ── 2) AGENT-FORVALTNING ────────────────────────────────
  // Aggreger kjøringer per agent fra siste 7 d (volum/siste) + 30 d (treff).
  type Agg = {
    runs7d: number;
    last?: { createdAt: Date; status: string; output: unknown; userId: string | null };
  };
  const byAgent = new Map<string, Agg>();
  for (const r of runs7d) {
    const a = byAgent.get(r.agentName) ?? { runs7d: 0 };
    a.runs7d += 1;
    if (!a.last) a.last = { createdAt: r.createdAt, status: r.status, output: r.output, userId: r.userId };
    byAgent.set(r.agentName, a);
  }
  // Treffsikkerhet (30 d): andel OK-kjøringer per agent.
  const acc30 = new Map<string, { ok: number; n: number }>();
  for (const r of runs30d) {
    const a = acc30.get(r.agentName) ?? { ok: 0, n: 0 };
    a.n += 1;
    if (r.status === "OK") a.ok += 1;
    acc30.set(r.agentName, a);
  }

  const fleet: FleetAgent[] = [...byAgent.entries()]
    .map(([name, agg]) => {
      const meta = agentMeta(name);
      const accData = acc30.get(name) ?? { ok: 0, n: 0 };
      const accuracy = accData.n >= 5 ? Math.round((accData.ok / accData.n) * 100) : null;
      const lastErr = agg.last?.status === "ERROR";
      const status: CoAgentStatus = lastErr ? "review" : agg.runs7d > 0 ? "live" : "paused";
      const maturity = deriveMaturity(status, accuracy, accData.n);
      return {
        id: name,
        name: meta.label,
        role: meta.role,
        icon: meta.icon,
        iconTone: meta.iconTone,
        status,
        maturity,
        maturityLabel: MATURITY_LABELS[maturity - 1],
        accuracy,
        accuracyN: accData.n,
        accuracyTone: accuracyTone(accuracy),
        lastAction: agg.last ? (
          <>
            {agg.last.status === "OK" ? "Kjørte uten feil" : "Siste kjøring feilet"}
          </>
        ) : (
          <>Ingen kjøringer ennå</>
        ),
        lastWhen: agg.last ? agoLabel(agg.last.createdAt, now).toUpperCase() : "—",
        runs7d: agg.runs7d,
        runsLabel: "SISTE 7D",
        enabled: status === "live",
      } satisfies FleetAgent;
    })
    .sort((a, b) => b.runs7d - a.runs7d);

  const activeCount = fleet.filter((a) => a.status === "live").length;
  const draftCount = fleet.filter((a) => a.status === "draft" || a.maturity === 1).length;
  const accVals = fleet.map((a) => a.accuracy).filter((v): v is number => v != null);
  const fleetSummary: FleetSummary = {
    total: fleet.length,
    active: activeCount,
    draft: draftCount,
    avgAccuracy: accVals.length ? Math.round(accVals.reduce((s, v) => s + v, 0) / accVals.length) : null,
    runs7d: runs7d.length,
  };

  // ── 3) AUDIT-LOG (agent + menneske, samme log) ──────────
  type RawAudit = { ts: number; row: AuditRow };
  const rawAudit: RawAudit[] = [];

  for (const l of auditLogs) {
    const isAgent = l.actorId == null;
    const actorName = isAgent ? agentMeta(l.action).label : l.actor?.name ?? "Bruker";
    const roleLabel = isAgent
      ? "AGENT"
      : `MENNESKE${l.actor?.role ? ` · ${l.actor.role}` : ""}`;
    const outcome = outcomeFromAction(l.action);
    rawAudit.push({
      ts: l.createdAt.getTime(),
      row: {
        id: `audit-${l.id}`,
        dayLabel: dayLabel(l.createdAt, now),
        timeLabel: hhmm(l.createdAt),
        actor: isAgent ? "agent" : "human",
        actorName,
        actorMeta: roleLabel,
        what: (
          <>
            {humanizeAction(l.action)}
            {l.target ? <span className="font-bold"> {l.target}</span> : null}
          </>
        ),
        outcome: outcome.tone,
        outcomeLabel: outcome.label,
      },
    });
  }

  // Suppler med agent-kjøringer og utkast så loggen ikke er tom selv om
  // auditLog er sparsom (samme rad-form for agent og menneske).
  for (const r of runs7d.slice(0, 8)) {
    const meta = agentMeta(r.agentName);
    rawAudit.push({
      ts: r.createdAt.getTime(),
      row: {
        id: `run-${r.id}`,
        dayLabel: dayLabel(r.createdAt, now),
        timeLabel: hhmm(r.createdAt),
        actor: "agent",
        actorName: meta.label,
        actorMeta: "AGENT · KJØRING",
        what: <>{r.status === "OK" ? "Fullførte kjøring" : "Kjøring feilet"}</>,
        outcome: r.status === "OK" ? "ok" : "rej",
        outcomeLabel: r.status === "OK" ? "UTFØRT" : "FEIL",
      },
    });
  }
  for (const a of recentActions.slice(0, 4)) {
    const meta = agentMeta(a.agentName);
    const tone: AuditOutcome =
      a.status === "ACCEPTED" ? "appr" : a.status === "REJECTED" ? "rej" : "draft";
    const label = a.status === "ACCEPTED" ? "GODKJENT" : a.status === "REJECTED" ? "AVVIST" : "UTKAST";
    rawAudit.push({
      ts: a.createdAt.getTime(),
      row: {
        id: `pa-${a.id}`,
        dayLabel: dayLabel(a.createdAt, now),
        timeLabel: hhmm(a.createdAt),
        actor: "agent",
        actorName: meta.label,
        actorMeta: "AGENT · UTKAST",
        what: (
          <>
            Foreslo {(ACTION_TYPE_LABEL[a.actionType] ?? a.actionType).toLowerCase()} for{" "}
            <span className="font-bold">{a.user?.name ?? "spiller"}</span>
          </>
        ),
        outcome: tone,
        outcomeLabel: label,
      },
    });
  }

  // Dedup på id + sorter nyeste først, behold maks 8.
  const seen = new Set<string>();
  const audit = rawAudit
    .sort((a, b) => b.ts - a.ts)
    .filter((r) => (seen.has(r.row.id) ? false : (seen.add(r.row.id), true)))
    .slice(0, 8)
    .map((r) => r.row);

  return {
    coachFirstName: firstName(coach.name),
    dateLabel: `${DAGER[now.getDay()]} ${now.getDate()} ${MND[now.getMonth()]}`,
    timeLabel: hhmm(now),
    draft,
    fleet,
    fleetSummary,
    audit,
  };
}

/** Map en audit-action-streng til utfall-pille (best-effort). */
function outcomeFromAction(action: string): { tone: AuditOutcome; label: string } {
  const t = action.toLowerCase();
  if (/(approve|godkjen|accept)/.test(t)) return { tone: "appr", label: "GODKJENT" };
  if (/(reject|avvis|deny)/.test(t)) return { tone: "rej", label: "AVVIST" };
  if (/(pause|stop|disable)/.test(t)) return { tone: "skip", label: "PAUSET" };
  if (/(draft|utkast|suggest|foreslo)/.test(t)) return { tone: "draft", label: "UTKAST" };
  if (/(route|⌘k|command|kommando)/.test(t)) return { tone: "routed", label: "ROUTET" };
  return { tone: "ok", label: "UTFØRT" };
}

/** Gjør en maskin-action lesbar i audit-loggen. */
function humanizeAction(action: string): string {
  const map: Record<string, string> = {
    "plan.approve": "Godkjente plan-justering",
    "plan.reject": "Avviste plan-justering",
    "agent.pause": "Pauset agent",
    "agent.resume": "Gjenopptok agent",
    "draft.create": "Opprettet utkast",
  };
  if (map[action]) return map[action];
  // Fallback: «omraade.handling» → «Handling (omraade)»
  return action
    .replace(/[._]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}
