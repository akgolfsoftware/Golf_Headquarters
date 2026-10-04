import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
let viewer: { id: string; role: string; requiresGuardianConsent: boolean; guardianConsentGivenAt: Date | null } | null;
let scoped = false;
let approved = false;
let plan: { userId: string; opprettetAvId: string } | null;
let scopedChecks = 0;
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => viewer } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async (user: {id:string}, playerId:string) => {
  assert.equal(user.id, viewer?.id); assert.equal(playerId, "player"); scopedChecks++; return scoped;
} } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  technicalPlan: { findUnique: async () => plan },
  parentRelation: { findUnique: async ({where}: {where:{parentId_childId:{parentId:string;childId:string}}}) => {
    assert.deepEqual(where.parentId_childId, {parentId:viewer?.id,childId:"player"}); return {approved};
  } },
} } });
let ensurePlanAccess: typeof import("./ensure-plan-access").ensurePlanAccess;
before(async () => { ({ensurePlanAccess} = await import("./ensure-plan-access")); });
beforeEach(() => { viewer={id:"player",role:"PLAYER",requiresGuardianConsent:false,guardianConsentGivenAt:null};
  scoped=false; approved=false; scopedChecks=0; plan={userId:"player",opprettetAvId:"former-coach"}; });
test("eieren kan skrive sin egen tekniske plan", async () => { assert.equal((await ensurePlanAccess("p")).plan.userId,"player"); assert.equal(scopedChecks,0); });
test("trener med faktisk spillerrelasjon slipper inn", async () => { viewer!.id="coach";viewer!.role="COACH";scoped=true;await ensurePlanAccess("p");assert.equal(scopedChecks,1); });
test("fremmed trener avvises også når vedkommende opprinnelig opprettet planen", async () => {viewer!.id="former-coach";viewer!.role="COACH";await assert.rejects(ensurePlanAccess("p"),/Ingen tilgang/);});
test("ADMIN får coachet spiller, men ikke selvbetjent konto", async () => {viewer!.id="admin";viewer!.role="ADMIN";await assert.rejects(ensurePlanAccess("p"),/Ingen tilgang/);scoped=true;await ensurePlanAccess("p");});
test("foresatt får ingen generell skriverett i barnets tekniske plan, heller ikke ved godkjent leserelasjon", async () => {viewer!.id="parent";viewer!.role="PARENT";await assert.rejects(ensurePlanAccess("p"),/Ingen tilgang/);approved=true;await assert.rejects(ensurePlanAccess("p"),/Ingen tilgang/);});
test("fremmed spiller får ikke tilgang som historisk oppretter", async () => {viewer!.id="former-coach";await assert.rejects(ensurePlanAccess("p"),/Ingen tilgang/);});
test("mindreårig uten samtykke avvises før planlesing", async () => {viewer!.requiresGuardianConsent=true;await assert.rejects(ensurePlanAccess("p"),/guardian-consent-required/);viewer!.guardianConsentGivenAt=new Date();await ensurePlanAccess("p");});
test("ingen innlogging eller manglende plan avvises", async () => {viewer=null;await assert.rejects(ensurePlanAccess("p"),/Ikke innlogget/);viewer={id:"player",role:"PLAYER",requiresGuardianConsent:false,guardianConsentGivenAt:null};plan=null;await assert.rejects(ensurePlanAccess("p"),/Plan ikke funnet/);});
