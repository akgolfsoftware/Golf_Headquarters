import base from "./playwright.config";
const config = { ...base, testMatch: ["booking-scope.spec.ts", "group-read-scope.spec.ts"], projects: [...base.projects!, { name: "webkit-mobil", use: { browserName: "webkit" as const, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }] };
export default config;
