"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { useCountUp } from "@/components/v2/hooks";
import type { Tournament, TournamentChecklistItem } from "@/lib/v2-fixtures";

export type TournamentCardProps = {
  tournament: Tournament;
  checklist: TournamentChecklistItem[];
  mobile?: boolean;
  statsHref?: string;
};

export default function TournamentCard({
  tournament,
  checklist,
  mobile = false,
  statsHref = "/stats",
}: TournamentCardProps) {
  const [val, ref] = useCountUp<HTMLSpanElement>(tournament.daysUntil, {
    duration: 1400,
  });

  return (
    <section
      className="flex flex-col gap-4 rounded-[20px]"
      style={{
        background: "var(--foreground)",
        color: "var(--background)",
        padding: 32,
        boxShadow: "0 20px 48px -12px rgba(10,31,23,0.25)",
      }}
    >
      {/* Header */}
      <div>
        <p
          className="m-0 font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: "var(--accent)" }}
        >
          NESTE TURNERING
        </p>
        <h3
          className="m-0 mt-2 mb-1 font-display font-bold tracking-[-0.02em]"
          style={{ fontSize: mobile ? 28 : 36 }}
        >
          {tournament.name}
        </h3>
        <p className="m-0 text-[13px]" style={{ color: "rgba(250,250,247,0.70)" }}>
          28 – 30. mai · {tournament.location} · {tournament.format}
        </p>
      </div>

      {/* Countdown */}
      <div
        className="flex items-end gap-4 py-4"
        style={{
          borderTop: "1px solid rgba(250,250,247,0.15)",
          borderBottom: "1px solid rgba(250,250,247,0.15)",
        }}
      >
        <span
          ref={ref}
          className="font-display tabular font-bold leading-[0.82] tracking-[-0.04em]"
          style={{
            fontSize: mobile ? 180 : 220,
            color: "var(--accent)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {val}
        </span>
        <span
          className="font-mono text-[12px] uppercase tracking-[0.10em] pb-4"
          style={{ color: "rgba(250,250,247,0.65)" }}
        >
          dag{tournament.daysUntil === 1 ? "" : "er"}
          <br />
          igjen
        </span>
      </div>

      {/* Checklist */}
      <div>
        <p
          className="m-0 mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: "rgba(250,250,247,0.55)" }}
        >
          FORBEREDELSE
        </p>
        <ul className="list-none p-0 m-0 flex flex-col gap-2">
          {checklist.map((item) => (
            <li key={item.id} className="flex items-center gap-[10px]">
              <span
                className="w-[18px] h-[18px] rounded-full grid place-items-center flex-shrink-0"
                style={{
                  background: item.done ? "var(--accent)" : "transparent",
                  border: item.done
                    ? "none"
                    : "1.5px solid rgba(250,250,247,0.45)",
                  color: "var(--accent-fg)",
                }}
              >
                {item.done && <Check size={11} strokeWidth={3} />}
              </span>
              <span
                className="text-[14px]"
                style={{
                  color: item.done ? "rgba(250,250,247,0.6)" : "var(--background)",
                  textDecoration: item.done ? "line-through" : "none",
                  textDecorationColor: "rgba(250,250,247,0.4)",
                }}
              >
                {item.label}
              </span>
              {item.hint && (
                <span
                  className="font-mono text-[10px] ml-auto"
                  style={{ color: "rgba(250,250,247,0.4)" }}
                >
                  {item.hint}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <Link
        href={statsHref}
        className="inline-flex items-center justify-center gap-[6px] px-[22px] py-3 rounded-full font-mono text-[12px] font-bold uppercase tracking-[0.10em] no-underline"
        style={{
          background: "var(--accent)",
          color: "var(--accent-fg)",
        }}
      >
        Se turnering <ArrowRight size={14} />
      </Link>
    </section>
  );
}
