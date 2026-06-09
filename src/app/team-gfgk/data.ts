// Auto-generert snapshot fra Claude Design-handover (data.js). Statisk turneringsdata for foreldremøte-presentasjonen.
// Ikke rediger manuelt — regenereres fra design-kilden.

export interface PlayerSummary {
  name: string;
  club: string;
  birthYear: string;
  rang: number;
  tournaments: number;
  rounds: number;
  avg18: number;
  avgToPar: number;
  vsField: number;
  best: number;
  worst: number;
}

export interface TournamentResult {
  tour: string;
  name: string;
  course: string;
  date: string;
  klasse: string;
  holes: number;
  rounds: number[];
  brutto: number;
  toPar: number;
  par: number;
  fieldAvg: number | null;
  fieldN: number | null;
  vsField: number | null;
  diffVal: number;
  diffRank: number | null;
  diffLevel: string;
}

export interface CourseRank {
  name: string;
  rank: number;
  val: number;
  rounds: number;
}

export interface GfgkData {
  meta: { maxRank: number; seasonStart: string; seasonEnd: string };
  summary: Record<string, PlayerSummary>;
  players: Record<string, TournamentResult[]>;
  courses: CourseRank[];
}

export const GFGK_DATA: GfgkData = {
  "meta": {
    "maxRank": 71,
    "seasonStart": "2025-04-26",
    "seasonEnd": "2026-06-06"
  },
  "summary": {
    "Max Risvåg": {
      "name": "Max Risvåg",
      "club": "Gamle Fredrikstad Golfklubb",
      "birthYear": "2008",
      "rang": 1,
      "tournaments": 21,
      "rounds": 38,
      "avg18": 74,
      "avgToPar": 2.9,
      "vsField": -5.2,
      "best": 65,
      "worst": 81
    },
    "Sebastian Henriksen": {
      "name": "Sebastian Henriksen",
      "club": "Gamle Fredrikstad Golfklubb",
      "birthYear": "2007",
      "rang": 2,
      "tournaments": 27,
      "rounds": 43,
      "avg18": 74.3,
      "avgToPar": 3.4,
      "vsField": -5.7,
      "best": 67,
      "worst": 81
    },
    "Fredrik Kjølberg Hovland": {
      "name": "Fredrik Kjølberg Hovland",
      "club": "Gamle Fredrikstad Golfklubb",
      "birthYear": "2010",
      "rang": 3,
      "tournaments": 17,
      "rounds": 21,
      "avg18": 77.8,
      "avgToPar": 7.1,
      "vsField": -7,
      "best": 69,
      "worst": 90
    },
    "Viktoria Hammer": {
      "name": "Viktoria Hammer",
      "club": "Mørk Golfklubb",
      "birthYear": "2008",
      "rang": 4,
      "tournaments": 28,
      "rounds": 56,
      "avg18": 79.4,
      "avgToPar": 8.1,
      "vsField": -3.4,
      "best": 70,
      "worst": 97
    },
    "Anders Rafshol": {
      "name": "Anders Rafshol",
      "club": "Gamle Fredrikstad Golfklubb",
      "birthYear": "2009",
      "rang": 5,
      "tournaments": 20,
      "rounds": 23,
      "avg18": 78.8,
      "avgToPar": 8.2,
      "vsField": -3.7,
      "best": 73,
      "worst": 86
    },
    "Jakob Holm": {
      "name": "Jakob Holm",
      "club": "Gamle Fredrikstad Golfklubb",
      "birthYear": "2009",
      "rang": 6,
      "tournaments": 20,
      "rounds": 22,
      "avg18": 83.1,
      "avgToPar": 12.5,
      "vsField": -0.9,
      "best": 68,
      "worst": 94
    },
    "Fredrik Olsen Smith": {
      "name": "Fredrik Olsen Smith",
      "club": "Gamle Fredrikstad Golfklubb",
      "birthYear": "2009",
      "rang": 7,
      "tournaments": 19,
      "rounds": 20,
      "avg18": 86,
      "avgToPar": 15.5,
      "vsField": 2.1,
      "best": 73,
      "worst": 98
    },
    "Aksel Lind": {
      "name": "Aksel Lind",
      "club": "Gamle Fredrikstad Golfklubb",
      "birthYear": "2010",
      "rang": 8,
      "tournaments": 19,
      "rounds": 22,
      "avg18": 88.4,
      "avgToPar": 17.6,
      "vsField": 2.9,
      "best": 75,
      "worst": 106
    },
    "Constanse Hauglid": {
      "name": "Constanse Hauglid",
      "club": "Mørk Golfklubb",
      "birthYear": "2009",
      "rang": 9,
      "tournaments": 17,
      "rounds": 19,
      "avg18": 89.8,
      "avgToPar": 19.5,
      "vsField": 2.7,
      "best": 82,
      "worst": 97
    },
    "Sonja Sofie Sinding": {
      "name": "Sonja Sofie Sinding",
      "club": "Gamle Fredrikstad Golfklubb",
      "birthYear": "2012",
      "rang": 10,
      "tournaments": 13,
      "rounds": 13,
      "avg18": 104.2,
      "avgToPar": 33,
      "vsField": 9.3,
      "best": 84,
      "worst": 121
    }
  },
  "players": {
    "Max Risvåg": [
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour #4 (U19) - Skjeberg GK",
        "course": "Skjeberg GK",
        "date": "2026-06-06",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          78,
          73,
          73
        ],
        "brutto": 224,
        "toPar": 14,
        "par": 70,
        "fieldAvg": 4.54,
        "fieldN": 56,
        "vsField": 0.1,
        "diffVal": 13.5,
        "diffRank": 39,
        "diffLevel": "Middels"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour #3 Jr NM Match - Kongsberg GK",
        "course": "Kongsberg GK",
        "date": "2026-05-23",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          76,
          75
        ],
        "brutto": 151,
        "toPar": 7,
        "par": 72,
        "fieldAvg": 4.64,
        "fieldN": 40,
        "vsField": -1.1,
        "diffVal": 5.9,
        "diffRank": 70,
        "diffLevel": "Lett"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour #2 - Bjaavann GK",
        "course": "Bjaavann GK",
        "date": "2026-05-09",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          80,
          76,
          79
        ],
        "brutto": 235,
        "toPar": 19,
        "par": 72,
        "fieldAvg": 7.88,
        "fieldN": 44,
        "vsField": -1.5,
        "diffVal": 14.1,
        "diffRank": 34,
        "diffLevel": "Middels"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour #1 - Sola GK (Forus)",
        "course": "Sola GK",
        "date": "2026-04-25",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          74,
          77,
          73
        ],
        "brutto": 224,
        "toPar": 8,
        "par": 72,
        "fieldAvg": 7.91,
        "fieldN": 54,
        "vsField": -5.2,
        "diffVal": 11.7,
        "diffRank": 53,
        "diffLevel": "Middels"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour 8 (Finale) - Stavanger GK",
        "course": "Stavanger GK",
        "date": "2025-09-27",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          79,
          80,
          75
        ],
        "brutto": 234,
        "toPar": 21,
        "par": 71,
        "fieldAvg": 4.19,
        "fieldN": 45,
        "vsField": 2.8,
        "diffVal": 9.8,
        "diffRank": 61,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Gamle Fredrikstad GK (Kp3)",
        "course": "Gamle Fredrikstad GK",
        "date": "2025-09-21",
        "klasse": "G19B",
        "holes": 18,
        "rounds": [
          73
        ],
        "brutto": 73,
        "toPar": 1,
        "par": 72,
        "fieldAvg": 15.63,
        "fieldN": 43,
        "vsField": -14.6,
        "diffVal": 15.3,
        "diffRank": 30,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour 7 - Stiklestad GK",
        "course": "Stiklestad GK",
        "date": "2025-09-13",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          81,
          79,
          71
        ],
        "brutto": 231,
        "toPar": 18,
        "par": 71,
        "fieldAvg": 4.97,
        "fieldN": 59,
        "vsField": 1,
        "diffVal": 9.2,
        "diffRank": 63,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour 6 - Nøtterøy GK",
        "course": "Nøtterøy GK",
        "date": "2025-08-30",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          74,
          77,
          70
        ],
        "brutto": 221,
        "toPar": 5,
        "par": 72,
        "fieldAvg": 5.44,
        "fieldN": 45,
        "vsField": -3.8,
        "diffVal": 13.3,
        "diffRank": 41,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Oppegård GK (Kp3)",
        "course": "Oppegård GK",
        "date": "2025-08-16",
        "klasse": "G19B",
        "holes": 18,
        "rounds": [
          69
        ],
        "brutto": 69,
        "toPar": -2,
        "par": 71,
        "fieldAvg": 10.08,
        "fieldN": 37,
        "vsField": -12.1,
        "diffVal": 15.6,
        "diffRank": 29,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour 5 - Kongsvingers GK",
        "course": "Kongsvingers GK",
        "date": "2025-08-14",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          72,
          74,
          70
        ],
        "brutto": 216,
        "toPar": 0,
        "par": 72,
        "fieldAvg": 4.38,
        "fieldN": 45,
        "vsField": -4.4,
        "diffVal": 6.5,
        "diffRank": 69,
        "diffLevel": "Lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Huseby & Hankø GK (Kp2)",
        "course": "Huseby & Hankø GK",
        "date": "2025-08-09",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          66
        ],
        "brutto": 66,
        "toPar": -2,
        "par": 68,
        "fieldAvg": 8,
        "fieldN": 33,
        "vsField": -10,
        "diffVal": 13.1,
        "diffRank": 45,
        "diffLevel": "Middels"
      },
      {
        "tour": "Garmin Norges Cup",
        "name": "Mandagskvalifisering til Norgesmesterskapet 2025",
        "course": "",
        "date": "2025-08-04",
        "klasse": "H",
        "holes": 18,
        "rounds": [
          75
        ],
        "brutto": 75,
        "toPar": 4,
        "par": 71,
        "fieldAvg": 4.72,
        "fieldN": 69,
        "vsField": -0.7,
        "diffVal": 4.72,
        "diffRank": null,
        "diffLevel": "Lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Romerike GK (Kp2)",
        "course": "Romerike GK",
        "date": "2025-07-26",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          68
        ],
        "brutto": 68,
        "toPar": -4,
        "par": 72,
        "fieldAvg": 9.88,
        "fieldN": 33,
        "vsField": -13.9,
        "diffVal": 10.9,
        "diffRank": 58,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Losby GK (Kp2)",
        "course": "Losby GK",
        "date": "2025-06-28",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          70
        ],
        "brutto": 70,
        "toPar": -2,
        "par": 72,
        "fieldAvg": 17.48,
        "fieldN": 46,
        "vsField": -19.5,
        "diffVal": 18.8,
        "diffRank": 12,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour 4 - Junior NM - Hauger GK",
        "course": "Hauger GK",
        "date": "2025-06-24",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          77,
          75,
          75
        ],
        "brutto": 227,
        "toPar": 11,
        "par": 72,
        "fieldAvg": 6.51,
        "fieldN": 82,
        "vsField": -2.8,
        "diffVal": 12.6,
        "diffRank": 49,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Halden GK (Kp1)",
        "course": "Halden GK",
        "date": "2025-05-31",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          65
        ],
        "brutto": 65,
        "toPar": -5,
        "par": 70,
        "fieldAvg": 10.49,
        "fieldN": 49,
        "vsField": -15.5,
        "diffVal": 11.4,
        "diffRank": 57,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Østmarka GK (Kp1)",
        "course": "Østmarka GK",
        "date": "2025-05-29",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          75
        ],
        "brutto": 75,
        "toPar": 3,
        "par": 72,
        "fieldAvg": 16.94,
        "fieldN": 66,
        "vsField": -13.9,
        "diffVal": 19.4,
        "diffRank": 10,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Hvaler GK (Kp1)",
        "course": "Hvaler GK",
        "date": "2025-05-25",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          71
        ],
        "brutto": 71,
        "toPar": 3,
        "par": 68,
        "fieldAvg": 17.63,
        "fieldN": 52,
        "vsField": -14.6,
        "diffVal": 20.2,
        "diffRank": 5,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Romerike GK (Kp1)",
        "course": "Romerike GK",
        "date": "2025-05-10",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          68
        ],
        "brutto": 68,
        "toPar": -4,
        "par": 72,
        "fieldAvg": 12.56,
        "fieldN": 54,
        "vsField": -16.6,
        "diffVal": 10.9,
        "diffRank": 58,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Skjeberg GK (Kp1)",
        "course": "Skjeberg GK",
        "date": "2025-04-27",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          79
        ],
        "brutto": 79,
        "toPar": 10,
        "par": 69,
        "fieldAvg": 21.85,
        "fieldN": 66,
        "vsField": -11.8,
        "diffVal": 13.5,
        "diffRank": 39,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Borregaard GK - (KP1)",
        "course": "",
        "date": "2025-04-26",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          69
        ],
        "brutto": 69,
        "toPar": 4,
        "par": 65,
        "fieldAvg": 15.02,
        "fieldN": 45,
        "vsField": -11,
        "diffVal": 15.02,
        "diffRank": null,
        "diffLevel": "Middels-vanskelig"
      }
    ],
    "Sebastian Henriksen": [
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour #4 (U19) - Skjeberg GK",
        "course": "Skjeberg GK",
        "date": "2026-06-06",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          72,
          72,
          70
        ],
        "brutto": 214,
        "toPar": 4,
        "par": 70,
        "fieldAvg": 4.54,
        "fieldN": 56,
        "vsField": -3.2,
        "diffVal": 13.5,
        "diffRank": 39,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Halden GK (KP1)",
        "course": "Halden GK",
        "date": "2026-05-31",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          67
        ],
        "brutto": 67,
        "toPar": -3,
        "par": 70,
        "fieldAvg": 6.43,
        "fieldN": 49,
        "vsField": -9.4,
        "diffVal": 11.4,
        "diffRank": 57,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Grønmo GK (KP1)",
        "course": "Grønmo GK",
        "date": "2026-05-30",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          68
        ],
        "brutto": 68,
        "toPar": -4,
        "par": 72,
        "fieldAvg": 8.78,
        "fieldN": 51,
        "vsField": -12.8,
        "diffVal": 10.9,
        "diffRank": 59,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Titleist Østlandstour",
        "name": "Østlandstour 2 - Skjeberg GK",
        "course": "Skjeberg GK",
        "date": "2026-05-23",
        "klasse": "HB",
        "holes": 18,
        "rounds": [
          75,
          73
        ],
        "brutto": 148,
        "toPar": 8,
        "par": 70,
        "fieldAvg": 13.31,
        "fieldN": 115,
        "vsField": -9.3,
        "diffVal": 13.5,
        "diffRank": 39,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Askim GK (KP1)",
        "course": "Askim GK",
        "date": "2026-05-16",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          70
        ],
        "brutto": 70,
        "toPar": 1,
        "par": 69,
        "fieldAvg": 7.93,
        "fieldN": 42,
        "vsField": -6.9,
        "diffVal": 11.6,
        "diffRank": 56,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Østmarka GK (KP1)",
        "course": "Østmarka GK",
        "date": "2026-05-14",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          80
        ],
        "brutto": 80,
        "toPar": 8,
        "par": 72,
        "fieldAvg": 16.4,
        "fieldN": 100,
        "vsField": -8.4,
        "diffVal": 19.4,
        "diffRank": 10,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Titleist Østlandstour",
        "name": "Østlandstour 1 - Onsøy GK og Huseby&Hankø GK",
        "course": "Onsøy GK",
        "date": "2026-05-09",
        "klasse": "HB",
        "holes": 18,
        "rounds": [
          74,
          72
        ],
        "brutto": 146,
        "toPar": 6,
        "par": 70,
        "fieldAvg": 10.18,
        "fieldN": 87,
        "vsField": -7.2,
        "diffVal": 14,
        "diffRank": 35,
        "diffLevel": "Middels"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour 8 (Finale) - Stavanger GK",
        "course": "Stavanger GK",
        "date": "2025-09-27",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          79,
          77,
          78
        ],
        "brutto": 234,
        "toPar": 21,
        "par": 71,
        "fieldAvg": 4.19,
        "fieldN": 45,
        "vsField": 2.8,
        "diffVal": 9.8,
        "diffRank": 61,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Gamle Fredrikstad GK (Kp3)",
        "course": "Gamle Fredrikstad GK",
        "date": "2025-09-21",
        "klasse": "G19B",
        "holes": 18,
        "rounds": [
          81
        ],
        "brutto": 81,
        "toPar": 9,
        "par": 72,
        "fieldAvg": 15.63,
        "fieldN": 43,
        "vsField": -6.6,
        "diffVal": 15.3,
        "diffRank": 30,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour - Nes GK (KP3)",
        "course": "Nes GK",
        "date": "2025-09-20",
        "klasse": "G19B",
        "holes": 18,
        "rounds": [
          76
        ],
        "brutto": 76,
        "toPar": 4,
        "par": 72,
        "fieldAvg": 12.71,
        "fieldN": 41,
        "vsField": -8.7,
        "diffVal": 9.3,
        "diffRank": 62,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour 7 - Stiklestad GK",
        "course": "Stiklestad GK",
        "date": "2025-09-13",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          74,
          74,
          80
        ],
        "brutto": 228,
        "toPar": 15,
        "par": 71,
        "fieldAvg": 4.97,
        "fieldN": 59,
        "vsField": 0,
        "diffVal": 9.2,
        "diffRank": 63,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour 6 - Nøtterøy GK",
        "course": "Nøtterøy GK",
        "date": "2025-08-30",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          79,
          71,
          78
        ],
        "brutto": 228,
        "toPar": 12,
        "par": 72,
        "fieldAvg": 5.44,
        "fieldN": 45,
        "vsField": -1.4,
        "diffVal": 13.3,
        "diffRank": 41,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Oppegård GK (Kp3)",
        "course": "Oppegård GK",
        "date": "2025-08-16",
        "klasse": "G19B",
        "holes": 18,
        "rounds": [
          73
        ],
        "brutto": 73,
        "toPar": 2,
        "par": 71,
        "fieldAvg": 10.08,
        "fieldN": 37,
        "vsField": -8.1,
        "diffVal": 15.6,
        "diffRank": 29,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour 5 - Kongsvingers GK",
        "course": "Kongsvingers GK",
        "date": "2025-08-14",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          78,
          77,
          80
        ],
        "brutto": 235,
        "toPar": 19,
        "par": 72,
        "fieldAvg": 4.38,
        "fieldN": 45,
        "vsField": 2,
        "diffVal": 6.5,
        "diffRank": 69,
        "diffLevel": "Lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Onsøy GK (Kp2)",
        "course": "Onsøy GK",
        "date": "2025-08-10",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          81
        ],
        "brutto": 81,
        "toPar": 9,
        "par": 72,
        "fieldAvg": 18.49,
        "fieldN": 41,
        "vsField": -9.5,
        "diffVal": 14,
        "diffRank": 35,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Huseby & Hankø GK (Kp2)",
        "course": "Huseby & Hankø GK",
        "date": "2025-08-09",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          67
        ],
        "brutto": 67,
        "toPar": -1,
        "par": 68,
        "fieldAvg": 8,
        "fieldN": 33,
        "vsField": -9,
        "diffVal": 13.1,
        "diffRank": 45,
        "diffLevel": "Middels"
      },
      {
        "tour": "Garmin Norges Cup",
        "name": "Mandagskvalifisering til Norgesmesterskapet 2025",
        "course": "",
        "date": "2025-08-04",
        "klasse": "H",
        "holes": 18,
        "rounds": [
          73
        ],
        "brutto": 73,
        "toPar": 2,
        "par": 71,
        "fieldAvg": 4.72,
        "fieldN": 69,
        "vsField": -2.7,
        "diffVal": 4.72,
        "diffRank": null,
        "diffLevel": "Lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Romerike GK (Kp2)",
        "course": "Romerike GK",
        "date": "2025-07-26",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          71
        ],
        "brutto": 71,
        "toPar": -1,
        "par": 72,
        "fieldAvg": 9.88,
        "fieldN": 33,
        "vsField": -10.9,
        "diffVal": 10.9,
        "diffRank": 58,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Titleist Østlandstour",
        "name": "Titleist Østlandstour - Minitour - Bærum GK, Tyrifjord GK og Holtsmark GK - 3 runder - WAGR-tellende",
        "course": "",
        "date": "2025-07-04",
        "klasse": "BH",
        "holes": 18,
        "rounds": [
          72,
          75,
          79
        ],
        "brutto": 226,
        "toPar": 11,
        "par": 72,
        "fieldAvg": 7.26,
        "fieldN": 50,
        "vsField": -3.6,
        "diffVal": 7.26,
        "diffRank": null,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Losby GK (Kp2)",
        "course": "Losby GK",
        "date": "2025-06-28",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          71
        ],
        "brutto": 71,
        "toPar": -1,
        "par": 72,
        "fieldAvg": 17.48,
        "fieldN": 46,
        "vsField": -18.5,
        "diffVal": 18.8,
        "diffRank": 12,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour 4 - Junior NM - Hauger GK",
        "course": "Hauger GK",
        "date": "2025-06-24",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          78,
          74,
          76
        ],
        "brutto": 228,
        "toPar": 12,
        "par": 72,
        "fieldAvg": 6.51,
        "fieldN": 82,
        "vsField": -2.5,
        "diffVal": 12.6,
        "diffRank": 49,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Mjøsen GK (Kp2)",
        "course": "Mjøsen GK",
        "date": "2025-06-14",
        "klasse": "G-19",
        "holes": 9,
        "rounds": [
          42
        ],
        "brutto": 42,
        "toPar": 3,
        "par": 39,
        "fieldAvg": 15.79,
        "fieldN": 34,
        "vsField": null,
        "diffVal": 18.2,
        "diffRank": 16,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Halden GK (Kp1)",
        "course": "Halden GK",
        "date": "2025-05-31",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          68
        ],
        "brutto": 68,
        "toPar": -2,
        "par": 70,
        "fieldAvg": 10.49,
        "fieldN": 49,
        "vsField": -12.5,
        "diffVal": 11.4,
        "diffRank": 57,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Østmarka GK (Kp1)",
        "course": "Østmarka GK",
        "date": "2025-05-29",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          78
        ],
        "brutto": 78,
        "toPar": 6,
        "par": 72,
        "fieldAvg": 16.94,
        "fieldN": 66,
        "vsField": -10.9,
        "diffVal": 19.4,
        "diffRank": 10,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Hvaler GK (Kp1)",
        "course": "Hvaler GK",
        "date": "2025-05-25",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          70
        ],
        "brutto": 70,
        "toPar": 2,
        "par": 68,
        "fieldAvg": 17.63,
        "fieldN": 52,
        "vsField": -15.6,
        "diffVal": 20.2,
        "diffRank": 5,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Romerike GK (Kp1)",
        "course": "Romerike GK",
        "date": "2025-05-10",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          74
        ],
        "brutto": 74,
        "toPar": 2,
        "par": 72,
        "fieldAvg": 12.56,
        "fieldN": 54,
        "vsField": -10.6,
        "diffVal": 10.9,
        "diffRank": 58,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Skjeberg GK (Kp1)",
        "course": "Skjeberg GK",
        "date": "2025-04-27",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          71
        ],
        "brutto": 71,
        "toPar": 2,
        "par": 69,
        "fieldAvg": 21.85,
        "fieldN": 66,
        "vsField": -19.8,
        "diffVal": 13.5,
        "diffRank": 39,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Borregaard GK - (KP1)",
        "course": "",
        "date": "2025-04-26",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          67
        ],
        "brutto": 67,
        "toPar": 2,
        "par": 65,
        "fieldAvg": 15.02,
        "fieldN": 45,
        "vsField": -13,
        "diffVal": 15.02,
        "diffRank": null,
        "diffLevel": "Middels-vanskelig"
      }
    ],
    "Fredrik Kjølberg Hovland": [
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Halden GK (KP1)",
        "course": "Halden GK",
        "date": "2026-05-31",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          70
        ],
        "brutto": 70,
        "toPar": 0,
        "par": 70,
        "fieldAvg": 6.43,
        "fieldN": 49,
        "vsField": -6.4,
        "diffVal": 11.4,
        "diffRank": 57,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Grønmo GK (KP1)",
        "course": "Grønmo GK",
        "date": "2026-05-30",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          74
        ],
        "brutto": 74,
        "toPar": 2,
        "par": 72,
        "fieldAvg": 8.78,
        "fieldN": 51,
        "vsField": -6.8,
        "diffVal": 10.9,
        "diffRank": 59,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Titleist Østlandstour",
        "name": "Østlandstour 2 - Skjeberg GK",
        "course": "Skjeberg GK",
        "date": "2026-05-23",
        "klasse": "HB",
        "holes": 18,
        "rounds": [
          81,
          78
        ],
        "brutto": 159,
        "toPar": 19,
        "par": 70,
        "fieldAvg": 13.31,
        "fieldN": 115,
        "vsField": -3.8,
        "diffVal": 13.5,
        "diffRank": 39,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Askim GK (KP1)",
        "course": "Askim GK",
        "date": "2026-05-16",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          69
        ],
        "brutto": 69,
        "toPar": 0,
        "par": 69,
        "fieldAvg": 7.93,
        "fieldN": 42,
        "vsField": -7.9,
        "diffVal": 11.6,
        "diffRank": 56,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Østmarka GK (KP1)",
        "course": "Østmarka GK",
        "date": "2026-05-14",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          75
        ],
        "brutto": 75,
        "toPar": 3,
        "par": 72,
        "fieldAvg": 16.4,
        "fieldN": 100,
        "vsField": -13.4,
        "diffVal": 19.4,
        "diffRank": 10,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Titleist Østlandstour",
        "name": "Østlandstour 1 - Onsøy GK og Huseby&Hankø GK",
        "course": "Onsøy GK",
        "date": "2026-05-09",
        "klasse": "HB",
        "holes": 18,
        "rounds": [
          81,
          70
        ],
        "brutto": 151,
        "toPar": 11,
        "par": 70,
        "fieldAvg": 10.18,
        "fieldN": 87,
        "vsField": -4.7,
        "diffVal": 14,
        "diffRank": 35,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Gamle Fredrikstad GK (Kp3)",
        "course": "Gamle Fredrikstad GK",
        "date": "2025-09-21",
        "klasse": "G15B",
        "holes": 18,
        "rounds": [
          75
        ],
        "brutto": 75,
        "toPar": 3,
        "par": 72,
        "fieldAvg": 14.38,
        "fieldN": 40,
        "vsField": -11.4,
        "diffVal": 15.3,
        "diffRank": 30,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour - Nes GK (KP3)",
        "course": "Nes GK",
        "date": "2025-09-20",
        "klasse": "G15B",
        "holes": 18,
        "rounds": [
          76
        ],
        "brutto": 76,
        "toPar": 4,
        "par": 72,
        "fieldAvg": 15.48,
        "fieldN": 48,
        "vsField": -11.5,
        "diffVal": 9.3,
        "diffRank": 62,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour Future Camp Byneset GK",
        "course": "Byneset GK",
        "date": "2025-09-13",
        "klasse": "G15",
        "holes": 18,
        "rounds": [
          86,
          80
        ],
        "brutto": 166,
        "toPar": 22,
        "par": 72,
        "fieldAvg": 8.76,
        "fieldN": 65,
        "vsField": 2.2,
        "diffVal": 7.5,
        "diffRank": 67,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Oppegård GK (Kp3)",
        "course": "Oppegård GK",
        "date": "2025-08-16",
        "klasse": "G15B",
        "holes": 18,
        "rounds": [
          80
        ],
        "brutto": 80,
        "toPar": 9,
        "par": 71,
        "fieldAvg": 19.16,
        "fieldN": 32,
        "vsField": -10.2,
        "diffVal": 15.6,
        "diffRank": 29,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Huseby & Hankø GK (Kp2)",
        "course": "Huseby & Hankø GK",
        "date": "2025-08-09",
        "klasse": "G-15",
        "holes": 18,
        "rounds": [
          75
        ],
        "brutto": 75,
        "toPar": 7,
        "par": 68,
        "fieldAvg": 16.09,
        "fieldN": 22,
        "vsField": -9.1,
        "diffVal": 13.1,
        "diffRank": 45,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Mørk GK (Kp2)",
        "course": "Mørk GK",
        "date": "2025-08-03",
        "klasse": "G-15",
        "holes": 18,
        "rounds": [
          74
        ],
        "brutto": 74,
        "toPar": 2,
        "par": 72,
        "fieldAvg": 15.86,
        "fieldN": 22,
        "vsField": -13.9,
        "diffVal": 16.7,
        "diffRank": 24,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Losby GK (Kp2)",
        "course": "Losby GK",
        "date": "2025-06-28",
        "klasse": "G-15",
        "holes": 18,
        "rounds": [
          79
        ],
        "brutto": 79,
        "toPar": 7,
        "par": 72,
        "fieldAvg": 19.97,
        "fieldN": 31,
        "vsField": -13,
        "diffVal": 18.8,
        "diffRank": 12,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour Future Camp (Ungdomsmesterskapet) Drøbak",
        "course": "",
        "date": "2025-06-21",
        "klasse": "G15",
        "holes": 18,
        "rounds": [
          80,
          79
        ],
        "brutto": 159,
        "toPar": 19,
        "par": 70,
        "fieldAvg": 12.13,
        "fieldN": 63,
        "vsField": -2.6,
        "diffVal": 12.13,
        "diffRank": null,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Halden GK (Kp1)",
        "course": "Halden GK",
        "date": "2025-05-31",
        "klasse": "G-15",
        "holes": 18,
        "rounds": [
          90
        ],
        "brutto": 90,
        "toPar": 20,
        "par": 70,
        "fieldAvg": 19.41,
        "fieldN": 27,
        "vsField": 0.6,
        "diffVal": 11.4,
        "diffRank": 57,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Østmarka GK (Kp1)",
        "course": "Østmarka GK",
        "date": "2025-05-29",
        "klasse": "G-15",
        "holes": 18,
        "rounds": [
          81
        ],
        "brutto": 81,
        "toPar": 9,
        "par": 72,
        "fieldAvg": 24.76,
        "fieldN": 50,
        "vsField": -15.8,
        "diffVal": 19.4,
        "diffRank": 10,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Hvaler GK (Kp1)",
        "course": "Hvaler GK",
        "date": "2025-05-25",
        "klasse": "G-15",
        "holes": 18,
        "rounds": [
          81
        ],
        "brutto": 81,
        "toPar": 13,
        "par": 68,
        "fieldAvg": 22.56,
        "fieldN": 32,
        "vsField": -9.6,
        "diffVal": 20.2,
        "diffRank": 5,
        "diffLevel": "Vanskelig"
      }
    ],
    "Anders Rafshol": [
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Halden GK (KP1)",
        "course": "Halden GK",
        "date": "2026-05-31",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          73
        ],
        "brutto": 73,
        "toPar": 3,
        "par": 70,
        "fieldAvg": 6.43,
        "fieldN": 49,
        "vsField": -3.4,
        "diffVal": 11.4,
        "diffRank": 57,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Grønmo GK (KP1)",
        "course": "Grønmo GK",
        "date": "2026-05-30",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          78
        ],
        "brutto": 78,
        "toPar": 6,
        "par": 72,
        "fieldAvg": 8.78,
        "fieldN": 51,
        "vsField": -2.8,
        "diffVal": 10.9,
        "diffRank": 59,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Askim GK (KP1)",
        "course": "Askim GK",
        "date": "2026-05-16",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          74
        ],
        "brutto": 74,
        "toPar": 5,
        "par": 69,
        "fieldAvg": 7.93,
        "fieldN": 42,
        "vsField": -2.9,
        "diffVal": 11.6,
        "diffRank": 56,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Østmarka GK (KP1)",
        "course": "Østmarka GK",
        "date": "2026-05-14",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          80
        ],
        "brutto": 80,
        "toPar": 8,
        "par": 72,
        "fieldAvg": 16.4,
        "fieldN": 100,
        "vsField": -8.4,
        "diffVal": 19.4,
        "diffRank": 10,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Titleist Østlandstour",
        "name": "Østlandstour 1 - Onsøy GK og Huseby&Hankø GK",
        "course": "Onsøy GK",
        "date": "2026-05-09",
        "klasse": "HB",
        "holes": 18,
        "rounds": [
          86,
          77
        ],
        "brutto": 163,
        "toPar": 23,
        "par": 70,
        "fieldAvg": 10.18,
        "fieldN": 87,
        "vsField": 1.3,
        "diffVal": 14,
        "diffRank": 35,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Oppegård GK (Kp3)",
        "course": "Oppegård GK",
        "date": "2025-08-16",
        "klasse": "G19B",
        "holes": 18,
        "rounds": [
          80
        ],
        "brutto": 80,
        "toPar": 9,
        "par": 71,
        "fieldAvg": 10.08,
        "fieldN": 37,
        "vsField": -1.1,
        "diffVal": 15.6,
        "diffRank": 29,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Hauger GK (Kp3)",
        "course": "Hauger GK",
        "date": "2025-08-15",
        "klasse": "G19B",
        "holes": 18,
        "rounds": [
          81
        ],
        "brutto": 81,
        "toPar": 9,
        "par": 72,
        "fieldAvg": 18.11,
        "fieldN": 37,
        "vsField": -9.1,
        "diffVal": 12.6,
        "diffRank": 49,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Onsøy GK (Kp2)",
        "course": "Onsøy GK",
        "date": "2025-08-10",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          81
        ],
        "brutto": 81,
        "toPar": 9,
        "par": 72,
        "fieldAvg": 18.49,
        "fieldN": 41,
        "vsField": -9.5,
        "diffVal": 14,
        "diffRank": 35,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Huseby & Hankø GK (Kp2)",
        "course": "Huseby & Hankø GK",
        "date": "2025-08-09",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          73
        ],
        "brutto": 73,
        "toPar": 5,
        "par": 68,
        "fieldAvg": 8,
        "fieldN": 33,
        "vsField": -3,
        "diffVal": 13.1,
        "diffRank": 45,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Romerike GK (Kp2)",
        "course": "Romerike GK",
        "date": "2025-07-26",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          77
        ],
        "brutto": 77,
        "toPar": 5,
        "par": 72,
        "fieldAvg": 9.88,
        "fieldN": 33,
        "vsField": -4.9,
        "diffVal": 10.9,
        "diffRank": 58,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Titleist Østlandstour",
        "name": "Titleist Østlandstour - Minitour - Bærum GK, Tyrifjord GK og Holtsmark GK - 3 runder - WAGR-tellende",
        "course": "",
        "date": "2025-07-04",
        "klasse": "BH",
        "holes": 18,
        "rounds": [
          81,
          85
        ],
        "brutto": 166,
        "toPar": 23,
        "par": 72,
        "fieldAvg": 7.26,
        "fieldN": 50,
        "vsField": 4.2,
        "diffVal": 7.26,
        "diffRank": null,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Losby GK (Kp2)",
        "course": "Losby GK",
        "date": "2025-06-28",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          81
        ],
        "brutto": 81,
        "toPar": 9,
        "par": 72,
        "fieldAvg": 17.48,
        "fieldN": 46,
        "vsField": -8.5,
        "diffVal": 18.8,
        "diffRank": 12,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Titleist Østlandstour",
        "name": "Titleist Østlandstour - Romerike GK",
        "course": "Romerike GK",
        "date": "2025-06-21",
        "klasse": "H1",
        "holes": 18,
        "rounds": [
          75,
          74
        ],
        "brutto": 149,
        "toPar": 5,
        "par": 72,
        "fieldAvg": 3.22,
        "fieldN": 30,
        "vsField": -0.7,
        "diffVal": 10.9,
        "diffRank": 58,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Mjøsen GK (Kp2)",
        "course": "Mjøsen GK",
        "date": "2025-06-14",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          77
        ],
        "brutto": 77,
        "toPar": 7,
        "par": 70,
        "fieldAvg": 15.79,
        "fieldN": 34,
        "vsField": -8.8,
        "diffVal": 18.2,
        "diffRank": 16,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Halden GK (Kp1)",
        "course": "Halden GK",
        "date": "2025-05-31",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          74
        ],
        "brutto": 74,
        "toPar": 4,
        "par": 70,
        "fieldAvg": 10.49,
        "fieldN": 49,
        "vsField": -6.5,
        "diffVal": 11.4,
        "diffRank": 57,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Østmarka GK (Kp1)",
        "course": "Østmarka GK",
        "date": "2025-05-29",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          83
        ],
        "brutto": 83,
        "toPar": 11,
        "par": 72,
        "fieldAvg": 16.94,
        "fieldN": 66,
        "vsField": -5.9,
        "diffVal": 19.4,
        "diffRank": 10,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Hvaler GK (Kp1)",
        "course": "Hvaler GK",
        "date": "2025-05-25",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          80
        ],
        "brutto": 80,
        "toPar": 12,
        "par": 68,
        "fieldAvg": 17.63,
        "fieldN": 52,
        "vsField": -5.6,
        "diffVal": 20.2,
        "diffRank": 5,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Romerike GK (Kp1)",
        "course": "Romerike GK",
        "date": "2025-05-10",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          85
        ],
        "brutto": 85,
        "toPar": 13,
        "par": 72,
        "fieldAvg": 12.56,
        "fieldN": 54,
        "vsField": 0.4,
        "diffVal": 10.9,
        "diffRank": 58,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Skjeberg GK (Kp1)",
        "course": "Skjeberg GK",
        "date": "2025-04-27",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          81
        ],
        "brutto": 81,
        "toPar": 12,
        "par": 69,
        "fieldAvg": 21.85,
        "fieldN": 66,
        "vsField": -9.8,
        "diffVal": 13.5,
        "diffRank": 39,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Borregaard GK - (KP1)",
        "course": "",
        "date": "2025-04-26",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          76
        ],
        "brutto": 76,
        "toPar": 11,
        "par": 65,
        "fieldAvg": 15.02,
        "fieldN": 45,
        "vsField": -4,
        "diffVal": 15.02,
        "diffRank": null,
        "diffLevel": "Middels-vanskelig"
      }
    ],
    "Aksel Lind": [
      {
        "tour": "Titleist Østlandstour",
        "name": "Østlandstour 3 - Hakadal GK",
        "course": "Hakadal GK",
        "date": "2026-06-06",
        "klasse": "HB",
        "holes": 18,
        "rounds": [
          79,
          76
        ],
        "brutto": 155,
        "toPar": 13,
        "par": 71,
        "fieldAvg": 10.1,
        "fieldN": 96,
        "vsField": -3.6,
        "diffVal": 10.2,
        "diffRank": 60,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Halden GK (KP1)",
        "course": "Halden GK",
        "date": "2026-05-31",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          75
        ],
        "brutto": 75,
        "toPar": 5,
        "par": 70,
        "fieldAvg": 6.43,
        "fieldN": 49,
        "vsField": -1.4,
        "diffVal": 11.4,
        "diffRank": 57,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Grønmo GK (KP1)",
        "course": "Grønmo GK",
        "date": "2026-05-30",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          78
        ],
        "brutto": 78,
        "toPar": 6,
        "par": 72,
        "fieldAvg": 8.78,
        "fieldN": 51,
        "vsField": -2.8,
        "diffVal": 10.9,
        "diffRank": 59,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Titleist Østlandstour",
        "name": "Østlandstour 2 - Skjeberg GK",
        "course": "Skjeberg GK",
        "date": "2026-05-23",
        "klasse": "HB",
        "holes": 18,
        "rounds": [
          94,
          89
        ],
        "brutto": 183,
        "toPar": 43,
        "par": 70,
        "fieldAvg": 13.31,
        "fieldN": 115,
        "vsField": 8.2,
        "diffVal": 13.5,
        "diffRank": 39,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Askim GK (KP1)",
        "course": "Askim GK",
        "date": "2026-05-16",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          79
        ],
        "brutto": 79,
        "toPar": 10,
        "par": 69,
        "fieldAvg": 7.93,
        "fieldN": 42,
        "vsField": 2.1,
        "diffVal": 11.6,
        "diffRank": 56,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Østmarka GK (KP1)",
        "course": "Østmarka GK",
        "date": "2026-05-14",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          81
        ],
        "brutto": 81,
        "toPar": 9,
        "par": 72,
        "fieldAvg": 16.4,
        "fieldN": 100,
        "vsField": -7.4,
        "diffVal": 19.4,
        "diffRank": 10,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Titleist Østlandstour",
        "name": "Østlandstour 1 - Onsøy GK og Huseby&Hankø GK",
        "course": "Onsøy GK",
        "date": "2026-05-09",
        "klasse": "HB",
        "holes": 18,
        "rounds": [
          93,
          86
        ],
        "brutto": 179,
        "toPar": 39,
        "par": 70,
        "fieldAvg": 10.18,
        "fieldN": 87,
        "vsField": 9.3,
        "diffVal": 14,
        "diffRank": 35,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Gamle Fredrikstad GK (Kp3)",
        "course": "Gamle Fredrikstad GK",
        "date": "2025-09-21",
        "klasse": "G15B",
        "holes": 18,
        "rounds": [
          83
        ],
        "brutto": 83,
        "toPar": 11,
        "par": 72,
        "fieldAvg": 14.38,
        "fieldN": 40,
        "vsField": -3.4,
        "diffVal": 15.3,
        "diffRank": 30,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour - Nes GK (KP3)",
        "course": "Nes GK",
        "date": "2025-09-20",
        "klasse": "G15B",
        "holes": 18,
        "rounds": [
          90
        ],
        "brutto": 90,
        "toPar": 18,
        "par": 72,
        "fieldAvg": 15.48,
        "fieldN": 48,
        "vsField": 2.5,
        "diffVal": 9.3,
        "diffRank": 62,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Hauger GK (Kp3)",
        "course": "Hauger GK",
        "date": "2025-08-15",
        "klasse": "G15B",
        "holes": 18,
        "rounds": [
          90
        ],
        "brutto": 90,
        "toPar": 18,
        "par": 72,
        "fieldAvg": 19.58,
        "fieldN": 31,
        "vsField": -1.6,
        "diffVal": 12.6,
        "diffRank": 49,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Onsøy GK (Kp2)",
        "course": "Onsøy GK",
        "date": "2025-08-10",
        "klasse": "G-15",
        "holes": 18,
        "rounds": [
          94
        ],
        "brutto": 94,
        "toPar": 22,
        "par": 72,
        "fieldAvg": 21.52,
        "fieldN": 27,
        "vsField": 0.5,
        "diffVal": 14,
        "diffRank": 35,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Huseby & Hankø GK (Kp2)",
        "course": "Huseby & Hankø GK",
        "date": "2025-08-09",
        "klasse": "G-15",
        "holes": 18,
        "rounds": [
          90
        ],
        "brutto": 90,
        "toPar": 22,
        "par": 68,
        "fieldAvg": 16.09,
        "fieldN": 22,
        "vsField": 5.9,
        "diffVal": 13.1,
        "diffRank": 45,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Mørk GK (Kp2)",
        "course": "Mørk GK",
        "date": "2025-08-03",
        "klasse": "G-15",
        "holes": 18,
        "rounds": [
          98
        ],
        "brutto": 98,
        "toPar": 26,
        "par": 72,
        "fieldAvg": 15.86,
        "fieldN": 22,
        "vsField": 10.1,
        "diffVal": 16.7,
        "diffRank": 24,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Romerike GK (Kp2)",
        "course": "Romerike GK",
        "date": "2025-07-26",
        "klasse": "G-15",
        "holes": 18,
        "rounds": [
          82
        ],
        "brutto": 82,
        "toPar": 10,
        "par": 72,
        "fieldAvg": 11.33,
        "fieldN": 21,
        "vsField": -1.3,
        "diffVal": 10.9,
        "diffRank": 58,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Mjøsen GK (Kp2)",
        "course": "Mjøsen GK",
        "date": "2025-06-14",
        "klasse": "G-15",
        "holes": 18,
        "rounds": [
          106
        ],
        "brutto": 106,
        "toPar": 36,
        "par": 70,
        "fieldAvg": 22.17,
        "fieldN": 24,
        "vsField": 13.8,
        "diffVal": 18.2,
        "diffRank": 16,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Halden GK (Kp1)",
        "course": "Halden GK",
        "date": "2025-05-31",
        "klasse": "G-15",
        "holes": 18,
        "rounds": [
          96
        ],
        "brutto": 96,
        "toPar": 26,
        "par": 70,
        "fieldAvg": 19.41,
        "fieldN": 27,
        "vsField": 6.6,
        "diffVal": 11.4,
        "diffRank": 57,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Østmarka GK (Kp1)",
        "course": "Østmarka GK",
        "date": "2025-05-29",
        "klasse": "G-15",
        "holes": 18,
        "rounds": [
          96
        ],
        "brutto": 96,
        "toPar": 24,
        "par": 72,
        "fieldAvg": 24.76,
        "fieldN": 50,
        "vsField": -0.8,
        "diffVal": 19.4,
        "diffRank": 10,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Hvaler GK (Kp1)",
        "course": "Hvaler GK",
        "date": "2025-05-25",
        "klasse": "G-15",
        "holes": 18,
        "rounds": [
          97
        ],
        "brutto": 97,
        "toPar": 29,
        "par": 68,
        "fieldAvg": 22.56,
        "fieldN": 32,
        "vsField": 6.4,
        "diffVal": 20.2,
        "diffRank": 5,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Romerike GK (Kp1)",
        "course": "Romerike GK",
        "date": "2025-05-10",
        "klasse": "G-15",
        "holes": 18,
        "rounds": [
          93
        ],
        "brutto": 93,
        "toPar": 21,
        "par": 72,
        "fieldAvg": 14.77,
        "fieldN": 39,
        "vsField": 6.2,
        "diffVal": 10.9,
        "diffRank": 58,
        "diffLevel": "Middels-lett"
      }
    ],
    "Jakob Holm": [
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Askim GK (KP1)",
        "course": "Askim GK",
        "date": "2026-05-16",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          86
        ],
        "brutto": 86,
        "toPar": 17,
        "par": 69,
        "fieldAvg": 7.93,
        "fieldN": 42,
        "vsField": 9.1,
        "diffVal": 11.6,
        "diffRank": 56,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Østmarka GK (KP1)",
        "course": "Østmarka GK",
        "date": "2026-05-14",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          82
        ],
        "brutto": 82,
        "toPar": 10,
        "par": 72,
        "fieldAvg": 16.4,
        "fieldN": 100,
        "vsField": -6.4,
        "diffVal": 19.4,
        "diffRank": 10,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Titleist Østlandstour",
        "name": "Østlandstour 1 - Onsøy GK og Huseby&Hankø GK",
        "course": "Onsøy GK",
        "date": "2026-05-09",
        "klasse": "HB",
        "holes": 18,
        "rounds": [
          94,
          68
        ],
        "brutto": 162,
        "toPar": 22,
        "par": 70,
        "fieldAvg": 10.18,
        "fieldN": 87,
        "vsField": 0.8,
        "diffVal": 14,
        "diffRank": 35,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Gamle Fredrikstad GK (Kp3)",
        "course": "Gamle Fredrikstad GK",
        "date": "2025-09-21",
        "klasse": "G19B",
        "holes": 18,
        "rounds": [
          80
        ],
        "brutto": 80,
        "toPar": 8,
        "par": 72,
        "fieldAvg": 15.63,
        "fieldN": 43,
        "vsField": -7.6,
        "diffVal": 15.3,
        "diffRank": 30,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour - Nes GK (KP3)",
        "course": "Nes GK",
        "date": "2025-09-20",
        "klasse": "G19B",
        "holes": 18,
        "rounds": [
          83
        ],
        "brutto": 83,
        "toPar": 11,
        "par": 72,
        "fieldAvg": 12.71,
        "fieldN": 41,
        "vsField": -1.7,
        "diffVal": 9.3,
        "diffRank": 62,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Oppegård GK (Kp3)",
        "course": "Oppegård GK",
        "date": "2025-08-16",
        "klasse": "G19B",
        "holes": 18,
        "rounds": [
          80
        ],
        "brutto": 80,
        "toPar": 9,
        "par": 71,
        "fieldAvg": 10.08,
        "fieldN": 37,
        "vsField": -1.1,
        "diffVal": 15.6,
        "diffRank": 29,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Hauger GK (Kp3)",
        "course": "Hauger GK",
        "date": "2025-08-15",
        "klasse": "G19B",
        "holes": 18,
        "rounds": [
          92
        ],
        "brutto": 92,
        "toPar": 20,
        "par": 72,
        "fieldAvg": 18.11,
        "fieldN": 37,
        "vsField": 1.9,
        "diffVal": 12.6,
        "diffRank": 49,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Onsøy GK (Kp2)",
        "course": "Onsøy GK",
        "date": "2025-08-10",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          82
        ],
        "brutto": 82,
        "toPar": 10,
        "par": 72,
        "fieldAvg": 18.49,
        "fieldN": 41,
        "vsField": -8.5,
        "diffVal": 14,
        "diffRank": 35,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Huseby & Hankø GK (Kp2)",
        "course": "Huseby & Hankø GK",
        "date": "2025-08-09",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          75
        ],
        "brutto": 75,
        "toPar": 7,
        "par": 68,
        "fieldAvg": 8,
        "fieldN": 33,
        "vsField": -1,
        "diffVal": 13.1,
        "diffRank": 45,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Mørk GK (Kp2)",
        "course": "Mørk GK",
        "date": "2025-08-03",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          77
        ],
        "brutto": 77,
        "toPar": 5,
        "par": 72,
        "fieldAvg": 15.2,
        "fieldN": 30,
        "vsField": -10.2,
        "diffVal": 16.7,
        "diffRank": 24,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Romerike GK (Kp2)",
        "course": "Romerike GK",
        "date": "2025-07-26",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          86
        ],
        "brutto": 86,
        "toPar": 14,
        "par": 72,
        "fieldAvg": 9.88,
        "fieldN": 33,
        "vsField": 4.1,
        "diffVal": 10.9,
        "diffRank": 58,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Titleist Østlandstour",
        "name": "Titleist Østlandstour - Minitour - Bærum GK, Tyrifjord GK og Holtsmark GK - 3 runder - WAGR-tellende",
        "course": "",
        "date": "2025-07-04",
        "klasse": "BH",
        "holes": 18,
        "rounds": [
          84,
          81
        ],
        "brutto": 165,
        "toPar": 22,
        "par": 72,
        "fieldAvg": 7.26,
        "fieldN": 50,
        "vsField": 3.7,
        "diffVal": 7.26,
        "diffRank": null,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Losby GK (Kp2)",
        "course": "Losby GK",
        "date": "2025-06-28",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          81
        ],
        "brutto": 81,
        "toPar": 9,
        "par": 72,
        "fieldAvg": 17.48,
        "fieldN": 46,
        "vsField": -8.5,
        "diffVal": 18.8,
        "diffRank": 12,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Mjøsen GK (Kp2)",
        "course": "Mjøsen GK",
        "date": "2025-06-14",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          93
        ],
        "brutto": 93,
        "toPar": 23,
        "par": 70,
        "fieldAvg": 15.79,
        "fieldN": 34,
        "vsField": 7.2,
        "diffVal": 18.2,
        "diffRank": 16,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Halden GK (Kp1)",
        "course": "Halden GK",
        "date": "2025-05-31",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          82
        ],
        "brutto": 82,
        "toPar": 12,
        "par": 70,
        "fieldAvg": 10.49,
        "fieldN": 49,
        "vsField": 1.5,
        "diffVal": 11.4,
        "diffRank": 57,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Østmarka GK (Kp1)",
        "course": "Østmarka GK",
        "date": "2025-05-29",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          87
        ],
        "brutto": 87,
        "toPar": 15,
        "par": 72,
        "fieldAvg": 16.94,
        "fieldN": 66,
        "vsField": -1.9,
        "diffVal": 19.4,
        "diffRank": 10,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Hvaler GK (Kp1)",
        "course": "Hvaler GK",
        "date": "2025-05-25",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          84
        ],
        "brutto": 84,
        "toPar": 16,
        "par": 68,
        "fieldAvg": 17.63,
        "fieldN": 52,
        "vsField": -1.6,
        "diffVal": 20.2,
        "diffRank": 5,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Romerike GK (Kp1)",
        "course": "Romerike GK",
        "date": "2025-05-10",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          80
        ],
        "brutto": 80,
        "toPar": 8,
        "par": 72,
        "fieldAvg": 12.56,
        "fieldN": 54,
        "vsField": -4.6,
        "diffVal": 10.9,
        "diffRank": 58,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Skjeberg GK (Kp1)",
        "course": "Skjeberg GK",
        "date": "2025-04-27",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          89
        ],
        "brutto": 89,
        "toPar": 20,
        "par": 69,
        "fieldAvg": 21.85,
        "fieldN": 66,
        "vsField": -1.8,
        "diffVal": 13.5,
        "diffRank": 39,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Borregaard GK - (KP1)",
        "course": "",
        "date": "2025-04-26",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          83
        ],
        "brutto": 83,
        "toPar": 18,
        "par": 65,
        "fieldAvg": 15.02,
        "fieldN": 45,
        "vsField": 3,
        "diffVal": 15.02,
        "diffRank": null,
        "diffLevel": "Middels-vanskelig"
      }
    ],
    "Fredrik Olsen Smith": [
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Halden GK (KP1)",
        "course": "Halden GK",
        "date": "2026-05-31",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          76
        ],
        "brutto": 76,
        "toPar": 6,
        "par": 70,
        "fieldAvg": 6.43,
        "fieldN": 49,
        "vsField": -0.4,
        "diffVal": 11.4,
        "diffRank": 57,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Grønmo GK (KP1)",
        "course": "Grønmo GK",
        "date": "2026-05-30",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          78
        ],
        "brutto": 78,
        "toPar": 6,
        "par": 72,
        "fieldAvg": 8.78,
        "fieldN": 51,
        "vsField": -2.8,
        "diffVal": 10.9,
        "diffRank": 59,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Titleist Østlandstour",
        "name": "Østlandstour 2 - Skjeberg GK",
        "course": "Skjeberg GK",
        "date": "2026-05-23",
        "klasse": "HB",
        "holes": 18,
        "rounds": [
          97,
          87
        ],
        "brutto": 184,
        "toPar": 44,
        "par": 70,
        "fieldAvg": 13.31,
        "fieldN": 115,
        "vsField": 8.7,
        "diffVal": 13.5,
        "diffRank": 39,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Askim GK (KP1)",
        "course": "Askim GK",
        "date": "2026-05-16",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          76
        ],
        "brutto": 76,
        "toPar": 7,
        "par": 69,
        "fieldAvg": 7.93,
        "fieldN": 42,
        "vsField": -0.9,
        "diffVal": 11.6,
        "diffRank": 56,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Østmarka GK (KP1)",
        "course": "Østmarka GK",
        "date": "2026-05-14",
        "klasse": "G19",
        "holes": 18,
        "rounds": [
          98
        ],
        "brutto": 98,
        "toPar": 26,
        "par": 72,
        "fieldAvg": 16.4,
        "fieldN": 100,
        "vsField": 9.6,
        "diffVal": 19.4,
        "diffRank": 10,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Gamle Fredrikstad GK (Kp3)",
        "course": "Gamle Fredrikstad GK",
        "date": "2025-09-21",
        "klasse": "G19B",
        "holes": 18,
        "rounds": [
          86
        ],
        "brutto": 86,
        "toPar": 14,
        "par": 72,
        "fieldAvg": 15.63,
        "fieldN": 43,
        "vsField": -1.6,
        "diffVal": 15.3,
        "diffRank": 30,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour - Nes GK (KP3)",
        "course": "Nes GK",
        "date": "2025-09-20",
        "klasse": "G19B",
        "holes": 18,
        "rounds": [
          88
        ],
        "brutto": 88,
        "toPar": 16,
        "par": 72,
        "fieldAvg": 12.71,
        "fieldN": 41,
        "vsField": 3.3,
        "diffVal": 9.3,
        "diffRank": 62,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Oppegård GK (Kp3)",
        "course": "Oppegård GK",
        "date": "2025-08-16",
        "klasse": "G19B",
        "holes": 18,
        "rounds": [
          76
        ],
        "brutto": 76,
        "toPar": 5,
        "par": 71,
        "fieldAvg": 10.08,
        "fieldN": 37,
        "vsField": -5.1,
        "diffVal": 15.6,
        "diffRank": 29,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Hauger GK (Kp3)",
        "course": "Hauger GK",
        "date": "2025-08-15",
        "klasse": "G19B",
        "holes": 18,
        "rounds": [
          90
        ],
        "brutto": 90,
        "toPar": 18,
        "par": 72,
        "fieldAvg": 18.11,
        "fieldN": 37,
        "vsField": -0.1,
        "diffVal": 12.6,
        "diffRank": 49,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Onsøy GK (Kp2)",
        "course": "Onsøy GK",
        "date": "2025-08-10",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          85
        ],
        "brutto": 85,
        "toPar": 13,
        "par": 72,
        "fieldAvg": 18.49,
        "fieldN": 41,
        "vsField": -5.5,
        "diffVal": 14,
        "diffRank": 35,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Huseby & Hankø GK (Kp2)",
        "course": "Huseby & Hankø GK",
        "date": "2025-08-09",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          76
        ],
        "brutto": 76,
        "toPar": 8,
        "par": 68,
        "fieldAvg": 8,
        "fieldN": 33,
        "vsField": 0,
        "diffVal": 13.1,
        "diffRank": 45,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Mørk GK (Kp2)",
        "course": "Mørk GK",
        "date": "2025-08-03",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          90
        ],
        "brutto": 90,
        "toPar": 18,
        "par": 72,
        "fieldAvg": 15.2,
        "fieldN": 30,
        "vsField": 2.8,
        "diffVal": 16.7,
        "diffRank": 24,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Romerike GK (Kp2)",
        "course": "Romerike GK",
        "date": "2025-07-26",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          73
        ],
        "brutto": 73,
        "toPar": 1,
        "par": 72,
        "fieldAvg": 9.88,
        "fieldN": 33,
        "vsField": -8.9,
        "diffVal": 10.9,
        "diffRank": 58,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Halden GK (Kp1)",
        "course": "Halden GK",
        "date": "2025-05-31",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          85
        ],
        "brutto": 85,
        "toPar": 15,
        "par": 70,
        "fieldAvg": 10.49,
        "fieldN": 49,
        "vsField": 4.5,
        "diffVal": 11.4,
        "diffRank": 57,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Østmarka GK (Kp1)",
        "course": "Østmarka GK",
        "date": "2025-05-29",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          90
        ],
        "brutto": 90,
        "toPar": 18,
        "par": 72,
        "fieldAvg": 16.94,
        "fieldN": 66,
        "vsField": 1.1,
        "diffVal": 19.4,
        "diffRank": 10,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Hvaler GK (Kp1)",
        "course": "Hvaler GK",
        "date": "2025-05-25",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          89
        ],
        "brutto": 89,
        "toPar": 21,
        "par": 68,
        "fieldAvg": 17.63,
        "fieldN": 52,
        "vsField": 3.4,
        "diffVal": 20.2,
        "diffRank": 5,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Romerike GK (Kp1)",
        "course": "Romerike GK",
        "date": "2025-05-10",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          96
        ],
        "brutto": 96,
        "toPar": 24,
        "par": 72,
        "fieldAvg": 12.56,
        "fieldN": 54,
        "vsField": 11.4,
        "diffVal": 10.9,
        "diffRank": 58,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Skjeberg GK (Kp1)",
        "course": "Skjeberg GK",
        "date": "2025-04-27",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          96
        ],
        "brutto": 96,
        "toPar": 27,
        "par": 69,
        "fieldAvg": 21.85,
        "fieldN": 66,
        "vsField": 5.2,
        "diffVal": 13.5,
        "diffRank": 39,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Borregaard GK - (KP1)",
        "course": "",
        "date": "2025-04-26",
        "klasse": "G-19",
        "holes": 18,
        "rounds": [
          88
        ],
        "brutto": 88,
        "toPar": 23,
        "par": 65,
        "fieldAvg": 15.02,
        "fieldN": 45,
        "vsField": 8,
        "diffVal": 15.02,
        "diffRank": null,
        "diffLevel": "Middels-vanskelig"
      }
    ],
    "Viktoria Hammer": [
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour #4 (U19) - Skjeberg GK",
        "course": "Skjeberg GK",
        "date": "2026-06-06",
        "klasse": "J19",
        "holes": 18,
        "rounds": [
          71,
          74,
          75
        ],
        "brutto": 220,
        "toPar": 10,
        "par": 70,
        "fieldAvg": 9.67,
        "fieldN": 28,
        "vsField": -6.3,
        "diffVal": 13.5,
        "diffRank": 39,
        "diffLevel": "Middels"
      },
      {
        "tour": "Garmin Norges Cup",
        "name": "Garmin Norgescup #2 - Nes GK",
        "course": "Nes GK",
        "date": "2026-05-30",
        "klasse": "D",
        "holes": 18,
        "rounds": [
          76,
          73,
          76
        ],
        "brutto": 225,
        "toPar": 9,
        "par": 72,
        "fieldAvg": 3.54,
        "fieldN": 24,
        "vsField": -0.5,
        "diffVal": 9.3,
        "diffRank": 62,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour #3 Jr NM Match - Kongsberg GK",
        "course": "Kongsberg GK",
        "date": "2026-05-23",
        "klasse": "J19",
        "holes": 18,
        "rounds": [
          80,
          76
        ],
        "brutto": 156,
        "toPar": 12,
        "par": 72,
        "fieldAvg": 5.62,
        "fieldN": 20,
        "vsField": 0.4,
        "diffVal": 5.9,
        "diffRank": 70,
        "diffLevel": "Lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Askim GK (KP1)",
        "course": "Askim GK",
        "date": "2026-05-16",
        "klasse": "J19",
        "holes": 18,
        "rounds": [
          80
        ],
        "brutto": 80,
        "toPar": 11,
        "par": 69,
        "fieldAvg": 15.5,
        "fieldN": 6,
        "vsField": -4.5,
        "diffVal": 11.6,
        "diffRank": 56,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Østmarka GK (KP1)",
        "course": "Østmarka GK",
        "date": "2026-05-14",
        "klasse": "J19",
        "holes": 18,
        "rounds": [
          84
        ],
        "brutto": 84,
        "toPar": 12,
        "par": 72,
        "fieldAvg": 16.5,
        "fieldN": 8,
        "vsField": -4.5,
        "diffVal": 19.4,
        "diffRank": 10,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour #2 - Bjaavann GK",
        "course": "Bjaavann GK",
        "date": "2026-05-09",
        "klasse": "J19",
        "holes": 18,
        "rounds": [
          83,
          81,
          84
        ],
        "brutto": 248,
        "toPar": 32,
        "par": 72,
        "fieldAvg": 10.15,
        "fieldN": 18,
        "vsField": 0.5,
        "diffVal": 14.1,
        "diffRank": 34,
        "diffLevel": "Middels"
      },
      {
        "tour": "Garmin Norges Cup",
        "name": "Garmin Norgescup #1 - Haugaland GK",
        "course": "Haugaland GK",
        "date": "2026-05-02",
        "klasse": "D",
        "holes": 18,
        "rounds": [
          78,
          81,
          90
        ],
        "brutto": 249,
        "toPar": 33,
        "par": 72,
        "fieldAvg": 9.64,
        "fieldN": 15,
        "vsField": 1.4,
        "diffVal": 12.3,
        "diffRank": 50,
        "diffLevel": "Middels"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour #1 - Sola GK (Forus)",
        "course": "Sola GK",
        "date": "2026-04-25",
        "klasse": "J19",
        "holes": 18,
        "rounds": [
          81,
          77,
          80
        ],
        "brutto": 238,
        "toPar": 22,
        "par": 72,
        "fieldAvg": 11.09,
        "fieldN": 30,
        "vsField": -3.8,
        "diffVal": 11.7,
        "diffRank": 53,
        "diffLevel": "Middels"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour 8 (Finale) - Stavanger GK",
        "course": "Stavanger GK",
        "date": "2025-09-27",
        "klasse": "J19",
        "holes": 18,
        "rounds": [
          77,
          77,
          82
        ],
        "brutto": 236,
        "toPar": 23,
        "par": 71,
        "fieldAvg": 7.19,
        "fieldN": 18,
        "vsField": 0.5,
        "diffVal": 9.8,
        "diffRank": 61,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Gamle Fredrikstad GK (Kp3)",
        "course": "Gamle Fredrikstad GK",
        "date": "2025-09-21",
        "klasse": "J19B",
        "holes": 18,
        "rounds": [
          76
        ],
        "brutto": 76,
        "toPar": 4,
        "par": 72,
        "fieldAvg": 15.5,
        "fieldN": 6,
        "vsField": -11.5,
        "diffVal": 15.3,
        "diffRank": 30,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour - Nes GK (KP3)",
        "course": "Nes GK",
        "date": "2025-09-20",
        "klasse": "J19B",
        "holes": 18,
        "rounds": [
          75
        ],
        "brutto": 75,
        "toPar": 3,
        "par": 72,
        "fieldAvg": 11.29,
        "fieldN": 7,
        "vsField": -8.3,
        "diffVal": 9.3,
        "diffRank": 62,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour 7 - Stiklestad GK",
        "course": "Stiklestad GK",
        "date": "2025-09-13",
        "klasse": "J19",
        "holes": 18,
        "rounds": [
          78,
          75,
          78
        ],
        "brutto": 231,
        "toPar": 18,
        "par": 71,
        "fieldAvg": 8.88,
        "fieldN": 25,
        "vsField": -2.9,
        "diffVal": 9.2,
        "diffRank": 63,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour 6 - Nøtterøy GK",
        "course": "Nøtterøy GK",
        "date": "2025-08-30",
        "klasse": "J19",
        "holes": 18,
        "rounds": [
          88,
          82,
          77
        ],
        "brutto": 247,
        "toPar": 31,
        "par": 72,
        "fieldAvg": 11.74,
        "fieldN": 18,
        "vsField": -1.4,
        "diffVal": 13.3,
        "diffRank": 41,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Oppegård GK (Kp3)",
        "course": "Oppegård GK",
        "date": "2025-08-16",
        "klasse": "J19B",
        "holes": 18,
        "rounds": [
          82
        ],
        "brutto": 82,
        "toPar": 11,
        "par": 71,
        "fieldAvg": 23.71,
        "fieldN": 7,
        "vsField": -12.7,
        "diffVal": 15.6,
        "diffRank": 29,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour 5 - Kongsvingers GK",
        "course": "Kongsvingers GK",
        "date": "2025-08-14",
        "klasse": "J19",
        "holes": 18,
        "rounds": [
          82,
          83,
          83
        ],
        "brutto": 248,
        "toPar": 32,
        "par": 72,
        "fieldAvg": 10.93,
        "fieldN": 18,
        "vsField": -0.3,
        "diffVal": 6.5,
        "diffRank": 69,
        "diffLevel": "Lett"
      },
      {
        "tour": "Garmin Norges Cup",
        "name": "Norgesmesterskapet 2025 Haga GK",
        "course": "Haga GK",
        "date": "2025-08-07",
        "klasse": "D",
        "holes": 18,
        "rounds": [
          76,
          82,
          83,
          82
        ],
        "brutto": 323,
        "toPar": 39,
        "par": 71,
        "fieldAvg": 9.54,
        "fieldN": 42,
        "vsField": 0.2,
        "diffVal": 6.6,
        "diffRank": 68,
        "diffLevel": "Lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Mørk GK (Kp2)",
        "course": "Mørk GK",
        "date": "2025-08-03",
        "klasse": "J-19",
        "holes": 18,
        "rounds": [
          80
        ],
        "brutto": 80,
        "toPar": 8,
        "par": 72,
        "fieldAvg": null,
        "fieldN": null,
        "vsField": null,
        "diffVal": 16.7,
        "diffRank": 24,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Romerike GK (Kp2)",
        "course": "Romerike GK",
        "date": "2025-07-26",
        "klasse": "J-19",
        "holes": 18,
        "rounds": [
          74
        ],
        "brutto": 74,
        "toPar": 2,
        "par": 72,
        "fieldAvg": 5.8,
        "fieldN": 5,
        "vsField": -3.8,
        "diffVal": 10.9,
        "diffRank": 58,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Titleist Østlandstour",
        "name": "Titleist Østlandstour - Minitour - Bærum GK, Tyrifjord GK og Holtsmark GK - 3 runder - WAGR-tellende",
        "course": "",
        "date": "2025-07-04",
        "klasse": "BD",
        "holes": 18,
        "rounds": [
          81,
          81,
          83
        ],
        "brutto": 245,
        "toPar": 30,
        "par": 72,
        "fieldAvg": 9.56,
        "fieldN": 9,
        "vsField": 0.4,
        "diffVal": 9.56,
        "diffRank": null,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour 4 - Junior NM - Hauger GK",
        "course": "Hauger GK",
        "date": "2025-06-24",
        "klasse": "J19",
        "holes": 18,
        "rounds": [
          83,
          76,
          77
        ],
        "brutto": 236,
        "toPar": 20,
        "par": 72,
        "fieldAvg": 12.13,
        "fieldN": 38,
        "vsField": -5.5,
        "diffVal": 12.6,
        "diffRank": 49,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Mjøsen GK (Kp2)",
        "course": "Mjøsen GK",
        "date": "2025-06-14",
        "klasse": "J-19",
        "holes": 18,
        "rounds": [
          75
        ],
        "brutto": 75,
        "toPar": 5,
        "par": 70,
        "fieldAvg": 12.75,
        "fieldN": 4,
        "vsField": -7.8,
        "diffVal": 18.2,
        "diffRank": 16,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Halden GK (Kp1)",
        "course": "Halden GK",
        "date": "2025-05-31",
        "klasse": "J-19",
        "holes": 18,
        "rounds": [
          76
        ],
        "brutto": 76,
        "toPar": 6,
        "par": 70,
        "fieldAvg": 14,
        "fieldN": 7,
        "vsField": -8,
        "diffVal": 11.4,
        "diffRank": 57,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Østmarka GK (Kp1)",
        "course": "Østmarka GK",
        "date": "2025-05-29",
        "klasse": "J-19",
        "holes": 18,
        "rounds": [
          78
        ],
        "brutto": 78,
        "toPar": 6,
        "par": 72,
        "fieldAvg": 23.3,
        "fieldN": 10,
        "vsField": -17.3,
        "diffVal": 19.4,
        "diffRank": 10,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Hvaler GK (Kp1)",
        "course": "Hvaler GK",
        "date": "2025-05-25",
        "klasse": "J-19",
        "holes": 18,
        "rounds": [
          70
        ],
        "brutto": 70,
        "toPar": 2,
        "par": 68,
        "fieldAvg": 21.12,
        "fieldN": 8,
        "vsField": -19.1,
        "diffVal": 20.2,
        "diffRank": 5,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Romerike GK (Kp1)",
        "course": "Romerike GK",
        "date": "2025-05-10",
        "klasse": "J-19",
        "holes": 18,
        "rounds": [
          78
        ],
        "brutto": 78,
        "toPar": 6,
        "par": 72,
        "fieldAvg": 19.25,
        "fieldN": 8,
        "vsField": -13.2,
        "diffVal": 10.9,
        "diffRank": 58,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour 1 (U19) Bjaavann GK",
        "course": "Bjaavann GK",
        "date": "2025-05-03",
        "klasse": "J19",
        "holes": 18,
        "rounds": [
          89,
          97,
          82
        ],
        "brutto": 268,
        "toPar": 52,
        "par": 72,
        "fieldAvg": 16.25,
        "fieldN": 29,
        "vsField": 1.1,
        "diffVal": 14.1,
        "diffRank": 34,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Skjeberg GK (Kp1)",
        "course": "Skjeberg GK",
        "date": "2025-04-27",
        "klasse": "J-19",
        "holes": 18,
        "rounds": [
          79
        ],
        "brutto": 79,
        "toPar": 10,
        "par": 69,
        "fieldAvg": 26.14,
        "fieldN": 7,
        "vsField": -16.1,
        "diffVal": 13.5,
        "diffRank": 39,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Borregaard GK - (KP1)",
        "course": "",
        "date": "2025-04-26",
        "klasse": "J-19",
        "holes": 18,
        "rounds": [
          72
        ],
        "brutto": 72,
        "toPar": 7,
        "par": 65,
        "fieldAvg": 20.29,
        "fieldN": 7,
        "vsField": -13.3,
        "diffVal": 20.29,
        "diffRank": null,
        "diffLevel": "Vanskelig"
      }
    ],
    "Constanse Hauglid": [
      {
        "tour": "Srixon Tour",
        "name": "Srixon Tour #4 (U19) - Skjeberg GK",
        "course": "Skjeberg GK",
        "date": "2026-06-06",
        "klasse": "J19",
        "holes": 18,
        "rounds": [
          88,
          91,
          94
        ],
        "brutto": 273,
        "toPar": 63,
        "par": 70,
        "fieldAvg": 9.67,
        "fieldN": 28,
        "vsField": 11.3,
        "diffVal": 13.5,
        "diffRank": 39,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Halden GK (KP1)",
        "course": "Halden GK",
        "date": "2026-05-31",
        "klasse": "J19",
        "holes": 18,
        "rounds": [
          84
        ],
        "brutto": 84,
        "toPar": 14,
        "par": 70,
        "fieldAvg": 10.83,
        "fieldN": 6,
        "vsField": 3.2,
        "diffVal": 11.4,
        "diffRank": 57,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Grønmo GK (KP1)",
        "course": "Grønmo GK",
        "date": "2026-05-30",
        "klasse": "J19",
        "holes": 18,
        "rounds": [
          84
        ],
        "brutto": 84,
        "toPar": 12,
        "par": 72,
        "fieldAvg": 8.17,
        "fieldN": 6,
        "vsField": 3.8,
        "diffVal": 10.9,
        "diffRank": 59,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Askim GK (KP1)",
        "course": "Askim GK",
        "date": "2026-05-16",
        "klasse": "J19",
        "holes": 18,
        "rounds": [
          87
        ],
        "brutto": 87,
        "toPar": 18,
        "par": 69,
        "fieldAvg": 15.5,
        "fieldN": 6,
        "vsField": 2.5,
        "diffVal": 11.6,
        "diffRank": 56,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Østmarka GK (KP1)",
        "course": "Østmarka GK",
        "date": "2026-05-14",
        "klasse": "J19",
        "holes": 18,
        "rounds": [
          82
        ],
        "brutto": 82,
        "toPar": 10,
        "par": 72,
        "fieldAvg": 16.5,
        "fieldN": 8,
        "vsField": -6.5,
        "diffVal": 19.4,
        "diffRank": 10,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Gamle Fredrikstad GK (Kp3)",
        "course": "Gamle Fredrikstad GK",
        "date": "2025-09-21",
        "klasse": "J19B",
        "holes": 18,
        "rounds": [
          88
        ],
        "brutto": 88,
        "toPar": 16,
        "par": 72,
        "fieldAvg": 15.5,
        "fieldN": 6,
        "vsField": 0.5,
        "diffVal": 15.3,
        "diffRank": 30,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour - Nes GK (KP3)",
        "course": "Nes GK",
        "date": "2025-09-20",
        "klasse": "J19B",
        "holes": 18,
        "rounds": [
          91
        ],
        "brutto": 91,
        "toPar": 19,
        "par": 72,
        "fieldAvg": 11.29,
        "fieldN": 7,
        "vsField": 7.7,
        "diffVal": 9.3,
        "diffRank": 62,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Oppegård GK (Kp3)",
        "course": "Oppegård GK",
        "date": "2025-08-16",
        "klasse": "J19B",
        "holes": 18,
        "rounds": [
          95
        ],
        "brutto": 95,
        "toPar": 24,
        "par": 71,
        "fieldAvg": 23.71,
        "fieldN": 7,
        "vsField": 0.3,
        "diffVal": 15.6,
        "diffRank": 29,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Onsøy GK (Kp2)",
        "course": "Onsøy GK",
        "date": "2025-08-10",
        "klasse": "J-19",
        "holes": 18,
        "rounds": [
          94
        ],
        "brutto": 94,
        "toPar": 22,
        "par": 72,
        "fieldAvg": 22.8,
        "fieldN": 5,
        "vsField": -0.8,
        "diffVal": 14,
        "diffRank": 35,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Huseby & Hankø GK (Kp2)",
        "course": "Huseby & Hankø GK",
        "date": "2025-08-09",
        "klasse": "J-19",
        "holes": 18,
        "rounds": [
          87
        ],
        "brutto": 87,
        "toPar": 19,
        "par": 68,
        "fieldAvg": 20.4,
        "fieldN": 5,
        "vsField": -1.4,
        "diffVal": 13.1,
        "diffRank": 45,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Mørk GK (Kp2)",
        "course": "Mørk GK",
        "date": "2025-08-03",
        "klasse": "J-19",
        "holes": 18,
        "rounds": [
          96
        ],
        "brutto": 96,
        "toPar": 24,
        "par": 72,
        "fieldAvg": null,
        "fieldN": null,
        "vsField": null,
        "diffVal": 16.7,
        "diffRank": 24,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Halden GK (Kp1)",
        "course": "Halden GK",
        "date": "2025-05-31",
        "klasse": "J-19",
        "holes": 18,
        "rounds": [
          85
        ],
        "brutto": 85,
        "toPar": 15,
        "par": 70,
        "fieldAvg": 14,
        "fieldN": 7,
        "vsField": 1,
        "diffVal": 11.4,
        "diffRank": 57,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Østmarka GK (Kp1)",
        "course": "Østmarka GK",
        "date": "2025-05-29",
        "klasse": "J-19",
        "holes": 18,
        "rounds": [
          96
        ],
        "brutto": 96,
        "toPar": 24,
        "par": 72,
        "fieldAvg": 23.3,
        "fieldN": 10,
        "vsField": 0.7,
        "diffVal": 19.4,
        "diffRank": 10,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Hvaler GK (Kp1)",
        "course": "Hvaler GK",
        "date": "2025-05-25",
        "klasse": "J-19",
        "holes": 18,
        "rounds": [
          88
        ],
        "brutto": 88,
        "toPar": 20,
        "par": 68,
        "fieldAvg": 21.12,
        "fieldN": 8,
        "vsField": -1.1,
        "diffVal": 20.2,
        "diffRank": 5,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Romerike GK (Kp1)",
        "course": "Romerike GK",
        "date": "2025-05-10",
        "klasse": "J-19",
        "holes": 18,
        "rounds": [
          91
        ],
        "brutto": 91,
        "toPar": 19,
        "par": 72,
        "fieldAvg": 19.25,
        "fieldN": 8,
        "vsField": -0.2,
        "diffVal": 10.9,
        "diffRank": 58,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Skjeberg GK (Kp1)",
        "course": "Skjeberg GK",
        "date": "2025-04-27",
        "klasse": "J-19",
        "holes": 18,
        "rounds": [
          97
        ],
        "brutto": 97,
        "toPar": 28,
        "par": 69,
        "fieldAvg": 26.14,
        "fieldN": 7,
        "vsField": 1.9,
        "diffVal": 13.5,
        "diffRank": 39,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Borregaard GK - (KP1)",
        "course": "",
        "date": "2025-04-26",
        "klasse": "J-19",
        "holes": 18,
        "rounds": [
          89
        ],
        "brutto": 89,
        "toPar": 24,
        "par": 65,
        "fieldAvg": 20.29,
        "fieldN": 7,
        "vsField": 3.7,
        "diffVal": 20.29,
        "diffRank": null,
        "diffLevel": "Vanskelig"
      }
    ],
    "Sonja Sofie Sinding": [
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Halden GK (KP1)",
        "course": "Halden GK",
        "date": "2026-05-31",
        "klasse": "J15",
        "holes": 18,
        "rounds": [
          98
        ],
        "brutto": 98,
        "toPar": 28,
        "par": 70,
        "fieldAvg": 21.8,
        "fieldN": 5,
        "vsField": 6.2,
        "diffVal": 11.4,
        "diffRank": 57,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Grønmo GK (KP1)",
        "course": "Grønmo GK",
        "date": "2026-05-30",
        "klasse": "J15",
        "holes": 18,
        "rounds": [
          102
        ],
        "brutto": 102,
        "toPar": 30,
        "par": 72,
        "fieldAvg": 27.14,
        "fieldN": 7,
        "vsField": 2.9,
        "diffVal": 10.9,
        "diffRank": 59,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Askim GK (KP1)",
        "course": "Askim GK",
        "date": "2026-05-16",
        "klasse": "J15",
        "holes": 18,
        "rounds": [
          84
        ],
        "brutto": 84,
        "toPar": 15,
        "par": 69,
        "fieldAvg": 20,
        "fieldN": 7,
        "vsField": -5,
        "diffVal": 11.6,
        "diffRank": 56,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Østmarka GK (KP1)",
        "course": "Østmarka GK",
        "date": "2026-05-14",
        "klasse": "J15",
        "holes": 18,
        "rounds": [
          98
        ],
        "brutto": 98,
        "toPar": 26,
        "par": 72,
        "fieldAvg": 20.12,
        "fieldN": 8,
        "vsField": 5.9,
        "diffVal": 19.4,
        "diffRank": 10,
        "diffLevel": "Vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Gamle Fredrikstad GK (Kp3)",
        "course": "Gamle Fredrikstad GK",
        "date": "2025-09-21",
        "klasse": "J15B",
        "holes": 18,
        "rounds": [
          103
        ],
        "brutto": 103,
        "toPar": 31,
        "par": 72,
        "fieldAvg": 18.29,
        "fieldN": 7,
        "vsField": 12.7,
        "diffVal": 15.3,
        "diffRank": 30,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour - Nes GK (KP3)",
        "course": "Nes GK",
        "date": "2025-09-20",
        "klasse": "J15B",
        "holes": 18,
        "rounds": [
          104
        ],
        "brutto": 104,
        "toPar": 32,
        "par": 72,
        "fieldAvg": 19.43,
        "fieldN": 7,
        "vsField": 12.6,
        "diffVal": 9.3,
        "diffRank": 62,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Oppegård GK (Kp3)",
        "course": "Oppegård GK",
        "date": "2025-08-16",
        "klasse": "J15B",
        "holes": 18,
        "rounds": [
          116
        ],
        "brutto": 116,
        "toPar": 45,
        "par": 71,
        "fieldAvg": 20.67,
        "fieldN": 6,
        "vsField": 24.3,
        "diffVal": 15.6,
        "diffRank": 29,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Juniortour Hauger GK (Kp3)",
        "course": "Hauger GK",
        "date": "2025-08-15",
        "klasse": "J15B",
        "holes": 18,
        "rounds": [
          105
        ],
        "brutto": 105,
        "toPar": 33,
        "par": 72,
        "fieldAvg": 26.6,
        "fieldN": 5,
        "vsField": 6.4,
        "diffVal": 12.6,
        "diffRank": 49,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Onsøy GK (Kp2)",
        "course": "Onsøy GK",
        "date": "2025-08-10",
        "klasse": "J-15",
        "holes": 18,
        "rounds": [
          103
        ],
        "brutto": 103,
        "toPar": 31,
        "par": 72,
        "fieldAvg": 31.8,
        "fieldN": 5,
        "vsField": -0.8,
        "diffVal": 14,
        "diffRank": 35,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Huseby & Hankø GK (Kp2)",
        "course": "Huseby & Hankø GK",
        "date": "2025-08-09",
        "klasse": "J-15",
        "holes": 18,
        "rounds": [
          99
        ],
        "brutto": 99,
        "toPar": 31,
        "par": 68,
        "fieldAvg": 22.86,
        "fieldN": 7,
        "vsField": 8.1,
        "diffVal": 13.1,
        "diffRank": 45,
        "diffLevel": "Middels"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Mørk GK (Kp2)",
        "course": "Mørk GK",
        "date": "2025-08-03",
        "klasse": "J-15",
        "holes": 18,
        "rounds": [
          121
        ],
        "brutto": 121,
        "toPar": 49,
        "par": 72,
        "fieldAvg": 33.75,
        "fieldN": 4,
        "vsField": 15.2,
        "diffVal": 16.7,
        "diffRank": 24,
        "diffLevel": "Middels-vanskelig"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Romerike GK (Kp2)",
        "course": "Romerike GK",
        "date": "2025-07-26",
        "klasse": "J-15",
        "holes": 18,
        "rounds": [
          101
        ],
        "brutto": 101,
        "toPar": 29,
        "par": 72,
        "fieldAvg": null,
        "fieldN": null,
        "vsField": null,
        "diffVal": 10.9,
        "diffRank": 58,
        "diffLevel": "Middels-lett"
      },
      {
        "tour": "Olyo Tour",
        "name": "Olyo Junior Tour - Losby GK (Kp2)",
        "course": "Losby GK",
        "date": "2025-06-28",
        "klasse": "J-15",
        "holes": 18,
        "rounds": [
          121
        ],
        "brutto": 121,
        "toPar": 49,
        "par": 72,
        "fieldAvg": 26.4,
        "fieldN": 5,
        "vsField": 22.6,
        "diffVal": 18.8,
        "diffRank": 12,
        "diffLevel": "Middels-vanskelig"
      }
    ]
  },
  "courses": [
    {
      "name": "Tønsberg GK",
      "rank": 1,
      "val": 23.2,
      "rounds": 68
    },
    {
      "name": "Preikestolen GK",
      "rank": 2,
      "val": 22.7,
      "rounds": 21
    },
    {
      "name": "Ogna GK",
      "rank": 3,
      "val": 21.7,
      "rounds": 108
    },
    {
      "name": "Jæren GK",
      "rank": 4,
      "val": 21.2,
      "rounds": 61
    },
    {
      "name": "Hvaler GK",
      "rank": 5,
      "val": 20.2,
      "rounds": 95
    },
    {
      "name": "Trondheim GK",
      "rank": 6,
      "val": 20,
      "rounds": 26
    },
    {
      "name": "Tjøme GK",
      "rank": 7,
      "val": 19.6,
      "rounds": 54
    },
    {
      "name": "Nordvegen GK",
      "rank": 8,
      "val": 19.4,
      "rounds": 36
    },
    {
      "name": "Arendal & Omegn GK",
      "rank": 9,
      "val": 19.4,
      "rounds": 56
    },
    {
      "name": "Østmarka GK",
      "rank": 10,
      "val": 19.4,
      "rounds": 312
    },
    {
      "name": "Asker GK",
      "rank": 11,
      "val": 19.1,
      "rounds": 112
    },
    {
      "name": "Losby GK",
      "rank": 12,
      "val": 18.8,
      "rounds": 84
    },
    {
      "name": "Ålesund GK",
      "rank": 13,
      "val": 18.7,
      "rounds": 79
    },
    {
      "name": "Borre GK",
      "rank": 14,
      "val": 18.3,
      "rounds": 131
    },
    {
      "name": "Drammen GK",
      "rank": 15,
      "val": 18.3,
      "rounds": 90
    },
    {
      "name": "Mjøsen GK",
      "rank": 16,
      "val": 18.2,
      "rounds": 67
    },
    {
      "name": "Utsikten GK",
      "rank": 17,
      "val": 17.7,
      "rounds": 30
    },
    {
      "name": "Grimstad GK",
      "rank": 18,
      "val": 17.5,
      "rounds": 107
    },
    {
      "name": "Bamble GK",
      "rank": 19,
      "val": 17.5,
      "rounds": 42
    },
    {
      "name": "Molde GK",
      "rank": 20,
      "val": 17.3,
      "rounds": 56
    },
    {
      "name": "Grenland & Omegn GK",
      "rank": 21,
      "val": 16.8,
      "rounds": 133
    },
    {
      "name": "Hof GK",
      "rank": 22,
      "val": 16.8,
      "rounds": 55
    },
    {
      "name": "Oslo GK",
      "rank": 23,
      "val": 16.7,
      "rounds": 321
    },
    {
      "name": "Mørk GK",
      "rank": 24,
      "val": 16.7,
      "rounds": 59
    },
    {
      "name": "Bærum GK",
      "rank": 25,
      "val": 16.7,
      "rounds": 168
    },
    {
      "name": "Sirdal GK",
      "rank": 26,
      "val": 16.6,
      "rounds": 22
    },
    {
      "name": "Fana GK",
      "rank": 27,
      "val": 16.5,
      "rounds": 138
    },
    {
      "name": "Bergen GK",
      "rank": 28,
      "val": 16.1,
      "rounds": 139
    },
    {
      "name": "Oppegård GK",
      "rank": 29,
      "val": 15.6,
      "rounds": 82
    },
    {
      "name": "Gamle Fredrikstad GK",
      "rank": 30,
      "val": 15.3,
      "rounds": 96
    },
    {
      "name": "Larvik GK",
      "rank": 31,
      "val": 14.5,
      "rounds": 124
    },
    {
      "name": "Stord GK",
      "rank": 32,
      "val": 14.4,
      "rounds": 25
    },
    {
      "name": "Sandefjord GK",
      "rank": 33,
      "val": 14.4,
      "rounds": 113
    },
    {
      "name": "Bjaavann GK",
      "rank": 34,
      "val": 14.1,
      "rounds": 270
    },
    {
      "name": "Onsøy GK",
      "rank": 35,
      "val": 14,
      "rounds": 192
    },
    {
      "name": "Tyrifjord GK",
      "rank": 36,
      "val": 13.7,
      "rounds": 141
    },
    {
      "name": "Bjørnefjorden GK",
      "rank": 37,
      "val": 13.6,
      "rounds": 82
    },
    {
      "name": "Solastranden GK",
      "rank": 38,
      "val": 13.6,
      "rounds": 101
    },
    {
      "name": "Skjeberg GK",
      "rank": 39,
      "val": 13.5,
      "rounds": 320
    },
    {
      "name": "Volda GK",
      "rank": 40,
      "val": 13.4,
      "rounds": 15
    },
    {
      "name": "Nøtterøy GK",
      "rank": 41,
      "val": 13.3,
      "rounds": 272
    },
    {
      "name": "Solum GK",
      "rank": 42,
      "val": 13.3,
      "rounds": 59
    },
    {
      "name": "Surnadal GK",
      "rank": 43,
      "val": 13.2,
      "rounds": 49
    },
    {
      "name": "Vrådal GK",
      "rank": 44,
      "val": 13.1,
      "rounds": 63
    },
    {
      "name": "Huseby & Hankø GK",
      "rank": 45,
      "val": 13.1,
      "rounds": 67
    },
    {
      "name": "Stjørdal GK",
      "rank": 46,
      "val": 12.7,
      "rounds": 22
    },
    {
      "name": "Meland GK",
      "rank": 47,
      "val": 12.7,
      "rounds": 171
    },
    {
      "name": "Kristiansand GK",
      "rank": 48,
      "val": 12.7,
      "rounds": 127
    },
    {
      "name": "Hauger GK",
      "rank": 49,
      "val": 12.6,
      "rounds": 197
    },
    {
      "name": "Haugaland GK",
      "rank": 50,
      "val": 12.3,
      "rounds": 141
    },
    {
      "name": "Sunnfjord GK",
      "rank": 51,
      "val": 12.1,
      "rounds": 36
    },
    {
      "name": "Sandnes GK",
      "rank": 52,
      "val": 12,
      "rounds": 180
    },
    {
      "name": "Sola GK",
      "rank": 53,
      "val": 11.7,
      "rounds": 305
    },
    {
      "name": "Kjekstad GK",
      "rank": 54,
      "val": 11.7,
      "rounds": 263
    },
    {
      "name": "Norsjø GK",
      "rank": 55,
      "val": 11.6,
      "rounds": 136
    },
    {
      "name": "Askim GK",
      "rank": 56,
      "val": 11.6,
      "rounds": 79
    },
    {
      "name": "Halden GK",
      "rank": 57,
      "val": 11.4,
      "rounds": 167
    },
    {
      "name": "Romerike GK",
      "rank": 58,
      "val": 10.9,
      "rounds": 202
    },
    {
      "name": "Grønmo GK",
      "rank": 59,
      "val": 10.9,
      "rounds": 91
    },
    {
      "name": "Hakadal GK",
      "rank": 60,
      "val": 10.2,
      "rounds": 100
    },
    {
      "name": "Stavanger GK",
      "rank": 61,
      "val": 9.8,
      "rounds": 184
    },
    {
      "name": "Nes GK",
      "rank": 62,
      "val": 9.3,
      "rounds": 187
    },
    {
      "name": "Stiklestad GK",
      "rank": 63,
      "val": 9.2,
      "rounds": 109
    },
    {
      "name": "Voss GK",
      "rank": 64,
      "val": 8.6,
      "rounds": 48
    },
    {
      "name": "Borregaard GK",
      "rank": 65,
      "val": 8.5,
      "rounds": 48
    },
    {
      "name": "Elverum GK",
      "rank": 66,
      "val": 7.8,
      "rounds": 99
    },
    {
      "name": "Byneset GK",
      "rank": 67,
      "val": 7.5,
      "rounds": 166
    },
    {
      "name": "Haga GK",
      "rank": 68,
      "val": 6.6,
      "rounds": 156
    },
    {
      "name": "Kongsvingers GK",
      "rank": 69,
      "val": 6.5,
      "rounds": 88
    },
    {
      "name": "Kongsberg GK",
      "rank": 70,
      "val": 5.9,
      "rounds": 80
    },
    {
      "name": "Holtsmark GK",
      "rank": 71,
      "val": 4.6,
      "rounds": 82
    }
  ]
};
