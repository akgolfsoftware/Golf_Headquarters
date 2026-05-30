"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useNowTime } from "@/components/athletic/hooks";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import LiveBar from "./live-bar";
import BottomNav from "./bottom-nav";
import type { Player, Session, Weather } from "@/lib/v2-fixtures";

export type ShellWrapperProps = {
  children: React.ReactNode;
  player: Player;
  sessions: Session[];
  weather: Weather;
  mobile?: boolean;
  critical?: boolean;
  nowOverride?: number;
  onCriticalClick?: () => void;
};

export default function ShellWrapper({
  children,
  player,
  sessions,
  weather,
  mobile = false,
  critical = false,
  nowOverride,
  onCriticalClick,
}: ShellWrapperProps) {
  const nowTime = useNowTime(nowOverride);

  if (mobile) {
    return (
      <div
        className="min-h-screen block"
        style={{ background: "var(--background)", paddingBottom: "80px" }}
      >
        <Topbar mobile />
        <LiveBar
          nowTime={nowTime}
          sessions={sessions}
          weather={weather}
          critical={critical}
          onClick={onCriticalClick}
        />
        <main className="px-4 pt-4 pb-6 max-w-[480px] mx-auto">
          {children}
        </main>

        {/* FAB */}
        <Link
          href="/booking"
          className="fixed right-5 grid place-items-center rounded-full"
          style={{
            bottom: 92,
            width: 56,
            height: 56,
            background: "var(--primary)",
            color: "var(--accent)",
            boxShadow: "0 12px 28px -6px rgba(10,31,23,0.30)",
            zIndex: 35,
          }}
          aria-label="Ny booking"
        >
          <Plus size={28} strokeWidth={2.25} />
        </Link>

        <BottomNav />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        display: "grid",
        gridTemplateColumns: "256px 1fr",
        background: "var(--background)",
      }}
    >
      <Sidebar player={player} />
      <div className="min-w-0">
        <Topbar />
        <LiveBar
          nowTime={nowTime}
          sessions={sessions}
          weather={weather}
          critical={critical}
          onClick={onCriticalClick}
        />
        <main className="px-8 pt-6 pb-12 max-w-[1280px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
