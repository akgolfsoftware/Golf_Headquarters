# AK Golf HQ: treningsplanlegging, arkitektur og språk

**Status 27.09.2026:** Eneste gjeldende master for hele planleggingskjeden, periodisering, treningsbegreper, kategorisystem, tekniske planer, varslingsregler og skjermtekst i AK Golf HQ. Anders' nyeste uttrykkelige beslutning gjelder foran dette dokumentet. Produktrettigheter eies av `docs/platform/BUSINESS-RULES.md`; visuelt design eies av `docs/design-system/design-autoritet.md`. Kode og tester viser faktisk oppførsel, ikke hva som er besluttet.

De tidligere dokumentene `docs/ordbok.md`, `docs/treningsplanlegging.md`, `docs/treningsplanlegging-og-sprak-gjennomgang.md` og skrivebordsfilene er historisk grunnlag og oversikt, ikke parallelle mastere. Ved sprik gjelder denne filen. `docs/ordbok.json` er maskinlesbar avledning, ikke en egen beslutningskilde.

---

## Innhold

1. [Den helhetlige planleggingskjeden](#1-den-helhetlige-planleggingskjeden)
2. [Årsplan (Makrosyklus – 52 uker)](#2-årsplan-makrosyklus--52-uker)
3. [Periodisering (Mesosyklus – 4 til 8 uker)](#3-periodisering-mesosyklus--4-til-8-uker)
4. [Månedsplan (Mellomnivå – 4-ukers blokker)](#4-månedsplan-mellomnivå--4-ukers-blokker)
5. [Ukeplan (Mikrosyklus – WeekPlan)](#5-ukeplan-mikrosyklus--weekplan)
6. [Øktplan (WorkbenchSession / Dagsøkt)](#6-øktplan-workbenchsession--dagsøkt)
7. [Øvelser og driller](#7-øvelser-og-driller)
8. [Kategorisering fra Pyramiden (De 5 nivåene)](#8-kategorisering-fra-pyramiden-de-5-nivåene)
9. [Treningsområder (19 områder og puttingens 4 ferdigheter)](#9-treningsområder-19-områder-og-puttingens-4-ferdigheter)
10. [Tekniske planer, golfkøller og slagformer](#10-tekniske-planer-golfkøller-og-slagformer)
11. [Belastningsstyring, monitorering og rådgivende varsler](#11-belastningsstyring-monitorering-og-rådgivende-varsler)
12. [Strokes Gained mot eget nivå (Side-om-side analyse)](#12-strokes-gained-mot-eget-nivå-side-om-side-analyse)
13. [Tester og anbefalinger](#13-tester-og-anbefalinger)
14. [Språk, status og produktord](#14-språk-status-og-produktord)
15. [Dagens kodegap og åpne beslutninger](#15-dagens-kodegap-og-åpne-beslutninger)

---

## 1. Den helhetlige planleggingskjeden

Planleggingen henger sammen i en ubrutt kjede fra overordnet årsramme ned til enkeltrepetisjoner foran speilet:

```text
Årsplan (52 uker)
  │
  └── Periode (4–8 uker / Meso)
        │
        └── Månedsplan (4 uker)
              │
              └── Ukeplan (WeekPlan / Mikro)
                    │
                    └── Øktplan (WorkbenchSession)
                          │
                          └── Øvelse / Drill
                                │
                                └── Repetisjon (Miljø: speil, nett, range, bane)
```

Samtidig snakker tester, resultater og runder direkte tilbake til planen:

```text
Testdag ──> Testprotokoll ──> Resultat ──> Coach-vurdering ──> Valg i fremtidig økt
Runde ───> SG-analyse (eget nivå) ──> Områdegap ──> Teknisk plan / P-oppgave
```

---

## 2. Årsplan (Makrosyklus – 52 uker)

Årsplanen etablerer den overordnede treningsrammen for sesongen.

1. **Årsvolum:**
   - Eksempelplanen på **1 250 timer** gjelder en 16-årig toppsatsende junior i kategori C (**72–74** i brutto snittscore). Dette er ikke et automatisk årsvolum for alle spillere i kategorien.
   - Volumet skaleres tilpasset spillerens autoritative nivå (A–K-skalaen, der A = World Elite <68, K = Nybegynner 100+).
2. **De 4 offisielle hovedperiodene:**
   - `GRUNN` (Grunnperiode, senhøst/vinter, f.eks. uke 44–10 · 19 uker): Kapasitetsbygging, fysisk grunntrening, teknikkendringer i lav fart/tørrsving, lavt konkurransepress.
   - `SPESIALISERING` (Pre-season, vår, f.eks. uke 11–18 · 8 uker): Fart, slagkvalitet, banespill, situasjonstrening, combine-tester.
   - `TURNERING` (Konkurranseperiode, sommer/tidlig høst, f.eks. uke 19–40 · 22 uker): Toppform, turneringsspill, vedlikehold, lavt teknisk volum, scoring og banestrategi.
   - `EVALUERING` (Overgangsperiode, høst, f.eks. uke 41–43 · 3 uker): Sesongevaluering, screening, restitusjon, testing og målprosess for neste sesong.
3. **Spesialuker og markører langs 52-ukersbåndet:**
   - `TRENINGSSAMLING` (f.eks. uke 8 i Spania).
   - `TESTUKE` (f.eks. uke 14 og uke 42).
   - `TURNERINGER` (faste stevner som Garmin Norgescup, Srixon Tour og NM).
   - `FERIE / REKREASJON` (f.eks. uke 52 og uke 28).
4. **Fremdriftskurve (Planlagt vs. faktisk):**
   - Viser akkumulert timebane mot 1 250 timer.
   - Systemet beregner avvik ukentlig. Varsel utløses dersom spilleren ligger mer enn 5 % bak planlagt bane over tid.

---

## 3. Periodisering (Mesosyklus – 4 til 8 uker)

Mesosyklusen styrer formutvikling og fordeling over en blokk på 4 til 8 uker.

### 3.1 Periodens innhold
- **Navn og datospenn:** F.eks. «Spesialisering vår · 17. mars – 11. mai (Uke 11–18)».
- **Periodemål:** Tre konkrete målområder (f.eks. fart: +3 mph driver, teknikk: automatisere P4 uten overswing, nærspill: stabilisere lengdekontroll på våte greener).
- **Milepæler:** Planlagte tester (f.eks. Combine-test i uke 14) og samlinger.

### 3.2 Pyramidefordeling per periode (Prosent og timer)
Timefordelingen mellom de fem pyramidene endrer seg systematisk over sesongen:

| Periode | FYS | TEK | SLAG | SPILL | TURN | Totalt snitt/uke |
|---|---|---|---|---|---|---|
| `GRUNN` | 25 % | 35 % | 25 % | 15 % | 0 % | 24–28 t |
| `SPESIALISERING` | 15 % | 25 % | 35 % | 20 % | 5 % | 24–26 t |
| `TURNERING` | 10 % | 10 % | 25 % | 30 % | 25 % | 20–24 t |
| `EVALUERING` | 20 % | 20 % | 15 % | 25 % | 20 % | 12–16 t |

### 3.3 Belastningsbølge (Periodiseringskurve – 3:1-prinsippet)
3:1 og 2:1 er planleggingsmønstre coachen kan bruke, ikke automatiske påbud eller garantier mot skade. Periodiseringen kan planlegges i **bølger**:

- **3:1-modellen (eksempel for en utviklingsblokk):** Tre byggeuker kan ha 22, 25 og 28 planlagte timer, fulgt av en avlastningsuke med 17 timer. sRPE-poeng må regnes fra hver økts minutter × registrert anstrengelse; timer alene gir ikke et sRPE-tall. Ved 25 timer og gjennomsnittlig anstrengelse 5 blir regneeksempelet omtrent 7 500 sRPE, ikke 2 950. Planlagt og gjennomført belastning vises separat. Coachen velger faktisk volum og intensitet etter spillerens situasjon.
- **2:1-modellen:** Benyttes for yngre utøvere eller i tette turneringsblokker (2 byggeuker + 1 avlastningsuke).
- **Tapering (Topping av form mot mesterskap):**
  - I ukene rett før en hovedturnering reduseres volumet med 40–50 %, mens intensitet og kvalitet holdes oppe. Fokus flyttes mot scoring, sikte, ballstart og mental trygghet.

---

## 4. Månedsplan (Mellomnivå – 4-ukers blokker)

Månedsplanen fungerer som det praktiske oversiktsleddet mellom periodens langsiktige mål og ukens detaljerte øktplan:
- Samler 4 kalenderuker (typisk én full 3:1-belastningsbølge).
- Fastsetter månedens overordnede tema og prioriteringer.
- Sikrer at skolekrav (f.eks. eksamensperioder ved WANG Toppidrett), reisedager og periodiske tester er koordinert før detaljplanleggingen av uken starter.

---

## 5. Ukeplan (Mikrosyklus – WeekPlan)

Ukeplanen er den operative arbeidsflaten for coach og spiller i kalenderen.

1. **Uketype (`WeekType`):**
   - `UTVIKLING`: Fokus på kapasitetsbygging, teknikk og volum.
   - `TURNERING`: Turneringsuke med fokus på overskudd og konkurransespill.
   - `AVLASTNING` (`DELOAD`): Planlagt volumreduksjon for restitusjon.
   - `TEST`: Uke dedikert til standardiserte testbatterier og evaluering.
   - `FORBEREDELSE`: Tapering og skjerping inn mot en viktig turnering.
2. **Ukens fokusnotat (`WeekNote`):**
   - Konsist notat som angir ukens hovedfokus (f.eks. «P3-P4 brystrotasjon i lav fart + lengdekontroll på våte greener»).
3. **Ukebudsjett og belastningstak:**
   - Timebudsjett fordelt på de 5 pyramidene (FYS, TEK, SLAG, SPILL, TURN).
   - Veiledende belastningstak i sRPE-poeng beregnet fra planlagte minutter og forventet anstrengelse; coachen tilpasser det til spilleren.
   - Repetisjonsmål for uken (inkludert delmål for putting og fullsving).
4. **Dagsplanlegging (Mandag til søndag):**
   - Skiller tydelig mellom egentrening (`OEKT`), fellestrening (`GRUPPEOEKT`), skoletrening (`SKOLE`), privattime (`BOOKING`), stevne (`TURNERING`), forflytning (`REISE`), testing (`TEST`), coach-oppfølging (`SJEKKPUNKT`) og skadeforebygging/rehabilitering (`HELSE`).
   - Opptatt tid og faktisk treningstid vises hver for seg.

---

## 6. Øktplan (WorkbenchSession / Dagsøkt)

En økt er en tidsavgrenset treningshendelse med definert innhold.

1. **Planlagte parametere:**
   - Dato (med UTC-midnatt for entydig kalenderplassering).
   - Starttidspunkt (minutter fra midnatt).
   - Planlagt varighet (minutter).
   - Dominerende pyramidegren (`FYS`, `TEK`, `SLAG`, `SPILL`, `TURN`).
   - Treningsmiljø (`INNENDORS`, `TRENINGSOMRAADE`, `BANE`, `KONKURRANSE`).
   - Navn og coach-notater.
   - Liste over planlagte øvelser/driller.
2. **Statusflyt:**
   - `Planlagt` $\rightarrow$ `Pågår` $\rightarrow$ `Gjennomført` (eller `Avlyst` / `Hoppet over`).
3. **Publisering og synlighet:**
   - Skille mellom internt utkast hos coach (`DRAFT`), publisert for spiller (`PUBLISHED`) og eventuelt behov for spillergodkjenning ved endringer på kort varsel.
4. **Subjektiv innsats (1–10 Borg CR-10 skala):**
   - Etter gjennomført økt registrerer spilleren sin opplevde anstrengelse på en 1–10 skala (1 = ekstremt lett, 10 = maksimal anstrengelse).
5. **Foster belastningsberegning (sRPE):**
   $$\text{Belastning (sRPE-poeng)} = \text{Faktisk varighet (minutter)} \times \text{Opplevd innsats (1–10)}$$
   - Eksempel: 90 minutters slagtrening med innsats 6 = 540 sRPE-poeng.

---

## 7. Øvelser og driller

En øvelse er den minste planleggingsenheten i en økt.

- **Minimum for å planlegge:** Hensikt (pyramide), treningsområde, mengde og mål/resultatkrav.
- **Valgrekkefølge:** Hensikt $\rightarrow$ område $\rightarrow$ sted/miljø $\rightarrow$ måleutstyr $\rightarrow$ gjennomføring $\rightarrow$ press $\rightarrow$ mengde $\rightarrow$ mål.
- **Pyramiden** beskriver *hvorfor* øvelsen gjøres.
- **Treningsområdet** beskriver *hva* spilleren trener på.
- Fysiske felt (sett, reps, kg, RIR) vises kun for fysisk trening; golftekniske parametere vises kun for golføvelser.
- **Godkjent øvelsesbank:** Kun øvelser forhåndsgodkjent av Anders i `src/lib/masterbrain/ovelsesbank/godkjent/` kan tildeles som anbefalte øvelser.

---

## 8. Kategorisering fra Pyramiden (De 5 nivåene)

Pyramiden er inngangsdøren til hele treningssystemet. Hvert nivå har sitt eget formål, fargekode og parameteroppsett:

| Kode | Navn | Farge | Hensikt | Nøkkelparametere |
|---|---|---|---|---|
| `FYS` | Fysisk | Fiolett (`#7C3AED`) | Atletisk kapasitet og fundament | Sett, reps, kg, RIR, pulssone, leddutslag, mph |
| `TEK` | Teknisk | Blå (`#2563EB`) | Bevegelsesmønster og posisjoner | P1.0–P10.0 posisjon, motorikkfart, før/etter |
| `SLAG` | Golfslag | Turkis (`#0D9488`) | Ballkontroll og utfall | 9 høyder, 5 kurver, køllevalg, meter fra mål |
| `SPILL` | Spill | Grønn (`#059669`) | Situasjonsforståelse på bane | Banespill, strategi, format, press, hull |
| `TURN` | Turnering | Amber (`#D97706`) | Konkurranse og evaluering | Runde, forberedelse, rutiner, brutto score |

### Fysisk modul (FYS) – 4 pilarer, tester og målkjede
Fysisk trening følger en strukturert firetrinns prosess:

1. **Tester (Nåsituasjon):** Standardiserte tester for screening, mobilitet, styrke og power/eksplosivitet gir spillerens fysiske utgangspunkt.
2. **Målsetning:** Konkrete målepunkter etableres basert på testresultater kombinert med individuelle skadeforebyggende hensyn.
3. **Kjedekobling:** Målet forankres ubrutt fra årsplan til periode, måned, uke, økt og treningsprogram.
4. **De 4 fysiske pilarene:**
   - **Styrke:** Maksimal styrke og muskelutholdenhet (sett, reps, kg, RIR, pause).
   - **Kondisjon:** Aerob og anaerob kapasitet logget i segmenter (intervallsone 1–5, sekvens, tid/watt).
   - **Bevegelighet:** Mobilitet og leddutslag for svingposisjoner (tid i sekunder, statisk/dynamisk).
   - **Power & Speed:** Eksplosivitet og vertikal bakkekraft (køllehastighet i mph, ballhastighet, hopp/kast).

---

## 9. Treningsområder (19 områder og puttingens 4 ferdigheter)

Kanonisk liste over treningsområder i AK-formel v2:

| Kode | Område | Familie | Enhet | Måleenhet |
|---|---|---|---|---|
| `TEE_TOTAL` | Utslag / Tee totalt (>205 m) | Fullsving | m | Slag |
| `INNSPILL_200` | Innspill ~200 m (175–225 m) | Fullsving | m | Slag |
| `INNSPILL_150` | Innspill ~150 m (125–175 m) | Fullsving | m | Slag |
| `INNSPILL_100` | Innspill ~100 m (75–125 m) | Fullsving | m | Slag |
| `INNSPILL_50` | Innspill ~50 m (30–75 m) | Fullsving | m | Slag |
| `CHIP` | Chip | Nærspill | m | Slag |
| `PITCH` | Pitch | Nærspill | m | Slag |
| `LOB` | Lob | Nærspill | m | Slag |
| `BUNKER` | Bunker | Nærspill | m | Slag |
| `PUTT_0_3` | Kortputt 0–3 fot (<1 m) | Putting | ft | Putter |
| `PUTT_3_5` | Putt 3–5 fot (1–1,5 m) | Putting | ft | Putter |
| `PUTT_5_10` | Putt 5–10 fot (1,5–3 m) | Putting | ft | Putter |
| `PUTT_10_25` | Mellomputt 10–25 fot (3–7,5 m) | Putting | ft | Putter |
| `PUTT_25_40` | Langputt 25–40 fot (7,5–12 m) | Putting | ft | Putter |
| `PUTT_40_PLUSS` | Lengdeputt 40+ fot (>12 m) | Putting | ft | Putter |
| `STYRKE` | Styrketrening | Fys | Ingen | Serier × reps |
| `KONDISJON` | Kondisjonstrening | Fys | Ingen | Segmenter |
| `BEVEGELIGHET` | Bevegelighet og mobilitet | Fys | Ingen | Minutter |
| `BANE` | Banespill | Bane | Ingen | Hull |

### Puttingens 4 kjerneferdigheter
I tillegg til avstandsbåndene deles putting inn i de fire avgjørende ferdighetene:
1. **Greenlesing:** Evnen til å tolke fall, helning og rullelinje.
2. **Sikte:** Oppstilling og sikte av putterhodet mot startlinjen.
3. **Ballstart:** Starte ballen på den tiltenkte linjen uten spinnforstyrrelser.
4. **Lengdekontroll:** Presis hastighetskontroll tilpasset greenens stimp og avstand.

---

## 10. Tekniske planer, golfkøller og slagformer

Teknikk og slagkontroll kobles direkte sammen for å skape målrettet trening.

### 10.1 Golfkøller (20 enheter)
`DRIVER`, `WOOD_3`, `WOOD_5`, `WOOD_7`, `HYBRID_2`, `HYBRID_3`, `HYBRID_4`, `DRIVING_IRON`, `JERN_3`, `JERN_4`, `JERN_5`, `JERN_6`, `JERN_7`, `JERN_8`, `JERN_9`, `PW`, `GW`, `SW`, `LW`, `PUTTER`.

### 10.2 Slagkurver (5 typer)
`RETT`, `DRAW` (kontrollert venstrekurve for høyrehendte), `FADE` (kontrollert høyrekurve), `HOOK` (kraftig venstrekurve), `SLICE` (kraftig høyrekurve).

### 10.3 Slaghøyder (9 høyder i et 3×3-grid)
- **LAV:** `LOW_LOW` (flat stinger), `LOW_MEDIUM` (lav penetrerende), `LOW_HIGH` (lav utgang, stigende).
- **MEDIUM:** `MEDIUM_LOW` (flat standard), `MEDIUM_MEDIUM` (standard svinghøyde), `MEDIUM_HIGH` (høy standard).
- **HØY:** `HIGH_LOW` (høy med fremdrift), `HIGH_MEDIUM` (høy stoppebane), `HIGH_HIGH` (maksimal tårnhøyde).

*Eksempelkobling:* En spiller skal trene på et bestemt slag: **7-er jern · Medium-Medium høyde · 5 meter draw**. Systemet kobler dette direkte til den tekniske oppgaven som produserer slaget (f.eks. posisjon P3.4).

### 10.4 P1 til P10 svingposisjoner med 10 underposisjoner per trinn (91 posisjoner)
For mikronivå-analyse deles svingen inn i 91 eksakte posisjonskoder (P1.0 til P10.0):
- `P1.0–P1.9`: Setup / Adresse (balanse, fotstilling, grep, sikte, ballplassering).
- `P2.0–P2.9`: Takeaway til køllen er parallel med bakken (blad, håndbane, rotasjon).
- `P3.0–P3.9`: Baksving til venstre arm er parallel med bakken (skulderdreiing, underarmrotasjon som P3.4).
- `P4.0–P4.9`: Topp av baksving (turn, tilt, venstre håndledd, køllebladvinkel).
- `P5.0–P5.9`: Nedsving til venstre arm er parallel (shallowing, lag, bakkekraft).
- `P6.0–P6.9`: Delivery til køllen er parallel i nedsving (face-to-path, håndbane foran ball).
- `P7.0–P7.9`: Treffpunkt / Impact (forward shaft lean, attack angle, smash factor).
- `P8.0–P8.9`: Gjennomsving til køllen er parallel etter treff (ekstensjon, rotasjon).
- `P9.0–P9.9`: Release til høyre arm er parallel med bakken (full forlengelse mot mål).
- `P10.0`: Full finish og stående balanse (holdt i 3 sekunder).

### 10.5 Teknisk oppgave (PositionTask)
Hver posisjon kan tildeles en oppgave bestående av:
- **Tittel og beskrivelse:** Konkret biomekanisk instruksjon.
- **Media:** Bilde, video og modell-/referansebilde.
- **Før/etter-slider:** En horisontal bilde-slider der spiller og coach kan dra mellom opprinnelig feilposisjon og den korrigerte posisjonen for umiddelbar visuell feedback.

### 10.6 Læringstrappen (Treningsmiljø og repetisjonskrav)
Nye svingbevegelser må automatiseres trinnvis gjennom fire miljøer:
1. **Foran speil (Tørrsving uten ball):** F.eks. 1 000 repetisjoner i lav hastighet + 1 000 repetisjoner på auto (vanlig hastighet).
2. **Matte inn i nett (Med ballkontakt, uten utfallsangst):** F.eks. 1 000 repetisjoner i lav hastighet + 1 000 repetisjoner på auto.
3. **Range / Treningsfelt (Med full ballbane og radar):** Repetisjoner med TrackMan for å bekrefte at bevegelsen produserer ønsket utfall.
4. **Banespill / Simulator (Under spill og press):** Anvendt i spill på varierte lies og situasjoner.

---

## 11. Belastningsstyring, monitorering og rådgivende varsler

Treningsmotoren monitorerer kontinuerlig belastning og restitusjon via seks faste regler. Varslene er faglige råd til coach og spiller, og blokkerer aldri handlinger automatisk:

1. **Akutt:kronisk belastningshopp:** Varsler hvis ukens belastning øker med mer enn 15 % i forhold til det rullerende 4-ukers snittet (risiko for overbelastning).
2. **Full sving-volum:** Varsler hvis antall fullsving-slag med full fart øker med mer enn 10 % fra forrige uke.
3. **Akkumulert tretthet:** Varsler ved 4 strake uker med økende ukentlig belastning (indikerer behov for en planlagt deload-uke).
4. **Smerte / Egensjekk (Kritisk):** Varsler umiddelbart dersom spilleren har registrert $\ge 3$ dager med smerte/rød status i egensjekken siste 7 dager.
5. **Søvnunderskudd:** Varsler dersom spilleren har sovet under 8 timer 3 netter på rad.
6. **Årsvolumavvik:** Varsler dersom akkumulert treningstid ligger mer enn 5 % bak den planlagte 1 250-timers banen.

*Krav til datagrunnlag:* Dersom historikk mangler (f.eks. færre enn 4 uker for akutt:kronisk), skal skjermen eksplisitt vise «Mangler datagrunnlag: krever 4 ukers historikk» i stedet for å beregne misvisende tall.

---

## 12. Strokes Gained mot eget nivå (Side-om-side analyse)

Golfstatistikk i AK Golf HQ vurderes alltid mot to uavhengige referansepunkter for å gi et rettferdig bilde:

1. **PGA Tour (Scratch/Tour-nivå):** Etablerer den absolutte internasjonale målestokken.
2. **Spillerens egen baseline (Eget nivå):** Beregnes som snittet av spillerens siste inntil 20 runder.

### De 5 analyseområdene
- `Total`
- `Utslag (OTT)`
- `Innspill (APP)`
- `Nærspill (ARG)`
- `Putting (PUTT)`

### Pålitelighetsterskler for datagrunnlag
- **Under 8 runder:** «For lite datagrunnlag» (vises med antall runder, f.eks. 5/8).
- **8 til 11 runder:** Innledende tall.
- **12+ runder:** Statistisk pålitelig for utslag og innspill.
- **24+ runder:** Nødvendig for at nærspill og putting skal regnes som statistisk pålitelige på grunn av spillets naturlige varians på og rundt greenene.

### 12.1 Datakilder, analyse og faglig tilbakeføring

Treningsmotoren skal gjøre **kilde → registrering → beregning → vurdering → coachvalg → plan** synlig. Masterbrain er kilde til fagkunnskap og godkjent øvelsesbank, ikke en skjult kilde til spillerens målte prestasjonstall. Appen bruker en lokal, versjonert kopi fra `npm run sync:masterbrain`; dette er ikke en direktetilkobling til Masterbrain-mappen i nettleseren.

| Kilde | Faktisk appflyt | Grense som må vises |
|---|---|---|
| Intern rundeføring | Brutto score, hull og eventuelt slag-for-slag lagres i PlayerHQ. Komplett slagkjede kan beregne SG per område. | Bare totalscore eller hullaggregater gir ikke automatisk full SG. |
| UpGame | CSV-import fyller hullscore, putter, fairway og GIR der feltene finnes. Ferdige SG-tall fra ekstern app kan registreres manuelt med kilde. | UpGame-hull-CSV inneholder ikke slagposisjonene; appen skal ikke fabrikere dem eller beregne slagbasert SG fra aggregater. Dette er filimport, ikke en verifisert automatisk UpGame-synk. |
| TrackMan | CSV/HTML eller bilde kan gjennomgås og importeres til TrackMan-økt og slag. Slag kan matches mot en teknisk oppgave og oppdatere tilhørende måltall. | Vis enhet, kilde, dato, antall slag og match-status. Manglende felt er ukjent, ikke null. Ett radartall diagnostiserer ikke svingfeil. |
| Masterbrain | Lokalt speilet CANON, SG-prinsipper og bare Anders-godkjente øvelser kan støtte coachens vurdering og forslag. | Kandidatbanken er ikke anbefalbar. SG→teknisk feil er en hypotese som må kontrolleres med video, sikte og køllevalg. |

Skjermene skal skille **målt verdi**, **beregnet analyse**, **faglig hypotese** og **coachens beslutning**. Den nye `Teknisk Plan & Progresjon`-demovisningen med faste tall er ennå ikke koblet til spillerens lagrede TrackMan-økter. Den eksisterende tekniske planflyten kan motta matchede TrackMan-slag og måloppdateringer; disse to skjermene må samordnes før demoen kan kalles datadrevet.

**Analysemetode i dagens kode:** SG mot eget nivå bruker snittet av de siste inntil 20 rundene som referanse og sammenligner dette med de siste fem; PGA Tour-referansen vises separat. Resultatet må merkes med antall runder og datakilde. TrackMan-spredning beregnes fra gyldige slag med sideavvik og carry: median carry, gjennomsnittlig sideavvik, carry-spenn (P90–P10) og 1σ/2σ-ellipser. Ellipser vises først fra åtte gyldige slag. Dette beskriver mønstre, ikke årsaken til dem; teknisk hypotese må kontrolleres mot video, sikte, køllevalg og spillerkontekst før treneren endrer en oppgave.

**Kjent implementasjonsavvik som må rettes før tersklene brukes som beslutningsgrunnlag:** SG-koden krever 24 runder for å merke nærspill/putting som pålitelig, men begrenser samtidig referansevinduet til 20 runder. Statusen kan derfor aldri oppnås. De siste fem rundene inngår dessuten i eget referansesnitt, slik at sammenligningen ikke er uavhengig. En korrigert sammenligning må definere et eget historisk vindu uten overlapp og testes før trendvarsel eller planendring automatiseres.

---

## 13. Tester og anbefalinger

1. **Testdag:** Vises i kalender og ukeplan når den faktisk er datofestet. Skille mellom planlagt, gjennomført og manglende resultat.
2. **Resultatvisning:** Viser testnavn, dato, score med måleenhet, kilde og relevante forhold. Manglende data vises som «Ikke registrert», aldri som 0.
3. **Sammenlignbarhet:** Resultater sammenlignes kun fra identisk protokoll, versjon og testforhold.
4. **Anbefalinger:** Svake testresultater gir forsiktige forslag til øvelser fra den godkjente øvelsesbanken. Forslag krever et aktivt valg fra coachen før de legges inn i en fremtidig økt.
5. **Kontekstuelle faktorer:** Mental tilstand, sosial situasjon, taktiske valg og fysisk dagsform vurderes som mulige påvirkningsfaktorer, aldri som automatiske diagnoser.

---

## 14. Språk, status og produktord

- **Språk:** Norsk bokmål, korte konkrete setninger. Ingen emoji eller utropstegn i systemtekst.
- **Tall og tegn:** Komma som desimaltegn (`72,5`), mellomrom før prosent (`73 %`), mellomrom før måleenhet (`150 m`), 24-timers klokkeslett (`14:00`). Brutto score benyttes alltid, aldri netto score. Putting måles primært i fot, øvrig lengde i meter.
- **Kategori:** A–K bygger utelukkende på brutto snittscore (A = World Elite <68 til K = Nybegynner 100+). Handicap (HCP) er ikke en A–K-kategori.
- **TrackMan-parametre:** Beholdes på engelsk med stor forbokstav og suppleres med norsk forklaring (f.eks. «Club Speed (køllehastighet)», «Attack Angle (angrepsvinkel)»). «Smash Factor» er forholdet mellom ballhastighet og køllehastighet, ikke treffprosent.

### Ordliste for systemstatuser

| Element | Tillatte ord i skjermen |
|---|---|
| **Økt** | Planlagt · Pågår · Gjennomført · Avlyst · Hoppet over |
| **Publisering** | Ikke publisert · Publiserer · Publisert · Trukket tilbake |
| **Lagring** | Ikke lagret · Lagrer · Lagret · Kunne ikke lagres |
| **Forslag** | Forslag · Godkjent · Avvist · Utført · Feilet |
| **Uketype** | Utvikling · Turnering · Avlastning (Deload) · Test · Forberedelse |
| **Periode** | Grunn · Spesialisering · Turnering · Evaluering · Samling · Testuke |

### Flatenavn og roller (Må aldri blandes)
- **PlayerHQ:** Spillerens egen flate under `/portal` (plan, økter, Live-registrering, analyse og mål).
- **AgencyOS:** Coachens arbeidsflate under `/admin` (spillere, Workbench, planlegging og godkjenninger).
- **AgenticOS:** Systemets AI- og dispatch-motor.
- **Caddie:** Den personlige assistenten for spiller og coach.
- **Team Norway:** Landslagsseksjonen med egen visuell identitet.
- **WANG Toppidrett:** Skoleseksjonen for timeplaner og kompetansemål.

---

## 15. Dagens kodegap og åpne beslutninger

1. **Uke-entitet i database:** `WeekPlan` er opprettet som egen Postgres-modell for ukeplanlegging, men eldre deler av Workbench leser fortsatt uker utledet direkte fra øktdatoer.
2. **Kategori- og testnormer:** A–K har etablert autoritative snittscoregrenser, men spesifikke normkrav per fysiske test og combine-test er ennå ikke formelt vedtatt.
3. **Strukturert mengde:** Avanserte øvelsesdetaljer for visse delområder kan ikke redigeres i alle skjermflater samtidig ennå.
4. **Helseopplysninger:** Smerte og helsedata holdes strengt adskilt fra generelle testnotater og åpne AI-prompter i tråd med personvernreglene (GDPR).

---
*Dette dokumentet er AK Golf HQs autoritative masterkilde for planlegging og arkitektur.*
