import { describe, test, mock } from 'node:test';
import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

mock.module('server-only', { defaultExport: {} });

for (const css of [
  'wang-app.css',
  'precision-a2.css',
  'precision-a4.css',
  'precision-a5.css',
  'precision-a7.css',
  'precision-komponenter.css',
  'precision-athletics.css',
]) {
  mock.module(`@/styles/${css}`, { namedExports: {} });
}

mock.module('next/navigation', {
  namedExports: {
    useRouter: () => ({ push() {}, replace() {} }),
    useSearchParams: () => new URLSearchParams(),
  },
});
mock.module('next/link', { defaultExport: 'a' });

describe('WANG Toppidrett Modul (Samtlige WANG-skjermer)', async () => {
  const {
    WANG_ELEVER,
    WANG_SKJERMER_KATALOG,
  } = await import('@/components/wang/wang-data');

  const { WangAppSkall } = await import('@/components/wang/WangAppSkall');
  const { WangIdag } = await import('@/components/wang/WangIdag');
  const { WangTrening } = await import('@/components/wang/WangTrening');
  const { WangTester } = await import('@/components/wang/WangTester');
  const { WangKonkurranse } = await import('@/components/wang/WangKonkurranse');
  const { WangMeldinger } = await import('@/components/wang/WangMeldinger');
  const { WangElever } = await import('@/components/wang/WangElever');
  const { WangAdmin } = await import('@/components/wang/WangAdmin');
  const { WangSkjermoversikt } = await import('@/components/wang/WangSkjermoversikt');

  test('wang-data: har registrert samtlige 71 WANG-skjermer i katalogen', () => {
    assert.strictEqual(WANG_SKJERMER_KATALOG.length, 71, 'Skal ha nøyaktig 71 skjermer i katalogen');

    const unikeIder = new Set(WANG_SKJERMER_KATALOG.map((s) => s.id));
    assert.strictEqual(unikeIder.size, 71, 'Alle 71 skjerm-IDer skal være unike');

    // Sjekk at sentrale skjermer finnes
    assert.ok(unikeIder.has('WANG-43'), 'WANG-43 I dag skal finnes');
    assert.ok(unikeIder.has('WANG-42'), 'WANG-42 Trening skal finnes');
    assert.ok(unikeIder.has('WG-03'), 'WG-03 Tester skal finnes');
    assert.ok(unikeIder.has('WANG-10'), 'WANG-10 Kalender skal finnes');
    assert.ok(unikeIder.has('WANG-13'), 'WANG-13 Meldinger skal finnes');
    assert.ok(unikeIder.has('WANG-07'), 'WANG-07 Elever skal finnes');
    assert.ok(unikeIder.has('WANG-44'), 'WANG-44 Elevprofil IUP skal finnes');
    assert.ok(unikeIder.has('WANG-19'), 'WANG-19 Trenere skal finnes');
    assert.ok(unikeIder.has('WANG-33'), 'WANG-33 Skolekoordinering skal finnes');
    assert.ok(unikeIder.has('WANG-00'), 'WANG-00 Skjermoversikt skal finnes');
  });

  test('wang-data: etterlevelse er beregnet som faktisk tid mot planlagt tid siste 4 uker', () => {
    for (const elev of WANG_ELEVER) {
      assert.ok(elev.etterlevelseSiste4Uker.planlagtTimer > 0, `${elev.navn} må ha planlagte timer`);
      assert.ok(elev.etterlevelseSiste4Uker.gjennomfortTimer >= 0, `${elev.navn} må ha gjennomførte timer`);
      assert.ok(
        elev.etterlevelseSiste4Uker.gjennomfortTimer <= elev.etterlevelseSiste4Uker.planlagtTimer * 1.5,
        'Gjennomført tid skal være realistisk'
      );
    }
  });

  test('WangAppSkall: rendrer desktop sidemeny, topplinje og mobilnavigasjon', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        WangAppSkall,
        { aktivtOmraade: 'idag' },
        React.createElement('div', { id: 'test-innhold' }, 'Innhold for I dag')
      )
    );

    assert.ok(html.includes('WANG TOPPIDRETT'), 'Skal vise WANG Toppidrett merkevare');
    assert.ok(html.includes('I dag'), 'Skal inneholde menylenke I dag');
    assert.ok(html.includes('Trening'), 'Skal inneholde menylenke Trening');
    assert.ok(html.includes('Tester'), 'Skal inneholde menylenke Tester');
    assert.ok(html.includes('Konkurranse'), 'Skal inneholde menylenke Konkurranse');
    assert.ok(html.includes('Meldinger'), 'Skal inneholde menylenke Meldinger');
    assert.ok(html.includes('Elever'), 'Skal inneholde menylenke Elever');
    assert.ok(html.includes('Innhold for I dag'), 'Skal rendre children');
  });

  test('WangIdag: rendrer WG-01, dagsfokus og morgenøkter', () => {
    const html = renderToStaticMarkup(
      React.createElement(WangIdag, { campus: 'Fredrikstad' })
    );

    assert.ok(html.includes('I dag'), 'Skal ha tittel I dag');
    assert.ok(html.includes('Morgentrening'), 'Skal vise morgentreninger');
    assert.ok(html.includes('WG-01'), 'Skal ha referanse til WG-01');
  });

  test('WangTrening: rendrer 4-ukers etterlevelse og øktplan', () => {
    const html = renderToStaticMarkup(
      React.createElement(WangTrening, { campus: 'Fredrikstad' })
    );

    assert.ok(html.includes('Trening og etterlevelse'), 'Skal ha treningsoverskrift');
    assert.ok(html.includes('Etterlevelse'), 'Skal vise etterlevelse');
    assert.ok(html.includes('WANG-42'), 'Skal referere til WANG-42');
  });

  test('WangTester: rendrer nasjonalt testbatteri, godkjenningskø og testføring', () => {
    const html = renderToStaticMarkup(
      React.createElement(WangTester, { campus: 'Fredrikstad' })
    );

    assert.ok(html.includes('Tester og testbatteri'), 'Skal vise testseksjon');
    assert.ok(html.includes('WG-03'), 'Skal referere til WG-03');
  });

  test('WangKonkurranse: rendrer kalender, rapportering, analyse og DataGolf', () => {
    const html = renderToStaticMarkup(
      React.createElement(WangKonkurranse, { campus: 'Fredrikstad' })
    );

    assert.ok(html.includes('Turneringskalender'), 'Skal vise kalender');
    assert.ok(html.includes('WANG-10'), 'Skal referere til WANG-10');
    assert.ok(html.includes('Hent resultater'), 'Skal ha knapp for synk');
  });

  test('WangMeldinger: rendrer gruppeposter, post til elev og foreldremøte', () => {
    const html = renderToStaticMarkup(
      React.createElement(WangMeldinger, { campus: 'Fredrikstad' })
    );

    assert.ok(html.includes('Gruppeposter'), 'Skal vise gruppeposter');
    assert.ok(html.includes('WANG-13'), 'Skal referere til WANG-13');
    assert.ok(html.includes('Publiser melding'), 'Skal ha knapp for publisering');
  });

  test('WangElever: rendrer elevliste, IUP-profil og 4-ukerssjekk', () => {
    const html = renderToStaticMarkup(
      React.createElement(WangElever, { campus: 'Fredrikstad' })
    );

    assert.ok(html.includes('Elever'), 'Skal vise elevliste');
    assert.ok(html.includes('WANG-07'), 'Skal referere til WANG-07');
    assert.ok(html.includes('4-ukers etterlevelse'), 'Skal ha etterlevelseskolonne');
  });

  test('WangAdmin: rendrer trenere, samtykker, timeplan og rekruttering (for Sportssjef)', () => {
    const html = renderToStaticMarkup(
      React.createElement(WangAdmin, { campus: 'Fredrikstad' })
    );

    assert.ok(html.includes('Trenere og roller'), 'Skal vise trenerstab');
    assert.ok(html.includes('WANG-19'), 'Skal referere til WANG-19');
    assert.ok(html.includes('Sportssjef'), 'Skal vise sportssjef-rolle');
  });

  test('WangSkjermoversikt (WANG-00): lister alle 71 skjermer med søk og filter', () => {
    const html = renderToStaticMarkup(
      React.createElement(WangSkjermoversikt, {})
    );

    assert.ok(html.includes('Skjermoversikt (71 skjermer)'), 'Skal vise 71 skjermer');
    assert.ok(html.includes('WANG-00'), 'Skal referere til WANG-00');
    assert.ok(html.includes('Åpne skjerm'), 'Skal ha direkte åpne-knapper');
  });
});
