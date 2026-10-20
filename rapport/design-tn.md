# Designkontroll Team Norway (maskinsjekk, 05.10.2026)

Metode: statisk lesing av kode mot beslutningen (§TEAM NORWAY-APPEN BYTTER DESIGNSPRÅK, 22.09) og mot tegningen i Claude Design «Team Norway App delivery» (`bc3e41fc`, filen `Team Norway App.dc.html`, etag 1790916280654183, lest delvis: skall, TN-02 Oversikt, helper-logikk). Ingen skjermer er rendret eller målt i 390/1280 i denne kjøringen. «GRØNN» betyr derfor «kode og tokens følger beslutningen», ikke «Anders har sett den» (port 7).

Verifisert faktum: prosjektet «Team Norway App» finnes ikke under det navnet. Fasiten er `bc3e41fc` «Team Norway App delivery» (avledet av `3416f258`). Nøkkelfiler: `Team Norway App.dc.html` (hovedtegning), `Team Norway Workbench.dc.html`, `Team Norway DataGolf.dc.html`, `kildemateriale/restliste-01-10.md`. Eldre v1–v4 er historikk.

## Tellinger
- 36 `page.tsx` under `src/app/team-norway/`. 1 er ren redirect (`apparatet` → `/fagapparat`). 35 reelle skjermer.
- 30 av 35 bruker TnShell via `SkjermRamme`/`tn-registrerte-skjermer`/direkte `<TnShell>`. 0 håndbygde skall igjen blant de 35 (se unntak under).
- Status (statisk): GRØNN 27 · GUL 8 · RØD 0 i rutene (statisk, ±2). 1 RØD utenfor rutene: `TeamNorwayAppView` (gammel Claw-demo, nås på `/skjermer`).
- Hardkodede hex i `src/components/team-norway` + `src/app/team-norway`: 305 treff, alle i én fil (`components/team-norway/app/TeamNorwayAppView.tsx`, 1638 linjer). 0 treff i alle andre filer.
- Former og skygger: `--tn-radius-full` er satt til 0 og alle `--tn-shadow-*` til `none` (tokens-css 136–149). De ca. 18 kallstedene med `TN.radius.full` blir dermed firkantede uten å røres. Ingen skygge slipper gjennom. Ett hardkodet unntak: `wang-resultater/page.tsx:92` (`borderRadius: 999`).
- #1004: 252 filer, 34 commits, CONFLICTING, 159 commits bak main (se egen seksjon).

## De sju arbeidspunktene (beslutningen)
| # | Punkt | Status | Bevis |
|---|---|---|---|
| 1 | Nytt prosjekt «Team Norway App», tokens, skall, mobil 390 | GJORT (annet navn) | `bc3e41fc` «Team Norway App delivery» har tegning, skall, restliste. Ikke et eget prosjekt med navnet «Team Norway App» |
| 2 | Fire internskjermer tegnet om mot skallet, tokens i stedet for ~150 farger | GJORT i koden | Analyse, Lisens, Tilgang, Organisasjon bruker TnShell, 0 hex. De ~150 hex-ene som fantes lever nå bare i `TeamNorwayAppView.tsx` (305) |
| 3 | `team-norway-tokens.css`, Jost/Lato i layout | GJORT | `layout.tsx:14-26` Jost (300–600) + Lato; tokens-css 136–149 (hjørner 0·2·4, ingen skygger), 194–196 skrifter, rød `#D70232` (44), navy `#012B5D` (43) |
| 4 | `core.tsx`: radius.full firkantet, avatar kvadratisk, TnRail navy | GJORT via token | `core.tsx:151` avatar bruker `TN.radius.full` = 0; rail-bg = navy-900 (tokens 119). Ingen sirkler gjenstår i TN-komponentene |
| 5 | Fem skjermer med eget skall over på TnShell | GJORT, 2 unntak | `[groupId]`, `dokumenter`, `spiller/[spillerId]`, `tilgang` går via TnShell. `fellestesting/[deltakerId]/page.tsx:17` har eget `<div minHeight:100dvh>` uten skall (fokusmodus, bevisst?) |
| 6 | Maskinell måling 21 ruter, 390 + desktop, tom/laster/feil, 44 px, kontrast | IKKE GJORT (ikke funnet) | Ingen TN-måling i `tests/e2e` utover `bredde-gate.spec.ts` (kun noen TN-URL-er, linje 69–78) og p0-demospec. Ingen bevis per skjerm for 44 px/scrollWidth/tilstander. `tn-data-table.tsx:41` har `overflowX:auto` (brudd mot «aldri sidelengs rulling», selv om `tn-skjerm.module.css:186-189` har kortrad-løsning ≤900 px for egne tabeller) |
| 7 | Rett `LES-MEG.md` og `ak-merkevare`-skill | GJORT | `designsystem/team-norway/LES-MEG.md:3-12` har myndighetsmerknad; ak-merkevare-skillen sier «Claw er utgått» for /team-norway/* |

## Beslutningene i §ÉN IUP og §Åpne punkter (TN-delen)
- Wedge Gate teller treff: `portal-tester/tn-catalog.ts` wedge-gate: `blocked: undefined`, 9 slag, versjonert `tn-excel-v3-2026-10-02`; `tn-verified-rules.test.ts:16` låser 6/9. OK. Avvik mot restlisten: feltet heter «Både utslagsvinkel og carry innenfor sonen» med Ja/Nei, tegning/CLAUDE.md sier Treff/Ikke treff («X / 9 treff»). Kosmetisk.
- Nærspill Gate og VISA Express: sperre fjernet (`blocked: undefined` i RULES_VERSION). Strider ikke mot beslutning (poeng føres for hånd).
- 8-ball skala: `poeng8Ball()` brukt i `tn-scoring.ts:104`. OK.
- Sperrer som FORTSATT står og er forenlige med beslutningene: `9-hull-lengde` (måleenhet for målavstand, uavklart i beslutningen og i `bc3e41fc/CLAUDE.md`), `teknikktest-a/b` (motstrid i A/B, krever versjonert protokoll per restlisten pkt 7), `teknikktest-c` (Impact Location). Ingen sperre strider mot en beslutning.
- Fysisk testbatteri: ingen 3000 m/CMJ i `tn-catalog`. OK. MEN den døde `TeamNorwayAppView.tsx` viser «3000 meter løpetest» (6 treff), som beslutningen eksplisitt har overstyrt.
- IUP/utviklingssjekk, sesongevaluering, deling per organisasjon, tilstander (lagringsfeil/ingen tilgang/trukket), funksjonsregister X01–X18 (restlisten 01.10 pkt 1–6): ingen av dem finnes som egne TN-ruter i main. Utviklingssjekk nevnes kun i `tn-spillerprofil-skjerm.tsx` og `lib/domain/tn-arbeidsflate.ts`. «Kartleggingsskjerm for WANG-testdata» finnes ikke som egen skjerm; nærmeste er `wang-resultater/page.tsx` (ikke i menyen, `tnHovedmeny` i `tn-shell.tsx:56-125` har ingen lenke dit).

## Globale tokenavvik mot tegningen (påvirker ALLE ruter, derfor ikke satt per rute)
Kilde: tegningens `<style>` og skall-markup vs. `team-norway-tokens.css` i main. #1004 har allerede rettet dem («kontrollert 28.09.2026»).
- G1 Sidebakgrunn: tegning `#F2F7FC` (navy-50). Main `--tn-surface-page: var(--tn-ink-50)` = `#F6F8FA` (tokens-css:90). S
- G2 Aktiv rad i skinnen: tegning `#0A5199`. Main `#013B7D` (tokens-css:120). S
- G3 Skinnetekst/etiketter: tegning `#C9D6E5`/`#9FB6D1`. Main `#C6D6EA`/`#9DB4D0` (tokens-css:122-123). S
- G4 Skinnebredde: tegning 248 px. Main 252 (`core.tsx:292`; header-kommentar 25 påstår 252 «rettet mot» designsystemet). S
- G5 Innholdsbredde: tegning `max-width:1320px`. Main `--tn-max-content: 1160px` (tokens-css:183). S
- G6 Sidetittel: tegning Jost 300, `clamp(24px,3vw,36px)`, versaler, `letter-spacing:.1em`, navy. Ikke verifisert mot `tn-skjerm.module.css` (.tittel) i denne kjøringen. S

## Status per skjerm
Skjerm-ID følger tegningens/registerets TN-nummer der det er sikkert; ellers «—». Alle GRØNN er statisk vurdert (kode+tokens), ikke målt.

| ID | Rute | Kodefil | Status | Avvik | Innsats |
|---|---|---|---|---|---|
| TN-02 | /team-norway | `page.tsx` → `skjermer/tn-oversikt-skjerm.tsx` | GRØNN | Kun G1–G5. Tegningen har «Spillere som trenger deg» + «Delte spillere · samlet» (deling per organisasjon): ikke bekreftet i koden | S |
| TN-03 | /team-norway/fellestesting | `fellestesting/page.tsx` → `tn-fellestesting-skjerm.tsx` | GRØNN | G1–G5 | S |
| TN-03b | /team-norway/fellestesting/[deltakerId] | `fellestesting/[deltakerId]/page.tsx:17-28` | GUL | Eget `<div>` + `<main maxWidth:720>` uten TnShell/rail; skiller seg fra øvrige skjermer. Avklar om fokusmodus er tegnet | S |
| TN-14 | /team-norway/samlinger, /[id] | `samlinger/page.tsx`, `[id]/page.tsx` | GRØNN | G1–G5 | S |
| TN-15 | /team-norway/college | `college/page.tsx` | GRØNN | G1–G5 | S |
| TN-16 | /team-norway/manedsplan | `manedsplan/page.tsx` | GRØNN | G1–G5. Tegningens «avvik mot publisert plan» er ikke verifisert | S |
| TN-00 | /team-norway/spillere | `spillere/page.tsx` | GRØNN | G1–G5 | S |
| — | /team-norway/spiller/[id] (profil) | `spiller/[spillerId]/page.tsx` | GUL | Bruker TnShell men komponerer selv (141 linjer, `tn-post-komponer`); IUP-fane, deling per organisasjon og tilstandene «ingen tilgang/trukket» finnes ikke | L |
| — | /spiller/[id]/oversikt | `oversikt/page.tsx` → `tn-spillerprofil-skjerm.tsx` | GRØNN | G1–G5 | S |
| — | /spiller/[id]/analyse, /tester, /tester/[testId], /evaluering, /teknisk-plan(+[planId]) | respektive `page.tsx` | GRØNN (6) | TnShell + core + tn-data-table. `tester/[testId]/page.tsx` har skallet i `visning.tsx`. `tn-data-table.tsx:41` overflow-x:auto, se punkt 6 | M (målekontroll) |
| TN-06 | /team-norway/uttak | `uttak/page.tsx` | GRØNN | G1–G5 | S |
| TN-07 | /team-norway/rangliste | `rangliste/page.tsx` | GRØNN | G1–G5 | S |
| TN-08 | /team-norway/skoler | `skoler/page.tsx` | GRØNN | G1–G5 | S |
| TN-09 | /team-norway/[groupId] | `[groupId]/page.tsx` | GRØNN | G1–G5. `[groupId]/loading.tsx:11,50` håndbygd skjelett (skygge `var(--tn-shadow-sm)`=none, radius-full=0: OK i praksis) | S |
| TN-11 | /team-norway/[groupId]/dokumenter | `dokumenter/page.tsx` | GRØNN | G1–G5 | S |
| TN-04/05 | /protokoller, /protokoller/[id] | `protokoller/*` | GRØNN | G1–G5 | S |
| TN-13/17 | /turneringer, /[id], /ny | `turneringer/*` | GRØNN | G1–G5 | S |
| TN-21 | /referansenivaer | `referansenivaer/page.tsx` | GRØNN | G1–G5. Referanseverdi skal vises «—» til A–K er vedtatt (ikke sjekket) | S |
| — | /team-norway/fagapparat | `fagapparat/page.tsx` | GRØNN | G1–G5 | S |
| — | /team-norway/live-watch | `live-watch/page.tsx` | GRØNN | G1–G5 | S |
| — | /team-norway/lisens-okonomi | `lisens-okonomi/page.tsx` | GRØNN | G1–G5 | S |
| TN-18 | /team-norway/tilgang | `tilgang/page.tsx` → `tn-tilgang-visning.tsx:50` | GRØNN | TnShell med `flate="full"`. Beslutningen 28.09 (i #1004) sier «Tilgang og samtykke» skal slås sammen; ikke gjort i main | M |
| TN-19 | /team-norway/inviter | `inviter/page.tsx` | GUL | #1004-kommentar: «Utgått 28.09: Samtykke, Inviter spiller». Main har den fortsatt og i menyen (`tn-shell.tsx` admin-gruppe) | S |
| — | /team-norway/analyse | `analyse/page.tsx` | GUL | Train-lock med TN-skinn (dokumentert unntak i `lib/v2/team-norway.ts`); to parallelle token-sett | M |
| — | /team-norway/workbench | `workbench/page.tsx` (867 linjer) | GUL | Én stor inline-styled side; `:358` radius.full (OK via token). Ikke i designet «Team Norway Workbench.dc.html» sammenlignet i detalj | L |
| — | /team-norway/wang-resultater | `wang-resultater/page.tsx:92` | GUL | `borderRadius: 999` hardkodet (sirkel/pille mot beslutning); ikke lenket fra menyen (foreldreløs rute) | S |
| — | /team-norway/apparatet | `apparatet/page.tsx` | GRØNN | Redirect | – |
| — | `/skjermer` (katalog) | `app/skjermer/SkjermKatalog.tsx:30,323-393` + `components/team-norway/app/TeamNorwayAppView.tsx` | RØD | 1638 linjer Claw-demo: 305 hardkodede hex, Tailwind `rounded-full`, `shadow-2xs`/`shadow-md`, `ring-2`, `font-sans`, 4 `overflow-x-auto` (linje 394, 894, 1324, 1517), «3000 meter løpetest» (overstyrt), demodata («16 av 18»). Brukes av 6 katalogoppføringer (TN-01–06) og står i `lib/__tests__/ingen-demovisning-i-ruter.test.ts:26` | M (slette + oppdatere katalog/test) |
| — | Feil-/lastetilstander | `error.tsx:25`, `loading.tsx:19-24`, `tilgang/error.tsx:44` | GUL | Håndbygd inline-styling med `--tn-*`; fungerer, men ikke TnShell. Tilstandene lagringsfeil/ingen tilgang/trukket (restliste pkt 4) mangler | M |

Telling (35 reelle ruter): GUL = fellestesting/[deltakerId], spiller/[spillerId], spiller/[spillerId]/analyse, analyse, workbench, inviter, wang-resultater (7 ruter) pluss feil-/laste-sidene (regnet som 1) = 8. GRØNN = resten (27). RØD i ruter: 0. Tallene er statiske og kan flytte seg med ±2 etter måling.

## Vurdering av PR #1004 («WANG og Team Norway: skjermene portert til kode»)
Fakta (`gh pr view`, `git merge-tree`):
- Gren `claude/port-wang-tn-2026-09-29`, oppdatert sist 29.09 20:08, base 89b1ca974. 34 commits, 252 filer (+16 310/−1 485). 159 commits bak main.
- `mergeable: CONFLICTING`. CI «verify» var grønn 29.09 (på gammel base; ikke gyldig mot dagens main).
- 16 filkonflikter mot main, bl.a.: `beslutninger.md`, `(trener)/spiller/[spillerId]/post/page.tsx`, `(trener)/workbench/page.tsx`, `tn-testdag-actions.ts`, `tn-testforing-actions.ts`, `tn-fellestesting-skjerm.tsx`, `lib/domain/tn-post.ts`, plus WANG (`coach-arsplan.tsx`, `tester/page.tsx`, `wang-ruter-actions.test.ts`) og modify/delete-konflikter. #1004 flytter alle ruter til route-gruppen `(trener)` og sletter `tn-spillerprofil-skjerm.tsx`, som main har endret siden (IUP-innsyn 72004bb3a, navngitt deling c8a44556a/#1096, testbatteri 7cab6313e/c76f4e83f).
- ~101 av filene er WANG; main har siden fått hele WANG via #1181 («71 WANG-skjermer»). TN-andelen: ~116 filer, +3 172/−880.
- Innhold som er verdt noe og IKKE finnes i main: token-rettingene G1–G3 (`team-norway-tokens.css`, `navy200`), `tn-ruter.ts` (ett rutekart), `tn-daglig-spillere/` (kartlegging, etterlevelse, spiller-velger, «trenger deg»), `tn-uttak-plan-gruppe-admin/` (referanse-data, samtykke-data, tilstander, feiltilstand), `tn-flate-tilgang.ts` (+test), `logg-inn`, `kartlegging/page.tsx`.

Anbefaling: PLUKK DELER, FORKAST BRANCHEN. En rebase av 34 merge-commits med 16 konflikter og en rutegruppe-omflytting vil overskrive main-arbeid (IUP/deling/testbatteri) og er dyrere enn å hente filene individuelt. Plukk i denne rekkefølgen:
1. Token-diffen (`team-norway-tokens.css`, `team-norway.ts` navy200). Ren, ukontroversiell, løser G1–G3. S
2. `tn-uttak-plan-gruppe-admin/*` (referanse-data, samtykke-data, tilstander/feiltilstand): dekker restliste pkt 3–4 delvis. Nye filer, ingen konflikt. M
3. `tn-daglig-spillere/kartlegging*` + `kartlegging/page.tsx` (= «kartleggingsskjerm for WANG-testdata» i §ÉN IUP). Nye filer, men sjekk mot `wang-resultater`. M
4. `tn-ruter.ts` + `tn-flate-tilgang.ts` (+tester): vurder når menyen endres. S–M
5. IKKE ta: `(trener)`-gruppeflyttingen, alt i `team-wang`, endringene i `tn-testdag-actions`/`tn-testforing-actions`/`tn-post.ts` (konflikt med nyere main), sletting av `tn-spillerprofil-skjerm`.
Lag ny gren fra `origin/main` og `git checkout origin/claude/port-wang-tn-2026-09-29 -- <filer>` per punkt. Ikke merge PR-en.

## Anbefalt rekkefølge
1. Slett `components/team-norway/app/TeamNorwayAppView.tsx` og fjern de seks TN-oppføringene i `app/skjermer/SkjermKatalog.tsx:323-393` + linje 26 i `ingen-demovisning-i-ruter.test.ts`. Fjerner 305 hex, 3000 m-teksten og demo-data. (M)
2. Plukk token-diffen fra #1004 (G1–G3) og rett G4/G5 mot tegningen (248 px, 1320 px) etter at Anders har bekreftet at disse målene gjelder. (S)
3. Maskinell måling av alle TN-ruter (390 + 1280, tom/laster/feil, 44 px, scrollWidth===clientWidth); `tn-data-table.tsx:41` overflow-x. (M)
4. `fellestesting/[deltakerId]` inn i skallet eller dokumenter at fokusmodus er tegnet; `wang-resultater` rett `borderRadius:999` og legg i meny eller fjern. (S)
5. Plukk `tn-uttak-plan-gruppe-admin`, `kartlegging`, tilstandene lagringsfeil/ingen tilgang/trukket (restliste pkt 3–4). (M)
6. Nye skjermer fra restliste 01.10: utviklingssjekk 2027 (34/43/47/38, skala 1–5), sesongevaluering X04, deling per organisasjon, klikkbar reise, funksjonsregister X01–X18. Disse må tegnes ferdig/bekreftes i `bc3e41fc` først («Team Norway App.dc.html» er mottatt, ikke bygget ifølge restlisten). (L)
7. Workbench (867 linjer) mot `Team Norway Workbench.dc.html`. (L)

## Usikkerhet
- Jeg leste ikke hele tegningen (2585 linjer) og har ikke hentet full SCREENS-liste; TN-ID-er i tabellen er fra repoets register/kodekommentarer. Skjermspesifikke avvik utover skall og Oversikt er derfor ikke målt.
- G6 (sidetittel-typografi) er ikke sammenlignet linje for linje.
- Ingen render/måling; alle GRØNN er statiske.
