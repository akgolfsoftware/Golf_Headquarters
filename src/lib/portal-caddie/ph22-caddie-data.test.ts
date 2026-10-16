import test from "node:test";
import assert from "node:assert/strict";
import {
  PH22_HURTIGSPORSMAL,
  genererCaddieEksportMarkdown,
  formaterKlokkeslett,
  harCaddieTilgang,
  type PH22CaddieMelding,
} from "./ph22-caddie-data";

test("PH22_HURTIGSPORSMAL inneholder standard treningsspørsmål", () => {
  assert.equal(PH22_HURTIGSPORSMAL.length, 4);
  assert.ok(PH22_HURTIGSPORSMAL.includes("Hva bør jeg trene på i dag?"));
  assert.ok(PH22_HURTIGSPORSMAL.includes("Hvordan var siste runde?"));
});

test("formaterKlokkeslett returnerer HH:MM format", () => {
  const testDato = new Date("2026-10-04T08:14:00Z");
  const klokke = formaterKlokkeslett(testDato);
  assert.match(klokke, /^\d{2}:\d{2}$/);
});

test("harCaddieTilgang sjekker tier og rolle korrekt", () => {
  assert.equal(harCaddieTilgang("GRATIS", "PLAYER"), false);
  assert.equal(harCaddieTilgang("PRO", "PLAYER"), true);
  assert.equal(harCaddieTilgang("ELITE", "PLAYER"), true);
  // Coach og Admin har alltid tilgang til å teste/bruke
  assert.equal(harCaddieTilgang("GRATIS", "COACH"), true);
  assert.equal(harCaddieTilgang("GRATIS", "ADMIN"), true);
});

test("genererCaddieEksportMarkdown lager strukturert markdown", () => {
  const meldinger: PH22CaddieMelding[] = [
    {
      id: "1",
      role: "user",
      content: "Hvor mye har jeg trent denne uka?",
      timestamp: "08:14",
    },
    {
      id: "2",
      role: "assistant",
      content: "Denne uka har du trent 14 t 30 min av 18 t planlagt.",
      timestamp: "08:15",
      source: "PLAN OG ØKTER · UKE 39",
      draft: {
        id: "d1",
        kind: "økt",
        title: "Kortspill-fokus 45 min",
        meta: "3 x 15 min nærspill",
        status: "utkast",
      },
    },
  ];

  const md = genererCaddieEksportMarkdown(meldinger, "Ola", new Date("2026-10-04T10:00:00Z"));
  assert.ok(md.includes("# Caddie-samtale — Ola"));
  assert.ok(md.includes("Hvor mye har jeg trent"));
  assert.ok(md.includes("Kilde: PLAN OG ØKTER · UKE 39"));
  assert.ok(md.includes("Kortspill-fokus 45 min"));
});
