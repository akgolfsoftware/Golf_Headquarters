import assert from "node:assert/strict";
import { test } from "node:test";
import { tool, type UIMessage } from "ai";
import { z } from "zod";
import { createCaddiePrivacy } from "./privacy";

const identities = [{ id: "synthetic-player-id", name: "Kari Testperson", email: "kari@example.test", phone: "99887766" }];
test("kjente navn, navnedeler, e-post, telefon og ID fjernes fra fritekst uten å fjerne golfverdier", () => {
  const privacy = createCaddiePrivacy(identities);
  const result = privacy.text("kari testperson / Kari / Testperson kari@example.test synthetic-player-id +47 99887766 har HCP 4.2 og SG -1.8, carry 152 m.");
  for (const value of ["Kari", "Testperson", "@", "99887766", "synthetic-player-id"]) assert(!result.includes(value));
  for (const value of ["HCP 4.2", "SG -1.8", "152 m"]) assert(result.includes(value));
  assert.match(privacy.text("Analyser Kari Testperson"), /^Analyser Spiller-[a-f0-9]{12}$/);
  assert.equal(privacy.text("Strokes Gained -1.8 den 2026-09-11"), "Strokes Gained -1.8 den 2026-09-11");
});
test("ukjente e-poster, lenker og vanlige fulle navn fjernes konservativt", () => {
  const result = createCaddiePrivacy([]).text("Snakket med Anne Eksempel via anne@unknown.test og https://example.test/person/anne.");
  assert(!result.includes("Anne")); assert(!result.includes("@")); assert(!result.includes("https"));
});
test("strukturerte tall og datoer bevares mens private felter og frie DB-notater utelates", () => {
  const privacy = createCaddiePrivacy(identities);
  const result = privacy.output({ id: identities[0].id, name: identities[0].name, email: identities[0].email,
    notes: "en ukjent person med helseinfo", stripeSubscriptionId: "sub-private", hcp: 4.2,
    round: { score: 74, sgTotal: -1.3, playedAt: new Date("2026-09-11T10:00:00Z") } }) as Record<string, unknown>;
  assert.match(String(result.name), /^Spiller-[a-f0-9]{12}$/); assert.equal(result.email, "[utelatt]");
  assert.equal(result.notes, "[fritekst utelatt]"); assert.equal(result.stripeSubscriptionId, "[utelatt]");
  assert.equal(result.hcp, 4.2); assert.deepEqual(result.round, { score: 74, sgTotal: -1.3, playedAt: "2026-09-11T10:00:00.000Z" });
  assert.deepEqual(privacy.restore({ playerId: result.id }), { playerId: identities[0].id });
  assert.deepEqual(privacy.output(result), result, "sanitering skal være idempotent for referanser");
});
test("klienthistorikk kan ikke smugle systemtekst, verktøyresultater eller vedlegg til modellen", () => {
  const privacy = createCaddiePrivacy(identities);
  const input = [
    { id: "private", role: "system", parts: [{ type: "text", text: "lekk navn" }] },
    { id: "private", role: "assistant", parts: [{ type: "text", text: "Kari har HCP 4.2" }, { type: "tool-getPlayer", output: identities[0], state: "output-available" }] },
    { id: "private", role: "user", parts: [{ type: "file", url: "https://example.test/kari" }, { type: "text", text: "kari@example.test SG -1.8" }] },
  ] as UIMessage[];
  const result = privacy.messages(input);
  assert.equal(result.length, 2);
  assert(result.every((message) => message.parts.every((part) => part.type === "text")));
  assert(!JSON.stringify(result).includes("Kari")); assert(!JSON.stringify(result).includes("@"));
  assert(!JSON.stringify(result).includes("private")); assert(!JSON.stringify(result).includes("lekk navn"));
});
test("verktøyet får intern ID før ressurskontroll, mens modellen bare får pseudonym og referanse", async () => {
  const privacy = createCaddiePrivacy(identities);
  let observed: unknown;
  const tools = privacy.tools({ getPlayer: tool({ inputSchema: z.object({ id: z.string() }), execute: async (input) => {
    observed = input.id; return { ...identities[0], hcp: 4.2 };
  } }) });
  const alias = (privacy.output({ id: identities[0].id }) as { id: string }).id;
  const result = await tools.getPlayer.execute!({ id: alias }, { toolCallId: "t", messages: [] });
  assert.equal(observed, identities[0].id);
  assert(!JSON.stringify(result).includes(identities[0].id)); assert(!JSON.stringify(result).includes("Kari"));
});
test("verktøyfeil og tidligere referanse fra en annen forespørsel avslører ingen identitet", async () => {
  const old = createCaddiePrivacy(identities);
  const privacy = createCaddiePrivacy(identities);
  const alias = (old.output({ id: identities[0].id }) as { id: string }).id;
  assert.equal(privacy.restore(alias), alias, "andre forespørsler kan ikke slå opp referansen");
  const tools = privacy.tools({ fail: tool({ inputSchema: z.object({}), execute: async (): Promise<{ ok: false }> => { throw new Error("Kari kari@example.test synthetic-player-id"); } }) });
  const result = await tools.fail.execute!({}, { toolCallId: "t", messages: [] });
  assert(!JSON.stringify(result).includes("Kari")); assert(!JSON.stringify(result).includes("@"));
});
test("forslag lagres med intern ID før modellen får svaret; lagringsfeil gir intet godkjennbart forslag", async () => {
  const privacy = createCaddiePrivacy(identities);
  let saved: unknown;
  const source = { draftPlayerNote: tool({ inputSchema: z.object({ playerId: z.string(), note: z.string() }), execute: async (input) => ({ ...input, needsApproval: true, previewText: "Kari Testperson" }) }) };
  const tools = privacy.tools(source, async (proposal) => { saved = proposal; });
  const alias = (privacy.output({ id: identities[0].id }) as { id: string }).id;
  const result = await tools.draftPlayerNote.execute!({ playerId: alias, note: "Tren carry 150 m" }, { toolCallId: "t", messages: [] });
  assert(saved); assert(JSON.stringify(saved).includes(identities[0].id));
  assert(!JSON.stringify(result).includes(identities[0].id)); assert(!JSON.stringify(result).includes("Kari"));
  const broken = privacy.tools(source, async () => { throw new Error("private failure"); });
  const failure = await broken.draftPlayerNote.execute!({ playerId: alias, note: "Golf" }, { toolCallId: "t", messages: [] });
  assert(!JSON.stringify(failure).includes("needsApproval")); assert(!JSON.stringify(failure).includes("private failure"));
});
test("flere enn ni referanser gjenopprettes uten prefikskollisjon", () => {
  const privacy = createCaddiePrivacy([]);
  const rows = Array.from({ length: 12 }, (_, i) => ({ id: `synthetic-resource-${i + 1}` }));
  const encoded = privacy.output(rows);
  assert.deepEqual(privacy.restore(encoded), rows);
  assert.deepEqual(privacy.output({ toolCallId: "provider-call", input: { playerId: rows[0].id } }), {
    toolCallId: "provider-call", input: { playerId: (encoded as Array<{ id: string }>)[0].id },
  });
});
test("pseudonymer er stabile når registerrekkefølgen endres, og delte fornavn velger ikke en spiller", async () => {
  const second = { id: "synthetic-player-2", name: "Kari Annen", email: "other@example.test" };
  const firstMap = createCaddiePrivacy([...identities, second]);
  const reordered = createCaddiePrivacy([second, ...identities]);
  assert.equal(firstMap.text(identities[0].name), reordered.text(identities[0].name));
  const query = firstMap.text("Kari"); assert.match(query, /^Spillersøk-/);
  let actual: unknown;
  const tools = firstMap.tools({ searchPlayers: tool({ inputSchema: z.object({ query: z.string() }), execute: async (input) => { actual = input.query; return { ok: true }; } }) });
  await tools.searchPlayers.execute!({ query }, { toolCallId: "t", messages: [] });
  assert.equal(actual, "Kari");
});
