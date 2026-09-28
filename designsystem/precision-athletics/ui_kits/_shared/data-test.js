/* Fra testresultat til øvelse i økt (AG-15 testdetalj, PH-A07, AG-11 kilde på øktkort). Oppdiktede data: spiller Tobias Lindvik, coach Anders Kristiansen. Dagens dato 27.09.2026. */
window.TEST_DATA = {
  tests: [
    { id: "pt510", name: "Putting 5–10 fot · 10 putter", short: "Putt 5–10 fot", area: "Putting 5–10 fot", axis: "slag", unit: "av 10", better: "hi", src: "AK Golf",
      hist: [
        { id: "h1", d: "24.09.2026", v: 4, src: "Live-økt", cond: "Standard · innendørs green", dev: false },
        { id: "h2", d: "10.09.2026", v: 5, src: "Manuelt", cond: "Standard · treningsgreen", dev: false },
        { id: "h3", d: "03.09.2026", v: 3, src: "Live-økt", cond: "Avvikende · sterk vind og våt green", dev: true },
        { id: "h4", d: "27.08.2026", v: 6, src: "Live-økt", cond: "Standard · treningsgreen", dev: false },
        { id: "h5", d: "13.08.2026", v: 6, src: "Manuelt", cond: "Standard · treningsgreen", dev: false },
      ],
      signal: "Lavere resultat i de to siste gyldige testene enn i august: 6, 6, 5 og 4 av 10.", period: "13.08–24.09.2026",
      choice: "mer",
      suggest: [
        { id: "o1", name: "Putting 5–10 fot · Ballstart · port", axis: "slag", area: "Putting 5–10 fot", dose: "40 putter", code: "SLAG_PUTTING5-10_TRENINGSOMRÅDE_ALENE", why: "Samme område og avstand som testen, og ballstart er dimensjonen øvelsen trener.", src: "ØVELSESBANKEN · AK GOLF · BRUKT 6 GANGER AV TOBIAS" },
        { id: "o2", name: "Putting 5–10 fot · Lengdekontroll · stige", axis: "slag", area: "Putting 5–10 fot", dose: "30 putter", code: "SLAG_PUTTING5-10_TRENINGSOMRÅDE_OBSERVERT", why: "Samme avstand som testen, med lengde som eget fokus.", src: "ØVELSESBANKEN · ANDERS KRISTIANSEN · 01.08.2026" },
        { id: "o3", name: "Putting 3–5 fot · Ballstart · 10 på rad", axis: "slag", area: "Putting 3–5 fot", dose: "50 putter", code: "SLAG_PUTTING3-5_TRENINGSOMRÅDE_KONKURRANSE", why: "Nærmeste kortere bånd, der testen ikke er tatt ennå.", src: "ØVELSESBANKEN · AK GOLF" },
      ] },
    { id: "in50", name: "Innspill ca. 50 m ±4 m", short: "Innspill 50 m", area: "Innspill ca. 50 m", axis: "slag", unit: "av 10", better: "hi", src: "Team Norway",
      hist: [
        { id: "h6", d: "26.09.2026", v: 7, src: "Live-økt", cond: "Standard · treningsområde", dev: false },
        { id: "h7", d: "05.09.2026", v: 5, src: "Manuelt", cond: "Standard · treningsområde", dev: false },
      ],
      signal: null, period: "05.09–26.09.2026", choice: null, suggest: [] },
  ],
  sessions: [
    { id: "s1", d: "Tor 01.10", t: "16:00", name: "Putting og bevegelighet", min: 60 },
    { id: "s2", d: "Ons 30.09", t: "15:00", name: "Innspill og nærspill", min: 90 },
    { id: "s3", d: "Lør 03.10", t: "10:00", name: "Banespill 9 hull", min: 150 },
  ],
  CHOICES: [["ingen", "Ingen endring nå"], ["mer", "Mer målrettet trening"], ["tek", "Vurder teknisk oppgave"]],
};
