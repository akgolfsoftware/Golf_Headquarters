# Arbeidsliste — AK Golf HQ

**Oppdatert 11.09.2026.** Denne filen eier gjeldende rekkefølge. Den tidligere masterplanen er bevart i sin helhet, med alle oppgaver og beslutningskøer, i [planarkivet](arkiv/opprydding-2026-09-10/masterplan-gjenstaaende.md).

## Bestillingen som gjelder nå

Anders ønsker en komplett app før åpen lansering med booking og betaling. Prosjektoppryddingen er gjennomført lokalt i commit `664ca2118`. Anders optimaliserer nå alle skjermer parallelt i Claude Design. **Ingenting av det eksisterende designet er låst.** Tidligere designplaner og godkjenninger er arbeidsunderlag, ikke automatisk gjeldende byggeordre.

Oppryddingens resultat og verifikasjon står i [prosjektkartet](vedlikehold/prosjektkart.md). Ingen av de gamle funksjonsbestillingene er slettet eller erklært levert ved arkivering.

## Neste arbeid

**Main-samling og arbeidsdeling 11.09:** Seks kontrollerte kodepakker gjennom `2bd5a052c` er flettet til main via [PR #835](https://github.com/akgolfsoftware/Golf_Headquarters/pull/835), merge `2807d4d08`: valgt designgrunnlag, PlayerHQ-navigasjon, I dag, Plan, PH-04 og PH-05, samt første TN-18/WANG C7-rettinger. Full lokal verify, **2 326 tester** og **292 skjermvarianter** bestod. Dette er testet kode, ikke ferdig visuell godkjenning av alle fire flater. Detaljer og åpne avvik står i [port-auditen](design-audit/portering-fire-flater-2026-09-10.md).

Neste to pakker har atskilte filer og arbeidsmapper: **Claude Code / Sonnet 5 tar D2-PH06**, oppsummeringen etter trening. **Codex tar D2-PLAN**, eldre planøkter og konsistent ukeprogresjon. Se [arbeidsdelingen](planer/arbeidsdeling-codex-claude-2026-09-11.md) og [komplett Claude-prompt](planer/claude-code-sonnet-5-ph06-prompt.md). Pågående produktplan/intervju og manuell SG i andre arbeidsgrener er ikke erklært ferdige eller slettet av samlingen.

**Samlet leveranse 10.09:** DataGolf/GolfBox fra [PR #833](https://github.com/akgolfsoftware/Golf_Headquarters/pull/833) er bevart og avstemt med de fire lokale endringssettene, øvrige rettinger og gjennomgåtte grenrester. Full verify, 2 290 tester og separate lokale databaseprøver bestod på sluttkoden. Se [grenregnskapet](beslutningsgrunnlag/grener-og-main-2026-09-10.md). Ekstern kontroll av PR, CI og faktisk produksjonsversjon dokumenteres i publiseringsoppgaven. Claude Design arbeider videre med H2-04-tilbakemeldingen ifølge Anders.

**Designgrunnlag bestilt og laget 10.09:** [AK HQ Design](design-system/ak-hq-designarbeid.md) samler en prosjektspesifikk skill, komplett hovedprompt, komponent-/reisekatalog, formatkrav og inventar fra hele appen. Dette er grunnlaget for videre designarbeid; komponentene og skjermene er ikke erklært ferdig tegnet eller implementert.

| ID | Ansvar og status | Konkret oppgave | Klar når |
|---|---|---|---|
| D1 | Byggegrunnlag valgt av Anders 10.09 | Train-lock ZIP (4) for PlayerHQ/AgencyOS, levert Claw-pakke for interne TN-skjermer og WANG-speilet for WANG | Hver reise kobles til den konkrete valgte kilden; andre områder kan fortsatt revideres |
| D2 | Seks kontrollerte kodepakker i main-samlingen; resten fordelt på separate pakker | Bygg **alle skjermene** i PlayerHQ, AgencyOS, Team Norway og WANG. [Kilder og kontrollstatus](design-audit/portering-fire-flater-2026-09-10.md) | Funksjoner, datalagring, tilgang og relevante tilstander virker; mobil/desktop er sammenlignet med valgt kilde, og Anders har sett resultatet |
| D2-PH06 | Klar for Claude Code / Sonnet 5 | Oppsummering etter trening, faktiske resultater og bevart vurdering/notat | PH-06 er komponent-/funksjonsprøvd og sammenlignet med valgt kilde; innlogget og visuell status er eksplisitt |
| D2-PLAN | Implementert og regresjonstestet lokalt på `codex/plan-legacy-2026-09-11`; [rapport](design-audit/plan-legacy-2026-09-11.md) | Eldre planøkter uten V2-speil i Plan/ukeprogresjon | Riktig synlighet, status, Oslo-uke og én telling per økt er regresjonstestet |
| T1 | Lokale rettinger og åtte reiser mot ekte testdatabase prøvd — nettleserreise gjenstår | Rett R1 først, deretter datalagring og sammenheng i R2/R3/R5/R8 samt tilgang og videresending i R6/R7 | Målrettede tester bekrefter både tillatt oppførsel og avviste/feilende tilfeller |
| F1 | Versjonert registrering implementert/testet lokalt — fagspørsmål og samlet integrasjon gjenstår | [Språk og treningsstruktur](beslutningsgrunnlag/sprak-og-treningskvalitet-2026-09-10.md), særlig [testbatteri mot Excel v3](beslutningsgrunnlag/team-norway-excel-v3-kontroll.md) | Én versjonert protokoll styrer felt, enheter, rekkefølge, validering og beregning i faktisk registrering; åpne fagspørsmål er avklart |

Tekniske rettinger som ikke bestemmer utseendet kan gjennomføres parallelt med Claude Design når de er bestilt. Ny skjermbygging bruker en navngitt versjon; resten av designet trenger ikke være ferdig først. Komplett app før lansering er fortsatt målet. Se [overlevering fra Claude Design](../designsystem/README.md).

## Bekreftede funn som må inn i videre prioritering

[Revisjon 10.09.2026](beslutningsgrunnlag/revisjonsfunn-2026-09-10.md) beskriver bevis og begrensninger.

| ID | Arbeid | Ferdig når |
|---|---|---|
| R1 | Coach-tilgang til andre spilleres økter | Uvedkommende coach avvises ved lesing og skriving; riktig coach fungerer |
| R2 | Avslutt økt og se eget sammendrag | Status lagres, spilleren kommer ut av gjennomføringen og ser faktisk lagrede resultater |
| R3 | Sammenheng mellom I dag og Plan | Den samme publiserte økten finnes og har samme status gjennom spillerreisen |
| R4 | Offentlig bookingdesign | Hele bookingflyten følger en valgt designversjon og fungerer på mobil og desktop |
| R5 | Valgt coach følger bestillingen | Riktig coach brukes ved kollisjonskontroll og lagres på bookingen |
| R6 | TALENT-tilgang | Tillatte innganger virker, låste funksjoner gir riktig oppgraderingsvei |
| R7 | Ny økt-adresse | Ingen runddans mellom to videresendinger |
| R8 | Publisering av flere økter | Feil gir dokumentert, konsistent resultat; ingen skjult delvis publisering |
| R9 | Full kundereise med betaling | Booking, betaling, bekreftelse og etterfølgende administrasjon er prøvd samlet i riktig miljø |

Dette er funn til prioritering, ikke et forslag om å kutte resten av produktet fra lanseringen.

## Bevarte arbeidsunderlag

- [Full tidligere arbeidsliste og beslutningskø](arkiv/opprydding-2026-09-10/masterplan-gjenstaaende.md): inneholder også uferdige og parkerte bestillinger. Leveransestatus må kontrolleres mot kode og Git før en oppgave gjenopptas.
- [Train-lock-plan fra 09.09](planer/design/2026-09-09-train-lock-full-port.md): historisk retning, oppgaver og daterte tellinger. Designvalgene er åpnet igjen 10.09; planen skal ikke utføres automatisk.
- [Detaljert designport](planer/design/2026-09-05-komplett-designport.md) og [skjermvedlegg](planer/design/2026-09-05-komplett-designport-vedlegg-skjermer.md).
- [Markedsplan](planer/design/2026-09-04-marked-ak-golf-port.md), [Team Norway](planer/design/2026-09-06-team-norway-skjermer.md), [WANG/TN](planer/design/2026-09-08-wang-tn-port.md).
- [Produktregler](platform/BUSINESS-RULES.md), [treningsfaglig fasit](FASIT-AK-GOLF-HQ.md), [beslutninger med gjeldende designavklaring](../.claude/rules/beslutninger.md).

## Slik oppdateres listen

Gi nytt arbeid en konkret hensikt, berørte flater, ferdigkriterium og dokumentert resultat. Skill mellom foreslått, bestilt, bygget, testet og sett av Anders. Flytt avsluttede statusfortellinger til arkiv. En merge eller en grønn test flytter ikke automatisk en skjerm til «godkjent».

Teknisk arbeid 10.09: se [rettinger og kontrollstatus](beslutningsgrunnlag/teknisk-retting-2026-09-10.md). R1/R2/R3/R5/R6/R7/R8 er endret lokalt; de er ikke bekreftet ferdige i produksjon.

Designkontroll 10.09: [ZIP (2)-review](beslutningsgrunnlag/claude-design-zip-2-review-2026-09-10.md), [oppdatert overleveringsprompt](design-system/claude-design-komplett-overlevering.md) og [gjennomføringsløp til lansering](design-system/lanseringslop-2026-09-10.md). Prompt-skillene er revidert; gammelt modell-/prisgrunnlag og uautoriserte stopp er fjernet. Ingen designversjon er valgt automatisk ved mottak av ZIP.

## Teknisk kontroll 10.09.2026 — parallelt med Claude Design

Team Norway-tildeling/talent, private tester, gjennomføringsstatus og betalingsvalidering er rettet lokalt. Se [kontrollrapporten](beslutningsgrunnlag/teknisk-lanseringskontroll-2026-09-10.md). Databasevern på ni tabeller er nå utført etter Anders’ eksplisitte godkjenning. Begge klientroller og appens faktiske servertilkobling er kontrollert. Isolert lokal PostgreSQL og lokal gjenopprettingsprøve er nå gjennomført. Booking, betaling, refusjoner og klokkeslett er ytterligere rettet og testes samlet. Funksjonssikkerhet er klargjort og testet lokalt, men produksjonskjøringen ble avvist av automatisk godkjenningskontroll og venter på konkret godkjenning. Stripe-testnøkler, testinnlogging, full nettleserreise, produksjonsgjenoppretting og faktisk alarmprøve gjenstår. Hele appen er ikke lanseringsklar.

Ny designleveranse 10.09: [ZIP (3)-kontroll](beslutningsgrunnlag/claude-design-zip-3-review-2026-09-10.md) og [konkret tilbakemelding](design-system/claude-design-zip-3-tilbakemelding.md). H2-03 v2 retter kildelesing og blocked-rekkefølge, men resultatkorrigering tillater fortsatt ugyldige tall. Den bestilte samlede pakken er fortsatt ufullstendig.


## Samlet lokal kandidat

Etter Anders’ godkjenning av samlingsplanen er kodearbeidet avstemt i `.worktrees/samlet-lanseringskontroll`, basert på `main` med den nyere DataGolf/GolfBox-leveransen. Se siste avsnitt i [kontrollrapporten](beslutningsgrunnlag/teknisk-lanseringskontroll-2026-09-10.md) for endelige tester og nye rettinger av abonnementsbooking, coachvarsling, frister, skjulte økter og måltilgang.

Nye faglige restpunkter: frekvensmål må knyttes til varige gjennomføringsdata for alle øktmodeller; Team Norway-testmål trenger variant, antall, enhet, retning og utgangspunkt før automatisk målprosent kan brukes. Ingen historiske verdier skal gjettes. Historiske grenrester er nå tatt med eller dokumentert erstattet, og den samlede kvalitetsgaten er grønn. De faglige restpunktene er fortsatt åpne.
