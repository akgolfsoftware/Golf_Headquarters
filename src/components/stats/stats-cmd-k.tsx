"use client";

/**
 * StatsCmdK — Cmd+K / Ctrl+K command palette modal for Stats pages
 * Can be dropped into any Stats layout.
 *
 * Usage:
 *   <StatsCmdK />
 *
 * Opens on:
 *   - Meta+K (Mac) / Ctrl+K (Windows/Linux)
 *   - Clicking the ⌘K trigger button
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { StatsIcon } from "./icon";

interface SearchResult {
  type: "spiller" | "pga" | "turnering" | "side";
  label: string;
  sub?: string;
  href: string;
}

const NAV_SIDER: SearchResult[] = [
  { type: "side", label: "Leaderboards",      sub: "Alle topp-10-ene",             href: "/stats/leaderboards" },
  { type: "side", label: "PGA Tour Stats",    sub: "Drive, GIR, putting, SG",      href: "/stats/pga" },
  { type: "side", label: "Norske spillere",   sub: "Søkbar spillerbase",            href: "/stats/spillere" },
  { type: "side", label: "SG-sammenligning",  sub: "Sammenligna deg med proffene",  href: "/stats/sg-sammenlign" },
  { type: "side", label: "Årganger",          sub: "Kohort-explorer 2000-2012",     href: "/stats/aargang" },
  { type: "side", label: "Regioner",          sub: "Golf i Øst, Vest, Midt, Nord, Sør", href: "/stats/regions" },
  { type: "side", label: "Srixon Tour",       sub: "Tour deep-dive",                href: "/stats/tour/srixon" },
  { type: "side", label: "OLYO Juniortour",   sub: "Tour deep-dive",                href: "/stats/tour/olyo" },
  { type: "side", label: "Garmin NGC",        sub: "Tour deep-dive",                href: "/stats/tour/garmin-ngc" },
  { type: "side", label: "Østlandstour",      sub: "Tour deep-dive",                href: "/stats/tour/ostlandstour" },
  { type: "side", label: "Globalt søk",       sub: "Søk spillere, klubber, turneringer", href: "/stats/sok" },
];

const TYPE_LABELS: Record<SearchResult["type"], string> = {
  spiller: "Norsk spiller",
  pga: "PGA Tour",
  turnering: "Turnering",
  side: "Side",
};

const TYPE_ICONS: Record<SearchResult["type"], "User" | "Trophy" | "Flag" | "LayoutGrid"> = {
  spiller: "User",
  pga: "Trophy",
  turnering: "Flag",
  side: "LayoutGrid",
};

export function StatsCmdK() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const resultater: SearchResult[] = query.trim()
    ? NAV_SIDER.filter(
        (s) =>
          s.label.toLowerCase().includes(query.toLowerCase()) ||
          (s.sub ?? "").toLowerCase().includes(query.toLowerCase()),
      )
    : NAV_SIDER.slice(0, 7);

  const lukk = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelected(0);
  }, []);

  const apne = useCallback(() => {
    setOpen(true);
    setSelected(0);
    setTimeout(() => inputRef.current?.focus(), 30);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) { lukk(); } else { apne(); }
      }
      if (e.key === "Escape" && open) lukk();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, lukk, apne]);

  const navigerTil = (href: string) => {
    lukk();
    window.location.href = href;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, resultater.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && resultater[selected]) {
      navigerTil(resultater[selected].href);
    }
  };

  return (
    <>
      {/* Trigger-knapp — liten CTA i hjørnet av siden */}
      <button
        onClick={apne}
        aria-label="Åpne søk (Cmd+K)"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          background: "var(--s-card)",
          border: "1px solid var(--s-border)",
          borderRadius: 999,
          boxShadow: "var(--s-shadow-md)",
          cursor: "pointer",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--s-muted-fg)",
          transition: "box-shadow .15s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--s-shadow-hover)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--s-shadow-md)")
        }
      >
        <StatsIcon name="Search" size={14} />
        <span>Søk</span>
        <span
          style={{
            padding: "2px 6px",
            background: "var(--s-secondary)",
            borderRadius: 4,
            fontSize: 10,
            letterSpacing: "0.06em",
          }}
        >
          ⌘K
        </span>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Søk"
          onClick={(e) => e.target === e.currentTarget && lukk()}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(10, 31, 23, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "15vh",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 580,
              margin: "0 16px",
              background: "var(--s-card)",
              border: "1px solid var(--s-border)",
              borderRadius: "var(--s-r-xl)",
              boxShadow: "var(--s-shadow-lg)",
              overflow: "hidden",
            }}
          >
            {/* Input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                borderBottom: "1px solid var(--s-border)",
              }}
            >
              <StatsIcon name="Search" size={18} style={{ color: "var(--s-muted-fg)", flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Søk spillere, turneringer, sider…"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 16,
                  fontFamily: "inherit",
                  color: "var(--s-fg)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  color: "var(--s-muted-fg)",
                  padding: "3px 7px",
                  background: "var(--s-secondary)",
                  borderRadius: 4,
                  flexShrink: 0,
                }}
              >
                ESC
              </span>
            </div>

            {/* Results */}
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {resultater.length === 0 ? (
                <div
                  style={{
                    padding: "32px 20px",
                    textAlign: "center",
                    color: "var(--s-muted-fg)",
                    fontSize: 14,
                  }}
                >
                  Ingen treff for &ldquo;{query}&rdquo;
                </div>
              ) : (
                resultater.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => navigerTil(r.href)}
                    onMouseEnter={() => setSelected(i)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 20px",
                      width: "100%",
                      background: selected === i ? "var(--s-secondary)" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      borderRadius: 0,
                      transition: "background .1s",
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--s-secondary)",
                        borderRadius: 8,
                        flexShrink: 0,
                        color: "var(--s-primary)",
                      }}
                    >
                      <StatsIcon name={TYPE_ICONS[r.type]} size={14} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 500,
                          fontSize: 14,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {r.label}
                      </div>
                      {r.sub && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--s-muted-fg)",
                            marginTop: 1,
                          }}
                        >
                          {r.sub}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--s-muted-fg)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        flexShrink: 0,
                      }}
                    >
                      {TYPE_LABELS[r.type]}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div
              style={{
                padding: "8px 20px",
                borderTop: "1px solid var(--s-border)",
                display: "flex",
                gap: 16,
              }}
            >
              {[
                { key: "↑↓", label: "navigere" },
                { key: "↩", label: "velg" },
                { key: "ESC", label: "lukk" },
              ].map((k) => (
                <span
                  key={k.key}
                  style={{
                    fontSize: 11,
                    color: "var(--s-muted-fg)",
                    fontFamily: "var(--font-mono)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      padding: "1px 5px",
                      background: "var(--s-secondary)",
                      borderRadius: 4,
                      fontWeight: 500,
                    }}
                  >
                    {k.key}
                  </span>
                  {k.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
