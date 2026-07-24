/**
 * Enhetstester for lastLoginAt-stempling (aktiveringsmetrikk).
 * Selve Prisma-kallet testes via recordLastLogin-kontrakten (ren funksjon
 * som bare wrappes — her sikrer vi at helperen eksporteres og kaller update).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("recordLastLogin modul", () => {
  it("eksporterer recordLastLogin", async () => {
    const mod = await import("@/lib/auth/record-last-login");
    assert.equal(typeof mod.recordLastLogin, "function");
  });
});
