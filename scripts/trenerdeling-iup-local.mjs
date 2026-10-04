// Syntetisk IUP-fixture for den lokale, navngitte delingsreisen. Kjør med --import tsx --conditions=react-server.
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import pg from 'pg';
const kontraktModul = await import('../src/lib/iup/lagringskontrakt.ts');
const sporsmalModul = await import('../src/lib/iup/utviklingssjekk.ts');
const { lesIupLagring } = kontraktModul.default ?? kontraktModul;
const { hentUtviklingssporsmal } = sporsmalModul.default ?? sporsmalModul;
const env = JSON.parse(readFileSync('.codex/environments/iup-app/runtime.json'));
const url = new URL(env.DATABASE_URL);
assert.equal(url.hostname, '127.0.0.1'); assert.equal(url.port, '55822'); assert.equal(url.pathname, '/postgres');
const db = new pg.Client({ connectionString: env.DATABASE_URL }); await db.connect();
try {
  const m = await db.query("SELECT shobj_description(oid,'pg_database') marker FROM pg_database WHERE datname=current_database()");
  assert.equal(m.rows[0].marker, 'ak-hq-iup-app-20261002');
  const eier = await db.query('SELECT email FROM users WHERE id=$1', ['deling-app-spiller']);
  assert.equal(eier.rows[0].email, 'deling-app-spiller@example.test');
  await db.query('BEGIN');
  await db.query('DELETE FROM iup_besvarelser WHERE id=$1 AND "userId"=$2', ['deling-app-utv','deling-app-spiller']);
  for (const revisjon of [1,2]) {
    const p = lesIupLagring({ type:'UTVIKLINGSSJEKK', periodeStart:'2026-10-01', periodeSlutt:'2026-10-28', requestId:randomUUID(), forventetRevisjon:revisjon-1,
      besvarelse:{ versjon:'iup-2027', niva:'UNG', status:revisjon === 1 ? 'LEVERT' : 'UTKAST', svar:revisjon === 1 ? Object.fromEntries(hentUtviklingssporsmal('iup-2027','UNG').map(q=>[q.id,3])) : {} } });
    assert.ok(p.ok);
    if (revisjon === 1) await db.query('INSERT INTO iup_besvarelser(id,"userId",type,versjon,"kildeSha256",niva,"periodeStart","periodeSlutt",revisjon,"levertRevisjon") VALUES($1,$2,$3,$4,$5,$6,$7,$8,2,1)',
      ['deling-app-utv','deling-app-spiller','UTVIKLINGSSJEKK','iup-2027',p.data.kildeSha256,'UNG','2026-10-01','2026-10-28']);
    await db.query('INSERT INTO iup_revisjoner(id,"besvarelseId",revisjon,"requestId","requestHash",status,payload) VALUES($1,$2,$3,$4,$5,$6,$7)',
      [randomUUID(),'deling-app-utv',revisjon,p.data.requestId,p.data.requestHash,p.data.besvarelse.status,JSON.stringify(p.data.besvarelse)]);
  }
  await db.query('COMMIT'); console.log('34 syntetiske, kildevaliderte svar og separat utkast er klare.');
} finally { await db.end(); }
