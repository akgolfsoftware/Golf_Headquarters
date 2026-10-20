import { describe, test, mock } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

mock.module('next/link', { defaultExport: 'a' });
mock.module(pathToFileURL(path.resolve('src/app/team-wang/coach/iup/[elevId]/actions.ts')).href, {
  namedExports: { lagreIupSamtale: async () => ({ ok: true }) },
});

describe('WANG IUP-samtale (designløftet 20.10)', async () => {
  const { IupSamtale } = await import('../../src/app/team-wang/coach/iup/[elevId]/iup-samtale');
  // Syntetisk elev og målsetninger.
  const html = renderToStaticMarkup(React.createElement(IupSamtale, {
    elevId: 'e1', elevNavn: 'Elev C',
    avsluttende: { id: 'p1', navn: 'Grunnperiode', startIso: '2026-08-31', sluttIso: '2026-11-15', fokus: null },
    neste: { id: 'p2', navn: 'Spesialperiode', startIso: '2026-11-16', sluttIso: '2027-01-31', fokus: null },
    evalueringer: [{ id: 'g1', akse: 'TEK', tittel: 'Treffpunkt i wedgene', egentidMinUke: 90, maalemetode: 'Wedge Gate', status: 'PAA_VEI', egenvurdering: 4, trenervurdering: null, kommentar: 'Jevn jobb' }],
    nyeStart: [],
    maalinger: [],
    sideinnhold: React.createElement('p', null, 'SIDEINNHOLD'),
  }));

  test('tre steg med samme navn som seksjonene', () => {
    for (const s of ['Evaluer perioden', 'Målt i perioden', 'Neste periode']) assert.match(html, new RegExp(s));
    assert.match(html, /1 · Evaluer grunnperiode/);
    assert.match(html, /2 · Målt i perioden/);
  });

  test('vurdering 1–5 og status er knapper med aria-pressed, kommentaren kan skrives', () => {
    assert.match(html, /aria-label="Eleven 4 av 5" aria-pressed="true"/);
    assert.match(html, /aria-pressed="true"[^>]*>På vei</);
    assert.match(html, /<textarea[^>]*maxLength="2000"[^>]*>Jevn jobb<\/textarea>/);
  });

  test('ingen målinger gir forklaring, ikke tall; sideinnholdet vises', () => {
    assert.match(html, /Ingen testresultater registrert i denne perioden/);
    assert.match(html, /SIDEINNHOLD/);
    assert.equal(html.match(/wg-btn-primary/g)?.length, 1);
  });
});
