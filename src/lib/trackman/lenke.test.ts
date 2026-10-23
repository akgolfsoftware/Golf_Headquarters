/**
 * TrackMan fra delingslenke (Anders 23.10.2026). Rapporten i __fixtures__ er en avkortet kopi av en ekte
 * TrackMan-rapport, med spillernavn og konto-id-er byttet ut. Ingen nettverk: fetch er erstattet.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  finnRapportId,
  hentOktFraLenke,
  hentTrackManRapport,
  kolleNavn,
  rapportIdFraAdresse,
  rapportTilOkt,
  tolkTrackManLenke,
} from "./lenke";

const RAPPORT_ID = "0daa396c-002c-4dc0-a34c-742cf02da267";
const VIDERE = `https://web-dynamic-reports.trackmangolf.com/?cdo=true&r=${RAPPORT_ID}&v=dispersion`;
const fixture = JSON.parse(readFileSync(join(__dirname, "__fixtures__/trackman-lenke-rapport.json"), "utf8"));

type Kall = { url: string; init?: RequestInit };
function falskHent(svar: (url: string) => Response) {
  const kall: Kall[] = [];
  const hent = (async (url: string | URL, init?: RequestInit) => {
    kall.push({ url: String(url), init });
    return svar(String(url));
  }) as typeof fetch;
  return { hent, kall };
}
const omdirigering = (til: string) => new Response(null, { status: 302, headers: { location: til } });

test("godtar kortlenker fra tm-short.me og direkte rapportadresser", () => {
  assert.equal(tolkTrackManLenke("https://tm-short.me/A87u7ds").type, "kort");
  assert.deepEqual(tolkTrackManLenke(VIDERE), { type: "rapport", id: RAPPORT_ID });
  assert.equal(rapportIdFraAdresse(VIDERE), RAPPORT_ID);
});

test("avviser andre nettsteder, http og ugyldig rapport-id", () => {
  for (const feil of [
    "https://evil.example/A87u7ds",
    "http://tm-short.me/A87u7ds",
    "https://tm-short.me.evil.example/A87u7ds",
    "https://web-dynamic-reports.trackmangolf.com/?r=ikke-en-id",
    "ikke en lenke",
  ]) {
    assert.throws(() => tolkTrackManLenke(feil), /./, feil);
  }
});

test("følger bare videresending til TrackMans rapportside", async () => {
  const ok = falskHent(() => omdirigering(VIDERE));
  assert.equal(await finnRapportId("https://tm-short.me/A87u7ds", ok.hent), RAPPORT_ID);
  assert.equal(ok.kall[0].init?.redirect, "manual");

  const ond = falskHent(() => omdirigering(`https://evil.example/?r=${RAPPORT_ID}`));
  await assert.rejects(() => finnRapportId("https://tm-short.me/A87u7ds", ond.hent), /Fant ingen TrackMan-rapport/);
});

test("rapporten hentes fra én fast adresse hos TrackMan med rapport-id", async () => {
  const { hent, kall } = falskHent(() => Response.json(fixture));
  await hentTrackManRapport(RAPPORT_ID, hent);
  assert.equal(kall[0].url, "https://golf-player-activities.trackmangolf.com/api/reports/getreport");
  assert.equal(kall[0].init?.method, "POST");
  assert.deepEqual(JSON.parse(String(kall[0].init?.body)), { ReportId: RAPPORT_ID });
});

test("svar som ikke er en rapport avvises", async () => {
  const { hent } = falskHent(() => Response.json({ hei: 1 }));
  await assert.rejects(() => hentTrackManRapport(RAPPORT_ID, hent), /kan lese/);
  const nede = falskHent(() => new Response("nei", { status: 500 }));
  await assert.rejects(() => hentTrackManRapport(RAPPORT_ID, nede.hent), /svarte ikke/);
});

test("alle slag blir med, i tidsrekkefølge, med m/s og meter som kildeenhet", () => {
  const okt = rapportTilOkt(fixture);
  assert.equal(okt.slag.length, 6);
  // PW-slagene ble tatt først (17:52), «4-jern» etterpå (17:56).
  assert.equal(okt.slag[0].club, "PW");
  assert.equal(okt.slag[5].club, "4-jern");
  assert.equal(okt.startetAt, fixture.StrokeGroups[1].Strokes[0].Time);
  const forste = okt.slag[0];
  assert.equal(forste.sourceUnits?.clubSpeed, "m/s");
  assert.equal(forste.sourceUnits?.carry, "m");
  assert.equal(typeof forste.carryMeters, "number");
  assert.equal(typeof forste.faceToPathDeg, "number");
});

test("varsler når TrackMan merket kølla feil (4-jern med wedge-loft)", () => {
  const { varsler } = rapportTilOkt(fixture);
  assert.equal(varsler.length, 1);
  assert.match(varsler[0], /«4-jern»/);
  assert.match(varsler[0], /wedge \(loft 54°\)/);
});

test("spillernavn, spiller-id, konto og klient lagres ikke", () => {
  const lagret = JSON.stringify(rapportTilOkt(fixture).rapport);
  assert.doesNotMatch(lagret, /Testspiller/);
  assert.doesNotMatch(lagret, /"Player"/);
  assert.doesNotMatch(lagret, /"User"|"Client"/);
});

test("køllenavn fra TrackMan-koder", () => {
  assert.equal(kolleNavn("7Iron"), "7-jern");
  assert.equal(kolleNavn("3Wood"), "3-tre");
  assert.equal(kolleNavn("4Hybrid"), "4-hybrid");
  assert.equal(kolleNavn("SandWedge"), "SW");
  assert.equal(kolleNavn(null), "Ukjent");
});

test("hele veien fra kortlenke til økt", async () => {
  const { hent, kall } = falskHent((url) => (url.includes("tm-short.me") ? omdirigering(VIDERE) : Response.json(fixture)));
  const okt = await hentOktFraLenke("https://tm-short.me/A87u7ds", hent);
  assert.equal(okt.slag.length, 6);
  assert.equal(kall.length, 2);
});
