/* Workbench fysisk + turnering · tillegg 27.09.2026. Samme spiller (Tobias Lindvik i AgencyOS, Emma Solberg i PlayerHQ-visning), uke 40 = 28.09–04.10.2026. Lastes etter data-wb.js. */
(() => {
  const W = window.WB_DATA;
  W.players = ["Tobias Lindvik", "Magnus Aasheim", "Sara Holm", "Ingrid Berg"];
  W.groups = ["WANG Toppidrett · 6 spillere", "Talent U16 · 11 spillere"];
  W.fys.status = { b1: "Endret etter publisering", b2: "Kladd" };
  W.fys.changedAt = "26.09.2026 14:02";
  W.fys.history = [
    { t: "21.09.2026 09:10", what: "Blokk publisert til Tobias Lindvik", by: "Anders Kristiansen" },
    { t: "24.09.2026 18:40", what: "Tobias: Styrke A gjennomført · 3 av 4 øvelser · RPE 7", by: "Tobias Lindvik" },
    { t: "26.09.2026 14:02", what: "Knebøy uke 41 endret fra 70 til 72,5 kg", by: "Anders Kristiansen" }
  ];
  W.fys.response = { rpe: 7, form: 3, note: "Tungt i siste sett knebøy. Litt stiv i korsrygg dagen etter.", date: "21.09.2026" };
  W.fys.load = { acwr: 1.18, weekMin: 180, src: "ØKTLOGG · 26.09.2026" };
  W.fys.cond = { goal: "Aerob base: 3 × 35 min sone 2 per uke", zone: "Sone 2 · 130–145 slag/min" };
  W.days2 = W.days.map((d, i) => ({ d, travel: i === 3, school: i === 1 ? "Heldagsprøve matematikk" : null, turn: i >= 5 }));
  W.turn.format = { t1: "Slagspill · 36 hull · 2 dager", t2: "Slagspill · 18 hull", t3: "Slagspill · 36 hull · 2 dager", t4: "Stableford · 18 hull" };
  W.turn.travel = { t1: ["Tor 01.10"], t3: ["Fre 16.10"] };
  W.turn.conflictsAll = W.turn.conflicts.concat([{ kind: "belastning", text: "Fysisk testuke 45 ligger to dager før sesongavslutningen 31.10.", meta: "FYSISK PLAN · TESTUKE" }]);
  W.turn.evalPlayer = { note: "Grei driving. Mistet fokus på hull 13–15 i runde 1.", date: "21.09.2026" };
  W.konflikter = W.turn.conflictsAll.concat([{ kind: "kalender", text: "Styrke B lagt på reisedag tor 01.10.", meta: "WORKBENCH · FYS" }]);
  Object.assign(W, {
    fysiskBlokker: W.fys.blocks, fysiskUker: W.fys.weeks, fysiskOkter: W.fys.sessions,
    fysiskOvelser: W.fys.sessions.flatMap((s) => s.ex.map((e) => ({ ...e, sessionId: s.id }))), fysiskLogger: W.fys.last.rows,
    turneringer: W.turn.list, turneringsForberedelser: W.turn.prep, turneringsRunder: W.turn.rounds,
    turneringsMal: W.turn.goals, turneringsEvaluering: W.turn.after
  });
})();
