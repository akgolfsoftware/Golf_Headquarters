import React from 'react';
import Link from 'next/link';

export interface WangKobletElev {
  id: string;
  navn: string;
}

interface WangKobledeVisningerProps {
  /** Bare PLAYER-medlemmer av WANG-gruppa, hentet på serveren. */
  elever: WangKobletElev[];
  visning: 'iup' | 'tester' | 'turneringer';
}

const TITTEL = {
  iup: 'IUP per elev',
  tester: 'Testresultater',
  turneringer: 'Turneringer per elev',
} as const;

const BESKRIVELSE = {
  iup: 'Ekte IUP-samtale fra basen. Eleven må ha delt med deg.',
  tester: 'Ekte testresultater fra basen, for elever som har delt med deg.',
  turneringer: 'Ekte turneringsresultater fra basen. Eleven må ha delt med deg.',
} as const;

/**
 * Lenker til de tre datakoblede trenerflatene (IUP, testresultater,
 * turneringer). Tilgangen sjekkes på hver målside (delingssamtykke).
 */
export function WangKobledeVisninger({ elever, visning }: WangKobledeVisningerProps) {
  return (
    <section className="wg-kort" aria-label={TITTEL[visning]} style={{ marginBottom: '20px' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: '16px' }}>{TITTEL[visning]} (koblet til ekte data)</h2>
      <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--wang-text-muted)' }}>
        {BESKRIVELSE[visning]}
      </p>
      {visning === 'tester' ? (
        <Link href="/team-wang/coach/tester" className="wg-btn wg-btn-primary">
          Åpne testresultater
        </Link>
      ) : elever.length === 0 ? (
        <p style={{ margin: 0, fontSize: '13px' }}>Ingen elever i gruppa.</p>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {elever.map((elev) => (
            <li key={elev.id} style={{ minWidth: 0 }}>
              <Link
                href={
                  visning === 'iup'
                    ? `/team-wang/coach/iup/${elev.id}`
                    : `/team-wang/coach/turneringer/${elev.id}`
                }
                className="wg-btn wg-btn-secondary"
              >
                {elev.navn}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
