# PIXEL-PERFECT PLAN — hele produktet (Paper-fasit)

> **SUPERSEDERT 25.08.2026:** Train-lock er designfasit for alle PlayerHQ- og AgencyOS-skjermer
> (Anders, i økt). Pixel-perfekt-mot-Paper-metoden i dette dokumentet skal ikke lenger følges
> for produktflatene. Metode-verktøyene (D1–D12, skjermbilde-gate) kan gjenbrukes mot
> Train-lock-fasiten når den er levert. Se `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md`.

**Versjon:** 2.0 · **Dato:** 16.08.2026 — avløser v1.1 (09.08), se §Hva v2.0 endrer.
**Fasit-kilde:** `designsystem/paper/` = *Claude Paper (3).zip* (CRC-verifisert 752/752 filer, 13.08)
+ **delleveranse D1–D6** 14.08 (27 filer — 6 endret, 8 nye; se `designsystem/paper/SYNC-STATUS.md`).
**Status-kilde (rang 2 i `GYLDIGHET.md`):** `docs/port/PAPER-ZIP-CHECKLIST.md` + `PP-W3/W4/W5-VARIANTS.md`.
**Mål når planen er ferdig:** hver **in-scope** skjerm er **pixel-perfekt** mot fasit (eller mal-fasit),
signert av Anders, på `main`/prod.

---

## Hva v2.0 endrer fra v1.1

v1.1 ble skrevet da **ingen** skjerm var signert (0 `[x]` · 52 `[~]` · 35 `[ ]`). Det bildet er passert:

1. **40 rader er pixel-signert** av Anders 13.–14.08 (galleriene 13.08 + bølge 1/2 + W4-runden).
2. **PP-0…PP-9-fasene fra v1.1 er gjennomført** til `[~]`-nivå eller bedre — fasestrukturen der er
   historikk. **PP-10.7 (Acuity-redirecten) er UTFØRT** — #431 merget 14.08, `akgolf.no` viser plattformen.
3. **Templates (8 rader) er ute** — Anders' beslutning 14.08: `.dc.html` er Open Design-komponent-
   kontrakter, ikke skjermfasiter. To fase1-filer er også ut (`agencyos-agenticos.html`,
   `agencyos-innstillinger.html` — erstattet av fase2-motparter som alt er signert).
4. **D1–D6 (14.08-delleveransen) er nytt omfang** — seks funksjonsleveranser med egne checklist-rader.
   Steg 0-porten er kjørt (`docs/taksonomi-verifikasjon.md` + `docs/fasit-avvik.md`); D3/D5/D6 er bygget 15.08.
5. **AVVIKSRAPPORT-2026-08-13 er ny kunnskapskilde:** fem målte rotårsaker forklarer avstanden som
   gjenstår — og token-drift/speil-drift er AVKREFTET med måling. Planens tyngdepunkt flytter fra
   «bygg skjermer» til «fell beslutninger + systemfikser + signer restene».
6. **Vaktverk er delvis på plass:** typografi-vakt (#462, warning-modus), token-gate i `verify`,
   Presis-farger ute av `src/` (#465), taksonomi v3 med 17 treningsområder (#477).
7. Regnskapsenheten er nå **checklist-rader (88 aktive — rettet 17.08)**, ikke «79 fasit-HTML» —
   de tre nye 14.08-filene (`playerhq-betaling`, `-gapping`, `-ukesdigest`) får sin DONE via
   D-radene, og `workbench-stall(-mobil)` via D1-raden. Zip 16.08 la til tre nye W3-rader
   (`playerhq-profil`, `-utstyr`, `-coach-tilbakemelding`) — derfor 88, ikke 85. Checklisten
   er fasiten for antallet.

---

## STATUS-SNAPSHOT (oppdatert 17.08.2026 — talt mot checklist og git, ikke antatt)

| Blokk | `[x]` | `[~]` | `[ ]` | Ute (`[-]`) |
|---|---:|---:|---:|---:|
| Fase 1 (33 rader) | 28 | 3 | 0 | 2 |
| W1 PlayerHQ (11) | 0 | 11 | 0 | — |
| W2 Analysere-dybde (12) | 0 | 12 | 0 | — |
| W3 Meg/Booking/Talent/Coach (10 — +3 fra zip 16.08) | 1 | 9 | 0 | — |
| W4 AgencyOS (8) | 8 | 0 | 0 | — |
| W5 Marketing/Auth/Forelder/System (6) | 2 | 4 | 0 | — |
| W6 WANG + GFGK (4) | 1 | 2 | 1 | — |
| D1–D6 Funksjonspotensial (6) | 0 | 3 | 3 | — |
| Templates (8) | — | — | — | 8 |
| **SUM (88 aktive rader)** | **40** | **44** | **4** | **10** |

**Mal-varianter:** 0 kvittert — W3 **9** · W4 **38** · W5 **25** = **72** rader gjenstår i
`PP-W3/W4/W5-VARIANTS.md` (m390 + d1280 per rad).

**Åpne PR-er (17.08):** #549 (S3 systemtilstander) · #547 (Jarvis maskinrom, draft) ·
#542 (innganger skjulte flater) · #534 (AP0 SG-grunnmur, draft) · #514 (SG-app-plan, draft) ·
#490 (WANG PII-fiks — **haster**, #406 lukkes som overflødig når den merges).

**Verktøystatus:**

| Verktøy | Status |
|---|---|
| `scripts/signoff-gallery.mjs` | Virker (app+fasit side om side, m390/d1280, lys/mørk). Krever `SCREENTEST_PASSWORD` — **kompromittert 03.08, må roteres** (`scripts/roter-screentest-passord.ts`, Anders kjører) |
| `tests/e2e/paper-visual/` (100+ specs) | Snapshot-diff, `maxDiffPixelRatio: 0.04`, kjøres kun med `PAPER_SEED=1` (fikset i #485 etter 9 dager rød røyktest) |
| `scripts/check-typografi.mjs` | Warning-modus (`--diff`/`--alle`). Vippes blokkerende med `TYPOGRAFI_STRENG=1` når restansen er tom |
| `scripts/check-token-gap.mjs` | Blokkerende i `npm run verify` + CI |
| Preview-miljø | OK siden 10.08 (env satt); prod = `akgolf.no` (Acuity fjernet 14.08) |

---

## 0. Definisjon: «pixel-perfekt DONE» (D1–D12 — uendret)

En skjerm er **DONE** bare når **alle 12** er sanne. Ingen unntak for «nesten».

| # | Kriterium | Måling |
|---|---|---|
| D1 | Fasit åpnet side-om-side (HTML vs live rute) | Samme viewport |
| D2 | Layout-grid matcher (seksjoner, rekkefølge, hierarki) | ±0 seksjonsbytte |
| D3 | Spacing: 4px-stige (4/8/12/16/24/32/48) | Avvik ≤ 2px på nøkkelseksjoner |
| D4 | Type: Poppins/Lora/Plex Mono, sizes som fasit | Visuell match labels/titler/KPI |
| D5 | Farger kun Paper-tokens (`--p-*` / `T.*`) | Ingen hardkodet legacy-grønn/neon-CTA |
| D6 | **Én** solid primær-CTA = clay `#D97757` (`T.handling`) der fasit har «Én ting nå»; ellers ink CTA | Maks 1 solid handling per view |
| D7 | Logo: riktig surface (on-paper / on-ink / mono) fra `/logos/paper/` | Ingen feil logo-variant |
| D8 | Rail/topp/dokk = Paper chrome (mørk rail, cream flate) | Shell-komponent |
| D9 | Viewport: **m390** + **d1280** (og iPad 768 der fasit har egen) | Screenshots begge |
| D10 | Tom/laster/feil tilstander ærlig (ingen fake seed-data) | Manuell + empty props |
| D11 | QA-markører: `data-od-id` / `data-paper-slug` på root | DOM inspect |
| D12 | **Anders sign-off** + galleri-bilder sendt i samtalen | Checklist `[x]` — settes KUN av Anders |

**To presiseringer (fra avviksrapporten):**
- **D6/clay:** clay hører hjemme i «Én ting nå»-kortet og fokus-tilstander. Skjermens øvrige
  handlinger («Ny plan», «Ny booking», tilbake-navigasjon) er **ink**-knapper i topplinjen —
  et fullbredde clay-banner som liste-CTA er et brudd selv om det bare er ett.
- **D8/rail:** til beslutning A1 (§4) er fattet, måles admin-skjermer mot **flaten**, ikke railen —
  railen kan ikke matche to fasit-familier samtidig.

**Pixel-toleranse:** struktur/CTA/logo/type: **0 toleranse for «feil system»** ·
sub-pixel font/antialiasing tillatt · innhold er ekte data — layout skal tåle tom/lang tekst.

---

## 1. Omfang (in / out)

### 1.1 IN — dette regnskapet skal til 100 %

1. **De 88 aktive radene i `PAPER-ZIP-CHECKLIST.md`** (40 `[x]` i dag). Dette er eneste
   fasit-regnskap — «79 fasit-HTML» fra v1.1 er avløst (templates ute, D-rader inne).
2. **De 72 variant-radene** i PP-W3/W4/W5-VARIANTS (mal-arv: malen 100 % pixel → 15-min
   variant-sjekk per rute med `rutefasit.md`-avvikslinjen som hele forskjellen).
3. **D1–D6** — funksjonsleveransene fra 14.08-delleveransen, med samme skjermbilde-gate som alt annet.

### 1.2 OUT — eksplisitt utenfor «planen ferdig»

| Blokk | Hvorfor OUT | Når inn |
|---|---|---|
| `(marketing)/stats/*` (~45) | Eget produkt (PR-F) | Egen plan «W7-stats» — tegnes før koding |
| Drift/AgenticOS-dyp (brief, recording, workspace, marketing/reports) | Eget spor i rutefasit §Drift; blokkert av drift-beslutningene (§4 E) | Etter beslutning |
| Templates (8 `.dc.html`) | Vedtatt ute 14.08 | Aldri |
| Redirect-stubber + `(legacy)`-ruter med v2-erstatning | Ikke skjermer | Slett/ignorer |
| Interne demoer (`(internal)/`) | Ikke produksjon | Valgfritt |

**W6-presisering:** WANG/GFGK måles mot **egne** fasiter og tokens (ikke Paper-shell). WANG-årsplanen
har i tillegg fått eget Claude Design-prosjekt (`6061a53c`, #479) — er det avvik mellom det og
`fase2/wang/`-filene, gjelder GYLDIGHET-regel 3: én må vinne, meld til Anders, aldri to sannheter.

---

## 2. De fem rotårsakene (målt 13.08) — status 16.08

Avstanden som gjenstår er IKKE token-drift eller speil-drift (begge avkreftet med måling —
0 verdiavvik, 752/752 CRC-identiske filer). Den kommer herfra:

| # | Rotårsak | Status 16.08 | Lukkes av |
|---|---|---|---|
| 1 | **Rail-konflikten:** fase2-fasitene tegner en annen admin-rail (7 punkter, mixed case) enn fase1 + koden (8–9, versaler). Forgifter hver eneste admin-sammenligning | **LUKKET 16.08** — A1 besvart (fase2-railen), implementert i #500 | — |
| 2 | **Master–detalj/artefaktkolonnen:** fasitens inspektørpanel (380 px) mangler på godkjenninger/planbibliotek/bookinger; appen bruker liste→detaljrute | **BESVART 16.08 (A2)** — delt primitiv `inspektorpanel.tsx` bygget i #524, tre flater; resterende flater kobles i PP-C/E | Ombygging per flate |
| 3 | **Clay-normen:** «Én ting nå»-komponenten brukes som vanlig liste-CTA (307 forekomster, flere per flate i 10+ filer); variant-dokumentene har kodifisert avviket | **BESVART 16.08 (A3)** — sweep kjørt i #502; **restansen fjernet 17.08: 32 `enTing`-forekomster i 27 filer** (liste-/skjerm-CTA-er → ink). Variant-dokumentene rettet 17.08. «Én ting nå»-kortene står urørt | Lukket for `enTing`-bruken; øvrige B2-punkter (error.tsx → `V2Feil`, clay-prikk i `VarslerV2`, integrasjoner 4→1) gjenstår |
| 4 | **Typografi:** 61 % av inline `fontSize` utenfor skalaen (13px/12.5px vanligst) | Vakt på plass (#462, warning) · kjernebiblioteket ryddet · restansen nedarbeides skjerm for skjerm | PP-B5 + PP-F1 (STRENG-vipp) |
| 5 | **Chrome-rest:** `(legacy)`-SubNav i to layouts, `/meg` utenfor skall-monopolet, døde chrome-komponenter | Delvis (#466 tok 25 døde ruter) — rest ikke verifisert | PP-B4 (verifiser mot avviksrapport §1.5 først) |

---

## 3. Forutsetninger (før fabrikken ruller)

| # | Forutsetning | Eier |
|---|---|---|
| F-1 | **Roter `SCREENTEST_PASSWORD`** (kompromittert 03.08) — `scripts/roter-screentest-passord.ts`. Uten det kan galleriet bare fotografere uinnloggede flater | Anders |
| F-2 | **PII:** WANG-flater fotograferes ALDRI mot ekte elevdata (preview leser prod-DB). Screentest-brukere med fiktive navn, eller anonymiser i bildet | Alle |
| F-3 | D3-fotografering trenger en testcoach-stall med økter denne uka (kortet skjules ærlig ved 0) — seed før galleri | Agent |

---

## 4. PP-A · Beslutningsgaten — **A1–A4 BESVART av Anders 16.08.2026**

> Svarene er nedfelt i `.claude/rules/beslutninger.md` §august 2026: **A1** fase2-railen
> (implementert #500) · **A2** fasitens inspektørpanel (primitiv bygget #524, tre flater) ·
> **A3** clay-normen bekreftet (sweep #502; `enTing`-restansen fjernet 17.08 — 32 forekomster
> i 27 filer) · **A4** innlogging LYS.
> B/C/D-spørsmålene under er delvis fortsatt åpne — **gjeldende åpne-spørsmål-liste er
> `PORTPLAN.md` §A1 (10 spørsmål)**; ikke gjenåpne A1–A4.

Historisk tekst (slik gaten sto før svarene):

### A · Skall og mønster (retter flest skjermer per svar)

| # | Spørsmål | Blokkerer |
|---|---|---|
| A1 | **Rail-fasiten:** fase1-railen (dagens kode) eller fase2-railen (Cockpit/Stall/Plan…)? | Alle admin-side-om-side + «Innstillinger vs Oppsett»-navnet |
| A2 | **Master–detalj:** bygges fasitens inspektørpanel (godkjenninger, planbibliotek, bookinger) — eller tegnes fasitene om til appens liste→detalj? | Godkjenninger-konsolidering («én flate»), `plans/[planId]`, bookinger-tabellen |
| A3 | **Clay-normen:** bekreft «clay kun i Én ting nå-kortet + fokus; skjermhandlinger er ink i topplinjen» | PP-B2-sweepen + rettelse av variant-dokumentene |
| A4 | **Innlogging mørk eller lys?** (#444 ble lukket umerget; fase1-fasiten er signert — hvilken tilstand var det?) | auth-flyt-signering |

### B · Produkt og ruter (blokkerer enkeltskjermer)

| # | Spørsmål | Blokkerer |
|---|---|---|
| B1 | Booking-veiviser: 5 → fasitens 3 steg (rører kollisjonsvern)? | `booking-ny` |
| B2 | Ruter fasiten nevner som ikke finnes: `foresporsler`, `klubb/integrasjoner`, `klubb/team(+inviter)` — bygges eller strykes fra fasit? | W4-komplettering |
| B3 | DataGolf i PlayerHQ: egen flate eller faner i Analyse? | PR-F / W7-stats-planen |
| B4 | `/portal/talent`-hub: egen flate eller redirect til mitt-niva? Og talent-gaten: forklarende side (dagens) eller `notFound()` (rutefasit)? | `talent`-raden |
| B5 | `helse/symptom/ny` som BottomSheet-ark? | `helse`-raden |
| B6 | `innstillinger/okter`: standardvarighet + påminnelsestid inn i `UserPreferences`? | W3-rest |
| B7 | Grupper: workbench-fanen inn i fane-raden, eller egen inngang? | grupper-komplettering |
| B8 | Testprotokoller synlig for spiller: 21 eller 20 (CANON)? | Testbatteriet i Workbench (gammel PR-E) |

### C · Data (D-sporet)

| # | Spørsmål | Blokkerer |
|---|---|---|
| C1 | **D4-backfill, resten:** #478 la inn 16/36 testområder; 8 FYS skal ikke ha — de siste ~12 trenger din dom (`docs/testomrader-forslag-2026-08-15.md`) | D4 |
| C2 | **D1-migrering:** additivt `erUtkast`-felt + publiserings-/faktisk-tid-felter på økt (anbefaling i `taksonomi-verifikasjon.md` §b — boolsk felt, ikke enum-utvidelse). DB-endring = ditt ja | D1 |

### D · WANG/GFGK

| # | Spørsmål | Blokkerer |
|---|---|---|
| D1 | `wang-logg-inn`: OTP-flyten som tegnet — ja/nei? (+ #490 må merges først: elevnavn stenges) | Siste W6-rad |
| D2 | `wang-coach-arsplan`: layoutspørsmålet fra 12.08 (står åpent i checklist-raden) | W6-signering |

### E · Drift (blokkerer kun drift-sporet — OUT av COMPLETE)

Oppgavesystem KommandoTask vs Notion · dispatch/morgenbrief-redirect · AiCost før/etter signering.
Svares når drift-sporet prioriteres — holder ikke COMPLETE tilbake.

---

## 5. PP-B · Systemfikser som retter mange skjermer på én gang

Rekkefølgen er avhengighetsstyrt; B3–B6 kan starte FØR beslutningsgaten.

| ID | Fiks | Avhenger av | Størrelse |
|---|---|---|---|
| B1 | **Rail-implementasjon:** én endring i `V2Shell` (eller fasit-retting) etter A1 — retter «feil skall» på samtlige admin-flater samtidig | A1 | S kode / M hvis fasit rettes |
| B2 | **Clay-sweep:** `enTing`-sweepen er **GJORT 17.08** — 32 forekomster i 27 filer fjernet (liste-/skjerm-CTA-er er nå ink; «Én ting nå»-kortene urørt), og variant-dokumentene er rettet i samme omgang. **Gjenstår av B2:** de 5 `error.tsx` → `V2Feil` · clay-prikken i `VarslerV2` → nøytral · `InnstillingerIntegrasjonerV2` 4 → 1 | A3 | S (rest), mekanisk |
| B3 | **`Composer` som delt komponent:** DELVIS 17.08 — ekstrahert i #523 (`src/components/v2/composer.tsx`, 4 flater importerer), men IKKE montert i `V2Shell` (`composer`-propen har 0 kallsteder). Monteringen gjenstår — alle desktop-flater skal arve (rutefasit-krav) | — | S (rest) |
| B4 | **Chrome-rest:** verifiser mot avviksrapport §1.5 hva #466 IKKE tok — `SubNav` i `(legacy)/mal`- og `coach`-layoutene, `/meg` uten `V2Shell`, gjenlevende døde chrome-komponenter | — | S–M |
| B5 | **Småfiks fra `fasit-avvik.md` (10 min, null risiko):** `planlegge-v2/styles.css:42` (siste Inter-linje) → `var(--p-body)` · de 7 inline radius-verdiene → stigen · `slack-alert.ts:104` (Familjen Grotesk i e-post) | — | S |
| B6 | **Typografi-rest:** kjør `check-typografi.mjs --alle`, nedarbeid restansen bibliotek-først (`datavis.tsx`/`domene.tsx` er alt ryddet — resten skjerm for skjerm i PP-C-bølgene) | — | Løpende |

---

## 6. PP-C · Sign-off-fabrikken: de 41 `[~]`

Alt her er **bygget** — det som mangler er galleri + Anders' `[x]`. Kjøres i bølger med
`signoff-gallery.mjs` (etter F-1): app + fasit side om side, m390 + d1280, lys + mørk, sendt
i samtalen (synlig fra iPhone). Klikk-verifisert, ikke bare fotografert.

| Bølge | Rader | Innhold |
|---|---:|---|
| C1 · Fase 1-rest | 3 | `playerhq-runde-live` · `playerhq-test-gjennomfor` · `spillerprofil` (#414) |
| C2 · D-radene som venter på foto | 3 | D3 ukesrapport/digest (seed stall først, F-3) · D5 gapping (seed-script finnes) · D6 skoletid (Playwright-install manglet 15.08) |
| C3 · W1 | 11 | drills, drill-detalj, feiring, fys-plan, live-tapper, okt-detalj, teknisk-plan, test-detalj, tester-hub, turnering-detalj, turneringer |
| C4 · W3 | 6 | innstillinger, abonnement, helse*, booking-ny*, booking-mine, talent* (* venter evt. på B1/B4/B5-svar i §4 B) |
| C5 · W2 | 12 | analyse-hull, runder-liste, runde-detalj, gameplan-liste, gameplan-banekart, datagolf, trackman-liste, trackman-detalj, putte-lab, historikk-filter-sheet, hjem-rest, hjem-varsler |
| C6 · W5 | 4 | marketing-side, auth-flyt (A4), auth-samtykke, forelder-barn |
| C7 · W6 | 2 | wang-coach-arsplan (D2-svar) · gfgk-veileder-artikkel |

**Regel per bølge:** diff-liste (maks 15 punkter) per skjerm FØR galleri; implementer kun diff
(minimal-diff); admin-flater måles mot flaten til A1 er svart. Finner bølgen et avvik som ikke
kan sies i én setning → stopp, meld (én-linje-testen).

**Tidsboks:** ½–1 dag agent per bølge + 20–40 min Anders per galleri.

---

## 7. PP-D · De fire `[ ]`

| Rad | Hva som kreves | Avhenger av |
|---|---|---|
| **D1 Workbench F4** | Additivt utkast-/publiserings-/faktisk-tid-felt (kirurgisk `db execute` per gotchas) → bygg ghost/composer-forslag/faktisk-mot-planlagt. `SKIPPED`-delen kan bygges i dag | §4 C2 |
| **D2 Booking → faktura** | AVKLART 15.08: «forfalt» hentes fra Stripe ved visning (ingen `dueDate` i basen). Bygg visningsberikelsen + `agencyos-okonomi`/`playerhq-betaling`-flatene | Ingen — kan bygges nå |
| **D4 Test → drill** | Feltet finnes (#478), taksonomi v3 er inne (#477). Rest: ~12 testers backfill → så ren kobling («nærmeste bånd først»). Stram samtidig `omraade`-fritekstfeltet (zod) | §4 C1 |
| **wang-logg-inn** | #490 merges (elevnavn stenges) → OTP-beslutning → pixel-pass | §4 D1 |

---

## 8. PP-E · Mal-variantene (72 kvitteringer)

W3 (9) · W4 (38) · W5 (25). Malen er signert eller i C-bølgene — variantene er 15-min-sjekker:
riktig tittel, ærlig tomtilstand, riktig primærhandling, avvikslinjen fra `rutefasit.md` og
ingenting mer. Kvitteres i variant-filene med m390 + d1280.

- Kjør per mal-familie når malen har `[x]` (W4-familiene kan starte i dag — alle 8 maler er signert).
- Variant-rader som avdekker mer enn avvikslinjen → tilbake til PP-C-metoden (full diff-liste).
- W4-variantene venter delvis på A2 (master–detalj) — kvitter de upåvirkede først.

---

## 9. PP-F · Vakter (hindrer tilbakefall — fra avviksrapport §6)

| # | Vakt | Nå | Mål |
|---|---|---|---|
| F1 | Typografi-gate (`check-typografi.mjs`) | Warning | `TYPOGRAFI_STRENG=1` i verify+CI når restansen er 0 |
| F2 | Clay-gate: maks én `T.handling`-fylt knapp per fil utenfor tillatt-liste; forby i `error|varsel|alert`-filer | Finnes ikke | CI-blokkerende etter B2 |
| F3 | `data-paper-slug`-krav på skjermkomponenter (marketing + workbench-turnering er usporbare i dag) | Finnes ikke | CI-warning → error |
| F4 | Bredde-gate: `scrollWidth <= innerWidth` på 390px for nøkkelruter (innboks-bomben-klassen) | Finnes ikke | Playwright-spec i CI |
| F5 | Skall-gate: `<nav`/`<header` i nye filer under portal/admin/forelder utenfor tillatt-liste | Finnes ikke | CI-grep |
| F6 | Radius-vakt (stigen 8/12/16/24/999) — samme mønster som typografi-vakten | Finnes ikke | Lint etter B5 |
| F7 | 44px-treffmål: Playwright `boundingBox()` på interaktive elementer ved 390px | Finnes ikke | Egen spec (statisk måling er upålitelig — `fasit-avvik.md` §4) |
| F8 | Natt-screenshot-diff mot preview med screentest-seeds (`paper-visual` + seeds) | Seed-gated lokalt | Natt-jobb, IKKE PR-gate |

---

## 10. PP-G · Full regresjon + COMPLETE

1. Alle 88 rader `[x]` + 72 variant-rader kvittert — full gjennomgang av checklisten.
2. Playwright smoke P0+P1 grønn + `paper-visual` grønn med `PAPER_SEED=1`.
3. Visuell stikkprøve: 10 tilfeldige variant-ruter.
4. Verifiser prod: `main` = prod-commit, `akgolf.no` viser plattformen (10.7 er utført — bekreft
   at det fortsatt står), hard refresh på 5 nøkkelruter.
5. Dokument-hygiene (§11) utført.
6. Merk planen **COMPLETE** med dato + Anders skriftlig.

---

## 11. Dokument-hygiene (del av planen, egen liten dok-PR)

- `PAPER-ZIP-CHECKLIST.md`-headeren: «79/79» → 88-rader-regnskapet; «Oppdatert 2026-08-09» →
  riktig dato; referansen til `PAPER-PATTERN-CHECKLIST.md` (slettet 17.08) → `rutefasit.md`.
  *(Delvis gjort i plan-oppryddingen 17.08 — checklistens tre feilførte `[ ]`-rader er rettet.)*
- Stale PR-referanser i checklist-rader (avviksrapport §3-lista: #413/#414/#419 er merget).
- `CLAUDE.md` §Stack: de to utdaterte font-påstandene (fastslått i `fasit-avvik.md` §1 — byttet ER
  gjennomført; kun `planlegge-v2/styles.css:42` gjensto, som B5 tar).
- ~~Variant-dokumentene rettes etter A3 (clay-normen) så de slutter å kodifisere `enTing` som liste-CTA.~~
  **GJORT 17.08** — W3/W4/W5-radene angir nå ink for liste-/skjerm-CTA-er; clay kun i «Én ting nå»-kortet + fokus.

---

## 12. Rekkefølge, parallellisering og tidsbilde

```text
        F-1 (passord, Anders)          PP-A (beslutningsgate, Anders)
              |                               |
   +----------+----------+          +---------+---------+
   |                     |          |                   |
 PP-C1/C2/C3/C5        PP-E       PP-B1 (rail)     PP-B2 (clay)
 (gallerier uten        (W4-                \         /
  beslutningskrav)      varianter)          admin-gallerier C4-rest
   |                     |                  + W4-varianter-rest
   +----------+----------+---------+--------+
              |                             |
            PP-D (de fire [ ])            PP-F (vakter)
              |                             |
              +-------------+---------------+
                            |
                      PP-G COMPLETE
```

PP-B3–B6 (composer, chrome, småfiks, typografi) går løpende uavhengig av beslutningene.
Maks 2 samtidige pixel-områder (unngå shell-konflikt).

| Fase | Kalender (realistisk) |
|---|---|
| PP-A beslutningsgate | 1 økt for Anders (~45–60 min — alt står i §4) |
| PP-B systemfikser | 2–4 dager agent |
| PP-C sign-off-bølger (7 stk) | 5–8 dager (½–1 dag/bølge + Anders 20–40 min/galleri) |
| PP-D de fire `[ ]` | 2–4 dager |
| PP-E 72 varianter | 2–3 dager |
| PP-F vakter | 1–2 dager |
| PP-G regresjon | 1–2 dager |
| **SUM** | **~2–3,5 uker** kalender med 1 agentstrøm + Anders 30–60 min/dag |

**Crash-path (≈1 uke):** F-1 + A1–A4 + B1/B2 + C1–C5-galleriene → kjernen og hele PlayerHQ
signert. Ikke COMPLETE — men hele hovedproduktet er pixel-signert.

---

## 13. Arbeidsmetode per skjerm (fabrikken — uendret)

```text
1. Åpne fasit-HTML (designsystem/paper/…) i nettleser m390
2. Åpne app-rute m390 side-om-side
3. Diff-liste (maks 15 punkter): seksjon / spacing / type / CTA / logo / empty
4. Implementer kun diff (minimal diff-prinsipp)
5. Gjenta d1280
6. signoff-gallery.mjs → galleri sendt i samtalen (m390 først, lys + mørk)
7. Checklist [~] → klar for sign-off
8. Anders godkjenner → [x] (KUN Anders setter kryss)
9. Neste skjerm
```

Maks 1–3 skjermer per PR. `npm run verify && npm test` grønt før hver PR. Aldri merge uten ja.

## 14. Roller og konfliktregler (uendret — GYLDIGHET §Konfliktregler)

| Rolle | Ansvar |
|---|---|
| **Agent** | Diff-liste, implementer, galleri, checklist `[~]`, aldri `[x]`, aldri senke en gate |
| **Anders** | Sign-off D12, beslutningsgaten §4, mal-vedtak, DB-ja |
| **Prod** | Kun merge etter grønn verify + Anders' ja |

1. **Fasit vinner** på layout, CTA-disiplin, logo, tokens.
2. Data som mangler i fasit: ærlig tomtilstand — aldri finn opp UI eller tall.
3. Fasit mot vedtatt IA / fasit mot fasit (rail!): stopp, én-linjes beslutning, rett fasit ELLER
   rute — aldri to sannheter.
4. Én-linje-testen for varianter: kan ikke avviket sies i én setning → egen skjerm, meld den.

---

## 15. Definition of COMPLETE (planen ferdig)

Alle må være sanne:

1. `PAPER-ZIP-CHECKLIST.md`: **88/88 aktive rader `[x]`** (40 i dag).
2. PP-W3/W4/W5-VARIANTS: **72/72 kvittert** (m390 + d1280).
3. Beslutningsgaten §4 A–D besvart og nedfelt (`beslutninger.md` + evt. fasit-rettelser).
4. Vaktene F1–F6 aktive i CI (F7/F8 etablert som spec/natt-jobb).
5. Playwright smoke P0+P1 grønn + `paper-visual` grønn med seed.
6. `main` = prod, `akgolf.no` viser plattformen (bekreftet på nytt i PP-G).
7. Anders skriftlig: **«Pixel-plan COMPLETE»** (dato).
8. OUT-listene (§1.2) dokumentert som ikke del av complete; W7-stats har egen planhenvisning.

---

## 16. Neste 72 timer

| Time | Handling |
|---|---|
| 0–2 | Anders: F-1 (roter passord) + svar på §4 **A1–A4** (de fire som retter flest skjermer) |
| 2–24 | Agent: PP-B5 småfiks + B3 Composer · galleri-bølge **C1 + C2** (fase1-rest + D3/D5/D6 — D-ene venter kun på foto) |
| 24–48 | B1 rail + B2 clay-sweep (etter A-svar) · galleri **C3 (W1)** + **C4 (W3)** · D2 bygges (avklart 15.08) |
| 48–72 | Galleri **C5 (W2)** + **C6 (W5)** + **C7 (W6)** · PP-E W4-varianter starter · #490 merges → wang-logg-inn løsnes hvis D1-svar |

---

## 17. Relaterte dokumenter

| Doc | Rolle |
|---|---|
| `designsystem/paper/` + `SYNC-STATUS.md` | Fasiten + speilstatus (rang 1) |
| `docs/port/PAPER-ZIP-CHECKLIST.md` | Regnskapet — 88 rader, `[x]` kun av Anders (rang 2) |
| `docs/port/rutefasit.md` | Alle ruter uten egen fasit-fil (rang 4) |
| `docs/port/PP-W3/W4/W5-VARIANTS.md` | Variant-kvitteringer (rang 5) |
| `docs/port/AVVIKSRAPPORT-2026-08-13.md` | De fem rotårsakene — kunnskapsgrunnlaget for §2 |
| `docs/taksonomi-verifikasjon.md` + `docs/fasit-avvik.md` | Steg 0 for D1–D6 |
| `docs/port/plan-gjenstaaende-bygg-2026-08-13.md` | Forløperen til §4/§7 — innarbeidet her og slettet 17.08.2026 (git-historikk) |
| `docs/port/GYLDIGHET.md` | Rangordningen |

---

## 18. Én setning

**Svar på beslutningsgaten, kjør systemfiksene som retter mange skjermer på én gang, signer de
41 som alt er bygget, bygg de 4 siste, kvitter de 72 variantene, og lås det hele med vakter og
én full regresjon — da er hvert in-scope skjermbilde pixel-perfekt Paper, og stats/drift står
bevisst utenfor til egne planer.**
