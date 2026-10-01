import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig({
  ...base,
  testMatch: "round-draft.spec.ts",
  projects: [
    ...(base.projects ?? []),
    { name: "webkit", use: { browserName: "webkit", viewport: { width: 390, height: 844 } } },
  ],
});
