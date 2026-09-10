import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import pg from 'pg';

const connection = process.env.LAUNCH_TEST_DATABASE_URL;
if (!connection) throw new Error('LAUNCH_TEST_DATABASE_URL required');
const target = new URL(connection);
if (target.hostname !== '127.0.0.1' || target.port !== '54379' || target.pathname !== '/ak_hq_launch_tests') throw new Error('Only isolated launch database allowed');

test('funksjonssikkerhet: ekte rettigheter og syntetiske data i Postgres', async t => {
  const db = new pg.Client({ connectionString: connection });
  await db.connect();
  await db.query('BEGIN');
  try {
    await db.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon; END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated; END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN CREATE ROLE service_role; END IF;
    END $$;
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE SCHEMA IF NOT EXISTS dashboard;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
    CREATE DOMAIN public.vector AS double precision[];
    CREATE FUNCTION dashboard.name_key(text) RETURNS text LANGUAGE sql AS $$ SELECT lower($1) $$;
    CREATE FUNCTION public.beregn_frist(timestamptz) RETURNS timestamptz LANGUAGE sql AS $$ SELECT $1 $$;
    CREATE FUNCTION public.match_me_memory(vector,integer) RETURNS integer LANGUAGE sql AS $$ SELECT $2 $$;
    CREATE FUNCTION public.match_me_knowledge(vector,integer) RETURNS integer LANGUAGE sql AS $$ SELECT $2 $$;
    CREATE TABLE public.me_secret(navn text PRIMARY KEY, verdi text);`);
    // Stub bodies isolate permissions from health data; signatures and applied SQL are exact.
    const access = await readFile(new URL('../../scripts/sql/launch-function-access.sql', import.meta.url), 'utf8');
    const signatures = [...access.matchAll(/REVOKE EXECUTE ON FUNCTION (public\.helse_[^;]+?) FROM/g)].map(m => m[1]);
    assert.equal(signatures.length, 13);
    for (const signature of signatures) await db.query(`CREATE FUNCTION ${signature} RETURNS integer LANGUAGE sql SECURITY DEFINER AS $$ SELECT 1 $$`);
    for (const signature of ['sak_inn(nokkel text, tekst text, kanal text)', 'sak_liste(nokkel text)', 'sak_ferdig(nokkel text, sak_id text)']) {
      await db.query(`CREATE FUNCTION public.${signature} RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
        if nokkel is null or nokkel <> (select verdi from me_secret where navn='test-key') then raise exception 'Denied'; end if;
        RETURN true; END $$;`);
    }
    await db.query(access);
    const keys = await readFile(new URL('../../scripts/sql/launch-function-search-path-and-keys.sql', import.meta.url), 'utf8');
    await db.query(keys);
    await t.test('gjentatt kjøring er trygg', async () => { await db.query(access); await db.query(keys); });
    await t.test('13 helsefunksjoner er avvist for klienter og tillatt for server', async () => {
      const { rows } = await db.query(`SELECT has_function_privilege('anon',oid,'EXECUTE') a, has_function_privilege('authenticated',oid,'EXECUTE') u, has_function_privilege('service_role',oid,'EXECUTE') s FROM pg_proc WHERE proname LIKE 'helse_%' AND pronamespace='public'::regnamespace`);
      assert.equal(rows.length, 13); assert.ok(rows.every(r => !r.a && !r.u && r.s));
      await db.query('SAVEPOINT deny_health');
      await db.query('SET LOCAL ROLE anon');
      await assert.rejects(db.query('SELECT public.helse_hent_doegn()'), e => e.code === '42501');
      await db.query('ROLLBACK TO deny_health');
      await db.query('SET LOCAL ROLE service_role');
      assert.equal((await db.query('SELECT public.helse_hent_doegn() value')).rows[0].value, 1);
      await db.query('RESET ROLE');
    });
    await t.test('saksnøkkel: fraværende rad, NULL og feil verdi avvises', async () => {
      const calls = ["SELECT public.sak_inn($1,'synthetic','synthetic')", 'SELECT public.sak_liste($1)', "SELECT public.sak_ferdig($1,'synthetic')"];
      for (const stored of [undefined, null, 'correct-key']) {
        await db.query('DELETE FROM public.me_secret');
        if (stored !== undefined) await db.query("INSERT INTO public.me_secret VALUES ('test-key',$1)", [stored]);
        for (const sql of calls) for (const supplied of [null, 'wrong-key']) {
          await db.query('SAVEPOINT key_test');
          await assert.rejects(db.query(sql, [supplied]), /Denied/);
          await db.query('ROLLBACK TO key_test');
        }
      }
      for (const sql of calls) assert.equal(Object.values((await db.query(sql, ['correct-key'])).rows[0])[0], true);
    });
    await t.test('coach kan ikke oppgi en annen coaches identitet', async () => {
      const auth = randomUUID(), otherAuth = randomUUID();
      await db.query(`INSERT INTO users(id,"authId",email,name,role,"updatedAt") VALUES
        ('security-coach',$1,'security-coach@example.test','Test coach','COACH',now()),
        ('security-other',$2,'security-other@example.test','Test other','COACH',now()),
        ('security-player',$3,'security-player@example.test','Test player','PLAYER',now())`, [auth, otherAuth, randomUUID()]);
      await db.query(`INSERT INTO player_enrollments(id,"userId",program,"coachId","updatedAt") VALUES ('security-enrollment','security-player','AK_ACADEMY','security-coach',now())`);
      const check = async (sub, coach) => {
        await db.query("SELECT set_config('request.jwt.claim.sub',$1,true)", [sub]);
        return (await db.query("SELECT public.workbench_coach_has_player_access($1,'security-player') allowed", [coach])).rows[0].allowed;
      };
      assert.equal(await check(auth, 'security-coach'), true);
      assert.equal(await check(otherAuth, 'security-coach'), false);
      assert.equal(await check(otherAuth, 'security-other'), false);
      assert.equal(await check('', 'security-coach'), false);
      await db.query(`UPDATE users SET "deletedAt"=now() WHERE id='security-coach'`);
      assert.equal(await check(auth, 'security-coach'), false);
      const acl = (await db.query("SELECT has_function_privilege('anon','public.workbench_coach_has_player_access(text,text)','EXECUTE') a, has_function_privilege('authenticated','public.workbench_coach_has_player_access(text,text)','EXECUTE') u")).rows[0];
      assert.deepEqual(acl, { a: false, u: true });
    });
    await t.test('alle fire tidligere åpne søkestier er eksplisitte', async () => {
      const { rows } = await db.query("SELECT proconfig FROM pg_proc WHERE proname IN ('name_key','beregn_frist','match_me_memory','match_me_knowledge') AND pronamespace IN ('public'::regnamespace,'dashboard'::regnamespace)");
      assert.equal(rows.length, 4); assert.ok(rows.every(r => r.proconfig.some(s => s.startsWith('search_path=pg_catalog,') && s.endsWith('pg_temp'))));
    });
  } finally { await db.query('ROLLBACK'); await db.end(); }
});
