"use client";

/**
 * PlayerHQ-skallet i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/parts.jsx › Shell, runde 19–20).
 *
 * Under 1024 px: topplinje 56 px (logo + bjelle) og fanelinje 64 px nederst.
 * Fra 1024 px: sidemeny 232 px med logo, fanene med navn og Innboks med teller
 * (nytt design, utkast-playerhq/felles/felles.css; stil i playerhq-ny-skall.css).
 * Faner 28.09.2026: I dag · Plan · Stats · Meg.
 *
 * Hurtigknappen (felles Hurtigknapp.tsx) står på alle PlayerHQ-sider: Spør Caddie · Ny økt ·
 * Registrer runde · Start økt (beslutninger.md §Hurtigknappen, 28.09). «Start økt» går via
 * /portal/tren/start, som åpner pågående eller neste økt.
 * Ikke med ennå: innboks-arket bak bjella. Bjella lenker til dagens meldingsside til arket er portert.
 */
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, type ReactNode } from "react";
import { Bell, Flag, Layers, Play, Sparkles } from "lucide-react";
import { Hurtigknapp, type Hurtighandling } from "./Hurtigknapp";
import { PLAYERHQ_FANER as FANER, erAktivFane as erAktiv } from "./playerhq-faner";
import { Ikon } from "./pa";
import "@/styles/precision-athletics.css";
import "@/styles/playerhq-ny-skall.css";

function Bjelle({ href, antall }: { href: string; antall: number }) {
  const label = antall > 0 ? `Innboks, ${antall} uleste` : "Innboks";
  return <Link href={href} className="pa-iconbtn" aria-label={label}>
    <Ikon icon={Bell} size={20} name="bell" />
    {antall > 0 && <span className="pa-count pa-count--inverse" aria-hidden style={{ position: "absolute", top: 4, right: 2, minWidth: 18, height: 18, padding: "0 5px" }}>{antall}</span>}
  </Link>;
}

const HURTIG: Hurtighandling[] = [
  { id: "caddie", label: "Spør Caddie", icon: Sparkles, iconName: "sparkles", href: "/portal/caddie" },
  { id: "okt", label: "Ny økt", icon: Layers, iconName: "layers", href: "/portal/planlegge/workbench" },
  { id: "runde", label: "Registrer runde", icon: Flag, iconName: "flag", href: "/portal/mal/runder/ny" },
  { id: "start", label: "Start økt", icon: Play, iconName: "play", href: "/portal/tren/start" },
];

/* Et skall inni et annet (gammel side i V2Shell som rendrer en portert komponent med eget
   skall) skal ikke gi to menyer: det indre skallet viser bare innholdet. */
const InniSkall = createContext(false);

export function PlayerHQSkall({ children, innboksHref, uleste }: { children: ReactNode; innboksHref: string; uleste: number }) {
  const path = usePathname() ?? "/portal";
  const inni = useContext(InniSkall);
  if (inni) return <>{children}</>;
  return <InniSkall.Provider value><div className="pa-root pa-skall pa-skall--ny" data-design="precision-athletics">
    <a className="pa-sr pa-skip" href="#pa-innhold">Hopp til innhold</a>
    <nav className="pa-skall__skinne" aria-label="Hovedmeny">
      <Link href="/portal" className="phs-logo" aria-label="PlayerHQ hjem">
        <Image src="/logos/logo-ak-golf-hq.svg" alt="AK Golf HQ" width={100} height={22} style={{ height: 22, width: "auto" }} />
      </Link>
      {FANER.map((f) => <Link key={f.href} href={f.href} className="phs-lenke" aria-current={erAktiv(path, f.href) ? "page" : undefined}>
        <Ikon icon={f.icon} size={20} name={f.name} />{f.label}
      </Link>)}
      <span className="phs-skille" aria-hidden />
      <Link href={innboksHref} className="phs-lenke" aria-label={uleste > 0 ? `Innboks, ${uleste} uleste` : "Innboks"}>
        <Ikon icon={Bell} size={20} name="bell" />Innboks{uleste > 0 && <span className="phs-teller" aria-hidden>{uleste}</span>}
      </Link>
    </nav>
    <header className="pa-skall__topp">
      <Link href="/portal" aria-label="PlayerHQ hjem" style={{ display: "flex", alignItems: "center", minHeight: 44, minWidth: 0 }}>
        <Image src="/logos/logo-ak-golf-hq.svg" alt="AK Golf HQ" width={91} height={20} style={{ height: 20, width: "auto" }} priority />
      </Link>
      <span style={{ flex: 1 }} />
      <Bjelle href={innboksHref} antall={uleste} />
    </header>
    <main id="pa-innhold" className="pa-skall__main">{children}</main>
    <nav className="pa-tabbar pa-skall__faner" aria-label="Hovedmeny">
      {FANER.map((f) => <Link key={f.href} href={f.href} className="pa-tabbar__item" aria-current={erAktiv(path, f.href) ? "page" : undefined}>
        <Ikon icon={f.icon} size={22} name={f.name} />{f.label}
      </Link>)}
    </nav>
    <Hurtigknapp app="phq" handlinger={HURTIG} bunn={72} />
  </div></InniSkall.Provider>;
}
