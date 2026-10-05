import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";
import { TN_CATALOG } from "@/lib/portal-tester/tn-catalog";

const TN_GROUP_ID = "tn-group";
const WANG_GROUP_ID = "wang-school-a";
const WANG_GROUP_B_ID = "wang-school-b";
const OTHER_GROUP_ID = "other-group";
const coach = { id: "coach-tn", role: "COACH", name: "Testcoach" };
let groups: { id: string; slug: string | null; program: string | null }[];
let createdInput: Record<string, unknown> | null;
let createdStations: Record<string, unknown>[];
const memberships = [
  { groupId: TN_GROUP_ID, userId: "tn-player" },
  { groupId: WANG_GROUP_ID, userId: "wang-player" },
  { groupId: WANG_GROUP_B_ID, userId: "wang-player-b" },
];

mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => coach } });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/domain/tn-testdag-lock", {
  namedExports: { medSerialisertTestdagTransaksjon: async (fn: (tx: unknown) => Promise<unknown>) => fn(tx) },
});

const tx = {
  group: {
    findUnique: async () => ({ id: TN_GROUP_ID }),
    findMany: async ({ where }: { where: { id: { in: string[] } } }) => groups.filter((group) => where.id.in.includes(group.id)),
  },
  groupMember: {
    findFirst: async () => ({ id: "coach-membership" }),
    findMany: async ({ where }: { where: { groupId: string; userId: { in: string[] } } }) =>
      memberships.filter((member) => member.groupId === where.groupId && where.userId.in.includes(member.userId)),
  },
  testDayEvent: {
    create: async ({ data }: { data: Record<string, unknown> }) => {
      createdInput = data;
      return { id: "event-1" };
    },
  },
  testDefinition: {
    upsert: async () => undefined,
  },
  testDay: {
    create: async ({ data }: { data: Record<string, unknown> }) => {
      createdStations.push(data);
      return { id: `station-${createdStations.length}` };
    },
  },
};

mock.module("@/lib/prisma", { namedExports: { prisma: {} } });

beforeEach(() => {
  groups = [
    { id: TN_GROUP_ID, slug: "team-norway", program: null },
    { id: WANG_GROUP_ID, slug: null, program: "WANG_TOPPIDRETT" },
    { id: WANG_GROUP_B_ID, slug: null, program: "WANG_UNG" },
  ];
  createdInput = null;
  createdStations = [];
});

const action = import("./tn-testdag-actions");
const protocol = TN_CATALOG.find((item) => !item.blocked && !item.variableCount)!;
const input = {
  title: "Felles testdag",
  location: "Treningsanlegg",
  scheduledAt: "2026-10-05T08:00:00.000Z",
  stations: [
    { groupId: TN_GROUP_ID, stationName: "Team Norway", protocolId: protocol.id, spillerIder: ["tn-player"] },
    { groupId: WANG_GROUP_ID, stationName: "WANG Oslo", protocolId: protocol.id, spillerIder: ["wang-player"] },
    { groupId: WANG_GROUP_B_ID, stationName: "WANG Stavanger", protocolId: protocol.id, spillerIder: ["wang-player-b"] },
  ],
};

test("oppretter ett arrangement med egne protokollstasjoner og kun eksisterende deltakeridentiteter", async () => {
  const { opprettFellesTestdag } = await action;
  const result = await opprettFellesTestdag(input);
  assert.deepEqual(result, { ok: true, eventId: "event-1", stationIds: ["station-1", "station-2", "station-3"] });
  assert.equal(createdStations.length, 3);
  assert.deepEqual(createdInput, { organizerGroupId: TN_GROUP_ID, organizerId: coach.id, title: input.title, location: input.location, scheduledAt: new Date(input.scheduledAt), status: "ACTIVE" });
  assert.equal(createdStations[0].eventId, "event-1");
  assert.equal(createdStations[0].groupId, TN_GROUP_ID);
  assert.equal(createdStations[1].stationName, "WANG Oslo");
  assert.equal(createdStations[2].stationName, "WANG Stavanger");
  assert.deepEqual(createdStations[0].participants, { create: [{ playerId: "tn-player", order: 0 }] });
  assert.deepEqual(createdStations[1].participants, { create: [{ playerId: "wang-player", order: 0 }] });
  assert.deepEqual(createdStations[2].participants, { create: [{ playerId: "wang-player-b", order: 0 }] });
});

test("avviser fremmed gruppetype selv om en TN- og WANG-stasjon ellers finnes", async () => {
  groups = [
    { id: TN_GROUP_ID, slug: "team-norway", program: null },
    { id: WANG_GROUP_ID, slug: null, program: "WANG_TOPPIDRETT" },
    { id: WANG_GROUP_B_ID, slug: null, program: "WANG_UNG" },
    { id: OTHER_GROUP_ID, slug: null, program: "AK_ACADEMY" },
  ];
  const { opprettFellesTestdag } = await action;
  const result = await opprettFellesTestdag({
    ...input,
    stations: [...input.stations, { groupId: OTHER_GROUP_ID, stationName: "Uvedkommende", protocolId: protocol.id, spillerIder: ["other-player"] }],
  });
  assert.deepEqual(result, { ok: false, error: "Et fellesarrangement kan bare bruke Team Norway- og WANG-grupper." });
  assert.equal(createdInput, null);
  assert.equal(createdStations.length, 0);
});

test("avviser flere stasjoner for samme gruppe før arrangementet skrives", async () => {
  const { opprettFellesTestdag } = await action;
  const result = await opprettFellesTestdag({
    ...input,
    stations: [...input.stations, { ...input.stations[1], stationName: "WANG Oslo putting" }],
  });
  assert.deepEqual(result, { ok: false, error: "Hver skole eller gruppe kan bare ha én stasjon i arrangementet." });
  assert.equal(createdInput, null);
  assert.equal(createdStations.length, 0);
});

test("avviser at en spiller med medlemskap i to grupper blir dobbelt tildelt", async () => {
  const { opprettFellesTestdag } = await action;
  const result = await opprettFellesTestdag({
    ...input,
    stations: [
      { ...input.stations[0], spillerIder: ["shared-player"] },
      { ...input.stations[1], spillerIder: ["shared-player"] },
    ],
  });
  assert.deepEqual(result, { ok: false, error: "En spiller kan bare være tildelt én stasjon per arrangement." });
  assert.equal(createdInput, null);
  assert.equal(createdStations.length, 0);
});

test("avviser en valgt spiller som ikke er aktiv i stasjonsgruppen før arrangementet skrives", async () => {
  groups = [
    { id: TN_GROUP_ID, slug: "team-norway", program: null },
    { id: WANG_GROUP_ID, slug: null, program: "WANG_TOPPIDRETT" },
    { id: WANG_GROUP_B_ID, slug: null, program: "WANG_UNG" },
  ];
  const { opprettFellesTestdag } = await action;
  const result = await opprettFellesTestdag({
    ...input,
    stations: [{ ...input.stations[0], spillerIder: ["outside-player"] }, input.stations[1]],
  });
  assert.deepEqual(result, { ok: false, error: "En eller flere valgte spillere er ikke aktive i stasjonsgruppen." });
  assert.equal(createdInput, null);
  assert.equal(createdStations.length, 0);
});
