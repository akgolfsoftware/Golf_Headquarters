import { describe, test, mock } from 'node:test';
import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

mock.module('next/link', { defaultExport: 'a' });
mock.module('next/image', { defaultExport: 'img' });

describe('WANG systemsider (designløftet 20.10)', async () => {
  const { WangIngenTilgang, WangSystemside } = await import('../../src/components/wang/WangSystemside');

  test('Ingen tilgang: forklarer kontoen og lenker til /wang, ikke «Siden finnes ikke»', () => {
    const html = renderToStaticMarkup(React.createElement(WangIngenTilgang, { epost: 'trener2@eksempel.no' }));
    assert.match(html, /Kontoen din har ikke tilgang til WANG/);
    assert.match(html, /trener2@eksempel\.no/);
    assert.match(html, /href="\/wang\?next=%2Fteam-wang%2Fcoach"/);
    assert.match(html, /invitasjonslenke/);
    assert.doesNotMatch(html, /Siden finnes ikke/);
  });

  test('Ingen tilgang uten e-post viser ingen tom konto', () => {
    const html = renderToStaticMarkup(React.createElement(WangIngenTilgang, { epost: null }));
    assert.doesNotMatch(html, /<b><\/b>/);
    assert.match(html, /ikke trener eller sportssjef/);
  });

  test('Bare én handling er fylt vinrød', () => {
    const html = renderToStaticMarkup(
      React.createElement(WangSystemside, {
        merke: 'WANG Toppidrett',
        stort: '404',
        tittel: 'Siden finnes ikke',
        handlinger: [
          { tekst: 'Til trenerflaten', href: '/team-wang/coach', primar: true },
          { tekst: 'Til fellessiden', href: '/team-wang' },
        ],
      }),
    );
    assert.equal(html.match(/wg-btn-primary/g)?.length, 1);
    assert.match(html, /<h1>Siden finnes ikke<\/h1>/);
  });
});
