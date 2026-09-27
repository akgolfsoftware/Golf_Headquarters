#!/usr/bin/env node
/**
 * Lokal reserve for Team Norway-demoen — starter KUN en Next-instans mot den
 * isolerte HQ-Supabase-stacken (127.0.0.1:54421/54422), på egen port 3011.
 *
 * Kjører ALDRI seed og reseeder ALDRI: dataene fra den siste beståtte
 * scripts/tn-demo-lokal-reise.mjs-kjøringen (coach, spiller, gruppe,
 * medlemskap, fullført testresultat) skal bevares urørt. Dette skriptet
 * gjør nøyaktig én ting — sikrer at appen svarer på localhost — så en
 * reserve kan åpnes rett før møtet uten noen ny testkjøring.
 *
 * Rører ikke WANG-stacken (54321–54324), leser aldri .env.local, og skriver
 * aldri hemmelige verdier til stdout/stderr.
 */
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:net";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { skrivPrivatFil, renFeilmelding } from "./tn-demo-lokal-privatfil.mjs";

const rot = join(dirname(fileURLToPath(import.meta.url)), "..");
const HQ_HOST = "127.0.0.1";
const HQ_API_PORT = "54421";
const HQ_DB_PORT = "54422";
const TN_APP_PORT = "3011";
const WANG = new Set(["54321", "54322", "54323", "54324"]);
const STACK_DIR = "/tmp/ak-hq-supabase-local";
const STATUS_FIL = "/tmp/ak-hq-tn-demo-standby.status.env";
const CREDS_FIL = "/tmp/ak-hq-tn-demo-creds.env"; // skrevet av tn-demo-lokal-seed.ts i en tidligere kjøring — leses IKKE her
const APP = `http://127.0.0.1:${TN_APP_PORT}`;

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
      const deler = versjonDeler(
        execFileSync(sti, ["--version"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim(),
      );
      return deler ? [{ sti, deler }] : [];
    } catch {
      return [];
    }
  });
  gyldige.sort((a, b) => {
    for (let i = 0; i < 3; i += 1) if (a.deler[i] !== b.deler[i]) return b.deler[i] - a.deler[i];
    return 0;
  });
  if (!gyldige[0]) throw new Error("Fant ingen fungerende lokal Supabase CLI");
  return gyldige[0].sti;
}

function krevUrl(url, felt, port) {
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
  return target;
}

function lastEnvFil(sti) {
  if (!existsSync(sti)) throw new Error(`Mangler ${sti}. Start HQ-stacken og kjør supabase status -o env dit.`);
  const env = {};
  for (const linje of readFileSync(sti, "utf8").split("\n")) {
    const treff = linje.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!treff) continue;
    env[treff[1]] = treff[2].replace(/^"|"$/g, "");
  }
  return env;
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

function oppdaterStatus(supabaseBin) {
  if (!existsSync(join(STACK_DIR, "supabase", "config.toml"))) {
    throw new Error(`Mangler ${STACK_DIR}/supabase/config.toml. Ikke bruk WANG-stacken.`);
  }
  const ut = execFileSync(supabaseBin, ["status", "-o", "env"], { cwd: STACK_DIR, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  skrivPrivatFil(STATUS_FIL, ut);
}

async function ventPaUrl(url, timeoutMs) {
  const slutt = Date.now() + timeoutMs;
  let siste = "";
  while (Date.now() < slutt) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status < 500) return true;
      siste = `HTTP ${res.status}`;
    } catch (error) {
      siste = error instanceof Error ? error.message : String(error);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  process.stderr.write(`Svarte ikke på ${url}: ${siste}\n`);
  return false;
}

/**
 * Strengere enn ventPaUrl: krever eksakt 200, ikke "alt under 500" (som også
 * ville godtatt en 404-side fra en helt annen app på samme port). Brukes der
 * svaret faktisk skal BETY "dette er innloggingssiden", ikke bare "noe svarer".
 */
async function ventPaEksakt200(url, timeoutMs) {
  const slutt = Date.now() + timeoutMs;
  let siste = "";
  while (Date.now() < slutt) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status === 200) return true;
      siste = `HTTP ${res.status}`;
    } catch (error) {
      siste = error instanceof Error ? error.message : String(error);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  process.stderr.write(`Fikk ikke HTTP 200 fra ${url}: ${siste}\n`);
  return false;
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
    if (existsSync(join(rot, navn))) {
      throw new Error(`Isolert TN-reserve krever arbeidskopi uten ${navn}; ikke last mulige live-integrasjoner. Ingen filer flyttet — stopper i stedet.`);
    }
  }
}

function systemMiljo() {
  const env = {};
  for (const navn of ["PATH", "HOME", "TMPDIR", "TMP", "TEMP", "LANG", "LC_ALL", "TERM", "USER", "LOGNAME", "SHELL", "SystemRoot"]) {
    if (process.env[navn]) env[navn] = process.env[navn];
  }
  return env;
}

async function main() {
  krevIngenAutomatiskeMiljofiler();

  const alleredeOppe = !(await portErLedig(TN_APP_PORT));
  if (alleredeOppe) {
    process.stdout.write(`Port ${TN_APP_PORT} er allerede i bruk — kontrollerer om /auth/login svarer 200.\n`);
    // NB: dette er IKKE et bevis på at det faktisk er DENNE reserven som
    // svarer — kun port + eksakt 200 på /auth/login. Et portsvar under 500
    // (den gamle sjekken) ville også godtatt en helt urelatert app som svarer
    // 404 på den stien. Vi identifiserer aldri prosesseier/arbeidskopi her,
    // og vi stopper eller dreper ALDRI en prosess basert på portnummer alene
    // — feiler kontrollen, avklares eieren manuelt.
    const ok = await ventPaEksakt200(`${APP}/auth/login`, 15_000);
    if (!ok) throw new Error(`Port ${TN_APP_PORT} er opptatt, men /auth/login svarer ikke 200. Kan ikke bekrefte at dette er reserven. Avklar eier manuelt; dreper ingen fremmed prosess.`);
    process.stdout.write(`Noe på ${APP} svarer 200 på /auth/login — sannsynligvis reserven fra en tidligere kjøring, men IKKE bekreftet identisk arbeidskopi/database.\n`);
    process.stdout.write(`Innloggingsopplysninger (lokal fil, aldri i denne loggen): ${CREDS_FIL}\n`);
    return;
  }

  const supabaseBin = finnSupabaseBin();
  if (!hqStackKjorer()) {
    process.stdout.write("Starter isolert HQ-Supabase på 54421/54422 (ingen data slettes — samme volum som forrige kjøring)\n");
    execFileSync(supabaseBin, ["start"], { cwd: STACK_DIR, stdio: "inherit" });
  } else {
    process.stdout.write("Isolert HQ-Supabase kjører allerede.\n");
  }
  oppdaterStatus(supabaseBin);
  const status = lastEnvFil(STATUS_FIL);
  const db = krevUrl(status.DB_URL, "DB_URL", HQ_DB_PORT).toString();
  const api = krevUrl(status.API_URL, "API_URL", HQ_API_PORT).origin;
  if (!status.ANON_KEY || !status.SERVICE_ROLE_KEY) throw new Error("HQ-stacken mangler nøkler i statusfilen");
  const apiKlar = await ventPaUrl(`${api}/auth/v1/health`, 30_000);
  if (!apiKlar) throw new Error("Isolert Supabase-API svarte ikke innen 30s");

  const env = {
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
    NODE_OPTIONS: "--max-old-space-size=8192",
  };

  if (!(await portErLedig(TN_APP_PORT))) throw new Error(`Port ${TN_APP_PORT} ble tatt av noe annet mens stacken startet.`);

  // Kjøres FRAKOBLET denne prosessen (detached + unref) med vilje: reserven
  // skal fortsette å svare på localhost selv om dette startskriptet avsluttes.
  // stdio er satt til "ignore" — det skrives derfor IKKE noen loggfil for
  // next dev-prosessen; feilmeldinger under kan bare vise URL/PID, aldri en
  // logsti som ikke finnes.
  const next = spawn("npx", ["next", "dev", "-H", HQ_HOST, "-p", TN_APP_PORT], {
    cwd: rot,
    env,
    detached: true,
    stdio: ["ignore", "ignore", "ignore"],
  });
  next.unref();
  skrivPrivatFil("/tmp/ak-hq-tn-demo-standby.pid", String(next.pid));

  const oppe = await ventPaUrl(APP, 180_000);
  if (!oppe) throw new Error(`Reserven svarte ikke på ${APP} innen 180s (PID ${next.pid} — ingen loggfil finnes, stdio er ignorert).`);
  const loginKlar = await ventPaEksakt200(`${APP}/auth/login`, 60_000);
  if (!loginKlar) throw new Error(`/auth/login svarte ikke med HTTP 200 på reserven (PID ${next.pid}).`);

  process.stdout.write(`\nLokal reserve klar: ${APP}\n`);
  process.stdout.write(`/auth/login bekreftet med eksakt HTTP 200.\n`);
  process.stdout.write(`Innloggingsopplysninger (lokal fil, IKKE skrevet her): ${CREDS_FIL}\n`);
  process.stdout.write(`PID (for manuell stopp senere, f.eks. \`kill $(cat /tmp/ak-hq-tn-demo-standby.pid)\`): ${next.pid}\n`);
}

main().catch((error) => {
  process.stderr.write(`${renFeilmelding(error)}\n`);
  process.exit(1);
});
