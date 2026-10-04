"use client";

/**
 * AgencyOS-skallet i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/ag-parts.jsx › Shell, etag 1790610423296777, og
 * components/navigation NavRail · MenuBar · NavDrawer).
 *
 * Fra 1024 px: skinne 56 px til venstre, bjella øverst, Mer åpner en skuff.
 * Under 1024 px: menylinje 56 px med logo, bjelle og meny-knapp; menyen er en skuff.
 * Hurtigknappen står på alle skjermer (beslutninger.md §Hurtigknappen).
 *
 * En portert side legger innholdet sitt i dette skallet i stedet for V2Shell.
 * Bjella viser bare et tall når siden sender det inn — aldri et anslag.
 */
import { useToppbarHoyde } from "@/components/v2/toppbar-hoyde";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell, CalendarCheck, CalendarDays, CalendarPlus, ChevronDown, ClipboardCheck, Ellipsis, Flag, Gauge, Inbox,
  Layers, MessageSquarePlus, Settings, Sparkles, Users, UsersRound, Wallet, X, type LucideIcon,
} from "lucide-react";
import { Ikon } from "./pa";
import { Hurtigknapp, type Hurtighandling } from "./Hurtigknapp";
import { useErAdmin } from "@/components/v2/rolle";
import { AOS_HURTIG, AOS_MENY, aktivtAosPunkt, synligeMer, type AosMerId, type AosPunktId } from "@/lib/agencyos/precision-ia";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";

const IKON: Record<AosPunktId | AosMerId, [LucideIcon, string]> = {
  cockpit: [Gauge, "gauge"], innboks: [Inbox, "inbox"], stall: [Users, "users"], kalender: [CalendarDays, "calendar-days"],
  workbench: [Layers, "layers"], mer: [Ellipsis, "ellipsis"], booking: [CalendarCheck, "calendar-check"],
  grupper: [UsersRound, "users-round"], tester: [ClipboardCheck, "clipboard-check"], okonomi: [Wallet, "wallet"], oppsett: [Settings, "settings"],
};
const HURTIG_IKON: Record<string, [LucideIcon, string]> = {
  okt: [Layers, "layers"], melding: [MessageSquarePlus, "message-square-plus"], runde: [Flag, "flag"],
  jarvis: [Sparkles, "sparkles"], booking: [CalendarPlus, "calendar-plus"],
};
const HURTIG: Hurtighandling[] = AOS_HURTIG.map((h) => ({ ...h, icon: HURTIG_IKON[h.id]![0], iconName: HURTIG_IKON[h.id]![1] }));

export type AgencyOSSkallProps = {
  children: ReactNode;
  /** Coachens navn (skuffens bunn og skinnens avatar). */
  navn: string;
  /** Uleste saker i innboksen. null = ukjent på denne siden: bjella vises uten tall. */
  uleste?: number | null;
  /** Innboksen har en sak som haster (Risiko, eller spillerspørsmål over 24 t): tallet blir rust. */
  haster?: boolean;
  /** Nattema (Live coachingøkt). Hurtigknappen vises ikke på nattflater. */
  natt?: boolean;
};

function Bjelle({ uleste, haster }: { uleste: number | null; haster: boolean }) {
  const n = uleste == null || uleste === 0 ? null : uleste > 99 ? "99+" : String(uleste);
  const label = n ? `Innboks, ${uleste} uleste${haster ? ", noe haster" : ""}` : "Innboks";
  return <Link href="/admin/innboks" className="pa-aos__bjelle" aria-label={label} data-bell="">
    <Ikon icon={Bell} size={20} name="bell" />
    {n && <span className={`pa-count ${haster ? "pa-count--signal" : "pa-count--inverse"}`} aria-hidden>{n}</span>}
  </Link>;
}

function Initialer({ navn, size }: { navn: string; size: number }) {
  const i = navn.split(/\s+/).filter(Boolean).slice(0, 2).map((d) => d[0]!.toUpperCase()).join("");
  return <span className="pa-aos__avatar" style={{ width: size, height: size }} aria-hidden>{i || "—"}</span>;
}

type Punkt = { id: AosPunktId | AosMerId; label: string; href: string };

function Skuff({ open, onClose, tittel, punkter, mer, aktiv, navn, rolle }: {
  open: boolean; onClose: () => void; tittel: ReactNode; punkter: readonly Punkt[]; mer: readonly Punkt[] | null;
  aktiv: { punkt: AosPunktId | null; mer: AosMerId | null }; navn: string; rolle: string;
}) {
  const [merApen, setMerApen] = useState(aktiv.punkt === "mer");
  const forste = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => forste.current?.focus(), 60);
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => { clearTimeout(t); window.removeEventListener("keydown", k); };
  }, [open, onClose]);
  const rad = (p: Punkt, paa: boolean, sub = false) => <Link key={p.id} href={p.href} onClick={onClose} aria-current={paa ? "page" : undefined}
    className={`pa-aos__skuffrad${sub ? " pa-aos__skuffrad--sub" : ""}`}>
    {!sub && <Ikon icon={IKON[p.id][0]} size={20} name={IKON[p.id][1]} />}<span className="pa-aos__skufftekst">{p.label}</span>
  </Link>;
  return <div className="pa-aos__skuff" data-open={open || undefined} aria-hidden={!open} inert={!open}>
    <div className="pa-aos__scrim" onClick={onClose} />
    <nav role="dialog" aria-modal="true" aria-label="Meny" className="pa-aos__skuffpanel">
      <div className="pa-aos__skuffhode">
        <div style={{ display: "flex", alignItems: "center", minWidth: 0, overflow: "hidden" }}>{tittel}</div>
        <span style={{ flex: 1 }} />
        <button ref={forste} type="button" onClick={onClose} aria-label="Lukk meny" className="pa-iconbtn"><Ikon icon={X} size={20} name="x" /></button>
      </div>
      <div className="pa-aos__skuffliste">
        {punkter.map((p) => rad(p, p.id === aktiv.punkt || p.id === aktiv.mer))}
        {mer && <>
          <button type="button" aria-expanded={merApen} onClick={() => setMerApen((o) => !o)} className="pa-aos__skuffrad" data-aktiv={aktiv.punkt === "mer" || undefined}>
            <Ikon icon={Ellipsis} size={20} name="ellipsis" /><span className="pa-aos__skufftekst">Mer</span>
            <span style={{ display: "inline-flex", transform: merApen ? "rotate(180deg)" : "none", transition: "transform 200ms var(--ease-out)", color: "var(--text-faint)" }}><Ikon icon={ChevronDown} size={16} name="chevron-down" /></span>
          </button>
          {merApen && mer.map((p) => rad(p, p.id === aktiv.mer, true))}
        </>}
      </div>
      <div className="pa-aos__skuffbunn"><Initialer navn={navn} size={32} /><div style={{ minWidth: 0 }}>
        <div className="pa-aos__navn">{navn}</div><div className="pa-aos__rolle">{rolle}</div>
      </div></div>
    </nav>
  </div>;
}

export function AgencyOSSkall({ children, navn, uleste = null, haster = false, natt = false }: AgencyOSSkallProps) {
  const toppRef = useToppbarHoyde<HTMLElement>();
  const path = usePathname() ?? "/admin/agencyos";
  const erHeadCoach = useErAdmin();
  const aktiv = aktivtAosPunkt(path);
  const mer = synligeMer(erHeadCoach);
  const rolle = erHeadCoach ? "HEAD COACH" : "COACH";
  const [meny, setMeny] = useState(false);
  const [merSkuff, setMerSkuff] = useState(false);
  const lukkMeny = () => setMeny(false);
  const lukkMer = () => setMerSkuff(false);
  const logo = <Image src="/logos/logo-ak-golf-hq.svg" alt="AK Golf HQ" width={91} height={20} style={{ height: 20, width: "auto", display: "block" }} priority />;

  return <div className="pa-root pa-aos" data-design="precision-athletics" data-theme={natt ? "night" : undefined}>
    <a className="pa-sr pa-skip" href="#pa-innhold">Hopp til innhold</a>
    <div className="pa-aos__skinne">
      <div className="pa-aos__bjellecelle"><Bjelle uleste={uleste} haster={haster} /></div>
      <nav className="pa-aos__rail" aria-label="Hovedmeny">
        <Link href="/admin/agencyos" aria-label="AgencyOS hjem" className="pa-aos__merke">
          <Image src="/logos/ak-golf-logo-ink.svg" alt="" width={28} height={28} />
        </Link>
        {AOS_MENY.map((m) => <Link key={m.id} href={m.href} aria-label={m.label} title={m.label} className="pa-aos__railpunkt" aria-current={aktiv.punkt === m.id ? "page" : undefined}>
          <Ikon icon={IKON[m.id][0]} size={20} name={IKON[m.id][1]} />
        </Link>)}
        <button type="button" aria-label="Mer" title="Mer" className="pa-aos__railpunkt" aria-current={aktiv.punkt === "mer" ? "page" : undefined} aria-expanded={merSkuff} onClick={() => setMerSkuff(true)}>
          <Ikon icon={Ellipsis} size={20} name="ellipsis" />
        </button>
        <span style={{ flex: 1 }} />
        <span title={navn}><Initialer navn={navn} size={32} /></span>
      </nav>
    </div>
    <header ref={toppRef} className="pa-aos__menylinje">
      <Link href="/admin/agencyos" aria-label="AgencyOS hjem" style={{ display: "flex", alignItems: "center", minHeight: 44, minWidth: 0, overflow: "hidden" }}>{logo}</Link>
      <span style={{ flex: 1 }} />
      <Bjelle uleste={uleste} haster={haster} />
      <button type="button" onClick={() => setMeny(true)} aria-label="Åpne meny" aria-expanded={meny} className="pa-aos__hamburger">
        <span /><span />
      </button>
    </header>
    <main id="pa-innhold" className="pa-aos__main">{children}</main>
    <Skuff open={meny} onClose={lukkMeny} tittel={logo} punkter={AOS_MENY} mer={mer} aktiv={aktiv} navn={navn} rolle={rolle} />
    <Skuff open={merSkuff} onClose={lukkMer} tittel={<span style={{ font: "600 15px/1 var(--font-sans)", color: "var(--text-primary)" }}>Mer</span>} punkter={mer} mer={null} aktiv={aktiv} navn={navn} rolle={rolle} />
    {!natt && <Hurtigknapp app="aos" handlinger={HURTIG} />}
  </div>;
}
