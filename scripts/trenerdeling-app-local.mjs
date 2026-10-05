// Kun nattens separate lokale Supabase-prosjekt. Ingen .env lastes.
import { readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import pg from 'pg';
const dir = '.codex/environments/iup-app';
const env = JSON.parse(readFileSync(`${dir}/runtime.json`, 'utf8'));
const url = new URL(env.DATABASE_URL);
assert.equal(url.hostname, '127.0.0.1'); assert.equal(url.port, '55822'); assert.equal(url.pathname, '/postgres');
assert.equal(env.LOCAL_IUP_APP, 'ak-hq-iup-app-20261002');
assert.equal(env.NEXT_PUBLIC_SUPABASE_URL, 'http://127.0.0.1:55821');
for (const [service, port] of [['db', '55822'], ['kong', '55821']]) {
  const c = JSON.parse(execFileSync('docker', ['inspect', `supabase_${service}_ak-hq-iup-app-20261002`]))[0];
  assert.deepEqual(Object.values(c.NetworkSettings.Ports).flatMap(v => v ?? []), [{ HostIp: '127.0.0.1', HostPort: port }]);
}
const db = new pg.Client({ connectionString: env.DATABASE_URL }); await db.connect();
try {
  const marker = await db.query("SELECT shobj_description(oid, 'pg_database') AS marker FROM pg_database WHERE datname=current_database()");
  assert.equal(marker.rows[0].marker, env.LOCAL_IUP_APP);
  // Samordn den lokale databasen med Workbench-kolonnen som allerede er på main.
  await db.query('ALTER TABLE public.week_plans ADD COLUMN IF NOT EXISTS "planningDetails" JSONB');
  async function auth(path, method = 'GET', body) {
    const r = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/${path}`, {
      method, headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!r.ok) throw new Error(`Lokal Auth avviste fixture (${r.status})`);
    return r.json();
  }
  const users = (await auth('users?page=1&per_page=100')).users;
  const accounts = [];
  for (const [suffix, domain, role] of [['spiller','example.test','PLAYER'], ['wang','wang.no','COACH'], ['annen','wang.no','COACH'], ['forelder','example.test','PARENT']]) {
    const id = `deling-app-${suffix}`, email = `${id}@${domain}`, password = randomBytes(24).toString('base64url');
    const finnes = users.find(u => u.email === email);
    const user = finnes ? await auth(`users/${finnes.id}`, 'PUT', { password, email_confirm: true })
      : await auth('users', 'POST', { email, password, email_confirm: true, user_metadata: { name: 'Syntetisk deltaker' } });
    const rad = await db.query('SELECT email FROM public.users WHERE id=$1', [id]);
    assert.ok(!rad.rowCount || rad.rows[0].email === email);
    await db.query(`INSERT INTO public.users(id,"authId",email,name,role,tier,"dateOfBirth","trialEndsAt","createdAt","updatedAt")
      VALUES($1,$2,$3,$4,$5,'PRO','2000-01-01',NOW()+INTERVAL '30 days',NOW(),NOW())
      ON CONFLICT(id) DO UPDATE SET "authId"=EXCLUDED."authId",role=EXCLUDED.role,"dateOfBirth"=EXCLUDED."dateOfBirth","deletedAt"=NULL,"anonymisertAt"=NULL,"requiresGuardianConsent"=false,"trialEndsAt"=EXCLUDED."trialEndsAt"`,
      [id,user.id,email,`Syntetisk ${suffix}`,role]);
    accounts.push({ id, email, password, authId: user.id, role });
  }
  await db.query(`INSERT INTO public.groups(id,name,slug,program,"createdAt","updatedAt") VALUES('deling-app-skole','Syntetisk delingsskole','deling-app-skole','WANG_TOPPIDRETT',NOW(),NOW()) ON CONFLICT(id) DO NOTHING`);
  for (const a of accounts.filter(a => a.role !== 'PARENT')) {
    await db.query(`INSERT INTO public.group_members(id,"groupId","userId",role,"joinedAt") VALUES($1,'deling-app-skole',$2,$3,NOW()) ON CONFLICT("groupId","userId") DO UPDATE SET "endedAt"=NULL,role=EXCLUDED.role`, [`${a.id}-medlem`,a.id,a.role]);
  }
  if (process.argv.includes('--mindrearig')) {
    await db.query(`UPDATE users SET "dateOfBirth"='2012-01-01',"requiresGuardianConsent"=true,"guardianConsentGivenAt"=NOW() WHERE id='deling-app-spiller' AND email='deling-app-spiller@example.test'`);
    await db.query(`INSERT INTO parent_relations(id,"parentId","childId",approved,"createdAt","updatedAt") VALUES('deling-app-relasjon','deling-app-forelder','deling-app-spiller',true,NOW(),NOW()) ON CONFLICT("parentId","childId") DO UPDATE SET approved=true`);
  }
  writeFileSync(`${dir}/deling-accounts.json`,JSON.stringify(accounts),{ mode:0o600 });
  console.log('Fire syntetiske delingskontoer og egen skole er klare i lokalt testmiljø. Ingen e-post sendt.');
} finally { await db.end(); }
