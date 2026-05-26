import Link from "next/link";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";

/**
 * PlanCardMini — kompakt plan-rad for Split view sidebar.
 *
 * Avatar + spillernavn + plan-tittel + tynn progress-bar.
 * Aktiv-state markert med primær venstre-border + bg-secondary.
 */
export type PlanCardMiniData = {
  id: string;
  name: string;
  userName: string;
  pct: number;
  status: "aktiv" | "pause" | "arkiv";
};

const STATUS_DOT: Record<PlanCardMiniData["status"], string> = {
  aktiv: "bg-primary",
  pause: "bg-accent",
  arkiv: "bg-muted-foreground",
};

export function PlanCardMini({
  plan,
  active,
  q,
}: {
  plan: PlanCardMiniData;
  active: boolean;
  q?: string;
}) {
  const params = new URLSearchParams();
  params.set("view", "split");
  params.set("planId", plan.id);
  if (q) params.set("q", q);

  return (
    <Link
      href={`/admin/plans?${params.toString()}`}
      aria-current={active ? "true" : undefined}
      className={
        active
          ? "flex flex-col gap-2 rounded-md border border-border border-l-[3px] border-l-primary bg-secondary p-4 shadow-sm"
          : "flex flex-col gap-2 rounded-md border border-transparent p-4 transition-colors hover:bg-secondary/60"
      }
    >
      <div className="flex items-center gap-2">
        <span
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[10px] font-semibold text-white"
          style={{ background: avatarBg(plan.userName) }}
        >
          {initialsFromName(plan.userName)}
        </span>
        <span className="flex-1 truncate text-[13px] font-medium text-foreground">
          {plan.userName}
        </span>
        <span
          aria-hidden="true"
          className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[plan.status]}`}
        />
      </div>
      <div className="font-display text-[12px] italic leading-tight text-muted-foreground">
        {plan.name}
      </div>
      <div className="h-1 overflow-hidden rounded-sm bg-secondary">
        <div
          className="h-full bg-primary transition-[width]"
          style={{ width: `${plan.pct}%` }}
        />
      </div>
      <div className="font-mono text-[10px] tabular-nums text-muted-foreground">
        {plan.pct} %
      </div>
    </Link>
  );
}
