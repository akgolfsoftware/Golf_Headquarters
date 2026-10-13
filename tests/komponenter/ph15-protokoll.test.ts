import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
mock.module("server-only", { defaultExport: {} });

for (const file of ["precision-komponenter.css", "precision-athletics.css", "precision-player-coach-upgrade.css"]) mock.module(`@/styles/${file}`, { namedExports: {} });
mock.module("next/navigation", { namedExports: { useRouter: () => ({ push() {}, refresh() {} }), unstable_rethrow: () => {} } });
mock.module("next/link", { defaultExport: "a" });
mock.module("@/app/portal/(fullscreen)/tren/tester/[testId]/gjennomfor/actions", { namedExports: {
  startTestSession: async () => ({ ok: true, sessionId: "syntetisk" }), lagreSteg: async () => ({ ok: true }),
  fullforTestSession: async () => ({ ok: false, error: "Ingen lagring i prøven" }), avbrytTestSession: async () => ({ ok: true }),
} });

test("PH15 beholder alle protokollfelter og valg uten standardmåling eller oppdiktet målgrense", async () => {
  const { PH15TestGjennomfor } = await import("@/components/portal/precision/PH15TestGjennomfor");
  const html = renderToStaticMarkup(createElement(PH15TestGjennomfor, {
    testId: "syntetisk-test", testNavn: "Syntetisk sammensatt test", beskrivelse: "Registrer begge feltene etter protokollen.", scoringRule: "SUM", omraade: "FYS", sist: null,
    protocol: null, gjenopptak: null, spec: { forsok: [{ nr: 1, label: "Forsøk", felter: [
      { key: "kg", type: "number", label: "Belastning", unit: "kg", min: 0, max: 300 },
      { key: "side", type: "select", label: "Side", options: ["Venstre", "Høyre"] },
    ] }] },
  }));
  assert.match(html, /Belastning/); assert.match(html, /Venstre/); assert.match(html, /Høyre/);
  assert.match(html, /aria-label="Belastning, forsøk 1"[^>]*value=""/); assert.match(html, /Registrer begge feltene/);
  assert.doesNotMatch(html, /INNENFOR 4|3,5|plassholderverdier|og IUP-en din/);
});
