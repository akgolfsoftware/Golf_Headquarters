import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ForelderBookingerV2 } from "@/components/portal/v2/ForelderBookingerV2";
import type { ForelderBookingerData } from "@/components/portal/v2/ForelderBookingerV2";

const start = new Date("2026-10-05T08:00:00Z");

function booking(over: Partial<ForelderBookingerData["kommende"][number]> = {}): ForelderBookingerData["kommende"][number] {
  return {
    id: "a",
    startAt: start,
    serviceName: "Time",
    durationMin: 60,
    locationName: "Simulator",
    coachName: null,
    childName: "Ane",
    status: "CONFIRMED",
    ...over,
  };
}

test("bookinglisten beholder ny time, filter, venter og avlyst", () => {
  const data: ForelderBookingerData = {
    antallBarn: 2,
    visBarn: true,
    ukenummer: 41,
    denneUka: 1,
    parentName: "Forelder",
    kommende: [booking({ id: "a", status: "PENDING", childName: "Ane" }), booking({ id: "b", childName: "Bo" })],
    tidligere: [booking({ id: "c", status: "CANCELLED", childName: "Ane" })],
  };
  const html = renderToStaticMarkup(createElement(ForelderBookingerV2, { data }));
  assert.ok(html.includes('href="/forelder/bookinger/ny"'));
  assert.ok(html.includes("Book ny time"));
  assert.ok(html.includes("Venter"));
  assert.ok(html.includes("Avlyst av coach"));
  assert.ok(html.includes(">Alle<"));
  assert.ok(html.includes('aria-pressed="true"'));
});

test("samtykkeflaten beholder lagring, sletting og eksport", () => {
  const src = readFileSync(new URL("../../src/components/portal/v2/ForelderSamtykkeV2.tsx", import.meta.url), "utf8");
  assert.match(src, /lagreSamtykker/);
  assert.match(src, /settHelseSamtykkeForBarn/);
  assert.match(src, /beOmDataSletting/);
  assert.match(src, /\/forelder\/samtykke\/eksport/);
  assert.match(src, /Ingen barn er koblet ennå/);
  assert.doesNotMatch(src, /@\/lib\/v2\/train-lock/);
});
