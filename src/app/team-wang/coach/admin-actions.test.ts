import assert from "node:assert/strict";
import { mock, test, beforeEach } from "node:test";

import { hashInvitasjonToken, lagInvitasjonToken } from "@/app/team-wang/_data/wang-admin-regler";

type Bruker = { id: string; role: string };
let bruker: Bruker | null = { id: "ss-1", role: "ADMIN" };
let coachGruppeId: string | null = "wang-top-id";
let brukerEpost = "trener@wang.no";
let gruppeSlugId: string | null = "wang-top-id";
let invitasjon: Record<string, unknown> | null = null;
let medlem: { id: string; role: string; endedAt: Date | null } | null = null;
const opprettetInv: Array<Record<string, unknown>> = [];
const opprettetUnntak: Array<Record<string, unknown>> = [];
const medlemCreates: Array<Record<string, unknown>> = [];
const updateWheres: Array<Record<string, unknown>> = [];
const deleteWheres: Array<Record<string, unknown>> = [];

mock.module("server-only", { defaultExport: {} });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async (opts: { allow?: string[] } = {}) => {
      if (!bruker) throw new Error("REDIRECT:/wang");
      if (opts.allow && !opts.allow.includes(bruker.role)) throw new Error("REDIRECT:/portal");
      return bruker;
    },
  },
});
mock.module("@/app/team-wang/_data/wang-tilgang", {
  namedExports: { hentWangCoachGruppeId: async () => coachGruppeId },
});

const inviMock = {
  create: async ({ data }: { data: Record<string, unknown> }) => {
    opprettetInv.push(data);
    return { id: "inv-1", ...data };
  },
  updateMany: async ({ where }: { where: Record<string, unknown> }) => {
    updateWheres.push(where);
    if (!invitasjon || where.id !== invitasjon.id) return { count: 0 };
    if ("groupId" in where && where.groupId !== invitasjon.groupId) return { count: 0 };
    if (invitasjon.acceptedAt || invitasjon.revokedAt) return { count: 0 };
    return { count: 1 };
  },
  findUnique: async ({ where }: { where: { tokenHash: string } }) =>
    invitasjon && invitasjon.tokenHash === where.tokenHash ? invitasjon : null,
};
const prismaMock = {
  wangTrenerInvitasjon: inviMock,
  wangTimeplanUnntak: {
    create: async ({ data }: { data: Record<string, unknown> }) => {
      opprettetUnntak.push(data);
      return { id: "u-1", ...data };
    },
    deleteMany: async ({ where }: { where: Record<string, unknown> }) => {
      deleteWheres.push(where);
      return { count: where.groupId === "wang-top-id" && where.id === "u-1" ? 1 : 0 };
    },
  },
  user: { findUnique: async () => ({ email: brukerEpost }) },
  group: { findUnique: async () => (gruppeSlugId ? { id: gruppeSlugId, arkivertAt: null } : null) },
  groupMember: {
    findUnique: async () => medlem,
    create: async ({ data }: { data: Record<string, unknown> }) => {
      medlemCreates.push(data);
      return data;
    },
    update: async ({ data }: { data: Record<string, unknown> }) => {
      medlemCreates.push({ ...data, oppdatert: true });
      return data;
    },
  },
  $transaction: async <T,>(fn: (tx: typeof prismaMock) => Promise<T>) => fn(prismaMock),
};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });

const hent = () => import("./admin-actions");

function skjema(felt: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(felt)) f.set(k, v);
  return f;
}

beforeEach(() => {
  bruker = { id: "ss-1", role: "ADMIN" };
  coachGruppeId = "wang-top-id";
  brukerEpost = "trener@wang.no";
  gruppeSlugId = "wang-top-id";
  invitasjon = null;
  medlem = null;
  opprettetInv.length = 0;
  opprettetUnntak.length = 0;
  medlemCreates.length = 0;
  updateWheres.length = 0;
  deleteWheres.length = 0;
});

test("sportssjef lager invitasjonslenke: bare hashen lagres, lenken gjelder i sju dager", async () => {
  const actions = await hent();
  const svar = await actions.lagTrenerInvitasjon(skjema({ epost: " Trener@WANG.no " }));
  assert.equal(svar.ok, true);
  if (!svar.ok) return;
  const token = svar.sti.split("/").pop() ?? "";
  assert.match(svar.sti, /^\/team-wang\/coach\/invitasjon\/[A-Za-z0-9_-]{43}$/);
  assert.equal(opprettetInv.length, 1);
  assert.equal(opprettetInv[0].groupId, "wang-top-id");
  assert.equal(opprettetInv[0].mottakerEpost, "trener@wang.no");
  assert.equal(opprettetInv[0].tokenHash, hashInvitasjonToken(token));
  assert.ok(!JSON.stringify(opprettetInv[0]).includes(token), "rå token lagres aldri");
  const dager = ((opprettetInv[0].expiresAt as Date).getTime() - Date.now()) / 86_400_000;
  assert.ok(dager > 6.99 && dager <= 7, `utløp ${dager} dager`);
});

test("trener avvises: kan verken lage invitasjon, trekke den eller lage og fjerne unntak", async () => {
  const actions = await hent();
  bruker = { id: "t-1", role: "COACH" };
  const svar = await Promise.all([
    actions.lagTrenerInvitasjon(skjema({ epost: "ny@wang.no" })),
    actions.trekkTrenerInvitasjon("inv-1"),
    actions.lagTimeplanUnntak(skjema({ fra: "2026-10-22", tekst: "Heldagsprøve" })),
    actions.fjernTimeplanUnntak("u-1"),
  ]);
  for (const s of svar) assert.deepEqual(s, { ok: false, feil: "Bare sportssjef kan gjøre dette." });
  assert.equal(opprettetInv.length + opprettetUnntak.length + updateWheres.length + deleteWheres.length, 0);
});

test("spiller og uinnlogget slipper ikke forbi innloggingsvakten", async () => {
  const actions = await hent();
  bruker = { id: "p-1", role: "PLAYER" };
  await assert.rejects(actions.lagTrenerInvitasjon(skjema({ epost: "x@wang.no" })), /REDIRECT:\/portal/);
  bruker = null;
  await assert.rejects(actions.lagTimeplanUnntak(skjema({ fra: "2026-10-22", tekst: "x" })), /REDIRECT:\/wang/);
});

test("sportssjef uten WANG-gruppe avvises", async () => {
  const actions = await hent();
  coachGruppeId = null;
  const svar = await actions.lagTrenerInvitasjon(skjema({ epost: "ny@wang.no" }));
  assert.equal(svar.ok, false);
});

test("ugyldig e-post gir feil og lagrer ingenting", async () => {
  const actions = await hent();
  const svar = await actions.lagTrenerInvitasjon(skjema({ epost: "ikke-epost" }));
  assert.deepEqual(svar, { ok: false, feil: "Skriv en gyldig e-postadresse." });
  assert.equal(opprettetInv.length, 0);
});

test("trekk tilbake er låst til sportssjefens egen gruppe", async () => {
  const actions = await hent();
  invitasjon = { id: "inv-1", groupId: "annen-gruppe", acceptedAt: null, revokedAt: null };
  const svar = await actions.trekkTrenerInvitasjon("inv-1");
  assert.equal(svar.ok, false);
  assert.equal(updateWheres[0].groupId, "wang-top-id");
});

test("sportssjef lager unntak med dato og tekst i egen gruppe", async () => {
  const actions = await hent();
  const svar = await actions.lagTimeplanUnntak(skjema({ fra: "2026-10-19", til: "2026-10-23", tekst: "  Høstferie   man–fre " }));
  assert.deepEqual(svar, { ok: true });
  assert.equal(opprettetUnntak[0].groupId, "wang-top-id");
  assert.equal(opprettetUnntak[0].tekst, "Høstferie man–fre");
  assert.equal((opprettetUnntak[0].fraDato as Date).toISOString(), "2026-10-19T00:00:00.000Z");
  assert.equal((opprettetUnntak[0].tilDato as Date).toISOString(), "2026-10-23T00:00:00.000Z");
});

test("unntak med til før fra, tom tekst eller for lang tekst avvises", async () => {
  const actions = await hent();
  assert.equal((await actions.lagTimeplanUnntak(skjema({ fra: "2026-10-23", til: "2026-10-19", tekst: "x" }))).ok, false);
  assert.equal((await actions.lagTimeplanUnntak(skjema({ fra: "2026-10-23", tekst: "   " }))).ok, false);
  assert.equal((await actions.lagTimeplanUnntak(skjema({ fra: "2026-02-30", tekst: "x" }))).ok, false);
  assert.equal((await actions.lagTimeplanUnntak(skjema({ fra: "2026-10-23", tekst: "x".repeat(201) }))).ok, false);
  assert.equal(opprettetUnntak.length, 0);
});

test("fjern unntak er låst til egen gruppe", async () => {
  const actions = await hent();
  assert.deepEqual(await actions.fjernTimeplanUnntak("u-1"), { ok: true });
  assert.equal(deleteWheres[0].groupId, "wang-top-id");
  coachGruppeId = "annen-gruppe";
  assert.equal((await actions.fjernTimeplanUnntak("u-1")).ok, false);
});

function gyldigInvitasjon(token: string, over: Record<string, unknown> = {}) {
  return {
    id: "inv-1",
    groupId: "wang-top-id",
    mottakerEpost: "trener@wang.no",
    tokenHash: hashInvitasjonToken(token),
    expiresAt: new Date(Date.now() + 86_400_000),
    acceptedAt: null,
    revokedAt: null,
    ...over,
  };
}

test("trenerkonto med riktig e-post godtar og blir COACH-medlem", async () => {
  const actions = await hent();
  bruker = { id: "t-2", role: "COACH" };
  const token = lagInvitasjonToken();
  invitasjon = gyldigInvitasjon(token);
  assert.deepEqual(await actions.aksepterTrenerInvitasjon(token), { ok: true });
  assert.deepEqual(medlemCreates, [{ groupId: "wang-top-id", userId: "t-2", role: "COACH" }]);
});

test("godta avvises for feil e-post, utløpt, trukket, annen gruppe, ugyldig token og spillerkonto", async () => {
  const actions = await hent();
  const token = lagInvitasjonToken();
  bruker = { id: "t-2", role: "COACH" };

  brukerEpost = "annen@wang.no";
  invitasjon = gyldigInvitasjon(token);
  assert.equal((await actions.aksepterTrenerInvitasjon(token)).ok, false);
  brukerEpost = "trener@wang.no";

  invitasjon = gyldigInvitasjon(token, { expiresAt: new Date(Date.now() - 1000) });
  assert.equal((await actions.aksepterTrenerInvitasjon(token)).ok, false);

  invitasjon = gyldigInvitasjon(token, { revokedAt: new Date() });
  assert.equal((await actions.aksepterTrenerInvitasjon(token)).ok, false);

  invitasjon = gyldigInvitasjon(token);
  gruppeSlugId = "demo-gruppe";
  assert.equal((await actions.aksepterTrenerInvitasjon(token)).ok, false);
  gruppeSlugId = "wang-top-id";

  assert.equal((await actions.aksepterTrenerInvitasjon("kort")).ok, false);
  assert.equal((await actions.aksepterTrenerInvitasjon(lagInvitasjonToken())).ok, false);

  bruker = { id: "p-1", role: "PLAYER" };
  await assert.rejects(actions.aksepterTrenerInvitasjon(token), /REDIRECT:\/portal/);

  bruker = { id: "t-2", role: "COACH" };
  medlem = { id: "gm-1", role: "PLAYER", endedAt: null };
  assert.equal((await actions.aksepterTrenerInvitasjon(token)).ok, false);
  assert.equal(medlemCreates.length, 0);
});
