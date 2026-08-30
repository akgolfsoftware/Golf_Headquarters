#!/usr/bin/env node
import { chromium } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { config } from "dotenv";

config({ path: path.resolve(import.meta.dirname, "../../.env.local") });

const OUT = "/tmp/ak-visuell-review/app";
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://akgolf-hq.vercel.app";
const email = process.env.E2E_COACH_EMAIL ?? "coachtest@akgolf.test";
const password = process.env.SCREENTEST_PASSWORD ?? process.env.E2E_COACH_PASSWORD ?? "";
const playerEmail = process.env.E2E_TEST_USER_EMAIL ?? "screentest@akgolf.test";
const playerPassword = process.env.E2E_TEST_USER_PASSWORD ?? process.env.SCREENTEST_PASSWORD ?? "";

fs.mkdirSync(OUT, { recursive: true });

if (!password) {
  console.log("SKIP_APP ingen SCREENTEST_PASSWORD");
  process.exit(0);
}

async function lukkCookie(page) {
  const btn = page.getByRole("button", { name: /godta|ok|nødvendig/i }).first();
  try {
    await btn.click({ timeout: 2500 });
  } catch {
    /* ingen banner */
  }
}

async function login(page, bruker, pass) {
  await page.goto(`${BASE}/auth/login`, { waitUntil: "networkidle" });
  await lukkCookie(page);
  await page.locator('input[type="email"], input[name="email"]').first().fill(bruker);
  await page.locator('input[type="password"], input[name="password"]').first().fill(pass);
  await page.getByRole("button", { name: /logg inn|fortsett/i }).first().click();
  await page.waitForURL((u) => !u.pathname.includes("/auth/login"), { timeout: 20000 });
}

async function shot(page, id, w, h) {
  await page.setViewportSize({ width: w, height: h });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, `${id}.png`), type: "png", fullPage: false });
  console.log("app", id);
}

const browser = await chromium.launch({ headless: true });

try {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  if (playerPassword) {
    await login(page, playerEmail, playerPassword);
    await page.goto(`${BASE}/portal`, { waitUntil: "networkidle" });
    await lukkCookie(page);
    await shot(page, "idag-telefon", 390, 844);
    await shot(page, "idag-ipad", 1180, 820);
    await shot(page, "idag-mac", 1440, 900);
    await page.goto(`${BASE}/portal/planlegge`, { waitUntil: "networkidle" });
    await shot(page, "plan-telefon", 390, 844);
    await shot(page, "plan-mac", 1440, 900);
  }
  await ctx.close();
} catch (e) {
  console.log("PLAYER_FAIL", String(e).slice(0, 200));
}

try {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await login(page, email, password);
  await page.goto(`${BASE}/admin/planlegge`, { waitUntil: "networkidle" });
  await lukkCookie(page);
  const lenke = page.locator('a[href^="/admin/workbench/"]').first();
  if (await lenke.count()) {
    const href = await lenke.getAttribute("href");
    await page.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded", timeout: 20000 });
  } else {
    await page.goto(`${BASE}/admin/agencyos`, { waitUntil: "domcontentloaded" });
  }
  await shot(page, "wb-telefon", 390, 844);
  await shot(page, "wb-ipad", 1180, 820);
  await shot(page, "wb-mac", 1440, 900);
  await ctx.close();
} catch (e) {
  console.log("COACH_FAIL", String(e).slice(0, 200));
}

await browser.close();
