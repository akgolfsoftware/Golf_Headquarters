/* AgencyOS Kalender (AG-05) — runde 28 (Anders 28.09.2026). Alle bookinger i AK Golf. Oppdiktede data. Mandag 28.09.2026, uke 40.
   day: 0 = man 28.09 … 6 = søn 04.10. Farge betyr akse, aldri coach. */
window.KAL = {
  today: 0, week: 40, now: "08:20",
  days: ["Man 28.09", "Tir 29.09", "Ons 30.09", "Tor 01.10", "Fre 02.10", "Lør 03.10", "Søn 04.10"],
  coaches: [
    { id: "ak", ini: "AK", name: "Anders Kristiansen", role: "Head coach" },
    { id: "ka", ini: "KA", name: "Kristin Aas", role: "Assistant coach" },
    { id: "em", ini: "EM", name: "Eirik Moe", role: "Assistant coach" },
  ],
  google: { acct: "anders@akgolf.no", synced: "08:20", both: true },
  ev: [
    { id: "e1", day: 0, c: "ak", t: "07:30", end: "09:00", kind: "gruppe", fast: true, svc: "Gruppeøkt · WANG VG2", axis: "slag", n: 8, cap: 8, where: "Range 1" },
    { id: "e2", day: 0, c: "ak", t: "10:00", end: "11:00", kind: "privat", svc: "Privattime · Tobias Lindvik", axis: "tek", n: 1, cap: 1, where: "Studio 1" },
    { id: "e3", day: 0, c: "ka", t: "15:00", end: "16:30", kind: "gruppe", fast: false, svc: "Nærspill · åpen gruppe", axis: "slag", n: 6, cap: 8, where: "Chippinggreen", wait: 0 },
    { id: "e4", day: 0, c: "em", t: "16:00", end: "17:00", kind: "privat", svc: "Privattime · Ida Berg", axis: "slag", n: 1, cap: 1, where: "Puttinggreen" },
    { id: "e5", day: 0, c: "ak", t: "17:00", end: "18:30", kind: "gruppe", fast: true, svc: "Junior elite", axis: "spill", n: 6, cap: 6, where: "Bane · hull 1–6" },
    { id: "e6", day: 0, c: "em", t: "18:00", end: "19:00", kind: "gruppe", fast: false, svc: "Putting · åpen gruppe", axis: "slag", n: 8, cap: 8, where: "Innendørs green", wait: 4 },
    { id: "e20", day: 0, c: "ka", t: "08:00", end: "09:00", kind: "privat", svc: "Privattime · Sara Holm", axis: "tek", n: 1, cap: 1, where: "Studio 2" },
    { id: "e21", day: 0, c: "em", t: "09:00", end: "10:30", kind: "gruppe", fast: true, svc: "Basis 11–13 år · formiddag", axis: "slag", n: 9, cap: 12, where: "Range 2" },
    { id: "e22", day: 0, c: "ka", t: "11:00", end: "12:00", kind: "privat", svc: "Videoanalyse · Henrik Dahl", axis: "tek", n: 1, cap: 1, where: "Digitalt" },
    { id: "e23", day: 1, c: "em", t: "09:00", end: "10:00", kind: "privat", svc: "Privattime · Jonas Lie", axis: "slag", n: 1, cap: 1, where: "Puttinggreen" },
    { id: "e24", day: 1, c: "ka", t: "10:00", end: "11:00", kind: "privat", svc: "Privattime · Oskar Nilsen", axis: "tek", n: 1, cap: 1, where: "Studio 2" },
    { id: "g1", day: 0, c: "ak", t: "12:00", end: "13:00", kind: "google", svc: "Lunsj med styret", where: "Google-kalender" },
    { id: "e7", day: 1, c: "ak", t: "10:00", end: "11:00", kind: "privat", svc: "Privattime · Magnus Aasheim", axis: "tek", n: 1, cap: 1, where: "Studio 1" },
    { id: "e8", day: 1, c: "ka", t: "16:00", end: "17:00", kind: "gruppe", fast: false, svc: "Nærspill · åpen gruppe", axis: "slag", n: 8, cap: 8, where: "Chippinggreen", wait: 5 },
    { id: "e9", day: 2, c: "ak", t: "07:30", end: "09:00", kind: "gruppe", fast: true, svc: "Gruppeøkt · WANG VG2", axis: "fys", n: 7, cap: 8, where: "WANG · styrkerom" },
    { id: "e10", day: 2, c: "em", t: "17:00", end: "18:30", kind: "gruppe", fast: true, svc: "Basis 11–13 år", axis: "spill", n: 10, cap: 12, where: "Range 2" },
    { id: "e11", day: 3, c: "ak", t: "14:00", end: "15:00", kind: "privat", svc: "Videoanalyse · Thea Nilsen", axis: "tek", n: 1, cap: 1, where: "Digitalt" },
    { id: "e12", day: 3, c: "ka", t: "17:00", end: "18:00", kind: "gruppe", fast: false, svc: "Putting · åpen gruppe", axis: "slag", n: 8, cap: 8, where: "Innendørs green", wait: 3 },
    { id: "e13", day: 4, c: "ak", t: "07:30", end: "09:00", kind: "gruppe", fast: true, svc: "Gruppeøkt · WANG VG2", axis: "slag", n: 8, cap: 8, where: "Chippinggreen" },
    { id: "e14", day: 5, c: "ak", t: "09:00", end: "15:00", kind: "turn", svc: "Srixon Tour · runde 6 · 3 spillere", axis: "turn", where: "Larvik GK" },
  ],
  /* Forslag til ny gruppeøkt (B1) — i Innboks for head og assistant coach, og som skisse i kalenderen. */
  forslag: { id: "f1", day: 1, c: "ka", t: "17:00", end: "18:00", svc: "Nærspill · ny gruppe", axis: "slag", cap: 8, price: 300, sum: "2 400 kr",
    why: [["Fulle økter", "Nærspill tirsdag 16:00 og putting torsdag 17:00 er fulle"], ["Venteliste", "8 spillere venter på nærspill"], ["Ledig tid", "7 av 8 på ventelista er ledige tirsdag 17–18"], ["Ledig anlegg", "Chippinggreen er ledig tirsdag 17–18"], ["Pris × plasser", "300 kr × 8 plasser = 2 400 kr · ESTIMAT"]] },
  /* Treningssamling (B7) — egen blokk. */
  samling: { name: "Treningssamling · Sør-Spania", from: "06.10", to: "10.10", week: 41, who: "Junior elite · 12 spillere · Anders og Kristin", where: "La Manga", days: 5 },
  /* Spillernes private hendelser fra Google vises bare som «Opptatt», aldri tittel. */
  busy: { e3: [["Tobias Lindvik", "15:00–16:00"], ["Sara Holm", "14:30–15:30"]], e8: [["Magnus Aasheim", "16:00–17:30"]] },
  moveTo: [["Tir 29.09", "17:00"], ["Ons 30.09", "16:00"], ["Tor 01.10", "15:00"]],
  month: { name: "Oktober 2026", first: 3, days: 31, counts: { 1: 6, 2: 4, 3: 2, 5: 9, 6: 3, 7: 5, 8: 4, 9: 3, 12: 8, 13: 7, 14: 6, 15: 7, 16: 4, 17: 2, 19: 8, 20: 6, 21: 7, 22: 5, 23: 4, 26: 7, 27: 6, 28: 8, 29: 5, 30: 3 }, samling: [6, 10] },
  year: [["Jan", 82], ["Feb", 90], ["Mar", 104], ["Apr", 131], ["Mai", 162], ["Jun", 170], ["Jul", 58], ["Aug", 148], ["Sep", 155], ["Okt", 118], ["Nov", null], ["Des", null]],
  yearSamling: [["Mar", "Treningssamling · Portugal"], ["Okt", "Treningssamling · Sør-Spania"]],
};
