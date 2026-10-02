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

test("/admin/plan-templates redirecter til /admin/plan (index alene, ikke /ny eller /[id])", () => {
  const kilde = les("plan-templates/page.tsx");
  assert.match(kilde, /permanentRedirect\("\/admin\/plan"\)/);
});

test("/admin/plan/maler redirecter til Ukemaler-fanen i Plan-hub (AG-14)", () => {
  const kilde = les("plan/maler/page.tsx");
  assert.match(kilde, /permanentRedirect\("\/admin\/plan\?fane=ukemaler"\)/);
});

test("de gamle drill-adressene sender til Øvelser-fanen i Plan-hub", () => {
  for (const rel of ["(legacy)/drills/page.tsx", "(legacy)/drills/[id]/page.tsx", "(legacy)/drills/ny/page.tsx", "drills/[id]/rediger/page.tsx"]) {
    assert.match(les(rel), /permanentRedirect\("\/admin\/plan\?fane=ovelser"\)/, rel);
  }
});

test("/admin/teknisk-plan redirecter til /admin/plan/teknisk", () => {
  const kilde = les("teknisk-plan/page.tsx");
  assert.match(kilde, /permanentRedirect\("\/admin\/plan\/teknisk"\)/);
});

test("Plan-hub, Plan-maler og Teknisk plan har samme tilgangsgate som kildesidene (ADMIN/COACH) — ikke utvidet", () => {
  for (const rel of ["plan/page.tsx", "plan/teknisk/page.tsx"]) {
    const kilde = les(rel);
    assert.match(
      kilde,
      /requirePortalUser\(\{\s*allow:\s*\["ADMIN",\s*"COACH"\]\s*\}\)/,
      `${rel} skal ha requirePortalUser({ allow: ["ADMIN", "COACH"] })`,
    );
  }
});

test("Plan-hub lenker til Teknisk plan (/admin/plan/teknisk)", () => {
  const kilde = readFileSync(join(admin, "..", "..", "components/admin/precision/AG14PlanHub.tsx"), "utf8");
  assert.match(kilde, /href="\/admin\/plan\/teknisk"/);
});
