/**
 * npx tsx --conditions=react-server --test src/lib/agencyos/precision-ia.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { AOS_GRUPPER, AOS_HURTIG, AOS_MER, aktivtAosId, synligeGrupper, synligeMer } from "./precision-ia";

const finnesSide = (href: string) => {
  const rel = href.replace(/^\/admin/, "");
  return ["", "/(legacy)"].some((g) => existsSync(`src/app/admin${g}${rel}/page.tsx`));
};

describe("AgencyOS-menyen (variant C, 16.10)", () => {
  it("har tre grupper med punktene i riktig rekkefølge", () => {
    assert.deepEqual(
      AOS_GRUPPER.map((g) => [g.label, g.punkter.map((p) => p.label)]),
      [
        ["Daglig", ["Cockpit", "Innboks", "Kalender"]],
        ["Spillere", ["Stall", "Workbench", "Grupper", "Tester"]],
        ["Drift", ["Booking", "Økonomi", "Oppsett"]],
      ],
    );
    assert.deepEqual(AOS_MER.map((m) => m.label), ["Booking", "Grupper", "Tester", "Økonomi", "Oppsett"]);
    assert.equal(AOS_HURTIG.length, 5);
  });

  it("hver lenke peker på en side som finnes", () => {
    const alle = [...AOS_GRUPPER.flatMap((g) => g.punkter), ...AOS_MER, ...AOS_HURTIG, { label: "Mer", href: "/admin/mer" }];
    for (const m of alle) assert.ok(finnesSide(m.href), `${m.label}: ${m.href}`);
  });

  it("Økonomi vises bare for head coach", () => {
    const har = (head: boolean) => synligeGrupper(head).some((g) => g.punkter.some((p) => p.id === "okonomi"));
    assert.ok(har(true));
    assert.ok(!har(false));
    assert.ok(synligeMer(true).some((m) => m.id === "okonomi"));
    assert.ok(!synligeMer(false).some((m) => m.id === "okonomi"));
  });

  it("Data Golf er ikke i menyen før DG-01 finnes i AgencyOS", () => {
    const labels = AOS_GRUPPER.flatMap((g) => g.punkter.map((p) => p.label));
    assert.ok(!labels.includes("Data Golf"));
  });

  it("lengste treff vinner", () => {
    assert.equal(aktivtAosId("/admin/agencyos"), "cockpit");
    assert.equal(aktivtAosId("/admin/agencyos/okonomi"), "okonomi");
    assert.equal(aktivtAosId("/admin/spillere/abc/plan"), "stall");
    assert.equal(aktivtAosId("/admin/plan-templates/x"), "workbench");
    assert.equal(aktivtAosId("/admin/bookinger/ny"), "booking");
    assert.equal(aktivtAosId("/admin/mer"), null);
    assert.equal(aktivtAosId("/admin/planleggeX"), null);
  });
});
