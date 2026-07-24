/**
 * GO V6 — axe-smoke over de offentlige v2-flatene.
 *
 * Dagens a11y-dekning var to enkeltsider (`/` og `/auth/login` + `/priser`).
 * Denne sveiper resten av de auth-frie v2-flatene i én datadreven test, slik
 * at et regressivt designgrep (manglende landmark, kontrastfall, knapp uten
 * navn) fanges der det oppstår i stedet for på én tilfeldig side.
 *
 * Terskel: `critical` failer alltid. `serious` rapporteres i testtittelen når
 * den finnes, men failer ikke — flere av flatene står fortsatt på
 * overgangslaget (golfdata/v13), og en hard serious-gate her ville blokkert
 * CI på kjent, planlagt gjeld i stedet for på nye feil.
 *
 * Portal/admin krever innlogging og dekkes derfor ikke her — de går via
 * `webapp-testing`/manuell UAT til vi har en e2e-testbruker i CI.
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { gotoAndWait } from "./_helpers";

/** Auth-frie flater som skal tåle en axe-skanning. */
const FLATER = [
  { path: "/", navn: "forside" },
  { path: "/booking", navn: "booking" },
  { path: "/coacher", navn: "coacher" },
  { path: "/coaching", navn: "coaching" },
  { path: "/om-oss", navn: "om oss" },
  { path: "/kontakt", navn: "kontakt" },
  { path: "/auth/signup", navn: "registrering" },
  { path: "/auth/forgot-password", navn: "glemt passord" },
  { path: "/offline", navn: "offline-side" },
] as const;

test.describe("Accessibility — axe-smoke på v2-flater", () => {
  for (const flate of FLATER) {
    test(`ingen critical axe-violations på ${flate.path} (${flate.navn})`, async ({ page }) => {
      const res = await gotoAndWait(page, flate.path);
      const status = res?.status() ?? 0;
      // Ruter som redirigerer (auth) eller ikke finnes i dette miljøet er ikke
      // en a11y-feil — de dekkes av pages-render-smoken.
      if (status !== 200) {
        test.skip();
        return;
      }

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();

      const critical = results.violations.filter((v) => v.impact === "critical");
      const serious = results.violations.filter((v) => v.impact === "serious");
      if (serious.length > 0) {
        // Synlig i rapporten uten å felle bygget (kjent overgangsgjeld).
        test.info().annotations.push({
          type: "serious a11y",
          description: serious.map((v) => `${v.id} (${v.nodes.length})`).join(", "),
        });
      }

      expect(
        critical,
        `Critical a11y-violations på ${flate.path}: ${critical
          .map((v) => `${v.id} — ${v.help}`)
          .join(" · ")}`,
      ).toHaveLength(0);
    });
  }
});
