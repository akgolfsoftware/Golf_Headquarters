"use client";

import Link from "next/link";
import {
  Sparkles,
  BarChart3,
  Target,
  ArrowRight,
  Eye,
  BookOpen,
  Activity,
} from "lucide-react";
import type { Insight } from "@/lib/v2-fixtures";

export type InsightCardProps = {
  insight: Insight;
};

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles size={24} />,
  BarChart3: <BarChart3 size={24} />,
  Target: <Target size={24} />,
  Eye: <Eye size={24} />,
  BookOpen: <BookOpen size={24} />,
  Activity: <Activity size={24} />,
  // Legacy name from source data
  LineChart: <BarChart3 size={24} />,
};

function getIcon(name: string): React.ReactNode {
  return ICON_MAP[name] ?? <Sparkles size={24} />;
}

export default function InsightCard({ insight }: InsightCardProps) {
  const isAction = insight.type === "HANDLING";
  const isObservation = insight.type === "OBSERVASJON";

  const iconBg = isAction
    ? "var(--accent)"
    : isObservation
      ? "color-mix(in oklab, var(--info) 18%, transparent)"
      : "color-mix(in oklab, var(--primary) 10%, transparent)";

  const iconColor = isAction
    ? "var(--accent-fg)"
    : isObservation
      ? "var(--info)"
      : "var(--primary)";

  return (
    <Link
      href={insight.href}
      className="lift flex flex-col gap-4 p-6 rounded-[20px] border cursor-pointer no-underline"
      style={{
        background: "var(--card)",
        borderColor: isAction
          ? "color-mix(in oklab, var(--foreground) 15%, transparent)"
          : "var(--border)",
        boxShadow: isAction ? "0 12px 28px -10px rgba(10,31,23,0.16)" : undefined,
        color: "inherit",
      }}
    >
      {/* Icon + type badge */}
      <div className="flex justify-between items-start">
        <span
          className="w-12 h-12 rounded-[12px] grid place-items-center"
          style={{ background: iconBg, color: iconColor }}
        >
          {getIcon(insight.icon)}
        </span>
        <span
          className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] rounded-full px-[10px] py-[5px]"
          style={{ background: "var(--foreground)", color: "var(--background)" }}
        >
          {insight.type}
        </span>
      </div>

      <span className="eyebrow">{insight.eyebrow}</span>

      <p
        className="m-0 flex-1 font-display text-[17px] font-medium leading-[1.45] text-foreground"
        style={{ textWrap: "pretty" } as React.CSSProperties}
      >
        {insight.body}
      </p>

      <span className="inline-flex items-center gap-[6px] font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-foreground">
        {insight.cta} <ArrowRight size={13} />
      </span>
    </Link>
  );
}
