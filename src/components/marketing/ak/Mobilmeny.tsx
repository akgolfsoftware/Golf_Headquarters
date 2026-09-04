"use client";

import Link from "next/link";
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";

import { IkonKnapp } from "./IkonKnapp";
import { Logo } from "./Logo";
import { MOBILMENY_ID, type Lenke } from "./Toppnav";

/* Kilde: designsystem/ak-golf/components/navigasjon/Mobilmeny.jsx. Masteren
   bruker position:absolute inne i en relativ ramme; her er den fixed over hele
   skjermen og låser dokumentrullen mens den er åpen. Da er den en ekte modal,
   og får det masteren ikke trengte: fokus inn ved åpning, Escape lukker,
   Tab holder seg inne i dialogen, fokus tilbake til hamburgeren ved lukking. */

const FOKUSERBART =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!apen) return;
    const forrige = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.documentElement.style.overflow = "hidden";
    // Fokus inn: første fokuserbare er lukkeknappen.
    dialogRef.current?.querySelector<HTMLElement>(FOKUSERBART)?.focus();
    return () => {
      document.documentElement.style.overflow = "";
      forrige?.focus();
    };
  }, [apen]);

  if (!apen) return null;

  const paaTast = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onLukk();
      return;
    }
    if (e.key !== "Tab" || !dialogRef.current) return;
    const alle = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOKUSERBART));
    if (alle.length === 0) return;
    const forste = alle[0];
    const siste = alle[alle.length - 1];
    if (e.shiftKey && document.activeElement === forste) {
      e.preventDefault();
      siste.focus();
    } else if (!e.shiftKey && document.activeElement === siste) {
      e.preventDefault();
      forste.focus();
    }
  };

  return (
    <div
      ref={dialogRef}
      id={MOBILMENY_ID}
      role="dialog"
      aria-modal="true"
      aria-label="Meny"
      onKeyDown={paaTast}
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
