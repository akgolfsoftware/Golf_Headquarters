import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "dotenv";
import { selectPasswordLogin, dismissCookieBanner } from "../e2e/_auth-helpers";
import { createClient } from "@supabase/supabase-js";

const users = parse(readFileSync(resolve(__dirname, "../../.codex/environments/brukere/.env.users")));

function credential(key: string) {
  const email = users[`LOCAL_${key}_EMAIL`];
  const password = users[`LOCAL_${key}_PASSWORD`];
  if (!email?.endsWith("@akgolf.test") || !password) {
    throw new Error("Mangler isolert syntetisk testkonto. Kjør lokal seed først.");
  }
  return { email, password };
}

async function login(page: Page, key: string, destination: RegExp) {
  const account = credential(key);
  await page.goto("/auth/login");
  await selectPasswordLogin(page);
  await page.locator('input[type="email"]').fill(account.email);
  await page.locator('input[type="password"]').fill(account.password);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(destination);
}

async function requestLocalEmail(page: Page, key: string) {
  const { email } = credential(key);
  const mailbox = "http://127.0.0.1:55624/api/v1";
  const before = await (await page.request.get(`${mailbox}/messages`)).json();
  const previous = new Set(before.messages.map((message: { ID: string }) => message.ID));
  await page.goto("/auth/login");
  await page.locator('input[type="email"]').fill(email);
  await page.getByRole("button", { name: "Send magisk innloggingslenke", exact: true }).click();
  await expect(page.locator("#kode-input-0")).toBeVisible();
  let messageId: string | undefined;
  await expect.poll(async () => {
    const inbox = await (await page.request.get(`${mailbox}/messages`)).json();
    const message = inbox.messages.find((item: { ID: string; To: { Address: string }[] }) =>
      !previous.has(item.ID) && item.To.some(recipient => recipient.Address === email));
    messageId = message?.ID;
    return Boolean(messageId);
  }).toBe(true);
  // Koden og lenken blir bare i minnet; trace og skjermbilder er av.
  return (await page.request.get(`${mailbox}/message/${messageId}`)).json() as Promise<{ Text: string; HTML: string }>;
}

test.beforeEach(async ({ context }) => {
  // Ingen nettleserkall til ekte e-post, betaling, analyse eller andre skytjenester.
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1" && ["3061", "55621"].includes(url.port)) {
      await route.continue();
    } else {
      await route.abort();
    }
  });
});

test("utlogget bruker stenges ute fra administrasjon", async ({ page }) => {
  await page.goto("/admin/agencyos");
  await expect(page).toHaveURL(/\/auth\/login/);
  const response = await page.request.get("/api/admin/search?q=Testspiller");
  expect(response.status()).toBe(403);
});

test("spiller med gruppetilgang ser egen økt, men ikke administrasjon", async ({ page }) => {
  await login(page, "P01", /\/portal$/);
  await page.goto(`/portal/live/${users.LOCAL_P01_SESSION_ID}/brief`);
  await expect(page.getByText("Lokal syntetisk slagøkt", { exact: true })).toBeVisible();
  await page.goto("/admin/agencyos");
  await expect(page).toHaveURL(/\/portal$/);
  expect((await page.request.get("/api/admin/search?q=Testspiller")).status()).toBe(403);
});

test("talentspiller får startsiden, men ikke full treningsplanlegging", async ({ page }) => {
  await login(page, "P02", /\/portal$/);
  await page.goto("/portal/planlegge/workbench");
  await expect(page).toHaveURL(/\/portal\/oppgrader\?fra=laast$/);
});

test("annen spiller får ikke lese den første spillerens økt", async ({ page }) => {
  await login(page, "P03", /\/portal$/);
  await page.goto(`/portal/live/${users.LOCAL_P01_SESSION_ID}/brief`);
  await expect(page).toHaveURL(/\/portal\/planlegge\/workbench$/);
  await expect(page.getByText("Lokal syntetisk slagøkt", { exact: true })).toHaveCount(0);
});

test("spiller uten foreldresamtykke blir i venterommet", async ({ page }) => {
  await login(page, "P04", /\/auth\/samtykke-venter$/);
  await page.goto("/portal/planlegge/workbench");
  await expect(page).toHaveURL(/\/auth\/samtykke-venter$/);
});

for (const [key, allowed] of [["COACH_A", ["P01", "P04"]], ["COACH_B", ["P03"]]] as const) {
  test(`${key}: riktig startside og bare egne spillere i søket`, async ({ page }) => {
    await login(page, key, /\/admin\/agencyos$/);
    const response = await page.request.get("/api/admin/search?q=Testspiller");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.players.map((player: { id: string }) => player.id).sort())
      .toEqual(allowed.map((player) => users[`LOCAL_${player}_ID`]).sort());
  });
}

test("foresatt får foreldresiden", async ({ page }) => {
  await login(page, "PARENT", /\/forelder$/);
  expect((await page.request.get("/api/admin/search?q=Testspiller")).status()).toBe(403);
});

test("feil passord gir ingen tilgang", async ({ page }) => {
  await page.goto("/auth/login");
  await selectPasswordLogin(page);
  await page.locator('input[type="email"]').fill(credential("P01").email);
  await page.locator('input[type="password"]').fill("bevisst-feil-syntetisk-passord");
  await page.locator('form button[type="submit"]').click();
  await expect(page.getByText("Feil e-post eller passord.", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/auth\/login$/);
  expect((await page.request.get("/api/admin/search?q=Testspiller")).status()).toBe(403);
});

test("utilgjengelig SMS samler ikke inn data eller gir tilgang", async ({ page }) => {
  await page.goto("/auth/login");
  await page.getByRole("button", { name: "SMS-autentisering", exact: true }).click();
  await expect(page.getByText("SMS-innlogging er ikke tilgjengelig ennå. Bruk e-post eller passord.", { exact: true })).toBeVisible();
  await expect(page.locator('input[type="tel"]')).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Fullfør innlogging", exact: true })).toHaveCount(0);
  await expect(page).toHaveURL(/\/auth\/login$/);
  expect((await page.request.get("/api/admin/search?q=Testspiller")).status()).toBe(403);
});

test("lokal Auth-kode oppretter en ekte innlogget økt", async ({ page }, testInfo) => {
  const key = testInfo.project.name === "desktop" ? "P02" : "P03";
  await requestLocalEmail(page, key);
  // Standardmalen lokalt sender bare lenke. Dette kontrollerer OTP-verifisering,
  // mens levering av en kode i produksjonsmalen fortsatt må kontrolleres separat.
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!adminKey) throw new Error("Mangler lokal Auth-administrator for OTP-prøven.");
  const auth = createClient("http://127.0.0.1:55621", adminKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const generated = await auth.auth.admin.generateLink({ type: "magiclink", email: credential(key).email });
  const code = generated.data.properties?.email_otp;
  if (generated.error || !code || !/^\d{6}$/.test(code)) throw new Error("Lokal Auth kunne ikke lage testkoden.");
  for (let i = 0; i < 6; i++) await page.locator(`#kode-input-${i}`).fill(code[i]);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/portal$/);
});

test("lokal magisk lenke veksles til trenerens innlogging", async ({ page }, testInfo) => {
  const message = await requestLocalEmail(page, testInfo.project.name === "desktop" ? "COACH_A" : "COACH_B");
  const link = message.Text.match(/http:\/\/127\.0\.0\.1:55621\/auth\/v1\/verify\?[^\s<>]+/)?.[0];
  if (!link || new URL(link).hostname !== "127.0.0.1") throw new Error("Mangler lokal verifiseringslenke.");
  await page.goto(link);
  await expect(page).toHaveURL(/\/admin\/agencyos$/);
});


test("samme spillerkonto bruker PlayerHQ, Team Norway og egen WANG-IUP", async ({ page }) => {
  await login(page, "P01", /\/portal$/);
  await dismissCookieBanner(page);
  await page.goto("/team-norway");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Denne siden finnes ikke", { exact: true })).toHaveCount(0);
  await expect(page).toHaveURL(/\/team-norway$/);
  await page.goto(`/team-wang/coach/iup/${users.LOCAL_P01_ID}`);
  await expect(page.getByText("IUP-samtale · Testspiller 01", { exact: true })).toBeVisible();
});

test("samme trenerkonto åpner egne WANG- og Team Norway-grupper", async ({ page }) => {
  await login(page, "COACH_A", /\/admin\/agencyos$/);
  for (const route of ["/team-norway", "/team-wang/coach"]) {
    await page.goto(route);
    if (route === "/team-wang/coach") {
      await expect(page.getByText("Testspiller 01", { exact: true })).toBeVisible();
    } else {
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
    await expect(page.getByText("Denne siden finnes ikke", { exact: true })).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(route + "$"));
  }
});

test("trener uten gruppemedlemskap får ikke WANG- eller Team Norway-tilgang", async ({ page }) => {
  await login(page, "COACH_B", /\/admin\/agencyos$/);
  for (const route of ["/team-norway", "/team-wang/coach"]) {
    await page.goto(route);
    await expect(page.getByText("Denne siden finnes ikke", { exact: true })).toBeVisible();
    await expect(page.getByText("Testspiller 01", { exact: true })).toHaveCount(0);
  }
});

test("Workbench håndterer nettverksfeil når øktinnhold hentes", async ({ page }) => {
  await login(page, "P01", /\/portal$/);
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  const feil: string[] = [];
  page.on("pageerror", error => feil.push(error.message));
  await page.route("**/portal/planlegge/workbench", async route => {
    if (route.request().method() === "POST" && route.request().headers()["next-action"]) {
      await route.abort("connectionfailed");
    } else {
      await route.fallback();
    }
  });
  await page.goto("/portal/planlegge/workbench");
  // The inspector is collapsed on mobile; verify the request's error state in
  // the rendered panel without opening a different session or sending writes.
  await expect(page.getByText("Kunne ikke hente øktinnhold.", { exact: true }).first()).toBeAttached();
  expect(feil).toEqual([]);
});
