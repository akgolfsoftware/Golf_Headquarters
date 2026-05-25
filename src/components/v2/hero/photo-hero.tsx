"use client";

import { useRef } from "react";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";
import { useHeroParallax, useCountUp } from "@/components/v2/hooks";
import type { Player, Tournament } from "@/lib/v2-fixtures";

export type PhotoHeroProps = {
  player: Player;
  tournament: Tournament;
  heroImg?: number;
  mobile?: boolean;
};

function HcpTrend({ delta }: { delta: number }) {
  const up = delta > 0;
  const dn = delta < 0;
  const color = up
    ? "var(--accent)"
    : dn
      ? "var(--destructive)"
      : "rgba(250,250,247,0.6)";

  return (
    <span
      className="inline-flex items-center gap-[2px]"
      style={{ color }}
    >
      <span className="hcp-pulse">
        {up ? (
          <ChevronUp size={14} strokeWidth={2.5} />
        ) : dn ? (
          <ChevronDown size={14} strokeWidth={2.5} />
        ) : (
          <Minus size={14} strokeWidth={2.5} />
        )}
      </span>
      <span className="tabular text-[12px]">
        {Math.abs(delta).toFixed(1)}
      </span>
    </span>
  );
}

export default function PhotoHero({
  player,
  tournament,
  heroImg = 1,
  mobile = false,
}: PhotoHeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  useHeroParallax(ref);

  const [hcpVal, hcpRef] = useCountUp<HTMLSpanElement>(Math.abs(player.hcp), {
    decimals: 1,
    duration: 1100,
  });
  const [daysVal, daysRef] = useCountUp<HTMLSpanElement>(
    tournament.daysUntil,
    {
      duration: 1300,
      delay: 200,
    },
  );

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-[20px]"
      style={{ boxShadow: "0 20px 48px -12px rgba(10,31,23,0.18)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/akgolf/${heroImg}.webp`}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform:
            "scale(var(--hero-scale, 1)) translateY(var(--hero-translate, 0px))",
          transformOrigin: "center 60%",
          transition: "transform 100ms linear",
        }}
        loading="eager"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)",
        }}
      />
      <div className="grain" aria-hidden />

      <div
        className="relative flex flex-col justify-between"
        style={{
          minHeight: mobile ? 380 : 480,
          padding: mobile ? "20px" : "40px 48px",
          color: "#FAFAF7",
        }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center">
            <span
              className="inline-flex items-center gap-[6px] px-3 py-[6px] rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
              style={{
                background:
                  "color-mix(in oklab, var(--accent) 28%, rgba(0,0,0,0.4))",
                color: "var(--accent)",
                backdropFilter: "blur(8px)",
              }}
            >
              {player.tier}
            </span>
            <span
              className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase ml-[10px]"
              style={{ color: "rgba(250,250,247,0.78)" }}
            >
              PLAYERHQ · SESONG 2026
            </span>
          </div>
          <div
            className="w-14 h-14 rounded-full grid place-items-center font-display font-bold text-[18px] border-2"
            style={{
              background: "var(--primary)",
              color: "var(--accent)",
              borderColor: "var(--accent)",
            }}
          >
            {player.initials}
          </div>
        </div>

        {/* Title + meta */}
        <div>
          <h1
            className="m-0 font-display font-bold leading-[0.95] tracking-[-0.03em]"
            style={{ fontSize: mobile ? 44 : 72, color: "#FAFAF7" }}
          >
            Hei,{" "}
            <span style={{ fontStyle: "italic", color: "var(--accent)" }}>
              {player.first}
            </span>
            .
          </h1>
          <div
            className="flex flex-wrap items-baseline gap-x-[18px] gap-y-2 font-mono text-[12px] uppercase tracking-[0.10em] mt-4"
            style={{ color: "rgba(250,250,247,0.78)" }}
          >
            <span>{player.ngfKategori}</span>
            <span className="opacity-50">·</span>
            <span className="inline-flex items-baseline gap-[6px]">
              HCP{" "}
              <span
                ref={hcpRef}
                className="tabular font-display font-bold text-[18px] tracking-[-0.02em]"
                style={{ color: "#FAFAF7" }}
              >
                −{hcpVal}
              </span>
              <HcpTrend delta={player.hcpTrend} />
            </span>
            <span className="opacity-50">·</span>
            <span className="inline-flex items-baseline gap-[6px]">
              <span
                ref={daysRef}
                className="tabular font-display font-bold text-[18px] tracking-[-0.02em]"
                style={{ color: "#FAFAF7" }}
              >
                {daysVal}
              </span>{" "}
              dager til{" "}
              <span style={{ color: "var(--accent)" }}>{tournament.name}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
