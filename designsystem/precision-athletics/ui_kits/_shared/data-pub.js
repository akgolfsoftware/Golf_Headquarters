/* Offentlige flater: Booking (BK), GFGK Junior (GJ). Bare demodata. Lørdag 26.09.2026. */
window.PUB_DATA = {
  playerhq: { tier: "FULL", price: 299, year: 2690, what: "Plan fra coachen, økter, tester og analyse av rundene dine" },
  rate: 950, rateNote: "DEMODATA · TIMEPRIS FRA SERVICETYPE",
  services: [
    { id: "pt60", name: "Privattime", min: 60, desc: "Én spiller, én coach. Studio 1 eller bane." },
    { id: "pt30", name: "Privattime", min: 30, desc: "Kort økt med ett fokus." },
    { id: "bane", name: "Banecoaching 9 hull", min: 150, desc: "Strategi og slagvalg på Borregaard GK." },
    { id: "bay", name: "TrackMan-bay uten coach", min: 60, price: 350, desc: "Studio 2. Egen trening med TrackMan." },
  ],
  coach: "Anders Kristiansen",
  week: [["Ma", "28.09"], ["Ti", "29.09"], ["On", "30.09"], ["To", "01.10"], ["Fr", "02.10"], ["Lø", "03.10"], ["Sø", "04.10"]],
  slots: [["15:00", "16:00", "18:00"], ["17:00"], ["14:00", "15:00"], ["18:00", "19:00"], [], ["13:00", "14:00"], []],
  gfgk: {
    name: "GFGK Junior", club: "Gamle Fredrikstad Golfklubb", season: "Høst 2026",
    ladder: [
      { id: "mini", name: "Mini", age: "7–10 år", what: "Lek, balanse og første slag. Én økt i uka.", times: [["Onsdag", "16:30–17:30", "Nærspillsområde"]], coach: "Kari Demo", n: 14 },
      { id: "basis", name: "Basis", age: "10–13 år", what: "Grunnslag, regler og første runde på korthullsbanen.", times: [["Tirsdag", "17:00–18:30", "Treningsområde"], ["Torsdag", "17:00–18:30", "Treningsområde"]], coach: "Per Demo", n: 18 },
      { id: "utv", name: "Utvikling", age: "13–16 år", what: "Plan per uke, tester og klubbturneringer.", times: [["Mandag", "17:00–18:30", "Nærspillsområde"], ["Onsdag", "16:00–17:30", "Treningsområde"]], coach: "Anders Kristiansen", n: 9 },
      { id: "elite", name: "Elite", age: "16+ år", what: "Individuell plan, regionale og nasjonale turneringer.", times: [["Mandag–fredag", "07:00–08:30", "Treningsområde"]], coach: "Anders Kristiansen", n: 6 },
    ],
    knott: { id: "knott", name: "Knøtt", age: "11–12 år", what: "Egen gruppe ved siden av stigen for 11–12-åringer som vil spille mer.", times: [["Lørdag", "10:00–11:00", "Nærspillsområde"]], coach: "Kari Demo", n: 8 },
    cal: [["Lø 03.10", "Klubbmesterskap junior", "Alle grupper · 9 og 18 hull"], ["On 07.10", "Foreldremøte høst", "Klubbhuset 19:00"], ["Lø 17.10", "Sesongavslutning", "Mini, Basis og Knøtt"], ["Ma 02.11", "Vintertrening starter", "Innendørs · alle grupper"]],
  },
  guide: {
    cats: [["Komme i gang", "Utstyr, første økt og hvilken gruppe som passer", 4], ["Trening", "Hvor mye, hvor ofte og hvordan uka ser ut", 5], ["Turnering", "Påmelding, regler og tee for juniorer", 3], ["For foreldre", "Samtykke, betaling og transport", 4]],
    article: { cat: "Komme i gang", title: "Hvilken gruppe passer for barnet mitt?", updated: "12.09.2026", by: "Kari Demo · juniorleder",
      body: [["p", "Gruppene i GFGK Junior følger AK-stigen: Mini, Basis, Utvikling og Elite. Alder er et utgangspunkt, men det er ferdigheter og hvor mye barnet vil trene som avgjør."], ["h", "Mini · 7–10 år"], ["p", "For deg som er ny. Vi leker, slår de første slagene og lærer å være trygg på banen. Én økt i uka."], ["h", "Basis · 10–13 år"], ["p", "Grunnslag og regler. Målet er å spille første runde på korthullsbanen. To økter i uka."], ["h", "Knøtt · 11–12 år"], ["p", "En egen gruppe ved siden av stigen for 11–12-åringer som vil spille mer enn Basis gir rom for. Knøtt er ikke et trinn."], ["h", "Slik bytter dere gruppe"], ["p", "Snakk med treneren etter en økt. Bytte skjer ved oppstart i mars og august."]] },
  },
};
