/**
 * Målrettet test for `inviterSpillereTilGruppe` (Team Norway-dokument/
 * invitasjon-oppfølging, 2026-09-14, rettet etter Codex-review samme dag).
 * Dekker det UI-koblingen skal vise riktig, uten ekte database/e-post/Storage:
 *  - invitasjonsrett: hovedtrener (Group.coachId) og aktivt COACH-
 *    gruppemedlem har rett; en platform-COACH som i DENNE gruppen kun har
 *    gruppe-rollen ASSISTANT eller GUEST (GroupMember.role — IKKE en
 *    User.role) har det ikke, og heller ikke en fremmed coach uten noe
 *    medlemskap. `group.findFirst`-mocken evaluerer det faktiske
 *    `OR`-uttrykket fra `eierGruppen`, ikke en oppdiktet snarvei.
 *  - «medlem opprettet» og «e-post sendt» rapporteres alltid separat
 *  - resolved provider-feil / kastet feil / manglende nøkkel havner alltid i
 *    `feilet`, aldri i `invitert`
 *  - retry på en uklaimet (pending-) invitasjon: ingen ny bruker, ingen
 *    rolle-/samtykkeendring, men et reelt nytt forsøk på å sende e-posten —
 *    både når forsøket lykkes og når det feiler på nytt
 *  - en ordinær, allerede REGISTRERT bruker (ikke pending) beholder dagens
 *    stille innmeldingsflyt uten e-post, uendret av retry-logikken
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type PlattformRolle = "COACH" | "ADMIN" | "PLAYER";

let bruker: { id: string; name: string; role: PlattformRolle } = { id: "coach-1", name: "Anders", role: "COACH" };
/** Group.coachId — hovedtrener, gir eierskap uten eget GroupMember. */
let groupCoachId: string | null = "coach-1";
/** GroupMember.role for aktive medlemmer av «gruppe-tn», nøkkel = userId. */
let gruppeMedlemsroller: Record<string, string> = {};
/** Simulerer et tidligere e-postoppslag (`prisma.user.findFirst` på epost). */
let eksisterendeBruker: { id: string; email: string; authId: string; role: string } | null = null;
/** Styrer `groupMember.findUnique` for retry-scenarier: er medlemskapet allerede aktivt? */
let medlemskapAlleredeAktivt = false;
let resendApiKey: string | undefined = "test-nøkkel";
let sendResultat: "ok" | "resolved-error" | "kaster" = "ok";
let auditKall: { action: string; metadata?: unknown }[] = [];
let opprettedeBrukere: { id: string; email: string }[] = [];
let sendKall = 0;
/** Gruppens navn slik `group.findFirst` returnerer det — styrbar for HTML-escaping-testen. */
let gruppeNavn = "Team Norway";
/** HTML-kroppen fra siste `emails.send`-kall, fanget for å bevise escaping. */
let sisteHtml = "";

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });

mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireCoachActionUser: async () => {
      if (bruker.role !== "COACH" && bruker.role !== "ADMIN") throw new Error("forbidden");
      return bruker;
    },
  },
});
mock.module("@/lib/auth/effective-capabilities", {
  namedExports: { assertCapability: async () => undefined },
});
mock.module("@/lib/auth/coached", { namedExports: { coachScopedPlayerWhere: () => ({}) } });
mock.module("@/lib/audit", {
  namedExports: { audit: async (entry: { action: string; metadata?: unknown }) => { auditKall.push(entry); } },
});
mock.module("@/lib/google-calendar-kilder", { namedExports: { pushGruppeTime: async () => undefined } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/email", {
  namedExports: {
    FRA_EPOST: "AK Golf <post@akgolf.no>",
    resendKlient: () => {
      if (sendResultat === "kaster") throw new Error("intern e-postfeil");
      return {
        emails: {
          send: async (input: { html: string }) => {
            sendKall++;
            sisteHtml = input.html;
            return sendResultat === "resolved-error" ? { error: { message: "avvist av leverandøren" } } : { data: { id: "epost-1" } };
          },
        },
      };
    },
  },
});

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      group: {
        // Speiler `eierGruppen`s faktiske where-form: { id, OR: [{coachId}, {members:{some:{userId,role:"COACH",endedAt:null}}}] }
        // for platform-COACH, og { id } alene for ADMIN/den etterfølgende navneoppslaget.
        findFirst: async ({ where }: { where: { id: string; OR?: ({ coachId?: string } | { members?: { some: { userId: string; role: string } } })[] } }) => {
          if (where.id !== "gruppe-tn") return null;
          if (!where.OR) return { id: "gruppe-tn", name: gruppeNavn };
          const treff = where.OR.some((cond) => {
            if ("coachId" in cond && cond.coachId) return cond.coachId === groupCoachId;
            if ("members" in cond && cond.members) {
              const { userId, role } = cond.members.some;
              return gruppeMedlemsroller[userId] === role;
            }
            return false;
          });
          return treff ? { id: "gruppe-tn", name: gruppeNavn } : null;
        },
      },
      groupMember: {
        findUnique: async () => (medlemskapAlleredeAktivt ? { id: "m-eksisterende", endedAt: null } : null),
        update: async () => undefined,
        create: async () => undefined,
      },
      user: {
        // To ulike kallformer: e-postoppslaget i inviterSpillereTilGruppe
        // (`where.email`) og det coach-scopede id-oppslaget inne i
        // leggTilGruppemedlem sin PLAYER-gren (`where.AND`).
        findFirst: async ({ where }: { where: { email?: { equals: string }; AND?: { id?: string }[] } }) => {
          if (where.email) {
            const epost = where.email.equals;
            return epost && eksisterendeBruker && epost === eksisterendeBruker.email ? eksisterendeBruker : null;
          }
          if (where.AND) {
            const id = where.AND.find((w) => w.id)?.id;
            return id ? { id, role: "PLAYER", deletedAt: null } : null;
          }
          return null;
        },
      },
      $transaction: async (fn: (tx: unknown) => Promise<{ id: string; email: string }>) => {
        const tx = {
          user: {
            create: async ({ data }: { data: { email: string } }) => {
              const u = { id: `ny-${opprettedeBrukere.length + 1}`, email: data.email };
              opprettedeBrukere.push(u);
              return u;
            },
          },
          groupMember: { create: async () => undefined },
        };
        return fn(tx);
      },
    },
  },
});

function reset() {
  bruker = { id: "coach-1", name: "Anders", role: "COACH" };
  groupCoachId = "coach-1";
  gruppeMedlemsroller = {};
  eksisterendeBruker = null;
  medlemskapAlleredeAktivt = false;
  resendApiKey = "test-nøkkel";
  sendResultat = "ok";
  auditKall = [];
  opprettedeBrukere = [];
  sendKall = 0;
  gruppeNavn = "Team Norway";
  sisteHtml = "";
}
reset();

async function inviter(eposter: string[]) {
  if (resendApiKey) process.env.RESEND_API_KEY = resendApiKey;
  else delete process.env.RESEND_API_KEY;
  const { inviterSpillereTilGruppe } = await import("./[id]/actions");
  return inviterSpillereTilGruppe("gruppe-tn", eposter);
}

// ---------------------------------------------------------------------------
// Invitasjonsrett — gruppe-roller, ikke platform-roller
// ---------------------------------------------------------------------------

test("hovedtrener (Group.coachId) har invitasjonsrett uten eget GroupMember", async () => {
  reset();
  const svar = await inviter(["ok@eksempel.no"]);
  assert.ok(svar.ok);
});

test("aktivt COACH-gruppemedlem (ikke hovedtrener) har invitasjonsrett", async () => {
  reset();
  bruker = { id: "coach-2", name: "Hjelpecoach", role: "COACH" };
  groupCoachId = "coach-1";
  gruppeMedlemsroller = { "coach-2": "COACH" };
  const svar = await inviter(["ok@eksempel.no"]);
  assert.ok(svar.ok);
});

test("platform-COACH med GRUPPE-rolle ASSISTANT i denne gruppen avvises — ingen bruker opprettes eller mailes", async () => {
  reset();
  bruker = { id: "coach-2", name: "Hjelpecoach", role: "COACH" };
  groupCoachId = "coach-1";
  gruppeMedlemsroller = { "coach-2": "ASSISTANT" };
  const svar = await inviter(["nei@eksempel.no"]);
  assert.equal(svar.ok, false);
  if (svar.ok) return;
  assert.match(svar.feil, /fant ikke gruppen/i);
  assert.equal(opprettedeBrukere.length, 0);
  assert.equal(sendKall, 0);
});

test("platform-COACH med GRUPPE-rolle GUEST i denne gruppen avvises — ingen bruker opprettes eller mailes", async () => {
  reset();
  bruker = { id: "coach-2", name: "Hjelpecoach", role: "COACH" };
  groupCoachId = "coach-1";
  gruppeMedlemsroller = { "coach-2": "GUEST" };
  const svar = await inviter(["nei@eksempel.no"]);
  assert.equal(svar.ok, false);
  assert.equal(opprettedeBrukere.length, 0);
  assert.equal(sendKall, 0);
});

test("fremmed platform-COACH uten noe medlemskap eller eierskap i gruppen avvises", async () => {
  reset();
  bruker = { id: "fremmed-coach", name: "Fremmed", role: "COACH" };
  groupCoachId = "coach-1";
  gruppeMedlemsroller = {};
  const svar = await inviter(["nei@eksempel.no"]);
  assert.equal(svar.ok, false);
  if (svar.ok) return;
  assert.match(svar.feil, /fant ikke gruppen/i);
});

test("bruker uten platform-rolle COACH/ADMIN avvises av requireCoachActionUser, uavhengig av gruppe", async () => {
  reset();
  bruker = { id: "spiller-1", name: "Spiller", role: "PLAYER" };
  const svar = await inviter(["nei@eksempel.no"]);
  assert.equal(svar.ok, false);
});

// ---------------------------------------------------------------------------
// Ny e-post: opprettet/sendt rapporteres separat
// ---------------------------------------------------------------------------

test("ny e-post: opprettet og sendt rapporteres separat, aldri slått sammen", async () => {
  reset();
  const svar = await inviter(["ny-spiller@eksempel.no"]);
  assert.ok(svar.ok);
  if (!svar.ok) return;
  assert.deepEqual(svar.opprettet, ["ny-spiller@eksempel.no"]);
  assert.deepEqual(svar.invitert, ["ny-spiller@eksempel.no"]);
  assert.deepEqual(svar.lagtTil, []);
  assert.deepEqual(svar.feilet, []);
});

test("gruppenavn med <>& escapes i invitasjons-HTML-en — ingen rå tag i e-posten", async () => {
  reset();
  gruppeNavn = 'Gutter <script>&"Elite"';
  const svar = await inviter(["ny-spiller@eksempel.no"]);
  assert.ok(svar.ok);
  assert.equal(sendKall, 1);
  assert.doesNotMatch(sisteHtml, /<script>/);
  assert.match(sisteHtml, /Gutter &lt;script&gt;&amp;&quot;Elite&quot;/);
});

test("resolved provider-feil: medlem opprettet, men aldri rapportert sendt — adresse bevart i feilet", async () => {
  reset();
  sendResultat = "resolved-error";
  const svar = await inviter(["feiler@eksempel.no"]);
  assert.ok(svar.ok);
  if (!svar.ok) return;
  assert.deepEqual(svar.opprettet, ["feiler@eksempel.no"]);
  assert.deepEqual(svar.invitert, [], "resolved provider-feil skal aldri telles som sendt");
  assert.equal(svar.feilet.length, 1);
  assert.equal(svar.feilet[0]?.epost, "feiler@eksempel.no");
  assert.match(svar.feilet[0]?.feil ?? "", /opprettet/i);
});

test("e-postklienten kaster (intern feil): samme garanti som resolved error", async () => {
  reset();
  sendResultat = "kaster";
  const svar = await inviter(["kastefeil@eksempel.no"]);
  assert.ok(svar.ok);
  if (!svar.ok) return;
  assert.deepEqual(svar.invitert, []);
  assert.equal(svar.feilet.length, 1);
  assert.equal(svar.feilet[0]?.epost, "kastefeil@eksempel.no");
});

test("ingen RESEND_API_KEY konfigurert: medlem opprettet, ærlig feil, aldri sendt", async () => {
  reset();
  resendApiKey = undefined as unknown as string;
  delete process.env.RESEND_API_KEY;
  const svar = await inviter(["ukonfigurert@eksempel.no"]);
  assert.ok(svar.ok);
  if (!svar.ok) return;
  assert.deepEqual(svar.invitert, []);
  assert.match(svar.feilet[0]?.feil ?? "", /ikke konfigurert/i);
});

// ---------------------------------------------------------------------------
// Retry på uklaimet (pending-) invitasjon
// ---------------------------------------------------------------------------

test("retry på pending-profil med aktivt medlemskap: sender e-post på nytt, ingen ny bruker, ingen rolleendring", async () => {
  reset();
  eksisterendeBruker = { id: "pending-bruker-1", email: "venter@eksempel.no", authId: "pending-abc123", role: "PLAYER" };
  medlemskapAlleredeAktivt = true;
  const svar = await inviter(["venter@eksempel.no"]);
  assert.ok(svar.ok);
  if (!svar.ok) return;
  assert.deepEqual(svar.invitert, ["venter@eksempel.no"]);
  assert.deepEqual(svar.opprettet, [], "retry oppretter ingen ny profil");
  assert.deepEqual(svar.lagtTil, [], "retry er verken en ny innmelding eller en stille lagtTil");
  assert.equal(opprettedeBrukere.length, 0, "ingen duplikat bruker opprettet i $transaction");
  assert.equal(sendKall, 1);
});

test("retry på pending-profil der sending feiler igjen: ærlig retry-melding, ikke 'opprettet'", async () => {
  reset();
  eksisterendeBruker = { id: "pending-bruker-1", email: "venter@eksempel.no", authId: "pending-abc123", role: "PLAYER" };
  medlemskapAlleredeAktivt = true;
  sendResultat = "resolved-error";
  const svar = await inviter(["venter@eksempel.no"]);
  assert.ok(svar.ok);
  if (!svar.ok) return;
  assert.deepEqual(svar.invitert, []);
  assert.deepEqual(svar.opprettet, []);
  assert.equal(svar.feilet.length, 1);
  assert.doesNotMatch(svar.feilet[0]?.feil ?? "", /^Medlemmet er opprettet/, "skal ikke late som profilen ble opprettet NÅ");
  assert.match(svar.feilet[0]?.feil ?? "", /finnes allerede/i);
});

test("retry på pending-profil uten (ennå) aktivt medlemskap: oppretter medlemskapet via samme port, sender så e-post", async () => {
  reset();
  eksisterendeBruker = { id: "pending-bruker-2", email: "reaktiver@eksempel.no", authId: "pending-def456", role: "PLAYER" };
  medlemskapAlleredeAktivt = false;
  const svar = await inviter(["reaktiver@eksempel.no"]);
  assert.ok(svar.ok);
  if (!svar.ok) return;
  assert.deepEqual(svar.invitert, ["reaktiver@eksempel.no"]);
  assert.equal(opprettedeBrukere.length, 0);
});

test("ordinær, REGISTRERT bruker (ikke pending) legges til stille — uendret av retry-logikken, ingen e-post", async () => {
  reset();
  eksisterendeBruker = { id: "ekte-bruker-1", email: "registrert@eksempel.no", authId: "auth0|ekte-id", role: "PLAYER" };
  const svar = await inviter(["registrert@eksempel.no"]);
  assert.ok(svar.ok);
  if (!svar.ok) return;
  assert.deepEqual(svar.lagtTil, ["registrert@eksempel.no"]);
  assert.deepEqual(svar.invitert, []);
  assert.equal(sendKall, 0, "en allerede registrert bruker skal aldri få e-post");
});
