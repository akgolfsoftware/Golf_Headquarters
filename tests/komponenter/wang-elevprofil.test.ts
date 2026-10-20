import { describe, test, mock } from 'node:test';
import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

mock.module('next/link', { defaultExport: 'a' });

// Syntetisk elev. Ingen realistiske navn på mindreårige.
const V = {
  navn: 'Elev C',
  identitet: [{ etikett: 'Født', verdi: '2009' }],
  resultater: { tom: null, sesonger: [], aar: [{ aar: 2026, rader: [
    { id: 'a', dato: '29. sep. 2026', navn: 'Juniortour Øst, runde 6', klasse: 'G17–19', plass: '3', slag: '148', kilde: 'GolfBox' },
    { id: 'b', dato: '6. sep. 2026', navn: 'Norgescup 4', klasse: 'G17–19', plass: 'T11', slag: '151', kilde: 'GolfBox' },
  ] }] },
  tester: { tom: 'Ingen registrerte tester.', rader: [], harTeamNorway: false },
  runder: { tom: null, merknad: 'Siste 12 måneder.', tall: [{ etikett: 'Runder', verdi: '18' }, { etikett: 'SG totalt', verdi: '+0,42' }] },
  iup: { tom: 'Ingen leverte IUP-svar ennå. Utkast vises aldri.', levert: [], maaltall: null },
};

describe('WANG elevprofil og turneringer (designløftet 20.10)', async () => {
  const { WangElevprofil } = await import('../../src/components/wang/WangElevprofil');
  const { WangTilParGraf } = await import('../../src/components/wang/WangTilParGraf');

  test('SG tegnes rundt null: tapt til venstre, vunnet til høyre, manglende som «—»', () => {
    const html = renderToStaticMarkup(React.createElement(WangElevprofil, {
      v: V, sg: [{ navn: 'Utslag', verdi: 0.31 }, { navn: 'Innspill', verdi: -0.18 }, { navn: 'Putting', verdi: null }],
    }));
    assert.match(html, /wg-sg-pluss/);
    assert.match(html, /wg-sg-minus/);
    assert.match(html, /aria-label="Putting: mangler"/);
    assert.match(html, /−0,18/);
    // Symmetrisk skala ±0,5: 0,31 gir 31 % av sporet.
    assert.match(html, /width:31%/);
  });

  test('plassering: tall får punktum, delt plass (T11) står som den er', () => {
    const html = renderToStaticMarkup(React.createElement(WangElevprofil, { v: V, lenker: { turneringer: '/t' } }));
    assert.match(html, />3\.</);
    assert.match(html, />T11</);
    assert.doesNotMatch(html, /T11\./);
    assert.match(html, /Alle 2 turneringer/);
  });

  test('graf: tall bare på beste og siste, tom tilstand uten fullførte', () => {
    const punkter = [4, 1, 9, 5].map((n, i) => ({ id: 'p' + i, dato: `${i + 1}. sep`, navn: 'T' + i, motPar: n, tekst: 'x' }));
    const html = renderToStaticMarkup(React.createElement(WangTilParGraf, { aar: 2026, punkter }));
    assert.equal(html.match(/wg-tilpar-tall/g)?.length, 2);
    assert.equal(html.match(/wg-tilpar-siste/g)?.length, 1);
    const tom = renderToStaticMarkup(React.createElement(WangTilParGraf, { aar: 2026, punkter: [] }));
    assert.match(tom, /Ingen fullførte turneringer med score i 2026/);
  });
});
