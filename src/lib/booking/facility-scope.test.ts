import { test } from "node:test";
import assert from "node:assert/strict";
import {
  coachesForFacility,
  facilitiesForCoach,
  isValidCoachFacilityPair,
} from "./facility-scope";

const facilities = [
  { id: "f1", name: "Mulligan" },
  { id: "f2", name: "WANG" },
];
const coaches = [
  { id: "c1", name: "Anders", facilityIds: ["f1"] },
  { id: "c2", name: "Coach B", facilityIds: ["f1", "f2"] },
  { id: "c3", name: "Alle steder", facilityIds: [] as string[] },
];

test("coachesForFacility filters", () => {
  assert.equal(coachesForFacility(coaches, "f2").length, 2); // c2 + c3
  assert.equal(coachesForFacility(coaches, null).length, 3);
});

test("facilitiesForCoach filters", () => {
  assert.equal(facilitiesForCoach(facilities, coaches[0]).length, 1);
  assert.equal(facilitiesForCoach(facilities, coaches[2]).length, 2);
});

test("isValidCoachFacilityPair", () => {
  assert.equal(isValidCoachFacilityPair(coaches[0], "f1"), true);
  assert.equal(isValidCoachFacilityPair(coaches[0], "f2"), false);
  assert.equal(isValidCoachFacilityPair(coaches[2], "f2"), true);
});
