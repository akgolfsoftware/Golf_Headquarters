// Tester for Perplexity Sonar-klienten. Mocker global fetch (node:test sitt
// t.mock.method) — ingen ekte nettkall. Dekker: zod-parsing av gyldig/ugyldig
// payload og «ikke konfigurert»-veien (manglende PERPLEXITY_API_KEY).
import { test } from "node:test";
import assert from "node:assert/strict";
import { isPerplexityEnabled, perplexitySok } from "@/lib/meg/perplexity";

test("perplexitySok", async (t) => {
  const originalKey = process.env.PERPLEXITY_API_KEY;
  t.after(() => {
    if (originalKey === undefined) delete process.env.PERPLEXITY_API_KEY;
    else process.env.PERPLEXITY_API_KEY = originalKey;
  });

  await t.test("ikke konfigurert uten PERPLEXITY_API_KEY — returnerer null, ingen nettkall", async (t) => {
    delete process.env.PERPLEXITY_API_KEY;
    assert.equal(isPerplexityEnabled(), false);

    const fetchMock = t.mock.fn();
    t.mock.method(globalThis, "fetch", fetchMock);

    const res = await perplexitySok("hva er strokes gained?");
    assert.equal(res, null);
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  await t.test("parser gyldig svar med citations til {svar, kilder}", async (t) => {
    process.env.PERPLEXITY_API_KEY = "test-key";
    assert.equal(isPerplexityEnabled(), true);

    t.mock.method(globalThis, "fetch", async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "Strokes Gained måler slag mot et referansefelt." } }],
          citations: ["https://example.com/sg-forklart", "https://example.com/pga-tour"],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const res = await perplexitySok("hva er strokes gained?");
    assert.deepEqual(res, {
      svar: "Strokes Gained måler slag mot et referansefelt.",
      kilder: ["https://example.com/sg-forklart", "https://example.com/pga-tour"],
    });
  });

  await t.test("svar uten citations gir tom kildeliste", async (t) => {
    process.env.PERPLEXITY_API_KEY = "test-key";

    t.mock.method(globalThis, "fetch", async () =>
      new Response(
        JSON.stringify({ choices: [{ message: { content: "Uten kildehenvisning." } }] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const res = await perplexitySok("noe uten kilder");
    assert.deepEqual(res, { svar: "Uten kildehenvisning.", kilder: [] });
  });

  await t.test("ugyldig payload (feiler zod) gir null, aldri kast", async (t) => {
    process.env.PERPLEXITY_API_KEY = "test-key";

    t.mock.method(globalThis, "fetch", async () =>
      new Response(JSON.stringify({ foo: "bar" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await perplexitySok("noe rart");
    assert.equal(res, null);
  });

  await t.test("choices med tomt array feiler zod (min 1) og gir null", async (t) => {
    process.env.PERPLEXITY_API_KEY = "test-key";

    t.mock.method(globalThis, "fetch", async () =>
      new Response(JSON.stringify({ choices: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await perplexitySok("tomt svar");
    assert.equal(res, null);
  });

  await t.test("ikke-ok HTTP-status gir null", async (t) => {
    process.env.PERPLEXITY_API_KEY = "test-key";

    t.mock.method(
      globalThis,
      "fetch",
      async () => new Response("intern feil", { status: 500 }),
    );

    const res = await perplexitySok("feiler");
    assert.equal(res, null);
  });

  await t.test("nettverksfeil (fetch kaster) gir null", async (t) => {
    process.env.PERPLEXITY_API_KEY = "test-key";

    t.mock.method(globalThis, "fetch", async () => {
      throw new Error("network down");
    });

    const res = await perplexitySok("nettverk nede");
    assert.equal(res, null);
  });
});
