# 08 — Demo Data

Konsistente mock-data for hele prototypen. Bruk samme person/tall overalt — det skaper realisme.

---

## HOVEDSPILLER — Øyvind Rohjan

**Hvor brukes:**
- PlayerHQ Workbench (hver gang vi viser "logget inn spiller")
- Coach Workbench (default valgt spiller når Anders logger inn)
- Spiller-listene (Øyvind står øverst)
- Alle "din profil"-skjermer i PlayerHQ

### Personlig info
```json
{
  "id": "oyvind-rohjan",
  "name": "Øyvind Rohjan",
  "email": "oyvind.rohjan@example.com",
  "phone": "+47 911 23 456",
  "dateOfBirth": "1995-03-14",
  "avatarUrl": null,
  "avatarInitials": "ØR",
  "avatarBg": "#005840"
}
```

### Spiller-profil
```json
{
  "role": "PLAYER",
  "tier": "PRO",
  "homeClub": "GFGK",
  "school": null,
  "playingYears": 18,
  "ambition": "Bli A1-nivå, spille topp-amatør NM",
  "ngfKategori": "A1",
  "requiresGuardianConsent": false,
  "userStatus": "AKTIV"
}
```

### Statistikk
```json
{
  "hcp": -2.1,
  "hcpTrend": 0.3,
  "hcp12mAgo": 8.2,
  "hcpUtvikling": [
    { "date": "2025-06-01", "hcp": 8.2 },
    { "date": "2025-09-01", "hcp": 5.1 },
    { "date": "2025-12-01", "hcp": 2.4 },
    { "date": "2026-03-01", "hcp": 0.1 },
    { "date": "2026-05-25", "hcp": -2.1 }
  ],
  "snittScoreSiste10": 71.3,
  "prevSeasonAvgScore": 73
}
```

### Strokes Gained (siste 5 runder)
```json
{
  "sgTotal": 1.0,
  "sgOtt": 0.8,
  "sgApp": 0.4,
  "sgArg": -0.2,
  "sgPutt": -1.4,
  "benchmark": "A1",
  "trend": "OPP"
}
```

### Aktive treningsplan
```json
{
  "id": "plan-var-2026",
  "name": "Vår 2026 — Spesialisering",
  "startDate": "2026-04-21",
  "endDate": "2026-06-15",
  "weeksTotal": 8,
  "currentWeek": 5,
  "adherence": 0.87,
  "ukentligAdherence": [
    { "uke": 17, "fullført": 3, "total": 3 },
    { "uke": 18, "fullført": 3, "total": 3 },
    { "uke": 19, "fullført": 2, "total": 3 },
    { "uke": 20, "fullført": 3, "total": 3 }
  ]
}
```

### Pyramide-fordeling (siste 30 dager)
```json
{
  "fys": 35,
  "tek": 40,
  "slag": 15,
  "spill": 8,
  "turn": 2
}
```

### Neste turnering
```json
{
  "id": "sorlandsapent-2026",
  "name": "Sørlandsåpent",
  "startDate": "2026-05-28",
  "endDate": "2026-05-30",
  "location": "Kristiansand GK",
  "format": "54 huller stroke play",
  "daysUntil": 3
}
```

### Forberedelse-status (4-punkts checklist)
```json
{
  "planOppdatert": true,
  "reiseBooket": true,
  "baneRecon": false,
  "mentalForberedelse": false
}
```

### Coach
```json
{
  "id": "anders-kristiansen",
  "name": "Anders Kristiansen",
  "role": "HEAD_COACH"
}
```

### Tester
```json
{
  "gjennomført": 12,
  "totalt": 36,
  "overdue": 2,
  "overdueListe": [
    { "id": "cmj-test", "name": "CMJ-test", "daysOverdue": 14 },
    { "id": "putt-konsistens", "name": "Putt-konsistens 50m", "daysOverdue": 7 }
  ]
}
```

### Aktive mål
```json
[
  { "id": "g1", "name": "HCP -3 i 2026", "progress": 0.7 },
  { "id": "g2", "name": "Topp-10 NM", "progress": 0.3 },
  { "id": "g3", "name": "Drive 280m carry", "progress": 0.9 }
]
```

### TrackMan-sesjon (siste)
```json
{
  "id": "tm-2026-05-19",
  "date": "2026-05-19",
  "clubheadSpeedAvg": 105,
  "ballSpeedAvg": 156,
  "launchAngleAvg": 12.4,
  "spinRateAvg": 2400,
  "carryAvg": 272,
  "totalAvg": 295
}
```

### Treningskompis
```json
{
  "id": "tobias-h",
  "name": "Tobias Hansen",
  "akademi": "GFGK Elite"
}
```

---

## ANDRE SPILLERE

### Markus Roinaas Pedersen
```json
{
  "id": "markus-rp",
  "name": "Markus Roinaas Pedersen",
  "email": "markus@example.com",
  "dateOfBirth": "2012-04-15",
  "alder": 14,
  "requiresGuardianConsent": true,
  "ngfKategori": "B1",
  "tier": "PRO",
  "homeClub": "GFGK",
  "school": "GFGK Junior Elite U19",
  "hcp": 4.2,
  "hcpTrend": -0.5,
  "foreldre": [
    { "name": "Anders Pedersen", "email": "anders.pedersen@example.com" },
    { "name": "Bente Pedersen", "email": "bente.pedersen@example.com" }
  ],
  "coach": "Anders Kristiansen",
  "sgTotal": -2.4,
  "planAdherence": 0.67,
  "status": "Trenger oppfølging",
  "varselFlagg": "SG-PUTT -1.6 siste 5 runder"
}
```

### Sofie Larsen
```json
{
  "id": "sofie-larsen",
  "name": "Sofie Larsen",
  "dateOfBirth": "2009-08-22",
  "alder": 16,
  "requiresGuardianConsent": false,
  "ngfKategori": "A2",
  "tier": "PRO",
  "homeClub": "GFGK",
  "hcp": 0.8,
  "hcpTrend": -0.2,
  "foreldre": [
    { "name": "Linda Larsen", "email": "linda@example.com" }
  ],
  "sgTotal": 0.6,
  "planAdherence": 0.95,
  "status": "Aktiv"
}
```

### Tobias Hansen
```json
{
  "id": "tobias-h",
  "name": "Tobias Hansen",
  "dateOfBirth": "2013-01-10",
  "alder": 13,
  "requiresGuardianConsent": true,
  "ngfKategori": "B2",
  "tier": "PRO",
  "homeClub": "GFGK",
  "hcp": 8.5,
  "hcpTrend": -1.2,
  "foreldre": [{ "name": "Erik Hansen", "email": "erik@example.com" }],
  "sgTotal": -3.2,
  "planAdherence": 0.8,
  "status": "Aktiv"
}
```

### Liam Simensen
```json
{
  "id": "liam-s",
  "name": "Liam Simensen",
  "dateOfBirth": "2014-09-03",
  "alder": 11,
  "requiresGuardianConsent": true,
  "ngfKategori": "B2",
  "hcp": 12.0,
  "foreldre": [{ "name": "Connie Simensen", "email": "connie@example.com" }],
  "status": "Aktiv"
}
```

### Aksel Eilefsen
```json
{
  "id": "aksel-e",
  "name": "Aksel Eilefsen",
  "dateOfBirth": "2014-05-19",
  "alder": 11,
  "requiresGuardianConsent": true,
  "ngfKategori": "B2",
  "hcp": 18.5,
  "foreldre": [{ "name": "Espen Eilefsen", "email": "espen@example.com" }],
  "status": "Inaktiv 30d",
  "varselFlagg": "Vinn-tilbake-kandidat"
}
```

---

## DEMO-COACH

### Anders Kristiansen (Head Coach)
```json
{
  "id": "anders-kristiansen",
  "name": "Anders Kristiansen",
  "email": "anders@akgolf.no",
  "role": "HEAD_COACH",
  "tier": "PRO",
  "klubb": "GFGK",
  "sertifiseringer": ["TPI Level 2", "PGA Pro", "Norges Trenerakademi 3"],
  "ai_assistent": "Caddie (aktiv)"
}
```

---

## DEMO-FORELDER

### Anders Pedersen (forelder til Markus)
```json
{
  "id": "anders-pedersen",
  "name": "Anders Pedersen",
  "email": "anders.pedersen@example.com",
  "phone": "+47 922 33 444",
  "role": "PARENT",
  "barn": [
    { "playerId": "markus-rp", "relation": "FAR" }
  ]
}
```

---

## DEMO-GRUPPER

```json
[
  {
    "id": "gfgk-elite-u19",
    "name": "GFGK Junior Elite U19",
    "coachId": "anders-kristiansen",
    "members": ["sofie-larsen", "max-r"],
    "pyramideFordeling": { "fys": 30, "tek": 35, "slag": 20, "spill": 10, "turn": 5 }
  },
  {
    "id": "gfgk-utvikling-u15",
    "name": "GFGK Junior Utvikling U15",
    "coachId": "anders-kristiansen",
    "members": ["markus-rp", "tobias-h"]
  },
  {
    "id": "gfgk-basis-u13",
    "name": "GFGK Junior Basis U13",
    "coachId": "anders-kristiansen",
    "members": []
  },
  {
    "id": "gfgk-mini-u10",
    "name": "GFGK Junior Mini U10",
    "coachId": "anders-kristiansen",
    "members": ["aksel-e", "liam-s"]
  },
  {
    "id": "wang-toppidrett",
    "name": "WANG Toppidrett Fredrikstad",
    "coachId": "anders-kristiansen",
    "members": ["oyvind-rohjan"]
  }
]
```

---

## DEMO-RUNDER (Øyvind, siste 5)

```json
[
  {
    "id": "rd-2026-05-23",
    "userId": "oyvind-rohjan",
    "playedAt": "2026-05-23",
    "courseName": "Kristiansand GK",
    "score": 71,
    "par": 72,
    "sgTotal": 1.4,
    "sgOtt": 0.9,
    "sgApp": 0.5,
    "sgArg": 0.1,
    "sgPutt": -0.1
  },
  {
    "id": "rd-2026-05-18",
    "userId": "oyvind-rohjan",
    "playedAt": "2026-05-18",
    "courseName": "GFGK",
    "score": 72,
    "par": 72,
    "sgTotal": 0.6,
    "sgOtt": 1.1,
    "sgApp": 0.2,
    "sgArg": -0.3,
    "sgPutt": -0.4
  },
  {
    "id": "rd-2026-05-12",
    "userId": "oyvind-rohjan",
    "playedAt": "2026-05-12",
    "courseName": "Larvik GK",
    "score": 74,
    "par": 72,
    "sgTotal": -1.2,
    "sgOtt": 0.4,
    "sgApp": -0.1,
    "sgArg": -0.4,
    "sgPutt": -1.1
  },
  {
    "id": "rd-2026-05-05",
    "userId": "oyvind-rohjan",
    "playedAt": "2026-05-05",
    "courseName": "GFGK",
    "score": 73,
    "par": 72,
    "sgTotal": 0.2,
    "sgOtt": 0.7,
    "sgApp": 0.6,
    "sgArg": 0.4,
    "sgPutt": -1.5
  },
  {
    "id": "rd-2026-04-28",
    "userId": "oyvind-rohjan",
    "playedAt": "2026-04-28",
    "courseName": "Kristiansand GK",
    "score": 70,
    "par": 72,
    "sgTotal": 1.6,
    "sgOtt": 1.0,
    "sgApp": 0.5,
    "sgArg": 0.4,
    "sgPutt": -0.3
  }
]
```

---

## DEMO-ØKTER (Øyvind, denne uka)

```json
[
  {
    "id": "okt-1",
    "playerId": "oyvind-rohjan",
    "title": "TEK · Sving-arbeid",
    "startTime": "2026-05-26T09:00:00",
    "endTime": "2026-05-26T10:30:00",
    "pyramidArea": "TEK",
    "location": "GFGK Performance Studio",
    "status": "PLANNED",
    "drills": ["Gate-drill 50cm", "Avstandskontroll 50m"]
  },
  {
    "id": "okt-2",
    "playerId": "oyvind-rohjan",
    "title": "FYS · Power",
    "startTime": "2026-05-26T14:00:00",
    "endTime": "2026-05-26T15:00:00",
    "pyramidArea": "FYS",
    "location": "Mulligan Studio Gym",
    "status": "PLANNED",
    "drills": ["Kettlebell swing", "Box jumps"]
  },
  {
    "id": "okt-3",
    "playerId": "oyvind-rohjan",
    "title": "SLAG · Driver-arbeid",
    "startTime": "2026-05-27T10:00:00",
    "endTime": "2026-05-27T11:30:00",
    "pyramidArea": "SLAG",
    "location": "GFGK Driving Range"
  },
  {
    "id": "okt-4",
    "playerId": "oyvind-rohjan",
    "title": "SPILL · 9 huller",
    "startTime": "2026-05-28T08:00:00",
    "endTime": "2026-05-28T11:00:00",
    "pyramidArea": "SPILL",
    "location": "Kristiansand GK"
  }
]
```

---

## DEMO-MELDINGER

```json
[
  {
    "id": "msg-1",
    "from": "anders-kristiansen",
    "to": "oyvind-rohjan",
    "date": "2026-05-24",
    "subject": "Forberedelse til Sørlandsåpent",
    "body": "Hei Øyvind, husk å logge alle runder denne uka..."
  },
  {
    "id": "msg-2",
    "from": "oyvind-rohjan",
    "to": "anders-kristiansen",
    "date": "2026-05-23",
    "subject": "Spørsmål om putting-rutine",
    "body": "Hei Anders, har sliter med 5-15m..."
  }
]
```

---

## REGEL FOR PROTOTYPER

**Konsistens:**
- Øyvind sitt avatar er det samme overalt
- Hans HCP-trend (+0.3) vises samme på Workbench + Coach Workbench
- Hans tall i SG-radar er identisk på alle skjermer
- Demo-datoer relative til "i dag" (2026-05-25)

**Når nye spillere vises:**
- Bruk navn fra dette dokumentet — ikke "Spiller 1", "Test 2"
- Bruk samme avatarbg-farger
- Konsistent språk i alle datafelt

**Aldri vis:**
- Lorem ipsum
- "Test test test"
- "@example.com" som tilfeldige e-poster (bruk de definert her)
- Tilfeldige bilder (bruk avatar-fallback med initialer)
