/**
 * CoachMessagePreview — mini-seksjon med coach-melding.
 * Port av workbench-v2/athletic.jsx CoachMessagePreview.
 */

import Link from "next/link";

export type CoachMessagePreviewProps = {
  coach: { name: string; initials: string };
  message: string;
  time: string;
  href: string;
};

export function CoachMessagePreview({
  coach,
  message,
  time,
  href,
}: CoachMessagePreviewProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl border border-border bg-card px-6 py-4 transition-colors hover:border-primary/40"
      aria-label={`Melding fra ${coach.name}`}
    >
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-accent font-mono text-sm font-bold"
        aria-hidden
      >
        {coach.initials}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-mono text-[10.5px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          <strong className="font-bold text-foreground">{coach.name}</strong>
          {" · Coach"}
        </span>
        <span className="mt-1 block truncate text-sm text-foreground">
          &ldquo;<em className="font-normal italic">{message}</em>&rdquo;
        </span>
      </span>
      <span className="shrink-0 font-mono text-[10.5px] font-semibold uppercase tracking-[0.10em] text-muted-foreground tabular-nums">
        {time}
      </span>
    </Link>
  );
}
