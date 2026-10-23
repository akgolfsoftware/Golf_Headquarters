import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";
import { AK_PROFIL_SCOPE, AK_PROFIL_VERSJON } from "./ak-profil-regler";
let calls = 0, used = 0, found = true;
let fingerprint = "a".repeat(64);
let grunnlag = true;
let duplicate = false;
const scope = { id: { in: ["player"] }, role: "PLAYER", deletedAt: null };
mock.module("./ak-gruppeoppdrag", { namedExports: { medAkGruppeoppdrag: async (_job: unknown, callback: (...args: unknown[]) => Promise<unknown>, proof: boolean) => {
  calls++;
  assert.equal(proof, true);
  const row = { spillerId: "player", gruppeId: "group", fingeravtrykk: fingerprint };
  return callback({ user: { findFirst: async () => found ? { id: "player" } : null } }, scope, grunnlag ? duplicate ? [row, row] : [row] : []);
} } });
const job = { gruppeId: "group", coachId: "coach" };
const use = async (_tx: unknown, where: unknown) => { used++; assert.deepEqual(where, { AND: [scope, { id: "player" }] }); return "synthetic"; };
beforeEach(() => { calls = 0; used = 0; found = true; grunnlag = true; duplicate = false; fingerprint = "a".repeat(64); });

test("capture and subsequent use require scoped callback and unchanged proof", async () => {
  const { hentMedAkProfilBevis, brukMedSammeAkProfilBevis } = await import("./ak-profil-mellomlagring");
  const captured = await hentMedAkProfilBevis(job, "player", use);
  assert.ok(captured);
  assert.equal(captured.verdi, "synthetic");
  assert.equal(captured.bevis.scope, AK_PROFIL_SCOPE);
  assert.deepEqual(await brukMedSammeAkProfilBevis(job, "player", captured.bevis, use), { verdi: "synthetic" });
  fingerprint = "b".repeat(64);
  assert.equal(await brukMedSammeAkProfilBevis(job, "player", captured.bevis, use), null);
  assert.equal(used, 2);
});

test("malformed, mismatched or legacy evidence is denied before database callback", async () => {
  const { brukMedSammeAkProfilBevis } = await import("./ak-profil-mellomlagring");
  const valid = { versjon: 1, scope: AK_PROFIL_SCOPE, tekstVersjon: AK_PROFIL_VERSJON, ...job, spillerId: "player", fingeravtrykk: fingerprint };
  for (const proof of [null, undefined, {}, { ...valid, spillerId: "other" }, { ...valid, gruppeId: "other" },
    { ...valid, coachId: "other" }, { ...valid, tekstVersjon: "old" }, { ...valid, versjon: 2 },
    { ...valid, scope: "AK_GOLF_GRUPPEANALYSE" }, { ...valid, fingeravtrykk: "bad" }, { ...valid, unexpected: true }]) {
    assert.equal(await brukMedSammeAkProfilBevis(job, "player", proof, use), null);
  }
  assert.equal(calls, 0); assert.equal(used, 0);
});

test("missing, ambiguous and removed player never reaches content callback", async () => {
  const { hentMedAkProfilBevis } = await import("./ak-profil-mellomlagring");
  grunnlag = false;
  assert.equal(await hentMedAkProfilBevis(job, "player", use), null);
  grunnlag = true; duplicate = true;
  assert.equal(await hentMedAkProfilBevis(job, "player", use), null);
  duplicate = false; found = false;
  assert.equal(await hentMedAkProfilBevis(job, "player", use), null);
  assert.equal(await hentMedAkProfilBevis(job, "other", use), null);
  assert.equal(await hentMedAkProfilBevis(job, " player ", use), null);
  assert.equal(used, 0);
});
