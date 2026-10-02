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
  "playerSwingVideo", "delingsSamtykke", "iupBesvarelse", "weekPlan",
];
const prismaMock = Object.fromEntries(kilder.map((kilde) => [kilde, {
  findMany: async ({ where }: { where: unknown }) => {
    lesinger.push({ kilde, where });
    if (feilkilde === kilde) throw new Error("Syntetisk lesefeil");
    if (kilde === "weekPlan") return ukeplaner.filter(p => p.playerId === (where as { playerId: string }).playerId);
    if (kilde === "document") return [{ url: "private/test-document", title: "Testdokument" }];
    if (kilde === "sessionRecording") return [{ id: "opptak-test", audioUrl: "private/test-audio" }];
    if (kilde === "playerSwingVideo") return [{ id: "video-test", storagePath: "private/test-video" }];
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
  assert.equal(lesinger.length, kilder.length + 1);
  for (const { kilde, where } of lesinger) {
    const felt = kilde === "user" ? "id" :
      kilde === "trainingSessionV2" ? "studentId" :
      ["coachNote", "sessionRecording", "weekPlan"].includes(kilde) ? "playerId" : "userId";
    assert.deepEqual(where, { [felt]: bruker.id });
  }
  assert.deepEqual(resultat.data?._storageFiler, [
    { type: "document", url: "private/test-document", title: "Testdokument" },
    { type: "opptak", url: "private/test-audio", id: "opptak-test" },
    { type: "swing-video", url: "private/test-video", id: "video-test" },
  ]);
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
