"use client";

import Link from "next/link";
import { Check, MapPin, Layers } from "lucide-react";
import type { Session } from "@/lib/v2-fixtures";

export type ItineraryRowProps = {
  session: Session;
  isActiveNow: boolean;
  isPast: boolean;
  isLast: boolean;
  /** href to navigate to when clicking the card */
  detailHref: string;
};

const DRILL_HREFS: Record<string, string> = {
  s1: "/drill/gate-50cm",
  s2: "/drill/swing-video",
  s3: "/drill/wedge-stige",
  s4: "/drill/wedge-stige",
  s5: "/drill/putt-konsistens",
};

export function buildDrillHref(sessionId: string): string {
  return DRILL_HREFS[sessionId] ?? "/drill/putt-konsistens";
}

export default function ItineraryRow({
  session,
  isActiveNow,
  isPast,
  isLast,
  detailHref,
}: ItineraryRowProps) {
  let statusLabel = "PLANLAGT";
  let statusBg = "color-mix(in oklab, var(--foreground) 8%, transparent)";
  let statusColor = "var(--muted-fg)";
  let statusIcon: React.ReactNode = null;

  if (session.status === "DONE") {
    statusLabel = "FULLFØRT";
    statusBg = "color-mix(in oklab, var(--success) 14%, transparent)";
    statusColor = "var(--success)";
    statusIcon = <Check size={10} strokeWidth={2.5} />;
  } else if (isActiveNow) {
    statusLabel = "PÅGÅR NÅ";
    statusBg = "var(--accent)";
    statusColor = "var(--accent-fg)";
    statusIcon = (
      <span
        className="itin-pulse"
        style={{ background: "var(--accent-fg)" }}
        aria-hidden
      />
    );
  }

  const dotStatus = isActiveNow ? "NEXT" : session.status;
  const dotBg =
    dotStatus === "DONE"
      ? "var(--success)"
      : dotStatus === "NEXT"
        ? "var(--accent)"
        : "color-mix(in oklab, var(--foreground) 20%, transparent)";

  return (
    <div
      className="relative"
      style={{ display: "grid", gridTemplateColumns: "80px 28px 1fr", gap: 12, minHeight: 110 }}
    >
      {/* Time column */}
      <div
        className="flex flex-col gap-[2px] pt-2 font-mono text-[13px] font-bold tracking-[0.02em] text-foreground"
      >
        <span>{session.time}</span>
        <span className="text-muted-foreground font-normal text-[11px]">
          {session.end}
        </span>
      </div>

      {/* Rail */}
      <div className="relative pt-[18px]">
        {!isLast && (
          <div
            className="absolute left-[calc(50%-0.5px)] w-[1px] bg-border"
            style={{ top: 30, bottom: -12 }}
          />
        )}
        <div
          className="rounded-full ml-2"
          style={{
            width: 12,
            height: 12,
            background: dotBg,
            border: dotStatus === "NEXT" ? "2px solid var(--foreground)" : "none",
          }}
        />
      </div>

      {/* Card */}
      <Link
        href={detailHref}
        className={[
          "itin-card lift",
          `axis-${session.axis}`,
          isActiveNow ? "is-active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          display: "block",
          padding: "14px 16px",
          borderRadius: 14,
          cursor: "pointer",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        {/* Axis + status badges */}
        <div className="flex flex-wrap items-center gap-2 mb-[6px]">
          <span className={`pill pill-${session.axis.toLowerCase()}`}>
            {session.axis}
          </span>
          <span
            className="inline-flex items-center gap-[5px] font-mono text-[9px] font-bold uppercase tracking-[0.10em] rounded-full"
            style={{
              padding: "4px 9px",
              background: statusBg,
              color: statusColor,
            }}
          >
            {statusIcon}
            {statusLabel}
          </span>
        </div>

        {/* Title */}
        <h3
          className="m-0 font-display font-bold tracking-[-0.01em] text-foreground"
          style={{ fontSize: 19, opacity: isPast ? 0.6 : 1 }}
        >
          {session.title}
        </h3>

        {/* Subtitle */}
        <p className="m-0 mt-1 mb-2 text-[13.5px] text-muted-foreground">
          {session.subtitle}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-[14px] gap-y-1 font-mono text-[11px] text-muted-foreground tracking-[0.04em]">
          <span className="inline-flex items-center gap-[5px]">
            <MapPin size={12} /> {session.location}
          </span>
          <span className="inline-flex items-center gap-[5px]">
            <Layers size={12} /> {session.drills} drills
          </span>
        </div>
      </Link>
    </div>
  );
}
