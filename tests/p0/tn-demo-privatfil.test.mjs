/**
 * Syntetisk test av scripts/tn-demo-lokal-privatfil.mjs — kun mot en egen,
 * midlertidig temp-mappe med dummyverdier. Rører ALDRI de ekte lokale
 * cred-/statusfilene (/tmp/ak-hq-tn-demo-creds.env osv.) eller den kjørende
 * demoen. Kjøres med plain `node --test`, ingen Next/Prisma-avhengighet.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import fs, { mkdtempSync, rmSync, writeFileSync, symlinkSync, statSync, chmodSync, readFileSync, existsSync, mkdirSync, linkSync } from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { skrivPrivatFil, renFeilmelding } from "../../scripts/tn-demo-lokal-privatfil.mjs";

function nyTempMappe() {
  return mkdtempSync(join(tmpdir(), "tn-demo-privatfil-test-"));
}

test("skrivPrivatFil setter 0600 på en helt ny fil", () => {
  const dir = nyTempMappe();
  try {
    const sti = join(dir, "ny.env");
    skrivPrivatFil(sti, "DUMMY_KEY=dummy-verdi-ikke-en-ekte-hemmelighet\n");
    const modus = statSync(sti).mode & 0o777;
    assert.equal(modus, 0o600);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("skrivPrivatFil strammer inn en EKSISTERENDE fil FØR truncation og skriving", (t) => {
  const dir = nyTempMappe();
  const opprinneligTruncate = fs.ftruncateSync;
  const opprinneligSkriv = fs.writeFileSync;
  try {
    const sti = join(dir, "los.env");
    writeFileSync(sti, "GAMMEL=verdi\n", { mode: 0o644 });
    assert.equal(statSync(sti).mode & 0o777, 0o644, "forutsetning: filen startet løs");
    let sjekketTruncate = false;
    let sjekketSkriving = false;
    t.mock.method(fs, "ftruncateSync", (fd, lengde) => {
      assert.equal(fs.fstatSync(fd).mode & 0o777, 0o600, "0600 må gjelde før gammelt innhold fjernes");
      assert.equal(readFileSync(sti, "utf8"), "GAMMEL=verdi\n");
      sjekketTruncate = true;
      return opprinneligTruncate(fd, lengde);
    });
    t.mock.method(fs, "writeFileSync", (fd, ...args) => {
      assert.equal(fs.fstatSync(fd).mode & 0o777, 0o600, "0600 må gjelde før nytt innhold skrives");
      sjekketSkriving = true;
      return opprinneligSkriv(fd, ...args);
    });
    syncBuiltinESMExports();
    skrivPrivatFil(sti, "NY_DUMMY=annen-dummy-verdi\n");
    assert.ok(sjekketTruncate && sjekketSkriving);
    assert.equal(readFileSync(sti, "utf8"), "NY_DUMMY=annen-dummy-verdi\n");
    const modus = statSync(sti).mode & 0o777;
    assert.equal(modus, 0o600, "skrivPrivatFil skal tvinge 0600 selv når filen fantes fra før");
  } finally {
    t.mock.restoreAll();
    syncBuiltinESMExports();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("skrivPrivatFil avviser å skrive gjennom en symlink", () => {
  const dir = nyTempMappe();
  try {
    const virkeligMal = join(dir, "utenfor.env");
    writeFileSync(virkeligMal, "SKAL_IKKE_ENDRES=original\n");
    chmodSync(virkeligMal, 0o644);
    const lenke = join(dir, "lenke.env");
    symlinkSync(virkeligMal, lenke);

    assert.throws(() => skrivPrivatFil(lenke, "FORSOK_PA_SKRIVING=dummy\n"), /symlink/i);

    // Målet lenken pekte på skal være uendret — verken innhold eller rettigheter.
    const modusEtter = statSync(virkeligMal).mode & 0o777;
    assert.equal(modusEtter, 0o644, "symlink-målet skal ikke ha blitt rørt av det avviste skriveforsøket");
    assert.equal(readFileSync(virkeligMal, "utf8"), "SKAL_IKKE_ENDRES=original\n");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("skrivPrivatFil avviser en dinglende symlink uten å opprette målet", () => {
  const dir = nyTempMappe();
  try {
    const mal = join(dir, "finnes-ikke.env");
    const lenke = join(dir, "dinglende.env");
    symlinkSync(mal, lenke);
    assert.throws(() => skrivPrivatFil(lenke, "DUMMY=verdi\n"), /symlink/i);
    assert.equal(existsSync(mal), false);
    assert.ok(fs.lstatSync(lenke).isSymbolicLink());
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("skrivPrivatFil avviser en mappe uten å endre den", () => {
  const dir = nyTempMappe();
  try {
    const mappe = join(dir, "mappe");
    mkdirSync(mappe, { mode: 0o755 });
    assert.throws(() => skrivPrivatFil(mappe, "DUMMY=verdi\n"));
    assert.ok(statSync(mappe).isDirectory());
    assert.equal(statSync(mappe).mode & 0o777, 0o755);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("skrivPrivatFil avviser FIFO uten å henge", () => {
  const dir = nyTempMappe();
  try {
    const fifo = join(dir, "pipe");
    const opprett = spawnSync("mkfifo", [fifo], { encoding: "utf8", timeout: 2000 });
    assert.equal(opprett.status, 0);
    const helper = new URL("../../scripts/tn-demo-lokal-privatfil.mjs", import.meta.url).href;
    // Egen prosess med tidsgrense gjør regresjon til blokkerende open målbar.
    const prove = spawnSync(process.execPath, ["--input-type=module", "-e",
      `import { skrivPrivatFil } from ${JSON.stringify(helper)}; try { skrivPrivatFil(process.argv[1], 'DUMMY'); process.exitCode = 1; } catch { process.exitCode = 0; }`, fifo],
    { encoding: "utf8", timeout: 2000 });
    assert.equal(prove.error, undefined, "FIFO må avvises uten tidsavbrudd");
    assert.equal(prove.status, 0);
    assert.ok(statSync(fifo).isFIFO());
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("skrivPrivatFil avviser ekstra hardlenke uten å endre innhold eller rettigheter", () => {
  const dir = nyTempMappe();
  try {
    const mal = join(dir, "original.env");
    writeFileSync(mal, "BEVAR=original\n", { mode: 0o644 });
    const lenke = join(dir, "hardlenke.env");
    linkSync(mal, lenke);
    assert.throws(() => skrivPrivatFil(lenke, "DUMMY=ny\n"), /hardlenker/);
    assert.equal(readFileSync(mal, "utf8"), "BEVAR=original\n");
    assert.equal(statSync(mal).mode & 0o777, 0o644);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("renFeilmelding fjerner en Postgres-URL med brukernavn:passord", () => {
  const feil = new Error("connect ECONNREFUSED postgresql://dummybruker:dummyhemmelighet@127.0.0.1:54422/postgres");
  const renset = renFeilmelding(feil);
  assert.ok(!renset.includes("dummyhemmelighet"), "det dummy-passordlignende segmentet skal være fjernet");
  assert.ok(renset.includes("[URL med akkreditiv fjernet]"));
});

test("renFeilmelding fjerner en JWT-aktig nøkkel", () => {
  const dummyJwt = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiZHVtbXkifQ.dummysignaturikkeenektenokkel";
  const feil = new Error(`Ugyldig nøkkel: ${dummyJwt}`);
  const renset = renFeilmelding(feil);
  assert.ok(!renset.includes(dummyJwt));
  assert.ok(renset.includes("[JWT-aktig nøkkel fjernet]"));
});

test("renFeilmelding lar vanlig, ikke-sensitiv feiltekst stå uendret", () => {
  const feil = new Error("Fant ingen fungerende lokal Supabase CLI");
  assert.equal(renFeilmelding(feil), "Fant ingen fungerende lokal Supabase CLI");
});
