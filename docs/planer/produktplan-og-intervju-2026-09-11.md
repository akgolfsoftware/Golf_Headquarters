# Produktplan og intervju — AK Golf HQ

> Samlet 11.09.2026: Dette er bevart planleggingsunderlag fra den separate produktoppgaven. Statusbeskrivelser nedenfor gjelder det oppgitte revisjonsgrunnlaget. Gjeldende rekkefølge og nyere leveranser står i [masterplanen](../MASTERPLAN-GJENSTAAENDE.md).

11.09.2026. Første arbeidsutkast etter Anders' bestilling om plan, produktintervju og arbeidsmåte før main. Planlegging er bestilt; denne filen starter ingen kodeendring, databaseendring eller publisering.

## Hva vi skal få på plass

1. En kort produktbeskrivelse i Anders' egne ord: hvem appen er til for, hvilket problem den løser og hvordan vi vet at den lykkes.
2. Ett [funksjonsregister](funksjonsregister-2026-09-11.md) som samler eksisterende funksjoner, arbeid som pågår og bevarte planer, inkludert baneguide og vindverktøy.
3. En prioritert gjennomføringsliste med avhengigheter og konkrete ferdigkriterier.
4. Et [funksjonskort](funksjonskort-mal.md) per bestilt funksjon, fra brukerbehov til testet leveranse.
5. En fast arbeidsmåte hvor Anders kan se og prøve resultatet før det eventuelt legges i main, prosjektets felles hovedversjon.

Dette er et arbeidsunderlag til [gjeldende arbeidsliste](../MASTERPLAN-GJENSTAAENDE.md). Det erstatter ikke produktreglene eller allerede bestilt skjermarbeid. Komplett app før åpen lansering er fortsatt utgangspunktet; etapper er en arbeidsrekkefølge, ikke et automatisk kutt i produktet.

## Grunnlaget og hva som er usikkert

Planen bygger på kodegjennomgangen 10.09, [produktreglene](../platform/BUSINESS-RULES.md), [Agent Brief](../platform/AGENT-BRIEF.md), [planarkivet](../arkiv/opprydding-2026-09-10/masterplan-gjenstaaende.md), baneguideplanen og de nyere DataGolf-, design- og testleveransene. Kildeoversikten står i funksjonsregisteret.

Kodegrunnlaget for revisjonen var main `8e6f346d7`. Den separate porteringen er undersøkt til `c3aa618c6` på `codex/portering-fire-flater-2026-09-10`; ytterligere Live-arbeid var ucommittet ved lesing. Det betyr at revisjonsfunn må avstemmes med denne grenen før de implementeres. Planfilene ligger i egen arbeidsmappe og gren `codex/produktplan-og-intervju-2026-09-11`, startet fra main `8e6f346d7`.

Revisjonen hadde 2 290 beståtte tester og separat typekontroll. Det er historisk kontrollbevis for det undersøkte grunnlaget, ikke en påstand om at denne planen eller hele appen er testet i produksjon. Funksjonsregisteret er en første samling av de gjennomgåtte planene, ikke en ny ende-til-ende-godkjenning av hver funksjon.

Dokumentene beskriver allerede et samlet coaching-system: spillerutvikling, coacharbeid, booking og virksomhetsdrift. Intervjuet skal gjøre denne retningen presis og oppdatert. Vi begynner ikke med å bestemme menyer eller legge til flest mulig funksjoner.

## Gjennomføringsplan

| Etappe | Arbeid | Konkret leveranse og ferdigkriterium |
|---|---|---|
| 1. Produktavklaring | Intervju Anders om mål, hovedbrukere og de viktigste situasjonene. Bruk eksisterende svar som utgangspunkt. | En produktbeskrivelse med ønskede resultater, målgruppe, prioriteringsregel og hva vi foreløpig ikke har bestemt. |
| 2. Avstemme funksjonene | Gå gjennom registeret familie for familie. Kontroller kode, gjeldende gren og faktisk brukerreise før «ferdig». | Hver funksjon har kilde, behov, status, åpne beslutninger og plass i helheten. Historiske oppgaver er enten bekreftet relevante, erstattet med begrunnelse eller uttrykkelig parkert av Anders. |
| 3. Grunnleggende rettinger | Gjennomfør bestilte revisjonspakker nedenfor. Start med tilgang, data til AI og lagring på enheten. Bygg nødvendig testgrunnlag samtidig. | Feilene kan først påvises i målrettede prøver, deretter bekreftes rettet. Alle berørte roller og feiltilfeller dekkes. |
| 4. Hele spiller- og coachreisen | Avstem porteringen med I dag → Plan → økt → resultat → neste handling, samt coachens tildeling og oppfølging. | Den samme økten og de samme resultatene er konsistente på tvers av skjermene. Gjennomført, avbrutt og usynkronisert er ulike tilstander. |
| 5. Kunde- og organisasjonsreisene | Fullfør booking/betaling, forelder, WANG/GFGK og Team Norway mot eksisterende bestillinger og intervjuavklaringer. | Hele reisen virker med riktig rolle, pris, tilgang, testdata og feilbehandling. Gjenstående fagspørsmål er besvart før avhengige beregninger bygges. |
| 6. Nye og utvidede verktøy | Ta baneguide, vind, bag, analyse og øvrige åpne funksjoner i valgt rekkefølge. Bruk et funksjonskort per sammenhengende leveranse. | Hver funksjon løser et bekreftet behov og er koblet til appens data og neste handling. Ingen isolert demonstrasjon føres som levert funksjon. |
| 7. Samlet lanseringskontroll | Full kontroll av avklart omfang, brukerreiser, drift, sikkerhetskopi, tilbakeføring og faktisk publisert versjon. | Avtalte lanseringskrav er oppfylt og Anders har gitt konkret publiseringsbestilling. Følg også [lanseringsløpet](../design-system/lanseringslop-2026-09-10.md). |

Rekkefølgen mellom nye funksjoner avgjøres etter de første intervjusvarene. Arbeid uten avhengighet kan gå samtidig i separate arbeidsmapper; samme filer og datakontrakter skal ha én ansvarlig oppgave. Vi setter ikke dato eller timeanslag før omfanget og avhengighetene er forstått.

## Arbeidspakker fra kodegjennomgangen

`REV-F1`–`REV-F11` viser til revisjonens funn F1–F11. Prefikset skiller dem fra eksisterende F- og R-nummer i masterplanen. Prioriteten gjelder konsekvensen av funnet; status må kontrolleres på nytt ved oppstart.

| Pakke | Funn og konkret endring | Ferdigkriterium | Avhengighet eller hensyn |
|---|---|---|---|
| R-A Tilgang i Caddie | **REV-F1:** Bevar spilleravgrensning også ved søk. Kontroller eierskap/coachrelasjon på direkte oppslag per verktøy. | Syntetiske data viser at søk og direkte ID-oppslag avviser uvedkommende og fortsatt finner tillatte spillere. | Dagens chatinngang er ADMIN-begrenset. Funnet skal ikke beskrives som en bekreftet ordinær coach-eksponering. Kilde: `src/lib/caddie/tools/read.ts`. |
| R-B Opplysninger til AI | **REV-F2:** Samle dataminimering før utgående AI-kall; bruk pseudonymer og tillatte felter for verktøyresultater, historikk og fritekst. | Test viser at syntetisk navn/e-post ikke forlater grensen, mens nødvendige treningsdata beholdes. Koblingen tilbake til personen beholdes på serveren. | Avklar hvilke data AI trenger. Ikke send virkelige persondata som prøve. Kilder: `src/app/api/caddie/chat/route.ts`, `src/lib/ai/anonymiser.ts`. |
| R-C Privat lokal lagring | **REV-F3 + REV-F8:** Gi private ruter felles regel mot uønsket mellomlagring. Knytt lokale opptak/kladd til riktig bruker og en avtalt beholdningstid. | Nettbortfall, utlogging, utløpt innlogging og bytte av bruker viser aldri en annens innhold. Brukeren kan forstå og håndtere ulagrede utkast. | Koordiner med pågående Live-køarbeid. Ikke løs dette ved å slette usynkroniserte opptak uten forklaring. Kilder: `src/app/sw.ts`, `src/lib/offline-queue/recording-chunk-queue.ts`. |
| R-D Korrekte måleenheter | **REV-F4:** Ta med enheten fra TrackMan-kilden gjennom hele importen. Skill carry fra total. Stans gjetting basert på tallstørrelse. | Faste testfiler dekker m/s, mph, meter, yards og manglende enhet/carry. 70 m/s og 330 m beholdes korrekt. Manglende verdi blir ikke en oppdiktet måling. | Avklar ukjent kildeenhet i importen. Eventuell historisk datakorrigering planlegges separat, med konkret autorisasjon. Kilde: `src/lib/trackman/canonical.ts`. |
| R-E Reelle brukerreiser i test | **REV-F5:** Lag stabilt, isolert testoppsett med syntetiske roller. Kjør nødvendige innloggede reiser på den versjonen som skal vurderes. | Kjerneforløp kan ikke gi grønt resultat ved å bli hoppet over. Booking/betaling bruker korrekt testintegrasjon. Publiseringskontroll bekrefter samme kodeversjon som ble levert. | Start grunnlaget tidlig; utvid per funksjon. Dagens PR-kontroll og produksjonstest erstatter ikke dette. Kilder: `.github/workflows/ci.yml`, `.github/workflows/playwright.yml`, `tests/e2e/`. |
| R-F Mål og gjennomføring | **REV-F6:** Bruk faktisk startverdi og et felles, dokumentert leselag for gjennomføring fra de eksisterende øktmodellene. Fjern dobbelttelling. | Nytt mål starter korrekt. Gjennomføring teller én gang i riktig periode. Manglende historikk vises som ukjent. Team Norway-mål har variant, antall, enhet, retning og utgangspunkt. | Faglige definisjoner avklares i intervjuet. Separate øktmodeller beholdes. Mulige nye databasefelt krever egen konkret bestilling. Kilde: `src/lib/portal/goals/progress.ts`. |
| R-G Neste økt | **REV-F7:** Avstem og kontroller rettingen som allerede er implementert i porteringens `bb66959ef`. Ikke lag en ny parallell retting. | Tidligste tillatte økt velges på tvers av modeller, også ved måned-/årsskifte, på den samlede versjonen. | Status: implementert lokalt i annet arbeid; main og produksjon er ikke bekreftet oppdatert i denne planleggingen. Kilde: `src/lib/portal/idag-data.ts`. |
| R-H Tilgang ved driftsfeil | **REV-F9:** Skill «abonnement finnes ikke» fra «kunne ikke hente abonnement». | Databasen utilgjengelig gir forståelig feil og nytt forsøk, uten feil betalingskrav eller uautorisert tilgang. | Behold gjeldende tilgangsregler. Kilde: `src/lib/auth/getCurrentUser.ts`. |
| R-I Sterkere tilgangskontroll i kode | **REV-F10:** Kontroller faktiske eksporterte handlinger og ressursavgrensning; bygg avvisningstester. | Bygget 12.09: ubrukt vaktimport feiler; representative handlinger avviser uten skriving. [Kontroll](../design-audit/handlingstilgang-r-i-2026-09-12.md). Innlogget reise og øvrige handlinger gjenstår. | Innfør gradvis per berørt modul. Statisk kodeanalyse er et supplement til faktiske prøver. Kilde: `scripts/check-action-auth.mjs`. |
| R-J Samtykkegrunnlag | **REV-F11:** Lag oversikt over formål, opplysningstype, rolle, alder, deling og faktisk lagringssted. Oppdater tekster etter avklart grunnlag. | Tekst, samtykkehistorikk og faktisk tilgang samsvarer for hvert formål. | Ikke bytt automatisk 16 til 13 år; avklar hva hvert samtykke gjelder. Region og regelverk må verifiseres før implementering. Kilder: `src/lib/health/samtykke-regler.ts`, `src/lib/auth/minor.ts`. |

Foreslått startrekkefølge når retting bestilles: R-A/R-B, deretter R-C/R-D/R-H, med R-E som testgrunnlag underveis. R-F/R-J følger nødvendige fagavklaringer. R-G kontrolleres ved samling; R-I forsterker berørte tilgangsgrenser. Tidligere R1–R9 i masterplanen skal avstemmes, ikke opprettes på nytt.

## Slik arbeider vi med én funksjon før main

**Du bestemmer behov, faglige regler og ønsket resultat. Jeg undersøker, konkretiserer, bygger og dokumenterer kontrollen.** Claude Design kan brukes til utforming når oppgaven trenger det. Du skal slippe å håndtere Git-kommandoer og testoppsett selv.

1. **Beskriv situasjonen.** Fyll ut funksjonskortets bruker, problem, ønsket resultat og eksempel. Kontroller hva som allerede finnes. Én ny meny er ikke i seg selv et brukerbehov.
2. **Avklar bare det som mangler.** Still spørsmål om valg som påvirker produktet eller dataene. Bruk tidligere svar. Når bygging allerede er bestilt og omfanget er klart, fortsetter arbeidet uten en ekstra generell godkjenningsrunde.
3. **Gjør funksjonen prøvbar.** Beskriv start, handlinger, lagring, resultat, tilbakevei og feil. For nye skjermer: knytt reisen til en navngitt valgt designversjon, mobil 390 px, desktop og relevante temaer/tilstander. Valgte pakker i den aktive porteringen brukes videre; de velges ikke om igjen i dette intervjuet.
4. **Opprett egen arbeidsgren og arbeidsmappe.** En `codex/<funksjon>`-gren samler endringene; en egen worktree er en arbeidsmappe som skjermer annet pågående arbeid. Start fra kontrollert main eller dokumenter en nødvendig avhengig gren. Registrer hvem som eier de berørte filene.
5. **Bygg en hel, avgrenset brukerreise.** Ta med tilgang, datalagring og feilbehandling sammen med skjermen. Store funksjoner deles i små, sammenhengende leveranser. Et avtalt skjult delarbeid kan integreres separat, men en skjult knapp erstatter aldri tilgangskontroll på serveren.
6. **Test den faktiske endringen.** Kjør relevante funksjons-/tilgangstester, `npm test` og `npm run verify` for kodeleveransen. Prøv reisen i nettleser, også med feil og nettbortfall der det er relevant. Testoppsettet bruker isolerte data og testnøkler. For ren dokumentasjon brukes `npm run prosjekt:sjekk` og diffkontroll.
7. **Vis resultatet til Anders.** Lever en lokal forhåndsvisning eller en allerede autorisert ekstern testversjon, korte prøvesteg og kjente begrensninger. Vis app og valgt design ved siden av hverandre. Merk nøyaktig hvilken kodeversjon som er prøvd. Innspill rettes og berørte kontroller gjentas.
8. **Klargjør samling til main.** Oppdater mot aktuell main, løs eventuelle kollisjoner og kontroller den samlede koden. En PR, et endringsforslag, beskriver problem, ny oppførsel, kontroller og tilbakeføring. Relevant CI, automatiske kontroller i GitHub, må gjelde samme versjon. Lokal visning er mulig uten push; opprettelse av ekstern testversjon skjer innenfor konkret autorisasjon.
9. **Legg inn når det er bestilt.** Anders godkjenner den konkrete leveransen før merge/publisering dersom dette ikke allerede er uttrykkelig bestilt. Kontroller først om main automatisk publiseres, og forklar den faktiske konsekvensen. Teknisk grønt, visuell vurdering og publiseringsbeslutning registreres hver for seg.
10. **Kontroller etter innlegging.** Bekreft hvilken versjon som faktisk kjører, prøv den avtalte reisen i riktig miljø og oppdater status. Ha en konkret måte å tilbakeføre koden på; databaseendringer trenger sin egen vurderte tilbakeføringsplan.

**Før main skal kortet ha:** avklart behov og omfang, valgt design når relevant, riktig tilgang/lagring, beståtte relevante kontroller på sluttversjonen, Anders' nødvendige vurdering, kjente avvik og plan for tilbakeføring. Dette skal være synlig bevis, ikke bare avkryssing.

## Hvordan du kan fortsette i praksis

Bruk denne samtalen til produktintervju og prioritering. Når en funksjon er avklart, er funksjonskortet bestillingen for bygging. En egen byggeoppgave kan opprettes når du ber om det. Alle byggeoppgaver peker tilbake til kortet og den samme arbeidslisten.

Neste funksjon velges etter fire forhold: hvor viktig brukerproblemet er, hvor ofte det oppstår, hvilke andre funksjoner den muliggjør, og hvor mye usikkerhet som må løses. Feil i tilgang, betaling, lagring og faglige tall kan måtte rettes før nye verktøy. Alt øvrig omfang beholdes synlig, også det som venter.

Ved hver gjennomgang viser jeg: hva som er avklart, hva som er bygget, hva du kan prøve, og hvilken konkret beslutning som trengs neste gang. Vi skal ikke få en ny parallell hovedplan for hver samtale.

## Intervjuet — ett spørsmål om gangen

| Runde | Tema | Hva svaret skal avgjøre |
|---|---|---|
| 1 | Appens viktigste resultat | Produktmål og hva vi skal måle fremgang mot |
| 2 | Hovedbrukeren og den vanskelige situasjonen | Hvem vi prioriterer når behov kolliderer |
| 3 | Spillerens uke, fra plan til gjennomføring og resultat | Kjernereisen og hva som skal være lettest |
| 4 | Coachens arbeidsdag og forholdet til spilleren | Arbeidsdeling, faglig kontroll og tidsbesparelse |
| 5 | Baneguide, Gameplan, vind og bag | Behov før, under og etter runden; datakilder og hvor mye registrering som er akseptabelt |
| 6 | Tester, fysisk trening, mål og analyse | Faglige definisjoner, datakvalitet og nyttige neste handlinger |
| 7 | Forelder, WANG/GFGK, Team Norway og delt innsyn | Organisasjonsgrenser, ansvar og deling |
| 8 | Booking, betaling, drift og AI | Kundereise, manuelle beslutninger og ønsket automasjon |
| 9 | Gjennomgang av hele funksjonsregisteret | Bekrefte relevans, prioritet og eventuelle mangler |
| 10 | Ferdigkriterier og arbeidsrytme | Hvordan Anders prøver, vurderer og bestiller videre arbeid |

Rekkefølgen tilpasses svarene. Temaene er ikke et skjema Anders skal fylle ut på én gang. Jeg oppsummerer svaret kort, registrerer hva det betyr for produktet og stiller deretter neste spørsmål. Kjente svar kontrolleres mot gjeldende kilder før noe spørres på nytt.

**Første spørsmål:** Hvis AK Golf HQ lykkes fullt ut, hva er den viktigste forskjellen appen skal gjøre sammenlignet med hvordan du og brukerne jobber i dag?

## Beslutningslogg

Oppdatert 11.09: Anders har bestilt bygging av manuell SG før intervjuet fortsetter. Implementeringen ligger i egen arbeidsmappe `.worktrees/manuell-sg-2026-09-11`, med funksjonskort `docs/planer/funksjon-manuell-sg.md`.

| ID | Spørsmål | Svar | Konsekvens | Status |
|---|---|---|---|---|
| INT-01 | Appens viktigste resultat | Ikke besvart i dette intervjuet ennå | Skal styre prioriteringen; eksisterende produktregler gjelder inntil de eventuelt endres | Intervjuet fortsetter senere |
| INT-02 | Første funksjon | Enkel og avansert manuell SG med alle kategorier først; deretter utbedres planen for komplette kartfunksjoner som UpGame | SG implementeres nå. Kartutvikling er ikke startet av denne bestillingen | Implementert lokalt; full verify, 2 349 tester og 20 nettleserkontroller bestått. Innlogget prøve og Anders' vurdering gjenstår |

Nye svar om gjeldende produktregler føres også i `docs/platform/BUSINESS-RULES.md` når Anders faktisk endrer regelen. Register og arbeidsliste skal peke dit, ikke skape konkurrerende fasiter. Dokumentavvik, blant annet eldre låseformuleringer i Nordstjernen, ryddes som egen dokumentoppgave etter at retningen er avklart.

## Kontroll av denne leveransen

`npm run prosjekt:sjekk` bestod 11.09.2026. I tillegg er alle 26 lokale Markdown-lenker i de tre nye dokumentene kontrollert, siden prosjektets vanlige lenkekontroll unntar daterte underlag. Diffkontroll bestod. Ingen appkode er endret, og main, produksjon og databaser er urørt av denne oppgaven. Intervjuet er startet med INT-01; gjennomføring av intervjuet og detaljprioriteringen gjenstår.

Ved neste Vercel-arbeid anbefales oppdatering av kommandolinjeverktøyet: sesjonen melder versjon 56.3.1 og tilgjengelig 59.15.1. Kommandoen er `npm i -g vercel@latest`. Oppdateringen er ikke kjørt som del av dokumentarbeidet.
