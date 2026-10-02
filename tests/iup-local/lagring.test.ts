import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mock, test } from "node:test";
import pg from "pg";
import { hentUtviklingssporsmal } from "../../src/lib/iup/utviklingssjekk";
import { hentSesongsporsmal } from "../../src/lib/iup/sesongevaluering";
import { lesIupLagring } from "../../src/lib/iup/lagringskontrakt";

type TestBruker = { id: string; role: string; requiresGuardianConsent: boolean; guardianConsentGivenAt: Date | null };
let bruker: TestBruker | null = null;
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => bruker } });
let lagreEgenIup: typeof import("../../src/lib/iup/lagring").lagreEgenIup;
let hentEgenIup: typeof import("../../src/lib/iup/lagring").hentEgenIup;
let prisma: typeof import("../../src/lib/prisma").prisma;
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
const eier = "iup-syntetisk-spiller-a";
const annen = "iup-syntetisk-spiller-b";

function kommando() {
  return {
    type: "UTVIKLINGSSJEKK", periodeStart: "2026-10-01", periodeSlutt: "2026-10-28",
    forventetRevisjon: 0, requestId: randomUUID(),
    besvarelse: { versjon: "iup-2025", niva: "UNG", status: "UTKAST", svar: {} },
  };
}
function levert() {
  const p = kommando();
  return { ...p, besvarelse: { ...p.besvarelse, status: "LEVERT", svar: Object.fromEntries(hentUtviklingssporsmal("iup-2025", "UNG").map((s) => [s.id, 3])) } };
}
async function antall() { return prisma.iupRevisjon.count(); }

test.before(async () => {
  const url = new URL(process.env.DATABASE_URL ?? "");
  assert.equal(url.hostname, "127.0.0.1"); assert.equal(url.port, "55622");
  assert.equal(url.pathname, "/ak_hq_iup_test_20261002"); assert.equal(url.username, "iup_test_20261002");
  await db.connect();
  const identitet = await db.query("SELECT current_database() AS db, name FROM public._iup_test_identity");
  assert.deepEqual(identitet.rows, [{ db: "ak_hq_iup_test_20261002", name: "ak-hq-iup-test-20261002" }]);
  ({ lagreEgenIup, hentEgenIup } = await import("../../src/lib/iup/lagring"));
  ({ prisma } = await import("../../src/lib/prisma"));
  await db.query('INSERT INTO public.users (id) VALUES ($1), ($2) ON CONFLICT DO NOTHING', [eier, annen]);
});
test.beforeEach(async () => {
  await prisma.iupBesvarelse.deleteMany({ where: { userId: { in: [eier, annen] } } });
  await db.query('UPDATE public.users SET "deletedAt" = NULL, "anonymisertAt" = NULL WHERE id = ANY($1)', [[eier, annen]]);
  bruker = { id: eier, role: "PLAYER", requiresGuardianConsent: false, guardianConsentGivenAt: null };
});
test.after(async () => { await prisma?.$disconnect(); await db.end(); });

test("eget utkast får én kanonisk besvarelse og en reell databasekvittering", async () => {
  const r = await lagreEgenIup(kommando()); assert.ok(r.ok);
  assert.equal(r.revisjon, 1); assert.equal(r.gjentatt, false);
  const hode = await prisma.iupBesvarelse.findUniqueOrThrow({ where: { id: r.id }, include: { revisjoner: true } });
  assert.equal(hode.userId, eier); assert.equal(hode.levertRevisjon, null); assert.equal(hode.revisjoner.length, 1);
  assert.equal(hode.revisjoner[0].status, "UTKAST");
});

test("manglende svar kan ikke leveres, og en ugyldig forespørsel skriver ingen rader", async () => {
  const p = kommando();
  const r = await lagreEgenIup({ ...p, besvarelse: { ...p.besvarelse, status: "LEVERT" } });
  assert.ok(!r.ok); assert.equal(r.kode, "UGYLDIG");
  assert.equal(await prisma.iupBesvarelse.count(), 0); assert.equal(await antall(), 0);
});

test("gjenforsøk oppretter ikke duplikat, heller ikke etter en senere revisjon", async () => {
  const p = kommando(); const a = await lagreEgenIup(p); assert.ok(a.ok);
  const b = await lagreEgenIup({ ...p, requestId: randomUUID(), forventetRevisjon: 1 }); assert.ok(b.ok);
  const igjen = await lagreEgenIup(p); assert.ok(igjen.ok);
  assert.equal(igjen.revisjon, 1); assert.equal(igjen.gjeldendeRevisjon, 2); assert.ok(igjen.gjentatt);
  assert.equal(await antall(), 2); assert.equal(await prisma.iupBesvarelse.count(), 1);
});

test("samme request-ID med annet innhold avvises uten å endre historikken", async () => {
  const p = levert(); assert.ok((await lagreEgenIup(p)).ok);
  const id = Object.keys(p.besvarelse.svar)[0];
  const r = await lagreEgenIup({ ...p, besvarelse: { ...p.besvarelse, svar: { ...p.besvarelse.svar, [id]: 4 } } });
  assert.ok(!r.ok); assert.equal(r.kode, "REQUEST_GJENBRUKT"); assert.equal(await antall(), 1);
});

test("samtidige ulike førstegangssvar gir én lagring og én synlig konflikt", async () => {
  const r = await Promise.all([lagreEgenIup(kommando()), lagreEgenIup(kommando())]);
  assert.equal(r.filter((v) => v.ok).length, 1);
  assert.equal(r.filter((v) => !v.ok && v.kode === "KONFLIKT").length, 1);
  assert.equal(await antall(), 1); assert.equal(await prisma.iupBesvarelse.count(), 1);
});

test("samtidige identiske gjenforsøk returnerer samme revisjon", async () => {
  const p = kommando(); const r = await Promise.all([lagreEgenIup(p), lagreEgenIup(p)]);
  assert.ok(r.every((v) => v.ok && v.revisjon === 1)); assert.equal(await antall(), 1);
});

test("nytt utkast beholder tidligere levert snapshot, og foreldet klient får konflikt", async () => {
  const p = levert(); const a = await lagreEgenIup(p); assert.ok(a.ok);
  const b = await lagreEgenIup({ ...kommando(), forventetRevisjon: 1 }); assert.ok(b.ok);
  const hode = await prisma.iupBesvarelse.findUniqueOrThrow({ where: { id: a.id }, include: { revisjoner: { orderBy: { revisjon: "asc" } } } });
  assert.equal(hode.levertRevisjon, 1); assert.equal(hode.revisjon, 2);
  assert.deepEqual(hode.revisjoner[0].payload, p.besvarelse);
  const stale = await lagreEgenIup({ ...p, requestId: randomUUID() });
  assert.ok(!stale.ok); assert.equal(stale.kode, "KONFLIKT"); assert.equal(await antall(), 2);
});

test("klienten kan ikke velge annen eier, besvarelse-ID eller organisasjonskopi", async () => {
  for (const ekstra of [{ userId: annen }, { besvarelseId: "fremmed" }, { groupId: "wang-b" }]) {
    const r = await lagreEgenIup({ ...kommando(), ...ekstra }); assert.ok(!r.ok); assert.equal(r.kode, "UGYLDIG");
  }
  assert.equal(await antall(), 0);
  const a = await lagreEgenIup(kommando()); assert.ok(a.ok);
  bruker!.id = annen;
  const b = await lagreEgenIup(kommando()); assert.ok(b.ok); assert.notEqual(a.id, b.id);
  assert.equal(await prisma.iupBesvarelse.count(), 2);
});

test("utlogget, ekstern leser og barn uten samtykke stoppes av den virkelige handlingsvakten", async () => {
  bruker = null; await assert.rejects(() => lagreEgenIup(kommando()), /unauthenticated/);
  bruker = { id: eier, role: "GUEST", requiresGuardianConsent: false, guardianConsentGivenAt: null };
  await assert.rejects(() => lagreEgenIup(kommando()), /forbidden/);
  bruker.role = "PLAYER"; bruker.requiresGuardianConsent = true;
  await assert.rejects(() => lagreEgenIup(kommando()), /guardian-consent-required/);
  assert.equal(await antall(), 0);
});

test("slettet eller anonymisert konto kan ikke skrive med en gammel økt", async () => {
  await db.query('UPDATE public.users SET "deletedAt" = NOW() WHERE id = $1', [eier]);
  await assert.rejects(() => lagreEgenIup(kommando()), /forbidden/);
  await db.query('UPDATE public.users SET "deletedAt" = NULL, "anonymisertAt" = NOW() WHERE id = $1', [eier]);
  await assert.rejects(() => lagreEgenIup(kommando()), /forbidden/); assert.equal(await antall(), 0);
});

test("JSON-nøkkelrekkefølge endrer ikke lagringskvitteringen", () => {
  const p = levert();
  const a = lesIupLagring(p); const b = lesIupLagring({ ...p, besvarelse: { ...p.besvarelse, svar: Object.fromEntries(Object.entries(p.besvarelse.svar).reverse()) } });
  assert.ok(a.ok && b.ok); assert.equal(a.data.requestHash, b.data.requestHash);
  const c = lesIupLagring({ ...p, requestId: p.requestId.toUpperCase() });
  assert.ok(c.ok); assert.equal(a.data.requestHash, c.data.requestHash);
});

test("eieren leser validert historikk; annen spiller kan ikke lese via en kjent ID", async () => {
  const p = levert(); const a = await lagreEgenIup(p); assert.ok(a.ok);
  const historikk = await hentEgenIup({ id: a.id }); assert.ok(historikk);
  assert.deepEqual(historikk.revisjoner[0].innhold, p.besvarelse);
  assert.equal(historikk.revisjoner[0].kildeEllerFormatAvviker, false);
  bruker!.id = annen;
  assert.equal(await hentEgenIup({ id: a.id }), null);
  assert.equal(await hentEgenIup({ id: "finnes-ikke" }), null);
});

test("ukjent eller endret lagret payload vises som avvik, ikke som et gyldig svar", async () => {
  const a = await lagreEgenIup(levert()); assert.ok(a.ok);
  await db.query('UPDATE public.iup_revisjoner SET payload=$1 WHERE "besvarelseId"=$2', [JSON.stringify({ ukjent: true }), a.id]);
  const historikk = await hentEgenIup({ id: a.id }); assert.ok(historikk);
  assert.equal(historikk.revisjoner[0].innhold, null);
  assert.equal(historikk.revisjoner[0].kildeEllerFormatAvviker, true);
});

test("lang historikk kan leses sidevis uten hull eller dupliserte revisjoner", async () => {
  bruker!.id = annen;
  let id = "";
  for (let revisjon = 0; revisjon < 21; revisjon++) {
    const r = await lagreEgenIup({ ...kommando(), forventetRevisjon: revisjon }); assert.ok(r.ok); id = r.id;
  }
  const side1 = await hentEgenIup({ id }); assert.ok(side1);
  assert.equal(side1.revisjoner.length, 20); assert.equal(side1.nesteRevisjon, 2);
  const side2 = await hentEgenIup({ id, forRevisjon: side1.nesteRevisjon }); assert.ok(side2);
  assert.deepEqual(side2.revisjoner.map((r) => r.revisjon), [1]); assert.equal(side2.nesteRevisjon, null);
  assert.ok([...side1.revisjoner, ...side2.revisjoner].every((r) => !r.kildeEllerFormatAvviker));
});

test("sesongevaluering lagres med samme vern og riktig kilde, datoer og generelt nivå", async () => {
  const sp = hentSesongsporsmal("iup-2025"); const p = kommando();
  const besvarelse = {
    versjon: "iup-2025", sesongStart: p.periodeStart, sesongSlutt: p.periodeSlutt, status: "LEVERT",
    fritekst: Object.fromEntries(sp.filter((s) => s.type === "FRITEKST").map((s) => [s.id, "Syntetisk svar"])),
    vurderinger: Object.fromEntries(sp.filter((s) => s.type === "SKALA").map((s) => [s.id, 4])),
    fordelingFaktisk: { FYS: 20, TEK: 20, SLAG: 20, SPILL: 20, TURN: 20 },
    fordelingPlanlagt: { FYS: 20, TEK: 20, SLAG: 20, SPILL: 20, TURN: 20 },
    forbedringspunkter: ["Planlegge", "Trene", "Evaluere"],
  };
  const r = await lagreEgenIup({ ...p, type: "SESONGEVALUERING", besvarelse }); assert.ok(r.ok);
  const hode = await prisma.iupBesvarelse.findUniqueOrThrow({ where: { id: r.id } });
  assert.equal(hode.niva, "ALLE"); assert.equal(hode.type, "SESONGEVALUERING"); assert.equal(hode.levertRevisjon, 1);
  assert.equal(lesIupLagring({ ...p, type: "SESONGEVALUERING", besvarelse: { ...besvarelse, sesongStart: "2025-10-01" } }).ok, false);
});

test("begge faktiske tabeller har RLS og ingen offentlig eller innlogget API-lesing", async () => {
  const r = await db.query("SELECT c.relname, c.relrowsecurity, has_table_privilege('anon', c.oid, 'SELECT,INSERT,UPDATE,DELETE') AS anon, has_table_privilege('authenticated', c.oid, 'SELECT,INSERT,UPDATE,DELETE') AS authenticated FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN ('iup_besvarelser','iup_revisjoner') ORDER BY c.relname");
  assert.equal(r.rowCount, 2);
  for (const rad of r.rows) { assert.equal(rad.relrowsecurity, true); assert.equal(rad.anon, false); assert.equal(rad.authenticated, false); }
});

test("faktisk kaskadesletting fjerner både besvarelse og revisjon ved kontosletting", async () => {
  assert.ok((await lagreEgenIup(levert())).ok);
  await db.query("BEGIN");
  try {
    await db.query("DELETE FROM public.users WHERE id=$1", [eier]);
    assert.equal((await db.query("SELECT count(*)::int AS n FROM public.iup_besvarelser")).rows[0].n, 0);
    assert.equal((await db.query("SELECT count(*)::int AS n FROM public.iup_revisjoner")).rows[0].n, 0);
  } finally { await db.query("ROLLBACK"); }
});
