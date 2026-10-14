import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { gotoAndWait } from "./_helpers";

const ROLES = [
  "central_admin",
  "school_leader",
  "principal",
  "head_of_sports",
  "sports_director",
  "coach",
  "student",
  "guardian",
  "club_coach",
  "readonly",
] as const;

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "mobil", width: 390, height: 844 },
] as const;

async function inspectRolePreview(page: Page, role: (typeof ROLES)[number]) {
  const path = `/team-wang/demo/roller?rolle=${role}`;
  const response = await gotoAndWait(page, path);

  expect(response?.status(), `${path} skal svare 200`).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Ingen tilgang er gitt.", { exact: false })).toBeVisible();

  const layout = await page.evaluate(() => {
    const interactiveElements = Array.from(
      document.querySelectorAll<HTMLElement>("a, button, input, select, textarea"),
    ).filter((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    });

    return {
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      undersized: interactiveElements
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            label: element.innerText.trim() || element.getAttribute("aria-label") || element.tagName,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
        })
        .filter(({ width, height }) => width < 44 || height < 44),
    };
  });

  expect(
    layout.scrollWidth,
    `${path} skal ikke ha vannrett overflyt`,
  ).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.undersized, `${path} skal ha minst 44 piksler store trykkflater`).toEqual([]);

  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => {
    const element = document.activeElement;
    if (!(element instanceof HTMLElement)) return null;
    const style = getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
    };
  });

  expect(focus, `${path} skal flytte fokus med Tab`).not.toBeNull();
  expect(focus?.outlineStyle, `${path} skal ha synlig fokusramme`).not.toBe("none");
  expect(focus?.outlineWidth, `${path} skal ha minst 3 piksler fokusramme`).toBeGreaterThanOrEqual(3);

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
    .analyze();
  const blocking = results.violations.filter(
    (violation) => violation.impact === "critical" || violation.impact === "serious",
  );

  expect(
    blocking,
    `${path} har alvorlige tilgjengelighetsbrudd: ${blocking
      .map((violation) => `${violation.id} (${violation.nodes.length})`)
      .join(", ")}`,
  ).toHaveLength(0);
}

test.describe("WANG rolleforhåndsvisning — responsiv tilgjengelighet", () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.name}: alle ti roller`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const consoleErrors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });

      for (const role of ROLES) await inspectRolePreview(page, role);

      expect(consoleErrors, `${viewport.name} skal ikke skrive konsollfeil`).toEqual([]);
    });
  }
});
