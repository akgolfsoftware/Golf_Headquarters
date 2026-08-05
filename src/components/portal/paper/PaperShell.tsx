"use client";

/**
 * PaperShell — PlayerHQ chrome 1:1 mot Claude Paper-fasiten
 * (playerhq-chat-desktop.html / -mobil.html).
 *
 * Fire flater: I dag · Plan · Analyse · Meg
 * Desktop: .rail 64px · Mobil: .tabs bunn
 * IKKE V2Shell.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, type ReactNode } from "react";

const NAV = [
  {
    id: "idag",
    label: "I dag",
    href: "/portal",
    match: (p: string) => p === "/portal",
  },
  {
    id: "plan",
    label: "Plan",
    href: "/portal/planlegge",
    match: (p: string) =>
      p.startsWith("/portal/planlegge") || p.startsWith("/portal/gjennomfore") || p.startsWith("/portal/live"),
  },
  {
    id: "analyse",
    label: "Analyse",
    href: "/portal/analysere",
    match: (p: string) => p.startsWith("/portal/analysere") || p.startsWith("/portal/analyse"),
  },
  {
    id: "meg",
    label: "Meg",
    href: "/portal/meg",
    match: (p: string) => p.startsWith("/portal/meg"),
  },
] as const;

/** Fasit-ikoner (stroke paths fra playerhq-chat-desktop.html) */
function NavIcon({ id }: { id: (typeof NAV)[number]["id"] }) {
  switch (id) {
    case "idag":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h9" />
        </svg>
      );
    case "plan":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      );
    case "analyse":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        </svg>
      );
    case "meg":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="3.4" />
          <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
        </svg>
      );
  }
}

function lesTema(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  if (document.documentElement.getAttribute("data-v2-tema") === "dark") return "dark";
  if (document.documentElement.getAttribute("data-theme") === "dark") return "dark";
  return "light";
}

function skrivTema(tema: "light" | "dark") {
  if (tema === "dark") {
    document.documentElement.setAttribute("data-v2-tema", "dark");
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  } else {
    document.documentElement.removeAttribute("data-v2-tema");
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }
  document.cookie = `ak-v2-tema=${tema};path=/;max-age=31536000;samesite=lax`;
  window.dispatchEvent(new Event("ak-v2-tema"));
}

export function PaperShell({
  children,
  /** «hjem» = rail + stage + artifact (chat). «plan» = rail + én kolonne (uten artifact). */
  surface = "hjem",
}: {
  children: ReactNode;
  surface?: "hjem" | "plan";
}) {
  const pathname = usePathname() || "/portal";

  const toggleTema = useCallback(() => {
    const neste = lesTema() === "dark" ? "light" : "dark";
    skrivTema(neste);
  }, []);

  return (
    <div
      className={surface === "plan" ? "paper-hjem paper-surface-plan" : "paper-hjem"}
      data-paper={surface}
    >
      <a className="skip" href={surface === "plan" ? "#plan-kropp" : "#thread"}>
        {surface === "plan" ? "Hopp til planen" : "Hopp til samtalen"}
      </a>

      <div className="app">
        {/* ══ RAIL — desktop (fire flater) ══ */}
        <nav className="rail" aria-label="Hovednavigasjon">
          <div className="logo">
            AK<span>.</span>
          </div>
          <div className="rnav">
            {NAV.map((n) => {
              const on = n.match(pathname);
              return (
                <Link
                  key={n.id}
                  href={n.href}
                  className="rbtn"
                  aria-current={on ? "page" : undefined}
                  data-surface={n.label}
                >
                  <NavIcon id={n.id} />
                  {n.label}
                </Link>
              );
            })}
          </div>
          <div className="railsp" />
          <button
            type="button"
            className="rbtn"
            id="themeToggle"
            onClick={toggleTema}
            aria-label="Bytt mellom lyst og mørkt tema"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4.2" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
            </svg>
            Tema
          </button>
        </nav>

        {children}

        {/* ══ BUNNFANER — mobil (.tabs) ══ */}
        <nav className="tabs" aria-label="Hovednavigasjon">
          {NAV.map((n) => {
            const on = n.match(pathname);
            return (
              <Link
                key={n.id}
                href={n.href}
                aria-current={on ? "page" : undefined}
                data-surface={n.label}
              >
                <NavIcon id={n.id} />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
