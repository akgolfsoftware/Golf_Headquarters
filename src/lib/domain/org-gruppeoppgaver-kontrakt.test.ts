import { test } from 'node:test';
import assert from 'node:assert/strict';
import { orgOppgaveInnenGruppetid, oppsummerOrgBelastning, type OrgGruppeOppgave } from './org-gruppeoppgaver-kontrakt';
const dato = new Date('2026-10-12T00:00:00Z');
const kilde = { date: dato, startMinute: 480, durationMinutes: 120 };
test('individuell oppgave kan ikke flyttes ut av gruppens tidsvindu', () => {
  assert.equal(orgOppgaveInnenGruppetid(kilde, { date: dato, startMinute: 500, durationMinutes: 60 }), true);
  assert.equal(orgOppgaveInnenGruppetid(kilde, { date: dato, startMinute: 479, durationMinutes: 60 }), false);
  assert.equal(orgOppgaveInnenGruppetid(kilde, { date: dato, startMinute: 550, durationMinutes: 51 }), false);
  assert.equal(orgOppgaveInnenGruppetid(kilde, { date: new Date('2026-10-13T00:00:00Z'), startMinute: 480, durationMinutes: 60 }), false);
});
test('planlagt tid erstatter aldri manglende registrering, men faktisk null bevares', () => {
  const o: OrgGruppeOppgave = { id: 'syntetisk-okt', playerId: 'syntetisk-spiller', spillerNavn: 'Test Spiller', gruppeOkt: 'Gruppetid', date: '2026-10-12', startMinute: 480, durationMinutes: 60, title: 'Oppgave', pyramid: 'TEK', status: 'COMPLETED', actualMinutes: null, loggedReps: null, updatedAt: '2026-10-12T00:00:00Z' };
  assert.equal(oppsummerOrgBelastning([o]).faktiskMinutter, null);
  assert.equal(oppsummerOrgBelastning([{ ...o, actualMinutes: 0 }]).faktiskMinutter, 0);
  assert.equal(oppsummerOrgBelastning([{ ...o, actualMinutes: 25 }]).faktiskMinutter, 25);
});
