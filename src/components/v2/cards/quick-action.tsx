"use client";

import Link from "next/link";
import {
  Flag,
  Play,
  Plus,
  ClipboardCheck,
  Video,
  MessageSquare,
  Calendar,
  Settings,
  Home,
  BarChart3,
  Target,
  Bell,
  Search,
  Compass,
  Heart,
  BookOpen,
  Activity,
} from "lucide-react";
import type { QuickAction as QuickActionData } from "@/lib/v2-fixtures";

export type QuickActionProps = {
  action: QuickActionData;
};

const ICON_MAP: Record<string, React.ReactNode> = {
  Flag: <Flag size={20} strokeWidth={1.75} />,
  Play: <Play size={20} strokeWidth={1.75} />,
  Plus: <Plus size={20} strokeWidth={1.75} />,
  ClipboardCheck: <ClipboardCheck size={20} strokeWidth={1.75} />,
  Video: <Video size={20} strokeWidth={1.75} />,
  MessageSquare: <MessageSquare size={20} strokeWidth={1.75} />,
  Calendar: <Calendar size={20} strokeWidth={1.75} />,
  Settings: <Settings size={20} strokeWidth={1.75} />,
  Home: <Home size={20} strokeWidth={1.75} />,
  BarChart3: <BarChart3 size={20} strokeWidth={1.75} />,
  Target: <Target size={20} strokeWidth={1.75} />,
  Bell: <Bell size={20} strokeWidth={1.75} />,
  Search: <Search size={20} strokeWidth={1.75} />,
  Compass: <Compass size={20} strokeWidth={1.75} />,
  Heart: <Heart size={20} strokeWidth={1.75} />,
  BookOpen: <BookOpen size={20} strokeWidth={1.75} />,
  Activity: <Activity size={20} strokeWidth={1.75} />,
};

function getIcon(name: string): React.ReactNode {
  return ICON_MAP[name] ?? <Plus size={20} strokeWidth={1.75} />;
}

export default function QuickAction({ action }: QuickActionProps) {
  const dark = action.tone === "dark";

  return (
    <Link
      href={action.href}
      className="lift flex flex-col gap-4 p-[18px] rounded-[16px] border min-h-[116px] no-underline"
      style={{
        background: dark ? "var(--foreground)" : "var(--card)",
        color: dark ? "var(--background)" : "var(--foreground)",
        borderColor: dark ? "var(--foreground)" : "var(--border)",
      }}
    >
      <span
        className="qa-ic w-10 h-10 rounded-[10px] grid place-items-center transition-transform duration-[200ms] cubic-bezier(0.2,0.8,0.2,1)"
        style={{
          background: dark
            ? "color-mix(in oklab, var(--accent) 22%, transparent)"
            : "color-mix(in oklab, var(--foreground) 5%, transparent)",
          color: dark ? "var(--accent)" : "var(--foreground)",
        }}
      >
        {getIcon(action.icon)}
      </span>

      <div className="mt-auto">
        <span
          className="font-display font-semibold tracking-[-0.01em] block"
          style={{ fontSize: 15, textWrap: "balance" } as React.CSSProperties}
        >
          {action.label}
        </span>
        {dark && (
          <span
            className="font-mono text-[10px] uppercase tracking-[0.10em] mt-1 block"
            style={{ color: "var(--accent)" }}
          >
            Anbefalt
          </span>
        )}
      </div>
    </Link>
  );
}
