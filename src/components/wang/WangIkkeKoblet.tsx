import React from 'react';

/** Tekst som står ved handlinger som ennå ikke er koblet til ekte data. */
export const IKKE_KOBLET_TEKST = 'Ikke koblet ennå';

/**
 * Små merkelapp ved siden av en deaktivert knapp. Handlinger som ikke gjør noe
 * skal aldri se ut som de virker, og aldri gi bekreftelse på noe som ikke skjedde.
 */
export function WangIkkeKoblet() {
  return (
    <span
      role="note"
      style={{ fontSize: '11px', fontWeight: 600, color: 'var(--wang-text-muted)', whiteSpace: 'nowrap' }}
    >
      {IKKE_KOBLET_TEKST}
    </span>
  );
}

/** Stil for deaktiverte knapper. */
export const IKKE_KOBLET_KNAPP_STIL: React.CSSProperties = {
  opacity: 0.55,
  cursor: 'not-allowed',
};
