import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  datoKort, planTilSak, relativTid, sisteCoachMelding, tellInnboks, trenerforslagTilSak, type PH21InnboksData,
} from "./ph21-innboks";

const NAA = new Date("2026-10-05T12:20:00Z"); // mandag 5. oktober kl. 14:20 i Oslo

describe("ph21-innboks", () => {
  it("formaterer dato og relativ tid i Oslo", () => {
    assert.equal(datoKort("2026-10-08"), "Tor 8. okt");
    assert.equal(datoKort(undefined), "—");
    assert.equal(relativTid(new Date("2026-10-05T12:13:00Z"), NAA), "14:13");
    assert.equal(relativTid(new Date("2026-10-04T18:41:00Z"), NAA), "i går 20:41");
  });

  it("viser trenerforslag med økta før og etter", () => {
    const sak = trenerforslagTilSak({
      id: "a1", trener: "Trener", opprettet: "2026-10-04T18:41:00Z",
      forslag: {
        organisasjon: "WANG", handling: "UPDATE", begrunnelse: "Range 2 er booket.",
        for: { date: "2026-10-08", startMinute: 960, durationMinutes: 60, title: "Innspill", pyramid: "SLAG" },
        etter: { date: "2026-10-08", startMinute: 960, durationMinutes: 60, title: "Nærspill", pyramid: "SLAG" },
      },
    }, NAA);
    assert.equal(sak.kilde, "trener");
    if (sak.kilde !== "trener") return;
    assert.equal(sak.tittel, "Forslag: endre Innspill");
    assert.equal(sak.fra, "WANG Toppidrett · Trener");
    assert.equal(sak.for?.tid, "Tor 8. okt · 16:00");
    assert.equal(sak.etter?.navn, "Nærspill");
    assert.equal(sak.tid, "i går 20:41");
  });

  it("tar bare med planer som venter på spilleren", () => {
    const plan = { id: "p", title: "Uke 42", sessions: 6, hours: "9 t", sent: "02.10.2026" };
    assert.equal(planTilSak({ ...plan, status: "Godtatt" }, "Anders"), null);
    assert.equal(planTilSak({ ...plan, status: "Venter på spiller" }, "Anders")?.tittel, "Plan: Uke 42");
  });

  it("teller meldinger coachen har sendt etter spillerens siste", () => {
    const m = sisteCoachMelding([
      { id: "1", role: "me", text: "Hei", t: "x" },
      { id: "2", role: "coach", text: "Hei", t: "x" },
      { id: "3", role: "coach", text: "Sees fredag", t: "y" },
    ], "Anders Kristiansen");
    assert.equal(m?.nye, 2);
    assert.equal(m?.tekst, "Sees fredag");
    assert.equal(sisteCoachMelding([], "Anders"), null);
  });

  it("summerer saker som venter", () => {
    const d: PH21InnboksData = {
      harCoach: true,
      forslag: [{ kilde: "plan", id: "p", tittel: "t", fra: "f", tid: "—", tekst: "" }],
      melding: { fra: "A", tekst: "t", tid: "x", nye: 1 },
      varsler: [
        { id: "v1", type: "booking", tittel: "t", tekst: null, tid: "x", ulest: true, link: null },
        { id: "v2", type: "booking", tittel: "t", tekst: null, tid: "x", ulest: false, link: null },
      ],
    };
    assert.deepEqual(tellInnboks(d), { forslag: 1, meldinger: 1, varsler: 1, venter: 3 });
  });
});
