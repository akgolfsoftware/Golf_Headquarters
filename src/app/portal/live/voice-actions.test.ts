import { before, beforeEach, describe, mock, test } from "node:test";
import assert from "node:assert/strict";

type Bruker = { id: string; role: string };
type Okt = { notes: string | null; studentId: string | null; coachId: string } | null;

let bruker: Bruker;
let okt: Okt;
let coachTilgang: boolean;
let dbFeiler: boolean;
const oppdateringer: Array<Record<string, unknown>> = [];
const notater: Array<Record<string, unknown>> = [];

const fil = (rel: string) => new URL(rel, import.meta.url).pathname;

mock.module(fil("../../../lib/auth/requireConsentingUser.ts"), {
  namedExports: { requireConsentingUser: async () => bruker },
});
mock.module(fil("../../../lib/auth/coached.ts"), {
  namedExports: { harCoachTilgangTilSpiller: async () => coachTilgang },
});
mock.module(fil("../../../lib/error-tracking.ts"), {
  namedExports: { logError: async () => undefined },
});
mock.module(fil("../../../lib/workbench/v2-sync.ts"), {
  namedExports: { resolveCoachIdForPlayer: async () => "coach-1" },
});
mock.module(fil("../../../lib/voice/whisper-transcribe.ts"), {
  namedExports: {
    transcribeAudioWithWhisper: async () => "",
    parseVoiceRangeNote: () => ({}),
  },
});
mock.module(fil("../../../lib/prisma.ts"), {
  namedExports: {
    prisma: {
      trainingSessionV2: {
        findUnique: async () => {
          if (dbFeiler) throw new Error("db nede");
          return okt;
        },
        update: async (arg: { data: Record<string, unknown> }) => {
          oppdateringer.push(arg.data);
          return {};
        },
      },
      coachNote: {
        create: async (arg: { data: Record<string, unknown> }) => {
          notater.push(arg.data);
          return {};
        },
      },
    },
  },
});
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });

let actions: typeof import("./voice-actions");
before(async () => {
  actions = await import("./voice-actions");
});

const obs = (rawTranscript = "Slice med driver") => ({
  rawTranscript,
  club: "Driver",
  position: null,
  positionName: null,
  swingObservation: null,
  suggestedDrill: null,
  suggestedReps: null,
});

describe("saveVoiceRangeMemo", () => {
  beforeEach(() => {
    bruker = { id: "spiller-1", role: "PLAYER" };
    okt = { notes: null, studentId: "spiller-1", coachId: "coach-1" };
    coachTilgang = false;
    dbFeiler = false;
    oppdateringer.length = 0;
    notater.length = 0;
  });

  test("eieren får lagret notat på egen økt", async () => {
    const res = await actions.saveVoiceRangeMemo({
      sessionId: "o1",
      observation: obs(),
      destination: "session",
    });
    assert.equal(res.ok, true);
    assert.equal(oppdateringer.length, 1);
  });

  test("andres økt: ikke lagret og ok=false", async () => {
    okt = { notes: null, studentId: "annen", coachId: "coach-9" };
    const res = await actions.saveVoiceRangeMemo({
      sessionId: "o1",
      observation: obs(),
      destination: "session",
    });
    assert.equal(res.ok, false);
    assert.equal(oppdateringer.length, 0);
  });

  test("coach med tilgang til spilleren kan skrive", async () => {
    bruker = { id: "coach-2", role: "COACH" };
    okt = { notes: "eldre", studentId: "annen", coachId: "coach-9" };
    coachTilgang = true;
    const res = await actions.saveVoiceRangeMemo({
      sessionId: "o1",
      observation: obs(),
      destination: "session",
    });
    assert.equal(res.ok, true);
    assert.match(String(oppdateringer[0]?.notes), /^eldre\n\nTalenotat/);
  });

  test("coach uten tilgang avvises", async () => {
    bruker = { id: "coach-2", role: "COACH" };
    okt = { notes: null, studentId: "annen", coachId: "coach-9" };
    const res = await actions.saveVoiceRangeMemo({
      sessionId: "o1",
      observation: obs(),
      destination: "session",
    });
    assert.equal(res.ok, false);
    assert.equal(oppdateringer.length, 0);
  });

  test("økt finnes ikke: ok=false, ikke «lagret»", async () => {
    okt = null;
    const res = await actions.saveVoiceRangeMemo({
      sessionId: "o1",
      observation: obs(),
      destination: "session",
    });
    assert.equal(res.ok, false);
    assert.doesNotMatch(res.message, /^Notat lagret/);
  });

  test("databasefeil gir ok=false, ikke «lagret»", async () => {
    dbFeiler = true;
    const res = await actions.saveVoiceRangeMemo({
      sessionId: "o1",
      observation: obs(),
      destination: "session",
    });
    assert.equal(res.ok, false);
  });

  test("tomt og altfor langt notat avvises", async () => {
    const tomt = await actions.saveVoiceRangeMemo({
      sessionId: "o1",
      observation: obs("   "),
      destination: "session",
    });
    const langt = await actions.saveVoiceRangeMemo({
      sessionId: "o1",
      observation: obs("x".repeat(5000)),
      destination: "session",
    });
    assert.equal(tomt.ok, false);
    assert.equal(langt.ok, false);
    assert.equal(oppdateringer.length, 0);
  });

  test("task_proposal lagrer ingenting og sier ikke «registrert»", async () => {
    const res = await actions.saveVoiceRangeMemo({
      observation: obs(),
      destination: "task_proposal",
    });
    assert.equal(res.ok, false);
    assert.equal(oppdateringer.length + notater.length, 0);
  });

  test("coach_inbox lagrer fortsatt", async () => {
    const res = await actions.saveVoiceRangeMemo({
      observation: obs(),
      destination: "coach_inbox",
    });
    assert.equal(res.ok, true);
    assert.equal(notater.length, 1);
  });
});
