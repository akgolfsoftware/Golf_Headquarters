/**
 * R-I: admin/kalender/google-actions.ts. Eierskapsvalideringen mot Google
 * (hvilken kalender brukeren faktisk kan skrive til) ligger i
 * `google-calendar-rediger.ts`, ikke her — denne filens ansvar er
 * rollegrensen (`requirePortalUser`) og input-validering, og at den ALLTID
 * sender den innloggede brukerens EGEN id videre (aldri en id fra
 * klienten) til de underliggende Google-kallene. Testen mocker de
 * underliggende funksjonene og verifiserer nettopp at `bruker.id` sendes.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

let opprettKall: Array<{ userId: string; subscriptionId: string }> = [];
let oppdaterKall: Array<{ userId: string; mirrorId: string }> = [];
let slettKall: Array<{ userId: string; mirrorId: string }> = [];
let hentKalendereKall: string[] = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  opprettKall = [];
  oppdaterKall = [];
  slettKall = [];
  hentKalendereKall = [];
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
mock.module("@/lib/google-calendar-rediger", {
  namedExports: {
    opprettHendelseIGoogle: async (userId: string, subscriptionId: string) => {
      opprettKall.push({ userId, subscriptionId });
      return { ok: true, mirrorId: "mirror-ny" };
    },
    oppdaterHendelseIGoogle: async (userId: string, mirrorId: string) => {
      oppdaterKall.push({ userId, mirrorId });
      return { ok: true };
    },
    slettHendelseIGoogle: async (userId: string, mirrorId: string) => {
      slettKall.push({ userId, mirrorId });
      return { ok: true };
    },
    hentSkrivbareKalendere: async (userId: string) => {
      hentKalendereKall.push(userId);
      return [{ id: "cal-1", navn: "Coach A", farge: "#000000" }];
    },
  },
});

async function actions() {
  return import("./google-actions");
}

const gyldigHendelse = {
  tittel: "Privattime",
  startAt: "2026-09-20T10:00:00Z",
  endAt: "2026-09-20T11:00:00Z",
};

test.beforeEach(() => {
  nullstill();
});

test("opprettGoogleHendelse avviser PLAYER uten å kalle Google", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { opprettGoogleHendelse } = await actions();
  await assert.rejects(() => opprettGoogleHendelse("sub-1", gyldigHendelse));
  assert.equal(opprettKall.length, 0);
});

test("opprettGoogleHendelse avviser uinnlogget uten å kalle Google", async () => {
  bruker = null;
  const { opprettGoogleHendelse } = await actions();
  await assert.rejects(() => opprettGoogleHendelse("sub-1", gyldigHendelse));
  assert.equal(opprettKall.length, 0);
});

test("opprettGoogleHendelse avviser manglende tittel med ok:false", async () => {
  const { opprettGoogleHendelse } = await actions();
  const svar = await opprettGoogleHendelse("sub-1", { ...gyldigHendelse, tittel: "" });
  assert.equal(svar.ok, false);
  assert.equal(opprettKall.length, 0);
});

test("opprettGoogleHendelse avviser slutt før start med ok:false", async () => {
  const { opprettGoogleHendelse } = await actions();
  const svar = await opprettGoogleHendelse("sub-1", {
    ...gyldigHendelse, startAt: "2026-09-20T11:00:00Z", endAt: "2026-09-20T10:00:00Z",
  });
  assert.equal(svar.ok, false);
  assert.equal(opprettKall.length, 0);
});

test("opprettGoogleHendelse sender coachens EGEN id, ikke en id fra klienten", async () => {
  const { opprettGoogleHendelse } = await actions();
  const svar = await opprettGoogleHendelse("sub-1", gyldigHendelse);
  assert.equal(svar.ok, true);
  assert.deepEqual(opprettKall, [{ userId: "coach-a", subscriptionId: "sub-1" }]);
});

test("oppdaterGoogleHendelse avviser PLAYER uten å kalle Google", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { oppdaterGoogleHendelse } = await actions();
  await assert.rejects(() => oppdaterGoogleHendelse("mirror-1", gyldigHendelse));
  assert.equal(oppdaterKall.length, 0);
});

test("oppdaterGoogleHendelse avviser uinnlogget uten å kalle Google", async () => {
  bruker = null;
  const { oppdaterGoogleHendelse } = await actions();
  await assert.rejects(() => oppdaterGoogleHendelse("mirror-1", gyldigHendelse));
  assert.equal(oppdaterKall.length, 0);
});

test("oppdaterGoogleHendelse avviser ugyldig input med ok:false", async () => {
  const { oppdaterGoogleHendelse } = await actions();
  const svar = await oppdaterGoogleHendelse("mirror-1", { ...gyldigHendelse, tittel: "" });
  assert.equal(svar.ok, false);
  assert.equal(oppdaterKall.length, 0);
});

test("oppdaterGoogleHendelse sender coachens EGEN id for COACH", async () => {
  const { oppdaterGoogleHendelse } = await actions();
  const svar = await oppdaterGoogleHendelse("mirror-1", gyldigHendelse);
  assert.equal(svar.ok, true);
  assert.deepEqual(oppdaterKall, [{ userId: "coach-a", mirrorId: "mirror-1" }]);
});

test("slettGoogleHendelse avviser PLAYER uten å kalle Google", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { slettGoogleHendelse } = await actions();
  await assert.rejects(() => slettGoogleHendelse("mirror-1"));
  assert.equal(slettKall.length, 0);
});

test("slettGoogleHendelse avviser uinnlogget uten å kalle Google", async () => {
  bruker = null;
  const { slettGoogleHendelse } = await actions();
  await assert.rejects(() => slettGoogleHendelse("mirror-1"));
  assert.equal(slettKall.length, 0);
});

test("slettGoogleHendelse sender coachens EGEN id for COACH", async () => {
  const { slettGoogleHendelse } = await actions();
  const svar = await slettGoogleHendelse("mirror-1");
  assert.equal(svar.ok, true);
  assert.deepEqual(slettKall, [{ userId: "coach-a", mirrorId: "mirror-1" }]);
});

test("hentKalendervalg avviser PLAYER", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { hentKalendervalg } = await actions();
  await assert.rejects(() => hentKalendervalg());
  assert.equal(hentKalendereKall.length, 0);
});

test("hentKalendervalg avviser uinnlogget", async () => {
  bruker = null;
  const { hentKalendervalg } = await actions();
  await assert.rejects(() => hentKalendervalg());
  assert.equal(hentKalendereKall.length, 0);
});

test("hentKalendervalg henter for coachens EGEN id", async () => {
  const { hentKalendervalg } = await actions();
  const valg = await hentKalendervalg();
  assert.equal(valg.length, 1);
  assert.deepEqual(hentKalendereKall, ["coach-a"]);
});
