"use client";

/**
 * AgencyOS-skallet, menyvariant C (beslutninger.md §AGENCYOS-MENYEN BLIR VARIANT C, 16.10.2026).
 * Fasit: docs/design-system/utkast-agencyos/meny.html, variant C.
 *
 * PC fra 900 px: sidemeny med søk øverst (⌘K), neste økt som fylt kort, punktene i tre
 * grupper (Daglig · Spillere · Drift) og coachen nederst. Menyen kan legges sammen til en
 * ikonskinne på 72 px: trykk på et ikon går rett til siden; trykk ellers på skinna glir
 * hele menyen ut over innholdet, og et valg der legger den inn igjen. Valget huskes i
 * nettleseren.
 * Mobil: topplinje med meny, søkefelt og bjelle; menyen åpner som hel flate.
 * Hurtigknappen står på alle /admin-sider (beslutninger.md §Hurtigknappen).
 *
 * Alle /admin-sider får dette skallet: portert side legger seg selv i det, og
 * V2Shell bruker det for AgencyOS (src/components/v2/shell.tsx). Lyst tema er standard.
 * Bjella og innboks-tallet vises bare når siden sender tallet inn, aldri et anslag.
 *
 * Avvik:
 *   - Neste økt er grafitt når tjenesten ikke sier aksen (utkastet viser alltid TEK), og «—» uten økt.
 *   - Mobilflaten har ikke «Siste»-brikkene fra utkastet; det finnes ingen historikk å hente dem fra.
 *   - Data Golf står ikke i Drift før DG-01 finnes under /admin (beslutningen punkt 4).
 *   - Hurtigknappen er den felles komponenten (Hurtigknapp.tsx) med fast posisjon i vinduet.
 */
import { useToppbarHoyde } from "@/components/v2/toppbar-hoyde";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from "react";
import {
  Bell, BarChart3, CalendarCheck, CalendarDays, CalendarPlus, ClipboardCheck, Flag, Inbox, LayoutDashboard, Layers, LineChart, Menu,
  MessageSquarePlus, PanelLeftClose, PanelLeftOpen, Search, SlidersHorizontal, Sparkles, Users, UsersRound, X, type LucideIcon,
} from "lucide-react";
import { Hurtigknapp, type Hurtighandling } from "./Hurtigknapp";
import { useErAdmin } from "@/components/v2/rolle";
import { AOS_HURTIG, aktivtAosId, synligeGrupper, type AosId } from "@/lib/agencyos/precision-ia";
import type { NesteOktKort } from "@/lib/agencyos/neste-okt";
import { onsketTema } from "@/lib/v2/tema-default";
import { GlobalSearchModal } from "@/components/admin/global-search-modal";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";
import "@/styles/agencyos-ny.css";

const IKON: Record<AosId, LucideIcon> = {
  cockpit: LayoutDashboard, innboks: Inbox, kalender: CalendarDays, stall: Users, workbench: Layers,
  grupper: UsersRound, tester: ClipboardCheck, booking: CalendarCheck, okonomi: LineChart, datagolf: BarChart3, oppsett: SlidersHorizontal,
};
const HURTIG_IKON: Record<string, [LucideIcon, string]> = {
  okt: [Layers, "layers"], melding: [MessageSquarePlus, "message-square-plus"], runde: [Flag, "flag"],
  jarvis: [Sparkles, "sparkles"], booking: [CalendarPlus, "calendar-plus"],
};
const HURTIG: Hurtighandling[] = AOS_HURTIG.map((h) => ({ ...h, icon: HURTIG_IKON[h.id]![0], iconName: HURTIG_IKON[h.id]![1] }));

const MENY_NOKKEL = "ak-aos-meny";
type Form = "bred" | "smal";

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

function apneSok() {
  window.dispatchEvent(new Event("global-search:open"));
}

/** Neste økt hentes én gang og deles mellom sideskift i samme fane (kort levetid). */
let nesteOktBuffer: { tid: number; okt: NesteOktKort | null } | null = null;
function useNesteOkt() {
  const [okt, setOkt] = useState<NesteOktKort | null | undefined>(() =>
    nesteOktBuffer && Date.now() - nesteOktBuffer.tid < 60_000 ? nesteOktBuffer.okt : undefined);
  useEffect(() => {
    if (nesteOktBuffer && Date.now() - nesteOktBuffer.tid < 60_000) return;
    let avbrutt = false;
    fetch("/api/admin/neste-okt", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { okt: NesteOktKort | null }) => {
        nesteOktBuffer = { tid: Date.now(), okt: d.okt };
        if (!avbrutt) setOkt(d.okt);
      })
      .catch(() => { if (!avbrutt) setOkt(null); });
    return () => { avbrutt = true; };
  }, []);
  return okt;
}

function NesteOkt({ okt, onVelg }: { okt: NesteOktKort | null | undefined; onVelg?: () => void }) {
  if (okt === undefined) return <div className="agn-neste laster" aria-hidden />;
  if (okt === null) {
    return <div className="agn-neste tom" title="Ingen flere økter i dag">
      <span className="kort-tid" aria-hidden><span className="tt">—</span></span>
      <span className="lang"><span className="etk">Neste økt i dag</span><strong className="stor-tid">—</strong><small>Ingen flere økter i dag</small></span>
    </div>;
  }
  return <Link href={okt.href} onClick={onVelg} className={`agn-neste${okt.akse ? ` ${okt.akse}` : ""}`} title={`Neste økt ${okt.tid} ${okt.spiller}`} data-ikon-lenke="">
    <span className="kort-tid" aria-hidden><span className="tt">{okt.time}</span><span className="mm">:{okt.minutt}</span></span>
    <span className="lang"><span className="etk">Neste økt</span><strong className="stor-tid">{okt.tid}</strong><b>{okt.spiller}</b>{okt.meta && <small>{okt.meta}</small>}</span>
  </Link>;
}

function Grupper({ aktiv, uleste, haster, erHeadCoach, onVelg }: {
  aktiv: AosId | null; uleste: number | null; haster: boolean; erHeadCoach: boolean; onVelg?: () => void;
}) {
  const n = tallTekst(uleste);
  return <>
    {synligeGrupper(erHeadCoach).map((g) => <div key={g.id} className="agn-gruppe" role="group" aria-labelledby={`agn-g-${g.id}`}>
      <span className="etk" id={`agn-g-${g.id}`}>{g.label}</span>
      {g.punkter.map((p) => {
        const I = IKON[p.id];
        return <Link key={p.id} href={p.href} onClick={onVelg} className="agn-lenke" title={p.label} data-ikon-lenke=""
          aria-current={aktiv === p.id ? "page" : undefined}>
          <I className="agn-ikon" aria-hidden /><span className="tx">{p.label}</span>
          {p.id === "okonomi" && <span className="lite">Head coach</span>}
          {p.id === "innboks" && n && <span className={`tall${haster ? " haster" : ""}`} aria-label={`${uleste} uleste`}>{n}</span>}
        </Link>;
      })}
    </div>)}
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

/** Bred eller sammenlagt meny på PC, husket i nettleseren. */
let formMinne: Form | null = null;
const formLyttere = new Set<() => void>();
function lesForm(): Form {
  if (formMinne) return formMinne;
  try { return localStorage.getItem(MENY_NOKKEL) === "smal" ? "smal" : "bred"; } catch { return "bred"; }
}
function useMenyForm(): [Form, (f: Form) => void] {
  const form = useSyncExternalStore(
    (lytt) => { formLyttere.add(lytt); return () => { formLyttere.delete(lytt); }; },
    lesForm,
    () => "bred" as Form,
  );
  const sett = (f: Form) => {
    formMinne = f;
    try { localStorage.setItem(MENY_NOKKEL, f); } catch { /* lagring sperret: gjelder til fanen lukkes */ }
    formLyttere.forEach((l) => l());
  };
  return [form, sett];
}

export function AgencyOSSkall({ children, navn, uleste = null, haster = false }: AgencyOSSkallProps) {
  const toppRef = useToppbarHoyde<HTMLElement>();
  const path = usePathname() ?? "/admin/agencyos";
  const erHeadCoach = useErAdmin();
  const aktiv = aktivtAosId(path);
  const nesteOkt = useNesteOkt();
  const [mobilMeny, setMobilMeny] = useState(false);
  const [form, setForm] = useMenyForm();
  const [ute, setUte] = useState(false);
  useTemaSynk(path);

  useEffect(() => {
    if (!mobilMeny && !ute) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { setMobilMeny(false); setUte(false); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [mobilMeny, ute]);

  const smal = form === "smal" && !ute;
  /** I ikonskinna: et ikon går rett til siden, alt annet på skinna får menyen til å gli ut. */
  const trykkSkinne = (e: MouseEvent<HTMLElement>) => {
    if (!smal) return;
    if ((e.target as HTMLElement).closest("[data-ikon-lenke]")) return;
    e.preventDefault();
    setUte(true);
  };
  const lukkUte = () => setUte(false);
  const rolle = erHeadCoach ? "Head coach" : "Coach";
  const logo = (h: number) => <Image src="/logos/logo-ak-golf-hq.svg" alt="AK Golf HQ" width={Math.round(h * 4.55)} height={h} className="agn-logo" priority />;

  return <div className="pa-root agn" data-design="agencyos-ny" data-meny={form} data-ute={ute ? "" : undefined}>
    <a className="pa-sr pa-skip" href="#agn-innhold">Hopp til innhold</a>
    <header ref={toppRef} className="agn-topp">
      <button type="button" className="agn-ikonknapp" aria-label="Meny" aria-expanded={mobilMeny} aria-controls="agn-flate" onClick={() => setMobilMeny(true)}>
        <Menu className="agn-ikon" aria-hidden />
      </button>
      <button type="button" className="agn-sok" onClick={apneSok}>
        <Search className="agn-ikon" aria-hidden /><span className="tx">Hopp til spiller eller side</span>
      </button>
      <Bjelle uleste={uleste} haster={haster} />
    </header>

    <div id="agn-flate" className="agn-flate" role="dialog" aria-modal="true" aria-label="Meny" hidden={!mobilMeny}>
      <div className="hd">
        <button type="button" className="agn-sok" onClick={() => { setMobilMeny(false); apneSok(); }}>
          <Search className="agn-ikon" aria-hidden /><span className="tx">Hopp til spiller eller side</span>
        </button>
        <button type="button" className="agn-ikonknapp" aria-label="Lukk meny" onClick={() => setMobilMeny(false)}>
          <X className="agn-ikon" aria-hidden />
        </button>
      </div>
      <nav className="kropp" aria-label="Hovedmeny">
        <NesteOkt okt={nesteOkt} onVelg={() => setMobilMeny(false)} />
        <Grupper aktiv={aktiv} uleste={uleste} haster={haster} erHeadCoach={erHeadCoach} onVelg={() => setMobilMeny(false)} />
        <div className="agn-coach">
          <span className="av" aria-hidden>{initialer(navn)}</span>
          <span className="navn"><b>{navn}</b><span>{rolle}</span></span>
        </div>
      </nav>
    </div>

    <div className="agn-skall">
      <div className="agn-meny-plass">
        {ute && <button type="button" className="agn-meny-bak" aria-label="Lukk menyen" tabIndex={-1} onClick={lukkUte} />}
        <nav className={`agn-meny${smal ? " smal" : ""}`} aria-label="Hovedmeny" onClick={trykkSkinne}>
          <div className="agn-meny-topp">
            <Link href="/admin/agencyos" aria-label="AgencyOS hjem" className="agn-logo-lenke" onClick={lukkUte}>{logo(22)}</Link>
            <span className="agn-merke" title="Vis hele menyen" aria-hidden>AK</span>
            {smal
              ? <button type="button" className="pa-sr" onClick={() => setUte(true)}>Vis hele menyen</button>
              : <button type="button" className="agn-ikonknapp agn-feste"
                  aria-label={form === "smal" ? "Fest menyen" : "Legg menyen sammen"} title={form === "smal" ? "Fest menyen" : "Legg menyen sammen"}
                  onClick={() => { setUte(false); setForm(form === "smal" ? "bred" : "smal"); }}>
                  {form === "smal" ? <PanelLeftOpen className="agn-ikon" aria-hidden /> : <PanelLeftClose className="agn-ikon" aria-hidden />}
                </button>}
          </div>
          <button type="button" className="agn-sok" title="Hopp til (⌘K)" onClick={(e) => { if (smal) return; e.stopPropagation(); setUte(false); apneSok(); }}>
            <Search className="agn-ikon" aria-hidden /><span className="tx">Hopp til …</span><kbd>⌘K</kbd>
          </button>
          <NesteOkt okt={nesteOkt} onVelg={lukkUte} />
          <Grupper aktiv={aktiv} uleste={uleste} haster={haster} erHeadCoach={erHeadCoach} onVelg={lukkUte} />
          <div className="agn-coach">
            <span className="av" aria-hidden>{initialer(navn)}</span>
            <span className="navn"><b>{navn}</b><span>{rolle}</span></span>
          </div>
        </nav>
      </div>
      <div className="agn-hoved">
        <div className="agn-pc-topp"><Bjelle uleste={uleste} haster={haster} /></div>
        <main id="agn-innhold" className="agn-main">{children}</main>
      </div>
    </div>
    <Hurtigknapp app="aos" handlinger={HURTIG} />
    <GlobalSearchModal />
  </div>;
}
