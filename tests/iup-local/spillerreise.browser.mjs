// Manuell nettleserprøve mot dedikert lokal IUP-app. Se README.md.
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import pg from 'pg';
import { execFileSync } from 'node:child_process';
import { resolve, isAbsolute } from 'node:path';
const dir = '.codex/environments/iup-app';
const env = JSON.parse(readFileSync(`${dir}/runtime.json`));
const accounts = JSON.parse(readFileSync(`${dir}/accounts.json`));
const dbUrl = new URL(env.DATABASE_URL);
assert.equal(dbUrl.hostname, '127.0.0.1');
assert.equal(dbUrl.port, '55822');
assert.equal(dbUrl.pathname, '/postgres');
assert.equal(dbUrl.search, '');
assert.equal(dbUrl.hash, '');
assert.ok(['postgres:', 'postgresql:'].includes(dbUrl.protocol));
assert.equal(env.LOCAL_IUP_APP, 'ak-hq-iup-app-20261002');
assert.equal(env.NEXT_PUBLIC_SUPABASE_URL, 'http://127.0.0.1:55821');
assert.equal(env.NEXT_PUBLIC_APP_URL, 'http://127.0.0.1:3073');
for (const [service, port] of [['db', '55822'], ['kong', '55821']]) {
    const container = JSON.parse(execFileSync('docker', ['inspect', `supabase_${service}_ak-hq-iup-app-20261002`]))[0];
    const bindings = Object.values(container.NetworkSettings.Ports).flatMap(v => v ?? []);
    assert.deepEqual(bindings, [{HostIp: '127.0.0.1', HostPort: port}]);
}
const db = new pg.Client({ connectionString: env.DATABASE_URL });
await db.connect();
const marker = await db.query("SELECT shobj_description(oid, 'pg_database') AS identity FROM pg_database WHERE datname=current_database()");
assert.equal(marker.rows[0].identity, 'ak-hq-iup-app-20261002');
assert.equal(accounts.length, 2);
assert.deepEqual(accounts.map(a => a.id).sort(), ["iup-app-spiller-a", "iup-app-spiller-b"]);
for (const a of accounts) {
    assert.ok(/^iup-app-spiller-[ab]$/.test(a.id));
    assert.ok(/^iup-[ab]@example\.test$/.test(a.email));
}
// Bare dette separate miljøets syntetiske besvarelser nullstilles for en repeterbar prøve.
await db.query('DELETE FROM iup_besvarelser WHERE "userId"=ANY($1)', [accounts.map(a => a.id)]);
await db.query('UPDATE group_members SET "endedAt"=NULL WHERE "userId"=ANY($1)', [accounts.map(a => a.id)]);
const out = process.env.IUP_BROWSER_EVIDENCE_DIR ?? `${process.env.HOME}/Documents/Claude/akgolf-hq/iup-kode-2026-10-02/nettleser`;
assert.ok(isAbsolute(out) && !resolve(out).startsWith(process.cwd() + "/"), "Skjermbilder skal lagres utenfor repoet");
mkdirSync(out, { recursive: true });
const base = 'http://127.0.0.1:3073';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.setDefaultTimeout(30000);
page.setDefaultNavigationTimeout(120000);
async function login(p, account) { await p.goto(base + '/auth/login'); await p.getByRole('button', { name: 'Logg inn med passord', exact: true }).click(); await p.locator('input[type=email]').fill(account.email); await p.locator('input[type=password]').fill(account.password); await p.getByRole('button', { name: 'Logg inn', exact: true }).click(); await p.waitForURL(u => u.pathname !== '/auth/login'); await p.goto(base + '/portal/mal/evaluering'); await p.getByRole('heading', { name: 'Evaluering', exact: true }).waitFor(); try {
    await p.getByRole('button', { name: 'Kun nødvendige', exact: true }).waitFor({ timeout: 5000 });
    await p.getByRole('button', { name: 'Kun nødvendige', exact: true }).click();
}
catch { } }
try {
    await login(page, accounts[0]);
    console.log('PASS real local login and empty evaluation');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: out + '/iup-tom-mobil.png' });
    await page.getByRole('link', { name: 'Ny utviklingssjekk', exact: true }).click();
    await page.getByLabel('Nivå', { exact: true }).selectOption('UNG');
    await page.getByLabel('Fra dato', { exact: true }).fill('2026-10-01');
    await page.getByLabel('Til dato', { exact: true }).fill('2026-10-28');
    await page.getByRole('button', { name: 'Fortsett', exact: true }).click();
    await page.locator('.iup-sporsmal').first().locator('input[value="3"]').check();
    await page.getByRole('button', { name: 'Lagre utkast', exact: true }).click();
    await page.waitForURL(u => u.searchParams.has('id'));
    await page.getByRole('status').filter({ hasText: 'Utkast · revisjon 1' }).waitFor();
    const own = page.url();
    await page.reload();
    assert.equal(await page.locator('.iup-sporsmal').first().locator('input[value="3"]').isChecked(), true);
    console.log('PASS draft persisted through reload');
    const old = await context.newPage();
    await old.goto(own);
    await old.getByRole('button', { name: 'Lagre utkast' }).waitFor();
    for (const category of await page.locator('.iup-skjema > details').all()) {
        if (!await category.evaluate(el => el.open))
            await category.locator('summary').click();
        for (const f of await category.locator('.iup-sporsmal').all()) {
            const radio = f.locator('input[value="4"]');
            await radio.focus();
            await radio.press('Space');
            assert.equal(await radio.isChecked(), true);
        }
    }
    assert.equal(await page.locator('.iup-skjema input[type=radio]:checked').count(), 34);
    await page.getByRole('button', { name: 'Lever besvarelse', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Levert · revisjon 2' }).waitFor();
    assert.equal(await page.locator('.iup-skjema input[type=radio]:enabled').count(), 0);
    console.log('PASS complete delivery and read-only state');
    await page.evaluate(() => { for (const el of document.querySelectorAll('*')) {
        if (el.scrollTop)
            el.scrollTo({ top: 0, behavior: 'instant' });
    } });
    await page.screenshot({ path: out + '/iup-levert-mobil.png' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: out + '/iup-levert-desktop.png' });
    await page.getByRole('button', { name: 'Rediger besvarelse' }).click();
    await page.locator('.iup-sporsmal').first().locator('input[value="5"]').check();
    await page.getByRole('button', { name: 'Lagre utkast', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Utkast · revisjon 3' }).waitFor();
    let head = await db.query('SELECT revisjon,"levertRevisjon" FROM iup_besvarelser WHERE "userId"=$1', [accounts[0].id]);
    assert.deepEqual(head.rows, [{ revisjon: 3, levertRevisjon: 2 }]);
    console.log('PASS new draft preserves previous delivery');
    await old.locator('.iup-sporsmal').first().locator('input[value="1"]').check();
    await old.getByRole('button', { name: 'Lagre utkast' }).click();
    await old.getByRole('button', { name: 'Hent siste versjon' }).waitFor();
    assert.equal(await old.locator('.iup-skjema input[type=radio]:enabled').count(), 0);
    old.once('dialog', d => d.accept());
    await old.getByRole('button', { name: 'Hent siste versjon' }).click();
    await old.getByRole('status').filter({ hasText: 'Utkast · revisjon 3' }).waitFor();
    await old.close();
    console.log('PASS stale tab conflict and explicit reload');
    await page.locator('.iup-sporsmal').first().locator('input[value="2"]').check();
    let failed = false;
    await page.route('**/portal/mal/evaluering?*', async (route) => { if (!failed && route.request().method() === 'POST' && route.request().headers()['next-action']) {
        failed = true;
        await route.fetch();
        await route.abort('failed');
    }
    else
        await route.continue(); });
    await page.getByRole('button', { name: 'Lagre utkast' }).click();
    await page.getByRole('button', { name: 'Prøv igjen', exact: true }).waitFor();
    assert.equal(await page.locator('.iup-skjema input[type=radio]:enabled').count(), 0);
    await page.screenshot({ path: out + '/iup-nettverksfeil-desktop.png' });
    head = await db.query('SELECT revisjon FROM iup_besvarelser WHERE "userId"=$1', [accounts[0].id]);
    assert.equal(head.rows[0].revisjon, 4);
    await page.getByRole('button', { name: 'Prøv igjen', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Utkast · revisjon 4' }).waitFor();
    head = await db.query('SELECT revisjon FROM iup_besvarelser WHERE "userId"=$1', [accounts[0].id]);
    assert.equal(head.rows[0].revisjon, 4);
    console.log('PASS lost receipt retry creates no duplicate');
    const second = await browser.newContext();
    const other = await second.newPage();
    await login(other, accounts[1]);
    await other.goto(own);
    await other.getByRole('heading', { name: "Denne siden finnes ikke", exact: true }).waitFor();
    assert.ok(!(await other.content()).includes('Utviklingssjekk · Ung'));
    assert.equal(await other.getByRole('button', { name: 'Lagre utkast' }).count(), 0);
    console.log('PASS other logged-in owner cannot read answer');
    await second.close();
    await db.query('UPDATE group_members SET "endedAt"=now() WHERE "userId"=$1', [accounts[0].id]);
    await page.reload();
    await page.getByText('Tidligere besvarelser er fortsatt tilgjengelige for deg.', { exact: false }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Lagre utkast' }).count(), 0);
    console.log('PASS ended membership retains read-only own history');
    await db.query('UPDATE group_members SET "endedAt"=NULL WHERE "userId"=$1', [accounts[0].id]);
    await page.goto(base + '/portal/mal/evaluering');
    await page.getByRole('link', { name: 'Ny sesongevaluering', exact: true }).click();
    await page.getByLabel('Kildeår', { exact: true }).selectOption('iup-2027');
    await page.getByLabel('Fra dato', { exact: true }).fill('2026-01-01');
    await page.getByLabel('Til dato', { exact: true }).fill('2026-10-31');
    await page.getByRole('button', { name: 'Fortsett', exact: true }).click();
    const text = page.locator('.iup-skjema textarea');
    await text.first().waitFor();
    assert.equal(await text.count(), 6);
    for (let i = 0; i < 6; i++)
        await text.nth(i).fill(`Syntetisk svar ${i + 1}.`);
    for (const f of await page.locator('.iup-skjema .iup-sporsmal').all())
        await f.locator('input[value="3"]').check();
    const percentages = page.locator('.iup-skjema input[type=number]');
    assert.equal(await percentages.count(), 10);
    for (let i = 0; i < 10; i++)
        await percentages.nth(i).fill(i % 5 === 0 ? '0' : '25');
    assert.equal(await page.getByRole('button', { name: 'Lever besvarelse', exact: true }).isEnabled(), true);
    await percentages.nth(0).fill('');
    assert.equal(await page.getByRole('button', { name: 'Lever besvarelse', exact: true }).isEnabled(), false);
    await page.getByRole('button', { name: 'Lagre utkast', exact: true }).click();
    await page.waitForURL(u => u.searchParams.has('id'));
    await page.getByRole('status').filter({ hasText: 'Utkast · revisjon 1' }).waitFor();
    await page.reload();
    assert.equal(await page.locator('input[type=number]').first().inputValue(), '');
    await page.locator('input[type=number]').first().fill('0');
    await page.getByRole('button', { name: 'Lever besvarelse', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Levert · revisjon 2' }).waitFor();
    assert.equal(await page.locator('.iup-skjema textarea:enabled').count(), 0);
    console.log('PASS complete 2027 season, zero vs missing, draft/reload/delivery');
    await page.evaluate(() => { document.querySelector('.pa-skall__innhold')?.scrollTo({ top: 0, behavior: 'instant' }); window.scrollTo({ top: 0, behavior: 'instant' }); });
    await page.screenshot({ path: out + '/iup-sesong-desktop.png' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: out + '/iup-sesong-mobil.png' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.getByText('Revisjon 1 · Utkast', { exact: false }).click();
    const history = page.locator('.iup-historikk[open]');
    await history.locator('textarea').first().waitFor();
    assert.equal(await history.locator('textarea').count(), 6);
    assert.equal(await history.locator('input:enabled,textarea:enabled').count(), 0);
    assert.equal(await history.locator('input[type=number]').first().inputValue(), '');
    console.log('PASS original draft remains readable and immutable');
    await page.goto(base + '/portal/mal/evaluering');
    await page.getByRole('link', { name: 'Utviklingssjekk · Ung', exact: false }).click();
    await page.getByRole('status').filter({ hasText: 'Utkast · revisjon 4' }).waitFor();
    await page.evaluate(() => { for (const el of document.querySelectorAll('*')) {
        if (el.scrollTop)
            el.scrollTo({ top: 0, behavior: 'instant' });
    } });
    await page.screenshot({ path: out + '/iup-sporsmal-mobil.png' });
    await page.locator('.pa-root').evaluate(el => el.setAttribute('data-theme', 'night'));
    await page.screenshot({ path: out + '/iup-sporsmal-mobil-natt.png' });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: out + '/iup-sporsmal-desktop-natt.png' });
    await page.locator('.pa-root').evaluate(el => el.removeAttribute('data-theme'));
    await page.screenshot({ path: out + '/iup-sporsmal-desktop.png' });
    await page.locator('.iup-sporsmal').first().locator('input[value="5"]').check();
    page.once('dialog', d => d.dismiss());
    await page.getByRole('link', { name: 'Til evalueringene', exact: true }).click();
    assert.ok(new URL(page.url()).searchParams.has('id'));
    assert.equal(await page.locator('.iup-sporsmal').first().locator('input[value="5"]').isChecked(), true);
    console.log('PASS cancelled navigation retains unsaved answers');
    page.once('dialog', d => d.accept());
    await page.goto(base + '/portal');
    await page.getByRole('link', { name: 'Åpne evaluering', exact: true }).waitFor();
    await page.goto(base + '/portal/mal');
    await page.getByRole('link', { name: 'Utviklingssjekk og sesongevaluering', exact: true }).waitFor();
    console.log('PASS real entry links in I dag and Målsetning');
    console.log('All browser checks completed.');
}
catch (e) {
    await page.screenshot({ path: out + '/iup-feil-under-test.png' }).catch(() => { });
    const melding = accounts.reduce((tekst, a) => tekst.replaceAll(a.password, '[lokalt testpassord]'), String(e.message));
    console.error('Browser check failed:', melding);
    process.exitCode = 1;
}
finally {
    await browser.close();
    await db.end();
}
