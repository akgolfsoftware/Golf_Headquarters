import { chromium } from "playwright";

const URL = "http://localhost:3100/playerhq-preview/marketing-forside";
const browser = await chromium.launch();

async function shoot(path, width, height, dpr) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: dpr,
  });
  // Pre-accept cookies so the banner never renders.
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("ak_cookie_consent", "all");
      document.cookie = "ak_cookie_consent=all; path=/; SameSite=Lax";
    } catch {}
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 45000 });
  // Fallback: if banner still shown, click "Godta alle".
  try {
    const btn = page.getByRole("button", { name: /Godta alle/i });
    if (await btn.isVisible({ timeout: 1000 })) await btn.click();
  } catch {}
  // Remove Next.js dev portal ("N Issue" badge / error overlay).
  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal").forEach((el) => el.remove());
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path, fullPage: true });
  console.log("OK   " + path);
  await ctx.close();
}

await shoot("/tmp/mk-forside-mobil.png", 430, 932, 2);
await shoot("/tmp/mk-forside-desktop.png", 1280, 900, 1);

await browser.close();
