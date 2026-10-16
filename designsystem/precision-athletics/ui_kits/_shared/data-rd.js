/* Runde-registrering for Strokes Gained — oppdiktede data. Spiller Emma Solberg, coach Anders Kristiansen. 26.09.2026. null = ikke logget («—»). Avstand i meter, putt i fot. */
window.RD_DATA = {
  course: { id: "c1", name: "Fredrikstad GK", tee: "Gul · 5 804 m", par: 72,
    holes: [[4, 342], [5, 468], [3, 152], [4, 371], [4, 318], [5, 452], [3, 138], [4, 356], [4, 331], [4, 347], [3, 164], [4, 322], [5, 481], [4, 339], [4, 364], [3, 146], [4, 318], [5, 445]] },
  levels: [
    { id: "rask", t: "Rask score", s: "Total eller score per hull. Putter, fairway og GIR valgfritt.", gives: ["Brutto score og til par", "Putter, FW og GIR hvis logget"], not: "Ingen beregnet SG", q: "Scorekortnivå", icon: "list-ordered" },
    { id: "import", t: "Import eller manuell SG", s: "Lim inn eller last opp fra UpGame eller annen app, eller skriv inn SG.", gives: ["SG totalt og OTT/APP/ARG/PUTT", "Kilde og dato på hvert tall"], not: "SG er ikke beregnet av AK Golf", q: "Manuell / importert SG", icon: "upload" },
    { id: "slag", t: "Slag-for-slag", s: "Hvor ballen landet og hvor langt det er igjen, slag for slag.", gives: ["Beregnet SG per slag, hull og kategori", "Hullanalyse, dispersjon og putting i fot"], not: null, q: "Komplett slag-for-slag", icon: "route" }
  ],
  lies: [["TEE", "Tee"], ["FAIRWAY", "Fairway"], ["SEMI_ROUGH", "Semi"], ["ROUGH", "Rough"], ["DEEP_ROUGH", "Dyp rough"], ["BUNKER", "Bunker"], ["GREEN", "Green"], ["TREES", "Trær"]],
  endCats: [["IN_PLAY", "I spill"], ["MINOR_MISS", "Liten miss"], ["MAJOR_MISS", "Stor miss"], ["GREEN_HIT", "Green truffet"], ["LETT", "Lett"], ["MIDDELS", "Middels"], ["VANSKELIG", "Vanskelig"], ["PENALTY_1", "Straff 1"], ["PENALTY_2", "Straff 2"]],
  wind: ["Stille", "Medvind", "Motvind", "Venstre", "Høyre"],
  putt: { brk: ["Venstre–høyre", "Høyre–venstre", "Oppover", "Nedover"], slope: ["Svak", "Moderat", "Kraftig"], line: ["Venstre", "På linje", "Høyre"], speed: ["Holet", "Forbi", "Kort", "Sone forbi", "Sone kort"] },
  live: { hole: 5, scores: [4, 6, 3, 5, null, null, null, null, null, null, null, null, null, null, null, null, null, null], slagHoles: [1, 2, 3, 4], saved: "LAGRET PÅ TELEFONEN 10:42",
    chain: [
      { n: 1, lie: "TEE", dist: 318, club: "Driver", res: { lie: "FAIRWAY", dist: 96 }, cat: "IN_PLAY", pen: false, sg: 0.12 },
      { n: 2, lie: "FAIRWAY", dist: 96, club: "Pitching Wedge", res: { lie: "GREEN", dist: 5.2 }, cat: "GREEN_HIT", pen: false, sg: 0.08 }
    ] },
  sgSoFar: { holes: 4, of: 18, cats: [["OTT", "Utslag", 0.3], ["APP", "Innspill", -0.6], ["ARG", "Nærspill", 0.1], ["PUTT", "Putting", -0.4]], total: -0.6, src: "BEREGNET FRA 17 SLAG · ESTIMAT · SERVER ER FASIT VED LAGRING" },
  sgFields: {
    main: [["sgTotal", "SG totalt"], ["sgOtt", "SG OTT · utslag"], ["sgApp", "SG APP · innspill"], ["sgArg", "SG ARG · nærspill"], ["sgPutt", "SG PUTT · putting"]],
    detail: [["Tee", [["sgTee", "Alle tee-slag"]]], ["Innspill", [["sgApp75", "≤ 75 m"], ["sgApp125", "> 75–125 m"], ["sgApp175", "> 125–175 m"], ["sgApp175p", "> 175 m"]]], ["Nærspill", [["sgChip", "Chip ≤ 12 m"], ["sgPitch", "Pitch"], ["sgLob", "Lob"], ["sgBunker", "Bunker"]]], ["Putting", [["sgP3", "≤ 3 ft"], ["sgP5", "> 3–5 ft"], ["sgP10", "> 5–10 ft"], ["sgP25", "> 10–25 ft"], ["sgP40", "> 25–40 ft"], ["sgP40p", "> 40 ft"]]]]
  },
  importCols: [["Hole", "Hullnr", true, true], ["Par", "Par", true, true], ["Score", "Score", true, true], ["FIR", "Fairway", false, true], ["GIR", "GIR", false, true], ["Putts", "Putter", false, true], ["First Putt Distance", "Første putt (ft)", false, true], ["Penalties", "Straff", false, true], ["Bunker", "Bunker", false, false], ["Sand Save", "Sand save", false, false], ["Scrambling", "Scrambling", false, true], ["Drive Distance", "Kjørelengde (m)", false, true], ["Target Distance", "Sikteavstand", false, false], ["Pin Distance", "Flaggavstand", false, false]],
  summary: { gross: 76, par: 72, putts: 32, fw: [9, 14], gir: [8, 18], pen: 1, sg: { total: -1.1, cats: [["OTT", 0.4], ["APP", -0.8], ["ARG", -0.3], ["PUTT", -0.4]] }, src: "BEREGNET · SLAG-FOR-SLAG · 20.09.2026", q: "Komplett slag-for-slag",
    holeSg: [0.2, -0.4, 0.1, -0.6, -0.1, 0.3, -0.2, 0.0, -0.3, 0.1, -0.5, 0.2, 0.4, -0.2, -0.1, 0.1, -0.3, 0.2] },
  revisions: [
    { t: "20.09.2026 16:42", what: "Runde lagret · slag-for-slag komplett", src: "LIVE FØRING", sg: "Beregnet" },
    { t: "21.09.2026 09:10", what: "SG PUTT endret manuelt fra −0,4 til −0,2", src: "MANUELL · EMMA SOLBERG", sg: "Manuell" },
    { t: "21.09.2026 09:12", what: "Manuell SG beskyttet · beregning overskriver ikke", src: "SYSTEM", sg: "Låst" }
  ],
  coach: {
    rounds: [
      { id: "r1", player: "Emma Solberg", date: "20.09.2026", course: "Fredrikstad GK", kind: "Turnering", gross: 76, par: 72, q: "slag", src: "Live føring", sg: -1.1 },
      { id: "r2", player: "Tobias Lindvik", date: "20.09.2026", course: "Hvaler GK", kind: "Turnering", gross: 73, par: 72, q: "import", src: "UpGame CSV", sg: -0.2 },
      { id: "r3", player: "Sara Holm", date: "19.09.2026", course: "Borregaard GK", kind: "Trening", gross: 81, par: 71, q: "rask", src: "Etterregistrering", sg: null },
      { id: "r4", player: "Magnus Aasheim", date: "18.09.2026", course: "Onsøy GK", kind: "Trening", gross: 70, par: 72, q: "delvis", src: "Live føring", sg: null, cov: "11 av 18 hull" },
      { id: "r5", player: "Ingrid Berg", date: "17.09.2026", course: "Fredrikstad GK", kind: "Trening", gross: 79, par: 72, q: "manuell", src: "Annen app", sg: -1.6 },
      { id: "r6", player: "Tobias Lindvik", date: "13.09.2026", course: "Borregaard GK", kind: "Turnering", gross: 74, par: 71, q: "slag", src: "Live føring", sg: -0.9 }
    ],
    gaps: [
      { id: "g1", player: "Sara Holm", round: "19.09 · Borregaard GK", why: "Bare score per hull. Det mangler hvor ballen landet og hvor langt det var igjen.", need: "Slag-for-slag eller SG fra annen app" },
      { id: "g2", player: "Magnus Aasheim", round: "18.09 · Onsøy GK", why: "Slag er ført på 11 av 18 hull. Hull 12–18 har bare score.", need: "Slag på hull 12–18" },
      { id: "g3", player: "Henrik Dahl", round: "12.09 · Hvaler GK", why: "Kjeden brytes på hull 7: slag 3 starter i bunker, men slag 2 landet på fairway.", need: "Rett slag 2 eller 3 på hull 7" }
    ]
  }
};
