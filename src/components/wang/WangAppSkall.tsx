'use client';

import React, { useState } from 'react';
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
  MoreVertical,
  ChevronRight,
  Shield,
  X,
} from 'lucide-react';

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

  const omraadeNavnMap: Record<WangOmraade, string> = {
    idag: 'I dag',
    trening: 'Trening',
    tester: 'Tester',
    konkurranse: 'Konkurranse',
    meldinger: 'Meldinger',
    elever: 'Elever',
    admin: 'Administrasjon',
    system: 'Skjermoversikt',
  };

  return (
    <div className="wg-shell">
      {/* 1. Desktop Venstremeny */}
      <aside className="wg-side">
        <div style={{ padding: '28px 24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                backgroundColor: 'var(--wang-green)',
                display: 'grid',
                placeItems: 'center',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '16px',
              }}
            >
              W
            </div>
            <div>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-wang-brand, Montserrat, sans-serif)',
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                }}
              >
                WANG TOPPIDRETT
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-wang-brand, Montserrat, sans-serif)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--wang-mint)',
                }}
              >
                Golf · Fredrikstad
              </span>
            </div>
          </div>
        </div>

        <nav
          style={{
            padding: '4px 12px 16px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
          aria-label="WANG Hovedmeny"
        >
          {hovedMeny.map((item) => {
            const Ikon = item.ikon;
            const erAktiv = aktivtOmraade === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`wg-nav ${erAktiv ? 'wg-nav-pa' : ''}`}
                aria-current={erAktiv ? 'page' : undefined}
              >
                <Ikon size={20} style={{ flex: 'none' }} />
                <span style={{ flex: 1, minWidth: 0, fontSize: '14px' }}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          <div
            style={{
              marginTop: 'auto',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <Link
              href="/team-wang/skjermer"
              className={`wg-nav ${aktivtOmraade === 'system' ? 'wg-nav-pa' : ''}`}
              style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.75)' }}
            >
              <List size={18} />
              <span>Skjermoversikt (WANG-00)</span>
            </Link>
            <Link
              href="/team-wang"
              target="_blank"
              className="wg-nav"
              style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.75)' }}
            >
              <ChevronRight size={16} />
              <span>Åpen fellesside</span>
            </Link>
          </div>
        </nav>

        {/* Brukerboks og Rollebytte */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.14)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--wang-green)',
                display: 'grid',
                placeItems: 'center',
                fontFamily: 'var(--font-wang-brand, Montserrat, sans-serif)',
                fontWeight: 700,
                fontSize: '12px',
                color: '#FFFFFF',
                flex: 'none',
              }}
            >
              {initialer(brukerNavn)}
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-wang-brand, Montserrat, sans-serif)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {brukerNavn ?? 'Innlogget bruker'}
              </span>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-wang-brand, Montserrat, sans-serif)',
                  fontSize: '11px',
                  color: 'var(--wang-mint)',
                }}
              >
                {rolle} · WANG Fredrikstad
              </span>
            </div>
          </div>

        </div>
      </aside>

      {/* 2. Hovedinnhold og Topbar */}
      <div className="wg-main">
        {/* Desktop Topbar */}
        <header className="wg-dtop">
          <p
            className="wg-num"
            style={{
              margin: 0,
              flex: 1,
              minWidth: 0,
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--wang-text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            /team-wang/coach · {omraadeNavnMap[aktivtOmraade]}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--wang-text-muted)',
                fontFamily: 'var(--font-wang-brand, Montserrat, sans-serif)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Shield size={16} color="var(--wang-green)" />
              {rolle}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="wg-btn wg-btn-ghost"
                style={{ minHeight: '36px', padding: '0 10px', fontSize: '12px' }}
                title="Logg ut"
              >
                <LogOut size={16} />
                <span>Logg ut</span>
              </button>
            </form>
          </div>
        </header>

        {/* Mobil Topbar (< 820px) */}
        <header className="wg-mtop">
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              backgroundColor: 'var(--wang-green)',
              display: 'grid',
              placeItems: 'center',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '14px',
              flex: 'none',
            }}
          >
            W
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-wang-brand, Montserrat, sans-serif)',
                fontSize: '10px',
                fontWeight: 500,
                color: 'var(--wang-mint)',
              }}
            >
              Golf · Fredrikstad
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-wang-brand, Montserrat, sans-serif)',
                fontSize: '15px',
                fontWeight: 600,
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {omraadeNavnMap[aktivtOmraade]}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVisMobilMeny(!visMobilMeny)}
            style={{
              minHeight: '44px',
              minWidth: '44px',
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
            aria-label="Meny"
          >
            {visMobilMeny ? <X size={24} /> : <MoreVertical size={24} />}
          </button>
        </header>

        {/* Innholdsflate */}
        <main className="wg-body">
          {/* Fanelinje hvis tilgjengelig */}
          {faner.length > 0 && (
            <nav aria-label="Faner" style={{ marginBottom: '20px' }}>
              {/* Desktop pille-faner */}
              <div className="wgf-rad">
                {faner.map((f) => {
                  const erValgt = aktivFane === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onFaneEndring?.(f.id)}
                      className={`wgf ${erValgt ? 'wgf-pa' : ''}`}
                    >
                      {f.tittel}
                    </button>
                  );
                })}
              </div>

              {/* Mobil select-velger under 820px (sikrer 0 horisontal scroll) */}
              <div className="wgf-sel" style={{ flexDirection: 'column', gap: '6px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-wang-brand, Montserrat, sans-serif)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--wang-text-muted)',
                  }}
                >
                  Velg visning
                </span>
                <select
                  value={aktivFane}
                  onChange={(e) => onFaneEndring?.(e.target.value)}
                  className="wg-field"
                  style={{ width: '100%', fontWeight: 600 }}
                >
                  {faner.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.tittel}
                    </option>
                  ))}
                </select>
              </div>
            </nav>
          )}

          {children}
        </main>

        {/* Mobil bunnmeny (5 knapper) */}
        <nav className="wg-mbar" aria-label="Mobil navigasjon">
          <Link
            href="/team-wang/coach?omraade=idag"
            className={`wg-tab ${aktivtOmraade === 'idag' ? 'wg-tab-pa' : ''}`}
          >
            <Sun size={20} />
            <span>I dag</span>
          </Link>
          <Link
            href="/team-wang/coach?omraade=trening"
            className={`wg-tab ${aktivtOmraade === 'trening' ? 'wg-tab-pa' : ''}`}
          >
            <Activity size={20} />
            <span>Trening</span>
          </Link>
          <Link
            href="/team-wang/coach?omraade=tester"
            className={`wg-tab ${aktivtOmraade === 'tester' ? 'wg-tab-pa' : ''}`}
          >
            <Dumbbell size={20} />
            <span>Tester</span>
          </Link>
          <Link
            href="/team-wang/coach?omraade=elever"
            className={`wg-tab ${aktivtOmraade === 'elever' ? 'wg-tab-pa' : ''}`}
          >
            <Users size={20} />
            <span>Elever</span>
          </Link>
          <button
            type="button"
            onClick={() => setVisMobilMeny(true)}
            className={`wg-tab ${['konkurranse', 'meldinger', 'admin', 'system'].includes(aktivtOmraade) ? 'wg-tab-pa' : ''}`}
          >
            <MoreVertical size={20} />
            <span>Mer</span>
          </button>
        </nav>

        {/* Mobil Mer-skuff (overlay dialog) */}
        {visMobilMeny && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 46, 76, 0.5)',
              zIndex: 70,
              display: 'flex',
              alignItems: 'flex-end',
            }}
            onClick={() => setVisMobilMeny(false)}
          >
            <div
              style={{
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px 16px 0 0',
                padding: '20px 20px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--wang-grey-line)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-wang-brand, Montserrat, sans-serif)',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--wang-blue)',
                  }}
                >
                  Flere områder
                </span>
                <button
                  type="button"
                  onClick={() => setVisMobilMeny(false)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <Link
                href="/team-wang/coach?omraade=konkurranse"
                onClick={() => setVisMobilMeny(false)}
                className="wg-btn wg-btn-secondary"
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                <Flag size={20} />
                <span>Konkurranse & turneringer</span>
              </Link>
              <Link
                href="/team-wang/coach?omraade=meldinger"
                onClick={() => setVisMobilMeny(false)}
                className="wg-btn wg-btn-secondary"
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                <Mail size={20} />
                <span>Meldinger & oppslag</span>
              </Link>
              {rolle === 'Sportssjef' && (
                <Link
                  href="/team-wang/coach?omraade=admin"
                  onClick={() => setVisMobilMeny(false)}
                  className="wg-btn wg-btn-secondary"
                  style={{ justifyContent: 'flex-start', width: '100%' }}
                >
                  <Settings size={20} />
                  <span>Administrasjon</span>
                </Link>
              )}
              <Link
                href="/team-wang/skjermer"
                onClick={() => setVisMobilMeny(false)}
                className="wg-btn wg-btn-secondary"
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                <List size={20} />
                <span>Skjermoversikt (WANG-00)</span>
              </Link>
              <Link
                href="/team-wang"
                target="_blank"
                onClick={() => setVisMobilMeny(false)}
                className="wg-btn wg-btn-secondary"
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                <ChevronRight size={20} />
                <span>Åpen fellesside</span>
              </Link>

            </div>
          </div>
        )}
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
