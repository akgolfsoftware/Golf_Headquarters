# Betaling og personvern — kontroll 1. oktober 2026

Utgangspunkt: `ea3cdd176` på main; synkronisert med `03fda3ed5` før sluttføring. Arbeidsgren: `codex/betaling-personvern-2026-10-01`.
Dette er en teknisk kontroll av avgrensede feil, ikke en lanseringsgodkjenning eller juridisk vurdering.

## Rettet

- Avbestilling, tilbakeføring av klipp og opprettelse av refusjonsjobb lagres i samme databasetransaksjon. Samtidige kall kan ikke tilbakeføre flere klipp. En samtidig endring av bookingen avvises med beskjed om å prøve igjen.
- Refusjonsjobben bruker eksisterende `WebhookFailure`, stabil Stripe-nøkkel og kontroll av betalingsbeløp, valuta og faktisk refusjonsstatus. Planlagt oppfølging leser også disse jobbene. Nye jobber bruker kilden `booking-refund`; eldre manuelle `stripe-refund`-saker startes ikke automatisk. Prosessavbrudd eller leverandørfeil mister ikke refusjonsbestillingen; etter fem mislykkede oppfølgingsforsøk varsles eksisterende driftskanal.
- Avbestillingsmelding får det faktiske resultatet: penger refundert, klipp tilbakeført eller refusjon som venter. En avvist e-post fra Resend regnes som feil. Bookingtid formateres fra lagret Oslo-veggklokke, uavhengig av serverens tidssone. HTML-tegn i tekst behandles som tekst.
- Personvernets tørrkjøring går ut før skriving. Den sletter heller ikke feillogger.
- Kontoen ferdigmarkeres først når ekstern sletting lykkes. Opprinnelig slettedato beholdes ved gjenforsøk. Returnerte Storage-feil beholdes som feil, og lydreferansen beholdes for nytt forsøk. Opptak uten lydfil får også tømt transkripsjon og analyse.

## Bevis

- Målrettede programtester dekker tilgangsavvisning, frist, klipp, samtidige kall, refusjonsfeil, gjentakelse, ventende Stripe-refusjon, varig kø, e-postavvisning og sletting som må prøves igjen.
- Tre integrasjonsprøver består i separat lokalt miljø: ekte Stripe-testbetaling refundert én gang med én lagret betalingsrad; to samtidige avbestillinger gir ett klipp; tørrkjøring lar lokale profil- og treningsrader være identiske før/etter.
- Stripe-integrasjonen bruker allerede autorisert testkonto og tidligere syntetiske Checkout-betalinger. Ingen virkelige penger eller kunder. Testhistorikken beholdes.
- E-postprøven bruker appens Resend-klient mot en lokal HTTP-mottaker. Den viser riktig innhold og håndtering, **ikke** levering hos Resend eller mottakerens e-postkonto.
- Integrasjonsprøven setter syntetisk forespørselsidentitet direkte. Den erstatter ikke de tidligere nettleserprøvene av innlogging. Kalender, varsel og revisjonslogg er avgrenset bort i denne prøven.

Kjøring: Node 24, `node scripts/local-users-run.mjs priority-journeys`. Krever klargjort lokal rigg, gyldig Stripe-testtilgang og minst én betalt syntetisk booking fra `stripe`-prøven. Midlertidige klippbookinger og abonnement ryddes etter prøven; betalingshistorikk beholdes.

Full `npm run verify` bestod med 3 933 programtester, 18 komponenttester og produksjonsbygg. Dokument-/mappesjekk inngår og bestod. Ekstra typekontroll etter siste endring bestod. Eksisterende ikke-blokkerende kontrastmeldinger om designkildene er ikke løst av dette funksjonsarbeidet. GitHub-/publiseringsresultat dokumenteres i tilknyttet PR; lokal kontroll alene er ikke CI-bevis.

## Sikkerhet og personvern

1. Avbestilling beholder eksisterende innloggings-, samtykke- og eierskapssjekk. Oppfølgingsrutene beholder eksisterende cron-autentisering og frekvensbegrensning. Negativ eierskapsprøve består.
2. Nye tester bruker bare syntetiske data. Stripe-tilgang leses fra ignorert lokal miljøfil. E-postmottaker bindes til lokal maskin og avviser adresser uten testdomene. Ingen nye personfelt eller hemmeligheter er lagt til Git.
3. Ingen nye tilgangsregler, åpne personflater, skjemaendringer eller produksjonsinnstillinger. Slettingens eksisterende beslutning om å beholde tallhistorikk videreføres. Dette beviser ikke at alle personfelt i hele prosjektet anonymiseres.

## Gjenstår før L05/L06 kan lukkes

- Abonnementsreise med fornyelse, mislykket betaling, oppsigelse og gjentatte/ombyttede betalingsmeldinger.
- Delvis refusjon, refusjon initiert utenfor appen og operativ oppfølging av jobber som gir opp.
- Faktisk e-postleveranse, aktive maler og domeneoppsett. Leveringsfeil logges, men denne endringen legger ikke til varig e-postkø.
- Full ekstern sletting med Auth, lagring, Stripe-kunde og profilkobling, inkludert test av `dashboard.delete_profile_data`. Det lokale databaseoppsettet er ikke bevis på at den funksjonen finnes eller virker i produksjon.
- Eldre kontoer som allerede er feilaktig ferdigmarkert må kartlegges separat; denne rettingen gjenåpner ikke historiske produksjonsrader.
- Dataportabilitet: dagens eksport må kartlegges mot alle nåværende datamodeller, inkludert Workbench og filinnhold. Relasjonsprofiler og tekst i slettekvitteringer trenger videre gjennomgang. Den eldre statusen fra juli beskriver ikke hele dagens kode.
