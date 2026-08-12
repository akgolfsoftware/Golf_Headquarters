import { test } from "node:test";
import assert from "node:assert/strict";

import {
  BUCKET_NAVN,
  PROGRAM_BUCKET,
  bucketFraEnrollments,
  flertallsBucket,
} from "./program-bucket";

test("alle programmer utenom PLATFORM_ONLY mapper til en bøtte", () => {
  for (const [program, bucket] of Object.entries(PROGRAM_BUCKET)) {
    if (program === "PLATFORM_ONLY") {
      assert.equal(bucket, null, "PLATFORM_ONLY er ingen programtilhørighet");
    } else {
      assert.ok(bucket, `${program} mangler bøtte`);
    }
  }
});

test("bucketFraEnrollments tar første innmelding med program", () => {
  assert.equal(bucketFraEnrollments([{ program: "WANG_UNG" }]), "WANG");
  assert.equal(bucketFraEnrollments([{ program: "GFGK_ELITE" }]), "GFGK");
  assert.equal(bucketFraEnrollments([{ program: "AK_ACADEMY_JUNIOR" }]), "AKA");
});

test("PLATFORM_ONLY hopper videre til neste ekte innmelding", () => {
  assert.equal(
    bucketFraEnrollments([{ program: "PLATFORM_ONLY" }, { program: "GFGK_MINI" }]),
    "GFGK",
  );
});

test("uten innmeldinger er programmet ukjent, ikke gjettet", () => {
  assert.equal(bucketFraEnrollments([]), null);
  assert.equal(bucketFraEnrollments([{ program: "PLATFORM_ONLY" }]), null);
});

test("flertallsBucket velger programmet flest medlemmer står i", () => {
  assert.equal(flertallsBucket(["WANG", "WANG", "GFGK"]), "WANG");
  assert.equal(flertallsBucket(["GFGK", "GFGK", "GFGK", "AKA"]), "GFGK");
});

test("flertallsBucket ignorerer medlemmer uten program", () => {
  assert.equal(flertallsBucket([null, null, "AKA"]), "AKA");
});

test("gruppe uten et eneste registrert program gir null", () => {
  assert.equal(flertallsBucket([]), null);
  assert.equal(flertallsBucket([null, null]), null);
});

test("likt antall gir et stabilt svar, ikke tilfeldig", () => {
  const forste = flertallsBucket(["WANG", "GFGK"]);
  const andre = flertallsBucket(["GFGK", "WANG"]);
  assert.equal(forste, andre);
});

test("programnavnene er de fasiten bruker", () => {
  assert.equal(BUCKET_NAVN.AKA, "AK Golf Academy");
  assert.equal(BUCKET_NAVN.WANG, "WANG Toppidrett");
  assert.equal(BUCKET_NAVN.GFGK, "GFGK Junior");
});
