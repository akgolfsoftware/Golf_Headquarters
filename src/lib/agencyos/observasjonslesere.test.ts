import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";

type Leser = typeof import("@/lib/deling/ak-treningsobservasjon");
type Resultat = Awaited<ReturnType<Leser["hentAkTreningsobservasjoner"]>>;
const viewer = { id: "synthetic-coach", role: "ADMIN" as const, name: "Syntetisk trener" };
const spillerScope = { id: "synthetic-player" };
let tillatt = true;
let forventetRolle = "ADMIN";
let lesefeil = false;
let antall = 1;
let finnKall: Prisma.PlanActionFindManyArgs[] = [];
let telleKall: Prisma.PlanActionCountArgs[] = [];
let gruppeKall: Prisma.PlanActionGroupByArgs[] = [];
let foresporselKall: Prisma.SessionRequestFindManyArgs[] = [];
let foresporselTelleKall: Prisma.SessionRequestCountArgs[] = [];
let caddieTelleKall: Prisma.CaddieDraftCountArgs[] = [];
let kommandoKall: Prisma.KommandoAgentRunCountArgs[] = [];
let leseKall: Parameters<Leser["hentAkTreningsobservasjoner"]>[1][] = [];
let uten: Prisma.PlanActionWhereInput;
let begrens: Leser["begrensForslagsliste"];

mock.module("@/lib/auth/coached", { namedExports: { coachScopedPlayerWhere: () => spillerScope } });
const tom = async () => [];
mock.module("@/lib/prisma", { namedExports: { prisma: {
  planAction: {
    findMany: async (args: Prisma.PlanActionFindManyArgs) => { finnKall.push(args); return []; },
    count: async (args: Prisma.PlanActionCountArgs) => { telleKall.push(args); return 0; },
    groupBy: async (args: Prisma.PlanActionGroupByArgs) => { gruppeKall.push(args); return []; },
  },
  sessionRequest: { count: async (args: Prisma.SessionRequestCountArgs) => { foresporselTelleKall.push(args); return 3; }, findMany: async (args: Prisma.SessionRequestFindManyArgs) => { foresporselKall.push(args); return []; } },
  user: { findMany: tom, count: async () => 0 },
  booking: { findMany: tom }, caddieDraft: { findMany: tom, count: async (args: Prisma.CaddieDraftCountArgs) => { caddieTelleKall.push(args); return 2; } }, notification: { findMany: tom },
  appFeedback: { findMany: tom }, sak: { findMany: tom }, oppgaveCache: { findMany: tom }, subscription: { findMany: tom },
  round: { aggregate: async () => ({ _avg: { sgTotal: null } }) },
  trainingPlanSession: { groupBy: tom }, signal: { count: async () => 0 },
  kommandoAgentRun: { count: async (args: Prisma.KommandoAgentRunCountArgs) => { kommandoKall.push(args); return args.where?.status === "running" ? 1 : 0; } },
  agentRun: { findMany: tom, count: async () => 0, findFirst: async () => null },
} } });

let workbench: typeof import("./workbench-oppgaver");
let agenticos: typeof import("./last-agenticos");
let brief: typeof import("./daily-brief-data");
let dispatch: typeof import("./ai-dispatch-data");
let kanoniskKo: typeof import("@/lib/admin/ko-telling");
let innboks: typeof import("@/lib/admin/innboks-saker");
before(async () => {
  const ekte = await import("@/lib/deling/ak-treningsobservasjon");
  uten = ekte.UTEN_AK_TRENINGSOBSERVASJON;
  begrens = ekte.begrensForslagsliste;
  mock.module("@/lib/deling/ak-treningsobservasjon", { namedExports: {
    ...ekte,
    hentAkTreningsobservasjoner: async (aktor: typeof viewer, valg: Parameters<Leser["hentAkTreningsobservasjoner"]>[1] = {}): Promise<Resultat> => {
      assert.equal(aktor.id, viewer.id); assert.equal(aktor.role, forventetRolle);
      if (lesefeil) throw new Error("synthetic-sharing-unavailable");
      leseKall.push(valg);
      const historikk = Array.isArray(valg.status);
      const rader = Array.from({ length: tillatt ? antall : 0 }, (_, i) => ({
        id: `${historikk ? "done" : "pending"}-${i}`, userId: spillerScope.id, planId: null, provenance: null,
        actionType: "COACH_REVIEW", agentName: "training-gap", status: historikk ? "ACCEPTED" : "PENDING",
        createdAt: new Date(Date.now() - (antall - i) * 60000), updatedAt: new Date(), sjekkpunkt: null,
        suggestion: { forklaring: "Syntetisk observasjon" }, user: { id: spillerScope.id, name: "Syntetisk spiller" },
      }));
      return {
        planActions: ekte.begrensForslagsliste(rader, valg.maksRader ?? 10, valg.rekkefolge === "eldst"),
        pendingCount: tillatt ? antall : 0, acceptedCount: 0, rejectedCount: 0, accepted7d: 0, rejected7d: 0,
        godkjentAvViewer: tillatt && valg.godkjentAvViewerSiden ? 2 : 0, eldstePending: null,
      };
    },
  } });
  workbench = await import("./workbench-oppgaver");
  agenticos = await import("./last-agenticos");
  brief = await import("./daily-brief-data");
  innboks = await import("@/lib/admin/innboks-saker");
  dispatch = await import("./ai-dispatch-data");
  kanoniskKo = await import("@/lib/admin/ko-telling");
});
beforeEach(() => { tillatt = true; forventetRolle = "ADMIN"; lesefeil = false; antall = 1; finnKall = []; telleKall = []; gruppeKall = []; foresporselKall = []; foresporselTelleKall = []; caddieTelleKall = []; kommandoKall = []; leseKall = []; });

function kontrollerEldreLesere() {
  for (const args of [...finnKall, ...telleKall, ...gruppeKall]) assert.deepEqual(args.where?.NOT, uten.NOT);
}

test("mobiloppgaver bruker mottaker og spiller i SQL før radgrensen, og fersk observasjonsleser", async () => {
  antall = 55;
  const resultat = await workbench.loadWorkbenchOppgaver(viewer);
  assert.equal(resultat.oppgaver.length, 50); assert.equal(resultat.oppgaver[0].refId, "pending-0");
  assert.equal(resultat.oppgaver[0].beskrivelse, "Faglig vurdering");
  assert.deepEqual(finnKall[0].where?.OR, [{ coachId: viewer.id }, { coachId: null }]);
  assert.deepEqual(finnKall[0].where?.user, spillerScope);
  assert.deepEqual(foresporselKall[0].where?.user, spillerScope);
  assert.deepEqual(leseKall[0], { status: "PENDING", maksRader: 50, rekkefolge: "eldst" });
  kontrollerEldreLesere();
  tillatt = false; assert.deepEqual((await workbench.loadWorkbenchOppgaver(viewer)).oppgaver, []);
});

test("AgenticOS viser samme observasjoner i cockpit, kø, godkjenning og teller; trekk fjerner også dagens tall", async () => {
  antall = 25;
  const cockpit = await agenticos.lastAgenticosCockpit(viewer);
  assert.equal(cockpit.neste?.kind, "godkjenn");
  assert.equal(cockpit.neste && "id" in cockpit.neste ? cockpit.neste.id : null, "pending-24");
  assert.equal(cockpit.venterPaDeg, 25); assert.equal(cockpit.godkjentIDag, 2);
  assert.equal((await agenticos.lastAgenticosKo(viewer)).venter.length, 20);
  const godkjenn = await agenticos.lastAgenticosGodkjenn(viewer);
  assert.equal(godkjenn.rader.length, 12); assert.equal(godkjenn.godkjentIDag, 2);
  assert.equal(await agenticos.lastAgenticosGodkjennCount(viewer), 25);
  kontrollerEldreLesere();
  tillatt = false;
  const etter = await agenticos.lastAgenticosCockpit(viewer);
  assert.equal(etter.venterPaDeg, 0); assert.equal(etter.godkjentIDag, 0);
  assert.deepEqual((await agenticos.lastAgenticosKo(viewer)).venter, []);
  assert.deepEqual(await agenticos.lastAgenticosGodkjenn(viewer), { rader: [], godkjentIDag: 0 });
  assert.equal(await agenticos.lastAgenticosGodkjennCount(viewer), 0);
});

test("morgenbriefens forslag og antall bruker samme deling og mottaker", async () => {
  antall = 12;
  const resultat = await brief.loadDailyBrief(viewer);
  assert.equal(resultat.kpis.find(k => k.label === "VENTENDE GODKJENNINGER")?.value, "12");
  assert.ok(resultat.inbox.some(i => JSON.stringify(i).includes("Syntetisk observasjon")));
  assert.deepEqual(gruppeKall[0].where?.user, spillerScope);
  assert.deepEqual(gruppeKall[0].where?.OR, [{ coachId: viewer.id }, { coachId: null }]);
  kontrollerEldreLesere();
  tillatt = false;
  const etter = await brief.loadDailyBrief(viewer);
  assert.equal(etter.kpis.find(k => k.label === "VENTENDE GODKJENNINGER")?.value, "0");
  assert.deepEqual(etter.inbox, []);
});

test("innboksen bruker fersk deling også for løste saker, og påstår ingen utsending", async () => {
  const resultat = await innboks.loadInnboksSaker(viewer);
  assert.equal(resultat.apne, 1); assert.equal(resultat.saker.length, 2);
  assert.equal(resultat.saker.find(s => !s.lost)?.primaer?.label, "Godkjenn");
  assert.equal(resultat.saker.find(s => s.lost)?.sub, "Vurdering godkjent. Ingen trening endret.");
  assert.ok(leseKall.some(v => v?.rekkefolge === "endret" && v.endretSiden instanceof Date));
  kontrollerEldreLesere();
  tillatt = false;
  assert.deepEqual((await innboks.loadInnboksSaker(viewer)).saker, []);
});

test("blandede kilder begrenses samlet og bruker stabil rekkefølge ved samme tidspunkt", () => {
  const gammel = { id: "a", createdAt: new Date(1000) };
  const nyere = { id: "b", createdAt: new Date(2000) };
  const lik = { id: "c", createdAt: new Date(2000) };
  assert.deepEqual(begrens([gammel, nyere, lik], 2).map(r => r.id), ["c", "b"]);
  assert.deepEqual(begrens([nyere, lik, gammel], 2, true).map(r => r.id), ["a", "b"]);
  assert.deepEqual(begrens([gammel], 0), []);
});


test("AI-dispatch teller samme tillatte saker som køen, også for ADMIN og etter trekk", async () => {
  antall = 4;
  const resultat = await dispatch.loadAiDispatch(viewer);
  const ko = await kanoniskKo.koTelling(viewer.id, viewer.role);
  assert.equal(resultat.tellinger.planActions, ko.planActions);
  assert.equal(resultat.tellinger.planActions, 4);
  assert.equal(resultat.tellinger.caddieDrafts, ko.caddieDrafts);
  assert.equal(resultat.tellinger.sessionRequests, ko.sessionRequests);
  assert.equal(resultat.tellinger.agentRunsRunning, 1);
  kontrollerEldreLesere();
  assert.deepEqual(telleKall[0].where?.OR, [{ coachId: viewer.id }, { coachId: null }]);
  assert.deepEqual(foresporselTelleKall[0].where, { status: "PENDING", OR: [{ coachId: viewer.id }, { coachId: null }], user: spillerScope });
  assert.deepEqual(caddieTelleKall[0].where, { status: "PENDING", userId: viewer.id });
  assert.ok(kommandoKall.every(k => k.where?.userId === viewer.id));
  assert.ok(leseKall.every(k => k?.maksRader === 0));
  tillatt = false;
  const etter = await dispatch.loadAiDispatch(viewer);
  assert.equal(etter.tellinger.planActions, 0);
  assert.equal(etter.rader.some(r => r.id === "plan-actions"), false);
  assert.equal(etter.tellinger.sessionRequests, 3);
  assert.equal(etter.tellinger.caddieDrafts, 2);
});


test("AI-dispatch beholder COACH-rollen og egne kjøringer uten å åpne Caddie-adminvisningen", async () => {
  forventetRolle = "COACH";
  const resultat = await dispatch.loadAiDispatch({ ...viewer, role: "COACH" });
  assert.equal(resultat.tellinger.planActions, 1);
  assert.equal(resultat.tellinger.caddieDrafts, 0);
  assert.equal(resultat.tellinger.sessionRequests, 3);
  assert.deepEqual(telleKall[0].where?.user, spillerScope);
  assert.deepEqual(telleKall[0].where?.OR, [{ coachId: viewer.id }, { coachId: null }]);
  kontrollerEldreLesere();
});

test("AI-dispatch avviser ved feil i fersk delingskontroll, uten global reservetelling", async () => {
  lesefeil = true;
  await assert.rejects(() => dispatch.loadAiDispatch(viewer), /synthetic-sharing-unavailable/);
  assert.equal(telleKall.length, 1);
  kontrollerEldreLesere();
});
