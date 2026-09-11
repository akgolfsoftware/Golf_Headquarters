# Status nå — AK Golf HQ

Oppdatert 11.09.2026. **Appen er ikke klarert for åpen lansering.** Anders ønsker komplett app med booking og betaling; designet er fortsatt åpent og videreutvikles i Claude Design.

## Gjennomført

- **Main-samling 11.09:** seks kontrollerte kodeleveranser gjennom `2bd5a052c`: felles valgt designgrunnlag, PlayerHQ-navigasjon, I dag, Plan, PH-04/PH-05 og første TN-18/WANG C7-rettinger. Full lokal verify/Next/Serwist, **2 326 tester** og **292 syntetiske skjermvarianter** bestod. [Port-auditen](design-audit/portering-fire-flater-2026-09-10.md) skiller implementasjon, visuell vurdering og innlogget kontroll. Hele appen er fortsatt under arbeid.
- **Neste arbeid fordelt:** Claude Code / Sonnet 5 får PH-06-oppsummering. Codex tar eldre planøkter og ukeprogresjon. [Arbeidsdelingen](planer/arbeidsdeling-codex-claude-2026-09-11.md) angir separate filer/arbeidsmapper og en komplett overleveringsprompt. Pågående produktplan/intervju og manuell SG er bevart utenfor samlingen.

- **Samlet kodeleveranse 10.09:** fire lokale endringssett, øvrige rettinger, kontrast fra 150 filer og det lagrede GolfBox-sesongtillegget er samlet og kontrollert. Full verify og **2 290 tester** bestod, i tillegg til ti lokale databasereiser, fem sikkerhetsprøver og gjenoppretting. Se [grenregnskapet](beslutningsgrunnlag/grener-og-main-2026-09-10.md) og siste del av [kontrollrapporten](beslutningsgrunnlag/teknisk-lanseringskontroll-2026-09-10.md). CI, preview og produksjonsversjon dokumenteres i den tilhørende PR-en og publiseringsoppgaven.
- DataGolf/GolfBox er flettet til `main` via [PR #833](https://github.com/akgolfsoftware/Golf_Headquarters/pull/833) 10.09 kl. 13:51 Oslo. GitHub-kontrollen og Vercel-preview bestod. Produksjonsadressen er kontrollert mot Vercels metadata: `50e64ae078ddcd0537070e07e0d90ffe3091becf`, fra Git/main, status `READY`. Innlogget produksjonsreise og historisk datadekning etter ordinær synk er ikke kontrollert i denne oppfølgingen.
- Prosjektopprydding og felles arbeidsgrunnlag er på plass. Historikk og opprinnelige dokumenter er bevart; se [prosjektkartet](vedlikehold/prosjektkart.md).
- Team Norway-registrering, tildeling, talentkobling, trenerinnsyn og treningsstatus er rettet lokalt. Uavklarte fagregler kan ikke gi en oppfunnet standardscore.
- Booking og betaling er forbedret: riktig coach og kapasitet, vern ved feilet betalingslenke, hendelser i vilkårlig rekkefølge, refusjoner og konsekvent bookingklokke.
- Isolert PostgreSQL er opprettet. Trening, tilganger, samtidige bestillinger, TN-lagring og betalingshendelser er prøvd mot ekte lokal database med syntetiske brukere. Lokal sikkerhetskopi er gjenopprettet med bevart booking og kollisjonsvern.
- Tilgangsvernet på ni produksjonstabeller er aktivert etter Anders’ godkjenning og kontrollert med klientroller og appens servertilkobling. Dette er den eneste utførte databaseendringen i dette lanseringsarbeidet.
- ZIP (3) er undersøkt og klikkprøvd. Kildelesingen er forbedret; korrigering av testresultater har fortsatt konkrete feil.
- Siste Claude Design-ZIP legger til DataGolf H2-04. [Kontrollen](beslutningsgrunnlag/claude-design-datagolf-h2-04-review-2026-09-10.md) bekrefter spillerreisen, men avdekker feil ved manglende proffreferanse, angre under lagring og gjenåpning. H2-03 og resten av pakken er i hovedsak uendret; [tilbakemelding til Claude Design](design-system/claude-design-datagolf-h2-04-tilbakemelding.md) er klar.
- Produksjonsbygg og samlet kodekontroll bestod i isolert kopi. 2 283 tester bestod, i tillegg til egne database-, sikkerhets- og gjenopprettingsprøver. Tolv eksisterende kontrastavvik gjenstår.

Siste bygg-/testresultat og presise begrensninger står i [teknisk kontrollrapport](beslutningsgrunnlag/teknisk-lanseringskontroll-2026-09-10.md). [Designkontrollen](beslutningsgrunnlag/claude-design-zip-3-review-2026-09-10.md) og [tilbakemeldingen til Claude Design](design-system/claude-design-zip-3-tilbakemelding.md) beskriver neste designleveranse.

## Gjenstår før lansering

Kodearbeidet er samlet med den nyere DataGolf/GolfBox-leveransen og gjennomgåtte grenrester. Original arbeidsmappe, gamle grener og stasher er bevart under kontrollen. Teknisk samling er ikke en godkjenning av komplett design eller åpen lansering.

1. Konkret godkjenning av funksjonssikkerhet i produksjon. SQL og lokale tester er ferdige; automatisk godkjenningskontroll avviste omfanget fordi generell tidligere godkjenning ikke var tilstrekkelig. Ukjente klienter kan bli påvirket; den kjente helseklientens servertilgang beholdes.
2. Stripe-testnøkler og testinnlogging for hele nettleserreisen, inkludert bekreftelser, kalender og reelle feilscenarioer. Ingen Stripe-testbetaling er gjennomført.
3. Valgt og komplett designleveranse, retting av prototypens resultatkorrigering, portering og visuell kontroll. ZIP-registeret har fortsatt 193 rader som venter på design; repoet har nå 479 sideruter.
4. Måloppfølging på tvers av øktmodeller og variantbundet Team Norway-målfremdrift. Resterende fag-/språkavklaringer, produksjonens innloggingsvern, faktisk varslingsprøve og gjenopprettingsprøve fra produksjonskopi med innlogging og filer.

Arbeidslisten eies av [MASTERPLAN-GJENSTAAENDE.md](MASTERPLAN-GJENSTAAENDE.md). DataGolf/GolfBox og tidligere samling er integrert via PR #833/#834. De nyere porteringene inngår i main-samlingen 11.09; faktisk publisert versjon og innlogget produksjonsreise må bekreftes separat. Offentlig booking er ikke åpnet som del av dette arbeidet.

## Historikk

[Status før oppryddingen](arkiv/opprydding-2026-09-10/status-nå.md) og daterte kontrollrapporter er bevart. Tidligere grønne kontroller gjelder sine daværende versjoner; de er ikke en lanseringsgodkjenning av dagens app.
