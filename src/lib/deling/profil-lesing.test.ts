import assert from "node:assert/strict";
import { mock, test } from "node:test";

let identitet: { id: string; epost: string } | Error;
let delt: Set<string>;
let kandidater: { userId: string }[];
let hendelser: string[];
let kandidatFilter: unknown;
let tidsgrenser: unknown[];
const tx = { markor: "transaksjon" };
mock.module("@/lib/prisma", { namedExports: { prisma: {
  $transaction: async (les: (client: typeof tx) => Promise<unknown>, valg?: unknown) => {
    tidsgrenser.push(valg); hendelser.push("start");
    try { return await les(tx); } finally { hendelser.push("slutt"); }
  },
  trenerDelingsInvitasjon: { findMany: async (filter: unknown) => { kandidatFilter = filter; return kandidater; } },
} } });
mock.module("./navngitt", { namedExports: {
  krevNavngittTrener: async () => { if (identitet instanceof Error) throw identitet; return identitet; },
  navngittTrenerHarTilgang: async (client: unknown, trener: unknown, spiller: string, gruppe: string) => {
    assert.equal(client, tx); assert.deepEqual(trener, identitet); assert.equal(gruppe, "gruppe");
    hendelser.push(`kontroll:${spiller}`); return delt.has(spiller);
  },
} });
let medNavngittProfil: typeof import("./profil-lesing").medNavngittProfil;
let lesNavngitteProfiler: typeof import("./profil-lesing").lesNavngitteProfiler;
let PROFIL_TRANSAKSJON: typeof import("./profil-lesing").PROFIL_TRANSAKSJON;
test.before(async () => { ({ medNavngittProfil, lesNavngitteProfiler, PROFIL_TRANSAKSJON } = await import("./profil-lesing")); });
test.beforeEach(() => {
  identitet = { id: "coach", epost: "syntetisk@wang.no" };
  delt = new Set(["spiller"]); kandidater = [{ userId: "spiller" }]; hendelser = []; kandidatFilter = null; tidsgrenser = [];
});

test("identiteten må stemme med den innloggede treneren før data eller kandidater leses", async () => {
  assert.equal(await medNavngittProfil("annen", "spiller", "gruppe", async () => assert.fail()), null);
  assert.deepEqual(await lesNavngitteProfiler("annen", "gruppe", async () => assert.fail()), []);
  assert.equal(kandidatFilter, null); assert.deepEqual(hendelser, []);
});
for (const melding of ["forbidden", "unauthenticated"]) test(`${melding} gir ingen profil eller liste`, async () => {
  identitet = new Error(melding);
  assert.equal(await medNavngittProfil("coach", "spiller", "gruppe", async () => assert.fail()), null);
  assert.deepEqual(await lesNavngitteProfiler("coach", "gruppe", async () => assert.fail()), []);
  assert.deepEqual(hendelser, []);
});
test("driftsfeil skjules ikke som manglende deling", async () => {
  identitet = new Error("database utilgjengelig");
  await assert.rejects(medNavngittProfil("coach", "spiller", "gruppe", async () => 1), /database utilgjengelig/);
});
test("beskyttelsen holdes gjennom asynkron datalesing, på samme transaksjonsklient", async () => {
  const resultat = await medNavngittProfil("coach", "spiller", "gruppe", async (client) => {
    assert.equal(client, tx); assert.deepEqual(hendelser, ["start", "kontroll:spiller"]);
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.ok(!hendelser.includes("slutt")); hendelser.push("lest"); return { syntetisk: true };
  });
  assert.deepEqual(resultat, { syntetisk: true }); assert.deepEqual(hendelser, ["start", "kontroll:spiller", "lest", "slutt"]);
});
test("tilbaketrekking mellom to oppslag stopper det andre dataoppslaget", async () => {
  assert.equal(await medNavngittProfil("coach", "spiller", "gruppe", async () => "lest"), "lest");
  delt.clear();
  assert.equal(await medNavngittProfil("coach", "spiller", "gruppe", async () => assert.fail()), null);
});
test("godtatt invitasjon er bare en kandidat: tilbakekalte rettigheter og tomme profiler utelates", async () => {
  kandidater = [{ userId: "spiller" }, { userId: "tilbaketrukket" }, { userId: "tom" }]; delt.add("tom");
  const resultat = await lesNavngitteProfiler("coach", "gruppe", async (client, id) => {
    assert.equal(client, tx); assert.notEqual(id, "tilbaketrukket"); return id === "tom" ? null : id;
  });
  assert.deepEqual(resultat, ["spiller"]);
  assert.deepEqual(kandidatFilter, { where: { mottakerGruppeId: "gruppe", mottakerEpost: "syntetisk@wang.no", acceptedByUserId: "coach", acceptedAt: { not: null }, revokedAt: null }, select: { userId: true }, distinct: ["userId"], orderBy: { userId: "asc" } });
  assert.deepEqual(hendelser, ["start", "kontroll:spiller", "slutt", "start", "kontroll:tilbaketrukket", "slutt", "start", "kontroll:tom", "slutt"]);
});
test("feil fra leseren lukker transaksjonen og returnerer aldri delvis innhold", async () => {
  await assert.rejects(medNavngittProfil("coach", "spiller", "gruppe", async () => { throw new Error("lesefeil"); }), /lesefeil/);
  assert.equal(hendelser.at(-1), "slutt");
});
test("hver profiltransaksjon får en eksplisitt tidsgrense over Prismas standard på 5 s", async () => {
  kandidater = [{ userId: "spiller" }, { userId: "tom" }]; delt.add("tom");
  await medNavngittProfil("coach", "spiller", "gruppe", async () => 1);
  await lesNavngitteProfiler("coach", "gruppe", async (_client, id) => id);
  assert.equal(tidsgrenser.length, 3);
  for (const valg of tidsgrenser) assert.equal(valg, PROFIL_TRANSAKSJON);
  assert.ok(PROFIL_TRANSAKSJON.timeout > 5_000 && PROFIL_TRANSAKSJON.maxWait > 2_000);
  assert.ok(PROFIL_TRANSAKSJON.timeout <= 30_000, "låsen skal ikke kunne holdes vilkårlig lenge");
});
