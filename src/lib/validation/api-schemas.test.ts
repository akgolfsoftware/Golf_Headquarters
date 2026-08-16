/**
 * Tester for API-grense-schemaene (steg 5 i `docs/plan-testdekning.md`).
 *
 * Poenget per rute er det samme: gyldig body skal passere, ugyldig skal gi et
 * KONTROLLERT avslag (400) i stedet for å velte lenger inne i DB- eller
 * AI-laget som en 500. Schemaene testes direkte fremfor via rutehandlerne —
 * handlerne krever Next-runtime, Prisma og AI-klient, og det som faktisk kan
 * gå galt er formen på dataene.
 *
 * Kjør med: npm test
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { inboundEpostSchema, chatBodySchema } from "./api-schemas";

// ---------------------------------------------------------------- inbox/inbound

test("inbound: avsender som rå streng passerer", () => {
  const r = inboundEpostSchema.safeParse({
    from: "Anders Kristiansen <anders@akgolf.no>",
    subject: "Booking",
    text: "Hei!",
  });
  assert.equal(r.success, true);
});

test("inbound: avsender som objekt passerer", () => {
  const r = inboundEpostSchema.safeParse({
    from: { email: "anders@akgolf.no", name: "Anders" },
    subject: "Booking",
  });
  assert.equal(r.success, true);
});

test("inbound: tom body passerer schemaet (ruten eier missing-from selv)", () => {
  // Schemaet skal fange FORM. At avsender mangler er en forretningsregel med
  // egen, tydeligere feilmelding i ruten (`missing-from`).
  assert.equal(inboundEpostSchema.safeParse({}).success, true);
});

test("inbound: feil TYPE på felt avvises (ville blitt 500 i DB-laget før)", () => {
  // Dette er kjernen: `subject: 42` gikk rett inn i prisma.create før, der
  // `.trim()` på et tall kaster og gir 500.
  assert.equal(
    inboundEpostSchema.safeParse({ from: "a@b.no", subject: 42 }).success,
    false,
  );
  assert.equal(
    inboundEpostSchema.safeParse({ from: "a@b.no", text: { ondsinnet: true } })
      .success,
    false,
  );
  assert.equal(inboundEpostSchema.safeParse({ from: 123 }).success, false);
});

test("inbound: absurd lang brødtekst avvises", () => {
  const r = inboundEpostSchema.safeParse({
    from: "a@b.no",
    text: "x".repeat(100_001),
  });
  assert.equal(r.success, false);
});

test("inbound: ikke-objekt avvises", () => {
  assert.equal(inboundEpostSchema.safeParse(null).success, false);
  assert.equal(inboundEpostSchema.safeParse("streng").success, false);
  assert.equal(inboundEpostSchema.safeParse([]).success, false);
});

// ------------------------------------------------------- caddie/kommando chat

test("chat: gyldig meldingsliste passerer", () => {
  const r = chatBodySchema.safeParse({
    messages: [{ role: "user", parts: [{ type: "text", text: "Hei" }] }],
    conversationId: "samtale-1",
  });
  assert.equal(r.success, true);
});

test("chat: ukjente felter på meldingen bevares (passthrough)", () => {
  // Schemaet skal ikke bli en kopi av AI SDK-ets interne format — det endrer
  // seg mellom versjoner. Vi validerer det ruten leser, og slipper resten forbi.
  const r = chatBodySchema.safeParse({
    messages: [{ role: "user", id: "m1", parts: [], nyttFeltFraSdk: true }],
  });
  assert.equal(r.success, true);
  if (r.success) {
    const m = r.data.messages[0] as Record<string, unknown>;
    assert.equal(m.nyttFeltFraSdk, true);
  }
});

test("chat: manglende messages avvises", () => {
  assert.equal(chatBodySchema.safeParse({}).success, false);
});

test("chat: tom meldingsliste avvises", () => {
  // En tom liste ville gått videre til AI-kallet og feilet der.
  assert.equal(chatBodySchema.safeParse({ messages: [] }).success, false);
});

test("chat: melding uten role avvises", () => {
  assert.equal(
    chatBodySchema.safeParse({ messages: [{ parts: [] }] }).success,
    false,
  );
});

test("chat: melding med ikke-streng role avvises", () => {
  assert.equal(
    chatBodySchema.safeParse({ messages: [{ role: 42 }] }).success,
    false,
  );
});

test("chat: messages som ikke er liste avvises", () => {
  assert.equal(
    chatBodySchema.safeParse({ messages: "hei" }).success,
    false,
  );
  assert.equal(
    chatBodySchema.safeParse({ messages: { role: "user" } }).success,
    false,
  );
});

test("chat: tom conversationId avvises (ruten forventer null eller ekte id)", () => {
  assert.equal(
    chatBodySchema.safeParse({
      messages: [{ role: "user" }],
      conversationId: "",
    }).success,
    false,
  );
});
