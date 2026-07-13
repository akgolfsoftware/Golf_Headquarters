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
import { T } from "@/lib/v2/tokens";
import { Icon } from "./icon";
import { LogoAK, AvatarFoto } from "./core";

export interface V2NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

/** Gruppe i «Mer»-menyen (AgencyOS lang hale). */
export interface V2NavGruppe {
  label: string;
  items: V2NavItem[];
}

/** PlayerHQ-navigasjon (5 faste seksjoner). Rutene er dagens kanoniske adresser. */
export const PLAYERHQ_NAV: V2NavItem[] = [
  { id: "hjem", label: "Hjem", icon: "home", href: "/portal" },
  { id: "plan", label: "Plan", icon: "calendar", href: "/portal/planlegge" },
  { id: "gjor", label: "Gjør", icon: "play", href: "/portal/gjennomfore" },
  { id: "analyse", label: "Analyse", icon: "bar-chart", href: "/portal/analysere" },
  { id: "meg", label: "Meg", icon: "user", href: "/portal/meg" },
];

/** AgencyOS-navigasjon (coach). Full seksjonsstruktur — alle hovedflater. */
export const AGENCYOS_NAV: V2NavItem[] = [
  { id: "cockpit", label: "Cockpit", icon: "home", href: "/admin/agencyos" },
  { id: "innboks", label: "Innboks", icon: "inbox", href: "/admin/innboks" },
  { id: "spillere", label: "Stall", icon: "users", href: "/admin/spillere" },
  { id: "planlegge", label: "Planlegge", icon: "target", href: "/admin/planlegge" },
  { id: "kalender", label: "Kalender", icon: "calendar", href: "/admin/kalender" },
  { id: "bookinger", label: "Booking", icon: "calendar-check", href: "/admin/bookinger" },
  { id: "uka", label: "Uka", icon: "columns-3", href: "/admin/agencyos/uka" },
  { id: "innsikt", label: "Innsikt", icon: "bar-chart", href: "/admin/analyse" },
  { id: "okonomi", label: "Økonomi", icon: "credit-card", href: "/admin/agencyos/okonomi" },
  { id: "live", label: "Live", icon: "activity", href: "/admin/agencyos/live" },
];

/** AgencyOS «Mer»-meny — lang hale gruppert. Alt en coach trenger, nåbart. */
export const AGENCYOS_MER: V2NavGruppe[] = [
  {
    label: "Kommunikasjon",
    items: [
      { id: "varsler", label: "Varsler", icon: "bell", href: "/admin/varsler" },
      { id: "innboks-epost", label: "E-post (post@)", icon: "mail", href: "/admin/innboks-epost" },
      { id: "godkjenninger", label: "Godkjenninger", icon: "badge-check", href: "/admin/godkjenninger" },
      { id: "handlingssenter", label: "Handlingssenter", icon: "check-check", href: "/admin/handlingssenter" },
      { id: "brief", label: "Daglig brief", icon: "file-text", href: "/admin/brief" },
      { id: "queue", label: "Oppfølgingskø", icon: "list", href: "/admin/queue" },
    ],
  },
  {
    label: "Stall",
    items: [
      { id: "grupper", label: "Grupper", icon: "users", href: "/admin/grupper" },
      { id: "spillere-ny", label: "Ny spiller", icon: "plus", href: "/admin/spillere/ny" },
      { id: "talent-radar", label: "Talent-radar", icon: "star", href: "/admin/talent/radar" },
      { id: "talent-sammenligning", label: "Talent-sammenligning", icon: "crosshair", href: "/admin/talent/sammenligning" },
    ],
  },
  {
    label: "Planlegging",
    items: [
      { id: "plans", label: "Planer (alle)", icon: "layers", href: "/admin/plans" },
      { id: "plan-templates", label: "Plan-maler", icon: "copy", href: "/admin/plan-templates" },
      { id: "teknisk-plan", label: "Teknisk plan", icon: "wrench", href: "/admin/teknisk-plan" },
      { id: "okter", label: "Økter", icon: "clock", href: "/admin/okter" },
      { id: "gjennomfore", label: "Gjennomføre", icon: "play", href: "/admin/gjennomfore" },
      { id: "tournaments", label: "Turneringer", icon: "trophy", href: "/admin/tournaments" },
      { id: "drills", label: "Drills-bibliotek", icon: "dumbbell", href: "/admin/drills" },
    ],
  },
  {
    label: "Innsikt",
    items: [
      { id: "tester", label: "Tester", icon: "badge-check", href: "/admin/tester" },
      { id: "reports", label: "Rapporter", icon: "file-text", href: "/admin/reports" },
      { id: "runder", label: "Runder", icon: "flag", href: "/admin/runder" },
      { id: "compliance", label: "Plan-etterlevelse", icon: "shield-check", href: "/admin/analysere/compliance" },
    ],
  },
  {
    label: "Drift",
    items: [
      { id: "workspace", label: "Workspace", icon: "layout-dashboard", href: "/admin/workspace" },
      { id: "marketing", label: "Marketing", icon: "megaphone", href: "/admin/marketing" },
      { id: "caddie", label: "Caddie (AI)", icon: "message-circle", href: "/admin/agencyos/caddie" },
      { id: "agents", label: "AI-agenter", icon: "bot", href: "/admin/agents" },
      { id: "organisasjon", label: "Organisasjon", icon: "building-2", href: "/admin/organisasjon" },
      { id: "team", label: "Team", icon: "users", href: "/admin/team" },
      { id: "email-templates", label: "E-postmaler", icon: "mail-check", href: "/admin/email-templates" },
      { id: "availability", label: "Tilgjengelighet", icon: "clock", href: "/admin/availability" },
      { id: "kalender-synk", label: "Kalender-synk (Google)", icon: "refresh-cw", href: "/admin/settings/calendar" },
      { id: "spiller-profil", label: "Min spillerprofil", icon: "user", href: "/portal" },
      { id: "services", label: "Tjenester og priser", icon: "credit-card", href: "/admin/services" },
      { id: "settings", label: "Innstillinger", icon: "settings", href: "/admin/settings" },
    ],
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
  /** «Mer»-grupper (lang hale). Auto: AGENCYOS_MER når nav er AGENCYOS_NAV. */
  mer?: V2NavGruppe[];
  /** Innlogget brukers navn (for avatar-initialer/tittel). */
  navn?: string;
  /** Opplastet profilbilde-URL, hvis satt (ellers init-avatar). */
  avatarUrl?: string | null;
  children: ReactNode;
}

/* ---------- DS2: tema (mørk default, lys for sol) ---------- */

type V2Tema = "dark" | "light";

function lesTema(): V2Tema {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-v2-tema") === "light" ? "light" : "dark";
}

function abonnerTema(cb: () => void) {
  window.addEventListener("ak-v2-tema", cb);
  return () => window.removeEventListener("ak-v2-tema", cb);
}

/**
 * Tema-tilstand for v2-flatene. Sannheten bor på <html data-v2-tema> (satt før
 * paint av inline-scriptet i rot-layout) + cookie `ak-v2-tema`; hooken speiler
 * den og synker alle instanser via et vindus-event. SSR-snapshot er alltid
 * mørk (serveren kjenner ikke cookien her) — React retter ved hydration.
 */
function useV2Tema() {
  const tema = useSyncExternalStore<V2Tema>(abonnerTema, lesTema, () => "dark");
  const bytt = () => {
    const neste: V2Tema = lesTema() === "light" ? "dark" : "light";
    if (neste === "light") document.documentElement.setAttribute("data-v2-tema", "light");
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

/** «Mer»-panelet — grupperte lenker. Desktop: flytende panel ved railen. */
function MerPanel({ grupper, onClose, mobil }: { grupper: V2NavGruppe[]; onClose: () => void; mobil?: boolean }) {
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

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.55)" }} aria-hidden />
      <div
        role="menu"
        aria-label="Mer"
        style={
          mobil
            ? { position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 91, maxHeight: "72vh", overflowY: "auto", background: T.panel, opacity: 1, border: `1px solid ${T.border}`, borderRadius: "18px 18px 0 0", padding: "14px 16px calc(20px + env(safe-area-inset-bottom))", boxShadow: "0 -18px 48px rgba(0,0,0,0.5)" }
            : { position: "fixed", left: 68, top: 12, bottom: 12, zIndex: 91, width: 560, maxWidth: "calc(100vw - 84px)", overflowY: "auto", background: T.panel, opacity: 1, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px 20px", boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }
        }
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>Alle flater</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
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
          {grupper.map((g) => (
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
      </div>
    </>
  );
}

/** Smal ikon-rail (desktop) — ett Link-punkt per seksjon, lime-indikator på aktiv. */
function IkonRailNav({ aktiv, nav, mer, navn, avatarUrl, erAgency }: Required<Pick<V2ShellProps, "nav" | "navn">> & { aktiv?: string; mer?: V2NavGruppe[]; avatarUrl?: string | null; erAgency?: boolean }) {
  const [merOpen, setMerOpen] = useState(false);
  return (
    <nav
      className="hidden md:flex"
      style={{ width: 60, flex: "none", borderRight: `1px solid ${T.border}`, flexDirection: "column", alignItems: "center", padding: "14px 0 12px", gap: 2, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}
      aria-label="Hovedmeny"
    >
      <LogoAK size={26} style={{ marginBottom: 12, flex: "none" }} />
      {nav.map((n) => <RailLenke key={n.id} item={n} on={aktiv === n.id} />)}
      {mer && mer.length > 0 && (
        <button
          onClick={() => setMerOpen(true)}
          title="Mer"
          aria-haspopup="menu"
          aria-expanded={merOpen}
          className="v2-press v2-focus"
          style={{ width: 46, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "7px 0 5px", borderRadius: 12, background: "transparent", border: 0, cursor: "pointer", flex: "none" }}
        >
          <Icon name="more-horizontal" size={18} style={{ color: T.mut }} strokeWidth={1.5} />
          <span style={{ fontFamily: T.mono, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: T.mut }}>Mer</span>
        </button>
      )}
      <div style={{ flex: 1, minHeight: 8 }} />
      <ProfilBytteKnapp erAgency={!!erAgency} />
      <TemaRailKnapp />
      <AvatarFoto src={avatarUrl ?? undefined} navn={navn} size={32} ring />
      {merOpen && mer && <MerPanel grupper={mer} onClose={() => setMerOpen(false)} />}
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
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, justifyContent: "space-around", padding: "8px 8px calc(16px + env(safe-area-inset-bottom))", borderTop: `1px solid ${T.border}`, background: `color-mix(in srgb,${T.bg} 82%,transparent)`, backdropFilter: "blur(10px)" }}
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

/**
 * V2Shell — dark-scope app-ramme for v2-flater. Desktop: IkonRail + fluid innhold
 * (maks T.maxw; AgencyOS får full kontrolltårn-bredde). Mobil: innhold + fast
 * BunnNav. Innholdet stables med T.gap — skjermkomponentene rendrer bare
 * stacken, shellen leverer chrome.
 */
export function V2Shell({ aktiv, nav = PLAYERHQ_NAV, mer, navn = "Øyvind Rohjan", avatarUrl, children }: V2ShellProps) {
  // AgencyOS: auto-koble Mer-menyen og full desktop-bredde uten å måtte endre
  // ~50 kallsteder (alle importerer samme AGENCYOS_NAV-konstant → ref-likhet).
  const erAgency = nav === AGENCYOS_NAV;
  const merGrupper = mer ?? (erAgency ? AGENCYOS_MER : undefined);
  const maksBredde = erAgency ? 1680 : T.maxw;

  // Uten eksplisitt aktiv-prop (legacy-sidene): utled fra URL-en — lengste
  // href-prefiks-match over hovednav + Mer-gruppene. Treff i en Mer-gruppe
  // lyser opp den logiske hovedseksjonen i railen (drills → Planlegge osv.).
  const pathname = usePathname();
  const autoAktiv = useMemo(() => {
    if (aktiv) return aktiv;
    const gruppeTilSeksjon: Record<string, string> = {
      Kommunikasjon: "innboks",
      Stall: "spillere",
      Planlegging: "planlegge",
      Innsikt: "innsikt",
      Drift: "cockpit",
    };
    let best: { id: string; href: string } | undefined;
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
    return best?.id;
  }, [aktiv, nav, merGrupper, pathname]);

  // DS2: shadcn-scope (.dark/.light) + colorScheme følger v2-temaet, så
  // skjema-primitiver og scrollbars matcher. SSR er alltid mørk; lys-brukere
  // rettes ved hydration (suppressHydrationWarning) — v2-fargene er riktige
  // fra første paint uansett (var(--v2-*) + inline-script i rot-layout).
  const { tema } = useV2Tema();

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
      <IkonRailNav aktiv={autoAktiv} nav={nav} mer={merGrupper} navn={navn} avatarUrl={avatarUrl} erAgency={erAgency} />
      {/* Topp-luft inkluderer safe-area: i installert PWA på iPhone dekker
          innholdet statuslinje-området — uten env() kolliderer hilsen/avatar
          med klokka (Anders' mobil-funn 2026-07-13). Desktop: env() = 0. */}
      <div
        className="px-4 md:px-8 pb-24 md:pb-9"
        style={{ flex: 1, minWidth: 0, paddingTop: "calc(24px + env(safe-area-inset-top))" }}
      >
        <div style={{ maxWidth: maksBredde, margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
          {children}
        </div>
      </div>
      <BunnNavLenker aktiv={autoAktiv} nav={nav} mer={merGrupper} />
    </div>
  );
}
