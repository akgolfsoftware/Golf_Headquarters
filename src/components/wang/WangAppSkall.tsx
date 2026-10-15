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
  Menu,
  X,
  Plus,
  CalendarPlus,
  ClipboardCheck,
  MessageSquarePlus,
  Timer,
  ExternalLink,
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

interface WangAppSkallProps {
  /** Avgjort på serveren. Skallet kan ikke endre den. */
  rolle: WangRolle;
  brukerNavn?: string;
  aktivtOmraade: WangOmraade;
  aktivFane?: string;
  onFaneEndring?: (fane: string) => void;
  faner?: { id: string; tittel: string; opt?: string }[];
  children?: React.ReactNode;
}

/**
 * Skallet for trenerflaten /team-wang/coach.
 * Fasit: docs/design-system/utkast-wang/grunnmur.html og felles/wang.js (pakke 1).
 * Samme oppsett som AgencyOS (Anders 15.10.2026): lys sidemeny med navy aktiv rad og
 * brukeren nederst på PC, hamburgermeny og logo på mobil, hurtigknapp på alle skjermer.
 * Administrasjon vises bare for sportssjef (rollen avgjøres på serveren).
 * Avvik:
 *   - Bjella står ikke: trenerflaten har ingen varsler ennå.
 *   - Skjermoversikten og den åpne fellessiden ligger nederst i menyen, som før.
 */
export function WangAppSkall({
  rolle,
  brukerNavn,
  aktivtOmraade,
  aktivFane,
  onFaneEndring,
  faner = [],
  children,
}: WangAppSkallProps) {
  const [visMobilMeny, setVisMobilMeny] = useState(false);
  const [visHurtig, setVisHurtig] = useState(false);
  const skuffId = useId();
  const hurtigId = useId();
  const hurtigRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!visMobilMeny && !visHurtig) return;
    const lukk = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setVisMobilMeny(false);
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
    { label: 'Før oppmøte', href: '/team-wang/coach?omraade=idag', ikon: ClipboardCheck },
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
        <nav style={{ display: 'grid', gap: 2 }} aria-label="WANG">
          {menyLenker()}
        </nav>
        {bruker}
      </aside>

      <div className="wg-main">
        <header className="wg-mtop">
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              className="wg-ikonknapp"
              onClick={() => setVisMobilMeny((v) => !v)}
              aria-expanded={visMobilMeny}
              aria-controls={skuffId}
              aria-label={visMobilMeny ? 'Lukk meny' : 'Meny'}
            >
              {visMobilMeny ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
            </button>
            <Image className="wg-logo" src={wangLogo} alt="WANG Toppidrett" width={190} height={64} priority unoptimized />
          </span>
          <span style={{ font: '700 13px/1.2 var(--font-wang-brand, Montserrat, sans-serif)', color: 'var(--wg-tekst-2)' }}>{rolle}</span>
        </header>
        {visMobilMeny ? (
          <div className="wg-skuff" id={skuffId}>
            <nav aria-label="Meny">
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
