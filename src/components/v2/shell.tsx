"use client";

/* AK Golf HQ v2 — produksjons-app-shell (fase 6). Fluid motpart til mockupens
   `Skjerm` (som er en fast 1280/390px device-frame for lerretet): samme chrome
   (smal IkonRail på desktop, BunnNav på mobil — Anders 9. juli: ingen bred
   sidemeny), men width:100% og ekte Next-Link-navigasjon. ERSTATTER den gamle
   PortalShell/AdminShell for v2-migrerte flater (vei A — unngår dobbel shell).
   Mørk (retning C, mørk-først): setter dark-scope + TL.scene-vignett på hele viewporten.

   AgencyOS (2026-07-12): full seksjonsnav (10 punkter) + «Mer»-meny som gjør
   HELE flaten nåbar (varsler, godkjenninger, grupper, tester, rapporter m.fl.),
   og full desktop-bredde (coach-kontrolltårn skal ikke være en 1120px-stripe).
   Mobil: de 4 første punktene + Mer-ark med resten. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "./icon";
import { LogoAK, AvatarFoto } from "./core";
import { useV2Tema, lesTema, type V2Tema } from "./tema";
import { onsketTema } from "@/lib/v2/tema-default";
import { SpillerVeksler, type VekslerData } from "./spiller-veksler";
import { useErAdmin } from "./rolle";
import { GlobalSearchModal } from "@/components/admin/global-search-modal";
import { AGENCYOS_SKALL_TABS, AGENCYOS_UNDER_MEG } from "@/lib/agencyos/skall-ia";

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
  /** Valgfri antall-badge (f.eks. kø-telling på AgencyOS «Kø»). */
  badge?: number;
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
 *
 * Referanse: designsystem/train-lock/GAP-00 Kart.dc.html — IA-kartet fra
 * gamle Paper-skjermnavn til disse fire fanene + hvor hver gamle flate
 * («Gjør», «Chat-tråd», «Fys-plan» m.fl.) bor nå. Selve GAP-00-filen er et
 * planleggingskart, ikke en skjerm — porteres ikke, kun sitert her som kilde
 * for at strukturen under er tro mot kartet.
 */
export const PLAYERHQ_NAV: V2NavItem[] = [
  { id: "hjem", label: "I dag", icon: "home", href: "/portal" },
  { id: "plan", label: "Plan", icon: "calendar", href: "/portal/planlegge" },
  { id: "analyse", label: "Analyse", icon: "bar-chart", href: "/portal/analysere" },
  { id: "meg", label: "Meg", icon: "user", href: "/portal/meg" },
];

/**
 * AgencyOS primær-nav — SJU punkter = fase 2-fasitens rail 1:1
 * (A1-beslutningen, Anders 2026-08-16, beslutninger.md §PP-A):
 * Cockpit · Innboks · Kalender · Stall · Plan · Innsikt · Oppsett —
 * samme punkter, navn og rekkefølge som `fase2/agencyos/*.html`.
 * Logoen er appens egen AK-logo, ikke fasitens wordmark.
 *
 * «Plan» bruker id "planlegge" fordi hele plan-familien (plans, teknisk-plan,
 * okter, tournaments) allerede sender aktiv="planlegge". «Innsikt» og «Oppsett»
 * bruker id-ene "innsikt"/"innstillinger" som analyse- og settings-sidene
 * allerede sender — fanene lyser uten endring i noe kallsted.
 *
 * MERK (T1, 25.08 kveld): denne konstanten styrer IKKE lenger rail/dock-
 * VISNINGEN i AgencyOS — den er erstattet av `AGENCYOS_SKALL_TABS` (AX-01,
 * fem faste tabber). AGENCYOS_NAV lever videre uendret fordi ~50 andre
 * kallsteder fortsatt sender `aktiv=`/badges basert på disse 7 idene
 * (godkjenninger-badge, Mer-panelets `rom`-logikk m.fl.) — se
 * `docs/natt/LOOP-T1-DONE.md` for hele resonnementet.
 */
export const AGENCYOS_NAV: V2NavItem[] = [
  { id: "cockpit", label: "Cockpit", icon: "home", href: "/admin/agencyos" },
  { id: "innboks", label: "Innboks", icon: "inbox", href: "/admin/innboks" },
  { id: "kalender", label: "Kalender", icon: "calendar", href: "/admin/kalender" },
  { id: "spillere", label: "Stall", icon: "users", href: "/admin/spillere" },
  { id: "planlegge", label: "Workbench", icon: "file-text", href: "/admin/planlegge" },
  { id: "innsikt", label: "Innsikt", icon: "bar-chart", href: "/admin/analyse" },
  { id: "innstillinger", label: "Oppsett", icon: "settings", href: "/admin/settings" },
];

/**
 * T1-korrigering (25.08 kveld): `WORKBENCH_ITEM` fylte tidligere Workbench-
 * plassen i den 5+1-doken (AGENCY_MOBIL_PRIMÆR). Rail/dock er nå bygget om
 * til AX-01 (se `AGENCYOS_SKALL_TABS` lenger ned) med sin egen, uavhengige
 * Workbench-oppføring — konstanten er derfor fjernet herfra for å unngå
 * dobbel kilde. `AGENCYOS_NAV` (over) lever videre uendret til andre formål
 * (badges, `aktiv`-matching på andre kallsteder).
 */

/** Påfør kø-badge uten å mutere AGENCYOS_NAV-konstanten. erAgency sjekker id/href. */
export function withAgencyOsNavBadges(koTotalt: number): V2NavItem[] {
  const n = koTotalt > 0 ? koTotalt : undefined;
  return AGENCYOS_NAV.map((item) =>
    item.id === "innboks" && n ? { ...item, badge: n } : { ...item },
  );
}

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
    beskrivelse: "Agenter, godkjenningskø, daglig brief",
    meta: "Coach",
    icon: "bot",
    href: "/admin/agenticos",
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

/** Forelder-«Mer» — underskjermene FO-03…FO-10 som ikke får plass i navben
    (PX-5: FO-01-forsiden er ren lesevisning uten lenkefaner, så rutene må
    kunne nås herfra). */
export const FORELDER_MER: V2NavGruppe[] = [
  {
    label: "Mer",
    items: [
      { id: "bookinger", label: "Bookinger", icon: "calendar", href: "/forelder/bookinger" },
      { id: "ukerapport", label: "Ukerapport", icon: "file-text", href: "/forelder/ukerapport" },
      { id: "fakturaer", label: "Fakturaer", icon: "list", href: "/forelder/fakturaer" },
      { id: "samtykke", label: "Samtykke", icon: "shield-check", href: "/forelder/samtykke" },
      { id: "varsler", label: "Varsler", icon: "bell", href: "/forelder/varsler" },
      { id: "innstillinger", label: "Innstillinger", icon: "settings", href: "/forelder/innstillinger" },
    ],
  },
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
  /**
   * `"dokument"` (default, uendret) — siden vokser og hele dokumentet
   * scroller. Riktig for innholdsskjermer, og eneste som virker sammen med
   * `--ak-topbar-h`-mekanismen (sticky toppbarer over dokumentrullen).
   *
   * `"skjerm"` — skallet låses til skjermhøyden og siden eier sin egen
   * rulling. Skjermer med bunnforankret chrome (chat-komposer) MÅ bruke
   * denne: uten den har ingen forelder bunden høyde, barnets `height: 100%`
   * faller tilbake til innholdshøyde, og komposeren blir stående midt på
   * siden med død luft under (målt 230 px på 390×844 før fiksen).
   *
   * Merk at høydekjeden må være ubrutt HELE veien ned — det var nettopp
   * `.v2-fade-in`-wrapperen uten høyde som brøt den her.
   */
  hoyde?: "dokument" | "skjerm";
  /**
   * PP-B3 (rutefasit §Claude-følelsen: «festet spørrefelt nederst på alle
   * desktop-flater, mobil kun Hjem»): valgfri `Composer`-node
   * (components/v2/composer.tsx) som skallet fester nederst på desktop.
   * Skjult på mobil (`hidden md:block`) — mobil-composeren eies av flaten
   * selv. Ingen flate sender prop-en ennå; C-bølgene kobler den på skjerm
   * for skjerm, med fasit side om side.
   */
  composer?: ReactNode;
  children: ReactNode;
}

/* ---------- DS2: tema (lys default på app-flater, mørk via bryter — 25. jul) ---------- */

// Tema-hooken bor i `./tema` — delt med PaperTopp, se den filen.

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
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", color: TL.mute, padding: "6px 0", width: "100%" }}
    >
      <Icon name={erAgency ? "user" : "clipboard-list"} size={16} />
      <span style={{ fontFamily: TL.font.mono, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.08em" }}>{erAgency ? "SPILLER" : "COACH"}</span>
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
      <Icon name={tilLys ? "sun" : "moon"} size={18} style={{ color: TL.mute }} strokeWidth={1.5} />
      <span style={{ fontFamily: TL.font.mono, fontSize: 9, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: TL.mute }}>{tilLys ? "Lys" : "Mørk"}</span>
    </button>
  );
}

/** Ett rail-punkt (desktop). */
function RailLenke({ item, on, dark }: { item: V2NavItem; on: boolean; dark?: boolean }) {
  const badge = typeof item.badge === "number" && item.badge > 0 ? item.badge : null;
  return (
    <Link
      href={item.href}
      title={badge ? `${item.label} (${badge})` : item.label}
      aria-current={on ? "page" : undefined}
      className="v2-press v2-focus"
      style={{
        width: 56,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        padding: "8px 0 6px",
        borderRadius: 12,
        background: on
          ? dark
            ? TL.dim
            : `color-mix(in srgb, ${TL.fill} 9%, transparent)`
          : "transparent",
        textDecoration: "none",
        position: "relative",
        flex: "none",
      }}
    >
      {on && !dark && <span style={{ position: "absolute", left: -7, top: 10, bottom: 10, width: 2, borderRadius: 2, background: TL.fill }} />}
      <span style={{ position: "relative", display: "inline-flex" }}>
        <Icon name={item.icon} size={19} style={{ color: dark ? (on ? TL.text : TL.mute) : (on ? TL.fill : TL.mute) }} strokeWidth={on ? 2 : 1.5} />
        {badge != null && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: -5,
              right: -8,
              minWidth: 14,
              height: 14,
              padding: "0 3px",
              borderRadius: 999,
              background: TL.fill,
              color: TL.scene,
              fontFamily: TL.font.mono,
              fontSize: 8,
              fontWeight: 700,
              lineHeight: "14px",
              textAlign: "center",
            }}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      {/* Fasiten (både fase 1 og fase 2) skriver rail-etikettene i vanlig
          skrift, ikke versaler — kun appen ropte. Sans + mixed case per
          Anders 13.08. Lange etiketter krymper fortsatt i stedet for å
          klippes — teksten er navigasjonen, ikke pynt. */}
      <span
        style={{
          fontFamily: TL.font.sans,
          fontSize: item.label.length > 10 ? 9 : 10,
          fontWeight: 500,
          letterSpacing: 0,
          maxWidth: "100%",
          textAlign: "center",
          color: dark ? (on ? TL.text : TL.mute) : (on ? TL.text : TL.mute),
        }}
      >
        {item.label}
      </span>
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
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 90, background: TL.scrim }} aria-hidden />
      <div
        role="menu"
        aria-label="Mer"
        style={
          mobil
            ? full
              ? { position: "fixed", inset: 0, zIndex: 91, overflowY: "auto", background: TL.elev, opacity: 1, borderRadius: 0, padding: "calc(14px + env(safe-area-inset-top)) 16px calc(20px + env(safe-area-inset-bottom))", boxShadow: "0 -18px 48px rgba(0,0,0,0.5)" }
              : { position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 91, maxHeight: "72vh", overflowY: "auto", background: TL.elev, opacity: 1, border: `1px solid ${TL.hair}`, borderRadius: "18px 18px 0 0", padding: "14px 16px calc(20px + env(safe-area-inset-bottom))", boxShadow: "0 -18px 48px rgba(0,0,0,0.5)" }
            : { position: "fixed", left: 72, top: 12, bottom: 12, zIndex: 91, width: rom && rom.length > 0 ? 420 : 560, maxWidth: "calc(100vw - 84px)", overflowY: "auto", background: TL.elev, opacity: 1, border: `1px solid ${TL.hair}`, borderRadius: 16, padding: "18px 20px", boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }
        }
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>
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
                style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${TL.hair}`, borderRadius: 8, color: TL.mute, cursor: "pointer", padding: "4px 9px" }}
              >
                <Icon name="search" size={13} />
                <span style={{ fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Søk</span>
              </button>
            )}
            <button
              onClick={bytt}
              className="v2-press"
              aria-label={tema === "dark" ? "Bytt til lys modus" : "Bytt til mørk modus"}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${TL.hair}`, borderRadius: 8, color: TL.mute, cursor: "pointer", padding: "4px 9px" }}
            >
              <Icon name={tema === "dark" ? "sun" : "moon"} size={13} />
              <span style={{ fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>{tema === "dark" ? "Lys" : "Mørk"}</span>
            </button>
            <button onClick={onClose} className="v2-press" aria-label="Lukk" style={{ background: "transparent", border: 0, color: TL.mute, cursor: "pointer", padding: 4 }}>
              <Icon name="x" size={16} />
            </button>
          </div>
        </div>
        <div style={mobil ? { display: "flex", flexDirection: "column", gap: 14 } : { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 22px" }}>
          {(grupper ?? []).map((g) => (
            <div key={g.label}>
              <div style={{ fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute, marginBottom: 6 }}>{g.label}</div>
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
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 8px", borderRadius: 9, textDecoration: "none", color: on ? TL.text : TL.mute, background: on ? TL.dock : "transparent" }}
                    >
                      <Icon name={it.icon} size={15} style={{ color: on ? TL.text : TL.mute, flex: "none" }} />
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
                    borderRadius: TL.radius.row,
                    textDecoration: "none",
                    color: TL.text,
                    background: fremhevet ? TL.dim : "transparent",
                    border: `1px solid ${fremhevet ? `color-mix(in srgb, ${TL.fill} 22%, ${TL.hair})` : "transparent"}`,
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
                      background: fremhevet ? TL.dim : TL.dim,
                      border: `1px solid ${fremhevet ? `color-mix(in srgb, ${TL.fill} 28%, ${TL.hair})` : TL.hair}`,
                      color: fremhevet ? TL.fill : TL.mute,
                    }}
                  >
                    <Icon name={r.icon} size={18} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 3 }}>{r.label}</span>
                    <span style={{ display: "block", fontSize: 12, lineHeight: 1.4, color: TL.mute, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.beskrivelse}</span>
                  </span>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.02em", color: fremhevet ? TL.fill : TL.mute }}>{r.meta}</span>
                </Link>
              );
            })}
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${TL.hair}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.4, color: TL.mute }}>
                Resten (audit-log, marketing, dyp-katalog) lever i søk — ikke her.
              </p>
              <kbd style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 6, border: `1px solid ${TL.hair}`, background: TL.dock, color: TL.mute, flex: "none" }}>⌘K</kbd>
            </div>
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}

/**
 * T1-korrigering (Anders 25.08 kveld, i økt — se docs/natt/LOOP-T1-DONE.md):
 * `AX-01 Skall rail og tabbar.dc.html` ble levert på nytt (komplett, 11 431
 * byte) og OVERSTYRER både den gamle 7-tabs A-/AG-rail-fasiten og AG-00s
 * 5-tabs+«Mer»-ark-mønster (D2-UNDERLAG §5.6 — begge er nå eksplisitt
 * "utdatert"). Fem faste destinasjoner, IDENTISK rekkefølge mobil/Mac,
 * ALDRI en sjette: Stall · Workbench · Kø · Jarvis · Meg. Konsoll, Økonomi
 * og Kalender er RADER under Meg — ikke egne tabber, ikke et «Mer»-ark.
 *
 * Egen konstant, IKKE AGENCYOS_NAV: AGENCYOS_NAV (7 punkter, gamle ider
 * "cockpit"/"innboks" osv.) lever videre uendret fordi ~50 andre kallsteder
 * fortsatt sender `aktiv=`/badges basert på den — å endre selve konstanten
 * ville brutt de skjermene uten at de faktisk er portet. Rail/dock under
 * bruker derfor en frittstående tab-liste og leser aktiv fane av
 * `pathname`, ikke av `aktiv`-propen.
 */
export { AGENCYOS_SKALL_TABS, AGENCYOS_UNDER_MEG };

/** Aktiv fane av URL — AGENCYOS_SKALL_TABS-idene, «» hvis ingen treffer
 *  (typisk en under-Meg-side; radene der har egen, uavhengig aktiv-sjekk). */
function skallAktivFraPath(pathname: string): string {
  const treff: Array<{ prefix: string; id: string }> = [
    { prefix: "/admin/spillere", id: "stall" },
    { prefix: "/admin/planlegge", id: "workbench" },
    { prefix: "/admin/workbench", id: "workbench" },
    { prefix: "/admin/queue", id: "ko" },
    { prefix: "/admin/godkjenninger", id: "ko" },
    { prefix: "/admin/innboks", id: "ko" },
    { prefix: "/admin/varsler", id: "ko" },
    { prefix: "/admin/handlingssenter", id: "ko" },
    { prefix: "/admin/agenticos", id: "jarvis" },
    { prefix: "/admin/agent-team", id: "jarvis" },
    { prefix: "/admin/agents", id: "jarvis" },
    { prefix: "/admin/agencyos/caddie", id: "jarvis" },
    { prefix: "/admin/profile", id: "meg" },
    { prefix: "/meg", id: "meg" },
  ];
  for (const t of treff) {
    if (pathname === t.prefix || pathname.startsWith(t.prefix + "/")) return t.id;
  }
  return "";
}

/**
 * AgencyOS Mac-rail — Train-lock AX-01b: 232 px, tekst+ikon-rader (ikke
 * ikon-bare firkanter). `background` TL.dock, kant TL.hair, aktiv-flate
 * TL.dim, aktiv tekst TL.text, inaktiv TL.mute. Egen gren fra `IkonRailNav`
 * (delt med PlayerHQ, som IKKE er Train-lock-portet ennå).
 */
function TrainLockAgencyRail() {
  const pathname = usePathname();
  const aktivTab = skallAktivFraPath(pathname ?? "");
  const erAdmin = useErAdmin();
  const underMeg = AGENCYOS_UNDER_MEG.filter((r) => erAdmin || !r.adminOnly);
  return (
    <nav
      className="hidden md:flex"
      style={{
        width: TL.skall.railMac,
        flex: "none",
        background: TL.dock,
        borderRight: `1px solid ${TL.hair}`,
        flexDirection: "column",
        padding: "18px 12px",
        gap: 4,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}
      aria-label="Hovedmeny"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 10px 14px" }}>
        <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: TL.warm, flex: "none" }} />
        <span style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 700, color: TL.text, flex: 1, minWidth: 0 }}>AK Golf Academy</span>
        <TrainLockTemaKnapp />
      </div>

      {AGENCYOS_SKALL_TABS.map((t) => (
        <AgencySkallRad key={t.id} label={t.label} icon={t.icon} href={t.href} on={aktivTab === t.id} ikonStorrelse={16} />
      ))}

      <div style={{ margin: "14px 10px 8px", height: 1, background: TL.hair }} />
      <div
        style={{
          padding: "0 10px 6px",
          fontFamily: TL.font.mono,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: TL.mute,
        }}
      >
        Under Meg
      </div>
      {underMeg.map((r) => {
        const on = (pathname ?? "").startsWith(r.href);
        return (
          <Link
            key={r.id}
            href={r.href}
            aria-current={on ? "page" : undefined}
            className="v2-press v2-focus"
            style={{
              height: 34,
              borderRadius: TL.radius.row,
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              fontSize: 13,
              fontWeight: on ? 600 : 400,
              color: on ? TL.text : TL.mute,
              background: on ? TL.dim : "transparent",
              textDecoration: "none",
            }}
          >
            {r.label}
          </Link>
        );
      })}

      <div style={{ flex: 1, minHeight: 8 }} />
      <Link
        href="/admin/agenticos"
        className="v2-press v2-focus"
        style={{
          height: 36,
          borderRadius: TL.radius.row,
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          fontSize: 13,
          color: TL.mute,
          textDecoration: "none",
        }}
      >
        Åpne AgenticOS
      </Link>
    </nav>
  );
}

/** Én rail-rad (Mac, AX-01b) — 40 h, r12, ikon+tekst. Aktiv = flate TL.dim + tekst TL.text. */
function AgencySkallRad({ label, icon, href, on, ikonStorrelse, badge }: { label: string; icon: string; href: string; on: boolean; ikonStorrelse: number; badge?: number }) {
  return (
    <Link
      href={href}
      aria-current={on ? "page" : undefined}
      className="v2-press v2-focus"
      style={{
        height: 40,
        borderRadius: TL.radius.row,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 12px",
        background: on ? TL.dim : "transparent",
        textDecoration: "none",
      }}
    >
      <Icon name={icon} size={ikonStorrelse} style={{ color: on ? TL.text : TL.mute, flex: "none" }} strokeWidth={2} />
      <span style={{ fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, color: on ? TL.text : TL.mute, flex: 1, minWidth: 0 }}>{label}</span>
      {typeof badge === "number" && badge > 0 && (
        <span
          aria-hidden
          style={{
            minWidth: 18,
            height: 18,
            padding: "0 5px",
            borderRadius: 999,
            background: TL.danger,
            color: TL.onDanger,
            fontFamily: TL.font.mono,
            fontSize: 10,
            fontWeight: 700,
            lineHeight: "18px",
            textAlign: "center",
          }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

/** Lys/mørk-bryter i Train-lock-railen — ingen etikett, kun ikon (fasiten viser ikke
 *  en bryter i det hele tatt; Anders' toggle beholdes funksjonelt, minimalt visuelt). */
function TrainLockTemaKnapp() {
  const { tema, bytt } = useV2Tema();
  const tilLys = tema === "dark";
  return (
    <button
      onClick={bytt}
      title={tilLys ? "Bytt til lys modus" : "Bytt til mørk modus"}
      className="v2-press v2-focus"
      style={{
        width: 44,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: TL.radius.row,
        background: "transparent",
        border: 0,
        cursor: "pointer",
        flex: "none",
        marginBottom: 4,
      }}
    >
      <Icon name={tilLys ? "sun" : "moon"} size={18} style={{ color: TL.mute }} strokeWidth={1.5} />
    </button>
  );
}

function HusIkon({ size, fyll }: { size: number; fyll: boolean }) {
  const felles = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
    style: { display: "block", flex: "none" },
  };
  if (fyll) {
    return (
      <svg {...felles}>
        <path d="M4 10.5 L12 4 L20 10.5 V20 H14.5 V14.5 H9.5 V20 H4 Z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg {...felles} fill="none">
      <path d="M4 10.5 L12 4 L20 10.5 V20 H15 V14.5 H9 V20 H4 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/** PH-01 dock/rail-ikoner — fasitens SVG, ikke Lucide. */
function PlayerFaneIkon({ icon, size, fyll }: { icon: string; size: number; fyll?: boolean }) {
  if (icon === "home") return <HusIkon size={size} fyll={Boolean(fyll)} />;
  if (icon === "calendar") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="4" y="5.5" width="16" height="15" rx="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 3.5 V7 M16 3.5 V7 M4 10.5 H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === "bar-chart") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M5 20 V13 M12 20 V6 M19 20 V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return <Icon name={icon} size={size} strokeWidth={2} />;
}

function Initialer({ navn, size, fontSize }: { navn: string; size: number; fontSize: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: TL.avatar,
        color: TL.onAvatar,
        fontSize,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      {playerInitialer(navn)}
    </span>
  );
}

function playerInitialer(navn: string): string {
  const deler = navn.trim().split(/\s+/).filter(Boolean);
  if (deler.length === 0) return "";
  if (deler.length === 1) return deler[0].slice(0, 2).toUpperCase();
  return `${deler[0][0] ?? ""}${deler[deler.length - 1][0] ?? ""}`.toUpperCase();
}

/** PH-01 Mac-rail: 72 px, 44×44 r12, aktiv = hvit fyll, ØR nederst. */
function TrainLockPlayerRail({
  aktiv,
  nav,
  navn,
}: {
  aktiv?: string;
  nav: V2NavItem[];
  navn: string;
  avatarUrl?: string | null;
}) {
  return (
    <nav
      className="hidden md:flex"
      aria-label="Hovedmeny"
      data-tl-player-rail
      style={{
        width: 72,
        flex: "none",
        borderRight: `1px solid ${TL.hair}`,
        flexDirection: "column",
        alignItems: "center",
        padding: "14px 0 18px",
        gap: 6,
        position: "sticky",
        top: 0,
        height: "100vh",
        background: TL.scene,
      }}
    >
      {nav.filter((n) => n.id !== "meg").slice(0, 3).map((n) => {
        const on = aktiv === n.id;
        return (
          <Link
            key={n.id}
            href={n.href}
            title={n.label}
            aria-current={on ? "page" : undefined}
            className="v2-press v2-focus"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: on ? TL.fill : "transparent",
              color: on ? TL.onFill : TL.mute,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              flex: "none",
            }}
          >
            <PlayerFaneIkon icon={n.icon} size={21} fyll={on} />
          </Link>
        );
      })}
      <div style={{ flex: 1, minHeight: 8 }} />
      <TrainLockTemaKnapp />
      <Link href="/portal/meg" title="Meg" aria-label="Meg" className="v2-press">
        <Initialer navn={navn} size={32} fontSize={11} />
      </Link>
    </nav>
  );
}

/** PH-01 telefon-dock: flytende pille 64 h, aktiv = hvit I DAG-pille. */
function TrainLockPlayerDock({
  aktiv,
  nav,
  navn,
  composer,
}: {
  aktiv?: string;
  nav: V2NavItem[];
  navn: string;
  composer?: ReactNode;
}) {
  const faner = nav.slice(0, 4);
  return (
    <div
      data-tl-player-dock
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        pointerEvents: "none",
      }}
    >
      <style>{`
        [data-tl-player-dock] { padding: 10px 16px 0; padding-bottom: calc(env(safe-area-inset-bottom) + var(--ak-cookie-h, 0px)); }
        [data-tl-player-pill] { display: flex; }
        [data-tl-player-caddie] { margin-bottom: 10px; }
        @media (min-width: 768px) {
          [data-tl-player-dock] {
            left: 72px;
            padding: 12px 56px 20px;
            padding-bottom: calc(20px + env(safe-area-inset-bottom) + var(--ak-cookie-h, 0px));
            background: ${TL.scene};
          }
          [data-tl-player-pill] { display: none; }
          [data-tl-player-caddie] { margin-bottom: 0; }
        }
      `}</style>
      {composer != null && (
        <div data-tl-player-caddie style={{ pointerEvents: "auto" }}>{composer}</div>
      )}
      <nav
        data-tl-player-pill
        aria-label="Hovedmeny"
        style={{
          pointerEvents: "auto",
          height: 64,
          background: TL.dock,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 10px",
        }}
      >
        {faner.map((n) => {
          const on = aktiv === n.id;
          const erMeg = n.id === "meg";
          if (on) {
            return (
              <Link
                key={n.id}
                href={n.href}
                aria-current="page"
                className="v2-press"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  background: TL.fill,
                  color: TL.onFill,
                  borderRadius: 999,
                  height: 48,
                  padding: "0 18px",
                  textDecoration: "none",
                  flex: "none",
                }}
              >
                {erMeg ? (
                  <Initialer navn={navn} size={22} fontSize={9} />
                ) : (
                  <PlayerFaneIkon icon={n.icon} size={20} fyll />
                )}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    color: TL.onFill,
                  }}
                >
                  {n.label}
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={n.id}
              href={n.href}
              aria-label={n.label}
              className="v2-press"
              style={{
                width: 52,
                height: 48,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                textDecoration: "none",
                flex: "none",
                color: TL.mute,
              }}
            >
              {erMeg ? (
                <Initialer navn={navn} size={22} fontSize={9} />
              ) : (
                <PlayerFaneIkon icon={n.icon} size={17} />
              )}
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: TL.mute,
                  whiteSpace: "nowrap",
                }}
              >
                {n.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/** Smal ikon-rail (desktop) — ett Link-punkt per seksjon, lime-indikator på aktiv. */
function IkonRailNav({ aktiv, nav, mer, rom, navn, avatarUrl, erAgency, erPlayer }: Required<Pick<V2ShellProps, "nav" | "navn">> & { aktiv?: string; mer?: V2NavGruppe[]; rom?: V2Rom[]; avatarUrl?: string | null; erAgency?: boolean; erPlayer?: boolean }) {
  const [merOpen, setMerOpen] = useState(false);
  if (erAgency) {
    return <TrainLockAgencyRail />;
  }
  if (erPlayer) {
    return <TrainLockPlayerRail aktiv={aktiv} nav={nav} navn={navn} avatarUrl={avatarUrl} />;
  }
  return (
    <nav
      className="hidden md:flex"
      style={{
        width: 64,
        flex: "none",
        borderRight: `1px solid ${TL.hair}`,
        flexDirection: "column",
        alignItems: "center",
        padding: "14px 0 12px",
        gap: 2,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        background: TL.dock,
        color: TL.mute,
      }}
      aria-label="Hovedmeny"
      data-paper-rail
    >
      <LogoAK size={28} surface="ink" style={{ marginBottom: 12, flex: "none" }} />
      {nav.map((n) => <RailLenke key={n.id} item={n} on={aktiv === n.id} dark />)}
      {((mer && mer.length > 0) || (rom && rom.length > 0)) && (
        <button
          onClick={() => setMerOpen(true)}
          title="Mer"
          aria-haspopup="menu"
          aria-expanded={merOpen}
          className="v2-press v2-focus"
          style={{ width: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 0 6px", borderRadius: 12, background: "transparent", border: 0, cursor: "pointer", flex: "none" }}
        >
          <Icon name="more-horizontal" size={19} style={{ color: aktiv === "mer" ? TL.text : TL.mute }} strokeWidth={1.5} />
          <span style={{ fontFamily: TL.font.sans, fontSize: 10, fontWeight: 500, color: aktiv === "mer" ? TL.text : TL.mute }}>Mer</span>
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
        data-paper-faner
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, justifyContent: "space-around", padding: "6px 4px calc(10px + env(safe-area-inset-bottom) + var(--ak-cookie-h, 0px))", borderTop: `1px solid ${TL.hair}`, background: TL.dock }}
        aria-label="Hovedmeny"
      >
        {synlige.map((n) => {
          const on = aktiv === n.id;
          const badge = typeof n.badge === "number" && n.badge > 0 ? n.badge : null;
          return (
            <Link
              key={n.id}
              href={n.href}
              aria-current={on ? "page" : undefined}
              aria-label={badge ? `${n.label}, ${badge} i kø` : n.label}
              className="v2-press"
              style={{ flex: 1, minHeight: 56, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: "4px 0", color: on ? TL.text : TL.mute, textDecoration: "none", position: "relative" }}
            >
              {on && (
                <span aria-hidden style={{ position: "absolute", top: 0, left: "24%", right: "24%", height: 2, borderRadius: 999, background: TL.text }} />
              )}
              <span style={{ position: "relative", display: "inline-flex" }}>
                <Icon name={n.icon} size={20} strokeWidth={on ? 2 : 1.5} />
                {badge != null && (
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -10,
                      minWidth: 14,
                      height: 14,
                      padding: "0 3px",
                      borderRadius: 999,
                      background: TL.fill,
                      color: TL.onFill,
                      fontFamily: TL.font.mono,
                      fontSize: 8,
                      fontWeight: 700,
                      lineHeight: "14px",
                      textAlign: "center",
                    }}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </span>
              <span style={{ fontFamily: TL.font.mono, fontSize: 9, fontWeight: 600 }}>{n.label}</span>
            </Link>
          );
        })}
        {(kompakt || (mer && mer.length > 0)) && (
          <button
            onClick={() => setMerOpen(true)}
            aria-haspopup="menu"
            aria-expanded={merOpen}
            className="v2-press"
            style={{ flex: 1, minHeight: 56, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: "4px 0", color: merOpen ? TL.text : TL.mute, background: "transparent", border: 0, cursor: "pointer" }}
          >
            <Icon name="more-horizontal" size={20} strokeWidth={1.5} />
            <span style={{ fontFamily: TL.font.mono, fontSize: 9, fontWeight: 600 }}>Mer</span>
          </button>
        )}
      </nav>
      {merOpen && <MerPanel grupper={merGrupper} onClose={() => setMerOpen(false)} mobil />}
    </>
  );
}

/**
 * AgencyOS mobil-dock — Train-lock AX-01a: full bredde, høyde 88, bakgrunn
 * TL.dock, hairline-topp. Fem like kolonner, SAMME rekkefølge som Mac-railen
 * (AGENCYOS_SKALL_TABS) — "muskelminnet følger med" (D2-UNDERLAG §5.6).
 * «Meg» åpner MegArkTL (Konsoll/Økonomi/Kalender) i stedet for å navigere
 * direkte — se den komponenten for begrunnelse.
 */
function TrainLockAgencyDock() {
  const pathname = usePathname();
  const aktivTab = skallAktivFraPath(pathname ?? "");
  const [megOpen, setMegOpen] = useState(false);

  return (
    <>
      <nav
        className="flex md:hidden"
        data-paper-faner="agency"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          height: 88,
          background: TL.dock,
          borderTop: `1px solid ${TL.hair}`,
          alignItems: "flex-start",
          paddingTop: 10,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
        aria-label="Hovedmeny"
      >
        {AGENCYOS_SKALL_TABS.map((t) => {
          const on = aktivTab === t.id;
          const badge = t.id === "ko" ? undefined : undefined; // ingen kallsted leverer kø-tall ennå (se LOOP-T1-DONE.md)
          const felles = { style: { flex: 1, height: 52, display: "flex", flexDirection: "column" as const, alignItems: "center" as const, justifyContent: "center" as const, gap: 5, position: "relative" as const } };
          const indre = (
            <>
              <Icon name={t.icon} size={20} style={{ color: on ? TL.text : TL.mute }} strokeWidth={2} />
              {typeof badge === "number" && badge > 0 && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: -1,
                    right: 22,
                    minWidth: 16,
                    height: 16,
                    padding: "0 4px",
                    borderRadius: 999,
                    background: TL.danger,
                    color: TL.onDanger,
                    fontFamily: TL.font.mono,
                    fontSize: 10,
                    fontWeight: 700,
                    lineHeight: "16px",
                    textAlign: "center",
                  }}
                >
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
              <span style={{ fontFamily: TL.font.sans, fontSize: 10, fontWeight: 600, color: on ? TL.text : TL.mute }}>{t.label}</span>
            </>
          );
          if (t.id === "meg") {
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setMegOpen(true)}
                aria-haspopup="menu"
                aria-expanded={megOpen}
                className="v2-press"
                style={{ ...felles.style, background: "transparent", border: 0, cursor: "pointer" }}
              >
                {indre}
              </button>
            );
          }
          return (
            <Link key={t.id} href={t.href} aria-current={on ? "page" : undefined} className="v2-press" style={{ ...felles.style, textDecoration: "none" }}>
              {indre}
            </Link>
          );
        })}
      </nav>
      {megOpen && <MegArkTL onClose={() => setMegOpen(false)} />}
    </>
  );
}

/**
 * «Meg»-ark (mobil) — AX-01 nevner ingen egen skjerm for Meg utover at
 * Konsoll/Økonomi/Kalender er rader under den. Shell.tsx eier ikke
 * `/admin/profile`-sideinnholdet (anti-scope: ingen innholdsskjerm portes),
 * så et lite TL-ark er raskeste vei til å holde de tre sidene nåbare på
 * mobil uten å miste funksjonalitet (Enkelhet-prinsippet: behold alle
 * funksjoner). Geometri lånt fra AG-05 (grabber/tittel/rad-mønster), som
 * fortsatt er korrekt CHROME-geometri selv om AG-05s EGET innhold (Plan/
 * Innsikt/Oppsett/Klubb) er avløst av AX-01.
 */
function MegArkTL({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const erAdmin = useErAdmin();
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);
  const [apnetPa] = useState(pathname);
  useEffect(() => {
    if (pathname !== apnetPa) onClose();
  }, [pathname, apnetPa, onClose]);

  const rader = [
    ...AGENCYOS_UNDER_MEG.filter((r) => erAdmin || !r.adminOnly),
    { id: "profil", label: "Min profil", href: "/admin/profile" },
  ];

  return createPortal(
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 90, background: TL.scrim }} aria-hidden />
      <div
        role="menu"
        aria-label="Meg"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 91,
          maxHeight: "72vh",
          overflowY: "auto",
          background: TL.elev,
          borderRadius: `${TL.radius.sheet} ${TL.radius.sheet} 0 0`,
          padding: "12px 24px calc(20px + env(safe-area-inset-bottom))",
        }}
      >
        <div aria-hidden style={{ width: 36, height: 4, borderRadius: 2, background: TL.grabber, margin: "0 auto 18px" }} />
        <div style={{ fontFamily: TL.font.sans, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>Meg</div>
        <div style={{ marginTop: 8 }}>
          {rader.map((r) => (
            <Link
              key={r.id}
              href={r.href}
              onClick={onClose}
              role="menuitem"
              className="v2-press v2-focus"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
                padding: "15px 0",
                borderTop: `1px solid ${TL.hair}`,
                textDecoration: "none",
                color: TL.text,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600 }}>{r.label}</span>
              <Icon name="chevron-right" size={14} style={{ color: TL.mute, flex: "none" }} strokeWidth={2.2} />
            </Link>
          ))}
        </div>
        <button
          onClick={onClose}
          className="v2-press"
          style={{
            marginTop: 4,
            width: "100%",
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 600,
            color: TL.mute,
            background: "transparent",
            border: 0,
            cursor: "pointer",
          }}
        >
          Avbryt
        </button>
      </div>
    </>,
    document.body,
  );
}

/**
 * V2Shell — dark-scope app-ramme for v2-flater. Desktop: IkonRail + fluid innhold
 * (full bredde etter rail — ingen midtsone 1120/1680). Mobil: innhold + fast
 * BunnNav. Innholdet stables med 16 — skjermkomponentene rendrer bare
 * stacken, shellen leverer chrome.
 */
export function V2Shell({ aktiv, nav = PLAYERHQ_NAV, mer, rom, navn = "Øyvind Rohjan", avatarUrl, vekslerData, bredde = "full", hoyde = "dokument", composer, children }: V2ShellProps) {
  // AgencyOS: auto-koble Mer-menyen uten å måtte endre ~50 kallsteder
  // (alle importerer samme AGENCYOS_NAV-konstant → ref-likhet).
  // Ikke ref-likhet: withAgencyOsNavBadges() returnerer ny array med badge.
  const erAgency =
    nav === AGENCYOS_NAV ||
    (nav.length === AGENCYOS_NAV.length &&
      nav.every((n, i) => n.id === AGENCYOS_NAV[i]?.id && n.href === AGENCYOS_NAV[i]?.href));
  const erPlayer =
    nav === PLAYERHQ_NAV ||
    (nav.length === PLAYERHQ_NAV.length &&
      nav.every((n, i) => n.id === PLAYERHQ_NAV[i]?.id && n.href === PLAYERHQ_NAV[i]?.href));

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
      "Workbench & plan": "workbench",
    };
    let best: { id: string; href: string } | undefined;
    // Hub-ruter utenfor Mer → primær-seksjon (Kø / Kalender / Innsikt).
    const pathTilSeksjon: Array<{ prefix: string; id: string }> = [
      { prefix: "/admin/godkjenninger", id: "innboks" },
      { prefix: "/admin/innboks", id: "innboks" },
      { prefix: "/admin/innboks", id: "innboks" },
      { prefix: "/admin/varsler", id: "innboks" },
      { prefix: "/admin/queue", id: "innboks" },
      { prefix: "/admin/handlingssenter", id: "innboks" },
      { prefix: "/admin/kalender", id: "kalender" },
      { prefix: "/admin/bookinger", id: "kalender" },
      { prefix: "/admin/agencyos/uka", id: "kalender" },
      { prefix: "/admin/availability", id: "kalender" },
      /* «innsikt» er igjen et rail-punkt (A1 2026-08-16: fase2-railen 1:1) —
         analyse-familien lyser Innsikt-fanen. */
      { prefix: "/admin/analyse", id: "innsikt" },
      { prefix: "/admin/tester", id: "innsikt" },
      { prefix: "/admin/trackman", id: "innsikt" },
      { prefix: "/admin/runder", id: "innsikt" },
      { prefix: "/admin/reports", id: "innsikt" },
      { prefix: "/admin/analysere", id: "innsikt" },
      { prefix: "/admin/planlegge", id: "workbench" },
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
  // skjema-primitiver og scrollbars matcher. `useV2Tema` sitt SSR-snapshot er
  // lys, så denne KLASSEN rettes ved hydration på mørke flater
  // (suppressHydrationWarning). Selve fargene er riktige fra første paint
  // uansett: rot-layout stempler `data-v2-tema` på server, og globals.css
  // definerer både v2-variablene og shadcn-triplettene under
  // `html[data-v2-tema="dark"]` — klassen her er belte-og-seler.
  const { tema } = useV2Tema();

  // Tema-oppførsel: `data-v2-tema` er ETT delt attributt på <html> (samme
  // cookie), og Next-navigasjon mellom flatene er client-side (samme
  // dokument) — så attributtet må synkes ved rute-veksling. Regelen er den
  // SAMME som rot-layout kjører på server: `onsketTema` i
  // src/lib/v2/tema-default.ts er eneste kilde, så SSR og navigasjon ikke kan
  // drifte fra hverandre. Mørk er default på /portal og /admin (Anders
  // 25.08.2026); bryteren (cookien) vinner alltid over defaulten.
  useEffect(() => {
    const rå = document.cookie.split("; ").find((c) => c.startsWith("ak-v2-tema="));
    const cookie = rå?.slice("ak-v2-tema=".length);
    const onsket: V2Tema = onsketTema(pathname ?? "", cookie, false);
    if (lesTema() !== onsket) {
      if (onsket === "dark") document.documentElement.setAttribute("data-v2-tema", "dark");
      else document.documentElement.removeAttribute("data-v2-tema");
      window.dispatchEvent(new Event("ak-v2-tema"));
    }
  }, [pathname]);

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
      data-paper-shell={erAgency ? "agencyos" : "playerhq"}
      data-paper-chrome="v2-shell"
      suppressHydrationWarning
      style={{
        // «skjerm» binder høyden til viewporten (dvh, ikke vh — iOS' adresse-
        // linje endrer vh og ville latt komposeren skli under nav-en).
        ...(hoyde === "skjerm"
          ? { height: "100dvh", overflow: "hidden" }
          : { minHeight: "100vh" }),
        background: TL.scene,
        color: TL.text,
        fontFamily: TL.font.sans,
        colorScheme: tema,
        display: "flex",
      }}
    >
      <IkonRailNav aktiv={autoAktiv} nav={navSynlig} mer={merGrupper} rom={romSynlig} navn={navn} avatarUrl={avatarUrl} erAgency={erAgency} erPlayer={erPlayer} />
      {/* Topp-luft inkluderer safe-area: i installert PWA på iPhone dekker
          innholdet statuslinje-området — uten env() kolliderer hilsen/avatar
          med klokka (Anders' mobil-funn 2026-07-13). Desktop: env() = 0. */}
      {/* Bunn-luft må også regne med safe-area: BunnNavLenker vokser med
          env(safe-area-inset-bottom), så fast pb-24 (96px) var mindre enn
          nav-høyden på notch-iPhone → siste innholdselement lå bak nav-en. */}
      <div
        className={
          erPlayer
            ? "px-4 md:px-14 pt-[calc(8px+env(safe-area-inset-top))] md:pt-[calc(40px+env(safe-area-inset-top))] pb-[calc(148px+env(safe-area-inset-bottom)+var(--ak-cookie-h,0px))] md:pb-[120px]"
            : "px-4 md:px-8 pb-[calc(96px+env(safe-area-inset-bottom))] md:pb-9"
        }
        style={{
          flex: 1,
          minWidth: 0,
          paddingTop: erPlayer ? undefined : "calc(24px + env(safe-area-inset-top))",
          // Uten minHeight: 0 nekter en flex-item å krympe under innholdet sitt,
          // og «egen rulling» blir til dokumentrulling likevel.
          ...(hoyde === "skjerm"
            ? { display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }
            : null),
        }}
      >
        {/* GO V6 — navigasjonsovergang: innholdet toner inn ved hvert rutebytte
            (key = pathname remonterer wrapperen, .v2-fade-in eier bevegelsen fra
            motion-katalogen og honorerer prefers-reduced-motion). Uten dette
            hopper skjermbytter hardt i en app som ellers beveger seg mykt. */}
        <div
          key={pathname}
          className="v2-fade-in"
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: erPlayer ? 0 : 16,
            // Leddet som brøt høydekjeden: uten dette har wrapperen auto
            // høyde, og barnets `height: 100%` faller tilbake til innholds-
            // høyde — komposeren havnet 230 px over bunn-nav-en.
            ...(hoyde === "skjerm" ? { flex: 1, minHeight: 0 } : null),
          }}
        >
          {/* D2: kontekst-veksler i toppraden — kun AgencyOS og kun når data er
              gitt (usatt prop ⇒ skjult ⇒ ingen kallsted må endres). */}
          {erAgency && vekslerData && <SpillerVeksler data={vekslerData} />}
          {bredde === "kolonne" ? (
            <div
              data-paper-column={erAgency ? "agency" : "player"}
              style={{
                width: "100%",
                maxWidth: erAgency ? "74ch" : "720px",
                marginLeft: "auto",
                marginRight: "auto",
                // Kolonne-varianten er også et ledd i kjeden.
                ...(hoyde === "skjerm"
                  ? { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }
                  : null),
              }}
            >
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
      {/* PP-B3: skallets composer-feste — fast nederst, kun desktop (mobil-
          composeren eies av flaten selv, jf. rutefasit §Claude-følelsen).
          Gotchas §Cookie-banneret: bunnforankret chrome forskyver seg med
          env(safe-area-inset-bottom) + var(--ak-cookie-h); selve 12–16px-
          bunnluften eier Composer-noden selv. left:64 = railbredden — rail og
          feste deler md-brytepunktet. zIndex 30: under bunn-nav (40) og
          Mer-panelet (90/91), over innholdet. */}
      {composer != null && !erPlayer && (
        <div
          className="hidden md:block"
          data-paper-shell-composer
          style={{
            position: "fixed",
            left: 64,
            right: 0,
            bottom: 0,
            zIndex: 30,
            background: TL.scene,
            paddingBottom: "calc(env(safe-area-inset-bottom) + var(--ak-cookie-h, 0px))",
          }}
        >
          {composer}
        </div>
      )}
      {erAgency ? (
        <TrainLockAgencyDock />
      ) : erPlayer ? (
        <TrainLockPlayerDock
          aktiv={autoAktiv}
          nav={navSynlig}
          navn={navn}
          composer={composer}
        />
      ) : (
        <BunnNavLenker aktiv={autoAktiv} nav={navSynlig} mer={merGrupper} />
      )}
      {/* Globalt søk (Cmd+K + «global-search:open»-event fra Mer-panelets
          søkeknapp) — kun montert i AgencyOS. Selv-styrt, rendrer null lukket. */}
      {erAgency && <GlobalSearchModal />}
    </div>
  );
}
