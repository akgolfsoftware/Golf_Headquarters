import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  byggPlanEndringBody,
  byggPlanEndringGroupKey,
  byggPlanEndringGroupKeyPrefix,
  osloDagKey,
} from "@/lib/notifications/plan-endring-kjerne";

// Midnattskantene (Vercel = UTC): tidspunkt sent på UTC-kvelden er allerede
// NESTE norske kalenderdag — dagnøkkelen skal følge Oslo, aldri UTC.

describe("osloDagKey", () => {
  it("bruker Oslo-dagen, ikke UTC-dagen, ved sommertid (UTC+2)", () => {
    // 16.08 kl. 22:30 UTC = 17.08 kl. 00:30 i Oslo.
    assert.equal(osloDagKey(new Date("2026-08-16T22:30:00.000Z")), "2026-08-17");
  });

  it("bruker Oslo-dagen ved vintertid (UTC+1)", () => {
    // 15.01 kl. 23:30 UTC = 16.01 kl. 00:30 i Oslo.
    assert.equal(osloDagKey(new Date("2026-01-15T23:30:00.000Z")), "2026-01-16");
    // 15.01 kl. 22:30 UTC = 15.01 kl. 23:30 i Oslo — fortsatt samme dag.
    assert.equal(osloDagKey(new Date("2026-01-15T22:30:00.000Z")), "2026-01-15");
  });

  it("returnerer samme dag midt på dagen", () => {
    assert.equal(osloDagKey(new Date("2026-08-16T10:00:00.000Z")), "2026-08-16");
  });

  it("nullpadder måned og dag", () => {
    assert.equal(osloDagKey(new Date("2026-01-05T12:00:00.000Z")), "2026-01-05");
  });
});

describe("byggPlanEndringGroupKey", () => {
  it("bygger plan-endring:<spillerId>:<osloDag>", () => {
    const key = byggPlanEndringGroupKey("spiller-123", new Date("2026-08-16T10:00:00.000Z"));
    assert.equal(key, "plan-endring:spiller-123:2026-08-16");
  });

  it("to endringer samme Oslo-dag gir samme nøkkel (batching-vinduet)", () => {
    const morgen = byggPlanEndringGroupKey("s1", new Date("2026-08-16T05:00:00.000Z"));
    const kveld = byggPlanEndringGroupKey("s1", new Date("2026-08-16T20:00:00.000Z"));
    assert.equal(morgen, kveld);
  });

  it("endring etter norsk midnatt starter nytt vindu", () => {
    const foer = byggPlanEndringGroupKey("s1", new Date("2026-08-16T21:59:00.000Z"));
    const etter = byggPlanEndringGroupKey("s1", new Date("2026-08-16T22:01:00.000Z"));
    assert.notEqual(foer, etter);
    assert.equal(etter, "plan-endring:s1:2026-08-17");
  });

  it("starter med prefikset les-kvitteringen filtrerer på", () => {
    const key = byggPlanEndringGroupKey("spiller-123", new Date());
    assert.ok(key.startsWith(byggPlanEndringGroupKeyPrefix("spiller-123")));
  });
});

describe("byggPlanEndringBody", () => {
  it("count 1 gir endringstype-spesifikk tekst", () => {
    assert.equal(
      byggPlanEndringBody("Øyvind Rohjan", 1, "FLYTTET"),
      "Øyvind Rohjan flyttet en økt i planen",
    );
    assert.equal(
      byggPlanEndringBody("Øyvind Rohjan", 1, "OPPRETTET"),
      "Øyvind Rohjan la til en ny økt i planen",
    );
    assert.equal(
      byggPlanEndringBody("Øyvind Rohjan", 1, "SLETTET"),
      "Øyvind Rohjan slettet en økt fra planen",
    );
    assert.equal(
      byggPlanEndringBody("Øyvind Rohjan", 1, "PLANBYTTE"),
      "Øyvind Rohjan byttet aktiv plan",
    );
  });

  it("count over 1 samler til dagstekst uansett endringstype", () => {
    assert.equal(
      byggPlanEndringBody("Øyvind Rohjan", 3, "SLETTET"),
      "Øyvind Rohjan endret 3 økter i planen i dag",
    );
    assert.equal(
      byggPlanEndringBody("Øyvind Rohjan", 2, "PLANBYTTE"),
      "Øyvind Rohjan endret 2 økter i planen i dag",
    );
  });
});
