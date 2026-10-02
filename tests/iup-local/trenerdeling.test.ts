import assert from "node:assert/strict";
import { AsyncLocalStorage } from "node:async_hooks";
import { createHash, randomUUID } from "node:crypto";
import { mock, test } from "node:test";
import pg from "pg";
import { NAVNGITT_PROFIL_TEKST_VERSJON } from "../../src/lib/deling/navngitt-regler";
import { lesIupLagring } from "../../src/lib/iup/lagringskontrakt";
import { hentUtviklingssporsmal } from "../../src/lib/iup/utviklingssjekk";

const identitet = new AsyncLocalStorage<string>();
let innlogget: string | null = null;
let bekreftet = true;
let db: typeof import("../../src/lib/prisma").prisma;
let api: typeof import("../../src/lib/deling/navngitt");
let lesing: typeof import("../../src/lib/iup/trener-lesing");
let trenerliste: typeof import("../../src/lib/deling/treneroversikt");
const sql = new pg.Client({ connectionString: process.env.DATABASE_URL });
const spiller = "deling-test-spiller";
const forelder = "deling-test-forelder";
const wang = "deling-test-wang";
const annen = "deling-test-annen";
const tn = "deling-test-tn";
const skole = "deling-test-skole";
let tnGruppe = "";
const aktorer = [spiller, forelder, wang, annen, tn];

mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => { const id = identitet.getStore() ?? innlogget; return id ? db.user.findUnique({ where: { id } }) : null; } } });
mock.module("@/lib/supabase/server", { namedExports: { createClient: async () => ({ auth: { getUser: async () => {
  const id = identitet.getStore() ?? innlogget;
  const u = id ? await db.user.findUnique({ where: { id } }) : null;
  return { error: null, data: { user: u ? { id: u.authId, email: u.email, email_confirmed_at: bekreftet ? "2026-01-01T00:00:00Z" : null } : null } };
} } }) } });
mock.module("@/lib/rate-limit", { namedExports: { rateLimit: async () => ({ ok: true }) } });

async function opprett(gruppeId = skole, epost = "deling-test-wang@wang.no") {
  innlogget = spiller;
  return api.opprettTrenerInvitasjon({ requestId: randomUUID(), spillerId: spiller, gruppeId, epost, tekstVersjon: NAVNGITT_PROFIL_TEKST_VERSJON, godkjent: true });
}
async function del(gruppeId = skole, epost = "deling-test-wang@wang.no", coach = wang) {
  const r = await opprett(gruppeId, epost); assert.ok(r.ok && r.token);
  innlogget = coach; assert.ok((await api.aksepterTrenerInvitasjon({ token: r.token })).ok);
  return r;
}
async function harTilgang(coach = wang, gruppeId = skole) {
  const u = await db.user.findUniqueOrThrow({ where: { id: coach } });
  return db.$transaction((tx) => api.navngittTrenerHarTilgang(tx, { id: coach, epost: u.email }, spiller, gruppeId));
}

test.before(async () => {
  const url = new URL(process.env.DATABASE_URL ?? "");
  assert.equal(url.hostname, "127.0.0.1"); assert.equal(url.port, "55822"); assert.equal(url.pathname, "/postgres");
  await sql.connect();
  const identitet = await sql.query("SELECT shobj_description(oid, 'pg_database') AS marker FROM pg_database WHERE datname=current_database()");
  assert.equal(identitet.rows[0].marker, "ak-hq-iup-app-20261002");
  ({ prisma: db } = await import("../../src/lib/prisma"));
  api = await import("../../src/lib/deling/navngitt"); lesing = await import("../../src/lib/iup/trener-lesing"); trenerliste = await import("../../src/lib/deling/treneroversikt");
  for (const id of aktorer) await db.user.upsert({ where: { id }, update: {}, create: {
    id, authId: randomUUID(), name: "Syntetisk deltaker", email: `${id}@${id === tn ? "golfforbundet.no" : [wang, annen].includes(id) ? "wang.no" : "example.test"}`,
    role: id === forelder ? "PARENT" : id === spiller ? "PLAYER" : "COACH", dateOfBirth: new Date("2000-01-01"),
  } });
  await db.group.upsert({ where: { id: skole }, update: {}, create: { id: skole, name: "Syntetisk skole", slug: skole, program: "WANG_TOPPIDRETT" } });
  const eksisterende = await db.group.findUnique({ where: { slug: "team-norway" } });
  assert.ok(!eksisterende || eksisterende.id === "deling-test-tn-gruppe", "Testen overtar aldri en annens kanoniske gruppe");
  const g = eksisterende ?? await db.group.create({ data: { id: "deling-test-tn-gruppe", name: "Syntetisk landslag", slug: "team-norway" } });
  tnGruppe = g.id;
});
test.beforeEach(async () => {
  await db.trenerDelingsInvitasjon.deleteMany({ where: { userId: spiller } });
  await db.delingsSamtykke.deleteMany({ where: { userId: spiller } });
  await db.iupBesvarelse.deleteMany({ where: { userId: spiller } });
  await db.parentRelation.deleteMany({ where: { childId: spiller } });
  await db.groupMember.deleteMany({ where: { userId: { in: aktorer } } });
  await db.user.updateMany({ where: { id: { in: aktorer } }, data: { deletedAt: null, anonymisertAt: null, dateOfBirth: new Date("2000-01-01"), requiresGuardianConsent: false, guardianConsentGivenAt: null } });
  await db.group.updateMany({ where: { id: { in: [skole, tnGruppe] } }, data: { arkivertAt: null } });
  await db.groupMember.createMany({ data: [
    { userId: spiller, groupId: skole, role: "PLAYER" }, { userId: wang, groupId: skole, role: "COACH" },
    { userId: annen, groupId: skole, role: "COACH" }, { userId: tn, groupId: tnGruppe, role: "COACH" },
  ] });
  innlogget = spiller; bekreftet = true;
});
test.after(async () => { await db?.$disconnect(); await sql.end(); });

test("lenke lagrer bare hash og gir ikke innsyn før navngitt trener aksepterer", async () => {
  const r = await opprett(); assert.ok(r.ok && r.token);
  const inv = await db.trenerDelingsInvitasjon.findUniqueOrThrow({ where: { id: r.id } });
  assert.equal(inv.tokenHash, createHash("sha256").update(r.token).digest("hex"));
  assert.ok(!JSON.stringify(inv).includes(r.token));
  assert.equal(inv.expiresAt.getTime() - inv.createdAt.getTime(), 7 * 86_400_000);
  assert.equal(await harTilgang(), false);
  innlogget = wang; assert.ok((await api.aksepterTrenerInvitasjon({ token: r.token })).ok);
  assert.equal(await harTilgang(), true); assert.equal(await harTilgang(annen), false);
});
test("gjentatt invitasjon og aksept lager ikke flere samtykker", async () => {
  const p = { requestId: randomUUID(), spillerId: spiller, gruppeId: skole, epost: "deling-test-wang@wang.no", tekstVersjon: NAVNGITT_PROFIL_TEKST_VERSJON, godkjent: true };
  const a = await api.opprettTrenerInvitasjon(p); assert.ok(a.ok && a.token);
  const b = await api.opprettTrenerInvitasjon(p); assert.ok(b.ok); assert.equal(b.token, null);
  assert.equal((await api.opprettTrenerInvitasjon({ ...p, epost: "annen@wang.no" })).ok, false);
  innlogget = wang;
  const resultater = await Promise.all([api.aksepterTrenerInvitasjon({ token: a.token }), api.aksepterTrenerInvitasjon({ token: a.token })]);
  assert.ok(resultater.every((r) => r.ok));
  assert.equal(await db.delingsSamtykke.count({ where: { userId: spiller } }), 1);
});
test("feil og ubekreftet e-post, utløpt lenke og manglende trenermedlemskap avvises", async () => {
  const r = await opprett(); assert.ok(r.ok && r.token);
  innlogget = annen; assert.equal((await api.aksepterTrenerInvitasjon({ token: r.token })).ok, false);
  innlogget = wang; bekreftet = false; await assert.rejects(() => api.aksepterTrenerInvitasjon({ token: r.token }), /forbidden/); bekreftet = true;
  await db.groupMember.updateMany({ where: { userId: wang }, data: { endedAt: new Date() } });
  assert.equal((await api.aksepterTrenerInvitasjon({ token: r.token })).ok, false);
  await db.groupMember.updateMany({ where: { userId: wang }, data: { endedAt: null } });
  await db.trenerDelingsInvitasjon.update({ where: { id: r.id }, data: { createdAt: new Date("2020-01-01"), expiresAt: new Date("2020-01-08") } });
  assert.equal((await api.aksepterTrenerInvitasjon({ token: r.token })).ok, false);
});
test("WANG-elev kan dele med TN uten TN-medlemskap; gammel gruppedeling er ikke nok", async () => {
  await db.delingsSamtykke.create({ data: { userId: spiller, scope: "KOMPLETT_PROFIL", mottakerGruppeId: tnGruppe, gitt: true, tekstVersjon: "2026-08-16", gittAvUserId: spiller, gittAvRolle: "SELV" } });
  assert.equal(await harTilgang(tn, tnGruppe), false);
  await del(tnGruppe, "deling-test-tn@golfforbundet.no", tn);
  assert.equal(await harTilgang(tn, tnGruppe), true);
  assert.equal(await db.groupMember.count({ where: { userId: spiller, groupId: tnGruppe } }), 0);
});
test("feil skole og feil domene/miljø kan ikke få invitasjon", async () => {
  assert.equal((await opprett(tnGruppe)).ok, false);
  assert.equal((await opprett(skole, "test@golfforbundet.no")).ok, false);
  await db.groupMember.updateMany({ where: { userId: spiller }, data: { endedAt: new Date() } });
  assert.equal((await opprett()).ok, false);
});
test("bare eier eller godkjent foresatt kan gi deling; under 16 kan trekke selv", async () => {
  await db.user.update({ where: { id: spiller }, data: { dateOfBirth: new Date("2014-01-01"), requiresGuardianConsent: true, guardianConsentGivenAt: new Date() } });
  assert.equal((await opprett()).ok, false);
  innlogget = forelder;
  const p = { requestId: randomUUID(), spillerId: spiller, gruppeId: skole, epost: "deling-test-wang@wang.no", tekstVersjon: NAVNGITT_PROFIL_TEKST_VERSJON, godkjent: true };
  assert.equal((await api.opprettTrenerInvitasjon(p)).ok, false);
  await db.parentRelation.create({ data: { parentId: forelder, childId: spiller, approved: true } });
  const r = await api.opprettTrenerInvitasjon(p); assert.ok(r.ok && r.token);
  innlogget = wang; assert.ok((await api.aksepterTrenerInvitasjon({ token: r.token })).ok); assert.equal(await harTilgang(), true);
  innlogget = spiller; assert.ok((await api.trekkTrenerDeling({ invitasjonId: r.id, spillerId: spiller })).ok);
  assert.equal(await harTilgang(), false);
  innlogget = wang; assert.equal((await api.aksepterTrenerInvitasjon({ token: r.token })).ok, false);
});
test("trener kan ikke gi seg selv tilgang eller trekke en annens deling", async () => {
  const r = await del(); innlogget = annen;
  assert.equal((await api.trekkTrenerDeling({ invitasjonId: r.id, spillerId: spiller })).ok, false);
  assert.equal((await api.opprettTrenerInvitasjon({ requestId: randomUUID(), spillerId: spiller, gruppeId: skole, epost: "deling-test-annen@wang.no", tekstVersjon: NAVNGITT_PROFIL_TEKST_VERSJON, godkjent: true })).ok, false);
  assert.equal(await harTilgang(), true);
});
test("utmelding, arkivert skole og slettet trener stopper hvert nytt oppslag", async () => {
  await del();
  await db.groupMember.updateMany({ where: { userId: wang }, data: { endedAt: new Date() } }); assert.equal(await harTilgang(), false);
  await db.groupMember.updateMany({ where: { userId: wang }, data: { endedAt: null } });
  await db.group.update({ where: { id: skole }, data: { arkivertAt: new Date() } }); assert.equal(await harTilgang(), false);
  await db.group.update({ where: { id: skole }, data: { arkivertAt: null } });
  await db.user.update({ where: { id: wang }, data: { deletedAt: new Date() } }); assert.equal(await harTilgang(), false);
});
test("tilbaketrekking stenger alle aktive lenker, og gammel lenke kan ikke åpne igjen", async () => {
  const a = await del(); const b = await opprett(); assert.ok(b.ok && b.token);
  innlogget = spiller; assert.ok((await api.trekkTrenerDeling({ invitasjonId: b.id, spillerId: spiller })).ok);
  assert.equal(await harTilgang(), false); innlogget = wang;
  assert.equal((await api.aksepterTrenerInvitasjon({ token: a.token })).ok, false);
  assert.equal((await api.aksepterTrenerInvitasjon({ token: b.token })).ok, false);
});
test("kun kildevaliderte leveringer leses, og tilbaketrekking avviser også direkte historikkoppslag", async () => {
  const d = await del();
  const base = { type: "UTVIKLINGSSJEKK", periodeStart: "2026-10-01", periodeSlutt: "2026-10-28" };
  const hode = await db.iupBesvarelse.create({ data: { userId: spiller, type: base.type, versjon: "iup-2025", niva: "UNG", periodeStart: new Date(base.periodeStart), periodeSlutt: new Date(base.periodeSlutt), kildeSha256: "0".repeat(64), revisjon: 2, levertRevisjon: 1 } });
  for (const revisjon of [1, 2]) {
    const svar = revisjon === 1 ? Object.fromEntries(hentUtviklingssporsmal("iup-2025", "UNG").map((s) => [s.id, 3])) : {};
    const p = lesIupLagring({ ...base, requestId: randomUUID(), forventetRevisjon: revisjon - 1, besvarelse: { versjon: "iup-2025", niva: "UNG", status: revisjon === 1 ? "LEVERT" : "UTKAST", svar } }); assert.ok(p.ok);
    await db.iupBesvarelse.update({ where: { id: hode.id }, data: { kildeSha256: p.data.kildeSha256 } });
    await db.iupRevisjon.create({ data: { besvarelseId: hode.id, revisjon, requestId: p.data.requestId, requestHash: p.data.requestHash, status: p.data.besvarelse.status, payload: p.data.besvarelse } });
  }
  const args = { spillerId: spiller, gruppeId: skole, besvarelseId: hode.id };
  innlogget = wang;
  const lest = await lesing.hentTrenerIup(args); assert.equal(lest?.revisjoner.length, 1); assert.equal(lest?.revisjoner[0].innhold?.status, "LEVERT");
  const oversikt = await lesing.hentTrenerIupOversikt({ spillerId: spiller, gruppeId: skole });
  assert.equal(oversikt?.besvarelser.length, 1); assert.equal(oversikt?.besvarelser[0].levertRevisjon, 1);
  assert.ok(!JSON.stringify(oversikt).includes('"revisjon":2')); assert.ok(!JSON.stringify(oversikt).includes("UTKAST"));
  innlogget = annen; assert.equal(await lesing.hentTrenerIup(args), null);
  assert.equal(await lesing.hentTrenerIupOversikt({ spillerId: spiller, gruppeId: skole }), null);
  innlogget = spiller; await api.trekkTrenerDeling({ invitasjonId: d.id, spillerId: spiller });
  innlogget = wang; assert.equal(await lesing.hentTrenerIup(args), null);
  assert.equal(await lesing.hentTrenerIupOversikt({ spillerId: spiller, gruppeId: skole }), null);
});

test("delingsoversikten viser eierens statuser og TN-valg, aldri token eller fremmede delinger", async () => {
  const a = await opprett(); assert.ok(a.ok && a.token);
  let oversikt = await api.hentEgenTrenerdeling(); assert.ok(oversikt);
  assert.equal(oversikt.invitasjoner[0].status, "VENTER"); assert.equal(oversikt.kanGi, true);
  assert.deepEqual(new Set(oversikt.grupper.map((g) => g.id)), new Set([skole, tnGruppe]));
  assert.ok(!JSON.stringify(oversikt).includes(a.token)); assert.ok(!JSON.stringify(oversikt).includes("tokenHash"));
  innlogget = wang; await api.aksepterTrenerInvitasjon({ token: a.token });
  assert.equal(await api.hentEgenTrenerdeling({ spillerId: spiller }), null);
  innlogget = spiller; oversikt = await api.hentEgenTrenerdeling();
  assert.equal(oversikt?.invitasjoner[0].status, "AKTIV");
  await db.groupMember.updateMany({ where: { userId: spiller }, data: { endedAt: new Date() } });
  oversikt = await api.hentEgenTrenerdeling(); assert.equal(oversikt?.kanGi, false);
  assert.equal(oversikt?.invitasjoner[0].status, "STENGT"); assert.equal(oversikt?.grupper.length, 0);
  await api.trekkTrenerDeling({ invitasjonId: a.id, spillerId: spiller });
  assert.equal((await api.hentEgenTrenerdeling())?.invitasjoner[0].status, "TRUKKET");
});

test("foreldreoversikt krever godkjent relasjon, mens barnet kan se uten å gi", async () => {
  await db.user.update({ where: { id: spiller }, data: { dateOfBirth: new Date("2014-01-01"), requiresGuardianConsent: true, guardianConsentGivenAt: new Date() } });
  innlogget = spiller; assert.equal((await api.hentEgenTrenerdeling())?.kanGi, false);
  innlogget = forelder; assert.equal(await api.hentEgenTrenerdeling({ spillerId: spiller }), null);
  await db.parentRelation.create({ data: { parentId: forelder, childId: spiller, approved: true } });
  const o = await api.hentEgenTrenerdeling({ spillerId: spiller }); assert.equal(o?.kanGi, true); assert.equal(o?.foresattVisning, true);
  await db.parentRelation.updateMany({ where: { childId: spiller }, data: { approved: false } });
  assert.equal(await api.hentEgenTrenerdeling({ spillerId: spiller }), null);
});
test("tilbaketrukket foreldrerelasjon stopper også tidligere akseptert deling", async () => {
  await db.user.update({ where: { id: spiller }, data: { dateOfBirth: new Date("2014-01-01"), requiresGuardianConsent: true, guardianConsentGivenAt: new Date() } });
  await db.parentRelation.create({ data: { parentId: forelder, childId: spiller, approved: true } });
  innlogget = forelder;
  const r = await api.opprettTrenerInvitasjon({ requestId: randomUUID(), spillerId: spiller, gruppeId: skole, epost: "deling-test-wang@wang.no", tekstVersjon: NAVNGITT_PROFIL_TEKST_VERSJON, godkjent: true }); assert.ok(r.ok && r.token);
  innlogget = wang; assert.ok((await api.aksepterTrenerInvitasjon({ token: r.token })).ok);
  await db.parentRelation.updateMany({ where: { childId: spiller }, data: { approved: false } });
  assert.equal(await harTilgang(), false);
});
test("avsluttet elevmedlemskap hindrer lesing, men eieren kan fortsatt trekke delingen", async () => {
  const r = await del();
  await db.groupMember.updateMany({ where: { userId: spiller }, data: { endedAt: new Date() } });
  assert.equal(await harTilgang(), false);
  innlogget = spiller; assert.ok((await api.trekkTrenerDeling({ invitasjonId: r.id, spillerId: spiller })).ok);
});
test("samtidige tilbaketrekkinger etter aksept ender uten innsyn", async () => {
  const r = await opprett(); assert.ok(r.ok && r.token);
  // Hver handling fanger identiteten før første databaseventing.
  innlogget = wang; const aksept = api.aksepterTrenerInvitasjon({ token: r.token });
  await aksept;
  innlogget = spiller;
  await Promise.all([
    api.trekkTrenerDeling({ invitasjonId: r.id, spillerId: spiller }),
    api.trekkTrenerDeling({ invitasjonId: r.id, spillerId: spiller }),
  ]);
  assert.equal(await harTilgang(), false);
});
test("samtidig aksept og tilbaketrekking fra ulike innlogginger kan ikke gjenåpne deling", async () => {
  const r = await opprett(); assert.ok(r.ok && r.token);
  await Promise.all([
    identitet.run(wang, () => api.aksepterTrenerInvitasjon({ token: r.token })),
    identitet.run(spiller, () => api.trekkTrenerDeling({ invitasjonId: r.id, spillerId: spiller })),
  ]);
  assert.equal(await harTilgang(), false);
  assert.ok((await db.trenerDelingsInvitasjon.findUniqueOrThrow({ where: { id: r.id } })).revokedAt);
});
test("invitasjoner har RLS og ingen klientprivilegier", async () => {
  const r = await sql.query("SELECT relrowsecurity FROM pg_class WHERE oid='public.trener_delings_invitasjoner'::regclass"); assert.equal(r.rows[0].relrowsecurity, true);
  for (const rolle of ["anon", "authenticated"]) {
    const q = await sql.query("SELECT has_table_privilege($1,'public.trener_delings_invitasjoner','SELECT,INSERT,UPDATE,DELETE') AS har", [rolle]); assert.equal(q.rows[0].har, false);
  }
});


test("trenerlisten viser bare gjeldende navngitt deling, uten duplikat eller token", async () => {
  const a = await del(); const b = await del();
  innlogget = wang;
  const liste = await trenerliste.hentTrenerensDelteSpillere();
  assert.equal(liste?.spillere.length, 1); assert.equal(liste?.spillere[0].id, spiller);
  assert.ok(!JSON.stringify(liste).includes("token"));
  innlogget = annen; assert.deepEqual((await trenerliste.hentTrenerensDelteSpillere())?.spillere, []);
  innlogget = spiller; await api.trekkTrenerDeling({ invitasjonId: a.id, spillerId: spiller });
  innlogget = wang; assert.deepEqual((await trenerliste.hentTrenerensDelteSpillere())?.spillere, []);
  assert.ok(b.ok);
});

test("TN-trenerlisten inkluderer samtykket WANG-elev uten TN-medlemskap og sperrer avsluttet ansvar", async () => {
  await del(tnGruppe, "deling-test-tn@golfforbundet.no", tn);
  innlogget = tn;
  assert.equal((await trenerliste.hentTrenerensDelteSpillere())?.spillere[0].id, spiller);
  await db.groupMember.updateMany({ where: { userId: tn }, data: { endedAt: new Date() } });
  assert.deepEqual((await trenerliste.hentTrenerensDelteSpillere())?.spillere, []);
  bekreftet = false;
  await assert.rejects(() => trenerliste.hentTrenerensDelteSpillere(), /forbidden/);
});

test("trenerlisten deler inn unike spiller/miljø-par i stabile sider", async () => {
  const mal = await del();
  const invitasjon = await db.trenerDelingsInvitasjon.findUniqueOrThrow({ where: { id: mal.id } });
  const samtykke = await db.delingsSamtykke.findUniqueOrThrow({ where: { id: mal.id } });
  const ids = Array.from({ length: 22 }, (_, i) => `deling-test-side-${String(i).padStart(2, "0")}`);
  try {
    await db.user.createMany({ data: ids.map((id) => ({ id, authId: randomUUID(), email: `${id}@example.test`, name: "Syntetisk side", role: "PLAYER", dateOfBirth: new Date("2000-01-01") })) });
    await db.groupMember.createMany({ data: ids.map((id) => ({ userId: id, groupId: skole, role: "PLAYER" })) });
    await db.trenerDelingsInvitasjon.createMany({ data: ids.map((id) => ({ ...invitasjon, id, userId: id, gittAvUserId: id, tokenHash: createHash("sha256").update(id).digest("hex") })) });
    await db.delingsSamtykke.createMany({ data: ids.map((id) => ({ ...samtykke, id, userId: id, gittAvUserId: id })) });
    innlogget = wang;
    const a = await trenerliste.hentTrenerensDelteSpillere(); assert.ok(a?.nesteSide); assert.equal(a.spillere.length, 20);
    const b = await trenerliste.hentTrenerensDelteSpillere(a.nesteSide); assert.ok(b); assert.equal(b.spillere.length, 3); assert.equal(b.nesteSide, null);
    assert.equal(new Set([...a.spillere, ...b.spillere].map((r) => `${r.id}:${r.gruppeId}`)).size, 23);
    assert.equal(await trenerliste.hentTrenerensDelteSpillere({ etterSpiller: spiller }), null);
  } finally {
    await db.delingsSamtykke.deleteMany({ where: { userId: { in: ids } } });
    await db.user.deleteMany({ where: { id: { in: ids } } });
  }
});
