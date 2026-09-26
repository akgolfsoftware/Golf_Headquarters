#!/usr/bin/env node
/**
 * Testdag/trenerføring — ekte lokal reise mot den NYE, isolerte, tomme
 * teststacken (Codex-provisjonert 14.09.2026 kl.16.43): API 127.0.0.1:54521,
 * Postgres 127.0.0.1:54522/postgres, app-port 3012. HELT separat fra
 * scripts/tn-demo-lokal-*.mjs (54421/54422, port 3011, reserven med det
 * beviste 49-slag-resultatet) — den røres IKKE av dette skriptet, og egne
 * filnavn (tn-fullfor-20260914-*) brukes overalt for å unngå forveksling.
 *
 * Skjemaet provisjoneres med `prisma db push` KUN mot denne bekreftet tomme
 * databasen (aldri migrate dev/deploy, aldri mot HQ/WANG/hostet). Egne
 * syntetiske fixtures, eget passord, egen status-/credsfil.
 */
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { skrivPrivatFil, renFeilmelding } from "./tn-demo-lokal-privatfil.mjs";

const rot = join(dirname(fileURLToPath(import.meta.url)), "..");
const HQ_HOST = "127.0.0.1";
const API_PORT = "54521";
const DB_PORT = "54522";
const APP_PORT = "3012";
const FORBUDT_PORTER = new Set(["54321", "54322", "54323", "54324", "54421", "54422", "3011"]);
const STATUS_DIR = "/private/tmp/ak-hq-tn-fullfor-20260914";
const STATUS_FIL = `${STATUS_DIR}/status.env`;
const APP_STATUS_FIL = `${STATUS_DIR}/app-status.env`;
const CREDS_FIL = `${STATUS_DIR}/creds.env`;
const APP_DB_NAME = "tn_fullfor_app_20260914";
const APP = `http://${HQ_HOST}:${APP_PORT}`;

function krevUrl(url, felt, port) {
  if (!url) throw new Error(`${felt} is required; production defaults are forbidden`);
  const target = new URL(url);
  if (target.hostname !== HQ_HOST) throw new Error(`${felt} must be loopback ${HQ_HOST}`);
  if (FORBUDT_PORTER.has(target.port)) throw new Error(`${felt} points at en ANNEN stack (WANG/HQ-P0/reserve) — kun ${port} er tillatt her`);
  if (target.port !== port) throw new Error(`${felt} must use port ${port}`);
  return target;
}

function krevDbUrl(url, felt) {
  const target = krevUrl(url, felt, DB_PORT);
  if (target.protocol !== "postgresql:" && target.protocol !== "postgres:") throw new Error(`${felt} must use the postgres(ql):// protocol`);
  if (target.pathname.replace(/^\//, "") !== APP_DB_NAME) throw new Error(`${felt} must target the "${APP_DB_NAME}" database — never "postgres" or any other name, no fallback`);
  return target;
}

/**
 * Engangs empty-guard: skjema-provisjonering (`prisma db push`) skal KUN
 * kjøre mot en faktisk tom database — aldri stille kjøres på nytt ved en
 * Playwright-retry (det ville ikke skade en tom base, men ville skjule at
 * runneren "reprovisjonerer blindt" i stedet for å bevare tilstanden man
 * måler mot, jf. review 14.09). Kontrollerer container-DB-en direkte
 * (pg_catalog.pg_tables), ikke en lokal sentinel-fil som kan komme ut av synk.
 */
async function erDatabasenTom(connectionString) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    const res = await client.query("SELECT count(*)::int AS n FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
    return res.rows[0].n === 0;
  } finally {
    await client.end();
  }
}

/**
 * Skjemaet har noen (urelaterte) RAG/embedding-tabeller som bruker Postgres-
 * utvidelsen `vector` (pgvector) — `db push` feiler på HELE skjemaet uten
 * den. Aktivering av en utvidelse er en del av å provisjonere en fersk, tom
 * testbase (ingen datamutasjon), og gjøres KUN mot denne isolerte databasen.
 */
async function aktiverPgvector(connectionString) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await client.query("CREATE EXTENSION IF NOT EXISTS vector");
  } finally {
    await client.end();
  }
}

function lastStatus(sti) {
  if (!existsSync(sti)) throw new Error(`Mangler ${sti}. Codex må bekrefte stacken/appdatabasen klar først.`);
  const env = {};
  for (const linje of readFileSync(sti, "utf8").split("\n")) {
    const m = linje.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return env;
}

async function ventPaUrl(url, timeoutMs) {
  const slutt = Date.now() + timeoutMs;
  let siste = "";
  while (Date.now() < slutt) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status < 500) return;
      siste = `HTTP ${res.status}`;
    } catch (e) {
      siste = e instanceof Error ? e.message : String(e);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Svarte ikke på ${url}: ${siste}`);
}

function portErLedig(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.listen(Number(port), HQ_HOST, () => server.close(() => resolve(true)));
  });
}

function krevIngenAutomatiskeMiljofiler() {
  for (const navn of [".env", ".env.local", ".env.development", ".env.development.local"]) {
    if (existsSync(join(rot, navn))) throw new Error(`Isolert tn-fullfor-reise krever arbeidskopi uten ${navn}.`);
  }
}

function systemMiljo() {
  const env = {};
  for (const navn of ["PATH", "HOME", "TMPDIR", "TMP", "TEMP", "LANG", "LC_ALL", "TERM", "USER", "LOGNAME", "SHELL", "SystemRoot"]) {
    if (process.env[navn]) env[navn] = process.env[navn];
  }
  return env;
}

function kjor(kommando, args, env) {
  return new Promise((resolve, reject) => {
    const p = spawn(kommando, args, { cwd: rot, env, stdio: "inherit" });
    p.on("error", reject);
    p.on("exit", (kode) => (kode === 0 ? resolve() : reject(new Error(`${kommando} ${args.join(" ")} exit ${kode}`))));
  });
}

async function main() {
  krevIngenAutomatiskeMiljofiler();
  if (!(await portErLedig(APP_PORT))) throw new Error(`Port ${APP_PORT} er opptatt. Avklar eier; dreper ingen fremmed prosess.`);

  const status = lastStatus(STATUS_FIL);
  // DB_URL kommer KUN fra den egne, private app-databasefilen (peker på
  // tn_fullfor_app_20260914 — en dedikert app-database i samme container,
  // atskilt fra Auth-databasen). Ingen fallback til status.env sitt DB_URL
  // (som peker på Auth-databasen "postgres") eller noen annen bane.
  const appStatus = lastStatus(APP_STATUS_FIL);
  const db = krevDbUrl(appStatus.DB_URL, "DB_URL (app-status.env)").toString();
  const api = krevUrl(status.API_URL, "API_URL", API_PORT).origin;
  if (!status.ANON_KEY || !status.SERVICE_ROLE_KEY) throw new Error("Stacken mangler nøkler i statusfilen.");
  await ventPaUrl(`${api}/auth/v1/health`, 30_000);

  const felles = {
    ...systemMiljo(),
    DATABASE_URL: db,
    DIRECT_URL: db,
    NEXT_PUBLIC_SUPABASE_URL: api,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: status.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
    SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
    NEXT_PUBLIC_APP_URL: APP,
    BOOKING_ACTIVE: "false",
    VEDLIKEHOLD: "0",
  };

  // Engangs skjema-provisjonering — KUN når basen faktisk er tom. En senere
  // kjøring (Playwright-retry) skal bruke den ferdigprovisjonerte basen og
  // fixturene som allerede finnes, ikke reprovisjonere blindt hver gang.
  if (await erDatabasenTom(db)) {
    process.stdout.write("Tom database bekreftet — aktiverer pgvector og provisjonerer skjema (prisma db push) mot 127.0.0.1:54522 …\n");
    await aktiverPgvector(db);
    await kjor("npx", ["prisma", "db", "push"], felles);
  } else {
    process.stdout.write("Skjema finnes allerede på 127.0.0.1:54522 — hopper over db push, bruker eksisterende base.\n");
  }

  await kjor("npx", ["tsx", "scripts/tn-fullfor-lokal-seed.ts"], felles);
  const credsEnv = (() => {
    const env = {};
    for (const linje of readFileSync(CREDS_FIL, "utf8").split("\n")) {
      const m = linje.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) env[m[1]] = m[2];
    }
    return env;
  })();
  Object.assign(felles, credsEnv);

  if (!(await portErLedig(APP_PORT))) throw new Error(`Port ${APP_PORT} ble tatt mens stacken startet.`);

  const nextLog = [];
  const next = spawn("npx", ["next", "dev", "-H", HQ_HOST, "-p", APP_PORT], {
    cwd: rot,
    env: { ...felles, NODE_OPTIONS: "--max-old-space-size=8192" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  next.stdout.on("data", (b) => nextLog.push(String(b)));
  next.stderr.on("data", (b) => nextLog.push(String(b)));
  const stopp = () => { if (!next.killed) next.kill("SIGTERM"); };
  process.on("exit", stopp);

  try {
    await ventPaUrl(APP, 180_000);
    await ventPaUrl(`${APP}/auth/login`, 120_000);
    await kjor(
      "npx",
      ["playwright", "test", "-c", "tests/p0/tn-fullfor-playwright.config.ts", "--project=chromium", ...process.argv.slice(2)],
      { ...felles, PLAYWRIGHT_BASE_URL: APP, CI: process.env.CI ?? "" },
    );
  } catch (error) {
    const logFil = `${STATUS_DIR}/next.log`;
    try {
      skrivPrivatFil(logFil, nextLog.join(""));
      process.stderr.write(`Next feilet. Uren, lokal logg: ${logFil}\n`);
    } catch { /* ignorer */ }
    throw error;
  } finally {
    stopp();
  }
}

main().catch((error) => {
  process.stderr.write(`${renFeilmelding(error)}\n`);
  process.exit(1);
});
