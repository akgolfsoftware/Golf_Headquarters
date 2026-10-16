/**
 * Kontrakt for Data Golf-sperren (Anders 09.10.2026): hver side som viser
 * Data Golf-tall skal stoppe ved `krevDataGolfBruker` før den henter noe, og
 * skal ikke ha felles hurtigbuffer (ISR) som kan levere en coach-side til en
 * uinnlogget. Skannet går på filene, så en ny side under /stats/pga eller
 * /stats/sg-sammenlign uten vakt er rød med én gang.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const APP = join(process.cwd(), "src", "app");

function finnSider(dir: string, ut: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    if (statSync(f).isDirectory()) finnSider(f, ut);
    else if (e === "page.tsx") ut.push(f);
  }
  return ut;
}

function utenKommentarer(kode: string): string {
  return kode.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const DATAGOLF_SIDER = [
  ...finnSider(join(APP, "(marketing)", "stats", "pga")),
  ...finnSider(join(APP, "(marketing)", "stats", "sg-sammenlign")),
  join(APP, "(marketing)", "stats", "leaderboards", "page.tsx"),
  join(APP, "portal", "analysere", "datagolf", "page.tsx"),
  join(APP, "portal", "analysere", "datagolf", "stasjon", "page.tsx"),
].sort();

test("skannet finner Data Golf-sidene", () => {
  assert.ok(DATAGOLF_SIDER.length >= 15, `Fant bare ${DATAGOLF_SIDER.length} sider`);
});

test("hver Data Golf-side stopper ved krevDataGolfBruker", () => {
  const uten = DATAGOLF_SIDER.filter(
    (f) => !/await\s+krevDataGolfBruker\(/.test(utenKommentarer(readFileSync(f, "utf8"))),
  ).map((f) => relative(process.cwd(), f));
  assert.deepEqual(uten, [], `Data Golf-sider uten vakt:\n  ${uten.join("\n  ")}`);
});

test("ingen Data Golf-side har ISR-hurtigbuffer", () => {
  const medIsr = DATAGOLF_SIDER.filter((f) =>
    /export\s+const\s+revalidate\s*=\s*[1-9]/.test(utenKommentarer(readFileSync(f, "utf8"))),
  ).map((f) => relative(process.cwd(), f));
  assert.deepEqual(medIsr, [], `Data Golf-sider med revalidate:\n  ${medIsr.join("\n  ")}`);
});

test("server-handlingene for Data Golf sjekker rollen", () => {
  const sg = utenKommentarer(
    readFileSync(join(APP, "(marketing)", "stats", "sg-sammenlign", "actions.ts"), "utf8"),
  );
  assert.match(sg, /await\s+krevDataGolfBruker\(/);
  const portal = utenKommentarer(
    readFileSync(join(APP, "portal", "analysere", "datagolf", "actions.ts"), "utf8"),
  );
  assert.match(portal, /kanSeDataGolf\(user\)/);
  assert.doesNotMatch(portal, /"PLAYER"/);
});
