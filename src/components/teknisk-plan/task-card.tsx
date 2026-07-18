import { GripVertical, MoreHorizontal } from "lucide-react";
import type { PyramidArea } from "./constants";
import type { LFase } from "@/generated/prisma/client";
import { faseLabel } from "@/lib/ak-formel-visning";

export interface RepProgress {
  current: number;
  target: number;
}

export interface TaskCardProps {
  prio: number;
  tittel: string;
  pyramide: PyramidArea;
  omraade: string;
  koller: string[];
  lFase?: string;
  cs?: string;
  m?: string;
  pr?: string;
  reps: {
    dry: RepProgress;
    lav: RepProgress;
    full: RepProgress;
  };
  isNew?: boolean;
  onMoreClick?: () => void;
  onClick?: () => void;
}

function pct(current: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export function TaskCard(props: TaskCardProps) {
  return (
    <div
      className={`tp-task ${props.isNew ? "new" : ""}`.trim()}
      onClick={props.onClick}
      style={props.onClick ? { cursor: "pointer" } : undefined}
    >
      <span
        className="grip"
        onClick={(e) => e.stopPropagation()}
        aria-label="Drag for å sortere"
      >
        <GripVertical size={12} aria-hidden />
      </span>
      <span className="prio-num">{props.prio}</span>
      <div className="body">
        <div className="title-row">
          <span className="title">{props.tittel}</span>
          <button
            type="button"
            className="more-btn"
            onClick={(e) => {
              e.stopPropagation();
              props.onMoreClick?.();
            }}
            aria-label="Mer"
          >
            <MoreHorizontal size={14} aria-hidden />
          </button>
        </div>

        <div className="tp-tag-row">
          <span className={`tp-tag pyr-${props.pyramide.toLowerCase()}`}>
            {props.pyramide}
          </span>
          <span className="tp-tag area">{props.omraade.toUpperCase()}</span>
          {props.koller.length === 1 ? (
            <span className="tp-tag club">{props.koller[0].toUpperCase()}</span>
          ) : (
            <span className="tp-tag club">
              {props.koller.length === 12 ? "ALLE KØLLER" : `${props.koller.length} KØLLER`}
            </span>
          )}
          {props.lFase ? <span className="tp-tag lphase">{faseLabel(props.lFase as LFase)}</span> : null}
          {props.cs ? <span className="tp-tag cs">{props.cs}</span> : null}
          {props.m ? <span className="tp-tag">{props.m}</span> : null}
          {props.pr ? <span className="tp-tag">{props.pr}</span> : null}
        </div>

        <div className="tp-reps">
          {(["dry", "lav", "full"] as const).map((hast) => {
            const rep = props.reps[hast];
            return (
              <div className="tp-rep-col" key={hast}>
                <div className="tp-rep-head">
                  <span className="tp-rep-name">{hast.toUpperCase()}</span>
                  <span className="tp-rep-val">
                    {rep.current.toLocaleString("nb-NO")}{" "}
                    <span className="target">/ {rep.target.toLocaleString("nb-NO")}</span>
                  </span>
                </div>
                <div className={`tp-rep-bar ${hast}`}>
                  <div style={{ width: `${pct(rep.current, rep.target)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
