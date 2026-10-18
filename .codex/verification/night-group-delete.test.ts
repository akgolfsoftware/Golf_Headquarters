import assert from 'node:assert/strict';
import { before, after, mock, test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { parse } from 'dotenv';
import pg from 'pg';
import { assertLocalUsersRuntime, assertLocalUsersTargets, assertLocalUsersDatabase } from '../../scripts/local-users-target.mjs';
const env = parse(readFileSync('.codex/environments/brukere/.env.runtime'));
assertLocalUsersRuntime(env, ['.env','.env.local','.env.test','.env.test.local'].filter(existsSync));
Object.assign(process.env, env);
const targets = assertLocalUsersTargets(env);
const ids = parse(readFileSync('.codex/environments/brukere/.env.users'));
assert.ok(ids.LOCAL_COACH_A_ID.startsWith('local-users-20261001-'));
assert.ok(ids.LOCAL_COACH_B_ID.startsWith('local-users-20261001-'));
let actor = { id: ids.LOCAL_COACH_A_ID, role: 'COACH' };
mock.module('@/lib/auth/requirePortalUser', { namedExports: { requirePortalUser: async ({allow}: {allow: string[]}) => {
  if (!allow.includes(actor.role)) throw Error('forbidden');
  return actor;
} } });
mock.module('next/cache', { namedExports: { revalidatePath: () => undefined } });
let db: typeof import('../../src/lib/prisma').prisma;
let remove: typeof import('../../src/app/admin/grupper/actions').deleteGroup;
const prefix = `night-delete-${randomUUID()}`;
const owned: string[] = [];
before(async () => {
  const sql = new pg.Pool({connectionString: targets.database.toString()});
  try { await assertLocalUsersDatabase(sql); } finally { await sql.end(); }
  db = (await import('../../src/lib/prisma')).prisma;
  for (const userId of [ids.LOCAL_COACH_A_ID,ids.LOCAL_COACH_B_ID]) {
    assert.equal((await db.user.findUniqueOrThrow({where:{id:userId}})).role, 'COACH');
  }
  remove = (await import('../../src/app/admin/grupper/actions')).deleteGroup;
});
after(async () => {
  if (!db) return;
  await db.auditLog.deleteMany({where:{target:{in:owned.map(id=>`Group:${id}`)}}});
  await db.group.deleteMany({where:{id:{in:owned}}});
  await db.$disconnect();
});
for (const scenario of ['owner','member','admin','other','assistant','ended','player'] as const) {
  test(`real local SQL: ${scenario}`, async () => {
    const groupId = `${prefix}-${scenario}`; owned.push(groupId);
    await db.group.create({data:{id:groupId,name:'Syntetisk sikkerhetsprøve',coachId:ids.LOCAL_COACH_A_ID}});
    if (['member','assistant','ended'].includes(scenario)) {
      await db.groupMember.create({data:{groupId,userId:ids.LOCAL_COACH_B_ID,
        role:scenario==='assistant'?'ASSISTANT':'COACH', endedAt:scenario==='ended'?new Date():null}});
    }
    actor = {id: scenario==='owner'?ids.LOCAL_COACH_A_ID:ids.LOCAL_COACH_B_ID, role:scenario==='admin'?'ADMIN':scenario==='player'?'PLAYER':'COACH'};
    if (scenario==='player') await assert.rejects(()=>remove(groupId),/forbidden/);
    else {
      const result = await remove(groupId);
      assert.equal('success' in result, ['owner','member','admin'].includes(scenario));
    }
    const allowed = ['owner','member','admin'].includes(scenario);
    assert.equal(await db.group.count({where:{id:groupId}}),allowed?0:1);
    assert.equal(await db.auditLog.count({where:{target:`Group:${groupId}`,action:'group.deleted'}}),allowed?1:0);
    if (scenario==='member') assert.equal(await db.groupMember.count({where:{groupId}}),0);
  });
}
