import { test } from 'node:test';
import assert from 'node:assert/strict';
import { oppsummerTestlevering, testleveringStatus } from './tn-testlevering';
const naa = new Date('2026-10-12T12:00:00Z');
test('fullført krever koblet resultat; gamle resultater gir ikke konstruert levering', () => {
  assert.equal(testleveringStatus({ fullfort: true, harResultat: true, frist: null, naa }), 'Fullført');
  assert.equal(testleveringStatus({ fullfort: true, harResultat: false, frist: null, naa }), 'Planlagt');
  assert.equal(testleveringStatus({ fullfort: false, harResultat: true, frist: null, naa }), 'Planlagt');
});
test('frist, avsluttet testdag og fravær viser mangler; kommende oppgave viser planlagt', () => {
  assert.equal(testleveringStatus({ fullfort: false, harResultat: false, frist: new Date('2026-10-11T12:00:00Z'), naa }), 'Mangler');
  assert.equal(testleveringStatus({ fullfort: false, harResultat: false, frist: new Date('2026-10-13T12:00:00Z'), naa }), 'Planlagt');
  assert.equal(testleveringStatus({ fullfort: false, harResultat: false, frist: null, avsluttet: true, naa }), 'Mangler');
  assert.equal(testleveringStatus({ fullfort: false, harResultat: false, frist: null, fravaerende: true, naa }), 'Mangler');
});
test('ingen tildeling gir ukjent leveringsgrad, ikke null eller 100 prosent', () => {
  assert.equal(oppsummerTestlevering([]).leveringsgrad, null);
  const basis = { id: 'test', playerId: 'syntetisk-spiller', testId: 'test-1', testName: 'Test', scheduledAt: null, source: 'Tildeling' as const };
  assert.deepEqual(oppsummerTestlevering([{ ...basis, status: 'Fullført' }, { ...basis, id: 'to', status: 'Mangler' }]), { tildelt: 2, fullfort: 1, planlagt: 0, mangler: 1, leveringsgrad: .5 });
});

test('aktiv testdag uten sluttstatus regnes ikke som manglende mens føringen pågår', () => {
  assert.equal(testleveringStatus({ fullfort: false, harResultat: false, frist: null, avsluttet: false, naa }), 'Planlagt');
  assert.equal(testleveringStatus({ fullfort: false, harResultat: false, frist: null, avsluttet: true, naa }), 'Mangler');
});
