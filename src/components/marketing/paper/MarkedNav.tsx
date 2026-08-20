"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * MarkedNav — ENESTE header på landingssidene.
 *
 * Fasit: `nav.tsx` i designprosjektet ak-golf-website. Erstatter de tre
 * konkurrerende skallene marketing hadde før (PkShell, MRamme,
 * MarketingHeader) — fire ulike menyer på samme nettsted, målt 20.08.2026.
 *
 * Lenkene peker INTERNT (HQ eier både landingssidene og appen); fasiten
 * lenker ut til akgolf-hq.vercel.app fordi den er et eget deploy.
 * Sekundærsidene (coacher, anlegg, blogg, priser, …) bor i footeren —
 * menyen holdes bevisst på tre punkter, slik fasiten gjør det.
 */

const LENKER = [
  { href: "/coaching", label: "Coaching" },
  { href: "/playerhq", label: "AK Golf HQ" },
  { href: "/mulligan", label: "Mulligan Indoor Golf" },
];

export function MarkedNav() {
  const [apen, setApen] = useState(false);
  const lukk = () => setApen(false);

  useEffect(() => {
    document.documentElement.style.overflow = apen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [apen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-mk-border bg-mk-bg/90 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/brand/logo/ak-golf-logo-on-paper.svg"
              alt="AK Golf"
              width={36}
              height={31}
              priority
            />
            <span className="text-sm font-semibold tracking-wide">
              AK Golf Academy
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden items-center gap-8 text-sm md:flex">
            {LENKER.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-mk-muted transition-colors hover:text-mk-fg"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="rounded-full border border-mk-hairline px-5 py-2 font-medium transition-colors hover:border-mk-fg"
            >
              Logg inn
            </Link>
            <Link
              href="/booking"
              className="rounded-full bg-mk-cta px-5 py-2 font-medium text-mk-on-cta transition-colors hover:bg-mk-cta-hover"
            >
              Book kartleggingsøkt
            </Link>
          </div>

          {/* Mobil-knapp */}
          <button
            type="button"
            aria-expanded={apen}
            aria-label={apen ? "Lukk meny" : "Åpne meny"}
            onClick={() => setApen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-full md:hidden"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {apen ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobil-meny — søsken av header, ikke barn: `backdrop-blur` på headeren
          gjør den til containing block for `fixed`, som ville klippet menyen
          til 64 px høyde. Samme grunn som i fasiten. */}
      {apen && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col bg-mk-bg px-6 pb-10 pt-8 md:hidden">
          <div className="flex flex-col gap-2">
            {LENKER.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={lukk}
                className="rounded-2xl px-4 py-4 text-2xl font-semibold transition-colors hover:bg-mk-soft"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-3">
            <Link
              href="/auth/login"
              onClick={lukk}
              className="rounded-full border border-mk-hairline px-6 py-4 text-center font-medium"
            >
              Logg inn
            </Link>
            <Link
              href="/booking"
              onClick={lukk}
              className="rounded-full bg-mk-cta px-6 py-4 text-center font-medium text-mk-on-cta"
            >
              Book kartleggingsøkt
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
