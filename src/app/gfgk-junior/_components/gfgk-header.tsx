"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Meny-rekkefølge er kanon fra design-prosjektets CLAUDE.md:
// Hjem · Starte med golf · Slik trener vi · Gruppene · Treningsplaner · Trenere ·
// Kunnskap · Kalender · Kontakt
const LENKER: { label: string; href: string; side?: AktivSide }[] = [
  { label: "Hjem", href: "/gfgk-junior", side: "hjem" },
  { label: "Starte med golf", href: "/gfgk-junior#slik-starter-du" },
  { label: "Slik trener vi", href: "/gfgk-junior#slik-trener-vi" },
  { label: "Gruppene", href: "/gfgk-junior#gruppene" },
  { label: "Treningsplaner", href: "/gfgk-junior/treningsplaner", side: "treningsplaner" },
  { label: "Trenere", href: "/gfgk-junior#trenere" },
  { label: "Kunnskap", href: "/gfgk-junior/veileder", side: "kunnskap" },
  { label: "Kalender", href: "/gfgk-junior#kalender" },
  { label: "Kontakt", href: "/gfgk-junior#kontakt" },
];

export type AktivSide = "hjem" | "treningsplaner" | "kunnskap" | "gruppe" | "kalender";

export function GfgkHeader({ aktiv }: { aktiv?: AktivSide }) {
  const [apen, setApen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{ background: "rgba(255,255,255,0.92)", borderColor: "var(--hairline)" }}
    >
      <div className="mx-auto flex min-h-12 max-w-[1200px] items-center gap-4 px-5 py-3 sm:px-7">
        <Link
          href="/gfgk-junior"
          className="flex items-center gap-3 no-underline"
          onClick={() => setApen(false)}
        >
          <Image
            src="/gfgk-junior/logo-mark.png"
            alt="GFGK"
            width={42}
            height={42}
            className="h-[42px] w-auto"
          />
          <span className="leading-none">
            <span className="block text-[12.5px] font-semibold" style={{ color: "var(--ink)" }}>
              GFGK
            </span>
            <span
              className="block text-[17px] font-bold uppercase tracking-[0.02em]"
              style={{ color: "var(--ink)" }}
            >
              Junior & Elite
            </span>
          </span>
        </Link>
        <div className="flex-1" />

        {/* Desktop-nav */}
        <nav className="hidden flex-wrap items-center justify-end gap-0.5 text-[14.5px] font-semibold lg:flex">
          {LENKER.map((l) => {
            const erAktiv = l.side != null && l.side === aktiv;
            return (
              <Link
                key={l.label}
                href={l.href}
                className="whitespace-nowrap rounded-lg px-2.5 py-2 no-underline transition-colors"
                style={
                  erAktiv
                    ? { color: "var(--teal-700)", background: "var(--teal-100)" }
                    : { color: "var(--ink)" }
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/portal"
          className="hidden items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-[12.5px] font-bold no-underline lg:inline-flex"
          style={{ color: "var(--teal-700)", background: "var(--teal-100)" }}
        >
          <span className="h-[7px] w-[7px] rounded-full" style={{ background: "var(--gfgk-teal)" }} />
          Spillerportal
        </Link>

        {/* Mobil: hamburger (min. 44px trykkflate) */}
        <button
          onClick={() => setApen((a) => !a)}
          aria-expanded={apen}
          aria-label={apen ? "Lukk meny" : "Åpne meny"}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent lg:hidden"
          style={{ color: "var(--ink)" }}
        >
          {apen ? <X className="h-6 w-6" strokeWidth={2.25} /> : <Menu className="h-6 w-6" strokeWidth={2.25} />}
        </button>
      </div>

      {/* Mobilmeny: stablede lenker, lukkes ved valg */}
      {apen ? (
        <nav
          className="border-t px-3 pb-4 pt-2 lg:hidden"
          style={{ background: "rgba(255,255,255,0.98)", borderColor: "var(--hairline)" }}
        >
          {LENKER.map((l) => {
            const erAktiv = l.side != null && l.side === aktiv;
            return (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setApen(false)}
                className="flex min-h-[44px] items-center rounded-lg px-3 text-[15.5px] font-semibold no-underline"
                style={
                  erAktiv
                    ? { color: "var(--teal-700)", background: "var(--teal-100)" }
                    : { color: "var(--ink)" }
                }
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/portal"
            onClick={() => setApen(false)}
            className="mt-2 inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-bold no-underline"
            style={{ color: "var(--teal-700)", background: "var(--teal-100)" }}
          >
            <span className="h-[7px] w-[7px] rounded-full" style={{ background: "var(--gfgk-teal)" }} />
            Spillerportal
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
