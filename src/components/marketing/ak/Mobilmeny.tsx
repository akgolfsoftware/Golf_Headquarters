"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";

import { IkonKnapp } from "./IkonKnapp";
import { Logo } from "./Logo";
import type { Lenke } from "./Toppnav";

/* Kilde: designsystem/ak-golf/components/navigasjon/Mobilmeny.jsx. Masteren
   bruker position:absolute inne i en relativ ramme; her er den fixed over hele
   skjermen og låser dokumentrullen mens den er åpen — samme oppførsel som den
   forrige MarkedNav, som var laget for nettopp det. */

export function Mobilmeny({
  apen,
  lenker,
  aktiv,
  handling,
  onLukk,
}: {
  apen: boolean;
  lenker: Lenke[];
  aktiv?: string;
  handling?: ReactNode;
  onLukk: () => void;
}) {
  useEffect(() => {
    document.documentElement.style.overflow = apen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [apen]);

  if (!apen) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Meny"
      className="ak-kommer fixed inset-0 z-[60] flex flex-col md:hidden"
      style={{ background: "var(--ak-grunn)" }}
    >
      <div
        className="flex h-16 items-center justify-between px-ak-4"
        style={{ borderBottom: "1px solid var(--ak-linje)" }}
      >
        <Logo hoyde={26} />
        <IkonKnapp merkelapp="Lukk meny" onClick={onLukk}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            aria-hidden="true"
          >
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </IkonKnapp>
      </div>
      <nav className="flex flex-1 flex-col py-ak-4" aria-label="Hovedmeny">
        {lenker.map((l) => {
          const her = l.href === aktiv;
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={onLukk}
              aria-current={her ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--ak-r-3)",
                minHeight: 56,
                padding: "0 var(--ak-r-4)",
                textDecoration: "none",
                borderBottom: "1px solid var(--ak-linje)",
                fontFamily: "var(--ak-display)",
                fontWeight: 600,
                fontSize: "var(--ak-t-26)",
                letterSpacing: "var(--ak-sp-titt)",
                color: "var(--ak-tekst)",
              }}
            >
              {her && (
                <span
                  aria-hidden="true"
                  style={{ width: 3, height: 24, background: "var(--ak-signal)" }}
                />
              )}
              {l.tekst}
            </Link>
          );
        })}
      </nav>
      {handling && <div className="p-ak-4">{handling}</div>}
    </div>
  );
}
