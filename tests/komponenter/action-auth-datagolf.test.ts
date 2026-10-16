import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const checker = fileURLToPath(new URL("../../scripts/check-action-auth.mjs", import.meta.url));

function check(source: string) {
  const root = mkdtempSync(join(tmpdir(), "ak-auth-gate-"));
  try {
    for (const dir of ["src/app", "src/lib", "src/components"]) mkdirSync(join(root, dir), { recursive: true });
    writeFileSync(join(root, "src/app/actions.ts"), source);
    const result = spawnSync(process.execPath, [checker], { cwd: root, encoding: "utf8" });
    if (result.error) throw result.error;
    return { status: result.status, stderr: result.stderr };
  } finally { rmSync(root, { recursive: true, force: true }); }
}

test("Data Golf-vakten må både importeres og kalles; predikat og ubrukt import avvises", () => {
  const imported = '"use server";\nimport { krevDataGolfBruker } from "@/lib/auth/datagolf-tilgang";\n';
  assert.equal(check(imported + 'export async function lagre() { await krevDataGolfBruker("/stats"); }').status, 0);
  const unused = check(imported + 'export async function lagre() { return "uten vakt"; }');
  assert.equal(unused.status, 1);
  assert.match(unused.stderr, /importert tilgangsvakt uten kall/);
  const predicate = check('"use server";\nimport { kanSeDataGolf } from "@/lib/auth/datagolf-tilgang";\nexport async function lagre() { return kanSeDataGolf(null); }');
  assert.equal(predicate.status, 1);
  assert.match(predicate.stderr, /uten auth-import/);
  assert.equal(check('"use server";\nexport async function lagre() { return true; }').status, 1);
});
