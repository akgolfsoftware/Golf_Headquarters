import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
mock.module('server-only', { defaultExport: {} });
mock.module('@/lib/audit', { namedExports: { audit: async () => undefined } });
mock.module('next/cache', { namedExports: { revalidatePath() {} } });
mock.module('@/lib/auth/requirePortalUser', { namedExports: { requirePortalUser: async () => ({ id: 'syntetisk-coach', role: 'COACH' }) } });
mock.module('@/lib/auth/effective-capabilities', { namedExports: { assertCapability: async () => undefined } });
let tilgang = true;
let medlem = true;
let kildeStart = 480;
let status = 'PUBLISHED';
let faktisk: number | null = null;
let writes = 0;
const date = new Date('2026-10-12T00:00:00Z');
const updatedAt = new Date('2026-10-12T10:00:00Z');
const kopi = () => ({ id: 'syntetisk-kopi', playerId: 'syntetisk-spiller', sourceGroupSessionId: 'syntetisk-kilde', date, startMinute: 480, durationMinutes: 60, status, updatedAt, actualMinutes: faktisk, liveSnapshot: null, drillLogs: [] });
const db = {
  group: { findFirst: async () => tilgang ? { id: 'syntetisk-gruppe' } : null },
  groupMember: { findFirst: async () => medlem ? { id: 'syntetisk-medlem' } : null },
  workbenchSession: {
    findFirst: async ({ where }: { where: { id: string } }) => where.id === 'syntetisk-kopi' ? kopi() : { date, startMinute: kildeStart, durationMinutes: 120 },
    updateMany: async () => { writes++; return { count: 1 }; },
  },
  $executeRaw: async () => undefined,
};
mock.module('@/lib/prisma', { namedExports: { prisma: { $transaction: async (les: (tx: typeof db) => unknown) => les(db) } } });
const actions = () => import('./org-gruppeoppgaver');
const input = { groupId: 'syntetisk-gruppe', sessionId: 'syntetisk-kopi', expectedUpdatedAt: updatedAt.toISOString(), title: 'Individuell oppgave', pyramid: 'TEK' };
test.beforeEach(() => { tilgang = true; medlem = true; kildeStart = 480; status = 'PUBLISHED'; faktisk = null; writes = 0; });
test('annen gruppe eller utmeldt spiller blir avvist før skriving', async () => {
  tilgang = false; assert.equal((await (await actions()).endreOrgGruppeOppgave(input)).ok, false); assert.equal(writes, 0);
  tilgang = true; medlem = false; assert.equal((await (await actions()).endreOrgGruppeOppgave(input)).ok, false); assert.equal(writes, 0);
});
test('klient kan ikke sende flyttedato eller omgå gruppens tidsvindu', async () => {
  assert.equal((await (await actions()).endreOrgGruppeOppgave({ ...input, date: '2026-10-13' })).ok, false);
  kildeStart = 500; assert.equal((await (await actions()).endreOrgGruppeOppgave(input)).ok, false); assert.equal(writes, 0);
});
test('påbegynt, registrert eller foreldet kopi endres ikke', async () => {
  status = 'IN_PROGRESS'; assert.equal((await (await actions()).endreOrgGruppeOppgave(input)).ok, false);
  status = 'PUBLISHED'; faktisk = 0; assert.equal((await (await actions()).endreOrgGruppeOppgave(input)).ok, false);
  faktisk = null; assert.equal((await (await actions()).endreOrgGruppeOppgave({ ...input, expectedUpdatedAt: '2026-10-11T10:00:00Z' })).ok, false);
  assert.equal(writes, 0);
});
test('urørt oppgave oppdateres én gang i riktig gruppetid', async () => {
  assert.equal((await (await actions()).endreOrgGruppeOppgave(input)).ok, true); assert.equal(writes, 1);
});
