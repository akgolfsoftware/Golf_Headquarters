/**
 * Smoke 7: Axe accessibility-scan på rot-side.
 *
 * Vi kjører axe på `/` (offentlig forside) som proxy for "portal-perspektiv"
 * siden /portal krever auth. Failer kun ved critical violations.
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { gotoAndWait } from "./_helpers";

test.describe("Accessibility — portal-proxy (forside)", () => {
  test("ingen critical axe-violations på /", async ({ page }) => {
    await gotoAndWait(page, "/");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(
      critical,
      `Critical a11y-violations: ${critical.map((v) => v.id).join(", ")}`,
    ).toHaveLength(0);
  });
});
