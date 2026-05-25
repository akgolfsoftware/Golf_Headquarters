"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Clock } from "lucide-react";
import { useHeroParallax, useInView } from "@/components/v2/hooks";
import type { Axis } from "@/lib/v2-fixtures";

export type DetailHeroProps = {
  /** Axis pill label e.g. "SLAG" */
  axis: Axis;
  /** Title shown large over photo */
  title: string;
  /** Number image from /images/akgolf/{image}.webp */
  image: number;
  /** Duration in minutes shown in pill */
  duration: number;
  /** Times this drill has been run */
  timesRun: number;
  /** Best streak number */
  bestStreak: number;
  /** Progress 0–1 for animated bar at bottom */
  progressPct: number;
  /** Href for back link */
  backHref?: string;
  /** Back link label */
  backLabel?: string;
  mobile?: boolean;
};

export default function DetailHero({
  axis,
  title,
  image,
  duration,
  timesRun,
  bestStreak,
  progressPct,
  backHref = "/",
  backLabel = "Tilbake til hjem",
  mobile = false,
}: DetailHeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  useHeroParallax(ref);
  const inView = useInView(ref);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-[20px]"
      style={{ boxShadow: "0 20px 48px -12px rgba(10,31,23,0.18)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/akgolf/${image}.webp`}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform:
            "scale(var(--hero-scale, 1)) translateY(var(--hero-translate, 0px))",
          transition: "transform 100ms linear",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)",
        }}
      />
      <div className="grain" aria-hidden />

      <div
        className="relative flex flex-col justify-between"
        style={{
          minHeight: mobile ? 320 : 380,
          padding: mobile ? "20px" : "36px 44px",
          color: "#FAFAF7",
        }}
      >
        {/* Back link */}
        <div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-[6px] font-mono text-[11px] font-semibold uppercase tracking-[0.10em]"
            style={{ color: "rgba(250,250,247,0.7)" }}
          >
            <ChevronLeft size={12} strokeWidth={2.5} /> {backLabel}
          </Link>
        </div>

        {/* Bottom content */}
        <div>
          <div className="flex gap-[10px] mb-3">
            <span
              className={`pill pill-${axis.toLowerCase()}`}
              style={{
                background:
                  "color-mix(in oklab, var(--accent) 32%, rgba(0,0,0,0.4))",
                color: "var(--accent)",
              }}
            >
              {axis}
            </span>
            <span
              className="inline-flex items-center gap-1 px-3 py-[6px] rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.10em]"
              style={{
                background:
                  "color-mix(in oklab, #fff 14%, rgba(0,0,0,0.4))",
                color: "#FAFAF7",
                backdropFilter: "blur(8px)",
              }}
            >
              <Clock size={11} strokeWidth={2} />
              {duration} min
            </span>
          </div>

          <h1
            className="m-0 font-display font-bold leading-[0.95] tracking-[-0.03em]"
            style={{
              fontSize: mobile ? 40 : 64,
              maxWidth: "16ch",
            }}
          >
            {title}
          </h1>

          <div
            className="mt-[14px] flex flex-wrap gap-x-[18px] gap-y-2 font-mono text-[11px] uppercase tracking-[0.10em]"
            style={{ color: "rgba(250,250,247,0.78)" }}
          >
            <span>
              Kjørt{" "}
              <span className="tabular" style={{ color: "#fff" }}>
                {timesRun}
              </span>{" "}
              ganger
            </span>
            <span className="opacity-50">·</span>
            <span>
              Beste streak{" "}
              <span className="tabular" style={{ color: "var(--accent)" }}>
                {bestStreak}
              </span>
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="mt-4 h-[3px] rounded-full overflow-hidden"
            style={{
              background: "rgba(250,250,247,0.2)",
            }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: inView ? `${progressPct}%` : "0%",
                background: "var(--accent)",
                transition: "width 1100ms cubic-bezier(0.22, 1, 0.36, 1) 200ms",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
