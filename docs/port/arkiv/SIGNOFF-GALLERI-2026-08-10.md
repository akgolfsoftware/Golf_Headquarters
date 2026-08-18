> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

# Sign-off-galleri 10.08.2026 — PP-1 + PP-2-kjernen

**11 skjermer, 33 skjermbilder.** Hvert bilde viser appen til venstre og Paper-fasiten til høyre,
i samme vindusbredde. Mobil er 390 px (iPhone), desktop er 1280 px.

Alt er tatt av den kjørende appen med ekte innlogging — spiller `screentest@akgolf.test`
(Øyvind Rohjan) og coach `coachtest@akgolf.test`. Ingen skjermbilder er montert eller pyntet.

**Ingen skjerm er merket ferdig.** Det er ditt kryss å sette.

---

## Les dette først — tre ting som gjelder hele galleriet

**1. Testdataene er nesten tomme.** Coach-brukeren har 1 spiller og ingen bookinger denne uka.
Spilleren har ingen økter i uke 33. Fasiten viser fulle skjermer med 7 spillere og en full uke.
Der appen viser en tom tilstand og fasiten viser innhold, er det som regel *dataene* som skiller
— ikke designet. Jeg har markert hver gang det er tilfellet, så du ikke godkjenner eller
underkjenner på feil grunnlag.

**2. Ett mønster går igjen i hele AgencyOS.** Fasiten har en detaljkolonne til høyre på Konsoll,
Innboks, Spillere og Kalender — der den valgte saken forklares og avgjøres. Appen har den bare på
Spillere og (etter nattens rettelse) på Innboks, men med annet innhold. På Konsoll og Kalender
finnes den ikke. Dette er den største enkeltjobben som gjenstår, og den er for stor til å gjøre om
natten uten at du har sett den først.

**3. Clay-fargen brukes annerledes enn i fasiten.** I fasiten er den oransje flaten alltid *én
konkret handling på én konkret sak* («Godkjenn ukeplan · Øyvind», «Ta man 12:00», «Flytt til
17:30–18:30»). I appen er den flere steder et bredt bånd med en generisk knapp («Ny økt»,
«Behandle 46 godkjenninger», «Book time»). Det er samme farge, men motsatt betydning.

---

## Nattens funn før galleriet: main bygde ikke

Da jeg startet, var `main` rød. Fire filer hadde ren syntaksfeil, som gjorde at TypeScript hoppet
over resten av sjekken og skjulte 79 videre feil. Da de var borte kom 17 lint-feil og 14
farge-feil fram. Til sammen 114.

Alt er rettet og lagt inn i hovedversjonen ([#385](https://github.com/akgolfsoftware/Golf_Headquarters/pull/385)).
`npm run verify` er grønt og alle 943 tester går. Uten dette ville ingen av skjermbildene under
vist noe som helst — appen rendret blanke sider.

Det er verdt å merke seg *hvorfor* det ikke ble oppdaget: alle tre kvalitetsgatene stopper på
første røde steg. Én kjøring viser bare det øverste laget av feil.

---

# PP-1 · PlayerHQ

## PP-1.1 — I dag (chat/hjem) · `/portal`

![PP-1.1 mobil](../../screenshots/paper/signoff/PP-1.1-m390.png)
![PP-1.1 desktop](../../screenshots/paper/signoff/PP-1.1-d1280.png)
![PP-1.1 mørk](../../screenshots/paper/signoff/PP-1.1-m390-dark.png)

**Avvik**

1. **Skriveflaten nederst er for liten.** Fasiten har et høyt felt med to linjer plass, `/` og `@`
   som synlige hint, og hjelpeteksten «ENTER SENDER · SHIFT+ENTER NY LINJE» under. Appen har ett
   smalt felt der plassholderteksten klippes midt i setningen.
2. **Send og mikrofon står i motsatt rekkefølge.** Fasit: mikrofon (oransje) til venstre, send
   (mørk firkant) til høyre. Appen: send (omriss) til venstre, mikrofon til høyre.
3. **Toppen er et kort i appen, en flate i fasiten.** Fasiten lar overskriften ligge rett på
   kremflaten uten ramme; appen har den i et hvitt kort med kant.
4. **Tema-bryteren mangler** øverst til høyre (fasiten har den på alle PlayerHQ-skjermer).
5. **Tom tilstand gir fem veier videre** («Fang en observasjon», «Lag en 25-min økt selv», «Se
   forrige uke», «Se ukeplanen», «Kalender»). Prinsippet er én vei. *Merk: fasiten viser ikke tom
   tilstand, så det finnes ingen fasit å måle mot — dette er en anbefaling, ikke et målt avvik.*

**Anbefaling: FIKS FØRST.** Punkt 1 og 2 er entydige og små. Punkt 5 trenger din avgjørelse om
hvilken av de fem som skal være den ene.

---

## PP-1.2 — Plan · `/portal/planlegge`

![PP-1.2 mobil](../../screenshots/paper/signoff/PP-1.2-m390.png)
![PP-1.2 desktop](../../screenshots/paper/signoff/PP-1.2-d1280.png)
![PP-1.2 mørk](../../screenshots/paper/signoff/PP-1.2-m390-dark.png)

**Avvik**

1. **Hele ukeoppsummeringen mangler.** Fasiten har en blokk med Periode, Økter, Planlagt tid,
   Gjennomført, Sjekkpunkt — pluss en framdriftsstripe og «1 av 5 økter gjennomført · 10 %».
   Appen har ingenting av dette.
2. **Dagvelgeren bruker én bokstav** (S M T O T F L) der fasiten bruker tre (MAN TIR ONS). To
   torsdager og to tirsdager ser like ut i appen.
3. **Notisen om eierskap mangler** — fasitens «Planen er din. Du kan flytte og endre øktene selv,
   med én gang — ingen godkjenning.» Den setter tonen for hele skjermen.
4. **«Book coachingtime med Anders» mangler** som fast sekundærhandling.
5. Fasiten har fire tilstandsknapper (F/T/L/E) og tema-bryter i toppen. *Dette er fasitens eget
   demoverktøy for å vise tilstander — ikke noe som skal bygges.*

*Appen viser tom uke fordi Øyvind ikke har økter i uke 33. Punkt 1 og 3 gjelder likevel — de er
faste deler av skjermen, ikke innhold.*

**Anbefaling: FIKS FØRST.** Punkt 1 er en reell manglende seksjon.

---

## PP-1.3 — Analyse · `/portal/analysere`

![PP-1.3 mobil](../../screenshots/paper/signoff/PP-1.3-m390.png)
![PP-1.3 desktop](../../screenshots/paper/signoff/PP-1.3-d1280.png)
![PP-1.3 mørk](../../screenshots/paper/signoff/PP-1.3-m390-dark.png)

Dette *var* skjermen med størst forskjell i hele PlayerHQ. Etter Anders' beslutning 10.08 er den
kortet fra tretten kort til fire.

**Avvik**

1. ~~Appen er fire ganger så lang som fasiten — tretten bokser mot fem.~~ **Løst 10.08 etter
   Anders' beslutning.** SG-fanen viser nå fire kort: SG-total, SG per område, «Én ting nå» og
   score siste ti runder. Diagnose, slaglekkasje, nøkkeltallene og de tre videre-lenkene er flyttet
   til Statistikk-fanen. Ingenting er fjernet — alt ligger ett trykk unna. Bildet over viser
   tilstanden etter endringen.
2. **Fanene er ulike.** Fasit har tre fylte piller (Strokes Gained · Trening · Tester). Appen har
   fire med omriss (SG · Trening · Tester · Statistikk).
3. **Ærlighetsnotisen mangler**: «Tallene er målinger, ikke karakterer. Ingen terskler er vurdert
   — regler og låser er midlertidig ute.» Den står rett under tittelen i fasiten.
4. ~~Handlingen står for langt ned.~~ Løst av samme endring — «Legg inn putting-økt denne uka»
   er nå tredje kort, ikke sjuende.
5. **To oransje flater samtidig** — varselboksen «For lite putting-data ennå» og CTA-en lenger ned.

**Anbefaling: GODKJENN** når du har sett bildet. Punkt 2, 3 og 5 er småting som kan tas i neste
runde — de endrer ikke hva skjermen er.

---

## PP-1.4 — Meg · `/portal/meg`

![PP-1.4 mobil](../../screenshots/paper/signoff/PP-1.4-m390.png)
![PP-1.4 desktop](../../screenshots/paper/signoff/PP-1.4-d1280.png)
![PP-1.4 mørk](../../screenshots/paper/signoff/PP-1.4-m390-dark.png)

Nærmest fasiten av alle elleve.

**Avvik**

1. **«Én ting nå»-kortet mangler den oransje behandlingen.** Fasiten har lys oransje bakgrunn og
   en oransje strek langs venstre kant. Appen har hvitt kort med bare knappen i oransje.
2. **«Om deg» mangler fire felter**: Født, Klubb, Skole, Snittscore forrige sesong. Appen viser
   kun År med golf og Ambisjon.
3. **«Coach og program»-kortet mangler helt.**
4. Appen har fire nøkkeltall (Runder / Beste runde / Snittscore / SG total) som fasiten ikke har
   på denne skjermen.
5. Tema-bryter mangler i toppen.

*Fasit-filen stopper etter «Coach og program». Alt appen har under det (Varsler, Abonnement,
Utviklingsplan, Konto) er utenfor fasitens dekning — det kan ikke vurderes herfra.*

**Anbefaling: FIKS FØRST** på punkt 1 og 2, deretter GODKJENN.

---

## PP-1.5 — Booking i appen · `/portal/booking`

![PP-1.5 mobil](../../screenshots/paper/signoff/PP-1.5-m390.png)
![PP-1.5 desktop](../../screenshots/paper/signoff/PP-1.5-d1280.png)
![PP-1.5 mørk](../../screenshots/paper/signoff/PP-1.5-m390-dark.png)

**Avvik**

1. ~~Feil fane markert i bunnen — appen lyste opp «I dag», fasiten «Plan».~~ **Rettet i natt** på
   alle fire booking-sidene. Bildet over viser tilstanden etter rettelsen.
2. **«Én ting nå» mangler.** Fasiten åpner med den konkrete anbefalingen — «Sjekkpunktet 14.08 er
   om to uker … Ta man 12:00» — der knappen har klokkeslettet i seg. Appen har en generisk «Book
   time» uten kontekst.
3. **Abonnementskortet mangler** (pris, hva som er inkludert, hva som er brukt). Appen har en
   teller «3 av 4 timer igjen» i stedet.
4. **Coacher-kortet finnes ikke i fasiten** — appen har det.
5. Tilbake-knappen er en grå pille med tekst i appen, en rund pil i fasiten.

**Anbefaling: FIKS FØRST.** Punkt 1 er en ren feil og rettet i natt (se nederst).

---

## PP-1.6 — Innlogging · `/auth/login`

![PP-1.6 mobil](../../screenshots/paper/signoff/PP-1.6-m390.png)
![PP-1.6 desktop](../../screenshots/paper/signoff/PP-1.6-d1280.png)
![PP-1.6 mørk](../../screenshots/paper/signoff/PP-1.6-m390-dark.png)

**Avvik**

1. **Overskriften mangler.** Fasiten har stor «Logg inn» med undertekst «Samme skjema for alle.
   Kontoen din bestemmer hvor du havner.» Appen går rett på feltene.
2. **«Hvor du havner»-seksjonen mangler helt** — de tre linjene som forklarer AgencyOS, PlayerHQ
   og Foreldreportalen, og setningen «Du velger ikke selv. Kontoen avgjør.»
3. ~~Knappefargen spriker — fasiten har oransje «Logg inn», appen hadde mørk.~~ **Avgjort av
   Anders 10.08: oransje.** Innlogging er den ene skjermen der «Logg inn» *er* den ene handlingen,
   så clay bryter ikke monopolet. Rettet, og bildet over viser resultatet.
4. **Logoen er plassert ulikt.** Fasit: «AK Golf.» som ordmerke øverst til venstre. App: ak-symbolet
   sentrert i et eget bånd over kortet.
5. Google- og BankID-knappene finnes i appen, ikke i fasiten. *De er ekte funksjoner og skal bli —
   men fasiten har ikke satt av plass til dem, så plasseringen må avgjøres.*

**Anbefaling: FIKS FØRST.** Trenger svaret ditt på punkt 3 før noe bygges.

---

## PP-1.7 — Booking (offentlig) · `/booking`

![PP-1.7 mobil](../../screenshots/paper/signoff/PP-1.7-m390.png)
![PP-1.7 desktop](../../screenshots/paper/signoff/PP-1.7-d1280.png)
![PP-1.7 mørk](../../screenshots/paper/signoff/PP-1.7-m390-dark.png)

**Bygget 10.08.2026 (PR [#391](https://github.com/akgolfsoftware/Golf_Headquarters/pull/391)) — klar for din signatur.**

Siden var tre sider (velg tjeneste → egen side for tid → egen side for bekreft). Nå er den
fasitens ene side med fire steg, med den sticky handlingslinja nederst som alltid sier hva neste
trykk gjør.

Skjermbildene er tatt på en Vercel-preview med ekte tjenester og ekte ledige tider, ikke lokalt
og ikke med testdata. Flyten er klikket gjennom hele veien til oppsummeringen — 14 kontroller,
ingen konsollfeil. Betalingsknappen er bevisst ikke trykket, så det er ikke opprettet noen ekte
booking.

**Tre bevisste forskjeller fra fasiten, alle med grunn:**

| Fasit | Her | Hvorfor |
|---|---|---|
| «Svar 48 t» | «Bekreftelse straks» | Du valgte å beholde Stripe, så timen er bekreftet ved betaling |
| «1 350 kr per spiller» | «1 350 kr» | `ServiceType` har ingen kolonne for prisenhet — beskrivelsen bærer nyansen |
| «Start abonnement» | «Ta kontakt om abonnement» | Abonnement tegnes ikke selvbetjent ennå |

**Status: KLAR FOR SIGNATUR.**

---

# PP-2 · AgencyOS

## PP-2.1 — Konsoll · `/admin/agencyos`

![PP-2.1 desktop](../../screenshots/paper/signoff/PP-2.1-d1280.png)
![PP-2.1 mobil](../../screenshots/paper/signoff/PP-2.1-m390.png)
![PP-2.1 mørk](../../screenshots/paper/signoff/PP-2.1-m390-dark.png)

Fargene er riktige. Formen er ikke.

**Avvik**

1. **Fasiten er en samtale, appen er en oppslagstavle.** Fasit har en tråd i midten der systemet
   skriver til deg, med skrivefeltet nederst. Appen har ti kort under hverandre og ingen tråd.
2. **Artefaktkolonnen til høyre mangler.** Fasiten har «Ukeplan · Filip Sandberg» med ukeliste,
   invariant-sjekk, sløyfen og «Publiser». I appen finnes ingen slik kolonne.
3. **Sidemenyen har ulike punkter.** Fasit: Konsoll · Innboks (med tallet 7) · Spillere · Kalender
   · Workbench · AgenticOS · Økonomi · Innstillinger. App: Konsoll · Innboks · Spillere · Kalender
   · Innsikt · Mer. Ingen tall på Innboks.
4. **«Én ting nå» ligger i et gult varselkort** i appen. Fasiten bruker lys oransje.
5. Skjermen er nesten tom i appen fordi coach-brukeren har 0 spillere. *Det gjør punkt 1 og 2
   tydeligere, ikke mindre reelle — de gjelder uansett data.*

**Anbefaling: FIKS FØRST.** Dette er en ombygging, ikke en justering. Den bør planlegges som egen
jobb med deg til stede.

---

## PP-2.2 — Innboks · `/admin/innboks`

![PP-2.2 desktop](../../screenshots/paper/signoff/PP-2.2-d1280.png)
![PP-2.2 mobil](../../screenshots/paper/signoff/PP-2.2-m390.png)
![PP-2.2 mørk](../../screenshots/paper/signoff/PP-2.2-m390-dark.png)

**Avvik**

1. **Høyrekolonnen inneholder feil ting.** Den finnes — men den viser en innsikts-boble og
   «Tilbakemeldinger». Fasiten bruker plassen til å forklare og avgjøre den valgte saken: Gjelder,
   Hvorfor, Hva, Forventet effekt, Hvorfor nå, kildene den bygger på, og til slutt «Avvis» /
   «Godkjenn og send».
2. **Fem faner der fasiten har ett bilde med filter.** Appen deler Innboks / Godkjenning / Varsler
   / Oppfølging / Oppgaver i egne sider. Fasiten har én liste og piller: Alle 7 · Trenger
   godkjenning 1 · Fra spiller 2 · Drift 4 · Løst 0.
3. ~~Teksten i listen klippes i høyre kant.~~ **Rettet i natt.** Listen var 1681 px bred i et
   1280 px vindu, så både tekst, «Se»-knapper og hele høyrekolonnen falt utenfor skjermen. Årsak:
   rutenett-kolonnen manglet `min-width: 0`. Bildet over viser tilstanden etter rettelsen.
4. **Det brede oransje båndet «Behandle 46 godkjenninger»** er generisk. Fasitens oransje sitter
   på «Godkjenn og send» for én sak.
5. Radene mangler etiketter (FORSLAG / VARSEL / DRIFT) og fristkolonnen fasiten har til høyre.

**Anbefaling: FIKS FØRST** på punkt 1.

---

## PP-2.3 — Spillere · `/admin/spillere`

![PP-2.3 desktop](../../screenshots/paper/signoff/PP-2.3-d1280.png)
![PP-2.3 mobil](../../screenshots/paper/signoff/PP-2.3-m390.png)
![PP-2.3 mørk](../../screenshots/paper/signoff/PP-2.3-m390-dark.png)

Den eneste AgencyOS-skjermen som har riktig grunnform: liste til venstre, detaljer til høyre.

**Avvik**

1. **Listen er ikke gruppert.** Fasiten deler i tre med hver sin forklaring: «Trenger deg nå» (Noe
   venter på deg, eller spilleren har vært stille for lenge), «Følger planen» (Logger som avtalt.
   Ingen handling nødvendig), «Hviler» (Planlagt pause. Teller ikke som stille). Appen har én flat
   liste.
2. **Filtrene ligger i tre rader** (Gruppe / Status / Betaling) der fasiten har én rad med tall i
   pillene.
3. **Radene mangler tall.** Fasiten viser SG total og siste økt på hver rad. Appen viser bare navn,
   hcp og status.
4. **Detaljpanelet mangler de fire nøkkeltallene** (SG total, Kategori, Siste økt, Tester) og
   tabellen med siste tester.
5. Knappen «Workbench · velg spiller» ligger over overskriften i appen. I fasiten står tittelen
   øverst.

*Coach-brukeren har 1 spiller, så gruppering og tall har lite å vise. Punkt 1–4 er likevel faste
deler av skjermen.*

**Anbefaling: FIKS FØRST** på punkt 1 og 3.

---

## PP-2.4 — Kalender · `/admin/kalender`

![PP-2.4 desktop](../../screenshots/paper/signoff/PP-2.4-d1280.png)
![PP-2.4 mobil](../../screenshots/paper/signoff/PP-2.4-m390.png)
![PP-2.4 mørk](../../screenshots/paper/signoff/PP-2.4-m390-dark.png)

**Avvik**

1. **Detaljkolonnen mangler.** Fasiten viser den valgte avtalen (Tid, Varighet, Sted, Type,
   Selskap, Innhold), varsler om kollisjon i klartekst, og tilbyr én løsning: «Flytt til
   17:30–18:30». Appen har ingen slik kolonne.
2. **Nøkkeltallene er andre.** Fasit: Belegg 35 % · Booket 6 t · Ledige timer 2 · Kollisjoner 1.
   App: Økter uke 1 · Serier 1 · Live nå 0. Fasitens tall svarer på «har jeg for lite eller for
   mye å gjøre» — appens gjør ikke det.
3. **Agenda-visningen mangler.** Fasit har Dag / Uke / Måned / Agenda. Appen har de tre første.
4. **Det brede oransje «Ny økt»-båndet** er generisk. Fasitens oransje er konfliktløsningen.
5. **Tidsaksen er for luftig.** Appen viser 04:00–22:00 med mye tomrom; fasiten pakker 05:00–20:00
   tettere og får hele dagen på én skjerm.

*Coach-filteret jeg bygget i natt vises ikke, fordi ukas eneste økt er en serie uten registrert
coach. Det slår inn så snart det finnes bookinger med coach.*

**Anbefaling: FIKS FØRST.**

---

# Oppsummert

| Skjerm | Anbefaling | Størrelse på jobben |
|---|---|---|
| PP-1.1 I dag | Fiks først | Liten (skrivefelt, knapperekkefølge) |
| PP-1.2 Plan | Fiks først | Middels (manglende ukeoppsummering) |
| PP-1.3 Analyse | **Klar for kryss** | 13 → 4 kort, gjort 10.08 |
| PP-1.4 Meg | Fiks først, så godkjenn | Liten |
| PP-1.5 Booking i app | Fiks først | Liten — én feil rettet i natt |
| PP-1.6 Innlogging | Fiks først | Oransje knapp gjort; «Hvor du havner» gjenstår |
| PP-1.7 Booking offentlig | **Klar for signatur** | Bygget 10.08 (PR #391); Acuity står fortsatt på `akgolf.no` |
| PP-2.1 Konsoll | Fiks først | **Stor — ombygging** |
| PP-2.2 Innboks | Fiks først | Stor + én ren feil |
| PP-2.3 Spillere | Fiks først | Middels |
| PP-2.4 Kalender | Fiks først | Stor |

**Ingen skjerm er klar for kryss ennå.** Den ærlige lesningen er at fargene og skriftene er på
plass over hele linjen, men formen ikke er det — særlig i AgencyOS, der tre av fire skjermer
mangler kolonnen som gjør at du kan avgjøre noe uten å bytte side.

## De tre spørsmålene — besvart av Anders 10.08.2026

1. **Innloggingsknappen skal være oransje.** Innlogging er den ene skjermen der «Logg inn» er den
   ene handlingen, så clay bryter ikke «Én ting nå»-monopolet. Bygget.
2. **De åtte ekstra seksjonene på Analyse flyttes bak fanene.** Førsteskjermen viser tallet, hvor
   lekkasjen er, og den ene tingen å gjøre. Resten ligger under Statistikk. Ingenting slettet.
   Bygget.
3. **Acuity-omveien blir stående til alt annet er ferdig.** PP-1.7 er dermed låst til slutt av
   porten, ikke et åpent spørsmål. Ikke rør `vercel.json`-videresendingen.

## Fotnote om metoden

Bildene er laget med `scripts/signoff-gallery.mjs`. Den logger inn, setter tema via
`ak-v2-tema`-informasjonskapselen, tar hele siden i 390 og 1280 px, og monterer app og fasit side
om side. Kjør den på nytt slik når noe er endret:

```bash
node scripts/signoff-gallery.mjs "" http://localhost:3000
```
