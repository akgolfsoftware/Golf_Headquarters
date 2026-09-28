/* Workbench — runde 29 (Anders 28.09.2026). Samme Workbench for spiller (PH-11) og coach (AG-11). Oppdiktede data. Uke 40: 28.09–04.10.2026.
   Gruppeplanen er grunnmuren (A4): medlemmene får gruppeøktene automatisk. Tilpasning per spiller = «Egen». */
window.WB3 = {
  week: 40, weeks: { 40: ["28.09", "29.09", "30.09", "01.10", "02.10", "03.10", "04.10"], 41: ["05.10", "06.10", "07.10", "08.10", "09.10", "10.10", "11.10"] },
  dayNames: ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"],
  hours: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  axes: [["fys", "FYS"], ["tek", "TEK"], ["slag", "SLAG"], ["spill", "SPILL"], ["turn", "TURN"]],
  players: [
    { id: "p1", name: "Tobias Lindvik", grp: "g1", cat: "D" }, { id: "p2", name: "Magnus Aasheim", grp: "g1", cat: "C" }, { id: "p7", name: "Sara Holm", grp: "g1", cat: "E" },
    { id: "p8", name: "Henrik Dahl", grp: "g1", cat: "C" }, { id: "p3", name: "Ida Berg", grp: "g2", cat: "D" }, { id: "p4", name: "Thea Nilsen", grp: "g2", cat: "E" },
    { id: "p5", name: "Oskar Nilsen", grp: "g2", cat: "F" }, { id: "p6", name: "Jonas Lie", grp: "g2", cat: "F" },
  ],
  groups: [
    { id: "g1", name: "WANG VG2 · morgen", n: 8, own: 2, coach: "Anders Kristiansen" },
    { id: "g2", name: "Junior elite", n: 6, own: 1, coach: "Anders Kristiansen" },
    { id: "g3", name: "Basis 11–13 år", n: 10, own: 0, coach: "Eirik Moe" },
  ],
  recent: ["p1", "g1", "p2"],
  /* Gruppeplan g1 (grunnmur) */
  groupSes: [
    { id: "gs1", day: 0, h: 7, t: "07:30", min: 90, axis: "fys", title: "Styrke · WANG morgenøkt", rep: "Hver uke ut perioden", src: "gruppe" },
    { id: "gs2", day: 2, h: 7, t: "07:30", min: 90, axis: "slag", title: "Nærspill · WANG morgenøkt", rep: "Hver uke ut perioden", src: "gruppe" },
    { id: "gs3", day: 4, h: 7, t: "07:30", min: 90, axis: "slag", title: "Innspill 50–100 m · WANG morgenøkt", rep: "Hver uke ut perioden", src: "gruppe" },
  ],
  /* Tobias: individuell plan + arvede gruppeøkter (én «Egen») */
  playerSes: [
    { id: "ps1", day: 1, h: 16, t: "16:00", min: 75, axis: "slag", title: "Innspill 100–150 m · lengdekontroll", rep: "Annenhver uke", src: "egen" },
    { id: "ps2", day: 2, h: 10, t: "10:00", min: 60, axis: "tek", title: "Privattime · P7.0", rep: null, src: "coach" },
    { id: "ps3", day: 3, h: 17, t: "17:30", min: 45, axis: "fys", title: "Styrke bein og kjerne", rep: "Tir og tor til 18.10", src: "program" },
    { id: "ps4", day: 5, h: 9, t: "09:00", min: 300, axis: "turn", title: "Srixon Tour · runde 6 · Larvik GK", rep: null, src: "turn" },
    { id: "ps5", day: 4, h: 7, t: "07:30", min: 60, axis: "slag", title: "Innspill 50–100 m · WANG morgenøkt", rep: "Egen versjon av gruppeøkta", src: "egen-av-gruppe", of: "gs3" },
  ],
  samling: { week: 41, from: 1, to: 5, name: "Treningssamling · Sør-Spania", meta: "06.10–10.10.2026 · JUNIOR ELITE · 12 SPILLERE" },
  repeat: ["Ikke gjenta", "Hver uke", "Annenhver uke", "Valgte dager", "Til dato", "Ut perioden"],
  /* Øvelsesbank etter AK-formel v2: pyramide → område (19) → motorikk → belastning → press */
  /* Nøyaktig som src/lib/domain/ak-formel-v2.ts. Putt får aldri motorikk. */
  areas: ["Utslag", "Innspill 200 m og lengre", "Innspill 150–200 m", "Innspill 100–150 m", "Innspill 50–100 m", "Chip", "Pitch", "Lob", "Bunker", "Putt 0–3 fot", "Putt 3–5 fot", "Putt 5–10 fot", "Putt 10–25 fot", "Putt 25–40 fot", "Putt 40+ fot", "Styrke", "Kondisjon", "Bevegelighet", "Banespill"],
  motorikk: ["Uten ball", "Lav hastighet", "Automatikk"],
  belastning: ["Innendørs", "Treningsområde", "Bane", "Konkurranse"],
  press: ["Alene", "Observert", "Konkurranse", "Turnering"],
  bank: [
    { id: "b1", axis: "fys", area: "Styrke", name: "Knebøy 4 × 6", min: 20 }, { id: "b2", axis: "fys", area: "Bevegelighet", name: "Thorax-rotasjon · mobilitet", min: 10 },
    { id: "b3", axis: "tek", area: "Innspill 100–150 m", name: "P7.0 · hendene foran i treff · 7-jern", min: 30 }, { id: "b4", axis: "tek", area: "Putt 3–5 fot", name: "Putterbane · ballstart", min: 20 },
    { id: "b5", axis: "slag", area: "Innspill 50–100 m", name: "Innspill 50–100 m · lengdekontroll", min: 20 }, { id: "b6", axis: "slag", area: "Chip", name: "Chip · landingspunkt", min: 15 },
    { id: "b7", axis: "slag", area: "Putt 3–5 fot", name: "Putt 3–5 fot · port", min: 20 }, { id: "b8", axis: "spill", area: "Banespill", name: "9 hull · to baller, verste teller", min: 150 },
    { id: "b9", axis: "turn", area: "Banespill", name: "Treningsturnering 18 hull", min: 270 },
  ],
  fysProg: [["Styrke bein og kjerne", "Blokk styrke · uke 4 av 6", "Tir · tor"], ["Mobilitet før runde", "15 min · hver spilledag", "—"]],
  maler: [["Innspill og nærspill", "75 min · SLAG", "Brukt 14 ganger"], ["Putt 3–5 fot og 5–10 fot", "45 min · SLAG", "Brukt 9 ganger"], ["Turneringsuke", "7 dager · 11,5 t", "Brukt 3 ganger"]],
  turn: [["03.10–04.10", "Srixon Tour · runde 6", "Larvik GK"], ["17.10", "Høstcup", "Borregaard GK"]],
  techTasks: [["P7.0", "Hendene foran ballen i treff"], ["P6.0", "Køllen inn fra innsiden"], ["P4.0", "Kortere baksving"]],
  /* Målsetninger — fremdrift hentes automatisk */
  goals: [
    { id: "m1", type: "Resultatmål", name: "Kategori C", param: "Snittscore 10 tellende runder", start: "75,2", now: "75,2", target: "under 74,0", from: "01.04.2026", to: "31.10.2027", link: "År 2026–27", pct: 0, src: "STATS · SNITTSCORE · 20.09.2026" },
    { id: "m2", type: "Prosessmål", name: "Innspill 50–100 m", param: "Test · innenfor 4 m av 10", start: "3 av 10", now: "5 av 10", target: "7 av 10", from: "02.05.2026", to: "31.10.2026", link: "Turneringsperiode uke 32–40", pct: 50, src: "TEST · TEAM NORWAY · 12.09.2026" },
    { id: "m3", type: "Prosessmål", name: "Rutine før hvert slag", param: "Fullførte økter med rutine", start: "0", now: "11 av 14", target: "14 av 14", from: "01.09.2026", to: "30.09.2026", link: "September", pct: 79, src: "PLAN · ØKTLOGG · 26.09.2026" },
    { id: "m4", type: "Resultatmål", name: "Driver · Club Speed", param: "TrackMan · snitt 5 slag", start: "98,4 mph", now: "101,2 mph", target: "105 mph", from: "02.05.2026", to: "01.04.2027", link: "Grunnperiode uke 46–52", pct: 42, src: "TRACKMAN · 12.09.2026" },
  ],
  goalParams: ["Snittscore", "Strokes Gained per kategori", "Test", "TrackMan-parameter", "Økter gjennomført", "Treningstid per akse", "Turneringsresultat", "Dagsform"],
  goalLinks: ["År", "Periode", "Måned", "Uke", "Økt"],
  b4: { title: "Planforslag for gruppa", text: "Motoren foreslår uke 42–45 for WANG VG2 ut fra periode, tester og etterlevelse.", flag: "Skjult ved lansering" },
};
/* Runde 33 — nivåene over uka: årsplan, periode, måned. Datoer dd.mm.åååå. Timer = per uke per akse. lane 0 = periode, lane 1 = samling/uke/ferie (overstyrer uka unntatt heldag). */
(() => {
  const H = (fys, tek, slag, spill, turn) => ({ fys, tek, slag, spill, turn });
  const P = [
    { id: "t1", type: "turnering", from: "03.08.2026", to: "04.10.2026", focus: "Scoring 50–100 m · rutine før hvert slag", h: H(3, 2, 4.5, 1, 1), note: "Srixon Tour runde 5 og 6. Hold mengden nede uka før.", src: "gruppe" },
    { id: "e1", type: "evaluering", from: "05.10.2026", to: "18.10.2026", focus: "Sesongevaluering · tester og samtale", h: H(3, 2, 4, 2, 1), note: "Spillersamtale med Anders uke 42.", src: "gruppe" },
    { id: "s1", type: "samling", from: "06.10.2026", to: "10.10.2026", focus: "Treningssamling · Sør-Spania", h: H(2, 6, 10, 4, 0), note: "Junior elite · 12 spillere.", src: "gruppe" },
    { id: "r1", type: "restitusjon", from: "19.10.2026", to: "08.11.2026", focus: "Hvile · bevegelighet", h: H(3, 1, 1.5, 0.5, 0), note: "", src: "gruppe" },
    { id: "u1", type: "testuke", from: "09.11.2026", to: "15.11.2026", focus: "Team Norway-tester · fysiske tester", h: H(3, 1, 3, 1, 0), note: "", src: "gruppe" },
    { id: "g1", type: "grunn", from: "16.11.2026", to: "31.01.2027", focus: "Styrke og hastighet · P7.0 hendene foran", h: H(5, 4, 4, 1, 0), note: "", src: "coach" },
    { id: "f1", type: "ferie", from: "21.12.2026", to: "03.01.2027", focus: "Juleferie", h: H(0, 0, 0, 0, 0), note: "", src: "egen" },
    { id: "p1", type: "spesial", from: "01.02.2027", to: "04.04.2027", focus: "Innspill og nærspill under press", h: H(4, 3, 6, 2, 0), note: "", src: "coach" },
    { id: "h1", type: "heldag", from: "13.03.2027", to: "13.03.2027", focus: "Heldagssamling · Oslo GK", h: H(0, 0, 0, 0, 0), note: "", src: "egen" },
    { id: "t2", type: "turnering", from: "05.04.2027", to: "27.06.2027", focus: "Turneringsspill · kategori C", h: H(3, 2, 5, 2, 1.5), note: "", src: "gruppe" },
  ];
  const months = {
    "2026-08": { focus: "Komme i gang med turneringsperioden · rutine før slag", goals: ["m3"], events: [["15.08–16.08", "Srixon Tour · runde 5 · Moss & Rygge GK", "TURN"]], note: "", done: "44 AV 46 T GJENNOMFØRT", eval: { coach: "Holdt planen: 44 av 46 timer. Rutinen sitter bedre på range enn på bane. Tar det med inn i september.", player: "" } },
    "2026-09": { focus: "Innspill 50–100 m · lengdekontroll", goals: ["m2", "m3"], events: [["12.09", "Team Norway-test · Innspill 50–100 m", "TEST"], ["19.09–20.09", "Region Øst juniortour", "TURN"]], note: "Eksamen tirsdag 29.09.", eval: { coach: "", player: "" } },
    "2026-10": { focus: "Srixon Tour runde 6, så evaluering og samling", goals: ["m2", "m1"], alloc: { 42: H(3, 2, 5, 2, 1) }, events: [["03.10–04.10", "Srixon Tour · runde 6 · Larvik GK", "TURN"], ["06.10–10.10", "Treningssamling · Sør-Spania", "SAMLING"], ["13.10", "Team Norway-test · Wedge Gate", "TEST"], ["17.10", "Høstcup · Borregaard GK", "TURN"]], note: "Uke 42: én ekstra SLAG-time etter samlingen.", eval: { coach: "", player: "" } },
  };
  window.WB3.yr = {
    today: "28.09.2026",
    types: [["grunn", "Grunnperiode", 0], ["spesial", "Spesialperiode", 0], ["turnering", "Turneringsperiode", 0], ["evaluering", "Evaluering", 0], ["restitusjon", "Restitusjon", 0], ["testuke", "Testuke", 1], ["samling", "Treningssamling", 1], ["heldag", "Heldagssamling", 1], ["ferie", "Ferie", 1]],
    stdPlans: [["Konkurransespilleren", "C–E"], ["Junior-aspirant", "E–G"], ["Klubbspilleren", "F–H"], ["Practice like the pros", "A–C"], ["Weekend Warrior", "H–K"]],
    lastYear: "Sesong 2025–26 · 9 perioder",
    eventPool: [["24.10", "Team Norway-test · 8-ball", "TEST"], ["31.10", "Team Norway-test · VISA Express", "TEST"], ["07.11", "Klubbmesterskap innendørs", "TURN"]],
    plans: {
      p1: { name: "Sesong 2026–27", from: "03.08.2026", to: "27.06.2027", summary: "Fra kategori D mot C. Scoring 50–100 m og hastighet i vinter.", src: "Gruppas årsplan · WANG VG2 · morgen", made: "LAGET AV TOBIAS 12.08.2026 · 2 EGNE PERIODER", periods: P, months },
      g1: { name: "WANG VG2 · morgen · 2026–27", from: "03.08.2026", to: "27.06.2027", summary: "Skoleåret for WANG VG2. Gruppeøkter man, ons og fre 07:30.", src: "Standardplan · Konkurransespilleren", made: "LAGET AV ANDERS 04.08.2026 · 8 MEDLEMMER · 2 MED EGNE PERIODER", periods: P.filter((p) => p.src !== "egen").map((p) => ({ ...p, src: "gruppe" })), months },
    },
  };
})();
