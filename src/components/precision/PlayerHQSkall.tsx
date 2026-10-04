"use client";

/**
 * PlayerHQ-skallet i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/parts.jsx › Shell, runde 19–20).
 *
 * Under 1024 px: topplinje 56 px (logo + bjelle) og fanelinje 64 px nederst.
 * Fra 1024 px: skinne 56 px til venstre med bjella øverst.
 * Faner 28.09.2026: I dag · Plan · Stats · Meg.
 *
 * Ikke med ennå: hurtigknappen og innboks-arket bak bjella. Bjella lenker til
 * dagens meldingsside til arket er portert.
 */
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Bell, CalendarDays, ChartNoAxesColumn, Sun, User } from "lucide-react";
import { Ikon } from "./pa";
import "@/styles/precision-athletics.css";

const FANER = [
  { href: "/portal", label: "I dag", icon: Sun, name: "sun" },
  { href: "/portal/planlegge", label: "Plan", icon: CalendarDays, name: "calendar-days" },
  { href: "/portal/analysere", label: "Stats", icon: ChartNoAxesColumn, name: "chart-no-axes-column" },
  { href: "/portal/meg", label: "Meg", icon: User, name: "user" },
] as const;

function erTestDetalj(path: string) {
  if (!path.startsWith("/portal/tren/tester/")) return false;
  const rest = path.slice("/portal/tren/tester/".length);
  if (rest === "ny" || rest.startsWith("ny/") || rest.startsWith("team-norway") || rest.includes("/gjennomfor")) return false;
  return true;
}

function erAktiv(path: string, href: string) {
  if (href === "/portal") {
    // Booking med coach utelater aktiv. Det gamle skallet utleder da I dag.
    return path === "/portal" || path.startsWith("/portal/booking/coach");
  }
  // Coach, målbygger og enkeltmål hørte til Meg (aktiv="meg").
  if (href === "/portal/meg") {
    return path === href || path.startsWith(href + "/") || path.startsWith("/portal/coach") || path.startsWith("/portal/ai/mal-bygger") || path.startsWith("/portal/mal/goal");
  }
  // Øvelser, ny booking, testdetalj og FYS-plan markerte Plan. aktiv="gjor" og /ny skal ikke lyse noen fane.
  if (href === "/portal/planlegge") {
    return path === href || path.startsWith(href + "/") || path.startsWith("/portal/drills") || path === "/portal/booking/ny" || path.startsWith("/portal/booking/ny/") || erTestDetalj(path) || path === "/portal/tren/fys-plan" || path.startsWith("/portal/tren/fys-plan/");
  }
  // Analyse, gameplan, ny runde og gapping markerte Analyse.
  if (href === "/portal/analysere") {
    return path === href || path.startsWith(href + "/") || path.startsWith("/portal/gameplan") || path.startsWith("/portal/mal/runder") || path.startsWith("/portal/mal/trackman");
  }
  return path === href || path.startsWith(href + "/");
}

function Bjelle({ href, antall }: { href: string; antall: number }) {
  const label = antall > 0 ? `Innboks, ${antall} uleste` : "Innboks";
  return <Link href={href} className="pa-iconbtn" aria-label={label}>
    <Ikon icon={Bell} size={20} name="bell" />
    {antall > 0 && <span className="pa-count pa-count--inverse" aria-hidden style={{ position: "absolute", top: 4, right: 2, minWidth: 18, height: 18, padding: "0 5px" }}>{antall}</span>}
  </Link>;
}

export function PlayerHQSkall({ children, innboksHref, uleste }: { children: ReactNode; innboksHref: string; uleste: number }) {
  const path = usePathname() ?? "/portal";
  return <div className="pa-root pa-skall" data-design="precision-athletics">
    <a className="pa-sr pa-skip" href="#pa-innhold">Hopp til innhold</a>
    <nav className="pa-skall__skinne" aria-label="Hovedmeny">
      <div className="pa-skall__bjellecelle"><Bjelle href={innboksHref} antall={uleste} /></div>
      <div className="pa-rail">
        <Link href="/portal" aria-label="PlayerHQ hjem" style={{ display: "grid", placeItems: "center", width: 44, height: 44, marginBottom: 8 }}>
          <Image src="/logos/ak-golf-logo-ink.svg" alt="AK Golf HQ" width={28} height={28} />
        </Link>
        {FANER.map((f) => <Link key={f.href} href={f.href} className="pa-rail__item" aria-label={f.label} aria-current={erAktiv(path, f.href) ? "page" : undefined}>
          <Ikon icon={f.icon} size={20} name={f.name} />
        </Link>)}
      </div>
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
  </div>;
}
