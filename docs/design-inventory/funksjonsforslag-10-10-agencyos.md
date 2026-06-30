# Funksjonsforslag — AgencyOS mot 10/10

> **Hva dette er:** Hvilke *nye* funksjoner som løfter trener-plattformen fra «komplett» til **verdensklasse**.
> Forankret i to analyser: (1) Anders' egen visjons-dokumentasjon, (2) konkurranse-research mot de beste
> golf-/athlete-plattformene (TrackMan, Clippd, CoachNow, DECADE, TrainingPeaks, Smartabase, Sportsbox AI m.fl.).
>
> **Lese-nøkkel:** **Table stakes** = må ha for å henge med. **Differensierende** = det som gjør oss til 10/10.
> Hver idé peker til hvilken av de 13 hubene den lander i. Kilder: `scratchpad/intern-visjon-gap.md` +
> `scratchpad/ekstern-konkurranse-gap.md`. Generert 2026-06-30. Forslag, ikke låst.

---

## Hvor AK allerede er sterk (ikke mist dette)
Begge analysene bekrefter samme styrker — fundamentet er solid:
- **SG/DataGolf-benchmarks** og data-DNA (få coaching-apper er like datadrevne).
- **Spiller-stall-dashboard** over hele stallen (det Clippd selger til college-program — vi har det).
- **Periodisert planlegging** (GRUNN/SPES/TURN, maler, driller) — på nivå med TrainingPeaks' årsplan.
- **Booking-grunnmur** (kalender/anlegg/tjenester).

10/10 handler ikke om å bygge om dette — men om å koble det sammen og legge på laget som mangler.

---

## Det store bildet — 3 gap-typer

| Gap-type | Hva | Hvorfor det betyr noe |
|---|---|---|
| **A. «Siste mil» på data vi alt har** | SG-tall finnes, men brukes ikke til å *fortelle coachen hva spilleren skal jobbe med*, og benchmarks vises ikke som percentil/nivå | Høyest ROI — dataene ligger der, vi mangler bare motoren + visningen |
| **B. Lukkede sløyfer** | Signaler oppdages, men «godkjenn» endrer ikke planen; betaling vises, men Stripe er ikke koblet | Kjente hull i egen kode (AAPNE-SPORSMAAL A3, STATUS-NÅ P0) |
| **C. Helt nye lag** | Video-/svinganalyse, helse/belastning, ekte live | Det konkurrentene har og vi mangler helt — størst moat, tyngst å bygge |

---

## Tier 1 — Høy ROI, bygger på det vi har (neste 3–6 mnd)

| # | Funksjon | Type | Lander i hub | Status i dag |
|---|---|---|---|---|
| 1 | **Auto «hva skal spilleren jobbe med»** — SG-svakhet → konkret drill, per spiller. Gjør Caddie *proaktiv*: «Øyvind taper mest på innspill 150–175 m → disse 3 drillene». | Differensierende | Spiller 360 + Innsikt + AI-senter | Driller/maler finnes; auto-prioritering mangler (Clippd «What To Work On») |
| 2 | **Benchmark-motor: percentil + slag-gap** — hver kategori vist som percentil mot ekte DataGolf-fordeling + «N slag unna neste nivå». Koble HQ til Intelligence-API (halvbygget). | Table stakes + diff. | Innsikt + Spiller 360 | SG-motor finnes; percentil-mot-fordeling mangler. Intelligence-API + HQ-klient finnes alt |
| 3 | **Kontekst-justert nivå-score** — 5 lesbare nivåer (Trenger arbeid → Tour-nivå) over rå SG, à la Clippd «Shot Quality». Gjør tallene forståelige for spiller/forelder. | Differensierende | Innsikt + Spiller 360 | Mangler. Bygger på #2 |
| 4 | **Adaptiv signal-loop som FAKTISK endrer planen** — harde triggere (SG-drop, HCP-stagnasjon >8 uker, treningstomrom >14 d, turnering <3 uker) → forslag → coach godkjenner → *planen endres*. | Differensierende | Workbench + Innboks + Cockpit | Kjent hull: `acceptPlanAction` bytter bare status i dag (A3) |
| 5 | **Ekte Stripe + abonnement/faktura** — betalingsstatus, fakturautsending, MRR fra ekte data. | Table stakes | Økonomi + Drift | UI + Payment-modell finnes; live-kobling gjenstår (P0) |
| 6 | **Spiller-datainntak** — selvbetjent runde-logg + GolfBox-score → auto-SG. Mater #1–#4 med ferske tall. | Table stakes (fundament) | PlayerHQ → mater AgencyOS | Runder/TrackMan-import finnes; selvbetjent logg + GolfBox→SG mangler |

> **Hvorfor Tier 1 først:** #1–#4 bruker data vi nesten har, og #2 trenger bare datakoblingen som alt er halvbygget.
> #5 er forretningskritisk (P0). #6 er foret som gjør resten ekte.

---

## Tier 2 — Differensierende moat (6–12 mnd)

| # | Funksjon | Type | Lander i hub | Kommentar |
|---|---|---|---|---|
| 7 | **Asynkron video-leksjonsløkke** — spiller laster opp sving, coach annoterer (tegn/slow-mo/voice-over), sender tilbake. Uten ML først. | Table stakes (mangler helt) | Spiller 360 / Innboks | CoachNow/Skillest eier dette. AKs tydeligste hull mot fjerncoaching |
| 8 | **MORAD-RAG Caddie** — koble Caddie til MORAD-kunnskapen (P1–P10, Mac-sitater, CIO-er) så svar er metodikk-forankret, ikke generiske. | Differensierende | AI-senter | Caddie finnes, men er ikke koblet til MORAD-vektorlageret |
| 9 | **Helse-/belastningslag** — daglig wellness-logg (søvn/sårhet/stress) + enkel belastning (ACWR/ATL-CTL) + risiko-varsler. Særlig mot WANG/toppidrett. | Table stakes (toppidrett) | Spiller 360 (helse) + Cockpit | Hele laget mangler. Wellness-logg = lavthengende; ACWR = moderat |
| 10 | **Live-/ukeresultat-hub** — ekte sanntids-live (vinnersannsynlighet, live SG) + mandagslast av norske resultater på tvers av tours + varsler. | Differensierende | Cockpit + Talent | `/stats/uka` finnes; mandagslast blokkert (GitHub Actions av). Live er seed-skall |
| 11 | **Course management / dispersion** — tee-strategi, expected-value-mål, spredningskart per spiller (DECADE-stil). | Differensierende | Innsikt + Workbench | På plan-stadiet (baneguide-dispersion i minnet) |
| 12 | **Drill-discovery-agent ferdig** — ukentlig web-/YT-søk → AI lager driller → coach godkjenner → selvvoksende bibliotek. | Differensierende | Workbench | Startet (godkjenning + YouTube-søk); full loop gjenstår |

---

## Tier 3 — Tungt, langsiktig topp-løft (12+ mnd)

| # | Funksjon | Type | Kommentar |
|---|---|---|---|
| 13 | **CV-svinganalyse med P1–P10 auto-tagging** — last opp svingvideo → skjelettsporing → auto P-posisjoner → topp-2 faults + drill-forskrift, på MORAD-språket. | 10/10-moat | Største strategiske løft (TPS/Sportsbox-nivå, men unikt forankret i MORAD). Egen ML-stack. Diagnosis Orchestrator + TrackMan Truth Layer finnes som konsept |
| 14 | **Multi-kilde enhets-harmonisering** — Arccos/Garmin/TrackMan samlet til ett bilde per spiller. | Table stakes (proff-stall) | Lavere prioritet i norsk amatør-kontekst |
| 15 | **ML-skadeprediksjon / wearable-biofeedback / sanntids stemme-coach** | Eksperimentelt | Lengst unna. Kitman-nivå krever mye data. Lav prioritet nå |

---

## Hva dette gjør med de 13 hubene

De nye funksjonene bor i eksisterende huber — de utvider, lager ikke nye siloer:

| Hub | Får ny kapabilitet |
|---|---|
| **Cockpit** | Adaptive signaler (#4), live-puls (#10), helse-varsler (#9) |
| **Spiller 360** | «Hva jobbe med» (#1), percentil/nivå-score (#2,#3), video-leksjon (#7), helse-logg (#9) |
| **Workbench** | Plan endres av signaler (#4), dispersion-mål (#11), selvvoksende driller (#12) |
| **Innsikt** | Benchmark-motor (#2,#3), course management (#11) |
| **Innboks** | Video-leksjoner inn (#7), plan-forslag å godkjenne (#4) |
| **AI-senter** | MORAD-Caddie (#8), CV-svinganalyse (#13) |
| **Økonomi** | Ekte Stripe/faktura (#5) |
| **Talent** | Ukeresultat-hub (#10), ascent-kurve mot college/KFT (#2) |

**Ny hub vurderes kun for:** video-/svinganalyse (#7+#13) hvis det vokser stort — ellers en fane i Spiller 360.

---

## Min anbefaling (kort)
- **Start Tier 1 #1–#4.** De gjør AK *merkbart smartere* uten nye datakilder, og lukker to kjente kodehull. Dette er «datadrevet coaching» levert på løftet.
- **#5 (Stripe) parallelt** — det er P0 forretning uansett.
- **Tier 2 #7 (video-leksjon)** er det enkleste store konkurranse-hullet å lukke (ingen ML), og gir umiddelbar verdi mot fjerncoaching.
- **#13 (CV-svinganalyse på MORAD)** er det som til slutt gjør AK uangripelig — men bygg fundamentet (Tier 1) først, ellers analyserer vi video uten å koble det til plan og data.

---

## Neste steg
1. Du markerer hvilke av #1–#15 som skal inn i veikartet (og rekkefølge).
2. De valgte funksjonene legges inn i funksjonskartet + de 13 hubene, så vi designer skjermene *med* dem fra start.
3. Så går vi til datakomponent-skisse per hub.
