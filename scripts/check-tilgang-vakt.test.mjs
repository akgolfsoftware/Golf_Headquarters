import test from "node:test";
import assert from "node:assert/strict";
import {
  analyserRute,
  analyserAction,
  samleFunn,
  sammenlign,
  KJENT_GJELD,
  PUBLIC_ROUTES,
} from "./check-tilgang-vakt.mjs";

const REL = "src/app/api/ny/route.ts";

test("ny rute uten noen tilgangssjekk feiler", () => {
  const txt = `export async function POST(req: Request) {\n  const body = await req.json();\n  return Response.json({ ok: true, body });\n}\n`;
  const funn = analyserRute(REL, txt);
  assert.equal(funn.length, 1);
  assert.equal(funn[0].noekkel, `${REL}#POST`);
});

test("hver handler vurderes for seg: beskyttet GET dekker ikke ubeskyttet DELETE", () => {
  const txt =
    `export async function GET() {\n  await canAccessMissionControl();\n  return Response.json({});\n}\n\n` +
    `export async function DELETE(req: Request) {\n  return Response.json({});\n}\n`;
  const funn = analyserRute(REL, txt);
  assert.deepEqual(funn.map((f) => f.noekkel), [`${REL}#DELETE`]);
});

test("bare innlogget er nok uten klient-ID, men ikke med klient-ID", () => {
  const utenId = `export async function GET() {\n  const user = await getCurrentUser();\n  return Response.json({ id: user.id });\n}\n`;
  assert.equal(analyserRute(REL, utenId).length, 0);
  const medId =
    `export async function POST(req: Request) {\n  const user = await getCurrentUser();\n` +
    `  const { spillerId } = await req.json();\n  return Response.json(await hent(spillerId));\n}\n`;
  const funn = analyserRute(REL, medId);
  assert.equal(funn.length, 1);
  assert.match(funn[0].arsak, /bare innlogget/);
});

test("eiersammenligning, rollevakt, cron og kommentarmarkør godtas", () => {
  const eier =
    `export async function POST(req: Request) {\n  const user = await getCurrentUser();\n  const { recordingId } = await req.json();\n` +
    `  const rec = await hent(recordingId);\n  if (rec.uploadedById !== user.id) return new Response(null, { status: 403 });\n}\n`;
  assert.equal(analyserRute(REL, eier).length, 0);
  const rolle =
    `export async function POST(req: Request) {\n  const user = await getCurrentUser();\n  const { spillerId } = await req.json();\n` +
    `  if (!(await harCoachTilgangTilSpiller(user.id, spillerId))) return new Response(null, { status: 403 });\n}\n`;
  assert.equal(analyserRute(REL, rolle).length, 0);
  const cron = `export async function GET(req: Request) {\n  const avvist = avvisUgyldigCron(req);\n  if (avvist) return avvist;\n}\n`;
  assert.equal(analyserRute(REL, cron).length, 0);
  const markor =
    `export async function POST(req: Request) {\n  // tilgang: eier sjekkes i hentOkt\n  const user = await getCurrentUser();\n  const { sessionId } = await req.json();\n}\n`;
  assert.equal(analyserRute(REL, markor).length, 0);
});

test("requirePortalUser uten allow er bare innlogget; med allow er rollegrind", () => {
  const uten = (g) =>
    `export async function POST(req: Request) {\n  await ${g};\n  const { spillerId } = await req.json();\n}\n`;
  assert.equal(analyserRute(REL, uten("requirePortalUser()")).length, 1);
  assert.equal(analyserRute(REL, uten('requirePortalUser({ allow: ["COACH"] })')).length, 0);
});

test("hvitlistet offentlig rute slipper gjennom, ukjent åpen rute gjør ikke", () => {
  const apen = `export async function GET() {\n  return Response.json({ ok: true });\n}\n`;
  const [offentlig] = [...PUBLIC_ROUTES.keys()];
  assert.equal(analyserRute(offentlig, apen).length, 0);
  assert.equal(analyserRute(REL, apen).length, 1);
});

test("server action: bare innlogget med spillerId fra klienten feiler", () => {
  const felles = `"use server";\nimport { requirePortalUser } from "@/lib/auth/requirePortalUser";\n\n`;
  const farlig = felles + `export async function slettNoe(spillerId: string) {\n  await requirePortalUser();\n  await slett(spillerId);\n}\n`;
  const rel = "src/lib/x/actions.ts";
  assert.deepEqual(analyserAction(rel, farlig).map((f) => f.noekkel), [`${rel}#slettNoe`]);
  const trygg = felles + `export async function slettNoe(spillerId: string) {\n  await requirePortalUser({ allow: ["ADMIN"] });\n  await slett(spillerId);\n}\n`;
  assert.equal(analyserAction(rel, trygg).length, 0);
});

test("sammenlign: nytt funn feiler, og kjent gjeld som er rettet må fjernes", () => {
  const gjeld = new Map([["a#POST", "TA-99"]]);
  const nytt = sammenlign([{ noekkel: "b#POST", arsak: "x" }], gjeld);
  assert.deepEqual(nytt.nye.map((f) => f.noekkel), ["b#POST"]);
  assert.deepEqual(nytt.utdatert, ["a#POST"]);
  const likt = sammenlign([{ noekkel: "a#POST", arsak: "x" }], gjeld);
  assert.equal(likt.nye.length, 0);
  assert.equal(likt.utdatert.length, 0);
});

test("dagens kodebase: ingen nye hull og ingen utdatert gjeld", () => {
  const { funn, antallRuter } = samleFunn(".");
  assert.ok(antallRuter > 60);
  const { nye, utdatert } = sammenlign(funn, KJENT_GJELD);
  assert.deepEqual(nye, []);
  assert.deepEqual(utdatert, []);
});

test("alle kjente gjeldsoppføringer har funn-ID", () => {
  for (const [, id] of KJENT_GJELD) assert.match(id, /^T[AOP]-\d+$/);
});
