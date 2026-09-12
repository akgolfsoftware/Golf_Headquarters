#!/usr/bin/env node
/**
 * Innlogget P0-TEST mot isolert HQ-Supabase (porter 54421/54422) og Next på 3010.
 * Rører ikke WANG-stacken og leser ikke .env.local.
 */
import { spawn, execFileSync } from "node:child_process";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rot = join(dirname(fileURLToPath(import.meta.url)), "..");
const HQ_HOST = "127.0.0.1";
const HQ_API_PORT = "54421";
const HQ_DB_PORT = "54422";
const HQ_APP_PORT = "3010";
const WANG = new Set(["54321", "54322", "54323", "54324"]);
const STACK_DIR = "/tmp/ak-hq-supabase-local";
const STATUS_FIL = "/tmp/ak-hq-p0.status.env";
const CREDS_FIL = "/tmp/ak-hq-p0-creds.env";
const APP = "http://127.0.0.1:3010";

function versjonDeler(verdi) {
  const treff = verdi.match(/^(\d+)\.(\d+)\.(\d+)/);
  return treff ? treff.slice(1).map(Number) : null;
}

function finnSupabaseBin() {
  const eksplisitt = process.env.P0_SUPABASE_BIN?.trim();
  if (eksplisitt) return eksplisitt;

  const kandidater = execFileSync("which", ["-a", "supabase"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })
    .split("\n")
    .map((sti) => sti.trim())
    .filter((sti, index, alle) => sti && alle.indexOf(sti) === index);

  const gyldige = kandidater.flatMap((sti) => {
    try {
      const deler = versjonDeler(execFileSync(sti, ["--version"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim());
      return deler ? [{ sti, deler }] : [];
    } catch {
      return [];
    }
  });

  gyldige.sort((a, b) => {
    for (let i = 0; i < 3; i += 1) {
      if (a.deler[i] !== b.deler[i]) return b.deler[i] - a.deler[i];
    }
    return 0;
  });
  if (!gyldige[0]) throw new Error("Fant ingen fungerende lokal Supabase CLI");
  return gyldige[0].sti;
}

const SUPABASE_BIN = finnSupabaseBin();

function krevUrl(url, felt, port, pathname) {
  if (!url) throw new Error(`${felt} is required; production defaults are forbidden`);
  let target;
  try {
    target = new URL(url);
  } catch {
    throw new Error(`${felt} is not a valid URL`);
  }
  if (target.hostname !== HQ_HOST) throw new Error(`${felt} must be loopback ${HQ_HOST}`);
  if (WANG.has(target.port)) throw new Error(`${felt} points at the WANG stack; use the HQ P0 ports`);
  if (target.port !== port) throw new Error(`${felt} must use port ${port}`);
  if (pathname && target.pathname.replace(/^\//, "").split("?")[0] !== pathname) {
    throw new Error(`${felt} must use database ${pathname}`);
  }
  return target;
}

function krevHqP0DatabaseUrl(url) {
  return krevUrl(url, "P0_HQ_DATABASE_URL", HQ_DB_PORT, "postgres");
}
function krevHqP0ApiUrl(url) {
  return krevUrl(url, "P0_HQ_API_URL", HQ_API_PORT);
}
function krevHqP0AppUrl(url) {
  return krevUrl(url, "P0_HQ_APP_URL", HQ_APP_PORT);
}

function lastEnvFil(sti) {
  if (!existsSync(sti)) {
    throw new Error(`Mangler ${sti}. Start HQ-stacken og kjør supabase status -o env dit.`);
  }
  for (const linje of readFileSync(sti, "utf8").split("\n")) {
    const treff = linje.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!treff) continue;
    process.env[treff[1]] = treff[2].replace(/^"|"$/g, "");
  }
}

function kjor(kommando, args, env, valg = {}) {
  return new Promise((resolve, reject) => {
    const barn = spawn(kommando, args, {
      cwd: rot,
      env,
      stdio: valg.stdio ?? "inherit",
    });
    barn.on("error", reject);
    barn.on("exit", (kode) => {
      if (kode === 0) resolve();
      else reject(new Error(`${kommando} ${args.join(" ")} avsluttet med ${kode}`));
    });
  });
}

function hqStackKjorer() {
  try {
    const ut = execFileSync("docker", ["inspect", "-f", "{{.State.Running}} {{.Name}}", "supabase_db_akgolf-hq-p0"], {
      encoding: "utf8",
    }).trim();
    return ut.startsWith("true ");
  } catch {
    return false;
  }
}

function oppdaterStatus() {
  if (!existsSync(join(STACK_DIR, "supabase", "config.toml"))) {
    throw new Error(`Mangler ${STACK_DIR}/supabase/config.toml. Ikke bruk WANG-stacken på 54321.`);
  }
  const ut = execFileSync(SUPABASE_BIN, ["status", "-o", "env"], {
    cwd: STACK_DIR,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  writeFileSync(STATUS_FIL, ut, { mode: 0o600 });
}

async function ventPaUrl(url, timeoutMs) {
  const slutt = Date.now() + timeoutMs;
  let siste = "";
  while (Date.now() < slutt) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status < 500) return;
      siste = `HTTP ${res.status}`;
    } catch (error) {
      siste = error instanceof Error ? error.message : String(error);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Svarte ikke på ${url}: ${siste}`);
}

async function main() {
  if (!hqStackKjorer()) {
    process.stdout.write("Starter isolert HQ-Supabase på 54421/54422\n");
    execFileSync(SUPABASE_BIN, ["start"], { cwd: STACK_DIR, stdio: "inherit" });
  }
  oppdaterStatus();
  lastEnvFil(STATUS_FIL);
  const db = krevHqP0DatabaseUrl(process.env.DB_URL).toString();
  const api = krevHqP0ApiUrl(process.env.API_URL).origin;
  krevHqP0AppUrl(APP);
  if (!process.env.ANON_KEY || !process.env.SERVICE_ROLE_KEY) {
    throw new Error("HQ-stacken mangler nøkler i statusfilen");
  }
  await ventPaUrl(`${api}/auth/v1/health`, 30_000);

  const felles = {
    ...process.env,
    P0_HQ_DATABASE_URL: db,
    P0_HQ_API_URL: api,
    P0_HQ_APP_URL: APP,
    DATABASE_URL: db,
    DIRECT_URL: db,
    NEXT_PUBLIC_SUPABASE_URL: api,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SERVICE_ROLE_KEY,
    NEXT_PUBLIC_APP_URL: APP,
    BOOKING_ACTIVE: "false",
    VEDLIKEHOLD: "0",
  };

  await kjor("npx", ["tsx", "scripts/p0-test-seed-hq.ts"], felles);
  lastEnvFil(CREDS_FIL);
  for (const [navn, verdi] of Object.entries(process.env)) {
    if (navn.startsWith("P0_")) felles[navn] = verdi;
  }

  try {
    execFileSync("lsof", ["-ti", `tcp:${HQ_APP_PORT}`], { encoding: "utf8" })
      .split("\n")
      .filter(Boolean)
      .forEach((pid) => {
        try { process.kill(Number(pid), "SIGTERM"); } catch { /* allerede borte */ }
      });
    await new Promise((r) => setTimeout(r, 1500));
  } catch {
    // Ingen prosess på porten.
  }

  const nextLog = [];
  const next = spawn("npx", ["next", "dev", "-H", "127.0.0.1", "-p", HQ_APP_PORT], {
    cwd: rot,
    env: { ...felles, NODE_OPTIONS: "--max-old-space-size=8192" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  next.stdout.on("data", (b) => nextLog.push(String(b)));
  next.stderr.on("data", (b) => nextLog.push(String(b)));
  const stopp = () => {
    if (!next.killed) next.kill("SIGTERM");
  };
  process.on("exit", stopp);
  try {
    await ventPaUrl(APP, 180_000);
    await ventPaUrl(`${APP}/auth/login`, 120_000);
    await kjor(
      "npx",
      ["playwright", "test", "-c", "tests/p0/playwright.config.ts", "--project=chromium"],
      {
        ...felles,
        PLAYWRIGHT_BASE_URL: APP,
        CI: process.env.CI ?? "",
      },
    );
  } catch (error) {
    process.stderr.write(nextLog.slice(-60).join(""));
    throw error;
  } finally {
    stopp();
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
