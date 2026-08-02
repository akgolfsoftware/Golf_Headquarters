# Fase 4 — token-gap-analyse: hva `T` mangler før bølge 1

Målt 2026-08-02 på `main` @ `a1c41fed`. Ingen kode endret. Ingen token-fil rørt.

Spørsmålet dokumentet svarer på: **hvor mange nye tokennavn trengs egentlig** for at de
hardkodede fargene i inline style kan konverteres til `T.`-referanser uten at noen finner
på nye hex-verdier underveis.

Kortsvaret: **færre enn fryktet på farge, flere enn ventet på gjennomsiktighet.**
Bare 16 solide farger (32 forekomster) mangler et hjem. Men 102 av 118 umatchede verdier er
*gjennomsiktighets-varianter* av farger som allerede finnes — 27 ulike hvit-nivåer og 11
ulike svart-nivåer. Det er ikke 102 nye tokennavn; det er én manglende alpha-skala.

---

## 0. Metode og forbehold — les dette først

### Slik er det målt

`scripts/tmp-gap-*.mjs` (slettet før PR, gjengitt i §8). Alle `.tsx` under `src/` fra
`git ls-files`. Hvert `style={{ … }}`-uttrykk hentes ut med brace-matching som hopper over
strenger og escapede tegn — ikke linje-grep. I hvert uttrykk letes det etter
`#rgb`/`#rrggbb`/`#rrggbbaa` og `rgb()`/`rgba()`/`hsl()`/`hsla()` med tallargumenter.
Verdier normaliseres: hex til små bokstaver, 3/4-tegns kortform utvidet, `rgb()` til hex,
alpha tallnormalisert (`0.10` og `0.1` er samme verdi, skrives `#ffffff @a=0.1`).

CSS-siden indekseres fra sju filer (§1). En variabel regnes som **treff** bare når hele
verdien er nettopp den fargen (`--sand-0: #FFFFFF`), ikke når fargen inngår i en skygge
eller gradient — der er den ikke gjenbrukbar som fargetoken.

### Målte hovedtall

| Størrelse | Målt |
|---|---|
| `.tsx`-filer skannet | 1 400 (`git ls-files 'src/**/*.tsx'`) |
| `style={{ … }}`-uttrykk totalt | **13 947** |
| …med minst én hardkodet farge | **348** |
| Fargeliteraler i inline style | **419** |
| Unike normaliserte verdier | **139** |
| Filer med hardkodet farge i inline style | **132** |
| Fargeliteraler i `.tsx` uansett kontekst (hele filen) | 894 i 161 filer |
| …av disse i SVG-attributter (`fill=`/`stroke=`/`stopColor=`) | 91 i 10 filer |

### Avvik mot session 4 — må sies høyt

Session 4 rapporterte **568 forekomster / 698 literaler / 144 filer**, målt på `ef400f16`.
Den commiten er en forfar av dagens `main` og skiller seg på **3 `.tsx`-filer**. Kodebasen
er altså praktisk talt uendret, men tallene lar seg ikke reprodusere:

- Min måling i `style={{}}`: **419 literaler**.
- Alle fargeliteraler i hele `.tsx`-filer, uansett kontekst: **894**.
- Ingen av delene gir 698.

Session 4s fordeling per fil stemmer heller ikke: den oppgir
`stats/sg-sammenlign/start/skjema.tsx` med 70 literaler — filen har **8**. Og at
`admin/(legacy)` har 0 stemmer, men `components/admin` har 43 hos meg mot 44 hos dem.

Jeg vet ikke hvilken definisjon som gir 698, og gjetter ikke. **Tallene i dette dokumentet
er målt med metoden over, og det er de som gjelder for bølgeplanleggingen.** Konsekvensen
er praktisk: arbeidsmengden i bølge 1–3 er omtrent **60 %** av det session 4 anslo.

### Ting som IKKE er verifisert

- **Kjøretidseffekten av font-gapet (§5).** Dev-serveren startet ikke: `src/instrumentation.ts`
  kjører `validateEnv()`, og `.env.local` overstyrer dummy-env-en i denne økta. Hooken
  blokkerer all tilgang til `.env*`, så det lot seg ikke omgå. Font-avviket i §5 er målt
  som ren tekstsammenligning; hva nettleseren faktisk *rendrer*, er merket `[ikke verifisert]`.
- **Databasetall.** Supabase MCP krever OAuth og er utilgjengelig. Ingen DB-påstander her.
- **Designfasit.** Paper-biblioteket ligger ikke på disk. Ingen verdi her er sammenlignet
  mot designfasiten — dokumentet beskriver kun kodens egen tilstand.

---

## 1. Token-filene — hvor mange er det egentlig

Session 1 snakket om «fem filer». Målt finnes det **sju** filer med `--variabel: verdi`-
deklarasjoner, og den sjuende er viktig:

| Fil | Deklarasjoner (målt) | Scope |
|---|---|---|
| `src/app/globals.css` | 454 | `:root`, `.dark`, `[data-theme]`, `html[data-v2-tema]`, `@theme inline` |
| `src/styles/golfdata-tokens.css` | 161 | `.golfdata-scope` |
| `src/styles/wang-tokens.css` | 77 | `.wang-tp` |
| `src/styles/gfgk-junior-tokens.css` | 63 | `.gfgk-jr` |
| **`src/app/(marketing)/(mlegacy)/stats/stats.css`** | **21** | `:root` (811 linjer, mest komponentregler) |
| `src/styles/v2/patterns.css` | 2 | lokalt |
| `src/styles/v2/motion.css` | 0 | — |

Tellingen bekrefter session 1 for globals (454), golfdata (161) og gfgk (63). Wang måles til
77, ikke 78 — mitt uttrekk krever `;` på samme linje, så avviket er trolig en flerlinje-
deklarasjon, ikke en ekte forskjell.

### Rettelse: `--s-*` bor ikke i golfdata

Session 4 skrev at «`--s-*` leses 376 ganger fra JSX, altså er golfdata-tokensettet en
runtime-kontrakt». Halvparten stemmer. `--s-*` brukes **394 ganger** i `.tsx` (målt), men
de er **ikke** definert i `golfdata-tokens.css` — de bor i
`src/app/(marketing)/(mlegacy)/stats/stats.css` linje 8–29, under et helt vanlig `:root`.

21 deklarasjoner, hvorav 18 leses direkte fra JSX: `--s-bg --s-fg --s-muted-fg --s-card --s-border --s-border-strong --s-primary
--s-primary-fg --s-secondary --s-accent --s-accent-fg --s-x --s-r-sm --s-r-md --s-r-lg
--s-r-xl --s-r-2xl --s-shadow-sm/-md/-lg/-hover`.

Dette er en reell felle for porten: filen ligger inne i en rutegruppe (`(mlegacy)/stats`),
men deklarerer på `:root`, så tokenene lekker globalt hver gang en stats-rute er lastet.
Bølge 2 («mikrosites») må behandle stats.css som en egen paletteier, ikke som en del av
golfdata.

---

## 2. Alle 139 unike fargene — med treff eller «ingen match»

Full tabell. `N` = forekomster i inline style. Treff betyr at hele variabelverdien er
nøyaktig denne fargen.

| Verdi | N | Rå form(er) | Treff (variabel · fil:linje · scope) | Filer (topp 3) |
|---|---|---|---|---|
| `#000000 @a=0.5` | 34 | `rgba(0,0,0,0.5)` | **ingen match** | components/portal/v2/WorkbenchV2Sheets.tsx ×4<br>components/admin/v2/AdminGodkjenningDetaljV2.tsx ×2<br>components/admin/v2/AdminPlanMalRedigerV2.tsx ×2<br>*+24 filer* |
| `#000000 @a=0.35` | 19 | `rgba(0,0,0,0.35)` | **ingen match** | components/v2/overlays.tsx ×3<br>components/admin/v2/AdminGodkjenningDetaljV2.tsx ×1<br>components/admin/v2/AgencyLiveV2.tsx ×1<br>*+14 filer* |
| `#000000 @a=0.55` | 15 | `rgba(0,0,0,0.55)` | **ingen match** | components/admin/v2/AdminPlanMalRedigerV2.tsx ×2<br>components/admin/v2/AdminAvailabilityWeekGridV2.tsx ×1<br>components/admin/v2/AdminInviteParentButtonV2.tsx ×1<br>*+11 filer* |
| `#005840 @a=0.2` | 15 | `rgba(0,88,64,0.2)` `rgba(0,88,64,0.20)` | **ingen match** | app/(marketing)/stats/sg-sammenlign/start/skjema.tsx ×1<br>components/marketing/v2/MarkedCasesV2.tsx ×1<br>components/marketing/v2/MarkedCookiesV2.tsx ×1<br>*+12 filer* |
| `#ffffff` | 15 | `#fff` `#FFFFFF` | `--sand-0` · app/globals.css:160 · `:root`<br>`--on-signal` · app/globals.css:214 · `:root`<br>`--on-destructive` · app/globals.css:219 · `:root`<br>`--color-surface-card` · app/globals.css:450 · `@theme inline`<br>`--paper` · app/globals.css:490 · `@theme inline`<br>`--v2-panel` · app/globals.css:746 · `:root`<br>`--v2-on-lime` · app/globals.css:761 · `:root`<br>`--sand-0` · styles/golfdata-tokens.css:35 · `.golfdata-scope`<br>`--on-signal` · styles/golfdata-tokens.css:99 · `.golfdata-scope`<br>`--on-destructive` · styles/golfdata-tokens.css:105 · `.golfdata-scope`<br>`--surface-card` · styles/wang-tokens.css:28 · `.wang-tp`<br>`--white` · styles/wang-tokens.css:32 · `.wang-tp`<br>`--text-on-dark` · styles/wang-tokens.css:33 · `.wang-tp`<br>`--gfgk-white` · styles/gfgk-junior-tokens.css:16 · `.gfgk-jr` | components/v2/domene.tsx ×6<br>app/admin/gjennomfore/okter/[id]/page.tsx ×2<br>components/admin/v2/AdminCaddieAktivitetV2.tsx ×2<br>*+5 filer* |
| `#060706 @a=0.62` | 14 | `rgba(6,7,6,0.62)` | **ingen match** | components/portal/v2/WorkbenchV2Sheets.tsx ×4<br>components/portal/v2/WorkbenchV2.tsx ×2<br>app/admin/grupper/[id]/workbench/gruppe-aarsplan-klient.tsx ×1<br>*+7 filer* |
| `#ffffff @a=0.75` | 12 | `rgba(255,255,255,0.75)` | **ingen match** | app/gfgk-junior/_components/gfgk-footer.tsx ×7<br>app/auth/onboarding/forelder/forelder-wizard.tsx ×1<br>app/gfgk-junior/_components/treningspyramide.tsx ×1<br>*+3 filer* |
| `#005840 @a=0.55` | 11 | `rgba(0,88,64,0.55)` | **ingen match** | components/portal/v2/SamtykkeVenterV2.tsx ×2<br>components/portal/v2/BankIDV2.tsx ×1<br>components/portal/v2/CheckEmailV2.tsx ×1<br>*+7 filer* |
| `#ffffff @a=0.045` | 11 | `rgba(255,255,255,0.045)` | **ingen match** | components/marketing/v2/MarkedFaqV2.tsx ×1<br>components/marketing/v2/MarkedKontaktV2.tsx ×1<br>components/marketing/v2/MarkedPriserV2.tsx ×1<br>*+8 filer* |
| `#005840 @a=0.14` | 9 | `rgba(0,88,64,0.14)` | **ingen match** | components/portal/v2/BankIDV2.tsx ×1<br>components/portal/v2/CheckEmailV2.tsx ×1<br>components/portal/v2/ForgotPasswordV2.tsx ×1<br>*+6 filer* |
| `#ffffff @a=0.1` | 9 | `rgba(255,255,255,0.1)` `rgba(255,255,255,0.10)` | `--track` · app/globals.css:283 · `[data-theme="dark"]`<br>`--track` · styles/golfdata-tokens.css:195 · `.golfdata-scope [data-theme="dark"]` | app/admin/gjennomfore/okter/[id]/page.tsx ×2<br>app/team-wang/_components/wang-fellesside.tsx ×2<br>app/(marketing)/stats/aargang/page.tsx ×1<br>*+4 filer* |
| `#000000 @a=0.4` | 8 | `rgba(0,0,0,0.4)` `rgba(0,0,0,.4)` | **ingen match** | components/portal/v2/WorkbenchV2.tsx ×2<br>components/admin/v2/AgencyLiveV2.tsx ×1<br>components/meg/dispatch-ui.tsx ×1<br>*+4 filer* |
| `#000000 @a=0.45` | 8 | `rgba(0,0,0,0.45)` | **ingen match** | components/marketing/v2/MarkedPlayerHQV2.tsx ×1<br>components/portal/v2/AnalysereHullV2.tsx ×1<br>components/portal/v2/DelRundeV2.tsx ×1<br>*+5 filer* |
| `#ffffff @a=0.85` | 8 | `rgba(255,255,255,0.85)` | **ingen match** | app/gfgk-junior/_components/treningspyramide.tsx ×2<br>app/gfgk-junior/treningsplaner/treningsplaner-innhold.tsx ×2<br>app/gfgk-junior/gruppe/[gruppe]/gruppeplan-innhold.tsx ×1<br>*+3 filer* |
| `#ffffff @a=0.6` | 7 | `rgba(255,255,255,0.6)` | **ingen match** | app/gfgk-junior/treningsplaner/treningsplaner-innhold.tsx ×3<br>app/gfgk-junior/_components/treningsuke.tsx ×1<br>app/gfgk-junior/gruppe/[gruppe]/gruppeplan-innhold.tsx ×1<br>*+2 filer* |
| `#ffffff @a=0.7` | 7 | `rgba(255,255,255,0.7)` | **ingen match** | app/gfgk-junior/treningsplaner/treningsplaner-innhold.tsx ×2<br>app/admin/gjennomfore/okter/[id]/page.tsx ×1<br>app/gfgk-junior/_components/treningspyramide.tsx ×1<br>*+3 filer* |
| `#005840 @a=0.06` | 6 | `rgba(0,88,64,0.06)` | **ingen match** | app/(internal)/demos/plan-bygger/[steg]/page.tsx ×2<br>app/(internal)/demos/plan-bygger/page.tsx ×1<br>app/(marketing)/stats/sammenlign-spillere/spiller-sok.tsx ×1<br>*+2 filer* |
| `#e5e3dd` | 6 | `#E5E3DD` | `--color-line` · app/globals.css:458 · `@theme inline` | components/shared/calendar/AarsplanView.tsx ×2<br>app/onboard/coach/coach-wizard.tsx ×1<br>app/onboard/klubb/klubb-wizard.tsx ×1<br>*+2 filer* |
| `#ffffff @a=0.06` | 6 | `rgba(255,255,255,0.06)` | **ingen match** | app/(marketing)/stats/sammenlign-spillere/page.tsx ×1<br>app/(marketing)/stats/sg-sammenlign/page.tsx ×1<br>app/(marketing)/stats/sg-sammenlign/resultat/[id]/page.tsx ×1<br>*+3 filer* |
| `#ffffff @a=0.12` | 6 | `rgba(255,255,255,0.12)` | **ingen match** | components/stats/stats-wrapped-slide.tsx ×2<br>app/gfgk-junior/_components/gfgk-footer.tsx ×1<br>app/gfgk-junior/gruppe/[gruppe]/gruppeplan-innhold.tsx ×1<br>*+2 filer* |
| `#003a2a` | 5 | `#003A2A` | **ingen match** | app/onboard/coach/coach-wizard.tsx ×2<br>app/onboard/klubb/klubb-wizard.tsx ×2<br>components/sg-hub/SgTrainingScatter.tsx ×1 |
| `#f1eee5` | 5 | `#F1EEE5` | `--sand` · app/globals.css:488 · `@theme inline` | app/(internal)/demos/ny-okt/[steg]/page.tsx ×2<br>app/onboard/coach/coach-wizard.tsx ×1<br>app/onboard/klubb/klubb-wizard.tsx ×1<br>*+1 filer* |
| `#ffffff @a=0.15` | 5 | `rgba(255,255,255,0.15)` | **ingen match** | components/stats/stats-wrapped-player.tsx ×2<br>components/stats/stats-wrapped-slide.tsx ×2<br>app/gfgk-junior/gruppe/[gruppe]/gruppeplan-innhold.tsx ×1 |
| `#ffffff @a=0.96` | 5 | `rgba(255,255,255,0.96)` | **ingen match** | app/auth/onboarding/forelder/forelder-wizard.tsx ×2<br>components/portal/v2/BreakTabellV2.tsx ×2<br>components/portal/v2/PutteLabV2.tsx ×1 |
| `#005840 @a=0.25` | 4 | `rgba(0,88,64,0.25)` | **ingen match** | app/(marketing)/stats/turneringer/[slug]/page.tsx ×3<br>app/(marketing)/stats/sg-sammenlign/start/skjema.tsx ×1 |
| `#006c50` | 4 | `#006C50` | **ingen match** | app/onboard/coach/coach-wizard.tsx ×2<br>app/onboard/klubb/klubb-wizard.tsx ×2 |
| `#908d86` | 4 | `#908D86` | **ingen match** | app/onboard/klubb/klubb-wizard.tsx ×3<br>app/onboard/coach/coach-wizard.tsx ×1 |
| `#d1f843 @a=0.28` | 4 | `rgba(209, 248, 67, 0.28)` | `--color-pyr-spill-track` · app/globals.css:389 · `@theme inline` | components/portal/live/DrillLogger.tsx ×1<br>components/portal/live/LiveBrief.tsx ×1<br>components/portal/live/PlanSessionBrief.tsx ×1<br>*+1 filer* |
| `#ffffff @a=0.08` | 4 | `rgba(255,255,255,0.08)` | `--border` · styles/golfdata-tokens.css:169 · `.golfdata-scope [data-theme="dark"]` | app/gfgk-junior/_components/treningspyramide.tsx ×2<br>app/gfgk-junior/gruppe/[gruppe]/gruppeplan-innhold.tsx ×1<br>app/gfgk-junior/treningsplaner/treningsplaner-innhold.tsx ×1 |
| `#ffffff @a=0.14` | 4 | `rgba(255,255,255,0.14)` | `--border-strong` · app/globals.css:267 · `[data-theme="dark"]`<br>`--border-strong` · styles/golfdata-tokens.css:170 · `.golfdata-scope [data-theme="dark"]` | app/team-wang/coach/coach-arsplan.tsx ×1<br>components/auth/onboarding/wizard-fields.tsx ×1<br>components/marketing/v2/MarkedCasesV2.tsx ×1<br>*+1 filer* |
| `#ffffff @a=0.65` | 4 | `rgba(255,255,255,0.65)` | **ingen match** | app/gfgk-junior/gruppe/[gruppe]/gruppeplan-innhold.tsx ×2<br>app/auth/onboarding/forelder/forelder-wizard.tsx ×1<br>app/gfgk-junior/treningsplaner/treningsplaner-innhold.tsx ×1 |
| `#ffffff @a=0.9` | 4 | `rgba(255,255,255,0.9)` | **ingen match** | app/team-wang/_components/okt-detalj.tsx ×1<br>app/team-wang/_components/wang-fellesside.tsx ×1<br>app/team-wang/coach/coach-arsplan.tsx ×1<br>*+1 filer* |
| `#000000 @a=0.62` | 3 | `rgba(0,0,0,0.62)` | **ingen match** | components/admin/v2/AdminEmailV2.tsx ×1<br>components/admin/v2/AdminHandlingssenterV2.tsx ×1<br>components/admin/v2/AdminMarketingV2.tsx ×1 |
| `#005840` | 3 | `#005840` | `--forest-700` · app/globals.css:150 · `:root`<br>`--axis-fys` · app/globals.css:236 · `:root`<br>`--axis-fys-text` · app/globals.css:237 · `:root`<br>`--color-brand-primary` · app/globals.css:434 · `@theme inline`<br>`--forest` · app/globals.css:494 · `@theme inline`<br>`--v2-forest` · app/globals.css:758 · `:root`<br>`--v2-lime` · app/globals.css:760 · `:root`<br>`--v2-forest` · app/globals.css:807 · `html[data-v2-tema="dark"]`<br>`--forest-700` · styles/golfdata-tokens.css:23 · `.golfdata-scope`<br>`--axis-fys` · styles/golfdata-tokens.css:121 · `.golfdata-scope`<br>`--axis-fys-text` · styles/golfdata-tokens.css:122 · `.golfdata-scope` | app/(internal)/demos/plan-bygger/[steg]/page.tsx ×1<br>app/(internal)/demos/plan-bygger/page.tsx ×1<br>components/stats/stats-range-slider.tsx ×1 |
| `#0d0e0d @a=0.72` | 3 | `rgba(13,14,13,0.72)` | **ingen match** | components/portal/v2/OvelsesbankV2.tsx ×3 |
| `#5e8538` | 3 | `#5E8538` | **ingen match** | app/onboard/klubb/klubb-wizard.tsx ×2<br>app/onboard/coach/coach-wizard.tsx ×1 |
| `#88b45a` | 3 | `#88B45A` | **ingen match** | app/onboard/klubb/klubb-wizard.tsx ×2<br>app/onboard/coach/coach-wizard.tsx ×1 |
| `#fafaf7 @a=0.8` | 3 | `rgba(250,250,247,0.8)` | **ingen match** | app/(marketing)/stats/sammenlign-spillere/page.tsx ×1<br>app/(marketing)/stats/sg-sammenlign/page.tsx ×1<br>app/(marketing)/stats/sg-sammenlign/resultat/[id]/page.tsx ×1 |
| `#fafaf7 @a=0.88` | 3 | `rgba(250,250,247,0.88)` | **ingen match** | app/(marketing)/stats/2026/sesong-sticky-nav.tsx ×1<br>app/(marketing)/stats/sammenlign-spillere/page.tsx ×1<br>app/(marketing)/stats/sg-sammenlign/resultat/[id]/page.tsx ×1 |
| `#ffffff @a=0.5` | 3 | `rgba(255,255,255,0.5)` | **ingen match** | app/gfgk-junior/_components/treningspyramide.tsx ×2<br>app/gfgk-junior/treningsplaner/treningsplaner-innhold.tsx ×1 |
| `#ffffff @a=0.95` | 3 | `rgba(255,255,255,0.95)` | **ingen match** | components/portal/v2/BreakTabellV2.tsx ×2<br>components/auth/onboarding/wizard-fields.tsx ×1 |
| `#000000` | 2 | `rgba(0,0,0,1)` | **ingen match** | components/v2/core.tsx ×2 |
| `#005840 @a=0.22` | 2 | `rgba(0,88,64,0.22)` | **ingen match** | components/portal/v2/GuardianConsentV2.tsx ×2 |
| `#0a1f17 @a=0.05` | 2 | `rgba(10,31,23,0.05)` | **ingen match** | app/(marketing)/stats/sammenlign-spillere/resultat.tsx ×1<br>components/portal/drills/drill-detalj.tsx ×1 |
| `#0a1f17 @a=0.7` | 2 | `rgba(10, 31, 23, 0.70)` `rgba(10,31,23,0.7)` | **ingen match** | components/portal/live/LiveActive.tsx ×1<br>components/stats/stats-wrapped-player.tsx ×1 |
| `#0d0e0d @a=0` | 2 | `rgba(13,14,13,0)` | **ingen match** | components/marketing/v2/MarkedOmOssV2.tsx ×1<br>components/marketing/v2/MarkedTreningsfilosofiV2.tsx ×1 |
| `#0d0e0d @a=0.55` | 2 | `rgba(13,14,13,0.55)` | **ingen match** | components/marketing/v2/MarkedOmOssV2.tsx ×1<br>components/marketing/v2/MarkedTreningsfilosofiV2.tsx ×1 |
| `#222522` | 2 | `rgb(34,37,34)` | **ingen match** | components/v2/overlays.tsx ×2 |
| `#49ca9f @a=0.18` | 2 | `rgba(73,202,159,0.18)` | **ingen match** | app/team-wang/_components/wang-fellesside.tsx ×1<br>app/team-wang/coach/coach-arsplan.tsx ×1 |
| `#4fd08a @a=0.1` | 2 | `rgba(79,208,138,0.10)` | `--t-up-bg` · app/globals.css:119 · `.dark` | components/marketing/v2/MarkedKontaktV2.tsx ×1<br>components/portal/v2/GuardianConsentV2.tsx ×1 |
| `#d1f843` | 2 | `#D1F843` | `--lime` · app/globals.css:132 · `.dark`<br>`--lime-500` · app/globals.css:148 · `:root`<br>`--axis-spill` · app/globals.css:245 · `:root`<br>`--axis-spill` · app/globals.css:303 · `[data-theme="dark"]`<br>`--color-brand-accent` · app/globals.css:438 · `@theme inline`<br>`--lime` · app/globals.css:496 · `@theme inline`<br>`--v2-lime` · app/globals.css:809 · `html[data-v2-tema="dark"]`<br>`--v2-ax-spill` · app/globals.css:819 · `html[data-v2-tema="dark"]`<br>`--lime-500` · styles/golfdata-tokens.css:21 · `.golfdata-scope`<br>`--axis-spill` · styles/golfdata-tokens.css:130 · `.golfdata-scope`<br>`--axis-spill` · styles/golfdata-tokens.css:209 · `.golfdata-scope [data-theme="dark"]` | app/portal/(fullscreen)/live/[sessionId]/tapper/tapper-shell.tsx ×1<br>components/shared/calendar/AarsplanView.tsx ×1 |
| `#e8b43c @a=0.08` | 2 | `rgba(232,180,60,0.08)` | **ingen match** | components/marketing/v2/MarkedPersonvernV2.tsx ×1<br>components/marketing/v2/MarkedVilkarV2.tsx ×1 |
| `#e8b43c @a=0.35` | 2 | `rgba(232,180,60,0.35)` | **ingen match** | components/marketing/v2/MarkedPersonvernV2.tsx ×1<br>components/marketing/v2/MarkedVilkarV2.tsx ×1 |
| `#eef0ec @a=0.85` | 2 | `rgba(238,240,236,0.85)` | **ingen match** | components/marketing/v2/MarkedFaqV2.tsx ×1<br>components/marketing/v2/MarkedKontaktV2.tsx ×1 |
| `#f0683e @a=0.1` | 2 | `rgba(240,104,62,0.10)` | `--t-down-bg` · app/globals.css:121 · `.dark` | components/marketing/v2/MarkedKontaktV2.tsx ×1<br>components/portal/v2/GuardianConsentV2.tsx ×1 |
| `#fafaf7 @a=0.9` | 2 | `rgba(250,250,247,0.9)` | **ingen match** | app/(marketing)/stats/sg-sammenlign/page.tsx ×1<br>components/stats/stats-wrapped-player.tsx ×1 |
| `#ffffff @a=0.55` | 2 | `rgba(255,255,255,0.55)` | **ingen match** | app/admin/gjennomfore/okter/[id]/page.tsx ×1<br>app/gfgk-junior/_components/gfgk-footer.tsx ×1 |
| `#000000 @a=0.1` | 1 | `rgba(0,0,0,0.10)` | **ingen match** | components/shared/cookie-banner.tsx ×1 |
| `#000000 @a=0.2` | 1 | `rgba(0,0,0,0.2)` | **ingen match** | components/admin/v2/AgencyLiveV2.tsx ×1 |
| `#000000 @a=0.25` | 1 | `rgba(0,0,0,0.25)` | **ingen match** | components/v2/struktur.tsx ×1 |
| `#000000 @a=0.65` | 1 | `rgba(0,0,0,0.65)` | **ingen match** | components/athletic/golfdata/LFaseBadge.tsx ×1 |
| `#000000 @a=0.75` | 1 | `rgba(0,0,0,0.75)` | **ingen match** | components/marketing/v2/MarkedCoacherListeV2.tsx ×1 |
| `#005840 @a=0.04` | 1 | `rgba(0,88,64,0.04)` | **ingen match** | app/(internal)/demos/ny-okt/[steg]/page.tsx ×1 |
| `#005840 @a=0.05` | 1 | `rgba(0,88,64,0.05)` | **ingen match** | app/(marketing)/stats/turneringer/[slug]/page.tsx ×1 |
| `#005840 @a=0.08` | 1 | `rgba(0,88,64,0.08)` | **ingen match** | app/(marketing)/stats/sg-sammenlign/start/skjema.tsx ×1 |
| `#005840 @a=0.16` | 1 | `rgba(0,88,64,0.16)` | `--v2-vignett` · app/globals.css:800 · `html[data-v2-tema="dark"]` | components/v2/core.tsx ×1 |
| `#005840 @a=0.18` | 1 | `rgba(0,88,64,0.18)` | **ingen match** | app/(internal)/demos/ny-okt/[steg]/page.tsx ×1 |
| `#005840 @a=0.35` | 1 | `rgba(0,88,64,0.35)` | **ingen match** | components/portal/v2/LoginV2.tsx ×1 |
| `#005840 @a=0.45` | 1 | `rgba(0,88,64,0.45)` | `--v2-forest-soft` · app/globals.css:808 · `html[data-v2-tema="dark"]` | components/v2/domene.tsx ×1 |
| `#005840 @a=0.6` | 1 | `rgba(0,88,64,0.6)` | **ingen match** | components/v2/domene.tsx ×1 |
| `#005840 @a=0.7` | 1 | `rgba(0,88,64,0.7)` | **ingen match** | app/(marketing)/stats/sg-sammenlign/resultat/[id]/page.tsx ×1 |
| `#006b4f` | 1 | `#006B4F` | **ingen match** | app/(internal)/demos/plan-bygger/[steg]/page.tsx ×1 |
| `#0a1f17` | 1 | `#0A1F17` | `--color-coach-sidebar` · app/globals.css:401 · `@theme inline`<br>`--ink` · app/globals.css:492 · `@theme inline` | components/portal/live/LiveSessionShell.tsx ×1 |
| `#0a1f17 @a=0.02` | 1 | `rgba(10,31,23,0.02)` | **ingen match** | components/portal/drills/drill-detalj.tsx ×1 |
| `#0a1f17 @a=0.06` | 1 | `rgba(10,31,23,0.06)` | **ingen match** | app/(marketing)/stats/sg-sammenlign/start/skjema.tsx ×1 |
| `#0a1f17 @a=0.08` | 1 | `rgba(10,31,23,0.08)` | **ingen match** | components/stats/stats-big-radar.tsx ×1 |
| `#0a1f17 @a=0.1` | 1 | `rgba(10,31,23,0.1)` | **ingen match** | app/(marketing)/stats/sg-sammenlign/start/skjema.tsx ×1 |
| `#0a1f17 @a=0.2` | 1 | `rgba(10,31,23,0.2)` | **ingen match** | components/stats/stats-wrapped-player.tsx ×1 |
| `#0a1f17 @a=0.92` | 1 | `rgba(10, 31, 23, 0.92)` | **ingen match** | components/portal/live/LiveActive.tsx ×1 |
| `#0a1f18 @a=0.62` | 1 | `rgba(10,31,24,0.62)` | **ingen match** | app/portal/(fullscreen)/live/[sessionId]/tapper/tapper-shell.tsx ×1 |
| `#0d0e0d @a=0.15` | 1 | `rgba(13,14,13,0.15)` | **ingen match** | components/marketing/v2/MarkedBloggDetaljV2.tsx ×1 |
| `#0d0e0d @a=0.18` | 1 | `rgba(13,14,13,0.18)` | **ingen match** | components/marketing/v2/MarkedTurneringerListeV2.tsx ×1 |
| `#0d0e0d @a=0.85` | 1 | `rgba(13,14,13,0.85)` | **ingen match** | components/marketing/v2/MarkedBloggDetaljV2.tsx ×1 |
| `#0d2218` | 1 | `#0d2218` | **ingen match** | components/portal/live/LiveSessionShell.tsx ×1 |
| `#111111` | 1 | `#111` | **ingen match** | components/admin/v2/AdminEmailTemplateEditorV2.tsx ×1 |
| `#12271e` | 1 | `#12271E` | **ingen match** | components/portal/live/LiveActive.tsx ×1 |
| `#151715 @a=0` | 1 | `rgba(21,23,21,0)` | **ingen match** | components/portal/v2/SamtykkeVenterV2.tsx ×1 |
| `#1a7d56` | 1 | `#1A7D56` | `--ok` · app/globals.css:499 · `@theme inline`<br>`--up` · app/globals.css:500 · `@theme inline` | components/portal/live/LiveActive.tsx ×1 |
| `#4fd08a @a=0.12` | 1 | `rgba(79,208,138,0.12)` | **ingen match** | components/portal/v2/ForgotPasswordV2.tsx ×1 |
| `#4fd08a @a=0.3` | 1 | `rgba(79,208,138,0.30)` | **ingen match** | components/portal/v2/GuardianConsentV2.tsx ×1 |
| `#5aa9f0 @a=0.14` | 1 | `rgba(90,169,240,0.14)` | **ingen match** | components/marketing/v2/MarkedCasesV2.tsx ×1 |
| `#78350f` | 1 | `#78350f` | **ingen match** | components/portal/live/LiveActive.tsx ×1 |
| `#7f1d1d` | 1 | `#7F1D1D` | `--color-chip-alert-fg` · app/globals.css:411 · `@theme inline` | components/stats/stats-quiz-card.tsx ×1 |
| `#84d2a5` | 1 | `#84D2A5` | `--success` · styles/golfdata-tokens.css:190 · `.golfdata-scope [data-theme="dark"]` | components/portal/live/LiveActive.tsx ×1 |
| `#8a9940` | 1 | `#8A9940` | **ingen match** | components/stats/stats-big-radar.tsx ×1 |
| `#a32d2d @a=0.08` | 1 | `rgba(163,45,45,0.08)` | **ingen match** | app/(marketing)/stats/sg-sammenlign/start/skjema.tsx ×1 |
| `#a32d2d @a=0.3` | 1 | `rgba(163,45,45,0.3)` | **ingen match** | app/(marketing)/stats/sg-sammenlign/start/skjema.tsx ×1 |
| `#b8852a @a=0.1` | 1 | `rgba(184, 133, 42, 0.10)` | **ingen match** | components/portal/guardian-consent-banner.tsx ×1 |
| `#b8852a @a=0.3` | 1 | `rgba(184, 133, 42, 0.30)` | **ingen match** | components/portal/guardian-consent-banner.tsx ×1 |
| `#b8852a @a=0.4` | 1 | `rgba(184, 133, 42, 0.40)` | **ingen match** | components/portal/guardian-consent-banner.tsx ×1 |
| `#b8e020` | 1 | `#B8E020` | **T:** `T.wrapped.bgLime[1]` | components/stats/stats-quiz-card.tsx ×1 |
| `#c2ee2f` | 1 | `#C2EE2F` | `--color-brand-accent-hover` · app/globals.css:439 · `@theme inline` | app/portal/(fullscreen)/live/[sessionId]/tapper/tapper-shell.tsx ×1 |
| `#d1f843 @a=0` | 1 | `rgba(209,248,67,0)` | **ingen match** | app/portal/(fullscreen)/live/[sessionId]/tapper/tapper-shell.tsx ×1 |
| `#d1f843 @a=0.06` | 1 | `rgba(209,248,67,0.06)` | **ingen match** | components/marketing/v2/MarkedStatsVerktoyV2.tsx ×1 |
| `#d1f843 @a=0.1` | 1 | `rgba(209,248,67,0.10)` | **ingen match** | components/coachhq/agent-strip.tsx ×1 |
| `#d1f843 @a=0.12` | 1 | `rgba(209,248,67,0.12)` | `--color-accent-bg` · app/globals.css:441 · `@theme inline` | components/marketing/v2/MarkedCasesV2.tsx ×1 |
| `#d1f843 @a=0.18` | 1 | `rgba(209,248,67,0.18)` | **ingen match** | components/portal/statistikk/statistikk-hybrid.tsx ×1 |
| `#d1f843 @a=0.35` | 1 | `rgba(209,248,67,0.35)` | `--color-tab-active-bg` · app/globals.css:445 · `@theme inline` | components/marketing/v2/MarkedPriserV2.tsx ×1 |
| `#d83939 @a=0.08` | 1 | `rgba(216,57,57,0.08)` | **ingen match** | app/(internal)/demos/ny-okt/[steg]/page.tsx ×1 |
| `#d83939 @a=0.25` | 1 | `rgba(216,57,57,0.25)` | **ingen match** | app/(internal)/demos/ny-okt/[steg]/page.tsx ×1 |
| `#e8b43c @a=0.1` | 1 | `rgba(232,180,60,0.10)` | **ingen match** | components/portal/v2/GuardianConsentV2.tsx ×1 |
| `#e8b43c @a=0.14` | 1 | `rgba(232,180,60,0.14)` | **ingen match** | components/portal/v2/SamtykkeVenterV2.tsx ×1 |
| `#e8b43c @a=0.3` | 1 | `rgba(232,180,60,0.30)` | **ingen match** | components/portal/v2/GuardianConsentV2.tsx ×1 |
| `#eef0ec @a=0.6` | 1 | `rgba(238,240,236,0.6)` | **ingen match** | components/admin/v2/AdminCaddieDashbordV2.tsx ×1 |
| `#eef0ec @a=0.65` | 1 | `rgba(238,240,236,0.65)` | **ingen match** | components/admin/v2/AdminCaddieAktivitetV2.tsx ×1 |
| `#f0683e @a=0.3` | 1 | `rgba(240,104,62,0.30)` | **ingen match** | components/portal/v2/GuardianConsentV2.tsx ×1 |
| `#f5f4ee @a=0.85` | 1 | `rgba(245,244,238,0.85)` | **ingen match** | app/team-gfgk/_components/presentation.tsx ×1 |
| `#f7f7f4 @a=0.45` | 1 | `rgba(247,247,244,0.45)` | **ingen match** | components/portal/live/LiveActive.tsx ×1 |
| `#f7f7f4 @a=0.65` | 1 | `rgba(247,247,244,0.65)` | **ingen match** | components/portal/live/LiveActive.tsx ×1 |
| `#f87171` | 1 | `#F87171` | **ingen match** | components/stats/stats-quiz-card.tsx ×1 |
| `#fafaf7 @a=0.3` | 1 | `rgba(250,250,247,0.3)` | **ingen match** | components/stats/stats-wrapped-player.tsx ×1 |
| `#fafaf7 @a=0.7` | 1 | `rgba(250,250,247,0.7)` | **ingen match** | app/(marketing)/stats/2026/page.tsx ×1 |
| `#fafaf7 @a=0.78` | 1 | `rgba(250,250,247,0.78)` | **ingen match** | app/(marketing)/stats/turneringer/[slug]/page.tsx ×1 |
| `#fafaf7 @a=0.85` | 1 | `rgba(250,250,247,0.85)` | **ingen match** | app/(marketing)/stats/sg-sammenlign/resultat/[id]/page.tsx ×1 |
| `#fee2e2` | 1 | `#FEE2E2` | **ingen match** | components/stats/stats-quiz-card.tsx ×1 |
| `#fef3c7` | 1 | `#fef3c7` | **ingen match** | components/portal/live/LiveActive.tsx ×1 |
| `#ffffff @a=0.04` | 1 | `rgba(255,255,255,0.04)` | **ingen match** | components/portal/v2/OvelsesbankV2.tsx ×1 |
| `#ffffff @a=0.05` | 1 | `rgba(255,255,255,0.05)` | **ingen match** | components/marketing/v2/MarkedPlayerHQV2.tsx ×1 |
| `#ffffff @a=0.07` | 1 | `rgba(255,255,255,0.07)` | **ingen match** | app/gfgk-junior/gruppe/[gruppe]/gruppeplan-innhold.tsx ×1 |
| `#ffffff @a=0.18` | 1 | `rgba(255,255,255,0.18)` | **ingen match** | components/portal/v2/BookingV2.tsx ×1 |
| `#ffffff @a=0.22` | 1 | `rgba(255,255,255,0.22)` | **ingen match** | components/v2/spesialviz.tsx ×1 |
| `#ffffff @a=0.28` | 1 | `rgba(255,255,255,0.28)` | **ingen match** | app/gfgk-junior/page.tsx ×1 |
| `#ffffff @a=0.35` | 1 | `rgba(255,255,255,0.35)` | **ingen match** | app/gfgk-junior/treningsplaner/treningsplaner-innhold.tsx ×1 |
| `#ffffff @a=0.4` | 1 | `rgba(255,255,255,0.4)` | **ingen match** | app/gfgk-junior/page.tsx ×1 |
| `#ffffff @a=0.8` | 1 | `rgba(255,255,255,0.8)` | **ingen match** | components/portal/v2/PutteLabV2.tsx ×1 |
| `#ffffff @a=0.82` | 1 | `rgba(255,255,255,0.82)` | **ingen match** | components/portal/v2/BreakTabellV2.tsx ×1 |
| `#ffffff @a=0.88` | 1 | `rgba(255,255,255,0.88)` | **ingen match** | app/gfgk-junior/page.tsx ×1 |
| `#ffffff @a=0.92` | 1 | `rgba(255,255,255,0.92)` | **ingen match** | app/gfgk-junior/_components/gfgk-header.tsx ×1 |
| `#ffffff @a=0.98` | 1 | `rgba(255,255,255,0.98)` | **ingen match** | app/gfgk-junior/_components/gfgk-header.tsx ×1 |

---

## 3. De 118 uten match, gruppert

**118 unike verdier / 353 forekomster** har verken CSS-variabel eller `T`-nøkkel.
Delt i to helt ulike problemer:

| Gruppe | Unike | Forekomster |
|---|---|---|
| Gjennomsiktighets-varianter av eksisterende farger | **102** | **321** |
| Solide farger uten hjem | **16** | **32** |

### 3a. Alpha-familien — det egentlige hullet (321 av 353)

Dette er ikke 102 nye farger. Det er 21 basefarger ganget opp med tilfeldige
gjennomsiktighets-nivåer, ett per utvikler, én per dag.

| Basefarge | Unike alpha-trinn | Forekomster | Filer | Alpha-verdiene |
|---|---|---|---|---|
| `#ffffff` | 27 | 96 | 38 | 0.04, 0.045, 0.05, 0.06, 0.07, 0.12, 0.15, 0.18, 0.22, 0.28, 0.35, 0.4, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.82, 0.85, 0.88, 0.9, 0.92, 0.95, 0.96, 0.98 |
| `#000000` | 11 | 92 | 59 | 0.1, 0.2, 0.25, 0.35, 0.4, 0.45, 0.5, 0.55, 0.62, 0.65, 0.75 |
| `#005840` | 13 | 54 | 33 | 0.04, 0.05, 0.06, 0.08, 0.14, 0.18, 0.2, 0.22, 0.25, 0.35, 0.55, 0.6, 0.7 |
| `#060706` | 1 | 14 | 10 | 0.62 |
| `#fafaf7` | 7 | 12 | 7 | 0.3, 0.7, 0.78, 0.8, 0.85, 0.88, 0.9 |
| `#0d0e0d` | 6 | 10 | 5 | 0, 0.15, 0.18, 0.55, 0.72, 0.85 |
| `#0a1f17` | 8 | 10 | 6 | 0.02, 0.05, 0.06, 0.08, 0.1, 0.2, 0.7, 0.92 |
| `#e8b43c` | 5 | 7 | 4 | 0.08, 0.1, 0.14, 0.3, 0.35 |
| `#eef0ec` | 3 | 4 | 4 | 0.6, 0.65, 0.85 |
| `#d1f843` | 4 | 4 | 4 | 0, 0.06, 0.1, 0.18 |
| `#b8852a` | 3 | 3 | 1 | 0.1, 0.3, 0.4 |
| `#49ca9f` | 1 | 2 | 2 | 0.18 |
| `#4fd08a` | 2 | 2 | 2 | 0.12, 0.3 |
| `#a32d2d` | 2 | 2 | 1 | 0.08, 0.3 |
| `#d83939` | 2 | 2 | 1 | 0.08, 0.25 |
| `#f7f7f4` | 2 | 2 | 1 | 0.45, 0.65 |
| `#0a1f18` | 1 | 1 | 1 | 0.62 |
| `#151715` | 1 | 1 | 1 | 0 |
| `#5aa9f0` | 1 | 1 | 1 | 0.14 |
| `#f0683e` | 1 | 1 | 1 | 0.3 |
| `#f5f4ee` | 1 | 1 | 1 | 0.85 |

Verst: **hvit i 27 forskjellige nivåer** fra 0.04 til 0.98, og **svart i 11 nivåer**.
Ingen av dem finnes som token. Tre av dem finnes tilfeldigvis (`#ffffff @a=0.08` =
`--border` i golfdata mørk, `@a=0.14` = `--border-strong`, `@a=0.1` = `--track`) — resten
er improvisasjon.

**Forslag: én alpha-skala, ikke 102 navn.** Sju trinn dekker 90 % av bruken:

| Foreslått `T`-nøkkel | Verdi | Formål | Dekker |
|---|---|---|---|
| `T.overlay` | `#000000 @a=0.5` | modal-bakteppe | 34 forekomster direkte, 92 med naboer |
| `T.overlayLett` | `#000000 @a=0.35` | ark/sheet-bakteppe | 19 |
| `T.skille` | `#ffffff @a=0.08` / `#000000 @a=0.08` | hårstrek i panel | ~15 |
| `T.flateSvak` | `#ffffff @a=0.06` | glass-panel bak innhold | ~18 |
| `T.tekstDempet` | `#ffffff @a=0.75` | sekundærtekst på mørk flate | 12 |
| `T.tekstSvak` | `#ffffff @a=0.6` | tertiærtekst på mørk flate | 7 |
| `T.merkeTint` | `#005840 @a=0.2` | forest-tint bak innhold | 15 |

Hjem: `--v2-overlay*`, `--v2-skille`, `--v2-flate-svak`, `--v2-tekst-dempet`,
`--v2-tekst-svak`, `--v2-merke-tint` i `src/app/globals.css` — samme blokk som de øvrige
`--v2-*` (linje 740–812), med mørk motpart i `html[data-v2-tema="dark"]`.

Merk at flere av disse *skal* ha forskjellig verdi i mørkt tema — det er hele poenget med å
tokenisere dem. Å skrive `rgba(255,255,255,0.75)` rett i JSX er nettopp grunnen til at
mørkt tema ble disjunkt (session 3).

### 3b. De 16 solide fargene uten hjem

| Verdi | N | Familie | Filer | Foreslått `T`-nøkkel | Hjem |
|---|---|---|---|---|---|
| `#003a2a` | 5 | illustrasjonsgradient (mørk forest) | `onboard/coach-wizard`, `onboard/klubb-wizard`, `sg-hub/SgTrainingScatter` | `T.illu.forestMork` | `T` (grafikk, ikke tema) |
| `#006c50` | 4 | illustrasjonsgradient (lys forest) | `onboard/*-wizard` | `T.illu.forestLys` | `T` |
| `#88b45a` | 3 | illustrasjonsgradient (oliven lys) | `onboard/*-wizard` | `T.illu.olivenLys` | `T` |
| `#5e8538` | 3 | illustrasjonsgradient (oliven mørk) | `onboard/*-wizard` | `T.illu.olivenMork` | `T` |
| `#908d86` | 4 | nøytralgrå | `onboard/*-wizard` | *ingen ny* — bruk `T.mut` | — |
| `#222522` | 2 | nøytral svart (`rgb(34,37,34)`) | `components/v2/overlays.tsx` | *ingen ny* — nærmest `--v2-panel3` mørk | — |
| `#000000` | 2 | nøytral svart | `components/v2/core.tsx` | *ingen ny* — `T.overlay` uten alpha | — |
| `#111111` | 1 | nøytral svart (`#111`) | `admin/v2/AdminEmailTemplateEditorV2` | *ingen ny* — e-postmal, hex er riktig her | — |
| `#0d2218` | 1 | flatgradient (live-økt) | `portal/live/LiveActive`, `LiveSessionShell` | `T.live.bgTopp` | `T` |
| `#12271e` | 1 | flatgradient (live-økt) | `portal/live/LiveActive` | `T.live.bgKant` | `T` |
| `#006b4f` | 1 | forest-variant | `(internal)/demos/plan-bygger` | *ingen ny* — interndemo, ikke prod | — |
| `#8a9940` | 1 | diagram-serie (oliven) | `components/stats/stats-big-radar` | `T.chartOliven` | `T` (ved siden av `chartFaint`) |
| `#78350f` | 1 | varsel (amber-900, Tailwind) | `portal/live/LiveActive` | `T.warnFg` | `--v2-warn-fg` i globals.css |
| `#fef3c7` | 1 | varsel (amber-100, Tailwind) | `portal/live/LiveActive` | `T.warnBg` | `--v2-warn-bg` i globals.css |
| `#f87171` | 1 | feil (red-400, Tailwind) | `components/stats/stats-quiz-card` | `T.downSoft` | `--v2-down-soft` i globals.css |
| `#fee2e2` | 1 | feil (red-100, Tailwind) | `components/stats/stats-quiz-card` | `T.downBg` | `--v2-down-bg` i globals.css |

Ingen verdier i denne listen faller i familiene **suksess**, **info** eller
**mikrosite-spesifikk** — de er allerede dekket av eksisterende tokens. Familiene fra
oppdraget som viste seg tomme, står som tomme.

**Fellen i `LiveActive.tsx:652`:** `background: "var(--amber-100, #fef3c7)"`. Variabelen
`--amber-100` finnes ikke i noen av de sju filene, så fallbacken *er* verdien. Mønsteret
`var(--finnes-ikke, #hex)` ser tokenisert ut og er det ikke. Bølge 3 må lete etter det
eksplisitt — det står ikke i noen hex-telling som «hardkodet».

### 3c. Verdier som allerede har hjem (21 unike, 66 forekomster)

Disse trenger **ingen nye navn** — bare et søk-og-erstatt:

- `#ffffff` (15) → `T.onForest` finnes allerede
- `#e5e3dd` (6) → `--color-line`
- `#f1eee5` (5) → `--sand` / `T.wrapped.bgOffwhite[1]`
- `#005840` (3) → `--forest-700` / `T.forest`
- `#d1f843` (2) → `--lime` / `T.lime`
- resten enkeltvis (se §2)

---

## 4. Geometri- og typeskala-gapet

Dette var pekt ut som «det mest sannsynlige stille bruddet». Målingen deler det i to, og
den ene halvdelen er bedre enn ventet:

### 4a. Radius — CSS-motparten finnes allerede, `T` bruker den bare ikke

`globals.css:784–790` deklarerer **`--v2-r-tag/-input/-row/-card/-panel/-sheet/-pill`** med
nøyaktig de samme verdiene som `T`. `T` hardkoder tallene i stedet for å peke på dem.

| `T`-nøkkel | Verdi | CSS-motpart | Identisk? | Inline-bruk |
|---|---|---|---|---|
| `rTag` | 8 | `--v2-r-tag: 8px` (globals:784) | ja | 6 |
| `rInput` | 12 | `--v2-r-input: 12px` (785) | ja | 3 |
| `rRow` | 12 | `--v2-r-row: 12px` (786) | ja | 63 |
| `rCard` | 20 | `--v2-r-card: 20px` (787) | ja | 69 |
| `rSheet` | 28 | `--v2-r-sheet: 28px` (789) | ja | 1 |
| `rPill` | 9999 | `--v2-r-pill: 9999px` (790) | ja | 27 |

**169 inline-forekomster** er altså allerede verdi-synkrone med CSS. De brekker bare hvis
noen endrer CSS-siden uten å endre `T` — og ingen test fanger det.

Konkurrentene finnes likevel: **28 radius-navn** i sju filer, med samme navn og ulik verdi
(`--radius-card` er 16px i golfdata og 26px i wang; `--radius-input` er 12px i golfdata og
16px i wang; `--radius-pill` er 9999px i golfdata og 20px et annet sted). Porten må ikke
prøve å slå disse sammen — de er scope-isolerte og eies av hver sin flate.

### 4b. Typeskala, gap, maxw, dur — ingen CSS-motpart

| `T`-nøkkel | Verdi | CSS-motpart | Inline-bruk |
|---|---|---|---|
| `gap` | 16 | `--space-4: 16px` finnes (globals:193) — men er **ikke** en `--v2-*` | **624** |
| `maxw` | 1120 | **ingen** — verdien 1120 finnes ikke i noen av de sju filene | 0 |
| `displayXl` | 36 | `--text-36: 2.25rem` = 36px (globals:180) | 0 |
| `numHero` | 56 | **ingen** (skalaen hopper 48 → 60) | 1 |
| `numLg` | 38 | **ingen** | 0 |
| `numMd` | 26 | **ingen** | 0 |
| `body` | 13.5 | **ingen** (`--text-13` er 13px) | 1 |
| `bodySm` | 12 | `--text-12: 0.75rem` = 12px | 0 |
| `caps` | 10 | **ingen** (`--text-11` er nærmest) | 0 |
| `capsSm` | 9 | **ingen** | 0 |
| `dur` | 180 | **ingen** (`--dur-fast` 120, `--dur-base` 200) | 14 |
| `ease` | `cubic-bezier(0.2,0,0,1)` | `--ease-standard` — **tegn for tegn identisk** | 21 |

**Hvor mange inline-forekomster ville brutt ved en CSS-side-endring?**

- Endres `--v2-r-*`: **169** forekomster fortsetter med gammel verdi.
- Endres `--space-4`: **624** `T.gap`-forekomster følger ikke etter. Dette er den største
  enkeltposten i hele analysen.
- Endres `--ease-standard`: **21** forekomster følger ikke etter.
- Typeskalaen: **2** forekomster (`numHero`, `body`) — hele skalaen er praktisk talt ubrukt
  fra JSX og er ren dødvekt i `T`.

Sum reell bruddflate: **816 inline-forekomster** som er verdikoblet til CSS uten noen
mekanisme som holder dem synkrone.

---

## 5. Font-gapet

`T.disp/ui/mono` er strenger. Sammenlignet tegn for tegn mot `--v2-font-*`
(`globals.css:781–783`), normalisert for mellomrom etter komma:

| | `T` | `--v2-font-*` | Avvik |
|---|---|---|---|
| display | `"Familjen Grotesk",Inter,system-ui,sans-serif` | `"Familjen Grotesk", Inter, system-ui, sans-serif` | **ingen** (kun mellomrom) |
| ui | `Inter,system-ui,sans-serif` | `Inter, system-ui, -apple-system, sans-serif` | **`-apple-system` mangler i `T`** |
| mono | `"JetBrains Mono",ui-monospace,monospace` | `"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace` | **`"SF Mono"` og `Menlo` mangler i `T`** |

### Det større problemet: `T` bruker fontnavn, CSS bruker next/font-variabelen

`layout.tsx:15–35` laster alle tre via `next/font/google` med `variable: "--font-inter"`,
`"--font-jetbrains-mono"`, `"--font-familjen-grotesk"`. Ingen av dem har `fallback`-
konfigurasjon. CSS-siden peker riktig:

```
globals.css:364  --font-sans:    var(--font-inter), system-ui, -apple-system, sans-serif;
globals.css:365  --font-display: var(--font-familjen-grotesk), system-ui, -apple-system, sans-serif;
globals.css:366  --font-mono:    var(--font-jetbrains-mono), ui-monospace, monospace;
```

`--v2-font-*` (781–783) gjør det derimot **ikke** — de skriver de rene navnene
`"Familjen Grotesk"`, `Inter`, `"JetBrains Mono"`, akkurat som `T`. `next/font` registrerer
skriftene under en generert familie (`__Inter_<hash>`), ikke under det rene navnet, så et
rent `Inter` treffer bare hvis brukeren tilfeldigvis har Inter installert lokalt.

Bruksomfanget gjør dette til den dyreste enkeltlinjen i hele analysen:
**`T.ui` 1 775 forekomster · `T.mono` 1 576 · `T.disp` 482 = 3 833 inline-forekomster**
mot `--font-mono` 310 · `--font-brand` 127 · `--font-body` 94 · `--font-display` 59 via
`var()`. To parallelle veier, og den mest brukte er den som ikke går via next/font.

`[ikke verifisert]` — at nettleseren faktisk faller tilbake til `system-ui` for de 3 833,
er en slutning fra hvordan `next/font` navngir familier, ikke en måling. Dev-serveren lot
seg ikke starte (§0). **Dette må verifiseres først i bølge 0** — det avgjør om det er en
kosmetisk opprydding eller en synlig feil på hver eneste skjerm.

---

## 6. «Bølge 0 ferdig» — én liste

Bølge 1 kan starte når alle punktene under er krysset av. Ikke en meny.

**Verifiser først (blokkerer resten av lista):**

- [ ] Start dev-serveren og mål `getComputedStyle(el).fontFamily` på ett element stylet med
      `T.ui` og ett med `var(--font-sans)`. Er de forskjellige, er §5 en ekte feil og
      fontfiksen går inn i bølge 0. Er de like, er den kosmetisk og kan utsettes.
      *(Krever fungerende `.env.local` — Anders må kjøre den, eller gi en økt tilgang.)*

**`src/lib/v2/tokens.ts` — endres til:**

- [ ] `disp`/`ui`/`mono` peker på `var(--v2-font-display/-ui/-mono)` i stedet for rene
      strenger, og `--v2-font-*` oppdateres til å peke på `var(--font-familjen-grotesk)`
      osv. — samme mønster som `globals.css:364–366`.
- [ ] `rTag`/`rInput`/`rRow`/`rCard`/`rSheet`/`rPill` beholder tallformen (169 forekomster
      bruker dem i aritmetikk), men får en kommentar med kilde-linjenummer i `globals.css`,
      og en enhetstest som feiler hvis tallene og `--v2-r-*` sprikker.
- [ ] `gap: 16` får samme test mot `--space-4` (624 forekomster).
- [ ] `ease` får samme test mot `--ease-standard` (21 forekomster).
- [ ] Sju nye alpha-nøkler: `overlay`, `overlayLett`, `skille`, `flateSvak`, `tekstDempet`,
      `tekstSvak`, `merkeTint` — alle som `var(--v2-*)`, ingen hex.
- [ ] Fire nye signalnøkler: `warnFg`, `warnBg`, `downSoft`, `downBg` — alle som `var(--v2-*)`.
- [ ] `T.illu` (fire nøkler: `forestMork`, `forestLys`, `olivenLys`, `olivenMork`) og
      `T.live` (`bgTopp`, `bgKant`) som hex, med samme begrunnelse som `T.wrapped`:
      illustrasjonsgrafikk, ikke tema. **`T.wrapped` røres ikke.**
- [ ] `T.chartOliven` som hex, ved siden av `chartFaint`.
- [ ] `maxw`, `displayXl`, `numLg`, `numMd`, `bodySm`, `caps`, `capsSm` — **0 bruk hver**.
      Beslutning kreves: enten slett dem, eller gi dem CSS-motpart. Ikke la dem stå som
      halvsanne tall. *(Anders' valg — ikke agentens.)*

**`src/app/globals.css` — endres til:**

- [ ] Sju `--v2-*` alpha-tokens, lys verdi på `:root` og mørk verdi i
      `html[data-v2-tema="dark"]`. Begge, ellers gjentas session 3-feilen.
- [ ] Fire `--v2-warn-fg/-bg`, `--v2-down-soft/-bg`, samme to steder.
- [ ] `--v2-font-*` (781–783) peker på next/font-variablene.

**Sikkerhetsnett før bølge 1 rører en eneste skjerm:**

- [ ] Enhetstest som leser `globals.css` og feiler hvis `--v2-r-*`, `--space-4` eller
      `--ease-standard` avviker fra `T`. Uten den er de 816 koblede forekomstene usikret.
- [ ] Lint-regel eller CI-steg som avviser nye fargeliteraler i `style={{}}` i `src/`.
      Hex-gaten ble fjernet 2026-07-26; uten en ny gate lekker det inn nye hex mens bølgene
      pågår, og bølge 3 blir aldri ferdig.
- [ ] Søk etter mønsteret `var(--finnes-ikke, #hex)` og før opp treffene som egen post.
      Målt til minst ett tilfelle (`--amber-100`); antallet totalt er **ikke målt**.

**Revidert arbeidsmengde etter måling:**

| Bølge | Session 4s anslag | Målt |
|---|---|---|
| 1 (topp 6 filer) | 250 literaler | **70** |
| 2 (mikrosites + marketing) | 141 | ~74 (`components/marketing` 45 + `app/(marketing)` 29) |
| 3 (komponentbibliotek + rest) | 307 i ~110 filer | **275 i ~110 filer** |
| **Sum** | **698** | **419** |

Rekkefølgen fra session 4 holder likevel ikke helt: de mest fargebelastede filene er ikke
marketing, men `app/gfgk-junior` (54 literaler), `components/portal` (115) og
`components/v2` (36). Bølge 1 bør være `app/gfgk-junior` + `app/onboard` — 76 literaler,
lav regresjonsrisiko, og de deler den samme hvit-alpha-familien, så alpha-skalaen får en
ekte prøve før den slippes løs på portalen.

---

## 7. Fordeling per fil og gruppe (målt)

**Per gruppe:**

| Gruppe | Literaler |
|---|---|
| `components/portal` | 115 |
| `app/gfgk-junior` | 54 |
| `components/marketing` | 45 |
| `components/admin` | 43 |
| `components/v2` | 36 |
| `app/(marketing)` | 29 |
| `app/onboard` | 22 |
| `components/stats` | 20 |
| `app/(internal)` | 12 |
| `app/team-wang` | 10 |
| `app/admin` | 9 |
| `app/portal` | 5 |
| `components/shared` | 5 |
| `app/auth` | 4 |

**Topp 15 filer (142 literaler = 34 %):**

| # | Fil | N |
|---|---|---|
| 1 | `app/gfgk-junior/treningsplaner/treningsplaner-innhold.tsx` | 14 |
| 2 | `app/onboard/klubb/klubb-wizard.tsx` | 13 |
| 3 | `components/portal/v2/GuardianConsentV2.tsx` | 12 |
| 4 | `app/gfgk-junior/gruppe/[gruppe]/gruppeplan-innhold.tsx` | 11 |
| 5 | `app/gfgk-junior/_components/gfgk-footer.tsx` | 10 |
| 6 | `components/portal/live/LiveActive.tsx` | 10 |
| 7 | `app/onboard/coach/coach-wizard.tsx` | 9 |
| 8 | `components/portal/v2/BreakTabellV2.tsx` | 9 |
| 9 | `components/v2/overlays.tsx` | 9 |
| 10 | `app/(marketing)/stats/sg-sammenlign/start/skjema.tsx` | 8 |
| 11 | `app/gfgk-junior/_components/treningspyramide.tsx` | 8 |
| 12 | `components/portal/v2/WorkbenchV2Sheets.tsx` | 8 |
| 13 | `components/v2/domene.tsx` | 8 |
| 14 | `components/portal/v2/SamtykkeVenterV2.tsx` | 7 |
| 15 | `app/(internal)/demos/ny-okt/[steg]/page.tsx` | 6 |

Ingen fil dominerer. Topp 6 er 70 literaler (17 %) — halen er lang, og det er derfor
CI-gaten (§6) betyr mer enn rekkefølgen på bølgene.

**Hvor fargene står (CSS-property):**

| Property | Literaler |
|---|---|
| `background` | 184 |
| `color` | 99 |
| `boxShadow` | 93 |
| `border` | 19 |
| `backgroundImage` | 8 |
| `borderColor` | 5 |
| øvrige | 11 |

At `boxShadow` er 93 av 419 forklarer alpha-dominansen: skygger er per definisjon
gjennomsiktig svart, og ingen av de sju filene har en skygge-skala som `T` kan peke på.
`globals.css` har `--sh-sm/-md/-lg/-forest` (505–511) og `--shadow-deck` (475), men `T` har
bare `segSkygge`.

I tillegg brukes navngitte farger i inline style: **`transparent` 315 ganger**,
`currentColor` 1, `green` 1. `transparent` trenger ikke token. `green` (i én fil) gjør det.

---

## 8. Måleskriptene

Tre midlertidige skript ble brukt og slettet før PR:

1. `tmp-gap-1-extract.mjs` — brace-matchende uttrekk av `style={{ … }}`, normalisering,
   gruppering per verdi og fil → `/tmp/gap-colors.json`
2. `tmp-gap-2-detail.mjs` — property-kontekst per literal + navngitte farger
3. `tmp-gap-3-match.mjs` — indekserer de sju CSS-filene og `T`s 20 hex-verdier, matcher

De kan gjenskapes fra beskrivelsen i §0. Ønskes de permanent (som grunnlag for CI-gaten i
§6), er `tmp-gap-3-match.mjs` den som bør bli et `scripts/check-token-gap.mjs`.
