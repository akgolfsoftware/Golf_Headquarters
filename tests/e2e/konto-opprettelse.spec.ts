/**
 * Kontokjeden ende til ende (nattkjøringen 17.10.2026, gruppe 2 Innlogging og oppstart):
 *
 *  1. Voksen spiller: opprett konto med e-post og passord → bekreftelseslenken fanges i lokal
 *     e-postoppsamling (Mailpit) → oppstarten i sju steg → lander i PlayerHQ.
 *  2. 14-åring: samme vei, oppgir forelderens e-post i steg 6 → kan bruke appen → dag 8 uten
 *     godkjenning låses kontoen (/auth/samtykke-venter).
 *  3. Forelderen åpner lenken, godkjenner, oppretter egen konto og fullfører forelderoppstarten →
 *     /forelder. Barnet slipper inn igjen.
 *  4. Google: knappen finnes og sender til Google (fullføres ikke i testen).
 *  5. Ingen «BankID» eller «Vipps» i skjermteksten.
 *
 * Kjøres bare mot en isolert lokal stack (LOCAL_E2E=1): egen Supabase med e-postbekreftelse på,
 * Mailpit og PostgreSQL på 127.0.0.1, og appen med de samme lokale nøklene. Alle andre adresser
 * stoppes i nettleseren. Bare syntetiske adresser (@example.test), ingen e-post til ekte personer.
 * Oppsett: docs/utvikling/konto-e2e.md.
 */
import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import pg from "pg";

const MAILPIT = process.env.KONTO_E2E_MAILPIT ?? "http://127.0.0.1:55724";
const DB_URL = process.env.KONTO_E2E_DATABASE_URL ?? "";
const PASSORD = "syntetisk-passord-17";

function erLokal(url: string) {
  try {
    return new URL(url).hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

test.skip(process.env.LOCAL_E2E !== "1" || !erLokal(DB_URL) || !erLokal(MAILPIT), "Krever isolert lokal stack (LOCAL_E2E=1, lokal database og Mailpit)");
test.describe.configure({ mode: "serial" });
test.setTimeout(240_000);

const stempel = Date.now().toString(36);
const epost = (navn: string) => `konto-${navn}-${stempel}@example.test`;

/** Bare lokale adresser slipper gjennom. Forsøk mot Google registreres og stoppes. */
const googleForsok: string[] = [];
async function lokaltNett(context: BrowserContext) {
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1" || url.hostname === "localhost") return route.continue();
    if (url.hostname === "accounts.google.com") googleForsok.push(url.href);
    return route.abort();
  });
}

async function sql<T = Record<string, unknown>>(tekst: string, verdier: unknown[] = []): Promise<T[]> {
  const klient = new pg.Client({ connectionString: DB_URL });
  await klient.connect();
  try {
    return (await klient.query(tekst, verdier)).rows as T[];
  } finally {
    await klient.end();
  }
}

/** Henter bekreftelseslenken fra Mailpit (lokal e-postoppsamling). */
async function bekreftelseslenke(til: string): Promise<string> {
  for (let i = 0; i < 30; i++) {
    const sok = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${til}"`)}`).then((r) => r.json());
    const id = sok.messages?.[0]?.ID;
    if (id) {
      const melding = await fetch(`${MAILPIT}/api/v1/message/${id}`).then((r) => r.json());
      const kilde = `${melding.HTML ?? ""}\n${melding.Text ?? ""}`.replaceAll("&amp;", "&");
      const lenke = kilde.match(/https?:\/\/127\.0\.0\.1:\d+\/auth\/v1\/verify[^"'\s<>)]+/)?.[0];
      if (lenke) return lenke;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Fant ingen bekreftelse til ${til} i Mailpit`);
}

function fodtForAar(aar: number): string {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() - aar);
  d.setUTCDate(d.getUTCDate() - 30);
  return `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${d.getUTCFullYear()}`;
}

async function ingenBankIdEllerVipps(page: Page) {
  const tekst = await page.locator("body").innerText();
  expect(tekst).not.toMatch(/BankID|Vipps/i);
}

async function opprettKonto(page: Page, navn: string, adresse: string) {
  await page.goto("/auth/signup");
  await ingenBankIdEllerVipps(page);
  await page.locator("#rn").fill(navn);
  await page.locator("#re").fill(adresse);
  await page.locator("#rp").fill(PASSORD);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Opprett konto", exact: true }).click();
  await page.waitForURL(/\/auth\/check-email/);
  await expect(page.getByRole("heading", { name: "Sjekk e-posten din" })).toBeVisible();
  await expect(page.getByText(adresse)).toBeVisible();
}

async function bekreftOgStartOppstart(page: Page, adresse: string) {
  await page.goto(await bekreftelseslenke(adresse));
  await page.waitForURL(/\/auth\/onboarding/, { timeout: 60_000 });
}

async function gjennomforOppstart(page: Page, fodt: string, forelderEpost?: string) {
  await expect(page.getByText("Steg 1 av 7")).toBeVisible();
  await page.locator("#fd").fill(fodt);
  await page.locator("#hcp").fill("12,4");
  await page.locator("#snitt").fill("86");
  await page.getByRole("button", { name: "Klubb", exact: true }).click();
  await page.getByRole("button", { name: "Neste", exact: true }).click();
  await expect(page.getByText("Steg 2 av 7")).toBeVisible();
  await page.getByRole("button", { name: "Hopp over" }).click();
  await expect(page.getByText("Steg 3 av 7")).toBeVisible();
  await page.getByRole("button", { name: "Utslag", exact: true }).click();
  await page.getByRole("button", { name: "Driving range", exact: true }).click();
  await page.getByRole("button", { name: "Fullfør senere" }).click();
  await expect(page.getByText("Steg 4 av 7")).toBeVisible();
  await page.getByRole("button", { name: "Hopp over" }).click();
  await expect(page.getByText(/Steg 5 av 7/)).toBeVisible();
  await page.getByRole("button", { name: "Hopp over" }).click();
  await expect(page.getByText("Steg 6 av 7")).toBeVisible();
  if (forelderEpost) {
    await page.locator("#fe").fill(forelderEpost);
    await page.getByRole("button", { name: "Send til forelder og fortsett" }).click();
  } else {
    await page.getByRole("button", { name: "Neste", exact: true }).click();
  }
  await expect(page.getByText("Steg 7 av 7")).toBeVisible();
  await expect(page.getByText("Anbefalt for deg")).toBeVisible();
  await page.getByRole("radio", { name: /Klubbspilleren/ }).click();
  await page.getByRole("button", { name: "Start med Klubbspilleren" }).click();
  await page.waitForURL(/\/portal/, { timeout: 60_000 });
}

test.describe("Kontokjeden", () => {
  const voksen = epost("voksen");
  const barn = epost("barn");
  const forelder = epost("forelder");

  test.beforeEach(async ({ context }) => {
    await lokaltNett(context);
  });

  test("voksen spiller: konto → e-post → sju steg → PlayerHQ", async ({ page }) => {
    await opprettKonto(page, "Syntetisk Voksen", voksen);
    await bekreftOgStartOppstart(page, voksen);
    await gjennomforOppstart(page, fodtForAar(30));
    const [rad] = await sql<{ role: string; dob: string | null; prefs: { onboarding?: { completedAt?: string } } }>(
      `select role::text, "dateOfBirth"::text as dob, preferences as prefs from users where email = $1`,
      [voksen],
    );
    expect(rad.role).toBe("PLAYER");
    expect(rad.dob).not.toBeNull();
    expect(rad.prefs.onboarding?.completedAt).toBeTruthy();
  });

  test("14-åring: kan bruke appen, låses dag 8 uten godkjenning", async ({ page }) => {
    await opprettKonto(page, "Syntetisk Barn", barn);
    await bekreftOgStartOppstart(page, barn);
    await gjennomforOppstart(page, fodtForAar(14), forelder);
    expect(page.url()).not.toMatch(/samtykke-venter/);
    const inv = await sql<{ email: string }>(
      `select i.email from parent_invitations i join users u on u.id = i."playerId" where u.email = $1`,
      [barn],
    );
    expect(inv.map((r) => r.email)).toContain(forelder);

    await sql(`update users set "createdAt" = now() - interval '8 days' where email = $1`, [barn]);
    await page.goto("/portal");
    await page.waitForURL(/\/auth\/samtykke-venter/);
    await expect(page.getByText("Venter på forelder")).toBeVisible();
  });

  test("forelder godkjenner, oppretter konto og lander i forelder; barnet slipper inn", async ({ page, browser }) => {
    const [{ token }] = await sql<{ token: string }>(
      `select i.token from parent_invitations i join users u on u.id = i."playerId" where u.email = $1 order by i."createdAt" desc limit 1`,
      [barn],
    );
    await page.goto(`/auth/guardian-consent/${token}`);
    await expect(page.getByRole("heading", { name: /vil bruke AK Golf HQ/ })).toBeVisible();
    await page.locator("#gn").fill("Syntetisk Forelder");
    await page.getByRole("checkbox", { name: /Godkjenn kontoen/ }).check();
    await page.getByRole("checkbox", { name: /Vilkår og foreldreansvar/ }).check();
    await page.getByRole("button", { name: "Godkjenn", exact: true }).click();
    await page.waitForURL(/\/auth\/signup\?rolle=forelder/);
    await expect(page.locator("#re")).toHaveValue(forelder);

    await page.locator("#rn").fill("Syntetisk Forelder");
    await page.locator("#rp").fill(PASSORD);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Opprett konto", exact: true }).click();
    await page.waitForURL(/\/auth\/check-email/);
    await page.goto(await bekreftelseslenke(forelder));
    await page.waitForURL(/\/auth\/onboarding\/forelder/, { timeout: 60_000 });
    await page.locator("#fn").fill("Syntetisk Forelder");
    await page.getByRole("button", { name: "Neste", exact: true }).click();
    for (const navn of [/treningsavtale/, /Personvern og datadeling/, /Betaling og oppsigelse/]) {
      await page.getByRole("checkbox", { name: navn }).check();
    }
    await page.getByRole("button", { name: "Til forelder" }).click();
    await page.waitForURL(/\/forelder/, { timeout: 60_000 });
    const [rel] = await sql<{ approved: boolean }>(
      `select r.approved from parent_relations r join users p on p.id = r."parentId" join users c on c.id = r."childId" where p.email = $1 and c.email = $2`,
      [forelder, barn],
    );
    expect(rel.approved).toBe(true);

    const barnKontekst = await browser.newContext();
    await lokaltNett(barnKontekst);
    const barnSide = await barnKontekst.newPage();
    await barnSide.goto("/auth/login");
    await barnSide.locator("#le").fill(barn);
    await barnSide.locator("#lp").fill(PASSORD);
    await barnSide.getByRole("button", { name: "Logg inn", exact: true }).click();
    await barnSide.waitForURL(/\/portal/, { timeout: 60_000 });
    expect(barnSide.url()).not.toMatch(/samtykke-venter/);
    await barnKontekst.close();
  });

  test("Google-knappen sender til Google, og ingen BankID eller Vipps", async ({ page }) => {
    await page.goto("/auth/login");
    await ingenBankIdEllerVipps(page);
    const google = page.getByRole("button", { name: "Logg inn med Google", exact: true });
    await expect(google).toBeVisible();
    await google.click();
    await expect.poll(() => googleForsok.length, { timeout: 30_000 }).toBeGreaterThan(0);
    expect(new URL(googleForsok[0]).searchParams.get("client_id")).toBeTruthy();
  });
});
