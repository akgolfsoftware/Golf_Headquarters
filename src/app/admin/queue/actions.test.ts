/**
 * R-I: admin/queue/actions.ts. To eierskapslag testes, begge returnerer
 * `ok:false` (ikke unntak) ved avvisning: (1) I0-porten — «aldri
 * oppfølgingsstatus på selvbetjente» (`erCoachetSpiller`), og (2)
 * coach-scoping — kun egne spillere (`harCoachTilgangTilSpiller`), ADMIN
 * unntatt. Pluss rollegrensen (PLAYER/uinnlogget avvist av
 * `requirePortalUser`, som her KASTER siden den ikke er fanget).
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

/** Spillere som er i coaching-sporet (I0-porten). */
let coachedeSpillere = new Set(["spiller-a"]);
/** Spillere coach-a faktisk har tilgang til (coach-scoping). */
let coachensSpillere = new Set(["spiller-a"]);

let signalCreates: unknown[] = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  coachedeSpillere = new Set(["spiller-a"]);
  coachensSpillere = new Set(["spiller-a"]);
  signalCreates = [];
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async (options: { allow?: Rolle | Rolle[] }) => {
      if (!bruker) throw new Error("NEXT_REDIRECT");
      const tillatt = Array.isArray(options.allow) ? options.allow : options.allow ? [options.allow] : undefined;
      if (tillatt && !tillatt.includes(bruker.role)) throw new Error("NEXT_REDIRECT");
      return bruker;
    },
  },
});
mock.module("@/lib/auth/coached", {
  namedExports: {
    erCoachetSpiller: async (spillerId: string) => coachedeSpillere.has(spillerId),
    harCoachTilgangTilSpiller: async (_viewer: unknown, spillerId: string) =>
      coachensSpillere.has(spillerId),
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  signal: {
    create: async ({ data }: { data: unknown }) => {
      signalCreates.push(data);
      return { id: "signal-1" };
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("settOppfolgingsstatus avviser PLAYER uten å skrive signal", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { settOppfolgingsstatus } = await actions();
  await assert.rejects(() => settOppfolgingsstatus("spiller-a", "risk"));
  assert.equal(signalCreates.length, 0);
});

test("settOppfolgingsstatus avviser uinnlogget uten å skrive signal", async () => {
  bruker = null;
  const { settOppfolgingsstatus } = await actions();
  await assert.rejects(() => settOppfolgingsstatus("spiller-a", "risk"));
  assert.equal(signalCreates.length, 0);
});

test("settOppfolgingsstatus avviser ugyldig status med ok:false", async () => {
  const { settOppfolgingsstatus } = await actions();
  const svar = await settOppfolgingsstatus("spiller-a", "ugyldig" as never);
  assert.equal(svar.ok, false);
  assert.equal(signalCreates.length, 0);
});

test("settOppfolgingsstatus avviser selvbetjent spiller (ikke i coaching-sporet) med ok:false", async () => {
  coachedeSpillere = new Set(); // spiller-a er ikke coachet
  const { settOppfolgingsstatus } = await actions();
  const svar = await settOppfolgingsstatus("spiller-a", "risk");
  assert.equal(svar.ok, false);
  assert.equal(svar.error, "Spilleren er ikke i coaching-sporet.");
  assert.equal(signalCreates.length, 0);
});

test("settOppfolgingsstatus avviser COACH uten tilgang til spilleren med ok:false", async () => {
  coachensSpillere = new Set(); // coachet, men ikke coach-a sin
  const { settOppfolgingsstatus } = await actions();
  const svar = await settOppfolgingsstatus("spiller-a", "risk");
  assert.equal(svar.ok, false);
  assert.equal(svar.error, "Du har ikke tilgang til denne spilleren.");
  assert.equal(signalCreates.length, 0);
});

test("settOppfolgingsstatus skriver signal for COACH med tilgang", async () => {
  const { settOppfolgingsstatus } = await actions();
  const svar = await settOppfolgingsstatus("spiller-a", "watch");
  assert.equal(svar.ok, true);
  assert.equal(signalCreates.length, 1);
  const data = signalCreates[0] as { userId: string; kind: string; payload: { status: string } };
  assert.equal(data.userId, "spiller-a");
  assert.equal(data.kind, "OPPFOLGING_STATUS");
  assert.equal(data.payload.status, "watch");
});

test("settOppfolgingsstatus lar ADMIN skrive når harCoachTilgangTilSpiller gir treff", async () => {
  // harCoachTilgangTilSpiller() (mocket her) gir i den ekte implementasjonen
  // ADMIN treff på alle coachede spillere via coachScopedPlayerWhere() — se
  // src/lib/auth/coached.ts. Selve den grenen er coached.ts sitt ansvar
  // (dekket der); her verifiseres kun at queue-actionen respekterer svaret.
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  const { settOppfolgingsstatus } = await actions();
  const svar = await settOppfolgingsstatus("spiller-a", "check");
  assert.equal(svar.ok, true);
  assert.equal(signalCreates.length, 1);
});
