# Komplett designport — Train-lock inn i kode, skjerm for skjerm

Dato: 2026-09-05 · Status: **UTKAST — venter på Anders' ja før fase 1 starter.**
Bestilling (Anders, 05.09): «analyser den komplette zip-en og alle filene, og lag en plan for å
implementere komplett design … portere skjermene og design til kode.»

Grunnlag: 210 Train-lock-tegninger (451 rammer) i `designsystem/train-lock/`, zip-en «Player HQ
Train lock» lastet opp 05.09 (kopi i Drive: `claude-cowork/akgolf-hq/innkommende/2026-09-05-player-hq-train-lock.zip`),
koden på `origin/main` (b0595b304), MASTERPLAN 2.12/2.13, prosjektrevisjonen 05.09. Kartlagt av
sju agenter familie for familie, etterprøvd av sju skeptikere, tre planutkast dømt av to dommere,
syntesen sjekket av en kritiker — og deretter rettet for hånd der kritikeren fant feil.
Vedlegg A (alle 197 skjermrader): `2026-09-05-komplett-designport-vedlegg-skjermer.md`.

---

## 1. Status i dag — kort

**Designet er bygget bredt, men nesten ingenting er målt.** Koden peker på 146 av 210 tegninger,
men bare 5 skjermer er faktisk målt mot tegningen sin. Og «peker på» er ikke det samme som
«bygget etter»: 30.08 ble filhodet i 29 filer byttet til Train-lock uten at skjermene ble bygget om.

| Hva | Tall | Kilde |
|---|---|---|
| Tegninger i fasiten | 210 filer, 451 rammer | `ls designsystem/train-lock` |
| Skjermer kartlagt (uten komponentark) | 197 | vedlegg A |
| Målt mot tegning i riggen | **5** | `tests/visual/skjerm-mapping.ts` |
| Bygget, ikke målt | 34 | vedlegg A |
| Bygget med kjent avvik | 65 | vedlegg A |
| Delvis bygget | 33 | vedlegg A |
| Ikke bygget | 40 | vedlegg A |
| Kun filhode byttet, ikke bygget | 6 (BO-01/02/03, ME-02, GP-01/02) | PX-6, commit 70a6c4a87 |
| Tegning utgått | 5 (P-05, PH-15, A-07, A-08, AG-05/AG-13 delvis) | HANDOFF/SCREEN-INDEX |
| Skjermfamilier uten rigg-rad | 98 av 104 | `docs/design-audit/2026-09-05/` |
| Lys tegnet | 28 av 210 filer | SCREEN-INDEX «Kjente hull» |
| iPad tegnet | 45 av 210 filer | målt bredde per fil |

De andre designsporene (ikke i denne planen, men for helhetens skyld): markedssidene har
fundamentet (PR #775), 0 av 18 sider portert, start man 08.09 (spor B). Team Norway har 13
Claw-tegninger, 3 skjermer i kode, ingen inngang fra menyen. WANG-merket er ikke startet.
Kontrast/telling (19.6/19.7) ligger strandet på en lokal gren med 150 ukommitterte filer (kø 30).

## 2. Hva zip-en inneholdt

- **Ingen ny skjermtegning.** Alle 210 skjermfiler er byte-identiske med repoet (synket 01.09).
- **Nytt: en klikkbar prototype** (`proto/`, 53 skjermer på tre skall: iPhone 393, iPad 1180/834,
  Mac 1440), bygget 02.09 i fire av sju batcher etter `PROTOTYPE-PLAN.md`. Batch 5 (Forelder,
  AgenticOS, Fys, drift), 6 (Forelder tre skall + lys) og 7 (motion) gjenstår.
- **Nytt: fire batch-oppføringer i HANDOFF.md** og en PROTO-seksjon i SCREEN-INDEX.md.
- **Eldre enn repoet:** zip-ens `PORTING.md` mangler rettelsene fra 01.09, og zip-ens
  SCREEN-INDEX/HANDOFF mangler Anders' beslutninger D1/D2 (02.09) og PH-07-rettelsen (03.09).
  **Disse tre filene kopieres aldri over repoets.**
- **Skal aldri inn i repoet:** `uploads/` (fire foto, ett skjermbilde, én xlsx).

**Prototypen strider mot tre låste beslutninger**, og kan derfor ikke brukes som byggeordre før
Anders har sagt hva som gjelder:

1. **Coach-menyen.** Prototypen har fem faner Cockpit · Innboks · Stall · Kalender · Workbench
   pluss et «Mer»-ark. Anders låste 25.08 (AX-01) Stall · Workbench · Kø · Jarvis · Meg, og det er
   det koden har. Prototypen gjentar menyen Anders erklærte utdatert samme dag.
2. **Plan-fanen.** Prototypen bygger Plan på P-05-mønsteret med CS60/M3-vokabular. Anders gjorde
   P-05 utgått 02.09 (D1) og vokabularet ble opphevet 18.08. Koden følger PH-07/PH-08.
3. **Font.** Prototypen bruker SF Pro. Produktet bruker Poppins (25.08).

Prototypen er likevel verdifull som **demo og som flyt-spesifikasjon**: spillersiden stemmer
med koden, og den viser tydelig én flyt appen mangler (fullført økt → «Fullført» + «Se recap» på
I dag). Krysslenke 3 (spiller godtar → coach ser det) er verken bygget i prototypen eller i appen,
selv om begge dokumenter påstår det.

## 3. Prinsippet planen følger

**Lansering først.** Skjermene en betalende spiller og coachen faktisk klikker gjennom i
røyktesten (Ø16) signeres først og voktes av automatiske sjekker. Alt annet porteres etterpå,
i rekkefølge etter hvor ofte en betalende bruker møter skjermen.

Fem regler som gjelder hver eneste skjerm:

1. **Sitert er ikke bygget.** Bevis på at en skjerm er portert er en rad i riggen med målt
   avvik, eller en eksplisitt avviksliste øverst i fila. Dekningstallet (146/210) brukes aldri
   som bevis.
2. **Ingen måling mot utdatert tegning.** Hver riggrad får `fasitDato` og en gyldighetssjekk
   (rail tegnet før 25.08, pris før 16.08, stall-rad før 30.08 = utdatert). 4 av 7 mislykkede
   målinger hittil skyldtes tegningen, ikke koden.
3. **Løkka per skjerm er låst:** canvas (Mac 1440 + mobil 390, lys + mørk, tom tilstand) →
   Anders' ja → bygg mot Train-lock → `/impeccable audit` + `review-animations` → skjermbilde
   390/1280 × lys/mørk med tegningen ved siden av, sendt i samtalen → riggrad. Én skjerm om
   gangen. Aldri batch, heller ikke når tre skjermer måles i samme økt: tre rader, tre gater.
4. **Ingen fase venter på et svar den ikke trenger.** Beslutningene stilles som én melding
   per fase, nummerert, maks tre valg, anbefaling først. Fase 1 krever ingen.
5. **Aldri nye tokens, aldri ny fasit, aldri SF Pro.** Train-lock er fasit (invariant 2).
   Et audit-funn som ber om annen font, farge eller radius avvises.

## 4. Fasene

Anslag er i **2-timers økter** (forbruksregelen). Tallene bygger på målt tempo: ren
sign-off av en gyldig tegning 15–30 min, enkel skjerm med canvas + bygg + gate ≈ 1 økt,
kompleks ≈ 2, første gang loader/fixture må lages ≈ en hel økt.

| Fase | Innhold | Økter | Krever fra Anders før start |
|---|---|---|---|
| 1 | Grunnmur: vakter, rigg, datofrys, dokumentrydding | 8 | Ingenting |
| 2 | Lanseringskjeden PlayerHQ (det spilleren møter i Ø16) | 8 | Handlinger (kø 28), 4 små svar |
| 3 | Lanseringskjeden AgencyOS (det coachen møter) + krysslenke 3 | 8 | 1 svar (ikke blokkerende) |
| 4 | F3 — de ti «krever bygging»-skjermene (Ø18–Ø26) | 15 | 3 svar |
| 5 | Resten av PlayerHQ (booking, Meg, gameplan, spillerens Workbench) | 18 | 5 svar i én melding |
| 6 | Resten av AgencyOS + AgenticOS, omtegning etter skallsvaret | 16 | Skallsvaret + 3 svar |
| 7 | Forelder: lys + mørk, riggrader, én canvas | 6 | 2 svar |
| 8 | iPad som tredje skall (kun etter FULL, kun etter beslutning) | 12 | 3 svar |
| | **Sum** | **91** | |

**Kalender-realisme.** 91 økter à 2 timer er omtrent 180 timer: fire og en halv måned med én
økt per virkedag, to og en halv måned med to spor samtidig (maks tre). Fase 1 + 2 + 3 = 24 økter
må være ferdige før røyktesten Ø16. Med to spor fra man 07.09 lander Ø16 rundt **24.09**; den
foreslåtte milepælen **11.09 (kø 29) er ikke mulig** uten tre spor hele perioden. Det bør
Anders vite når han svarer på kø 29.

### Fase 1 — Grunnmur (8 økter, ingen beslutning)

Mål: måleverktøyet blir ærlig og automatisk, den allerede vedtatte TallHero-rettelsen kommer inn,
og dokumentene slutter å lyve. Alt her er vedtatt (19.7, D3), drift (CI-vakter) eller rydding.

1. **Vakter inn i CI** (`.github/workflows/ci.yml`): `check-ingen-paper.mjs` (blokkerende),
   `check-v2shell-bredde.mjs` (blokkerende — først rett den ene fila som feiler,
   `src/app/admin/workbench/[playerId]/page.tsx`, og legg skriptet i `npm run verify`),
   `check-tl-kontrast.mjs` (rapport), en sjekk «fasitdekning aldri lavere enn origin/main»
   rundt `scripts/maal-fasit-dekning.mjs`, og en tellevakt «signalfarge som tekstfarge aldri
   flere enn origin/main per fil» (300 forekomster i dag). Den strandede 19.6-sweepen røres ikke.
2. **19.7 TallHero** slutter å telle opp (`src/components/v2/core.tsx:284`; `KpiFlis` på :332
   røres ikke — beslutningen gjelder kun TallHero).
3. **Datofrys** gjennom `src/app/portal/actions.ts` (11 rå `new Date()`), `TEST_NAA` blir et felt
   per riggrad, `seed-screentest-komplett.ts` og `-coach.ts` tar `--dato 2026-08-22`. PH-07
   remåles i fylt uke (17,26 % i dag er målt i tom-uke-tilstand).
4. **Riggen får felt** `fasitDato`, `minutter`, `aarsak`, valgfritt `viewport` + `selector`
   (panel-modus for innebygde paneler som AO-03/AO-08). `tests/visual/README.md` får
   gyldighetssjekken (regel 2 over) og regelen «ingen rad får kalibrert uten avviksliste i
   filhodet». De tre AgencyOS-radene som peker på redirect-adresser (`/admin/agenticos*`) byttes
   til `/admin/jarvis` og `/admin/ko?fane=…`.
5. **Filhode-konvensjon** skrives inn i `PORTING.md`: ` * Fasit: <fil>` og enten ` * Rigg: <label>`
   eller ` * Avvik: …`. Ny vakt `scripts/check-fasit-sitering.mjs` i verify feiler på filer med
   Fasit uten Rigg/Avvik, og på siteringer av filer som ikke finnes eller står som utgått.
6. **Nattlig måling**: `tests/visual/train-lock-pixelnaerhet.spec.ts` leser `skjerm-mapping.ts`,
   kjører alle kalibrerte rader, feiler ved > baseline + 2 prosentpoeng, og henges på den
   eksisterende `.github/workflows/playwright.yml` som schedule-jobb (ny secret
   `SCREENTEST_PASSWORD`). Samme jobb kjører lys+mørk-røyktesten for hver rute under `/portal`,
   `/admin`, `/forelder`: 0 konsollfeil, 0 horisontal overflow på 390/1280, ingen av de 12
   kontrastparene som tekst.
7. **Døde Paper-verktøy slettes**: `scripts/signoff-gallery.mjs`, `signoff-side.mjs`,
   `tests/e2e/paper-visual/` (109 specs), `check-typografi.mjs` + typografi-delen av
   `.claude/hooks/kvalitet.mjs`; `check-token-gap.mjs` snakker om TL, ikke Paper-tokens;
   MASTERPLAN 2.1 peker på `signoff-trainlock.mjs` + pixel-diff.
8. **Dokumenter og siteringer rettes** (bare det som er vedtatt eller faktisk feil): D3 (Spiller
   360 på én adresse, svart 03.09) registreres med `/beslutning` og 1C-raden lukkes;
   HANDOFF.md:263–266 «Meny per enhet» (7-punkts rail 64) merkes overstyrt av AX-01;
   SCREEN-INDEX lys-linjen oppdateres til 28 filer; de fire proto-batch-oppføringene flettes
   inn i repoets HANDOFF uten å miste PH-07-rettelsen, med én nøytral README-linje: «proto/
   avviker fra AX-01 — avgjøres i beslutning 7»; P-05-siteringene i `WorkbenchV2.tsx:1085` og
   `WorkbenchV2Mobil.tsx:9` byttes; `dispersion-map.ts:21–28` («ingen foto-OCR ennå» — TM-03
   bygde det) rettes; `AdminProfilTrainLock.tsx` siterer AG-18, ikke AG-05; `AdminComplianceV2.tsx`
   mister EC-02-sitatet (tegningen er MVA-frister, koden er treningsetterlevelse); MASTERPLAN
   10.3 og `tema-default.ts:25` sier ikke lenger at forelder-porten gjenstår; 2.12-radene for
   S3-03 (levert #766), TM-03 (D4 svart, #768) og kategorisummen rettes.

**Ikke i fase 1** (kritikerens funn): å merke PH-15, gammel DG-01, A-07, A-08, AG-05, AG-13 som
utgått er en designbeslutning og stilles til Anders før fase 2. Å montere KA-04 i I dag er en
skjermendring og flyttes til fase 2 med canvas + gate.

Ferdig når: CI er grønn med de fem vaktene; `grep useCountUp core.tsx` gir 0 på :284; PH-07 er
remålt under 10 %; AO-03/AO-08 har tall; den nattlige jobben har kjørt grønt én natt; de døde
verktøyene er borte; D3 står i beslutninger.md.

### Fase 2 — Lanseringskjeden PlayerHQ (8 økter)

Mål: hver skjerm spilleren møter i røyktesten har riggrad, skjermbilde i lys + mørk, og Anders
har sett dem. Ingen ny funksjon.

Skjermer: PH-01 · PH-07 · PH-08 · PH-17 · ME-04 · WB-04 (spiller — Godta/avvis-kortet; siteringen
flyttes fra død `PortalChatHjem.tsx` til levende `GodkjenningKort.tsx`) · B1 (laster/feil) · B3
(lys for PH-01/04/07/10/17 pikselmåles — første lysrader i riggen; resten røyk) · PH-04
(signeres som SIDE med avviket «ark i tegningen» i filhodet; ark-form etter FULL) · PH-05 ·
PH-06 (+ «Lukk → I dag» på SessionSummary, som i dag bare lenker til Plan og Analyse) · KA-04
(«I dag i tiden»-arket monteres fra I dag med canvas + gate) · **auth-inngangen**: `/auth/login`,
`/auth/register` og PH-19 onboarding får røyktest lys (auth er låst lys) + skjermbilde-gate, med
3-mot-6-steg-avviket i filhodet — en ny betalende bruker møter disse før PH-01 · ME-03 (SIST —
tegningen er utgått: dødt «Elite»-navn, gammel pris; krever ny canvas mot TALENT/FULL 299 kr/mnd
og 2 690 kr/år før måling).

Krever fra Anders før start (én melding):
- **Handling, ikke beslutning:** kø 28 — årspris-id inn i Vercel prod + ekte kjøp 299 kr (Ø1/Ø2).
- Kø 29: milepæl 11.09 eller 24.09 — anbefaling **24.09**, se kalender-realismen over.
- TALENT-sonden (screentest midlertidig gratis-nivå) for skjermbilde av `/oppgrader/flyt`: ja/nei.
- ME-03: (a) ny canvas mot TALENT/FULL — anbefalt, (b) signer dagens kode som sin egen fasit.
- Flyt for coach-publisert økt fra I dag (to øktmodeller gir to flyter fra samme kort):
  (1) koble «Start» til live-tapperen + «Fullført + Se recap» på I dag, (2) behold dagens side
  og merk PH-05/06 som kun for planøkter — **anbefalt før lansering, null omarbeid**, (1) som
  egen rad etterpå (+2 økter), (3) slå sammen modellene (egen spec).
- Utgått-merking av PH-15, gammel DG-01, A-07, A-08, AG-05, AG-13: ja/nei.

Ferdig når: alle skjermene over har riggrad «kalibrert» med `fasitDato`/`minutter`; skjermbilde
390/1280 × lys/mørk dokumentert i hver Ø-rad med Anders' «sett»; SessionSummary lenker til I dag;
spillerdelen av Ø16 er grønn.

### Fase 3 — Lanseringskjeden AgencyOS + krysslenke 3 (8 økter)

Mål: coachen kan planlegge, publisere, se spilleren og se spillerens svar, i skjermer signert
mot WB-kanon og AX-01-skallet slik det er i kode. Ingen omtegning av AgencyOS-tegninger her
(venter på skallsvaret), men PR #771 lander, skallhullene rettes, og hele demo-sløyfen skrives
som automatisk test.

Skjermer: AX-01 (rett to reelle hull: `/admin/analyse` og `/admin/oppsett` lyser ingen fane;
`/admin/agencyos/live` flyttes til fullskjerm-gruppe — `/admin/agencyos` som rad under Meg er
riktig og røres ikke) · WB-01 (Ø9-rest: kildepanelets gruppering — måles mot **WB-07**, som er
tegningen for Kilder/Serie/Tilstander) · WB-03 / A-01d (Ø10 sign-off) · WB-06 (levert 04.09,
mangler riggrad) · S3-03 (Ø12 skjermbilde med seedet stall) · S3-01 / S3-01L / AG-08 (Ø13: PR #771
ferdigstilles og merges tir 09.09 — koordiner med økten som eier den) · AG-10 / AG-10b (avviket
«kø-liste med diff, ikke ett merge-ark per sak» inn i filhodet) · AG-04 og AG-03 (riggrad
«ukalibrert» med `fasitDato` + årsak; omtegning i fase 6) · AG-11/KA-03, AG-18, AG-07, AG-06
(etterkontroll-skjermbilder for 15.4–15.9 som aldri ble dokumentert) · WB-04 (coach —
krysslenke 3: coachen ser at spilleren godtok/avslo uten å åpne uka) · GAP-1-rammene for S3-01
(tom/laster/feil) som tilleggsvisning på S3-01-raden.

Demo-sløyfen som e2e-test (`tests/e2e/demo-sloyfe.spec.ts`, kjører i `playwright.yml`):
starter fra innlogget FULL-testbruker → planlegg → publiser → spiller ser på I dag → godta →
coach ser svaret → merge fra Kø → spillerens plan oppdatert. **Ingen Stripe-kall i CI** —
kjøpet verifiseres kun manuelt i Ø2 (ekte kjøp, D10); testen asserterer bare at
`/oppgrader/flyt` er utilgjengelig for FULL.

Krever fra Anders (ikke blokkerende): hvor coachen ser Godta/Avslå — (a) fylt/åpen Stall-prikk
(anbefalt), (b) tellelinje i Kø, (c) sak i Kommunikasjon. Testen bygges uansett mot der svaret
lander i dag (SessionInspector).

Ferdig når: WB-01, WB-03, WB-06, S3-03, S3-01, AG-10 er «kalibrert»; AG-04/AG-03 er «ukalibrert»
med dato og årsak; PR #771 er merget; skallhullene er rettet; 15.x-etterkontrollene har
skjermbilder; demo-sløyfen kjører grønt i CI. **Ø16 krever fase 1 + 2 + 3.**

### Fase 4 — F3: de ti «krever bygging»-skjermene (15 økter, etter Ø16)

Rekkefølgen fra MASTERPLAN 1B, én skjerm per økt: PH-21 Min kurve (+L; komponenten fra #666 ble
bygget én dag før tegningen kom — tom-tekst avviker) · A-19a Innsikt vekstrate (canvas finnes i
`designsystem/canvas/innsikt/`) · TE-08 Driver Basic · TE-07 Wedge Variation (tegningen finnes kun
som Mac mørk — canvas 390 + lys tegnes først) · TE-10 GS-18 resultat · TE-12 Egen test (ruten er
allerede ute av legacy — planens rad er feil; omfanget er porten av `NyTestEgenV2`) · TE-09 /
Analyse Gapping (Anders velger én av de to tegningene; tre filer siterer slettet Paper-fasit) ·
TE-03 Putt Gate detalj (fast bunn-CTA + «Tren mot neste») · TE-04/TE-05 tekstfeil rettes i samme
løp («Putt N av M» hardkodet for alle Gate-protokoller) · A-15 spillerens årsplan (kun når kø 27
er svart). S3-01/02/03 hører til fase 3 og 8, ikke her.

Krever fra Anders før start: PEI som to tall (tegningen krever det, det andre tallet finnes ikke
i beregningen) — (a) definer regningen, (b) godkjenn ETT tall merket «estimat» — anbefalt (b) nå ·
TE-09 eller «Analyse Gapping» — anbefalt TE-09 som tegning, ruten under Analyse · kø 27 (A-15) —
anbefalt: dagens drag-and-drop-årsplan er årsplanen, A-15 kun sign-off.

Ferdig når: de ti radene er levert med PR-nummer og riggrad; `maal-fasit-dekning.mjs` ≥ 160/210;
riggen ≥ 20 rader; 0 treff på `designsystem/paper` i gapping-filene; TE-04 viser riktig ord og
protokollnavn for alle fem Gate-protokoller.

### Fase 5 — Resten av PlayerHQ (18 økter)

Mål: gjøre «sitert» om til «bygget» for resten av spillerappen, i rekkefølge etter hvor ofte en
betalende bruker treffer skjermen.

- **Sign-off i bulk** (gyldig tegning, ingen beslutning, tre rader per økt — hver med egen gate):
  PH-02, PH-03, PH-10, PH-16, TM-04, PH-11, PH-12, PH-13, PH-14, TM-01, TM-02, TM-11, TM-08f, TM-05,
  TM-03 (modal-tilstandene; C4 bevisst ikke bygget), TM-06, TM-08, TM-09 (a/b/f), TM-10, TE-01,
  TE-06, RU-01 (+ GAP-1 tom/laster/feil), RU-02, RU-03, PH-01b, PH-01c, PH-01e (e1–e4), DG-01
  (gammel — dagens fire faner til D5 er svart).
- **Reell port** av de seks «kun filhode»-skjermene: BO-01 (dag×time-rutenett), BO-03 (varm ring +
  Ferdig/Avbestill), **åpen `/booking` på markedssiden** (Train-lock lys per beslutning 28.08 —
  siterer slettet Paper-fasit i dag; portes sammen med BO-01/BO-03 og ferdig-kriteriet gjelder også
  `src/app/(marketing)/booking`), ME-02, ME-01, GP-01.
- **Beslutningsavhengige:** BO-02 (én inngang), PH-18 (tre brytere vs dagens kort), GP-02 (abstrakt
  kart vs Mapbox), TU-01/TU-02 (spillerens turneringsrute), RU-04 og PH-20 (ark vs side), PH-09
  (kun ved ja — tegningen booker simulator/range i strid med «ingen simulatortid»), to
  «Runder»-innganger, `/portal/kalender` (side uten tegning).
- **Spillerens Workbench:** P-01/P-09 sign-off · P-02 økt-nivå · P-03 måned (finnes i både
  standard og Pro — 2.12-raden er feil) · P-04 årsplan (samme svar som kø 27) · P-06/P-07 (mobil
  dag + Ny økt-ark — koden sier selv «ikke portet»; Ø5 var feilmerket gjort) · WB-05 måned.

Krever fra Anders (én melding, fem punkter): BO-02-adresse (anbefalt `/portal/booking`, den andre
redirect) · PH-09 stryk (anbefalt) eller tegn om · ark vs side for PH-20/RU-04 (anbefalt: sidene
består, ark etter porten) · fire IA-svar: TU-01/02 under Analyse, GP-02 behold Mapbox og merk avvik,
PH-18 port tegningens tre brytere, Runder på `/portal/mal/runder` og `/portal/kalender` →
`/portal/planlegge` · kø 30 (19.6-sweepen) bør være avgjort før lys-signering her.

Ferdig når: ingen fil under `src/components/portal/v2/` eller `src/app/portal/` siterer en tegning
uten riggrad eller avviksliste; 0 treff på `designsystem/paper` og `data-paper-slug` der og under
`(marketing)/booking`; én booking-adresse; 0 treff på P-05; alle skjermene har skjermbilde i
lys + mørk.

### Fase 6 — Resten av AgencyOS + AgenticOS (16 økter, etter skallsvaret)

Mål: tegne om de tre tegningene som bærer pensjonert meny eller innhold fra før 6.5 (AG-04, AG-03,
AO-01) — først når Anders har avgjort meny-spørsmålet — og signere resten av coachens skjermer.

Skjermer: AG-04 (+ AG-16 Mac-del) omtegnes mot 6.5 + AX-01 · AG-03 omtegnes mot AX-01 + 15.7 ·
AO-01 omtegnes mot AX-01 · A-13 (coachens uke på iPhone — bærer prototypens fem faner; etter
skallsvar) · A-01, A-01b, A-01c (Mac uke: riggrader — A-01 er pikselfasit for WB-01) · A-02/A-02b/
A-17/A-02c (inspektøren forankres til A-17, den eneste økt-tegningen uten utgått vokabular; serie-
arket A-02c bygges) · A-03/A-03b/A-03c (reps- og press-felt; «Miljø» bygges kun som Belastning,
«Situasjon M0–M5» aldri) · A-05 · A-10 (uten gruppeøkt — D8) · A-11 (⌥=KOPI + ghost) · A-14 ·
A-16/A-19L/B5 (lys der rammene finnes) · A-18 · A-04 (øvelsesbank ut av legacy) · AG-01/AG-02/
AG-14/AG-15 (utgått til fordel for canvas Hjem, eller omtegnes — beslutning) · AG-06/AG-07/AG-09/
AG-09b/AG-11/AG-12/AG-18/EC-01 (riggrader, tre per økt) · AO-02/AO-03/AO-04/AO-05/AO-08/AO-09/AO-10/
AO-11 (panel-modus; brytere som ikke lagrer vises som lesestatus) · GAP-2 drift-tilstander på
AO-02/AO-11 · KA-01 (time-akse eller dagliste — beslutning) + GAP-1 · KA-02 · KA-05 · A-06/A-15
(etter kø 27).

Krever fra Anders før start: **meny-spørsmålet (beslutning 7)** · Ø15 (Kommunikasjon under Kø
eller Meg) · A-serien: D2 (02.09) står — A-serien er pikselfasit uten vokabular; kun nyansen «18 av
30 A-filer viser utgått CS/L-fase/M» skal bekreftes som ikke-avvik · AG-01/02/14/15, KA-01, A-18,
A-04 (fire små svar) · AO-bryterne som lesestatus (anbefalt).

Ferdig når: AG-04, AG-03, AO-01 er omtegnet og «kalibrert»; alle AG/AO/KA/EC/A-skjermer har
riggrad eller står som utgått med dato; SessionInspector siterer A-17 + A-02c; ingen AgenticOS-
bryter ser klikkbar ut uten effekt; 0 treff på `docs/natt/*-DONE` i `src/`.

### Fase 7 — Forelder (6 økter)

Mål: hele forelderappen ferdig slik 26.08-beslutningen krever — lys **og** mørk. Koden er
portert (PR #648, kun TL-tokens), så fasen er riggrader, skjermbilder i begge moduser (mørk er
aldri sett i nettleser), én canvas, og rydding på en flate som viser data om mindreårige.

Skjermer: FO-01 (+L) … FO-10 (+L) · FO-05/FO-07 (Betal-knapp bevisst utelatt — dokumentert avvik) ·
FO-06 (varselvalg lagres ikke — lite felt bygges) · FO-10 («Merk alle som lest» — lite felt) · FO-08
(+ `/forelder/samtykke/deling/[childId]` som er en Claw-mal under /forelder — beslutning) ·
`/forelder/barn/[childId]` (ingen tegning — canvas) · de tre nye foreldre-booking-rutene fra 9.8
(levert 02.09: `/forelder/bookinger/ny`, `/ny/[barnId]`, `/bekreft`) signeres mot BO-01/BO-03-gjenbruken ·
`side-tilstand.tsx` slutter å laste `ak-golf.css`/`marked-kit.css` (AK Golf-tokens på en produktrute) ·
død kode `approval-card.tsx`, `minor-gate.tsx`, `parent-comm.tsx` fjernes · security-review.

Krever fra Anders: kan Claw-malen stå under /forelder (anbefalt: dokumentert unntak) · canvas-ja for
barn/[childId] · FO-serien på iPad/Mac = sentrert 560-kolonne uten ny tegning: ja/nei.

Ferdig når: FO-01–FO-10 har riggrad i mørk og lys; skjermbilder i begge moduser er dokumentert i
MASTERPLAN 10.3; barn/[childId] er portert mot godkjent canvas; security-review uten åpne funn.

### Fase 8 — iPad som tredje skall (12 økter, kun etter FULL og beslutning)

Koden har to skall (mobil under 768, desktop fra 768); tegningene og prototypen har tre. Første
halvdel er å samle brekkpunktene til én kilde (`TL_BREKK`; i dag minst ni ulike tall i koden),
så ett skall i `shell.tsx` (dock / tab bar øverst + 560-kolonne / skinne 250 / Mac-rail), så
skjermene som faktisk har iPad-tegning (45 filer): B2 PH-01/04/05/10/17, B4, PH-01e (e5–e6),
WB-02 (kanon for Workbench-brekk, siteres 0 steder i dag), A-12, AG-16 (kun etter en AgencyOS-
iPad-ramme finnes — AX-01 har bare iPhone og Mac), S3-02, TE-13/TE-02, TM-01/02/04/11 (834).

Krever fra Anders: er iPad et skall i produktet, og når (anbefalt: etter FULL, skallet først) ·
tallene: iPad smal 768 eller 834, Mac-grense 1101 eller 1180 · AgencyOS-meny på iPad = Mac-rail til
en AX-01-iPad-ramme er tegnet.

## 5. Tre ferdig-punkter for hele porten

1. **Røyk-kjeden er signert og voktet.** Alle 17 skjermer en betalende spiller og coachen
   klikker gjennom i Ø16 har riggrad, skjermbilde 390/1280 × lys/mørk med Anders' «sett», Ø16 er
   grønn, og demo-sløyfen kjører grønt som automatisk test i CI (uten Stripe-kall).
2. **Sitert er bygget.** Hver tegning som ikke står i «Ikke i planen» (§7) siteres fra kode, og en
   vakt i verify gir 0 filer som siterer en tegning uten riggrad eller avviksliste; riggen har
   ≥ 120 rader og 0 «ukalibrert på grunn av utdatert tegning»; 0 treff på `designsystem/paper`,
   `data-paper-slug` og `docs/natt/*-DONE` i `src/`; design-audit ≥ 8,0 for hver skjermfamilie
   under portal, admin og forelder (laveste i dag 3,2).
3. **Vaktene holder porten én vei.** Verify og CI kjører ingen-paper, bredde-gate, kontrast
   (rapport), signalfarge-tellevakt og dekningsvakt; den nattlige målingen feiler ved drift over
   baseline + 2 prosentpoeng; lys+mørk-røyktesten er grønn for hver rute; de døde Paper-verktøyene
   er borte.

## 6. Beslutningene Anders må ta — i den rekkefølgen de trengs

Ingen før fase 1. Hver fase åpner med én melding med bare sine punkter.

| Nr | Trengs før | Spørsmål | Anbefaling |
|---|---|---|---|
| 1 | Fase 2 | Kø 28: årspris-id i Vercel prod + ekte kjøp (handling) | Gjør det man 08.09 |
| 2 | Fase 2 | Kø 29: milepæl 11.09 eller 24.09 | 24.09 (11.09 krever tre spor) |
| 3 | Fase 2 | TALENT-sonde for skjermbilde av /oppgrader/flyt | Ja |
| 4 | Fase 2 | ME-03: ny canvas eller signer dagens kode | Ny canvas |
| 5 | Fase 2 | Flyt for coach-publisert økt fra I dag | Behold dagens side før lansering |
| 6 | Fase 2 | Utgått-merking av PH-15, gammel DG-01, A-07, A-08, AG-05, AG-13 | Ja |
| 7 | Fase 6 | **AgencyOS-menyen: AX-01 (kode) eller prototypens fem faner** | AX-01 står; prototypen rettes |
| 8 | Fase 6 | Ø15: Kommunikasjon under Kø eller Meg | Under Kø |
| 9 | Fase 3 | Hvor coachen ser Godta/Avslå | Stall-prikk |
| 10 | Fase 4 | PEI: ett tall merket estimat, eller definer regningen | Ett tall, estimat |
| 11 | Fase 4 | Gapping: TE-09 eller Analyse Gapping | TE-09, under Analyse |
| 12 | Fase 4 | Kø 27: spillerens årsplan | Dagens canvas er årsplanen |
| 13–17 | Fase 5 | BO-02, PH-09, ark vs side, fire IA-svar, kø 30 | Se fase 5 |
| 18–21 | Fase 6 | A-serie-nyansen, AG-01/02/14/15, KA-01, A-18/A-04, AO-brytere | Se fase 6 |
| 22–24 | Fase 7 | Claw-mal under /forelder, canvas barn, FO på iPad/Mac | Se fase 7 |
| 25–27 | Fase 8 | iPad ja/når, tallene, AgencyOS-meny på iPad | Etter FULL |

Registreres med `/beslutning` når Anders svarer, slik at de også havner i MASTERPLAN.

## 7. Ikke i planen (bevisst)

- Markedssidene (spor B, Master AK Golf) og `/team-norway/*` (Claw): egne spor.
- 9.8-utvidelser (Betal-knapp for foresatte, Stripe på vegne av barn): produktfunksjoner.
- DG-01 ny / DG-02 og de ~45 `/stats`-rutene: D5, etter lansering.
- AG-19 (D6), JV-01–03 / AO-13 / AO-06–07 / AO-12a–e / A-09 / P-08 (D7), WB-08 / WB-09 GRP / WB-10
  spillerside / A-10 gruppeøkt (D8), A-04b program-ghost, TM-12/13/14 og ME-01 kølletabell (D9),
  TM-08 med ekte hulldata og TM-09c/d/e (banedata), A-19b/c (16.10/16.11), EC-02 (Tripletex).
- «Situasjon M0–M5» og enhver Miljø-datamodell: utgått vokabular. Bygges aldri.
- PH-04 som ark, PH-20/RU-04/BO-03 som ark, «Fullført + Se recap» på I dag, Dynamic Type XL,
  MAT-01 hero: egne rader etter porten.
- PH-19 ombygging, LO-01 produktvelger, LO-02 mørk, W5-auth (15 ruter): spor D, etter FULL.
- STEG 5 «trenger canvas»-skjermene uten tegning (øvelser, fys, teknisk plan, mål m.fl.).
- FY-01: MASTERPLAN sier utgått, ingen beslutning finnes — venter på Anders.
- Full speiling av `proto/`: kun batch-oppføringene + én README-linje (fase 1). Zip-ens PORTING.md
  kopieres aldri. Ingen skjerm porteres fra proto-filene.
- Supabase-branch for skjermtest, nye avhengigheter, nye tokens.

## 8. Risikoer

1. **Tempo.** Anslaget forutsetter 2-timersøkter; siste ukes leveranser skjedde i nattøkter.
2. **Anders' ja er flaskehalsen** (~100 godkjenningspunkter). Mottiltak: én melding per fase,
   sign-off-rader uten beslutning først.
3. **Meny-konflikten** er uavgjort. Omtegnes AG-03/AG-04/AO-01 før svaret, tegnes de mot feil
   meny én gang til.
4. **Falsk fremdrift** fra dekningstallet. Planen bruker riggrader som eneste bevis.
5. **To øktmodeller** i samme I dag-kort — Ø16 går rett gjennom det (beslutning 5).
6. **Riggen måler bare på én maskin** til den nattlige jobben finnes (fase 1).
7. **Fixture-drift** (seed regner fra i dag, riggen fryser 22.08) — fase 1 punkt 3 må gjøres først.
8. **PR #771** er utkast og urørt siden 03.09; hovedmappa står på en gren med 151 ukommitterte
   filer — start alltid fra origin/main.
9. **Claude Design** svarte 403 i denne økten; hver «tegn før bygg»-rad stopper uten `/design-login`.
10. **Dokumentene lyver** flere steder (10.3, 10.10, 2.12 TE-12/P-03, Ø5, HANDOFF:221/263). Fase 1
    retter de kjente; hver senere fase retter radene den berører.

## 9. Etter godkjenning

Fase 1 får en egen oppgaveplan i `writing-plans`-format (test først, små steg, commit per steg)
før koding. Hver fase deretter det samme. Planen og beslutningene føres inn i MASTERPLAN som
nummererte rader (STEG 2.14) med `/beslutning`.
