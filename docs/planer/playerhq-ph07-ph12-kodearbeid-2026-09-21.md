# PlayerHQ PH-07–PH-12 — kodearbeid 21.09.2026

Gren: `codex/playerhq-ph01-20260921`. Ikke integrert, ikke pushet, ikke deployet.

Grunnlag: designkontrollene i `Documents/Codex/2026-09-21/ak-golf-hq-designverksted/outputs/`
(`playerhq-fordypning-kontroll.md`, `playerhq-meg-fordypning-kontrakt.md`,
`playerhq-skjermstatus.md`). Gjeldende designsystem er AK Golf Design System;
Train-lock og Paper er utgående og er ikke brukt som visuell kilde her.

Dette dokumentet gjelder **datariktighet og sannferdighet** i eksisterende kode —
ikke visuell port av de nye skjermene. Skjermdesignene ligger i Claude Design
(«App design») og er fortsatt kandidater; ingen av dem er bygget her.

## Rettet

### PH-07 Runder — par fra scorekortet
`Round` har ingen «antall hull»-kolonne. Både rundelisten og detaljsiden antok
18 hull og banens totalpar når scorekortet manglet, så en nihullsrunde med
brutto 42 ble vist som −30 mot par 72.

Ny felles regel: `src/lib/portal-runder/runde-omfang.ts`.

- Antall hull er kjent bare med ekte `HoleScore`-rader.
- Par er summen av par for de spilte hullene.
- Uten scorekort er par og mot par ukjent → «—».
- Brutto er summen av de spilte hullene.
- SG vises bare med lagret verdi **og** kjent metode (`sgSource`).
- Bruttosnittet i listen gjelder 18-hullsrunder alene.

Registreringen fabrikkerer ikke lenger SG: den syntetiske 18-hulls kjeden som
ga `sgSource: "estimert"` for en totalrunde er fjernet. Eldre estimerte rader
beholdes og merkes eksplisitt som estimat ved visning.

### PH-08 TrackMan — kartpunkt koblet til riktig slag
`computeTrackManDispersionMap` slo opp `points[i]` med indeksen i den
**ufiltrerte** slaglista, mens `trackmanToPoints` filtrerer bort slag uten side
eller carry. Ett slag uten måling forskjøv derfor alle etterfølgende slag over
på feil punkt og feil bøtte — og da kan ikke kart og tabell peke på samme slag.

Punktene lages nå fra den filtrerte lista. Resultatet oppgir også hvilken kølle
kartet gjelder (`kolle`) og flagger blanding (`blandedeKoller`). 1σ/2σ forklares
som spredningsbeskrivelse for den målte økta, ikke som prosentgaranti.

### Statistikk — «Snitt A1» uten kilde fjernet
`/portal/statistikk/[metric]` sammenlignet spillerens 30-dagerstall mot fem
hardkodede timetall (12/22/18/14/8) under etiketten «Snitt A1 = 12,0 t
(referanse)», med avviket i grønt eller rødt. Tallene hadde ingen måling, dato
eller kilde. Pyramide-disiplinene har nå ingen referanse og viser «—» uten
fargevurdering; SG-disiplinene beholder nullpunktet, men kalles referansefeltet.

### PH-10 Min kurve — si hvor mange deltakelser som ikke er tegnet
Kurven tegner bare fullstendige resultater; cut, trukket, påmeldt og
ufullstendig registrerte filtreres bort av `tilPunkt`. Riktig, men kurven sa
ikke fra. Fire deltakelser der to endte i cut så ut som to turneringer.
`byggMinKurve` teller nå de utelatte i samme utvalg som kurven og gir en hel
setning om dem.

### PH-12 Meg — symptomregistrering later ikke som den lagrer
`logSymptom` gjorde `void input` og redirectet til helsesiden. Det så ut som en
vellykket lagring. Skjermen sier nå fra før utfyllingen at funksjonen ikke er i
drift, og handlingen avviser. Samtykkeporten for helseopplysninger står før
avvisningen.

### PH-12 Meg — HCP-fremdrift antok at alle startet på 54
`progressHcp` brukte `HCP_START = 54` som nevner. For en spiller på vei fra 20
til 10 ga det «89 % i mål» ved HCP 15, mens hen reelt var halvveis. Startverdien
leses nå fra `Goal.payload.hcpStart`, samme mønster som SG-mål (`sgStart`). Uten
lagret start vises ingen prosent, men HCP og gjenstående slag står.

### PH-12 Meg — sikkerhetsscoren og to løfter uten dekning
- «Sikkerhetsscore 80 / 100 · Sterk» var `harEpost ? 80 : 55`: to hardkodede
  tall uten måling, vist med progresjonsbar og en dom. Appen vet ikke om
  kontoen har tofaktor (flagget finnes ikke på `User`). Nå vises tilstandene
  den faktisk kjenner.
- Refusjonsfeil lovet «vi behandler den manuelt innen 24 timer» — en
  behandlingstid appen ikke kan love på coachens vegne.
- Fysio-bryteren i symptomskjemaet lovet kontakt innen 24 t i en flyt som
  ikke lagrer noe.
- AI-coach-siden var merket «Kommer snart», men FAQ ga en bastant garanti om
  modelltrening og funksjonslista sto med avkryssede punkter. Begge beskrev
  en funksjon som ikke finnes.

### PH-12 Meg — TrackMan vises ikke som en tilkobling
Integrasjonssiden satte «tilkoblet» til `tmCount > 0`: finnes minst én
importert økt, sto TrackMan som «Tilkoblet» med «Sist synket». Det finnes ingen
løpende forbindelse — økter importeres fra CSV, rapport eller foto. TrackMan
står nå blant de tilgjengelige kildene med tidspunkt for siste import. Google
Calendar er urørt; den har ekte OAuth-backing.

### PH-12 Meg — vennefeeden røpet treningsopplegget
Feeden viste «Fullførte variasjon-økt · Bane-simulering» — `practiceType` og
`miljo` fra AK-taksonomien, bare oversatt til norsk. Det brøt regelen som står
i filens eget hode: venner ser kun at en økt skjedde. Feltene hentes ikke lenger
i spørringen. Regelen ligger nå i `lib/venner/feed.ts` med test som avviser hvert
fagord. Banenavn på runder blir stående — det er hvor noen spilte golf, ikke
treningsopplegg.

### PH-12 Meg — abonnementstilstandene vises hver for seg
PRO-kortet sto med «Aktiv» og «Fornyes {dato}» uansett tilstand. Et oppsagt
abonnement fornyes ikke — datoen er når tilgangen slutter — og en prøveperiode
er ikke et betalende abonnement. Stripe-statusen sendes nå inn, og kortet
velger merke og datolinje etter den: Aktiv / Prøveperiode / Betaling mangler /
Avsluttet.

### PH-12 Meg — slettet Paper-fasit i ukesdigest
Begge ukesdigest-filene siterte en Paper-fil som ble slettet 30.08.2026.
Filhodet sier nå at skjermen ikke har en gjeldende designkilde.

## Verifisert uten funn

- **PH-09 Tester:** PEI krever positiv målavstand (`test-scoring.ts`), Gate
  bruker eksplisitt `ok`-boolean med `miss_side`, FYS scores uten benchmark.
- **PH-11 DataGolf:** driverdistanse presenteres som relative yards, nøyaktighet
  som prosentpoeng, og egne SG-tall trekkes ikke fra proffens nivå når
  sammenligningsgrunnlaget er ukjent.
- **PH-12 booking:** ombooking krever strengt mer enn 24 timer (`h > 24`);
  nøyaktig 24 nektes. Kontosletting er formulert som forespørsel. Credit og
  refusjon holdes adskilt i avbestillingsvarselet.
- **PH-10 Min kurve:** sesongvelgeren viser de to nyeste sesongene pluss
  «Alle»; snittet oppgir faktisk antall turneringer bak seg; plassering vises
  bare for fullførte og alltid som «i klassen»; `resultatStatus` oversetter
  CUT/WITHDREW/REGISTERED/DQ til ærlig norsk i listen under kurven.
- **PH-12 varsler:** `oppdaterPreferences` merger (`{...eksisterende.notif,
  ...input.notif}`) og bevarer ukjente nøkler — ett valg overskriver ikke de
  andre.
- **PH-12 eksport:** `/innstillinger/eksport` redirecter til den ekte
  flyten på personvernsiden i stedet for en «kommer snart»-plassholder.
- **PH-12 utstyr:** bæreavstander hentes fra målte TrackMan-data
  (`hentGapping`), ikke utledet fra utstyrsnavn.
- **PH-12 venner:** søk krever minst to tegn; eksisterende relasjoner og en
  selv filtreres ut av treffene; `Friendship` har unik-indeks på paret; kun
  mottaker kan svare på en forespørsel; økt-synlighet er av som standard.
- **PH-12 helsesamtykke:** fire separate formål (`WEARABLE_HELSE`,
  `MANUELL_HELSE`, `COACH_INNSYN`, `COACH_DETALJ`) som aldri slås sammen;
  under 16 avvises for rollen `SELV` (foresattflyt); samtykket kreves kun ved
  helseskriving, ikke i treningsplanleggingen; ekstern-leser-scopet er per
  gruppe og slipper aldri planer, notater eller helse gjennom
  test-/statistikk-samtykke.
- **PH-12 utviklingsplan:** read-only, AI-forslag står som «venter på coach»,
  og P1–P10 og læringstrappen leses fra `TechnicalPlan` — oppslagstabellene
  navngir bare posisjoner som finnes i kilden.
- **PH-12 ukesdigest:** ingen påstand om automatisk utsendelsesdag.

## Ikke gjort

- **Kvitteringer i abonnementet:** fakturalista viser beløp og dato fra
  `Payment`-radene, men er ikke gjennomgått mot kravet om «faktiske felt
  eller —» for hvert enkelt felt.
- **Mål-flatens øvrige typer:** `ROUNDS_PER_MONTH`, `SESSION_FREQUENCY` og
  `TEST_SCORE` er ikke gjennomgått på samme måte som HCP og SG.
- **PH-02 harmonisering:** de 20 statiske referansene mot Live-/FYS-modellene er
  ikke rørt. De ligger i Claude Design-prototypen, ikke i appkoden.
- **Visuell port** av PH-07–PH-11 mot de nye skjermdesignene.
- **Kjent, ikke rørt:** `rundeOppsummering` i `lib/datagolf/player-tool.ts`
  konverterer DataGolfs relative `distance` til meter. Verdien vises ingen
  steder i dag, så det er død kode — men den ville vært villedende om den ble
  tatt i bruk.

## Kontroll

`npx tsc --noEmit` 0 feil · `npm test` 3378 + 4 tester, alle grønne ·
`npm run lint` 0 errors (3 forhåndseksisterende warnings i `scripts/` og en
booking-side som ikke er rørt) · `git diff --check` rent ·
`check-fasit-sitering`, `check-token-gap`, `check-signalfarge-tekst`,
`check-ingen-paper`, `check-action-auth`, `check-critical-imports`,
`check-sensitive-route-guards` alle OK.

`npm run build` er **ikke** kjørt: worktreen har node_modules-symlink som
Turbopack ikke tåler. Bygget må verifiseres av CI.
