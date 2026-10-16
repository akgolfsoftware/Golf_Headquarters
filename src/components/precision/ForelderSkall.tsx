"use client";

/**
 * Forelderskallet i Precision Athletics.
 * Tegningen har fire faner: I dag, Samtykke, Økonomi, Dialog.
 * Produktet har i tillegg barn, bookinger, ukerapport, fakturaer, varsler
 * og innstillinger. De ligger under Mer, så ingen rute forsvinner.
 */
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Bell, Ellipsis, MessagesSquare, ShieldCheck, Sun, Wallet } from "lucide-react";
import { Ikon } from "./pa";
import "@/styles/precision-athletics.css";

const FANER = [
  { href: "/forelder", label: "I dag", icon: Sun, name: "sun" },
  { href: "/forelder/samtykke", label: "Samtykke", icon: ShieldCheck, name: "shield-check" },
  { href: "/forelder/okonomi", label: "Økonomi", icon: Wallet, name: "wallet" },
  { href: "/forelder/coach", label: "Dialog", icon: MessagesSquare, name: "messages-square" },
] as const;

const MER = [
  { href: "/forelder/barn", label: "Barn" },
  { href: "/forelder/bookinger", label: "Bookinger" },
  { href: "/forelder/ukerapport", label: "Ukerapport" },
  { href: "/forelder/fakturaer", label: "Fakturaer" },
  { href: "/forelder/varsler", label: "Varsler" },
  { href: "/forelder/innstillinger", label: "Innstillinger" },
] as const;

function erAktiv(path: string, href: string) {
  if (href === "/forelder") return path === "/forelder";
  if (href === "/forelder/okonomi") return path === href || path.startsWith("/forelder/fakturaer");
  if (href === "/forelder/samtykke") return path === href || path.startsWith(href + "/");
  return path === href || path.startsWith(href + "/");
}

export function ForelderSkall({ children }: { children: ReactNode; navn?: string | null }) {
  const path = usePathname() ?? "/forelder";
  const [mer, setMer] = useState(false);

  return (
    <div className="pa-root pa-skall" data-design="precision-athletics">
      <a className="pa-sr pa-skip" href="#pa-innhold">Hopp til innhold</a>
      <nav className="pa-skall__skinne" aria-label="Hovedmeny">
        <div className="pa-skall__bjellecelle">
          <Link href="/forelder/varsler" className="pa-iconbtn" aria-label="Varsler">
            <Ikon icon={Bell} size={20} name="bell" />
          </Link>
        </div>
        <div className="pa-rail">
          <Link href="/forelder" aria-label="Forelder hjem" style={{ display: "grid", placeItems: "center", width: 44, height: 44, marginBottom: 8 }}>
            <Image src="/logos/ak-golf-logo-ink.svg" alt="AK Golf HQ" width={28} height={28} />
          </Link>
          {FANER.map((f) => (
            <Link key={f.href} href={f.href} className="pa-rail__item" aria-label={f.label} aria-current={erAktiv(path, f.href) ? "page" : undefined}>
              <Ikon icon={f.icon} size={20} name={f.name} />
            </Link>
          ))}
          <button type="button" className="pa-rail__item" aria-expanded={mer} aria-label="Mer" onClick={() => setMer((v) => !v)}>
            <Ikon icon={Ellipsis} size={20} name="ellipsis" />
          </button>
        </div>
      </nav>
      <header className="pa-skall__topp">
        <Link href="/forelder" aria-label="Forelder hjem" style={{ display: "flex", alignItems: "center", minHeight: 44, minWidth: 0 }}>
          <Image src="/logos/logo-ak-golf-hq.svg" alt="AK Golf HQ" width={91} height={20} style={{ height: 20, width: "auto" }} priority />
        </Link>
        <span style={{ flex: 1 }} />
        <button type="button" className="pa-btn pa-btn--ghost pa-btn--sm" aria-expanded={mer} onClick={() => setMer((v) => !v)}>Mer</button>
        <Link href="/forelder/varsler" className="pa-iconbtn" aria-label="Varsler">
          <Ikon icon={Bell} size={20} name="bell" />
        </Link>
      </header>
      {mer ? (
        <nav className="fo-mer" aria-label="Flere sider">
          {MER.map((m) => (
            <Link key={m.href} href={m.href} aria-current={erAktiv(path, m.href) ? "page" : undefined} onClick={() => setMer(false)}>{m.label}</Link>
          ))}
        </nav>
      ) : null}
      <main id="pa-innhold" className="pa-skall__main fo-ramme">{children}</main>
      <nav className="pa-tabbar pa-skall__faner" aria-label="Hovedmeny">
        {FANER.map((f) => (
          <Link key={f.href} href={f.href} className="pa-tabbar__item" aria-current={erAktiv(path, f.href) ? "page" : undefined}>
            <Ikon icon={f.icon} size={22} name={f.name} />{f.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
