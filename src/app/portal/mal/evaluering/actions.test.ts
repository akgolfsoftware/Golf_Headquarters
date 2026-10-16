import { before, mock, test } from "node:test";
import assert from "node:assert/strict";

let bruker: Record<string, unknown> | null;
const kall: string[] = [];
const auth = new URL("../../../../lib/auth/getCurrentUser.ts", import.meta.url).pathname;
mock.module(auth, { namedExports: { getCurrentUser: async () => bruker, getCurrentUserRaw: async () => bruker } });
mock.module(new URL("../../../../lib/iup/lagring.ts", import.meta.url).pathname, { namedExports: {
  lagreEgenIup: async () => { kall.push("lagre"); return { ok: true }; },
  hentEgenIup: async () => { kall.push("historikk"); return null; },
} });
mock.module(new URL("../../../../lib/iup/oversikt.ts", import.meta.url).pathname, { namedExports: { finnEgenIup: async () => { kall.push("finn"); return { ok: true, id: null }; } } });
mock.module("next/cache", { namedExports: { revalidatePath: (path: string) => kall.push(`oppfrisk:${path}`) } });
mock.module("next/navigation", { namedExports: { redirect: (path: string): never => { throw Error(`redirect:${path}`); } } });
let actions: typeof import("./actions");
before(async () => { actions = await import("./actions"); });
const spiller = () => ({ id: "syntetisk-spiller", role: "PLAYER", requiresGuardianConsent: false, guardianConsentGivenAt: null, tilgang: { nivaa: "FULL" } });

test("alle tre offentlige handlinger krever innlogging, spillerflate, foreldresamtykke og Full-tilgang før datakall", async () => {
  for (const ugyldig of [null, { ...spiller(), role: "EKSTERN_LESER" }, { ...spiller(), role: "PARENT" }, { ...spiller(), role: "GUEST" }, { ...spiller(), requiresGuardianConsent: true }, { ...spiller(), tilgang: { nivaa: "TALENT" } }, { ...spiller(), tilgang: { nivaa: "INGEN" } }]) {
    bruker = ugyldig;
    for (const fn of [actions.lagreIupAction, actions.finnIupAction, actions.hentIupHistorikkAction]) {
      kall.length = 0; await assert.rejects(fn({})); assert.deepEqual(kall, []);
    }
  }
});
test("gyldig egen spillerflate når domenekontrollen, og lagring oppfrisker kun evalueringsruten", async () => {
  bruker = spiller(); kall.length = 0;
  await actions.lagreIupAction({}); await actions.finnIupAction({}); await actions.hentIupHistorikkAction({});
  assert.deepEqual(kall, ["lagre", "oppfrisk:/portal/mal/evaluering", "finn", "historikk"]);
});
