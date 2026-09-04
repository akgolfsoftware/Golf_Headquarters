"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { IkonKnapp } from "./IkonKnapp";
import { Logo } from "./Logo";

/* Kilde: designsystem/ak-golf/components/navigasjon/Toppnav.jsx. Lys variant
   (marked er lys). Høyde 80 på Mac, 64 på mobil; masterens `mobil`-prop er
   byttet mot brekkpunktet md (768 = --ak-bp-tablet). Aktiv lenke får 2 px
   signal-strek nederst. */

export type Lenke = { href: string; tekst: string };

export function Toppnav({
  lenker,
  aktiv,
  handling,
  onMeny,
}: {
  lenker: Lenke[];
  aktiv?: string;
  handling?: ReactNode;
  onMeny: () => void;
}) {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "var(--ak-grunn)",
        borderBottom: "1px solid var(--ak-linje)",
      }}
    >
      <div
        className="mx-auto flex h-16 items-center gap-ak-6 px-ak-4 md:h-20 md:px-ak-6"
        style={{ maxWidth: "var(--ak-sidebredde)" }}
      >
        <Link
          href="/"
          aria-label="AK Golf, til forsiden"
          style={{ display: "block", textDecoration: "none", flex: "0 0 auto" }}
        >
          {/* Masteren: 26 px på mobil, 32 på Mac. To instanser, én synlig. */}
          <span className="md:hidden">
            <Logo hoyde={26} prioritet />
          </span>
          <span className="hidden md:block">
            <Logo hoyde={32} prioritet />
          </span>
        </Link>

        <nav className="hidden flex-1 gap-ak-5 md:flex" aria-label="Hovedmeny">
          {lenker.map((l) => {
            const her = l.href === aktiv;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={her ? "page" : undefined}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  height: 80,
                  fontSize: "var(--ak-t-15)",
                  fontWeight: 500,
                  color: her ? "var(--ak-tekst)" : "var(--ak-dempet)",
                  textDecoration: "none",
                }}
              >
                {l.tekst}
                {her && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: -1,
                      height: 2,
                      background: "var(--ak-signal)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <span className="flex-1 md:hidden" />
        <div className="hidden md:block">{handling}</div>
        <div className="md:hidden">
          <IkonKnapp merkelapp="Åpne meny" onClick={onMeny}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              aria-hidden="true"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </IkonKnapp>
        </div>
      </div>
    </header>
  );
}
