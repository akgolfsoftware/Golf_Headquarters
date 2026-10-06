# Dokumentliste — AK Golf HQ (DOKUMENTER, DO-)

Grunnlag: `main` på commit 9f39c7d44 (06.10.2026), lest i arbeidskopien `kodegjennomgang`. Bare lesing; ingen filer i repoet er endret.

Fasit brukt: master-ordboken (`docs/ordbok/ordbok-master-2026-10-06.md` på grenen `docs/ordbok-master`), `docs/treningsplanlegging.md`, Workbench-beskrivelsen (`docs/workbench/workbench-beskrivelse-2026-10-05.md` på grenen `docs/workbench-beskrivelse`, motsigelsene M7, M8, M13, M14, M16, M22, M27, M30 og D1–D54 i ordboken), `.claude/rules/beslutninger.md`. Beslutningene D-01–D-46 i Claude Design er ikke i repoet og er ikke brukt.

## Hva ble talt

- 766 Markdown-filer (`git ls-files *.md *.mdx`). 379 er listet enkeltvis under; 387 er samlet i grupperader (eksterne skill-pakker, RAG-korpus i koden, komponent-/mal-README i designsystem-speil).
- 48 andre tekstdokumenter i docs/ (json, txt, csv, sql, patch, html, svg, css, zip) er listet enkeltvis. Under `designsystem/` finnes i tillegg ca. 1 700 tegnings- og kildefiler (html, jsx, js, css, svg, thumbnail); de er ikke listet enkeltvis, men følger mappens status og telles i sletteforslagene. 58 PNG i `docs/skjermbilder/` og 16 PNG i `docs/design/workbench-handover/` er bilder og følger mappens status (Gammelt og Utgått).
- `docs/arkiv/` finnes ikke i `main` (AGENTS.md og flere dokumenter peker likevel dit).

## Antall per status (alle Markdown og listede tekstdokumenter)

| Status | Antall |
|---|---|
| Gjeldende | 467 |
| Utgått | 171 |
| Gammelt | 133 |
| Dublett | 6 |
| Motstrid | 37 |
| **Sum** | **814** |

## Antall per mappe og status

| Mappe | Gjeldende | Utgått | Gammelt | Dublett | Motstrid | Sum |
|---|---|---|---|---|---|---|
| `(rot)` | 5 | 0 | 0 | 0 | 1 | 6 |
| `.claude/commands` | 3 | 0 | 0 | 1 | 1 | 5 |
| `.claude/rules` | 7 | 0 | 0 | 0 | 0 | 7 |
| `.claude/skills` | 211 | 3 | 17 | 2 | 3 | 236 |
| `.claude/skills-install` | 0 | 0 | 1 | 0 | 0 | 1 |
| `.design-sync` | 0 | 0 | 2 | 0 | 0 | 2 |
| `content` | 5 | 0 | 0 | 0 | 0 | 5 |
| `designsystem (rot)` | 0 | 0 | 0 | 0 | 1 | 1 |
| `designsystem/ak-golf` | 0 | 70 | 0 | 0 | 0 | 70 |
| `designsystem/ak-golf-ds` | 0 | 0 | 0 | 0 | 1 | 1 |
| `designsystem/canvas` | 0 | 4 | 0 | 0 | 0 | 4 |
| `designsystem/precision-athletics` | 49 | 1 | 0 | 0 | 3 | 53 |
| `designsystem/team-norway` | 0 | 36 | 0 | 0 | 0 | 36 |
| `designsystem/team-norway-app` | 1 | 0 | 0 | 0 | 0 | 1 |
| `designsystem/train-lock` | 0 | 13 | 0 | 0 | 0 | 13 |
| `designsystem/wang` | 0 | 0 | 10 | 0 | 0 | 10 |
| `docs (rot)` | 10 | 5 | 3 | 0 | 5 | 23 |
| `docs/arkitektur` | 4 | 0 | 0 | 0 | 2 | 6 |
| `docs/beslutningsgrunnlag` | 5 | 4 | 20 | 0 | 0 | 29 |
| `docs/design` | 0 | 9 | 0 | 0 | 0 | 9 |
| `docs/design-audit` | 2 | 5 | 24 | 0 | 0 | 31 |
| `docs/design-exports` | 4 | 0 | 0 | 0 | 0 | 4 |
| `docs/design-handoff` | 19 | 0 | 1 | 2 | 0 | 22 |
| `docs/design-system` | 7 | 7 | 1 | 0 | 1 | 16 |
| `docs/drift` | 0 | 0 | 1 | 0 | 0 | 1 |
| `docs/epost-maler` | 4 | 0 | 0 | 0 | 0 | 4 |
| `docs/gdpr` | 2 | 0 | 2 | 0 | 0 | 4 |
| `docs/integrasjoner` | 0 | 0 | 1 | 0 | 0 | 1 |
| `docs/juridisk` | 0 | 0 | 1 | 0 | 0 | 1 |
| `docs/marketing` | 0 | 1 | 0 | 0 | 1 | 2 |
| `docs/merkevare` | 0 | 0 | 2 | 0 | 1 | 3 |
| `docs/patches` | 0 | 1 | 0 | 0 | 0 | 1 |
| `docs/planer` | 4 | 8 | 16 | 1 | 1 | 30 |
| `docs/platform` | 4 | 2 | 2 | 0 | 3 | 11 |
| `docs/qa` | 0 | 0 | 1 | 0 | 0 | 1 |
| `docs/referanse` | 0 | 1 | 11 | 0 | 4 | 16 |
| `docs/sikkerhet` | 0 | 0 | 1 | 0 | 0 | 1 |
| `docs/skjermtekst` | 0 | 0 | 0 | 0 | 1 | 1 |
| `docs/treningsplanlegger` | 11 | 0 | 2 | 0 | 2 | 15 |
| `docs/utvikling` | 2 | 0 | 0 | 0 | 0 | 2 |
| `docs/vedlikehold` | 4 | 0 | 8 | 0 | 0 | 12 |
| `prisma` | 1 | 0 | 0 | 0 | 0 | 1 |
| `public` | 1 | 0 | 0 | 0 | 0 | 1 |
| `scripts` | 5 | 0 | 0 | 0 | 0 | 5 |
| `src` | 95 | 0 | 2 | 0 | 6 | 103 |
| `tests` | 2 | 1 | 4 | 0 | 0 | 7 |

## Viktig: hva «lenket» betyr her

- `npm run prosjekt:sjekk` kjører `check-project-structure.mjs`, `check-doc-lenker.mjs` og `bygg-skjermregister.mjs --check`. `check-doc-lenker` går gjennom alle `.md` i `docs/` (unntatt `docs/arkiv`, `referanse`, `planer`, `design-audit`, `beslutningsgrunnlag`, `merkevare`, `gdpr`, `juridisk`, `design-handoff`) og `.claude/skills` (unntatt eksterne pakker), pluss innganger (AGENTS, CLAUDE, QWEN, README, START-HER, designsystem/README, scripts/README, scripts/katalog, tests/visual/README, `.claude/rules/arkitektur|beslutninger|gotchas`). En lenke til en slettet fil i en av disse feiler sjekken.
- `docs/vedlikehold/dokumentregister.md` lenker til hvert eneste dokument i `docs/` (også historikk) og er med i lenkesjekken. **Hver slette-PR må kjøre `npm run prosjekt:register`** (skriver dokumentregister, filregister og scripts/katalog.md).
- «lenket fra X» i tabellene betyr at filen er nevnt i X (fil- eller filnavn-treff). Treff i genererte registre er utelatt. «sitert i N kodefil(er)» betyr kommentarer i `src/` eller `tests/`. Treffene er maskinelle; ved sletting må de leses manuelt.
- Vakter i `verify:static` som peker på mapper: `check-workbench-handover.mjs` (docs/design/workbench-handover), `check-fasit-sitering.mjs` og `check-fasitdekning-baseline.mjs` + `tests/visual/skjerm-mapping.ts` (designsystem/train-lock), `ak-golf-tokens.mjs`, `ak-golf-ds-tokens.mjs`, `check-ak-golf-kits.mjs` (designsystem/ak-golf, ak-golf-ds, team-norway, wang), `ordbok-json.ts` (docs/treningsplanlegging.md, docs/ordbok.json), `bygg-skjermregister.mjs --check` (docs/design-system/skjermliste-*.md, designsystem/wang og team-norway/handover SKJERMREGISTER).

## Forslag til slette-PR-er (P9)

Ingen er gjort. Rekkefølgen går fra tryggest til mest arbeid. Alle PR-er må i tillegg kjøre `npm run prosjekt:register` og `npm run prosjekt:sjekk`.

| PR | Innhold | Filer | Må rettes samtidig |
|---|---|---|---|
| **P9a** | Utgåtte dokumenter i docs/ (planer, prompter til Train-lock/Claw-samtaler, review av gamle ZIP-er, Paper-/Train-lock-spesifikasjoner, PLATTFORM-KART, user-flows, ak-master m.fl.). Liste: alle rader merket Utgått under `docs/` unntatt P9b | 33 | Lenker fra beslutninger.md (codex-fullforing, portering-skjermer, treningsplanlegging-og-sprak-gjennomgang), design-autoritet.md, designsystem/README.md, ak-hq-design/SKILL.md, treningsplanlegging.md; `scripts/rute-graf.mjs` (user-flows); kodekommentarer som siterer taksonomi-verifikasjon/for-under-etter-spec |
| **P9b** | `docs/design/workbench-handover/` (20.09-masteren, 8 piller, inkl. 16 PNG), `docs/workbench-handover.md`, `docs/patches/wb-v2-lov.patch` | 27 | Fjern `check:workbench-handover` fra `verify:static` og package.json, slett `scripts/check-workbench-handover.mjs` + test, rett START-HER, FASIT, docs/README, AGENT-BRIEF, designsystem/README, tests/visual/workbench/README. Gjør etter at Anders har avgjort M1 (hvilken Workbench-design) |
| **P9c** | `designsystem/canvas/` (Train-lock-æra canvaser) | 45 | Ca. 10 kodefiler i `src/` siterer `designsystem/canvas/...` i kommentarer; `designsystem/README.md` tabellrad |
| **P9d** | `designsystem/train-lock/` | 244 | 99 kodefiler siterer «Fasit:»; `check-fasit-sitering.mjs`, `check-fasitdekning-baseline.mjs`, `tests/visual/skjerm-mapping.ts` + `fasitdekning-baseline.json`, `train-lock-pixelnaerhet.spec.ts`, `maal-fasit-dekning.mjs`, `check-tl-kontrast.mjs`, `designsystem/README.md`. Egen PR: først fjern vaktene, så mappen |
| **P9e** | `designsystem/team-norway/` (Claw-speil) | 243 | Behold eller flytt `handover/SKJERMREGISTER.md` (leses av `bygg-skjermregister.mjs`), rett `check-ak-golf-kits.mjs` (leser `_ds_manifest.json`), `speil-ak-golf.mjs`, designsystem/README, beslutninger-lenker til LES-MEG/readme |
| **P9f** | `designsystem/ak-golf/` + `designsystem/ak-golf-ds/` | 276 | **Usikker:** ak-merkevare-skillen bruker mappen for trykk/sosiale. Token-vaktene `ak-golf-tokens.mjs`, `ak-golf-ds-tokens.mjs --sjekk`, `check-ak-golf-kits.mjs` ligger i `verify:static`, og `src/styles/ak-golf*.css` + 6+ marketing-komponenter siterer mappen. Ikke slett før Anders har bestemt merkevarens fremtid |
| **P9g** | Utgåtte skill-referanser i `.claude/skills/ak-hq-design/references/` (atletisk-intelligens, workbench-design-og-kode, produkt-og-retning) | 3 | Rett lenker i ak-hq-design/SKILL.md, designsystem/README.md, skills som peker på atletisk-intelligens, README-AK-HQ.md, frontend-design, design-system |
| **P9h** | Dubletter: skills `source-command-db-check`, `source-command-pr`, kommando `web-design-guidelines`, `docs/planer/wang-tn-iup-2027-sporsmal.md` | 4 | Sjekk at lik ordlyd (IUP-spørsmål) og at ingen skill-liste i verktøyet peker på de to source-command-skillene |
| **P9i** | (ikke sletting) Rett Motstrid-dokumenter: oppdater eller merk som historiske. 37 filer, se «Motstrid» under og funn-dokumenter.md | 37 | Skal gjøres FØR P9b og P9d slik at lenker ikke rettes to ganger |
| **P9j** | (valgfritt) Flytt «Gammelt» (daterte rapporter og planer, 133 stk) til lokalt arkiv eller slett. Foreslås per mappe: design-audit, beslutningsgrunnlag, planer, vedlikehold, referanse | se tabell | `docs/planer`, `design-audit`, `beslutningsgrunnlag`, `referanse` er unntatt lenkesjekken, men `dokumentregister.md` og ca. 22 kodefiler (grener-og-main) må rettes |

Grunnregel for alle: slett aldri en fil som står med «lenket fra» uten å rette lenken i samme PR.

### P9a: filene

- `docs/PLATTFORM-KART.md`
- `docs/ak-master.md`
- `docs/beslutningsgrunnlag/claude-design-datagolf-h2-04-review-2026-09-10.md`
- `docs/beslutningsgrunnlag/claude-design-zip-2-review-2026-09-10.md`
- `docs/beslutningsgrunnlag/claude-design-zip-3-review-2026-09-10.md`
- `docs/beslutningsgrunnlag/ordbok-og-workbench-analyse-2026-09-15.md`
- `docs/design-audit/team-norway-demo-2026-09-14.md`
- `docs/design-audit/team-norway-dokument-invitasjon-2026-09-14.md`
- `docs/design-audit/team-norway-playerhq-funksjonsgap-2026-09-14.md`
- `docs/design-audit/team-norway-uavhengig-kontroll-2026-09-14.md`
- `docs/design-audit/team-norway-utvidelse-uavhengig-kontroll-2026-09-14.md`
- `docs/design-system/claude-design-datagolf-h2-04-tilbakemelding.md`
- `docs/design-system/claude-design-komplett-overlevering.md`
- `docs/design-system/claude-design-zip-3-tilbakemelding.md`
- `docs/design-system/datagolf-claude-design-prompt-2026-09-10.md`
- `docs/design-system/lanseringslop-2026-09-10.md`
- `docs/design-system/manuell-sg-skjermer.md`
- `docs/design-system/team-norway-claw-valgt-2026-09-13.md`
- `docs/for-under-etter-spec.md`
- `docs/marketing/masterprompt-visuell.md`
- `docs/planer/claude-design-claw-team-norway-komplett-prompt-2026-09-14.md`
- `docs/planer/codex-fullforing-claude-design-2026-09-30.md`
- `docs/planer/plan-portering-claude-design-til-kode-2026-09-25.md`
- `docs/planer/planlegging-trening-og-analyse-design-og-kode-2026-09-21.md`
- `docs/planer/portering-skjermer-2026-09-27.md`
- `docs/planer/prosjektplan-og-lanseringsplan-2026-09-24.md`
- `docs/planer/team-norway-demodag-2026-09-14.md`
- `docs/planer/treningsplanlegging-og-sprak-en-master-2026-09-26.md`
- `docs/platform/rute-graf-data.json`
- `docs/platform/user-flows.md`
- `docs/referanse/design/2026-09-04-marked-ak-golf-port-design.md`
- `docs/taksonomi-verifikasjon.md`
- `docs/treningsplanlegging-og-sprak-gjennomgang.md`

### P9i: Motstrid-dokumenter som må rettes (kort årsak)

- `.claude/commands/beslutning.md` — Skriver til «MASTERPLAN» som ble fjernet (b700ce008); fasit: beslutninger.md, utløst arbeid i beslutningens egen blokk.
- `.claude/skills/README-AK-HQ.md` — Sier «Atletisk intelligens / ak-hq-design» vinner ved konflikt; atletisk-intelligens er erstattet av Precision.
- `.claude/skills/agencyos-arkitektur/SKILL.md` — M30: gammel meny (/admin/godkjenninger, Hjem/Godkjenninger) og tema uavklart; fasit IA 28.09 (Cockpit·Innboks·Stall·Kalender·Workbench·Mer). Nevner skills som ikke finnes i repoet (hq-godkjenning, playerhq-agents).
- `.claude/skills/playerhq-arkitektur/SKILL.md` — M30: «planendringer går via coachens godkjenning» (fasit: spiller endrer selv, coach endrer uten godkjenning, spiller kan angre) og «dagens retning er Claude Design App design»; peker til treningsplanlegging-og-sprak.md som master (D1).
- `START-HER.md` — Peker på «Aktivt arbeid 20.09: Workbench-overlevering» (M1: 8 piller, erstattet av fire visninger/Precision WB3). Punkt 2–4 lister samme fil (treningsplanlegging.md) tre ganger.
- `designsystem/README.md` — Tabellen «Eksisterende referanser» peker PlayerHQ/AgencyOS til Train-lock, markedssider til AK Golf-master, og «Aktiv Workbench-leveranse 20.09» (alle utgått). Lenket fra AGENTS, CLAUDE (via design-autoritet), QWEN, skills, beslutninger.
- `designsystem/ak-golf-ds/LES-MEG.md` — Kaller «AK Golf Design System» (87aa23fb) «dagens designautoritet» (utgått 26.09). Vaktet av ak-golf-ds-tokens.mjs --sjekk (verify:static).
- `designsystem/precision-athletics/guidelines/ordmaster.md` — D2/D3/D4: kaller seg autoritativ; nivåene TALENT/FULL (fasit Gratis/Full); «SPILL (Banespill)» (fasit Spill). Lenket fra beslutninger.md.
- `designsystem/precision-athletics/overlevering/codex.md` — D3: TALENT/FULL (linje ~548); skrevet til Codex (04.10: Claude Code).
- `designsystem/precision-athletics/readme.md` — D2 (ordbok-master): kaller guidelines/ordmaster.md autoritativ; beslutning 29.09: masteren i repoet gjelder. Lenket fra beslutninger, ak-merkevare, designsystem/README.
- `docs/AARSPLAN-MOTOR-STATUS.md` — M13/M16: beskriver ukeplan bygget i WorkbenchUke og uketyper UTVIKLING/TURNERING/AVLASTNING/TEST (fasit: WeekPlan.weekType UTVIKLING/VEDLIKEHOLD/TURNERING; WorkbenchUke skal ikke bygges videre). Putt i meter (fasit: fot).
- `docs/FASIT.md` — Chrome-lov fra Workbench-leveransen 20.09: radius 2, meny Hjem·Innboks·Kalender·Stall·Workbench·Godkjenninger, åtte piller, formel «8 + ?» (fasit: Precision radius 8 px, IA 28.09 Cockpit·Innboks·Stall·Kalender·Workbench·Mer, fire Workbench-visninger, åtte trin
- `docs/KARTLEGGING-TRENINGSPLANLEGGING.md` — M13: «ingen ukemodell i databasen», men WeekPlan finnes nå (se AARSPLAN-MOTOR-STATUS). 17 områder (fasit 19). Øyeblikksbilde 26.09 på gammel gren.
- `docs/arkitektur/team-norway.md` — Bruker «Hjelpetrener» (fasit: Assist Coach, og i TN-flaten Trener); ellers kart 26.09.
- `docs/arkitektur/wang.md` — Bruker «Hjelpetrener» (fasit: bare Sportssjef og Trener i /team-wang, beslutning 27.09).
- `docs/design-system/TEMA-LYS-MORK.md` — Sier PlayerHQ og AgencyOS er mørke som standard; beslutning 26.09: lyst er standard, natt i Live og slagregistrering. Lenket fra designsystem/README.
- `docs/marketing/tekstplan-forside-2026-09-05.md` — Nevner kartleggingsøkt (fjernet 26.09) og slettet MASTERPLAN.
- `docs/merkevare/ak-golf-tekstkonsept-2026-09-01.md` — Nevner kartleggingsøkt (fjernet 26.09). Lenket fra ak-merkevare-skillen.
- `docs/planer/ak-golf-hq-sammenhengende-datakjede-2026-09-27.md` — Sier treningsplanlegging-og-sprak.md er eneste master (fasit: treningsplanlegging.md).
- `docs/platform/AGENT-BRIEF.md` — Peker på Workbench-bestilling 20.09 som aktiv (M1). Inngang; lenket fra AGENTS, START-HER og skills.
- `docs/platform/BUSINESS-RULES.md` — «Eneste fasit for låste produktregler», men: Uten ball er «egenskap, ikke steg» (D8); «Mål bor i Oversikt» (M22; fasit: Workbench › Målsetninger); tre øktmodeller «skal ikke slås sammen» (M12); «Spilltrening», credits (D52). Lenket fra AGENTS, README, docs/REA
- `docs/platform/DATA-MODEL.md` — tier GRATIS/PRO (fasit på skjerm: Gratis/Full). Banner peker til slettet STATUS-NÅ.
- `docs/referanse/masterbrain-rebuild/00-SOURCE-INVENTORY.md` — Nevner «17 områder» (fasit: 19, 27.09). Ellers referanse 07–08.2026.
- `docs/referanse/masterbrain-rebuild/01-MASTERBRAIN-ARCHITECTURE.md` — Nevner «17 områder» (fasit: 19, 27.09). Ellers referanse 07–08.2026.
- `docs/referanse/masterbrain-rebuild/07-OPEN-QUESTIONS.md` — Nevner «17 områder» (fasit: 19, 27.09). Ellers referanse 07–08.2026.
- `docs/referanse/masterbrain-rebuild/09-SOURCE-TIL-MASTERBRAIN-SESSION.md` — Nevner «17 områder» (fasit: 19, 27.09). Ellers referanse 07–08.2026.
- `docs/skjermtekst/skjerm-tekst-hovedskjermer.md` — «Oppgrader til Pro» (fasit: Gratis/Full, ikke Pro) og drill-kode L-BALL·CS70·M2·PR2 (utgått). Meny og fanenavn fra før IA 28.09. Sitert i 2 kodefiler.
- `docs/treningsplanlegger/wang-toppidrett/design-handoff-arsplan-2026-27/README.md` — «CS50 min» og CS/PR-koder (utgått). Handoff 25.08, erstattet av v2 (22.09) for innhold.
- `docs/treningsplanlegger/wang-toppidrett/oktmal.md` — D42: CS-nivå i øktmal (linje ~67) mens L-fase/CS/M/PR er utgått. Sitert i 1 kodefil.
- `docs/treningsplanlegging-og-sprak.md` — M7/M8/D6/D7/D18: kaller seg «eneste gjeldende master» (27.09) og sier at treningsplanlegging.md er historisk. Fasit er treningsplanlegging.md (AGENTS, beslutninger 29.–30.09). Har faste prosentfordelinger/tak (M8), «Spesialisering»/Overgangsperiode, putt i met
- `docs/workbench-handover.md` — M1/M14/M16/M17: kaller seg «aktiv bestilling 20.09»: åtte piller, formel 8+?, uketyper UTVIKLING/VEDLIKEHOLD/TURNERING, tidsrom 05–22. Fasit: fire visninger (valgt 02.10), åtte trinn, Precision. Lenket fra START-HER, FASIT, docs/README, AGENT-BRIEF, designsyst
- `src/lib/masterbrain/rag-corpus/live/live-readiness-check.md` — Bruker utgåtte L-faser/CS/PR-koder. Del av RAG-korpus lest av index.json/hent-kunnskap (kodedata).
- `src/lib/masterbrain/rag-corpus/morad/confidence-bands-coaching.md` — Bruker utgåtte L-faser/CS/PR-koder. Del av RAG-korpus lest av index.json/hent-kunnskap (kodedata).
- `src/lib/masterbrain/rag-corpus/morad/morad-p1-setup.md` — Bruker utgåtte L-faser/CS/PR-koder. Del av RAG-korpus lest av index.json/hent-kunnskap (kodedata).
- `src/lib/masterbrain/rag-corpus/morad/truth-layer-prioritet.md` — Bruker utgåtte L-faser/CS/PR-koder. Del av RAG-korpus lest av index.json/hent-kunnskap (kodedata).
- `src/lib/masterbrain/training-data/eval/RUBRIC.md` — Evaluerer mot L-fase/CS/PR-tabell (utgått).
- `src/lib/masterbrain/training-data/examples/README.md` — Bruker L-fase, CS70, M3, PR2 (utgått 27.09).

### P9g/P9h: filene

- `.claude/skills/ak-hq-design/references/atletisk-intelligens.md`
- `.claude/skills/ak-hq-design/references/workbench-design-og-kode.md`
- `.claude/skills/ak-hq-design/references/produkt-og-retning.md`
- `.claude/skills/source-command-db-check/SKILL.md`
- `.claude/skills/source-command-pr/SKILL.md`
- `.claude/commands/web-design-guidelines.md`
- `docs/planer/wang-tn-iup-2027-sporsmal.md`

---

## (rot)

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `AGENTS.md` | Gjeldende | Inngang (felles instruks). Rettes: arbeidsdeling Codex→Claude Code (beslutning 04.10), peker til docs/arkiv som ikke finnes på main, og «stående forhåndsgodkjenning» står i konflikt med CLAUDE.md om publisering. |
| `CLAUDE.md` | Gjeldende | Inngang. Sier «bestilt lokalt arbeid gir ikke tillatelse til publisering» mens AGENTS.md gir stående forhåndsgodkjenning for push/PR/merge/deploy (motsigelse mellom to innganger). |
| `QWEN.md` | Gjeldende | Inngang for Qwen; peker til AGENTS.md. Ikke bekreftet i bruk. Står i prosjektstruktur.json (rot) og sjekkes av check-project-structure. |
| `README.md` | Gjeldende | Inngang. |
| `SECURITY.md` | Gjeldende | Sikkerhetsrutiner (05.2026). Lenket fra docs/runbook.md. |
| `START-HER.md` | Motstrid | Inngang. Peker på «Aktivt arbeid 20.09: Workbench-overlevering» (M1: 8 piller, erstattet av fire visninger/Precision WB3). Punkt 2–4 lister samme fil (treningsplanlegging.md) tre ganger. |

## docs (rot)

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/AARSPLAN-MOTOR-STATUS.md` | Motstrid | M13/M16: beskriver ukeplan bygget i WorkbenchUke og uketyper UTVIKLING/TURNERING/AVLASTNING/TEST (fasit: WeekPlan.weekType UTVIKLING/VEDLIKEHOLD/TURNERING; WorkbenchUke skal ikke bygges videre). Putt i meter (fasit: fot). |
| `docs/ARKITEKTUR-KART.md` | Gammelt | Øyeblikksbilde 26.09 (commit 5bc4f20). Kaller seg «autoritativ», men AGENT-BRIEF eier kodekartet. Overlapper docs/arkitektur/*. Tall (571 ruter, 198 modeller) er målt 26.09 og ikke kontrollert på nytt. |
| `docs/FASIT.md` | Motstrid | Chrome-lov fra Workbench-leveransen 20.09: radius 2, meny Hjem·Innboks·Kalender·Stall·Workbench·Godkjenninger, åtte piller, formel «8 + ?» (fasit: Precision radius 8 px, IA 28.09 Cockpit·Innboks·Stall·Kalender·Workbench·Mer, fire Workbench-visninger, åtte trinn i masteren; M1/M14). Rangerer treningsplanlegging.md to ganger (punkt 2 og 3). [lenket fra START-HER.md] |
| `docs/KARTLEGGING-TRENINGSPLANLEGGING.md` | Motstrid | M13: «ingen ukemodell i databasen», men WeekPlan finnes nå (se AARSPLAN-MOTOR-STATUS). 17 områder (fasit 19). Øyeblikksbilde 26.09 på gammel gren. |
| `docs/PLATTFORM-KART.md` | Utgått | Erstattet av docs/platform/AGENT-BRIEF.md (eget banner viser til slettet STATUS-NÅ.md). Målt 08.09. [lenket fra beslutninger.md] |
| `docs/README.md` | Gjeldende | Inngang for docs. Må få lenker til ordbok-master og Workbench-beskrivelsen når de legges inn. [lenket fra README.md] |
| `docs/ak-master.md` | Utgått | Erstattet av AGENTS.md + AGENT-BRIEF + START-HER (filen sier selv at den er arkivert; 5 linjer). |
| `docs/feillogg.md` | Gjeldende | Læringslogg. Lenket fra .claude/commands/pr.md og skills. [lenket fra pr.md, script:check-token-gap.mjs, script:dedupe-tournament-data.ts, skill:agenticos; sitert i 1 kodefil(er)] |
| `docs/for-under-etter-spec.md` | Utgått | Paper-era spesifikasjon (31.07), merket HISTORIKK. Erstattet av live-økt i Precision + treningsplanlegging.md. [sitert i 1 kodefil(er)] |
| `docs/fys-ovelsesbank-2026-08-20.md` | Gjeldende | Godkjent FYS-innlastingsliste (132 øvelser). Referer til «docs/ordbok.md» som nå er en pekefil. |
| `docs/jarvis-shortcut.md` | Gjeldende | Kodedokumentasjon for /api/meg/shortcut. |
| `docs/kartlegging-teamnorway-wang-playerhq.md` | Gammelt | Kartlegging 30.08; nevner Train-lock/Paper (utgått). Ikke erstattet av nyere kartlegging. |
| `docs/ordbok.json` | Gjeldende | Generert av scripts/ordbok-json.ts (verify:static). Må følge ny ordbok-master hvis den overtar språk. [lenket fra AGENTS.md, beslutninger.md, script:ordbok-json.ts, skill:ak-hq-design; sitert i 4 kodefil(er)] |
| `docs/ordbok.md` | Gjeldende | Pekefil (7 linjer) lenket fra AGENTS.md, beslutninger.md, ak-hq-design. Skal erstattes/pekes om til docs/ordbok/ordbok-master-2026-10-06.md; i dag peker den til treningsplanlegging.md som «eneste master for språk». [lenket fra AGENTS.md, beslutninger.md, skill:ak-hq-design] |
| `docs/plan-styrkeprogram-fys.md` | Gammelt | Utkast «venter på Anders godkjenning» (08.09), aldri gjennomført; Train-lock/Paper-henvisninger. |
| `docs/runbook.md` | Gjeldende | Drift. Lenket fra README.md og docs/README.md. Selv-erklært «ikke verifisert». [lenket fra README.md] |
| `docs/taksonomi-verifikasjon.md` | Utgått | 16 områdekoder og sju puttebånd er utgått (fasit: 19 områder, fot). Beholdt fordi src/lib/portal/gapping-data.ts siterer §c. [sitert i 1 kodefil(er)] |
| `docs/testing.md` | Gjeldende | Lenket fra README, docs/README, AGENT-BRIEF. Testtall (203 filer / 1379 tester) er målt 16.08 på en annen gren; ikke kontrollert på nytt. [lenket fra AGENT-BRIEF.md, README.md; sitert i 1 kodefil(er)] |
| `docs/treningsplanlegging-og-sprak-gjennomgang.md` | Utgått | Historisk gjennomgang 22.09, kaller seg «ikke styrende». Erstattet av docs/treningsplanlegging.md. Beslutningene §Treningsfag peker fortsatt hit som eier av valgtreet (D1/M7). Lenket fra beslutninger.md. [lenket fra beslutninger.md; sitert i 2 kodefil(er)] |
| `docs/treningsplanlegging-og-sprak.md` | Motstrid | M7/M8/D6/D7/D18: kaller seg «eneste gjeldende master» (27.09) og sier at treningsplanlegging.md er historisk. Fasit er treningsplanlegging.md (AGENTS, beslutninger 29.–30.09). Har faste prosentfordelinger/tak (M8), «Spesialisering»/Overgangsperiode, putt i meter, 5 uketyper. Lenket fra skill playerhq-arkitektur. [lenket fra skill:playerhq-arkitektur] |
| `docs/treningsplanlegging.md` | Gjeldende | FASIT for språk og treningsplanlegging (låst 30.09). Lenket fra AGENTS, START-HER, FASIT, docs/README, AGENT-BRIEF, ordbok-json.ts (verify:static), 5 kodefiler. [lenket fra AGENT-BRIEF.md, AGENTS.md, FASIT.md, README.md, START-HER.md, beslutninger.md (+2); sitert i 5 kodefil(er)] |
| `docs/turnering-datakilder.md` | Gjeldende | Datakilde-kart. Lenket fra .github/workflows (4 stk) og scripts. Beslutning 26.09 overstyrer «to eiere»-oppsettet (pipelines er eneste kilde for resultater). [lenket fra beslutninger.md, script:import-gjgt.ts, script:scrape-golfbox.ts, workflow:import-clippd-college.yml, workflow:scrape-gjgt.yml, workflow:scrape-golfbox.yml (+1); sitert i 3 kodefil(er)] |
| `docs/workbench-handover.md` | Motstrid | M1/M14/M16/M17: kaller seg «aktiv bestilling 20.09»: åtte piller, formel 8+?, uketyper UTVIKLING/VEDLIKEHOLD/TURNERING, tidsrom 05–22. Fasit: fire visninger (valgt 02.10), åtte trinn, Precision. Lenket fra START-HER, FASIT, docs/README, AGENT-BRIEF, designsystem/README. [lenket fra AGENT-BRIEF.md, FASIT.md, README.md, START-HER.md] |

## .claude/commands

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `.claude/commands/beslutning.md` | Motstrid | Skriver til «MASTERPLAN» som ble fjernet (b700ce008); fasit: beslutninger.md, utløst arbeid i beslutningens egen blokk. |
| `.claude/commands/db-check.md` | Gjeldende | Kommando. [lenket fra skill:source-command-db-check] |
| `.claude/commands/feature.md` | Gjeldende | Kommando; lenket til designsystem/README. |
| `.claude/commands/pr.md` | Gjeldende | Kommando; lenket til docs/feillogg.md. [lenket fra skill:source-command-pr] |
| `.claude/commands/web-design-guidelines.md` | Dublett | Samme innhold som skill web-design-guidelines. |

## .claude/rules

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `.claude/rules/admin-tripletex.md` | Gjeldende | Domeneregel. [lenket fra beslutninger.md; sitert i 6 kodefil(er)] |
| `.claude/rules/arkitektur.md` | Gjeldende | Inngang (peker til AGENT-BRIEF). [lenket fra prosjektstruktur.json] |
| `.claude/rules/beslutninger.md` | Gjeldende | Fasit for beslutninger (innganger i prosjektstruktur.json). Internt: 04.10 peker på design-handoff/regler/skjermliste.md som fasit, men 05.10 overstyrer AG-02/17/18/21/22/24; refererer slettet MASTERPLAN. Lenket fra nesten alle innganger. [lenket fra AGENTS.md, CLAUDE.md, beslutning.md, feature.md, prosjektstruktur.json, script:add-restitusjon-periode-2026-09-28.ts (+10); sitert i 58 kodefil(er)] |
| `.claude/rules/gfgk-junior.md` | Gjeldende | Domeneregel. [sitert i 3 kodefil(er)] |
| `.claude/rules/gotchas.md` | Gjeldende | Fasit for tekniske fallgruver. [lenket fra AGENT-BRIEF.md, AGENTS.md, CLAUDE.md, arkitektur.md, beskytt.mjs, beslutning.md (+49); sitert i 32 kodefil(er)] |
| `.claude/rules/mulligan-drift.md` | Gjeldende | Domeneregel. [lenket fra script:gmail-utkast.ts, script:kalender.ts, script:klassifiser.ts, script:run.ts; sitert i 4 kodefil(er)] |
| `.claude/rules/wang-toppidrett.md` | Gjeldende | Domeneregel. [sitert i 3 kodefil(er)] |

## .claude/skills

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `.claude/skills/README-AK-HQ.md` | Motstrid | Sier «Atletisk intelligens / ak-hq-design» vinner ved konflikt; atletisk-intelligens er erstattet av Precision. |
| `.claude/skills/agencyos-arkitektur/SKILL.md` | Motstrid | M30: gammel meny (/admin/godkjenninger, Hjem/Godkjenninger) og tema uavklart; fasit IA 28.09 (Cockpit·Innboks·Stall·Kalender·Workbench·Mer). Nevner skills som ikke finnes i repoet (hq-godkjenning, playerhq-agents). |
| `.claude/skills/agenticos-cockpit/SKILL.md` | Gammelt | Versjon 13.09; referer hq-godkjenning. |
| `.claude/skills/agenticos/SKILL.md` | Gammelt | Versjon 11.09; nevner hq-godkjenning-skill som ikke finnes i repoet; /admin/godkjenninger. |
| `.claude/skills/ak-hq-design/SKILL.md` | Gjeldende | Fasit-skill for design (02.10). Lenket fra AGENTS, ak-hq-designarbeid. [lenket fra AGENTS.md] |
| `.claude/skills/ak-hq-design/assets/hovedprompt.md` | Gjeldende | Hovedprompt (02.10). [lenket fra skill:ak-hq-design] |
| `.claude/skills/ak-hq-design/references/atletisk-intelligens.md` | Utgått | «Atletisk intelligens»-retningen (11.09) og Claw-som-fasit for TN; erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Lenket fra designsystem/README, skills, README-AK-HQ.md (sier den vinner ved konflikt). [lenket fra skill:agencyos-arkitektur, skill:agenticos, skill:agenticos-cockpit, skill:ak-hq-design, skill:ak-merkevare, skill:ak-prompt-master (+7)] |
| `.claude/skills/ak-hq-design/references/flyter-og-wireframes.md` | Gjeldende | Referanse i ak-hq-design. [lenket fra skill:ak-hq-design] |
| `.claude/skills/ak-hq-design/references/formater-og-kvalitet.md` | Gjeldende | Referanse i ak-hq-design. [lenket fra skill:ak-hq-design] |
| `.claude/skills/ak-hq-design/references/komponenter.md` | Gjeldende | Referanse i ak-hq-design. [lenket fra skill:ak-hq-design] |
| `.claude/skills/ak-hq-design/references/overlevering.md` | Gjeldende | Referanse i ak-hq-design. [lenket fra skill:ak-hq-design] |
| `.claude/skills/ak-hq-design/references/produkt-og-retning.md` | Utgått | Atletisk intelligens-retning. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994) [lenket fra skill:ak-hq-design] |
| `.claude/skills/ak-hq-design/references/skjermomfang.md` | Gjeldende | Referanse i ak-hq-design. [lenket fra skill:ak-hq-design] |
| `.claude/skills/ak-hq-design/references/videreforing-og-tokenkontroll.md` | Gammelt | Nevner Team Norway Claw som valgt delomfang (utgått 22.09). [lenket fra skill:ak-hq-design, skill:ak-prompt-master] |
| `.claude/skills/ak-hq-design/references/workbench-design-og-kode.md` | Utgått | M30: 20.09-masteren (8 piller). Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). [lenket fra skill:ak-hq-design] |
| `.claude/skills/ak-merkevare/SKILL.md` | Gjeldende | Merke (Verksted) for trykk/sosiale/e-post; sier selv at Claw er utgått og at produktskjermer bruker ak-hq-design. |
| `.claude/skills/ak-personvern/SKILL.md` | Gjeldende | Personvernvakt; lenket fra AGENTS. [lenket fra AGENT-BRIEF.md, AGENTS.md] |
| `.claude/skills/ak-prompt-master/SKILL.md` | Gjeldende | Promptmester. |
| `.claude/skills/ak-sikkerhet/SKILL.md` | Gjeldende | Sikkerhetsvakt; lenket fra AGENTS. [lenket fra AGENT-BRIEF.md, AGENTS.md] |
| `.claude/skills/animate/RECIPES.md` | Gammelt | Ekstern. [lenket fra skill:animate] |
| `.claude/skills/animate/SKILL.md` | Gammelt | Ekstern animasjons-skill (16.09). |
| `.claude/skills/design-system/SKILL.md` | Gammelt | «Design System v0.1» fra Atletisk intelligens-fasen. |
| `.claude/skills/design-taste-frontend/SKILL.md` | Gammelt | Ekstern hjelpe-skill (16.09); ikke prosjektfasit. |
| `.claude/skills/emil-design-eng/SKILL.md` | Gammelt | Ekstern hjelpe-skill (16.09); ikke prosjektfasit. |
| `.claude/skills/find-animation-opportunities/SKILL.md` | Gammelt | Ekstern hjelpe-skill (16.09); ikke prosjektfasit. |
| `.claude/skills/frontend-design/SKILL.md` | Gammelt | Generisk; peker til atletisk-intelligens (utgått). |
| `.claude/skills/improve-animations/AUDIT.md` | Gammelt | Ekstern hjelpe-skill (16.09); ikke prosjektfasit. |
| `.claude/skills/improve-animations/PLAN-TEMPLATE.md` | Gammelt | Ekstern hjelpe-skill (16.09); ikke prosjektfasit. [lenket fra skill:improve-animations] |
| `.claude/skills/improve-animations/SKILL.md` | Gammelt | Ekstern hjelpe-skill (16.09); ikke prosjektfasit. |
| `.claude/skills/mobbin-inspo/SKILL.md` | Gammelt | Inspirasjonsskill (Atletisk intelligens-fasen). |
| `.claude/skills/playerhq-arkitektur/SKILL.md` | Motstrid | M30: «planendringer går via coachens godkjenning» (fasit: spiller endrer selv, coach endrer uten godkjenning, spiller kan angre) og «dagens retning er Claude Design App design»; peker til treningsplanlegging-og-sprak.md som master (D1). |
| `.claude/skills/prompt-engineer/SKILL.md` | Gjeldende | Prompt-skill. |
| `.claude/skills/review-animations/SKILL.md` | Gammelt | Ekstern hjelpe-skill (16.09); ikke prosjektfasit. |
| `.claude/skills/review-animations/STANDARDS.md` | Gammelt | Ekstern hjelpe-skill (16.09); ikke prosjektfasit. [lenket fra skill:review-animations] |
| `.claude/skills/source-command-db-check/SKILL.md` | Dublett | Samme som .claude/commands/db-check.md (kommando i skill-form). |
| `.claude/skills/source-command-pr/SKILL.md` | Dublett | Samme som .claude/commands/pr.md. |
| `.claude/skills/stripe-webhook-security/KILDE.md` | Gjeldende | Kildenotat (ekstern pakke). |
| `.claude/skills/verify-og-commit/SKILL.md` | Gjeldende | Lenket fra AGENTS. [lenket fra AGENTS.md] |
| `.claude/skills/web-design-guidelines/SKILL.md` | Gammelt | Generisk Vercel-skill. Dublett av .claude/commands/web-design-guidelines.md (190 linjer). |
| `.claude/skills/react-best-practices/**/*.md (75 md)` | Gjeldende | Ekstern skill-pakke (unntatt fra lenkesjekk), ikke prosjektets egen dokumentasjon. Generisk teknisk pakke, ikke gjennomgått mot fasit. |
| `.claude/skills/impeccable/**/*.md (40 md)` | Gjeldende | Ekstern skill-pakke (unntatt fra lenkesjekk), ikke prosjektets egen dokumentasjon. Generisk teknisk pakke, ikke gjennomgått mot fasit. |
| `.claude/skills/security-review/**/*.md (22 md)` | Gjeldende | Ekstern skill-pakke (unntatt fra lenkesjekk), ikke prosjektets egen dokumentasjon. Generisk teknisk pakke, ikke gjennomgått mot fasit. |
| `.claude/skills/supabase-postgres-best-practices/**/*.md (37 md)` | Gjeldende | Ekstern skill-pakke (unntatt fra lenkesjekk), ikke prosjektets egen dokumentasjon. Generisk teknisk pakke, ikke gjennomgått mot fasit. |
| `.claude/skills/web-security-review/**/*.md (5 md)` | Gjeldende | Ekstern skill-pakke (unntatt fra lenkesjekk), ikke prosjektets egen dokumentasjon. Generisk teknisk pakke, ikke gjennomgått mot fasit. |
| `.claude/skills/stripe-docs/**/*.md (2 md)` | Gjeldende | Ekstern skill-pakke (unntatt fra lenkesjekk), ikke prosjektets egen dokumentasjon. Generisk teknisk pakke, ikke gjennomgått mot fasit. |
| `.claude/skills/webapp-testing/**/*.md (1 md)` | Gjeldende | Ekstern skill-pakke (unntatt fra lenkesjekk), ikke prosjektets egen dokumentasjon. Generisk teknisk pakke, ikke gjennomgått mot fasit. |
| `.claude/skills/file-upload-security/**/*.md (2 md)` | Gjeldende | Ekstern skill-pakke (unntatt fra lenkesjekk), ikke prosjektets egen dokumentasjon. Generisk teknisk pakke, ikke gjennomgått mot fasit. |
| `.claude/skills/llm-app-security/**/*.md (2 md)` | Gjeldende | Ekstern skill-pakke (unntatt fra lenkesjekk), ikke prosjektets egen dokumentasjon. Generisk teknisk pakke, ikke gjennomgått mot fasit. |
| `.claude/skills/secret-hygiene/**/*.md (2 md)` | Gjeldende | Ekstern skill-pakke (unntatt fra lenkesjekk), ikke prosjektets egen dokumentasjon. Generisk teknisk pakke, ikke gjennomgått mot fasit. |
| `.claude/skills/nextjs-security/**/*.md (2 md)` | Gjeldende | Ekstern skill-pakke (unntatt fra lenkesjekk), ikke prosjektets egen dokumentasjon. Generisk teknisk pakke, ikke gjennomgått mot fasit. |
| `.claude/skills/prompt-injection-defense/**/*.md (2 md)` | Gjeldende | Ekstern skill-pakke (unntatt fra lenkesjekk), ikke prosjektets egen dokumentasjon. Generisk teknisk pakke, ikke gjennomgått mot fasit. |
| `.claude/skills/security-and-hardening/**/*.md (2 md)` | Gjeldende | Ekstern skill-pakke (unntatt fra lenkesjekk), ikke prosjektets egen dokumentasjon. Generisk teknisk pakke, ikke gjennomgått mot fasit. |
| `.claude/skills/api-and-interface-design/**/*.md (2 md)` | Gjeldende | Ekstern skill-pakke (unntatt fra lenkesjekk), ikke prosjektets egen dokumentasjon. Generisk teknisk pakke, ikke gjennomgått mot fasit. |
| `.claude/skills/stripe-webhook-security/**/*.md (1 md)` | Gjeldende | Ekstern skill-pakke (unntatt fra lenkesjekk), ikke prosjektets egen dokumentasjon. Generisk teknisk pakke, ikke gjennomgått mot fasit. |

## .claude/skills-install

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `.claude/skills-install/INSTALL.md` | Gammelt | Installasjonsnotat 14.09. |

## .design-sync

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `.design-sync/NOTES.md` | Gammelt | design-sync fra 16.09 (komponenter fra kode); nevner ELITE/CS-koder i noen eksempler. |
| `.design-sync/conventions.md` | Gammelt | Konvensjoner for design-sync (17.09), Train-lock-æra komponenter. |

## content

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `content/blogg/banedata-baerum-gk.mdx` | Gjeldende | Publisert bloggartikkel. |
| `content/blogg/norske-17-aringer-og-putt.mdx` | Gjeldende | Publisert bloggartikkel. |
| `content/blogg/norske-college-golfers-2026.mdx` | Gjeldende | Publisert bloggartikkel. |
| `content/blogg/pga-sg-total-hovland.mdx` | Gjeldende | Publisert bloggartikkel. |
| `content/blogg/sg-approach-er-alt.mdx` | Gjeldende | Publisert bloggartikkel. |

## designsystem (rot)

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `designsystem/README.md` | Motstrid | Inngang. Tabellen «Eksisterende referanser» peker PlayerHQ/AgencyOS til Train-lock, markedssider til AK Golf-master, og «Aktiv Workbench-leveranse 20.09» (alle utgått). Lenket fra AGENTS, CLAUDE (via design-autoritet), QWEN, skills, beslutninger. [lenket fra AGENT-BRIEF.md, AGENTS.md, CLAUDE.md, QWEN.md, README.md, arkitektur.md (+14)] |

## designsystem/ak-golf

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `designsystem/ak-golf/CHANGELOG.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. [lenket fra script:speil-ak-golf.mjs] |
| `designsystem/ak-golf/SKILL.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. |
| `designsystem/ak-golf/assets/foto/katalog.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. [lenket fra prosjektstruktur.json, script:README.md, script:prosjekt-register.mjs, script:speil-ak-golf.mjs, skill:ak-merkevare] |
| `designsystem/ak-golf/foto/katalog.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. [lenket fra prosjektstruktur.json, script:README.md, script:prosjekt-register.mjs, script:speil-ak-golf.mjs, skill:ak-merkevare] |
| `designsystem/ak-golf/guidelines/01-merket.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. |
| `designsystem/ak-golf/guidelines/02-arkitektur.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. |
| `designsystem/ak-golf/guidelines/03-logo.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. |
| `designsystem/ak-golf/guidelines/04-farge.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. |
| `designsystem/ak-golf/guidelines/05-typografi.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. |
| `designsystem/ak-golf/guidelines/06-rom-og-geometri.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. |
| `designsystem/ak-golf/guidelines/07-foto.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. |
| `designsystem/ak-golf/guidelines/08-sprak.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. |
| `designsystem/ak-golf/guidelines/09-varianter.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. |
| `designsystem/ak-golf/guidelines/10-forbudt.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. [lenket fra script:check-tl-kontrast.mjs] |
| `designsystem/ak-golf/guidelines/11-instrumentet.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. |
| `designsystem/ak-golf/guidelines/12-bevegelse.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. |
| `designsystem/ak-golf/guidelines/13-ikoner.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. |
| `designsystem/ak-golf/guidelines/14-fotobrief.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. |
| `designsystem/ak-golf/guidelines/merkeplattform.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. |
| `designsystem/ak-golf/guidelines/tekstkonsept.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. [lenket fra skill:ak-merkevare; sitert i 1 kodefil(er)] |
| `designsystem/ak-golf/kildepakke-les-meg.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. |
| `designsystem/ak-golf/prompt-claude-design.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. |
| `designsystem/ak-golf/readme.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. [lenket fra README.md, beslutninger.md, script:speil-ak-golf.mjs, skill:ak-merkevare; sitert i 1 kodefil(er)] |
| `designsystem/ak-golf/tokens/kontrast.md` | Utgått | AK Golf Design System (speil 02.09), erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Brukes fortsatt av ak-merkevare-skillen (trykk/sosiale) og token-vaktene i verify:static (ak-golf-tokens, check-ak-golf-kits) – Usikker, avklar før sletting. [lenket fra script:ak-golf-tokens.mjs, script:check-signalfarge-tekst.mjs, script:check-tl-kontrast.mjs, script:speil-ak-golf.mjs; sitert i 2 kodefil(er)] |
| `designsystem/ak-golf/(components|ui_kits|templates)/**/*.md (46 md)` | Utgått | AK Golf Design System-speil: erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Se advarsel i default. |

## designsystem/ak-golf-ds

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `designsystem/ak-golf-ds/LES-MEG.md` | Motstrid | Kaller «AK Golf Design System» (87aa23fb) «dagens designautoritet» (utgått 26.09). Vaktet av ak-golf-ds-tokens.mjs --sjekk (verify:static). [lenket fra README.md, beslutninger.md] |

## designsystem/canvas

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `designsystem/canvas/README.md` | Utgått | «HISTORISK ARBEIDSFLYT»; erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994) |
| `designsystem/canvas/team-norway/BRIEF.md` | Utgått | Canvas-brief fra Train-lock-tiden. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994) |
| `designsystem/canvas/team-norway/PROMPT.md` | Utgått | Canvas-brief fra Train-lock-tiden. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994) |
| `designsystem/canvas/wang-team-norway/prompt-claude-design.md` | Utgått | Canvas-brief fra Train-lock-tiden. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994) |

## designsystem/precision-athletics

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `designsystem/precision-athletics/LES-MEG.md` | Gjeldende | Speil 28.09 av Claude Design (7d7c2994). Nyere eksport 02.10 ligger i docs/design-exports; handoff 04.10 i docs/design-handoff. [lenket fra README.md, beslutninger.md] |
| `designsystem/precision-athletics/guidelines/ordmaster.md` | Motstrid | D2/D3/D4: kaller seg autoritativ; nivåene TALENT/FULL (fasit Gratis/Full); «SPILL (Banespill)» (fasit Spill). Lenket fra beslutninger.md. [lenket fra beslutninger.md; sitert i 1 kodefil(er)] |
| `designsystem/precision-athletics/overlevering/better-ui-polish-2026-09-27.md` | Gjeldende | Overleveringsnotat i Precision-speilet (27.09). |
| `designsystem/precision-athletics/overlevering/codex.md` | Motstrid | D3: TALENT/FULL (linje ~548); skrevet til Codex (04.10: Claude Code). |
| `designsystem/precision-athletics/overlevering/round-sg-registration-2026-09-27.md` | Gjeldende | Overleveringsnotat i Precision-speilet (27.09). |
| `designsystem/precision-athletics/overlevering/teknisk-plan-playerhq-agencyos-analyse.md` | Gjeldende | Overleveringsnotat i Precision-speilet (27.09). |
| `designsystem/precision-athletics/overlevering/teknisk-plan-progresjon-2026-09-27.md` | Gjeldende | Overleveringsnotat i Precision-speilet (27.09). [sitert i 1 kodefil(er)] |
| `designsystem/precision-athletics/overlevering/test-til-okt-2026-09-27.md` | Gjeldende | Overleveringsnotat i Precision-speilet (27.09). |
| `designsystem/precision-athletics/overlevering/workbench-fys-turnering-2026-09-27.md` | Gjeldende | Overleveringsnotat i Precision-speilet (27.09). |
| `designsystem/precision-athletics/readme.md` | Motstrid | D2 (ordbok-master): kaller guidelines/ordmaster.md autoritativ; beslutning 29.09: masteren i repoet gjelder. Lenket fra beslutninger, ak-merkevare, designsystem/README. [lenket fra README.md, beslutninger.md, script:speil-ak-golf.mjs, skill:ak-merkevare; sitert i 1 kodefil(er)] |
| `designsystem/precision-athletics/skjermliste.md` | Utgått | Eldre kopi (28.09) av docs/design-system/skjermliste-precision-athletics.md. [lenket fra beslutninger.md; sitert i 1 kodefil(er)] |
| `designsystem/precision-athletics/ui_kits/agencyos/README.md` | Gjeldende | Del av Precision-speil. |
| `designsystem/precision-athletics/(components|ui_kits|templates)/**/*.md (41 md)` | Gjeldende | Speil av Precision (28.09). |

## designsystem/team-norway

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `designsystem/team-norway/LES-MEG.md` | Utgått | Eget banner: speilet er ikke lenger fasit (22.09). Erstattet av «Team Norway App». Lenket fra designsystem/README. [lenket fra README.md, beslutninger.md] |
| `designsystem/team-norway/SKILL.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). |
| `designsystem/team-norway/docs/bestilling-batch-2.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). |
| `designsystem/team-norway/docs/bestilling-tn03-fellestesting.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). |
| `designsystem/team-norway/docs/bestilling-trainlock-iup.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). |
| `designsystem/team-norway/docs/ferdigstilling-2026-09-08.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). |
| `designsystem/team-norway/docs/gap-iup-2025.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). |
| `designsystem/team-norway/docs/iup-2025-faneutdrag.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). |
| `designsystem/team-norway/docs/prototype-arkitektur.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). |
| `designsystem/team-norway/docs/team-norway-workdesk-skjermplan.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). |
| `designsystem/team-norway/docs/vurdering-2026-09-02.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). |
| `designsystem/team-norway/github.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). |
| `designsystem/team-norway/handover/APNE-BESLUTNINGER.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). [lenket fra beslutninger.md] |
| `designsystem/team-norway/handover/DATAMODELL.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). |
| `designsystem/team-norway/handover/EKSPORT.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). |
| `designsystem/team-norway/handover/PORTING.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). [lenket fra README.md, script:check-fasit-sitering.mjs; sitert i 7 kodefil(er)] |
| `designsystem/team-norway/handover/SKJERMREGISTER.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). [lenket fra script:bygg-skjermregister.mjs] |
| `designsystem/team-norway/handover/TILGANGSMATRISE.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). [lenket fra beslutninger.md; sitert i 1 kodefil(er)] |
| `designsystem/team-norway/prompt-batch-2.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). |
| `designsystem/team-norway/prompt-batch-3.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). [sitert i 2 kodefil(er)] |
| `designsystem/team-norway/prompt-tn03-fellestesting.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). |
| `designsystem/team-norway/readme.md` | Utgått | Claw/Train-lock-era Team Norway-speil (utgått 22.09), erstattet av Claude Design «Team Norway App». Funksjonsinventar vaktes delvis av bygg-skjermregister (handover/SKJERMREGISTER.md). [lenket fra README.md, beslutninger.md, script:speil-ak-golf.mjs, skill:ak-merkevare; sitert i 1 kodefil(er)] |
| `designsystem/team-norway/(components|ui_kits|templates)/**/*.md (14 md)` | Utgått | Claw-speil: erstattet av Claude Design «Team Norway App»; HQ-flater erstattet av Precision. |

## designsystem/team-norway-app

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `designsystem/team-norway-app/LES-MEG.md` | Gjeldende | Peker på Claude Design «Team Norway App» (bf70a934) som fasit for /team-norway. [lenket fra README.md, beslutninger.md] |

## designsystem/train-lock

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `designsystem/train-lock/DESIGN-SYSTEM.md` | Utgått | Train-lock. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). PORTING/SCREEN-INDEX vaktes av check-fasit-sitering.mjs (verify:static); 3–7 kodefiler siterer. [lenket fra README.md; sitert i 4 kodefil(er)] |
| `designsystem/train-lock/HANDOFF.md` | Utgått | Train-lock. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). PORTING/SCREEN-INDEX vaktes av check-fasit-sitering.mjs (verify:static); 3–7 kodefiler siterer. [sitert i 2 kodefil(er)] |
| `designsystem/train-lock/PORTING.md` | Utgått | Train-lock. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). PORTING/SCREEN-INDEX vaktes av check-fasit-sitering.mjs (verify:static); 3–7 kodefiler siterer. [lenket fra README.md, script:check-fasit-sitering.mjs; sitert i 7 kodefil(er)] |
| `designsystem/train-lock/README.md` | Utgått | (erstattet av «AK Golf Precision Athletics» i Claude Design) (selv-merket «UTGÅENDE 21.09») |
| `designsystem/train-lock/SCREEN-INDEX.md` | Utgått | Train-lock. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). PORTING/SCREEN-INDEX vaktes av check-fasit-sitering.mjs (verify:static); 3–7 kodefiler siterer. [lenket fra README.md, script:check-fasit-sitering.mjs; sitert i 3 kodefil(er)] |
| `designsystem/train-lock/SYNC-STATUS.md` | Utgått | Train-lock. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). PORTING/SCREEN-INDEX vaktes av check-fasit-sitering.mjs (verify:static); 3–7 kodefiler siterer. |
| `designsystem/train-lock/referanse/CLAUDE-CODE-IMPORT-PROMPT.md` | Utgått | Train-lock. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). |
| `designsystem/train-lock/referanse/PROSJEKT-CLAUDE.md` | Utgått | Train-lock. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). |
| `designsystem/train-lock/referanse/PROTOTYPE-PLAN-2026-09-02.md` | Utgått | Train-lock. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). |
| `designsystem/train-lock/referanse/PROTOTYPE-PLAN-2026-09-08.md` | Utgått | Train-lock. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). |
| `designsystem/train-lock/referanse/github-synk-2026-09-08.md` | Utgått | Train-lock. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). |
| `designsystem/train-lock/referanse/proto-handoff-batch-1-4-2026-09-02.md` | Utgått | Train-lock. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). |
| `designsystem/train-lock/valgt-zip-4/README.md` | Utgått | Train-lock. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). [sitert i 1 kodefil(er)] |

## designsystem/wang

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `designsystem/wang/APNE-BESLUTNINGER.md` | Gammelt | WANG-speil 08.09 (eget system, ikke utgått), «kan henge etter»; byggeunderlag. wang/SKJERMREGISTER.md vaktes av bygg-skjermregister (prosjekt:sjekk). [lenket fra beslutninger.md] |
| `designsystem/wang/DATAMODELL.md` | Gammelt | WANG-speil 08.09 (eget system, ikke utgått), «kan henge etter»; byggeunderlag. wang/SKJERMREGISTER.md vaktes av bygg-skjermregister (prosjekt:sjekk). |
| `designsystem/wang/LES-MEG.md` | Gammelt | WANG-speil 08.09 (eget system, ikke utgått), «kan henge etter»; byggeunderlag. wang/SKJERMREGISTER.md vaktes av bygg-skjermregister (prosjekt:sjekk). [lenket fra README.md, beslutninger.md] |
| `designsystem/wang/PORTING.md` | Gammelt | WANG-speil 08.09 (eget system, ikke utgått), «kan henge etter»; byggeunderlag. wang/SKJERMREGISTER.md vaktes av bygg-skjermregister (prosjekt:sjekk). [lenket fra README.md, script:check-fasit-sitering.mjs; sitert i 7 kodefil(er)] |
| `designsystem/wang/SKJERMREGISTER.md` | Gammelt | WANG-speil 08.09 (eget system, ikke utgått), «kan henge etter»; byggeunderlag. wang/SKJERMREGISTER.md vaktes av bygg-skjermregister (prosjekt:sjekk). [lenket fra script:bygg-skjermregister.mjs] |
| `designsystem/wang/TILGANGSMATRISE.md` | Gammelt | WANG-speil 08.09 (eget system, ikke utgått), «kan henge etter»; byggeunderlag. wang/SKJERMREGISTER.md vaktes av bygg-skjermregister (prosjekt:sjekk). [lenket fra beslutninger.md; sitert i 1 kodefil(er)] |
| `designsystem/wang/docs/vurdering-wang-2026-09-02.md` | Gammelt | WANG-speil 08.09 (eget system, ikke utgått), «kan henge etter»; byggeunderlag. wang/SKJERMREGISTER.md vaktes av bygg-skjermregister (prosjekt:sjekk). |
| `designsystem/wang/fasit/SYNC-STATUS.md` | Gammelt | WANG-speil 08.09 (eget system, ikke utgått), «kan henge etter»; byggeunderlag. wang/SKJERMREGISTER.md vaktes av bygg-skjermregister (prosjekt:sjekk). |
| `designsystem/wang/github.md` | Gammelt | WANG-speil 08.09 (eget system, ikke utgått), «kan henge etter»; byggeunderlag. wang/SKJERMREGISTER.md vaktes av bygg-skjermregister (prosjekt:sjekk). |
| `designsystem/wang/readme.md` | Gammelt | WANG-speil 08.09 (eget system, ikke utgått), «kan henge etter»; byggeunderlag. wang/SKJERMREGISTER.md vaktes av bygg-skjermregister (prosjekt:sjekk). [lenket fra README.md, beslutninger.md, script:speil-ak-golf.mjs, skill:ak-merkevare; sitert i 1 kodefil(er)] |

## docs/arkitektur

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/arkitektur/agencyos.md` | Gjeldende | Arkitekturkart 29.09. Lenket fra skill mobbin-inspo. [lenket fra skill:mobbin-inspo] |
| `docs/arkitektur/agenticos.md` | Gjeldende | Arkitekturkart 26.09 (verifiser mot kode). |
| `docs/arkitektur/forelderportal.md` | Gjeldende | Arkitekturkart 26.09 (verifiser mot kode). |
| `docs/arkitektur/playerhq.md` | Gjeldende | Arkitekturkart 26.09 (verifiser mot kode). [sitert i 1 kodefil(er)] |
| `docs/arkitektur/team-norway.md` | Motstrid | Bruker «Hjelpetrener» (fasit: Assist Coach, og i TN-flaten Trener); ellers kart 26.09. |
| `docs/arkitektur/wang.md` | Motstrid | Bruker «Hjelpetrener» (fasit: bare Sportssjef og Trener i /team-wang, beslutning 27.09). |

## docs/beslutningsgrunnlag

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/beslutningsgrunnlag/claude-design-datagolf-h2-04-review-2026-09-10.md` | Utgått | Kontroll av Train-lock-ZIP: erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994) |
| `docs/beslutningsgrunnlag/claude-design-zip-2-review-2026-09-10.md` | Utgått | Kontroll av Train-lock-ZIP: erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994) |
| `docs/beslutningsgrunnlag/claude-design-zip-3-review-2026-09-10.md` | Utgått | Kontroll av Train-lock-ZIP: erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994) |
| `docs/beslutningsgrunnlag/datagolf-analyse-og-anbefaling-2026-09-10.md` | Gammelt | Datert beslutningsgrunnlag/kontroll; ikke erstattet. |
| `docs/beslutningsgrunnlag/datagolf-datakontroll-2026-09-10.json` | Gammelt | Datert datafil. |
| `docs/beslutningsgrunnlag/datagolf-golfbox-leveranse-2026-09-10.md` | Gammelt | Datert beslutningsgrunnlag/kontroll; ikke erstattet. |
| `docs/beslutningsgrunnlag/datakartlegging-2026-08-30.md` | Gammelt | Datert beslutningsgrunnlag/kontroll; ikke erstattet. |
| `docs/beslutningsgrunnlag/funksjonssikkerhet-for-kontroll-2026-09-10.json` | Gammelt | Datert datafil. |
| `docs/beslutningsgrunnlag/golfdata-kartlegging-2026-09-14.md` | Gammelt | Datert beslutningsgrunnlag/kontroll; ikke erstattet. |
| `docs/beslutningsgrunnlag/grener-og-main-2026-09-10.md` | Gammelt | Logg 10.09. Sitert i ca. 22 kodefiler (kommentarer) – ikke slett uten å rette dem. [sitert i 22 kodefil(er)] |
| `docs/beslutningsgrunnlag/grillingen-runde6-2026-08-30.md` | Gammelt | Datert beslutningsgrunnlag/kontroll; ikke erstattet. |
| `docs/beslutningsgrunnlag/grillingen-runde7-planlegging-2026-09-15.md` | Gammelt | Datert beslutningsgrunnlag/kontroll; ikke erstattet. |
| `docs/beslutningsgrunnlag/grillingen-runde8-skjermer-2026-09-28.md` | Gjeldende | Detaljfasit («Slik vil du ha det») per område. Lenket fra beslutninger.md. [lenket fra beslutninger.md] |
| `docs/beslutningsgrunnlag/grillingen-runde9-wang-tn-2026-09-28.md` | Gjeldende | Detaljfasit IUP/testbatteri/deling. Lenket fra beslutninger.md. Delvis overstyrt av 04.10 (automatisk innsyn). [lenket fra beslutninger.md] |
| `docs/beslutningsgrunnlag/kapabilitetskart-spillerutvikling-2026-09-28.md` | Gammelt | Nevner 12 kategoribånd (fasit 11, D41). |
| `docs/beslutningsgrunnlag/mulighetskart-playerhq-agencyos-2026-09-28.md` | Gjeldende | Lenket fra beslutninger.md. [lenket fra beslutninger.md] |
| `docs/beslutningsgrunnlag/mulighetskart-wang-tn-2026-09-28.md` | Gjeldende | Lenket fra beslutninger.md. [lenket fra beslutninger.md] |
| `docs/beslutningsgrunnlag/ordbok-og-workbench-analyse-2026-09-15.md` | Utgått | Grunnlag for gammel ordbok-utkast; erstattet av docs/treningsplanlegging.md og ny ordbok-master. |
| `docs/beslutningsgrunnlag/plan-action-avstemming-2026-09-13.md` | Gammelt | Datert beslutningsgrunnlag/kontroll; ikke erstattet. |
| `docs/beslutningsgrunnlag/prosjektrevisjon-2026-09-05.md` | Gammelt | Datert beslutningsgrunnlag/kontroll; ikke erstattet. |
| `docs/beslutningsgrunnlag/revisjonsfunn-2026-09-10.md` | Gammelt | Datert beslutningsgrunnlag/kontroll; ikke erstattet. |
| `docs/beslutningsgrunnlag/rls-produksjonskontroll-2026-09-10.json` | Gammelt | Datert datafil. |
| `docs/beslutningsgrunnlag/skjermkartlegging-2026-09-28.md` | Gammelt | Grunnlag for runde 8; ikke erstattet. |
| `docs/beslutningsgrunnlag/sprak-og-treningskvalitet-2026-09-10.md` | Gammelt | Datert beslutningsgrunnlag/kontroll; ikke erstattet. |
| `docs/beslutningsgrunnlag/stripe-live-priskontroll-2026-09-15.md` | Gammelt | Datert beslutningsgrunnlag/kontroll; ikke erstattet. |
| `docs/beslutningsgrunnlag/team-norway-excel-v3-kontroll.md` | Gammelt | Datert beslutningsgrunnlag/kontroll; ikke erstattet. |
| `docs/beslutningsgrunnlag/teknisk-lanseringskontroll-2026-09-10.md` | Gammelt | Datert beslutningsgrunnlag/kontroll; ikke erstattet. |
| `docs/beslutningsgrunnlag/teknisk-retting-2026-09-10.md` | Gammelt | Datert beslutningsgrunnlag/kontroll; ikke erstattet. |
| `docs/beslutningsgrunnlag/turneringsdata-spillerprofiler-analyse-2026-09-26.md` | Gjeldende | Lenket fra beslutninger.md (pipelines som eneste kilde). [lenket fra beslutninger.md] |

## docs/design

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/design/workbench-handover/SKILL.md` | Utgått | M27: bruker «Spesialiseringsperiode» (forbudt), 8 piller, radius 2, AK Golf-DS 87aa23fb. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Vaktet av check-workbench-handover.mjs (verify:static). |
| `docs/design/workbench-handover/Workbench WB-05-11.dc.html` | Utgått | 20.09-masteren (8 piller). Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Vaktet av check-workbench-handover.mjs (verify:static, kontrollsummer). |
| `docs/design/workbench-handover/assets/logo-ak-golf-hq-negative.svg` | Utgått | 20.09-masteren (8 piller). Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Vaktet av check-workbench-handover.mjs (verify:static, kontrollsummer). |
| `docs/design/workbench-handover/assets/logo-ak-golf-hq.svg` | Utgått | 20.09-masteren (8 piller). Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Vaktet av check-workbench-handover.mjs (verify:static, kontrollsummer). |
| `docs/design/workbench-handover/import-kontroll.json` | Utgått | 20.09-masteren (8 piller). Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Vaktet av check-workbench-handover.mjs (verify:static, kontrollsummer). [lenket fra script:check-workbench-handover.mjs] |
| `docs/design/workbench-handover/manifest.md` | Utgått | 20.09-masteren, 8 piller. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Vaktet av check-workbench-handover.mjs (verify:static) og tests/visual/workbench/README.md. |
| `docs/design/workbench-handover/tokens/colors.css` | Utgått | 20.09-masteren (8 piller). Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Vaktet av check-workbench-handover.mjs (verify:static, kontrollsummer). |
| `docs/design/workbench-handover/tokens/fonts.css` | Utgått | 20.09-masteren (8 piller). Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Vaktet av check-workbench-handover.mjs (verify:static, kontrollsummer). |
| `docs/design/workbench-handover/tokens/typography.css` | Utgått | 20.09-masteren (8 piller). Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Vaktet av check-workbench-handover.mjs (verify:static, kontrollsummer). |

## docs/design-audit

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/design-audit/betaling-personvern-2026-10-01.md` | Gammelt | Datert kontrollrapport (01.–02.10); ikke erstattet. |
| `docs/design-audit/brukere-funksjonskontroll-2026-10-01.md` | Gammelt | Datert kontrollrapport (01.–02.10); ikke erstattet. |
| `docs/design-audit/datagolf-kildestatus-2026-09-14.md` | Gammelt | Datert kontrollrapport (01.–02.10); ikke erstattet. |
| `docs/design-audit/datagolf-precision-wang-team-norway-2026-10-02.md` | Gammelt | Datert kontrollrapport (01.–02.10); ikke erstattet. |
| `docs/design-audit/design-data-journey-map-2026-10-01.json` | Gammelt | Datert datafil. [lenket fra script:design-data-journey-map.mjs] |
| `docs/design-audit/design-lagring-kontroll-2026-10-01.md` | Gammelt | Datert kontrollrapport (01.–02.10); ikke erstattet. |
| `docs/design-audit/etterlevelse-kontroll-2026-10-01.md` | Gammelt | Datert kontrollrapport (01.–02.10); ikke erstattet. |
| `docs/design-audit/funksjonsinventar-2026-10-01.json` | Gammelt | Datert datafil. [lenket fra script:function-coverage-inventory.mjs] |
| `docs/design-audit/gruppeflyt-kontroll-2026-10-01.md` | Gammelt | Datert kontrollrapport (01.–02.10); ikke erstattet. |
| `docs/design-audit/innlogging-royktest-2026-10-01.md` | Gammelt | Datert kontrollrapport (01.–02.10); ikke erstattet. |
| `docs/design-audit/iup-2027-funksjonsmapping-2026-10-02.md` | Gammelt | Datert kontrollrapport (01.–02.10); ikke erstattet. |
| `docs/design-audit/iup-2027-strukturkontroll-2026-10-02.md` | Gammelt | Datert kontrollrapport (01.–02.10); ikke erstattet. |
| `docs/design-audit/kodebase-audit-2026-10-01.md` | Gammelt | Datert kontrollrapport (01.–02.10); ikke erstattet. |
| `docs/design-audit/kodebase-avhengigheter-2026-10-01.json` | Gammelt | Datert datafil. |
| `docs/design-audit/kodebase-inventar-2026-10-01.json` | Gammelt | Datert datafil. |
| `docs/design-audit/main-worktrees-lansering-2026-10-01.md` | Gammelt | Datert kontrollrapport (01.–02.10); ikke erstattet. |
| `docs/design-audit/redis-gjenoppretting-2026-10-01.md` | Gammelt | Datert kontrollrapport (01.–02.10); ikke erstattet. |
| `docs/design-audit/sju-testkontoer-2026-10-01.md` | Gammelt | Datert kontrollrapport (01.–02.10); ikke erstattet. |
| `docs/design-audit/team-norway-demo-2026-09-14.md` | Utgått | Kontroll fra Claw/Train-lock-perioden 14.09. Claw er utgått 22.09; erstattet av Claude Design «Team Norway App». |
| `docs/design-audit/team-norway-dokument-invitasjon-2026-09-14.md` | Utgått | Kontroll fra Claw/Train-lock-perioden 14.09. Claw er utgått 22.09; erstattet av Claude Design «Team Norway App». |
| `docs/design-audit/team-norway-playerhq-funksjonsgap-2026-09-14.md` | Utgått | Kontroll fra Claw/Train-lock-perioden 14.09. Claw er utgått 22.09; erstattet av Claude Design «Team Norway App». |
| `docs/design-audit/team-norway-testdag-additiv-sql-2026-09-14.sql` | Gammelt | Additiv SQL-forslag. Ikke kjør (gotchas §Database). |
| `docs/design-audit/team-norway-testdag-modellforslag-2026-09-14.md` | Gammelt | Modellforslag testdag; sitert i 1 kodefil. [sitert i 1 kodefil(er)] |
| `docs/design-audit/team-norway-uavhengig-kontroll-2026-09-14.md` | Utgått | Kontroll fra Claw/Train-lock-perioden 14.09. Claw er utgått 22.09; erstattet av Claude Design «Team Norway App». |
| `docs/design-audit/team-norway-utvidelse-uavhengig-kontroll-2026-09-14.md` | Utgått | Kontroll fra Claw/Train-lock-perioden 14.09. Claw er utgått 22.09; erstattet av Claude Design «Team Norway App». |
| `docs/design-audit/testbatteri-gjennomforing-2026-10-02.md` | Gammelt | Datert kontrollrapport (01.–02.10); ikke erstattet. |
| `docs/design-audit/testbatteri-kildekontroll-2026-10-02.md` | Gammelt | Datert kontrollrapport (01.–02.10); ikke erstattet. |
| `docs/design-audit/testbatteri-scorekort-og-autolagring-2026-10-02.md` | Gammelt | Datert kontrollrapport (01.–02.10); ikke erstattet. |
| `docs/design-audit/testbatteri-testlogikk-fra-vedlegg-2026-10-02.md` | Gammelt | Datert kontrollrapport (01.–02.10); ikke erstattet. |
| `docs/design-audit/workbench-okt-og-syklus-kontroll-2026-10-02.md` | Gjeldende | Beskriver fire Workbench-visninger (Sesongkart/Ukeverksted/Trenerbord/Stats) som er bygget. M1 åpen mot Precision WB3 (nivåer). |
| `docs/design-audit/workbench-samlet-kontroll-2026-10-02.md` | Gjeldende | Beskriver fire Workbench-visninger (Sesongkart/Ukeverksted/Trenerbord/Stats) som er bygget. M1 åpen mot Precision WB3 (nivåer). |

## docs/design-exports

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/design-exports/claude-design/README.md` | Gjeldende | Kanonisk Claude Design-eksport 02.10 (nyere enn designsystem/precision-athletics-speilet; eldre enn handoff 04.10). |
| `docs/design-exports/claude-design/precision-athletics-2026-10-02.zip` | Gjeldende | Kanonisk eksport 02.10 (zip). |
| `docs/design-exports/claude-design/team-norway-app-delivery-2026-10-02.zip` | Gjeldende | Kanonisk eksport 02.10 (zip). |
| `docs/design-exports/claude-design/wang-golf-ui-prototype-2026-10-02.zip` | Gjeldende | Kanonisk eksport 02.10 (zip). |

## docs/design-handoff

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/design-handoff/README.md` | Gjeldende | Handoff-pakke 04.10. [sitert i 1 kodefil(er)] |
| `docs/design-handoff/design/agencyos/AG-08-IUP.jsx.txt` | Gjeldende | Handoff 04.10 (designkilde). |
| `docs/design-handoff/design/agencyos/AG-360.jsx.txt` | Gjeldende | Handoff 04.10 (designkilde). |
| `docs/design-handoff/design/agencyos/AG-stall.jsx.txt` | Gjeldende | Handoff 04.10 (designkilde). |
| `docs/design-handoff/design/agencyos/data-stall.js.txt` | Gjeldende | Handoff 04.10 (designkilde). |
| `docs/design-handoff/design/playerhq/PH-01.jsx.txt` | Gjeldende | Handoff 04.10 (designkilde). |
| `docs/design-handoff/design/playerhq/PH-27.jsx.txt` | Gjeldende | Handoff 04.10 (designkilde). |
| `docs/design-handoff/design/playerhq/PH-IUP.jsx.txt` | Gjeldende | Handoff 04.10 (designkilde). [sitert i 2 kodefil(er)] |
| `docs/design-handoff/design/playerhq/parts.jsx.txt` | Gjeldende | Handoff 04.10 (designkilde). |
| `docs/design-handoff/design/shared/WB3.jsx.txt` | Gjeldende | Handoff 04.10 (designkilde). |
| `docs/design-handoff/design/shared/data-iup.js.txt` | Gjeldende | Handoff 04.10 (designkilde). |
| `docs/design-handoff/design/shared/data-iup2027.js.txt` | Gjeldende | Handoff 04.10 (designkilde). |
| `docs/design-handoff/kilde/iup-2027-kilde-2026-10-01.json` | Gjeldende | 162 utviklingsspørsmål + 13 sesongspørsmål. |
| `docs/design-handoff/kilde/iup-2027-kilde-2026-10-01.md` | Gjeldende | Personfri spørsmålskilde IUP 2027. |
| `docs/design-handoff/regler/claude-code.md` | Gjeldende | Porteringskø for Claude Code. Lenket fra beslutninger.md. [lenket fra beslutninger.md] |
| `docs/design-handoff/regler/iup-i-playerhq.md` | Gjeldende | IUP-regler 04.10. |
| `docs/design-handoff/regler/kodestatus-2026-10-04.md` | Gammelt | Kodestatus 04.10 kl. 21:35 – datert øyeblikksbilde. |
| `docs/design-handoff/regler/overforing-wang-tn.md` | Gjeldende | Overføringskontrakt til WANG/TN-prosjektene. |
| `docs/design-handoff/regler/skjermliste.md` | Dublett | Kopi av docs/design-system/skjermliste-precision-athletics.md, men eldre: sier AG-02 Kø «Utgår 28.09» (beslutning 04.10/05.10: beholdes). Beslutninger 04.10 peker likevel hit som fasit for hva som finnes. Lenket fra beslutninger.md. [lenket fra beslutninger.md; sitert i 1 kodefil(er)] |
| `docs/design-handoff/regler/spesifikasjon-workbench-og-datakontrakt.md` | Gjeldende | Workbench-spesifikasjon og datakontrakt (01.10, eier byttet 04.10). M29 mot skjermliste PH-11. |
| `docs/design-handoff/regler/treningsplanlegging-master.md` | Dublett | Kopi av docs/treningsplanlegging.md (kun 3 linjer topptekst skiller). Ligger i designprosjektet som fasit-speil; kan bli stående utenfor repoet. [lenket fra skill:ak-hq-design] |
| `docs/design-handoff/tokens.css` | Gjeldende | Handoff 04.10 (designkilde). |

## docs/design-system

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/design-system/TEMA-LYS-MORK.md` | Motstrid | Sier PlayerHQ og AgencyOS er mørke som standard; beslutning 26.09: lyst er standard, natt i Live og slagregistrering. Lenket fra designsystem/README. [lenket fra README.md] |
| `docs/design-system/ak-hq-designarbeid.md` | Gjeldende | Arbeidsmåte for design (02.10). Lenket fra AGENTS, designsystem/README. [lenket fra AGENTS.md, README.md] |
| `docs/design-system/claude-design-d03-d05-beslutning-2026-09-13.md` | Gammelt | Beslutning D-03/D-05 fra Train-lock-tiden; «Automatikk» står i masteren. |
| `docs/design-system/claude-design-datagolf-h2-04-tilbakemelding.md` | Utgått | Prompt/tilbakemelding til gammel Train-lock-samtale: erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994) |
| `docs/design-system/claude-design-komplett-overlevering.md` | Utgått | Merket «HISTORISK PROMPT — IKKE KJØR»; erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Lenket fra skill ak-hq-design. [lenket fra skill:ak-hq-design] |
| `docs/design-system/claude-design-zip-3-tilbakemelding.md` | Utgått | Prompt/tilbakemelding til gammel Train-lock-samtale: erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994) |
| `docs/design-system/datagolf-claude-design-prompt-2026-09-10.md` | Utgått | Prompt/tilbakemelding til gammel Train-lock-samtale: erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994) |
| `docs/design-system/design-autoritet.md` | Gjeldende | Fasit for designvalg. Foreldet i to punkter: «Codex eier koden» (04.10: Claude Code porterer) og «markedssidene venter» (04.10: markedssidene får Precision). Lenket fra AGENTS, CLAUDE, START-HER, AGENT-BRIEF, FASIT, beslutninger og skills. [lenket fra AGENT-BRIEF.md, AGENTS.md, CLAUDE.md, FASIT.md, README.md, START-HER.md (+4); sitert i 2 kodefil(er)] |
| `docs/design-system/lanseringslop-2026-09-10.md` | Utgått | Peker på slettet MASTERPLAN. Erstattet av docs/planer/lanseringsplan-2026-10-01.md. |
| `docs/design-system/manuell-sg-skjermer.md` | Utgått | Train-lock/Geist-retning (merket historisk). Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994) |
| `docs/design-system/precision-athletics-rundeplan.md` | Gjeldende | Prosess for runder mot Claude Design. |
| `docs/design-system/skjermliste-precision-athletics.md` | Gjeldende | Skjermliste (oppdatert 04.10/05.10). Kilde for bygg-skjermregister.mjs (prosjekt:sjekk). [lenket fra script:bygg-skjermregister.mjs, script:skjermregister-typer.mjs] |
| `docs/design-system/skjermregister.csv` | Gjeldende | Generert av scripts/bygg-skjermregister.mjs; prosjekt:sjekk feiler ved drift mot koden. [lenket fra script:bygg-skjermregister.mjs] |
| `docs/design-system/skjermregister.json` | Gjeldende | Generert av scripts/bygg-skjermregister.mjs; prosjekt:sjekk feiler ved drift mot koden. [lenket fra script:bygg-skjermregister.mjs] |
| `docs/design-system/skjermregister.md` | Gjeldende | Generert av scripts/bygg-skjermregister.mjs; prosjekt:sjekk feiler ved drift mot koden. [lenket fra script:bygg-skjermregister.mjs] |
| `docs/design-system/team-norway-claw-valgt-2026-09-13.md` | Utgått | Claw valgt 13.09; erstattet 22.09 av Claude Design «Team Norway App». Lenket fra designsystem/README. [lenket fra README.md] |

## docs/drift

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/drift/lansering-og-gjenoppretting.md` | Gammelt | Oppskrift 10.09; «lansering ikke gjennomført». Overlapper docs/runbook.md. |

## docs/epost-maler

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/epost-maler/LES-MEG.md` | Gjeldende | Supabase-auth-e-poster (manuelt i dashbord). Lenket fra beslutninger, designsystem/README. Utseendet er fra før Precision (ikke kontrollert). EP-malene i Precision-handoffen gjelder booking-e-poster, ikke disse. [lenket fra README.md, beslutninger.md] |
| `docs/epost-maler/bekreft-epost.html` | Gjeldende | Supabase-e-postmal (se LES-MEG). |
| `docs/epost-maler/endre-epost.html` | Gjeldende | Supabase-e-postmal (se LES-MEG). |
| `docs/epost-maler/tilbakestill-passord.html` | Gjeldende | Supabase-e-postmal (se LES-MEG). |

## docs/gdpr

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/gdpr/behandlingsregister.md` | Gammelt | Sist oppdatert 24.05. |
| `docs/gdpr/datakart.md` | Gjeldende | Lenket fra ak-personvern-skillen og docs/README. Bygget mot schema 12.07. [lenket fra README.md, skill:ak-personvern] |
| `docs/gdpr/personvernerklaering-utkast.md` | Gammelt | UTKAST, ikke juridisk godkjent. |
| `docs/gdpr/rettigheter-status.md` | Gjeldende | Lenket fra ak-personvern. Oppfølgingsnotat 01.10. [lenket fra skill:ak-personvern] |

## docs/integrasjoner

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/integrasjoner/whoop-garmin-oppsett.md` | Gammelt | Wearable-oppsett 27.07, ikke utført. |

## docs/juridisk

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/juridisk/presisjonsstrategi-rettigheter.md` | Gammelt | Rettighetsvurdering 10.07. |

## docs/marketing

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/marketing/masterprompt-visuell.md` | Utgått | Merket «UTGÅTT VISUELL PROMPT» (Paper). Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994) |
| `docs/marketing/tekstplan-forside-2026-09-05.md` | Motstrid | Nevner kartleggingsøkt (fjernet 26.09) og slettet MASTERPLAN. |

## docs/merkevare

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/merkevare/ak-golf-merkeplattform-2026-08-31.md` | Gammelt | Godkjent 31.08; brandgrunnlag for markedssider som nå skal ha Precision (04.10). |
| `docs/merkevare/ak-golf-merkeplattform.html` | Gammelt | HTML-utgave av merkeplattformen. |
| `docs/merkevare/ak-golf-tekstkonsept-2026-09-01.md` | Motstrid | Nevner kartleggingsøkt (fjernet 26.09). Lenket fra ak-merkevare-skillen. [lenket fra skill:ak-merkevare] |

## docs/patches

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/patches/wb-v2-lov.patch` | Utgått | Patch for 8 piller/chrome 20.09. Erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994) |

## docs/planer

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/planer/agencyos-portering-natt-2026-09-28.md` | Gammelt | Nattkjøring 28.–29.09; sitert i 1 kodefil. [sitert i 1 kodefil(er)] |
| `docs/planer/ak-golf-hq-sammenhengende-datakjede-2026-09-27.md` | Motstrid | Sier treningsplanlegging-og-sprak.md er eneste master (fasit: treningsplanlegging.md). |
| `docs/planer/arbeidsliste-restoppgaver-2026-10-02.md` | Gammelt | Kaller seg «aktiv arbeidsliste» på gren grok/ph-neste-fem; Grok brukes ikke etter 04.10. Erstatning: design-handoff/regler/claude-code.md. |
| `docs/planer/claude-design-claw-team-norway-komplett-prompt-2026-09-14.md` | Utgått | Claw-prompt; Claw utgått 22.09 → «Team Norway App». |
| `docs/planer/codex-fullforing-claude-design-2026-09-30.md` | Utgått | Codex-arbeidsdeling erstattet 04.10 av design-handoff/regler/claude-code.md. Lenket fra beslutninger.md og design-autoritet.md. [lenket fra beslutninger.md] |
| `docs/planer/database-modell-deprekering-2026-09-27.md` | Gammelt | Deprekeringsliste, ikke gjennomført. |
| `docs/planer/design-lagring-brukerreiser-2026-10-01.md` | Gammelt | Lenket fra scripts/README.md. [lenket fra script:README.md] |
| `docs/planer/hovedprompt-wang-team-norway-playerhq-2026-10-02.md` | Gammelt | Brukt prompt (670 linjer). |
| `docs/planer/iup-2027-felt-og-beregningsregister-2026-10-02.md` | Gammelt | Registerdokument. |
| `docs/planer/iup-2027-funksjonsmapping-2026-10-02.json` | Gammelt | Data bak design-audit/iup-2027-funksjonsmapping. |
| `docs/planer/lanseringsplan-2026-10-01.md` | Gammelt | Datert plan; peker på Codex-økter. |
| `docs/planer/plan-portering-claude-design-til-kode-2026-09-25.md` | Utgått | Erstattet av portering-skjermer-2026-09-27 og senere codex-fullforing → portering-alle-skjermer. |
| `docs/planer/planlegging-trening-og-analyse-design-og-kode-2026-09-21.md` | Utgått | Bygger på «App design» (finnes ikke) og AK Golf Design System; erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Lenket fra treningsplanlegging.md. |
| `docs/planer/portering-alle-skjermer-2026-10-02.md` | Gjeldende | Porteringsplan (oppdatert 04.10). Kilde i bygg-skjermregister. [lenket fra script:bygg-skjermregister.mjs] |
| `docs/planer/portering-skjermer-2026-09-27.md` | Utgått | Erstattet av portering-alle-skjermer-2026-10-02 og claude-code.md. Lenket fra beslutninger.md; sitert i 2 kodefiler. [lenket fra beslutninger.md; sitert i 2 kodefil(er)] |
| `docs/planer/prosjektplan-og-lanseringsplan-2026-09-24.md` | Utgått | Erstattet av lanseringsplan-2026-10-01 (eget banner). |
| `docs/planer/team-norway-demodag-2026-09-14.md` | Utgått | «Bruk valgt Claw» – utgått 22.09. |
| `docs/planer/testbatteri-felles-testdag-og-livescoring-2026-10-02.md` | Gammelt | Gjennomføringsplan. |
| `docs/planer/testbatteri-protokollregister-2026-10-02.json` | Gammelt | Register. |
| `docs/planer/treningsplanlegging-og-sprak-en-master-2026-09-26.md` | Utgått | Plan som skapte den tapende «masteren» treningsplanlegging-og-sprak.md. Erstattet av beslutning 29.–30.09. |
| `docs/planer/wang-team-norway-playerhq-komplett-plan-2026-10-02.md` | Gammelt | Datert plan/kontroll 02.10. Innsynsregler her er delvis overstyrt av 04.10 (automatisk innsyn). |
| `docs/planer/wang-tn-gjennomforing-natt-2026-10-02.md` | Gammelt | Datert plan/kontroll 02.10. Innsynsregler her er delvis overstyrt av 04.10 (automatisk innsyn). |
| `docs/planer/wang-tn-iup-2027-sporsmal.md` | Dublett | Samme 162 spørsmål (kilde SHA 6786d70f…) som design-handoff/kilde/iup-2027-kilde-2026-10-01.json/.md og hovedprompt. Verifiser lik ordlyd før sletting. |
| `docs/planer/wang-tn-leveransekontroll-2026-10-02.md` | Gammelt | Datert plan/kontroll 02.10. Innsynsregler her er delvis overstyrt av 04.10 (automatisk innsyn). |
| `docs/planer/wang-tn-playerhq-ruteinventar-2026-10-02.md` | Gammelt | Datert plan/kontroll 02.10. Innsynsregler her er delvis overstyrt av 04.10 (automatisk innsyn). |
| `docs/planer/wang-tn-profiltilgang-kontroll-2026-10-02.md` | Gammelt | Datert plan/kontroll 02.10. Innsynsregler her er delvis overstyrt av 04.10 (automatisk innsyn). |
| `docs/planer/wang-tn-turneringsidentitet-2026-10-02.md` | Gammelt | Datert plan/kontroll 02.10. Innsynsregler her er delvis overstyrt av 04.10 (automatisk innsyn). |
| `docs/planer/workbench-fullforing-2026-10-02.json` | Gjeldende | Workbench-restpakke (fire visninger). M23: R13 «planlagt» men levert (PR #1099). |
| `docs/planer/workbench-fullforing-2026-10-02.md` | Gjeldende | Workbench-restpakke (fire visninger). M23: R13 «planlagt» men levert (PR #1099). |
| `docs/planer/workbench-rest-designkontrakt-2026-10-02.md` | Gjeldende | Workbench-restpakke (fire visninger). M23: R13 «planlagt» men levert (PR #1099). |

## docs/platform

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/platform/AGENT-BRIEF.md` | Motstrid | Peker på Workbench-bestilling 20.09 som aktiv (M1). Inngang; lenket fra AGENTS, START-HER og skills. [lenket fra AGENTS.md, CLAUDE.md, QWEN.md, README.md, START-HER.md, arkitektur.md (+12)] |
| `docs/platform/BOOKING-POLICY.md` | Gjeldende | Kodedokumentasjon. |
| `docs/platform/BOOKING-SLOT-HOLD.md` | Gjeldende | Kodedokumentasjon. |
| `docs/platform/BUSINESS-RULES.md` | Motstrid | «Eneste fasit for låste produktregler», men: Uten ball er «egenskap, ikke steg» (D8); «Mål bor i Oversikt» (M22; fasit: Workbench › Målsetninger); tre øktmodeller «skal ikke slås sammen» (M12); «Spilltrening», credits (D52). Lenket fra AGENTS, README, docs/README, AGENT-BRIEF, 3 kodefiler. [lenket fra AGENT-BRIEF.md, AGENTS.md, README.md, arkitektur.md, beslutninger.md; sitert i 3 kodefil(er)] |
| `docs/platform/DATA-MODEL.md` | Motstrid | tier GRATIS/PRO (fasit på skjerm: Gratis/Full). Banner peker til slettet STATUS-NÅ. |
| `docs/platform/DO-NOT-USE-PAPER.md` | Gjeldende | Dokumenterer check-ingen-paper.mjs (verify:static). |
| `docs/platform/NORDSTJERNE.md` | Gjeldende | Produktets ene setning; lenket fra AGENT-BRIEF. [lenket fra AGENT-BRIEF.md; sitert i 1 kodefil(er)] |
| `docs/platform/PLATFORM-PRD.md` | Gammelt | Skrevet før designrevisjon juli; eget banner. |
| `docs/platform/rute-graf-data.json` | Utgått | Data bak user-flows.md; generert av scripts/rute-graf.mjs. Erstattet av skjermregister.json. [lenket fra script:rute-graf.mjs] |
| `docs/platform/stripe-cutover-sjekkliste.md` | Gammelt | Sjekkliste for betaling 1. sept; Paper/Train-lock-farger. |
| `docs/platform/user-flows.md` | Utgått | Selv-erklært foreldet (02.09, 343 sider). Erstattet av docs/design-system/skjermregister.md. |

## docs/qa

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/qa/knapp-audit-lansering.md` | Gammelt | Statisk grep 08.09; peker på slettet STATUS-NÅ. |

## docs/referanse

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/referanse/design/2026-09-04-marked-ak-golf-port-design.md` | Utgått | Markedssider til «Master AK Golf» (kartleggingsøkt). Beslutning 04.10: markedssidene får Precision. |
| `docs/referanse/design/datamodell-utdrag-planlegging-2026-09-15.md` | Gammelt | Datamodell-utdrag 15.09. |
| `docs/referanse/masterbrain-rebuild/00-SOURCE-INVENTORY.md` | Motstrid | Nevner «17 områder» (fasit: 19, 27.09). Ellers referanse 07–08.2026. |
| `docs/referanse/masterbrain-rebuild/01-MASTERBRAIN-ARCHITECTURE.md` | Motstrid | Nevner «17 områder» (fasit: 19, 27.09). Ellers referanse 07–08.2026. |
| `docs/referanse/masterbrain-rebuild/02-PUTTING-BRAIN.md` | Gammelt | Masterbrain-rebuild (08.2026), referanse. |
| `docs/referanse/masterbrain-rebuild/03-DRILL-BANK-RESTART.md` | Gammelt | Sitert i 1 kodefil. [sitert i 1 kodefil(er)] |
| `docs/referanse/masterbrain-rebuild/04-CANDIDATE-DRILLS.json` | Gammelt | Masterbrain-rebuild (referanse). |
| `docs/referanse/masterbrain-rebuild/05-AGENT-WIRING.md` | Gammelt | Masterbrain-rebuild (08.2026), referanse. |
| `docs/referanse/masterbrain-rebuild/06-MIGRATION-PLAN.md` | Gammelt | Masterbrain-rebuild (08.2026), referanse. |
| `docs/referanse/masterbrain-rebuild/07-OPEN-QUESTIONS.md` | Motstrid | Nevner «17 områder» (fasit: 19, 27.09). Ellers referanse 07–08.2026. |
| `docs/referanse/masterbrain-rebuild/08-COACH-CLONE-VISION.md` | Gammelt | Masterbrain-rebuild (08.2026), referanse. |
| `docs/referanse/masterbrain-rebuild/09-SOURCE-TIL-MASTERBRAIN-SESSION.md` | Motstrid | Nevner «17 områder» (fasit: 19, 27.09). Ellers referanse 07–08.2026. |
| `docs/referanse/masterbrain-rebuild/10-AUDIO-INVENTORY-HOWTO.md` | Gammelt | Masterbrain-rebuild (08.2026), referanse. |
| `docs/referanse/masterbrain-rebuild/audio-inventory-summary-snapshot.md` | Gammelt | Masterbrain-rebuild (08.2026), referanse. |
| `docs/referanse/masterbrain-rebuild/scripts/README.md` | Gammelt | Masterbrain-rebuild (08.2026), referanse. |
| `docs/referanse/masterbrain-rebuild/scripts/inventory_audio.py` | Gammelt | Masterbrain-rebuild (referanse). |

## docs/sikkerhet

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/sikkerhet/action-audit.md` | Gammelt | Audit 24.07; gaten er npm run check:action-auth. |

## docs/skjermtekst

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/skjermtekst/skjerm-tekst-hovedskjermer.md` | Motstrid | «Oppgrader til Pro» (fasit: Gratis/Full, ikke Pro) og drill-kode L-BALL·CS70·M2·PR2 (utgått). Meny og fanenavn fra før IA 28.09. Sitert i 2 kodefiler. [sitert i 2 kodefil(er)] |

## docs/treningsplanlegger

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/treningsplanlegger/wang-toppidrett/arshjul-2026-2027.md` | Gjeldende | WANG årsplanmateriale (Udir-mål / årshjul). |
| `docs/treningsplanlegger/wang-toppidrett/design-handoff-arsplan-2026-27-v2/README.md` | Gjeldende | WANG årsplan 2026/27 v2. |
| `docs/treningsplanlegger/wang-toppidrett/design-handoff-arsplan-2026-27-v2/kilde/00-terminliste-2027-utkast.md` | Gjeldende | Kildefil WANG årsplan v2. |
| `docs/treningsplanlegger/wang-toppidrett/design-handoff-arsplan-2026-27-v2/kilde/01-periodebrev.md` | Gjeldende | Kildefil WANG årsplan v2. |
| `docs/treningsplanlegger/wang-toppidrett/design-handoff-arsplan-2026-27-v2/kilde/02-manedsplan.md` | Gjeldende | Kildefil WANG årsplan v2. |
| `docs/treningsplanlegger/wang-toppidrett/design-handoff-arsplan-2026-27-v2/kilde/03-ukeplan.md` | Gjeldende | Kildefil WANG årsplan v2. |
| `docs/treningsplanlegger/wang-toppidrett/design-handoff-arsplan-2026-27-v2/kilde/04-oktmaler.md` | Gjeldende | Kildefil WANG årsplan v2. |
| `docs/treningsplanlegger/wang-toppidrett/design-handoff-arsplan-2026-27/DATA-KONTRAKT.md` | Gjeldende | Datakontrakt-form brukt av v2; sitert i 1 kodefil. [sitert i 1 kodefil(er)] |
| `docs/treningsplanlegger/wang-toppidrett/design-handoff-arsplan-2026-27/README.md` | Motstrid | «CS50 min» og CS/PR-koder (utgått). Handoff 25.08, erstattet av v2 (22.09) for innhold. |
| `docs/treningsplanlegger/wang-toppidrett/grunnlag-funn.md` | Gammelt | Grunnlag-innsamling. |
| `docs/treningsplanlegger/wang-toppidrett/kompetansemaal-kroppsoving-vg.md` | Gjeldende | WANG årsplanmateriale (Udir-mål / årshjul). |
| `docs/treningsplanlegger/wang-toppidrett/kompetansemaal-toppidrett-vg.md` | Gjeldende | WANG årsplanmateriale (Udir-mål / årshjul). |
| `docs/treningsplanlegger/wang-toppidrett/kompetansemaal.md` | Gjeldende | WANG årsplanmateriale (Udir-mål / årshjul). |
| `docs/treningsplanlegger/wang-toppidrett/oktmal.md` | Motstrid | D42: CS-nivå i øktmal (linje ~67) mens L-fase/CS/M/PR er utgått. Sitert i 1 kodefil. [sitert i 1 kodefil(er)] |
| `docs/treningsplanlegger/wang-toppidrett/systembygging-plan.md` | Gammelt | Byggeplan 07.07, utført. |

## docs/utvikling

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/utvikling/lokal-brukertest.md` | Gjeldende | Lenket fra scripts/README. [lenket fra script:README.md] |
| `docs/utvikling/lokal-testdatabase.md` | Gjeldende | Lenket fra AGENTS.md, AGENT-BRIEF. [lenket fra AGENT-BRIEF.md, AGENTS.md, script:tn-demo-lokal-seed.ts] |

## docs/vedlikehold

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `docs/vedlikehold/avhengighetssikkerhet-2026-09-13.md` | Gammelt | Datert vedlikeholdslogg. |
| `docs/vedlikehold/dokumentregister.md` | Gjeldende | Generert (npm run prosjekt:register). Lenker til hvert dokument i docs/. Lenket fra check-doc-lenker og beskytt-hook: ved sletting MÅ den regenereres. [lenket fra beskytt.mjs, script:prosjekt-register.mjs] |
| `docs/vedlikehold/filregister.json` | Gjeldende | Generert av prosjekt-register.mjs. [lenket fra script:prosjekt-register.mjs] |
| `docs/vedlikehold/flyttelogg-2026-09-10.json` | Gammelt | Flyttelogg 10.09. |
| `docs/vedlikehold/grengjennomgang-2026-09-12.md` | Gammelt | Datert vedlikeholdslogg. |
| `docs/vedlikehold/historiske-designhenvisninger.md` | Gammelt | Datert vedlikeholdslogg. |
| `docs/vedlikehold/kontrollresultat-2026-09-10.md` | Gammelt | Datert vedlikeholdslogg. |
| `docs/vedlikehold/prosjektkart.md` | Gjeldende | Mappekart 10.09; lenket fra AGENTS, README, AGENT-BRIEF, arkitektur.md. Nevner Train-lock/AK Golf/WANG/TN-mapper som aktive. [lenket fra AGENT-BRIEF.md, AGENTS.md, README.md, arkitektur.md] |
| `docs/vedlikehold/prosjektstruktur.json` | Gjeldende | Konfig for check-project-structure og check-doc-lenker (verify:static). Må oppdateres ved sletting av mapper i historiskeDokumenter/eksterneDokumenter. [lenket fra script:check-doc-lenker.mjs, script:check-project-structure.mjs] |
| `docs/vedlikehold/samling-og-opprydding-2026-09-11.md` | Gammelt | Datert vedlikeholdslogg. |
| `docs/vedlikehold/samling-og-opprydding-2026-09-13.md` | Gammelt | Datert vedlikeholdslogg. |
| `docs/vedlikehold/sikkerhet-og-enheter-2026-09-11.md` | Gammelt | Datert vedlikeholdslogg. |

## prisma

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `prisma/migrations/README.md` | Gjeldende | Migrasjonskonvensjoner; gotchas §Database gjelder foran (migrate dev/deploy blokkert). |

## public

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `public/brand/foto/renset/LES-MEG.md` | Gjeldende | Notat om retusjerte bilder. |

## scripts

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `scripts/README.md` | Gjeldende | Inngang for scripts. |
| `scripts/katalog.md` | Gjeldende | Generert (prosjekt:register). |
| `scripts/meg-tilbakeskriving/README.md` | Gjeldende | Dokumentasjon for lokale Mac-mini-jobber. |
| `scripts/mulligan-triage/README.md` | Gjeldende | Dokumentasjon for lokale Mac-mini-jobber. |
| `scripts/saker-innsamling/README.md` | Gjeldende | Dokumentasjon for lokale Mac-mini-jobber. |

## src

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `src/components/shared/DETAIL-PATTERN.md` | Gammelt | Mønsterdok 05.2026. |
| `src/lib/ai/README.md` | Gjeldende | Kodedokumentasjon AI-foundation. |
| `src/lib/masterbrain/MANIFEST.md` | Gjeldende | Masterbrain-kart; selv-merket under revisjon for L/M/PR/CS. |
| `src/lib/masterbrain/ovelsesbank/README.md` | Gjeldende | Kodedok. |
| `src/lib/masterbrain/ovelsesbank/godkjent/README.md` | Gjeldende | Kodedok. |
| `src/lib/masterbrain/ovelsesbank/kandidater/drill-qa-rapport.md` | Gammelt | Generert QA-rapport 27.07. |
| `src/lib/masterbrain/ovelsesbank/plan-inntak-og-godkjenning.md` | Gjeldende | Kodedok (nevner ELITE i en tabell – sjekk). |
| `src/lib/masterbrain/ovelsesbank/til-godkjenning/README.md` | Gjeldende | Kodedok (arbeidsmappe, ikke fasit). |
| `src/lib/masterbrain/rag-corpus/live/live-readiness-check.md` | Motstrid | Bruker utgåtte L-faser/CS/PR-koder. Del av RAG-korpus lest av index.json/hent-kunnskap (kodedata). |
| `src/lib/masterbrain/rag-corpus/morad/confidence-bands-coaching.md` | Motstrid | Bruker utgåtte L-faser/CS/PR-koder. Del av RAG-korpus lest av index.json/hent-kunnskap (kodedata). |
| `src/lib/masterbrain/rag-corpus/morad/morad-p1-setup.md` | Motstrid | Bruker utgåtte L-faser/CS/PR-koder. Del av RAG-korpus lest av index.json/hent-kunnskap (kodedata). |
| `src/lib/masterbrain/rag-corpus/morad/truth-layer-prioritet.md` | Motstrid | Bruker utgåtte L-faser/CS/PR-koder. Del av RAG-korpus lest av index.json/hent-kunnskap (kodedata). |
| `src/lib/masterbrain/training-data/eval/RUBRIC.md` | Motstrid | Evaluerer mot L-fase/CS/PR-tabell (utgått). |
| `src/lib/masterbrain/training-data/examples/README.md` | Motstrid | Bruker L-fase, CS70, M3, PR2 (utgått 27.09). |
| `src/lib/masterbrain/rag-corpus/**/*.md (89 md, ekskl. 4 listet)` | Gjeldende | RAG-korpus lest av kode via rag-corpus/index.json og hent-kunnskap/rag-select. Ikke dokumentasjon; ikke slett som dokument. |

## tests

| Sti | Status | Erstattet av / merknad |
|---|---|---|
| `tests/e2e/README.md` | Gammelt | E2E-guide 07.2026; «20 tester» foreldet. |
| `tests/iup-local/README.md` | Gjeldende | Lokal IUP-prøve. |
| `tests/testbatteri-local/README.md` | Gjeldende | Lokal testbatteri-prøve. |
| `tests/visual/README.md` | Utgått | «Historisk Train-lock-sammenligningsrigg» (eget banner). Lenket fra prosjektstruktur.json (inngang) og DO-NOT-USE-PAPER. |
| `tests/visual/playerhq-summary/README.md` | Gammelt | Train-lock/Geist/v3-rigg (11.09); komponentprøve. |
| `tests/visual/portering/README.md` | Gammelt | Teknisk regresjon; Train-lock-bilder er historikk. |
| `tests/visual/workbench/README.md` | Gammelt | Workbench-komponentprøve (20.09-masteren, refererer docs/design/workbench-handover/). |

## Bildemapper og andre ikke-tekstfiler

| Sti | Status | Merknad |
|---|---|---|
| `docs/skjermbilder/**` (58 PNG) | Gammelt | Skjermbilder fra PH-12/PH-24/BK-01 med «kode» og «tegning»; ikke lenket fra noe dokument eller skript (søk etter `docs/skjermbilder` ga ingen treff). |
| `docs/design/workbench-handover/*.png` (16 PNG) | Utgått | 20.09-masteren, erstattet av «AK Golf Precision Athletics» i Claude Design. Kontrollsummer vaktes av check-workbench-handover.mjs. |
| `docs/design-exports/claude-design/*.zip` (3) | Gjeldende | Eksport 02.10 (Precision, Team Norway App, WANG-prototype). Nyere enn designsystem/precision-athletics (28.09), eldre enn handoff 04.10. |
| `designsystem/train-lock/**` ikke-md (ca. 231: 213 .dc.html, jsx, css, js, thumbnail) | Utgått | erstattet av «AK Golf Precision Athletics» i Claude Design (7d7c2994). Siteres fra 99 kodefiler. |
| `designsystem/ak-golf/**` ikke-md (ca. 183: html, jsx, ts, svg, css, json, sh) | Utgått | Se P9f. |
| `designsystem/team-norway/**` ikke-md (ca. 207: html, js, jsx, ts, css, thumbnail, png, json) | Utgått | Claw-speil. |
| `designsystem/wang/**` ikke-md (ca. 77: html, css, js, json, svg) | Gammelt | Eget system, ikke utgått. |
| `designsystem/precision-athletics/**` ikke-md (ca. 198: jsx, js, html, css, txt) | Gjeldende | Speil 28.09; `MANIFEST.txt`. |
| `designsystem/canvas/**` ikke-md (ca. 41: 30 html, json, py, jpg, svg) | Utgått | Se P9c. |
| `designsystem/ak-golf-ds/**` ikke-md (22: 21 css, tokens.json) | Utgått | Vaktet av ak-golf-ds-tokens.mjs (verify:static). |
