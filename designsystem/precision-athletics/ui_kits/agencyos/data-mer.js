/* AgencyOS · Mer — runde 30 (Anders 28.09.2026). Oppdiktede data. Mandag 28.09.2026. */
window.MER = {
  services: [
    { id: "s1", name: "Privattime 60 min", kind: "Coaching", price: 1200, min: 60, coach: "Alle" },
    { id: "s2", name: "Privattime 30 min", kind: "Coaching", price: 650, min: 30, coach: "Alle" },
    { id: "s3", name: "Videoanalyse", kind: "Coaching", price: 800, min: 45, coach: "Anders Kristiansen" },
    { id: "s4", name: "Testdag · Team Norway-batteri", kind: "Test", price: 900, min: 90, coach: "Anders Kristiansen", test: "Team Norway-batteri (8-ball, 9 hull lengde, Nærspill Gate, VISA Express)" },
    { id: "s5", name: "TrackMan-test · driver og 7-jern", kind: "Test", price: 700, min: 45, coach: "Kristin Aas", test: "TrackMan-baseline driver og 7-jern" },
    { id: "s6", name: "Nærspill · åpen gruppe", kind: "Gruppe", price: 300, min: 90, coach: "Kristin Aas" },
  ],
  priceSrc: "TJENESTER OG PRISER · OPPSETT · OPPDATERT 01.08.2026",
  players: [["p1", "Tobias Lindvik", "WANG VG2 · morgen"], ["p2", "Magnus Aasheim", "WANG VG2 · morgen"], ["p3", "Ida Berg", "Junior elite"], ["p4", "Thea Nilsen", "Junior elite"], ["p9", "Mari Solvang", "—"]],
  slots: [["Tir 29.09", "09:00"], ["Tir 29.09", "13:00"], ["Ons 30.09", "11:00"], ["Tor 01.10", "15:00"], ["Fre 02.10", "10:00"]],
  bookings: [
    { id: "b1", who: "Tobias Lindvik", svc: "Privattime 60 min", when: "Man 28.09 · 10:00", coach: "AK", src: "Coach", st: "Bekreftet" },
    { id: "b2", who: "Henrik Dahl", svc: "Videoanalyse", when: "Man 28.09 · 11:00", coach: "KA", src: "Offentlig booking", st: "Bekreftet automatisk" },
    { id: "b3", who: "Kari Moens sønn · prøvetime", svc: "Nærspill · åpen gruppe", when: "Tir 06.10 · 17:00", coach: "KA", src: "Offentlig booking", st: "Bekreftet automatisk" },
    { id: "b4", who: "Thea Nilsen", svc: "Testdag · Team Norway-batteri", when: "Lør 10.10 · 10:00", coach: "AK", src: "Offentlig booking", st: "Bekreftet automatisk", test: true },
  ],
  groups: [
    { id: "g1", name: "WANG VG2 · morgen", n: 8, coach: "Anders Kristiansen", times: "Man · ons · fre 07:30–09:00", school: "WANG Toppidrett Fredrikstad · VG2 · timeplan importert 18.08.2026" },
    { id: "g2", name: "Junior elite", n: 6, coach: "Anders Kristiansen", times: "Man 17:00–18:30 · lør 09:00–11:00", school: "—" },
    { id: "g3", name: "Basis 11–13 år", n: 10, coach: "Eirik Moe", times: "Ons 17:00–18:30", school: "—" },
  ],
  members: { g1: ["Tobias Lindvik", "Magnus Aasheim", "Sara Holm", "Henrik Dahl", "Emil Strand", "Nora Bakke", "Vetle Ruud", "Selma Aune"], g2: ["Ida Berg", "Thea Nilsen", "Oskar Nilsen", "Jonas Lie", "Tobias Lindvik", "Magnus Aasheim"], g3: ["Mari Solvang", "Lukas Hagen", "Frida Moen", "Aksel Lund", "Ella Berge", "Ola Nygård", "Sofie Dahl", "Isak Vold", "Maja Eide", "Jakob Borg"] },
  search: [["Emil Strand", "Født 2009 · PlayerHQ", ["g1"]], ["Emilie Sand", "Født 2012 · PlayerHQ", []], ["Emil Holt", "Født 2010 · PlayerHQ", ["g2"]]],
  assign: [["Team Norway-batteri", "Test", "Lør 10.10"], ["TrackMan-baseline driver og 7-jern", "TrackMan-økt", "Uke 41"], ["Knebøy 1RM · ESTIMAT fra 4 × 6", "Fystest", "—"]],
  tm: [
    { id: "tm1", name: "TrackMan-baseline · driver og 7-jern", who: "WANG VG2 · morgen · 8 spillere", when: "Uke 41", params: "Club Path · Face Angle · Face to Path · Attack Angle · Dynamic Loft · Club Speed", st: "Tildelt" },
    { id: "tm2", name: "Wedge-lengder 50–100 m", who: "Tobias Lindvik", when: "Tor 01.10", params: "Carry · spredning", st: "Tildelt" },
  ],
  /* Økonomi — tall fra kilden med dato, aldri anslått. */
  eco: {
    month: "September 2026",
    /* Fordelt på AK Golfs tjenester (Anders 28.09). Budsjett: lagt inn av head coach 01.08.2026. Regnskap: Tripletex-eksport. */
    rows: [
      ["Coaching privat", 186400, 171250, "TRIPLETEX · EKSPORT AUGUST · LASTET OPP 03.09.2026"],
      ["Grupper", 142000, 138900, "TRIPLETEX · EKSPORT AUGUST · LASTET OPP 03.09.2026"],
      ["GFGK-avtalen", 62500, 62500, "TRIPLETEX · EKSPORT AUGUST · LASTET OPP 03.09.2026"],
      ["Gruppetimer", 38000, 31800, "TRIPLETEX · EKSPORT AUGUST · LASTET OPP 03.09.2026"],
      ["Andre tjenester fra AK Golf", 24000, null, "TRIPLETEX · IKKE BOKFØRT FOR AUGUST"],
    ],
    stripe: [["Innbetalt september", "84 320 kr", "STRIPE · LEST 28.09.2026 08:15"], ["Feilet, prøves på nytt", "2 betalinger · 2 400 kr", "STRIPE · LEST 28.09.2026 08:15"], ["Refundert", "650 kr", "STRIPE · LEST 28.09.2026 08:15"]],
    uploads: [["August 2026", "tripletex-2026-08.csv", "03.09.2026", "Importert"], ["Juli 2026", "tripletex-2026-07.csv", "04.08.2026", "Importert"], ["September 2026", "—", "—", "Venter"]],
  },
  /* Oppsett (AG-23 + AG-24) */
  team: [["Anders Kristiansen", "Head coach", "anders@akgolf.no", "Aktiv"], ["Kristin Aas", "Assistant coach", "kristin@akgolf.no", "Aktiv"], ["Eirik Moe", "Assistant coach", "eirik@akgolf.no", "Aktiv"], ["Line Ask", "Assistant coach", "line.ask@akgolf.no", "Invitert 25.09"]],
  roles: [["Head coach", "Ser og endrer alt: alle spillere, alle bookinger, økonomi, oppsett og team"], ["Assistant coach", "Ser egne spillere, egne økter og alle gruppeøkter. Ingen økonomi eller oppsett"]],
  gdpr: [["Sletteforespørsel · Emil Holt (forelder)", "Mottatt 26.09.2026 · frist 26.10.2026", "Åpen"], ["Innsyn · Nora Bakke", "Mottatt 14.09.2026 · levert 16.09.2026", "Løst"]],
  logs: [["28.09 08:20", "Anders Kristiansen", "Flyttet økt · Nærspill tir 16:00 → 17:00"], ["28.09 07:52", "System", "Google-synk · 14 hendelser"], ["27.09 21:04", "Kristin Aas", "Godkjente sammendrag · Sara Holm"], ["27.09 18:30", "System", "Feil · e-post EP-02 til 1 mottaker kom i retur"]],
  marketing: [["Nyhetsbrev oktober", "Utkast · 412 mottakere", "Planlagt 01.10.2026"], ["Påmelding høstsamling", "Sendt 15.09.2026 · 388 mottakere", "31 % åpnet"]],
};
