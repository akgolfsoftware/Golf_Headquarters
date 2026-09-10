# Samling til main — grener og lagret arbeid 10.09.2026

Anders bestilte «Merge all to main». Samlingen tar utgangspunkt i `origin/main` på `50e64ae078ddcd0537070e07e0d90ffe3091becf` (DataGolf/GolfBox, PR #833).

## Hva som samles

- Fire lokale endringssett: `664ca2118`, `c43aabf22`, `0c645d3fc`, `706c21fd3`, samt de gjennomgåtte ukommitterte rettingene og designrapportene.
- Nyere DataGolf/GolfBox i main beholdes når eldre lokale filer overlapper.
- Kontrastretting i 150 filer fra `feat/steg-19-6-19-7-kontrast-tallhero`. Ingen font-, token-, navigasjons- eller databaseendring følger denne patchen. Dagens TallHero vises direkte og beholder #801-testene.
- Det lagrede GolfBox-tillegget for sesongvalg og historisk kalenderimport avstemmes mot #833. Scriptet inngår som kode; ingen import kjøres ved fletting.
- Seks historiske planredigeringer fra park-grenen bevares i arkiv. Tidligere fullførte planer blir ikke gjenåpnet.

Samlingen skjer i `codex/samlet-lanseringskontroll-2026-09-10`. Original arbeidsmappe og øvrige arbeidsmapper er bevart. De gamle grenene er vurdert etter faktisk kode, endringshistorikk og PR-utfall; antall commits fra `git cherry` er ikke brukt som bevis på manglende arbeid etter squash-fletting.

## Grenregnskap

| Gren | Kontrollert commit | Håndtering |
|---|---|---|
| `chore/paper-instruction-lock` | `e50249f90` | Funksjonsarbeid videreført gjennom #638, #639 og #681. Gamle designlåser er erstattet av gjeldende åpne designstatus; ingen gjeninnføring. |
| `claude/agency-workbench-uke-ui-c4d2a4` | `a0e12c87e` | Workbench-koden finnes i main-historikken og er videreutviklet. Nyere tilgang, publisering og lagring beholdes. |
| `claude/claw-batch3-prompt-204861` | `f920bea49` | Allerede i main, #719; grenens siste commit er samme som flettet PR. |
| `claude/fiks-dette-t1dvhw` | `e551a1d7a` | Allerede flettet i #695; siste commit samsvarer med PR. |
| `claude/landing-booking-design-plan-479794` | `7a512d10d` | Allerede flettet i #649; siste commit samsvarer med PR. |
| `claude/px6-agency-rest-fasit-iopubc` | `ba77a3ea5` | #659 lukket fordi arbeidet ble samlet i #668. Dagens kalenderdomene og skjermer beholdes. |
| `claude/px7-tilstander-brekk-4cp4nu` | `2d48d9b98` | #658 lukket fordi arbeidet ble samlet i #667. Nyere feil-/lastkomponenter beholdes. |
| `claude/teamnorway-wang-trainer-screens-4a5fa8` | `d10072ebe` | Historiske bølge N-statusdokumenter. Funksjonene er videreført i senere leveranser; gjeldende status beholdes. |
| `claude/workbench-launch-plan-7503ff` | `f35e93ecd` | Samme Workbench-grunnlag som agency-grenen, med historisk lanseringsplan. Nyere kode og gjeldende masterplan beholdes. |
| `claude/workbench-rls-policies-8b054b` | `49fa667b0` | Workbench-kode videreført. RLS-migrasjon og apply-script er identiske med main. Ingen databasekjøring. |
| `docs/steg-15-2-levert` | `0eed18274` | Allerede flettet i #696; gjeldende masterplan beholdes. |
| `feat/oppgaver-en-adresse-15-2` | `38e17bfc9` | Allerede flettet i #694; siste commit samsvarer med PR. |
| `feat/steg-15-9-plan` | `fd809450f` | Allerede flettet i #704; siste commit samsvarer med PR. |
| `feat/steg-19-6-19-7-kontrast-tallhero` | `1522d27e6` | 150 filer med kontrastretting tas inn. TallHero og fmtTall er erstattet av #801 sin fmtSluttverdi og tester. Kart/README allerede tatt inn. |
| `park/2026-09-08-opprydding` | `e4356c368` | Kart/README allerede tatt inn. Seks unike, fullførte fase-1-planer bevares under docs/arkiv/grenrester-2026-09-10/. De blir ikke aktive oppgaver. |
| `px/1-ph` | `3b70d5694` | Allerede flettet i #654; senere forbedringer i PlayerHQ beholdes. |
| `px/2-agency-wb` | `706047fd2` | Allerede flettet i #653; senere Workbench-forbedringer beholdes. |
| `px/5-forelder` | `b5a79a785` | Allerede flettet i #648; siste commit samsvarer med PR. |
| `px/6-agency-rest` | `896f7fc86` | #661 lukket med henvisning til samlet #668; ingen manglende selvstendig kodeleveranse. |
| `px/7-tilstander-brekk` | `aafd65aa0` | #660 lukket med henvisning til samlet #667; senere forbedringer beholdes. |
| `wip/paper-fase2-lagring-2026-08-19` | `fcc74a01a` | Historiske Paper-prototyper og galleriarbeid, erstattet av nyere design- og verktøyleveranser. Bevares i Git-historikk og lokal sikkerhetskopi. |
| `codex/datagolf-golfbox-complete` | `1fa3acb3a` | Flettet i #833, produksjon verifisert på `50e64ae07` før denne samlingen. Nye sesongrester inngår separat i samlingen. |
| `codex/prosjektopprydding-2026-09-10` | `706c21fd3` | Fire lokale endringssett og ukommittert arbeid samlet og avstemt mot main. |
| `codex/datagolf` | `706c21fd3` | Samme commit som prosjektoppryddingsgrenen, ingen egen kodeleveranse. |
| `main` | `50e64ae07` | Utgangspunkt og tidligere produksjonsversjon. Ekstern sluttstatus registreres i PR-en og publiseringskontrollen. |

PR-ene kan finnes under `https://github.com/akgolfsoftware/Golf_Headquarters/pull/<nummer>`. For de flettede grenene er siste grencommit sammenlignet med PR-ens head; det er ikke funnet senere commits på disse grenene.

## Midlertidig lagret arbeid (stash)

| Kilde | Vurdering |
|---|---|
| `09fc313ef` | Tidligere designlås og I dag-rettinger. Fremdriftsvilkår, hviletekst og synlige prikktilstander er allerede videreført. Dagens PH-01 fra senere PR-er beholdes. |
| `795df2ec5` | Historisk dokumentopprydding og lenkevakt. Videreført gjennom #614 og senere opprydding; dagens prosjektregister og lenkekontroll beholdes. |
| `1b56fe95f` | Stor, uavstemt skjemaversjon med endrede relasjonsnavn, 14 modeller utenfor dagens appskjema og manglende nyere modeller. Dette er ikke en godkjent skjemamigrasjon. Ingen del av dette databaseuttrekket anvendes. Chat-farger er allerede videreført gjennom senere designopprydding. |
| `6d12c1d9e` | Sesongstøtte, kalenderhelper og et ikke-sporet historikk-script. Nyttig kode tas inn etter avstemming med #833s identitet og synkronisering; ingen historiske data hentes eller skrives som del av samlingen. |

Alle fire stasher beholdes. Lokal sikkerhetskopi ligger i `/tmp/ak-hq-merge-backup-20260910/`: endrede filer med SHA-256, binær diff, Git-bundle, stash-differ og det ikke-sporede historikk-scriptet. Ingen hemmelige miljøfiler inngår i den eksporterte arbeidskopien.

## Kontroller og avgrensning

- Full `npm run verify`, 2 290 tester og de separate syntetiske databaseprøvene bestod på sluttkoden. Resultatene står i siste del av teknisk-lanseringskontroll-2026-09-10.md; tidligere tester på delversjoner er ikke brukt som sluttbevis.
- Kontrastprøve på faktisk rendret V2Feil og SamtaleFeil: 390 og 1440 px, lyst/mørkt. Ingen horisontal overflow eller endret knappestørrelse. Prøv igjen og Tilbake er fortsatt 44 px høye. Målt tekstkontrast i lys modus: feil-etikett 3,55 → 18,88; feilmelding på tonet flate 3,02 → 16,08. Dette er en begrenset komponentprøve med lokale standardfonter, ikke visuell godkjenning av alle berørte skjermer.
- Bilder og rårapporter fra den lokale komponentprøven ligger i `/tmp/ak-hq-contrast-proof/`, utenfor Git.
- Hemmelighetskontroll kjøres uten å skrive ut verdier. Produksjonsfunksjoner i databasen, faktiske betalinger, e-post og importjobber kjøres ikke av denne flettingen.
- Komplett lanseringsklarhet, Claude Design-leveransen og de konkret utestede eksterne reisene følges fortsatt i `docs/STATUS-NÅ.md` og `docs/MASTERPLAN-GJENSTAAENDE.md`.
