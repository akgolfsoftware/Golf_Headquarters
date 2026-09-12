/**
 * O05/O07: confirmGuardianConsent avviser feil opphav, ugyldig, utløpt
 * og allerede akseptert lenke uten å skrive relasjon.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Invitasjon = {
  id: string;
  token: string;
  email: string;
  relation: string;
  playerId: string;
  acceptedAt: Date | null;
  expiresAt: Date;
  player: { id: string; name: string; email: string | null };
};

let sammeOpphav = true;
let invitasjon: Invitasjon | null = null;
let relasjonSkrevet = 0;
let spillerOppdatert = 0;

mock.module("@/lib/security/same-origin", {
  namedExports: { isSameOriginAction: async () => sammeOpphav },
});
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/error-tracking", {
  namedExports: { logError: async () => undefined },
});
mock.module("@/lib/email", {
  namedExports: {
    resendKlient: () => ({ emails: { send: async () => undefined } }),
    FRA_EPOST: "post@akgolf.no",
  },
});
mock.module("@/lib/app-url", { namedExports: { APP_URL: "https://akgolf.no" } });
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      parentInvitation: {
        findUnique: async ({ where }: { where: { token: string } }) => {
          if (!invitasjon || invitasjon.token !== where.token) return null;
          return invitasjon;
        },
        update: async () => {
          throw new Error("invitasjon skal ikke oppdateres for ugyldig lenke");
        },
      },
      user: {
        findUnique: async () => null,
        create: async () => {
          throw new Error("bruker skal ikke opprettes for ugyldig lenke");
        },
        update: async () => {
          spillerOppdatert += 1;
          return {};
        },
      },
      parentRelation: {
        upsert: async () => {
          relasjonSkrevet += 1;
          return {};
        },
      },
    },
  },
});

async function action() {
  return (await import("./[token]/actions")).confirmGuardianConsent;
}

test.beforeEach(() => {
  sammeOpphav = true;
  relasjonSkrevet = 0;
  spillerOppdatert = 0;
  invitasjon = {
    id: "inv-1",
    token: "token-1",
    email: "kari@test.no",
    relation: "MOTHER",
    playerId: "barn-a",
    acceptedAt: null,
    expiresAt: new Date(Date.now() + 86_400_000),
    player: { id: "barn-a", name: "Barn A", email: "barn@test.no" },
  };
});

test("confirmGuardianConsent avviser forespørsel fra feil opphav", async () => {
  sammeOpphav = false;
  const fn = await action();
  const svar = await fn({ token: "token-1", guardianName: "Kari Nordmann" });
  assert.equal(svar.ok, false);
  assert.match(String(svar.error), /feil opphav/);
  assert.equal(relasjonSkrevet, 0);
});

test("confirmGuardianConsent avviser ugyldig token", async () => {
  const fn = await action();
  const svar = await fn({ token: "finnes-ikke", guardianName: "Kari Nordmann" });
  assert.equal(svar.ok, false);
  assert.match(String(svar.error), /ikke funnet/);
  assert.equal(relasjonSkrevet, 0);
  assert.equal(spillerOppdatert, 0);
});

test("confirmGuardianConsent avviser utløpt lenke", async () => {
  if (invitasjon) invitasjon.expiresAt = new Date(Date.now() - 1000);
  const fn = await action();
  const svar = await fn({ token: "token-1", guardianName: "Kari Nordmann" });
  assert.equal(svar.ok, false);
  assert.match(String(svar.error), /utløpt/);
  assert.equal(relasjonSkrevet, 0);
});

test("confirmGuardianConsent avviser allerede akseptert lenke", async () => {
  if (invitasjon) invitasjon.acceptedAt = new Date();
  const fn = await action();
  const svar = await fn({ token: "token-1", guardianName: "Kari Nordmann" });
  assert.equal(svar.ok, false);
  assert.match(String(svar.error), /allerede akseptert/);
  assert.equal(relasjonSkrevet, 0);
});
