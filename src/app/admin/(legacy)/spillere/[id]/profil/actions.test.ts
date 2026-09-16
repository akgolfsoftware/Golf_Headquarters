/**
 * R-I: admin/(legacy)/spillere/[id]/profil/actions.ts. Filens egen
 * kommentar sier det rett ut: «rolle-sjekk alene er ikke nok — uten
 * coach-scoping kunne en coach koble en vilkårlig e-post som forelder til
 * en hvilken som helst spiller, og invitasjonen sendes faktisk ut.» Testen
 * dekker eierskapsporten (`coachScopedPlayerWhere`, via samme
 * harEierskap-mønster som `(legacy)/plans/actions.test.ts`) pluss
 * forretningsreglene: ugyldig e-post, dobbel åpen invitasjon, og at
 * e-postfeil er best-effort (invitasjonen består selv om sendingen feiler).
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

/** Alle spillere i coaching-sporet (synlig for ADMIN). */
const alleCoachedeSpillere = new Set(["spiller-a"]);
/** Delmengden coach-a faktisk eier. */
let coachensSpillere = new Set(["spiller-a"]);

function harEierskap(spillerId: string): boolean {
  if (!bruker) return false;
  if (!alleCoachedeSpillere.has(spillerId)) return false;
  if (bruker.role === "ADMIN") return true;
  return coachensSpillere.has(spillerId);
}

let eksisterendeInvitasjon: boolean = false;
let invitationCreates: Array<{ playerId: string; email: string; relation: string }> = [];
let epostSendtKall: Array<{ to: string; subject: string }> = [];
let simulerEpostFeil = false;

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  coachensSpillere = new Set(["spiller-a"]);
  eksisterendeInvitasjon = false;
  invitationCreates = [];
  epostSendtKall = [];
  simulerEpostFeil = false;
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async (options: { allow?: Rolle | Rolle[] }) => {
      if (!bruker) throw new Error("NEXT_REDIRECT");
      const tillatt = Array.isArray(options.allow) ? options.allow : options.allow ? [options.allow] : undefined;
      if (tillatt && !tillatt.includes(bruker.role)) throw new Error("NEXT_REDIRECT");
      return bruker;
    },
  },
});
mock.module("@/lib/auth/coached", {
  namedExports: {
    coachScopedPlayerWhere: (coach: { id: string; role: string }) => ({ __coach: coach.id }),
  },
});
mock.module("@/lib/email", {
  namedExports: {
    FRA_EPOST: "AK Golf HQ <no-reply@akgolf.no>",
    resendKlient: () => ({
      emails: {
        send: async (input: { to: string; subject: string }) => {
          if (simulerEpostFeil) throw new Error("resend nede");
          epostSendtKall.push(input);
        },
      },
    }),
  },
});
mock.module("@/lib/email/templates/shared", {
  namedExports: {
    emailLayout: (input: { body: string }) => `<html>${input.body}</html>`,
    primaryButton: (tekst: string, url: string) => `<a href="${url}">${tekst}</a>`,
  },
});
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  user: {
    findFirst: async ({ where }: { where: { AND: [unknown, { id: string }] } }) => {
      const playerId = where.AND[1].id;
      if (playerId === "coach-feil-rolle") {
        // Finnes i scope, men er selv COACH — skal likevel avvises av filens egen role-sjekk.
        return { id: playerId, name: "Feil Rolle", role: "COACH" };
      }
      if (!harEierskap(playerId)) return null;
      return { id: playerId, name: "Ola Nordmann", role: "PLAYER" };
    },
  },
  parentInvitation: {
    findFirst: async () => (eksisterendeInvitasjon ? { id: "inv-eksisterende" } : null),
    create: async ({ data }: { data: { playerId: string; email: string; relation: string } }) => {
      invitationCreates.push(data);
      return { id: "inv-ny", token: "tok_123", playerId: data.playerId, email: data.email };
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("inviterForelderForSpiller avviser PLAYER uten å opprette invitasjon", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { inviterForelderForSpiller } = await actions();
  await assert.rejects(() =>
    inviterForelderForSpiller({ playerId: "spiller-a", email: "foresatt@example.com", relation: "MOTHER" }),
  );
  assert.equal(invitationCreates.length, 0);
});

test("inviterForelderForSpiller avviser uinnlogget uten å opprette invitasjon", async () => {
  bruker = null;
  const { inviterForelderForSpiller } = await actions();
  await assert.rejects(() =>
    inviterForelderForSpiller({ playerId: "spiller-a", email: "foresatt@example.com", relation: "MOTHER" }),
  );
  assert.equal(invitationCreates.length, 0);
});

test("inviterForelderForSpiller avviser ugyldig e-post med ok:false", async () => {
  const { inviterForelderForSpiller } = await actions();
  const svar = await inviterForelderForSpiller({
    playerId: "spiller-a", email: "ikke-en-epost", relation: "MOTHER",
  });
  assert.equal(svar.ok, false);
  assert.equal(invitationCreates.length, 0);
});

test("inviterForelderForSpiller avviser COACH uten eierskap til spilleren (IDOR)", async () => {
  coachensSpillere = new Set();
  const { inviterForelderForSpiller } = await actions();
  const svar = await inviterForelderForSpiller({
    playerId: "spiller-a", email: "foresatt@example.com", relation: "MOTHER",
  });
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.error, /Fant ikke spilleren/);
  assert.equal(invitationCreates.length, 0);
  assert.equal(epostSendtKall.length, 0);
});

test("inviterForelderForSpiller avviser en target-bruker som ikke er PLAYER", async () => {
  const { inviterForelderForSpiller } = await actions();
  const svar = await inviterForelderForSpiller({
    playerId: "coach-feil-rolle", email: "foresatt@example.com", relation: "MOTHER",
  });
  assert.equal(svar.ok, false);
  assert.equal(invitationCreates.length, 0);
});

test("inviterForelderForSpiller avviser dobbel åpen invitasjon til samme e-post", async () => {
  eksisterendeInvitasjon = true;
  const { inviterForelderForSpiller } = await actions();
  const svar = await inviterForelderForSpiller({
    playerId: "spiller-a", email: "foresatt@example.com", relation: "MOTHER",
  });
  assert.equal(svar.ok, false);
  assert.equal(invitationCreates.length, 0);
});

test("inviterForelderForSpiller oppretter invitasjon og sender e-post for COACH med eierskap", async () => {
  const { inviterForelderForSpiller } = await actions();
  const svar = await inviterForelderForSpiller({
    playerId: "spiller-a", email: "Foresatt@Example.com", relation: "MOTHER",
  });
  assert.equal(svar.ok, true);
  assert.equal(invitationCreates.length, 1);
  assert.equal(invitationCreates[0]?.email, "foresatt@example.com"); // normalisert til lowercase
  assert.equal(epostSendtKall.length, 1);
});

test("inviterForelderForSpiller lykkes selv om e-postutsending feiler (best-effort)", async () => {
  simulerEpostFeil = true;
  const { inviterForelderForSpiller } = await actions();
  const svar = await inviterForelderForSpiller({
    playerId: "spiller-a", email: "foresatt@example.com", relation: "FATHER",
  });
  assert.equal(svar.ok, true);
  assert.equal(invitationCreates.length, 1);
  assert.equal(epostSendtKall.length, 0);
});

test("inviterForelderForSpiller lar ADMIN invitere for en spiller ADMIN ikke selv coacher", async () => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  coachensSpillere = new Set(); // ikke coach-a sin, men ADMIN skal likevel slippe gjennom
  const { inviterForelderForSpiller } = await actions();
  const svar = await inviterForelderForSpiller({
    playerId: "spiller-a", email: "foresatt@example.com", relation: "MOTHER",
  });
  assert.equal(svar.ok, true);
  assert.equal(invitationCreates.length, 1);
});
