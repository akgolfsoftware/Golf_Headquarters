/* AgencyOS runde 9 — AG-19…AG-24. Bare demodata. Lørdag 26.09.2026. Økonomitall er demodata med Tripletex-format, ikke ekte regnskap. */
window.AG_DATA4 = {
  runs: [
    { id: "j1", agent: "Belastningsagent", skill: "acwr-sjekk", st: "Venter på coach", t: "13:48", dur: "4 s", out: "Endring i plan + melding til Tobias Lindvik", steps: [["13:48:02", "Leste øktlogg 28 dager", "ØKTLOGG · 26.09.2026"], ["13:48:03", "Regnet ACWR 1,58 for Tobias Lindvik", "BELASTNING · 26.09.2026"], ["13:48:04", "Laget utkast: hviledag torsdag 01.10", "UTKAST · IKKE SENDT"]] },
    { id: "j2", agent: "Oppfølgingsagent", skill: "inaktiv-spiller", st: "Venter på coach", t: "09:05", dur: "2 s", out: "Melding til Oskar Vik", steps: [["09:05:10", "Fant 1 spiller uten økt i 11 dager", "ØKTLOGG · 26.09.2026"], ["09:05:11", "Laget meldingsutkast", "UTKAST · IKKE SENDT"]] },
    { id: "j3", agent: "Fraværsagent", skill: "skolefravær", st: "Godkjent", t: "08:12", dur: "3 s", out: "Ny tid til Jonas Lie", by: "Anders Kristiansen · 08:40", steps: [["08:12:00", "Leste fravær fra WANG Toppidrett", "WANG · 25.09.2026"], ["08:12:03", "Fant ledig tid ti 29.09 17:00", "KALENDER · 26.09.2026"]] },
    { id: "j4", agent: "Rapportagent", skill: "ukerapport-forelder", st: "Feilet", t: "06:00", dur: "12 s", out: "Ukerapport til 18 foreldre", err: "Mal «Ukeplan til forelder» mangler feltet {{plan.timer}} for 3 spillere uten publisert plan.", steps: [["06:00:00", "Hentet 18 spillere", "STALL · 26.09.2026"], ["06:00:12", "Stoppet · 3 spillere mangler plan", "FEIL"]] },
  ],
  projects: [["Sesongslutt 2026", "6 oppgaver", "Jarvis følger opp frister"], ["Vinterplan WANG", "4 oppgaver", "Utkast til periodeplan"], ["Rekruttering Mini", "3 oppgaver", "Utkast til foreldrebrev"]],
  skills: [["acwr-sjekk", "Belastning", "Hver morgen 06:00", true], ["inaktiv-spiller", "Oppfølging", "Hver morgen 06:00", true], ["skolefravær", "Fravær", "Ved ny melding", true], ["ukerapport-forelder", "Rapport", "Lørdag 06:00", true], ["turnering-påmelding", "Turnering", "Ved ny turnering", false]],
  chat: [
    ["coach", "13:50", "Hvem i WANG bør ha lettere uke 40?"],
    ["caddie", "13:50", "To spillere ligger over ACWR 1,5: Tobias Lindvik (1,58) og Magnus Aasheim (1,52). Jeg foreslår å kutte én SLAG-økt hos begge og legge inn bevegelighet.", "BELASTNING · 26.09.2026 · 28 DAGER ØKTLOGG"],
  ],
  biz: {
    src: "TRIPLETEX-EKSPORT · 25.09.2026 23:00", period: "Januar–august 2026", unit: "kr",
    rows: [
      { id: "mul", name: "Mulligan", rev: 1284000, revB: 1200000, cost: 912000, costB: 880000 },
      { id: "aca", name: "Academy", rev: 2140000, revB: 2350000, cost: 1610000, costB: 1590000, why: "Inntekt 9 % under budsjett. Sju færre FULL-medlemmer enn plan fra mai. Kostnad følger plan." },
      { id: "sw", name: "Software", rev: 186000, revB: 240000, cost: 214000, costB: 180000, why: "Inntekt 22,5 % under budsjett og kostnad 18,9 % over. Lansering av PlayerHQ flyttet fra april til juni. Ekstra hosting fra juli." },
      { id: "wang", name: "WANG-fakturering", rev: 468000, revB: 468000, cost: 33450, costB: 33450, approx: true },
      { id: "gfgk", name: "GFGK", rev: null, revB: 320000, cost: null, costB: 260000, missing: "Mangler i eksporten. Avdelingen GFGK er ikke med i Tripletex-eksporten fra 25.09." },
    ],
  },
  tasks: {
    projects: [["Sesongslutt 2026", 6, 2, "31.10.2026"], ["Vinterplan WANG", 4, 1, "15.11.2026"], ["Rekruttering Mini", 3, 0, "01.12.2026"]],
    routines: [["Mandag", "Publiser ukeplaner", "Anders Kristiansen", true], ["Onsdag", "Svar i Innboks innen 24 t", "Anders Kristiansen", true], ["Fredag", "Sjekk ACWR for WANG", "Anders Kristiansen", false], ["Lørdag", "Godkjenn ukerapporter", "Anders Kristiansen", false]],
    mine: [
      { id: "o1", t: "Godkjenn ukeplan uke 40 · Tobias Lindvik", due: "26.09", p: "Sesongslutt 2026", by: "Jarvis", done: false },
      { id: "o2", t: "Oppdater nivåstige Team Norway 2027", due: "30.09", p: "Vinterplan WANG", by: "Anders Kristiansen", done: false },
      { id: "o3", t: "Les utkast til foreldrebrev Mini", due: "02.10", p: "Rekruttering Mini", by: "Kari Demo", done: false },
      { id: "o4", t: "Bestill baner til klubbmesterskap", due: "20.09", p: "Sesongslutt 2026", by: "Anders Kristiansen", done: true },
    ],
    notion: { page: "AK Golf · Coach-arbeidsflate", synced: "26.09.2026 14:00" },
  },
  talent: {
    src: "TESTER OG RUNDER · 20.09.2026 · ESTIMAT", axes: ["FYS", "TEK", "SLAG", "SPILL", "TURN"],
    peer: { label: "Peer-snitt kategori D · 14 spillere", v: [60, 58, 63, 57, 52] },
    players: [
      { id: "p1", name: "Tobias Lindvik", born: 2009, consent: true, v: [64, 61, 70, 59, 55] },
      { id: "p2", name: "Magnus Aasheim", born: 2008, consent: true, v: [72, 69, 75, 68, 66] },
      { id: "p4", name: "Ingrid Berg", born: 2010, consent: true, v: [58, 62, 64, 61, 50] },
      { id: "p3", name: "Sara Holm", born: 2009, consent: false, v: [55, 50, 58, 56, 48] },
      { id: "p13", name: "Henrik Dahl", born: 2007, consent: false, v: [70, 71, 72, 70, 69] },
      { id: "px", name: "Ukjent fødselsår", born: null, consent: true, v: [50, 50, 50, 50, 50] },
    ],
    discovery: [["Vår 2026 · Talentdag Borregaard", "Emil Strand", 2012, true, "SLAG 68 · 3 av 5 tester"], ["Vår 2026 · Talentdag Borregaard", "Anonym spiller", 2013, false, "—"]],
    wagr: { file: "wagr-export-2026-09-21.csv", rows: 3, match: 2, src: "WAGR · 21.09.2026" },
  },
  setup: {
    team: [["Anders Kristiansen", "Hovedcoach", "Admin", "anders@demo.no"], ["Kari Demo", "Assist Coach", "Coach", "kari@demo.no"], ["Per Demo", "Assist Coach", "Coach", "per@demo.no"], ["Line Demo", "Ekstern trener", "Les", "line@demo.no"]],
  },
  audit: [
    { t: "26.09 14:06", who: "Anders Kristiansen", what: "Lagret notat · øktark O13", obj: "Tobias Lindvik" },
    { t: "26.09 13:48", who: "Belastningsagent", what: "Laget utkast · hviledag 01.10", obj: "Tobias Lindvik" },
    { t: "26.09 11:42", who: "Hanne Lindvik", what: "Signerte samtykke · videoanalyse", obj: "Tobias Lindvik" },
    { t: "26.09 08:40", who: "Anders Kristiansen", what: "Godkjente ny tid · privattime", obj: "Jonas Lie" },
    { t: "25.09 20:05", who: "Anders Kristiansen", what: "Endret tjeneste · Privattime 30 min", obj: "ServiceType pt30" },
  ],
  errors: [
    { t: "26.09 06:00", lvl: "Feil", where: "Rapportagent", msg: "Mal mangler felt {{plan.timer}} for 3 spillere", n: 3 },
    { t: "25.09 16:52", lvl: "Advarsel", where: "TrackMan API", msg: "Tidsavbrudd etter 30 s · hentet på nytt 16:53", n: 1 },
    { t: "24.09 23:00", lvl: "Advarsel", where: "Tripletex-eksport", msg: "Avdeling GFGK mangler i eksporten", n: 1 },
  ],
  gdpr: [
    { id: "g1", who: "Mia Fjell", role: "Spiller · født 2012", by: "Forelder · Siv Fjell", at: "22.09.2026", due: "22.10.2026", scope: "All spillerdata, video og testresultater", st: "Venter" },
    { id: "g2", who: "Tidligere spiller", role: "Spiller · født 2006", by: "Spilleren selv", at: "02.09.2026", due: "02.10.2026", scope: "Profil og meldinger. Faktura beholdes i 5 år (bokføringsloven).", st: "Venter" },
  ],
};
