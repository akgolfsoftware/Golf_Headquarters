/**
 * TN-22 Workbench (14.09.2026, andre Codex-review-runde samme dag):
 * målrettet test av portene skrivewrapperne legger til utover den delte
 * Workbench-motoren — global platform-rolleport (ikke bare TN-gruppe-rolle),
 * roster (spilleren må faktisk være et aktivt TN-medlem, sjekket FØR
 * selv-ID-snarveien også), eierskap (en økt-mutasjon avviser en sessionId
 * som tilhører en annen spiller), ekte Oslo-DST-riktig kalendergrense, samt
 * kopier/mal/rediger/gjennomgang-før-publisering og de separate
 * TrainingSessionV2/TrainingPlanSession-lesningene.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type FastTnKontekst = { gruppe: { id: string; name: string }; rolle: string; erSpiller: boolean; kanAdministrere: boolean } | null;

let tnKontekst: FastTnKontekst = {
  gruppe: { id: "gruppe-tn", name: "Team Norway" },
  rolle: "COACH",
  erSpiller: false,
  kanAdministrere: true,
};
let tnSpillere: { kontekst: unknown; rader: { id: string; navn: string }[] } | null = {
  kontekst: tnKontekst,
  rader: [{ id: "spiller-1", navn: "Spiller Én" }],
};
let harCoachTilgangResultat = true;
let harCapability = true;
let gruppePerioderKall: string[] = [];
let gruppeTimerKall: { groupId: string; fra: Date; til: Date }[] = [];
let opprettedeGruppePerioder: unknown[] = [];
let opprettedeOkter: { playerId: string }[] = [];
let sessionRad: { id: string; playerId: string; status: string; isTemplate?: boolean; seriesId?: string | null } | null = {
  id: "okt-1",
  playerId: "spiller-1",
  status: "DRAFT",
};
let flyttetKall = 0;
let slettetKall = 0;
let publisertKall: string[][] = [];
let kopiertFraKilde: { playerId: string; sourceId: string; date: string; startMinute: number }[] = [];
let malKall: { sessionId: string; isTemplate: boolean }[] = [];
let seriesKall: { sessionId: string; patch: unknown; policy: string }[] = [];
let trainingSessionV2Rader: { id: string; title: string; startTime: Date; status: string; studentId: string }[] = [];
let trainingPlanSessionRader: { id: string; title: string; scheduledAt: Date; status: string; plan: { userId: string } }[] = [];
let kilderForSpiller: { id: string; kind: string; title: string }[] = [];
let addDrillKall: { sessionId: string; sourceId: string }[] = [];
let serieRaderForSerie: { seriesId: string; playerId: string }[] = [];

mock.module("@/lib/domain/tn-arbeidsflate", {
  namedExports: {
    hentTnArbeidskontekst: async () => tnKontekst,
    hentTnSpillere: async () => tnSpillere,
  },
});
mock.module("@/lib/auth/coached", {
  namedExports: { harCoachTilgangTilSpiller: async () => harCoachTilgangResultat },
});
mock.module("@/lib/auth/effective-capabilities", {
  namedExports: { canUser: async () => harCapability },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      groupPeriodBlock: {
        findMany: async ({ where }: { where: { groupId: string } }) => {
          gruppePerioderKall.push(where.groupId);
          return [{ id: "p1", lPhase: "GRUNN", startDate: new Date("2026-01-01"), endDate: new Date("2026-03-01"), focus: null, weeklyVolMin: null, weeklyVolMax: null }];
        },
      },
      groupSchedule: {
        findMany: async ({ where }: { where: { groupId: string; startAt: { gte: Date; lt: Date } } }) => {
          gruppeTimerKall.push({ groupId: where.groupId, fra: where.startAt.gte, til: where.startAt.lt });
          return [];
        },
      },
      trainingSessionV2: {
        findMany: async ({ where }: { where: { studentId: string; startTime: { gte: Date; lt: Date } } }) =>
          trainingSessionV2Rader.filter((r) => r.studentId === where.studentId && r.startTime >= where.startTime.gte && r.startTime < where.startTime.lt),
      },
      trainingPlanSession: {
        findMany: async ({ where }: { where: { plan: { userId: string }; scheduledAt: { gte: Date; lt: Date } } }) =>
          trainingPlanSessionRader.filter((r) => r.plan.userId === where.plan.userId && r.scheduledAt >= where.scheduledAt.gte && r.scheduledAt < where.scheduledAt.lt),
      },
      workbenchSession: {
        findMany: async ({ where }: { where: { seriesId: string } }) =>
          serieRaderForSerie.filter((r) => r.seriesId === where.seriesId).map((r) => ({ playerId: r.playerId })),
      },
    },
  },
});
mock.module("@/lib/workbench/gruppe-periode-actions", {
  namedExports: {
    coachLagreGruppePeriode: async (groupId: string, input: unknown) => {
      opprettedeGruppePerioder.push({ groupId, input });
      return { ok: true };
    },
    coachSlettGruppePeriode: async () => ({ ok: true }),
    coachRullUtGruppeAarsplan: async () => ({ ok: true }),
  },
});
mock.module("@/lib/workbench/wb-actions", {
  namedExports: {
    loadSession: async (sessionId: string) => (sessionRad && sessionRad.id === sessionId ? { ok: true, data: sessionRad } : { ok: true, data: null }),
    createSession: async (input: { playerId: string }) => {
      opprettedeOkter.push({ playerId: input.playerId });
      return { ok: true, data: { id: "ny-okt" } };
    },
    createSessionFromSource: async (input: { playerId: string; sourceId: string; date: string; startMinute: number }) => {
      kopiertFraKilde.push(input);
      return { ok: true, data: { id: "kopi-1" } };
    },
    moveSession: async () => {
      flyttetKall++;
      return { ok: true, data: sessionRad };
    },
    deleteSession: async () => {
      slettetKall++;
      return { ok: true, data: null };
    },
    publishSessions: async (ids: string[]) => {
      publisertKall.push(ids);
      return { ok: true, data: [] };
    },
    setSessionTemplate: async (sessionId: string, isTemplate: boolean) => {
      malKall.push({ sessionId, isTemplate });
      return { ok: true, data: sessionRad };
    },
    updateSeriesSession: async (input: { sessionId: string; patch: unknown; policy: string }) => {
      seriesKall.push(input);
      return { ok: true, data: [sessionRad] };
    },
    loadSources: async () => ({ ok: true, data: kilderForSpiller }),
    addDrillFromSource: async (input: { sessionId: string; sourceId: string }) => {
      addDrillKall.push(input);
      return { ok: true, data: sessionRad };
    },
  },
});

function reset() {
  tnKontekst = { gruppe: { id: "gruppe-tn", name: "Team Norway" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
  tnSpillere = { kontekst: tnKontekst, rader: [{ id: "spiller-1", navn: "Spiller Én" }] };
  harCoachTilgangResultat = true;
  harCapability = true;
  gruppePerioderKall = [];
  gruppeTimerKall = [];
  opprettedeGruppePerioder = [];
  opprettedeOkter = [];
  sessionRad = { id: "okt-1", playerId: "spiller-1", status: "DRAFT" };
  flyttetKall = 0;
  slettetKall = 0;
  publisertKall = [];
  kopiertFraKilde = [];
  malKall = [];
  seriesKall = [];
  trainingSessionV2Rader = [];
  trainingPlanSessionRader = [];
  kilderForSpiller = [];
  addDrillKall = [];
  serieRaderForSerie = [];
}
reset();

async function modul() {
  return import("./tn-workbench");
}

const coach = { id: "coach-1", role: "COACH" as const, name: "Coach" };

// ---------------------------------------------------------------------------
// 1. Global rolleport (platform User.role) — ADMIN-fiks + PLAYER+gruppeCOACH
// ---------------------------------------------------------------------------

test("hentTnWorkbenchKontekst: ukjent/legacy TN-rolle (f.eks. GUEST) avvises helt — ikke tolket som trener", async () => {
  reset();
  tnKontekst = { gruppe: { id: "gruppe-tn", name: "Team Norway" }, rolle: "GUEST", erSpiller: false, kanAdministrere: false };
  const { hentTnWorkbenchKontekst } = await modul();
  const res = await hentTnWorkbenchKontekst({ id: "gjest-1", role: "COACH", name: null });
  assert.equal(res, null);
});

test("hentTnWorkbenchKontekst: ASSISTANT er erTrener men IKKE kanAdministrere", async () => {
  reset();
  tnKontekst = { gruppe: { id: "gruppe-tn", name: "Team Norway" }, rolle: "ASSISTANT", erSpiller: false, kanAdministrere: false };
  const { hentTnWorkbenchKontekst } = await modul();
  const res = await hentTnWorkbenchKontekst({ id: "assistent-1", role: "COACH", name: null });
  assert.equal(res?.erTrener, true);
  assert.equal(res?.kanAdministrere, false);
});

test("hentTnWorkbenchKontekst: ADMIN uten eget TN-medlemskap (rolle=ADMIN) ER trener OG kan administrere — tidligere feil ekskluderte ADMIN", async () => {
  reset();
  tnKontekst = { gruppe: { id: "gruppe-tn", name: "Team Norway" }, rolle: "ADMIN", erSpiller: false, kanAdministrere: true };
  const { hentTnWorkbenchKontekst } = await modul();
  const res = await hentTnWorkbenchKontekst({ id: "admin-1", role: "ADMIN", name: null });
  assert.equal(res?.erTrener, true);
  assert.equal(res?.kanAdministrere, true);
});

test("hentTnWorkbenchKontekst: platform-rolle PLAYER med TN-gruppe-rolle COACH (feilregistrert/uvanlig) gir IKKE trener-/administrasjonskontekst", async () => {
  reset();
  tnKontekst = { gruppe: { id: "gruppe-tn", name: "Team Norway" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
  const { hentTnWorkbenchKontekst } = await modul();
  const res = await hentTnWorkbenchKontekst({ id: "spiller-som-har-coach-rad", role: "PLAYER", name: null });
  assert.equal(res?.erTrener, false);
  assert.equal(res?.kanAdministrere, false);
  assert.equal(res?.erSpiller, false, "TN-rolle er COACH, ikke PLAYER, så dette er heller ikke en gyldig spillerkontekst");
});

test("hentTnWorkbenchKontekst: platform-rolle PARENT med TN-gruppe-rolle PLAYER (uvanlig) gir IKKE spillerkontekst", async () => {
  reset();
  tnKontekst = { gruppe: { id: "gruppe-tn", name: "Team Norway" }, rolle: "PLAYER", erSpiller: true, kanAdministrere: false };
  const { hentTnWorkbenchKontekst } = await modul();
  const res = await hentTnWorkbenchKontekst({ id: "forelder-som-har-player-rad", role: "PARENT", name: null });
  assert.equal(res?.erSpiller, false);
  assert.equal(res?.erTrener, false);
});

test("harTnPersonligPlanLesetilgang: selv-ID-snarveien krever faktisk gyldig spillerkontekst (rolle-/rosterkontroll FØR selv-ID)", async () => {
  reset();
  const { hentTnWorkbenchKontekst, harTnPersonligPlanLesetilgang } = await modul();
  // En COACH sin egen id blir aldri behandlet som "spilleren selv" bare fordi id-ene er like.
  const kontekst = await hentTnWorkbenchKontekst(coach);
  const svarCoach = await harTnPersonligPlanLesetilgang(coach, kontekst!, coach.id);
  assert.equal(svarCoach, false, "en trener har ikke en 'egen spillerplan' bare fordi spillerId == bruker.id");

  // Den ekte spilleren derimot skal slippe gjennom selv-ID-veien.
  tnKontekst = { gruppe: { id: "gruppe-tn", name: "Team Norway" }, rolle: "PLAYER", erSpiller: true, kanAdministrere: false };
  const spillerKontekst = await hentTnWorkbenchKontekst({ id: "spiller-1", role: "PLAYER", name: null });
  const svarSpiller = await harTnPersonligPlanLesetilgang({ id: "spiller-1", role: "PLAYER", name: null }, spillerKontekst!, "spiller-1");
  assert.equal(svarSpiller, true);
});

// ---------------------------------------------------------------------------
// Roster/eierskap/bekreftelse (uendret fra forrige runde, re-bevist mot ny kode)
// ---------------------------------------------------------------------------

test("tnOpprettOkt: TN-ASSISTANT (kanAdministrere=false) avvises selv om harCoachTilgangTilSpiller ville sagt ja", async () => {
  reset();
  const { hentTnWorkbenchKontekst, tnOpprettOkt } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  assert.ok(kontekst);
  const assistentKontekst = { ...kontekst!, kanAdministrere: false };
  const svar = await tnOpprettOkt(coach, assistentKontekst, "spiller-1", { date: "2026-09-15", startMinute: 480, durationMinutes: 60, title: "Økt", pyramid: "TEK" });
  assert.equal(svar.ok, false);
  assert.equal(opprettedeOkter.length, 0);
});

test("tnOpprettOkt: spiller utenfor TN-rosteret avvises selv med personlig coach-tilgang", async () => {
  reset();
  harCoachTilgangResultat = true;
  const { hentTnWorkbenchKontekst, tnOpprettOkt } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  const svar = await tnOpprettOkt(coach, kontekst!, "utenfor-tn-1", { date: "2026-09-15", startMinute: 480, durationMinutes: 60, title: "Økt", pyramid: "TEK" });
  assert.equal(svar.ok, false);
  assert.equal(opprettedeOkter.length, 0);
});

test("tnOpprettOkt: TN-COACH med personlig tilgang til aktiv TN-spiller lykkes", async () => {
  reset();
  const { hentTnWorkbenchKontekst, tnOpprettOkt } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  const svar = await tnOpprettOkt(coach, kontekst!, "spiller-1", { date: "2026-09-15", startMinute: 480, durationMinutes: 60, title: "Økt", pyramid: "TEK" });
  assert.equal(svar.ok, true);
  assert.deepEqual(opprettedeOkter, [{ playerId: "spiller-1" }]);
});

test("tnFlyttOkt/tnPubliserOkt: forfalsket sessionId som tilhører en ANNEN spiller avvises (eierskapsporten)", async () => {
  reset();
  sessionRad = { id: "okt-annen", playerId: "en-annen-spiller-utenfor-valgt", status: "DRAFT" };
  const { hentTnWorkbenchKontekst, tnFlyttOkt, tnPubliserOkt } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  const flytt = await tnFlyttOkt(coach, kontekst!, "spiller-1", { sessionId: "okt-annen", newDate: "2026-09-16", newStartMinute: 540 });
  assert.equal(flytt.ok, false);
  assert.equal(flyttetKall, 0);
  const publiser = await tnPubliserOkt(coach, kontekst!, "spiller-1", "okt-annen");
  assert.equal(publiser.ok, false);
  assert.equal(publisertKall.length, 0);
});

test("tnSlettOkt: krever eksplisitt SLETT-bekreftelse før noe kalles", async () => {
  reset();
  const { hentTnWorkbenchKontekst, tnSlettOkt } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  const utenBekreftelse = await tnSlettOkt(coach, kontekst!, "spiller-1", "okt-1", "");
  assert.equal(utenBekreftelse.ok, false);
  assert.equal(slettetKall, 0);
  const medBekreftelse = await tnSlettOkt(coach, kontekst!, "spiller-1", "okt-1", "slett");
  assert.equal(medBekreftelse.ok, true);
  assert.equal(slettetKall, 1);
});

test("kanRedigereTnGruppeplan/tnLagrePeriode: TN-ASSISTANT (kanAdministrere=false) nektes selv med EDIT_GROUP_PLANS-kapasitet", async () => {
  reset();
  harCapability = true;
  const { hentTnWorkbenchKontekst, kanRedigereTnGruppeplan, tnLagrePeriode } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  const assistentKontekst = { ...kontekst!, kanAdministrere: false };
  assert.equal(await kanRedigereTnGruppeplan(coach, assistentKontekst), false);
  const svar = await tnLagrePeriode(coach, assistentKontekst, { lPhase: "GRUNN", startDato: "2026-01-01", sluttDato: "2026-03-01", fokus: "" });
  assert.equal(svar.ok, false);
  assert.equal(opprettedeGruppePerioder.length, 0);
});

test("kanRedigereTnGruppeplan: platform-rolle PLAYER med TN-rolle COACH (uvanlig data) nektes selv om kontekst.kanAdministrere skulle vært feilaktig true", async () => {
  reset();
  const { kanRedigereTnGruppeplan } = await modul();
  // Simulerer at hentTnArbeidskontekst (delt, utenfor eierskap) feilaktig satte kanAdministrere=true for en platform-PLAYER.
  const feilKontekst = { gruppeId: "gruppe-tn", gruppeNavn: "Team Norway", erTrener: true, erSpiller: false, kanAdministrere: true, spillere: [{ id: "spiller-1", navn: "Spiller Én" }] };
  const svar = await kanRedigereTnGruppeplan({ id: "x", role: "PLAYER", name: null }, feilKontekst);
  assert.equal(svar, false, "den eksplisitte globale rolleporten i denne fila skal stoppe dette uansett hva kontekst.kanAdministrere sier");
});

test("tnLagrePeriode: TN-COACH med kanAdministrere lykkes og binder korrekt groupId", async () => {
  reset();
  const { hentTnWorkbenchKontekst, tnLagrePeriode } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  const svar = await tnLagrePeriode(coach, kontekst!, { lPhase: "GRUNN", startDato: "2026-01-01", sluttDato: "2026-03-01", fokus: "" });
  assert.equal(svar.ok, true);
  assert.equal((opprettedeGruppePerioder[0] as { groupId: string }).groupId, "gruppe-tn");
});

// ---------------------------------------------------------------------------
// 5. Oslo-riktig kalendergrense — DST-eksplisitt (sommer/vinter/overganger)
// ---------------------------------------------------------------------------

test("hentTnGruppeTimer: sommertid (UTC+2) — grensen er Oslo-midnatt, ikke UTC-midnatt", async () => {
  reset();
  const { hentTnGruppeTimer } = await modul();
  await hentTnGruppeTimer("gruppe-tn", "2026-09-01", "2026-09-30");
  // 1. sept er fortsatt sommertid i Norge (DST varer til siste søndag i oktober) → Oslo-midnatt = UTC 22:00 dagen før.
  assert.deepEqual(gruppeTimerKall[0]?.fra, new Date("2026-08-31T22:00:00.000Z"));
  // Øvre grense: Oslo-midnatt dagen ETTER 30. sept, altså 1. okt 00:00 Oslo = UTC 30. sept 22:00.
  assert.deepEqual(gruppeTimerKall[0]?.til, new Date("2026-09-30T22:00:00.000Z"));
});

test("hentTnGruppeTimer: vintertid (UTC+1) — grensen er 1 time fra UTC-midnatt, ikke 2", async () => {
  reset();
  const { hentTnGruppeTimer } = await modul();
  await hentTnGruppeTimer("gruppe-tn", "2026-01-15", "2026-01-15");
  assert.deepEqual(gruppeTimerKall[0]?.fra, new Date("2026-01-14T23:00:00.000Z"));
  assert.deepEqual(gruppeTimerKall[0]?.til, new Date("2026-01-15T23:00:00.000Z"));
});

test("hentTnGruppeTimer: vinter→sommer-overgangen (siste søndag i mars 2026 = 29.03) — dagens START er FØR klokkeomstillingen (kl. 02 lokalt), dagens SLUTT er ETTER", async () => {
  reset();
  const { hentTnGruppeTimer } = await modul();
  await hentTnGruppeTimer("gruppe-tn", "2026-03-29", "2026-03-29");
  // Midnatt 29. mars inntreffer FØR selve omstillingsøyeblikket (kl. 02 lokal/01 UTC) —
  // vintertid-offset (+1) gjelder ennå der. Døgnet SLUTTER (= 30. mars midnatt) ETTER
  // omstillingen, med sommertid-offset (+2).
  assert.deepEqual(gruppeTimerKall[0]?.fra, new Date("2026-03-28T23:00:00.000Z"));
  assert.deepEqual(gruppeTimerKall[0]?.til, new Date("2026-03-29T22:00:00.000Z"));
});

test("hentTnGruppeTimer: sommer→vinter-overgangen (siste søndag i oktober 2026 = 25.10) — dagen selv er allerede vintertid", async () => {
  reset();
  const { hentTnGruppeTimer } = await modul();
  await hentTnGruppeTimer("gruppe-tn", "2026-10-25", "2026-10-25");
  // Klokka stilles tilbake natt til 25. oktober kl. 03→02 — 25. oktober SELV regnes med
  // vintertid-offset (+1) ved dagens start (00:00 lokalt inntreffer FØR tilbakestillingen kl. 03).
  assert.deepEqual(gruppeTimerKall[0]?.fra, new Date("2026-10-24T22:00:00.000Z"));
  assert.deepEqual(gruppeTimerKall[0]?.til, new Date("2026-10-25T23:00:00.000Z"));
});

test("hentTnGruppeTimer: en økt som krysser Oslo-midnatt telles på STARTDAGEN, aldri splittet/dobbelttalt", async () => {
  reset();
  const { hentTnGruppeTimer } = await modul();
  // Vindu = kun 16. september. En økt som starter 23:00 Oslo SAMME dag (og varer til
  // 01:00 neste morgen) skal falle innenfor dette vinduet — den tilhører startdagen.
  await hentTnGruppeTimer("gruppe-tn", "2026-09-16", "2026-09-16");
  const [fra, til] = [gruppeTimerKall[0]!.fra, gruppeTimerKall[0]!.til];
  const oktStartUtc = new Date("2026-09-16T21:00:00.000Z"); // 23:00 Oslo 16. sept (sommertid, +2)
  assert.ok(oktStartUtc >= fra && oktStartUtc < til, "økten som starter 23:00 Oslo 16. sept skal falle innenfor 16. septembers vindu");
  const naesteDagStartUtc = new Date("2026-09-16T23:30:00.000Z"); // 01:30 Oslo 17. sept (neste kalenderdag)
  assert.ok(naesteDagStartUtc >= til, "01:30 Oslo 17. sept skal IKKE regnes med i 16. septembers vindu");
});

// ---------------------------------------------------------------------------
// 3. Kopier / mal / rediger / gjennomgang-før-publisering
// ---------------------------------------------------------------------------

test("tnKopierOkt: kilde som tilhører en ANNEN spiller avvises, ingen kopi opprettes", async () => {
  reset();
  sessionRad = { id: "kilde-1", playerId: "en-annen-spiller", status: "COMPLETED" };
  const { hentTnWorkbenchKontekst, tnKopierOkt } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  const svar = await tnKopierOkt(coach, kontekst!, "spiller-1", { kildeSessionId: "kilde-1", nyDato: "2026-09-20", nyStartMinutt: 600 });
  assert.equal(svar.ok, false);
  assert.equal(kopiertFraKilde.length, 0);
});

test("tnKopierOkt: gyldig kilde for valgt spiller kopieres via createSessionFromSource med forrige-kilde-id", async () => {
  reset();
  const { hentTnWorkbenchKontekst, tnKopierOkt } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  const svar = await tnKopierOkt(coach, kontekst!, "spiller-1", { kildeSessionId: "okt-1", nyDato: "2026-09-20", nyStartMinutt: 600 });
  assert.equal(svar.ok, true);
  assert.equal(kopiertFraKilde.length, 1);
  assert.equal(kopiertFraKilde[0]?.playerId, "spiller-1");
  assert.equal(kopiertFraKilde[0]?.sourceId, "forrige:okt-1");
  assert.equal(kopiertFraKilde[0]?.date, "2026-09-20");
});

test("tnSettMal: TN-ASSISTANT nektes, TN-COACH med eierskap lykkes", async () => {
  reset();
  const { hentTnWorkbenchKontekst, tnSettMal } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  const assistentKontekst = { ...kontekst!, kanAdministrere: false };
  const nektet = await tnSettMal(coach, assistentKontekst, "spiller-1", "okt-1", true);
  assert.equal(nektet.ok, false);
  assert.equal(malKall.length, 0);

  const godkjent = await tnSettMal(coach, kontekst!, "spiller-1", "okt-1", true);
  assert.equal(godkjent.ok, true);
  assert.deepEqual(malKall, [{ sessionId: "okt-1", isTemplate: true }]);
});

test("hentTnKilder: TN-ASSISTANT (kanAdministrere=false) får tom liste, TN-COACH får spillerens faktiske kildepanel", async () => {
  reset();
  kilderForSpiller = [{ id: "drill:system-1", kind: "DRILL", title: "System-øvelse" }];
  const { hentTnWorkbenchKontekst, hentTnKilder } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  const assistentKontekst = { ...kontekst!, kanAdministrere: false };
  assert.deepEqual(await hentTnKilder(coach, assistentKontekst, "spiller-1"), []);
  assert.equal((await hentTnKilder(coach, kontekst!, "spiller-1")).length, 1);
});

test("tnOpprettFraMal: DRILL-kilde som IKKE finnes i spillerens eget kildepanel (f.eks. en annen spillers private øvelse) avvises FØR createSessionFromSource kalles", async () => {
  reset();
  kilderForSpiller = [{ id: "drill:system-1", kind: "DRILL", title: "System-øvelse" }];
  const { hentTnWorkbenchKontekst, tnOpprettFraMal } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  const avvist = await tnOpprettFraMal(coach, kontekst!, "spiller-1", { sourceId: "drill:privat-hos-spiller-b", dato: "2026-09-20", startMinutt: 480 });
  assert.equal(avvist.ok, false);
  assert.equal(kopiertFraKilde.length, 0, "createSessionFromSource skal ALDRI kalles for en kilde som ikke er lovlig for spilleren");

  const godkjent = await tnOpprettFraMal(coach, kontekst!, "spiller-1", { sourceId: "drill:system-1", dato: "2026-09-20", startMinutt: 480 });
  assert.equal(godkjent.ok, true);
  assert.equal(kopiertFraKilde.length, 1);
  assert.equal(kopiertFraKilde[0]?.sourceId, "drill:system-1");
});

test("tnLeggTilOvelseIOkt: forfalsket sessionId for annen spiller avvises FØR kildesjekk/addDrillFromSource", async () => {
  reset();
  kilderForSpiller = [{ id: "drill:system-1", kind: "DRILL", title: "System-øvelse" }];
  const { hentTnWorkbenchKontekst, tnLeggTilOvelseIOkt } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  sessionRad = { id: "annen-okt", playerId: "en-annen-spiller", status: "DRAFT" };
  const avvist = await tnLeggTilOvelseIOkt(coach, kontekst!, "spiller-1", { sessionId: "annen-okt", sourceId: "drill:system-1" });
  assert.equal(avvist.ok, false);
  assert.equal(addDrillKall.length, 0);
});

test("tnLeggTilOvelseIOkt: øvelse som IKKE er i spillerens kildepanel (en annen spillers PRIVATE øvelse) avvises, selv om den delte addDrillFromSource ville funnet raden", async () => {
  reset();
  kilderForSpiller = [{ id: "drill:system-1", kind: "DRILL", title: "System-øvelse" }];
  sessionRad = { id: "okt-1", playerId: "spiller-1", status: "DRAFT" };
  const { hentTnWorkbenchKontekst, tnLeggTilOvelseIOkt } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  const avvist = await tnLeggTilOvelseIOkt(coach, kontekst!, "spiller-1", { sessionId: "okt-1", sourceId: "drill:privat-hos-spiller-b" });
  assert.equal(avvist.ok, false);
  assert.equal(addDrillKall.length, 0, "en kilde utenfor spillerens eget kildepanel skal aldri nå frem til den delte, synlighetsblinde addDrillFromSource");

  const godkjent = await tnLeggTilOvelseIOkt(coach, kontekst!, "spiller-1", { sessionId: "okt-1", sourceId: "drill:system-1" });
  assert.equal(godkjent.ok, true);
  assert.deepEqual(addDrillKall, [{ sessionId: "okt-1", sourceId: "drill:system-1" }]);
});

test("tnLeggTilOvelseIOkt: en mal-/forrige-uke-kilde (ikke DRILL) avvises — kun øvelser kan legges til en eksisterende økt", async () => {
  reset();
  kilderForSpiller = [{ id: "mal:okt-2", kind: "TEMPLATE", title: "Fast mal" }];
  sessionRad = { id: "okt-1", playerId: "spiller-1", status: "DRAFT" };
  const { hentTnWorkbenchKontekst, tnLeggTilOvelseIOkt } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  const avvist = await tnLeggTilOvelseIOkt(coach, kontekst!, "spiller-1", { sessionId: "okt-1", sourceId: "mal:okt-2" });
  assert.equal(avvist.ok, false);
  assert.equal(addDrillKall.length, 0);
});

test("tnRedigerOktInnhold: forfalsket sessionId for annen spiller avvises, ekte økt oppdateres med riktig policy", async () => {
  reset();
  const { hentTnWorkbenchKontekst, tnRedigerOktInnhold } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);

  sessionRad = { id: "annen-okt", playerId: "en-annen-spiller", status: "DRAFT" };
  const avvist = await tnRedigerOktInnhold(coach, kontekst!, "spiller-1", { sessionId: "annen-okt", policy: "DENNE", patch: { title: "Ny tittel" } });
  assert.equal(avvist.ok, false);
  assert.equal(seriesKall.length, 0);

  sessionRad = { id: "okt-1", playerId: "spiller-1", status: "DRAFT" };
  const ok = await tnRedigerOktInnhold(coach, kontekst!, "spiller-1", { sessionId: "okt-1", policy: "HELE_SERIEN", patch: { title: "Ny tittel" } });
  assert.equal(ok.ok, true);
  assert.equal(seriesKall[0]?.policy, "HELE_SERIEN");
});

test("tnRedigerOktInnhold: policy!=DENNE med en serie som inneholder en ANNEN spillers økt avvises FØR updateSeriesSession kalles — det holder ikke å bare sjekke selve sessionId-en", async () => {
  reset();
  sessionRad = { id: "okt-1", playerId: "spiller-1", status: "DRAFT", seriesId: "serie-1" };
  serieRaderForSerie = [
    { seriesId: "serie-1", playerId: "spiller-1" },
    { seriesId: "serie-1", playerId: "en-annen-spiller" },
  ];
  const { hentTnWorkbenchKontekst, tnRedigerOktInnhold } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  const avvist = await tnRedigerOktInnhold(coach, kontekst!, "spiller-1", { sessionId: "okt-1", policy: "HELE_SERIEN", patch: { title: "Ny tittel" } });
  assert.equal(avvist.ok, false);
  assert.equal(seriesKall.length, 0, "en blandet serie skal aldri nå frem til den delte, spiller-blinde updateSeriesSession");
});

test("tnRedigerOktInnhold: policy=DENNE trenger ikke seriekontroll, og en serie som KUN tilhører valgt spiller godkjennes for HELE_SERIEN", async () => {
  reset();
  sessionRad = { id: "okt-1", playerId: "spiller-1", status: "DRAFT", seriesId: "serie-1" };
  serieRaderForSerie = [
    { seriesId: "serie-1", playerId: "spiller-1" },
    { seriesId: "serie-1", playerId: "spiller-1" },
  ];
  const { hentTnWorkbenchKontekst, tnRedigerOktInnhold } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  const ok = await tnRedigerOktInnhold(coach, kontekst!, "spiller-1", { sessionId: "okt-1", policy: "HELE_SERIEN", patch: { title: "Ny tittel" } });
  assert.equal(ok.ok, true);
  assert.equal(seriesKall.length, 1);
});

test("tnRedigerOktInnhold: tom streng i notater sendes UENDRET videre til updateSeriesSession (bevisst tømming, ikke konvertert til undefined)", async () => {
  reset();
  sessionRad = { id: "okt-1", playerId: "spiller-1", status: "DRAFT" };
  const { hentTnWorkbenchKontekst, tnRedigerOktInnhold } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  const ok = await tnRedigerOktInnhold(coach, kontekst!, "spiller-1", { sessionId: "okt-1", policy: "DENNE", patch: { notes: "" } });
  assert.equal(ok.ok, true);
  assert.equal((seriesKall[0]?.patch as { notes?: string })?.notes, "", "tom streng skal bety «fjern notatet», ikke bety «ikke rør feltet» (undefined)");
});

test("tnPubliserFlere: én forfalsket id i utvalget stopper HELE batchen — ingenting publiseres", async () => {
  reset();
  const { hentTnWorkbenchKontekst, tnPubliserFlere } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  sessionRad = { id: "okt-1", playerId: "spiller-1", status: "DRAFT" };
  // "okt-1" finnes og tilhører spiller-1, men "okt-fremmed" finnes ikke i det hele tatt (loadSession-mocken kjenner kun sessionRad.id).
  const svar = await tnPubliserFlere(coach, kontekst!, "spiller-1", ["okt-1", "okt-fremmed"]);
  assert.equal(svar.ok, false);
  assert.equal(publisertKall.length, 0);
});

test("tnPubliserFlere: gyldig utvalg publiseres i én batch", async () => {
  reset();
  const { hentTnWorkbenchKontekst, tnPubliserFlere } = await modul();
  const kontekst = await hentTnWorkbenchKontekst(coach);
  const svar = await tnPubliserFlere(coach, kontekst!, "spiller-1", ["okt-1"]);
  assert.equal(svar.ok, true);
  assert.deepEqual(publisertKall, [["okt-1"]]);
});

// ---------------------------------------------------------------------------
// 6. TrainingSessionV2 / TrainingPlanSession — lesing, aldri slått sammen
// ---------------------------------------------------------------------------

test("hentTnTrainingSessionV2/hentTnTrainingPlanSession: leser kun valgt spillers rader i vinduet, hver for seg", async () => {
  reset();
  trainingSessionV2Rader = [
    { id: "v2-1", title: "Kalenderøkt", startTime: new Date("2026-09-15T09:00:00Z"), status: "PLANNED", studentId: "spiller-1" },
    { id: "v2-2", title: "Annen spiller", startTime: new Date("2026-09-15T09:00:00Z"), status: "PLANNED", studentId: "en-annen-spiller" },
  ];
  trainingPlanSessionRader = [
    { id: "plan-okt-1", title: "Gammel planøkt", scheduledAt: new Date("2026-09-15T10:00:00Z"), status: "PLANNED", plan: { userId: "spiller-1" } },
  ];
  const { hentTnTrainingSessionV2, hentTnTrainingPlanSession } = await modul();
  const v2 = await hentTnTrainingSessionV2("spiller-1", new Date("2026-09-14T22:00:00Z"), new Date("2026-09-21T22:00:00Z"));
  const plan = await hentTnTrainingPlanSession("spiller-1", new Date("2026-09-14T22:00:00Z"), new Date("2026-09-21T22:00:00Z"));
  assert.equal(v2.length, 1);
  assert.equal(v2[0]?.id, "v2-1");
  assert.equal(v2[0]?.kilde, "TRAININGSESSION_V2");
  assert.equal(plan.length, 1);
  assert.equal(plan[0]?.kilde, "TRAININGPLAN_SESSION");
  // Aldri slått sammen til én liste i domenelaget — konsumenten (siden) holder dem i separate rader selv.
  assert.notDeepEqual(v2[0], plan[0]);
});
