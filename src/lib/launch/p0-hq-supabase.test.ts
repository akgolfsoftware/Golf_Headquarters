import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  krevHqP0ApiUrl,
  krevHqP0AppUrl,
  krevHqP0DatabaseUrl,
  P0_HQ_API_PORT,
  P0_HQ_APP_PORT,
  P0_HQ_DB_PORT,
} from "./p0-hq-supabase";

const db = `postgresql://postgres:postgres@127.0.0.1:${P0_HQ_DB_PORT}/postgres`;
const api = `http://127.0.0.1:${P0_HQ_API_PORT}`;
const app = `http://127.0.0.1:${P0_HQ_APP_PORT}`;

describe("P0 HQ Supabase-vakt", () => {
  it("godtar bare HQ-loopback på 54421/54422/3010", () => {
    assert.equal(krevHqP0DatabaseUrl(db).port, P0_HQ_DB_PORT);
    assert.equal(krevHqP0ApiUrl(api).port, P0_HQ_API_PORT);
    assert.equal(krevHqP0AppUrl(app).port, P0_HQ_APP_PORT);
  });

  it("avviser tom URL, hostet base og WANG-portene", () => {
    assert.throws(() => krevHqP0DatabaseUrl(undefined), /required/);
    assert.throws(
      () => krevHqP0DatabaseUrl("postgresql://postgres:postgres@127.0.0.1:54322/postgres"),
      /WANG/,
    );
    assert.throws(
      () => krevHqP0ApiUrl("http://127.0.0.1:54321"),
      /WANG/,
    );
    assert.throws(
      () => krevHqP0DatabaseUrl("postgresql://postgres:postgres@db.example.supabase.co:5432/postgres"),
      /loopback/,
    );
    assert.throws(() => krevHqP0AppUrl("http://127.0.0.1:3000"), /3010/);
  });

  it("innlogget reise feiler stengt uten oppsett, uten skip", () => {
    const spec = readFileSync(
      join(process.cwd(), "tests/p0/spillerreise-innlogget.spec.ts"),
      "utf8",
    );
    assert.match(spec, /throw new Error/);
    assert.doesNotMatch(spec, /test\.skip/);
    assert.doesNotMatch(spec, /\.env\.local/);
    assert.match(spec, /P0_WB_ID/);
    assert.match(spec, /P0_V2_ID/);
    assert.match(spec, /P0_PLAN_ID/);
    assert.match(spec, /P0_FOREIGN_COACH_EMAIL/);
    assert.match(spec, /gjenåpning/);
  });
});
