"use client";

import type { CoachThread, Coach } from "@/lib/v2-fixtures";

export type CoachMessageProps = {
  thread: CoachThread;
  isActive?: boolean;
  onClick?: () => void;
};

export default function CoachMessage({
  thread,
  isActive = false,
  onClick,
}: CoachMessageProps) {

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-[14px] py-3 rounded-[10px] border-0 cursor-pointer flex flex-col gap-1 transition-colors duration-[160ms]"
      style={{
        background: isActive
          ? "color-mix(in oklab, var(--accent) 20%, transparent)"
          : "transparent",
      }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span
          className="font-display text-[14px]"
          style={{ fontWeight: thread.unread ? 700 : 500 }}
        >
          {thread.unread && (
            <span
              className="inline-block w-[6px] h-[6px] rounded-full mr-[6px] align-middle"
              style={{ background: "var(--accent)" }}
              aria-hidden
            />
          )}
          {thread.subject}
        </span>
      </div>
      <span className="text-[12px] text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap block">
        {thread.preview}
      </span>
      <span className="font-mono text-[10px] text-muted-foreground tracking-[0.06em]">
        {thread.date}
      </span>
    </button>
  );
}

// ──────────── Full thread detail ────────────

export type CoachMessageDetailProps = {
  thread: CoachThread;
  coach: Coach;
};

export function CoachMessageDetail({ thread, coach }: CoachMessageDetailProps) {
  const fromCoach = thread.from === "anders";

  return (
    <div className="flex flex-col gap-4 h-full min-h-[400px]">
      <div className="flex items-baseline justify-between gap-3">
        <h3
          className="m-0 font-display font-bold tracking-[-0.02em]"
          style={{ fontSize: 22 }}
        >
          {thread.subject}
        </h3>
        <span className="font-mono text-[11px] text-muted-foreground tracking-[0.06em] flex-shrink-0">
          {thread.date}
        </span>
      </div>

      <div
        className="flex items-center gap-[10px] pb-[14px] border-b border-border"
      >
        <div
          className="w-9 h-9 rounded-full grid place-items-center font-display font-bold text-[12px] flex-shrink-0"
          style={{
            background: fromCoach
              ? "var(--primary)"
              : "color-mix(in oklab, var(--accent) 60%, transparent)",
            color: fromCoach ? "var(--accent)" : "var(--accent-fg)",
          }}
        >
          {fromCoach ? coach.short.slice(0, 2).toUpperCase() : "ØR"}
        </div>
        <div>
          <div className="font-semibold text-[14px]">
            {fromCoach ? coach.name : "Øyvind Rohjan"}
          </div>
          <div className="text-[12px] text-muted-foreground">
            {fromCoach ? coach.role : "Du"}
          </div>
        </div>
      </div>

      <p
        className="m-0 flex-1 font-display text-[16px] leading-[1.6] text-foreground whitespace-pre-line"
        style={{ textWrap: "pretty" } as React.CSSProperties}
      >
        {thread.body}
      </p>
    </div>
  );
}
