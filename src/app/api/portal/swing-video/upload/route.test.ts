/**
 * D-63/TA-21: swing-video er opptak og sperres til forelder har godkjent,
 * også de sju første dagene og for spiller uten fødselsdato.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Bruker = {
  id: string;
  role: string;
  requiresGuardianConsent: boolean;
  guardianConsentGivenAt: Date | null;
  dateOfBirth: Date | null;
  createdAt: Date;
  harGodkjentForelder?: boolean;
};

let bruker: Bruker;
let opprettet: Array<Record<string, unknown>> = [];

mock.module("@/lib/auth/getCurrentUser", {
  namedExports: { getCurrentUser: async () => bruker },
});
mock.module("@/lib/rate-limit", {
  namedExports: { rateLimit: async () => ({ ok: true, resetAt: 0 }) },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      playerSwingVideo: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          opprettet.push(data);
          return { id: "video-1", status: "PROCESSING" };
        },
      },
    },
  },
});

function kall() {
  return new Request("http://localhost/api/portal/swing-video/upload", {
    method: "POST",
    body: JSON.stringify({ videoUrl: "https://example.com/v.mp4" }),
  });
}

test.beforeEach(() => {
  opprettet = [];
  bruker = {
    id: "spiller-a",
    role: "PLAYER",
    requiresGuardianConsent: true,
    guardianConsentGivenAt: null,
    dateOfBirth: new Date("2013-01-01T00:00:00Z"),
    createdAt: new Date(),
  };
});

test("barn uten godkjent forelder sperres selv på dag 1", async () => {
  const { POST } = await import("./route");
  const svar = await POST(kall());
  assert.equal(svar.status, 403);
  assert.equal(opprettet.length, 0);
});

test("spiller uten fødselsdato sperres", async () => {
  bruker = { ...bruker, requiresGuardianConsent: false, dateOfBirth: null };
  const { POST } = await import("./route");
  const svar = await POST(kall());
  assert.equal(svar.status, 403);
});

test("barn med godkjent forelder får lagre, med samtykket bekreftet", async () => {
  bruker = { ...bruker, harGodkjentForelder: true };
  const { POST } = await import("./route");
  const svar = await POST(kall());
  assert.equal(svar.status, 200);
  assert.equal(opprettet[0]?.consentVerified, true);
});

test("voksen spiller får lagre", async () => {
  bruker = { ...bruker, requiresGuardianConsent: false, dateOfBirth: new Date("1995-01-01T00:00:00Z") };
  const { POST } = await import("./route");
  const svar = await POST(kall());
  assert.equal(svar.status, 200);
  assert.equal(opprettet[0]?.consentVerified, true);
});
