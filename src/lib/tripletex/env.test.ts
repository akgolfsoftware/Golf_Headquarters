/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/tripletex/env.test.ts
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readTripletexEnv } from "./env";

test("readTripletexEnv returnerer null når vars mangler", () => {
  assert.equal(readTripletexEnv({}), null);
});

test("readTripletexEnv returnerer null når kun consumer-token er satt", () => {
  assert.equal(readTripletexEnv({ TRIPLETEX_CONSUMER_TOKEN: "x" }), null);
});

test("readTripletexEnv returnerer config med default base-url", () => {
  const env = readTripletexEnv({
    TRIPLETEX_CONSUMER_TOKEN: "consumer-1",
    TRIPLETEX_EMPLOYEE_TOKEN: "employee-1",
  });
  assert.ok(env);
  assert.equal(env.consumerToken, "consumer-1");
  assert.equal(env.employeeToken, "employee-1");
  assert.equal(env.baseUrl, "https://tripletex.no/v2");
});

test("readTripletexEnv respekterer eksplisitt base-url og fjerner etterslengt skråstrek", () => {
  const env = readTripletexEnv({
    TRIPLETEX_CONSUMER_TOKEN: "consumer-1",
    TRIPLETEX_EMPLOYEE_TOKEN: "employee-1",
    TRIPLETEX_BASE_URL: "https://api.tripletex.no/v2/",
  });
  assert.ok(env);
  assert.equal(env.baseUrl, "https://api.tripletex.no/v2");
});
