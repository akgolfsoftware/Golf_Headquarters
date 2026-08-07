"use client";

/* AK Golf HQ v2 — produksjons-app-shell (fase 6). Fluid motpart til mockupens
   `Skjerm` (som er en fast 1280/390px device-frame for lerretet): samme chrome
   (smal IkonRail på desktop, BunnNav på mobil — Anders 9. juli: ingen bred
   sidemeny), men width:100% og ekte Next-Link-navigasjon. ERSTATTER den gamle
   PortalShell/AdminShell for v2-migrerte flater (vei A — unngår dobbel shell).
   Mørk (retning C, mørk-først): setter dark-scope + T.bg-vignett på hele viewporten.

   AgencyOS (2026-07-12): full seksjonsnav (10 punkter) + «Mer»-meny som gjør
   HELE flaten nåbar (varsler, godkjenninger, grupper, tester, rapporter m.fl.),
   og full desktop-bredde (coach-kontrolltårn skal ikke være en 1120px-stripe).
   Mobil: de 4 første punktene + Mer-ark med resten. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { T } from "@/lib/v2/tokens";
import { Icon } from "./icon";
import { LogoAK, AvatarFoto } from "./core";
import { SpillerVeksler, type VekslerData } from "./spiller-veksler";
import { useErAdmin } from "./rolle";
import { GlobalSearchModal } from "@/components/admin/global-search-modal";

// D2 (17. juli): re-eksporter veksler-datakontrakten fra shellen så kallsteder
// (cockpit m.fl.) kan importere den fra samme sted som V2Shell.
export type { VekslerData, VekslerSpiller, VekslerGruppe } from "./spiller-veksler";

export interface V2NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  /** Skjules for COACH i AgencyOS — siden bak er ADMIN-only (server-gated). */
  adminOnly?: boolean;
}

/** Gruppe i «Mer»-menyen (AgencyOS lang hale). */
export interface V2NavGruppe {
  label: string;
  items: V2NavItem[];
}

/**
 * Ett «rom» i AgencyOS-Mer (IA 2026-07-26, Open Design `mer-sheet.html`).
 * Mer er fem rom — ikke en katalog. Hvert rom er ÉN rad som eier sitt område;
 * dyp-katalogen nås via Cmd+K-søket (se `global-search-modal.tsx`).
 */
export interface V2Rom {
  id: string;
  label: string;
  /** Hva rommet dekker — én linje, ellipse ved overflyt. */
  beskrivelse: string;
  /** Kort mono-merkelapp til høyre (AI / Trening / Struktur / Penger / System). */
  meta: string;
  icon: string;
  href: string;
  /** Skjules for COACH — siden bak er ADMIN-only (server-gated). */
  adminOnly?: boolean;
  /** Lime-fremhevet rad. Maks ÉN — ellers ryker «én lime-jobb per skjerm». */
  pin?: boolean;
}

/**
 * PlayerHQ-navigasjon (4 faner, låst 05.08.2026 — monsterdokument-paper.md §6).
 * «Gjør» utgår: live-økt/runde/test åpnes fra I dag eller Plan, ikke egen fane.
 * Sider som fortsatt sender aktiv="gjor" får ingen markert fane — bevisst.
 */
export const PLAYERHQ_NAV: V2NavItem[] = [
  { id: "hjem", label: "I dag", icon: "home", href: "/portal" },
  { id: "plan", label: "Plan", icon: "calendar", href: "/portal/planlegge" },
  { id: "analyse", label: "Analyse", icon: "bar-chart", href: "/portal/analysere" },
  { id: "meg", label: "Meg", icon: "user", href: "/portal/meg" },
];

/**
 * AgencyOS primær-nav: 5 jobber. Hub-faner (Kø / Kalender / Innsikt) samler
 * det som tidligere var 20+ «Mer»-lenker. Se agency-hub-subnav.tsx.
 */
export const AGENCYOS_NAV: V2NavItem[] = [
  { id: "cockpit", label: "Hjem", icon: "home", href: "/admin/agencyos" },
  { id: "spillere", label: "Stall", icon: "users", href: "/admin/spillere" },
  { id: "kalender", label: "Kalender", icon: "calendar", href: "/admin/kalender" },
  { id: "innboks", label: "Kø", icon: "inbox", href: "/admin/godkjenninger" },
  { id: "innsikt", label: "Innsikt", icon: "bar-chart", href: "/admin/analyse" },
];

/**
 * AgencyOS «Mer» — FEM ROM (IA 2026-07-26, fasit `mer-sheet.html`).
 *
 * Erstatter den gamle katalogen på ~30 lenker i fem grupper, inkludert
 * «Avansert»-blokken. Regler fra fasiten:
 *   1. Fem rom, én rad hver — rommet eier sitt område.
 *   2. Railen vinner ved dublett: Kø, Kalender og Innsikt står IKKE her.
 *   3. Resten (audit-log, marketing, tjenester, workspace, dyp-katalog) lever
 *      i Cmd+K-søket. De ble lagt inn i `global-search-modal.tsx` samtidig som
 *      denne listen ble kuttet — ellers hadde 13 sider mistet all vei inn.
 *
 * Plan/Stall+/Drift har ennå ingen egen hub-side (kommer senere). Til da peker
 * hvert rom på den mest dekkende EKSISTERENDE ruten, slik at ingen rad er død.
 */
export const AGENCYOS_ROM: V2Rom[] = [
  {
    id: "agenticos",
    label: "AgenticOS",
    beskrivelse: "Caddie, AI-agenter, agent-team, daglig brief",
    meta: "AI",
    icon: "bot",
    href: "/admin/agents",
  },
  {
    id: "plan",
    label: "Plan",
    beskrivelse: "Workbench, maler, drills, turneringer, teknisk",
    meta: "Trening",
    icon: "target",
    href: "/admin/planlegge",
  },
  {
    id: "stall-pluss",
    label: "Stall+",
    beskrivelse: "Grupper, ny spiller, talent",
    meta: "Struktur",
    icon: "user-plus",
    href: "/admin/grupper",
  },
  {
    id: "okonomi",
    label: "Økonomi",
    beskrivelse: "Belegg, inntekt, abonnement, faktura, rapporter",
    meta: "Penger",
    icon: "credit-card",
    href: "/admin/agencyos/okonomi",
    adminOnly: true,
    pin: true,
  },
  {
    id: "drift",
    label: "Drift",
    beskrivelse: "Innstillinger, team, integrasjoner, sikkerhet",
    meta: "System",
    icon: "settings",
    href: "/admin/settings",
    adminOnly: true,
  },
];

/** Foreldre-navigasjon (lese-først oversikt). Fire enkle seksjoner. */
export const FORELDER_NAV: V2NavItem[] = [
  { id: "oversikt", label: "Oversikt", icon: "home", href: "/forelder" },
  { id: "barn", label: "Barn", icon: "users", href: "/forelder/barn" },
  { id: "okonomi", label: "Økonomi", icon: "credit-card", href: "/forelder/okonomi" },
  { id: "coach", label: "Meldinger", icon: "message-circle", href: "/forelder/coach" },
];

export interface V2ShellProps {
  /** Aktiv nav-id (matcher V2NavItem.id). */
  aktiv?: string;
  /** Navigasjonsoppsett (default PlayerHQ). */
  nav?: V2NavItem[];
  /** «Mer»-grupper. Brukes av PlayerHQ-bunn-nav for seksjoner som ikke får plass. */
  mer?: V2NavGruppe[];
  /** «Mer»-rom (AgencyOS). Auto: AGENCYOS_ROM når nav er AGENCYOS_NAV. */
  rom?: V2Rom[];
  /** Innlogget brukers navn (for avatar-initialer/tittel). */
  navn?: string;
  /** Opplastet profilbilde-URL, hvis satt (ellers init-avatar). */
  avatarUrl?: string | null;
  /**
   * D2 — spiller↔gruppe-veksler i AgencyOS-toppraden. VALGFRITT: uten dette
   * (default `undefined`) vises ingen veksler, så ingen av de ~50 kallstedene
   * må endres. Sett den (kun meningsfullt sammen med nav=AGENCYOS_NAV) fra en
   * side som vil tilby kontekst-veksling.
   */
  vekslerData?: VekslerData;
  /**
   * Innholdsbredde (monsterdokument-paper.md §1: «Tråd/hovedkolonne: sentrert
   * med max-width:74ch (AgencyOS) eller max-width:720px (PlayerHQ)»).
   * `"kolonne"` sentrerer children i denne bredden — riktig for enkeltside-
   * mønstre (detalj/skjema/innstillinger, monsterdokumentet §12). `"full"`
   * (default, uendret oppførsel) er for skjermer som allerede eier sin egen
   * flerkolonne-layout (Hjem/Konsoll med artefaktpanel, Workbench,
   * tabell-tunge oversikter) — disse skal IKKE tvinges inn i en smal kolonne
   * her, men bygge sin egen riktige bredde internt.
   * Default er bevisst `"full"` (ikke fasitens narrow-som-standard) fordi en
   * global bytting av standard ville endret ~280 uverifiserte skjermer på én
   * gang — samme feil som skjermbilde-gaten finnes for å hindre. Skjermer
   * settes til `"kolonne"` én om gangen, verifisert.
   */
  bredde?: "kolonne" | "full";
  children: ReactNode;
}

/* ---------- DS2: tema (lys default på app-flater, mørk via bryter — 25. jul) ---------- */

type V2Tema = "dark" | "light";

function lesTema(): V2Tema {
  if (typeof document === "undefined") return "light";
  // Fase F: CSS default = lys; mørk kun med eksplisitt data-v2-tema="dark"
  return document.documentElement.getAttribute("data-v2-tema") === "dark" ? "dark" : "light";
}

function abonnerTema(cb: () => void) {
  window.addEventListener("ak-v2-tema", cb);
  return () => window.removeEventListener("ak-v2-tema", cb);
}

/**
 * Tema-tilstand for v2-flatene. Sannheten bor på <html data-v2-tema> (satt før
 * paint av inline-scriptet i rot-layout) + cookie `ak-v2-tema`; hooken speiler
 * den og synker alle instanser via et vindus-event. SSR-snapshot er lys
 * (app-flatene er lys-først fra 25. jul — mørk kommer kun fra cookie
 * `ak-v2-tema=dark`, som serveren ikke kjenner her) — React retter ved hydration.
 */
function useV2Tema() {
  const tema = useSyncExternalStore<V2Tema>(abonnerTema, lesTema, () => "light");
  const bytt = () => {
    const neste: V2Tema = lesTema() === "light" ? "dark" : "light";
    if (neste === "dark") document.documentElement.setAttribute("data-v2-tema", "dark");
    else document.documentElement.removeAttribute("data-v2-tema");
    document.cookie = `ak-v2-tema=${neste};path=/;max-age=31536000;samesite=lax`;
    window.dispatchEvent(new Event("ak-v2-tema"));
  };
  return { tema, bytt };
}

/** Sol/måne-knapp i railen (desktop). Viser det du BYTTER TIL. */
/** Coach/Spiller-toggle (Anders 2026-07-13): coacher og admin har alt
 *  tilgang til hele PlayerHQ (canAccessPortalRoute) — dette er den synlige
 *  veksleren. I AgencyOS vises den alltid (alle der er coach/admin); i
 *  PlayerHQ vises den kun når ak-coach-cookien finnes (settes ved besøk i
 *  AgencyOS — spillere får den aldri). Cookien styrer KUN visning av
 *  lenken; /admin-tilgangen håndheves av serverens guards som før. */
function ProfilBytteKnapp({ erAgency }: { erAgency: boolean }) {
  const erCoach = useSyncExternalStore(
    (cb) => { window.addEventListener("focus", cb); return () => window.removeEventListener("focus", cb); },
    () => document.cookie.includes("ak-coach=1"),
    () => false,
  );
  if (!erAgency && !erCoach) return null;
  const href = erAgency ? "/portal" : "/admin/agencyos";
  const label = erAgency ? "Spiller-profil" : "Coach-profil";
  return (
    <Link
      href={href}
      title={label}
      className="v2-press v2-focus"
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", color: T.mut, padding: "6px 0", width: "100%" }}
    >
      <Icon name={erAgency ? "user" : "clipboard-list"} size={16} />
      <span style={{ fontFamily: T.mono, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.08em" }}>{erAgency ? "SPILLER" : "COACH"}</span>
    </Link>
  );
}

function TemaRailKnapp() {
  const { tema, bytt } = useV2Tema();
  const tilLys = tema === "dark";
  return (
    <button
      onClick={bytt}
      title={tilLys ? "Bytt til lys modus" : "Bytt til mørk modus"}
      className="v2-press v2-focus"
      style={{ width: 46, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "7px 0 5px", borderRadius: 12, background: "transparent", border: 0, cursor: "pointer", flex: "none", marginBottom: 8 }}
    >
      <Icon name={tilLys ? "sun" : "moon"} size={18} style={{ color: T.mut }} strokeWidth={1.5} />
      <span style={{ fontFamily: T.mono, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: T.mut }}>{tilLys ? "Lys" : "Mørk"}</span>
    </button>
  );
}

/** Ett rail-punkt (desktop). */
function RailLenke({ item, on }: { item: V2NavItem; on: boolean }) {
  return (
    <Link
      href={item.href}
      title={item.label}
      aria-current={on ? "page" : undefined}
      className="v2-press v2-focus"
      style={{ width: 46, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "7px 0 5px", borderRadius: 12, background: on ? `color-mix(in srgb, ${T.lime} 9%, transparent)` : "transparent", textDecoration: "none", position: "relative", flex: "none" }}
    >
      {on && <span style={{ position: "absolute", left: -7, top: 10, bottom: 10, width: 2, borderRadius: 2, background: T.lime }} />}
      <Icon name={item.icon} size={18} style={{ color: on ? T.lime : T.mut }} strokeWidth={on ? 2 : 1.5} />
      <span style={{ fontFamily: T.mono, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: on ? T.fg : T.mut }}>{item.label}</span>
    </Link>
  );
}

/** «Mer»-panelet — grupperte lenker. Desktop: flytende panel ved railen.
 *  mobil: bunn-ark (72vh). mobil+full: full-høyde skuff (kandidat A, godkjent
 *  17. juli for AgencyOS-mobil) — dekker viewporten fra topp til bunn. */
function MerPanel({ grupper, rom, onClose, mobil, full, erAgency }: { grupper?: V2NavGruppe[]; rom?: V2Rom[]; onClose: () => void; mobil?: boolean; full?: boolean; erAgency?: boolean }) {
  const pathname = usePathname();
  const { tema, bytt } = useV2Tema();
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);
  // BUGFIX (sett i prod 12. juli): panelet ble liggende åpent over innholdet
  // etter navigering (klikk traff «feil skjerm»). Lukk ved ETHVERT rutebytte.
  const [apnetPa] = useState(pathname);
  useEffect(() => {
    if (pathname !== apnetPa) onClose();
  }, [pathname, apnetPa, onClose]);

  // Portal til <body>: railen (position: sticky) og bunn-navene (fixed +
  // zIndex) lager egne stacking-contexter, så panelets zIndex 91 gjaldt bare
  // INNE i nav-en — Workbench-innhold (sett i prod 19. juli) malte seg over
  // panelet og backdropen dimmet aldri siden. Tokens er globale --v2-*-vars
  // på <html>, så temaet følger med ut. Panelet monteres kun etter klikk
  // (post-hydrering), så document finnes alltid her.
  return createPortal(
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 90, background: T.farge.svartA55 }} aria-hidden />
      <div
        role="menu"
        aria-label="Mer"
        style={
          mobil
            ? full
              ? { position: "fixed", inset: 0, zIndex: 91, overflowY: "auto", background: T.panel, opacity: 1, borderRadius: 0, padding: "calc(14px + env(safe-area-inset-top)) 16px calc(20px + env(safe-area-inset-bottom))", boxShadow: "0 -18px 48px rgba(0,0,0,0.5)" }
              : { position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 91, maxHeight: "72vh", overflowY: "auto", background: T.panel, opacity: 1, border: `1px solid ${T.border}`, borderRadius: "18px 18px 0 0", padding: "14px 16px calc(20px + env(safe-area-inset-bottom))", boxShadow: "0 -18px 48px rgba(0,0,0,0.5)" }
            : { position: "fixed", left: 68, top: 12, bottom: 12, zIndex: 91, width: rom && rom.length > 0 ? 420 : 560, maxWidth: "calc(100vw - 84px)", overflowY: "auto", background: T.panel, opacity: 1, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px 20px", boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }
        }
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>
            {rom && rom.length > 0 ? `Mer · ${rom.length} rom` : "Alle flater"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {erAgency && (
              // Touch-tilgang til globalt søk (Cmd+K har ingen ekvivalent på
              // mobil/iPad) — funnet manglet helt i AgencyOS 19. juli, fikset her
              // fordi «Mer» er det ene stedet som nås fra BÅDE rail og bunn-nav.
              <button
                onClick={() => { onClose(); window.dispatchEvent(new CustomEvent("global-search:open")); }}
                className="v2-press"
                aria-label="Åpne globalt søk"
                style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, color: T.fg2, cursor: "pointer", padding: "4px 9px" }}
              >
                <Icon name="search" size={13} />
                <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Søk</span>
              </button>
            )}
            <button
              onClick={bytt}
              className="v2-press"
              aria-label={tema === "dark" ? "Bytt til lys modus" : "Bytt til mørk modus"}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.border}`, borderRadius: 8, color: T.fg2, cursor: "pointer", padding: "4px 9px" }}
            >
              <Icon name={tema === "dark" ? "sun" : "moon"} size={13} />
              <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>{tema === "dark" ? "Lys" : "Mørk"}</span>
            </button>
            <button onClick={onClose} className="v2-press" aria-label="Lukk" style={{ background: "transparent", border: 0, color: T.mut, cursor: "pointer", padding: 4 }}>
              <Icon name="x" size={16} />
            </button>
          </div>
        </div>
        <div style={mobil ? { display: "flex", flexDirection: "column", gap: 14 } : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 22px" }}>
          {(grupper ?? []).map((g) => (
            <div key={g.label}>
              <div style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut, marginBottom: 6 }}>{g.label}</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {g.items.map((it) => {
                  const on = pathname === it.href;
                  return (
                    <Link
                      key={it.id}
                      href={it.href}
                      onClick={onClose}
                      role="menuitem"
                      className="v2-press v2-focus"
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 8px", borderRadius: 9, textDecoration: "none", color: on ? T.lime : T.fg, background: on ? `color-mix(in srgb, ${T.lime} 8%, transparent)` : "transparent" }}
                    >
                      <Icon name={it.icon} size={15} style={{ color: on ? T.lime : T.mut, flex: "none" }} />
                      <span style={{ fontSize: 12.5, fontWeight: 500 }}>{it.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {rom && rom.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: grupper && grupper.length > 0 ? 16 : 0 }}>
            {rom.map((r) => {
              const on = pathname === r.href || pathname.startsWith(r.href + "/");
              const fremhevet = r.pin || on;
              return (
                <Link
                  key={r.id}
                  href={r.href}
                  onClick={onClose}
                  role="menuitem"
                  className="v2-press v2-focus"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr auto",
                    gap: 12,
                    alignItems: "center",
                    padding: 12,
                    minHeight: 44,
                    borderRadius: T.rRow,
                    textDecoration: "none",
                    color: T.fg,
                    background: fremhevet ? `color-mix(in srgb, ${T.lime} 8%, transparent)` : "transparent",
                    border: `1px solid ${fremhevet ? `color-mix(in srgb, ${T.lime} 22%, ${T.border})` : "transparent"}`,
                  }}
                >
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                      flex: "none",
                      background: fremhevet ? `color-mix(in srgb, ${T.lime} 14%, ${T.panel3})` : T.panel3,
                      border: `1px solid ${fremhevet ? `color-mix(in srgb, ${T.lime} 28%, ${T.border})` : T.border}`,
                      color: fremhevet ? T.lime : T.fg2,
                    }}
                  >
                    <Icon name={r.icon} size={18} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: T.disp, fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 3 }}>{r.label}</span>
                    <span style={{ display: "block", fontSize: 12, lineHeight: 1.4, color: T.mut, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.beskrivelse}</span>
                  </span>
                  <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.02em", color: fremhevet ? T.lime : T.mut }}>{r.meta}</span>
                </Link>
              );
            })}
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.4, color: T.mut }}>
                Resten (audit-log, marketing, dyp-katalog) lever i søk — ikke her.
              </p>
              <kbd style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.panel2, color: T.fg2, flex: "none" }}>⌘K</kbd>
            </div>
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}

/** Smal ikon-rail (desktop) — ett Link-punkt per seksjon, lime-indikator på aktiv. */
function IkonRailNav({ aktiv, nav, mer, rom, navn, avatarUrl, erAgency }: Required<Pick<V2ShellProps, "nav" | "navn">> & { aktiv?: string; mer?: V2NavGruppe[]; rom?: V2Rom[]; avatarUrl?: string | null; erAgency?: boolean }) {
  const [merOpen, setMerOpen] = useState(false);
  return (
    <nav
      className="hidden md:flex"
      style={{ width: 60, flex: "none", borderRight: `1px solid ${T.border}`, flexDirection: "column", alignItems: "center", padding: "14px 0 12px", gap: 2, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}
      aria-label="Hovedmeny"
    >
      <LogoAK size={26} surface="ink" style={{ marginBottom: 12, flex: "none" }} />
      {nav.map((n) => <RailLenke key={n.id} item={n} on={aktiv === n.id} />)}
      {((mer && mer.length > 0) || (rom && rom.length > 0)) && (
        <button
          onClick={() => setMerOpen(true)}
          title="Mer"
          aria-haspopup="menu"
          aria-expanded={merOpen}
          className="v2-press v2-focus"
          style={{ width: 46, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "7px 0 5px", borderRadius: 12, background: "transparent", border: 0, cursor: "pointer", flex: "none" }}
        >
          <Icon name="more-horizontal" size={18} style={{ color: aktiv === "mer" ? T.lime : T.mut }} strokeWidth={1.5} />
          <span style={{ fontFamily: T.mono, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: aktiv === "mer" ? T.fg : T.mut }}>Mer</span>
        </button>
      )}
      <div style={{ flex: 1, minHeight: 8 }} />
      <ProfilBytteKnapp erAgency={!!erAgency} />
      {/* Tema-bryteren vises på ALLE v2-flater (25. jul): lys er standard
          overalt, mørk er et bevisst valg per bruker. */}
      <TemaRailKnapp />
      <AvatarFoto src={avatarUrl ?? undefined} navn={navn} size={32} ring />
      {merOpen && <MerPanel grupper={mer} rom={rom} onClose={() => setMerOpen(false)} erAgency={!!erAgency} />}
    </nav>
  );
}

/** Bunn-nav (mobil) — fast i bunn. Maks 4 punkter + «Mer»-ark når nav er lang. */
function BunnNavLenker({ aktiv, nav, mer }: { aktiv?: string; nav: V2NavItem[]; mer?: V2NavGruppe[] }) {
  const [merOpen, setMerOpen] = useState(false);
  const kompakt = nav.length > 5;
  const synlige = kompakt ? nav.slice(0, 4) : nav;
  // Resten av hovednav-en legges øverst i Mer-arket som egen gruppe.
  const merGrupper: V2NavGruppe[] = kompakt
    ? [{ label: "Seksjoner", items: nav.slice(4) }, ...(mer ?? [])]
    : (mer ?? []);

  return (
    <>
      <nav
        className="flex md:hidden"
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, justifyContent: "space-around", padding: "8px 8px calc(16px + env(safe-area-inset-bottom))", borderTop: `1px solid ${T.border}`, background: T.bg }}
        aria-label="Hovedmeny"
      >
        {synlige.map((n) => {
          const on = aktiv === n.id;
          return (
            <Link
              key={n.id}
              href={n.href}
              aria-current={on ? "page" : undefined}
              className="v2-press"
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 0", color: on ? T.lime : T.mut, textDecoration: "none" }}
            >
              <Icon name={n.icon} size={20} strokeWidth={on ? 2 : 1.5} />
              <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 600 }}>{n.label}</span>
            </Link>
          );
        })}
        {(kompakt || (mer && mer.length > 0)) && (
          <button
            onClick={() => setMerOpen(true)}
            aria-haspopup="menu"
            aria-expanded={merOpen}
            className="v2-press"
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 0", color: merOpen ? T.lime : T.mut, background: "transparent", border: 0, cursor: "pointer" }}
          >
            <Icon name="more-horizontal" size={20} strokeWidth={1.5} />
            <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 600 }}>Mer</span>
          </button>
        )}
      </nav>
      {merOpen && <MerPanel grupper={merGrupper} onClose={() => setMerOpen(false)} mobil />}
    </>
  );
}

/* M1 (17. juli, godkjent): AgencyOS mobil-bunn-nav. Fire kuraterte hovedseksjoner
   + «Mer» — samme tommelvennlige mønster som PlayerHQ-BunnNav (BunnNavLenker),
   men «Mer» åpner en FULL-HØYDE skuff (kandidat A) med resten av seksjonene +
   AGENCYOS_ROM (fem rom), så hele coach-flaten er nåbar. Mørkt tema beholdes
   (V2Shell holder AgencyOS mørk/lys via cookie som før). PlayerHQ-mobilen bruker
   fortsatt BunnNavLenker uendret. */
const AGENCY_MOBIL_PRIMÆR = ["cockpit", "innboks", "spillere", "kalender"];

function AgencyBunnNav({ aktiv, nav, mer, rom }: { aktiv?: string; nav: V2NavItem[]; mer?: V2NavGruppe[]; rom?: V2Rom[] }) {
  const [skuffOpen, setSkuffOpen] = useState(false);
  // Primærseksjoner i kanonisk rekkefølge; hopp over det som ikke finnes i nav-en.
  const primær = AGENCY_MOBIL_PRIMÆR
    .map((id) => nav.find((n) => n.id === id))
    .filter((n): n is V2NavItem => n != null);
  const primærIds = new Set(primær.map((n) => n.id));
  // Alt annet i hovednav-en legges øverst i skuffen — ingen seksjon faller bort.
  const resten = nav.filter((n) => !primærIds.has(n.id));
  const skuffGrupper: V2NavGruppe[] = [
    ...(resten.length > 0 ? [{ label: "Seksjoner", items: resten }] : []),
    ...(mer ?? []),
  ];

  return (
    <>
      <nav
        className="flex md:hidden"
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, justifyContent: "space-around", padding: "8px 8px calc(16px + env(safe-area-inset-bottom))", borderTop: `1px solid ${T.border}`, background: T.bg }}
        aria-label="Hovedmeny"
      >
        {primær.map((n) => {
          const on = aktiv === n.id;
          return (
            <Link
              key={n.id}
              href={n.href}
              aria-current={on ? "page" : undefined}
              className="v2-press"
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 0", color: on ? T.lime : T.mut, textDecoration: "none" }}
            >
              <Icon name={n.icon} size={20} strokeWidth={on ? 2 : 1.5} />
              <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 600 }}>{n.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setSkuffOpen(true)}
          aria-haspopup="menu"
          aria-expanded={skuffOpen}
          className="v2-press"
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 0", color: skuffOpen ? T.lime : T.mut, background: "transparent", border: 0, cursor: "pointer" }}
        >
          <Icon name="more-horizontal" size={20} strokeWidth={1.5} />
          <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 600 }}>Mer</span>
        </button>
      </nav>
      {skuffOpen && <MerPanel grupper={skuffGrupper} rom={rom} onClose={() => setSkuffOpen(false)} mobil full erAgency />}
    </>
  );
}

/**
 * V2Shell — dark-scope app-ramme for v2-flater. Desktop: IkonRail + fluid innhold
 * (full bredde etter rail — ingen midtsone 1120/1680). Mobil: innhold + fast
 * BunnNav. Innholdet stables med T.gap — skjermkomponentene rendrer bare
 * stacken, shellen leverer chrome.
 */
export function V2Shell({ aktiv, nav = PLAYERHQ_NAV, mer, rom, navn = "Øyvind Rohjan", avatarUrl, vekslerData, bredde = "full", children }: V2ShellProps) {
  // AgencyOS: auto-koble Mer-menyen uten å måtte endre ~50 kallsteder
  // (alle importerer samme AGENCYOS_NAV-konstant → ref-likhet).
  const erAgency = nav === AGENCYOS_NAV;

  // COACH ser ikke adminOnly-punkter (Økonomi, Workspace, E-post m.fl.).
  // Ren UI-skjuling — sidene bak er alltid server-gated.
  const erAdmin = useErAdmin();
  const navSynlig = useMemo(
    () => (erAdmin ? nav : nav.filter((i) => !i.adminOnly)),
    [nav, erAdmin],
  );
  const merGrupper = useMemo(() => {
    if (!mer || erAdmin) return mer;
    return mer
      .map((g) => ({ ...g, items: g.items.filter((i) => !i.adminOnly) }))
      .filter((g) => g.items.length > 0);
  }, [mer, erAdmin]);
  const romRaa = rom ?? (erAgency ? AGENCYOS_ROM : undefined);
  const romSynlig = useMemo(
    () => (!romRaa || erAdmin ? romRaa : romRaa.filter((r) => !r.adminOnly)),
    [romRaa, erAdmin],
  );

  // Uten eksplisitt aktiv-prop (legacy-sidene): utled fra URL-en — lengste
  // href-prefiks-match over hovednav + Mer-gruppene. Treff i en Mer-gruppe
  // lyser opp den logiske hovedseksjonen i railen (drills → Planlegge osv.).
  const pathname = usePathname();
  const autoAktiv = useMemo(() => {
    if (aktiv) return aktiv;
    // Gjelder kun custom `mer`-grupper (PlayerHQ-bunn-nav + eldre kallsteder).
    // AgencyOS bruker rom, se romSynlig-løkken lenger ned.
    const gruppeTilSeksjon: Record<string, string> = {
      Stall: "spillere",
      Kommunikasjon: "innboks",
      Planlegging: "kalender",
      "Tid og booking": "kalender",
      Innsikt: "innsikt",
      "Workbench & plan": "spillere",
    };
    let best: { id: string; href: string } | undefined;
    // Hub-ruter utenfor Mer → primær-seksjon (Kø / Kalender / Innsikt).
    const pathTilSeksjon: Array<{ prefix: string; id: string }> = [
      { prefix: "/admin/godkjenninger", id: "innboks" },
      { prefix: "/admin/innboks", id: "innboks" },
      { prefix: "/admin/varsler", id: "innboks" },
      { prefix: "/admin/queue", id: "innboks" },
      { prefix: "/admin/handlingssenter", id: "innboks" },
      { prefix: "/admin/kalender", id: "kalender" },
      { prefix: "/admin/bookinger", id: "kalender" },
      { prefix: "/admin/agencyos/uka", id: "kalender" },
      { prefix: "/admin/availability", id: "kalender" },
      { prefix: "/admin/analyse", id: "innsikt" },
      { prefix: "/admin/tester", id: "innsikt" },
      { prefix: "/admin/trackman", id: "innsikt" },
      { prefix: "/admin/runder", id: "innsikt" },
      { prefix: "/admin/reports", id: "innsikt" },
      { prefix: "/admin/analysere", id: "innsikt" },
      { prefix: "/admin/planlegge", id: "spillere" },
      { prefix: "/admin/spillere", id: "spillere" },
      { prefix: "/admin/agencyos", id: "cockpit" },
    ];
    for (const p of pathTilSeksjon) {
      if (pathname === p.prefix || pathname.startsWith(p.prefix + "/")) {
        if (!best || p.prefix.length > best.href.length) best = { id: p.id, href: p.prefix };
      }
    }
    for (const it of nav) {
      if (pathname === it.href || pathname.startsWith(it.href + "/")) {
        if (!best || it.href.length > best.href.length) best = it;
      }
    }
    for (const g of merGrupper ?? []) {
      for (const it of g.items) {
        if (pathname === it.href || pathname.startsWith(it.href + "/")) {
          const seksjon = gruppeTilSeksjon[g.label] ?? it.id;
          if (!best || it.href.length > best.href.length) best = { id: seksjon, href: it.href };
        }
      }
    }
    // Rom-treff lyser opp «Mer» i railen — rommet ER Mer-inngangen, ikke en
    // undergruppe av en primærseksjon.
    for (const r of romSynlig ?? []) {
      if (pathname === r.href || pathname.startsWith(r.href + "/")) {
        if (!best || r.href.length > best.href.length) best = { id: "mer", href: r.href };
      }
    }
    return best?.id;
  }, [aktiv, nav, merGrupper, romSynlig, pathname]);

  // DS2: shadcn-scope (.dark/.light) + colorScheme følger v2-temaet, så
  // skjema-primitiver og scrollbars matcher. SSR er lys (standard 25. jul);
  // mørk-cookie-brukere rettes ved hydration (suppressHydrationWarning) —
  // v2-fargene er riktige fra første paint uansett (var(--v2-*) + inline-script
  // i rot-layout).
  const { tema } = useV2Tema();

  // Tema-oppførsel (25. jul): ALLE v2-flater (PlayerHQ, AgencyOS, Forelder)
  // er lys som standard med bryter til mørk. Mørk skjerm er vanskelig å
  // lese utendørs i sollys. `data-v2-tema` er ETT delt attributt på <html>
  // (samme cookie), og Next-navigasjon mellom flatene er client-side (samme
  // dokument), så attributtet synkes ved rute-veksling: mørk KUN hvis
  // cookien sier dark — ellers alltid lys.
  useEffect(() => {
    const cookieMork = document.cookie.split("; ").some((c) => c === "ak-v2-tema=dark");
    const onsket: V2Tema = cookieMork ? "dark" : "light";
    if (lesTema() !== onsket) {
      if (onsket === "dark") document.documentElement.setAttribute("data-v2-tema", "dark");
      else document.documentElement.removeAttribute("data-v2-tema");
      window.dispatchEvent(new Event("ak-v2-tema"));
    }
  }, [erAgency]);

  // Coach-cookie for profil-veksleren: besøk i AgencyOS markerer nettleseren
  // som coach (kun UI-visning av toggle-lenken i PlayerHQ; guards uendret).
  useEffect(() => {
    if (erAgency) {
      document.cookie = "ak-coach=1; path=/; max-age=31536000; samesite=lax";
    }
  }, [erAgency]);

  return (
    <div
      className={tema}
      suppressHydrationWarning
      style={{
        minHeight: "100vh",
        background: `radial-gradient(1100px 460px at 24% -8%, var(--v2-vignett), transparent 62%), ${T.bg}`,
        color: T.fg,
        fontFamily: T.ui,
        colorScheme: tema,
        display: "flex",
      }}
    >
      <IkonRailNav aktiv={autoAktiv} nav={navSynlig} mer={merGrupper} rom={romSynlig} navn={navn} avatarUrl={avatarUrl} erAgency={erAgency} />
      {/* Topp-luft inkluderer safe-area: i installert PWA på iPhone dekker
          innholdet statuslinje-området — uten env() kolliderer hilsen/avatar
          med klokka (Anders' mobil-funn 2026-07-13). Desktop: env() = 0. */}
      {/* Bunn-luft må også regne med safe-area: BunnNavLenker vokser med
          env(safe-area-inset-bottom), så fast pb-24 (96px) var mindre enn
          nav-høyden på notch-iPhone → siste innholdselement lå bak nav-en. */}
      <div
        className="px-4 md:px-8 pb-[calc(96px+env(safe-area-inset-bottom))] md:pb-9"
        style={{ flex: 1, minWidth: 0, paddingTop: "calc(24px + env(safe-area-inset-top))" }}
      >
        {/* GO V6 — navigasjonsovergang: innholdet toner inn ved hvert rutebytte
            (key = pathname remonterer wrapperen, .v2-fade-in eier bevegelsen fra
            motion-katalogen og honorerer prefers-reduced-motion). Uten dette
            hopper skjermbytter hardt i en app som ellers beveger seg mykt. */}
        <div
          key={pathname}
          className="v2-fade-in"
          style={{ width: "100%", display: "flex", flexDirection: "column", gap: T.gap }}
        >
          {/* D2: kontekst-veksler i toppraden — kun AgencyOS og kun når data er
              gitt (usatt prop ⇒ skjult ⇒ ingen kallsted må endres). */}
          {erAgency && vekslerData && <SpillerVeksler data={vekslerData} />}
          {bredde === "kolonne" ? (
            <div style={{ width: "100%", maxWidth: erAgency ? "74ch" : "720px", marginLeft: "auto", marginRight: "auto" }}>
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
      {/* Mobil-bunnnav: AgencyOS får dedikert nav + full-høyde «Mer»-skuff (M1);
          PlayerHQ/forelder beholder BunnNavLenker uendret. */}
      {erAgency
        ? <AgencyBunnNav aktiv={autoAktiv} nav={navSynlig} mer={merGrupper} rom={romSynlig} />
        : <BunnNavLenker aktiv={autoAktiv} nav={navSynlig} mer={merGrupper} />}
      {/* Globalt søk (Cmd+K + «global-search:open»-event fra Mer-panelets
          søkeknapp) — kun montert i AgencyOS. Selv-styrt, rendrer null lukket. */}
      {erAgency && <GlobalSearchModal />}
    </div>
  );
}
