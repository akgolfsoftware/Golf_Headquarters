# Ordbok — treningsplanlegging i AK Golf HQ

**Laget:** 08.09.2026. **Dette er nå den nyeste og eneste ordforråds-fasiten** for hvordan
trening merkes og planlegges i plattformen — den erstatter `vokabular-planlegging-2026-08-18.md`
og §4 i `ordbok-ak-golf-konsept.md`, som viste seg utdatert (se `AUDIT-DOCS-2026-09-08.md`).

Kilde: `docs/FASIT-AK-GOLF-HQ.md` (levert av deg 19.08.2026, rettet 20.08.2026) + verifisert
direkte mot `prisma/schema.prisma` og `src/lib/domain/ak-formel-v2.ts` i dag. Der noe var
uklart eller motstridende, står det markert under.

**Grunnprinsippet, uforandret siden 18.08.2026: ingenting her er en regel eller et krav.**
Det er ordforrådet plattformen bruker for å merke og organisere planlegging — ikke tak, ikke
minimumskrav, ikke noe som stopper deg eller spilleren fra å planlegge fritt.

---

## 1. Pyramiden — de fem treningsområdene

Grunnmuren. Rekkefølgen (FYS nederst, TURN øverst) er en visningsrekkefølge — ikke et
viktighets-hierarki, og ingen prosentgrenser håndheves lenger.

| Kode | Navn | Dekker |
|---|---|---|
| FYS | Fysisk | Styrke, kondisjon, mobilitet, hurtighet |
| TEK | Teknisk | Teknisk svingarbeid |
| SLAG | Golfslag | Fokus på å slå spesifikke golfslag |
| SPILL | Spill | Banespill, strategi, scoring |
| TURN | Turnering | Konkurranse og turneringsforberedelse |

## 2. Treningsområder — hvor på banen/anlegget (19 stk)

**Rettet av deg 20.08.2026:** putt ble seks bånd (var fem — 10–40 fot delt i to), og FYS ble
tre områder (var to — kondisjon lagt til, mobilitet omdøpt bevegelighet). Antallet er **19**,
ikke 17 — det gamle tallet er historisk og skal ikke siteres lenger.

Putteavstander i fot, resten i meter.

| Kode | Navn | Familie | Enhet | Hva en rep er |
|---|---|---|---|---|
| TEE_TOTAL | Utslag | Fullsving | m | Slag |
| INNSPILL_200 | Innspill ~200 m | Fullsving | m | Slag |
| INNSPILL_150 | Innspill ~150 m | Fullsving | m | Slag |
| INNSPILL_100 | Innspill ~100 m | Fullsving | m | Slag |
| INNSPILL_50 | Innspill ~50 m | Fullsving | m | Slag |
| CHIP | Chip | Nærspill | m | Slag |
| PITCH | Pitch | Nærspill | m | Slag |
| LOB | Lob | Nærspill | m | Slag |
| BUNKER | Bunker | Bunker | m | Slag |
| PUTT_0_3 | Putt 0–3 fot | Putt | ft | Putter |
| PUTT_3_5 | Putt 3–5 fot | Putt | ft | Putter |
| PUTT_5_10 | Putt 5–10 fot | Putt | ft | Putter |
| PUTT_10_25 | Putt 10–25 fot | Putt | ft | Putter |
| PUTT_25_40 | Putt 25–40 fot | Putt | ft | Putter |
| PUTT_40_PLUSS | Putt 40+ fot | Putt | ft | Putter |
| STYRKE | Styrke | FYS | — | Serier/reps |
| KONDISJON | Kondisjon | FYS | — | Segmenter (f.eks. «5 drag á 4 min i sone 4», ikke ett varighetstall) |
| BEVEGELIGHET | Bevegelighet | FYS | — | Tid (enkel timer, ingen segmenter) |
| BANE | Banespill | Bane | — | Hull |

Området er uavhengig av pyramiden — en BANE-drill kan stå under TEK, SLAG, SPILL eller TURN.
«Familie» styrer kun hvilke felter området har (relevans-matrise), ikke pyramide-tilhørighet.

**Kjent, ikke rettet:** en eldre 16–17-liste (`src/lib/taxonomy.ts`) driver fortsatt deler av
eksisterende UI med andre koder (`TEE`, `INN200`, `PUTT0_3` i andre grenser). Denne tabellen
er fasiten — den gamle listen skal fases ut, ikke siteres som gjeldende.

## 3. AK-formelen — merkelappen på en økt/drill

```
PYRAMIDE_OMRÅDE_MOTORIKK_BELASTNING_PRESS
```

Eksempel: `TEK_CHIP_LAV_HAST_TRENINGSOMRÅDE_ALENE`

Bæres av hver enkelt drill/øvelse/test — ikke av økten som helhet.

### 3.1 Motorikk (læringssteg — gjelder KUN fullsving)

| Kode | Navn |
|---|---|
| UTEN_BALL | Uten ball |
| LAV_HAST | Lav hastighet |
| AUTO | Automatikk |

*Club Speed-unntak (01.09.2026): Club Speed-trening klassifiseres alltid AUTO. «Uten ball» der
er en egenskap ved øvelsen (hastighetstrening med stav/kølle), ikke motorikk-steget UTEN_BALL —
ikke bland disse to.*

### 3.2 Belastning (miljøet treningen skjer i — ny akse i v2, fantes ikke i v1)

| Kode | Navn |
|---|---|
| INNENDØRS | Innendørs |
| TRENINGSOMRÅDE | Treningsområde |
| BANE | Bane |
| KONKURRANSE | Konkurranse |

### 3.3 Press (hvem som ser på)

| Kode | Navn |
|---|---|
| ALENE | Alene |
| OBSERVERT | Observert |
| KONKURRANSE | Konkurranse |
| TURNERING | Turnering |

### 3.4 Egne teknikk-dimensjoner (analysens sjette akse — erstatter/supplerer motorikk)

Lagt til 20.08.2026. En drill bærer kun ÉN av disse. Fullsving-kodene matcher TrackMan-
parametrene 1:1 (Truth Layer-kobling uten oversettelseslag): startretning = Launch Direction,
kurve = Spin Axis, høyde = Apex, treffpunkt = Face-to-Path.

SIKTE · STARTRETNING · KURVE · HØYDE · TREFFPUNKT · LENGDEKONTROLL · SPINN · LANDINGSPUNKT ·
UTRULLING · KØLLEVALG · BOUNCE_BRUK · SANDINNGANG · LIE_VARIASJON · GREENLESING · BALLSTART ·
SPILLEFORMAT · STRATEGIOPPGAVE

**Sand-trappen** (bunkerens motstykke til motorikk): UTEN_BALL_I_SAND → MED_BALL.

### 3.5 Utgått — skal ALDRI brukes i noe nytt

| Utgått | Erstattet av |
|---|---|
| L-fasene (KROPP/ARM/KØLLE/BALL/AUTO) | Motorikk (3 steg, §3.1) |
| CS-nivåer (CS50–CS100) | Ingenting — uavklart, ute av bruk. Spør deg før noe nytt bruker CS. |
| M0–M5 | Belastning (§3.2) |
| PR1–PR5 | Press (§3.3) |

Disse fire ligger fortsatt i databasen som **historiske lesefelter** (gamle rader har dem) —
koden er eksplisitt merket «bruk aldri i ny kode».

## 4. Periodisering — årets rytme

Merkelapper på kalenderen — begrenser ikke hva som kan planlegges i dem.

| Kode | Typisk innhold (veiledende, ikke krav) |
|---|---|
| GRUNNPERIODE | Fundament, fysisk og teknisk byggearbeid |
| SPESIALISERING | Slag og spissing mot sesong |
| TURNERINGSPERIODE | Konkurranse og vedlikehold |
| EVALUERING | Testing, analyse, planlegging av neste år |
| TESTUKE | Samlet testgjennomføring |
| FERIE | Fri |
| TRENINGSSAMLING | Samling (dagsformat) |
| HELDAGSSAMLING | Samling (heldagsformat) |

4-ukers rytme (valgfritt mønster, ikke regel): BYGG → BYGG → TOPP → DELOAD.

**Merk:** periodenavnene er de FULLE ordene (GRUNNPERIODE, TURNERINGSPERIODE) — ikke GRUNN/
TURNERING som en tidligere versjon av dokumentet sa.

## 5. Treningsblokk-merker (nye 20.08.2026)

Merker for **strekninger** mellom holdepunkter — typisk ukene mellom to turneringer. Frie
merkelapper, aldri krav. Settes i kalenderen med fritt datospenn, ikke låst til kalenderuker
— en strekning kan deles opp (f.eks. 4 dager FORBEREDELSER, deretter KONKURRANSE).

| Merke | Typisk fokus (veiledende) |
|---|---|
| UTVIKLING | Utviklingsarbeid — tekniske oppgaver, volum |
| FORBEREDELSER | Spissing mot kommende turnering |
| KONKURRANSE | Turneringsspill |

## 6. Turneringer

**Påmeldingsstatus:**

| Kode | Navn |
|---|---|
| PLANNED | Planlagt |
| CLAIMED_REGISTERED | Påmeldt (venter dobbel bekreftelse) |
| CONFIRMED | Bekreftet |
| WITHDRAWN | Trukket |
| COMPLETED | Gjennomført |
| DNF | Startet, men trakk |

**Forberedelsesvariant:** konservativ · standard · aggressiv.

**Datakilder:** NGF · GolfBox-scraper (Olyo, Østlandstour, GJGT). Hentes alltid, estimeres
aldri.

## 7. Blokk-typer i kalenderen

| Type | Merknad |
|---|---|
| Økt | Treningsøkt |
| Skole | Vises dimmet og låst |
| Booking | Coachtime/fasilitet, fra booking-systemet |
| Turnering | Turneringsdeltakelse |
| Reise | Reisetid |
| Test | Testgjennomføring |
| Sjekkpunkt | Avtale/merkedag |
| Helse | Helse/restitusjon |
| Gruppeøkt | Fellesøkt, coach eier |

## 8. Spillerkategori — hvor spilleren er

**⚠ Uavklart mellom fasit og kode akkurat nå (funnet 08.09.2026, se AUDIT-DOCS-2026-09-08.md):**

- `FASIT-AK-GOLF-HQ.md` (din redigering 19.08): **A–K, 11 nivåer** — du fjernet L bevisst.
- Koden (`NgfKategori`-enum i skjemaet, brukes til nivådifferensiering av drills/plan-maler):
  fortsatt **A–L, 12 nivåer** — ikke rettet ennå.

Fasitens 11-nivå-tabell (målt på brutto snittscore, aldri netto):

| Kategori | Snittscore |
|---|---|
| A | under 68 |
| B | 68–72 |
| C | 72–74 |
| D | 74–76 |
| E | 76–78 |
| F | 78–80 |
| G | 80–85 |
| H | 85–90 |
| I | 90–95 |
| J | 95–100 |
| K | 100+ |

Kategorien beskriver kun hvor spilleren er — den bestemmer ingenting om hva spilleren får trene.
**Bruk denne 11-nivå-tabellen som riktig inntil du har avgjort om koden skal rettes til A–K
eller fasiten tilbake til A–L.**

## 9. Grupper og programmer

| Program |
|---|
| WANG Toppidrett |
| WANG Ung |
| GFGK Mini |
| GFGK Bredde |
| GFGK Jenter |
| GFGK Elite |
| AK Academy |
| AK Academy Junior |
| Platform only (selvbetjent, ingen coachrelasjon) |

**AK-stigen (juniorutvikling, implementert i kode):** Mini (under 10) → Basis (10–12) →
Utvikling (13–15) → Elite (16–19).

**Voksen-modellen «Veien til lavere score» (kun beskrivende, ikke funnet i kode/data ennå):**
Nybegynner → D (120–110) → C (100–90) → B (90–80) → A (80–70).

## 10. Tester

31 testprotokoller i databasen. Spilleren ser 21 CANON-rader + egne tester. Frivillige
verktøy — aldri et krav for å trene noe.

**Åpent hull, ikke noe du trenger å gjøre noe med nå:** hvilke 21 av 31 spilleren faktisk ser,
og hvorfor de resterende 10 er skjult, står uspesifisert selv i fasit-dokumentet.

## 11. P-posisjoner (MORAD — teknisk språk)

Beskrivende språk til teknisk plan og videoanalyse — ikke krav til spilleren.

P1.0 Address → P2.0 Skaft parallelt tilbake → P3.0 Venstre arm parallell tilbake →
P4.0 Topp → P5.0 Venstre arm parallell ned → P6.0 Skaft parallelt ned → P7.0 Impact →
P8.0 Skaft parallelt gjennom → P9.0 Høyre arm parallell gjennom → P10.0 Finish

Faste kjennetegn (fagkunnskap, ikke krav): venstre albue rett frem til P8 · release via
sentrifugalkraft, ikke bevisst innsats · hoftene leder nedsvingen P6–P8 · venstre hæl i
bakken gjennom alle posisjoner.

## 12. LIFE-koder (mennesket i treningen)

**Kun beskrivende — null treff i kode per 08.09.2026, ikke implementert som data noe sted.**

LIFE-SELV (selvfølelse) · LIFE-SOS (sosialt) · LIFE-EMO (emosjonelt) · LIFE-KAR (karakter) ·
LIFE-RES (resiliens)

---

## Det som IKKE lenger finnes (opplåst 18.08.2026 — gjenta aldri uten ny beslutning fra deg)

- De 9 invariantene (TEK-minimum, CS-tak, aldersregel, L-fase-begrensninger, volum-tak,
  pyramide-maks, hviledager, svingendrings-tak, CS50-krav)
- PERIODE_CONSTRAINTS (min/maks-prosenter per periode, ukevolum-grenser, praksistype-fordeling)
- Plan-validering av AI-forslag mot regler, «Invariantbrudd»-varsler, «Overstyr med
  begrunnelse»-mekanikken
- CANON som overstyrende fasit-begrep

Spilleren og coachen planlegger fritt. Systemets jobb er å gjøre planlegging enkel og
oversiktlig — ikke å vokte den.

---

## Utenfor dette dokumentet

Dette dekker **planleggings-vokabularet** — det plattformen faktisk bruker til å merke og
organisere trening. To ting er bevisst holdt utenfor, fordi de er noe annet:

- **Dyp MORAD-fagkunnskap** (svingfeil, drill-bibliotek, diagnostiske regler) ligger i
  `~/Developer/ak-second-brain/wiki/concepts/morad-*` — coaching-metodikk, ikke planleggings-taksonomi.
- **AI-lagets kunnskapsbase** (`src/lib/masterbrain/knowledge/concepts/`: canon-methodology,
  LTAD-rammeverk, SG-prinsipper m.fl.) er det Caddie/AI-agentene faktisk leser — egen kilde,
  egen oppdateringssyklus.

Si ifra hvis du vil ha disse to også kartlagt i eget dokument — det er en annen jobb enn denne.
