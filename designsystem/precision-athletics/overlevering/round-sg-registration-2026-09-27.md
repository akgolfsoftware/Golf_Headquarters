# Runde-registrering for Strokes Gained — 27.09.2026

Designendring i AK Golf Precision Athletics. Mål: alle data som trengs for ærlig SG, og én komplett registreringsflyt (rask score, import/manuell SG, slag-for-slag, redigering og gjennomgang).

Regler: SG beregnes bare fra komplett slag-for-slag-kjede; ellers «ikke nok data» eller manuell/importert SG med kilde. Alltid brutto, aldri netto. Putting i fot, alt annet i meter. SG med fortegn og komma (+1,2 / −0,4). Manglende verdi «—», aldri 0. Kilde, dato og dekning på måltall.

## 1. Dataliste

### A. Runde (alltid)
| Felt | Type | Merknad |
|---|---|---|
| playerId | id | Syntetisk i demo |
| courseId, courseName | id, tekst | |
| playedAt | dato | |
| roundType | `turnering` \| `trening` | |
| holesCount | 9 \| 18 | |
| holesPlayed | number[] | F.eks. 10–18 |
| startHole | 1 \| 10 | |
| teeTemplate | tekst? | Lengdemal |
| status | `kladd` \| `delvis` \| `komplett` \| `importert` \| `manuell_sg` | |
| grossScore | int | Brutto, aldri netto |
| notes | tekst? | |
| source | `live` \| `etterregistrering` \| `upgame_csv` \| `annen_app` \| `manuell` | |
| sourceDate / importedAt | dato | |
| dataQuality | `total` \| `hullscore` \| `hullscore_detaljer` \| `slag_komplett` \| `manuell_sg` | Styrer badge og om SG kan beregnes |
| sgOrigin | `beregnet` \| `manuell` \| `importert` \| null | |
| sgLocked | bool | Manuell SG overskrives ikke uten bekreftelse |
| localDraftId, savedLocallyAt | tekst, tid | Offline |

### B. Hull (scorekort)
| Felt | Type | Merknad |
|---|---|---|
| holeNumber | 1–18 | |
| par | 3–5 | |
| lengthM | int | Startavstand for slag 1 |
| strokes | int | Brutto |
| putts | int? | |
| fairwayHit | ja \| nei \| null | Bare par 4/5 |
| gir | ja \| nei \| null | |
| penalties | int? | Import/scorekort |
| firstPuttFt | int? | Vises i fot |
| bunker, sandSave, scrambling | ja \| nei \| null | Valgfritt, med kilde |

### C. Slag (obligatorisk for beregnet SG)
Posisjonskjede: slag N starter der slag N−1 landet. Spilleren registrerer bare resultatet.
| Felt | Type | Merknad |
|---|---|---|
| holeNumber, holePar, shotNumber | int | |
| startLie | `TEE` \| `FAIRWAY` \| `SEMI_ROUGH` \| `ROUGH` \| `DEEP_ROUGH` \| `BUNKER` \| `GREEN` \| `TREES` | Avledet |
| startDistM | desimal | Slag 1 = hull-lengde. Avledet |
| resultLie | lie \| `HOLE` | |
| resultDistM | desimal | 0 ved hull |
| penalty | bool | Vann/OOB. Resultat = etter drop. Ikke tillatt på hole-out |
| club | tekst? | |
| wind | `stille` \| `medvind` \| `motvind` \| `venstre` \| `høyre` \| null | |
| mental | 1–5? | |
| note | tekst? | |
| targetDistM, pinDistM | desimal? | UpGame Target/Pin Distance |
| endCategory | `IN_PLAY` \| `MINOR_MISS` \| `MAJOR_MISS` \| `GREEN_HIT` \| `LETT` \| `MIDDELS` \| `VANSKELIG` \| `PENALTY_1` \| `PENALTY_2` | Bare ikke-putt |
| startX/Y, endX/Y, targetX/Y | desimal? | GPS/kart, ikke krav for SG |

### D. Putt (bare når startLie = GREEN)
| Felt | Verdier |
|---|---|
| lengthFt | Avledet fra startDistM |
| break | venstre–høyre, høyre–venstre, oppover, nedover |
| slope | svak, moderat, kraftig |
| lineMiss | venstre, høyre, på linje (ikke ved hole-out) |
| speed | holet, forbi, kort, sone forbi, sone kort |

### E. SG manuell/importert
- Hoved: sgTotal, sgOtt, sgApp, sgArg, sgPutt.
- Detalj: alle tee-slag · innspill ≤75 m, >75–125, >125–175, >175 m · chip ≤12 m, pitch, lob, bunker · putting ≤3 ft, >3–5, >5–10, >10–25, >25–40, >40 ft.
- Regel: sgTotal = OTT+APP+ARG+PUTT (±0,05) når alle fire finnes; tomt totalfelt fylles med summen. Detaljfelt summeres ikke.

### Kjedevalidering
- Slag N startLie/startDist = slag N−1 resultLie/resultDist.
- Straff på hole-out → avvis.
- På green: ny avstand > 1,5 × start → advarsel.
- Hull uten `HOLE` som siste resultat → hullet telles ikke i SG.
- Brudd → «Kjeden stemmer ikke» med hull og slag (AG-RD-02 viser det for coach).

## 2. Skjermer
| ID | Navn | Rute | Natt |
|---|---|---|---|
| PH-RD-01 | Velg registreringsnivå | `/portal/mal/runder/ny` | |
| PH-RD-02 | Oppsett | `/portal/runde/logg` | |
| PH-RD-03 | Live runde | `/portal/runde/live` | Natt |
| PH-RD-04 | Slag-for-slag | `/portal/mal/runder/[id]/slag` | Natt |
| PH-RD-05 | SG hittil | `/portal/runde/live` (ark) | Natt |
| PH-RD-06 | Etterregistrering / rask score | `/portal/mal/runder/ny` | |
| PH-RD-07 | Import fra annen app | `/portal/mal/runder/ny?kilde=import` | |
| PH-RD-08 | Runde ferdig | `/portal/mal/runder/[id]` | |
| PH-RD-09 | Rediger runde | `/portal/mal/runder/[id]/rediger` | |
| AG-RD-01 | Rundeanalyse (coach) | `/admin/runder` | |
| AG-RD-02 | Manglende SG-grunnlag | `/admin/runder?fane=kvalitet` | |

Filer: `ui_kits/_shared/data-rd.js`, `ui_kits/playerhq/screens/PH-RD-1.jsx` (01–05), `PH-RD-2.jsx` (06–09), `ui_kits/agencyos/screens/AG-RD.jsx`.

## 3. Byggerekkefølge
1. **Datamodell og kontrakt:** `Round.status`, `source`, `sourceDate`, `dataQuality`, `sgOrigin`, `sgLocked`, import-metadata (`importedAt`, `importFile`, `columnMap`), delvis lagring og lokal kladd. Skjemaendring — Anders godkjenner før migrering.
2. **Én registreringsflyt:** PH-RD-01 → 02 → 03/04 → 05 → 08, med 06 og 07 som alternative veier og 09 for redigering. Gjenbruk `RundeNyForm`, `ManuellSgFelt`, `logRoundManual` og `src/lib/domain/sg.ts`.
3. **Kjedevalidering på server** og SG-beregning bare for komplette hull.
4. **AgencyOS:** AG-RD-02 datakvalitet, deretter AG-RD-01 rundeanalyse med utkast til Workbench.

## 4. DB-konsekvenser
- `Round`: nye kolonner over. `score` er fortsatt brutto.
- `RoundHole`: `lengthM`, `penalties`, `firstPuttFt`, `bunker`, `sandSave`, `scrambling` (nullable).
- `RoundShot` (ny eller utvidet): alle felt i C og D. Indeks på `(roundId, holeNumber, shotNumber)`.
- `RoundSg`: hoved- og detaljfelt, `origin`, `lockedAt`, `lockedBy`.
- `RoundRevision`: tid, endring, kilde, forrige verdi.
- Migrering: eksisterende runder får `dataQuality` fra hva som finnes; `sgOrigin = manuell` der manuell SG allerede er lagret.

## 5. Audit
**Audit 27.09.2026:** PH-RD-01–09 × data/tom/laster/feil × lyst/natt × 390/768/1024/1280/1440 = 360 tilfeller, 0 avvik. AG-RD-01–02 × 4 tilstander × 5 bredder = 40 tilfeller, 0 avvik. Totalt 400, 0 avvik. Sjekket: horisontal rulling og klipping (doc + main), høyst én rust (Live-pille på natt), hurtigknapp bare i AgencyOS.

**Rettet etter verifisering 27.09.2026:** avstands- og mental-stepperen i PH-RD-04 var 46–54 px. Ny `Stepper size="xl"` (56 px knapper, `--hit-outdoor`), vind-segment `lg` og straff-bryter med 56 px rad. Andre verifisering fant Mer-arket under 56 px (lukk 44, felt 42, vind 50). Natt-tema (= ute) gir nå 56 px på alle kontroller: felt, select, segment, ikonknapper, ark- og dialog-lukk, knapper og valgpiller. Målt i PH-RD-04 natt med Mer-arket åpent: ingen kontroller under 56 px.

**Ikke automatisk verifisert:** sticky ActionBar over toast/tastatur, kjedefeil («Kjeden stemmer ikke»), sperre for straff på hole-out, sumkontroll i SG-feltene, CSV-kolonnemapping med manglende kolonner, beskyttet manuell SG med bekreftelse, offline-lagring i PH-RD-08. Prøvd for hånd i katalogen, ikke regnet som godkjent.
