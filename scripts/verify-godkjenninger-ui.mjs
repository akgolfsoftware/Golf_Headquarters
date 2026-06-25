/**
 * Browser evidence for /admin/godkjenninger (verification plan step 4).
 * Requires: dev server on localhost:3000 + BETA_USER_PASSWORDS in .env.local
 */
import { config } from "dotenv";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

config({ path: ".env.local" });

const SCRATCH =
  process.env.SCRATCH ??
  "/var/folders/nw/zq6jwb211dn7q6rbv5vr1bwh0000gn/T/grok-goal-3410cbd91df7/implementer";
const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

const lines = [];
function log(...args) {
  const line = args.join(" ");
  console.log(line);
  lines.push(line);
}

function coachCredentials() {
  const raw = process.env.BETA_USER_PASSWORDS;
  if (raw) {
    try {
      const map = JSON.parse(raw);
      const email =
        Object.keys(map).find((e) => e.includes("anders")) ??
        Object.keys(map)[0];
      if (email && map[email]) return { email, password: map[email] };
    } catch {
      /* fall through */
    }
  }
  // Dokumentert seed-bruker (scripts/seed-screentest-coach.ts)
  return { email: "coachtest@akgolf.test", password: "Screentest123!" };
}

async function main() {
  log("=== UI verification: /admin/godkjenninger ===");
  log("BASE:", BASE);

  const creds = coachCredentials();
  log("Using coach login:", creds.email);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const responses = [];

  page.on("response", (res) => {
    const url = res.url();
    if (url.includes("/admin/godkjenninger") || url.includes("_next")) {
      responses.push(`${res.status()} ${url.slice(0, 120)}`);
    }
  });

  try {
    await page.goto(`${BASE}/auth/login`, { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', creds.email);
    await page.fill('input[type="password"]', creds.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|portal)/, { timeout: 20000 });

    log("Logged in as:", creds.email);

    await page.goto(`${BASE}/admin/godkjenninger`, { waitUntil: "networkidle" });
    const title = await page.title();
    const bodyText = await page.locator("body").innerText();
    log("Page title:", title);
    log("Body contains 'Godkjenninger':", bodyText.includes("Godkjenninger"));
    log("Body contains 'PYRAMID' or 'Juster':", /PYRAMID|Juster/i.test(bodyText));

    await mkdir(SCRATCH, { recursive: true });
    const shot = join(SCRATCH, "godkjenninger-list.png");
    await page.screenshot({ path: shot, fullPage: true });
    log("Screenshot:", shot);

    const detailLink = page.locator('a[href*="/admin/godkjenninger/"]').first();
    if (await detailLink.count()) {
      const href = await detailLink.getAttribute("href");
      log("Opening detail:", href);
      await detailLink.click();
      await page.waitForLoadState("networkidle");
      const detailShot = join(SCRATCH, "godkjenninger-detail.png");
      await page.screenshot({ path: detailShot, fullPage: true });
      log("Detail screenshot:", detailShot);
      const detailText = await page.locator("body").innerText();
      log("Detail has signal/diff keywords:", /signal|diff|før|etter|analyse/i.test(detailText));
    }

    log("Sample responses:", responses.slice(0, 8).join("\n"));
    log("PASS UI smoke");
  } catch (err) {
    log("FAIL UI:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  } finally {
    await browser.close();
    await writeFile(join(SCRATCH, "godkjenninger-ui.log"), lines.join("\n"));
    const existing = await import("node:fs/promises").then((fs) =>
      fs.readFile(join(SCRATCH, "godkjenninger-evidence.txt"), "utf8").catch(() => ""),
    );
    await writeFile(
      join(SCRATCH, "godkjenninger-evidence.txt"),
      `${existing}\n\n--- UI BROWSER EVIDENCE ---\n${lines.join("\n")}`,
    );
  }
}

main();