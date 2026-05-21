"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, GripVertical } from "lucide-react";

interface PRowProps {
  pNumber: string;
  pName: string;
  prio?: number;
  taskCount: number;
  newCount?: number;
  lastUpdated?: string;
  repsCurrent: number;
  repsTarget: number;
  highPrio?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function PRow({
  pNumber,
  pName,
  prio,
  taskCount,
  newCount,
  lastUpdated,
  repsCurrent,
  repsTarget,
  highPrio,
  defaultOpen,
  children,
}: PRowProps) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <article
      className={`tp-p-row ${highPrio ? "high-prio" : ""}`.trim()}
      data-open={open ? "true" : "false"}
    >
      <div
        className="tp-p-head"
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        <span
          className="tp-p-grip"
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag for å sortere"
        >
          <GripVertical size={12} aria-hidden />
        </span>
        <span className="tp-p-num">{pNumber}</span>
        <div>
          <div className="tp-p-title">{pName}</div>
          <div className="tp-p-sub">
            {prio ? (
              <>
                <span className="tp-p-prio-badge">PRIO {prio}</span>
                <span className="tp-pip" />
              </>
            ) : null}
            <span>
              {taskCount} OPPGAVER
              {newCount ? ` · ${newCount} NY` : ""}
            </span>
            {lastUpdated ? (
              <>
                <span className="tp-pip" />
                <span>SIST OPPDATERT {lastUpdated}</span>
              </>
            ) : null}
          </div>
        </div>
        <div className="tp-p-progress">
          <span className="val">
            {repsCurrent.toLocaleString("nb-NO")} / {repsTarget.toLocaleString("nb-NO")}
          </span>
          <span className="lbl">REPS</span>
        </div>
        <span className="tp-p-chev" aria-hidden>
          <ChevronDown size={14} />
        </span>
      </div>
      <div className="tp-p-body">{children}</div>
    </article>
  );
}
