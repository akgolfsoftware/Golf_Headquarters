import { mock, test } from 'node:test';
import assert from 'node:assert/strict';
mock.module('server-only', { defaultExport: {} });
mock.module('@/lib/notifications', { namedExports: { notify: async () => undefined } });
let group = 'wang';
let role: string | null = 'COACH';
let ended = false;
let writes = 0;
mock.module('@/lib/prisma', { namedExports: { prisma: {
  group: { findFirst: async () => ['wang', 'tn'].includes(group) ? { id: 'syntetisk-gruppe' } : null },
  groupMember: { findFirst: async ({ where }: { where: { endedAt?: null; groupId: string; userId: string } }) => !ended && role && where.endedAt === null && where.userId === 'syntetisk-coach' && where.groupId === 'syntetisk-gruppe' ? { id: 'syntetisk-medlem', role } : null },
  tnPost: { create: async () => { writes++; return { id: 'syntetisk-post' }; } },
} } });
const last = () => import('./tn-post');
test.beforeEach(() => { group = 'wang'; role = 'COACH'; ended = false; writes = 0; });
test('aktiv WANG- og TN-gruppetrener kan publisere til akkurat sin gruppe', async () => {
  const mod = await last();
  await mod.opprettGruppepost({ forfatterId: 'syntetisk-coach', groupId: 'syntetisk-gruppe', tekst: 'Felles program', kind: 'TEKST' });
  group = 'tn'; await mod.opprettGruppepost({ forfatterId: 'syntetisk-coach', groupId: 'syntetisk-gruppe', tekst: 'Felles program', kind: 'TEKST' });
  assert.equal(writes, 2);
});
test('fremmed gruppe, coach uten medlemskap og utmeldt trener får ikke publisere', async () => {
  const mod = await last(); const input = { forfatterId: 'syntetisk-coach', groupId: 'syntetisk-gruppe', tekst: 'Beskjed', kind: 'TEKST' as const };
  group = 'annen'; await assert.rejects(mod.opprettGruppepost(input));
  group = 'wang'; role = null; await assert.rejects(mod.opprettGruppepost(input));
  role = 'COACH'; ended = true; await assert.rejects(mod.opprettGruppepost(input));
  assert.equal(writes, 0);
});
test('spiller eller en annen organisasjons trener kan ikke poste som gruppetrener', async () => {
  const mod = await last(); role = 'PLAYER';
  await assert.rejects(mod.opprettGruppepost({ forfatterId: 'syntetisk-coach', groupId: 'syntetisk-gruppe', tekst: 'Beskjed', kind: 'TEKST' }));
  role = 'COACH'; await assert.rejects(mod.opprettGruppepost({ forfatterId: 'fremmed-coach', groupId: 'syntetisk-gruppe', tekst: 'Beskjed', kind: 'TEKST' }));
  assert.equal(writes, 0);
});
