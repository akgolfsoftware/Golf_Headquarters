/**
 * MASTERPLAN 15.9 — «Plan» er én adresse. Låser at de tre gamle inngangene
 * faktisk redirecter til de nye adressene, og at tilgangsgaten (ADMIN/COACH)
 * er uendret på alle tre nye sidene — en sammenslåing skal ALDRI utvide
 * tilgang (jf. `.claude/rules/beslutninger.md` §GRILLINGEN RUNDE 6, punkt 9).
 *
 * `.test.ts` (ikke `.tsx`): package.json sitt `test`-script kjører kun
 * `src/**\/*.test.ts` under `--conditions=react-server` — å importere disse
 * server-komponentene direkte ville krevd en full React-testrigg. Leser
 * derfor kildeteksten og sjekker den, samme lavrisiko-mønster som andre
 * rene `.test.ts`-filer i repoet som ikke rigger opp React.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const her = dirname(fileURLToPath(import.meta.url));
const admin = join(her, "..");

function les(rel: string): string {
  return readFileSync(join(admin, rel), "utf8");
}

test("/admin/planlegge redirecter til /admin/plan", () => {
  const kilde = les("planlegge/page.tsx");
  assert.match(kilde, /permanentRedirect\("\/admin\/plan"\)/);
});

test("/admin/plan-templates redirecter til /admin/plan/maler (index alene, ikke /ny eller /[id])", () => {
  const kilde = les("plan-templates/page.tsx");
  assert.match(kilde, /permanentRedirect\("\/admin\/plan\/maler"\)/);
});

test("/admin/teknisk-plan redirecter til /admin/plan/teknisk", () => {
  const kilde = les("teknisk-plan/page.tsx");
  assert.match(kilde, /permanentRedirect\("\/admin\/plan\/teknisk"\)/);
});

test("Plan-hub, Plan-maler og Teknisk plan har samme tilgangsgate som kildesidene (ADMIN/COACH) — ikke utvidet", () => {
  for (const rel of ["plan/page.tsx", "plan/maler/page.tsx", "plan/teknisk/page.tsx"]) {
    const kilde = les(rel);
    assert.match(
      kilde,
      /requirePortalUser\(\{\s*allow:\s*\["ADMIN",\s*"COACH"\]\s*\}\)/,
      `${rel} skal ha requirePortalUser({ allow: ["ADMIN", "COACH"] })`,
    );
  }
});

test("Plan-hubens rader inkluderer den nye Teknisk plan-raden med href til /admin/plan/teknisk", () => {
  const kilde = les("plan/page.tsx");
  assert.match(kilde, /id:\s*"tekniskplan"/);
  assert.match(kilde, /href:\s*"\/admin\/plan\/teknisk"/);
});
