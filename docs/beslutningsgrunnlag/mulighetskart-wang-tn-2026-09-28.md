# Mulighetskart — WANG Toppidrett og Team Norway (28.09.2026)

Fase 3 av [grillingen runde 9](grillingen-runde9-wang-tn-2026-09-28.md). Samme oppsett som
[mulighetskartet for runde 8](https://github.com/akgolfsoftware/Golf_Headquarters/pull/988).

- **MÅLT** = funnet i koden 28.09 (søk på navn; «0 kallere» = ingen bruk utenom definisjon og
  tester). Ikke kjørt mot databasen.
- **Verdi, innsats og mål** er Claudes VURDERING.
- Mål: **500k** = 500 000 USD netto per år · **AI** = AI Coach · **Produkt** = fra timer til
  produkt og IP.
- Innsats: **lav** = koble eksisterende kode til en skjerm eller knapp · **middels** = ny flyt
  eller ny beregning oppå det som finnes · **høy** = ny grunnmur.
- Område = nummeret i grillingsfila (1 IUP · 2 Testbatteri · 3 Deling · 4 WANG · 5 Team Norway ·
  6 Spillerens side).

## A. Høy verdi, lav innsats — koden er skrevet, bare ikke koblet

| # | Mulighet | Hva den gjør i praksis | Finnes (MÅLT) | Mangler | Område | Mål |
|---|---|---|---|---|---|---|
| W1 | Samtykkedekning for sportssjef | «9 av 11 elever har delt med WANG, 2 mangler forelders ja» | `beregnDekningsgrad` (`src/lib/domain/deling/dekningsgrad.ts:36`, 0 kallere) | Visning i Administrasjon og TN-tilgang | 3, 4, 5 | Produkt |
| W2 | Fysiske tester etter 6-årsløpet | Benkpress, trapbar markløft, lengdehopp, rotasjonskast og Club Speed føres i samme batteri | Alle fem i `prisma/seed-data/ngf-test-battery.json` med normer | Tegningene bruker TNs gamle protokoller | 2 | Produkt |
| W3 | TN-testene inn i PlayerHQ | TN-scorekortet lagrer i spillerens testlager | `saveTnTest` og `tn-catalog.ts` er i bruk | Vises i Stats → Tester og i WANG/TN-profilen | 2, 5 | Produkt |
| W4 | Turneringer i elevprofilen | Brutto, plassering og SG fra pipelines i WANG og TN | `public_player_entries` er ekte data, brukt i PlayerHQ | Samme datamodul inn i `/team-wang` og TN-profil | 4, 5 | Produkt |
| W5 | Forslag fra WANG og TN | Treneren foreslår, spilleren godtar i innboksen | Forslagsflyten i PlayerHQ (runde 8) | Avsender «WANG · navn» / «Team Norway · navn»; ingen WANG/TN-kobling i dag | 3, 6 | Produkt |

## B. Høy verdi, middels eller høy innsats

| # | Mulighet | Hva den gjør i praksis | Finnes (MÅLT) | Mangler | Område | Mål |
|---|---|---|---|---|---|---|
| W6 | Delingslenke med domenesjekk | Spilleren sender lenke; den virker bare for @wang.no og @golfforbundet.no | Bare plassholdertekst i `tn-tilgang-handlinger.tsx:104` | Lenke, domenesjekk, forelders ja under 16 | 3, 6 | 500k (WANG-elever kjøper PlayerHQ) |
| W7 | «Opprett PlayerHQ»-invitasjon fra WANG/TN | Trener inviterer elev uten konto | Ikke funnet | Hele flyten | 3 | 500k |
| W8 | Fireukerssjekk | Kort sjekk i I dag; treneren ser svarene og tar samtale | IUP-samtale i WANG (`GroupPeriodGoal`, `lagreIupSamtale`) | Sjekken i PlayerHQ og visning for trener | 1, 4 | Produkt, AI |
| W9 | Utviklingssjekken (Ung, Junior, Amatør, Pro) | Samme spørsmål som TN-arket, for alle AK-spillere | Ikke funnet | Spørsmål, lagring, visning | 1 | Produkt |
| W10 | Samlet IUP for trenere | Fanen «IUP» i Spiller 360, WANG og TN i arkets rekkefølge | Delene finnes spredt i PlayerHQ | Samlevisningen | 1, 4, 5 | Produkt |
| W11 | Landslagsnivå per klasse | TN-spillere ser nivået for Gutter U18, Jenter U18, Damer, Herrer ved siden av A–K | Normene sier selv «settes i v2» — ikke laget | Tallene fra Team Norway og visning | 2, 5 | Produkt |
| W12 | Kartleggingsskjerm for TN | Alle WANG-skolenes testdata: hvem som har levert, alle resultater | Testlageret er felles | Skjerm og automatisk deling WANG → TN | 5 | Produkt, lisens til NGF |
| W13 | Kjønn i TN-ranglisten | Filter på gutter og jenter | `hentTnRangliste` er ekte, men spillerprofilen mangler kjønn | Felt i profilen | 5 | Produkt |

## C. Må gjøres uansett — personvern og riktighet (ikke valgfritt)

| # | Funn (MÅLT) | Hvorfor |
|---|---|---|
| WC1 | WANG-tilgang sjekker bare gruppemedlemskap, aldri samtykke (`wang-tilgang.ts:31,60`) | Trener ser elevdata uten at eleven har delt; mindreårige |
| WC2 | TN-tilgang sjekker bare gruppe og rolle (`hentTnSpillerTilgang`, `tn-arbeidsflate.ts:548`) | Samme som WC1 |
| WC3 | To tilgangsmodeller som ikke snakker sammen: gruppemedlemskap (WANG/TN) og `DelingsSamtykke` (PlayerHQ, forelder) | «Trekk tilgangen, coachen forsvinner» virker ikke før de er én |
| WC4 | WANG-kalenderen blander demo-økter med ekte data (`live-sesong.ts:415`) uten merking | Ser ekte ut, er det ikke |

## D. Lav verdi nå

| # | Mulighet | Finnes (MÅLT) | Hvorfor vente |
|---|---|---|---|
| WD1 | Treningssamlinger som egen blokk | `createTrainingCamp` (0 kallere); TN leser ikke lenger `TrainingCamp` | Samme som B7 i runde 8; TN-samlinger har egen modell |

## Anbefaling

1. **C først (WC1–WC3):** samme kodeoppgave som område 3. Uten den er delingssiden pynt.
2. **Tegn inn A (W1–W5) og W6, W8, W10, W12** i bestillingene til WANG `6cfa623c`, Team Norway
   `bc3e41fc` og Precision `7d7c2994`. Det er de som gjør at WANG og TN ser spilleren komplett.
3. **Vent med W7, W9, W11 og W13** til delingen virker. W11 krever tall fra Team Norway.
