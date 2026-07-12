# Veikart: det mest komplette og effektive coaching- og businessverktøyet

> STATUS-LOGG (oppdateres per leverte pakke — samme commit):
> 2026-07-12 · Plan godkjent (se ~/.claude/plans/warm-coalescing-octopus.md):
> W0 nordstjerne → R1 rydding → P ytelse → I0–I8 interaksjon → Å1–Å6
> årsplanlegger → motor → GDPR-port → marketing.
> 2026-07-12 · W0 LEVERT (NORDSTJERNE.md + pekere). R1 LEVERT (død chrome
> slettet, eslint-direktiv-buggen fikset — lint 100 % ren for første gang,
> public/design-handover fjernet (−4,4 MB), 18 engangs-scripts arkivert,
> knip-rapport: 353 ubrukte src-filer → R2-grunnlag i docs/opprydding/).
> 2026-07-12 · P1 LEVERT: rotårsak treghet = DB i eu-west-1, funksjoner i
> iad1 (USA) — flyttet til dub1. Varme TTFB offentlige sider: 0,5–1,1 s →
> 0,17–0,39 s; innloggede flater (10+ queries/side) sparer ~90 ms per query.
> P2–P5 (query-diett, caching, skeletons, bundle) gjenstår.
> 2026-07-12 · I0 LEVERT (del 1+2): tilgangsskillet selvbetjent/coachet
> håndheves nå av lib/auth/coached.ts i 19 flater (cockpit, planlegge, queue,
> workbench-roster, planer, teknisk plan, analyse, discovery, turneringer,
> reports, team, hub, compliance, sammenligning, agent-kjøring, Caddie-AI-
> lesing, motor-agent) + detalj-guards (spiller-360/analyse/workbench →
> notFound) + sendMessage-gate + oppsalgs-CTA på /portal/coach for
> selvbetjente. Unntak dokumentert: booking-wizard + gruppe-innmelding
> (lead-/opplåsingsflyt). Gjenstår i I0: Playwright-negativtest med seedet
> PLATFORM_ONLY-bruker.
> 2026-07-12 · I1 LEVERT (kjerne): trykk tom kalenderdag → ny booking med
> dato/tid prefylt (?start=); tom-klikk i Workbench-tidslinja → Ny økt med
> dag+klokkeslett fra trykkpunktet. Gjenstår: måned-celler («Ny hendelse» ved I3).
> 2026-07-12 · I6 LEVERT: valgt økt i Workbench redigeres ved trykk (akse/
> tittel/tid/varighet); delt executeSessionUpdate m/ v2-speil-synk.
> 2026-07-13 · I5 FERDIG: ekte drag-and-drop i uka-kanbanen (flyttBookingTilDag),
> oppfølgingskøen (Signal OPPFOLGING_STATUS 7d — «Løst» er nå EKTE) og
> kalenderens uke-visning (serie-projeksjoner bevisst ikke dragbare).
> Handlingssenter-DnD utgår ærlig (flaten er hastegrad-liste, ikke kanban).
> 2026-07-13 · I7 LEVERT (hoveddel): 62 kandidater → 24 undersider fikk
> TilbakeLenke til logisk forelder; loop-felle fanget (radar toppflate etter
> B5). Gjenstår: 10 meg-/legacy-sider (ved rekomponering) + grupper-timeplan.
> 2026-07-13 · P4 LEVERT (hoveddel): legacy-loading (82 admin + portal) viste
> gamle grå SkeletonCard-firkanter i mørk chrome — begge bruker nå V2Laster.
> «Firkantene» fikset; per-skjerm speilende skeletons ved rekomponering.
> 2026-07-13 · Å3 LEVERT + prod-bug fikset: groups.maxParticipants manglet i
> databasen (gruppe-detalj kræsjet stille — samme feilklasse som coachId;
> kolonne inn m/ Anders' ja). «Rull ut mal til gruppa» på gruppe-detalj:
> mal + uker + startuke → alle medlemmer i én operasjon, duplikat-vern
> rapporterer hoppede. I8-funn: «Åpne gruppe»/«Timeplan»-CTA (detaljsiden var
> unåbar fra lista). Verifisert live hele kjeden (0-spillere-gruppe → ærlig
> «0 økter for 0 spillere»). VENTER TIL SLUTT (Anders): I2 Google · I3
> hendelser · I4 Stripe · Å1/Å2-tabell. NESTE: I8-revisjon + R2-rydding.
> 2026-07-13 · R2 LEVERT (hoveddel): 215 dobbelt-verifisert døde filer slettet
> (knip + grep + kaskade; spesialfiler/generated ekskludert). tsc, lint,
> 470 tester, full build OG røyk-test av 5 hovedflater grønt etterpå.
> 2026-07-12 (kveld) · RETNINGSKORRIGERING fra Anders: Workbench-fasiten er
> agencyos-kitets workbench-familie (rikere generasjon enn v2/wb.jsx dagens
> skjerm bygde på). Fasit ekstrahert til docs/redesign-v2/fasit-agencyos-
> workbench/ (17 filer); full gap-analyse G1–G10 i docs/redesign-v2/
> workbench-fasit-analyse-2026-07-12.md — kontekst-paneler (ACWR/belastning),
> publiser-diff, redigerbar årsplan, økt-drills, composer, coldstart,
> stall-tidslinje (=Å2!), triage, nav-grupper. AKUTT-BUGFIX samtidig:
> Mer-panelet ble liggende åpent over innhold etter navigering («trykk →
> feil skjerm») — lukker nå ved rutebytte, solid bakgrunn, z-løft.
> 2026-07-12 (kveld) · P4-BUGFIX #2 (Anders' skjermbilde: hvit side m/ mørke
> klosser ved hver navigering): loading.tsx rendres UTEN V2Shell (shellen bor
> i page) — V2Laster bærer nå selv hele den mørke chromen (bakgrunn + vignett
> + rail-silhuett, 1680-container). Målt i app: lastebakgrunn rgb(13,14,13).
> 2026-07-12 (kveld) · G7 LEVERT — første fasit-ombygging av Workbench:
> Coldstart-løypa 1:1 fra workbench-coldstart.jsx («Ingen plan for {fornavn}
> ennå» → mal-velger m/ ekte godkjente maler + neste-turnering-kontekst +
> «Legg inn første uke» + AI-forslag der det finnes). Kun sanne elementer —
> mål/horisont/dager-chipsene fra fasit aktiveres når motoren tar imot dem.
> Samtidig fasit-fiks: mal-kortene i biblioteket var DØDE — nå «Bruk · legg
> inn uke 1» (ny applyTemplate i actions-kontrakten, coach + spiller).
> Verifisert live: coldstart → velg mal → 5 økter inn i tidslinja → ryddet.
> Anders gjør komplett Workbench/AgencyOS-review etter denne.
> 2026-07-12 (kveld) · DS1+DS2 LEVERT — tema-grunnmuren («for mørk i sol»):
> dobbel tokenskala i globals.css (--v2-*): mørk default LYSNET (paneler og
> kontrast opp, alle nøkkelpar målt WCAG AA) + ekte LYS modus (cream/hvit,
> forest-aksent — aldri lime-på-lys). T-objektet leser CSS-variabler —
> komponentene urørt. Sol/måne-veksler i railen + Mer-panelet; cookie
> ak-v2-tema settes før paint via CSP-noncet inline-script (tema består
> reload uten blits). Designprosjektets tokens/v2/tokens.css synket til
> samme doble skala (DS1). Playwright-verifisert begge moduser.
> 2026-07-12 (kveld) · WB1 LEVERT — dra-og-bekreft (Anders-logikken: alt som
> tilføres/fjernes fra canvas → popup): (a) økt-brikke dras til klokkeslett →
> Ny økt-popup PREFYLT (tittel/varighet/akse fra brikken, dag/tid fra
> slippunktet) → Opprett; (b) mal-kort dras til canvas → bekreft-popup
> (malnavn/økter/varighet) → applyTemplate; (c) sletting løftet fra inline-
> knapp til bekreftelses-popup («Slett økt · tittel · dag · tid»).
> Playwright-verifisert ende-til-ende (dra→popup→bekreft→økt lagret/slettet);
> testdata ryddet til coldstart (0 rester). Anders' komplette review er neste.
> 2026-07-12 (kveld) · SPILLER-DASHBOARD LEVERT (Anders: «100 % av all
> spillerinformasjon på én skjerm»): designet FØRST i Claude Design
> (ui_kits/agencyos/spiller-dashboard.{jsx,html,data.js} — render-verifisert),
> deretter portet til /admin/spillere/[id]: hero m/ badges (triage/samtykke/
> skade) + KPI-strip (HCP·SG·etterlevelse·WAGR·turnering·timer·økter, HjelpTips)
> + 7 faner: Oversikt (eksisterende 360) · Utvikling (mål/FYS-tester/TrackMan)
> · Plan (sesongperioder/trening/teknisk/fysisk) · Helse (søvn/puls/HRV-
> sparklines + skade/perm) · Turnering (påmeldinger/resultater/WAGR) · Logg
> (varsler/notater/caddie/video/dokumenter) · Administrasjon (personalia/
> foresatte+samtykke/økonomi/betalinger/bookinger/utstyr/GDPR). Ny aggregert
> loader spiller-dashboard-data.ts (24 parallelle select-minimerte spørringer).
> Kun ekte data — ærlige tomtilstander. FUNN: player_swing_videos-tabellen
> mangler i DB (schema-drift-klasse #3) — swing-video-spørringen venter på
> kirurgisk migrering (Anders-ja). Playwright: alle 7 faner verifisert.
> 2026-07-12 (kveld) · WB2 LEVERT (fasit G5): «Spilleren nå»-innsiktsblokk
> øverst i Workbench-inspektøren (høyre kolonne) — fokus (coach/SG-gap),
> plan-etterlevelse m/ terskel-farget stripe + HjelpTips, neste turnering
> m/ nedtelling. Kun ekte kilder; rader uten kilde utelates. Samtidig lukket
> schema-drift #3 (player_swing_videos + swing_analyses opprettet kirurgisk
> etter Anders-ja; swing-video aktiv i spiller-dashboardets Logg-fane).
> Neste: WB3 belastningspanel (ACWR-stripe under canvas).
> 2026-07-12 (kveld) · WB3 LEVERT (fasit G1): belastningsstripe under
> uke-canvaset — planlagte timer i visningsuka mot kronisk ukesnitt
> (28 d/4), ACWR-kvote m/ fasit-terskler (>1,4 rød «lett uka» · >1,2 gul
> «følg med») + HjelpTips, og nedtelling til neste turnering. Loaderen
> beregner akutt/kronisk fra eksisterende 30-dagers spørring (kun
> select-utvidelse med scheduledAt — ingen ny spørring). Vises kun når
> belastningsdata finnes. Neste: WB4 publiser-diff.

Skrevet 2026-07-12, rett etter full kartlegging av alle 141 skjermer
(`docs/AGENCYOS-INVENTAR.md`). Dette er analysen av HVOR verdien lekker i dag
og HVA som løfter AK Golf HQ fra «komplett app» til «verktøyet som driver
akademiet av seg selv». Mål-anker: 500K USD/år fra apper og coachingsystemer.

## Prinsippet

En skjerm er bare verdifull hvis den enten (a) gjør en spiller bedre, (b) gjør
en time mer lønnsom, eller (c) sparer coachen for tid. Alt annet er støy.
Verktøyet vinner når de to loopene under går RUNDT uten at coachen må dytte:

- **Coaching-loopen:** Mål → Plan → Gjennomføre → Måle → Justere → (tilbake til Plan)
- **Business-loopen:** Lead → Prøvetime → Pakke → Fornyelse/oppsalg → Henvisning

I dag finnes nesten alle DELENE (skjermene), men loopene har hull der et
menneske må huske å gjøre noe. Hullene er lista under.

## 1 · Coaching-motoren (spilleren blir bedre — beviselig)

| # | Forbedring | Hvorfor det flytter nåla |
|---|---|---|
| C1 | **Ukesyklusen lukkes automatisk:** søndag kveld lager motoren neste ukes plan-forslag per spiller (forrige ukes etterlevelse + SG-gap + periodeplan + turneringer) → coach godkjenner hele stallen fra ÉN kø mandag morgen | Dette ER produktet. I dag finnes ukeforslag i Workbench per spiller — men coachen må åpne hver enkelt. 30 spillere × 5 min blir til 15 min totalt |
| C2 | **Live-økt-flyten (P1) til v2** — brief → aktiv → oppsummering, og oppsummeringen SKRIVER tilbake: observasjoner → spillerprofil, tekniske funn → teknisk plan, neste fokus → neste ukes plan | Økta er der coaching skjer. I dag er flyten gammel og oppsummeringen dør i et notat |
| C3 | **Test → plan-kobling:** når en test registreres, foreslår motoren konkret plan-justering («CS-nivå opp → øk SLAG-andel») som ett-klikks godkjenning | Tester samles i dag men endrer ingenting automatisk |
| C4 | **Runde → plan-kobling:** SG-fall over 3 runder → agent-forslag i godkjenningskøen med drill-pakke fra biblioteket (930 drills er en gullgruve som i dag krever manuelt oppslag) | Datagrunnlaget finnes (SG per runde, drill-tagging) — koblingen mangler |
| C5 | **Spiller-siden av loopen strammes:** push når plan publiseres, én-trykks «gjennomført/avvik» etter økt, og ukesoppsummering til spilleren («du traff 80 % av planen, SG +0,3») | Etterlevelses-tallene coachen ser er bare så gode som spillerens registrering |

## 2 · Business-motoren (mer inntekt per time)

| # | Forbedring | Hvorfor |
|---|---|---|
| B1 | **Kapasitets-økonomi på cockpiten:** «2136 ledige luker» er dagens mest verdifulle uutnyttede tall. Vis det som penger: ledig tid × timepris = tapt omsetning denne uka, og HVILKE luker som bør fylles først | Fra «kalender» til «inntektsmaskin». Tallet finnes allerede i bookinger-KPI-ene |
| B2 | **Churn-radar:** «skylder»-flagget (B2-jobben) + inaktivitet + fallende etterlevelse = rødt kort i cockpiten FØR spilleren slutter, med ferdig utkast til melding | Å beholde en spiller er 5× billigere enn å skaffe en ny. Alle tre signalene finnes — de er bare ikke koblet til én varsling |
| B3 | **Lead-løypa inn i verktøyet:** booking-forespørsler fra akgolf.no → prøvetime → automatisk oppfølging etter prøvetimen («pakke-tilbud» med ett klikk) → pakke. I dag stopper løypa etter booking | Dette er veien fra 56 spillere til 100 uten mer admin |
| B4 | **Automatisk purring:** utestående faktura → to påminnelser → varsle coach først når mennesket trengs. «Følg opp»-knappen peker i dag på innboksen — gjør jobben ferdig | Penger som ligger og venter på manuelt arbeid |
| B5 | **Månedsrapport per selskap:** AK Academy / WANG / GFGK / Mulligan — timer levert, inntekt, belegg, spillere i fremgang — auto-generert den 1. | Styringstall for hele gruppen uten regneark-kvelder |

## 3 · AI-laget (agentene blir ansatte, ikke leketøy)

| # | Forbedring | Hvorfor |
|---|---|---|
| A1 | **Én godkjenningskø for ALT** agentene foreslår (plan-endringer, drill-forslag, e-postutkast, purringer, ukeplaner) — i dag er dette spredt på godkjenninger/varsler/drills-forslag/innboks-epost/caddie-dashbord | Fem køer sjekkes aldri; én kø sjekkes hver morgen. Dette er den største enkelt-effektiviseringen for deg |
| A2 | **Caddie får skrivetilgang med godkjenning:** «flytt Sofies økt til torsdag og gi henne beskjed» → utkast → godkjenn | Fra chat til handling |
| A3 | **Live mission control kobles til ekte kilder eller fjernes** — i dag er den statisk demo (ærlighetsbrudd på sikt) | Alt i appen skal være sant |

## 4 · Effektivitets-regler (gjelder HVER skjerm — dette er «10/10-følelsen»)

1. **Handle der du ser:** ethvert varsel/rad har handlingen inline (svar, godkjenn,
   book, flytt) — aldri «gå til en annen side for å gjøre noe med dette».
2. **Aldri blindgate:** ingen skjerm uten neste steg. Tom tilstand sier alltid
   hva du kan gjøre («Ingen økter — dra inn fra biblioteket»).
3. **Tall → hvorfor → hva nå:** hvert nøkkeltall kan trykkes og svarer på
   «hvorfor er det sånn» og «hva gjør jeg med det». (HjelpTips-regelen dekker
   «hva betyr det» — dette er neste nivå.)
4. **Alt som gjøres ofte har hurtigtast/kommando:** Cmd+K finnes — utvid til
   handlinger («book Sofie tirsdag 10»), ikke bare navigasjon.
5. **Null døde knapper:** wagr-import «Synk nå» og availability «Synk» kobles
   eller fjernes. En død knapp koster mer tillit enn en manglende funksjon.
6. **Mobil = handling, desktop = analyse:** cockpit/innboks/godkjenninger
   perfekte på mobil (du står på rangen); analyse-flatene optimaliseres desktop.

## Prioritert rekkefølge (effekt ÷ innsats)

1. **A1 Én godkjenningskø** — samler fem flater, sparer deg mest tid per dag
2. **C1 Automatisk ukesyklus** — kjerneverdien i produktet, motoren finnes
3. **B1 Kapasitets-økonomi** — tallene finnes, bare vis dem som penger
4. **B2 Churn-radar** — alle signalene finnes etter dagens B2-jobb
5. **C2 Live-økt-flyt v2** — P1 i porteringslista uansett
6. **B4 Automatisk purring** — liten jobb, direkte penger
7. **C3+C4 Test/runde → plan-kobling** — gjør datainnsamlingen meningsfull
8. **B3 Lead-løypa** — vekstmotoren
9. **C5 Spiller-loopen** — datakvalitet inn
10. **B5 Månedsrapport** + A2/A3 + regel-gjennomgang per skjerm (4.1–4.6)

> Vedlikehold: når et punkt leveres — oppdater status her, i
> MASTER-SKJERMPLAN.md og AGENCYOS-INVENTAR.md i samme commit.
