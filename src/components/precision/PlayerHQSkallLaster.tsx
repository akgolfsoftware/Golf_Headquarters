/**
 * PlayerHQ-skallet som ren serverkomponent, bare for loading.tsx.
 *
 * Samme markup og klasser som PlayerHQSkall, men uten "use client", next/link, next/image og
 * usePathname: klientkode i importtreet til en loading-grense gir et skript uten nonce, og CSP
 * stopper det (gotchas §Bygg og drift, skjermkontrollen 15.10 funn 3). Lenkene er vanlige
 * <a>; skallet vises bare til siden er hentet. Aktiv fane kommer fra `sti`, som loading.tsx
 * kjenner selv. Vakt: scripts/check-loading-server.mjs.
 */
import type { ReactNode } from "react";
import { Bell } from "lucide-react";
import { PLAYERHQ_FANER, erAktivFane } from "./playerhq-faner";
import "@/styles/precision-athletics.css";
import "@/styles/playerhq-ny-skall.css";

const INNBOKS = "/portal/varsler";

/* eslint-disable @next/next/no-img-element -- next/image er en klientmodul (se over). */
export function PlayerHQSkallLaster({ sti, children }: { sti: string; children: ReactNode }) {
  return <div className="pa-root pa-skall pa-skall--ny" data-design="precision-athletics">
    <nav className="pa-skall__skinne" aria-label="Hovedmeny">
      <a href="/portal" className="phs-logo" aria-label="PlayerHQ hjem">
        <img src="/logos/logo-ak-golf-hq.svg" alt="AK Golf HQ" width={100} height={22} style={{ height: 22, width: "auto" }} />
      </a>
      {PLAYERHQ_FANER.map((f) => <a key={f.href} href={f.href} className="phs-lenke" aria-current={erAktivFane(sti, f.href) ? "page" : undefined}>
        <f.icon className="pa-icon" data-icon={f.name} size={20} strokeWidth={2} aria-hidden />{f.label}
      </a>)}
      <span className="phs-skille" aria-hidden />
      <a href={INNBOKS} className="phs-lenke" aria-label="Innboks">
        <Bell className="pa-icon" data-icon="bell" size={20} strokeWidth={2} aria-hidden />Innboks
      </a>
    </nav>
    <header className="pa-skall__topp">
      <a href="/portal" aria-label="PlayerHQ hjem" style={{ display: "flex", alignItems: "center", minHeight: 44, minWidth: 0 }}>
        <img src="/logos/logo-ak-golf-hq.svg" alt="AK Golf HQ" width={91} height={20} style={{ height: 20, width: "auto" }} />
      </a>
      <span style={{ flex: 1 }} />
      <a href={INNBOKS} className="pa-iconbtn" aria-label="Innboks">
        <Bell className="pa-icon" data-icon="bell" size={20} strokeWidth={2} aria-hidden />
      </a>
    </header>
    <main id="pa-innhold" className="pa-skall__main">{children}</main>
    <nav className="pa-tabbar pa-skall__faner" aria-label="Hovedmeny">
      {PLAYERHQ_FANER.map((f) => <a key={f.href} href={f.href} className="pa-tabbar__item" aria-current={erAktivFane(sti, f.href) ? "page" : undefined}>
        <f.icon className="pa-icon" data-icon={f.name} size={22} strokeWidth={2} aria-hidden />{f.label}
      </a>)}
    </nav>
  </div>;
}
/* eslint-enable @next/next/no-img-element */
