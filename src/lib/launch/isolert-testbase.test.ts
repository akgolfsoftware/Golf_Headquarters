import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  kanDroppeRestoreKlon,
  kanRulleTilbakeProduksjon,
  krevIsolertLaunchUrl,
  LAUNCH_TEST_DB_NAME,
} from "./isolert-testbase";

const tillatt =
  "postgresql://test:test@127.0.0.1:54379/ak_hq_launch_tests";

test("krevIsolertLaunchUrl avviser tom og ugyldig URL", () => {
  assert.throws(() => krevIsolertLaunchUrl(undefined), /production defaults are forbidden/);
  assert.throws(() => krevIsolertLaunchUrl(""), /production defaults are forbidden/);
  assert.throws(() => krevIsolertLaunchUrl("ikke-en-url"), /not a valid URL/);
});

test("krevIsolertLaunchUrl avviser produksjon og feil loopback", () => {
  assert.throws(
    () =>
      krevIsolertLaunchUrl(
        "postgresql://postgres.prod:hemmelig@aws-1-eu-west-2.pooler.supabase.com:6543/postgres",
      ),
    /isolated loopback/,
  );
  assert.throws(
    () => krevIsolertLaunchUrl("postgresql://test:test@127.0.0.1:5432/ak_hq_launch_tests"),
    /isolated loopback/,
  );
  assert.throws(
    () => krevIsolertLaunchUrl("postgresql://test:test@127.0.0.1:54379/postgres"),
    /isolated loopback/,
  );
  assert.throws(
    () => krevIsolertLaunchUrl("postgresql://test:test@localhost:54379/ak_hq_launch_tests"),
    /isolated loopback/,
  );
});

test("krevIsolertLaunchUrl godtar kun dokumentert lokal testdatabase", () => {
  const url = krevIsolertLaunchUrl(tillatt);
  assert.equal(url.hostname, "127.0.0.1");
  assert.equal(url.port, "54379");
  assert.equal(url.pathname, "/ak_hq_launch_tests");
});

test("restore-klon kan droppes kun med avtalt prefiks, aldri kilden", () => {
  assert.equal(kanDroppeRestoreKlon("ak_hq_launch_restore_1", LAUNCH_TEST_DB_NAME), true);
  assert.equal(kanDroppeRestoreKlon(LAUNCH_TEST_DB_NAME, LAUNCH_TEST_DB_NAME), false);
  assert.equal(kanDroppeRestoreKlon("ak_hq_launch_restore_1", "postgres"), false);
  assert.equal(kanDroppeRestoreKlon("postgres", LAUNCH_TEST_DB_NAME), false);
  assert.equal(kanDroppeRestoreKlon("ak_hq_launch_restore_", LAUNCH_TEST_DB_NAME), false);
});

test("produksjonstilbakeføring krever uttrykkelig autorisasjon", () => {
  assert.equal(kanRulleTilbakeProduksjon(false), false);
  assert.equal(kanRulleTilbakeProduksjon(true), true);
});

test("integrasjonstestene leser ikke .env.local og har samme URL-vakt", () => {
  const rot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
  const backup = readFileSync(
    join(rot, "tests/integration/backup-restore.test.mjs"),
    "utf8",
  );
  const launch = readFileSync(
    join(rot, "tests/integration/launch-database.test.ts"),
    "utf8",
  );
  for (const kilde of [backup, launch]) {
    assert.equal(kilde.includes(".env.local"), false);
    assert.equal(kilde.includes("dotenv"), false);
    assert.match(kilde, /LAUNCH_TEST_DATABASE_URL/);
    assert.match(kilde, /127\.0\.0\.1/);
    assert.match(kilde, /54379/);
    assert.match(kilde, /ak_hq_launch_tests/);
  }
  assert.match(backup, /pg_dump/);
  assert.match(backup, /pg_restore/);
  assert.match(backup, /DROP DATABASE/);
  assert.match(backup, /cloneName/);
  assert.match(backup, /productionBackupTested:false/);
});
