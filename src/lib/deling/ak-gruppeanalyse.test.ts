import { before, beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { AK_ANALYSE_SCOPE, AK_ANALYSE_VERSJON } from "./ak-analyse-regler";

type Arg = Record<string, unknown>;
const databaseTid = new Date("2026-10-23T12:00:00Z");
const voksen = { dateOfBirth: new Date("1984-01-01"), requiresGuardianConsent: false };
let bruker = { id: "coach", role: "ADMIN" };
let gruppe: { id: string } | null;
let spiller: typeof voksen | null;
let medlemmer: Array<typeof voksen & { id: string }>;
let rader: Array<ReturnType<typeof ja>>;
let relasjon: { id: string } | null;
let historikk: { id: string } | null;
let kall: Array<{ metode: string; arg: unknown }>;
let skriv: Arg[];
let audit: Arg[];
let aktorTilgjengelig = true;
let aktorRolle: string | null = null;
let laasFeil = false;
let tilgangForsvant = false;
let laasteMedlemmer: Array<{ id: string; userId: string }>;
const medlemsIder = () => laasteMedlemmer.map(m => m.id);
const ja = (userId = "spiller-a", groupId = "gruppe-a", gitt = true) => ({ userId,
  scope: AK_ANALYSE_SCOPE, mottakerGruppeId: groupId, mottakerUserId: null,
  tekstVersjon: AK_ANALYSE_VERSJON, gitt, gittAvRolle: "SELV", createdAt: new Date("2026-01-01"),
});
const tx = {
  $queryRaw: async (sql: TemplateStringsArray, ...param: unknown[]) => {
    const tekst = sql.join("");
    const metode = tekst.includes("clock_timestamp()") ? "databasetid" :
      tekst.includes("group_members") ? "medlemslås" : tekst.includes("FROM groups") ? "gruppelås" :
      tekst.includes("FROM users") ? "brukerlås" : tekst.includes("parent_relations") ? "forelderlås" : "lås";
    kall.push({ metode, arg: [sql.join("?"), ...param] });
    if (laasFeil && metode === "medlemslås") throw Error("Syntetisk låsefeil");
    return metode === "databasetid" ? [{ naa: databaseTid }] : metode === "medlemslås" ? laasteMedlemmer :
      metode === "gruppelås" ? (gruppe ? [gruppe] : []) : metode === "forelderlås" ? (relasjon ? [relasjon] : []) :
      metode === "brukerlås" ? ["spiller-a", "spiller-b", "coach", "forelder"].map(id => ({ id })) : [];
  },
  group: { findFirst: async (arg: Arg) => { kall.push({ metode: "gruppe", arg }); return tilgangForsvant && kall.some(k => k.metode === "brukerlås") ? null : gruppe; } },
  user: {
    findMany: async (arg: Arg) => { kall.push({ metode: "medlemmer", arg }); return medlemmer; },
    findFirst: async (arg: { where: { id: string }; select: { role?: boolean } }) => {
      if (arg.select.role) {
        kall.push({ metode: "aktør", arg });
        return aktorTilgjengelig ? { role: aktorRolle ?? (arg.where.id === "forelder" ? "PARENT" : arg.where.id === "spiller-a" ? "PLAYER" : bruker.role) } : null;
      }
      return spiller;
    },
  },
  delingsSamtykke: {
    findMany: async (arg: Arg) => { kall.push({ metode: "samtykke", arg }); return rader; },
    findFirst: async (arg: Arg) => { kall.push({ metode: "historikk", arg }); return historikk; },
    create: async ({ data }: { data: Arg }) => { skriv.push(data); return data; },
  },
  parentRelation: { findFirst: async (arg: Arg) => { kall.push({ metode: "forelder", arg }); return relasjon; } },
  auditLog: { create: async ({ data }: { data: Arg }) => { audit.push(data); return data; } },
  workbenchSession: { findMany: async (arg: Arg) => { kall.push({ metode: "trening", arg }); return []; } },
};
mock.module("@/lib/prisma", { namedExports: { prisma: {
  $transaction: async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx),
} } });
mock.module("@/lib/auth/requireCapability", { namedExports: {
  requireCapability: async () => bruker,
} });
let medAkGruppeanalyse: typeof import("./ak-gruppeanalyse").medAkGruppeanalyse;
let settAkAnalyseValg: typeof import("./ak-gruppeanalyse").settAkAnalyseValg;
let lastEnGruppeAnalyse: typeof import("@/lib/admin/analyse/gruppe-analyse").lastEnGruppeAnalyse;
let lastEtterlevelsePerGruppe: typeof import("@/lib/admin/analyse/gruppe-analyse").lastEtterlevelsePerGruppe;
before(async () => {
  ({ medAkGruppeanalyse, settAkAnalyseValg } = await import("./ak-gruppeanalyse"));
  ({ lastEnGruppeAnalyse, lastEtterlevelsePerGruppe } = await import("@/lib/admin/analyse/gruppe-analyse"));
});
const input = (gitt: boolean) => ({ gruppeId: "gruppe-a", gitt, tekstVersjon: AK_ANALYSE_VERSJON });
const selv = { id: "spiller-a", role: "PLAYER" };
beforeEach(() => {
  bruker = { id: "coach", role: "ADMIN" }; gruppe = { id: "gruppe-a" }; spiller = { ...voksen };
  medlemmer = [{ ...voksen, id: "spiller-a" }, { ...voksen, id: "spiller-b" }];
  rader = []; relasjon = { id: "relasjon" }; historikk = { id: "tidligere-valg" };
  kall = []; skriv = []; audit = [];
  aktorTilgjengelig = true; aktorRolle = null; laasFeil = false; tilgangForsvant = false;
  laasteMedlemmer = [ { id: "medlem-a", userId: "spiller-a" }, { id: "medlem-b", userId: "spiller-b" }, { id: "medlem-coach", userId: "coach" } ];
});

test("ADMIN kan ikke lese trening uten samtykke; medlemskap og sletting filtreres på serveren", async () => {
  const result = await lastEnGruppeAnalyse("gruppe-a");
  assert.equal(result.antallSpillere, 0);
  assert.equal(result.etterlevelsePct, null);
  assert.equal(kall.some(k => k.metode === "trening"), false);
  assert.deepEqual(kall.find(k => k.metode === "medlemmer")?.arg, {
    where: { id: { in: laasteMedlemmer.map(m => m.userId) }, role: "PLAYER", deletedAt: null, groupMemberships: { some: { id: { in: medlemsIder() }, groupId: "gruppe-a", role: "PLAYER", endedAt: null } } },
    select: { id: true, dateOfBirth: true, requiresGuardianConsent: true },
  });
  const g = kall.findLast(k => k.metode === "gruppe")?.arg as { where: Arg };
  assert.deepEqual(g.where, { id: "gruppe-a", managedByAkGolf: true, arkivertAt: null });
});
test("gruppeanalyse leser bare samtykkede spillere og publiserbart treningsgrunnlag, aldri notater", async () => {
  rader = [ja()];
  assert.equal((await lastEnGruppeAnalyse("gruppe-a")).antallSpillere, 1);
  const les = kall.find(k => k.metode === "trening")?.arg as { where: Arg; select: Arg };
  assert.deepEqual(les.where.playerId, { in: ["spiller-a"] });
  assert.equal(les.where.hiddenByPlayer, false);
  assert.equal(les.where.needsPlayerApproval, false);
  assert.equal(les.where.isTemplate, false);
  assert.deepEqual(les.where.status, { not: "DRAFT" });
  assert.deepEqual(les.where.OR, [{ approvalStatus: null }, { approvalStatus: { notIn: ["PENDING", "REJECTED"] } }]);
  assert.equal("notes" in les.select, false); assert.equal("name" in les.select, false);
  assert.equal(kall[0].metode, "lås");
});
test("samtykke i A gjelder ikke i B; nyere trekk stopper neste lesing", async () => {
  rader = [ja()];
  assert.equal((await lastEnGruppeAnalyse("gruppe-b")).antallSpillere, 0);
  rader.push({ ...ja("spiller-a", "gruppe-a", false), createdAt: new Date("2026-02-01") });
  assert.equal((await lastEnGruppeAnalyse("gruppe-a")).antallSpillere, 0);
  assert.equal(kall.some(k => k.metode === "trening"), false);
});
test("ingen trening når gruppen er ekstern/arkivert/utilgjengelig eller medlemskapet avsluttet", async () => {
  rader = [ja()]; gruppe = null;
  assert.equal(await medAkGruppeanalyse("gruppe-a", async () => { throw Error("Må ikke lese"); }), null);
  gruppe = { id: "gruppe-a" }; medlemmer = [];
  assert.equal((await lastEnGruppeAnalyse("gruppe-a")).antallSpillere, 0);
  assert.equal(kall.some(k => k.metode === "trening"), false);
});
test("COACH må være ansvarlig eller aktiv trener/assistent i gruppen; andre roller avslås", async () => {
  bruker.role = "COACH";
  await medAkGruppeanalyse("gruppe-a", async () => []);
  const g = kall.findLast(k => k.metode === "gruppe")?.arg as { where: Arg };
  assert.deepEqual(g.where.OR, [{ coachId: "coach" }, { members: { some: { id: { in: medlemsIder() }, userId: "coach", endedAt: null, role: { in: ["COACH", "ASSISTANT"] } } } }]);
  bruker.role = "PLAYER"; kall = [];
  assert.equal(await medAkGruppeanalyse("gruppe-a", async () => []), null);
  assert.deepEqual(kall, []);
});
test("foresatt kreves i lesing selv når gammelt selv-ja finnes", async () => {
  medlemmer[0].dateOfBirth = new Date("2014-01-01"); rader = [ja()];
  assert.equal((await lastEnGruppeAnalyse("gruppe-a")).antallSpillere, 0);
  rader[0].gittAvRolle = "FORESATT";
  assert.equal((await lastEnGruppeAnalyse("gruppe-a")).antallSpillere, 1);
});
test("gruppelisten låser én gruppe om gangen og gjenbruker ikke samtykke", async () => {
  rader = [ja()];
  await lastEtterlevelsePerGruppe([{ id: "gruppe-a" }, { id: "gruppe-b" }, { id: "gruppe-a" }]);
  assert.equal(kall.filter(k => k.metode === "lås").length, 2);
  assert.equal(kall.filter(k => k.metode === "trening").length, 1);
});
test("eget ja lagres med gjeldende tekst, selv-aktør, tidspunkt etter lås og revisjonsspor", async () => {
  assert.deepEqual(await settAkAnalyseValg(selv, selv.id, input(true)), { ok: true });
  assert.equal(skriv.length, 1); assert.equal(audit.length, 1);
  assert.equal(skriv[0].gittAvRolle, "SELV"); assert.equal(skriv[0].gittAvUserId, selv.id);
  assert.equal(skriv[0].scope, AK_ANALYSE_SCOPE); assert.equal(skriv[0].tekstVersjon, AK_ANALYSE_VERSJON);
  assert.equal(skriv[0].mottakerUserId, null); assert.deepEqual(skriv[0].createdAt, databaseTid);
  assert.ok(kall.findIndex(k => k.metode === "databasetid") > kall.findIndex(k => k.metode === "brukerlås"));
  assert.equal(kall[0].metode, "lås");
});
test("ADMIN kan ikke samtykke for andre; feil tekstversjon/ekstra felt avvises uten skriving", async () => {
  assert.equal((await settAkAnalyseValg(bruker, selv.id, input(true))).ok, false);
  assert.equal((await settAkAnalyseValg(selv, selv.id, { ...input(true), tekstVersjon: "gammel" })).ok, false);
  assert.equal((await settAkAnalyseValg(selv, selv.id, { ...input(true), userId: "annen" })).ok, false);
  assert.deepEqual(skriv, []); assert.deepEqual(audit, []);
});
test("barn/ukjent alder kan trekke selv, men ikke gi; forelder krever godkjent relasjon", async () => {
  spiller = { ...voksen, dateOfBirth: new Date("2014-01-01"), requiresGuardianConsent: true };
  assert.equal((await settAkAnalyseValg(selv, selv.id, input(true))).ok, false);
  assert.equal((await settAkAnalyseValg(selv, selv.id, input(false))).ok, true);
  const forelder = { id: "forelder", role: "PARENT" };
  relasjon = null;
  assert.equal((await settAkAnalyseValg(forelder, selv.id, input(true))).ok, false);
  relasjon = { id: "relasjon" };
  assert.equal((await settAkAnalyseValg(forelder, selv.id, input(true))).ok, true);
  assert.equal(skriv[1].gittAvRolle, "FORESATT");
  assert.deepEqual((kall.findLast(k => k.metode === "forelder")?.arg as { where: Arg }).where,
    { id: { in: ["relasjon"] }, parentId: forelder.id, childId: selv.id, approved: true });
});
test("forelder kan ikke endre voksen spillers valg", async () => {
  for (const gitt of [true, false]) assert.equal((await settAkAnalyseValg({ id: "forelder", role: "PARENT" }, selv.id, input(gitt))).ok, false);
  assert.deepEqual(skriv, []);
});
test("utmeldt spiller kan trekke tidligere valg, men ikke gi nytt eller opprette vilkårlig historikk", async () => {
  gruppe = null;
  assert.equal((await settAkAnalyseValg(selv, selv.id, input(true))).ok, false);
  assert.equal((await settAkAnalyseValg(selv, selv.id, input(false))).ok, true);
  historikk = null;
  assert.equal((await settAkAnalyseValg(selv, selv.id, input(false))).ok, false);
  assert.equal(skriv.length, 1);
});

test("gammelt foresattflagg etter 16 gir aldri falsk bekreftelse på forelderens trekk", async () => {
  spiller = { ...voksen, requiresGuardianConsent: true };
  for (const gitt of [true, false]) {
    assert.equal((await settAkAnalyseValg({ id: "forelder", role: "PARENT" }, selv.id, input(gitt))).ok, false);
  }
  assert.deepEqual(skriv, []);
  assert.equal((await settAkAnalyseValg(selv, selv.id, input(false))).ok, true);
});


test("gruppe, medlemskap og konto er låst før tids-/tilgangskontroll og trening", async () => {
  rader = [ja()];
  await lastEnGruppeAnalyse("gruppe-a");
  assert.deepEqual(kall.slice(0, 6).map(k => k.metode), ["lås", "gruppe", "gruppelås", "medlemslås", "brukerlås", "databasetid"]);
  assert.ok(kall.findIndex(k => k.metode === "trening") > kall.findIndex(k => k.metode === "samtykke"));
});
test("nye medlemmer etter låseuttrekket kan ikke snike seg inn i dette oppslaget", async () => {
  laasteMedlemmer = [];
  await medAkGruppeanalyse("gruppe-a", async () => []);
  const q = kall.find(k => k.metode === "medlemmer")?.arg as { where: { id: unknown; groupMemberships: { some: { id: unknown } } } };
  assert.deepEqual(q.where.id, { in: [] });
  assert.deepEqual(q.where.groupMemberships.some.id, { in: [] });
});
test("konto utilgjengelig etter låsen gir verken analyse eller nytt samtykke", async () => {
  aktorTilgjengelig = false; rader = [ja()];
  assert.equal(await medAkGruppeanalyse("gruppe-a", async () => { throw Error("Må ikke lese"); }), null);
  assert.equal((await settAkAnalyseValg(selv, selv.id, input(true))).ok, false);
  assert.deepEqual(skriv, []);
});
test("forelderrelasjonen er låst før myndighet og tidspunkt brukes", async () => {
  spiller = { ...voksen, dateOfBirth: new Date("2014-01-01"), requiresGuardianConsent: true };
  assert.equal((await settAkAnalyseValg({ id: "forelder", role: "PARENT" }, selv.id, input(true))).ok, true);
  const metoder = kall.map(k => k.metode);
  assert.ok(metoder.indexOf("forelderlås") < metoder.indexOf("databasetid"));
  assert.ok(metoder.indexOf("databasetid") < metoder.lastIndexOf("forelder"));
});
test("låsefeil avslutter uten å lese trening eller lagre valg", async () => {
  laasFeil = true; rader = [ja()];
  await assert.rejects(() => medAkGruppeanalyse("gruppe-a", async () => { throw Error("Må ikke lese"); }), /Syntetisk låsefeil/);
  await assert.rejects(() => settAkAnalyseValg(selv, selv.id, input(true)), /Syntetisk låsefeil/);
  assert.equal(kall.some(k => k.metode === "trening"), false);
  assert.deepEqual(skriv, []);
});


test("en gammel ADMIN-økt gir ikke analyse etter at kontorollen er endret", async () => {
  aktorRolle = "PLAYER"; rader = [ja()];
  assert.equal(await medAkGruppeanalyse("gruppe-a", async () => { throw Error("Må ikke lese"); }), null);
  assert.equal(kall.some(k => k.metode === "samtykke"), false);
});


test("manglende tilgang avslås før gruppens medlems- og kontorader låses", async () => {
  gruppe = null;
  assert.equal(await medAkGruppeanalyse("gruppe-a", async () => { throw Error("Må ikke lese"); }), null);
  assert.equal((await settAkAnalyseValg(selv, selv.id, input(true))).ok, false);
  assert.equal(kall.some(k => ["medlemslås", "brukerlås"].includes(k.metode)), false);
  gruppe = { id: "gruppe-a" }; relasjon = null;
  assert.equal((await settAkAnalyseValg({ id: "forelder", role: "PARENT" }, selv.id, input(true))).ok, false);
  assert.equal(kall.some(k => ["medlemslås", "brukerlås"].includes(k.metode)), false);
});
test("en bestått tidlig port erstatter aldri endelig kontroll etter lås", async () => {
  tilgangForsvant = true; rader = [ja()];
  assert.equal(await medAkGruppeanalyse("gruppe-a", async () => { throw Error("Må ikke lese"); }), null);
  kall = [];
  assert.equal((await settAkAnalyseValg(selv, selv.id, input(true))).ok, false);
  assert.deepEqual(skriv, []);
});
