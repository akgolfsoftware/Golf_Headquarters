"use client";

/* AK Golf HQ v2 — produksjons-app-shell (fase 6). Fluid motpart til mockupens
   `Skjerm` (som er en fast 1280/390px device-frame for lerretet): samme chrome
   (smal IkonRail på desktop, BunnNav på mobil — Anders 9. juli: ingen bred
   sidemeny), men width:100% og ekte Next-Link-navigasjon. ERSTATTER den gamle
   PortalShell/AdminShell for v2-migrerte flater (vei A — unngår dobbel shell).
   Mørk (retning C, mørk-først): setter dark-scope + T.bg-vignett på hele viewporten. */

import Link from "next/link";
import type { ReactNode } from "react";
import { T } from "@/lib/v2/tokens";
import { Icon } from "./icon";
import { LogoAK, AvatarFoto } from "./core";

export interface V2NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

/** PlayerHQ-navigasjon (5 faste seksjoner). Rutene er dagens kanoniske adresser. */
export const PLAYERHQ_NAV: V2NavItem[] = [
  { id: "hjem", label: "Hjem", icon: "home", href: "/portal" },
  { id: "plan", label: "Plan", icon: "calendar", href: "/portal/planlegge" },
  { id: "gjor", label: "Gjør", icon: "play", href: "/portal/gjennomfore" },
  { id: "analyse", label: "Analyse", icon: "bar-chart", href: "/portal/analysere" },
  { id: "meg", label: "Meg", icon: "user", href: "/portal/meg" },
];

/** AgencyOS-navigasjon (coach). Cockpit + kjernehubene. */
export const AGENCYOS_NAV: V2NavItem[] = [
  { id: "cockpit", label: "Cockpit", icon: "home", href: "/admin/agencyos" },
  { id: "spillere", label: "Stall", icon: "users", href: "/admin/agencyos/spillere" },
  { id: "uka", label: "Uka", icon: "calendar", href: "/admin/agencyos/uka" },
  { id: "okonomi", label: "Økonomi", icon: "bar-chart", href: "/admin/agencyos/okonomi" },
  { id: "live", label: "Live", icon: "activity", href: "/admin/agencyos/live" },
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
  /** Innlogget brukers navn (for avatar-initialer/tittel). */
  navn?: string;
  /** Opplastet profilbilde-URL, hvis satt (ellers init-avatar). */
  avatarUrl?: string | null;
  children: ReactNode;
}

/** Smal ikon-rail (desktop) — ett Link-punkt per seksjon, lime-indikator på aktiv. */
function IkonRailNav({ aktiv, nav, navn, avatarUrl }: Required<Pick<V2ShellProps, "nav" | "navn">> & { aktiv?: string; avatarUrl?: string | null }) {
  return (
    <nav
      className="hidden md:flex"
      style={{ width: 60, flex: "none", borderRight: `1px solid ${T.border}`, flexDirection: "column", alignItems: "center", padding: "16px 0 14px", gap: 2, position: "sticky", top: 0, height: "100vh" }}
      aria-label="Hovedmeny"
    >
      <LogoAK size={26} style={{ marginBottom: 16 }} />
      {nav.map((n) => {
        const on = aktiv === n.id;
        return (
          <Link
            key={n.id}
            href={n.href}
            title={n.label}
            aria-current={on ? "page" : undefined}
            className="v2-press v2-focus"
            style={{ width: 46, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 0 6px", borderRadius: 12, background: on ? "rgba(209,248,67,0.09)" : "transparent", textDecoration: "none", position: "relative" }}
          >
            {on && <span style={{ position: "absolute", left: -7, top: 12, bottom: 12, width: 2, borderRadius: 2, background: T.lime }} />}
            <Icon name={n.icon} size={18} style={{ color: on ? T.lime : T.mut }} strokeWidth={on ? 2 : 1.5} />
            <span style={{ fontFamily: T.mono, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: on ? T.fg : T.mut }}>{n.label}</span>
          </Link>
        );
      })}
      <div style={{ flex: 1 }} />
      <AvatarFoto src={avatarUrl ?? undefined} navn={navn} size={32} ring />
    </nav>
  );
}

/** Bunn-nav (mobil) — fast i bunn, ett Link-punkt per seksjon. */
function BunnNavLenker({ aktiv, nav }: { aktiv?: string; nav: V2NavItem[] }) {
  return (
    <nav
      className="md:hidden"
      style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, display: "flex", justifyContent: "space-around", padding: "8px 8px 16px", borderTop: `1px solid ${T.border}`, background: `color-mix(in srgb,${T.bg} 82%,transparent)`, backdropFilter: "blur(10px)" }}
      aria-label="Hovedmeny"
    >
      {nav.map((n) => {
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
    </nav>
  );
}

/**
 * V2Shell — dark-scope app-ramme for v2-flater. Desktop: IkonRail + fluid innhold
 * (maks T.maxw). Mobil: innhold + fast BunnNav. Innholdet stables med T.gap, som
 * mockupens indre stack — skjermkomponentene rendrer bare stacken, shellen leverer chrome.
 */
export function V2Shell({ aktiv, nav = PLAYERHQ_NAV, navn = "Øyvind Rohjan", avatarUrl, children }: V2ShellProps) {
  return (
    <div
      className="dark"
      style={{
        minHeight: "100vh",
        background: `radial-gradient(1100px 460px at 24% -8%, rgba(0,88,64,0.16), transparent 62%), ${T.bg}`,
        color: T.fg,
        fontFamily: T.ui,
        colorScheme: "dark",
        display: "flex",
      }}
    >
      <IkonRailNav aktiv={aktiv} nav={nav} navn={navn} avatarUrl={avatarUrl} />
      <div className="px-4 md:px-8 pt-6 pb-24 md:pb-9" style={{ flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth: T.maxw, margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
          {children}
        </div>
      </div>
      <BunnNavLenker aktiv={aktiv} nav={nav} />
    </div>
  );
}
