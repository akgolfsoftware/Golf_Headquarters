/**
 * npx tsx --conditions=react-server --test src/lib/agencyos/precision-ia.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { AOS_HURTIG, AOS_MENY, AOS_MER, aktivtAosPunkt, synligeMer } from "./precision-ia";

const finnesSide = (href: string) => {
  const rel = href.replace(/^\/admin/, "");
  return ["", "/(legacy)"].some((g) => existsSync(`src/app/admin${g}${rel}/page.tsx`));
};

describe("AgencyOS-menyen (Precision)", () => {
  it("har menyen fra 28.09 i riktig rekkefølge", () => {
    assert.deepEqual(AOS_MENY.map((m) => m.label), ["Cockpit", "Innboks", "Stall", "Kalender", "Workbench"]);
    assert.deepEqual(AOS_MER.map((m) => m.label), ["Booking", "Grupper", "Tester", "Økonomi", "Oppsett"]);
    assert.equal(AOS_HURTIG.length, 5);
  });

  it("hver lenke peker på en side som finnes", () => {
    for (const m of [...AOS_MENY, ...AOS_MER, ...AOS_HURTIG]) assert.ok(finnesSide(m.href), `${m.label}: ${m.href}`);
  });

  it("Økonomi vises bare for head coach", () => {
    assert.ok(synligeMer(true).some((m) => m.id === "okonomi"));
    assert.ok(!synligeMer(false).some((m) => m.id === "okonomi"));
  });

  it("lengste treff vinner, og Mer-sider lyser Mer", () => {
    assert.deepEqual(aktivtAosPunkt("/admin/agencyos"), { punkt: "cockpit", mer: null });
    assert.deepEqual(aktivtAosPunkt("/admin/agencyos/okonomi"), { punkt: "mer", mer: "okonomi" });
    assert.deepEqual(aktivtAosPunkt("/admin/spillere/abc/plan"), { punkt: "stall", mer: null });
    assert.deepEqual(aktivtAosPunkt("/admin/plan-templates/x"), { punkt: "workbench", mer: null });
    assert.deepEqual(aktivtAosPunkt("/admin/bookinger/ny"), { punkt: "mer", mer: "booking" });
    assert.deepEqual(aktivtAosPunkt("/admin/planleggeX"), { punkt: null, mer: null });
  });
});
