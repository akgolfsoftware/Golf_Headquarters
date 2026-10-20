import { readFileSync } from "node:fs";
import { isAbsolute } from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

import { WANG_SYNTHETIC_PROFILES } from "../../../src/lib/wang-supabase/synthetic-profiles";
import {
  expectedWangTestEmail,
  parseWangTestAccountInput,
} from "../../../src/lib/wang-supabase/test-account-linking";
import { WANG_ROLES, type WangRole } from "../../../src/lib/wang-supabase/types";

type Credential = {
  id: string;
  role: WangRole;
  profileKey: string;
  email: string;
  password: string;
};

function erObjekt(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const credentialsPath = process.env.WANG_TEST_CREDENTIALS_PATH?.trim() ?? "";
if (!credentialsPath || !isAbsolute(credentialsPath)) {
  throw new Error("WANG_TEST_CREDENTIALS_PATH må peke på den private, absolutte koblingsfilen.");
}
const credentialsDocument: unknown = JSON.parse(readFileSync(credentialsPath, "utf8"));
const accountInput = parseWangTestAccountInput(credentialsDocument);
if (!erObjekt(credentialsDocument) || !Array.isArray(credentialsDocument.accounts)) {
  throw new Error("Testkontofilen gjelder ikke de ti godkjente WANG-rollene.");
}
const rawAccounts = credentialsDocument.accounts;
if (rawAccounts.length !== WANG_ROLES.length) {
  throw new Error("Testkontofilen gjelder ikke de ti godkjente WANG-rollene.");
}
const credentials: Credential[] = WANG_ROLES.map((role) => {
  const matches = rawAccounts.filter((account) => erObjekt(account) && account.role === role);
  const profile = WANG_SYNTHETIC_PROFILES.find((candidate) => candidate.role === role);
  const account = matches[0];
  if (
    matches.length !== 1 ||
    !profile ||
    !erObjekt(account) ||
    account.id !== accountInput.profileIds[role] ||
    account.profileKey !== profile.profileKey ||
    account.email !== expectedWangTestEmail(profile.profileKey) ||
    typeof account.password !== "string" ||
    account.password.length < 24
  ) {
    throw new Error(`Testkontofilen har ugyldig konto for rollen ${role}.`);
  }
  return {
    id: account.id,
    role,
    profileKey: account.profileKey,
    email: account.email,
    password: account.password,
  };
});

const heading: Record<WangRole, string> = {
  central_admin: "Hele WANG i ett bilde",
  school_leader: "Skoleoversikt",
  principal: "Skoleoversikt",
  head_of_sports: "Skoleoversikt",
  sports_director: "Idrettsoversikt",
  coach: "Idrettsoversikt",
  student: "Min uke",
  guardian: "Elevens uke",
  club_coach: "Samarbeid rundt utøveren",
  readonly: "Delt oversikt",
};

const ignoredConsoleErrors = [
  /favicon/i,
  /vercel insights|speed-insights|plausible/i,
  /Failed to load resource.*(manifest|favicon)/i,
];

async function loggInn(page: Page, account: Credential): Promise<void> {
  await page.goto("/team-wang/app/logg-inn?next=/team-wang/app");
  await page.getByLabel("E-post").fill(account.email);
  await page.getByLabel("Passord").fill(account.password);
  await page.getByRole("button", { name: "Logg inn", exact: true }).click();
  await expect(page).toHaveURL(/\/team-wang\/app$/);
  await expect(page.getByRole("heading", { level: 1, name: heading[account.role] })).toBeVisible();
}

async function kontrollerSkjerm(page: Page, route: string): Promise<void> {
  const errors: string[] = [];
  const listener = (message: ConsoleMessage) => {
    if (
      message.type() === "error" &&
      !ignoredConsoleErrors.some((pattern) => pattern.test(message.text()))
    ) {
      errors.push(message.text());
    }
  };
  page.on("console", listener);
  await page.goto(route);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);

  const overflow = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth, `${route} har vannrett overflyt`).toBeLessThanOrEqual(overflow.width + 1);

  const smallTargets = await page.locator("a, button, input, select, textarea, [role='button']")
    .evaluateAll((elements) => elements.flatMap((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      if (style.visibility === "hidden" || style.display === "none" || rect.width === 0 || rect.height === 0) return [];
      if (rect.width >= 44 && rect.height >= 44) return [];
      return [`${element.tagName.toLowerCase()} ${Math.round(rect.width)}x${Math.round(rect.height)}`];
    }));
  expect(smallTargets, `${route} har synlige trykkflater under 44 × 44`).toEqual([]);

  await page.locator("body").click({ position: { x: 1, y: 1 } });
  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || active === document.body) return null;
    const style = getComputedStyle(active);
    return {
      visible: active.getClientRects().length > 0,
      outline: parseFloat(style.outlineWidth) || 0,
      shadow: style.boxShadow,
    };
  });
  expect(focus?.visible, `${route} mangler synlig første tastaturfokus`).toBe(true);
  expect(
    (focus?.outline ?? 0) >= 3 || (focus?.shadow ?? "") !== "none",
    `${route} mangler tydelig fokusmarkering`,
  ).toBe(true);

  const axe = await new AxeBuilder({ page }).analyze();
  const serious = axe.violations.filter((violation) =>
    violation.impact === "serious" || violation.impact === "critical");
  expect(serious, `${route} har alvorlige tilgjengelighetsbrudd`).toEqual([]);
  expect(errors, `${route} skrev feil i nettleserkonsollen`).toEqual([]);
  page.off("console", listener);
}

async function synligeAppRuter(page: Page): Promise<string[]> {
  const routes = await page.locator('a[href^="/team-wang/app"]').evaluateAll((links) =>
    links.map((link) => link.getAttribute("href")).filter((href): href is string => Boolean(href)));
  return [...new Set(["/team-wang/app", ...routes])];
}

test.describe.configure({ mode: "serial" });

for (const account of credentials) {
  for (const viewport of [
    { name: "desktop", width: 1280, height: 720 },
    { name: "mobil", width: 390, height: 844 },
  ]) {
    test(`${account.role} · ${viewport.name} · synlige skjermer`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await loggInn(page, account);
      const routes = await synligeAppRuter(page);
      for (const route of routes) await kontrollerSkjerm(page, route);
    });
  }

  test(`${account.role} · tilgangsmatrise`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await loggInn(page, account);
    const cases = [
      {
        route: "/team-wang/app/testprofiler",
        allowed: account.role === "central_admin",
        allowedHeading: "Sikre testprofiler",
        deniedHeading: "Bare sentral admin kan åpne testprofiler",
      },
      {
        route: "/team-wang/app/utovere",
        allowed: ["school_leader", "principal", "head_of_sports", "sports_director", "coach"].includes(account.role),
        allowedHeading: "Utøvere",
        deniedHeading: "Utøverlisten er ikke tilgjengelig for denne rollen",
      },
      {
        route: "/team-wang/app/workbench",
        allowed: ["sports_director", "coach"].includes(account.role),
        allowedHeading: "Workbench",
        deniedHeading: "Workbench er for sportssjef og trener",
      },
      {
        route: "/team-wang/app/kalender",
        allowed: !["central_admin", "readonly"].includes(account.role),
        allowedHeading: "Kalender og samlinger",
        deniedHeading: "Kalenderen er ikke delt med denne rollen",
      },
      {
        route: "/team-wang/app/meldinger",
        allowed: !["central_admin", "readonly"].includes(account.role),
        allowedHeading: "Meldinger",
        deniedHeading: "Navngitte samtaler er ikke tilgjengelige for denne rollen",
      },
    ];
    for (const item of cases) {
      await page.goto(item.route);
      await expect(page.getByRole("heading", {
        level: 1,
        name: item.allowed ? item.allowedHeading : item.deniedHeading,
      })).toBeVisible();
    }
  });
}
