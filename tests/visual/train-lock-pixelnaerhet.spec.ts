/**
 * Nattlig pixelnærhet mot Train-lock-fasiten (fase 1, økt 6 i «Komplett
 * designport», 05.09.2026). Kjøres av jobben `nattlig` i
 * .github/workflows/playwright.yml mot PROD — den er IKKE en PR-gate
 * (tests/visual/README.md: fasiten rendres fersk i samme Chromium, og
 * baseline-tallene er målt, ikke antatt).
 *
 * Én test per rad med status "kalibrert" i skjerm-mapping.ts, samme motor som
 * CLI-en (scripts/lib/train-lock-maal.mjs). Feiler når målt avvik overstiger
 * radens kalibrertAvvikPst + PIXEL_TOLERANSE_PP (default 2 prosentpoeng;
 * playwright.yml setter 5 første uke — se README §Nattlig kjøring).
 *
 * Datatilstand: CI seeder ingenting. Radenes seedScript kjøres fra
 * hovedmaskinen (idempotente), og "i dag" fryses med x-screentest-naa som i
 * CLI-en. Rader som ikke kan måles om natten står i HOPP_OVER med grunn.
 */
import { test, expect, type Browser } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import { SKJERM_MAPPING, type SkjermMapping } from "./skjerm-mapping";
import { loggInn, maalSkjerm } from "../../scripts/lib/train-lock-maal.mjs";

loadEnv({ path: ".env.local" });

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://akgolf-hq.vercel.app";
const PASSORD = process.env.SCREENTEST_PASSWORD?.trim() ?? "";
const TOLERANSE_PP = Number(process.env.PIXEL_TOLERANSE_PP ?? "2");
const UT_DIR = "tests/visual/ut/nattlig";

/**
 * KJENTE rader som IKKE kan måles i den nattlige jobben — label → hvorfor.
 * Lista skal krympe, aldri vokse uten grunn i teksten.
 */
const HOPP_OVER: Record<string, string> = {
  "PH-21c Min kurve tom iPhone":
    "Samme rute som PH-21a/b i en ANNEN datatilstand (seed-ph21-signoff-fixture.ts --tom). CI kan ikke seede om mellom radene — måles lokalt.",
};

const KALIBRERTE = SKJERM_MAPPING.filter((r) => r.status === "kalibrert");

/**
 * S3-03a/b har «/admin/spillere/<spillerId>» som rute (målt 05.09 mot «første
 * rad i /admin/spillere», PR #787). Løses på samme måte: første spillerlenke i
 * stallen, innlogget som coachtest.
 */
async function loesRute(browser: Browser, rad: SkjermMapping): Promise<string> {
  if (!rad.rute.includes("<")) return rad.rute;
  if (!rad.rute.includes("<spillerId>")) {
    throw new Error(`${rad.label}: ukjent plassholder i rute «${rad.rute}» — bare <spillerId> løses her.`);
  }
  const ctx = await browser.newContext();
  try {
    const ok = await loggInn(ctx, { base: BASE, epost: "coachtest@akgolf.test", passord: PASSORD });
    expect(ok, "Innlogging som coachtest@akgolf.test feilet (for å finne spillerId)").toBe(true);
    const side = await ctx.newPage();
    await side.goto(`${BASE}/admin/spillere`, { waitUntil: "domcontentloaded", timeout: 90_000 });
    const href = await side
      .locator('a[href^="/admin/spillere/"]:not([href$="/ny"])')
      .first()
      .getAttribute("href", { timeout: 30_000 });
    if (!href) {
      throw new Error("Fant ingen spillerlenke på /admin/spillere — er demo-stallen seedet? (npx tsx scripts/seed-screentest-coach.ts)");
    }
    return rad.rute.replace("<spillerId>", href.split("/").pop() ?? "");
  } finally {
    await ctx.close();
  }
}

test.describe("Nattlig pixelnærhet — kalibrerte riggrader", () => {
  for (const rad of KALIBRERTE) {
    test(`${rad.label} (${rad.rute}) ≤ ${rad.kalibrertAvvikPst ?? "?"} + ${TOLERANSE_PP} pp`, async ({ browser }) => {
      test.skip(!PASSORD, "SCREENTEST_PASSWORD mangler (.env.local lokalt, secret i CI)");
      test.skip(Boolean(HOPP_OVER[rad.label]), HOPP_OVER[rad.label]);
      expect(rad.kalibrertAvvikPst, `${rad.label} står som kalibrert uten kalibrertAvvikPst`).toBeDefined();

      const rute = await loesRute(browser, rad);
      const r = await maalSkjerm(browser, { ...rad, rute }, { base: BASE, passord: PASSORD, utDir: UT_DIR });
      test.info().annotations.push({
        type: "avvik",
        description: `${r.avvikPst.toFixed(2)} % (baseline ${rad.kalibrertAvvikPst} %, toleranse +${TOLERANSE_PP} pp) — ${r.filer.diff}`,
      });
      expect(
        r.avvikPst,
        `${rad.label}: ${r.avvikPst.toFixed(2)} % > ${rad.kalibrertAvvikPst} + ${TOLERANSE_PP}. Se ${r.filer.diff}. Notat i raden: ${rad.notat}`,
      ).toBeLessThanOrEqual((rad.kalibrertAvvikPst ?? 0) + TOLERANSE_PP);
    });
  }
});
