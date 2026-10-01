import { test as base } from "@playwright/test";
export { expect } from "@playwright/test";
export type { Page, ConsoleMessage, Locator } from "@playwright/test";

/** Isolated runs never send browser traffic to production or real providers. */
export const test = base.extend<{ localNetwork: void }>({
  localNetwork: [async ({ context }, use) => {
    if (process.env.LOCAL_E2E === "1") {
      await context.route("**/*", async route => {
        const url = new URL(route.request().url());
        if (url.hostname === "127.0.0.1" && ["3061", "55621"].includes(url.port)) await route.continue();
        else await route.abort();
      });
    }
    await use();
  }, { auto: true }],
});
