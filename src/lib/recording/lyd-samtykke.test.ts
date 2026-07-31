import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  byggLydSamtykkeSjekk,
  kanStarteFangst,
  lydSamtykkeMelding,
} from "./lyd-samtykke";
import {
  erLydSamtykkeTokenGyldig,
  lagLydSamtykkeToken,
  lydSamtykkeTokenUtloper,
} from "./lyd-samtykke-token";
import { byggLydSamtykkeForesattEpost } from "./lyd-samtykke-email";

describe("lyd-samtykke (hard gate)", () => {
  it("kanStarteFangst bare ved GITT", () => {
    assert.equal(kanStarteFangst("GITT"), true);
    assert.equal(kanStarteFangst("VENTER"), false);
    assert.equal(kanStarteFangst("TRUKKET"), false);
    assert.equal(kanStarteFangst(null), false);
    assert.equal(kanStarteFangst(undefined), false);
    assert.equal(kanStarteFangst(""), false);
  });

  it("byggLydSamtykkeSjekk: mangler rad = MANGLER", () => {
    const s = byggLydSamtykkeSjekk(null);
    assert.equal(s.tillatt, false);
    if (!s.tillatt) assert.equal(s.status, "MANGLER");
  });

  it("byggLydSamtykkeSjekk: GITT tillater", () => {
    const gittAt = new Date("2026-07-31T10:00:00Z");
    const s = byggLydSamtykkeSjekk({ status: "GITT", gittAt });
    assert.equal(s.tillatt, true);
    if (s.tillatt) {
      assert.equal(s.status, "GITT");
      assert.equal(s.gittAt, gittAt);
    }
  });

  it("byggLydSamtykkeSjekk: VENTER og TRUKKET sperrer", () => {
    const v = byggLydSamtykkeSjekk({ status: "VENTER", gittAt: null });
    assert.equal(v.tillatt, false);
    if (!v.tillatt) assert.equal(v.status, "VENTER");

    const t = byggLydSamtykkeSjekk({
      status: "TRUKKET",
      gittAt: new Date(),
    });
    assert.equal(t.tillatt, false);
    if (!t.tillatt) assert.equal(t.status, "TRUKKET");
  });

  it("lydSamtykkeMelding er norsk og handlingsklar", () => {
    const mV = lydSamtykkeMelding({
      tillatt: false,
      status: "VENTER",
      gittAt: null,
    });
    assert.match(mV, /samtykke/i);
    assert.match(mV, /foresatt|Opptak/i);

    const mT = lydSamtykkeMelding({
      tillatt: false,
      status: "TRUKKET",
      gittAt: null,
    });
    assert.match(mT, /trukket/i);
  });
});

describe("lyd-samtykke token + e-post", () => {
  it("lagLydSamtykkeToken er unik og lang nok", () => {
    const a = lagLydSamtykkeToken();
    const b = lagLydSamtykkeToken();
    assert.notEqual(a, b);
    assert.ok(a.length >= 32);
  });

  it("erLydSamtykkeTokenGyldig respekterer status og utløp", () => {
    const naa = new Date("2026-07-31T12:00:00Z");
    const ok = erLydSamtykkeTokenGyldig({
      token: "abc",
      tokenExpiresAt: new Date("2026-08-10T12:00:00Z"),
      status: "VENTER",
      naa,
    });
    assert.equal(ok, true);

    assert.equal(
      erLydSamtykkeTokenGyldig({
        token: "abc",
        tokenExpiresAt: new Date("2026-07-01T12:00:00Z"),
        status: "VENTER",
        naa,
      }),
      false,
    );

    assert.equal(
      erLydSamtykkeTokenGyldig({
        token: "abc",
        tokenExpiresAt: new Date("2026-08-10T12:00:00Z"),
        status: "GITT",
        naa,
      }),
      false,
    );

    assert.equal(
      erLydSamtykkeTokenGyldig({
        token: null,
        tokenExpiresAt: new Date("2026-08-10T12:00:00Z"),
        status: "VENTER",
        naa,
      }),
      false,
    );
  });

  it("lydSamtykkeTokenUtloper er i fremtiden", () => {
    const fra = new Date("2026-07-31T00:00:00Z");
    const ut = lydSamtykkeTokenUtloper(fra, 14);
    assert.equal(ut.getTime() - fra.getTime(), 14 * 24 * 60 * 60 * 1000);
  });

  it("byggLydSamtykkeForesattEpost inneholder navn og lenke", () => {
    const e = byggLydSamtykkeForesattEpost({
      spillerNavn: "Ola Nordmann",
      consentUrl: "https://akgolf.no/auth/lyd-samtykke/tok123",
    });
    assert.match(e.subject, /Ola Nordmann/);
    assert.match(e.html, /lyd-samtykke\/tok123/);
    assert.match(e.html, /samtykke/i);
  });
});
