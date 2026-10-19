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

// Syntetisk gruppe til komponenttestene. Ingen realistiske navn på mindreårige.
const DATA = {
  gruppeNavn: 'WANG Toppidrett (demo)',
  idagIso: '2026-10-14',
  naaTid: '07:40' as string | null,
  ukeTekst: 'Uke 42 · 12.10–18.10.2026',
  elever: Array.from({ length: 11 }, (_, i) => ({ id: `e${i + 1}`, navn: `Elev ${i + 1} Demo` })),
  trenere: [{ id: 't1', navn: 'Demotrener WANG', rolle: 'Trener' as const }],
  ukeOkter: [
    { id: 'o1', datoIso: '2026-10-13', dag: 'Tir', tittel: 'Morgentrening nærspill (demo)', tid: '08:00–10:00', startTid: '08:00', sluttTid: '10:00' as string | null, sted: 'Demo Golfklubb', beskrivelse: null as string | null, passert: true },
    { id: 'o2', datoIso: '2026-10-14', dag: 'Ons', tittel: 'Morgentrening driver (demo)', tid: '08:00–10:00', startTid: '08:00', sluttTid: '10:00' as string | null, sted: 'Demohallen', beskrivelse: null as string | null, passert: false },
  ],
  fasteOkter: [{ id: 'fo-1', ukedag: 1, startTid: '08:00', sluttTid: '10:00', dag: 'Tir', tid: '08:00–10:00', tittel: 'Morgentrening nærspill (demo)', sted: 'Demo Golfklubb' }],
  perioder: [
    { id: 'p1', fase: 'SPESIAL', navn: 'Spesialperiode', fokus: 'Nærspill', startIso: '2026-09-01', endIso: '2026-10-31', fraUke: 36, tilUke: 44, ukevolMin: null as number | null, ukevolMax: null as number | null, status: 'naa' as const },
  ],
  turneringer: [
    { id: 'u1', tittel: 'Høstcup (demo)', startIso: '2026-10-20', sluttIso: '2026-10-20', sted: null, passert: false },
  ],
  samlinger: [],
  testdager: [],
};

describe('WANG Toppidrett Modul (Samtlige WANG-skjermer)', async () => {
  const { WANG_SKJERMER_KATALOG } = await import('@/components/wang/wang-skjermkatalog');

  const { WangAppSkall } = await import('@/components/wang/WangAppSkall');
  const { WangIdag } = await import('@/components/wang/WangIdag');
  const { WangTrening } = await import('@/components/wang/WangTrening');
  const { WangTester } = await import('@/components/wang/WangTester');
  const { WangKonkurranse } = await import('@/components/wang/WangKonkurranse');
  const { WangMeldinger } = await import('@/components/wang/WangMeldinger');
  const { WangElever } = await import('@/components/wang/WangElever');
  const { WangAdmin } = await import('@/components/wang/WangAdmin');
  const { WangSkjermoversikt } = await import('@/components/wang/WangSkjermoversikt');
  const { WangDataGolf } = await import('@/components/wang/WangDataGolf');

  const vis = (komponent: React.ComponentType<{ data: typeof DATA }>, data = DATA) =>
    renderToStaticMarkup(React.createElement(komponent, { data }));
  const tom = { ...DATA, elever: [], trenere: [], ukeOkter: [], fasteOkter: [], perioder: [], turneringer: [], samlinger: [], testdager: [] };

  test('skjermkatalogen har samtlige 63 WANG-skjermer', () => {
    assert.strictEqual(WANG_SKJERMER_KATALOG.length, 63, 'Skal ha nøyaktig 63 skjermer i katalogen (WANG-50 kuttet til DG-01–09, 15.10.2026)');
    const unikeIder = new Set(WANG_SKJERMER_KATALOG.map((s) => s.id));
    assert.strictEqual(unikeIder.size, 63, 'Alle 63 skjerm-IDer skal være unike');
    for (const id of ['WANG-43', 'WANG-42', 'WG-03', 'WANG-10', 'WANG-13', 'WANG-07', 'WANG-44', 'WANG-19', 'WANG-33', 'WANG-00']) {
      assert.ok(unikeIder.has(id), `${id} skal finnes`);
    }
  });

  test('WangAppSkall: rendrer desktop sidemeny, topplinje og mobilnavigasjon', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        WangAppSkall,
        { rolle: 'Trener', aktivtOmraade: 'idag' },
        React.createElement('div', { id: 'test-innhold' }, 'Innhold for I dag')
      )
    );
    assert.ok(html.includes('alt="WANG Toppidrett"'), 'Skal vise WANG Toppidrett merkevare');
    for (const ord of ['I dag', 'Trening', 'Tester', 'Konkurranse', 'Meldinger', 'Elever', 'Innhold for I dag']) {
      assert.ok(html.includes(ord), `Skal inneholde ${ord}`);
    }
  });

  test('WangIdag: teller elevene i gruppa, ikke en fast liste', () => {
    const html = vis(WangIdag);
    assert.ok(html.includes('I dag'));
    assert.ok(html.includes('<strong>11</strong>'), 'Demogruppa har 11 elever');
    assert.ok(html.includes('Morgentrening nærspill (demo)'), 'Skal vise ukas økter fra gruppa');
    assert.ok(html.includes('Nærspill'), 'Skal vise periodens fokus');
    assert.ok(!html.includes('112 mph'), 'Ingen oppdiktede måltall');
  });

  test('WangIdag: tom gruppe gir tom tilstand', () => {
    const html = vis(WangIdag, tom);
    assert.ok(html.includes('Ingen økter denne uka'));
    assert.ok(html.includes('Ingen økter i dag'));
    assert.ok(html.includes('Ingen aktiv periode'));
  });

  test('WangIdag: helteflaten teller dagens økter, og det som ikke er koblet viser —', () => {
    const html = vis(WangIdag);
    assert.ok(html.includes('økt i dag'), 'Én økt i dag i demogruppa');
    assert.ok(html.includes('Neste økt kl. 08:00'));
    assert.ok(html.includes('kl. 07:40'), 'Klokka fra serveren');
    assert.ok(html.includes('Krever handling'));
    assert.ok(html.includes('Ikke koblet ennå'));
  });

  const visFane = (aktivFane: string, oktId?: string, data = DATA) =>
    renderToStaticMarkup(React.createElement(WangIdag, { data, aktivFane, oktId }));

  test('WangIdag › Oppmøte: alle elevene i gruppa, ingen forhåndsvalgt, lagring sperret', () => {
    const html = visFane('oppmote', 'o2');
    assert.ok(html.includes('Oppmøte'));
    assert.ok(html.includes('Elev 11 Demo'));
    assert.ok(html.includes('0 av 11 ført'), 'Ingen elev er satt til stede på forhånd');
    assert.ok(!html.includes('aria-pressed="true"'), 'Ingen valg er forhåndsvalgt');
    assert.match(html, /<button[^>]*disabled=""[^>]*>Lagre oppmøte<\/button>/);
  });

  test('WangIdag › Økta: viser økta fra kalenderen, avlysning er ikke koblet', () => {
    const html = visFane('okt', 'o2');
    assert.ok(html.includes('Morgentrening driver (demo)'));
    assert.ok(html.includes('120 min'));
    assert.ok(html.includes('Avlys økt'));
    assert.ok(visFane('okt', 'finnes-ikke').includes('Fant ikke økta'));
  });

  test('WangIdag › Meld fravær: elevene som valg, bekreft er sperret og ingenting sendes', () => {
    const html = visFane('fravaer', 'o2');
    assert.ok(html.includes('Meld fravær'));
    assert.ok(html.includes('<option value="e1">Elev 1 Demo</option>'));
    assert.match(html, /<button[^>]*disabled=""[^>]*>Bekreft fravær<\/button>/);
    assert.ok(html.includes('Ingenting er lagret eller sendt.'));
  });

  const visTrening = (aktivFane?: string, id?: string, data: typeof DATA = DATA) =>
    renderToStaticMarkup(React.createElement(WangTrening, { data, aktivFane, id }));

  test('WangTrening › Oversikt: ingen oppdiktet etterlevelse, alle elever står som ikke delt', () => {
    const html = visTrening();
    assert.ok(html.includes('av planen gjennomført siste fire uker'));
    assert.ok(!/\d+\s*%/.test(html.replace(/<[^>]*>/g, ' ').replace(/80 %/g, '')), 'Ingen prosenttall utenom målet på 80 %');
    assert.ok(html.includes('Ikke delt'));
    assert.ok(html.includes('Elev 11 Demo'));
    assert.ok(html.includes('fane=elev&amp;id=e1'));
    assert.ok(visTrening(undefined, undefined, tom).includes('Ingen elever i gruppa'));
  });

  test('WangTrening › Årsplan: periodene fra gruppa, med lenke til periodeskjemaet', () => {
    const html = visTrening('arsplan');
    assert.ok(html.includes('Spesialperiode'));
    assert.ok(html.includes('Nærspill'));
    assert.ok(html.includes('fane=periode&amp;id=p1'));
    assert.ok(visTrening('arsplan', undefined, tom).includes('Ingen perioder'));
  });

  test('WangTrening › Periode, Uka og Ny økt: lagring er sperret og ingenting lagres', () => {
    assert.match(visTrening('periode', 'p1'), /<button[^>]*disabled=""[^>]*>Lagre perioden<\/button>/);
    assert.ok(visTrening('periode').includes('Ny periode'));
    assert.ok(visTrening('uke').includes('Morgentrening driver (demo)'));
    const nyOkt = visTrening('nyokt');
    assert.ok(nyOkt.includes('1 · Pyramiden'));
    assert.match(nyOkt, /<button[^>]*disabled=""[^>]*>Lagre økta<\/button>/);
  });

  const TESTER = {
    delerIder: ['e1', 'e2'],
    resultater: [
      { id: 'r1', elevId: 'e1', testId: 't1', testNavn: 'Benkpress 3RM', akse: 'FYS' as const, datoIso: '2026-10-12', verdi: '52 kg', kontrollert: false, avvist: false },
      { id: 'r2', elevId: 'e2', testId: 't1', testNavn: 'Benkpress 3RM', akse: 'FYS' as const, datoIso: '2026-10-08', verdi: '58 kg', kontrollert: true, avvist: false },
    ],
  };
  const visMed = (komponent: React.ComponentType<never>, props: Record<string, unknown>) =>
    renderToStaticMarkup(React.createElement(komponent, { data: DATA, ...props } as never));

  test('WangTester: testbatteriet uten oppdiktede resultater, og bare delte elever', () => {
    const html = vis(WangTester);
    assert.ok(html.includes('Markløft trapbar'));
    assert.ok(html.includes('0 av 11'), 'Ingen deler testene uten samtykke');
    const med = visMed(WangTester, { tester: TESTER });
    assert.ok(med.includes('2 av 11'));
    assert.ok(med.includes('/team-wang/coach/tester'));
    const ko = visMed(WangTester, { tester: TESTER, aktivFane: 'ko' });
    assert.ok(ko.includes('52 kg'), 'Egenført resultat står til kontroll');
    assert.ok(!ko.includes('58 kg'), 'Kontrollert resultat står ikke til kontroll');
    assert.match(ko, /<button[^>]*disabled=""[^>]*>Kontroller<\/button>/);
    assert.ok(visMed(WangTester, { tester: TESTER, aktivFane: 'elev', id: 'e3' }).includes('Ikke delt'));
    assert.match(visMed(WangTester, { aktivFane: 'foring' }), /<button[^>]*disabled=""[^>]*>Lagre og neste elev<\/button>/);
  });

  test('WangKonkurranse: turneringer fra gruppas kalender', () => {
    const html = vis(WangKonkurranse);
    assert.ok(html.includes('Høstcup (demo)'));
    assert.ok(html.includes('dager til Høstcup (demo)'));
    assert.ok(!html.includes('72,8'), 'Ingen oppdiktet snittscore');
    assert.ok(visMed(WangKonkurranse, { aktivFane: 'sesong' }).includes('/team-wang/coach/turneringer/e1'));
    assert.ok(visMed(WangKonkurranse, { aktivFane: 'turnering', id: 'finnes-ikke' }).includes('Fant ikke turneringen'));
  });

  test('WangMeldinger: tom tilstand uten meldinger i basen, ingenting sendes', () => {
    const html = vis(WangMeldinger);
    assert.ok(html.includes('Ingen meldinger ennå'));
    assert.match(visMed(WangMeldinger, { aktivFane: 'elev', id: 'e1' }), /<button[^>]*disabled=""[^>]*>Send<\/button>/);
    assert.match(visMed(WangMeldinger, { aktivFane: 'gruppe' }), /<button[^>]*disabled=""[^>]*>Publiser<\/button>/);
  });

  test('WangElever: delt plan gir etterlevelse, ikke delt gir «—» (W1)', () => {
    const t = (pct: number | null) => ({ pct, gjennomfortMin: pct ?? 0, planlagtMin: pct === null ? 0 : 100 });
    const plan = {
      delerIder: ['e1'],
      perElev: { e1: { etterlevelse: t(62), morgen: t(50) } },
      samlet: t(62),
      morgen: t(50),
      perAkse: { FYS: t(null), TEK: t(62), SLAG: t(null), SPILL: t(null), TURN: t(null) },
    };
    const elev1 = visMed(WangElever, { aktivFane: 'elev', id: 'e1', plan });
    assert.ok(elev1.includes('62 %'));
    assert.ok(elev1.includes('Har delt planen med deg'));
    const elev2 = visMed(WangElever, { aktivFane: 'elev', id: 'e2', plan });
    assert.ok(elev2.includes('Plan ikke delt'));
    assert.ok(!/\d+\s*%/.test(elev2.replace(/<[^>]*>/g, ' ')), 'Ingen prosent for eleven som ikke har delt');
    const liste = visMed(WangElever, { plan });
    assert.ok(liste.includes('Trenger deg'));
    assert.ok(liste.includes('1 av 11'));
  });

  test('WangElever: elevlista fra gruppa med lenke til IUP', () => {
    const html = vis(WangElever);
    assert.ok(html.includes('Elev 1 Demo'));
    assert.ok(html.includes('fane=elev&amp;id=e1'));
    assert.ok(visMed(WangElever, { aktivFane: 'elev', id: 'e1' }).includes('/team-wang/coach/iup/e1'));
    assert.ok(vis(WangElever, tom).includes('Ingen elever i gruppa.'));
  });

  test('WangAdmin: trenere og timeplan fra gruppa, samtykket per elev', () => {
    const html = vis(WangAdmin);
    assert.ok(html.includes('Trenere og roller'));
    assert.ok(html.includes('Demotrener WANG'));
    const samtykke = visMed(WangAdmin, { aktivFane: 'samtykke', tester: { ...TESTER, samtykke: { e1: 'DELT', e3: 'VENTER_PA_FORELDER' } } });
    assert.ok(samtykke.includes('Venter på forelder'));
    assert.ok(samtykke.includes('av 11 deler testene med WANG'));
  });

  test('WangDataGolf: bare data fra serveren, «Powered by Data Golf», og ingen tilgang uten data', () => {
    const uten = renderToStaticMarkup(React.createElement(WangDataGolf, {}));
    assert.ok(uten.includes('Ingen tilgang'));
    const oversikt = renderToStaticMarkup(React.createElement(WangDataGolf, { d: { side: 'oversikt', antallProffer: 0, kildedato: null, sistSynk: null, feiletSynk: 0, endepunkter: 0, forsinket: true, norske: [] } }));
    assert.ok(oversikt.includes('Ingen synk ennå'));
    assert.ok(oversikt.includes('Powered by'));
    const proff = renderToStaticMarkup(React.createElement(WangDataGolf, { d: { side: 'proff', proff: null } }));
    assert.ok(proff.includes('Fant ikke proffen'));
    assert.ok(vis(WangKonkurranse).includes('fane=dg'), 'Konkurranse har fanen Data Golf');
  });

  test('WangSkjermoversikt (WANG-00): lister alle 63 skjermer med søk og filter', () => {
    const html = renderToStaticMarkup(React.createElement(WangSkjermoversikt, {}));
    assert.ok(html.includes('Skjermoversikt (63 skjermer)'), 'Skal vise 63 skjermer');
    assert.ok(html.includes('WANG-00'), 'Skal referere til WANG-00');
    assert.ok(html.includes('Åpne skjerm'), 'Skal ha direkte åpne-knapper');
  });
});
