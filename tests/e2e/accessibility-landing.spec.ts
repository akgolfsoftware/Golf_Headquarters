/**
 * Smoke 8: Axe accessibility-scan på landing + auth-login.
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { gotoAndWait } from "./_helpers";

test.describe("Accessibility — offentlige sider", () => {
  test("ingen critical axe-violations på /auth/login", async ({ page }) => {
    await gotoAndWait(page, "/auth/login");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(
      critical,
      `Critical a11y-violations: ${critical.map((v) => v.id).join(", ")}`,
    ).toHaveLength(0);
  });

  test("ingen critical axe-violations på /priser", async ({ page }) => {
    const res = await gotoAndWait(page, "/priser");
    if (res?.status() !== 200) {
      test.skip();
      return;
    }

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical).toHaveLength(0);
  });
});
