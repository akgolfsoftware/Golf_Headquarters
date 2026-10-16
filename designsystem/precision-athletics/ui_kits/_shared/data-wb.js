/* Workbench · fysisk plan og turneringer — oppdiktede data. Coach Anders Kristiansen, spiller Tobias Lindvik (AgencyOS) / Emma Solberg (PlayerHQ). Dagens dato 26.09.2026, uke 39. null = ikke registrert («—»). */
window.WB_DATA = {
  days: ["Man 28.09", "Tir 29.09", "Ons 30.09", "Tor 01.10", "Fre 02.10", "Lør 03.10", "Søn 04.10"],
  fys: {
    blocks: [
      { id: "b1", name: "Styrke · grunnperiode", goal: "Øke maksstyrke underkropp og stabilitet i rotasjon", weeks: [40, 41, 42, 43, 44, 45], deload: 43, test: 45, status: "Publisert", src: "ANDERS KRISTIANSEN · 21.09.2026" },
      { id: "b2", name: "Kraft · overgang", goal: "Overføre styrke til hastighet: club speed og hopp", weeks: [46, 47, 48, 49], deload: null, test: 49, status: "Utkast", src: "CADDIE · UTKAST · 25.09.2026" }
    ],
    weeks: [
      { w: 40, planMin: 150, planTon: 9800, doneMin: null, doneTon: null, tag: null },
      { w: 41, planMin: 165, planTon: 10600, doneMin: null, doneTon: null, tag: null },
      { w: 42, planMin: 175, planTon: 11400, doneMin: null, doneTon: null, tag: null },
      { w: 43, planMin: 110, planTon: 6800, doneMin: null, doneTon: null, tag: "Deload" },
      { w: 44, planMin: 180, planTon: 11900, doneMin: null, doneTon: null, tag: null },
      { w: 45, planMin: 90, planTon: 4200, doneMin: null, doneTon: null, tag: "Testuke" }
    ],
    sessions: [
      { id: "f1", day: 0, t: "07:00", name: "Styrke A · underkropp", kind: "Styrke", min: 60, src: "b1",
        ex: [
          { id: "e1", n: "Knebøy", area: "Underkropp", sets: 4, reps: 6, kg: 70, rir: 2, rest: "2:30", tempo: "3-1-1" },
          { id: "e2", n: "Rumensk markløft", area: "Underkropp", sets: 3, reps: 8, kg: 55, rir: 2, rest: "2:00", tempo: "3-0-1" },
          { id: "e3", n: "Splittknebøy", area: "Underkropp", sets: 3, reps: 8, kg: 20, rir: 3, rest: "1:30", tempo: null },
          { id: "e4", n: "Pallof press", area: "Kjerne", sets: 3, reps: 10, kg: 12, rir: 3, rest: "1:00", tempo: null }
        ] },
      { id: "f2", day: 2, t: "16:30", name: "Kondisjon · sone 2", kind: "Kondisjon", min: 40, src: "b1",
        ex: [{ id: "e5", n: "Sykkel", area: "Kondisjon", dur: 35, zone: "Sone 2 · 130–145 slag/min" }, { id: "e6", n: "Nedtrapping", area: "Kondisjon", dur: 5, zone: "Sone 1" }] },
      { id: "f3", day: 3, t: "07:00", name: "Styrke B · overkropp og rotasjon", kind: "Styrke", min: 55, src: "b1",
        ex: [
          { id: "e7", n: "Benkpress", area: "Overkropp", sets: 4, reps: 6, kg: 50, rir: 2, rest: "2:30", tempo: "2-1-1" },
          { id: "e8", n: "Roing med manual", area: "Overkropp", sets: 3, reps: 10, kg: 22, rir: 2, rest: "1:30", tempo: null },
          { id: "e9", n: "Medisinball rotasjonskast", area: "Kjerne", sets: 4, reps: 5, kg: 4, rir: null, rest: "1:30", tempo: "Eksplosivt" }
        ] },
      { id: "f4", day: 4, t: "20:00", name: "Bevegelighet og skadeforebygging", kind: "Bevegelighet", min: 25, src: "b1",
        ex: [{ id: "e10", n: "Hofteåpner 90/90", area: "Bevegelighet", sets: 2, reps: 8, dur: null }, { id: "e11", n: "Thorakal rotasjon", area: "Bevegelighet", sets: 2, reps: 10, dur: null }, { id: "e12", n: "Skulder ekstern rotasjon med strikk", area: "Skadeforebygging", sets: 2, reps: 15, kg: null }] }
    ],
    last: { name: "Styrke A · underkropp", date: "21.09.2026", src: "ØKTLOGG · TOBIAS LINDVIK",
      rows: [
        { n: "Knebøy", ps: 4, pr: 6, pk: 67.5, ds: 4, dr: 6, dk: 67.5 },
        { n: "Rumensk markløft", ps: 3, pr: 8, pk: 52.5, ds: 3, dr: 7, dk: 52.5 },
        { n: "Splittknebøy", ps: 3, pr: 8, pk: 17.5, ds: 2, dr: 8, dk: 17.5 },
        { n: "Pallof press", ps: 3, pr: 10, pk: 12, ds: null, dr: null, dk: null }
      ], min: [60, 52], rpe: 7, form: 3 }
  },
  turn: {
    types: { Trening: "Treningsturnering", Utvikling: "Utviklingsturnering", Prestasjon: "Prestasjonsturnering" },
    list: [
      { id: "t1", name: "Srixon Tour · runde 6", type: "Prestasjon", date: "03.10–04.10.2026", w: 40, course: "Larvik GK", tee: "Gul · 5 912 m", rounds: 2, src: "GOLFBOX · 20.09.2026", status: "Publisert" },
      { id: "t2", name: "Klubbmesterskap Borregaard", type: "Trening", date: "10.10.2026", w: 41, course: "Borregaard GK", tee: "Gul · 5 804 m", rounds: 1, src: "MANUELL · 24.09.2026", status: "Utkast" },
      { id: "t3", name: "Region Øst · juniortour finale", type: "Utvikling", date: "17.10–18.10.2026", w: 42, course: "Onsøy GK", tee: "Gul · 5 890 m", rounds: 2, src: "GOLFBOX · 25.09.2026", status: "Utkast" },
      { id: "t4", name: "Sesongavslutning Fredrikstad", type: "Trening", date: "31.10.2026", w: 44, course: "Fredrikstad GK", tee: null, rounds: 1, src: "MANUELL · 26.09.2026", status: "Utkast" }
    ],
    conflicts: [
      { kind: "belastning", text: "Tre turneringer på tre uker (uke 40–42) uten hvileuke.", meta: "TURNERINGSPROGRAM · PLANMOTOR" },
      { kind: "kalender", text: "Heldagsprøve i matematikk fre 16.10 — dagen før Region Øst.", meta: "SKOLE · FORELDER · 22.09.2026" }
    ],
    prep: [
      { id: "p1", day: 0, what: "Innspill 50–100 m · lengdekontroll", kind: "Trening", min: 60, pub: true },
      { id: "p2", day: 1, what: "Putting 3–10 fot · Larvik-greener er raske", kind: "Trening", min: 45, pub: true },
      { id: "p3", day: 3, what: "Reise til Larvik · avreise 15:00", kind: "Reise", min: null, pub: true },
      { id: "p4", day: 4, what: "Treningsrunde 18 hull", kind: "Treningsrunde", min: 240, pub: true },
      { id: "p5", day: 4, what: "Utstyr: regntøy, 14 køller, 6 baller, avstandsmåler", kind: "Utstyr", min: null, pub: true },
      { id: "p6", day: 4, what: "Ernæring: middag før 19:00, drikk 2 liter", kind: "Ernæring", min: null, pub: true },
      { id: "p7", day: 4, what: "Søvn: legg deg 22:30", kind: "Søvn", min: null, pub: true },
      { id: "p8", day: 2, what: "Styrke B flyttes til ons (lettere)", kind: "FYS", min: 40, pub: false }
    ],
    rounds: [
      { r: "Runde 1", day: 5, tee: "08:40", start: "Hull 1", note: "Oppvarming 07:40 · range 20 min, putting 15 min" },
      { r: "Runde 2", day: 6, tee: "09:10", start: "Hull 10", note: "Starttid etter resultat R1" }
    ],
    goals: {
      process: ["Samme rutine på hvert slag, 25 sekunder", "Sikte midt på green når flagget er under 5 m fra kanten", "Ingen 3-putter fra under 10 fot"],
      result: "Brutto 150 eller bedre (2 runder)",
      strategy: "Driver bare på hull 1, 5, 9, 14 og 18. Jern 4 fra tee på hull 3 og 12 (vann venstre).",
      src: "ANDERS KRISTIANSEN · 25.09.2026"
    },
    after: {
      name: "Region Øst · runde 5", date: "19.09–20.09.2026", course: "Hvaler GK",
      rounds: [{ r: "Runde 1", gross: 76, par: 72, sg: -0.9, src: "GOLFBOX · 20.09.2026" }, { r: "Runde 2", gross: 73, par: 72, sg: null, src: "MANUELL · ANNEN APP · 21.09.2026" }],
      place: "12 av 48", eval: "God plan på par 5-ene. Tapte slag på innspill fra 100–130 m i runde 1."
    }
  }
};
