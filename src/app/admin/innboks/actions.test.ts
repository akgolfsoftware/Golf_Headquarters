/**
 * R-I: admin/innboks/actions.ts. Innboksen er en ruter over fem eksisterende
 * saktyper — testen dekker (1) rollegrensen (`requirePortalUser`: PLAYER/
 * uinnlogget avvist for begge exports), (2) at hver kilde-gren faktisk
 * ruter til riktig underliggende handling med riktig valg/grunn, og (3) det
 * ene stedet innboksen selv håndhever en strengere regel enn "COACH/ADMIN":
 * `sak`-kilden (Anders' egen triage-kø) krever ADMIN, ikke COACH — en coach
 * skal få `ok:false`, ikke tilgang, selv med en gjettet sak-id.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

let appFeedbackUpdates: unknown[] = [];
let acceptPlanActionKall: string[] = [];
let rejectPlanActionKall: Array<{ id: string; grunn?: string }> = [];
let godkjennCaddieDraftKall: string[] = [];
let avvisProaktivtForslagKall: string[] = [];
let markerSomPlanlagtKall: string[] = [];
let avslaaForespørselKall: string[] = [];
let markerVarselLestKall: string[] = [];
let godkjennSakKall: string[] = [];
let avvisSakKall: string[] = [];
let sakSvar: { ok: boolean; feil?: string } = { ok: true };
let kastFraHandling: string | null = null;

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  appFeedbackUpdates = [];
  acceptPlanActionKall = [];
  rejectPlanActionKall = [];
  godkjennCaddieDraftKall = [];
  avvisProaktivtForslagKall = [];
  markerSomPlanlagtKall = [];
  avslaaForespørselKall = [];
  markerVarselLestKall = [];
  godkjennSakKall = [];
  avvisSakKall = [];
  sakSvar = { ok: true };
  kastFraHandling = null;
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
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  appFeedback: {
    updateMany: async (input: unknown) => {
      appFeedbackUpdates.push(input);
      return { count: 1 };
    },
  },
});
mock.module("@/lib/agents/actions", {
  namedExports: {
    acceptPlanAction: async (id: string) => {
      if (kastFraHandling) throw new Error(kastFraHandling);
      acceptPlanActionKall.push(id);
    },
    rejectPlanAction: async (id: string, grunn?: string) => {
      if (kastFraHandling) throw new Error(kastFraHandling);
      rejectPlanActionKall.push({ id, grunn });
    },
  },
});
mock.module("@/app/admin/agencyos/caddie/dashbord/actions", {
  namedExports: {
    godkjennCaddieDraft: async (id: string) => {
      if (kastFraHandling) throw new Error(kastFraHandling);
      godkjennCaddieDraftKall.push(id);
    },
    avvisProaktivtForslag: async (id: string) => {
      if (kastFraHandling) throw new Error(kastFraHandling);
      avvisProaktivtForslagKall.push(id);
    },
  },
});
mock.module("@/app/admin/(legacy)/foresporsler/actions", {
  namedExports: {
    markerSomPlanlagt: async (id: string) => {
      markerSomPlanlagtKall.push(id);
    },
    "avslaaForespørsel": async (id: string) => {
      avslaaForespørselKall.push(id);
    },
  },
});
mock.module("@/app/admin/varsler/actions", {
  namedExports: {
    markerVarselLest: async (id: string) => {
      markerVarselLestKall.push(id);
    },
  },
});
mock.module("@/lib/saker/godkjenn", {
  namedExports: {
    godkjennSak: async (id: string) => {
      godkjennSakKall.push(id);
      return sakSvar;
    },
    avvisSak: async (id: string) => {
      avvisSakKall.push(id);
      return sakSvar;
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("markerAppFeedbackSett avviser PLAYER uten å skrive", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { markerAppFeedbackSett } = await actions();
  await assert.rejects(() => markerAppFeedbackSett("fb-1"));
  assert.equal(appFeedbackUpdates.length, 0);
});

test("markerAppFeedbackSett avviser uinnlogget uten å skrive", async () => {
  bruker = null;
  const { markerAppFeedbackSett } = await actions();
  await assert.rejects(() => markerAppFeedbackSett("fb-1"));
  assert.equal(appFeedbackUpdates.length, 0);
});

test("markerAppFeedbackSett markerer SETT for COACH", async () => {
  const { markerAppFeedbackSett } = await actions();
  const svar = await markerAppFeedbackSett("fb-1");
  assert.equal(svar.ok, true);
  assert.equal(appFeedbackUpdates.length, 1);
});

test("avgjorInnboksSak avviser PLAYER uten å rute noe", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { avgjorInnboksSak } = await actions();
  await assert.rejects(() => avgjorInnboksSak("planAction:pa-1", "godkjenn"));
  assert.equal(acceptPlanActionKall.length, 0);
});

test("avgjorInnboksSak avviser uinnlogget uten å rute noe", async () => {
  bruker = null;
  const { avgjorInnboksSak } = await actions();
  await assert.rejects(() => avgjorInnboksSak("planAction:pa-1", "godkjenn"));
  assert.equal(acceptPlanActionKall.length, 0);
});

test("avgjorInnboksSak avviser ukjent kilde med ok:false", async () => {
  const { avgjorInnboksSak } = await actions();
  const svar = await avgjorInnboksSak("ukjent:xyz", "godkjenn");
  assert.equal(svar.ok, false);
  assert.equal(svar.feil, "Ukjent sak.");
});

test("avgjorInnboksSak ruter planAction godkjenn til acceptPlanAction", async () => {
  const { avgjorInnboksSak } = await actions();
  const svar = await avgjorInnboksSak("planAction:pa-1", "godkjenn");
  assert.equal(svar.ok, true);
  assert.deepEqual(acceptPlanActionKall, ["pa-1"]);
});

test("avgjorInnboksSak ruter planAction avvis med grunn til rejectPlanAction", async () => {
  const { avgjorInnboksSak } = await actions();
  const svar = await avgjorInnboksSak("planAction:pa-1", "avvis", "Ikke aktuelt");
  assert.equal(svar.ok, true);
  assert.deepEqual(rejectPlanActionKall, [{ id: "pa-1", grunn: "Ikke aktuelt" }]);
});

test("avgjorInnboksSak ruter caddieDraft godkjenn/avvis", async () => {
  const { avgjorInnboksSak } = await actions();
  await avgjorInnboksSak("caddieDraft:cd-1", "godkjenn");
  await avgjorInnboksSak("caddieDraft:cd-2", "avvis");
  assert.deepEqual(godkjennCaddieDraftKall, ["cd-1"]);
  assert.deepEqual(avvisProaktivtForslagKall, ["cd-2"]);
});

test("avgjorInnboksSak ruter sessionRequest godkjenn/avvis", async () => {
  const { avgjorInnboksSak } = await actions();
  await avgjorInnboksSak("sessionRequest:sr-1", "godkjenn");
  await avgjorInnboksSak("sessionRequest:sr-2", "avvis");
  assert.deepEqual(markerSomPlanlagtKall, ["sr-1"]);
  assert.deepEqual(avslaaForespørselKall, ["sr-2"]);
});

test("avgjorInnboksSak ruter notification til markerVarselLest", async () => {
  const { avgjorInnboksSak } = await actions();
  await avgjorInnboksSak("notification:v-1", "godkjenn");
  assert.deepEqual(markerVarselLestKall, ["v-1"]);
});

test("avgjorInnboksSak avviser sak-kilde for COACH med ok:false, ruter ikke godkjennSak", async () => {
  const { avgjorInnboksSak } = await actions();
  const svar = await avgjorInnboksSak("sak:s-1", "godkjenn");
  assert.equal(svar.ok, false);
  assert.equal(svar.feil, "Kun ADMIN kan avgjøre denne saken.");
  assert.equal(godkjennSakKall.length, 0);
});

test("avgjorInnboksSak lar ADMIN avgjøre sak-kilde", async () => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  const { avgjorInnboksSak } = await actions();
  const svar = await avgjorInnboksSak("sak:s-1", "godkjenn");
  assert.equal(svar.ok, true);
  assert.deepEqual(godkjennSakKall, ["s-1"]);
});

test("avgjorInnboksSak returnerer feil fra godkjennSak uten å kaste", async () => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  sakSvar = { ok: false, feil: "Saken er allerede lukket" };
  const { avgjorInnboksSak } = await actions();
  const svar = await avgjorInnboksSak("sak:s-1", "godkjenn");
  assert.equal(svar.ok, false);
  assert.equal(svar.feil, "Saken er allerede lukket");
});

test("avgjorInnboksSak fanger unntak fra underliggende handling som ok:false", async () => {
  kastFraHandling = "Caddie-utkastet krever ADMIN.";
  const { avgjorInnboksSak } = await actions();
  const svar = await avgjorInnboksSak("caddieDraft:cd-9", "godkjenn");
  assert.equal(svar.ok, false);
  assert.equal(svar.feil, "Caddie-utkastet krever ADMIN.");
});
