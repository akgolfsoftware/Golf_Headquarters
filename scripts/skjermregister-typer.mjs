/** Explicit Precision Athletics screen types from docs/design-system/skjermliste-precision-athletics.md (26.09.2026).
 * Ellipsis in that list is expanded here. Dynamic segment names are placeholders: [id] matches [sessionId].
 * A trailing * is a prefix. These rows are the chosen design types, not proof that app routes are ported.
 */
export const PRECISION_KILDE = "docs/design-system/skjermliste-precision-athletics.md";
export const PRECISION_VERSJON = "precision-athletics-2026-09-26";
export const PRECISION_PROSJEKT = "7d7c2994-cf63-4c5f-9bdc-fdaf67655a70";

/** @type {{id:string,navn:string,natt:boolean,maVise:string,monster:string[]}[]} */
export const PRECISION_TYPER = [
  { id: "PH-01", navn: "I dag", natt: false, maVise: "Dagens økt, agenda, Caddie-forslag, Start økt", monster: ["/portal"] },
  { id: "PH-02", navn: "Gjør nå", natt: false, maVise: "Dagens økter og oppgaver, åpne økt", monster: ["/portal/gjennomfore", "/portal/tren/wb"] },
  { id: "PH-03", navn: "Øktark", natt: false, maVise: "Start, fullfør eller hopp over, øvelser med AK-formel", monster: ["/portal/gjennomfore/[id]", "/portal/tren/wb/[sessionId]"] },
  { id: "PH-04", navn: "Live-økt: brief", natt: true, maVise: "Mål, fokus, øvelser før start", monster: ["/portal/live/[id]/brief"] },
  { id: "PH-05", navn: "Live-økt: aktiv", natt: true, maVise: "Klokke, øvelsesfremdrift, registrer repetisjoner", monster: ["/portal/live/[id]/active"] },
  { id: "PH-06", navn: "Slagteller", natt: true, maVise: "+1/+5 slag, kølle fra bagen, store treffmål", monster: ["/portal/live/[id]/tapper"] },
  { id: "PH-07", navn: "Øktoppsummering", natt: true, maVise: "Slag, tid, pyramidefordeling, del/lagre", monster: ["/portal/live/[id]/summary", "/portal/tren/feiring/[planId]"] },
  { id: "PH-08", navn: "Runde live", natt: true, maVise: "Hull 1–18, lie, meter til flagg, putter i fot", monster: ["/portal/runde/live", "/portal/mal/runder/[id]/slag"] },
  { id: "PH-09", navn: "Registrer runde", natt: false, maVise: "Dato, bane, score per hull, brutto", monster: ["/portal/runde/logg", "/portal/mal/runder/ny", "/portal/mal/runder/[id]/hull"] },
  { id: "PH-10", navn: "Plan: uke", natt: false, maVise: "Uke/dag/måned, økter per akse, opptatt tid", monster: ["/portal/planlegge", "/portal/kalender", "/portal/kalender/opptatt"] },
  { id: "PH-11", navn: "Workbench (spiller)", natt: false, maVise: "År → periode → uke → økt på én flate, dra-og-slipp", monster: ["/portal/planlegge/workbench"] },
  { id: "PH-12", navn: "Planbygger", natt: false, maVise: "Stegviser, mal, SMART-mål", monster: ["/portal/planlegge/bygger", "/portal/ai/mal-bygger"] },
  { id: "PH-13", navn: "Øvelsesbank", natt: false, maVise: "Liste med filter per akse, øvelsesdetalj, Caddie-forslag", monster: ["/portal/drills", "/portal/drills/[id]", "/portal/coach/ovelser", "/portal/ai/foresla-drill"] },
  { id: "PH-14", navn: "Tester", natt: false, maVise: "Protokoller, historikk, registrer resultat", monster: ["/portal/tren/tester", "/portal/tren/tester/[testId]", "/portal/tren/tester/ny", "/portal/tren/tester/ny/egen", "/portal/tren/tester/team-norway"] },
  { id: "PH-15", navn: "Test: gjennomfør", natt: true, maVise: "Scorekort, live-registrering", monster: ["/portal/tren/tester/[testId]/gjennomfor"] },
  { id: "PH-16", navn: "Analyse-hub", natt: false, maVise: "SG per kategori, siste runder/økter, filter", monster: ["/portal/analysere", "/portal/analysere/historikk", "/portal/analysere/skill-map"] },
  { id: "PH-17", navn: "TrackMan", natt: false, maVise: "Øktliste, spredningskart, gapping, utstyrshelse", monster: ["/portal/analysere/trackman", "/portal/analysere/trackman/[id]", "/portal/mal/trackman/gapping", "/portal/mal/sg-hub/equipment", "/portal/analysere/datagolf/stasjon"] },
  { id: "PH-18", navn: "Runder og statistikk", natt: false, maVise: "Scorekort, metrikk over tid, hull-analyse, til-par-kurve", monster: ["/portal/mal/runder", "/portal/mal/runder/[id]", "/portal/statistikk/[metric]", "/portal/statistikk/runder/[runId]/del", "/portal/analysere/hull", "/portal/analysere/turneringer", "/portal/analysere/datagolf"] },
  { id: "PH-19", navn: "Mål og talent", natt: false, maVise: "Mål med fremdrift, talentradar, P1–P10-plan", monster: ["/portal/mal", "/portal/mal/goal/[id]", "/portal/mal/leaderboard", "/portal/talent*", "/portal/utviklingsplan", "/portal/tren/teknisk-plan/[planId]"] },
  { id: "PH-20", navn: "Gameplan og banekart", natt: false, maVise: "Banekart, hull-for-hull, slagvalg", monster: ["/portal/gameplan", "/portal/gameplan/[baneId]", "/portal/gameplan/[baneId]/hull/[nr]"] },
  { id: "PH-21", navn: "Coach-kontakt", natt: false, maVise: "Meldingstråd, spørsmål, tilbakemelding, videoer, ønsket økt", monster: ["/portal/coach", "/portal/coach/melding", "/portal/coach/melding/ny", "/portal/coach/sporsmal*", "/portal/coach/tilbakemelding*", "/portal/coach/videoer", "/portal/coach/plans", "/portal/coach/sg-hub*", "/portal/onskeligokt*"] },
  { id: "PH-22", navn: "Caddie-chat", natt: false, maVise: "Chat, forslag som utkast, kilder", monster: ["/portal/coach/ai", "/portal/ai/foresla-turnering"] },
  { id: "PH-23", navn: "Booking (spiller)", natt: false, maVise: "Klippekort, tjeneste, tid, bekreft, flytt time", monster: ["/portal/booking", "/portal/booking/ny", "/portal/booking/ny/bekreft", "/portal/booking/bekreftet", "/portal/booking/[bookingId]", "/portal/booking/coach/[coachId]", "/portal/booking/anlegg/[anleggId]", "/portal/meg/bookinger*"] },
  { id: "PH-24", navn: "Meg", natt: false, maVise: "Profil, kategori A–K, bag med 14 køller, helse", monster: ["/portal/meg", "/portal/meg/profil", "/portal/meg/utstyr", "/portal/meg/resultater", "/portal/meg/helse*", "/portal/meg/foreldre", "/portal/meg/dokumenter", "/portal/spiller/[id]", "/portal/venner*"] },
  { id: "PH-25", navn: "Abonnement og innstillinger", natt: false, maVise: "TALENT/FULL, faktura, kort, avbestill, samtykke, varsler, hjelp", monster: ["/portal/meg/abonnement*", "/portal/meg/innstillinger*", "/portal/meg/sikkerhet/2fa", "/portal/varsler", "/portal/meg/help*", "/portal/meg/feedback"] },
  { id: "PH-26", navn: "Utenfor banen", natt: false, maVise: "FYS-økt, utfordringer, putte-lab, break-tabell, turneringsplan, ukesdigest", monster: ["/portal/utenfor-banen", "/portal/fysisk", "/portal/tren/fys-plan", "/portal/utfordringer*", "/portal/trening*", "/portal/ukesdigest", "/portal/tren/turneringer*"] },

  { id: "AG-01", navn: "Hjem (cockpit)", natt: false, maVise: "Én ting nå, dagens plan, kø-tellere, AI-dispatch", monster: ["/admin/agencyos", "/meg"] },
  { id: "AG-02", navn: "Kø", natt: false, maVise: "Faner: godkjenninger, agentforslag, tester, dubletter, moderering", monster: ["/admin/ko"] },
  { id: "AG-03", navn: "Oppfølgingskø", natt: false, maVise: "Risiko, følg med, sjekk inn, løst", monster: ["/admin/queue"] },
  { id: "AG-04", navn: "Innboks", natt: false, maVise: "Saker, e-postutkast, maler", monster: ["/admin/kommunikasjon", "/admin/email-templates/[id]/rediger"] },
  { id: "AG-05", navn: "Kalender", natt: false, maVise: "Uke/måned/dag, lag, stall-dag, tilgjengelighet", monster: ["/admin/kalender", "/admin/kalender/hendelse/[id]", "/admin/kalender/hendelse/ny", "/admin/availability"] },
  { id: "AG-06", navn: "Booking (coach)", natt: false, maVise: "Bookingdetalj, bekreft/avvis booking, ny booking, tjenester og pris", monster: ["/admin/bookinger/[id]", "/admin/bookinger/ny", "/admin/services"] },
  { id: "AG-07", navn: "Stall", natt: false, maVise: "Spillere gruppert etter status, tabell til kortrader", monster: ["/admin/spillere", "/admin/spillere/ny"] },
  { id: "AG-08", navn: "Spiller 360", natt: false, maVise: "Profil, nøkkeltall, fremgang, endringshistorikk", monster: ["/admin/spillere/[id]", "/admin/spillere/[id]/rediger", "/admin/spillere/[id]/turnering-kobling"] },
  { id: "AG-09", navn: "Spilleranalyse", natt: false, maVise: "SG, trend, etterlevelse, stall-analyse", monster: ["/admin/spillere/[id]/analyse", "/admin/analyse", "/admin/runder"] },
  { id: "AG-10", navn: "Teknisk plan", natt: false, maVise: "P1–P10, oppgaver, TrackMan-mål, treffrate", monster: ["/admin/plan/teknisk", "/admin/spillere/[id]/plan", "/admin/spillere/[id]/plan/[planId]"] },
  { id: "AG-11", navn: "Workbench (coach)", natt: false, maVise: "Samme motor som spiller, stall-velger og gruppemodus", monster: ["/admin/workbench/[playerId]", "/admin/grupper/[id]/workbench"] },
  { id: "AG-12", navn: "Øktark (coach)", natt: false, maVise: "Økt med spiller, øvelser, notat", monster: ["/admin/gjennomfore/okter/[id]"] },
  { id: "AG-13", navn: "Live-tavle", natt: false, maVise: "Pågående økter nå, én økt i sanntid", monster: ["/admin/agencyos/live", "/admin/agencyos/live/[sessionId]"] },
  { id: "AG-14", navn: "Plan-hub, maler og øvelser", natt: false, maVise: "Ukemaler, program, standardøkter, aksefordeling, opprett/rediger øvelse", monster: ["/admin/plan", "/admin/plan/maler", "/admin/plan-templates/[id]", "/admin/plan-templates/[id]/rediger", "/admin/plan-templates/ny"] },
  { id: "AG-15", navn: "Tester (coach)", natt: false, maVise: "Resultater, nivåstiger, tildel test", monster: ["/admin/tester", "/admin/tester/benchmarks", "/admin/tester/tildel/[spillerId]", "/admin/spillere/[id]/tester"] },
  { id: "AG-16", navn: "Grupper", natt: false, maVise: "Medlemmer, faste tider, årsplan, AK-stigen", monster: ["/admin/grupper", "/admin/grupper/[id]", "/admin/grupper/[id]/timeplan", "/admin/grupper/[id]/arsplan", "/admin/grupper/[id]/arsplan/skoledata", "/admin/agencyos/ak-stigen"] },
  { id: "AG-17", navn: "Turneringer", natt: false, maVise: "Alle, mine spillere, kart, dubletter, ny turnering", monster: ["/admin/turnering", "/admin/tournaments/[id]", "/admin/tournaments/ny"] },
  { id: "AG-18", navn: "TrackMan og video", natt: false, maVise: "Økter på tvers av spillere, video, opptak", monster: ["/admin/trackman", "/admin/trackman/[sessionId]", "/admin/videoer", "/admin/recording"] },
  { id: "AG-19", navn: "Caddie / Jarvis", natt: false, maVise: "Agentkø, prosjekter, skills, kjøringsdetalj, Caddie-samtale for coach", monster: ["/admin/jarvis", "/admin/agents/[agentId]"] },
  { id: "AG-20", navn: "Økonomi", natt: false, maVise: "Tall fra Tripletex, per virksomhet, avvik", monster: ["/admin/agencyos/okonomi"] },
  { id: "AG-21", navn: "Oppgaver", natt: false, maVise: "Prosjekter, rutiner, tildelte oppgaver", monster: ["/admin/oppgaver", "/admin/workspace/notion"] },
  { id: "AG-22", navn: "Innsikt og talent", natt: false, maVise: "Radar mot peer-snitt, opptil fire spillere side ved side", monster: ["/admin/innsikt", "/innsyn/talent/radar", "/innsyn/talent/discovery", "/innsyn/talent/sammenligning", "/innsyn/talent/wagr-import"] },
  { id: "AG-23", navn: "Oppsett", natt: false, maVise: "Åtte faner, tilgang, inviter coach, egen profil", monster: ["/admin/oppsett", "/admin/profile", "/admin/team/ekstern", "/admin/team/inviter", "/admin/marketing"] },
  { id: "AG-24", navn: "Drift (kun admin)", natt: false, maVise: "Logg, feil, sletteforespørsler, hjelp", monster: ["/admin/audit-log", "/admin/feillogg", "/admin/gdpr", "/admin/hjelp"] },

  { id: "FO-01", navn: "Forelder i dag", natt: false, maVise: "Dagens økt, neste booking, uke, ACWR-varsel", monster: ["/forelder", "/forelder/ukerapport", "/forelder/varsler"] },
  { id: "FO-02", navn: "Barn", natt: false, maVise: "Koblede barn, utviklingsprofil", monster: ["/forelder/barn", "/forelder/barn/[childId]"] },
  { id: "FO-03", navn: "Booking for barn", natt: false, maVise: "Velg barn, tjeneste, tid, bekreft", monster: ["/forelder/bookinger*"] },
  { id: "FO-04", navn: "Økonomi", natt: false, maVise: "Abonnement, neste trekk, fakturaer", monster: ["/forelder/okonomi", "/forelder/fakturaer"] },
  { id: "FO-05", navn: "Samtykke", natt: false, maVise: "Under 16 år, deling, revisjonshistorikk", monster: ["/forelder/samtykke", "/forelder/samtykke/deling/[childId]"] },
  { id: "FO-06", navn: "Coach og innstillinger", natt: false, maVise: "Coach, siste melding, egen kontakt", monster: ["/forelder/coach", "/forelder/innstillinger"] },

  { id: "AU-01", navn: "Logg inn", natt: false, maVise: "E-post/passord, Google, BankID-plassholder", monster: ["/auth/login", "/auth/bankid", "/auth/logget-ut"] },
  { id: "AU-02", navn: "Registrer", natt: false, maVise: "Pakke, samtykke, sjekk e-post", monster: ["/auth/signup", "/auth/check-email", "/auth/checkout-resume"] },
  { id: "AU-03", navn: "Passord", natt: false, maVise: "Be om lenke, nytt passord", monster: ["/auth/forgot-password", "/auth/reset-password"] },
  { id: "AU-04", navn: "Onboarding", natt: false, maVise: "Stegviser for spiller/coach og forelder", monster: ["/auth/onboarding", "/auth/onboarding/forelder"] },
  { id: "AU-05", navn: "Samtykke via lenke", natt: false, maVise: "Forelder bekrefter, spiller venter", monster: ["/auth/guardian-consent/[token]", "/auth/lyd-samtykke/[token]", "/auth/samtykke-venter", "/inviter/forelder/[token]"] },
  { id: "AU-06", navn: "Innsyn (ekstern leser)", natt: false, maVise: "Samtykkede resultater per gruppe og spiller", monster: ["/innsyn", "/innsyn/[spillerId]"] },

  { id: "BK-01", navn: "Velg tjeneste", natt: false, maVise: "Fire steg i én flyt, pauset-tilstand", monster: ["/booking"] },
  { id: "BK-02", navn: "Velg tid og betal", natt: false, maVise: "Dag/uke, tidsluker, Stripe, Vipps", monster: ["/booking/[slug]", "/booking/[slug]/bekreft"] },
  { id: "BK-03", navn: "Kvittering", natt: false, maVise: "Referanse i mono, ics, opprett konto", monster: ["/booking/kvittering/[bookingId]"] },

  { id: "ST-01", navn: "Stats-hub og søk", natt: false, maVise: "Live-snapshot, innganger, kildehenvisning til Data Golf", monster: ["/stats", "/stats/sok", "/stats/uka", "/stats/2026", "/stats/leaderboards", "/stats/norske"] },
  { id: "ST-02", navn: "Liste med filter", natt: false, maVise: "Tabell til kortrader, filter som bryter linje", monster: ["/stats/spillere", "/stats/klubber", "/stats/baner", "/stats/turneringer", "/stats/aargang*", "/stats/regions", "/stats/pga/spillere", "/stats/blogg", "/turneringer"] },
  { id: "ST-03", navn: "Profil/detalj", natt: false, maVise: "Nøkkeltall, trend, resultater", monster: ["/stats/spillere/[slug]", "/stats/klubber/[slug]", "/stats/baner/[slug]", "/stats/regions/[slug]", "/stats/tour/[slug]", "/stats/pga/spillere/[dg_id]", "/stats/blogg/[slug]"] },
  { id: "ST-04", navn: "Turnering", natt: false, maVise: "Leaderboard live, scorefordeling", monster: ["/stats/turneringer/[slug]", "/stats/turneringer/[slug]/statistikk", "/turneringer/[slug]"] },
  { id: "ST-05", navn: "PGA-kategori og utforskere", natt: false, maVise: "Percentil, sammenligning, egne tall", monster: ["/stats/pga", "/stats/pga/drive-distance", "/stats/pga/fairway-pct", "/stats/pga/gir-pct", "/stats/pga/putts-per-round", "/stats/pga/scoring-avg", "/stats/pga/sg-total", "/stats/pga/putt-explorer", "/stats/sammenlign-spillere", "/stats/sg-sammenlign*", "/stats/min-progresjon"] },
  { id: "ST-06", navn: "Verktøy og moro", natt: false, maVise: "Kalkulatorer, quiz, sesongoppsummering", monster: ["/stats/verktoy*", "/stats/quiz", "/stats/wrapped/[slug]"] },

  { id: "GJ-01", navn: "GFGK Junior forside og grupper", natt: false, maVise: "AK-stigen, gruppeplan, kalender", monster: ["/gfgk-junior", "/gfgk-junior/gruppe/[gruppe]", "/gfgk-junior/treningsplaner", "/gfgk-junior/kalender"] },
  { id: "GJ-02", navn: "GFGK veileder", natt: false, maVise: "Kategorier, artikkel", monster: ["/gfgk-junior/veileder", "/gfgk-junior/veileder/[slug]"] },
  { id: "SY-01", navn: "Systemtilstander", natt: false, maVise: "Feilkode i mono, hva nå", monster: ["/offline", "/vedlikehold"] },
];

export const MARKED_MONSTRE = [
  { id: "MK-FORSIDE", navn: "Offentlig forside", monster: ["/"] },
  { id: "MK-JURIDISK", navn: "Personvern, vilkår og cookies", monster: ["/personvern", "/vilkar", "/cookies"] },
  { id: "MK-TILBUD", navn: "Tilbud, coach, anlegg og om oss", monster: ["/priser", "/coaching", "/junior", "/jobb", "/om-oss", "/mulligan", "/treningsfilosofi", "/kontakt", "/faq", "/coacher*", "/anlegg*"] },
  { id: "MK-INNHOLD", navn: "Blogg og cases", monster: ["/blogg*", "/cases"] },
  { id: "MK-BEKREFT", navn: "Offentlig bekreftelse", monster: ["/suksess"] },
  { id: "MK-PRODUKT", navn: "Produktpresentasjon", monster: ["/playerhq"] },
];
