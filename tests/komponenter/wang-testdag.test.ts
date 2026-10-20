import { describe, test, mock } from 'node:test';
import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

mock.module('next/link', { defaultExport: 'a' });
mock.module('next/navigation', { namedExports: { useRouter: () => ({ push() {}, refresh() {} }) } });
mock.module('@/app/admin/tester/testdag-actions', { namedExports: { planleggTestdag: async () => ({ ok: true, eventId: 'ev1' }) } });
mock.module('@/app/team-norway/tn-testforing-actions', { namedExports: { saveTnTestSomCoach: async () => ({ ok: true, revision: 1 }) } });

describe('WANG testdag og trenerføring (designløftet 20.10)', async () => {
  const { WangTestdagPlanlegg, WangTestdagVis, WangRegistrer } = await import('../../src/components/wang/WangTestdag');
  const { tnProtocol } = await import('../../src/lib/portal-tester/tn-catalog');

  test('Planlegg: bare tester treneren fører, og knappen er sperret til noe er valgt', () => {
    const html = renderToStaticMarkup(React.createElement(WangTestdagPlanlegg, {
      gruppeId: 'g1', gruppeNavn: 'WANG (demo)', antallElever: 3, idag: '2026-10-20', testdager: [],
      tester: [{ protokollId: 'wedge-gate', navn: 'Wedge Gate', del: 'Teknikk', slag: 9 }],
    }));
    assert.match(html, /Wedge Gate/);
    assert.match(html, /3 elever deler/);
    assert.match(html, /<button[^>]*disabled=""[^>]*>Legg inn testdagen<\/button>/);
    assert.match(html, /Ingen testdager ennå/);
  });

  test('Testdag: skjulte elever telles, men vises ikke', () => {
    const html = renderToStaticMarkup(React.createElement(WangTestdagVis, { d: {
      id: 'ev1', dato: 'tirsdag 27. oktober', klokke: '08:00', sted: 'Mulligan', aktiv: true, skjulte: 2,
      stasjoner: [{ id: 's1', navn: 'Wedge Gate', aktiv: true, deltakere: [{ id: 'p1', elev: 'Elev A', status: 'DONE', resultat: '30 p' }] }],
    } }));
    assert.match(html, /2 elever deler ikke testene med WANG og vises ikke/);
    assert.match(html, /1 av 1 lagret/);
    assert.match(html, /href="\/team-wang\/coach\/tester\/registrer\/p1"/);
  });

  test('Registrer: ett felt per slag etter protokollen, lagring sperret til testen er komplett', () => {
    const p = tnProtocol('wedge-gate');
    assert.ok(p);
    const html = renderToStaticMarkup(React.createElement(WangRegistrer, { d: {
      deltakerId: 'p1', spiller: 'Elev A', status: 'PENDING', protokoll: p,
      testdag: { eventId: 'ev1', stasjonId: 's1', tittel: 'Wedge Gate', aktiv: true },
      utkast: null, resultat: null, andre: [{ id: 'p1', spiller: 'Elev A', status: 'PENDING' }], nesteId: null,
    } }));
    assert.equal((html.match(/class="wg-td-nr"/g) ?? []).length, p.rows.length);
    assert.match(html, /<button[^>]*disabled=""[^>]*>Lagre<\/button>/);
    assert.match(html, /Kontrollert · du fører/);
  });
});
