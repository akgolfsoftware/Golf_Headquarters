# Implementeringsplan — AgencyOS 10/10

> **Hva dette er:** Rekkefølge og faser for å bygge funksjonsforslagene i `funksjonsforslag-10-10-agencyos.md`.
> **V1** = alt unntatt video. **V2** = video-/svinganalyse-verktøyene (#7 video-leksjon, #13 CV-svinganalyse).
> Generert 2026-06-30. Plan — ikke startet. Krever Anders' ja før koding.

---

## Prinsipper
1. **Fundament → motor → visning.** Vi kobler data først, bygger motoren, så viser den. Ellers viser vi tomme skjermer.
2. **Hver fase leverer noe brukbart** — ikke big-bang. Coachen ser verdi etter hver fase.
3. **Funksjonene bor i de 13 hubene** — vi bygger ikke nye siloer, vi utvider eksisterende flater.
4. **Verifiser før neste fase:** `npx prisma validate && generate && tsc --noEmit && npm run build` grønt, og fasens «ferdig når» oppfylt.
5. **Video venter til V2** — det krever egen ML-stack og skal ikke blokkere resten.

---

## Avhengighetskart (hva må komme før hva)

```
#6 Data-inntak  ─┐
                 ├─►  #2 Benchmark-motor ─►  #1 Hva-jobbe-med ─►  #4 Adaptiv signal-loop
(Intelligence-   │                       └─►  #3 Nivå-score
 API, halvbygd) ─┘
#5 Stripe ............... parallelt, uavhengig (P0 forretning)
#8 MORAD-Caddie ......... uavhengig (trenger MORAD-vektorlager)
#9 Helse/belastning ..... uavhengig (ny datamodell)
#10 Live/ukeresultat .... uavhengig (fiks mandagslast + DataGolf live)
#11 Dispersion .......... uavhengig (banedata)
#12 Drill-discovery ..... bygger videre på påbegynt agent
```

Kjernekjeden er **#6 → #2 → #1/#3 → #4**. Resten kan kjøres i parallelle spor.

---

# V1 — fasene

## Fase 0 — Fundament & opprydding  *(S, 1–2 uker)*
Rydde grunnen før vi bygger på den.

| Oppgave | Hva |
|---|---|
| Fullfør Intelligence-API-kobling | Bytt HQ-leserne over til `/api/v1` (klient `src/lib/intelligence/client.ts` finnes); bekreft `dashboard`-schema er fylt (backfill kjørt) |
| Lås de 13 hubene + 5 IA-justeringer | Cockpit=se/Innboks=gjøre, Stall=én liste m/briller, Workbench=bibliotek+plan, rolle-filtrert IA, mobil 5+Mer. Dokumentér som IA-fasit |
| Datamodell-revisjon | Avklar hvilke nye felt/tabeller fasene trenger (benchmark-cache, signal-terskler, wellness) — additivt via `db execute` (jf. gotcha) |

**Ferdig når:** HQ leser benchmarks fra Intelligence-API, hub-IA er låst skriftlig, og datamodell-endringene er planlagt additivt.

## Fase 1 — Datakobling + benchmark-motor  *(M, 3–5 uker)*  → #2, #6
Motoren som plasserer hver spiller på en percentil-kurve.

| Oppgave | Hva | Hub |
|---|---|---|
| #6 Spiller-runde-logg | Selvbetjent registrering (fairway%/GIR%/putts → auto-SG) | PlayerHQ (mater AgencyOS) |
| #6 GolfBox-score → SG | Importer rundescore, beregn SG automatisk | PlayerHQ/Drift |
| #2 Benchmark-motor | For hver kategori: percentil mot DataGolf-fordeling + «N slag unna neste nivå», nivå-adaptiv (klubb→PGA) | Innsikt + Spiller 360 |
| #2 Signatur-visning | Benchmark-scrubber + fordelings-radar (komponenter mangler — jf. `komponenter.md` gap) | Innsikt |

**Ferdig når:** Coachen ser hver spiller som percentil per SG-kategori, med slag-gap til neste nivå, fra ekte data.

## Fase 2 — Innsikt-laget  *(M, 3–4 uker)*  → #1, #3
Gjør tallene til handling og gjør dem forståelige.

| Oppgave | Hva | Hub |
|---|---|---|
| #1 «Hva skal spilleren jobbe med» | SG-svakhet → auto-prioritert drill-liste per spiller. Avstandsbasert for innspill (50–75 … 200+ m) | Spiller 360 + Innsikt |
| #1 Caddie blir proaktiv | Caddie foreslår fokus + driller uten å bli spurt | AI-senter + Cockpit |
| #3 Kontekst-justert nivå-score | 5 lesbare nivåer (Trenger arbeid → Tour-nivå) over rå SG | Innsikt + Spiller 360 |

**Ferdig når:** For en valgt spiller kan coachen se «jobb med X» + matchende driller, og et lesbart nivå per område.

## Fase 3 — Adaptiv signal-loop  *(M, 3–4 uker)*  → #4
Lukker det kjente kodehullet: forslag som faktisk endrer planen.

| Oppgave | Hva | Hub |
|---|---|---|
| Harde triggere | SG-drop, HCP-stagnasjon >8 uker, treningstomrom >14 d, turnering <3 uker, ny skade | Cockpit + Innboks |
| Ekte planendring | `acceptPlanAction` skal *endre planen*, ikke bare status (A3-hullet) | Workbench |
| Plan-business-rules | Maks 2 hovedfokus/periode, ingen sving-endring i konkurransefase uten override, eval-intervall ≥8 uker | Workbench |

**Ferdig når:** Et signal kan bli et forslag som coachen godkjenner, og planen endres faktisk.

## Fase 4 — Forretning  *(M, 2–3 uker, kan kjøres parallelt fra start)*  → #5
P0 forretningskobling.

| Oppgave | Hva | Hub |
|---|---|---|
| Ekte Stripe | Betalingsstatus, fakturautsending, MRR fra ekte data | Økonomi |
| Pakke→betaling→roster-flyt | Sammenhengende akademidrift (CoachNow-mønster) | Økonomi + Drift |

**Ferdig når:** Økonomi-flata viser ekte betalinger og kan sende faktura.

## Fase 5 — Differensierende spor  *(L, 8–12 uker, parallelle delspor)*  → #8–#12
Moat-løft som ikke avhenger av kjernekjeden.

| # | Oppgave | Hub | Notat |
|---|---|---|---|
| #8 | MORAD-RAG Caddie — koble Caddie til MORAD-kunnskap (P1–P10, CIO-er) | AI-senter | Trenger MORAD-vektorlager inn i HQ |
| #9 | Helse/belastning — daglig wellness-logg + ACWR/ATL-CTL + risiko-varsler | Spiller 360 + Cockpit | Mest mot WANG/toppidrett. Wellness-logg først (lett), ACWR etter |
| #10 | Live-/ukeresultat-hub — fiks mandagslast (GitHub Actions) + ekte DataGolf live + varsler | Cockpit + Talent | Mandagslast er blokkert i dag |
| #11 | Course management / dispersion (DECADE-stil) | Innsikt + Workbench | Banedata (Mapbox/OSM-plan finnes) |
| #12 | Drill-discovery-agent ferdig (web/YT → AI-drill → godkjenn → bibliotek) | Workbench | Påbegynt; fullfør loopen |

**Ferdig når:** Hvert delspor levert og verifisert (kan tas ett og ett).

---

# V2 — Video-/svinganalyse  *(L+, eget prosjekt)*  → #7, #13

Bevisst utsatt. Krever egen pipeline og bør bygges når V1-fundamentet (data + plan + Caddie) står.

| # | Oppgave | Hub |
|---|---|---|
| #7 | Asynkron video-leksjonsløkke — opplasting + annotering (tegn/slow-mo/voice-over) + send tilbake. Ingen ML først | Spiller 360 / Innboks |
| #13 | CV-svinganalyse — skjelettsporing → auto P1–P10-tagging → topp-2 faults + drill-forskrift, på MORAD-språket. Diagnosis Orchestrator + TrackMan Truth Layer | AI-senter (egen fane) |

**Hvorfor V2:** #13 er det største moat-løftet, men også tyngst (egen ML-stack, separat prototype finnes utenfor HQ). #7 er lettere (ingen ML) og kan evt. trekkes frem til slutten av V1 hvis ønskelig — men holdes i V2-sporet her per din beslutning.

---

## Samlet rekkefølge (anbefalt)

1. **Fase 0** (fundament) →
2. **Fase 1** (benchmark-motor) + **Fase 4** (Stripe) parallelt →
3. **Fase 2** (hva-jobbe-med + nivå-score) →
4. **Fase 3** (adaptiv loop) →
5. **Fase 5** (differensierende delspor, ett og ett) →
6. **V2** (video).

Grov V1-horisont: kjernekjeden (Fase 0–3) ~3 mnd; differensierende spor (Fase 5) overlappende ~2–3 mnd til.

## Neste steg
1. Du godkjenner/justerer faserekkefølgen.
2. For Fase 0 lager jeg en konkret nummerert byggeplan (maks 10 steg) + datamodell-endringene, og venter på ja før koding.
3. Vi designer skjermene for hver fase *med* funksjonene fra start (datakomponent-skisse per hub).
