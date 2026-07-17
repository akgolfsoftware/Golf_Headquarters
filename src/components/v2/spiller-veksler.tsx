"use client";

/* AK Golf HQ v2 — Spiller↔gruppe-veksler (D2, godkjent 17. juli 2026).
   Fast kontekst-veksler i AgencyOS-toppraden: coachen bytter mellom enkeltspiller
   og gruppe uansett hvor han står — uten å gå via Stallen hver gang.

   Ærlig, enkel implementasjon: veksleren er en NAVIGASJONS-dropdown (ikke global
   kontekst-state). Velg spiller → naviger til spillerens detalj; velg gruppe →
   gruppevisning. «Laster samme skjermtype for ny kontekst» (briefen) løses ved
   ruting, ikke delt state. Rendres KUN i AgencyOS (V2Shell gater på erAgency +
   at vekslerData er satt) — usatt prop skjuler veksleren, så ingen kallsteder
   tvinges til å endres. */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/v2/tokens";
import { Icon } from "./icon";
import { AvatarFoto } from "./core";

export interface VekslerSpiller {
  id: string;
  navn: string;
  /** Gruppe-etikett (vises som sub-linje). */
  gruppe?: string | null;
  avatarUrl?: string | null;
}

export interface VekslerGruppe {
  id: string;
  navn: string;
  /** Målrute for gruppevisningen (settes av kallstedet — f.eks. /admin/grupper/[id]). */
  href: string;
  antall?: number | null;
}

export interface VekslerData {
  spillere: VekslerSpiller[];
  grupper: VekslerGruppe[];
  /** Aktiv kontekst-etikett i triggeren (default «Hele stallen»). */
  aktivNavn?: string;
  aktivType?: "spiller" | "gruppe" | null;
  aktivAvatarUrl?: string | null;
  /** Rutebase for spiller-detalj (default «/admin/spillere»). */
  spillerHrefBase?: string;
  /** Ærlig laster-tilstand mens lista hentes. */
  laster?: boolean;
}

function SeksjonHode({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, padding: "10px 12px 6px" }}>
      {children}
    </div>
  );
}

function TomLinje({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, padding: "8px 12px 12px", lineHeight: 1.5 }}>
      {children}
    </div>
  );
}

export function SpillerVeksler({ data }: { data: VekslerData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sok, setSok] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aktivNavn = data.aktivNavn ?? "Hele stallen";
  const aktivType = data.aktivType ?? null;
  const spillerBase = data.spillerHrefBase ?? "/admin/spillere";

  const lukk = () => { setOpen(false); setSok(""); };

  // Lukk ved klikk utenfor + Escape.
  useEffect(() => {
    if (!open) return;
    const utenfor = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) lukk();
    };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") lukk(); };
    document.addEventListener("mousedown", utenfor);
    window.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", utenfor);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  // Fokuser søket når panelet åpnes (DOM-API, ingen setState i effekten).
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const q = sok.trim().toLowerCase();
  const spillereFiltrert = useMemo(
    () => (q ? data.spillere.filter((s) => s.navn.toLowerCase().includes(q)) : data.spillere),
    [data.spillere, q],
  );
  const grupperFiltrert = useMemo(
    () => (q ? data.grupper.filter((g) => g.navn.toLowerCase().includes(q)) : data.grupper),
    [data.grupper, q],
  );

  const velgSpiller = (id: string) => {
    lukk();
    router.push(`${spillerBase}/${id}`);
  };
  const velgGruppe = (href: string) => {
    lukk();
    router.push(href);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "fit-content" }}>
      <button
        type="button"
        onClick={() => (open ? lukk() : setOpen(true))}
        aria-haspopup="menu"
        aria-expanded={open}
        className="v2-press v2-focus"
        style={{ display: "inline-flex", alignItems: "center", gap: 9, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 9999, padding: "6px 12px 6px 8px", cursor: "pointer", maxWidth: "100%" }}
      >
        {aktivType === "spiller" ? (
          <AvatarFoto src={data.aktivAvatarUrl ?? undefined} navn={aktivNavn} size={22} />
        ) : (
          <span style={{ width: 22, height: 22, borderRadius: 9999, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <Icon name="users" size={12} style={{ color: T.fg2 }} />
          </span>
        )}
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 0 }}>
          <span style={{ fontFamily: T.mono, fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, lineHeight: 1 }}>Kontekst</span>
          <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>{aktivNavn}</span>
        </span>
        <Icon name="chevron-down" size={14} style={{ color: T.mut, flex: "none", transform: open ? "rotate(180deg)" : undefined, transition: `transform ${T.dur}ms ${T.ease}` }} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Bytt kontekst"
          className="v2-fade-in"
          style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 80, width: 320, maxWidth: "calc(100vw - 32px)", maxHeight: "min(460px, 70vh)", overflowY: "auto", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
        >
          {/* Søk */}
          <div style={{ position: "sticky", top: 0, background: T.panel, padding: "10px 10px 8px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 9999, padding: "7px 12px" }}>
              <Icon name="search" size={14} style={{ color: T.mut, flex: "none" }} />
              <input
                ref={inputRef}
                value={sok}
                onChange={(e) => setSok(e.target.value)}
                placeholder="Søk spiller eller gruppe …"
                aria-label="Søk spiller eller gruppe"
                style={{ flex: 1, minWidth: 0, appearance: "none", background: "transparent", border: 0, outline: "none", color: T.fg, fontFamily: T.ui, fontSize: 13 }}
              />
            </div>
          </div>

          {data.laster ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 12px", color: T.mut, fontFamily: T.ui, fontSize: 12.5 }}>
              <Icon name="loader" size={14} style={{ color: T.mut }} />
              Laster stallen …
            </div>
          ) : (
            <>
              {/* Spillere */}
              <SeksjonHode>Spillere</SeksjonHode>
              {data.spillere.length === 0 ? (
                <TomLinje>Ingen spillere i stallen ennå.</TomLinje>
              ) : spillereFiltrert.length === 0 ? (
                <TomLinje>Ingen spillere matcher «{sok.trim()}».</TomLinje>
              ) : (
                <div style={{ padding: "0 6px" }}>
                  {spillereFiltrert.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="menuitem"
                      onClick={() => velgSpiller(s.id)}
                      className="v2-press v2-focus v2-row-h"
                      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: "transparent", border: 0, borderRadius: 9, padding: "8px 8px", cursor: "pointer" }}
                    >
                      <AvatarFoto src={s.avatarUrl ?? undefined} navn={s.navn} size={26} />
                      <span style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                        <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.navn}</span>
                        {s.gruppe && <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em", color: T.mut }}>{s.gruppe}</span>}
                      </span>
                      <Icon name="chevron-right" size={13} style={{ color: T.mut, flex: "none" }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Grupper */}
              <SeksjonHode>Grupper</SeksjonHode>
              {data.grupper.length === 0 ? (
                <TomLinje>Ingen grupper ennå — veksleren viser bare spillere.</TomLinje>
              ) : grupperFiltrert.length === 0 ? (
                <TomLinje>Ingen grupper matcher «{sok.trim()}».</TomLinje>
              ) : (
                <div style={{ padding: "0 6px 8px" }}>
                  {grupperFiltrert.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      role="menuitem"
                      onClick={() => velgGruppe(g.href)}
                      className="v2-press v2-focus v2-row-h"
                      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: "transparent", border: 0, borderRadius: 9, padding: "8px 8px", cursor: "pointer" }}
                    >
                      <span style={{ width: 26, height: 26, borderRadius: 8, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                        <Icon name="users" size={13} style={{ color: T.fg2 }} />
                      </span>
                      <span style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                        <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.navn}</span>
                        {g.antall != null && <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em", color: T.mut }}>{g.antall} spillere</span>}
                      </span>
                      <Icon name="chevron-right" size={13} style={{ color: T.mut, flex: "none" }} />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
