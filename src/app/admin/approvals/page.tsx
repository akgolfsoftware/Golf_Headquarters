/**
 * CoachHQ — Godkjenninger (agent-inbox)
 * Design migrert fra wireframe/design-files-v2/final/03-godkjenninger.html.
 *
 * Inbox-style: hver rad har severity-pill, spiller-avatar+navn, action-celle
 * med agent-ikon, tidsstempel og handlinger (Aksepter/Avslå/Detaljer).
 */

import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ApprovalActions } from "./approval-actions";

const ACTION_LABEL: Record<string, string> = {
  PYRAMID_ADJUST: "Juster pyramide",
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

type Severity = "urg" | "warn" | "info";

// Mapper actionType → severity-nivå for visning.
function severityFor(actionType: string): Severity {
  if (
    actionType === "WITHDRAW" ||
    actionType.includes("ESCALATION") ||
    actionType === "TAPER_ENGAGE"
  ) {
    return "urg";
  }
  if (
    actionType === "INTENSITY_ADJUST" ||
    actionType === "PYRAMID_ADJUST" ||
    actionType === "RECOVERY_ADD" ||
    actionType === "DELOAD"
  ) {
    return "warn";
  }
  return "info";
}

export default async function Approvals() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const actions = await prisma.planAction.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { id: true, name: true } },
      plan: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalCount = actions.length;
  const urgCount = actions.filter(
    (a) => severityFor(a.actionType) === "urg",
  ).length;
  const warnCount = actions.filter(
    (a) => severityFor(a.actionType) === "warn",
  ).length;
  const infoCount = actions.filter(
    (a) => severityFor(a.actionType) === "info",
  ).length;

  // Statistikk siste 7 dager
  const enUkeSiden = new Date();
  enUkeSiden.setDate(enUkeSiden.getDate() - 7);
  const [godkjent7d, avslatt7d] = await Promise.all([
    prisma.planAction.count({
      where: { status: "ACCEPTED", updatedAt: { gte: enUkeSiden } },
    }),
    prisma.planAction.count({
      where: { status: "REJECTED", updatedAt: { gte: enUkeSiden } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · /admin/approvals"
        titleLead={String(totalCount)}
        titleItalic="venter"
        sub={`${urgCount} urgent · ${warnCount} warning · ${infoCount} info`}
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Send agent-feedback →
          </button>
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <KpiAccent label="Venter" value={String(totalCount)}>
          <div className="mt-2 flex flex-wrap gap-2 font-mono text-[10px] text-background/70">
            <SevDot tone="danger" label={`${urgCount} urg`} />
            <SevDot tone="warn" label={`${warnCount} warn`} />
            <SevDot tone="info" label={`${infoCount} info`} />
          </div>
        </KpiAccent>
        <Kpi
          label="Godkjent 7d"
          value={String(godkjent7d)}
          sub={godkjent7d > 0 ? "Bekreftede forslag" : "—"}
        />
        <Kpi
          label="Avslått 7d"
          value={String(avslatt7d)}
          sub={avslatt7d > 0 ? "Se feedback til agenter" : "—"}
        />
        <Kpi
          label="Snitt responstid"
          value="—"
          unit=""
          sub="Krever historikk-logging"
        />
      </div>

      {/* Filter */}
      <form className="flex flex-wrap items-center gap-2">
        <label className="flex flex-1 min-w-[280px] items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground">
          <Search size={14} strokeWidth={1.75} />
          <input
            type="search"
            name="q"
            placeholder="Søk spiller eller action"
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </label>
        <FilterChip label="Severity" />
        <FilterChip label="Agent" />
        <FilterChip label="Sort: Severity" />
      </form>

      {/* Inbox */}
      {actions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card px-8 py-20 text-center">
          <div className="grid h-24 w-24 place-items-center rounded-[28px] bg-accent/30 text-foreground">
            <CheckCircle2 size={48} strokeWidth={1.75} />
          </div>
          <h3 className="font-display text-3xl font-normal italic">
            Alt godkjent.{" "}
            <em className="font-semibold not-italic text-primary">Bra jobba.</em>
          </h3>
          <p className="font-mono text-[12px] text-muted-foreground">
            {godkjent7d > 0 || avslatt7d > 0
              ? `${godkjent7d} godkjent · ${avslatt7d} avslått siste 7 dager`
              : "Forslag kommer typisk etter mandag-cron eller etter ny aktivitet."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          {actions.map((a) => {
            const sev = severityFor(a.actionType);
            const sugg = a.suggestion as { forklaring?: string } | null;
            const forklaring = sugg?.forklaring;
            return (
              <div
                key={a.id}
                className="grid items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0 hover:bg-secondary/40 md:grid-cols-[110px_220px_1fr_140px_280px]"
              >
                <SevPill severity={sev} />
                <Link
                  href={`/admin/elever/${a.user.id}`}
                  className="flex items-center gap-2.5 hover:text-primary"
                >
                  <div
                    className="grid h-8 w-8 place-items-center rounded-full font-mono text-[10px] font-semibold text-white"
                    style={{ background: avatarBg(a.user.name) }}
                  >
                    {initials(a.user.name)}
                  </div>
                  <div className="text-[13px] font-medium text-foreground">
                    {a.user.name}
                  </div>
                </Link>
                <div className="flex items-start gap-2">
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-secondary text-primary">
                    <ActionIcon actionType={a.actionType} />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[13px] text-foreground truncate">
                      {forklaring ?? (ACTION_LABEL[a.actionType] ?? a.actionType)}
                    </span>
                    <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                      {a.agentName}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 font-mono text-[11px] text-muted-foreground">
                  <span>{ACTION_LABEL[a.actionType] ?? a.actionType}</span>
                  <span>{formatSiden(a.createdAt)}</span>
                  {a.plan && (
                    <Link
                      href={`/admin/plans/${a.plan.id}`}
                      className="truncate hover:text-foreground"
                    >
                      → {a.plan.name}
                    </Link>
                  )}
                </div>
                <div className="flex justify-end">
                  <ApprovalActions actionId={a.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ----------------- Komponenter -----------------

function SevPill({ severity }: { severity: Severity }) {
  const styles: Record<Severity, { bg: string; dot: string; label: string }> = {
    urg: {
      bg: "bg-destructive/15 text-destructive",
      dot: "bg-destructive",
      label: "Urgent",
    },
    warn: {
      bg: "bg-accent/30 text-accent-foreground",
      dot: "bg-accent",
      label: "Warning",
    },
    info: {
      bg: "bg-secondary text-muted-foreground",
      dot: "bg-muted-foreground",
      label: "Info",
    },
  };
  const s = styles[severity];
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${s.bg}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function SevDot({
  tone,
  label,
}: {
  tone: "danger" | "warn" | "info";
  label: string;
}) {
  const dotClass =
    tone === "danger"
      ? "bg-destructive"
      : tone === "warn"
        ? "bg-accent"
        : "bg-muted-foreground";
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}

function ActionIcon({ actionType }: { actionType: string }) {
  const sev = severityFor(actionType);
  if (sev === "urg") return <AlertTriangle size={13} strokeWidth={1.75} />;
  if (sev === "warn") return <BarChart3 size={13} strokeWidth={1.75} />;
  return <Clock size={13} strokeWidth={1.75} />;
}

function KpiAccent({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-foreground to-foreground/90 p-4 text-white">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent/70">
        {label}
      </div>
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums">
        {value}
      </div>
      {children}
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
        {value}
        {unit && (
          <span className="ml-1 text-[13px] font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] text-muted-foreground">
      {label}
    </span>
  );
}

// ----------------- Helpers -----------------

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Bevisst dekorativ palett — deterministisk avatar-gradient per navn-hash.
// TODO: konsolider farge — vurder å flytte til src/lib/avatar-colors.ts som delt utility.
function avatarBg(name: string): string {
  const palette = [
    "linear-gradient(135deg,#005840,#1A7D56)",
    "linear-gradient(135deg,#A6651E,#7A4910)",
    "linear-gradient(135deg,#7A998C,#56796D)",
    "linear-gradient(135deg,#A32D2D,#7C2020)",
    "linear-gradient(135deg,#3b5994,#5b7cb8)",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return palette[h % palette.length];
}

function formatSiden(d: Date): string {
  const ms = Date.now() - d.getTime();
  const min = Math.floor(ms / 60000);
  if (min < 60) return `for ${min} min siden`;
  const t = Math.floor(min / 60);
  if (t < 24) return `for ${t}t siden`;
  const dgr = Math.floor(t / 24);
  if (dgr === 1) return "i går";
  if (dgr < 7) return `for ${dgr} d siden`;
  const uker = Math.floor(dgr / 7);
  return `for ${uker} uker siden`;
}
