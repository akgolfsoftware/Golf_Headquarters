import { before, beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import type { LiveVideoSource } from "@/lib/portal-live/video-access";
let user: { id: string; role: string } | null = { id: "player", role: "PLAYER" };
let awaiting = false, grants = 0, sourceError = false;
let source: LiveVideoSource = { kind: "plan", ownerId: "player", row: { status: "ACTIVE", drills: [{ id: "d" }] } };
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => user } });
mock.module("@/lib/auth/minor", { namedExports: { isAwaitingGuardianConsent: () => awaiting } });
mock.module("@/lib/rate-limit", { namedExports: { rateLimit: async () => ({ ok: true }) } });
mock.module("@/lib/portal-live/session-source", { namedExports: { LiveSessionIdSchema: z.string().min(1).max(100), loadAuthorizedLiveSource: async () => { if (sourceError) throw Error("forbidden"); return source; } } });
mock.module("@/lib/supabase/admin", { namedExports: { supabaseAdmin: () => ({ storage: { from: () => ({ createSignedUploadUrl: async (path: string, options: { upsert: boolean }) => {
  assert.match(path, /^player\/[a-f0-9-]{36}\.mov$/);assert.equal(options.upsert, false);grants++;return { data: { token: "syntetisk-upload-token" }, error: null };
} }) } }) } });
let POST: typeof import("./route").POST;
before(async () => { POST = (await import("./route")).POST; });
beforeEach(() => { user={id:"player",role:"PLAYER"};awaiting=false;grants=0;sourceError=false;source={kind:"plan",ownerId:"player",row:{status:"ACTIVE",drills:[{id:"d"}]}}; });
const input = { sessionId: "s", drillId: "d", mimeType: "video/quicktime", size: 8 * 1024 * 1024 };
const call = (body: unknown = input) => POST(new Request("http://127.0.0.1/api/portal/live-video/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
test("bare innlogget spiller med samtykke får opplastingsrett", async () => {
  user=null;assert.equal((await call()).status,401);
  for(const role of ["COACH","ADMIN","PARENT"]){user={id:"player",role};assert.equal((await call()).status,403);}
  user={id:"player",role:"PLAYER"};awaiting=true;assert.equal((await call()).status,403);assert.equal(grants,0);
});
test("fremmed økt/øvelse og avsluttet økt gir ingen grant", async () => {
  source.ownerId="foreign";assert.equal((await call()).status,403);
  source.ownerId="player";assert.equal((await call({...input,drillId:"foreign"})).status,403);
  source.row.status="COMPLETED";assert.equal((await call()).status,403);
  sourceError=true;assert.equal((await call()).status,403);assert.equal(grants,0);
});
test("klienten kan ikke velge sti, URL, bucket eller større størrelse", async () => {
  for(const value of [{...input,path:"foreign/file.mov"},{...input,url:"https://foreign.test"},{...input,bucket:"public"},{...input,size:51*1024*1024},{...input,mimeType:"text/html"}]) assert.equal((await call(value)).status,400);
  assert.equal(grants,0);
});
test("en video større enn appfunksjonens grense får bare en liten scoped ticket", async () => {
  const response=await call();assert.equal(response.status,200);const result=await response.json();
  assert.equal(result.bucket,"player-swing-videos");assert.equal(result.ok,true);assert.equal(grants,1);assert.equal(response.headers.get("cache-control"),"no-store");
});
test("egen pågående Workbench og akseptert V2-deltaker beholdes, kladd/avvist/invitasjon stenges", async () => {
  source={kind:"workbench",ownerId:"player",row:{status:"IN_PROGRESS",drills:[{id:"d"}],isTemplate:false,hiddenByPlayer:false,needsPlayerApproval:false,approvalStatus:"ACCEPTED"}};
  assert.equal((await call()).status,200);source.row.needsPlayerApproval=true;assert.equal((await call()).status,403);
  source.row.needsPlayerApproval=false;source.row.approvalStatus="REJECTED";assert.equal((await call()).status,403);
  source={kind:"v2",ownerId:"foreign",row:{status:"IN_PROGRESS",drills:[{id:"d"}],participants:[{userId:"player",status:"ACCEPTED"}]}};
  assert.equal((await call()).status,200);source.row.participants=[{userId:"player",status:"INVITED"}];assert.equal((await call()).status,403);
});
