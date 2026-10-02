import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig({
  ...base,
  testMatch: "session-brief.spec.ts",
  projects: [...base.projects!, { name: "webkit-mobil", use: {
    browserName: "webkit", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
  } }],
});
