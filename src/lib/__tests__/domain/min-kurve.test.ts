import test from "node:test";
import assert from "node:assert/strict";

import { byggMinKurve, fmtToPar, tilPunkt, type KurveRad } from "@/lib/domain/min-kurve";

function rad(o: Partial<KurveRad> & { navn: string; startDato: Date; toparTotal: number; rundescorer: number[] }): KurveRad {
  return {
    turneringId: o.turneringId ?? o.navn,
    navn: o.navn,
    startDato: o.startDato,
    toparTotal: o.toparTotal,
    rundescorer: o.rundescorer,
    plassering: o.plassering ?? null,
    status: o.status ?? "FINISHED",
    kilde: "kilde" in o ? (o.kilde ?? null) : "GOLFBOX",
  };
}

// ── Tomme tilstander ───────────────────────────────────────────────────────

test("ukoblet og koblet-uten-turneringer får hver sin setning", () => {
  const ukoblet = byggMinKurve([], false);
  const koblet = byggMinKurve([], true);
  assert.equal(ukoblet.koblet, false);
  assert.match(ukoblet.tomGrunn, /ikke koblet/);
  assert.equal(koblet.koblet, true);
  assert.match(koblet.tomGrunn, /Ingen turneringer er registrert/);
  assert.equal(koblet.punkter.length, 0);
});

test("rader uten gyldige runder eller uten resultat teller ikke", () => {
  const r = byggMinKurve(
    [
      rad({ navn: "Ingen runder", startDato: new Date(2026, 4, 1), toparTotal: 10, rundescorer: [] }),
      rad({ navn: "Trakk seg", startDato: new Date(2026, 5, 1), toparTotal: 10, rundescorer: [80], status: "WITHDREW" }),
      rad({ navn: "Søppel", startDato: new Date(2026, 6, 1), toparTotal: 4957, rundescorer: [80] }),
    ],
    true,
  );
  assert.equal(r.punkter.length, 0);
  assert.match(r.tomGrunn, /Ingen turneringer/);
});

// ── Punkt og bånd ──────────────────────────────────────────────────────────

test("snitt er til-par delt på runder; bånd avledes kun når par går opp i et helt tall", () => {
  const p = tilPunkt(rad({ navn: "NM", startDato: new Date(2026, 7, 24), toparTotal: 25, rundescorer: [79, 82, 80] }));
  assert.ok(p);
  assert.equal(p.snitt, 8.3);
  // sum 241 − 25 = 216 → par 72 per runde
  assert.equal(p.beste, 7);
  assert.equal(p.verste, 10);

  // sum 240 − 25 = 215 → 71,67: ikke helt tall → ingen bånd, men snittet står
  const uten = tilPunkt(rad({ navn: "Blandet", startDato: new Date(2026, 7, 1), toparTotal: 25, rundescorer: [79, 81, 80] }));
  assert.ok(uten);
  assert.equal(uten.snitt, 8.3);
  assert.equal(uten.beste, null);
  assert.equal(uten.verste, null);
});

test("plassering 0 eller null vises ikke som plassering", () => {
  const p = tilPunkt(rad({ navn: "X", startDato: new Date(2026, 4, 1), toparTotal: 6, rundescorer: [78], plassering: 0 }));
  assert.equal(p?.plassering, null);
});

// ── Sesonger ───────────────────────────────────────────────────────────────

const SESONG = [
  rad({ navn: "Åpning 2025", startDato: new Date(2025, 4, 3), toparTotal: 30, rundescorer: [85, 89] }),
  rad({ navn: "Åpning", startDato: new Date(2026, 3, 26), toparTotal: 32, rundescorer: [86, 90] }),
  rad({ navn: "Narvesen", startDato: new Date(2026, 4, 31), toparTotal: 28, rundescorer: [84, 88] }),
  rad({ navn: "Bogstad", startDato: new Date(2026, 5, 21), toparTotal: 24, rundescorer: [83, 85] }),
  rad({ navn: "Oslo GK", startDato: new Date(2026, 6, 12), toparTotal: 21, rundescorer: [81, 84] }),
  rad({ navn: "Miklagard", startDato: new Date(2026, 7, 9), toparTotal: 18, rundescorer: [80, 82] }),
  rad({ navn: "NM junior", startDato: new Date(2026, 7, 24), toparTotal: 25, rundescorer: [79, 82, 80], plassering: 4 }),
];

test("nyeste sesong er standard; punktene kommer kronologisk", () => {
  const r = byggMinKurve(SESONG, true);
  assert.deepEqual(r.sesonger, [2026, 2025]);
  assert.equal(r.valgtSesong, 2026);
  assert.equal(r.punkter.length, 6);
  assert.equal(r.punkter[0].navn, "Åpning");
  assert.equal(r.punkter[5].navn, "NM junior");
});

test("«alle» og eksplisitt sesong følges; ukjent sesong faller tilbake til nyeste", () => {
  assert.equal(byggMinKurve(SESONG, true, "alle").punkter.length, 7);
  assert.equal(byggMinKurve(SESONG, true, "2025").punkter.length, 1);
  assert.equal(byggMinKurve(SESONG, true, "2019").valgtSesong, 2026);
});

// ── Tallene som vises ──────────────────────────────────────────────────────

test("snitt siste er over de inntil fem siste turneringene, med dato for den siste", () => {
  const r = byggMinKurve(SESONG, true);
  assert.ok(r.snittSiste);
  assert.equal(r.snittSiste.antall, 5);
  // (14 + 12 + 10,5 + 9 + 8,3) / 5 = 10,76 → 10,8
  assert.equal(r.snittSiste.verdi, 10.8);
  assert.equal(r.snittSiste.sistDato.getTime(), new Date(2026, 7, 24).getTime());
});

test("båndet måles i første og siste turnering, og setningen bærer begge tallene", () => {
  const r = byggMinKurve(SESONG, true);
  assert.deepEqual(r.baand, { forst: 4, sist: 3 });
  assert.match(r.baandTekst, /fra 4,0 til 3,0 slag/);
  assert.match(r.baandTekst, /ligner mer på hverandre/);
});

test("sesongteksten sier hvor mye snittet har falt, målt fra første til siste turnering", () => {
  const r = byggMinKurve(SESONG, true);
  assert.ok(r.sesongTekst);
  // 16,0 → 8,3 = 7,7
  assert.match(r.sesongTekst.tittel, /falt 7,7 slag/);
  assert.match(r.sesongTekst.under, /1,0 slag smalere/);
});

test("grunnlaget teller turneringer og runder, og finner beste runde med dato", () => {
  const r = byggMinKurve(SESONG, true);
  assert.equal(r.grunnlag.turneringer, 6);
  assert.equal(r.grunnlag.runder, 13);
  assert.ok(r.grunnlag.besteRunde);
  assert.equal(r.grunnlag.besteRunde.toPar, 7);
  assert.equal(r.grunnlag.besteRunde.dato.getTime(), new Date(2026, 7, 24).getTime());
});

test("y-aksen dekker bånd og snitt i hele slag med tre etiketter", () => {
  const r = byggMinKurve(SESONG, true);
  assert.equal(r.yAkse.etiketter.length, 3);
  assert.ok(r.yAkse.min <= 7);
  assert.ok(r.yAkse.maks >= 18);
  assert.equal(r.yAkse.etiketter[0], r.yAkse.maks);
  assert.equal(r.yAkse.etiketter[2], r.yAkse.min);
});

test("én turnering gir punkt uten bånd-tekst og en ærlig sesongtekst", () => {
  const r = byggMinKurve([SESONG[6]], true);
  assert.equal(r.punkter.length, 1);
  assert.equal(r.baandTekst, "");
  assert.match(r.sesongTekst?.tittel ?? "", /Én turnering/);
});

test("fmtToPar bruker norsk desimaltegn og fortegn", () => {
  assert.equal(fmtToPar(8.4), "+8,4");
  assert.equal(fmtToPar(0), "0,0");
  assert.equal(fmtToPar(-2), "−2,0");
});
