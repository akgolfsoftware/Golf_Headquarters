// Extended data for all 29 pages — illustrative numbers only.

window.AKG_DATA = {
  meta: {
    sesong: 2026,
    sisteSync: "for 2 timer siden",
    totalPGASpillere: 1299,
    totalTurneringer: 1175,
    totalNorske: 2497,
    norskeIAksjon: 6,
    kommendeTurneringer: 17,
    totalBaner: 88,
    totalKlubber: 88,
  },

  norske: [
    { initials: "VH", name: "V. Halvorsen",  tour: "PGA Tour",      event: "Memorial Tournament", pos: "T-12", score: "-4", live: true,  flag: "no", slug: "viggo-halvorsen-1997" },
    { initials: "KR", name: "K. Reinertsen", tour: "DP World Tour", event: "Soudal Open",         pos: "T-31", score: "+1", live: true,  flag: "no", slug: "kristoffer-reinertsen-1995" },
    { initials: "KV", name: "K. Vangen",     tour: "Korn Ferry",    event: "Wichita Open",        pos: "T-08", score: "-7", live: true,  flag: "no", slug: "kristoffer-vangen-1994" },
    { initials: "EK", name: "E. Koldal",     tour: "Challenge",     event: "Open de Bretagne",    pos: "MC",   score: "+3", live: false, flag: "no", slug: "espen-koldal-1990" },
    { initials: "SH", name: "S. Halland",    tour: "LET",           event: "Helsingborg Open",    pos: "T-04", score: "-9", live: true,  flag: "no", slug: "selma-halland-2001" },
    { initials: "AM", name: "A. Mæhlum",     tour: "Nordic Golf",   event: "Skive Classic",       pos: "T-19", score: "E",  live: true,  flag: "no", slug: "andreas-mahlum-2003" },
  ],

  pgaKPI: { drive: 297.3, fairway: 61.2, gir: 70.4, putter: 28.9, scoring: 70.85, sgTotal: 0.00 },

  pgaKategorier: [
    { id: "drive",   navn: "Drive Distance",      undertittel: "Snittlengde per drive", enhet: "yds", verdi: 297.3, icon: "Crosshair",
      sparkline: [248, 270, 285, 297, 318, 332],
      topp3: [
        { initials: "RH", name: "R. Holmberg", country: "se", value: 327.8 },
        { initials: "JK", name: "J. Karlén",   country: "se", value: 322.4 },
        { initials: "TB", name: "T. Bekker",   country: "za", value: 320.1 },
      ], featured: true },
    { id: "fairway", navn: "Fairway-treff",       undertittel: "Andel fairways truffet", enhet: "%", verdi: 61.2, icon: "Target",
      topp3: [
        { initials: "AN", name: "A. Nordli",  country: "no", value: 74.6 },
        { initials: "CM", name: "C. Møller",  country: "dk", value: 72.1 },
        { initials: "JS", name: "J. Sørli",   country: "no", value: 71.4 },
      ] },
    { id: "gir",     navn: "Greens in Regulation", undertittel: "Innspill på green",     enhet: "%", verdi: 70.4, icon: "Flag",
      topp3: [
        { initials: "EW", name: "E. Wexler",  country: "us", value: 78.9 },
        { initials: "PL", name: "P. Laaksonen", country: "fi", value: 76.5 },
        { initials: "MO", name: "M. Olafsson", country: "is", value: 75.8 },
      ] },
    { id: "putter",  navn: "Putter per runde",    undertittel: "Lavere er bedre", enhet: "", verdi: 28.9, icon: "Circle",
      topp3: [
        { initials: "RV", name: "R. Vinje",   country: "no", value: 27.4 },
        { initials: "JK", name: "J. Kvale",   country: "no", value: 27.6 },
        { initials: "BH", name: "B. Hansen",  country: "dk", value: 27.8 },
      ] },
    { id: "scoring", navn: "Scoring Average",     undertittel: "Lavere er bedre", enhet: "", verdi: 70.85, icon: "LineChart",
      topp3: [
        { initials: "SD", name: "S. Devlin",  country: "ie", value: 68.92 },
        { initials: "OY", name: "O. Yamagata", country: "jp", value: 69.14 },
        { initials: "HF", name: "H. Friis",   country: "dk", value: 69.31 },
      ] },
  ],

  sgTotal: [
    { initials: "SD", name: "Sean Devlin",     country: "ie", value: 2.34, sgOTT: 0.78, sgAPP: 0.91, sgPUT: 0.41 },
    { initials: "OY", name: "Osamu Yamagata",  country: "jp", value: 2.11, sgOTT: 0.32, sgAPP: 1.04, sgPUT: 0.55 },
    { initials: "HF", name: "Henrik Friis",    country: "dk", value: 1.98, sgOTT: 0.61, sgAPP: 0.72, sgPUT: 0.39 },
    { initials: "JK", name: "Jonas Karlén",    country: "se", value: 1.84, sgOTT: 1.12, sgAPP: 0.41, sgPUT: 0.12 },
    { initials: "VH", name: "Viggo Halvorsen", country: "no", value: 1.62, sgOTT: 0.58, sgAPP: 0.68, sgPUT: 0.21 },
    { initials: "EW", name: "Elliot Wexler",   country: "us", value: 1.45, sgOTT: 0.21, sgAPP: 0.89, sgPUT: 0.28 },
    { initials: "AN", name: "Anders Nordli",   country: "no", value: 1.31, sgOTT: 0.41, sgAPP: 0.54, sgPUT: 0.31 },
    { initials: "MO", name: "Mikael Olafsson", country: "is", value: 1.18, sgOTT: 0.18, sgAPP: 0.66, sgPUT: 0.27 },
    { initials: "CM", name: "Casper Møller",   country: "dk", value: 1.04, sgOTT: 0.44, sgAPP: 0.43, sgPUT: 0.11 },
    { initials: "PL", name: "Pekka Laaksonen", country: "fi", value: 0.92, sgOTT: 0.09, sgAPP: 0.71, sgPUT: 0.08 },
  ],

  puttDistribusjon: [
    { d: "1m",  tour: 99, amateur: 87 },
    { d: "2m",  tour: 87, amateur: 58 },
    { d: "3m",  tour: 48, amateur: 24 },
    { d: "5m",  tour: 28, amateur: 11 },
    { d: "8m",  tour: 15, amateur: 5  },
    { d: "12m", tour: 8,  amateur: 2  },
  ],

  // 03 — fuller drive distance distribution for histogram
  driveHistogram: [
    { range: "240-250", count: 2  },
    { range: "250-260", count: 8  },
    { range: "260-270", count: 21 },
    { range: "270-280", count: 47 },
    { range: "280-290", count: 89 },
    { range: "290-300", count: 117 },
    { range: "300-310", count: 84 },
    { range: "310-320", count: 41 },
    { range: "320-330", count: 18 },
    { range: "330-340", count: 6  },
  ],

  // 04 Putt explorer — full matrix
  puttMatrix: [
    { d: "1m",  pga: 99, top10: 100, hcp0: 98, hcp10: 95, hcp20: 90 },
    { d: "2m",  pga: 94, top10: 97,  hcp0: 85, hcp10: 72, hcp20: 55 },
    { d: "3m",  pga: 82, top10: 90,  hcp0: 60, hcp10: 45, hcp20: 30 },
    { d: "4m",  pga: 68, top10: 76,  hcp0: 42, hcp10: 28, hcp20: 18 },
    { d: "5m",  pga: 51, top10: 62,  hcp0: 30, hcp10: 18, hcp20: 10 },
    { d: "6m",  pga: 42, top10: 53,  hcp0: 22, hcp10: 12, hcp20: 6  },
    { d: "8m",  pga: 29, top10: 39,  hcp0: 12, hcp10: 6,  hcp20: 3  },
    { d: "10m", pga: 23, top10: 31,  hcp0: 8,  hcp10: 4,  hcp20: 2  },
    { d: "15m", pga: 15, top10: 21,  hcp0: 4,  hcp10: 2,  hcp20: 1  },
    { d: "20m", pga: 10, top10: 15,  hcp0: 2,  hcp10: 1,  hcp20: 0  },
  ],

  // 05/06 Norske spillere (sample)
  norskeSpillere: [
    { slug: "viggo-halvorsen-1997",    name: "Viggo Halvorsen",     ar: 28, klubb: "Oslo Golfklubb",       tier: "pro-pga",  besteAr: 67.2, antall: 142, wagr: null,  trend: -2.4 },
    { slug: "kristoffer-vangen-1994",  name: "Kristoffer Vangen",   ar: 31, klubb: "Bærum Golfklubb",      tier: "pro",      besteAr: 69.8, antall: 98,  wagr: 124,   trend: -1.1 },
    { slug: "andreas-mahlum-2003",     name: "Andreas Mæhlum",      ar: 22, klubb: "Kongsberg Golfklubb",  tier: "college",  besteAr: 71.4, antall: 76,  wagr: 387,   trend: -1.8 },
    { slug: "selma-halland-2001",      name: "Selma Halland",       ar: 24, klubb: "Stavanger Golfklubb", tier: "pro",      besteAr: 70.1, antall: 84,  wagr: 412,   trend: 0.4  },
    { slug: "marius-larsen-2009",      name: "Marius Larsen",       ar: 16, klubb: "Bærum Golfklubb",     tier: "junior",   besteAr: 72.8, antall: 28,  wagr: null,  trend: -3.2 },
    { slug: "sofie-naess-2008",        name: "Sofie Næss",          ar: 17, klubb: "Oslo Golfklubb",      tier: "junior",   besteAr: 73.4, antall: 32,  wagr: null,  trend: -4.8 },
    { slug: "petter-hagen-2009",       name: "Petter Hagen",        ar: 16, klubb: "GFGK",                tier: "junior",   besteAr: 74.1, antall: 24,  wagr: null,  trend: -2.1 },
    { slug: "maria-olsen-2008",        name: "Maria Olsen",         ar: 17, klubb: "Bærum Golfklubb",     tier: "junior",   besteAr: 72.4, antall: 28,  wagr: 891,   trend: -3.7 },
    { slug: "anders-halvorsen-2007",   name: "Anders Halvorsen",    ar: 18, klubb: "Oslo Golfklubb",      tier: "amateur",  besteAr: 68.5, antall: 38,  wagr: 234,   trend: -1.9 },
    { slug: "kris-andersen-2006",      name: "Kris Andersen",       ar: 19, klubb: "Bærum Golfklubb",     tier: "amateur",  besteAr: 72.1, antall: 31,  wagr: null,  trend: 0.2  },
    { slug: "fredrik-hovland-2003",    name: "Fredrik Hovland",     ar: 22, klubb: "Bærum Golfklubb",     tier: "amateur",  besteAr: 71.2, antall: 29,  wagr: null,  trend: -0.8 },
    { slug: "petter-hovland-2008",     name: "Petter Hovland",      ar: 17, klubb: "Stavanger Golfklubb",tier: "junior",   besteAr: 73.5, antall: 22,  wagr: null,  trend: -2.6 },
  ],

  // 06 — profile sample (Viggo Halvorsen)
  profil: {
    slug: "viggo-halvorsen-1997",
    navn: "Viggo Halvorsen",
    initials: "VH",
    fodselsAr: 1997,
    alder: 28,
    klubb: "Oslo Golfklubb",
    tier: "Pro PGA",
    proSiden: 2020,
    college: "University of Oklahoma",
    flag: "no",
    totalRunder: 287,
    totalTurneringer: 142,
    besteScore: 63,
    besteAr: 2024,
    sammendrag: "Viggo er en av norsk golfs mest prominente proffer. Med en gjennomsnittsscore på 70.5 i 2024 over 28 PGA Tour-runder, ligger han i topp 15 % av Tour-spillerne. Han forbedret seg dramatisk fra 2022 (72.4) til 2024 (70.5).",
    perAar: [
      { ar: 2018, snitt: 73.2, antall: 14, beste: 67, tourer: "NCAA" },
      { ar: 2019, snitt: 72.4, antall: 22, beste: 65, tourer: "NCAA, WAGR" },
      { ar: 2020, snitt: 71.8, antall: 28, beste: 64, tourer: "Korn Ferry" },
      { ar: 2021, snitt: 71.2, antall: 30, beste: 65, tourer: "Korn Ferry, PGA" },
      { ar: 2022, snitt: 72.4, antall: 24, beste: 67, tourer: "PGA Tour" },
      { ar: 2023, snitt: 71.2, antall: 31, beste: 65, tourer: "PGA Tour" },
      { ar: 2024, snitt: 70.5, antall: 28, beste: 63, tourer: "PGA Tour" },
      { ar: 2025, snitt: 70.8, antall: 29, beste: 64, tourer: "PGA Tour" },
      { ar: 2026, snitt: 71.1, antall: 12, beste: 67, tourer: "PGA Tour" },
    ],
    resultater: [
      { dato: "14. juni 2024",  turnering: "U.S. Open",        sted: "Pinehurst No. 2, NC",  rounds: [69, 68, 72, 70], total: 279, pos: "T-12" },
      { dato: "5. mai 2024",    turnering: "Wells Fargo",      sted: "Quail Hollow, NC",     rounds: [67, 71, 68, 69], total: 275, pos: "T-7"  },
      { dato: "14. april 2024", turnering: "Masters",          sted: "Augusta National",     rounds: [71, 70, 73, 68], total: 282, pos: "T-22" },
      { dato: "11. mars 2024",  turnering: "The Players",      sted: "TPC Sawgrass, FL",     rounds: [68, 70, 69, 72], total: 279, pos: "T-15" },
      { dato: "4. feb 2024",    turnering: "WM Phoenix Open",  sted: "TPC Scottsdale, AZ",   rounds: [66, 70, 68, 67], total: 271, pos: "T-3"  },
    ],
  },

  // 07/08/09 SG-sammenlign
  refSpillere: [
    { dgId: 12345, name: "Rory McIlroy",     country: "ie", sgTotal: 2.34, sgOTT: 0.78, sgAPP: 0.91, sgARG: 0.24, sgPUT: 0.41, year: 2026 },
    { dgId: 14321, name: "Scottie Scheffler",country: "us", sgTotal: 2.45, sgOTT: 0.62, sgAPP: 1.12, sgARG: 0.31, sgPUT: 0.40, year: 2026 },
    { dgId: 11290, name: "Viggo Halvorsen",  country: "no", sgTotal: 1.62, sgOTT: 0.58, sgAPP: 0.68, sgARG: 0.15, sgPUT: 0.21, year: 2026 },
    { dgId: 18901, name: "Jon Rahm",         country: "es", sgTotal: 1.89, sgOTT: 0.51, sgAPP: 0.78, sgARG: 0.22, sgPUT: 0.38, year: 2026 },
    { dgId: 17654, name: "Xander Schauffele",country: "us", sgTotal: 1.92, sgOTT: 0.49, sgAPP: 0.81, sgARG: 0.18, sgPUT: 0.44, year: 2026 },
    { dgId: 19234, name: "Hideki Matsuyama", country: "jp", sgTotal: 1.68, sgOTT: 0.31, sgAPP: 0.94, sgARG: 0.18, sgPUT: 0.25, year: 2026 },
    { dgId: 16789, name: "Collin Morikawa",  country: "us", sgTotal: 1.74, sgOTT: 0.28, sgAPP: 1.08, sgARG: 0.12, sgPUT: 0.26, year: 2026 },
    { dgId: 15432, name: "Tommy Fleetwood",  country: "gb", sgTotal: 1.41, sgOTT: 0.38, sgAPP: 0.72, sgARG: 0.16, sgPUT: 0.15, year: 2026 },
  ],

  // 11 Wrapped data for Anders
  wrapped: {
    navn: "Anders Halvorsen",
    sesong: 2026,
    antallTurneringer: 14,
    totalRunder: 41,
    snittScore: 73.2,
    besteRunde: { score: 65, turnering: "Srixon Tour 5", bane: "Bærum GK", dato: "14. juni" },
    besteTopp10: 3,
    forbedring: -2.4,
    klubberSpilt: ["Bærum GK", "Oslo GK", "GFGK", "Stavanger GK", "Kongsberg GK", "Trondheim GK", "Larvik GK", "Tønsberg GK"],
    streak: 8,
    rankingINasjon: 47,
    rankingIAldersgruppe: 12,
    ligneSpiller: "Kristoffer Vangen i 2018",
  },

  // 12 Ukentlig roundup
  uka: {
    ukenr: 21, aar: 2026, fra: "19. mai", til: "24. mai",
    norskeAntall: 32, turneringerAntall: 11, podium: 3,
    ukensSpiller: {
      navn: "Anders Halvorsen", klubb: "Oslo GK", initials: "AH",
      hvorfor: "Vant Srixon Tour 5 med −9 — to slag foran andreplassen. Hans laveste sluttsum noensinne.",
    },
    ukensRunde: { score: 65, bane: "Bærum GK", spiller: "Maria Olsen", kontekst: "Birdied 6 av siste 9 hull. Speed control var perfekt." },
    resultater: [
      { tour: "PGA Tour",    spiller: "Viggo Halvorsen",  turnering: "Memorial",         pos: "T-12", score: 275, star: false },
      { tour: "Korn Ferry",  spiller: "Kris Vangen",      turnering: "Pinnacle Bank",    pos: "T-34", score: 289, star: false },
      { tour: "Srixon Tour", spiller: "Anders Halvorsen", turnering: "ST 5 (Bærum)",     pos: "1",    score: 207, star: true  },
      { tour: "Srixon Tour", spiller: "Marius Larsen",    turnering: "ST 5 (Bærum)",     pos: "T-3",  score: 211, star: false },
      { tour: "OLYO Øst",    spiller: "Sofie Næss",       turnering: "OT Øst 7 (GFGK)",  pos: "2",    score: 145, star: true  },
      { tour: "LET",         spiller: "Selma Halland",    turnering: "Helsingborg Open", pos: "T-4",  score: 287, star: true  },
    ],
    fakta: "32 norske golfspillere spilte på 11 ulike turneringer denne uka. Det er den mest aktive uka siden Eclectic-finalen i juni 2024.",
    kommende: [
      { dag: "MAN", dato: "26. mai", t: null },
      { dag: "TIR", dato: "27. mai", t: null },
      { dag: "ONS", dato: "28. mai", t: { navn: "OLYO Vest 6",     bane: "Bergen GK",   norske: 12 } },
      { dag: "TOR", dato: "29. mai", t: { navn: "Memorial",        bane: "PGA Tour",     norske: 2  } },
      { dag: "FRE", dato: "30. mai", t: null },
      { dag: "LØR", dato: "31. mai", t: { navn: "Srixon Tour 6",   bane: "Bærum GK",     norske: 47 } },
      { dag: "SØN", dato: "1. juni", t: { navn: "Klubbmesterskap", bane: "Oslo GK",      norske: 18 } },
    ],
  },

  // 13 Banedatabase
  baner: [
    { slug: "baerum-gk",     navn: "Bærum Golfklubb",        kommune: "Bærum",     region: "Øst",  hull: 18, lengde: 6234, slope: 132, cr: 71.5, par: 72, turneringer: 47, oppstart: 1985 },
    { slug: "oslo-gk",       navn: "Oslo Golfklubb",         kommune: "Oslo",      region: "Øst",  hull: 18, lengde: 6112, slope: 128, cr: 71.0, par: 72, turneringer: 42, oppstart: 1924 },
    { slug: "gfgk",          navn: "Gamle Fredrikstad GK",   kommune: "Fredrikstad",region:"Øst",  hull: 18, lengde: 5876, slope: 124, cr: 70.2, par: 72, turneringer: 38, oppstart: 1991 },
    { slug: "stavanger-gk",  navn: "Stavanger Golfklubb",    kommune: "Stavanger", region: "Vest", hull: 18, lengde: 6034, slope: 130, cr: 70.8, par: 72, turneringer: 28, oppstart: 1956 },
    { slug: "kongsberg-gk",  navn: "Kongsberg Golfklubb",    kommune: "Kongsberg", region: "Øst",  hull: 18, lengde: 5912, slope: 126, cr: 70.4, par: 71, turneringer: 21, oppstart: 1990 },
    { slug: "trondheim-gk",  navn: "Trondheim Golfklubb",    kommune: "Trondheim", region: "Midt", hull: 18, lengde: 5984, slope: 127, cr: 70.5, par: 72, turneringer: 19, oppstart: 1950 },
  ],

  // 14 Leaderboards
  norskeBesteSnitt: [
    { spiller: "Anders Halvorsen", snitt: 68.5, antall: 28 },
    { spiller: "Maria Olsen",      snitt: 69.2, antall: 24 },
    { spiller: "Selma Halland",    snitt: 70.1, antall: 26 },
    { spiller: "Kris Vangen",      snitt: 70.4, antall: 22 },
    { spiller: "Andreas Mæhlum",   snitt: 70.7, antall: 19 },
  ],
  norskeForbedring: [
    { spiller: "Sofie Næss",       fjor: 78.2, iaar: 73.4, diff: -4.8 },
    { spiller: "Marius Larsen",    fjor: 76.5, iaar: 72.8, diff: -3.7 },
    { spiller: "Petter Hagen",     fjor: 76.2, iaar: 74.1, diff: -2.1 },
  ],
  norskeMestAktive: [
    { spiller: "Marius Larsen",    antall: 28 },
    { spiller: "Sofie Næss",       antall: 32 },
    { spiller: "Anders Halvorsen", antall: 38 },
  ],

  // 15 Årgang 2009 kohort
  kohort2009: {
    aar: 2009, alder: 17, totalSpillere: 87, totalRunder: 2487, totalTurneringer: 142, collegeCommits: 3,
    topp10: [
      { rank: 1, navn: "Anders Halvorsen",  klubb: "Oslo GK",   snitt: 68.5, antall: 28 },
      { rank: 2, navn: "Maria Olsen",       klubb: "Bærum GK",  snitt: 69.2, antall: 24 },
      { rank: 3, navn: "Marius Larsen",     klubb: "Bærum GK",  snitt: 72.8, antall: 28 },
      { rank: 4, navn: "Petter Hagen",      klubb: "GFGK",      snitt: 74.1, antall: 24 },
      { rank: 5, navn: "Sofie Næss",        klubb: "Oslo GK",   snitt: 73.4, antall: 32 },
    ],
    scoreDist: [
      { bin: "66-68", n: 2  },
      { bin: "68-70", n: 5  },
      { bin: "70-72", n: 12 },
      { bin: "72-74", n: 24 },
      { bin: "74-76", n: 21 },
      { bin: "76-78", n: 14 },
      { bin: "78-80", n: 7  },
      { bin: "80+",   n: 2  },
    ],
    klubbFordeling: [
      { klubb: "Bærum GK",      n: 12 },
      { klubb: "Oslo GK",       n: 11 },
      { klubb: "GFGK",          n: 6  },
      { klubb: "Stavanger GK",  n: 5  },
      { klubb: "Andre",         n: 53 },
    ],
    college: [
      { navn: "Anders Halvorsen", universitet: "University of Denver",  div: "D1" },
      { navn: "Maria Olsen",      universitet: "Stanford University",   div: "D1" },
      { navn: "Petter Hagen",     universitet: "Texas Tech",            div: "D1" },
    ],
  },

  // 16 Min progresjon — SG trend
  minProgresjon: {
    navn: "Anders",
    forsteDato: "14. januar 2026",
    sammenligninger: 8,
    sgTrend: [
      { dato: "14. jan", sg: -3.4 },
      { dato: "28. jan", sg: -3.1 },
      { dato: "11. feb", sg: -2.9 },
      { dato: "25. feb", sg: -2.7 },
      { dato: "11. mar", sg: -2.5 },
      { dato: "8. apr",  sg: -2.4 },
      { dato: "27. apr", sg: -2.3 },
      { dato: "12. mai", sg: -2.1 },
    ],
    perKategori: {
      ott:  { fra: -0.4, til: -0.6, trend: [-0.4, -0.4, -0.5, -0.5, -0.5, -0.6, -0.6, -0.6] },
      app:  { fra: -1.8, til: -1.5, trend: [-1.8, -1.7, -1.7, -1.6, -1.6, -1.5, -1.5, -1.5] },
      arg:  { fra: -0.8, til: -0.6, trend: [-0.8, -0.7, -0.7, -0.7, -0.7, -0.6, -0.6, -0.6] },
      putt: { fra: -0.4, til: -0.3, trend: [-0.4, -0.4, -0.3, -0.3, -0.3, -0.3, -0.3, -0.3] },
    },
    historikk: [
      { dato: "12. mai", ref: "Rory McIlroy",     diff: -4.20, tourScore: 82.4 },
      { dato: "27. apr", ref: "Scottie Scheffler",diff: -5.10, tourScore: 83.1 },
      { dato: "8. apr",  ref: "Viggo Halvorsen",  diff: -3.80, tourScore: 81.6 },
      { dato: "11. mar", ref: "Rory McIlroy",     diff: -4.50, tourScore: 82.7 },
      { dato: "25. feb", ref: "Tommy Fleetwood",  diff: -3.50, tourScore: 81.4 },
    ],
  },

  // 17 Quiz
  quiz: [
    { q: "Hvor stor andel av 3-meters putter synker PGA Tour-snittet?",
      a: ["65%", "82%", "94%", "75%"], correct: 1,
      forklaring: "Faktisk 82% — selv proffer bommer 1 av 5 fra 3 meter. Amatører tror tallet er høyere.", kategori: "PUTT" },
    { q: "Hvor langt driver gjennomsnittlig PGA Tour-spiller?",
      a: ["285 yds", "295 yds", "320 yds", "310 yds"], correct: 1,
      forklaring: "295 yards i snitt. De lengste ligger over 320.", kategori: "OTT" },
    { q: "Hvor mange GIR har PGA Tour-snittet?",
      a: ["62%", "68%", "70%", "74%"], correct: 2,
      forklaring: "70% — flere greens i regulation enn de fleste tror.", kategori: "APP" },
    { q: "Hvor mange putter har en Tour-spiller per runde i snitt?",
      a: ["27.5", "28.9", "30.1", "31.2"], correct: 1,
      forklaring: "28.9 putter per runde. Topp-putters ligger under 28.", kategori: "PUTT" },
    { q: "Hva er PGA Tour-snittscoren per runde?",
      a: ["68.5", "70.8", "72.4", "74.1"], correct: 1,
      forklaring: "70.85 — vektet snitt over alle banetypene.", kategori: "TOTAL" },
    { q: "Hvor mye SG Total har topp 1 på Tour i snitt?",
      a: ["+1.20", "+1.80", "+2.45", "+3.10"], correct: 2,
      forklaring: "+2.45 strokes per runde over snittet — Scottie Scheffler-nivå.", kategori: "TOTAL" },
  ],

  // 18 Blog
  blogPosts: [
    { slug: "norske-juniorer-putt-2026", kategori: "Analyse", tittel: "Hvorfor norske 17-åringer er dårligere på putt",
      undertittel: "En analyse av 14 000 putt-data fra Srixon Tour og Sverige Junior Open",
      forfatter: "Anders Kristiansen", dato: "23. mai 2026", lestid: 6, featured: true },
    { slug: "klubb-produserer-pro",      kategori: "Junior",  tittel: "Hvilken klubb produserer flest pro-spillere?",
      undertittel: "Tre tiår med data viser et tydelig mønster",
      forfatter: "Anders Kristiansen", dato: "15. mai 2026", lestid: 5 },
    { slug: "speed-control-trening",     kategori: "Analyse", tittel: "Bedre svette enn forsøke",
      undertittel: "Hvorfor amatører skal trene speed-control",
      forfatter: "Hege Olsen", dato: "8. mai 2026", lestid: 4 },
    { slug: "norske-college-spillere",   kategori: "Junior",  tittel: "Norske college-spillere: hvem er ute, og hvem kommer hjem?",
      undertittel: "Kart over alle nordmenn på D1- og D2-college i 2026",
      forfatter: "Anders Kristiansen", dato: "1. mai 2026", lestid: 8 },
    { slug: "drive-distance-trend",      kategori: "PGA Tour",tittel: "Drive distance på PGA Tour: en historisk trend",
      undertittel: "Hvordan 30 yds i snitt har endret hvordan baner bygges",
      forfatter: "Tom Knudsen", dato: "20. apr 2026", lestid: 7 },
  ],

  // 19 Portal stats dashboard
  portal: {
    navn: "Anders",
    snittSiste30: 73.2,
    runderSiste30: 8,
    diffForrigeUke: -0.8,
    sisteRunde: { score: 71, bane: "Bærum GK", dato: "12. mai", tilPar: -1 },
    besteIAar: { score: 65, dato: "12. mai", tilPar: -7 },
    sgTotal: -2.1,
    sgPerKategori: { ott: -0.4, app: -1.5, arg: -0.5, putt: -0.3 },
    scoreTrend: [
      { dato: "22. apr", score: 76 },
      { dato: "26. apr", score: 74 },
      { dato: "1. mai",  score: 75 },
      { dato: "4. mai",  score: 73 },
      { dato: "8. mai",  score: 72 },
      { dato: "12. mai", score: 65 },
      { dato: "15. mai", score: 73 },
      { dato: "20. mai", score: 71 },
    ],
    insights: [
      { type: "celebrate", tittel: "Du har forbedret deg 0,9 strokes på 30 dager", tekst: "Bedre enn 78 % av norske spillere på din HCP. Hva endret du?" },
      { type: "warning",   tittel: "Du har ikke logget innspill-data på 14 dager", tekst: "SG: APP er ditt største gap. Logg klubb + avstand for hver innspill." },
      { type: "info",      tittel: "Turnering på lørdag — Srixon Tour 6",          tekst: "Bærum GK · 47 påmeldte · Du er #5 i ranking." },
    ],
    nesteTurnering: { dato: "31. mai", navn: "Srixon Tour 6", bane: "Bærum GK", paameldte: 47, dinRanking: 5 },
    peerSnitt: 75.4, peerRanking: 47, peerTotal: 142,
    abonnement: "trial", dagerIgjenAvProving: 14,
  },

  // 20 Moderering
  modko: {
    statsTurneringer: 4, statsResultater: 5, statsProfilEndringer: 2, statsSlett: 1,
    godkjentDenneUka: 27, avvistDenneUka: 4, snittTid: "1.5 min",
    turneringer: [
      { id: 1, navn: "GFGK Klubbmesterskap", dato: "26. mai", innlegger: "Marius Larsen", flagg: 0, dubletter: ["Gamle Fredrikstad Klubbmesterskap (Srixon)"] },
      { id: 2, navn: "Eclectic Tour 3",       dato: "1. juni", innlegger: "Sofie Næss",    flagg: 3, dubletter: [] },
      { id: 3, navn: "OLYO Vest 7",           dato: "5. juni", innlegger: "Tom Knudsen",   flagg: 0, dubletter: [] },
      { id: 4, navn: "Bærum Junior Open",     dato: "12. juni", innlegger: "Hege Olsen",   flagg: 1, dubletter: [] },
    ],
    slett: { spiller: "Maria Olsen", forespurAv: "Hege Olsen", grunn: "Datteren min vil ikke være offentlig synlig", mottatt: "23. mai 2026", rader: 47 },
  },

  // 21 PGA spillere
  pgaSpillere: [
    { dgId: 14321, navn: "Scottie Scheffler", land: "us", tour: "PGA", runder: 81, sgTotal: 2.45, drive: 298.4, fairway: 62.1, gir: 71.2, putter: 28.4, scoring: 68.4 },
    { dgId: 12345, navn: "Rory McIlroy",      land: "ie", tour: "PGA", runder: 87, sgTotal: 2.34, drive: 318.5, fairway: 58.4, gir: 71.2, putter: 28.4, scoring: 70.2 },
    { dgId: 18901, navn: "Jon Rahm",          land: "es", tour: "PGA", runder: 72, sgTotal: 1.89, drive: 305.2, fairway: 60.8, gir: 70.4, putter: 28.7, scoring: 70.8 },
    { dgId: 17654, navn: "Xander Schauffele", land: "us", tour: "PGA", runder: 78, sgTotal: 1.92, drive: 301.4, fairway: 64.2, gir: 72.1, putter: 28.5, scoring: 69.8 },
    { dgId: 19234, navn: "Hideki Matsuyama",  land: "jp", tour: "PGA", runder: 64, sgTotal: 1.68, drive: 295.1, fairway: 65.4, gir: 70.8, putter: 29.1, scoring: 70.5 },
    { dgId: 16789, navn: "Collin Morikawa",   land: "us", tour: "PGA", runder: 80, sgTotal: 1.74, drive: 291.8, fairway: 68.4, gir: 73.2, putter: 29.2, scoring: 70.4 },
    { dgId: 11290, navn: "Viggo Halvorsen",   land: "no", tour: "PGA", runder: 65, sgTotal: 1.62, drive: 294.8, fairway: 64.1, gir: 70.5, putter: 28.8, scoring: 70.9 },
    { dgId: 15432, navn: "Tommy Fleetwood",   land: "gb", tour: "PGA", runder: 71, sgTotal: 1.41, drive: 298.6, fairway: 61.4, gir: 69.8, putter: 28.9, scoring: 70.8 },
    { dgId: 13456, navn: "Sungjae Im",        land: "kr", tour: "PGA", runder: 84, sgTotal: 1.28, drive: 292.3, fairway: 63.7, gir: 70.2, putter: 29.0, scoring: 70.6 },
    { dgId: 14567, navn: "Patrick Cantlay",   land: "us", tour: "PGA", runder: 68, sgTotal: 1.22, drive: 290.1, fairway: 64.8, gir: 71.4, putter: 28.6, scoring: 70.3 },
  ],

  // 22 Klubber
  klubber: [
    { slug: "oslo-gk",      navn: "Oslo Golfklubb",       kommune: "Oslo",      region: "Øst",  spillere: 112, pro: 3, college: 4, junior: 32, turneringer: 42 },
    { slug: "baerum-gk",    navn: "Bærum Golfklubb",      kommune: "Bærum",     region: "Øst",  spillere: 89,  pro: 1, college: 2, junior: 32, turneringer: 47 },
    { slug: "gfgk",         navn: "Gamle Fredrikstad GK", kommune: "Fredrikstad",region:"Øst",  spillere: 73,  pro: 0, college: 1, junior: 21, turneringer: 38 },
    { slug: "stavanger-gk", navn: "Stavanger Golfklubb",  kommune: "Stavanger", region: "Vest", spillere: 58,  pro: 1, college: 2, junior: 18, turneringer: 28 },
    { slug: "kongsberg-gk", navn: "Kongsberg Golfklubb",  kommune: "Kongsberg", region: "Øst",  spillere: 42,  pro: 0, college: 0, junior: 14, turneringer: 21 },
    { slug: "trondheim-gk", navn: "Trondheim Golfklubb",  kommune: "Trondheim", region: "Midt", spillere: 39,  pro: 0, college: 1, junior: 11, turneringer: 19 },
  ],

  // 23 Tour deep-dive (Srixon)
  srixon: {
    navn: "Srixon Tour", klasse: "Junior-tour · Norge", startAar: 2018,
    totalTurneringer: 71, totalDeltakere: 6117, uniqueSpillere: 698,
    sesonger: ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"],
    aktivSesong: "2026",
    sesongTurneringer: [
      { dato: "15. juni", navn: "Srixon Tour 1", klubb: "Bærum GK",  deltakere: 88, vinner: "Anders Halvorsen", score: -6, major: false },
      { dato: "29. juni", navn: "Srixon Tour 2", klubb: "Oslo GK",   deltakere: 92, vinner: "Marius Larsen",    score: -4, major: false },
      { dato: "13. juli", navn: "Srixon Tour 3", klubb: "GFGK",      deltakere: 84, vinner: "Petter Hagen",     score: -3, major: true  },
      { dato: "27. juli", navn: "Srixon Tour 4", klubb: "Stavanger", deltakere: 76, vinner: "Maria Olsen",      score: -5, major: false },
      { dato: "24. mai",  navn: "Srixon Tour 5", klubb: "Bærum GK",  deltakere: 88, vinner: "Anders Halvorsen", score: -9, major: false },
    ],
    alltime: [
      { rank: 1, navn: "Viktor Hovland",    karriere: "2017-2019", turneringer: 12, seire: 4, snitt: -2.4 },
      { rank: 2, navn: "Andreas Halvorsen", karriere: "2018-2020", turneringer: 18, seire: 3, snitt:  1.2 },
      { rank: 3, navn: "Anders Halvorsen",  karriere: "2023-2026", turneringer: 14, seire: 2, snitt: -0.8 },
    ],
    klubber: [
      { klubb: "Bærum GK",       n: 12 },
      { klubb: "Oslo GK",        n: 11 },
      { klubb: "GFGK",           n: 7  },
      { klubb: "Stavanger GK",   n: 5  },
      { klubb: "Kongsberg GK",   n: 4  },
    ],
  },

  // 25 Regions
  regioner: [
    { slug: "ost",  navn: "Øst-Norge",  klubber: 32, spillere: 687, pro: 8, college: 12, color: "#005840" },
    { slug: "vest", navn: "Vest-Norge", klubber: 24, spillere: 412, pro: 2, college: 5,  color: "#2A6FDB" },
    { slug: "midt", navn: "Midt-Norge", klubber: 14, spillere: 198, pro: 1, college: 3,  color: "#8B5CF6" },
    { slug: "sor",  navn: "Sør-Norge",  klubber: 12, spillere: 134, pro: 1, college: 1,  color: "#F59E0B" },
    { slug: "nord", navn: "Nord-Norge", klubber: 6,  spillere: 67,  pro: 0, college: 1,  color: "#EF4444" },
  ],

  // 28 Turneringsdetalj (Memorial 2026)
  turnering: {
    navn: "The Memorial Tournament", tour: "PGA Tour",
    datoer: "5–8. juni 2026", bane: "Muirfield Village GC", sted: "Dublin, Ohio · USA",
    purse: "$20M", status: "in_progress",
    deltakere: 142, norskeAntall: 2,
    norske: [
      { navn: "Viggo Halvorsen",  r1: 69, til_par: -3, pos: "T-5" },
      { navn: "Kris Reinertsen",  r1: 73, til_par: 1,  pos: "T-34" },
    ],
    leaderboard: [
      { pos: "1",   navn: "Scottie Scheffler",  land: "us", r: [68, 67, 66, 69], total: 270, parTotal: -18 },
      { pos: "T-2", navn: "Rory McIlroy",       land: "ie", r: [69, 66, 68, 69], total: 272, parTotal: -16 },
      { pos: "T-2", navn: "Hideki Matsuyama",   land: "jp", r: [70, 65, 69, 68], total: 272, parTotal: -16 },
      { pos: "T-5", navn: "Viggo Halvorsen",    land: "no", r: [69, 72, 70, 67], total: 278, parTotal: -10, norsk: true },
      { pos: "T-5", navn: "Xander Schauffele",  land: "us", r: [68, 70, 68, 72], total: 278, parTotal: -10 },
      { pos: "T-8", navn: "Tommy Fleetwood",    land: "gb", r: [71, 68, 70, 70], total: 279, parTotal: -9  },
      { pos: "T-12",navn: "Jon Rahm",           land: "es", r: [70, 71, 71, 70], total: 282, parTotal: -6  },
    ],
    tidligereVinnere: [
      { aar: 2025, navn: "Scottie Scheffler",  score: -17 },
      { aar: 2024, navn: "Patrick Cantlay",    score: -18 },
      { aar: 2023, navn: "Jon Rahm",           score: -16 },
    ],
  },

  // 29 Admin overview
  admin: {
    besok30d: 4287, besokEndring: 12,
    signups: 87, signupsEndring: 23,
    playerHQConv: 8, playerHQConvPct: 9.2, playerHQConvEndring: 3,
    revenue: 2400, revenueEndring: 18,
    trafikk: { google: 62, direkte: 21, sosial: 11, referer: 6 },
    topSider: [
      { url: "/stats/pga/drive-distance", besok: 823, snittTid: "2:34", konv: 12 },
      { url: "/stats/sg-sammenlign",      besok: 567, snittTid: "3:12", konv: 42 },
      { url: "/turneringer",              besok: 489, snittTid: "1:18", konv: 3 },
      { url: "/stats/spillere",           besok: 287, snittTid: "4:01", konv: 18 },
      { url: "/stats/pga",                besok: 234, snittTid: "2:14", konv: 8 },
    ],
    sync: [
      { navn: "DataGolf skill-ratings", status: "ok",      tid: "Mandag 06:00", detalj: "1 299 spillere" },
      { navn: "PGA putt-distance",      status: "ok",      tid: "Mandag 07:00", detalj: "10 bøtter" },
      { navn: "PGA approach",           status: "ok",      tid: "Mandag 07:30", detalj: "8 bøtter" },
      { navn: "Norske turneringer",     status: "warning", tid: "Manuell",      detalj: "Sist 25. mai" },
      { navn: "Plausible-import",       status: "error",   tid: "Feilet 06:32", detalj: "HTTP 500" },
    ],
    feil: [
      { tid: "13:42", agent: "pga-approach",   melding: "Timeout fra DataGolf API",  type: "warning" },
      { tid: "11:20", agent: "notion-sync",    melding: "Rate limit hit",            type: "warning" },
      { tid: "07:30", agent: "plausible-import", melding: "HTTP 500",                  type: "error" },
    ],
  },

  trenerSteg: [
    { n: "01", tittel: "Mål svakhet",     tekst: "SG-profilen viser nøyaktig hvor strokene tapes \u2014 fra teen, innspillet eller på greenen.", icon: "Crosshair" },
    { n: "02", tittel: "Bygg drillen",     tekst: "Coach lager treningsplan målrettet svakheten. Korte økter, ukentlig fokus.", icon: "Wrench" },
    { n: "03", tittel: "Følg utvikling",   tekst: "SG-trenden viser om treningen virker. Tall, ikke synsing.", icon: "Activity" },
  ],

  playerHQFordeler: [
    "SG-beregning automatisk fra hvert kort",
    "Trenden over hele sesongen, ikke bare siste runde",
    "Sammenlign mot PGA Tour-snitt fra første scorekort",
    "Treningsdagbok med drill-bibliotek",
    "Del med coach \u2014 én lenke, full innsikt",
    "Eksporter rådata når du vil. Det er dine tall.",
  ],
};
