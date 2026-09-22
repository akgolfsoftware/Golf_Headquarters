import { expect, test } from "@playwright/test";

import { expectNoConsoleErrors, gotoAndWait } from "./_helpers";

/**
 * Markedsflaten på AK Golf-masteren: hver side rendrer uten konsollfeil,
 * uten horisontal overflow, med merkets grunnfarge og font, på 390 og 1440.
 * Mønster: scripts/check-ak-golf-kits.mjs (samme måling på kitene).
 * Utvid SIDER etter hvert som sider porteres — alle 22 skal stå her til slutt.
 * Plan: docs/planer/design/2026-09-04-marked-ak-golf-port.md.
 */

/* «/» står ikke her: forsiden ble den mørke, filmatiske tegningen 22.09.2026.
   Den tegner sitt eget skall, har sin egen palett og bærer ingen `.ak-marked`.
   «/forside-ak» var forhåndsvisningen av kitets forside og er slettet. */
const SIDER = ["/coaching", "/junior", "/priser", "/om-oss", "/kontakt", "/vilkar"];
const BREDDER = [390, 1440] as const;

for (const sti of SIDER) {
  for (const bredde of BREDDER) {
    test(`${sti} på ${bredde}: masterens palett, ingen overflow`, async ({ page }) => {
      await page.setViewportSize({ width: bredde, height: 900 });
      const stopp = expectNoConsoleErrors(page);
      await gotoAndWait(page, sti);

      const skall = page.locator(".ak-marked").first();
      await expect(skall).toBeVisible();

      const maalt = await skall.evaluate((el) => {
        const cs = getComputedStyle(el);
        return {
          grunn: cs.getPropertyValue("--ak-grunn").trim().toUpperCase(),
          font: cs.fontFamily,
          overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        };
      });
      expect(maalt.grunn).toBe("#E8E4DC");
      expect(maalt.font).toMatch(/IBM Plex Sans/);
      expect(maalt.overflow).toBe(false);
      stopp();
    });
  }
}
