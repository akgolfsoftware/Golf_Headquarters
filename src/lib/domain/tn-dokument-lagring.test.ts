import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";
let tilgang = true;
let dbFeil = false;
let uploadFeil = false;
let uploadKall = 0;
let ryddet = 0;
let lagret = 0;
let path = "";
mock.module("@/lib/domain/tn-post", { namedExports: {
  krevDokumentOpplastingstilgang: async () => { if (!tilgang) throw new Error("avvist"); },
  opprettGruppeDokument: async () => { if (dbFeil) throw new Error("db-intern"); lagret++; },
} });
mock.module("@/lib/storage/supabase-storage", { namedExports: { uploadFile: async (input: {path:string}) => {
  uploadKall++; path = input.path; if (uploadFeil) throw new Error("intern-storage-feil"); return { path };
} } });
mock.module("@/lib/supabase/admin", { namedExports: { supabaseAdmin: () => ({ storage: { from: () => ({ remove: async () => { ryddet++; return { error: null }; } }) } }) } });
beforeEach(() => { tilgang = true; dbFeil = false; uploadFeil = false; uploadKall = 0; ryddet = 0; lagret = 0; path = ""; });
async function last(fil = new File(["%PDF-1.7\nsyntetisk dokument"], "plan.pdf", { type: "application/pdf" })) {
  return (await import("./tn-dokument-lagring")).lagreTnDokument("gruppe-tn", "coach-1", fil);
}
test("outsider avvises før en eneste lagringsoperasjon", async () => { tilgang = false; assert.equal((await last()).ok, false); assert.equal(uploadKall, 0); assert.equal(lagret, 0); });
test("validert fil lastes med servergenerert sti og postlagring", async () => { assert.equal((await last()).ok, true); assert.equal(uploadKall, 1); assert.equal(lagret, 1); assert.match(path, /^gruppe-tn\/[0-9a-f-]{36}$/); });
test("klientens PDF-påstand uten PDF-signatur avvises", async () => { assert.equal((await last(new File(["<script>test</script>"], "plan.pdf", {type:"application/pdf"}))).ok, false); assert.equal(uploadKall, 0); });
test("tom og for stor fil avvises før lagring", async () => {
  assert.equal((await last(new File([], "tom.pdf", {type:"application/pdf"}))).ok, false);
  const stor = new File(["%PDF-"], "stor.pdf", {type:"application/pdf"}); Object.defineProperty(stor, "size", {value: 50 * 1024 * 1024 + 1});
  assert.equal((await last(stor)).ok, false); assert.equal(uploadKall, 0);
});
test("restfil ryddes når postlagringen feiler", async () => { dbFeil = true; assert.equal((await last()).ok, false); assert.equal(ryddet, 1); assert.equal(lagret, 0); });
test("restfil ryddes også ved feil etter lagring før signert URL returneres", async () => { uploadFeil = true; assert.equal((await last()).ok, false); assert.equal(ryddet, 1); });
