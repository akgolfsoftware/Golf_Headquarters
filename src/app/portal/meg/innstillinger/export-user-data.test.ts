import assert from "node:assert/strict";
import { mock, test } from "node:test";

import { tommeUkeplandetaljer } from "@/lib/workbench/ukeplan-schema";

const bruker = { id: "syntetisk-spiller", name: "Testspiller", email: "spiller@example.invalid" };
let innlogget = true;
let venterPaSamtykke = false;
let feilkilde: string | null = null;
let epostFeiler = false;
let profilMangler = false;
let ukeplaner: { id: string; playerId: string; isoYear: number; weekNumber: number; planningDetails: unknown }[] = [];
let lesinger: Array<{ kilde: string; where: unknown }> = [];
let eposter: unknown[] = [];
let revisjoner: Array<{ metadata?: unknown }> = [];
let feil: Array<{ context: string }> = [];

const kilder = [
  "goal", "round", "roundDraft", "tournamentEntry", "seasonPlan", "trainingSessionV2",
  "testResult", "trackManSession", "payment", "notification", "healthEntry",
  "equipmentBag", "caddieMessage", "coachNote", "coachingSession",
  "sessionRecording", "leave", "talentTracking", "document", "trainingLog",
  "playerSwingVideo", "delingsSamtykke", "iupBesvarelse", "weekPlan", "trenerDelingsInvitasjon",
  "workbenchSession", "workbenchPhysicalBlock", "workbenchPhysicalLog", "workbenchTournamentPlan", "workbenchPlanConflict", "playerBusyBlock",
  "planAction",
];
const prismaMock = Object.fromEntries(kilder.map((kilde) => [kilde, {
  findMany: async ({ where }: { where: unknown }) => {
    lesinger.push({ kilde, where });
    if (feilkilde === kilde) throw new Error("Syntetisk lesefeil");
    if (kilde === "weekPlan") return ukeplaner.filter(p => p.playerId === (where as { playerId: string }).playerId);
    if (kilde === "document") return [{ url: "private/test-document", title: "Testdokument" }];
    if (kilde === "sessionRecording") return [{ id: "opptak-test", audioUrl: "private/test-audio" }];
    if (kilde === "playerSwingVideo") return [{ id: "video-test", storagePath: "private/test-video" }];
    if (kilde === "planAction" && (where as { actionType?: string }).actionType === "WORKBENCH_GATHERING_INVITE") return [{
      id: "samling-test", suggestion: {
        versjon: 1, samling: { id: "samling-syntetisk", groupId: "gruppe-syntetisk", tittel: "Syntetisk samling", beskrivelse: null, sted: "Testbane",
          fra: "2026-10-12T08:00:00.000Z", til: "2026-10-14T15:00:00.000Z", kind: "SAMLING", updatedAt: "2026-10-02T10:00:00.000Z" },
        oktversjon: "a".repeat(64), okter: [{ sourceSessionId: "okt-syntetisk", updatedAt: "2026-10-02T10:00:00.000Z", date: "2026-10-13",
          startMinute: 540, durationMinutes: 60, title: "Syntetisk økt", pyramid: "TEK", blockType: "OEKT", environment: null, practiceType: null,
          skillArea: null, pressureLevel: null, pPosisjoner: [], location: null, maalsetning: null, drills: [] }],
      }, status: "PENDING", createdAt: new Date("2026-10-02T10:00:00.000Z"), decidedAt: null,
    }];
    if (kilde === "planAction" && "coachId" in (where as object)) return [{
      id: "skrevet-test", suggestion: { organisasjon: "WANG", handling: "ADD", begrunnelse: "Syntetisk trenerbegrunnelse", etter: { title: "Spillerens private økt" } },
      status: "PENDING", createdAt: new Date("2026-10-02T10:00:00.000Z"),
    }];
    if (kilde === "planAction") return [{ id: "forslag-test", actionType: "WORKBENCH_COACH_PROPOSAL", suggestion: { begrunnelse: "Syntetisk" }, status: "PENDING" }];
    return [];
  },
}]));
Object.assign(prismaMock, { user: {
  findUnique: async ({ where }: { where: unknown }) => {
    lesinger.push({ kilde: "user", where });
    if (feilkilde === "user") throw new Error("Syntetisk profilfeil");
    return profilMangler ? null : bruker;
  },
} });

mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
mock.module("@/lib/auth/getCurrentUser", {
  namedExports: { getCurrentUser: async () => innlogget ? bruker : null },
});
mock.module("@/lib/auth/requireConsentingUser", {
  namedExports: { assertNotAwaitingConsent: () => {
    if (venterPaSamtykke) throw new Error("Samtykke mangler");
  } },
});
mock.module("@/lib/email", { namedExports: {
  FRA_EPOST: "test@example.invalid",
  resendKlient: () => ({ emails: { send: async (input: unknown) => {
    if (epostFeiler) throw new Error("Syntetisk e-postfeil");
    eposter.push(input);
  } } }),
} });
mock.module("@/lib/email/templates/shared", {
  namedExports: { emailLayout: ({ body }: { body: string }) => body },
});
mock.module("@/lib/audit", {
  namedExports: { audit: async (input: { metadata?: unknown }) => { revisjoner.push(input); } },
});
mock.module("@/lib/error-tracking", {
  namedExports: { logError: async (input: { context: string }) => { feil.push(input); } },
});

test.beforeEach(() => {
  innlogget = true;
  venterPaSamtykke = false;
  feilkilde = null;
  epostFeiler = false;
  profilMangler = false;
  ukeplaner = [];
  lesinger = [];
  eposter = [];
  revisjoner = [];
  feil = [];
});

test("eksport avviser uinnlogget før lesing eller e-post", async () => {
  innlogget = false;
  const { exportUserData } = await import("./actions");
  assert.deepEqual(await exportUserData(), { ok: false, error: "unauthenticated" });
  assert.equal(lesinger.length, 0);
  assert.equal(eposter.length, 0);
});

test("eksport beholder samtykkesperren", async () => {
  venterPaSamtykke = true;
  const { exportUserData } = await import("./actions");
  await assert.rejects(exportUserData, /Samtykke mangler/);
  assert.equal(lesinger.length, 0);
});

for (const kilde of ["user", ...kilder]) {
  test(`lesefeil i ${kilde} gir avvist eksport uten suksesskvittering`, async () => {
    feilkilde = kilde;
    const { exportUserData } = await import("./actions");
    const resultat = await exportUserData();
    assert.equal(resultat.ok, false);
    assert.equal(resultat.data, undefined);
    assert.equal(eposter.length, 0);
    assert.equal(revisjoner.length, 0);
    assert.equal(feil.at(-1)?.context, "gdpr.export");
  });
}

test("forsvunnet profil gir avvist eksport", async () => {
  profilMangler = true;
  const { exportUserData } = await import("./actions");
  assert.equal((await exportUserData()).ok, false);
  assert.equal(eposter.length, 0);
  assert.equal(revisjoner.length, 0);
});

test("vellykket eksport beholder datakilder og filreferanser, avgrenset til innlogget eier", async () => {
  const { exportUserData } = await import("./actions");
  const resultat = await exportUserData();
  assert.equal(resultat.ok, true);
  assert.equal(lesinger.length, kilder.length + 4);
  for (const { kilde, where } of lesinger) {
    if (kilde === "planAction") {
      const query = where as { userId?: string; coachId?: string; actionType: string };
      assert.deepEqual(where, "coachId" in (where as object)
        ? { coachId: bruker.id, actionType: query.actionType }
        : { userId: bruker.id, actionType: query.actionType });
      assert.ok(["WORKBENCH_COACH_PROPOSAL", "WORKBENCH_GATHERING_INVITE"].includes(query.actionType));
      continue;
    }
    const felt = kilde === "user" ? "id" :
      kilde === "trainingSessionV2" ? "studentId" :
      ["coachNote", "sessionRecording", "weekPlan"].includes(kilde) || (kilde.startsWith("workbench") && kilde !== "playerBusyBlock") ? "playerId" : "userId";
    assert.deepEqual(where, kilde === "trenerDelingsInvitasjon" ? {
      OR: [{ userId: bruker.id }, { gittAvUserId: bruker.id }, { acceptedByUserId: bruker.id }, { mottakerEpost: bruker.email }],
    } : { [felt]: bruker.id });
  }
  assert.deepEqual(resultat.data?._storageFiler, [
    { type: "document", url: "private/test-document", title: "Testdokument" },
    { type: "opptak", url: "private/test-audio", id: "opptak-test" },
    { type: "swing-video", url: "private/test-video", id: "video-test" },
  ]);
  assert.deepEqual(resultat.data?.workbench, { sessions: [], physicalBlocks: [], physicalLogs: [], tournamentPlans: [], conflicts: [], calendarEvents: [] });
  assert.deepEqual(resultat.data?.trenerforslag, [{ id: "forslag-test", actionType: "WORKBENCH_COACH_PROPOSAL", suggestion: { begrunnelse: "Syntetisk" }, status: "PENDING" }]);
  assert.deepEqual(resultat.data?.trenerforslagSkrevet, [{ id: "skrevet-test", organisasjon: "WANG", handling: "ADD", begrunnelse: "Syntetisk trenerbegrunnelse", status: "PENDING", opprettet: "2026-10-02T10:00:00.000Z" }]);
  assert.equal((resultat.data?.samlingsinvitasjoner as unknown[])?.length, 1);
  assert.equal((resultat.data?.samlingsinvitasjonerSkrevet as unknown[])?.length, 1);
  assert.doesNotMatch(JSON.stringify(resultat.data?.samlingsinvitasjonerSkrevet), /playerId|recipientId|userId/);
  assert.doesNotMatch(JSON.stringify(resultat.data?.trenerforslagSkrevet), /Spillerens private økt/);
  assert.ok(!String(resultat.data?._note).includes("komplett"));
  assert.ok(!JSON.stringify(eposter).includes("komplett"));
  assert.ok(!JSON.stringify(revisjoner).includes(bruker.email));
  assert.equal(eposter.length, 1);
});

test("e-postfeil ødelegger ikke en vellykket nedlastbar eksport", async () => {
  epostFeiler = true;
  const { exportUserData } = await import("./actions");
  const resultat = await exportUserData();
  assert.equal(resultat.ok, true);
  assert.ok(resultat.data);
  assert.equal(feil.at(-1)?.context, "gdpr.export.epost");
  assert.equal(revisjoner.length, 1);
});


test("eksport inkluderer alle eierens ukeplanår og ny JSON; annen eier utelates", async () => {
  const details = tommeUkeplandetaljer();
  details.location = "Syntetisk anlegg"; details.areas.TEK.focus = "Syntetisk fokus";
  ukeplaner = [
    { id: "egen-eldre", playerId: bruker.id, isoYear: 2021, weekNumber: 53, planningDetails: null },
    { id: "egen-ny", playerId: bruker.id, isoYear: 2027, weekNumber: 1, planningDetails: details },
    { id: "fremmed", playerId: "syntetisk-annen-eier", isoYear: 2027, weekNumber: 1, planningDetails: { private: "skal ikke eksporteres" } },
  ];
  const { exportUserData } = await import("./actions");
  const result = await exportUserData(); assert.equal(result.ok, true);
  assert.deepEqual(result.data?.weekPlans, ukeplaner.slice(0, 2));
  assert.doesNotMatch(JSON.stringify(result.data), /fremmed|skal ikke eksporteres/);
  assert.deepEqual(lesinger.find(l => l.kilde === "weekPlan")?.where, { playerId: bruker.id });
  assert.equal(eposter.length, 1, "bare den eksisterende syntetiske e-postmocken brukes");
  assert.doesNotMatch(JSON.stringify(eposter), /Syntetisk anlegg|Syntetisk fokus|skal ikke eksporteres/);
  assert.doesNotMatch(JSON.stringify(revisjoner), /Syntetisk anlegg|Syntetisk fokus/);
});
