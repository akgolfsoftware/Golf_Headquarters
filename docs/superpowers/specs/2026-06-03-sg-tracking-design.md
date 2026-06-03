# Design: Strokes Gained-tracking + statistikkføring (SG-mapping)

Status: **DESIGN v0.1 — PARKERT, sist i køen.** Venter på supplerende research-dokumenter
(Perplexity, Grok, Gemini, Manus) om hvordan systemet skal legges opp, samt
masterdokumentet «Baseline SG & Stats for AK Golf HQ» (cowork). Ikke start implementering
før disse er gjennomgått og designet er endelig godkjent.

Opprettet 2026-06-03 via brainstorming. Bevarer beslutningene så langt.

---

## Mål
Tracke Strokes Gained ende-til-ende fra enkel slag-logging, pluss proximity + dispersjon
per kølle/lie til treningsplanlegging — ved å koble sammen eksisterende infrastruktur,
ikke bygge på nytt. Samle mest mulig statistikk på enklest mulig måte (minimal input → maks
derivert data, etter UpGame-modellen).

## Det som allerede finnes (verifisert 2026-06-03)
- `Shot`-modell: `lie`, `distanceToPin`, `distanceHit`, `club`, `shotType`, `holeNumber`, `holePar`, `shotNumber`, `isPenalty`
- `slag-wizard.tsx` — inntastings-UI per hull/slag (kølle, lie, avstand)
- `lib/domain/sg.ts` — `beregnSg()` (Broadie, OTT/APP/ARG/PUTT) — KUN brukt i tester
- **Mangler:** broen `Shot[]` → `beregnSg`, proximity-aggregering, putt-baseline-fiks

## Valgt tilnærming: C — full kjede med smarte defaults

### Input per slag
| Felt | Input | Obligatorisk |
|---|---|---|
| Avstand til pinnen | tall (laser) | Ja |
| Lie | auto (slag 1=Tee, etter green=Putt), bekreft | Ja (auto) |
| Kølle | foreslått fra avstand/historikk | Ja (ett tapp) |
| Miss sideveis | venstre/høyre + **antall meter** | Valgfritt |
| Mental / Teknisk / Taktisk | 5-punkt skala, default 3 «vanlig» | Valgfritt |
| «I hullet» | knapp avslutter hull | — |

To moduser: **live under runden** (default) + **etter runden** (samme skjema). Manuell
avstand (les av laser). Ingen GPS/kart i scope.

### Mentalt/utførelse-scorekort (5-punkt, sentrert)
Default = 3 («vanlig») → null friksjon for normale slag; juster kun ved avvik.
| Dim | 1 | 3 (default) | 5 |
|---|---|---|---|
| Mental commit | helt ucommittet | vanlig | 100 % committet |
| Teknisk | skikkelig mishit | vanlig kontakt | ren, perfekt |
| Taktisk | klart feil valg | ok valg | perfekt beslutning |

Formål: dekomponere dårlig resultat → mental vs teknisk vs taktisk, så man ikke endrer
teknikk når problemet var commit/beslutning.

### Miss-retning i meter
Venstre/høyre + meter (valgfritt, mest relevant tee/approach). Kombinert med proximity
(resterende avstand) gir 2D-spredning per kølle, kart-fritt.

## Datamodell-konsekvens
- Kjernen: INGEN endring (SG-kjeden utledes fra eksisterende `Shot`-felt)
- Mentalt scorekort + miss: legg til valgfrie felt på `Shot` (`mentalCommit`, `tekniskUtførelse`,
  `taktiskValg`, `missRetning`, `missMeter`) — ALTER, ikke ny tabell. RLS finnes på `shots`.

## Avklart fra masterdokument (cowork: «Baseline SG & Stats for AK Golf HQ»)
Bekrefter parametere (`start_lie`, `start_distance`, `end_lie`, `end_distance`, penalty;
SG-kategori+verdi deriveres). Legg til ved implementering:
1. **Pålitelighetsterskler** — aldri treningsråd < 8 runder. Total=8, T2G/OTT/APP=12, ARG/PUTT=24.
2. **Tre baselines** — PGA Tour / HCP-matchet (5/10/15/20/25) / AK Norsk. Default fra hcp.
3. **Eksakte SG-grenser** — ARG ≤ 27,4 m fra greenkant; APP = par 3 + ikke-tee > 27,4 m.
4. **Truth Layer** — TrackMan Combine vs on-course → teknisk vs mentalt/strategisk diagnose.
5. **Pyramide-mapping** — OTT→TEK, APP→SLAG, ARG/PUTT→SPILL → AK-formel-øktgenerering.
6. **Broadie-baseline** — `ak-golf-academy/spec-v2/sg-baseline-broadie.json` kan fikse feilkalibrert `BENCHMARK_PUTT`.

## Avhengigheter / hva som mangler før implementering
- Supplerende research (Perplexity/Grok/Gemini/Manus) — kommer
- Full gjennomgang av masterdokument (768 linjer) + research-fundament (622 linjer) + PDF-rapport
- Endelig design-godkjenning

## Utenfor scope (YAGNI)
Ikke GPS, ikke kart, ikke x/y shot-map (#7), ikke live-tracking-skjerm (#5),
ikke proximity-til-target-tall (erstattet av miss-retning kart-fritt).
