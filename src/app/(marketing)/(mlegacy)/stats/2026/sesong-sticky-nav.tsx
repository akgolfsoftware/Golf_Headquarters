"use client";

/**
 * SesongStickyNav — sticky smooth-scroll nav for sesongoversikt-sektioner.
 * Lime underline-indikator på aktiv seksjon.
 */

import { useEffect, useState, useCallback } from "react";

const SEKSJONER = [
  { id: "tall", label: "01 Aret i tall" },
  { id: "milepaeler", label: "02 Norske milepæler" },
  { id: "historier", label: "03 Historier" },
  { id: "rekorder", label: "04 Rekorder" },
  { id: "vinnere", label: "05 Alle vinnere" },
];

export function SesongStickyNav() {
  const [aktiv, setAktiv] = useState<string>("tall");

  const handleScroll = useCallback(() => {
    const scroll = window.scrollY + 100;
    let funnet = "tall";
    for (const s of SEKSJONER) {
      const el = document.getElementById(s.id);
      if (el && el.offsetTop <= scroll) funnet = s.id;
    }
    setAktiv(funnet);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Sesongoversikt-seksjoner"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(250,250,247,0.88)",
        backdropFilter: "blur(12px) saturate(140%)",
        WebkitBackdropFilter: "blur(12px) saturate(140%)",
        borderBottom: "1px solid var(--s-border)",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}
    >
      <div style={{ display: "flex", padding: "0 32px", gap: 0 }}>
        {SEKSJONER.map((s) => {
          const isAktiv = aktiv === s.id;
          return (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              style={{
                padding: "14px 18px",
                background: "transparent",
                border: "none",
                borderBottom: isAktiv ? "2px solid var(--s-accent)" : "2px solid transparent",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: isAktiv ? "var(--s-fg)" : "var(--s-muted-fg)",
                transition: "color 0.2s, border-color 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
