/**
 * protocol-definitions.js — Team Norway-testprotokollene, transkribert fra
 * uploads/team-norway-treningsprotokoll-og-tester-for-spillerv3.xlsx
 * (arkene «Scorekort GolfslagTester» + «Scorekort TeknikTester»).
 *
 * Kolonnetyper:
 *  - preset   → fast i protokollen (slagtype, lengde, mål-avstand …)
 *  - input    → fylles ut under testen («grønne celler» i Excel)
 *  - computed → beregnet — formlene fra Excel, via sg-reference.js:
 *      PEI            = resultat / lengde  (dispersion: tilMål / mål)
 *      Til mål        = √((mål − carry)² + side²)
 *      PGA putts      = oppslag fra resultatavstand (green-/grovtabell)
 *      SG (per hull)  = (SG fra lengde − 1) − PGA putts
 *      Poeng          = oppslagstabeller (8-ball / lengdeputt / gate-treff)
 *
 * Protokoller med kjønnsvarianter har rowsByGender { gutter, jenter }.
 */

const cyc = (arr, n) => Array.from({ length: n }, (_, i) => arr[i % arr.length]);
const rep = (arr, times) => arr.flatMap((v) => Array(times).fill(v));

const EIGHT_BALL_ORDER = ['Chip10', 'Chip30', 'Wedge20', 'Wedge40', 'Lobb15', 'Lobb25', 'Bunker10', 'Bunker20'];
const EIGHT_BALL_LEN = { Chip10: 10, Chip30: 30, Wedge20: 20, Wedge40: 40, Lobb15: 15, Lobb25: 25, Bunker10: 10, Bunker20: 20 };
const CAT = (slag) => slag.replace(/\d+$/, '');

function eightBall(id, name, order, description) {
  return {
    id, name, group: 'Golfslag', description,
    columns: [
      { key: 'slag', label: 'Slag', kind: 'preset' },
      { key: 'lengde', label: 'Lengde', kind: 'preset', unit: 'm' },
      { key: 'resultat', label: 'Resultat', kind: 'input', input: 'number', unit: 'm' },
      { key: 'pei', label: 'PEI', kind: 'computed', percent: true, decimals: 1 },
      { key: 'pgaPutts', label: 'PGA putts', kind: 'computed', decimals: 2 },
      { key: 'poeng', label: 'Poeng', kind: 'computed', decimals: 0 },
    ],
    puttsTable: 'green',
    rows: order.map((slag) => ({ slag, lengde: EIGHT_BALL_LEN[slag] })),
    totals: [
      { label: 'Total poeng', column: 'poeng', compute: 'sum' },
      { label: 'Chip PEI', column: 'pei', compute: 'avg', percent: true, decimals: 1, filter: (r) => CAT(r.slag) === 'Chip' },
      { label: 'Wedge PEI', column: 'pei', compute: 'avg', percent: true, decimals: 1, filter: (r) => CAT(r.slag) === 'Wedge' },
      { label: 'Lobb PEI', column: 'pei', compute: 'avg', percent: true, decimals: 1, filter: (r) => CAT(r.slag) === 'Lobb' },
      { label: 'Bunker PEI', column: 'pei', compute: 'avg', percent: true, decimals: 1, filter: (r) => CAT(r.slag) === 'Bunker' },
    ],
  };
}

// Banelengder fra arket (hull 27–30 slås fra bunker — bunker-SG-tabellen brukes der)
const BANE_GUTTER = [129, 150, 236.5, 195, 172, 185, 211, 87, 184, 190, 142.5, 237.5, 160, 68.5, 160, 200, 75, 149.5, 35, 47, 59, 72, 120, 150, 170, 145, 120, 12, 17, 10];
const BANE_JENTER = [101, 139, 180, 130, 127, 149, 65, 83, 109, 115, 130, 200, 148, 33, 134, 168, 90, 103, 35, 47, 59, 72, 100, 120, 140, 125, 100, 12, 17, 10];
const H18_GUTTER = [109, 201, 149, 66, 90, 170, 143, 50, 194, 129, 83, 220, 117, 102, 181, 157, 208, 61];
const H18_JENTER = [87, 161, 119, 53, 72, 136, 114, 40, 155, 103, 66, 176, 94, 82, 145, 126, 167, 49];

function baneRows(lengths, bunkerFrom) {
  return lengths.map((lengde, i) => ({ hull: i + 1, lengde, lie: bunkerFrom != null && i >= bunkerFrom ? 'b' : undefined }));
}

function baneTest(id, name, gutter, jenter, bunkerFrom, description) {
  return {
    id, name, group: 'Golfslag', description,
    columns: [
      { key: 'hull', label: 'Hull', kind: 'preset' },
      { key: 'lengde', label: 'Lengde', kind: 'preset', unit: 'm' },
      { key: 'sgFraLengde', label: 'SG fra lengde', kind: 'computed', decimals: 2 },
      { key: 'resultat', label: 'Resultat', kind: 'input', input: 'number', unit: 'm' },
      { key: 'lieInn', label: 'Lie', kind: 'input', input: 'choice', options: ['g', 'fw', 'b', 'r'] },
      { key: 'pei', label: 'PEI', kind: 'computed', percent: true, decimals: 1 },
      { key: 'pgaPutts', label: 'PGA putts', kind: 'computed', decimals: 2 },
      { key: 'sg', label: 'SG', kind: 'computed', decimals: 2 },
    ],
    rows: baneRows(gutter, bunkerFrom),
    rowsByGender: { gutter: baneRows(gutter, bunkerFrom), jenter: baneRows(jenter, bunkerFrom) },
    totals: [
      { label: 'Sum SG', column: 'sg', compute: 'sum', decimals: 2 },
      { label: 'Snitt PEI', column: 'pei', compute: 'avg', percent: true, decimals: 1 },
      { label: 'Sum PGA putts', column: 'pgaPutts', compute: 'sum', decimals: 1 },
    ],
  };
}

function dispersionTest(id, name, shots, withSpeed, targetsG, targetsJ, description) {
  const cols = [
    { key: 'maal', label: 'Mål', kind: 'preset', unit: 'm' },
    { key: 'carry', label: 'Carry', kind: 'input', input: 'number', unit: 'm' },
    { key: 'side', label: 'Side', kind: 'input', input: 'number', unit: 'm' },
  ];
  if (withSpeed) cols.push({ key: 'speed', label: 'Speed', kind: 'input', input: 'number', unit: 'mph' });
  cols.push(
    { key: 'tilMaal', label: 'Til mål', kind: 'computed', unit: 'm', decimals: 1 },
    { key: 'pei', label: 'PEI', kind: 'computed', percent: true, decimals: 1 },
    { key: 'sg', label: 'Forv. slag', kind: 'computed', decimals: 2 },
  );
  const mk = (targets) => cyc(targets, shots).map((maal) => ({ maal }));
  return {
    id, name, group: 'Golfslag', description,
    columns: cols,
    rows: mk(targetsG),
    rowsByGender: targetsJ ? { gutter: mk(targetsG), jenter: mk(targetsJ) } : undefined,
    hovlandBenchmark: true,
    totals: [
      { label: 'Snitt PEI', column: 'pei', compute: 'avg', percent: true, decimals: 1 },
      { label: 'Sidespredning', column: 'side', compute: 'spread', decimals: 3 },
    ],
  };
}

// ── PEI-tester (ark «PEI Tester» + «PEI Test Bane») ──────────────────
// Formler: Lengde +/- = Dist − Mål · Fra hull = √((Mål−Dist)² + Retning²) · PEI = Fra hull / Mål
function peiSlagtest(id, name, targets, description) {
  return {
    id, name, group: 'PEI', description,
    columns: [
      { key: 'maal', label: 'Mål', kind: 'preset', unit: 'm', editableFallback: true, input: 'number' },
      { key: 'carry', label: 'Dist', kind: 'input', input: 'number', unit: 'm' },
      { key: 'side', label: 'Retning', kind: 'input', input: 'number', unit: 'm' },
      { key: 'diff', label: 'Lengde +/-', kind: 'computed', decimals: 1 },
      { key: 'tilMaal', label: 'Fra hull', kind: 'computed', unit: 'm', decimals: 1 },
      { key: 'pei', label: 'PEI', kind: 'computed', percent: true, decimals: 1 },
    ],
    rows: targets.map((maal) => ({ maal })),
    totals: [
      { label: 'Snitt fra hull', column: 'tilMaal', compute: 'avg', decimals: 1 },
      { label: 'Snitt PEI', column: 'pei', compute: 'avg', percent: true, decimals: 1 },
    ],
  };
}

export const TEST_PROTOCOLS = [
  // ── Golfslag (ark «Scorekort GolfslagTester») ────────────────────────
  eightBall('8-ball-variation', '8-ball variation', cyc(EIGHT_BALL_ORDER, 24),
    '24 slag, slagtypene i variert rekkefølge. Resultat = meter fra hull.'),
  eightBall('8-ball-blocked', '8-ball blocked', rep(EIGHT_BALL_ORDER, 3),
    '24 slag, 3 like slag om gangen. Resultat = meter fra hull.'),
  baneTest('golfslag-bane', 'Golfslag bane', BANE_GUTTER, BANE_JENTER, 27,
    '30 slag med banelengder (hull 28–30 fra bunker). Resultat = meter fra hull, lie noteres.'),
  dispersionTest('driver-basic', 'Driver basic', 5, true, [270], [220],
    '5 utslag mot mål-avstand (gutter 270 m / jenter 220 m). Carry, side og speed registreres.'),
  dispersionTest('inspill-basis', 'Inspill Basis', 5, true, [160], [125],
    '5 innspill mot mål-avstand (gutter 160 m / jenter 125 m). Carry, side og speed registreres.'),
  dispersionTest('wedge-variation', 'Wedge Variation', 9, false, [58, 37, 87, 63, 48, 57, 33, 66, 54], null,
    '9 wedgeslag mot varierende mål-avstander.'),
  baneTest('18-hull', '18 - hull', H18_GUTTER, H18_JENTER, null,
    '18 hull med banelengder. Resultat = meter fra hull, lie noteres per slag.'),
  {
    id: 'putt-1-3m', name: 'Putt 1–3 m', group: 'Golfslag',
    description: '25 putter — 5 på hver av 1 / 1,5 / 2 / 2,5 / 3 m. Antall slag per putt registreres.',
    columns: [
      { key: 'maal', label: 'Avstand', kind: 'preset', unit: 'm' },
      { key: 'forventet', label: 'Forventet', kind: 'computed', decimals: 2 },
      { key: 'antallSlag', label: 'Antall slag', kind: 'input', input: 'choice', options: ['1', '2', '3'] },
      { key: 'res', label: 'Res +/-', kind: 'computed', decimals: 2 },
    ],
    rows: cyc([1, 1.5, 2, 2.5, 3], 25).map((maal) => ({ maal })),
    totals: [
      { label: 'Totalt slag', column: 'antallSlag', compute: 'sum' },
      { label: 'Sum res +/-', column: 'res', compute: 'sum', decimals: 2 },
      { label: 'Snitt 1 m', column: 'antallSlag', compute: 'avg', decimals: 2, filter: (r) => r.maal === 1 },
      { label: 'Snitt 2 m', column: 'antallSlag', compute: 'avg', decimals: 2, filter: (r) => r.maal === 2 },
      { label: 'Snitt 3 m', column: 'antallSlag', compute: 'avg', decimals: 2, filter: (r) => r.maal === 3 },
    ],
  },
  {
    id: '9-hull-lengde', name: '9 hull lengde', group: 'Golfslag',
    description: '9 langputter (5–11 m). Antall fot forbi/kort registreres (sänk = 0 fot = 6 poeng).',
    columns: [
      { key: 'maal', label: 'Avstand', kind: 'preset', unit: 'm' },
      { key: 'antallFot', label: 'Antall fot', kind: 'input', input: 'number', unit: 'fot' },
      { key: 'poeng', label: 'Poeng', kind: 'computed', decimals: 1 },
    ],
    rows: [5, 7, 11, 9, 6, 10, 8, 7, 9].map((maal) => ({ maal })),
    totals: [
      { label: 'Total poeng', column: 'poeng', compute: 'sum', decimals: 1 },
      { label: 'Sum fot', column: 'antallFot', compute: 'sum', decimals: 1 },
    ],
  },

  // ── Teknikk-gates (ark «Scorekort TeknikTester») ─────────────────────
  {
    id: 'naerspill-gate', name: 'Nærspill Gate', group: 'Teknikk',
    description: '9 slag — 3 launch-vinduer × carry-soner 2/3/4 m. Treff/bom per slag.',
    columns: [
      { key: 'launch', label: 'Launch', kind: 'preset' },
      { key: 'carrySone', label: 'Carry-sone', kind: 'preset' },
      { key: 'treff', label: 'Treff', kind: 'input', input: 'choice', options: ['✓', '✗'] },
      { key: 'poeng', label: 'Poeng', kind: 'computed', decimals: 0 },
    ],
    rows: rep(['Lav', 'Middels', 'Høy'], 3).map((launch, i) => ({ launch, carrySone: ['2 m', '3 m', '4 m'][i % 3] })),
    totals: [{ label: 'Total', column: 'poeng', compute: 'sum' }],
  },
  {
    id: 'visa-express', name: 'VISA Express', group: 'Teknikk',
    description: '9 putter i speedsoner 2/3/4 m. Treff/bom per putt.',
    columns: [
      { key: 'speedsone', label: 'Speedsone', kind: 'preset' },
      { key: 'treff', label: 'Treff', kind: 'input', input: 'choice', options: ['✓', '✗'] },
      { key: 'poeng', label: 'Poeng', kind: 'computed', decimals: 0 },
    ],
    rows: cyc(['2 m', '3 m', '4 m'], 9).map((speedsone) => ({ speedsone })),
    totals: [{ label: 'Total', column: 'poeng', compute: 'sum' }],
  },
  {
    id: 'putt-speed-1x5', name: 'Putt Speed 1 × 5', group: 'Teknikk',
    description: '5 putter fra 3 m. Distanse og lang/kort registreres.',
    columns: [
      { key: 'maal', label: 'Avstand', kind: 'preset', unit: 'm' },
      { key: 'distanse', label: 'Distanse', kind: 'input', input: 'number', unit: 'm' },
      { key: 'langKort', label: 'Lang/kort', kind: 'input', input: 'choice', options: ['L', 'K'] },
    ],
    rows: Array(5).fill({ maal: 3 }),
    totals: [{ label: 'Snitt distanse', column: 'distanse', compute: 'avg', decimals: 2 }],
  },
  {
    id: 'putt-speed-3x3', name: 'Putt Speed 3 × 3', group: 'Teknikk',
    description: '9 putter — 3 fra hver av 3/5/7 m. Distanse og lang/kort registreres.',
    columns: [
      { key: 'maal', label: 'Avstand', kind: 'preset', unit: 'm' },
      { key: 'distanse', label: 'Distanse', kind: 'input', input: 'number', unit: 'm' },
      { key: 'langKort', label: 'Lang/kort', kind: 'input', input: 'choice', options: ['L', 'K'] },
    ],
    rows: cyc([3, 5, 7], 9).map((maal) => ({ maal })),
    totals: [{ label: 'Snitt distanse', column: 'distanse', compute: 'avg', decimals: 2 }],
  },
  {
    id: 'wedge-gate', name: 'Wedge Gate', group: 'Teknikk',
    description: '9 wedgeslag — 3 launch-vinduer (grader) × carry-soner ±3 m. Treff/bom per slag.',
    columns: [
      { key: 'launch', label: 'Launch', kind: 'preset', unit: '°' },
      { key: 'carrySone', label: 'Carry-sone', kind: 'preset' },
      { key: 'treff', label: 'Treff', kind: 'input', input: 'choice', options: ['✓', '✗'] },
      { key: 'poeng', label: 'Poeng', kind: 'computed', decimals: 0 },
    ],
    rows: rep(['<26 (lav)', '28–30 (medium)', '>32 (høy)'], 3).map((launch, i) => ({ launch, carrySone: ['40 m ±3', '50 m ±3', '60 m ±3'][i % 3] })),
    totals: [{ label: 'Total', column: 'poeng', compute: 'sum' }],
  },
  {
    id: 'driver-gate', name: 'Driver Gate', group: 'Teknikk',
    description: '6 utslag gjennom 2 m bred gate. OK/ikke OK per slag.',
    columns: [
      { key: 'gate', label: 'Gate', kind: 'preset' },
      { key: 'ok', label: 'OK', kind: 'input', input: 'choice', options: ['✓', '✗'] },
      { key: 'poeng', label: 'Poeng', kind: 'computed', decimals: 0 },
    ],
    rows: Array(6).fill({ gate: '2 m' }),
    totals: [{ label: 'Total', column: 'poeng', compute: 'sum' }],
  },
  {
    id: 'putt-gate', name: 'Putt Gate', group: 'Teknikk',
    description: '10 putter gjennom 40 cm gate. OK + venstre/høyre-miss registreres.',
    columns: [
      { key: 'gate', label: 'Gate', kind: 'preset' },
      { key: 'ok', label: 'OK', kind: 'input', input: 'choice', options: ['✓', '✗'] },
      { key: 'vh', label: 'V/H', kind: 'input', input: 'choice', options: ['V', 'H'] },
      { key: 'poeng', label: 'Poeng', kind: 'computed', decimals: 0 },
    ],
    rows: Array(10).fill({ gate: '40 cm' }),
    totals: [{ label: 'Total', column: 'poeng', compute: 'sum' }],
  },

  // ── PEI-tester (ark «PEI Tester» + «PEI Test Bane») ─────────────────
  {
    id: 'pei-test-bane', name: 'PEI Test Bane', group: 'PEI',
    description: '18 hull på banen. Slaglengde og resultat («til hull») fylles inn per slag; PEI beregnes.',
    columns: [
      { key: 'hull', label: 'Hull', kind: 'preset' },
      { key: 'slagLie', label: 'Slag', kind: 'input', input: 'choice', options: ['f', 'r', 't', 'b'] },
      { key: 'lengdeInn', label: 'Lengde', kind: 'input', input: 'number', unit: 'm' },
      { key: 'tilHull', label: 'Til hull', kind: 'input', input: 'number', unit: 'm' },
      { key: 'pei', label: 'PEI', kind: 'computed', percent: true, decimals: 1 },
    ],
    rows: Array.from({ length: 18 }, (_, i) => ({ hull: i + 1 })),
    totals: [{ label: 'Snitt PEI', column: 'pei', compute: 'avg', percent: true, decimals: 1 }],
  },
  peiSlagtest('pei-slagtest-egen', 'Slagtest — egne lengder', Array(18).fill(null),
    'TN testprotokoll: 18 slag med egne mål-lengder (f.eks. medianlengder med egne køller).'),
  peiSlagtest('pei-st-leon', 'Slagtest — ST Leon ROT',
    [129, 150, 236.5, 195, 172, 185, 211, 87, 184, 190, 142.5, 237.5, 160, 68.5, 160, 200, 75, 149.5],
    'German Boys-referansen (ST Leon ROT): 18 slag med faste mål-lengder.'),
  peiSlagtest('pei-st-cloud', 'Slagtest — ST Cloud GC',
    [145, 127, 45, 80, 100, 127, 125, 122, 135, 109, 139, 82, 145, 78, 45, 72, 58, 128],
    'French Ladies U21-referansen (ST Cloud GC): 18 slag med faste mål-lengder.'),
  peiSlagtest('pei-pga27', 'Slagtest — PGA Tour 27 shots',
    [145, 60, 45, 110, 150, 135, 140, 215, 75, 165, 115, 155, 180, 230, 200, 160, 185, 170, 130, 125, 155, 100, 190, 175, null, null, null],
    'PGA Tour-referansen: 27 slag (24 lengder fra arket; de tre siste fylles inn selv).'),
  peiSlagtest('pei-wedge-blocked', 'Wedgetest — 3 blocked',
    [30, 30, 30, 50, 50, 50, 70, 70, 70],
    'Wedge 3 blocked: 3 slag på hver av 30/50/70 m.'),
  peiSlagtest('pei-inspill-variation', 'Inspill Variation',
    [100, 130, 110, 140, 160, 100, 130, 110, 140, 160],
    'Innspill med varierte lengder, 10 slag.'),
];

export const PROTOCOL_GROUPS = ['Golfslag', 'Teknikk', 'PEI'];

export function getProtocol(id) {
  return TEST_PROTOCOLS.find((p) => p.id === id) || null;
}
