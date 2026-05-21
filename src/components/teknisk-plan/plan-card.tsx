import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";

export type PlanCardStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export interface PlanCardProps {
  href: string;
  title: string;
  periodLabel?: string;
  status: PlanCardStatus;
  oppgaveCount: number;
  pPositionCount: number;
  pPositionTotal?: number;
  metaLabel: string;
  metaValue: string;
  authorAvatar: string;
  authorName: string;
  authorRole?: "coach" | "player" | "coach-ochre";
  progressLabel: string;
  progressCurrent: number;
  progressTarget: number;
  progressTailLeft: string;
  progressTailRight: string;
  footRole: ReactNode;
  footAvatars: { initials: string; role: "coach" | "player" | "coach-ochre" }[];
  featured?: boolean;
}

export function PlanCard(props: PlanCardProps) {
  const pct = props.progressTarget > 0
    ? Math.min(100, Math.round((props.progressCurrent / props.progressTarget) * 100))
    : 0;

  const archived = props.status === "ARCHIVED";
  const cardClass = ["tp-plan-card"];
  if (props.featured) cardClass.push("featured");
  if (archived) cardClass.push("archived");

  return (
    <article className={cardClass.join(" ")}>
      <div className="plan-top">
        <h3 className="plan-title">
          {props.title}
          {props.periodLabel ? <em> · {props.periodLabel}</em> : null}
        </h3>
        <span className={`plan-status ${props.status.toLowerCase()}`}>
          {archived ? <Check size={10} aria-hidden /> : <span className="dot" />}
          {props.status === "ACTIVE" && "Aktiv"}
          {props.status === "DRAFT" && "Utkast"}
          {archived && "Avsluttet"}
        </span>
      </div>

      <div className="plan-meta">
        <div className="meta-item">
          <span className="meta-k">Oppgaver</span>
          <span className="meta-v">{props.oppgaveCount}</span>
        </div>
        <div className="meta-item">
          <span className="meta-k">P-posisjoner</span>
          <span className="meta-v">
            {props.pPositionCount}
            {props.pPositionTotal ? <span className="unit">/{props.pPositionTotal}</span> : null}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-k">{props.metaLabel}</span>
          <span className="meta-v">{props.metaValue}</span>
        </div>
        <div className="meta-author">
          <span className={`tp-av ${props.authorRole ?? "coach"}`}>{props.authorAvatar}</span>
          <span className="nm">{props.authorName}</span>
        </div>
      </div>

      <div>
        <div className="tp-prog-row">
          <span className="tp-prog-label">{props.progressLabel}</span>
          <span className="tp-prog-val">
            {props.progressCurrent.toLocaleString("nb-NO")}{" "}
            <span className="target">/ {props.progressTarget.toLocaleString("nb-NO")}</span>
          </span>
        </div>
        <div className={`tp-prog-bar ${archived ? "done" : pct === 0 ? "empty" : ""}`.trim()}>
          <div style={{ width: `${Math.max(2, pct)}%` }} />
        </div>
        <div className="tp-prog-tail">
          <span>{props.progressTailLeft}</span>
          <span>
            <b>{pct} %</b>
            {props.progressTailRight ? ` · ${props.progressTailRight}` : ""}
          </span>
        </div>
      </div>

      <div className="tp-plan-foot">
        <div className="av-pair">
          {props.footAvatars.map((av, i) => (
            <span key={i} className={`tp-av ${av.role}`}>{av.initials}</span>
          ))}
        </div>
        <span className="role">{props.footRole}</span>
        <Link className="open-link" href={props.href}>
          Åpne plan <ArrowRight size={12} aria-hidden />
        </Link>
      </div>
    </article>
  );
}
