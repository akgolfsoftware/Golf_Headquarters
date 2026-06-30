# Implementeringsplan — PlayerHQ 10/10

> Faser for å bygge PlayerHQ-forslagene (`funksjonsforslag-10-10-playerhq.md`). **V1** = alt unntatt video.
> **V2** = video-verktøy (V2-1 selv-opptak, V2-2 AI-svinganalyse). PlayerHQ er **alltid lyst**.
> **Viktig:** flere faser *deler motor/datamodell med AgencyOS* — bygg backend én gang, vis på begge flater.
> Generert 2026-06-30. Plan — krever ja før koding.

---

## Prinsipper
1. **Del motor med AgencyOS.** Benchmark-, fokus- og signal-motoren er felles; PlayerHQ er spillerens *visning* av samme data. Bygg backend i AgencyOS-planen, lag spiller-UI her.
2. **Fundament → motor → visning.** Samme som AgencyOS.
3. **Spillerens språk:** klarhet + motivasjon, ikke kontrolltårn.
4. **Hver fase leverer noe brukbart.**
5. **Video venter til V2.**

## Avhengighetskart
```
[AgencyOS Fase 1 benchmark-motor]  ─►  P2 benchmark-visning ─►  P1 «jobb med dette» ─►  P4 plan tilpasser seg
P3 datainntak (spiller) ───────────────┘ (mater motoren)
P5 motivasjon ......... uavhengig (lavthengende)
P6 delbart kort/funnel  bygger på P2-visning
P7 MORAD-Caddie ....... deler #8 med AgencyOS
P8 helse self-log ..... deler #9 (spiller = logge-kilden)
P9 live ............... deler #10
P10 dispersion ........ deler #11
```

---

# V1 — fasene

## Fase 0 — Fundament & opprydding *(S, delvis delt med AgencyOS Fase 0)*
- Lås PlayerHQ-IA: **5 faner + 4 sidespor** som bindende ramme.
- Rydd dubletter: `analyse↔analysere`, `stats↔statistikk`, `tren/ovelser↔drills`, `tren/kalender↔kalender`, `trackman/[id]↔mal/trackman/[id]`, `statistikk/runder↔mal/runder`. Adopter eller fjern «IKKE i MASTER»-ruter (baneguide, coach/sg-hub, coach/sporsmal).
- Intelligence-API-kobling (delt med AgencyOS).
- **Ferdig når:** IA låst, dubletter ryddet, datakobling på plass.

## Fase 1 — Datainntak + benchmark-visning *(M)* → P2, P3
Spillerens visning av benchmark-motoren (motoren bygges i AgencyOS Fase 1).

| Oppgave | Hva | Fane |
|---|---|---|
| P3 Selvbetjent runde-logg | Enkel registrering (fairway/GIR/putts → auto-SG) | Gjennomføre |
| P3 GolfBox/UpGame-import | `importFromGolfBox`/`importUpGameShots` → auto-SG (finnes delvis) | Analysere |
| P2 Benchmark/nivå i Analysere | Din percentil per SG-akse + slag-gap + 5-trinns nivå | Analysere (SG-fane) |

**Ferdig når:** Spilleren ser egen percentil/nivå per kategori fra ekte data, og kan logge runde selv.

## Fase 2 — Personlig fokus + motivasjon *(M)* → P1, P5
| Oppgave | Hva | Fane |
|---|---|---|
| P1 «Jobb med dette i dag» | Største svakhet → 1–2 driller, i dagens fokus | Hjem |
| P5 Motivasjons-lag til Hjem | Streak, milepæler, framgangsfeiring samlet på Hjem (løft fra undersider) | Hjem |

**Ferdig når:** Hjem viser proaktivt fokus + motivasjon; ingen «hva nå?».

## Fase 3 — Plan tilpasser seg *(M)* → P4
Spiller-siden av den adaptive loopen (motoren = AgencyOS Fase 3).
| Oppgave | Hva | Fane |
|---|---|---|
| P4 Se & godta planendring | Når et signal endrer planen: spilleren ser hvorfor + godtar (`godtaPlan`, `createPlanChangeRequest`) | Planlegge/Hjem |

**Ferdig når:** Spilleren forstår og kan godta plan-tilpasninger.

## Fase 4 — Vekst & abonnement *(M, kan starte tidlig)* → P6 + opprydding
| Oppgave | Hva | Fane |
|---|---|---|
| P6 Delbart spillerkort | «Trading card» (nivå/percentil/framgang) delbar til SoMe → akgolf.no-funnel | Hjem/Meg |
| Abonnement-flyt | Ekte Stripe-betaling (delt med AgencyOS #5), rydd oppgrader/avbestill-flyt | Meg |

**Ferdig når:** Spilleren kan dele kort + ekte abonnement fungerer.

## Fase 5 — Differensierende delspor *(L, parallelle)* → P7–P10
| # | Oppgave | Fane | Notat |
|---|---|---|---|
| P7 | Proaktiv MORAD-Caddie | global Caddie | deler #8 |
| P8 | Helse/wellness self-log + belastning | Meg/Hjem | deler #9; spiller = kilde |
| P9 | Live/ukeresultat for spiller | Hjem/Analysere | deler #10 |
| P10 | Strategi/dispersion på banen | Analysere/Baneguide | deler #11 |

**Ferdig når:** Hvert delspor levert isolert.

---

# V2 — Video *(eget prosjekt)*
| # | Oppgave | Fane |
|---|---|---|
| V2-1 | Selv-opptak av sving → send til coach → annotert svar | Gjennomføre/Coach |
| V2-2 | AI-svinganalyse (P1–P10) på egen video | Analysere/Caddie |

---

## Samlet rekkefølge (anbefalt)
1. **Fase 0** (delt med AgencyOS) →
2. **Fase 1** (benchmark-visning + datainntak) — samtidig med AgencyOS Fase 1 (samme motor) →
3. **Fase 2** (fokus + motivasjon) →
4. **Fase 3** (plan tilpasser seg) →
5. **Fase 4** (delbart kort + abonnement) →
6. **Fase 5** (delspor) →
7. **V2** (video).

## Neste steg
1. Du godkjenner faserekkefølgen.
2. `spesifikasjon-faser-playerhq.md` gir design + bygg per fase (kan gis til Claude Design).
3. Fase 0 detaljeres til nummerert byggeplan før koding.
