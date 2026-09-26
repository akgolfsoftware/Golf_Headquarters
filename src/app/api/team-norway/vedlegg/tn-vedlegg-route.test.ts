/**
 * Route-nivå-test for `/api/team-norway/vedlegg/[attachmentId]` (GET).
 * Domenetilgangen (`hentTnVedleggForViewer`) er allerede testet uten server
 * i `src/lib/domain/tn-vedlegg.test.ts` — denne testen dekker det ruten
 * legger på: innlogging, samtykke, id-format, private nedlastingsheadere og
 * at det aldri eksponeres en offentlig URL (kun `.download()`, aldri
 * `.getPublicUrl()` eller en klientstyrt lagringssti).
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let innlogget: { id: string; requiresGuardianConsent: boolean; guardianConsentGivenAt: Date | null } | null = {
  id: "coach-1",
  requiresGuardianConsent: false,
  guardianConsentGivenAt: null,
};
let vedlegg: { id: string; path: string; fileName: string; fileType: string | null; fileSize: number | null } | null = {
  id: "vedlegg-1",
  path: "gruppe-tn/ekte-privat-uuid",
  fileName: "øvingsplan uke 3.pdf",
  fileType: "application/pdf",
  fileSize: 12345,
};
let downloadKall: string[] = [];
let getPublicUrlKall = 0;
let downloadFeiler = false;

mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => innlogget } });
mock.module("@/lib/domain/tn-post", { namedExports: { hentTnVedleggForViewer: async () => vedlegg } });
mock.module("@/lib/supabase/admin", {
  namedExports: {
    supabaseAdmin: () => ({
      storage: {
        from: () => ({
          download: async (path: string) => {
            downloadKall.push(path);
            if (downloadFeiler) return { data: null, error: new Error("nede") };
            return { data: new Blob(["%PDF-innhold"]), error: null };
          },
          // Finnes bevisst IKKE i mocken: getPublicUrl. Skulle ruten noensinne
          // kalle den, feiler testen med et klart TypeError i stedet for å
          // stille bestå.
        }),
      },
    }),
  },
});

function reset() {
  innlogget = { id: "coach-1", requiresGuardianConsent: false, guardianConsentGivenAt: null };
  vedlegg = { id: "vedlegg-1", path: "gruppe-tn/ekte-privat-uuid", fileName: "øvingsplan uke 3.pdf", fileType: "application/pdf", fileSize: 12345 };
  downloadKall = [];
  getPublicUrlKall = 0;
  downloadFeiler = false;
}
reset();

async function kall(attachmentId = "vedlegg-1") {
  const { GET } = await import("./[attachmentId]/route");
  return GET(new Request(`http://localhost/api/team-norway/vedlegg/${attachmentId}`), {
    params: Promise.resolve({ attachmentId }),
  });
}

test("uinnlogget får 401 uten at vedlegget slås opp", async () => {
  reset();
  innlogget = null;
  const res = await kall();
  assert.equal(res.status, 401);
  assert.equal(downloadKall.length, 0);
});

test("mangler foresattes samtykke → 403, ingen nedlasting", async () => {
  reset();
  innlogget = { id: "spiller-under-16", requiresGuardianConsent: true, guardianConsentGivenAt: null };
  const res = await kall();
  assert.equal(res.status, 403);
  assert.equal(downloadKall.length, 0);
});

test("ugyldig attachmentId-format avvises før domeneoppslag (path traversal osv.)", async () => {
  reset();
  const res = await kall("../../etc/passwd");
  assert.equal(res.status, 404);
  assert.equal(downloadKall.length, 0);
});

test("viewer uten tilgang (domenelaget returnerer null) → 404, aldri lagringssti lekket", async () => {
  reset();
  vedlegg = null;
  const res = await kall();
  assert.equal(res.status, 404);
  const tekst = await res.text();
  assert.ok(!tekst.includes("gruppe-tn"));
});

test("autorisert nedlasting: private headere, ingen offentlig URL, riktig sti sendt til Storage", async () => {
  reset();
  const res = await kall();
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(res.headers.get("Cache-Control"), "private, no-store");
  assert.ok(res.headers.get("Content-Security-Policy")?.includes("sandbox"));
  assert.match(res.headers.get("Content-Disposition") ?? "", /attachment/);
  assert.deepEqual(downloadKall, ["gruppe-tn/ekte-privat-uuid"]);
  assert.equal(getPublicUrlKall, 0);
});

test("Storage-feil under nedlasting gir en vennlig 503, ikke en rå feilmelding", async () => {
  reset();
  downloadFeiler = true;
  const res = await kall();
  assert.equal(res.status, 503);
  const tekst = await res.text();
  assert.ok(!/error|Error|nede/.test(tekst));
});
