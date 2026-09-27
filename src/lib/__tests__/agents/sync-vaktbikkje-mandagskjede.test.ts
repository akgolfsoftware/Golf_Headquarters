// Tester for runSyncVaktbikkje sin nye pipelines-mandagskjede-sjekk
// (dashboard.modell_kjoring) — beslutninger.md §PIPELINES ER ENESTE KILDE,
// punkt 6: "Ferdig når simulert rød kjøring gir varsel."
//
// Egen fil (ikke sync-vaktbikkje.test.ts): den filen mocker prisma som `{}`
// og importerer kun de rene funksjonene — modulen under test kan bare
// importeres ÉN gang per fil (samme fallgruve som ellers i agent-testene),
// så en fullstendig DB-mock for runSyncVaktbikkje trenger sin egen fil.
//
// Kjør med: npm test

import { test } from "node:test";
import assert from "node:assert/strict";

type AgentRunCreateArgs = {
  data: { agentName: string; status: string; output?: unknown };
};

test("sync-vaktbikkje — dashboard.modell_kjoring (pipelines mandagskjede)", async (t) => {
  let modellKjoringRader: { beregnet_at: Date; konvergert: boolean }[] = [];
  const varsleCalls: { tittel: string; tekst: string }[] = [];
  const agentRunCalls: AgentRunCreateArgs[] = [];

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        publicPlayerRound: { findFirst: async () => ({ createdAt: new Date("2026-08-16T20:00:00Z") }) },
        tournament: { findFirst: async () => ({ lastSyncAt: new Date("2026-08-16T20:00:00Z") }) },
        sgBaseline: { findFirst: async () => ({ fetchedAt: new Date("2026-08-10T06:00:00Z") }) },
        pgaPlayerSeason: { findFirst: async () => ({ lastUpdated: new Date("2026-08-10T06:00:00Z") }) },
        user: { findFirst: async () => ({ id: "admin-1", role: "ADMIN" }) },
        $queryRaw: async () => modellKjoringRader,
        agentRun: {
          create: async (args: AgentRunCreateArgs) => {
            agentRunCalls.push(args);
            return { id: `run-${agentRunCalls.length}` };
          },
        },
      },
    },
  });

  t.mock.module("@/lib/agents/agent-notify", {
    namedExports: {
      varsleAgentFunn: async (v: { tittel: string; tekst: string }) => {
        varsleCalls.push(v);
      },
    },
  });

  const { runSyncVaktbikkje } = await import("@/lib/agents/sync-vaktbikkje");

  const mandag = new Date("2026-08-17T08:00:00Z"); // sesong (august)

  // Scenario 1: alt friskt og konvergert=true → ingen varsling.
  modellKjoringRader = [{ beregnet_at: new Date("2026-08-16T04:30:00Z"), konvergert: true }];
  const r1 = await runSyncVaktbikkje(mandag);
  assert.equal(varsleCalls.length, 0, "frisk + konvergert skal ikke varsle");
  assert.deepEqual(r1.output, { varslet: false, sjekket: 5, brudd: [] });

  // Scenario 2: RØD KJØRING — fersk rad, men konvergert=false → varsel,
  // selv om raden er ny nok til at den ellers ikke ville telt som "stale".
  varsleCalls.length = 0;
  modellKjoringRader = [{ beregnet_at: new Date("2026-08-16T04:30:00Z"), konvergert: false }];
  const r2 = await runSyncVaktbikkje(mandag);
  assert.equal(varsleCalls.length, 1, "rød kjøring (konvergert=false) skal varsle selv om fersk");
  assert.match(varsleCalls[0].tekst, /KONVERGERTE IKKE/);
  assert.equal((r2.output as { rodKjoring: boolean }).rodKjoring, true);

  // Scenario 3: mangler helt (tabellen tom / jobben har aldri kjørt) → brudd
  // via den vanlige ferskhets-veien (sist=null).
  varsleCalls.length = 0;
  modellKjoringRader = [];
  const r3 = await runSyncVaktbikkje(mandag);
  assert.equal(varsleCalls.length, 1, "manglende mandagskjede skal varsle");
  assert.match(varsleCalls[0].tekst, /Pipelines mandagskjede.*har aldri levert data/);
  const brudd3 = (r3.output as { brudd: { navn: string }[] }).brudd;
  assert.ok(brudd3.some((b) => b.navn === "Pipelines mandagskjede (feltstyrke-modell)"));
});
