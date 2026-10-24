import assert from "node:assert/strict";
import { mock, test } from "node:test";
mock.module("@/lib/prisma",{namedExports:{prisma:{}}});

test("whole weekly family is guarded, including malformed agent/type combinations",async()=>{
  const {erAkUkeforslag}=await import("./ak-ukeforslag");
  assert.equal(erAkUkeforslag({actionType:"WEEKLY_PROPOSAL"}),true);
  assert.equal(erAkUkeforslag({actionType:"OTHER",agentName:"weekly-plan-proposals"}),true);
  assert.equal(erAkUkeforslag({actionType:"COACH_REVIEW",agentName:"training-gap"}),false);
});

test("weekly proposal contract requires explicit evidence and matching drill duration",async()=>{
  const {akUkeforslagSchema}=await import("./ak-ukeforslag");
  const valid={versjon:1,deling:{versjon:1,scope:"AK_GOLF_COACHINGPROFIL",tekstVersjon:"2026-10-23.1",
    spillerId:"p",gruppeId:"g",coachId:"c",fingeravtrykk:"a".repeat(64)},
    databevis:{versjon:1,uke:"2026-10-26",planId:"plan",fingeravtrykk:"b".repeat(64)},
    tittel:"Syntetisk uke",forklaring:"Syntetisk forklaring",sessions:[{title:"Syntetisk økt",pyramidArea:"TEK",
      scheduledAt:"2026-10-27T16:00:00Z",durationMin:30,drills:[{exerciseId:"drill",exerciseRevisjon:"1",minutter:30}]}]};
  assert.equal(akUkeforslagSchema.safeParse(valid).success,true);
  const bank = { ...valid, versjon: 2, bankFingeravtrykk: "c".repeat(64), fagligeRad: [] };
  assert.equal(akUkeforslagSchema.safeParse(bank).success, true);
  for (const invalid of [{ ...valid, versjon: 2 }, { ...bank, bankFingeravtrykk: undefined },
    { ...bank, fagligeRad: undefined }, { ...bank, versjon: 1 }]) {
    assert.equal(akUkeforslagSchema.safeParse(invalid).success, false);
  }
  for(const invalid of [{...valid,deling:null},{...valid,versjon:0},{...valid,coachLog:[]},
    {...valid,sessions:[{...valid.sessions[0],durationMin:45}]},
    {...valid,sessions:[{...valid.sessions[0],drills:[]}]},
    {...valid,sessions:[{...valid.sessions[0],scheduledAt:"invalid"}]}]) {
    assert.equal(akUkeforslagSchema.safeParse(invalid).success,false);
  }
});
