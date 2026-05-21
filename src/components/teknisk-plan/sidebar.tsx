import type { ReactNode } from "react";
import { Target, MessageSquare } from "lucide-react";

interface SideCardProps {
  title: string;
  count?: string;
  children: ReactNode;
  className?: string;
}

export function SideCard({ title, count, children, className }: SideCardProps) {
  return (
    <div className={`tp-side-card ${className ?? ""}`.trim()}>
      <div className="head">
        <h3>{title}</h3>
        {count ? <span className="count">{count}</span> : null}
      </div>
      <div className="body">{children}</div>
    </div>
  );
}

interface PlanSummaryProps {
  status: string;
  progressPct: number;
  repsCurrent: number;
  repsTarget: number;
  activePCount: number;
  activePTotal: number;
  taskCount: number;
  taskNewCount: number;
  repsThisWeek: number;
  estimertFerdig?: string;
}

export function PlanSummaryCard(props: PlanSummaryProps) {
  return (
    <SideCard title="Plan-sammendrag" count={props.status}>
      <div className="tp-summary-stat">
        <span className="k">Total fremdrift</span>
        <span className="v accent">{props.progressPct} %</span>
      </div>
      <div className="tp-summary-progress">
        <div style={{ width: `${props.progressPct}%` }} />
      </div>
      <div className="tp-summary-meta">
        <strong>{props.repsCurrent.toLocaleString("nb-NO")}</strong> av{" "}
        <strong>{props.repsTarget.toLocaleString("nb-NO")}</strong> reps logget · siste 14 dager
      </div>

      <div className="tp-summary-stat" style={{ marginTop: 10 }}>
        <span className="k">Aktive P-er</span>
        <span className="v">{props.activePCount} av {props.activePTotal}</span>
      </div>
      <div className="tp-summary-stat">
        <span className="k">Oppgaver</span>
        <span className="v">
          {props.taskCount}{props.taskNewCount ? ` + ${props.taskNewCount} ny` : ""}
        </span>
      </div>
      <div className="tp-summary-stat">
        <span className="k">Reps denne uka</span>
        <span className="v">{props.repsThisWeek.toLocaleString("nb-NO")}</span>
      </div>
      {props.estimertFerdig ? (
        <div className="tp-summary-stat">
          <span className="k">Estimert ferdig</span>
          <span className="v">{props.estimertFerdig}</span>
        </div>
      ) : null}
    </SideCard>
  );
}

export interface ClubTargetRow {
  club: string;
  target: ReactNode;
  status: "OK" | "PATH" | "TODO";
}

interface TrackmanCardProps {
  rows: ClubTargetRow[];
}

export function TrackmanGoalsCard({ rows }: TrackmanCardProps) {
  const ok = rows.filter((r) => r.status !== "TODO").length;
  return (
    <SideCard title="TrackMan-mål per kølle" count={`${ok} / ${rows.length} PÅ VEI`}>
      {rows.map((r, i) => (
        <div key={i} className="tp-club-row">
          <span className="ic" aria-hidden>
            <Target size={12} />
          </span>
          <div className="info">
            <span className="nm">{r.club}</span>
            <span className="target">{r.target}</span>
          </div>
          <span className={`tp-status ${statusClass(r.status)}`}>
            <span className="dot" />
            {statusLabel(r.status)}
          </span>
        </div>
      ))}
    </SideCard>
  );
}

function statusClass(s: ClubTargetRow["status"]) {
  return s === "OK" ? "ok" : s === "PATH" ? "path" : "todo";
}
function statusLabel(s: ClubTargetRow["status"]) {
  return s === "OK" ? "Oppnådd" : s === "PATH" ? "På vei" : "Ikke begynt";
}

interface PyramideRow {
  area: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  pct: number;
}

export function PyramideCard({ rows }: { rows: PyramideRow[] }) {
  return (
    <SideCard title="Pyramide-fordeling" count="VOLUM SISTE 30D">
      <div className="tp-pyr-grid">
        {rows.map((r) => (
          <div key={r.area} className={`tp-pyr-row ${r.area.toLowerCase()}`}>
            <span className="nm">{r.area}</span>
            <div className="bar"><div style={{ width: `${r.pct}%` }} /></div>
            <span className="pct">{r.pct} %</span>
          </div>
        ))}
      </div>
    </SideCard>
  );
}

export interface ActivityItem {
  kind: "add" | "comment" | "edit";
  actorInitials: string;
  actorRole: "coach" | "player" | "coach-ochre";
  content: ReactNode;
  timestamp: string;
}

interface CoachActivityProps {
  coachName: string;
  coachRole: string;
  coachInitials: string;
  items: ActivityItem[];
}

export function CoachActivityCard({ coachName, coachRole, coachInitials, items }: CoachActivityProps) {
  return (
    <SideCard title="Coach & aktivitet" count="SISTE 24t">
      <div className="tp-activity-row" style={{ borderTop: 0 }}>
        <span className="tp-av coach" style={{ width: 24, height: 24, fontSize: 10 }}>{coachInitials}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{coachName}</div>
          <div style={{
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            fontSize: 10,
            color: "hsl(var(--muted-foreground))",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginTop: 2,
          }}>
            {coachRole}
          </div>
        </div>
        <button
          type="button"
          aria-label="Send melding"
          style={{
            width: 28, height: 28, borderRadius: 999, border: "1px solid hsl(var(--border))",
            background: "hsl(var(--card))", display: "inline-flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <MessageSquare size={13} aria-hidden />
        </button>
      </div>
      {items.map((it, i) => (
        <div className="tp-activity-row" key={i}>
          <span className={`tp-av ${it.actorRole}`} style={{ width: 24, height: 24, fontSize: 10 }}>
            {it.actorInitials}
          </span>
          <div className="copy">
            {it.content}
            <span className="ts">{it.timestamp}</span>
          </div>
          <span className={`badge ${it.kind}`}>
            {it.kind === "add" && "+ NY"}
            {it.kind === "comment" && "KMT"}
            {it.kind === "edit" && "REDIG"}
          </span>
        </div>
      ))}
    </SideCard>
  );
}
