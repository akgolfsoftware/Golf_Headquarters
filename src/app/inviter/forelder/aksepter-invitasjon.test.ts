/**
 * O05/O07: aksepterInvitasjon avviser ugyldig, brukt og utløpt lenke
 * uten å opprette bruker eller relasjon.
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
  player: { id: string; name: string };
};

let invitasjon: Invitasjon | null = null;
let supabaseKalt = 0;
let relasjonSkrevet = 0;

mock.module("next/navigation", {
  namedExports: {
    redirect: (to: string) => {
      throw new Error(`REDIRECT:${to}`);
    },
  },
});
mock.module("@/lib/supabase/admin", {
  namedExports: {
    supabaseAdmin: () => {
      supabaseKalt += 1;
      throw new Error("supabase skal ikke kalles for ugyldig lenke");
    },
  },
});
mock.module("@/lib/auth/claim-pending-account", {
  namedExports: { claimPendingAccountByEmail: async () => undefined },
});
mock.module("@/lib/email", {
  namedExports: {
    resendKlient: () => ({ emails: { send: async () => undefined } }),
    FRA_EPOST: "post@akgolf.no",
  },
});
mock.module("@/lib/error-tracking", {
  namedExports: { logError: async () => undefined },
});
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
      parentRelation: {
        upsert: async () => {
          relasjonSkrevet += 1;
          return {};
        },
      },
      user: {
        upsert: async () => ({ id: "forelder-ny" }),
      },
    },
  },
});

function skjema(overstyr: Record<string, string> = {}) {
  const fd = new FormData();
  fd.set("token", overstyr.token ?? "token-1");
  fd.set("firstName", overstyr.firstName ?? "Kari");
  fd.set("lastName", overstyr.lastName ?? "Nordmann");
  fd.set("phone", overstyr.phone ?? "");
  fd.set("password", overstyr.password ?? "hemmelig1");
  return fd;
}

async function action() {
  return (await import("./[token]/actions")).aksepterInvitasjon;
}

test.beforeEach(() => {
  supabaseKalt = 0;
  relasjonSkrevet = 0;
  invitasjon = {
    id: "inv-1",
    token: "token-1",
    email: "kari@test.no",
    relation: "MOTHER",
    playerId: "barn-a",
    acceptedAt: null,
    expiresAt: new Date(Date.now() + 86_400_000),
    player: { id: "barn-a", name: "Barn A" },
  };
});

test("aksepterInvitasjon avviser ugyldig token", async () => {
  const fn = await action();
  const svar = await fn(skjema({ token: "finnes-ikke" }));
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.error, /Ugyldig invitasjon/);
  assert.equal(supabaseKalt, 0);
  assert.equal(relasjonSkrevet, 0);
});

test("aksepterInvitasjon avviser utløpt lenke", async () => {
  if (invitasjon) invitasjon.expiresAt = new Date(Date.now() - 1000);
  const fn = await action();
  const svar = await fn(skjema());
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.error, /utløpt/);
  assert.equal(supabaseKalt, 0);
  assert.equal(relasjonSkrevet, 0);
});

test("aksepterInvitasjon avviser allerede brukt lenke", async () => {
  if (invitasjon) invitasjon.acceptedAt = new Date();
  const fn = await action();
  const svar = await fn(skjema());
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.error, /allerede brukt/);
  assert.equal(supabaseKalt, 0);
  assert.equal(relasjonSkrevet, 0);
});
