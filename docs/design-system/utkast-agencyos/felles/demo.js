/* Felles demodata for AgencyOS-utkastene. Bare syntetiske data. Alle pakkene leser herfra, så tallene stemmer på tvers.
   I dag er mandag 5. oktober 2026 kl. 08:20, uke 41. Coach: Anders Kristiansen (head coach). Markus er Assist Coach.
   Etterlevelse = gjennomført tid mot planlagt tid, siste fire uker (uke 37–40). null = ingen forfalte økter, vises «—».
   Øyvind Rohjan har samme tall som i PlayerHQ-utkastene: 48 t 10 min av 52 t 20 min = 92 %. */
window.AKDemo = {
  idag: 'Mandag 5. oktober', uke: 41, kl: '08:20',
  akser: { fys: 'FYS', tek: 'TEK', slag: 'SLAG', spill: 'SPILL', turn: 'TURN' },
  /* id, navn, initialer, kategori, gruppe, etterlevelse 4 uker (%), forrige 2 uker (%), SG-trend 30 d, siste økt, neste turnering, avtale, plan slutter (dager), status */
  stall: [
    { id: 'oyvind', navn: 'Øyvind Rohjan', i: 'ØR', kat: 'C', gruppe: 'WANG Toppidrett', etl: 92, to: [94, 90], sg: 0.4, siste: 'I går · Innspill 60 min', turn: 'Srixon Tour finale, lør', avtale: 'Performance Pro · 2 klipp', planSlutt: 58, status: 'folger', hcp: '3,6', snitt: '73,1' },
    { id: 'ida', navn: 'Ida Lie', i: 'IL', kat: 'E', gruppe: 'GFGK Junior Utvikling', etl: 54, to: [58, 49], sg: -0.6, siste: '6 dager siden', turn: null, avtale: 'Performance · 0 klipp', planSlutt: 12, status: 'trenger', grunn: 'Under 70 % to uker på rad · spørsmål ubesvart 26 t' },
    { id: 'mia', navn: 'Mia Strand', i: 'MS', kat: 'D', gruppe: 'AK Golf Academy', etl: 61, to: [64, 59], sg: -0.2, siste: '3 dager siden', turn: null, avtale: 'Performance · 1 klipp', planSlutt: 30, status: 'trenger', grunn: 'Under 70 % to uker på rad' },
    { id: 'filip', navn: 'Filip Aas', i: 'FA', kat: 'E', gruppe: 'WANG Ung', etl: 66, to: [68, 65], sg: 0.1, siste: 'I går', turn: 'Regionstour 4, søn', avtale: 'Gruppe', planSlutt: 44, status: 'trenger', grunn: 'Under 70 % to uker på rad' },
    { id: 'sander', navn: 'Sander Moe', i: 'SM', kat: 'B', gruppe: 'AK Golf Academy', etl: 121, to: [134, 138], sg: 0.9, siste: 'I går · Fysisk 75 min', turn: null, avtale: 'Performance Pro · 3 klipp', planSlutt: 86, status: 'trenger', grunn: 'Over 130 % to uker på rad · foreslå lettere uke' },
    { id: 'jonas', navn: 'Jonas Berg', i: 'JB', kat: 'C', gruppe: 'WANG Toppidrett', etl: 88, to: [86, 90], sg: 0.2, siste: 'I går', turn: null, avtale: 'Gruppe', planSlutt: 58, status: 'folger' },
    { id: 'selma', navn: 'Selma Ruud', i: 'SR', kat: 'C', gruppe: 'WANG Toppidrett', etl: 97, to: [96, 98], sg: 0.6, siste: 'I dag 07:00', turn: 'Srixon Tour finale, lør', avtale: 'Gruppe', planSlutt: 58, status: 'folger' },
    { id: 'nora', navn: 'Nora Bakke', i: 'NB', kat: 'C', gruppe: 'AK Golf Academy', etl: 84, to: [82, 85], sg: 0.3, siste: '2 dager siden', turn: null, avtale: 'Performance · 2 klipp', planSlutt: 21, status: 'folger' },
    { id: 'thea', navn: 'Thea Lund', i: 'TL', kat: 'D', gruppe: 'AK Golf Academy', etl: 90, to: [91, 89], sg: 0.2, siste: 'I går', turn: null, avtale: 'Performance · 1 klipp', planSlutt: 72, status: 'folger' },
    { id: 'emma', navn: 'Emma Haug', i: 'EH', kat: 'D', gruppe: 'WANG Toppidrett', etl: 79, to: [77, 80], sg: -0.1, siste: '2 dager siden', turn: null, avtale: 'Gruppe', planSlutt: 58, status: 'folger' },
    { id: 'vilde', navn: 'Vilde Sæther', i: 'VS', kat: 'D', gruppe: 'AK Golf Academy', etl: 81, to: [80, 82], sg: 0.0, siste: '3 dager siden', turn: null, avtale: 'Performance · 2 klipp', planSlutt: 9, status: 'folger' },
    { id: 'henrik', navn: 'Henrik Vik', i: 'HV', kat: 'G', gruppe: 'GFGK Junior Basis', etl: 72, to: [71, 73], sg: null, siste: '4 dager siden', turn: null, avtale: 'Gruppe', planSlutt: 58, status: 'folger' },
    { id: 'oliver', navn: 'Oliver Dahl', i: 'OD', kat: 'F', gruppe: 'GFGK Junior Utvikling', etl: null, to: [null, null], sg: null, siste: '—', turn: null, avtale: 'Gruppe', planSlutt: null, status: 'hviler', grunn: 'Ingen plan ennå' },
    { id: 'kasper', navn: 'Kasper Nilsen', i: 'KN', kat: 'H', gruppe: 'AK Golf Academy', etl: null, to: [null, null], sg: null, siste: '12 dager siden', turn: null, avtale: 'Performance · 2 klipp', planSlutt: 40, status: 'hviler', grunn: 'Skade registrert 23. sep' }
  ],
  /* Dagens kalender for Anders, 05–22. a = akse. */
  idagKalender: [
    { fra: '07:00', til: '08:30', a: 'slag', hvem: 'WANG Toppidrett', type: 'Gruppeøkt', tittel: 'Morgenøkt innspill', sted: 'Fredrikstad GK, range', plasser: '11 / 12', live: true, pagaar: true },
    { fra: '10:00', til: '11:30', a: 'tek', hvem: 'Sander Moe', type: 'Performance Pro', tittel: 'P7.0 og Face to Path', sted: 'Simulator 2', plasser: null },
    { fra: '14:00', til: '15:00', a: 'slag', hvem: 'Nora Bakke', type: 'Performance', tittel: 'Nærspill: pitch 30–50 m', sted: 'Chippinggreen', plasser: null },
    { fra: '15:30', til: '17:00', a: 'spill', hvem: 'GFGK Junior Utvikling', type: 'Gruppeøkt', tittel: 'Ni hull med strategioppgave', sted: 'Gamle Fredrikstad GK', plasser: '8 / 10' },
    { fra: '17:30', til: '18:30', a: 'tek', hvem: 'Mia Strand', type: 'Performance', tittel: 'Utslag: startretning', sted: 'Simulator 1', plasser: null },
    { fra: '19:00', til: '20:00', a: 'fys', hvem: 'WANG Ung', type: 'Gruppeøkt', tittel: 'Fysisk test: Club Speed og rotasjonskast', sted: 'Treningsrommet', plasser: '9 / 12' }
  ]
};
