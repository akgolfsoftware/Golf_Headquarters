# Plan: én master for treningsplanlegging og språk

**Dato:** 26. september 2026
**Status:** Konsolidering gjennomført 26.09.2026. Dette er historisk plan; [masteren](../treningsplanlegging-og-sprak.md) styrer.
**Omfang:** Dokumentstruktur, kildeorden, språk og treningsmodell. Ingen kode- eller databaseskjemaendringer i denne planen.

## 1. Problem

AK Golf HQ har flere dokumenter som opptrer som master samtidig:

- `docs/treningsplanlegging-og-sprak-gjennomgang.md`
- `docs/ordbok.md`
- `docs/treningsplanlegging.md`
- skrivebordsfilene i `~/Desktop/ak-golf-masterdokumenter/`

Dette gir tre praktiske problemer:

1. **Styringsrisiko:** En utvikler eller agent kan lese riktig dokument, men likevel få feil fasit fordi et annet dokument også kaller seg master.
2. **Språkdrift:** Begreper som "Belastning", "Sted og miljø", "Pyramide" og "Treningsområde" beskrives flere steder med litt ulik vekt.
3. **Byggerisiko:** Dokumentene beskriver både ønsket modell og faktisk kode. Når dette blandes, kan uferdig funksjon se ferdig ut.

Målet er ikke flere dokumenter. Målet er én styrende master, med resten som arkiv, oversikt eller maskinlesbar avledning.

**Utført:** Én master er opprettet og koblet fra prosjektets innganger. Testdager, resultater, godkjente øvelsesforslag og coachens aktive valg er lagt inn i appflyten. Mental, sosial, taktikk og fysisk tilstand er definert som resultatkontekst i masteren og vist ved testresultater og rundeanalyse. Lagring av faktorvurderinger, nivåreferanse og automatiske nivåvarsler er ikke vedtatt eller implementert.

## 2. Målbilde

Én fil eier sannheten:

```text
docs/treningsplanlegging-og-sprak.md
```

Denne filen skal være master for:

- planleggingshierarki fra årsplan til øvelse
- de fem pyramidevalgene: FYS, TEK, SLAG, SPILL, TURN
- treningsområder, sted, måleutstyr, gjennomføring, press, mengde og mål
- språk, statusord, enheter og TrackMan-skrivemåte
- grensen mellom ønsket modell og faktisk app

Alle andre dokumenter skal enten være:

- **arkiv:** historisk grunnlag, ikke styrende
- **oversikt:** kort forklaring som peker til master
- **avledet data:** for eksempel `docs/ordbok.json`
- **kartlegging:** faktisk kode- og modellstatus, ikke produktordre

## 3. Ny kildeorden

Foreslått topptekst i ny master:

```markdown
# AK Golf HQ — treningsplanlegging og språk

**Status:** Eneste gjeldende master for treningsplanlegging, treningsbegreper,
språk, statusord og skjermtekst i AK Golf HQ.

## Kildeorden

1. Anders' nyeste uttrykkelige beslutning for den aktuelle flaten.
2. Dette dokumentet.
3. Kode, tester og målt brukerreise for faktisk oppførsel.
4. Arkiverte dokumenter og kartlegginger som historikk og bevis, ikke nye instrukser.

Ved sprik mellom gamle dokumenter og denne masteren gjelder denne masteren.
```

## 4. Filstruktur etter konsolidering

| Fil | Ny rolle | Tiltak |
|---|---|---|
| `docs/treningsplanlegging-og-sprak.md` | Eneste master | Opprettes som konsolidert dokument |
| `docs/treningsplanlegging-og-sprak-gjennomgang.md` | Historisk grunnlag | Flyttes til arkiv etter at innholdet er hentet inn |
| `docs/ordbok.md` | Historisk grunnlag eller kort språkoversikt | Slankes kraftig eller arkiveres etter sammenslåing |
| `docs/treningsplanlegging.md` | Kort menneskeoversikt | Beholdes som 1-2 siders inngang som peker til master |
| `docs/ordbok.json` | Avledet data | Merkes tydelig som generert/avledet, ikke styrende |
| `~/Desktop/ak-golf-masterdokumenter/*.md` | Arbeidsgrunnlag | Ikke styrende. Relevant innhold flyttes inn eller arkiveres |

Anbefalt arkivmappe:

```text
docs/arkiv/treningsplanlegging-og-sprak-grunnlag-2026-09-26/
```

## 5. Anbefalt masterstruktur

Den nye masteren bør være kortere enn summen av dagens dokumenter, men mer presis.

```text
0. Status, kildeorden og hva dokumentet eier
1. Kortversjon for mennesker
2. Språkregler og standardord
3. Planleggingshierarki
4. Årsplan, perioder og uke
5. Økt
6. Øvelse: minimumsflyt og avanserte valg
7. Pyramidevalgene FYS, TEK, SLAG, SPILL, TURN
8. Treningsområder
9. Sted, treningsmiljø og måleutstyr
10. Gjennomføring, press, mengde og mål
11. Statusord, handlinger og meldinger
12. TrackMan, statistikk, enheter og score
13. Kjente kodegap
14. Arkiv og avledede filer
```

## 6. Viktige beslutninger som bør tas inn

### 6.0 Claude Design: AK Treningsmotor

Anders' delte Claude Design-utkast `AK Treningsmotor.dc.html` viser et nyttig forsøk på å
modellere treningsmotoren visuelt:

- årsplan -> periode -> uke -> økt -> øvelse
- live AK-formel
- fem pyramidegrener
- grenstyrt visning av relevante felt
- ukevisning med alle innholdstyper
- årsplan med perioder, turneringer, testdager, volum og pyramidefordeling

Dette bør brukes som **arbeidsmodell og visuell testflate**, ikke som egen master. Den nye
masteren skal eie begrepene og reglene. Designet kan vise om reglene fungerer i praksis.

Foreløpige funn fra designet:

1. **Sterkt:** Øvelse bygges som en motor, ikke som et flatt skjema. Dette gjør det lettere
   å se hvilke valg som faktisk hører sammen.
2. **Sterkt:** FYS, TEK, SLAG, SPILL og TURN får ulike felt, ikke bare ulike etiketter.
3. **Må rettes:** Øktkortet henger igjen med `Styrke · trapbar` og `HENSIKT FYS` selv når
   grenen settes til TEK, SLAG, SPILL eller TURN. Masteren må skille valgt økt, valgt gren og
   valgt øvelse tydeligere.
4. **Må rettes:** Designet bruker fortsatt `BELASTNING` for miljø, samtidig som FYS bruker
   belastning for kilo. Dette bekrefter behovet for å bytte menneskespråket til
   `Treningsmiljø`.
5. **Må avklares:** Ukevisningen viser `18 t 30 min` planlagt trening mot et ukebudsjett på
   `14 t`, men sier samtidig `0 min er ikke lagt ut`. Masteren må definere om gruppeøkter,
   turnering, test, reise og skole teller i treningsbudsjettet.
6. **Må avklares:** Årsplanen viser eksempeldata og plassholderdatoer. Masteren må kreve at
   slike data merkes tydelig som eksempel inntil de kommer fra faktisk turnerings- og
   testkilde.

### 6.1 Bytt språk rundt "Belastning"

Anbefaling:

- **Treningsmiljø** brukes for `INNENDORS`, `TRENINGSOMRAADE`, `BANE`, `KONKURRANSE`.
- **Fysisk belastning** brukes for vekt, RPE, pulssone, sRPE og ACWR.
- Teknisk kode kan fortsatt ha enum-navnet `Belastning` inntil en trygg migrering er planlagt.
- UI og dokumentasjon bør ikke bruke "Belastning" om miljø.

Dette reduserer den største begrepsfellen i materialet.

### 6.2 Skarpere regel for pyramide og område

Anbefalt formulering:

> Pyramiden beskriver hensikten med øvelsen. Treningsområdet beskriver hva spilleren trener på. Pyramiden styrer hvilke felt som foreslås og vises først, men skal ikke låse treningsområdet uten en konkret produktbeslutning.

Dette forener dagens to uttrykk: separate grener, men fleksible områder.

### 6.3 Minimumsflyt for coach

Masteren bør skille mellom **minimum for å planlegge** og **avanserte valg**.

Minimum per øvelse:

1. Hensikt
2. Treningsområde
3. Mengde
4. Mål eller resultatkrav

Avanserte valg ved behov:

- sted og treningsmiljø
- måleutstyr
- læringssteg
- teknisk/taktisk fokus
- press
- detaljerte reps, serier, RIR, pulssoner eller TrackMan-parametere

Dette gjør modellen brukbar i Workbench uten å fjerne fagdybden.

### 6.4 Én tydelig status for faktisk kode

Masteren bør ha en egen seksjon for kodegap, men ikke blande hullene inn i selve fasiten.

Første kjente kodegap:

- ingen egen uke-entitet
- mengde er fortsatt delvis fritekst i Workbench
- junior-/alderslogikk håndheves ikke i planmotoren
- ingen junior-baseline for Strokes Gained
- turnering mangler eksplisitt formål
- gamle 17-områders og invertert A-K-kilder finnes fortsatt historisk

## 7. Arbeidsrekkefølge

### Fase 1: Konsolideringsutkast

Lag `docs/treningsplanlegging-og-sprak.md` som nytt utkast. Bruk:

- `docs/treningsplanlegging-og-sprak-gjennomgang.md` som hovedbase
- `docs/ordbok.md` for språk, statusord, TrackMan og enheter
- `docs/treningsplanlegging.md` for kort, lesbar forklaring
- skrivebordsfil `05-kartlegging-treningsplanlegging.md` for kodegap

Ikke flytt eller slett gamle filer i denne fasen.

### Fase 2: Kritisk stramming

Gjør utkastet kortere og mer styrende:

- fjern tomme "Ønsket endring"-tabeller
- fjern dupliserte eksempler
- flytt historikk til arkiv
- behold bare beslutninger som er gjeldende
- merk uavklarte spørsmål som konkrete beslutningspunkter

### Fase 3: Pek hele repoet til én master

Oppdater referanser i:

- `AGENTS.md`
- `docs/platform/AGENT-BRIEF.md`
- `docs/treningsplanlegging.md`
- `docs/ordbok.md` dersom den beholdes som kort oversikt
- relevante design- og Workbench-dokumenter

### Fase 4: Arkiver gamle mastere

Flytt gamle styrende dokumenter til:

```text
docs/arkiv/treningsplanlegging-og-sprak-grunnlag-2026-09-26/
```

Legg topptekst i hver arkivfil:

```markdown
> Historisk grunnlag. Ikke styrende.
> Gjeldende master er `docs/treningsplanlegging-og-sprak.md`.
```

### Fase 5: Maskinlesbar ordbok

Bestem om `docs/ordbok.json` skal:

1. genereres fra masteren, eller
2. beholdes manuelt, men med tydelig tekst om at den er avledet.

Anbefaling: generer senere. Ikke gjør dette før masteren er stabil.

### Fase 6: Egen kodeplan

Når dokumentmasteren er godkjent, lag en separat implementeringsplan for:

- uke-entitet eller lett ukeplan-kobling
- strukturert mengde i Workbench
- fysisk belastning vs. treningsmiljø i UI
- junior-/alderslogikk
- junior SG-referanse
- turneringsformål
- opprydding av gamle kunnskapskilder

## 8. Akseptansekriterier

Konsolideringen er ferdig når:

1. Det finnes nøyaktig én fil som kaller seg master for treningsplanlegging og språk.
2. Alle andre gamle mastere peker til den eller ligger i arkiv.
3. "Belastning" er ikke lenger tvetydig i menneskevendt dokumentasjon.
4. Pyramide/område-regelen er formulert én gang og uten sprik.
5. Workbench kan bygge etter minimumsflyt uten å måtte støtte alle avanserte felt samtidig.
6. Kodegap står samlet som gap, ikke som om funksjonen allerede finnes.
7. `npm run prosjekt:sjekk` er grønn etter dokumentflyttingen.

## 9. Ikke gjør i samme runde

Ikke endre databaseskjema, enum-navn, migrasjoner, seed-data eller Workbench-kode som del av selve dokumentkonsolideringen. Det bør komme etter at Anders har godkjent ny master.

Ikke slett historiske dokumenter uten arkivsti. De trengs som bevis på hvorfor valgene ble tatt.

## 10. Første konkrete neste handling

Lag første utkast til:

```text
docs/treningsplanlegging-og-sprak.md
```

Utkastet skal være styrende, ikke komplett arkiv. Målet er en fil Anders kan lese og si:

> Dette er fasiten. Resten er grunnlag.
