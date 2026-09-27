import assert from "node:assert/strict";
import test from "node:test";
import { summarizeFaceToPath } from "./trackman-observations";

test("holder køller adskilt og beholder null grader som en gyldig måling", () => {
  const result = summarizeFaceToPath([
    { club: "Driver", faceToPath: 0 },
    { club: "Driver", faceToPath: 2 },
    { club: "Driver", faceToPath: 4 },
    { club: "7-jern", faceToPath: -1 },
    { club: "7-jern", faceToPath: -2 },
    { club: "7-jern", faceToPath: -3 },
  ]);

  assert.deepEqual(result, [
    { club: "Driver", shotCount: 3, meanDegrees: 2 },
    { club: "7-jern", shotCount: 3, meanDegrees: -2 },
  ]);
});

test("manglende og ikke-endelige verdier gir ingen observasjon", () => {
  assert.deepEqual(summarizeFaceToPath([
    { club: "Driver", faceToPath: null },
    { club: "Driver", faceToPath: Number.NaN },
    { club: "Driver", faceToPath: 1 },
    { club: "Driver", faceToPath: 2 },
    { club: "", faceToPath: 3 },
  ]), []);
});
