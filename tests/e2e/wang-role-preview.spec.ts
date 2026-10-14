import { expect, test } from "@playwright/test";

import { expectNoConsoleErrors } from "./_helpers";

const ROLE_PREVIEWS = [
  { role: "central_admin", heading: "Hele WANG i ett bilde", name: "Fiktiv sentral administrator" },
  { role: "school_leader", heading: "Skoleoversikt", name: "Fiktiv skoleleder" },
  { role: "principal", heading: "Skoleoversikt", name: "Fiktiv rektor" },
  { role: "head_of_sports", heading: "Skoleoversikt", name: "Fiktiv toppidrettssjef" },
  { role: "sports_director", heading: "Idrettsoversikt", name: "Fiktiv sportssjef" },
  { role: "coach", heading: "Idrettsoversikt", name: "Fiktiv trener" },
  { role: "student", heading: "Min uke", name: "Fiktiv elevutøver" },
  { role: "guardian", heading: "Elevens uke", name: "Fiktiv foresatt" },
  { role: "club_coach", heading: "Samarbeid rundt utøveren", name: "Fiktiv klubbtrener" },
  { role: "readonly", heading: "Delt oversikt", name: "Fiktiv leser" },
] as const;

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page): Promise<void> {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const sizes = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.viewportWidth + 1);
}

test.describe("WANG rolleforhåndsvisning", () => {
  test("alle ti roller viser riktig, fiktivt og avgrenset omfang", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const stopConsoleCheck = expectNoConsoleErrors(page);

    for (const preview of ROLE_PREVIEWS) {
      const response = await page.goto(`/team-wang/demo/roller?rolle=${preview.role}`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { name: preview.heading, level: 1 })).toBeVisible();
      await expect(page.getByText(preview.name, { exact: true })).toBeVisible();
      await expect(page.getByText("Forhåndsvisning med fiktiv rolle og uten personopplysninger. Ingen tilgang er gitt.", { exact: true })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }

    stopConsoleCheck();
  });

  test("rollevisningene fungerer på mobil uten overflyt", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const preview of ROLE_PREVIEWS) {
      await page.goto(`/team-wang/demo/roller?rolle=${preview.role}`);
      await expect(page.getByRole("heading", { name: preview.heading, level: 1 })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });

  test("tastaturfokus er tydelig på rollevisningen", async ({ page }) => {
    await page.goto("/team-wang/demo/roller?rolle=central_admin");
    await page.keyboard.press("Tab");

    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
    const outlineWidth = await focused.evaluate((element) => getComputedStyle(element).outlineWidth);
    expect(Number.parseFloat(outlineWidth)).toBeGreaterThanOrEqual(3);
  });
});
