"use client";

/**
 * AgencyOS-skallet i nytt design (designbrevet 13.10.2026).
 * Fasit: docs/design-system/utkast-agencyos/felles/agencyos.js og agencyos.css.
 *
 * PC fra 900 px: sidemeny 232 px med logo, seks punkter (Cockpit · Innboks ·
 * Stall · Kalender · Workbench · Mer), coachen nederst og bjella øverst til høyre.
 * Mobil: topplinje med hamburgermeny, logo og bjelle; menyen åpner under linja.
 * Hurtigknappen står på alle /admin-sider (beslutninger.md §Hurtigknappen).
 *
 * Alle /admin-sider får dette skallet: portert side legger seg selv i det, og
 * V2Shell bruker det for AgencyOS (src/components/v2/shell.tsx). Lyst tema er
 * standard; Live coachingøkt er også lys (beslutninger.md §LIVE-ØKTENE ER ALLTID LYSE).
 * Bjella viser bare et tall når siden sender det inn, aldri et anslag.
 */
import { useToppbarHoyde } from "@/components/v2/toppbar-hoyde";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell, CalendarDays, CalendarPlus, Ellipsis, Flag, Inbox, LayoutDashboard, Layers, Menu,
  MessageSquarePlus, Sparkles, Users, X, type LucideIcon,
} from "lucide-react";
import { Hurtigknapp, type Hurtighandling } from "./Hurtigknapp";
import { useErAdmin } from "@/components/v2/rolle";
import { AOS_HURTIG, AOS_MENY, aktivtAosPunkt, type AosPunktId } from "@/lib/agencyos/precision-ia";
import { onsketTema } from "@/lib/v2/tema-default";
import { GlobalSearchModal } from "@/components/admin/global-search-modal";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";
import "@/styles/agencyos-ny.css";

const IKON: Record<AosPunktId, LucideIcon> = {
  cockpit: LayoutDashboard, innboks: Inbox, stall: Users, kalender: CalendarDays, workbench: Layers, mer: Ellipsis,
};
const HURTIG_IKON: Record<string, [LucideIcon, string]> = {
  okt: [Layers, "layers"], melding: [MessageSquarePlus, "message-square-plus"], runde: [Flag, "flag"],
  jarvis: [Sparkles, "sparkles"], booking: [CalendarPlus, "calendar-plus"],
};
const HURTIG: Hurtighandling[] = AOS_HURTIG.map((h) => ({ ...h, icon: HURTIG_IKON[h.id]![0], iconName: HURTIG_IKON[h.id]![1] }));

export type AgencyOSSkallProps = {
  children: ReactNode;
  /** Coachens navn (sidemenyens bunn). */
  navn: string;
  /** Uleste saker i innboksen. null = ukjent på denne siden: bjella vises uten tall. */
  uleste?: number | null;
  /** Innboksen har en sak som haster (Risiko, eller spillerspørsmål over 24 t): tallet blir rust. */
  haster?: boolean;
};

function tallTekst(uleste: number | null) {
  return uleste == null || uleste === 0 ? null : uleste > 99 ? "99+" : String(uleste);
}

function Bjelle({ uleste, haster }: { uleste: number | null; haster: boolean }) {
  const n = tallTekst(uleste);
  const label = n ? `Innboks, ${uleste} uleste${haster ? ", noe haster" : ""}` : "Innboks";
  return <Link href="/admin/innboks" className="agn-ikonknapp" aria-label={label} data-bell="">
    <Bell className="agn-ikon" aria-hidden />
    {n && <b className={haster ? "haster" : undefined} aria-hidden>{n}</b>}
  </Link>;
}

function Lenker({ aktiv, uleste, haster, onVelg }: { aktiv: AosPunktId | null; uleste: number | null; haster: boolean; onVelg?: () => void }) {
  const n = tallTekst(uleste);
  return <>
    {AOS_MENY.map((m) => {
      const I = IKON[m.id];
      return <Link key={m.id} href={m.href} onClick={onVelg} className="agn-lenke" aria-current={aktiv === m.id ? "page" : undefined}>
        <I className="agn-ikon" aria-hidden />{m.label}
        {m.id === "innboks" && n && <span className={`tall${haster ? " haster" : ""}`} aria-label={`${uleste} uleste`}>{n}</span>}
      </Link>;
    })}
  </>;
}

function initialer(navn: string) {
  return navn.split(/\s+/).filter(Boolean).slice(0, 2).map((d) => d[0]!.toUpperCase()).join("") || "—";
}

/** Samme temaregel som V2Shell og rot-layouten: lyst er standard, lagret valg vinner. */
function useTemaSynk(path: string) {
  useEffect(() => {
    const raa = document.cookie.split("; ").find((c) => c.startsWith("ak-v2-tema="));
    const onsket = onsketTema(path, raa?.slice("ak-v2-tema=".length), false);
    const naa = document.documentElement.getAttribute("data-v2-tema") === "dark" ? "dark" : "light";
    if (naa !== onsket) {
      if (onsket === "dark") document.documentElement.setAttribute("data-v2-tema", "dark");
      else document.documentElement.removeAttribute("data-v2-tema");
      window.dispatchEvent(new Event("ak-v2-tema"));
    }
    // Profil-veksleren i PlayerHQ viser «Til AgencyOS» for nettlesere som har vært her (bare visning).
    document.cookie = "ak-coach=1; path=/; max-age=31536000; samesite=lax";
  }, [path]);
}

export function AgencyOSSkall({ children, navn, uleste = null, haster = false }: AgencyOSSkallProps) {
  const toppRef = useToppbarHoyde<HTMLElement>();
  const path = usePathname() ?? "/admin/agencyos";
  const erHeadCoach = useErAdmin();
  const aktiv = aktivtAosPunkt(path).punkt;
  const [meny, setMeny] = useState(false);
  useTemaSynk(path);

  useEffect(() => {
    if (!meny) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setMeny(false); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [meny]);

  const logo = (h: number) => <Image src="/logos/logo-ak-golf-hq.svg" alt="AK Golf HQ" width={Math.round(h * 4.55)} height={h} className="agn-logo" priority />;

  return <div className="pa-root agn" data-design="agencyos-ny">
    <a className="pa-sr pa-skip" href="#agn-innhold">Hopp til innhold</a>
    <header ref={toppRef} className="agn-topp">
      <div className="venstre">
        <button type="button" className="agn-ikonknapp" aria-label={meny ? "Lukk meny" : "Meny"} aria-expanded={meny} aria-controls="agn-skuff" onClick={() => setMeny((m) => !m)}>
          {meny ? <X className="agn-ikon" aria-hidden /> : <Menu className="agn-ikon" aria-hidden />}
        </button>
        <Link href="/admin/agencyos" aria-label="AgencyOS hjem" style={{ display: "flex", alignItems: "center", minHeight: 44 }}>{logo(20)}</Link>
      </div>
      <Bjelle uleste={uleste} haster={haster} />
    </header>
    <div id="agn-skuff" className="agn-skuff" hidden={!meny}>
      <button type="button" className="bak" aria-label="Lukk meny" tabIndex={-1} onClick={() => setMeny(false)} />
      <nav aria-label="Hovedmeny"><Lenker aktiv={aktiv} uleste={uleste} haster={haster} onVelg={() => setMeny(false)} /></nav>
    </div>
    <div className="agn-skall">
      <nav className="agn-meny" aria-label="Hovedmeny">
        <Link href="/admin/agencyos" aria-label="AgencyOS hjem">{logo(22)}</Link>
        <Lenker aktiv={aktiv} uleste={uleste} haster={haster} />
        <div className="agn-coach">
          <span className="av" aria-hidden>{initialer(navn)}</span>
          <span><b>{navn}</b><span>{erHeadCoach ? "Head coach" : "Coach"}</span></span>
        </div>
      </nav>
      <div className="agn-hoved">
        <div className="agn-pc-topp"><Bjelle uleste={uleste} haster={haster} /></div>
        <main id="agn-innhold" className="agn-main">{children}</main>
      </div>
    </div>
    <Hurtigknapp app="aos" handlinger={HURTIG} />
    <GlobalSearchModal />
  </div>;
}
