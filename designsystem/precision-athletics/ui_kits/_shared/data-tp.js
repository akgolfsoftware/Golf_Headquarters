/* Teknisk plan og progresjon (AG-10, AG-TP-01, AG-TP-02, PH-TP-01) — oppdiktede data. Coach Anders Kristiansen, spiller Tobias Lindvik. Dagens dato 27.09.2026. null = ikke registrert («—»). */
window.TP_DATA = (() => {
  const POS = window.AK_VOCAB ? window.AK_VOCAB.P : [["P1.0", "Adresse / Oppstilling"], ["P2.0", "Kølle parallell i baksving"], ["P3.0", "Venstre arm parallell i baksving"], ["P4.0", "Toppen av baksvingen"], ["P5.0", "Venstre arm parallell i nedsving"], ["P6.0", "Kølle parallell i nedsving"], ["P7.0", "Treffpunktet"], ["P8.0", "Kølle parallell i gjennomføring"], ["P9.0", "Høyre arm parallell i oppfølging"], ["P10.0", "Fullføring og balanse"]]; /* Ordmasteren §5 gjelder (Anders 27.09.2026). */
  const PHASES = [["Baksving", "P1–P4", 4], ["Nedsving", "P5–P7", 3], ["Gjennomsving", "P8–P10", 3]];
  const STEPS_FULL = [["UB", "Uten ball"], ["LH25", "Lav hastighet 25 %"], ["LH50", "Lav hastighet 50 %"], ["LH75", "Lav hastighet 75 %"], ["AUTO", "Automatikk"]];
  const STEPS_SAND = [["UBS", "Uten ball i sanden"], ["MB", "Med ball"]];
  const ENV = ["Innendørs", "Treningsområde", "Bane", "Konkurranse"];
  const PRESS = ["Alene", "Observert", "Konkurranse", "Turnering"];
  const GEAR = ["TrackMan", "FlightScope", "Garmin R10", "Mevo+", "Annet", "Uten"];
  const RADAR = ["TrackMan", "FlightScope", "Garmin R10", "Mevo+"];
  const CLUBS = ["Driver", "3-tre", "Hybrid", "4-jern", "5-jern", "6-jern", "7-jern", "8-jern", "9-jern", "PW", "50°", "54°", "58°", "Putter"];
  const PROTO = { rullende: "Rullende vindu", beste: "Beste av N", streak: "Streak", gate: "Økt-gate" };
  const AREAS = { Fullsving: ["Utslag", "Innspill ca. 200 m", "Innspill ca. 150 m", "Innspill ca. 100 m", "Innspill ca. 50 m"], "Nærspill": ["Chip", "Pitch", "Lob"], Bunker: ["Bunker"], Putting: ["Putting 0–3 fot", "Putting 3–5 fot", "Putting 5–10 fot", "Putting 10–25 fot", "Putting 25–40 fot", "Putting 40+ fot"] };
  const family = (a) => Object.keys(AREAS).find((k) => AREAS[k].includes(a)) || "Fullsving";
  const areaCode = (a) => a === "Utslag" ? "UTSLAG" : a.startsWith("Innspill") ? "INNSPILL" + a.replace(/\D/g, "") : a.startsWith("Putting") ? "PUTTING" + a.replace("Putting ", "").replace(" fot", "") : a.toUpperCase();
  /* AK-formelen: PYRAMIDE_OMRÅDE_MOTORIKK_BELASTNING_PRESS. Ledd som ikke gjelder, utelates. Motorikk bare for fullsving. */
  const formula = ({ area, step, env, press }) => ["TEK", area ? areaCode(area) : null, area && family(area) === "Fullsving" && step ? step.replace(/\d+$/, (m) => m) : null, env ? env.toUpperCase() : null, press ? press.toUpperCase() : null].filter(Boolean).join("_");
  const protoText = (p) => !p ? null : p.type === "rullende" ? p.hits + " av de siste " + p.shots + " slagene innenfor målboksen" : p.type === "beste" ? "Minst " + p.hits + " av " + p.shots + " slag innenfor målboksen i én serie" : p.type === "streak" ? p.hits + " slag på rad innenfor målboksen" : "Snitt innenfor målboksen i " + p.hits + " av " + p.shots + " økter";
  const tasks = [
    { id: "t1", pos: "P7.0", title: "Hendene foran ballen i treff", shot: "7-jern lav fade", area: "Innspill ca. 150 m", focus: "Treffpunkt", club: "7-jern", step: "LH50", env: "Treningsområde", press: "Alene", gear: "TrackMan", status: "Aktiv", main: true,
      steps: [["UB", 60, 60], ["LH25", 80, 80], ["LH50", 64, 120], ["LH75", 0, 100], ["AUTO", 0, 140]],
      envs: [["Innendørs", 120, 140], ["Treningsområde", 84, 260], ["Bane", 0, 80], ["Konkurranse", null, 20]],
      src: "LIVE-ØKT · TRACKMAN · MANUELT · 26.09.2026",
      tm: { club: "7-jern", n: 50, src: "TrackMan", date: "24.09.2026", base: "12.08.2026", rows: [
        { k: "Attack Angle", u: "°", d: 1, base: -1.2, lo: -5.0, hi: -3.0, now: -2.1 },
        { k: "Dynamic Loft", u: "°", d: 1, base: 24.8, lo: 19.0, hi: 22.0, now: 22.9 },
        { k: "Face to Path", u: "°", d: 1, base: 0.4, lo: -2.5, hi: -1.0, now: -1.4 },
      ] },
      proto: { type: "rullende", shots: 20, hits: 16, now: 12 },
      qc: { hits: 7, of: 10, date: "24.09.2026", src: "TrackMan" },
      img: { before: { date: "12.08.2026", by: "Anders Kristiansen" }, now: { date: "24.09.2026", by: "Anders Kristiansen" }, note: "Hendene er foran ballen i treff. Skaftet lener mer enn i august. Neste: hold det i 75 % fart.", noteBy: "Anders Kristiansen", noteDate: "24.09.2026" } },
    { id: "t2", pos: "P6.0", title: "Køllen inn fra innsiden", shot: "Driver høy draw", area: "Utslag", focus: "Startretning", club: "Driver", step: "LH25", env: "Innendørs", press: "Alene", gear: "TrackMan", status: "Aktiv", main: true,
      steps: [["UB", 60, 60], ["LH25", 48, 80], ["LH50", 0, 80], ["LH75", 0, 80], ["AUTO", 0, 100]],
      envs: [["Innendørs", 108, 180], ["Treningsområde", 0, 160], ["Bane", 0, 40], ["Konkurranse", null, 20]],
      src: "LIVE-ØKT · 25.09.2026",
      tm: { club: "Driver", n: 30, src: "TrackMan", date: "19.09.2026", base: "12.08.2026", rows: [
        { k: "Club Path", u: "°", d: 1, base: -3.4, lo: 1.0, hi: 3.0, now: -0.8 },
      ] },
      proto: { type: "streak", shots: null, hits: 5, now: 2 },
      qc: null,
      img: { before: { date: "12.08.2026", by: "Anders Kristiansen" }, now: null, note: null } },
    { id: "t3", pos: "P4.0", title: "Kortere baksving", shot: "Driver stock", area: "Utslag", focus: "Sikte og oppstilling", club: "Driver", step: "AUTO", env: "Bane", press: "Observert", gear: "Uten", status: "Aktiv", main: false,
      steps: [["UB", 40, 40], ["LH25", 60, 60], ["LH50", 60, 60], ["LH75", 60, 60], ["AUTO", 22, 80]],
      envs: [["Innendørs", 100, 100], ["Treningsområde", 120, 120], ["Bane", 22, 60], ["Konkurranse", null, null]],
      src: "MANUELT · 22.09.2026", tm: null, proto: null, qc: null, img: null },
    { id: "t4", pos: "P7.0", title: "Stabilt treff på pitch 30–50 m", shot: "54° pitch lav", area: "Pitch", focus: "Treffpunkt", club: "54°", step: null, env: "Treningsområde", press: "Observert", gear: "Uten", status: "Aktiv", main: false,
      steps: [["", 90, 150]], envs: [["Innendørs", null, null], ["Treningsområde", 90, 120], ["Bane", 0, 30], ["Konkurranse", null, null]],
      src: "LIVE-ØKT · 26.09.2026", tm: null, proto: { type: "beste", shots: 10, hits: 7, now: 6 }, qc: { hits: 6, of: 10, date: "26.09.2026", src: "Manuelt" }, img: null },
    { id: "t5", pos: "P1.0", title: "Stabil inngang i sanden", shot: "58° greenside-bunker", area: "Bunker", focus: "Sandinngang", club: "58°", step: null, env: "Treningsområde", press: "Alene", gear: "Uten", status: "Aktiv", main: false,
      steps: [["UBS", 40, 40], ["MB", 18, 60]], envs: [["Innendørs", null, null], ["Treningsområde", 58, 100], ["Bane", null, null], ["Konkurranse", null, null]],
      src: "MANUELT · 20.09.2026", tm: null, proto: null, qc: null, img: null },
  ];
  const posStatus = { "P1.0": "Godkjent", "P2.0": "Godkjent", "P3.0": "Godkjent", "P4.0": "Jobber med", "P5.0": "Ikke startet", "P6.0": "Jobber med", "P7.0": "Jobber med", "P8.0": "Ikke startet", "P9.0": "Ikke startet", "P10.0": "Godkjent" };
  const log = [
    { id: "l1", date: "26.09.2026", task: "t1", reps: 40, step: "LH50", env: "Treningsområde", src: "Live-økt", cmt: "Kjentes riktig i 50 %. Mistet det mot slutten.", reply: "Bra. Hold 50 % neste økt, ikke gå opp ennå.", replyDate: "26.09.2026" },
    { id: "l2", date: "26.09.2026", task: "t4", reps: 30, step: null, env: "Treningsområde", src: "Live-økt", cmt: null, reply: null },
    { id: "l3", date: "25.09.2026", task: "t2", reps: 48, step: "LH25", env: "Innendørs", src: "Manuelt", cmt: "Speilet hjalp. Usikker på skaftvinkel.", reply: null },
    { id: "l4", date: "24.09.2026", task: "t1", reps: 24, step: "LH50", env: "Innendørs", src: "TrackMan", cmt: null, reply: null },
  ];
  const sum = (t) => t.steps.reduce((a, s) => [a[0] + (s[1] || 0), a[1] + (s[2] || 0)], [0, 0]);
  const total = tasks.reduce((a, t) => { const s = sum(t); return [a[0] + s[0], a[1] + s[1]]; }, [0, 0]);
  return {
    POS, PHASES, STEPS_FULL, STEPS_SAND, ENV, PRESS, GEAR, RADAR, CLUBS, PROTO, AREAS, family, formula, protoText, sum,
    plan: { id: "tp-2026h", name: "Teknisk plan høst 2026", status: "Aktiv", pub: "18.09.2026", focus: ["P6.0", "P7.0"], coach: "Anders Kristiansen", player: "Tobias Lindvik", done: total[0], goal: total[1], src: "LIVE-ØKT · TRACKMAN · MANUELT", date: "26.09.2026" },
    tasks, posStatus, log,
    stepName: (c) => (STEPS_FULL.concat(STEPS_SAND).find((s) => s[0] === c) || [null, null])[1],
  };
})();
