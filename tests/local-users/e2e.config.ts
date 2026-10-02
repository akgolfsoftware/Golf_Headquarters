import { defineConfig } from "@playwright/test";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "dotenv";
import { assertLocalUsersTargets } from "../../scripts/local-users-target.mjs";
import cases from "./e2e-cases.json";

const targets = assertLocalUsersTargets(process.env);
const users = parse(readFileSync(".codex/environments/brukere/.env.users"));
for (const key of ["P01", "P02", "P03", "P04", "COACH_A", "COACH_B", "PARENT"]) {
  if (!users[`LOCAL_${key}_EMAIL`]?.endsWith("@akgolf.test") || !users[`LOCAL_${key}_PASSWORD`] || !users[`LOCAL_${key}_ID`]) {
    throw new Error(`Missing synthetic account ${key}; run local-users-run.mjs seed`);
  }
}
Object.assign(process.env, {
  LOCAL_E2E: "1",
  E2E_TEST_USER_EMAIL: users.LOCAL_P01_EMAIL,
  E2E_TEST_USER_PASSWORD: users.LOCAL_P01_PASSWORD,
  E2E_COACH_EMAIL: users.LOCAL_COACH_A_EMAIL,
  E2E_COACH_PASSWORD: users.LOCAL_COACH_A_PASSWORD,
  E2E_UNCOACHED_PLAYER_ID: users.LOCAL_P02_ID,
});
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export default defineConfig({
  testDir: "../e2e",
  testMatch: [...new Set(cases.map(c => c.file))],
  grep: cases.map(c => new RegExp(`${escape(c.title)}$`)),
  fullyParallel: false, workers: 1, retries: 0, forbidOnly: true,
  timeout: 180_000, expect: { timeout: 20_000 },
  reporter: [["list"], ["json", { outputFile: join(tmpdir(), "ak-hq-seven-account-results.json") }], ["./no-skips-reporter.ts"]],
  outputDir: join(tmpdir(), "ak-hq-seven-account-artifacts"),
  use: { baseURL: targets.app.origin, serviceWorkers: "block", trace: "off", screenshot: "off", video: "off", actionTimeout: 30_000 },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }, { name: "webkit", use: { browserName: "webkit" } }],
});
