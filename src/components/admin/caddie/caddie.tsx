/**
 * AgencyOS — Caddie / co-agent rammeverk (presentasjonell).
 * Pixel-port av [historisk fasit, fjernet 2026-07-03] _screens/ag-caddie.png
 * (kilde: [historisk fasit, fjernet 2026-07-03] agencyos/components-co-agent.html).
 *
 * Tre primitiver for AI-assistert coaching for coachen i AgencyOS:
 *   1. UTKAST → GODKJENNING — kildebruk + diff + tre-handlings-struktur
 *   2. AGENT-FORVALTNING     — fleet-tabell med status/modenhet/treffsikkerhet
 *   3. AUDIT-LOG             — agent og menneske likestilt i samme logg
 *
 * Rent presentasjonell og props-drevet — ingen Prisma/DB/auth. All interaktivitet
 * er bevisst statisk inntil logikk kobles på (fase 3). Bygget med DS-tokens (ingen
 * hardkodet hex) + lucide (ingen emoji).
 */

import Link from "next/link";
import {
  AlertOctagon,
  Bot,
  Calendar,
  CalendarSync,
  Check,
  Clock,
  FileText,
  GitCompare,
  GitPullRequest,
  Layers,
  Lightbulb,
  LineChart,
  Mail,
  MessageSquare,
  Search,
  Trophy,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuditOpenButton, DraftActions, FleetToggle } from "./_caddie-actions";

// ── Typer (lokale, presentasjonelle) ────────────────────────────
export type CaddieStatus = "live" | "draft" | "paused" | "review";

export type FleetIconKey =
  | "layers"
  | "mail"
  | "lightbulb"
  | "git-compare"
  | "message-square"
  | "alert-octagon"
  | "bot"
  | "calendar-sync"
  | "trophy"
  | "wand";

export type FleetIconTone = "primary" | "warn" | "info" | "muted" | "destructive";

export type CaddieFleetAgent = {
  id: string;
  name: string;
  /** Kort beskrivelse av hva agenten gjør. */
  role: string;
  icon: FleetIconKey;
  iconTone: FleetIconTone;
  status: CaddieStatus;
  /** 1–4, der 4 = autopilot. */
  maturity: number;
  maturityLabel: string;
  /** 0–100, eller null hvis for få kjøringer. */
  accuracy: number | null;
  accuracyN: number;
  accuracyTone: "ok" | "warn" | "bad";
  lastAction: React.ReactNode;
  lastWhen: string;
  runs7d: number;
  runsLabel: string;
  enabled: boolean;
};

export type CaddieDraftSource = {
  id: string;
  icon: "file-text" | "layers" | "line-chart" | "calendar";
  title: React.ReactNode;
  sub?: string;
  weight: number; // 0–100
};

export type CaddieDraftRow = {
  day: string;
  text: React.ReactNode;
  sub?: React.ReactNode;
};

export type CaddieDraft = {
  id: string;
  agentName: string;
  agentInitials: string;
  title: React.ReactNode;
  rationale: string;
  sources: CaddieDraftSource[];
  versionLabel: string;
  changeLabel: string;
  rows: CaddieDraftRow[];
  diffSummary: React.ReactNode;
  generatedLabel: string;
  dueLabel?: string;
  confidence: number | null; // 0–100
  confidenceNote: React.ReactNode;
} | null;

export type CaddieAuditActor = "agent" | "human";
export type CaddieAuditOutcome = "ok" | "appr" | "rej" | "skip" | "draft" | "routed";

export type CaddieAuditRow = {
  id: string;
  dayLabel: string;
  timeLabel: string;
  actor: CaddieAuditActor;
  actorName: string;
  actorMeta: string;
  what: React.ReactNode;
  outcome: CaddieAuditOutcome;
  outcomeLabel: string;
};

export type CaddieFleetSummary = {
  total: number;
  active: number;
  draft: number;
  avgAccuracy: number | null;
  runs7d: number;
};

export type CaddieProps = {
  coachFirstName: string;
  dateLabel: string;
  timeLabel: string;
  draft: CaddieDraft;
  fleet: CaddieFleetAgent[];
  fleetSummary: CaddieFleetSummary;
  audit: CaddieAuditRow[];
  /** Rute til full aktivitetslogg (default /admin/agencyos/caddie/aktivitet). */
  activityHref?: string;
};

// ── Ikon-/farge-oppslag ─────────────────────────────────────────
const sourceIcon: Record<CaddieDraftSource["icon"], LucideIcon> = {
  "file-text": FileText,
  layers: Layers,
  "line-chart": LineChart,
  calendar: Calendar,
};

const fleetIcon: Record<FleetIconKey, LucideIcon> = {
  layers: Layers,
  mail: Mail,
  lightbulb: Lightbulb,
  "git-compare": GitCompare,
  "message-square": MessageSquare,
  "alert-octagon": AlertOctagon,
  bot: Bot,
  "calendar-sync": CalendarSync,
  trophy: Trophy,
  wand: Wand2,
};

const fleetIconToneClass: Record<FleetIconTone, string> = {
  primary: "bg-primary text-primary-foreground",
  warn: "bg-warning/15 text-warning",
  info: "bg-info/10 text-info",
  muted: "bg-secondary text-muted-foreground",
  destructive: "bg-destructive/10 text-destructive",
};

const statusClass: Record<CaddieStatus, { wrap: string; dot: string; label: string }> = {
  live: { wrap: "bg-success/10 text-success", dot: "bg-success", label: "LIVE" },
  draft: { wrap: "bg-warning/15 text-warning", dot: "bg-warning", label: "UTKAST" },
  paused: { wrap: "bg-secondary text-muted-foreground", dot: "bg-muted-foreground", label: "PAUSE" },
  review: { wrap: "bg-info/10 text-info", dot: "bg-info", label: "EVAL" },
};

const accuracyFillClass: Record<CaddieFleetAgent["accuracyTone"], string> = {
  ok: "bg-success",
  warn: "bg-warning",
  bad: "bg-destructive",
};

const outcomeClass: Record<CaddieAuditOutcome, string> = {
  ok: "bg-success/10 text-success",
  appr: "bg-primary/10 text-primary",
  rej: "bg-destructive/10 text-destructive",
  skip: "bg-secondary text-muted-foreground",
  draft: "bg-warning/15 text-warning",
  routed: "bg-success/10 text-success",
};

// ── Felles section-header (mono-caps + linje) ───────────────────
function SectionHead({
  n,
  title,
  sub,
  badge,
}: {
  n: string;
  title: string;
  sub: string;
  badge: string;
}) {
  return (
    <div className="mb-3.5 mt-8 flex flex-wrap items-center gap-x-3 gap-y-1.5 first:mt-0">
      <span className="font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-foreground">
        {n} · {title}
      </span>
      <span className="font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
        {sub}
      </span>
      <span className="hidden h-px flex-1 bg-border sm:block" />
      <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] font-extrabold tracking-[0.06em] text-muted-foreground">
        {badge}
      </span>
    </div>
  );
}

/** Footer-regel under hvert panel — forklarer prinsippet. */
function FootRule({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-border bg-background px-5 py-3 font-mono text-[11px] leading-relaxed text-muted-foreground [&_b]:font-bold [&_b]:text-foreground">
      {children}
    </div>
  );
}

// ── SECTION 1 — UTKAST → GODKJENNING ────────────────────────────
function DraftPanel({ draft }: { draft: CaddieDraft }) {
  if (!draft) {
    return (
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <Check className="h-6 w-6" strokeWidth={1.5} aria-hidden />
          </span>
          <p className="mt-4 font-display text-lg font-bold tracking-[-0.01em] text-foreground">
            Ingen utkast venter
          </p>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Når en co-agent foreslår en endring, dukker den opp her med kildebruk, diff og tre valg:
            godkjenn, rediger eller avvis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr_280px]">
        {/* venstre — meta + kilder */}
        <div className="border-b border-border bg-background p-6 lg:border-b-0 lg:border-r">
          <div className="mb-2.5 flex items-center gap-2 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            <span className="h-[7px] w-[7px] rounded-full bg-accent shadow-[0_0_0_3px_hsl(var(--accent)/0.3)]" />
            UTKAST FRA <span className="text-foreground">{draft.agentName.toUpperCase()}</span>
          </div>
          <h3 className="mb-2 font-display text-xl font-bold leading-tight tracking-[-0.02em] text-foreground">
            {draft.title}
          </h3>
          <p className="text-[13px] leading-relaxed tracking-[-0.005em] text-muted-foreground">
            {draft.rationale}
          </p>

          {draft.sources.length > 0 && (
            <div className="mt-4 rounded-xl border border-border bg-card p-3.5">
              <div className="mb-2 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                BYGGET PÅ
              </div>
              {draft.sources.map((src, i) => {
                const SrcIcon = sourceIcon[src.icon];
                return (
                  <div
                    key={src.id}
                    className={cn(
                      "grid grid-cols-[22px_1fr_auto] items-center gap-2.5 py-1.5",
                      i < draft.sources.length - 1 && "border-b border-dashed border-border",
                    )}
                  >
                    <span className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-md bg-background text-primary">
                      <SrcIcon className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                    </span>
                    <div className="min-w-0 text-xs font-semibold leading-tight tracking-[-0.005em] text-foreground">
                      {src.title}
                      {src.sub && (
                        <span className="mt-px block font-mono text-[9px] font-bold tracking-[0.02em] text-muted-foreground">
                          {src.sub}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] font-extrabold tracking-[0.04em] text-primary tabular-nums">
                      {src.weight} %
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* midt — diff */}
        <div className="overflow-hidden border-b border-border p-6 lg:border-b-0">
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex gap-1">
              <span className="rounded-full bg-primary px-2 py-[3px] font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-primary-foreground">
                Diff-visning
              </span>
              <span className="rounded-full border border-border bg-background px-2 py-[3px] font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-muted-foreground">
                Bare ny
              </span>
              <span className="rounded-full border border-border bg-background px-2 py-[3px] font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-muted-foreground">
                Bare gammel
              </span>
            </span>
            <span className="ml-auto font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground [&_b]:font-extrabold [&_b]:text-foreground">
              {draft.versionLabel} · <b>{draft.changeLabel}</b>
            </span>
          </div>

          {draft.rows.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-border">
              {draft.rows.map((r, i) => (
                <div
                  key={i}
                  className={cn(
                    "grid grid-cols-[60px_1fr]",
                    i < draft.rows.length - 1 && "border-b border-border",
                  )}
                >
                  <span className="border-r border-border bg-background px-3 py-2.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
                    {r.day}
                  </span>
                  <span className="px-3 py-2.5 text-[13px] leading-snug text-foreground">
                    {r.text}
                    {r.sub && (
                      <span className="mt-0.5 block font-mono text-[10px] font-bold tracking-[0.02em] text-muted-foreground">
                        {r.sub}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-background px-4 py-8 text-center text-[13px] text-muted-foreground">
              Strukturert diff er ikke tilgjengelig for dette utkastet. Se sammendraget under.
            </div>
          )}

          <div className="mt-4 grid grid-cols-[22px_1fr] items-start gap-2.5 rounded-xl bg-background px-3.5 py-3">
            <GitPullRequest className="mt-0.5 h-4 w-4 text-primary" strokeWidth={1.5} aria-hidden />
            <div>
              <div className="mb-0.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary">
                DIFF · SAMMENDRAG
              </div>
              <div className="text-xs leading-relaxed text-foreground [&_b]:font-bold">
                {draft.diffSummary}
              </div>
            </div>
          </div>
        </div>

        {/* høyre — handlinger */}
        <div className="flex flex-col gap-3 border-border p-6 lg:border-l">
          <div className="flex items-center gap-2.5 rounded-xl bg-primary px-3 py-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent font-display text-xs font-bold text-accent-foreground">
              {draft.agentInitials}
            </span>
            <div className="font-mono text-[10px] font-extrabold uppercase leading-tight tracking-[0.10em] text-accent">
              FRA <span className="text-primary-foreground">{draft.agentName}</span>
              <span className="mt-px block font-mono text-[9px] font-bold tracking-[0.04em] text-primary-foreground/65">
                co-agent · alfa
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground [&_b]:font-extrabold [&_b]:text-foreground">
            <Clock className="h-3 w-3" strokeWidth={1.5} aria-hidden />
            Generert <b>{draft.generatedLabel}</b>
            {draft.dueLabel && (
              <>
                {" · "}forfaller <b>{draft.dueLabel}</b>
              </>
            )}
          </div>

          {draft.confidence != null && (
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-2 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                MODELL-KONFIDENS
              </div>
              <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${draft.confidence}%` }}
                />
              </div>
              <div className="flex items-baseline gap-1.5 font-mono text-[11px] font-bold tracking-[0.02em] text-foreground">
                <b className="text-lg font-extrabold tracking-[-0.02em] tabular-nums">
                  {draft.confidence} %
                </b>
                <span className="text-muted-foreground">· {draft.confidenceNote}</span>
              </div>
            </div>
          )}

          <DraftActions />
        </div>
      </div>

      <FootRule>
        <b>Prinsipp.</b> Tre-handlingsstruktur er hellig: <b>Godkjenn</b> (primær),{" "}
        <b>Rediger</b> (sekundær, åpner inline-edit), <b>Avvis</b> (tertiær, med valgfri grunn).
        Kildebruk er forklart med vekting — agenten viser arbeidet. Konfidens-score er aldri en
        knapp; den hjelper coachen velge hvor nøye diff-en må leses.
      </FootRule>
    </div>
  );
}

// ── SECTION 2 — AGENT-FORVALTNING ───────────────────────────────
function MaturityBars({ level }: { level: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={cn(
            "h-3.5 w-3 rounded-sm border-[1.5px]",
            i <= level ? "border-primary bg-primary" : "border-input",
          )}
        />
      ))}
    </span>
  );
}

function FleetPanel({
  fleet,
  summary,
}: {
  fleet: CaddieFleetAgent[];
  summary: CaddieFleetSummary;
}) {
  const summaryStats: { label: string; value: string; tone?: "live" | "draft" }[] = [
    { label: "TOTALT", value: String(summary.total) },
    { label: "AKTIVE", value: String(summary.active), tone: "live" },
    { label: "UTKAST", value: String(summary.draft), tone: "draft" },
    {
      label: "SNITT TREFF",
      value: summary.avgAccuracy != null ? `${summary.avgAccuracy} %` : "—",
    },
    { label: "KJØRT 7 D", value: String(summary.runs7d) },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-4 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="font-display text-lg font-bold tracking-[-0.02em] text-foreground">
          Co-agent fleet
        </div>
        <div className="flex flex-wrap gap-y-2">
          {summaryStats.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                "flex flex-col gap-0.5 px-4",
                i === 0 ? "pl-0" : "border-l border-border",
              )}
            >
              <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
                {s.label}
              </span>
              <span
                className={cn(
                  "font-mono text-xl font-extrabold tracking-[-0.02em] tabular-nums",
                  s.tone === "live"
                    ? "text-success"
                    : s.tone === "draft"
                      ? "text-warning"
                      : "text-foreground",
                )}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {fleet.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <Bot className="h-6 w-6" strokeWidth={1.5} aria-hidden />
          </span>
          <p className="mt-4 font-display text-base font-bold tracking-[-0.01em] text-foreground">
            Ingen agent-kjøringer registrert
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Forvaltnings-tabellen fylles automatisk så snart co-agentene begynner å kjøre.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] table-fixed border-collapse">
            <thead>
              <tr className="[&_th]:border-b [&_th]:border-border [&_th]:bg-background [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-left [&_th]:align-middle [&_th]:font-mono [&_th]:text-[9px] [&_th]:font-extrabold [&_th]:uppercase [&_th]:tracking-[0.12em] [&_th]:text-muted-foreground">
                <th className="w-[230px]">Agent</th>
                <th className="w-[110px]">Status</th>
                <th className="w-[120px]">Modenhet</th>
                <th className="w-[130px]">Treffsikkerhet</th>
                <th>Sist kjørt</th>
                <th className="w-[88px] text-center">Kjøringer / 7 d</th>
                <th className="w-[70px] text-center">Av/på</th>
              </tr>
            </thead>
            <tbody>
              {fleet.map((a) => {
                const Icon = fleetIcon[a.icon];
                const st = statusClass[a.status];
                return (
                  <tr
                    key={a.id}
                    className="align-middle transition-colors hover:bg-primary/[0.025] [&_td]:border-b [&_td]:border-border [&_td]:px-3 [&_td]:py-3 last:[&_td]:border-b-0"
                  >
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                            fleetIconToneClass[a.iconTone],
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                        </span>
                        <span className="flex min-w-0 flex-col leading-tight">
                          <span className="truncate text-[13px] font-bold text-foreground">
                            {a.name}
                          </span>
                          <span className="mt-px font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
                            {a.role}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded px-2 py-[3px] font-mono text-[10px] font-extrabold uppercase tracking-[0.10em]",
                          st.wrap,
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} />
                        {st.label}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <MaturityBars level={a.maturity} />
                        <span className="font-mono text-[10px] font-extrabold tracking-[0.04em] text-foreground">
                          {a.maturity}/4
                          <span className="block text-[8px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                            {a.maturityLabel}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex min-w-[100px] flex-col gap-1">
                        <div className="flex items-baseline justify-between font-mono text-[11px] font-extrabold tracking-[0.02em] text-foreground tabular-nums">
                          <span className={a.accuracy == null ? "text-muted-foreground" : undefined}>
                            {a.accuracy != null ? `${a.accuracy} %` : "—"}
                          </span>
                          <span className="text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
                            {a.accuracyN >= 5 ? `n=${a.accuracyN}` : `n=${a.accuracyN} · for lavt`}
                          </span>
                        </div>
                        <div className="h-[5px] overflow-hidden rounded-full bg-secondary">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              accuracyFillClass[a.accuracyTone],
                            )}
                            style={{ width: `${a.accuracy ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs leading-snug tracking-[-0.005em] text-foreground [&_b]:font-bold">
                        {a.lastAction}
                        <span className="mt-0.5 block font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
                          {a.lastWhen}
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="font-mono text-sm font-extrabold tracking-[-0.015em] text-foreground tabular-nums">
                        {a.runs7d}
                        <span className="block text-[8px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                          {a.runsLabel}
                        </span>
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center">
                        <FleetToggle initialOn={a.enabled} agentName={a.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <FootRule>
        <b>Prinsipp.</b> <b>4-trinns modenhet</b>: Skisse (1) → Forslag (2) → Utkast (3) → Autopilot
        (4). En agent kan ikke hoppe modenhet — den må kjøres på N-nivå med ≥ 80 % treff over ≥ 20
        kjøringer for å promoteres. Treff under 60 % eller for få kjøringer demper UI-en og blokkerer
        promotion.
      </FootRule>
    </div>
  );
}

// ── SECTION 3 — AUDIT-LOG ───────────────────────────────────────
function AuditPanel({ audit }: { audit: CaddieAuditRow[] }) {
  const filters = ["Alle", "Agent", "Menneske", "Avvist", "7 dager"];
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3.5 border-b border-border px-5 py-4 lg:flex-row lg:items-center">
        <div className="font-display text-lg font-bold tracking-[-0.02em] text-foreground">
          Audit · co-agent fleet
        </div>
        <div className="inline-flex flex-wrap gap-1.5 lg:ml-auto">
          {filters.map((f, i) => (
            <span
              key={f}
              className={cn(
                "inline-flex h-[26px] items-center gap-1.5 rounded-full px-2.5 font-mono text-[10px] font-bold tracking-[0.06em]",
                i === 0
                  ? "border border-primary bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground",
              )}
            >
              {f === "Agent" && <span className="h-[7px] w-[7px] rounded-full bg-accent" />}
              {f === "Menneske" && <span className="h-[7px] w-[7px] rounded-full bg-info" />}
              {f}
            </span>
          ))}
        </div>
        <div className="inline-flex h-7 min-w-[200px] items-center gap-1.5 rounded-full border border-border bg-card px-2.5 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
          <Search className="h-3 w-3" strokeWidth={1.5} aria-hidden />
          Søk i audit-log
          <span className="ml-auto rounded bg-secondary px-1.5 py-px text-[9px] font-bold text-foreground">
            /
          </span>
        </div>
      </div>

      {audit.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <FileText className="h-6 w-6" strokeWidth={1.5} aria-hidden />
          </span>
          <p className="mt-4 font-display text-base font-bold tracking-[-0.01em] text-foreground">
            Ingen hendelser ennå
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hver tolkning, hvert utkast, hver godkjenning og hver avvisning lander her — agent og
            menneske i samme logg.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid min-w-[640px] grid-cols-[90px_28px_minmax(200px,1fr)_minmax(220px,1.4fr)_100px_64px]">
            {/* header */}
            {["TID", "", "AKTØR", "HANDLING", "UTFALL", ""].map((h, i) => (
              <div
                key={i}
                className="border-b border-border bg-background px-3 py-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground"
              >
                {h}
              </div>
            ))}

            {audit.map((r) => (
              <AuditRowCells key={r.id} row={r} />
            ))}
          </div>
        </div>
      )}

      <FootRule>
        <b>Prinsipp.</b> Agent og menneske er likestilt i audit-loggen — samme rad-form, samme
        tids-presisjon, samme verktøy. <b>Avvist</b>-rader med menneske-feedback brukes som
        treningsdata for å forbedre agentens forslag. Hver rad har <b>åpne</b>-knapp som viser full
        hendelse: input, output, kildebruk og diff.
      </FootRule>
    </div>
  );
}

function AuditRowCells({ row }: { row: CaddieAuditRow }) {
  return (
    <>
      <div className="flex items-center border-b border-border px-3 py-3 font-mono text-[11px] font-bold tracking-[0.02em] text-muted-foreground tabular-nums">
        <span>
          {row.dayLabel}
          <br />
          <b className="font-extrabold text-foreground">{row.timeLabel}</b>
        </span>
      </div>
      <div className="flex items-center border-b border-border py-3 pl-3">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            row.actor === "agent"
              ? "bg-accent shadow-[0_0_0_2px_hsl(var(--accent)/0.3)]"
              : "bg-info",
          )}
        />
      </div>
      <div className="flex items-center border-b border-border px-3 py-3">
        <span className="text-[13px] font-semibold leading-tight text-foreground">
          {row.actorName}
          <span className="mt-0.5 block font-mono text-[9px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
            {row.actorMeta}
          </span>
        </span>
      </div>
      <div className="flex items-center border-b border-border px-3 py-3 text-[13px] leading-snug tracking-[-0.005em] text-foreground [&_b]:font-bold">
        <span>{row.what}</span>
      </div>
      <div className="flex items-center border-b border-border px-3 py-3">
        <span
          className={cn(
            "inline-block rounded px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em]",
            outcomeClass[row.outcome],
          )}
        >
          {row.outcomeLabel}
        </span>
      </div>
      <div className="flex items-center justify-center border-b border-border px-3 py-3">
        <AuditOpenButton label={`${row.actorName} · ${row.outcomeLabel} · ${row.dayLabel} ${row.timeLabel}`} />
      </div>
    </>
  );
}

// ── Hovedkomponent ──────────────────────────────────────────────
export function Caddie({
  coachFirstName,
  dateLabel,
  timeLabel,
  draft,
  fleet,
  fleetSummary,
  audit,
  activityHref = "/admin/agencyos/caddie/aktivitet",
}: CaddieProps) {
  return (
    <div className="mx-auto max-w-[1200px]">
      {/* header */}
      <div className="mb-6">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          AGENCYOS · CO-AGENT RAMMEVERK
        </span>
        <h1 className="mt-2 font-display text-[26px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground sm:text-[30px]">
          God dag, {coachFirstName} —{" "}
          <em className="font-normal italic text-primary">caddien</em> jobber for deg.
        </h1>
        <p className="mt-1.5 max-w-[800px] text-sm leading-relaxed text-muted-foreground">
          Tre primitiver for AI-assistert coaching: utkast-til-godkjenning med kildebruk og diff,
          forvaltning av agenter med modenhet og treffsikkerhet, og en audit-logg som likestiller
          agent og menneske. Hver utgående handling krever godkjenning — interne handlinger utføres
          direkte.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)]" />
            LIVE
          </span>
          {dateLabel} · {timeLabel}
        </div>
      </div>

      <SectionHead
        n="1"
        title="Utkast-til-godkjenning"
        sub="kildebruk · diff · godkjenn / rediger / avvis"
        badge="PLAN-JUSTERING"
      />
      <DraftPanel draft={draft} />

      <SectionHead
        n="2"
        title="Agent-forvaltning"
        sub="status · modenhet · treffsikkerhet · sist kjørt · av/på"
        badge={`${fleet.length} ${fleet.length === 1 ? "AGENT" : "AGENTER"}`}
      />
      <FleetPanel fleet={fleet} summary={fleetSummary} />

      <SectionHead
        n="3"
        title="Audit-log"
        sub="agent og menneske · samme logg · samme språk"
        badge={`SISTE ${audit.length} HENDELSER`}
      />
      <AuditPanel audit={audit} />

      {/* prinsipper-footer */}
      <div className="mt-7 space-y-2 rounded-xl bg-secondary px-5 py-4 font-mono text-xs leading-7 text-muted-foreground [&_b]:font-bold [&_b]:text-foreground">
        <p>
          <b>Fire primitiver, samme språk.</b> Kommandolinjen tolker. Utkastet forklarer.
          Forvaltningen evaluerer. Audit logger. Alle bruker samme tre-handlings-struktur (Godkjenn ·
          Rediger · Avvis) og samme kildebruk-vekting (0–100 %).
        </p>
        <p>
          <b>Interne vs utgående er ikke knapp-tekst — det er arkitektur.</b> Interne handlinger
          (navigasjon, åpne mal, filtrer) krever aldri godkjenning. Utgående (book, send, endre plan)
          krever alltid utkast. Skillet er hardkodet per handling, ikke per agent.
        </p>
        <p>
          <b>Modenhet er en kontrakt.</b> En agent under 80 % treff promoteres ikke til høyere nivå.
          Coachen kan overstyre, men blokkeringen er default. Slik forhindres at en alfa-agent får
          autopilot for tidlig.
        </p>
        <p>
          <b>Loggføres alltid — ingen unntak.</b> Hver tolkning, hvert utkast, hver godkjenning og
          hver avvisning lander i audit. Slik viser vi foreldre, regulatorer og oss selv hva systemet
          faktisk gjør.
        </p>
      </div>

      <p className="mt-4 text-center font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
        ⌘K-kommandolinjen er tilgjengelig globalt ·{" "}
        <Link
          href={activityHref}
          className="text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          se full aktivitetslogg
        </Link>
      </p>
    </div>
  );
}
