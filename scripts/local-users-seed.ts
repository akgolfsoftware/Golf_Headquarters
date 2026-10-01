/** Synthetic accounts only, against the dedicated local test identity. */
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import pg from 'pg';
import { assertLocalUsersDatabase, assertLocalUsersTargets } from './local-users-target.mjs';

const PREFIX = 'local-users-20261001';
const credentialsPath = resolve('.codex/environments/brukere/.env.users');
async function main() {
const previous = existsSync(credentialsPath) ? parse(readFileSync(credentialsPath)) : {};
const targets = assertLocalUsersTargets(process.env);
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Local admin key missing');
const sql = new pg.Pool({ connectionString: targets.database.toString() });
await assertLocalUsersDatabase(sql);
await sql.end();

const auth = createClient(targets.api.origin, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: targets.database.toString() }) });
const accounts = [
  { key: 'COACH_A', role: 'COACH', name: 'Testcoach A' },
  { key: 'COACH_B', role: 'COACH', name: 'Testcoach B' },
  { key: 'P01', role: 'PLAYER', name: 'Testspiller 01' },
  { key: 'P02', role: 'PLAYER', name: 'Testspiller 02' },
  { key: 'P03', role: 'PLAYER', name: 'Testspiller 03' },
  { key: 'P04', role: 'PLAYER', name: 'Testspiller 04' },
  { key: 'PARENT', role: 'PARENT', name: 'Testforesatt' },
] as const;
const result: Record<string, string> = {};
try {
  const listed = await auth.auth.admin.listUsers({ page: 1, perPage: 100 });
  if (listed.error) throw new Error('Local Auth listing failed');
  for (const account of accounts) {
    const email = `${PREFIX}-${account.key.toLowerCase()}@akgolf.test`;
    const password = previous[`LOCAL_${account.key}_PASSWORD`] ?? randomBytes(24).toString('base64url');
    let authUser = listed.data.users.find(u => u.email === email);
    if (!authUser) {
      const created = await auth.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { role: account.role, tier: 'GRATIS', firstName: account.name, lastName: '' },
      });
      if (created.error || !created.data.user) throw new Error('Synthetic Auth creation failed');
      authUser = created.data.user;
    } else if (!previous[`LOCAL_${account.key}_PASSWORD`]) {
      const changed = await auth.auth.admin.updateUserById(authUser.id, { password });
      if (changed.error) throw new Error('Synthetic password recovery failed');
    }
    const child = account.key === 'P04';
    const fields = {
      authId: authUser.id, name: account.name, role: account.role,
      tier: 'GRATIS' as const, profilType: account.role === 'PLAYER' ? 'TALENT' : 'STANDARD',
      profilKilde: 'LOCAL_SYNTHETIC_TEST',
      dateOfBirth: account.role === 'PLAYER' ? new Date(child ? '2013-06-15T00:00:00Z' : '2000-06-15T00:00:00Z') : null,
      requiresGuardianConsent: child, guardianConsentGivenAt: null,
      deletedAt: null,
      preferences: { onboarding: { stepCompleted: 7 } },
    };
    const user = await prisma.user.upsert({
      where: { email }, create: { id: `${PREFIX}-${account.key.toLowerCase()}`, email, ...fields }, update: fields,
    });
    result[`LOCAL_${account.key}_ID`] = user.id;
    result[`LOCAL_${account.key}_EMAIL`] = email;
    result[`LOCAL_${account.key}_PASSWORD`] = password;
  }
  for (const [group, coach, players] of [
    ['a', 'COACH_A', ['P01', 'P04']], ['b', 'COACH_B', ['P03']],
  ] as const) {
    const id = `${PREFIX}-group-${group}`;
    await prisma.group.upsert({
      where: { id },
      create: { id, name: `Lokal testgruppe ${group.toUpperCase()}`, slug: id, managedByAkGolf: true, coachId: result[`LOCAL_${coach}_ID`] },
      update: { coachId: result[`LOCAL_${coach}_ID`] },
    });
    for (const player of players) {
      const userId = result[`LOCAL_${player}_ID`];
      await prisma.groupMember.upsert({
        where: { groupId_userId: { groupId: id, userId } },
        create: { groupId: id, userId, role: 'PLAYER' }, update: { endedAt: null },
      });
      await prisma.user.update({ where: { id: userId }, data: { primaryCoachId: result[`LOCAL_${coach}_ID`] } });
    }
  }
  const sessionId = `${PREFIX}-p01-session`;
  await prisma.workbenchSession.upsert({
    where: { id: sessionId },
    create: {
      id: sessionId, playerId: result.LOCAL_P01_ID, coachId: result.LOCAL_COACH_A_ID,
      date: new Date('2026-10-01T00:00:00Z'), startMinute: 540, durationMinutes: 45,
      title: 'Lokal syntetisk slagøkt', pyramid: 'SLAG', status: 'PUBLISHED',
      createdBy: 'COACH', publishedBy: result.LOCAL_COACH_A_ID, publishedAt: new Date(),
    }, update: {},
  });
  result.LOCAL_P01_SESSION_ID = sessionId;
  writeFileSync(credentialsPath, Object.entries(result).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join('\n') + '\n', { mode: 0o600 });
  console.log('Four synthetic players, two separate coaches and one parent created. Credentials kept in an ignored private env file.');
} catch {
  console.error('Synthetic local user setup failed; no personal data or credentials printed.');
  process.exitCode = 1;
} finally { await prisma.$disconnect(); }
}
main().catch(() => { console.error('Dedicated local setup rejected'); process.exitCode = 1; });
