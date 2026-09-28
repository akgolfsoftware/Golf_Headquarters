/* AgencyOS Cockpit — runde 25 (Anders 28.09.2026). Oppdiktede data. Coach Anders Kristiansen. Lørdag 26.09.2026, uke 39. */
window.COCKPIT = {
  date: "Lørdag 26.09 · uke 39", now: "08:14",
  counts: [["meld", "Meldinger venter", 5, "AG-04"], ["plan", "Følger ikke planen", 3, "AG-07"], ["turn", "Turneringer denne uka", 4, "AG-17"], ["forslag", "Forslag venter", 6, "AG-04"]],
  cal: [
    { id: "k1", t: "07:30", end: "09:00", kind: "Gruppeøkt", who: "WANG Toppidrett VG2", n: 8, where: "Fredrikstad GK · Range 1", st: "Ferdig" },
    { id: "k2", t: "10:00", end: "11:00", kind: "Privattime", who: "Tobias Lindvik", where: "Studio 1 · TrackMan", st: "Neste", live: true },
    { id: "k3", t: "11:15", end: "12:15", kind: "Privattime", who: "Magnus Aasheim", where: "Studio 1 · TrackMan", st: "Planlagt", live: true },
    { id: "k4", t: "14:30", end: "16:00", kind: "Gruppeøkt", who: "Junior elite", n: 6, where: "Fredrikstad GK · nærspill", st: "Planlagt", live: true },
    { id: "k5", t: "17:00", end: "17:45", kind: "Videoanalyse", who: "Thea Nilsen", where: "Digitalt", st: "Planlagt", live: true },
  ],
  waiting: [
    { id: "w1", who: "Tobias Lindvik", kind: "Video", text: "Ny svingvideo fra range. Er hendene foran nå?", at: "07:52", grp: "WANG Toppidrett" },
    { id: "w2", who: "Thea Nilsen", kind: "Spørsmål", text: "Skal jeg spille klubbmesterskapet eller trene til regionfinalen?", at: "07:10", grp: "Junior elite" },
    { id: "w3", who: "Magnus Aasheim", kind: "Melding", text: "Kan vi flytte timen til 11:30? Bussen er forsinket.", at: "I går 21:40", grp: "WANG Toppidrett" },
    { id: "w4", who: "Ida Berg", kind: "Melding", text: "Takk for i går. Putteøvelsen fungerte.", at: "I går 18:02", grp: "Junior elite" },
    { id: "w5", who: "Oskar Nilsen", kind: "Video", text: "Bunkerslag fra øvingsbunkeren.", at: "I går 16:30", grp: "Junior elite" },
  ],
  tasks: [
    { id: "n1", t: "Send turneringsplan oktober til WANG VG2", due: "24.09", over: true, src: "Tasks" },
    { id: "n2", t: "Oppdater testbatteri høst · Junior elite", due: "25.09", over: true, src: "Prosjekt · Høstsesong 2026" },
    { id: "n3", t: "Ring Hanne Lindvik om samlingen", due: "I dag", over: false, src: "Tasks" },
    { id: "n4", t: "Klipp video fra privattime til Magnus", due: "I dag", over: false, src: "Prosjekt · Videobank" },
  ],
  tasksSrc: "NOTION · TASKS OG PROSJEKTER · SYNKET 08:10",
  tournaments: [
    { id: "t1", who: "Tobias Lindvik", name: "Srixon Tour · runde 6", where: "Larvik GK", days: 7, res: null },
    { id: "t2", who: "Magnus Aasheim", name: "Srixon Tour · runde 6", where: "Larvik GK", days: 7, res: null },
    { id: "t3", who: "Thea Nilsen", name: "Regionfinale junior", where: "Borregaard GK", days: 1, res: null },
    { id: "t4", who: "Ida Berg", name: "Klubbmesterskap", where: "Fredrikstad GK", days: -2, res: "74 (+2) · 2. av 24" },
  ],
  offPlan: [
    { id: "p5", who: "Oskar Nilsen", pct: [58, 52], weeks: 3, grp: "Junior elite" },
    { id: "p6", who: "Jonas Lie", pct: [66, 61], weeks: 2, grp: "Junior elite" },
    { id: "p7", who: "Sara Holm", pct: [69, 64], weeks: 2, grp: "WANG Toppidrett" },
  ],
  offSrc: "ØKTLOGG · UKE 37–38 · UNDER 70 % TO UKER PÅ RAD",
  keys: [["Aktive spillere", "31", "STALLEN · 26.09.2026"], ["Økter gjennomført denne uka", "118 av 142", "ØKTLOGG · UKE 39 · 08:10"], ["Snitt etterlevelse", "83 %", "4 UKER · 26.09.2026"]],
  /* Live coachingøkt (AG-13) */
  live: { player: "Tobias Lindvik", cat: "D", hcp: "8,4", kind: "Privattime · 60 min", where: "Studio 1 · TrackMan", t: "10:00–11:00", consent: true,
    last: "20.09 · Fredrikstad GK · 76 (+4) · SG −2,6 mot Kategori C · ESTIMAT",
    goals: [["Innspill ca. 50 m", "5 av 10 → 7 av 10", "31.10.2026"], ["Kategori C", "75,2 → under 74,0", "31.10.2027"], ["Driver · Club Speed", "101,2 → 105 mph", "01.04.2027"]],
    pos: [["P1.0", "Godkjent"], ["P2.0", "Godkjent"], ["P3.0", "Godkjent"], ["P4.0", "Jobber med"], ["P5.0", "Ikke startet"], ["P6.0", "Jobber med"], ["P7.0", "Jobber med"], ["P8.0", "Ikke startet"], ["P9.0", "Ikke startet"], ["P10.0", "Godkjent"]],
    tasks: [["P7.0", "Hendene foran ballen i treff", "7-jern lav fade · LH 50 %", true], ["P6.0", "Køllen inn fra innsiden", "Driver høy draw · LH 25 %", true], ["P4.0", "Kortere baksving", "Driver stock · Automatikk", false]],
    homework: [["Speilarbeid P7.0", "3 × 10 · uten ball · hver dag", "TEK"], ["7-jern mot mål 140 m", "30 slag · LH 50 % · tirsdag", "SLAG"]],
  },
  /* Øktark etter live (AG-12) */
  after: { summary: "Vi jobbet med P7.0: hendene foran ballen i treff. I 50 % fart satt det i 8 av 10 slag. Face to Path gikk fra −3,1° til −1,4°. Hjemmelekse: speilarbeid hver dag og 30 slag med 7-jern tirsdag. Neste gang tester vi i 75 %.",
    clips: [["Video · P7.0 fra siden", "0:38", "10:24"], ["Bilde · treffpunkt", "—", "10:31"], ["Målbilde · hendene i treff", "—", "10:40"], ["Opptak · lyd", "52:10", "10:02"]],
    tm: { task: "Hendene foran ballen i treff", club: "7-jern", n: 30, date: "26.09.2026", rows: [["Face to Path", "−1,4°", "0 ± 1°"], ["Club Path", "+2,1°", "0 til +2°"], ["Attack Angle", "−3,6°", "−4 til −2°"], ["Dynamic Loft", "22,8°", "—"]] },
  },
};
