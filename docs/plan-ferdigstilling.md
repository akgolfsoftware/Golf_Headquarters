# Ferdigstilling av AK Golf HQ

Oppdatert 11.10.2026 etter Anders' bestilling om repoopprydding. Denne fila viderefører planen i PR #1210. Den er én felles arbeidskø; eldre planer nedenfor er kildegrunnlag, ikke parallelle kjøreordrer. Produktregler og gjeldende brukerbeskjeder går foran planen.

## Bekreftet grunnlag

- Kartleggingen startet på `166ab799ad5a5298223e98296a2e2f52749f6767` (PR #1205). Live-lagring av reps, kommentar og video per Workbench-øvelse er integrert. Resten av live-reisen, offline-egenskaper og produksjonsbruk er ikke dermed godkjent.
- 71 eksterne grener inklusive main og 33 åpne PR-er ved start. Hver er registrert i [repooversikten](vedlikehold/repo-opprydding-2026-10-11.md). PR #993 er deretter lukket uten sletting av grenen eller filer.
- Precision-retning A er valgt. Siste pakkeidentitet kontrollert i designprosjektene i denne samtalen var 3.1.0-l. Appen er bare delvis portert; PR #1215 inneholder oppdatert designautoritet og felles kontroller, og er fortsatt utkast. Ved ny eksport må identiteten kontrolleres på nytt.
- Grønn CI på main og PR #1215 er bygg-/kodebevis, ikke godkjent UI eller produksjonsreise.
- MacBook Air og Mac mini er ikke tilgjengelige i dette miljøet. Lokal sikkerhetskopi, ulagrede filer, lokale grener og worktrees er uavklart på begge.

## Arbeidsrekkefølge og ferdigkrav

| Trinn | Arbeid som videreføres | Ferdig når |
|---|---|---|
| 0 · Bevar og samordne | Kartlegg begge Mac-er med [Git-arbeidsflyten](vedlikehold/git-arbeidsflyt.md). Avstem alle grener/PR-er. Sikre unikt arbeid. | Ingen kjent arbeidskopi eller upushet endring er uavklart; hver oppgave har én videreføring. |
| 1 · Tilgang og datatap | Beslutnings-PR #1195; #1203, #1204, #1206, #1207, #1208, #1211, #1212 og #1213. Les PR-avhengigheter og de konkrete CI-feilene i repooversikten. | Tillatte og avviste tilfeller består mot aktuell main. Ingen uavklart kritisk tilgangs- eller datatapsfeil i pilotreisen. |
| 2 · Stabil komponentkontrakt | PR #1215, valgt designreferanse, appens faktiske komponenter og språk-masteren. | Funksjon, kontrast, fokus, 390 px/desktop og relevante tilstander er sett. Anders har vurdert appen ved siden av referansen. |
| 3 · Sammenhengende øktdata | Viderefør de nyttige delene av #1209. Kontroller dagens #1205 før mer kode bygges. Kartlegg lesere av Workbench og eldre øktmodeller. | Plan, live, oppsummering og analyse viser samme øktidentitet og loggede verdier, også etter reload/retry. Ingen datamodell slås sammen som mappeopprydding. |
| 4 · Cockpit og meldinger | Koble faktisk øktstatus og meldinger til riktige spiller-/coachflater. | Lagring leses tilbake; mottaker og deling kontrolleres; feil og retry gir verken tap eller dubletter. |
| 5 · Stats, SG og profiler | Avgrens nyttig arbeid fra #1083 og eksisterende skjerm-PR-er. Periodebytte, sammenligningsgrunnlag, eksplisitt vurdering og datakilder. | Kontrollerte data gir samme summer på spiller-, coach- og gruppeflate; tomme data fremstilles riktig. |
| 6 · Øvrige pilotskjermer | Skjerm-for-skjerm-vurdering av AgencyOS, PlayerHQ, WANG og TN. #1060 er basert på #1004 og må behandles som avhengig arbeid. | Eksakt rute/skjerm/rolle/referanse er registrert. Ingen død destinasjon, falsk kvittering eller skjult demofallback i pilotomfanget. |
| 7 · Booking, konto og betaling | Bevar #1025 og uferdig arbeid i tidligere planer. Kartlegg ekte testmiljø og brukerflyt. | Gjennomført testkjøp i testmiljø, webhook-retry, kvittering, avbestilling og riktig konto-/rollevisning. Produksjon krever egen faktisk kontroll. |
| 8 · Pilot og lansering | Avgrens pilotutvalg og ruter, deretter utvidelse. | Grønn kvalitetsport, dokumentert UI og innloggede brukerreiser, riktig deployidentitet og produksjonsrøyk. Kritiske funn lukket; øvrige har eier. |

## Skjermregister og lanseringsomfang

Én rad per valgt skjerm: skjerm-ID, app-rute, rolle/organisasjon, designversjon, datakilde, handlinger, tom/laster/feil, funksjonsbevis, visuelt bevis, åpne avvik. Bruk eksisterende skjermregister; ikke tell `page.tsx`-filer som ferdige produktskjermer.

Den eldre A/B-listen med 23/31 arbeidskoblinger var foreløpig og er ikke automatisk dagens lanseringskontrakt. Bevar koblingene i originalplanen, men avstem dem mot siste faktiske skjermprosjekt før godkjenning.

## Beslutninger og tilgang som fortsatt må avklares

- Begge maskiners lokale arbeid og hvilke arbeidskopier som faktisk er aktive.
- Endelig pilotomfang og hvilke flater som skal være tilgjengelige fra første dag.
- Åpne produktspørsmål i #1211 (ukjent alder, 16-årsgrense og fjerning av forelder) må behandles etter gjeldende produktbeslutning, ikke antas løst av opprydding.
- Fem integrasjoner har bypass i main-regelsettet. Eierskap må identifiseres før innstillinger endres. Ingen bypass er brukt som erstatning for kvalitetskontroll.
- Produksjonens deployidentitet og avbrutte nettlesertester må undersøkes. Ingen produksjonsdata, e-post, betaling eller skjemaendring er utført i dokumentoppryddingen.

## Bevart detaljgrunnlag

De opprinnelige oppgavene, 54 skjermkoblingene, datakravene og testkravene er fortsatt tilgjengelige i Git. De skal avstemmes mot kode før de utføres. Denne oppdateringen forkaster ikke funksjoner fordi statusen er gammel.

- [Original samlet plan og 54 arbeidsrader](https://github.com/akgolfsoftware/Golf_Headquarters/blob/60525fc970d0f858404e54cdf63df23f39073864/docs/plan-ferdigstilling.md).
- [Åtte spillerutviklingsleveringer](https://github.com/akgolfsoftware/Golf_Headquarters/blob/c7c11e286969822531d451b4f803504a63905b20/docs/plan-spillerutvikling.md).
- [Detaljert live-plan](https://github.com/akgolfsoftware/Golf_Headquarters/blob/c7c11e286969822531d451b4f803504a63905b20/docs/plan-live-lagring.md).
- [Backend-plan 05.10, historisk status](https://github.com/akgolfsoftware/Golf_Headquarters/blob/df2345bcaf6adbeb4199249568b702e31065f56f/docs/planer/backend-klar-for-portering-2026-10-05.md).

Historiske produksjonsfeil, tidsanslag, databaseforslag og «venter på design»-markeringer i disse dokumentene er ikke kontrollert på nytt. Gjeldende `AGENTS.md`, språk-master og designautoritet styrer arbeidet. Eksisterende funksjon gjenbrukes før ny kode bygges.

## Fast overlevering

Hver oppgave skal oppgi gren/PR, head SHA, forventet main, faktisk testkjøring, det som ikke er kontrollert, og ett konkret neste steg. En lagret gren, grønn CI, godkjent skjerm og en kontrollert produksjonsreise er forskjellige statuser.
