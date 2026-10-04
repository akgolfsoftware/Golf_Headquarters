import assert from "node:assert/strict";
import { mock, test } from "node:test";
let deletes = 0;
mock.module("@/lib/prisma", { namedExports: { prisma: { user: { findMany: async () => [] } } } });
mock.module("@/lib/gdpr/slett-gamle-feillogger", { namedExports: { slettGamleFeillogger: async () => { deletes++; return 1; } } });
mock.module("@/lib/gdpr/anonymiser-bruker", { namedExports: { anonymiserBruker: async () => ({}) } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/rate-limit", { namedExports: { rateLimit: async () => ({ ok: true }) } });
mock.module("@/lib/cron/auth", { namedExports: { avvisUgyldigCron: () => null } });
test("tørrkjøring sletter heller ikke gamle feillogger", async () => {
  const { GET } = await import("./route");
  const response = await GET(new Request("http://localhost/api/cron/cleanup-deleted-accounts?dryRun=1"));
  assert.equal(response.status, 200); assert.equal(deletes, 0);
});
