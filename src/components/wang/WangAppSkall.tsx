'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { logout } from '@/lib/auth/logout';
import {
  Sun,
  Activity,
  Dumbbell,
  Flag,
  Mail,
  Users,
  Settings,
  List,
  LogOut,
  X,
  Plus,
  CalendarPlus,
  ClipboardCheck,
  MessageSquarePlus,
  Timer,
  ExternalLink,
  Search,
  MoreHorizontal,
} from 'lucide-react';
const wangLogo = '/team-wang/wang-logo-horizontal.svg';

export type WangOmraade =
  | 'idag'
  | 'trening'
  | 'tester'
  | 'konkurranse'
  | 'meldinger'
  | 'elever'
  | 'admin'
  | 'system';

export type WangRolle = 'Trener' | 'Sportssjef';

/** Neste økt i gruppas kalender, regnet ut på serveren. Kortet vises ikke når det ikke finnes noen. */
export interface WangNesteOkt {
  tid: string;
  tittel: string;
  /** For eksempel «om 3 t 25 min» eller «i morgen». */
  naar: string;
  info: string | null;
  href: string;
}

/** Ett treff i søket: elever og ukas økter fra gruppas egne data. */
export interface WangSokTreff {
  id: string;
  tekst: string;
  under: string;
  href: string;
}

interface WangAppSkallProps {
  /** Avgjort på serveren. Skallet kan ikke endre den. */
  rolle: WangRolle;
  brukerNavn?: string;
  aktivtOmraade: WangOmraade;
  aktivFane?: string;
  onFaneEndring?: (fane: string) => void;
  faner?: { id: string; tittel: string; opt?: string }[];
  neste?: WangNesteOkt | null;
  sokbart?: WangSokTreff[];
  children?: React.ReactNode;
}

/**
 * Skallet for trenerflaten /team-wang/coach.
 * Fasit: docs/design-system/utkast-wang/grunnmur.html og felles/wang.js (pakke 1).
 * Samme oppsett som AgencyOS (Anders 15.10.2026): lys sidemeny med navy aktiv rad og
 * brukeren nederst på PC, hamburgermeny og logo på mobil, hurtigknapp på alle skjermer.
 * Administrasjon vises bare for sportssjef (rollen avgjøres på serveren).
 * Designløft 20.10.2026 (canvas «WANG nøkkelskjermer», godkjent av Anders): søk og neste økt i sidemenyen,
 * meny nederst på mobil (I dag · Trening · Elever · Meldinger · Mer) og hvit hurtigknapp med vinrød kant.
 * Avvik:
 *   - Bjella står ikke: trenerflaten har ingen varsler ennå.
 *   - Søket leter bare i gruppas elever og ukas økter, de dataene skallet har.
 *   - Skjermoversikten og den åpne fellessiden ligger under Mer, som før.
 */
export function WangAppSkall({
  rolle,
  brukerNavn,
  aktivtOmraade,
  aktivFane,
  onFaneEndring,
  faner = [],
  neste = null,
  sokbart = [],
  children,
}: WangAppSkallProps) {
  const [visMobilMeny, setVisMobilMeny] = useState(false);
  const [visHurtig, setVisHurtig] = useState(false);
  const [sok, setSok] = useState('');
  const skuffId = useId();
  const hurtigId = useId();
  const sokId = useId();
  const hurtigRef = useRef<HTMLButtonElement>(null);
  const sokRef = useRef<HTMLInputElement>(null);
  const mobilSokRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const snarvei = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (window.matchMedia('(min-width: 900px)').matches) {
          sokRef.current?.focus();
        } else {
          setVisMobilMeny(true);
          requestAnimationFrame(() => mobilSokRef.current?.focus());
        }
      }
    };
    window.addEventListener('keydown', snarvei);
    return () => window.removeEventListener('keydown', snarvei);
  }, []);

  const sokOrd = sok.trim().toLowerCase();
  const treff = sokOrd
    ? sokbart.filter((t) => `${t.tekst} ${t.under}`.toLowerCase().includes(sokOrd)).slice(0, 8)
    : [];

  useEffect(() => {
    if (!visMobilMeny && !visHurtig) return;
    const lukk = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setVisMobilMeny(false);
      setSok('');
      if (visHurtig) {
        setVisHurtig(false);
        hurtigRef.current?.focus();
      }
    };
    window.addEventListener('keydown', lukk);
    return () => window.removeEventListener('keydown', lukk);
  }, [visMobilMeny, visHurtig]);

  const hovedMeny = [
    { id: 'idag', label: 'I dag', href: '/team-wang/coach?omraade=idag', ikon: Sun },
    { id: 'trening', label: 'Trening', href: '/team-wang/coach?omraade=trening', ikon: Activity },
    { id: 'tester', label: 'Tester', href: '/team-wang/coach?omraade=tester', ikon: Dumbbell },
    { id: 'konkurranse', label: 'Konkurranse', href: '/team-wang/coach?omraade=konkurranse', ikon: Flag },
    { id: 'meldinger', label: 'Meldinger', href: '/team-wang/coach?omraade=meldinger', ikon: Mail },
    { id: 'elever', label: 'Elever', href: '/team-wang/coach?omraade=elever', ikon: Users },
    ...(rolle === 'Sportssjef'
      ? [{ id: 'admin', label: 'Administrasjon', href: '/team-wang/coach?omraade=admin', ikon: Settings }]
      : []),
  ];

  const hurtig = [
    { label: 'Ny økt', href: '/team-wang/coach?omraade=trening', ikon: CalendarPlus },
    { label: 'Før oppmøte', href: '/team-wang/coach?omraade=idag&fane=oppmote', ikon: ClipboardCheck },
    { label: 'Ny melding', href: '/team-wang/coach?omraade=meldinger', ikon: MessageSquarePlus },
    { label: 'Før test', href: '/team-wang/coach?omraade=tester', ikon: Timer },
  ];

  const menyLenker = (lukk?: () => void) => (
    <>
      {hovedMeny.map((item) => {
        const Ikon = item.ikon;
        const erAktiv = aktivtOmraade === item.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={lukk}
            className={`wg-nav ${erAktiv ? 'wg-nav-pa' : ''}`}
            aria-current={erAktiv ? 'page' : undefined}
          >
            <Ikon size={20} aria-hidden style={{ flex: 'none' }} />
            <span>{item.label}</span>
          </Link>
        );
      })}
      <span className="wg-del">Mer</span>
      <Link href="/team-wang/skjermer" onClick={lukk} className={`wg-nav ${aktivtOmraade === 'system' ? 'wg-nav-pa' : ''}`}>
        <List size={18} aria-hidden style={{ flex: 'none' }} />
        <span>Skjermoversikt</span>
      </Link>
      <Link href="/team-wang" target="_blank" onClick={lukk} className="wg-nav">
        <ExternalLink size={18} aria-hidden style={{ flex: 'none' }} />
        <span>Åpen fellesside</span>
      </Link>
    </>
  );

  const sokFelt = (ref: React.RefObject<HTMLInputElement | null>, lukk?: () => void) => (
    <div className="wg-sok">
      <label className="wg-sok-felt">
        <Search size={15} aria-hidden />
        <input
          ref={ref}
          type="search"
          value={sok}
          onChange={(e) => setSok(e.target.value)}
          placeholder="Søk elev eller økt"
          aria-label="Søk elev eller økt"
          aria-controls={sokId}
          aria-expanded={treff.length > 0}
          role="combobox"
          aria-autocomplete="list"
        />
        <kbd aria-hidden>⌘K</kbd>
      </label>
      {sokOrd ? (
        <ul className="wg-sok-treff" id={sokId} role="listbox" aria-label="Treff">
          {treff.length === 0 ? (
            <li className="wg-sok-ingen">Ingen treff på «{sok.trim()}».</li>
          ) : (
            treff.map((t) => (
              <li key={t.id} role="option" aria-selected={false}>
                <Link
                  href={t.href}
                  onClick={() => {
                    setSok('');
                    lukk?.();
                  }}
                >
                  <b>{t.tekst}</b>
                  <span>{t.under}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );

  const nesteKort = neste ? (
    <Link href={neste.href} className="wg-neste">
      <span className="wg-neste-merke">Neste · {neste.naar}</span>
      <b>{neste.tid}</b>
      <span className="wg-neste-tittel">{neste.tittel}</span>
      {neste.info ? <span className="wg-neste-info">{neste.info}</span> : null}
    </Link>
  ) : null;

  const bunnMeny = [
    { id: 'idag', label: 'I dag', href: '/team-wang/coach?omraade=idag', ikon: Sun },
    { id: 'trening', label: 'Trening', href: '/team-wang/coach?omraade=trening', ikon: Activity },
    { id: 'elever', label: 'Elever', href: '/team-wang/coach?omraade=elever', ikon: Users },
    { id: 'meldinger', label: 'Meldinger', href: '/team-wang/coach?omraade=meldinger', ikon: Mail },
  ];
  const merAktiv = !bunnMeny.some((b) => b.id === aktivtOmraade);

  const bruker = (
    <div className="wg-bruker">
      <span className="wg-avatar" aria-hidden>{initialer(brukerNavn)}</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <b>{brukerNavn ?? 'Innlogget bruker'}</b>
        <small>{rolle} · WANG Fredrikstad</small>
      </div>
      <form action={logout}>
        <button type="submit" className="wg-ikonknapp" aria-label="Logg ut" title="Logg ut">
          <LogOut size={18} aria-hidden />
        </button>
      </form>
    </div>
  );

  return (
    <div className="wg-shell">
      <aside className="wg-side" aria-label="Hovedmeny">
        <Image className="wg-logo" src={wangLogo} alt="WANG Toppidrett" width={190} height={64} priority unoptimized />
        <p className="wg-gruppe">Golf · WANG Fredrikstad</p>
        {sokFelt(sokRef)}
        {nesteKort}
        <nav style={{ display: 'grid', gap: 2 }} aria-label="WANG">
          {menyLenker()}
        </nav>
        {bruker}
      </aside>

      <div className="wg-main">
        <header className="wg-mtop">
          <Image className="wg-logo" src={wangLogo} alt="WANG Toppidrett" width={190} height={64} priority unoptimized />
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              className="wg-ikonknapp"
              onClick={() => {
                setVisMobilMeny(true);
                requestAnimationFrame(() => mobilSokRef.current?.focus());
              }}
              aria-label="Søk"
            >
              <Search size={21} aria-hidden />
            </button>
            {visMobilMeny ? (
              <button type="button" className="wg-ikonknapp" onClick={() => setVisMobilMeny(false)} aria-label="Lukk meny">
                <X size={22} aria-hidden />
              </button>
            ) : null}
          </span>
        </header>
        {visMobilMeny ? (
          <div className="wg-skuff" id={skuffId}>
            <nav aria-label="Meny">
              {sokFelt(mobilSokRef, () => setVisMobilMeny(false))}
              {nesteKort}
              {menyLenker(() => setVisMobilMeny(false))}
              {bruker}
            </nav>
          </div>
        ) : null}

        <div className="wg-dtop" />

        <main className="wg-body">
          {faner.length > 0 && (
            <nav aria-label="Faner" className="wgf-rad">
              {faner.map((f) => {
                const erValgt = aktivFane === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onFaneEndring?.(f.id)}
                    className={`wgf ${erValgt ? 'wgf-pa' : ''}`}
                    aria-current={erValgt ? 'page' : undefined}
                  >
                    {f.tittel}
                  </button>
                );
              })}
            </nav>
          )}
          {children}
        </main>
      </div>

      <nav className="wg-bunnmeny" aria-label="Hovedmeny mobil">
        {bunnMeny.map((b) => {
          const Ikon = b.ikon;
          const erAktiv = aktivtOmraade === b.id;
          return (
            <Link
              key={b.id}
              href={b.href}
              className={erAktiv ? 'wg-bunn-pa' : undefined}
              aria-current={erAktiv ? 'page' : undefined}
              onClick={() => setVisMobilMeny(false)}
            >
              <Ikon size={22} aria-hidden />
              {b.label}
            </Link>
          );
        })}
        <button
          type="button"
          className={merAktiv ? 'wg-bunn-pa' : undefined}
          aria-expanded={visMobilMeny}
          aria-controls={skuffId}
          onClick={() => setVisMobilMeny((v) => !v)}
        >
          <MoreHorizontal size={22} aria-hidden />
          Mer
        </button>
      </nav>

      <div className="wg-hurtig-lag">
        {visHurtig ? (
          <div className="wg-hurtig-meny" id={hurtigId} role="menu">
            {hurtig.map((h) => {
              const Ikon = h.ikon;
              return (
                <Link key={h.label} href={h.href} role="menuitem" onClick={() => setVisHurtig(false)}>
                  <Ikon size={20} aria-hidden style={{ color: 'var(--wg-navy)' }} />
                  {h.label}
                </Link>
              );
            })}
          </div>
        ) : null}
        <button
          ref={hurtigRef}
          type="button"
          className="wg-hurtig"
          aria-expanded={visHurtig}
          aria-controls={hurtigId}
          aria-label="Hurtighandlinger"
          onClick={() => setVisHurtig((v) => !v)}
        >
          <Plus size={24} aria-hidden />
        </button>
      </div>
    </div>
  );
}

function initialer(navn?: string): string {
  if (!navn) return '–';
  return navn
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((del) => del[0]?.toUpperCase() ?? '')
    .join('');
}
