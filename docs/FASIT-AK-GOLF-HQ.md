# FASIT — AK Golf HQ

**Status: GJELDENDE FASIT.** Redigert og levert av Anders 19.08.2026 (via Google Doc).
Appen, Masterbrain og ak-second-brain rettes etter denne. Ingenting under er en regel eller
et krav — spilleren og coachen planlegger fritt (bestemt 18.08.2026).

Endringer Anders gjorde i redigeringen (bevisste valg, ikke mangler):
- Spillerkategorier er **A–K (11 nivåer)** — L er fjernet.
- Koden for utslag er **TEE_TOTAL**.
- Periodenavnene er **GRUNNPERIODE** og **TURNERINGSPERIODE** (fulle navn).
- AK-stigen, Voksen-modellen, LIFE-kodene og datastruktur-seksjonen er tatt UT av fasiten.

---

## Spillerkategorier

A–K, 11 nivåer. A er best (elite). Målt på snittscore (brutto, aldri netto).

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

## Pyramiden

Nedenfra og opp. Visningsrekkefølge, ikke viktighets-hierarki.

| Kode | Navn | Dekker |
|---|---|---|
| FYS | Fysisk | Styrke, kondisjon, mobilitet, hurtighet |
| TEK | Teknisk | Teknisk arbeid |
| SLAG | Golfslag | Fokus på å slå spesifikke golfslag |
| SPILL | Spill | Banespill, strategi, scoring |
| TURN | Turnering | Konkurranse og turneringsforberedelse |

## Treningsområder

Putteavstander i fot, resten i meter.

| Kode | Navn |
|---|---|
| TEE_TOTAL | Utslag |
| INNSPILL_50 | Innspill ~50 m |
| INNSPILL_100 | Innspill ~100 m |
| INNSPILL_150 | Innspill ~150 m |
| INNSPILL_200 | Innspill ~200 m |
| CHIP | Chip |
| PITCH | Pitch |
| LOB | Lob |
| BUNKER | Bunker |
| PUTT_0_3 | Putt 0–3 fot |
| PUTT_3_5 | Putt 3–5 fot |
| PUTT_5_10 | Putt 5–10 fot |
| PUTT_10_40 | Putt 10–40 fot |
| PUTT_40_PLUSS | Putt 40+ fot |
| STYRKE | Styrke (fysisk) |
| MOBILITET | Mobilitet (fysisk) |
| BANE | Banespill |

Merk: koden har fortsatt en eldre 17-liste (egen INNSPILL_0_50, putt i sju bånd).
Denne tabellen vinner — koden oppdateres til den.

## AK-formelen

Merkelappen på en økt — beskriver hva økten er, aldri et krav.

```
PYRAMIDE_OMRÅDE_MOTORIKK_BELASTNING_PRESS
```

Eksempel: `TEK_CHIP_LAV_HAST_TRENINGSOMRÅDE_ALENE`

**Motorikk (læringssteg):**

| Kode | Navn |
|---|---|
| UTEN_BALL | Uten ball |
| LAV_HAST | Lav hastighet |
| AUTO | Automatikk |

**Belastning (miljø):**

| Kode | Navn |
|---|---|
| INNENDØRS | Innendørs |
| TRENINGSOMRÅDE | Treningsområde |
| BANE | Bane |
| KONKURRANSE | Konkurranse |

**Press (hvem som ser på):**

| Kode | Navn |
|---|---|
| ALENE | Alene |
| OBSERVERT | Observert |
| KONKURRANSE | Konkurranse |
| TURNERING | Turnering |

**Utgått — skal aldri brukes i noe nytt:**

| Utgått | Erstattet av |
|---|---|
| L-fasene (KROPP/ARM/KØLLE/BALL/AUTO) | Motorikk (3 steg) |
| CS-nivåer (CS20–CS100) | Ingenting — uavklart, ute av bruk |
| M0–M5 | Belastning |
| PR1–PR5 | Press |

## Periodisering

Merkelapper på kalenderen — begrenser ikke hva som kan planlegges.

| Kode | Typisk innhold (veiledende) |
|---|---|
| GRUNNPERIODE | Fundament, fysisk og teknisk byggearbeid |
| SPESIALISERING | Slag og spissing mot sesong |
| TURNERINGSPERIODE | Konkurranse og vedlikehold |
| EVALUERING | Testing, analyse, planlegging av neste år |
| TESTUKE | Samlet testgjennomføring |
| FERIE | Fri |
| TRENINGSSAMLING | Samling (dagsformat) |
| HELDAGSSAMLING | Samling (heldagsformat) |

4-ukers rytme (valgfritt mønster, ikke regel): BYGG → BYGG → TOPP → DELOAD

## Treningsblokk-merker

Lagt til 20.08.2026 (Anders, spec-intervjuet treningsplanlegging). Merker for strekninger
mellom holdepunkter — typisk ukene mellom to turneringer. Frie merkelapper, aldri krav.

| Merke | Typisk fokus (veiledende) |
|---|---|
| UTVIKLING | Utviklingsarbeid — tekniske oppgaver, volum |
| FORBEREDELSER | Spissing mot kommende turnering |
| KONKURRANSE | Turneringsspill |

Settes i kalenderen med **fritt datospenn** — ikke låst til kalenderuker. Eksempel: torsdag
20.08 til fredag 28.08 merkes UTVIKLING; strekningen kan deles opp (f.eks. 4 dager
FORBEREDELSER, deretter KONKURRANSE). Fokusområdene skifter med merket — hva det øves på er
forskjellig i de tre.

## Turneringer

**Påmeldingsstatus:**

| Status | Navn |
|---|---|
| PLANNED | Planlagt |
| CLAIMED_REGISTERED | Påmeldt |
| CONFIRMED | Bekreftet |
| WITHDRAWN | Trukket |
| COMPLETED | Gjennomført |
| DNF | Ikke fullført |

**Forberedelsesvariant:** konservativ · standard · aggressiv

**Datakilder:** NGF · GolfBox-scraper (Olyo, Østlandstour, GJGT). Hentes alltid, estimeres aldri.

## Blokk-typer i kalenderen

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

## Grupper og programmer

**Programmer:**

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
| Platform only |

## Tester

31 testprotokoller i databasen. Spilleren ser 21 CANON-rader + egne tester.
Frivillige verktøy — aldri et krav for å trene noe.

Mangler: liste over hvilke 21 av 31 spilleren ser, og hvorfor 10 er skjult.

## P-posisjoner (MORAD)

Beskrivende teknisk språk — ikke krav til spilleren.

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

Faste kjennetegn (fagkunnskap, ikke krav): venstre albue rett frem til P8 · release via
sentrifugalkraft, ikke bevisst innsats · hoftene leder nedsvingen P6–P8 · venstre hæl i
bakken gjennom alle posisjoner.
