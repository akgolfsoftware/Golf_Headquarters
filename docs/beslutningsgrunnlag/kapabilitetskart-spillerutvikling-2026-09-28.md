# Kapabilitetskart — spillerutviklingsmotoren (28.09.2026)

Spørsmål fra Anders 28.09: hva sitter vi allerede på, og hva skal til for at AI-planforslaget
blir verdensklasse — bedre enn å bruke Claude eller ChatGPT som egen treningsplanlegger, for
alle nivåer fra nybegynner til PGA Tour?

Grunnlag for grillingen runde 8 ([grillingsfila](grillingen-runde8-skjermer-2026-09-28.md),
[skjermkartleggingen](skjermkartlegging-2026-09-28.md)). **MÅLT** = lest i kode eller
Claude Design 28.09 (ikke kjørt mot databasen). **VURDERING** = Claudes tolkning.

---

## 1. Hva systemet vet om spilleren

| Kilde | Hva som finnes | Hull |
|---|---|---|
| Nivå A–K | 12 bånd på brutto snitt (`domain/ak-kategori.ts`), regnes ut ved oppslag; HCP + Broadie som reserve | Kategori lagres ikke → ingen historikk (MÅLT). HCP tastes manuelt, ingen synk fra NGF (MÅLT) |
| Onboarding | 7 steg: om deg, golfprofil (steder med 11 fasilitetstyper, dager, tid på dagen, drivkraft, 3 sesongmål), tall (snitt + SG), nivå, coach, avtaler | `profiltype`, `konkurranseNivaa` leses aldri; mål lagres uten målverdi; fasiliteter kan ikke endres etterpå (`saveFacilities` 0 kallere) (MÅLT) |
| Fasiliteter og tid | `PlayerFacility`, `FacilityPrefs`, `PlayerBusyBlock` (skole, jobb, reise) | Skade/fravær (`Leave`) har ingen skriveflyt (MÅLT) |
| Fysisk | `FysiskPlan` med sett/reps/RIR/pulssone og logg; FYS-score på 5 tester | FYS-score er relativ til stallen, ingen norm (MÅLT). TPI, bevegelighet, skadelogg finnes ikke (MÅLT). To parallelle fys-modeller (VURDERING) |
| Helse og belastning | `HealthEntry` (hvilepuls, HRV, søvn, vekt) med samtykke; sRPE lagres | **ACWR regnes ikke ut noe sted — tallene i Stall-visningen er hardkodet** (MÅLT) |
| Tester | 20 CANON/NGF-protokoller, PEI-motor testet mot Excel v3, vitne og attestering | Benchmark stopper ved scratch: ingen norm for nybegynner–klubbspiller, ingen per alder (MÅLT) |
| Runder og SG | SG på slagnivå med 15 felt, kilde og datakvalitet per runde, manuelle tall overskrives aldri; turneringer hentes automatisk (Golfbox, GJGT, NCAA, WAGR, Data Golf) | SG-baseline er bare PGA topp 40, ingen amatør-/kategoribaseline (MÅLT) |
| TrackMan | CSV, HTML og bilde; kølle- og balldata per slag; gapping, spredning, trend per kølle; slag kobles til tekniske oppgaver | Utstyrsbag er fritekst, ikke koblet til køllene (MÅLT) |
| Teknisk plan | P1.0–P10.0 → oppgaver med rep-mål per læringssteg, TrackMan-mål med baseline (kilde, dato, N), korridor og streak | — |
| Øvelsesbank | 895 kandidat-øvelser + 23 fysiske, AK-formel v2 på alle | **Bare 16 er godkjent i Masterbrain, alle putting** — AI kan ikke foreslå navngitte øvelser utenfor putting (MÅLT) |
| Gjennomføring | `WorkbenchSession` med planlagt/gjennomført, anstrengelse, minutter; etterlevelse | Fire parallelle økt-modeller gir risiko for sprikende tall (VURDERING) |
| Mentalt og liv | `mentalScore` per slag, coachens talentradar | Ingen strukturert mental test eller livsbelastning (MÅLT) |

**Styrker (MÅLT):** ærlig SG-motor på slagnivå · komplett NGF/TN-testbatteri med PEI ·
tre importveier for TrackMan · teknisk plan P1.0–P10.0 med TrackMan-mål (sjelden i markedet) ·
AK-formel v2 som felles språk · automatisk turneringshistorikk · grundig samtykkestyring.

---

## 2. Hvordan AI-planforslaget lages i dag

To generatorer med språkmodell og rundt ti regelstyrte agenter:

- **Full plan (`genererPlan`, Sonnet):** når bare spillerens egen planbygger. Admin-knappen
  og «20 spillere samtidig» har ingen kallere. Planen går **ikke** til coach for godkjenning,
  og ingen skjerm viser AI-genereringene.
- **Ukeforslag (`generateWeekSuggestions`, Haiku):** spilleren i Workbench (lagres direkte)
  og søndagsjobb (går til coachens kø). Gir økter uten øvelser. Søndagsjobben legger alle
  økter kl. 16:00 uten å se på ledig tid.
- **Regelagenter → kø → coach godkjenner:** runde, test, TrackMan, turnering, plan-vakt,
  treningsgap, planeffekt. Øvelsene velges som **de ti første alfabetisk** i riktig område,
  uten nivå, fase, fasilitet eller variasjon.

**Hva full plan bruker (MÅLT, `src/lib/ai-plan/context.ts`):**

| Brukes | Brukes ikke |
|---|---|
| Kategori A–K, HCP, periode, 5 aktive mål, ledig tid 14 dager, økter per uke og dager, volum mot SG, forrige plans effekt, WAGR | Alder (selv om LTAD-regelen står i prompten) · timer per uke · fysisk plan og FYS-tester · helse, søvn, HRV · belastning · turneringskalender · teknisk plan · rå runder og scorer |
| SG, tester og TrackMan — bare indirekte via de 20 siste signalene | Periodens fokus og øktbudsjett |

**Feil funnet underveis (MÅLT, ikke rettet — ingen kode i denne runden):**
1. Bunker, nett/matte og «kan svinge hjemme» er hardkodet `false` (`context.ts:579-581`),
   mens prompten sier «aldri bunker/hjemme» når de er false.
2. Planbyggeren leter etter signaler med `sg_` (små bokstaver), agentene skriver `SG_OTT`
   → spillerens svakhet blir alltid tom (`plan-builder/index.ts:191`).
3. Ukeforslaget leser signalet `SG_AREA`, som ingen skriver → alltid tom.
4. Ny runderegistrering (`logRoundManual`) og turneringsrunder starter ikke runde-agentene.
5. **Ukeforslaget sender spillerens ekte navn til Anthropic** (`week-suggest.ts:194`). Bryter
   regelen om anonymisering av PII, også for mindreårige.
6. Effekten av en plan regnes bare ut når noen åpner en bestemt side; coachens avvisninger og
   endringer brukes aldri til å lære.

**Bedre enn ChatGPT i dag (MÅLT):** ekte data går inn automatisk · planen legges i faktisk
ledig tid · øvelser fra egen katalog, oppfunne navn forbudt · AK-metodikk og Masterbrain
versjonert per generering · strukturert svar som Workbench kan bruke direkte · forslag fra
agentene er sporbare og godkjennes av coach.

---

## 3. Sterkt og gjenbrukbart fra WANG og Training Motor

- **IUP-samtalen** (`src/app/team-wang/coach/iup`, ekte data): evaluer perioden og avtal
  neste fokus, egen- og trenervurdering 1–5, status, fokusområde med akse, egentid per uke og
  målemetode, målinger i periodevinduet. Kan gjelde alle spillere (VURDERING).
- **WANG-42 Treningsoversikt:** planlagt som omriss, gjennomført som fylt; elevliste sortert
  «lavest etterlevelse først» (MÅLT i design).
- **Øvelsesmål differensiert per nivå** på samme øvelse (`wang-plan.ts`, VG1–VG3) — kan byttes
  til A–K eller AK-stigen (VURDERING).
- **Training Motor (`4917465a`, idékilde):**
  - Kjeden år → periode → uke → økt → øvelse → resultat → ny vurdering; hvert nivå arver,
    ingenting sperres.
  - Øvelsesmotoren i åtte trinn med sperrer (for eksempel ikke putting på driving range).
  - Datakildepanel: hva hver kilde gir og ikke gir, antall, siste dato; «ukjent», aldri 0.
  - Pålitelighetsgrenser for SG: under 8 runder «for lite grunnlag», lange slag fra 12,
    nærspill og putting fra 24 (merket «eksempel, ikke vedtatt»).
  - sRPE og ACWR med fire ukers historikk og fire varselnivåer.
  - Observasjon / hypotese / diagnose holdes adskilt; bare coach setter diagnose.
  - Sporbarhet: hvert forslag viser datakilde, formål, Masterbrain-kilde med versjon og
    coachens beslutning.
- **Toppidrett-modulene i `7d7c2994`:** onboarding som setter baseline (fasiliteter → mulige
  treningsområder, tid → sesongtimer, brutto snitt → A–K, SG → største gap, tre første økter
  sendt til coach) · baseline med «slag til neste kategori» · ytelsesbilde etter runde (fem
  faktorer, energifall per hull — helsedata, krever personvernavklaring).

Forhåndsbilder: skjermene i Claude Design har ingen egne miniatyrbilder; `screenshots/`
inneholder bilder fra kontrollrundene (MÅLT).

---

## 4. Gapet til verdensklasse (VURDERING, bygget på det målte)

Det som gjør motoren umulig å kopiere med en chat, er at **én felles spillerprofil** mater
alle forslag, og at **resultatet av planen går tilbake inn**. I dag finnes delene, men de
snakker ikke sammen:

1. **Én felles kontekst for alle generatorer** — nivå, alder, tid, fasiliteter, fysisk,
   helse og belastning, turneringer, teknisk plan, tester, SG med pålitelighet.
2. **Normer for alle nivåer** — tester, FYS og SG per kategori A–K og alder, ikke bare mot
   scratch og PGA topp 40.
3. **Godkjent øvelsesbank for alle 19 områder**, ikke bare putting, og valg etter svakhet og
   variasjon i stedet for alfabet.
4. **Coach i løkka overalt** — AI-plan fra AgencyOS, ukeforslag og full plan i samme kø, og
   coachens endringer brukt til å lære.
5. **Lukket sløyfe** — plan → gjennomføring → måling → ny vurdering (IUP-samtalen) → justert
   plan, beregnet automatisk.
6. **Ærlighet om data** — datakildepanel, pålitelighetsgrenser og «ikke nok data» synlig for
   spiller og coach.
