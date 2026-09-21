# Treningsplanlegging i AK Golf HQ

**Status 21.09.2026:** Forenklet master for hvordan årsplan, perioder, uker, økter og øvelser
planlegges i Workbench. Språk og skrivemåte styres av [ordboken](ordbok.md).

Design- og kodearbeidet som gjør denne fagstrukturen til én sammenhengende reise fra årsplan
til gjennomføring og analyse, styres av
[gjennomføringsplanen](planer/planlegging-trening-og-analyse-design-og-kode-2026-09-21.md).

## 1. Hele planleggingsrekken

```text
Årsplan
  → Periode
    → Måned og uke
      → Økt
        → Øvelse
          → Pyramide
          → Treningsområde
          → Relevante valg for området
          → Mengde og mål
```

Planleggingen er veiledende. Ingen fordeling, periode eller treningsform er et automatisk krav.

## 2. Årsplan

Årsplanen viser hele sesongen, periodene, turneringene, testene og planlagt treningsmengde.

En årsplan inneholder:

- år og sesong
- perioder med fra- og til-dato
- turneringer og tester
- planlagte og gjennomførte timer
- fordeling mellom FYS, TEK, SLAG, SPILL og TURN

### Målsetninger i PlayerHQ

Målsetninger deles i to tydelige typer:

| Måltype | Beskriver | Eksempel |
|---|---|---|
| Resultatmål | Resultatet spilleren ønsker å oppnå | Topp 10 i NM · HCP under 5 · SG Putting til 0,0 |
| Prosessmål | Handlingene spilleren skal gjennomføre jevnlig | Tre putteøkter per uke · to FYS-økter per uke |

Et resultatmål kan støttes av flere prosessmål. Resultatmål og prosessmål skal vises hver for
seg i PlayerHQ, men samlet når spilleren vurderer om treningen fører mot ønsket resultat.
Prosessmål må kunne knyttes til relevant pyramidegren, test eller treningsområde når det finnes
et faktisk datagrunnlag. Systemet skal aldri fremstille sammenfall som bevist årsak.

## 3. Perioder

| Periodetype | Brukes til |
|---|---|
| Grunnperiode (`GRUNN`) | Bygge fysisk kapasitet, teknisk grunnlag og treningsvaner |
| Spesialperiode (`SPESIAL`) | Mer spesifikk trening mot spillerens behov |
| Turneringsperiode (`TURNERING`) | Forberedelse og gjennomføring rundt turneringer |
| Evalueringsperiode (`EVALUERING`) | Oppsummering, analyse og justering |
| Testuke (`TESTUKE`) | Planlagte tester og målinger |
| Ferie (`FERIE`) | Ferie, pause eller redusert plan |
| Treningssamling (`TRENINGSSAMLING`) | Samling over flere økter eller dager |
| Heldagssamling (`HELDAGSSAMLING`) | Samling med heldagsformat |

En periode har:

- Fra og til
- Fokus
- Ukevolum i minutter eller timer
- Øktbudsjett per uke
- Fordeling på pyramiden
- Periodemål
- Notater

Perioder kan ha fritt datospenn. De er ikke låst til hele kalenderuker.

## 4. Uke og kalender

Uken er arbeidsflaten der økter opprettes, flyttes, gjentas og publiseres.

| Kalenderinnhold | Betydning |
|---|---|
| Økt (`OEKT`) | Individuell treningsøkt |
| Gruppeøkt (`GRUPPEOEKT`) | Felles økt for en gruppe |
| Skole (`SKOLE`) | Skoletid eller skoleblokk |
| Booking (`BOOKING`) | Coachtime eller bestilt fasilitet |
| Turnering (`TURNERING`) | Turneringsdeltakelse |
| Reise (`REISE`) | Reisetid |
| Test (`TEST`) | Testgjennomføring |
| Sjekkpunkt (`SJEKKPUNKT`) | Avtale eller kontrollpunkt |
| Helse (`HELSE`) | Helse, restitusjon eller oppfølging |

Skole, booking, reise og andre opptattblokker gir kontekst. De bestemmer ikke automatisk hva
spilleren får planlegge.

## 5. Økten

Når en økt opprettes, velges:

1. Dato og starttid
2. Varighet
3. Navn
4. Dominerende pyramide
5. Type kalenderinnhold
6. Treningssted eller miljø når det er relevant
7. Øvelser
8. Notater

Økten kan være et utkast før den publiseres til spilleren. En publisert økt kan senere starte,
pågå og bli gjennomført.

## 6. Øvelsen: valgene i riktig rekkefølge

### Trinn 1: Velg pyramide

| Valg | Betyr | Vanlig startpunkt |
|---|---|---|
| FYS (`FYS`) | Fysisk trening | Styrke, kondisjon eller bevegelighet |
| TEK (`TEK`) | Bevegelse og teknisk utførelse | Et golfområde og en teknisk dimensjon |
| SLAG (`SLAG`) | Trene et bestemt golfslag | Utslag, innspill, nærspill eller putting |
| SPILL (`SPILL`) | Bruke ferdighetene i spillsituasjon | Banespill eller spillnær øvelse |
| TURN (`TURN`) | Turneringsforberedelse eller turnering | Banespill med konkurranse og turneringspress |

Pyramiden beskriver **hensikten**. Den låser ikke treningsområdet. En baneøvelse kan derfor
være TEK, SLAG, SPILL eller TURN, avhengig av hva spilleren trener på.

### Trinn 2: Velg treningsområde

Alle fem pyramidevalg kan i dagens modell kombineres med alle områdene. Workbench kan foreslå
et naturlig startpunkt, men skal ikke sperre andre valg.

| Familie | Valg |
|---|---|
| Fullsving | Utslag (`TEE_TOTAL`) · Innspill ca. 200 m (`INNSPILL_200`) · 150 m (`INNSPILL_150`) · 100 m (`INNSPILL_100`) · 50 m (`INNSPILL_50`) |
| Nærspill | Chip (`CHIP`) · Pitch (`PITCH`) · Lob (`LOB`) · Bunker (`BUNKER`) |
| Putting | 0–3 fot (`PUTT_0_3`) · 3–5 fot (`PUTT_3_5`) · 5–10 fot (`PUTT_5_10`) · 10–25 fot (`PUTT_10_25`) · 25–40 fot (`PUTT_25_40`) · 40+ fot (`PUTT_40_PLUSS`) |
| Fysisk | Styrke (`STYRKE`) · Kondisjon (`KONDISJON`) · Bevegelighet (`BEVEGELIGHET`) |
| Bane | Banespill (`BANE`) |

### Trinn 3: Workbench viser bare relevante felt

Det er området, ikke pyramiden, som bestemmer hvilke detaljvalg som kommer videre.

| Valgt område | Neste valg |
|---|---|
| Fullsving | Læringssteg · teknisk dimensjon · treningsmiljø · press · mengde |
| Chip, pitch eller lob | Teknisk dimensjon · treningsmiljø · press · mengde |
| Bunker | Sandtrinn · teknisk dimensjon · treningsmiljø · press · mengde |
| Putting | Puttingdimensjon · treningsmiljø · press · antall putter |
| Styrke | Serier · repetisjoner · pause · RIR · vekt |
| Kondisjon | Segmenter med tid og intensitetssone |
| Bevegelighet | Tid |
| Banespill | Spilleformat eller strategioppgave · treningsmiljø · press · antall hull |

## 7. Detaljvalgene

### Læringssteg: bare fullsving

- Uten ball (`UTEN_BALL`)
- Lav hastighet (`LAV_HAST`)
- Automatikk (`AUTO`)

### Treningsmiljø

- Innendørs (`INNENDORS`)
- Treningsområde (`TRENINGSOMRAADE`)
- Bane (`BANE`)
- Konkurranse (`KONKURRANSE`)

Belastning brukes om fysisk anstrengelse, intensitet eller motstand, ikke som navn på miljøet.

### Press: hvem og hva spilleren møter

- Alene (`ALENE`)
- Observert (`OBSERVERT`)
- Konkurranse (`KONKURRANSE`)
- Turnering (`TURNERING`)

### Teknisk dimensjon: ett valgfritt fokus

| Område | Valg |
|---|---|
| Utslag | Sikte og oppstilling (`SIKTE`) · Startretning (`STARTRETNING`) · Kurve (`KURVE`) · Treffpunkt (`TREFFPUNKT`) |
| Innspill 200 m | Startretning · Kurve · Høyde (`HOYDE`) · Treffpunkt |
| Innspill 150 m | Startretning · Kurve · Høyde · Lengdekontroll (`LENGDEKONTROLL`) |
| Innspill 100 m | Lengdekontroll · Startretning · Høyde |
| Innspill 50 m | Lengdekontroll · Høyde · Spinn (`SPINN`) |
| Chip | Landingspunkt (`LANDINGSPUNKT`) · Utrulling (`UTRULLING`) · Treffpunkt · Køllevalg (`KOLLEVALG`) |
| Pitch | Lengdekontroll · Landingspunkt · Høyde · Spinn |
| Lob | Høyde · Landingspunkt · Bruk av bounce (`BOUNCE_BRUK`) · Treffpunkt |
| Bunker | Sandinngang (`SANDINNGANG`) · Lengdekontroll · Høyde · Lie-variasjon (`LIE_VARIASJON`) |
| Putting | Greenlesing (`GREENLESING`) · Ballstart (`BALLSTART`) · Sikte · Lengdekontroll |
| Banespill | Spilleformat (`SPILLEFORMAT`) · Strategioppgave (`STRATEGIOPPGAVE`) |

En øvelse har maksimalt én teknisk dimensjon. Feltet er valgfritt.

### Sandtrinn: bare bunker

- Uten ball i sanden (`UTEN_BALL_I_SAND`)
- Med ball (`MED_BALL`)

## 8. Hva skjer etter hvert pyramidevalg?

### FYS

1. Velg Styrke, Kondisjon eller Bevegelighet.
2. Workbench viser feltene for det valgte fysiske området.
3. Treningsmiljø og press skjules når de ikke er relevante.

### TEK

1. Velg golfområdet teknikken gjelder.
2. Ved fullsving velges eventuelt læringssteg.
3. Velg eventuelt én teknisk dimensjon.
4. Velg treningsmiljø og press.
5. Angi mengde og mål.

### SLAG

1. Velg slagområdet: utslag, innspill, nærspill eller putting.
2. Velg eventuelt én relevant dimensjon.
3. Velg treningsmiljø og press.
4. Angi antall slag eller putter og ønsket resultat.

### SPILL

1. Banespill foreslås som startpunkt, men andre områder er tillatt.
2. For Banespill velges Spilleformat eller Strategioppgave.
3. Velg treningsmiljø og press.
4. Angi antall hull, tid eller spilloppgave.

### TURN

1. Banespill foreslås som startpunkt.
2. Velg Spilleformat eller Strategioppgave.
3. Treningsmiljø settes vanligvis til Konkurranse.
4. Press settes vanligvis til Turnering.
5. Knytt økten til turneringen når den konkrete turneringsreisen bygges.

«Vanligvis» betyr forslag, ikke tvang.

## 9. Mengde etter område

| Område | Mengde registreres som |
|---|---|
| Fullsving og nærspill | Antall slag |
| Putting | Antall putter |
| Banespill | Antall hull |
| Styrke | Serier og repetisjoner |
| Kondisjon | Segmenter med tid og sone |
| Bevegelighet | Minutter |

## 10. Eksempler

**Teknikk, fullsving**

`TEK → Utslag → Lav hastighet → Treffpunkt → Treningsområde → Observert`

**Golfslag, putting**

`SLAG → Putt 5–10 fot → Ballstart → Treningsområde → Alene`

**Spill på banen**

`SPILL → Banespill → Strategioppgave → Bane → Konkurranse`

**Turneringsforberedelse**

`TURN → Banespill → Spilleformat → Konkurranse → Turnering`

**Fysisk styrke**

`FYS → Styrke → 4 serier × 6 repetisjoner → RIR 2`

## 11. Dagens Workbench og komplett mål

Dagens øvelsesskjema lar coachen velge pyramide, alle treningsområder, varighet og
beskrivelse. Det filtrerer ikke områdene etter pyramide, i tråd med modellen.

Følgende deler finnes i domenemodellen, men er ennå ikke komplette redigerbare valg i det nye
øvelsesskjemaet:

- læringssteg (internt felt: `motorikk`)
- teknisk dimensjon
- sandtrinn
- treningsmiljø (internt felt: `belastning`)
- press
- områdespesifikk mengde

Workbench er komplett på dette punktet når trinn 3–9 kan redigeres, lagres og vises igjen uten
å gjeninnføre gamle skalaer eller gjøre veiledende valg til sperrer.
