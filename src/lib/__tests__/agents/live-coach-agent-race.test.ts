// Regresjonstest for race condition i runLiveCoachAgent: to samtidige kall
// (dobbelttrykk fra klient, en retry) på SAMME (userId, liveSessionId) kunne
// begge lese `eksisterende = null` og begge forsøke
// prisma.coachingSession.create(), som traff unik-constrainten
// userId_liveSessionId og kastet en uhåndtert P2002-feil.
//
// Egen fil (ikke lagt til live-coach-agent.test.ts) for å få et rent
// modul-cache: node sin --experimental-test-module-mocks gjenbruker allerede
// lastede ES-moduler ved senere import() i SAMME fil (se header i
// live-coach-agent.test.ts), så en fersk t.mock.module("@/lib/prisma", ...)
// + import("@/lib/agents/live-coach-agent") trenger en egen fil for å
// garantert få den nymockede prisma-bindingen.
//
// Kjør med:
//   npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/__tests__/agents/live-coach-agent-race.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { Prisma } from "@/generated/prisma/client";

type MeldingRad = { role: string; content: string; ts: string };
type CoachingSessionRad = {
  id: string;
  userId: string;
  coachId: string;
  liveSessionId: string;
  messages: MeldingRad[];
};

test("runLiveCoachAgent — to samtidige kall på samme økt gir ingen uhåndtert feil og kun én lagret velkomst", async (t) => {
  // In-memory "database" som håndhever @@unique([userId, liveSessionId]) slik
  // ekte Postgres gjør. create() sin kropp er BEVISST synkron (ingen await før
  // sjekk+innsetting) slik at den oppfører seg atomisk i JS sin
  // enkelttrådede kjøremodell — akkurat som en ekte DB-transaksjon ville gjort
  // for to samtidige INSERT-er mot samme unik-nøkkel.
  const db = new Map<string, CoachingSessionRad>();
  let idTeller = 0;
  let createForsok = 0;
  let createSuksess = 0;
  const updateCalls: unknown[] = [];
  const notificationCalls: unknown[] = [];
  const agentRunCalls: Array<{ status: string }> = [];

  const noekkel = (userId: string, liveSessionId: string) => `${userId}:${liveSessionId}`;

  // Tving statisk fallback-velkomst uansett om ANTHROPIC_API_KEY er satt i
  // det lokale miljøet — testen skal være deterministisk og aldri gjøre et
  // ekte nettverkskall mot Claude.
  t.mock.module("@/lib/ai/client", {
    namedExports: {
      anthropic: null,
      AI_MODEL: "test-modell",
      AI_MAX_TOKENS: 100,
      isAiEnabled: () => false,
    },
  });

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        coachingSession: {
          findUnique: async (args: { where: { userId_liveSessionId: { userId: string; liveSessionId: string } } }) => {
            const rad = db.get(
              noekkel(
                args.where.userId_liveSessionId.userId,
                args.where.userId_liveSessionId.liveSessionId,
              ),
            );
            return rad ? { ...rad } : null;
          },
          // Ingen `async`/`await` i kroppen: sjekk + innsetting skjer i ÉTT
          // synkront steg, slik at to "samtidige" kall via Promise.all ikke
          // kan interleave midt i selve skrive-operasjonen.
          create: (args: { data: { userId: string; coachId: string; liveSessionId: string; messages: unknown } }) => {
            createForsok += 1;
            const key = noekkel(args.data.userId, args.data.liveSessionId);
            if (db.has(key)) {
              return Promise.reject(
                new Prisma.PrismaClientKnownRequestError(
                  "Unique constraint failed on the fields: (`userId`,`liveSessionId`)",
                  { code: "P2002", clientVersion: "test" },
                ),
              );
            }
            const rad: CoachingSessionRad = {
              id: `thread-${++idTeller}`,
              userId: args.data.userId,
              coachId: args.data.coachId,
              liveSessionId: args.data.liveSessionId,
              messages: args.data.messages as MeldingRad[],
            };
            db.set(key, rad);
            createSuksess += 1;
            return Promise.resolve({ ...rad });
          },
          update: async (args: { where: { id: string }; data: { messages: unknown } }) => {
            updateCalls.push(args);
            for (const [key, rad] of db) {
              if (rad.id === args.where.id) {
                const oppdatert: CoachingSessionRad = {
                  ...rad,
                  messages: args.data.messages as MeldingRad[],
                };
                db.set(key, oppdatert);
                return { ...oppdatert };
              }
            }
            throw new Error("fant ikke rad for update i test-mock");
          },
        },
        agentRun: {
          create: async (args: { data: { status: string } }) => {
            agentRunCalls.push({ status: args.data.status });
            return { id: `run-${agentRunCalls.length}` };
          },
        },
        trainingSessionV2: {
          findUnique: async () => ({
            title: "Fredagsøkt",
            notes: null,
            completedSummary: null,
            coachId: "coach-race",
            drills: [{ name: "Wedge-drill", pyramide: null }],
          }),
        },
        user: {
          findUnique: async () => ({ name: "Testspiller" }),
          findFirst: async () => ({ id: "coach-race" }),
        },
        trainingPlan: {
          findFirst: async () => null,
        },
        round: {
          findMany: async () => [],
        },
        notification: {
          create: async (args: unknown) => {
            notificationCalls.push(args);
            return { id: `notif-${notificationCalls.length}` };
          },
        },
      },
    },
  });

  const { runLiveCoachAgent } = await import("@/lib/agents/live-coach-agent");

  const [resultatA, resultatB] = await Promise.all([
    runLiveCoachAgent({ userId: "user-race", sessionId: "session-race", kind: "session-v2" }),
    runLiveCoachAgent({ userId: "user-race", sessionId: "session-race", kind: "session-v2" }),
  ]);

  // Ingen uhåndtert feil: begge kallene resolver (Promise.all ville kastet
  // ellers), og runAgent-wrapperen logget "OK" for begge — ikke "ERROR".
  assert.equal(agentRunCalls.length, 2);
  assert.ok(
    agentRunCalls.every((r) => r.status === "OK"),
    "begge kjøringene skal logges som OK, ingen skal boble opp som ERROR",
  );

  // Begge create()-kallene ble forsøkt, men bare ett vant unik-constrainten.
  assert.equal(createForsok, 2, "begge racerne skal ha forsøkt create()");
  assert.equal(createSuksess, 1, "kun ett create()-kall skal ha lykkes");

  // Taperen skal IKKE ha falt tilbake til en update() (velkomsten fantes
  // allerede fra vinneren, så taperen tar idempotent skip-veien).
  assert.equal(updateCalls.length, 0);

  // Nøyaktig én rad i "databasen", med nøyaktig én velkomstmelding — ikke duplikat.
  assert.equal(db.size, 1);
  const lagretRad = [...db.values()][0];
  assert.equal(lagretRad.messages.length, 1, "kun én velkomstmelding skal være lagret, ikke duplikat");
  assert.equal(lagretRad.messages[0].role, "assistant");

  // Nøyaktig én av de to kallene eier velkomsten (welcomeSent: true), det
  // andre skal ha tapt racet og skippet idempotent (welcomeSent: false).
  const outputA = resultatA.output as { welcomeSent: boolean; threadId: string };
  const outputB = resultatB.output as { welcomeSent: boolean; threadId: string };
  const sendtFlagg = [outputA.welcomeSent, outputB.welcomeSent].sort();
  assert.deepEqual(sendtFlagg, [false, true]);
  assert.equal(outputA.threadId, outputB.threadId, "begge skal peke på samme (eneste) tråd");

  // Vinneren varsler både spilleren og coachen (2 notify()-kall, ulik
  // userId/coachId i mocken) — taperen returnerer tidlig og skipper notify()
  // helt. Skulle taperen IKKE ha tatt idempotent-skip-veien, ville vi sett
  // 4 varsler (dobbelt opp), ikke 2.
  assert.equal(
    notificationCalls.length,
    2,
    "kun vinneren av racet skal trigge notify() (spiller + coach), taperen skal ikke doble opp",
  );
});
