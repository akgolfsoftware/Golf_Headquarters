import { before, mock, test } from "node:test";
import assert from "node:assert/strict";
import type { Spillerprofil } from "@/lib/profil-kobling/typer";

// Kun fiktive personer og turneringer.
let profil: Spillerprofil | null = null;
let dgLeses = 0;

const tur = (id: number, dato: string, toPar: number | null, klasse = "G17") => ({
  tournament_id: id, turnering: `Testcup ${id}`, start_date: dato, year: Number(dato.slice(0, 4)), kilde: "olyo", series: null,
  klasse, plassering: id, total_score: toPar == null ? null : 144 + toPar, to_par: toPar,
  runder: [{ runde: 1, score: 72, til_par: toPar == null ? null : 0, mot_felt: null }, { runde: 2, score: 72 + (toPar ?? 0), til_par: toPar, mot_felt: null }],
});
const medTurneringer = (t: ReturnType<typeof tur>[]): Spillerprofil => ({ person: { name: "Pia Egenes", birth_year: 2009 }, sesonger: [], monster: [], runder: [], turneringer: t });

mock.module("@/lib/profil-kobling/data", { namedExports: { hentSpillerprofil: async () => profil } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findUnique: async () => { dgLeses++; return { publicPlayerId: "p" }; } },
  publicPlayerEntry: { findMany: async () => [] },
} } });
let hent: typeof import("./min-kurve-data").hentMinKurve;
before(async () => { hent = (await import("./min-kurve-data")).hentMinKurve; });

test("uten bekreftet profil er kurven ikke koblet", async () => {
  profil = null;
  const k = await hent("user-a");
  assert.equal(k.koblet, false);
  assert.equal(k.dataSistHentet, null);
});

test("turneringene i profilen blir punkter, og turneringer uten til-par hoppes over", async () => {
  profil = medTurneringer([tur(1, "2026-05-02", 4), tur(2, "2026-06-12", null), tur(3, "2026-08-20", -2)]);
  const k = await hent("user-a");
  assert.equal(k.koblet, true);
  assert.equal(k.grunnlag.turneringer, 2);
});

test("netto-klasser er ikke med", async () => {
  profil = medTurneringer([tur(1, "2026-05-02", 4, "Herrer netto")]);
  const k = await hent("user-a");
  assert.equal(k.grunnlag.turneringer, 0);
});

test("Data Golf leses ikke uten uttrykkelig tillatelse", async () => {
  profil = medTurneringer([tur(1, "2026-05-02", 4)]);
  dgLeses = 0;
  await hent("user-a");
  assert.equal(dgLeses, 0);
  await hent("user-a", undefined, { medDataGolf: true });
  assert.equal(dgLeses, 1);
});
