"use client";

import { Bell, Search, Settings } from "lucide-react";
import Link from "next/link";

export type TopbarProps = {
  mobile?: boolean;
};

export default function Topbar({ mobile = false }: TopbarProps) {
  return (
    <div
      className="sticky top-0 z-40 border-b border-border"
      style={{
        background: "color-mix(in oklab, var(--background) 80%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div
        className="flex items-center gap-2"
        style={{ padding: mobile ? "10px 16px" : "12px 24px" }}
      >
        {mobile && (
          <>
            <div
              className="w-8 h-8 rounded-full grid place-items-center flex-shrink-0 font-display italic font-bold text-[18px]"
              style={{ background: "var(--foreground)", color: "var(--accent)" }}
            >
              AK
            </div>
            <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
              PLAYERHQ
            </span>
            <div className="flex-1" />
          </>
        )}

        {!mobile && (
          <div
            className="flex-1 flex items-center gap-[10px] px-[14px] py-2 rounded-[10px] text-muted-foreground text-[13px] border border-border max-w-[420px]"
            style={{ background: "var(--card)" }}
          >
            <Search size={16} />
            <span>Søk i alt — drills, runder, planer…</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">
              ⌘K
            </span>
          </div>
        )}

        <button
          className="relative w-8 h-8 grid place-items-center rounded-[10px] border border-border text-foreground"
          style={{ background: "var(--card)" }}
          aria-label="Varsler"
        >
          <Bell size={16} />
          <span
            className="absolute top-[6px] right-[6px] w-[7px] h-[7px] rounded-full bg-destructive border-2"
            style={{ borderColor: "var(--card)" }}
            aria-hidden
          />
        </button>

        {!mobile && (
          <Link
            href="/portal/meg"
            className="w-8 h-8 grid place-items-center rounded-[10px] border border-border text-foreground"
            style={{ background: "var(--card)" }}
            aria-label="Innstillinger"
          >
            <Settings size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
