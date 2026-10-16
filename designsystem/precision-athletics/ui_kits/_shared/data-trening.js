/* Treningsanalyse — oppdiktede data. Spiller Emma Solberg (PlayerHQ), stall og grupper for Anders Kristiansen (AgencyOS). Dagens dato 26.09.2026, uke 39. null = ikke målt («—»). */
window.TR_DATA = {
  today: "26.09.2026",
  weeks: ["U32", "U33", "U34", "U35", "U36", "U37", "U38", "U39"],
  load: [
    { label: "U32", parts: { fys: 90, tek: 120, slag: 180, spill: 60, turn: 0 }, plan: 480, rpe: 5.8, form: 3.9 },
    { label: "U33", parts: { fys: 100, tek: 110, slag: 200, spill: 90, turn: 0 }, plan: 480, rpe: 6.1, form: 3.8 },
    { label: "U34", parts: { fys: 60, tek: 90, slag: 150, spill: 60, turn: 240 }, plan: 540, rpe: 6.9, form: 3.4 },
    { label: "U35", parts: { fys: 90, tek: 130, slag: 190, spill: 60, turn: 0 }, plan: 480, rpe: 6.0, form: 3.9 },
    { label: "U36", parts: null, plan: 480, rpe: null, form: null },
    { label: "U37", parts: { fys: 100, tek: 140, slag: 210, spill: 90, turn: 0 }, plan: 500, rpe: 6.4, form: 3.6 },
    { label: "U38", parts: { fys: 110, tek: 150, slag: 240, spill: 120, turn: 0 }, plan: 500, rpe: 7.2, form: 3.1 },
    { label: "U39", parts: { fys: 60, tek: 120, slag: 142, spill: 0, turn: 0 }, plan: 500, rpe: 6.6, form: 3.4 }
  ],
  acwr: { value: 1.34, band: [0.8, 1.3], src: "ØKTLOGG · 26.09.2026", n: 31 },
  quality: [
    { label: "U36", planned: 6, done: null, skipped: null, aborted: null },
    { label: "U37", planned: 6, done: 5, skipped: 1, aborted: 0 },
    { label: "U38", planned: 7, done: 6, skipped: 0, aborted: 1 },
    { label: "U39", planned: 6, done: 3, skipped: 1, aborted: 0 }
  ],
  sessions: [
    { id: "s1", date: "26.09", title: "Innspill 50–100 m", axis: "slag", plan: 75, actual: 72, status: "Gjennomført", rpe: 6, form: 4, note: null },
    { id: "s2", date: "25.09", title: "Styrke underkropp", axis: "fys", plan: 60, actual: null, status: "Hoppet over", rpe: null, form: 2, note: "Vondt i korsryggen" },
    { id: "s3", date: "24.09", title: "TrackMan · jern 7", axis: "tek", plan: 60, actual: 64, status: "Gjennomført", rpe: 5, form: 4, note: null },
    { id: "s4", date: "23.09", title: "Putting 3–10 fot", axis: "slag", plan: 45, actual: 45, status: "Gjennomført", rpe: 4, form: 3, note: null },
    { id: "s5", date: "21.09", title: "Banespill 9 hull", axis: "spill", plan: 120, actual: 70, status: "Avbrutt", rpe: 7, form: 3, note: "Tordenvær" }
  ],
  tm: {
    src: "TRACKMAN · BAY 3", date: "24.09.2026",
    clubs: [
      { club: "Driver", carry: [228, 231, 229, null, 233, 230, 234, 232], side: 11.8, n: 142, target: 235 },
      { club: "7 Iron", carry: [148, 150, 149, 151, null, 152, 150, 153], side: 6.1, n: 212, target: 150 },
      { club: "Pitching Wedge", carry: [108, 110, 107, 109, 111, null, 110, 112], side: 4.4, n: 96, target: 110 },
      { club: "56°", carry: [null, null, 78, 80, 79, 81, null, 82], side: 3.9, n: 48, target: 80 }
    ],
    disp: [[-6, 3], [4, -2], [9, 5], [-2, -6], [12, 2], [-11, -3], [3, 8], [7, -4], [-4, 1], [1, -1], [14, -7], [-8, 6], [5, 4], [-1, -3], [10, 1]],
    gaps: [["Driver", 232], ["3 Wood", 214], ["4 Hybrid", 196], ["5 Iron", 172], ["6 Iron", 161], ["7 Iron", 153], ["8 Iron", 141], ["9 Iron", 129], ["Pitching Wedge", 112], ["50°", 96], ["56°", 82]],
    missing: ["Club speed mangler i 3 av 16 økter", "Spin axis ikke registrert før U35"]
  },
  putt: {
    src: "ØKTLOGG + RUNDER", date: "23.09.2026",
    zones: [["0–3 ft", 96, 88, 94], ["3–5 ft", 71, 64, 78], ["5–10 ft", 38, 52, 50], ["10–25 ft", 14, 40, 18], ["25–40 ft", 5, 18, 6], ["40+ ft", 2, 12, 3]],
    threePutt: [2, 1, 3, 2, null, 1, 3, 2],
    wedges: [["30 m", 62, 20, "±3 m"], ["50 m", 48, 24, "±4 m"], ["70 m", 41, 22, "±5 m"], ["90 m", null, 0, "±6 m"]]
  },
  tests: [
    { id: "t1", name: "Putting 9 hull", last: 16, unit: "putter", trend: [19, 18, 18, 17, 16], date: "19.09.2026", valid: true, next: "17.10.2026", better: "low" },
    { id: "t2", name: "Innspill 100 m · 10 slag", last: 7.8, unit: "m snitt", trend: [9.4, 9.0, 8.6, 8.1, 7.8], date: "12.09.2026", valid: true, next: "10.10.2026", better: "low" },
    { id: "t3", name: "Club speed Driver", last: 101, unit: "mph", trend: [97, 98, 99, 101], date: "05.09.2026", valid: false, why: "Målt uten kalibrert TrackMan", next: "03.10.2026", better: "high" },
    { id: "t4", name: "Nærspill 20 m · 10 slag", last: null, unit: "m snitt", trend: [], date: null, valid: null, next: "29.09.2026", better: "low" }
  ],
  sources: [
    { kind: "trackman", name: "TrackMan", last: "24.09.2026", n: 16, unit: "økter", level: "god", missing: "Club speed mangler i 3 økter" },
    { kind: "golfbox", name: "GolfBox", last: "20.09.2026", n: 7, unit: "tellende runder", level: "god" },
    { kind: "annen_app", name: "Manuell · annen app", last: "21.09.2026", n: 3, unit: "runder med SG", level: "manuell" },
    { kind: "okt", name: "Øktlogg", last: "26.09.2026", n: 31, unit: "økter", level: "tynn", missing: "U36 ikke registrert" },
    { kind: "test", name: "Tester", last: "19.09.2026", n: 4, unit: "tester", level: "tynn", missing: "Nærspill 20 m aldri tatt" },
    { kind: "manuell", name: "Dagsform og RPE", last: "26.09.2026", n: 24, unit: "registreringer", level: "god" }
  ],
  coach: {
    players: [
      { id: "p1", name: "Tobias Lindvik", grp: "Talent U16", acwr: 1.42, trend: -0.6, done: 71, data: "god", last: "26.09", flag: "belastning", why: "Belastning 1,42 · tre økter på rad over plan" },
      { id: "p2", name: "Emma Solberg", grp: "Elite", acwr: 1.34, trend: -0.3, done: 83, data: "tynn", last: "26.09", flag: "trend", why: "APP −0,8 · fallende tre uker" },
      { id: "p3", name: "Jonas Berg", grp: "Talent U16", acwr: 0.71, trend: 0.2, done: 48, data: "tynn", last: "18.09", flag: "gjennomforing", why: "4 av 9 økter gjennomført siste to uker" },
      { id: "p4", name: "Sara Nilsen", grp: "Elite", acwr: 1.02, trend: 0.4, done: 92, data: "god", last: "25.09", flag: null, why: null },
      { id: "p5", name: "Henrik Dahl", grp: "Talent U18", acwr: null, trend: null, done: null, data: "mangler", last: "02.09", flag: "datamangel", why: "Ingen registrering på 24 dager" },
      { id: "p6", name: "Ingrid Aas", grp: "Talent U18", acwr: 1.11, trend: 0.1, done: 88, data: "god", last: "26.09", flag: null, why: null }
    ],
    groups: [
      { id: "g1", name: "Elite", n: 6, cover: 83, acwr: 1.18, done: 86, level: "A–C", note: "Innspill er svakeste akse i gruppen" },
      { id: "g2", name: "Talent U18", n: 8, cover: 62, acwr: 1.04, done: 74, level: "C–E", note: "Tre spillere mangler TrackMan-grunnlag" },
      { id: "g3", name: "Talent U16", n: 11, cover: 71, acwr: 1.21, done: 69, level: "D–G", note: "Gjennomføring faller i skoleuker" }
    ],
    pvf: [
      { axis: "fys", plan: 110, actual: 90 }, { axis: "tek", plan: 140, actual: 150 }, { axis: "slag", plan: 180, actual: 240 }, { axis: "spill", plan: 70, actual: 120 }, { axis: "turn", plan: 480, actual: 0, note: "Srixon Tour 03.10–04.10 · 2 runder planlagt" }
    ],
    imports: [
      { id: "i1", src: "TrackMan", what: "Økt 24.09 · Tobias Lindvik · 96 slag", status: "Importert", date: "24.09.2026 16:52" },
      { id: "i2", src: "GolfBox", what: "Runde 20.09 · Emma Solberg", status: "Importert", date: "21.09.2026 06:00" },
      { id: "i3", src: "Manuell · annen app", what: "Runde 21.09 · Jonas Berg · SG", status: "Til kontroll", date: "21.09.2026 20:14" },
      { id: "i4", src: "TrackMan", what: "Økt 22.09 · Henrik Dahl", status: "Feilet", date: "22.09.2026 18:03", err: "TRACKMAN 401 · TOKEN UTLØPT" },
      { id: "i5", src: "GolfBox", what: "Runde 13.09 · Sara Nilsen", status: "Mulig dublett", date: "14.09.2026 06:00" }
    ],
    actions: [
      { id: "a1", player: "Tobias Lindvik", from: "Belastning 1,42", draft: "Bytt torsdagens banespill (120 min) til putting 45 min og hvile.", status: "Utkast", by: "Caddie" },
      { id: "a2", player: "Emma Solberg", from: "APP −0,8 over 10 runder", draft: "Legg inn to innspillsøkter 50–100 m i uke 40, 60 min hver.", status: "Utkast", by: "Caddie" },
      { id: "a4", player: "Tobias Lindvik", from: "Belastning 1,42 før Srixon Tour", draft: "Legg deload-uke i fysisk plan (uke 40) og flytt Styrke B til onsdag før turneringen.", status: "Utkast", by: "Caddie", target: "AG-WB-FYS" },
      { id: "a5", player: "Tobias Lindvik", from: "Evaluering Region Øst: innspill 100–130 m", draft: "Legg to innspillsøkter 100–130 m i forberedelsen til Srixon Tour.", status: "Utkast", by: "Anders Kristiansen", target: "AG-WB-TURN" },
      { id: "a3", player: "Talent U16", from: "Gjennomføring 69 %", draft: "Flytt tirsdagsøkta til onsdag i skoleuker.", status: "Publisert", by: "Anders Kristiansen" }
    ],
    caddie: [
      { id: "c1", title: "Senk volum for Tobias Lindvik i uke 40", why: "Belastning 1,42 i to uker. Dagsform 3,1 av 5.", src: "ØKTLOGG · 31 ØKTER · 26.09.2026", effect: "Ukevolum fra 540 til 420 min. Tobias får varsel når du publiserer." },
      { id: "c2", title: "Be Henrik Dahl registrere økter", why: "Ingen registrering på 24 dager. Kan være skade eller glemt.", src: "ØKTLOGG · 02.09.2026", effect: "Sender melding til Henrik og forelder. Ingen planendring." },
      { id: "c3", title: "Slå sammen dublett for Sara Nilsen 13.09", why: "Samme runde fra GolfBox og manuell registrering.", src: "GOLFBOX + MANUELL · 14.09.2026", effect: "Beholder GolfBox-runden. Manuell SG flyttes over." }
    ]
  }
};
