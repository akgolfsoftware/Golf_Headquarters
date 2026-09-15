# Ordbok — trening, planlegging, tall og TrackMan (MASTER, utkast)

**Status: UTKAST til Anders' godkjenning, 15.09.2026.** Når Anders har rettet og godkjent
dette dokumentet, er det den ene masteren for alle ord, koder og tall i AK Golf HQ som
handler om trening, årsplan, periodeplan, styrketrening, statistikk og TrackMan. Da slettes
eller arkiveres alle eldre ordbøker (se «Hva dette erstatter» nederst).

**Slik leser du dokumentet:** Hver tabell har tre kolonner: **Kode** (det som lagres i
databasen — endres aldri ved språkvask), **Navn** (det spilleren og coachen ser på skjermen)
og **Betyr** (hva det er, i vanlige ord). Der koden i dag avviker fra det Anders har bestemt,
står det en rad merket **«Avvik»** — de er samlet i kapittel 19.

**Grunnregel (bestemt 18.08.2026):** Ingenting her er et krav, tak eller minimum. Ordene
merker og organiserer trening. Spilleren og coachen planlegger fritt.

---

## 1. Pyramiden — de fem treningstypene

Visningsrekkefølge nedenfra og opp. Ikke et hierarki, ingen prosentkrav.

| Kode | Navn | Betyr |
|---|---|---|
| FYS | Fysisk | Styrke, kondisjon, bevegelighet, hurtighet |
| TEK | Teknisk | Arbeid med svingen og posisjonene |
| SLAG | Golfslag | Øve på bestemte golfslag |
| SPILL | Spill | Banespill, strategi, scoring |
| TURN | Turnering | Konkurranse og turneringsforberedelse |

Avvik: en eldre kodefil viser SLAG som «Slag». Skjermnavnet skal være «Golfslag».

## 2. Treningsområder — hvor på anlegget (19 stk)

Putting måles i **fot**. Alt annet i **meter**.

| Kode | Navn | Betyr | Enhet |
|---|---|---|---|
| TEE_TOTAL | Utslag | Driver og utslag | m |
| INNSPILL_200 | Innspill ~200 m | Innspill rundt 200 meter | m |
| INNSPILL_150 | Innspill ~150 m | Innspill rundt 150 meter | m |
| INNSPILL_100 | Innspill ~100 m | Innspill rundt 100 meter | m |
| INNSPILL_50 | Innspill ~50 m | Innspill rundt 50 meter | m |
| CHIP | Chip | Lavt nærspill med rull | m |
| PITCH | Pitch | Høyere nærspill med mindre rull | m |
| LOB | Lob | Høyt, kort nærspill | m |
| BUNKER | Bunker | Sandslag | m |
| PUTT_0_3 | Putt 0–3 fot | Kortputt | fot |
| PUTT_3_5 | Putt 3–5 fot | | fot |
| PUTT_5_10 | Putt 5–10 fot | | fot |
| PUTT_10_25 | Putt 10–25 fot | | fot |
| PUTT_25_40 | Putt 25–40 fot | | fot |
| PUTT_40_PLUSS | Putt 40+ fot | Langputt | fot |
| STYRKE | Styrke | Fysisk: styrke og kraft | — |
| KONDISJON | Kondisjon | Fysisk: utholdenhet | — |
| BEVEGELIGHET | Bevegelighet | Fysisk: mobilitet | — |
| BANE | Banespill | Spill på bane | hull |

**Hva som telles per område:** golfslag telles i slag, putting i putter, banespill i hull,
styrke i serier og repetisjoner, kondisjon i segmenter, bevegelighet i minutter.

Avvik: eldre kodefiler har 17 områder med sju puttebånd, og én visningsfil har putting i
meter. Denne tabellen vinner (allerede vedtatt 19.08.2026).

## 3. AK-formelen — merkelappen på en øvelse

```
PYRAMIDE_OMRÅDE_MOTORIKK_BELASTNING_PRESS
```

Eksempel: `TEK_CHIP_LAV_HAST_TRENINGSOMRAADE_ALENE` = teknisk chip-øvelse i lav hastighet,
på treningsområdet, uten at noen ser på.

Formelen settes på **øvelsen** (drill/øvelse/test i økten). Økten arver fra øvelsene. (Åpen
avklaring A06 — se kapittel 19.)

### 3.1 Motorikk — læringssteg (gjelder fullsving)

| Kode | Navn | Betyr |
|---|---|---|
| UTEN_BALL | Uten ball | Bevegelse uten å treffe ball |
| LAV_HAST | Lav hastighet | Med ball, redusert fart |
| AUTO | Automatikk | Full fart, automatisert |

Club Speed-trening (fart uten balltreff) er AUTO. «Uten ball» er da en egenskap ved
øvelsen, ikke et eget steg (bestemt 01.09.2026).

### 3.2 Belastning — miljøet øvelsen gjøres i

| Kode | Navn | Betyr |
|---|---|---|
| INNENDORS | Innendørs | Simulator, nett, studio |
| TRENINGSOMRAADE | Treningsområde | Range, nærspillsområde, puttinggreen |
| BANE | Bane | Ute på banen |
| KONKURRANSE | Konkurranse | Konkurranselignende ramme |

Belastning er **miljø**, ikke fysisk anstrengelse. Anstrengelse måles med intensitet
(kapittel 8).

### 3.3 Press — hvem som ser på

| Kode | Navn | Betyr |
|---|---|---|
| ALENE | Alene | Ingen ser på |
| OBSERVERT | Observert | Coach eller andre ser på |
| KONKURRANSE | Konkurranse | Konkurranse mot noen |
| TURNERING | Turnering | Ekte turnering |

### 3.4 Dimensjon — hva øvelsen jobber med (17 stk)

| Kode | Navn | Kode | Navn |
|---|---|---|---|
| SIKTE | Sikte og oppstilling | LANDINGSPUNKT | Landingspunkt |
| STARTRETNING | Startretning | UTRULLING | Utrulling |
| KURVE | Kurve | KOLLEVALG | Køllevalg |
| HOYDE | Høyde | BOUNCE_BRUK | Bruk av bounce |
| TREFFPUNKT | Treffpunkt | SANDINNGANG | Sandinngang |
| LENGDEKONTROLL | Lengdekontroll | LIE_VARIASJON | Lie-variasjon |
| SPINN | Spinn | GREENLESING | Greenlesing |
| BALLSTART | Ballstart | SPILLEFORMAT | Spilleformat |
| | | STRATEGIOPPGAVE | Strategioppgave |

Hvilke dimensjoner som passer, avhenger av området: fullsving har alle aksene, nærspill og
putting har ikke motorikk, bunker har i tillegg **sandtrinn** (UTEN_BALL_I_SAND «Uten ball i
sanden», MED_BALL «Med ball»), og FYS har bare sine egne parametere (kapittel 8).

### 3.5 Innslag i en økt

| Kode | Navn | Betyr |
|---|---|---|
| DRILL | Øvelse | Fast øvelse fra biblioteket |
| OVELSE | Øvelse | Fri øvelse (se avvik) |
| TEST | Test | Testprotokoll |
| TEKNISK_OPPGAVE | Teknisk oppgave | Oppgave fra teknisk plan (P-posisjon) |

Bestemt 12.09.2026: skjermordet er **«øvelse»**, aldri «drill». Kodene beholdes.

### 3.6 Hvordan mengde telles

| Kode | Navn | Betyr |
|---|---|---|
| SVINGER_UTEN_BALL | Svinger uten ball | Antall svinger |
| BALLER_SLATT | Baller slått | Antall baller |
| TID | Tid | Minutter |
| SETT_REPS | Sett × reps | Serier og repetisjoner |

### 3.7 Måte å trene på

| Kode | Navn | Betyr |
|---|---|---|
| BLOKK | Blokktrening | Samme slag mange ganger |
| VARIABEL | Variasjonstrening | Bytt slag, kølle eller mål hver gang |
| KONKURRANSE | Konkurranse | Øvelse med poeng eller motstander |
| SPILL_TEST | Spill/test | Spillform eller testprotokoll |

Bestemt 12.09.2026: blokk- og variasjonstrening beskriver *hvordan* man trener. De er ikke
tellbare deler av økten. Tellbare deler heter øvelser.
Avvik: to kodelister — én har RANDOM der den andre har VARIABEL. Skjermnavn er
«Variasjonstrening» uansett.

## 4. Årsplan og perioder

Årsplanen er hele året (1.1–31.12) delt i perioder. Perioder er merkelapper på kalenderen —
de begrenser ikke hva som kan planlegges.

### 4.1 Perioder

| Kode | Navn | Typisk innhold (veiledende) |
|---|---|---|
| GRUNN | Grunnperiode | Fundament: fysisk og teknisk byggearbeid |
| SPESIAL | Spesialiseringsperiode | Slag og spissing mot sesong |
| TURNERING | Turneringsperiode | Konkurranse og vedlikehold |
| EVALUERING | Evaluering | Testing, analyse, planlegging av neste år |
| TESTUKE | Testuke | Samlet testgjennomføring |
| FERIE | Ferie | Fri |
| TRENINGSSAMLING | Treningssamling | Samling, dagsformat |
| HELDAGSSAMLING | Heldagssamling | Samling, heldagsformat |

Skjermnavn er alltid det fulle ordet: «Grunnperiode», ikke «GRUNN».
Avvik: koden har to periodelister. Den ene mangler EVALUERING, den andre mangler TESTUKE og
samlingene. En gammel kalender lagrer EVALUERING som TURNERING og FERIE som GRUNN.

### 4.2 Det en periode inneholder

| Felt | Navn | Betyr |
|---|---|---|
| startDate / endDate | Fra – til | Fritt datospenn, ikke låst til kalenderuker |
| focus | Fokus | Fritekst: hva perioden handler om |
| weeklyVolMin / Max | Ukevolum | Minutter per uke, laveste og høyeste (veiledende) |
| weeklySessionBudget | Øktbudsjett | Antall økter per uke per pyramidetype, f.eks. FYS 4, TEK 2 |
| notes | Notater | Fritekst |

### 4.3 Ukerytme (valgfritt mønster, ikke regel)

BYGG → BYGG → TOPP → DELOAD i fireukers sykluser.

| Kode | Navn | Betyr |
|---|---|---|
| BYGG | Byggeuke | Volum og nye oppgaver |
| TOPP | Toppuke | Høy kvalitet, spissing |
| DELOAD | Avlastingsuke | Redusert belastning |

### 4.4 Uketyper rundt turnering (fra WANG-årshjulet, brukt i tekst, ikke som data)

Utviklingsuke · Pre-turnering · Turneringsuke · Overgangsuke · Avslutningsuke · Samlingsuke ·
Testuke · Ferieuke · Eksamensblokkert.

### 4.5 Treningsblokk-merker — strekninger mellom holdepunkter

Frie merker på ukene mellom to turneringer. Fritt datospenn, kan deles opp.

| Kode | Navn | Typisk fokus |
|---|---|---|
| UTVIKLING | Utvikling | Tekniske oppgaver, volum |
| FORBEREDELSER | Forberedelser | Spissing mot kommende turnering |
| KONKURRANSE | Konkurranse | Turneringsspill |

Treningsblokk i kalenderen er et *tidsbegrep*. Blokktrening (3.7) er en *treningsmåte*.
De to må ikke blandes.

### 4.6 Periodemål (fokusområder per elev i en periode)

| Felt | Navn | Betyr |
|---|---|---|
| akse | Treningstype | Hvilken av de fem pyramidetypene målet gjelder |
| tittel | Mål | Hva som skal oppnås |
| egentidMinUke | Egentid | Minutter egentrening per uke |
| maalemetode | Måles med | Hvordan man ser om målet er nådd |
| status | Status | IKKE_STARTET «Ikke startet» · PAA_VEI «På vei» · NAADD «Nådd» |
| egenvurdering / trenervurdering | Vurdering | 1–5, spillerens og coachens |

### 4.7 Mål (generelt)

| Kode | Navn | Betyr |
|---|---|---|
| OUTCOME | Resultatmål | Hva du vil oppnå (score, ranking) |
| PROCESS | Prosessmål | Hva du gjør for å komme dit |

## 5. Kalenderen

### 5.1 Blokk-typer (hva som kan ligge i kalenderen)

| Kode | Navn | Betyr |
|---|---|---|
| OEKT | Økt | Treningsøkt |
| SKOLE | Skole | Skoletid, vises dimmet og låst |
| BOOKING | Booking | Coachtime eller fasilitet fra bookingsystemet |
| TURNERING | Turnering | Turneringsdeltakelse |
| REISE | Reise | Reisetid |
| TEST | Test | Testgjennomføring |
| — | Sjekkpunkt | Avtale eller merkedag (finnes ikke i kode ennå) |
| — | Helse | Helse og restitusjon (finnes ikke i kode ennå) |
| — | Gruppeøkt | Fellesøkt, coach eier (finnes som felt på økt, ikke egen type) |

### 5.2 Opptatt-blokker (spillerens egne)

SKOLE «Skole» · JOBB «Jobb» · AVTALE «Avtale» · REISE «Reise» · ANNET «Annet». Kan gjentas
ukentlig (WEEKLY) eller ikke (NONE). Kan være privat.

### 5.3 Skoleplan (WANG)

TIME «Time» · PROVE «Prøve» · HELDAGSPROVE «Heldagsprøve» · EKSAMEN «Eksamen» · FERIE «Ferie»
· SKOLETUR «Skoletur» · ANNET «Annet». Trinn: VG1, VG2, VG3.

### 5.4 Ukedager

MAN, TIR, ONS, TOR, FRE, LOR, SON.

## 6. Økten — fra plan til gjennomført

### 6.1 Planstatus (hele planen, coach ↔ spiller)

| Kode | Navn | Betyr |
|---|---|---|
| DRAFT | Utkast | Coach jobber, spiller ser ikke |
| PENDING_PLAYER | Venter på spiller | Publisert, spiller må godta |
| ACCEPTED | Godtatt | Spiller har godtatt |
| REJECTED | Avvist | Spiller har avvist |
| ACTIVE | Aktiv | Gjeldende plan |
| PAUSED | Pauset | Midlertidig stoppet |
| ARCHIVED | Arkivert | Ferdig eller erstattet |

### 6.2 Øktstatus

| Kode | Navn | Betyr |
|---|---|---|
| PLANNED | Planlagt | Ligger i planen |
| IN_PROGRESS | Pågår | Startet |
| COMPLETED | Gjennomført | Ferdig |
| CANCELLED | Avlyst | Teller aldri som avvik |
| SKIPPED | Hoppet over | Med årsak: teller ikke. Uten årsak: ekte avvik |

Avvik: en eldre øktmodell har i tillegg ACTIVE, PAUSED og ABANDONED.

### 6.3 Årsak til avbrudd

SYK «Syk» · SKADE «Skade» · REISE «Reise» · VAER «Vær» · ANNET «Annet».

### 6.4 Spillerens selvvurdering etter økt (1–5, tomt er tomt)

| Felt | Spørsmål |
|---|---|
| Fokus | Hvor til stede var du mentalt? |
| Gjennomføring | Hvor godt fikk du gjort det planlagte? |
| Mestring | Fikk du til det du jobbet med? |

### 6.5 Ordene rundt økten (bestemt 12.09.2026)

- **Registrere** = føre data inn i appen. Ikke «logge», ikke «føre».
- **Planlagt, registrert, gjennomført, lagret, delt** beskriver fem ulike ting. Aldri synonymer.
- **Gruppeøkt** = coach eier, felles gjennomføring. **Individuell økt** = spillerens egen.
  Individuelt oppmøte og privat notat er noe annet enn selve økten.
- **Publisere** = coach sender planen til spilleren. **Godta/avvise** = spillerens svar.
- **Ikke delta** = spilleren skjuler en gruppeøkt fra sin plan.

### 6.6 Serie

En økt som gjentas (f.eks. hver mandag). Endring gjelder DENNE, DENNE_OG_FREMOVER eller
HELE_SERIEN.

## 7. Grupper og programmer

### 7.1 Programmer

| Kode | Navn |
|---|---|
| WANG_TOPPIDRETT | WANG Toppidrett |
| WANG_UNG | WANG Ung |
| GFGK_MINI | GFGK Mini |
| GFGK_BREDDE | GFGK Bredde |
| GFGK_JENTER | GFGK Jenter |
| GFGK_ELITE | GFGK Elite |
| AK_ACADEMY | AK Golf Academy |
| AK_ACADEMY_JUNIOR | AK Golf Academy Junior |
| PLATFORM_ONLY | Selvbetjent (ingen coach) |

Offentlig navn er «AK Golf Academy» (bestemt 12.09.2026). Kodene beholdes.

### 7.2 Roller i en gruppe

PLAYER «Spiller» · ASSISTANT «Hjelpetrener» · COACH «Coach». Gruppen har én hovedcoach.

### 7.3 Faste gruppetider

Ukentlig (WEEKLY) eller enkeltstående (NONE). Type: vanlig, SAMLING «Samling»,
HELDAGSSAMLING «Heldagssamling».

## 8. Styrketrening og fysisk trening (FYS)

### 8.1 De tre områdene

STYRKE «Styrke» · KONDISJON «Kondisjon» · BEVEGELIGHET «Bevegelighet» (kapittel 2).
Power og plyometri lagres under STYRKE. Stabilitet og balanse lagres under STYRKE.

### 8.2 FYS-treningstyper (finere merking av en øvelse)

| Kode | Navn | Lagres under |
|---|---|---|
| STYRKE | Styrke | STYRKE |
| KONDISJON | Kondisjon | KONDISJON |
| BEVEGELIGHET | Bevegelighet | BEVEGELIGHET |
| MOBILITET | Mobilitet | Avvik: gammelt navn på Bevegelighet, skal ut |
| AKTIVERING | Aktivering | Oppvarming, Avvik: uten område |

### 8.3 Muskelgrupper

HOFTEFLEKSORER «Hoftefleksorer» · GLUTEUS «Sete» · CORE «Kjerne» · SKULDRE «Skuldre» ·
THORAX «Brystrygg» · HAMSTRINGS «Hamstrings» · UNDERARMER «Underarmer» · RYGG «Rygg» ·
QUADRICEPS «Lår foran».

### 8.4 Det en styrkeøvelse i planen inneholder

| Felt | Navn | Betyr |
|---|---|---|
| sett | Sett | Antall serier |
| repsMin / repsMax | Reps | Repetisjoner per sett, fra–til |
| hvile | Hvile | Sekunder mellom sett |
| belastningPst | % av 1RM | Prosent av maks |
| rir | RIR | Reps igjen i tanken («reps in reserve») |
| muskelgruppe | Muskelgruppe | Fra 8.3 |
| loggSettData | Registrert | Faktisk vekt og reps per sett |

Ordene TPI, RFD og plyometrikk er faglige prinsipper (screening, kraftutvikling framfor
maksløft, spenst). De finnes ikke som data i appen i dag.

### 8.5 Kondisjon

| Del | Verdier |
|---|---|
| Segment | OPPVARMING «Oppvarming» · DRAG «Drag» · HVILE «Hvile» · NEDJOGG «Nedjogg» |
| Sone | SONE_1 Restitusjon (50–60 %) · SONE_2 Lett · SONE_3 Moderat · SONE_4 Hard · SONE_5 Anaerob (90–100 %). Pulssone skrives S1–S5 |
| Aktivitet | GANGE · LOPING «Løping» · SYKKEL · ROING · SVOMMING «Svømming» · SKIERG · INTERVALL · ANNET |

### 8.6 Bevegelighet

STATISK «Statisk» · DYNAMISK «Dynamisk» · PNF «PNF» · MYOFASCIAL «Myofascial».

### 8.7 Intensitet (fysisk anstrengelse)

Skala 1–10 på øvelsen. Dette er noe annet enn Belastning (miljø) og Press (hvem ser på).

### 8.8 FYS-tester (de fem i testbatteriet)

| Kode | Navn | Enhet | Regnes |
|---|---|---|---|
| markloft | Trapbar markløft (1RM) | kg | relativt til kroppsvekt |
| benkpress | Benkpress (1RM) | kg | relativt til kroppsvekt |
| lengde | Stille lengde | cm | |
| ballkast | Ballkast knestående | cm | |
| chs | Clubhead Speed (CHS) | mph | |

Kroppsvekt hentes fra helseregistreringen, ikke som egen test. FYS-indeks (0–100) er
stall-relativ og merket plassholder i skjermen.

### 8.9 Fasiliteter en øvelse kan kreve

RADAR · MAT_NET «Matte/nett» · BUNKER · KAMERA · PUTTING_GREEN_KORT · PUTTING_GREEN_LANG ·
SHORT_GAME_AREA «Nærspillsområde» · DRIVING_RANGE · BANE · SIMULATOR · VEKTSTANG · TRAPBAR ·
LOPEBANE «Løpebane» · MED_BALL «Medisinball».

## 9. Spillerkategori A–K

Beskriver hvor spilleren er. Bestemmer ingenting om hva spilleren får trene. Målt på
**brutto snittscore**, aldri netto. A er best.

| Kategori | Snittscore | Navn |
|---|---|---|
| A | under 68 | World Elite |
| B | 68–72 | National Elite |
| C | 72–74 | National U21 |
| D | 74–76 | Regional Elite |
| E | 76–78 | Regional U18 |
| F | 78–80 | Klubbspiller senior |
| G | 80–85 | Klubbspiller junior |
| H | 85–90 | Rekrutt senior |
| I | 90–95 | Rekrutt junior |
| J | 95–100 | Nybegynner senior |
| K | 100+ | Nybegynner junior |

HCP er en annen måling og skal ikke utledes fra kategori eller omvendt.
Avvik: én gammel kodefil har sju kategorier basert på HCP. Skal ut.

## 10. Tester

31 protokoller i databasen. Spilleren ser 21 rader (20 protokoller, Putt Speed har to
varianter) pluss egne tester. Coach ser alle. Frivillige verktøy, aldri krav.

### 10.1 De 21 spilleren ser

| Golf | Fysisk |
|---|---|
| Driver Basic · Innspill Basis · Innspill 120 m · Innspill 160 m · Innspill Variation · Wedge Variation · 8-ball Variation · Putt 1–3 m · Putt Speed 1×5 · Putt Speed 3×3 · PEI Test Bane | Trapbar Deadlift · Benkpress · Standing Long Jump · Ball Throw · Clubhead Speed (CHS) |
| Team Norway: TN Driver Gate · TN Putt Gate · TN Nærspill Gate · TN Wedge Gate · TN VISA Express | |

### 10.2 Felt på et scorekort

| Felt | Enhet |
|---|---|
| Til hull | m |
| Målavstand | m |
| Carry | m |
| Sideavvik (venstre −, høyre +) | m |
| Hullnummer | |
| Lie | Green · Fairway · Rough · Bunker |
| Hastighet | mph · km/t · m/s, målt på Ball eller Køllehode |

### 10.3 PEI

PEI = nærhet ÷ lengde. Lavere er bedre. Egen motor, blandes aldri med SG.

### 10.4 Aldersnivåer for referanseverdier

U10 · U12 · U14 · U16 · U18 · Senior (alder ved årets slutt).

### 10.5 Synlighet og attestering

Synlig for: PRIVATE «Bare meg» · COACH «Coach» · GROUP «Gruppen» · ACADEMY «Academy».
Vitne: PENDING «Venter» · ATTESTED «Bekreftet» · REJECTED «Avvist».

## 11. Turnering

### 11.1 Påmeldingsstatus

| Kode | Navn | Betyr |
|---|---|---|
| PLANNED | Planlagt | I planen, ikke meldt på |
| CLAIMED_REGISTERED | Påmeldt | Spiller sier påmeldt, venter bekreftelse |
| CONFIRMED | Bekreftet | Bekreftet påmelding |
| WITHDRAWN | Trukket | Trukket før start |
| COMPLETED | Gjennomført | Spilt ferdig |
| DNF | Ikke fullført | Startet, men fullførte ikke |

### 11.2 Prioritet og planlagt nivå

Prioritet: MAJOR «Hovedturnering» · NORMAL «Vanlig» · LOCAL «Lokal».
Planlagt nivå: A · B · C (A viktigst). Forberedelse: konservativ · standard · aggressiv.

### 11.3 Format, status og kilder

Format: STROKE · MATCH · STABLEFORD · OTHER. Status: UPCOMING «Kommende» · IN_PROGRESS
«Pågår» · COMPLETED «Ferdig» · CANCELLED «Avlyst».
Kilder: NGF · GolfBox (Olyo, Østlandstour, GJGT) · DataGolf · manuell. Hentes alltid,
estimeres aldri.

## 12. Runde og slag

### 12.1 Per hull

Par · Slag · Putter · Fairway truffet (FIR) · Green i regulering (GIR).

### 12.2 Slagtyper

DRIVE «Utslag» · APPROACH «Innspill» · CHIP · PITCH · PUTT · BUNKER · RECOVERY «Redning» ·
DROP.

### 12.3 Lie (hvor ballen ligger)

TEE · FAIRWAY · SEMI_ROUGH · ROUGH · DEEP_ROUGH · BUNKER · GREEN · WATER · OOB · TREES.
Vind: STILLE · MEDVIND · MOTVIND · VENSTRE · HOYRE.

### 12.4 Rundetype

turnering · trening. Score alltid brutto.

## 13. Statistikk og Strokes Gained

### 13.1 SG-kategorier

| Kode | Navn på skjerm | Betyr |
|---|---|---|
| OTT | Utslag | Strokes Gained off the tee |
| APP | Innspill | Strokes Gained approach |
| ARG | Nærspill | Strokes Gained around the green |
| PUTT | Putting | Strokes Gained putting |
| — | Total | Sum av de fire |
| — | Tee til green | Total uten putting |

SG skrives med fortegn og komma: +1,2 / −0,4, alltid med referanse og periode.
Avvik: koden har tre ulike navnesett («Off the tee», «Tee-slag», «Utslag»). Velg ett —
forslag: «Utslag», samme ord som treningsområdet.

### 13.2 SG per treningsområde (lagres på runden)

Utslag · Innspill 200/150/100/50 · Chip · Pitch · Lob · Bunker · Putt per bånd.
Avvik: rundens puttebånd er fortsatt den gamle sjudelingen (0–3, 3–5, 5–10, 10–15, 15–25,
25–40, 40+). Kapittel 2 har seks bånd.

### 13.3 Hvor slaget endte (for SG-beregning)

FAIRWAY · ROUGH · GREEN · SAND · RECOVERY · HOLED «I hull».

### 13.4 Referanser

| Navn | Betyr |
|---|---|
| Benchmark | Forventet antall slag fra en posisjon, per kategori |
| PGA Tour-referanse | Broadie «Every Shot Counts» (2014), brukes for utslag, innspill, nærspill |
| Team Norway-referanse | Puttereferanse fra Team Norways IUP-ark |
| DataGolf | Proffdata. Alltid «Powered by Data Golf». Egen motor, blandes aldri med SG eller PEI |
| Forventet slag | Antall slag en referansespiller bruker herfra |
| Estimat | Alt som ikke er målt merkes «estimat» |

Kategori (A–K), plassering og aldersstige brukes aldri som persentil mot en spiller.

### 13.5 Score-ord

Snittscore · Sesongsnitt · Beste runde · Birdie · Eagle · Par · Bogey · Double bogey ·
Triple bogey · Under par · Over par · Brutto (alltid) · Netto (aldri som grunnlag).

### 13.6 Statistikk-ord

Snitt (aldri «gjennomsnitt») · Median · Standardavvik · Spenn · Fordeling · Trendlinje ·
Stigning · Stagnering · Avviker (outlier) · Konsistens · Rullerende snitt · Endring ·
Siste 5 / 10 / 30 dager · Hittil i år · Mot forrige uke/måned/sesong.

### 13.7 Ferdighetsområder i analysen

TEE_TOTAL «Utslag» · TILNAERMING «Innspill» · AROUND_GREEN «Nærspill» · PUTTING «Putting» ·
SPILL «Spill». Kobling: OTT → Utslag, APP → Innspill, ARG → Nærspill, PUTT → Putting.

## 14. TrackMan

**Skriveregel (bestemt 01.09.2026):** parameteren beholder sitt engelske navn med stor
forbokstav, også i norsk tekst. Forklaring på norsk i setningen etter. «TrackMan» i appen,
«Trackman» kun i publikumsvendt merketekst.

**Enhet i appen:** hastighet i **mph**, avstand i **meter**, vinkler i **grader**, spinn i
**rpm**. Importerte yards og m/s regnes om ved innlasting.

### 14.1 Parametere som lagres per slag

| Parameter | Lagres som | Enhet | Betyr |
|---|---|---|---|
| Club Speed | clubSpeed | mph | Køllehodets hastighet i treffet |
| Ball Speed | ballSpeed | mph | Ballens utgangshastighet |
| Smash Factor | smashFactor | — | Ball Speed delt på Club Speed |
| Launch Angle | launchAngle | ° | Ballens utgangsvinkel |
| Spin Rate | spinRate | rpm | Ballens rotasjon |
| Spin Axis | spinAxis | ° | Spinnaksens helning (draw/fade) |
| Carry | carryDistance | m | Flydistanse til første landing |
| Total | totalDistance | m | Total distanse med rull |
| Apex Height | apexHeight | m | Høyeste punkt i ballbanen |
| Landing Angle | landAngle | ° | Ballens vinkel ved landing |
| Side | side | m | Avstand fra mållinjen ved landing. Venstre −, høyre + |
| Attack Angle | attackAngle | ° | Køllehodet opp eller ned i treffet |
| Club Path | clubPath | ° | Køllebanens retning gjennom treffet |
| Face Angle | faceAngle | ° | Køllebladets vinkel mot mållinjen |
| Face to Path | faceToPath | ° | Face Angle minus Club Path. Forklarer kurven |
| Dynamic Loft | dynamicLoft | ° | Faktisk loft i treffet |
| Strike (toe–heel) | strikePatternX | −1..1 | Treffpunkt sidelengs på bladet |
| Strike (low–high) | strikePatternY | −1..1 | Treffpunkt høyde på bladet |

### 14.2 Parametere som finnes i rapporter, men ikke lagres per slag

| Parameter | Hvor | Betyr |
|---|---|---|
| Swing Direction | HTML-rapport | Svingretning |
| Low Point | HTML-rapport | Laveste punkt i svingbuen, f.eks. «8.6A» (A = etter ball, B = før) |
| Launch Direction | HTML-rapport | Ballens startretning |
| Dispersion | Beregnet | Spredning over mange slag (1σ). Ikke samme som Side, som er ett slag |
| Tempo | CSV | Tilbakesving delt på nedsving, ideal 3:1 |

Dette lukker feltkontrollen i avklaring A05: Total = Total Distance, Landing Angle = Land
Angle, Apex = Apex Height. Dispersion og Side er to ulike ting.

### 14.3 Det spilleren ser i dag

Slagliste: Carry (m), Side (± m), Smash, Launch (°). Øktkort: Carry, Offline, 1σ, Smash.

### 14.4 Målested

SIMULATOR_INDOOR «Simulator (innendørs)» · NET_INDOOR «Nett innendørs» · RANGE_OUTDOOR_MAT
«Driving range (matte)» · RANGE_OUTDOOR_GRASS «Driving range (gress)» · COURSE_PRACTICE
«Bane (øving)» · COURSE_COMPETITION «Bane (konkurranse)».

### 14.5 Hastighetsklasse på et slag

DRY «Uten ball» · LAV «Lav fart» · FULL «Full fart». Målt mot spillerens egen maks.

### 14.6 Analyser appen lager av TrackMan-data

| Kode | Navn | Betyr |
|---|---|---|
| DISTANCE_GAPPING | Avstandshull | For små eller store hull mellom køllene |
| CONSISTENCY_LEAK | Spredning | Ustabil Smash Factor eller lengde på én kølle |
| TRAINING_GAP | Treningshull | Område som ikke er trent på lenge |
| D_PLANE_DRIFT | Retningsdrift | Club Path og Face Angle flytter seg over uker |
| STRIKE_QUALITY | Treffkvalitet | Smash Factor og treffpunkt |
| FATIGUE_PATTERN | Tretthet | Club Speed faller utover økten |
| EQUIPMENT_FIT | Utstyr | Køller med store avvik |
| TEMPO_VARIANCE | Ustabilt tempo | Rytmen varierer |
| PROGRESSION_TREND | Fremgang | Kølle forbedres over 12 uker |
| SAME_DISTANCE_OPPORTUNITY | Køllevalg | Bedre kølle på samme avstand |

Ballflukt fra Face og Path: PULL_HOOK · PULL_FADE · PUSH_DRAW · PUSH_FADE · STRAIGHT.

### 14.7 Mål på TrackMan-parametere

Måltype: PRIMARY · SECONDARY · CAUSAL · HIT_RATE. Regel: ROLLING_WINDOW «rullerende» ·
BEST_OF_N «beste av N» · STREAK «på rad» · SESSION_GATE «per økt». Sammenligning: mindre enn
· større enn · innenfor · lik. Status: OPPNAADD «Oppnådd» · PAA_VEI_KT «På vei» ·
IKKE_BEGYNT «Ikke begynt».

## 15. P-posisjoner (MORAD, teknisk språk)

Beskrivende språk til teknisk plan og videoanalyse. Ikke krav. Aldri i markedstekst.

| Posisjon | Navn |
|---|---|
| P1.0 | Address |
| P2.0 | Skaft parallelt tilbake |
| P3.0 | Venstre arm parallell tilbake |
| P4.0 | Topp |
| P5.0 | Venstre arm parallell ned |
| P6.0 | Skaft parallelt ned |
| P7.0 | Impact |
| P8.0 | Skaft parallelt gjennom |
| P9.0 | Høyre arm parallell gjennom |
| P10.0 | Finish |

Teknisk oppgave: PENDING «Venter» · ACTIVE «Aktiv» · DONE «Ferdig» · ARCHIVED «Arkivert».
Spor: PAA_VEI «På vei» · STAGNERER · FERDIG · INAKTIV · AVSLAATT.
Oppgavetype: TEKNISK · TAKTISK · MENTALT · SOSIALT.

## 16. Tall og enheter (skriveregler)

| Innhold | Slik skrives det |
|---|---|
| Desimal | komma: 72,4 |
| Tusen | mellomrom: 1 247 |
| Prosent | 73 % |
| Tid | kl. 09:00 · 60 min · 1 t 30 min |
| Tall og enhet | 150 m · 104 mph · 5 sett |
| Dato | 19. mai 2026 |
| SG | +1,2 / −0,4 |
| Putting | fot |
| Andre avstander | meter |
| Mangler verdi | — med forklaring, aldri 0 |
| Ekte null | 0 er et resultat, ikke «mangler» |

## 17. Utgått — skal aldri brukes i noe nytt

| Utgått | Erstattet av |
|---|---|
| L-faser (L_KROPP, L_ARM, L_KOLLE, L_BALL, L_AUTO) | Motorikk (3 steg) |
| CS-nivåer som skala (CS20–CS100) | Ingenting. Club Speed er en måling, ikke et nivå |
| M0–M5 | Belastning |
| PR1–PR5 | Press |
| Press-navnene FRI/KRAV/UTFORDRING | Alene/Observert/Konkurranse/Turnering |
| 17-områdelisten, sju puttebånd, putting i meter | Kapittel 2 |
| Spillerkategori A–L (12) og HCP-basert 7-liste | Kapittel 9 |
| MOBILITET | BEVEGELIGHET |
| Prosentkrav per periode, CS-tak, volumtak, hviledagskrav, «invariantbrudd» | Ingenting. Fri planlegging |
| CANON som overstyrende begrep | Ingenting. «Canon»-tester betyr bare standardtestene |
| Bompa-periodene (GRUNNTRENING/OPPBYGGING/OVERGANG/HVILE) i AI-teksten | Kapittel 4.1 |
| LIFE-koder, AK-stigen og Voksen-modellen som data | Tatt ut av fasiten 19.08.2026 |
| ELITE som app-nivå | Finnes ikke. GFGK Elite er et gruppenavn |
| «Drill», «logge», «føre» på skjerm | Øvelse, registrere |

## 18. Hva dette dokumentet erstatter (ved godkjenning)

- `docs/FASIT-AK-GOLF-HQ.md` — innholdet er tatt inn her uendret.
- `docs/ORDBOK-TRENINGSPLANLEGGING-2026-09-08.md` — tatt inn her.
- `docs/vokabular-planlegging-2026-08-18.md` — utgått.
- `docs/ordbok-ak-golf-konsept.md` del A §1–§16 — tatt inn eller utgått. Del B (staving av
  vanlige appord) flyttes til språkdokumentet i `docs/skjermtekst/`.
- `docs/design-guide-terminologi.md` §2 (tall og enheter) — tatt inn i kapittel 16.
- `docs/ordbok.json` — genereres på nytt fra dette dokumentet.

## 19. Avklaringer Anders må ta (svar med nummer)

1. **Periodeliste.** Skal EVALUERING inn i årsplanens periodetype, slik at koden får alle
   åtte fra kapittel 4.1? Anbefaling: ja.
2. **SG-navn.** «Utslag», «Tee-slag» eller «Off the tee» for OTT på skjerm? Anbefaling:
   Utslag, samme ord som treningsområdet.
3. **Puttebånd på runden.** Skal rundens SG-puttebånd rettes til de seks fra kapittel 2?
   Anbefaling: ja, ved neste datamigrering.
4. **AK-formelen på økt eller øvelse (A06).** Anbefaling: på øvelsen. Økten viser summen.
5. **Motorikk utenfor fullsving.** Nærspill og putting har ikke motorikk i dag. Riktig?
6. **Sjekkpunkt og Helse** som blokk-typer i kalenderen: bygge, eller stryke fra listen?
7. **AKTIVERING** som FYS-type: beholde som oppvarming, eller stryke?
8. **Uketyper (4.4)** fra WANG-årshjulet: skal de bli data i appen, eller kun tekst?
9. **Vinderetning og lie** på slag: brukes disse i dag? Hvis ikke, stryke fra masteren.
10. **DNF**: «Ikke fullført» (fasit) eller «Startet, men trakk» (ordbok 08.09)?
