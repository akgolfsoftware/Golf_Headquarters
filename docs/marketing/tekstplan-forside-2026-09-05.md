# Tekstplan — forsiden `/`

Skrevet 05.09.2026. Erstatter `docs/marketing/tekstplan-landingsside-2026-08-31.md`
(pensjonert samme dag). Gjelder runde 1 i `docs/MASTERPLAN-GJENSTAAENDE.md` STEG 18.33.

**Hvorfor denne fila finnes:** planen fra 31.08 pekte på en animert side som ikke finnes
i repoet, ble aldri lenket fra MASTERPLAN eller spec, og tre av punktene i den ble
overstyrt av beslutninger tatt etterpå (ingen vitnesbyrd, Attack Angle på engelsk, én
handling per flate). Denne planen sier hvilken tekst som faktisk skal stå på forsiden,
hva som er bekreftet, og hva som fortsatt venter på Anders.

---

## 0. Hva som er fasit

- **Teksten:** `docs/merkevare/ak-golf-tekstkonsept-2026-09-01.md` §2 «Forsiden».
- **Tegningen:** `designsystem/ak-golf/ui_kits/markedsside/Deler.jsx` (Mac 1440 + mobil
  390, lys). Teksten under er hentet ordrett derfra.
- **Reglene:** tekstkonseptet §5 «Tonen» + `designsystem/ak-golf/guidelines/08-sprak.md`.
- **Der kitet og denne planen spriker (bunnens roller, svartidsløftet, bildeteksten),
  vinner planen** (Anders 05.09). Masteren i Claude Design rettes av Anders; speilet i
  repoet (`designsystem/ak-golf/ui_kits/`) redigeres ikke, det overskrives ved neste speiling.
- **Reisen mot kitet:** avgjøres av Anders på preview (spec §3, plan Task 7 runde 1).
  Denne planen gjelder teksten uansett hvilken struktur som velges — spec §3 rad 1 låser
  tekstkilden til tekstkonseptet, ikke til kitets layout.

## 1. Teksten, seksjon for seksjon

Status: **FERDIG** (kan stå live) · **BEKREFT** (venter på Anders, se §2) ·
**EKSEMPEL** (tall som ikke er målt).

### 1.1 Hero

| Felt | Tekst | Status |
|---|---|---|
| Overskrift | Uansett hvor du står, vet du hva du trener på. | FERDIG |
| Ingress | Vi måler svingen din, tallene dine og spillet ditt. Så får du en plan som holder mellom øktene — og oppfølging som gjør at den faktisk blir fulgt. | FERDIG |
| Knapp | Book kartleggingsøkt | FERDIG |
| Under heroen | Første økt er 90 minutter, til vanlig timepris. Vi kartlegger hvor du står, og du går derfra med en skriftlig plan. | FERDIG — bekreftet 05.09 |
| Bildetekst | ~~Trackman står i hver økt. Det er der planen begynner.~~ Tatt ut (Anders 05.09). Bildet står uten bildetekst; alt-teksten beholdes. | FERDIG |

### 1.2 Problemet

> De fleste vet ikke hva de trener på.

Ikke fordi de er late. Fordi ingen har målt. Du slår en bøtte baller, det føles bedre
eller verre, og neste uke starter du på nytt. Det er ikke trening — det er håp.

**FERDIG.** Erstatter coach-sitatet fra 31.08 («Vi trener ikke på det du liker»), som
ikke er med i kitet. Denne gjør samme jobb uten å legge ord i munnen på Anders.

### 1.3 Slik jobber vi

> Vi begynner med et tall.

Trackman måler hva køllehodet faktisk gjør. Testbatteriet viser hvor du står i forhold
til deg selv sist. Deretter legger vi planen — og den ligger i appen, så du vet hva
onsdagsøkta skal inneholde.

**FERDIG.**

### 1.4 Slik leser du tallet

| Felt | Tekst | Status |
|---|---|---|
| Talleblokk | Carry, driver · **+12,4 m** · Trackman · 12.05–18.08.2026 · 38 målinger | EKSEMPEL — bygges med synlig «Eksempel»-merke (Anders 05.09) |
| Forklaring under tallet | Vi endret ikke svingen først. Vi målte i seks økter, fant at Attack Angle var problemet, og jobbet bare med den. | EKSEMPEL — bygges med synlig «Eksempel»-merke (Anders 05.09) |
| Fagtekst | Attack Angle beskriver om køllehodet går opp eller ned i treffet. Går det nedover med driver, får du høy Spin Rate og lav Launch Angle — du taper lengde uten å slå svakere. | FERDIG |
| Avslutning | Du kjenner det ikke. Det er derfor vi måler det. | FERDIG |

Tallet, datoene og antallet er oppdiktet. Tekstkonseptet §«Før dette kan publiseres»
slår fast (målt i basen 01.09) at Attack Angle ikke lagres i det hele tatt — kun
`carryDistance` har verdier. Fagteksten er sann uavhengig av tallet.

**Avgjort 05.09:** blokken vises, med merkelappen «Eksempel» synlig ved tallet. Byttes til
målt tall når basen har det (MASTERPLAN 0.14 og 0.15).

### 1.5 Junior Academy

> Barnet ditt skal vite hva det jobber med.

AK Golf Junior Academy tar spilleren fra første golfskole til turneringsspill, i trinn
med navn. Du ser hvilket trinn barnet står på, og hva som skal til for det neste.

*Knapp:* Meld interesse

**FERDIG.** Dette er kitets eneste andre handling på forsiden, og den peker på et annet
publikum (forelderen) — det bryter ikke «én handling per flate».

### 1.6 Det foreldre spør om

| Spørsmål | Svar | Status |
|---|---|---|
| Hva koster kartleggingsøkta? | 90 minutter til vanlig timepris. Du går derfra med en skriftlig plan. Ingen binding etterpå. | FERDIG — bekreftet 05.09 |
| Må barnet ha eget utstyr? | Nei. Vi har køller til lån i alle gruppene til og med U12. | FERDIG — bekreftet 05.09 |
| Hva koster appen? | Testbatteriet, statistikken og verktøyene er gratis, uten utløpsdato. Resten av appen koster 299 kr i måneden. Har du coaching-pakke, følger appen med. | FERDIG — stemmer med `docs/platform/BUSINESS-RULES.md` §Abonnement |
| Hvordan settes gruppene? | Etter alder og erfaring, ikke etter hvem som meldte seg først. Vi finner riktig gruppe i en samtale før oppstart. | FERDIG |

### 1.7 Avslutning

> Klar for å finne ut hvor du faktisk står?

90 minutter, vanlig timepris. Du går derfra med en plan.

*Knapp:* Book kartleggingsøkt

**FERDIG.**

### 1.8 Bunn

| Felt | Tekst | Status |
|---|---|---|
| Beskrivelse | AK Golf Academy drives av Anders Kristiansen — golfcoach, sportslig ansvarlig i Gamle Fredrikstad Golfklubb og sportssjef ved WANG Toppidrett Fredrikstad. | FERDIG — Anders 05.09. Kitet sier «sportssjef i GFGK og coach ved WANG»; planen vinner. Rettet i live bunn samme dag |
| Lenker | AK Golf HQ · Skarpnord · Kontakt | FERDIG |
| E-post | post@akgolf.no | FERDIG — adressen finnes (05.09) |
| Svartid | ~~Vi svarer innen én virkedag.~~ Holdes tilbake til Jarvis er i drift (Anders 05.09). Tatt ut av live bunn samme dag. | UTSATT — MASTERPLAN 18.34 |
| Sted | Gamle Fredrikstad GK, Fredrikstad | FERDIG — bekreftet 05.09 |
| Telefon / org.nr | ikke i kitet | Ikke svart 05.09. Holdes ute som i kitet til Anders sier noe annet |

## 2. Sju spørsmål — svart av Anders 05.09.2026

| # | Spørsmål | Svar | Konsekvens |
|---|---|---|---|
| 1 | GFGK og WANG i bunnen? | Ja: **sportslig ansvarlig GFGK, sportssjef WANG Toppidrett Fredrikstad** | 1.8 rettet; live bunn og hero-rollene i Reisen rettet samme dag |
| 2 | Finnes `post@akgolf.no`? Telefon og org.nr? | Ja, adressen finnes. Telefon/org.nr ikke svart | 1.8; telefon/org.nr holdes ute |
| 3 | «Vi svarer innen én virkedag»? | «Når komplette Jarvis-systemet er oppe så gjør vi det» | Løftet holdes tilbake på alle markedsflater, MASTERPLAN 18.34 |
| 4 | Skriftlig plan hver gang? | Ja | 1.1 og 1.6 FERDIG |
| 5 | Talleblokk med «Eksempel»-merke eller vent? | Anbefalingen: merke | 1.4 bygges med synlig merke |
| 6 | Køller til lån t.o.m. U12? | Ja | 1.6 FERDIG |
| 7 | «Trackman står i hver økt»? | Ta bort | 1.1 bildetekst ut |

Teksten er låst. Ingenting i §2 blokkerer runde 1 lenger. Registrert i
`.claude/rules/beslutninger.md` §FORSIDETEKSTEN LÅST.

## 3. Tatt ut fra planen 31.08, og hvorfor

- **Spillersitat.** Strøket 01.09 (merket bruker ikke vitnesbyrd). Canvasen
  `designsystem/canvas/landingsside-akgolf/Main.dc.html` har fortsatt en tom
  `[SITAT FRA SPILLER]`-blokk — canvasen er Retning A fra 28.08 og ikke fasit lenger;
  den ryddes bort når runde 1 lander.
- **«Spillere fulgt gjennom sesongen».** Basen ble nullstilt 30.08; kitet viser ikke tallet.
- **Tallraden i heroen** (20 testprotokoller · 10 P-posisjoner · 6 simulatorer). Ute —
  kitet har ingen tallrad, og tall uten kilde og dato er TruthLayer-brudd.
- **Sesong (april–oktober) og Mulligan 07–24.** Hører til `/anlegg` (runde 8) og
  `/mulligan` (runde 12). Kitets forside har ingen Mulligan-seksjon, i tråd med
  31.08-beslutningen om at Mulligan ikke knyttes til merket.
- **Seks tilbudsruter og sju knapper.** Ute — én handling per flate (tekstkonsept §5).
- **Coach-sitatet i 1.2.** Ikke i kitet, se 1.2 over.
- **«angrepsvinkel».** Nå Attack Angle, med norsk forklaring etter (08-sprak.md).
- **Pris per økt og pakkepriser.** STEG 18.9. Forsiden sier «vanlig timepris» og
  lenker til booking — ingen tall hardkodes.
- **Svartidsløftet på de gamle sidene.** «Innen 1 virkedag» står fortsatt live i
  `MarkedKontaktV2.tsx`, `MarkedJuniorV2.tsx`, `kontakt/page.tsx` (meta) og
  `kontakt/actions.ts` (kvittering). De bygges om i runde 2 og 6 — løftet tas ut der,
  se MASTERPLAN 18.34.

## 4. Skal ikke skrives (uendret fra 31.08, gjelder fortsatt)

- Ingen resultatgaranti («senk handicapet med 5 slag»).
- Ingen sammenligning med navngitte konkurrenter.
- Ingen tall om mindreårige på åpen flate, ingen barn nevnt med navn uten samtykke.
- Ingen «AI-drevet»-språk. Plattformen selges på hva den gjør, ikke teknologien bak.
- Ingen prisantydning som ikke finnes i Stripe eller på prissiden.
- MORAD og Mac O'Grady nevnes aldri (31.08).

## 5. Rekkefølge

1. ~~Anders svarer på de sju i §2.~~ Gjort 05.09.
2. Reisen mot kitet avgjøres på preview (plan Task 7, runde 1-særregelen).
3. Teksten bygges inn ordrett fra denne fila. Ingen ny tekst diktes opp i koden.
4. Siden leses høyt én gang. Skurrer en setning når den sies, skrives den om her først.
