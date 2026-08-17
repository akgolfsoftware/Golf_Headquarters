/**
 * PII-gaten på WANG-fellessiden: `medElevnavn` er eneste ting som skiller den
 * ÅPNE `/team-wang` fra den auth-gatede `/team-wang/coach`. Elevene er
 * mindreårige ved en ekte skole, og siden er delbar med lenke — så gaten er
 * sikkerhetskode, ikke en preferanse.
 *
 * Hvorfor denne fila finnes: gaten har lekket TO ganger på ulike veier.
 *   1. 2026-08-15: navn ble hentet ubetinget og sperren var av (#406/#490).
 *   2. 2026-08-16: `medElevnavn: false` tømte `elever` som designet, men 5 av
 *      28 hendelses-BESKRIVELSER hadde gruppeinndelinger med fulle elevnavn
 *      skrevet rett inn i kalenderteksten. Samme PII, annen vei.
 *
 * Begge gangene var koden «riktig» på det feltet noen så på. Derfor sjekker
 * testene under ikke ett felt, men HELE returverdien serialisert: et navn som
 * dukker opp i et felt ingen har tenkt på, feiler også.
 *
 * Mocke-strategi: kun `@/lib/prisma` mockes. Selve gate-logikken kjøres ekte —
 * det er den som testes. Fixturet er «forgiftet» med vilje: hvert medlemsnavn
 * er også plantet i fritekstfelter, slik at en ny ugatet gjennomstrømning av
 * fritekst blir fanget.
 *
 * Kjør med: npm test
 */

import { test, mock } from "node:test";
import assert from "node:assert/strict";

/** Medlemsnavnene er PII — ingen av disse skal ut på den åpne flaten. */
const ELEV_A = "Fredrik Kjølberg Hovland";
const ELEV_B = "Constanse Hauglid";
/** Elev uten `name` i basen: e-posten er fallback, og er like mye PII. */
const ELEV_C_EPOST = "viktoria.hammer@example.no";

const gruppe = {
  id: "g-1",
  name: "WANG Toppidrett Fredrikstad",
  members: [
    { role: "PLAYER", user: { id: "u-a", name: ELEV_A, email: "a@example.no" } },
    { role: "PLAYER", user: { id: "u-b", name: ELEV_B, email: "b@example.no" } },
    // Navn mangler → `navn` faller tilbake til e-post. Den veien lakk i #406.
    { role: "ASSISTANT", user: { id: "u-c", name: null, email: ELEV_C_EPOST } },
  ],
  schedules: [
    {
      // Enkelthendelse (recurring !== WEEKLY) → havner i `hendelser`.
      title: "Fredagsdeling (test 1/2): banecoaching + egentrening",
      // Forgiftet med vilje: dette er nøyaktig formen lekkasjen hadde 16.08.
      description: `Gruppe A (banecoaching m/ Anders): ${ELEV_A}. Gruppe B: ${ELEV_B}.`,
      startAt: new Date("2026-08-28T08:00:00Z"),
      endAt: new Date("2026-08-28T10:00:00Z"),
      location: "GFGK",
      recurring: "NONE",
      kind: "TRENINGSSAMLING",
    },
    {
      // Fast ukentlig økt → havner i `fasteOkter` (egen mapping, egen risiko).
      title: "WANG Toppidrett Fredrikstad — fast trening (Man)",
      description: `Oppmøte: ${ELEV_C_EPOST} har eget opplegg.`,
      startAt: new Date("2026-08-31T08:00:00Z"),
      endAt: new Date("2026-08-31T10:00:00Z"),
      location: "GFGK",
      recurring: "WEEKLY",
      kind: "TRENING",
    },
  ],
};

const perioder = [
  {
    id: "p-1",
    lPhase: "GRUNN",
    startDate: new Date("2026-08-17T00:00:00Z"),
    endDate: new Date("2026-10-04T00:00:00Z"),
    focus: "Teknikk og volum",
    weeklyVolMin: 600,
    weeklyVolMax: 900,
  },
];

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      group: { findFirst: async () => gruppe },
      groupPeriodBlock: { findMany: async () => perioder },
      schoolScheduleEntry: { findMany: async () => [] },
      groupPeriodGoal: { findMany: async () => [] },
    },
  },
});

// Lazy import: mocken over registreres synkront på modulnivå, og modulen under
// test må lastes ETTER den. Top-level await går ikke (tsx bygger til cjs), så
// hvert testtilfelle henter funksjonen via denne.
async function lastHentWangGruppe() {
  const mod = await import("./hent-wang-gruppe");
  return mod.hentWangGruppe;
}

/** Alt som er PII i fixturet. Ingen av disse skal ut på den åpne flaten. */
const PII = [ELEV_A, ELEV_B, ELEV_C_EPOST, "a@example.no", "b@example.no"];

test("åpen flate (standard): ingen PII noe sted i returverdien", async () => {
  const hentWangGruppe = await lastHentWangGruppe();
  const data = await hentWangGruppe();
  assert.ok(data, "fixturet skal gi data, ikke null");

  // Hele objektet, ikke bare `elever` — lekkasjen 16.08 lå i et annet felt.
  const serialisert = JSON.stringify(data);
  for (const pii of PII) {
    assert.ok(
      !serialisert.includes(pii),
      `PII lakk ut på den åpne flaten: «${pii}» finnes i returverdien. ` +
        `Et nytt fritekstfelt er sannsynligvis sluppet gjennom ugated — ` +
        `gate det på medElevnavn, slik beskrivelse er gated.`,
    );
  }
});

test("åpen flate: elever er tom, men antallet er ekte", async () => {
  const hentWangGruppe = await lastHentWangGruppe();
  const data = await hentWangGruppe();
  assert.deepEqual(data?.elever, [], "elevlista skal være tom uten opt-in");
  // Aggregatet avslører ingen — og siden trenger det for å vise gruppestørrelse.
  assert.equal(data?.antallElever, 3, "antallet skal telle alle medlemmer");
});

test("åpen flate: beskrivelse er nullet i BEGGE mappingene", async () => {
  const hentWangGruppe = await lastHentWangGruppe();
  const data = await hentWangGruppe();
  for (const h of data?.hendelser ?? []) {
    assert.equal(h.beskrivelse, null, "hendelses-beskrivelse er coach-fritekst");
  }
  assert.ok((data?.hendelser.length ?? 0) > 0, "fixturet skal gi minst én hendelse");
  // `fasteOkter` har ikke noe beskrivelse-felt i typen — den mappingen skal
  // heller aldri få ett uten samme gating. Sjekkes av PII-testen over.
  assert.ok((data?.fasteOkter.length ?? 0) > 0, "fixturet skal gi minst én fast økt");
});

test("coach-flate (medElevnavn: true): navn OG e-post-fallback kommer med", async () => {
  const hentWangGruppe = await lastHentWangGruppe();
  const data = await hentWangGruppe({ medElevnavn: true });

  const navn = (data?.elever ?? []).map((e) => e.navn);
  assert.deepEqual(
    navn,
    [ELEV_B, ELEV_A, ELEV_C_EPOST].sort((a, b) => a.localeCompare(b, "nb")),
    "coach-siden skal se alle tre, sortert på norsk",
  );
  // Elev uten `name` skal falle tilbake til e-post, ikke forsvinne fra rosteret.
  assert.ok(navn.includes(ELEV_C_EPOST), "e-post-fallback skal beholdes");
  assert.equal(data?.antallElever, 3);

  // Coach-siden er auth-gatet og SKAL se beskrivelsene.
  assert.ok(
    data?.hendelser.some((h) => h.beskrivelse?.includes(ELEV_A)),
    "beskrivelse skal være intakt for coach",
  );
});

test("gaten er opt-in: kun eksplisitt true åpner den", async () => {
  const hentWangGruppe = await lastHentWangGruppe();
  // Standarden må være den trygge — en ny side som glemmer PII skal få tom
  // liste, ikke en lekkasje. Derfor testes «utelatt» og «false» hver for seg.
  for (const opts of [undefined, {}, { medElevnavn: false }] as const) {
    const data = await hentWangGruppe(opts);
    assert.deepEqual(data?.elever, [], `elever skal være tom for ${JSON.stringify(opts)}`);
  }
});

test("ikke-PII fritekst passerer uendret — gaten er smal med vilje", async () => {
  // Dokumenterer grensen: `tittel`, `sted` og `fokus` er IKKE sanert. De er
  // coach-skrevet fritekst som siden ikke kan vise noe uten, så de kan bare
  // holdes rene i kalenderdataene — ikke i kode. Skrives et elevnavn inn i en
  // TITTEL, fanger ingen kode det; da må sperren i proxy.ts utvides i stedet.
  const hentWangGruppe = await lastHentWangGruppe();
  const data = await hentWangGruppe();
  assert.equal(data?.hendelser[0]?.tittel, gruppe.schedules[0].title);
  assert.equal(data?.hendelser[0]?.sted, "GFGK");
  assert.equal(data?.perioder[0]?.fokus, "Teknikk og volum");
});
