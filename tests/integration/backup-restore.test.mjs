import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { test } from 'node:test';
import pg from 'pg';

const connection = process.env.LAUNCH_TEST_DATABASE_URL;
if (!connection) throw new Error('LAUNCH_TEST_DATABASE_URL required');
const target = new URL(connection);
if (target.hostname !== '127.0.0.1' || target.port !== '54379' || target.pathname !== '/ak_hq_launch_tests') throw new Error('Only isolated launch database allowed');
const bin = process.env.LAUNCH_TEST_PG_BIN;
if (!bin) throw new Error('LAUNCH_TEST_PG_BIN must point to local Postgres tools');

test('lokal sikkerhetskopi kan gjenopprettes med booking og kollisjonsvern', async () => {
  const run = promisify(execFile);
  const scratch = await mkdtemp(join(tmpdir(), 'ak-hq-restore-'));
  const cloneName = `ak_hq_launch_restore_${Date.now()}`;
  const cloneUrl = new URL(connection); cloneUrl.pathname = `/${cloneName}`;
  const source = new pg.Client({ connectionString: connection });
  const clone = new pg.Client({ connectionString: cloneUrl.toString() });
  const id = `restore-${randomUUID()}`;
  let cloneCreated = false, cloneConnected = false;
  const env = { PATH: process.env.PATH, PGPASSWORD: decodeURIComponent(target.password) };
  const args = ['-h', target.hostname, '-p', target.port, '-U', decodeURIComponent(target.username)];
  const started = Date.now();
  await source.connect();
  try {
    await source.query(`INSERT INTO users(id,"authId",email,name,role,"updatedAt") VALUES ($1,$2,$3,'Restore test','COACH',now())`, [id,randomUUID(),`${id}@example.test`]);
    await source.query(`INSERT INTO service_types(id,slug,name,"priceOre","durationMin","updatedAt") VALUES ($1,$1,'Restore test',10000,30,now())`, [id]);
    await source.query(`INSERT INTO locations(id,name,address,"updatedAt") VALUES ($1,'Restore test','Test',now())`, [id]);
    await source.query(`INSERT INTO bookings(id,"coachId","serviceTypeId","locationId","startAt","endAt",status,"priceOre","updatedAt") VALUES ($1,$1,$1,$1,'2095-01-01 10:00','2095-01-01 10:30','CONFIRMED',10000,now())`, [id]);
    await run(join(bin,'pg_dump'), [...args,'-d','ak_hq_launch_tests','-Fc','-f',join(scratch,'local.dump')], { env });
    await source.query(`CREATE DATABASE ${cloneName}`); cloneCreated = true;
    await run(join(bin,'pg_restore'), [...args,'-d',cloneName,'--exit-on-error',join(scratch,'local.dump')], { env });
    await clone.connect(); cloneConnected = true;
    assert.deepEqual((await clone.query('SELECT status,"priceOre" FROM bookings WHERE id=$1',[id])).rows, [{status:'CONFIRMED',priceOre:10000}]);
    await assert.rejects(clone.query(`INSERT INTO bookings(id,"coachId","serviceTypeId","locationId","startAt","endAt","updatedAt") VALUES ($2,$1,$1,$1,'2095-01-01 10:00','2095-01-01 10:30',now())`,[id,`${id}-conflict`]), e => e.code === '23P01');
    const sourceTables=(await source.query("SELECT count(*)::int n FROM pg_tables WHERE schemaname='public'")).rows[0].n;
    const cloneTables=(await clone.query("SELECT count(*)::int n FROM pg_tables WHERE schemaname='public'")).rows[0].n;
    assert.equal(cloneTables, sourceTables);
    console.log(JSON.stringify({ localOnly:true, tables:cloneTables, bookingRestored:true, overlapRejected:true, elapsedMs:Date.now()-started, productionBackupTested:false }));
  } finally {
    if (cloneConnected) await clone.end();
    if (cloneCreated) await source.query(`DROP DATABASE ${cloneName}`);
    await source.query('DELETE FROM bookings WHERE id=$1',[id]);
    await source.query('DELETE FROM service_types WHERE id=$1',[id]);
    await source.query('DELETE FROM locations WHERE id=$1',[id]);
    await source.query('DELETE FROM users WHERE id=$1',[id]);
    await source.end();
    await rm(scratch,{recursive:true,force:true});
  }
});
