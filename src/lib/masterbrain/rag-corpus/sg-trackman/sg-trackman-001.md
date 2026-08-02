---
chunk_id: sg-trackman-001
source: masterdokument-strokes-gained-trackman.md
source_section: "### Merk om tallformat: Tekniske parametere og tabeller bruker punktum som"
tags: [app, baseline, broadie, formule, kategori, ott, pga-tour, putt, sg, trackman]
topics: [beregning, broadie, pga-snitt, putting, sg-baseline, trackman-parametere]
lang: no
relevance: [AiPlanGeneration, CoachHQ, RAG, SgBaseline, TrackMan, beregnSg, forventetSg]
updated: 2026-06-14
---

desimalskilletegn (internasjonalt format, i tråd med Trackman og SG-litteraturen), f.eks. «1.50 smash factor». I løpende norsk tekst brukes komma som desimalskilletegn der det faller naturlig.

## Innholdsfortegnelse

1. Innledning og formål
2. Strokes Gained: Konsept og historie - 2.1 Hva er Strokes Gained? - 2.2 Mark Broadie og opphavet - 2.3 ShotLink-datasystemet - 2.4 PGA Tours adopsjon (2011 putting, 2014 full)
3. Strokes Gained: Matematisk grunnlag - 3.1 Formelen: SG = Baseline(start) − Baseline(slutt) − 1 - 3.2 Baseline / forventede slag-funksjonen - 3.3 Regresjonsmodellen (J = 2.38 + 0.0041d) -
   3.4 Gjennomarbeidede eksempler
4. De fem SG-kategoriene - 4.1 SG: Off-the-Tee (OTT) - 4.2 SG: Approach (APP) - 4.3 SG: Around- the-Green (ARG) - 4.4 SG: Putting (PUTT) - 4.5 SG: Tee-to-Green og SG: Total - 4.6 Grenseregler og vanlige misforståelser
5. Baseline-tabeller (forventede slag) - 5.1 Full tabell: avstand × lie (10–600 yards, alle lie-typer)

- 5.2 Puttingbaseline (2–90 fot) - 5.3 Hvordan baselines beregnes - 5.4 Tour-baseline vs handicap-baseline

6. Sentrale innsikter fra Broadies forskning - 6.1 Langspillet dominerer (variansfordeling 72/17/11) - 6.2 150–200 yards-båndet (74% korrelasjon med Total SG) - 6.3 Lengde slår presisjon på utslag - 6.4 Putting som differensiator (15% blant proffer, 35% for amatører) - 6.5 Konkrete tall fra Broadies analyser
7. Strokes Gained for amatører - 7.1 Arccos (600M+ slag, target-handicap baselines) - 7.2 Shot Scope (80M+ slag, Phase 3 baselines) - 7.3 Lou Stagner og offentlige datasett - 7.4 DECADE Golf (Scott Fawcett) - 7.5 Andre verktøy (Golfshot, TheGrint)
8. Trackman: Teknologi og produktoversikt - 8.1 Selskapet og historikken - 8.2 Dual-radar Doppler-teknologi - 8.3 Trackman 3e vs 4 vs iO - 8.4 Nøyaktighet og valideringsstudier
9. Trackman: Klubbdata (Club Data) - 9.1–9.11 Alle 11 parametere
10. Trackman: Balldata (Ball Data)

- 10.1–10.13 Alle 13 parametere

11. Trackman: Kortspill- og putteparametere
12. Ballflukt-fysikken

- 12.1–12.6 D-plane, nye ballfluktlover, Face-to-Path m.m.

13. Trackman Optimizer
14. PGA Tour-snitt (Trackman)

* * *

Strokes Gained & Trackman — Masterdokument v1.0 · 2026

15. LPGA Tour-snitt (Trackman)
16. Amatør-snitt etter handicap-nivå
17. Fra Trackman til Strokes Gained: Broen
18. Komplett benchmark-matrise
19. Praktisk bruk: Workflow for app/produkt
20. Kritikk og begrensninger
21. Ordliste (Glossary)
22. Kildereferanser

# 1\. Innledning og formål



## 1.1 Hva dette dokumentet dekker

Dette masterdokumentet er et komplett teknisk referanseverk for golfdataanalyse, med vekt på to komplementære måleverktøy: Strokes Gained (SG) og Trackman-parametere. Dokumentet samler all sentral kunnskap fra Broadies akademiske forskning, PGA Tours offisielle datasystemer, Trackmans publiserte parameterdefinisjonar og de største amatørdatabasene (Arccos, Shot Scope) i én norskspråklig referanse.

Omfanget dekker: - Det matematiske fundamentet for SG-metodikken, fra formelen via baseline-tabellene til de fem offisielle kategoriene-Fullstendig definisjon og kontekstualisering av alle Trackman-parametere (klubbdata, balldata, kortspill og putting) - Ballflukt-fysikken (D-Plane, nye ballfluktlover, Face-to-Path-forholdet) - Tour-snitt og amatørdata sortert etter handicap-nivå, fra scratch til 25+ - Broen mellom range-data og spillresultater — hvordan Trackman-tall oversettes til Strokes Gained-Kritikk og kjente begrensninger ved metodikkene-En norsk-engelsk ordliste med alle fagbegreper

## 1.2 Hvordan det er ment å brukes (som datafundament for app/ produkt)

Dokumentet er skrevet for en norsk apputvikler som bygger et digitalt golfprodukt. Det tjener som:

### Datagrunnlag: Alle tallverdier (baseline-tabeller, Tour-snitt, amatørsnitt, optimizer-verdier)

er hentet direkte fra primærkilder og kan brukes direkte i appens logikk, uten ytterligere oppslagsbehov.

### Forretningslogikk: Formlene og relasjonene beskrevet her — f.eks. SG-formelen, Spin Loft-

beregning, Face-to-Path-spin-akse-forholdet — kan implementeres direkte som algoritmer.

### Benchmarking: Benchmark-matrisen i seksjon 18 gir det komplette grunnlaget for en app

som skal sammenligne en spiller med jevnaldrende eller med en målhandicap.
