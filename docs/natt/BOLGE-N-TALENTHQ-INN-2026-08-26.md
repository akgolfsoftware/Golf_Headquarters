# Bølge N — TalentHQ inn i AK Golf HQ

Skrevet 26.08.2026. Grunnlag: Anders' beslutning 26.08 (sju punkter), full kartlegging av begge
repoer, direkte oppslag mot prod-databasen, og designgjennomgang av Claude Design-prosjektet
«Design review og konsolidering» (`823cd155-2b82-4b2e-b93f-179ce0758b25`, zip mottatt 26.08).

> **Levende plan.** Slettet i docs-oppryddingen 27.08 (#614), gjenopprettet 28.08 med
> oppdatert status og gjennomføringsrekkefølge. Dette er fasiten for TalentHQ-innflettingen.
> Lansering (Stripe, C8, at Anders ser skjermene) er et annet spor —
> `docs/LANSERINGSPLAN-KOMPLETT-2026-08-27.md`.

**Plassering:** egen bølge etter T-bølgen (beslutning 7). T-bølgen er kodet 28.08.
**Gjennomføring:** §3.0 under (10 steg). Ett steg = én økt = egen gren fra `main`.

---

## 0. Utgangspunktet — hva som faktisk er sant

Seks funn som endrer omfanget vesentlig i forhold til hva beslutningsnotatet antok.

### 0.1 KRITISK: DataGolf-tilførselen til akgolf-hq — **FLYTTET I N1 (26.08)**

`pipelines/datagolf/writers/public_db.py` skriver **rett inn i akgolf-hq sitt Prisma-skjema**:
`public.public_players`, `public.tournaments`, `public.public_player_entries`,
`public.public_player_rounds`, `public.datagolf_sync_state`.

**26.08:** fila bor i `akgolfsoftware/ak-golf-pipelines`, ikke lenger i talenthq.
Arkiveres talenthq **før** pipeline-repoet har kjørt grønt minst én uke, stopper
DataGolf-tilførselen til produksjon. Det er derfor N14 (steg 10) venter.

### 0.2 Databasen er allerede flyttet

`dashboard`-schemaet ligger **i `dcnxoztjtdqoidaekxry`** — akgolf-hq sin egen prod-database
(London/eu-west-2). Verifisert 26.08 med direkte oppslag. Det er ikke to databaser som skal
slås sammen; det er to schemaer i samme instans, bevisst adskilt (kommentar i
`drizzle/schema.ts` bekrefter at skillet er tilsiktet).

62 tabeller i `dashboard`. De store, lest fra prod 26.08:

| Tabell | Rader |
|---|---:|
| `dashboard.dg_rounds` | 630 767 |
| `dashboard.dg_round_sg` | 630 764 |
| `dashboard.tournament_results` | 86 798 |
| `dashboard.dg_players` | 3 548 |
| `dashboard.dg_events` | 1 664 |
| `dashboard.dg_sync_state` | 1 511 |
| `dashboard.tournaments` | 1 163 |
| `dashboard.test_shots` | 732 |
| `dashboard.test_results` | 193 |
| `dashboard.organizations` | 21 |
| `dashboard.selection_criteria` / `selection_scores` | 16 / 40 |
| `dashboard.wang_recruit_flags` | 4 |
| `dashboard.player_org_memberships` | 0 |
| `dashboard.uttak_sessions` | 0 |

I tillegg **8 materialiserte views** (`mv_canonical_players`, `mv_player_yearly_stats`,
`mv_cohort_baselines`, `mv_player_growth_rate`, `mv_club_aggregates`, `mv_college_pipeline`,
`mv_cohort_progression`, `mv_player_unified_timeline`), oppdatert av
`pipelines/common/refresh_views.py` etter hver synk.

**Konsekvens:** «migrer databasen» utgår som oppgave. Det som gjenstår er *lesetilgang*.

**Anbefaling (N2):** IKKE skru på Prisma `multiSchema`. Det krever `@@schema` på alle **188**
modeller — stor, risikofylt endring for å nå read-only analysedata. Bygg i stedet en smal
lesemodul med `$queryRaw` mot `dashboard.*` og zod ved grensen (invariant 6).

### 0.3 Pipelines er Python og kjører allerede i GitHub Actions

96 Python-filer, 11 pipelines, orkestrert av **7 GitHub Actions-workflows med cron** — ikke
Vercel, ikke LaunchAgent:

| Workflow | Cron | Kilde → mål |
|---|---|---|
| `datagolf-sync.yml` | `0 6 * * *` | DataGolf → `dashboard.dg_*` |
| `datagolf-public-sync.yml` | **kun manuell** | DataGolf → **`public.*` (akgolf-hq)** |
| `datagolf-skills.yml` | `0 4 * * 0` | skill ratings, approach skill |
| `junior-tours-sync.yml` | `0 4 * * 1` | GolfBox → turneringer |
| `nordic-league-sync.yml` | `0 4 * * *` | Nordic League |
| `wagr-sync.yml` | `0 8 * * 3` | WAGR |
| `college-ingest.yml` | `0 6 * * 1` | Clippd + Golf6 |

Env: `DATABASE_URL`, `DIRECT_URL`, `DATAGOLF_API_KEY`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`, `PIPELINES_CACHE_DIR`.

**Konsekvens:** pipelines skal ikke skrives om til TypeScript, og de trenger ikke Mac Mini.
De trenger et repo som ikke er arkivert, med de samme GitHub-secretene. Det er en
flytteoperasjon, ikke en byggejobb.

Følger med som ufravikelig bagasje: `pipelines/common/legal_guard.py`,
`source_registry.yaml`, `docs/legal-policy.md`, `docs/data-sources.md` (deny-liste,
rate-limit 40/min, behandlingsgrunnlag per kilde) og 26 pytest-filer i CI.
**DataGolf krever attribusjon «Data powered by DataGolf» i UI** — lisensvilkår, mangler i
akgolf-hq i dag.

### 0.4 Samtykke-stakken er allerede bygget

Beslutning 6 (samtykke per organisasjon) har **hele datamodellen og regelverket i kode** fra
T8-leveransen 16.08:

- `DelingsSamtykke` (append-only, trekk = ny rad) — `prisma/schema.prisma:808`
- `EksternLeserGruppe` (GUEST ↔ Group, `revokedAt`) — `:829`
- `src/lib/deling/samtykke-regler.ts` — rene regler + versjonert samtyketekst
- `src/lib/auth/ekstern-leser-scope.ts` — eneste lovlige spørringsinngang; krever aktiv
  ekstern-leser-rad **+** aktivt medlemskap **+** gyldig samtykke
- `src/app/innsyn/**` (finnes, men på Paper-tokens) · `/portal/meg/innstillinger/personvern`
  · `/forelder/samtykke` · `/admin/team/ekstern`

GDPR-standpunktet er låst: **gruppemedlemskap er aldri delingsgrunnlag**, mindreårige krever
`FORESATT`. Strengere enn designet antar — og det skal det forbli.

**Konsekvens:** Team Norway-innsyn bygges som *konfigurasjon* av eksisterende stakk.
Det som mangler er at **Team Norway ikke finnes som kanonisk gruppe**
(`src/lib/domain/grupper.ts:55-64` har åtte, ingen TN).

### 0.5 Testmotoren finnes — men slag-dataene er strukturert bedre i talenthq

akgolf-hq har `src/lib/portal-tester/` i drift: protokoll-parser som allerede håndterer
**Team Norway-varianten**, server-side scoringsmotor, `TestSession`-flyt, CANON-tilgangsregel.
Train-lock-fasiten har dessuten **16 ferdige TE-skjermer** (`TE-03 TN Putt Gate`,
`TE-04 Live Gate`, `TE-06 Live Innspill`, `TE-09 Gapping-stige`, m.fl.).

Men tre ting finnes bare i talenthq:

1. **`dashboard.test_shots`** — én rad per slag med `pei`, `sg`, `pga_putts`, `x`, `y`,
   `retning`, indeksert og spørrbar. akgolf-hq lagrer det samme som fritekst i
   `TestResult.details Json?`. Det er `test_shots` som gjør spredningskart og
   per-slag-diagnose mulig i det hele tatt.
2. **Scorekort-motoren:** `shared/protocols/protocol-definitions.js` (850 l., 11 protokoller
   transkribert rad-for-rad fra Team Norway-Excel med kolonner preset/input/computed,
   kjønnsvarianter og banelengder per hull) + `scorecard-compute.js` +
   `sg-reference.js` (2 898 l. SG-oppslag) + `parity.test.ts` (69 tester som krever
   bit-identisk klient/server-resultat).
3. **Attesterings-/markørmodellen:** `witness_user_id`, `witness_status`,
   `attestation_mode` + markør-kø-skjerm. `TestResult` i akgolf-hq har ingen vitne-felter.

**Konsekvens:** designprosjektets tre «arketyper» (port / tall / stige) beskriver noe som
allerede er tegnet fra **spillerens** side. Det ekte skjerm-gapet er **trenerens
føringsskjerm** — å føre flere spillere gjennom samme protokoll på en testdag.

### 0.6 PEI har to motstridende formler i samme repo

| Sted | Formel | Retning |
|---|---|---|
| `shared/test-calculations.ts` → `calcPEI` | `(Rand − fraHull) / Rand × 100` | **Høyere er bedre** |
| `shared/protocols/protocol-definitions.js` | `resultat / lengde` | **Lavere er bedre** |

Den andre matcher akgolf-hq (`src/lib/portal-tester/test-scoring.ts:228` — «PEI for ett slag
= nærhet ÷ lengde») og designprosjektets tallformat («4,26 % · 0,04»). Men de gir motsatt
fortegnsretning, og begge er i bruk i talenthq. Se N-D5.

---

## 1. Designgjennomgangen — hva som holder og hva som ikke gjør det

Designprosjektet er faglig godt. Domenetenkningen er ekte: skoleoversikt, kartlegging,
karaktermatrise, uttak, fellestestdag, og — viktigst — **dekningsgrad per gruppe**
(«4 av 11 med profil»), som er nøyaktig riktig konsekvens av at samtykke er frivillig.
Det er den innsikten som gjør TN-flaten ærlig i stedet for misvisende.

Fargene er verifisert samplet fra logo-SVG-ene i zipen:

| | Handling | Signal | Kilde |
|---|---|---|---|
| Team Norway | `#0C2A5C` navy | `#D50431` rød | `team-norway-exact.svg` |
| WANG | `#17446F` navy | `#2E857D` teal | `wang-logo.svg` |

WANG stemmer **eksakt** med `src/styles/wang-tokens.css` som allerede finnes.
**Merk:** talenthq sin `DESIGN.md` oppgir andre TN-farger (`#002868` / `#EF2B2D`), og
`ds-logos/team-norway-primary-on-light.svg` bruker dem. De to logovariantene er altså ikke
samstemte. Designprosjektets sampling fra `team-norway-exact.svg` er den ferskeste — men
Anders bør bekrefte hvilken logo som er offisiell før tokens låses.

### Fire avvik

| # | Avvik | Status |
|---|---|---|
| 1 | `github.md` peker på `akgolfsoftware/talenthq` og planlegger tre bølger (60+ skjermer) videre der | **Står.** Repoet skal arkiveres, ikke bygges videre på |
| 2 | «Alle trenersider er lyse. De mørke trenerskjermene er fjernet.» | **Står.** Train-lock er mørk default med lys som brukerens bryter |
| 3 | Rail: Oversikt · Testbatteri · Stall · Skoler · Innsikt · Oppsett | **Delvis — se N-D1.** Gjelder bare som avvik hvis flaten er `/admin`. Blir den egen organisasjonsflate, er designets rail et gyldig forslag |
| 4 | Spillerfaner tegnet som «I dag · Test · Analyse · Meg» | **Står.** Fasiten er **I dag · Plan · Analyse · Meg** (låst 05.08) |

Jeg tok punkt 3 for hardt i første gjennomgang. AX-01-railen (Stall · Workbench · Kø · Jarvis
· Meg) gjelder AgencyOS. En WANG- eller TN-trener har ikke Workbench, Kø eller Jarvis — så
spørsmålet er ikke «feil rail», men «hvilken flate er dette». Det er N-D1.

### Fargekonflikt

`--tl-danger` er `#FF3B30`/`#FF453A` og er reservert for **feiltilstander**. Team Norways
merkevarerød `#D50431` er visuelt svært lik, og designet bruker den som status «Uttatt» og
«Live» — som ikke er feil. Rødt ville da bety to ting på samme skjerm. Se N-D2.

---

## 2. Beslutninger som blokkerer (Anders)

### N-D1 · Hvilken flate er WANG og Team Norway? — **AVGJORT 26.08 (Anders): A**

> «Det skal være egne skjermer. Ikke under AK Golf agency.»

**Egen organisasjonsflate** — ikke AgencyOS, ikke `/admin`. Egen enkel rail, egen palett per
organisasjon, gratis tilgang, bygget på samtykke-stakken (`ekstern-leser-scope.ts`).

Konsekvenser som nå er låst:
- WANG- og TN-trenere får **aldri** AX-01-railen (Stall · Workbench · Kø · Jarvis · Meg).
  De har ikke Workbench, Kø eller Jarvis.
- **Avvik 3 i designgjennomgangen bortfaller** — designets rail (Oversikt · Testbatteri ·
  Stall/Tropp · Skoler · Innsikt · Oppsett) er dermed et gyldig forslag for denne flaten og
  skal legges til grunn i N7.
- Avvik 1, 2 og 4 står uendret: eget repo utgår, Train-lock mørk default gjelder også her,
  og spillerfanene er I dag · Plan · Analyse · Meg.
- Flaten bygges som utvidelse av `/innsyn`, eller som ny rute — byggeren avgjør i N9 og
  begrunner i DONE-fila. Tilgangskontrollen er uansett `ekstern-leser-scope.ts`.

### N-D2 · Team Norway-rød mot danger-rød — **AVGJORT 28.08: A**

TN-rød (`#D50431`) **kun på logo og skinne**. Status («uttatt», «live») = nøytral tekst/caps.
I Train-lock betyr rødt feil. To røde med ulik betydning på samme skjerm er forbudt.

### N-D3 · PEI-formelen — **AVGJORT 26.08 (Anders): `resultat ÷ lengde`, lavere er bedre**

> «Tallet som viser f.eks 4,3 %»

Bekrefter anbefalingen: samme formel som akgolf-hq allerede bruker
(`src/lib/portal-tester/test-scoring.ts`), samme tallformat som designprosjektet
(«4,26 % · 0,04»), samme retning som Team Norway-Excel-arket. Den andre formelen
(`(Rand − fraHull) / Rand × 100`, høyere bedre) er nå eksplisitt FORKASTET — den skal
ikke høstes eller brukes noe sted. N3 er bygget og verifisert mot dette svaret (se §3).

### N-D4 · Hvor skal Python-pipelines bo? — **AVGJORT 26.08 (utført i N1): A**

Eget repo `akgolfsoftware/ak-golf-pipelines` (`~/Developer/ak-golf-pipelines`).
GitHub Actions-workflowene bor der. Ikke skriv Python om til TypeScript.

### N-D5 · Hvor mye av de 70 skjermene skal med? — **AVGJORT 28.08: ~23 skjermer**

**Skal ikke høstes** (bedre i akgolf-hq): auth, brukere, organisasjoner, samtykke,
GolfBox/Olyo/Østlandstour/college-scraping, SG-baselines, det gamle designsystemet,
Paper-importen. WANG-flatene sjekkes mot `src/app/team-wang/` før noe kopieres.

**Skal med (23):**

- **Team Norway (7):** Hjem, Uttak, Fellestesting, Fellestestdag, Samling, Skoler, TnBeslutning
- **Testføring (6):** Hurtigføring, Bolkføring, ProtokollScorekort, TestProtokoll,
  TestdagOppsummering, TestdagSpillerDetalj
- **Analyse (4):** AnalyseTerminal, SpredningsAnalyse, KohortUtvikling, ResultatVsFelt
- **DataGolf (3):** DataGolfTerminal, DataGolfProfil, TruthLayer
- **WANG (3, kun der HQ mangler noe):** Karaktermatrise, Kartlegging, Rekruttering

---

## 3. Sesjonsplan

Samme regler som `LAUNCH-PLAN-FULL-2026-08-25.md` Del 5: én økt per rad, ny chat, egen
worktree ved parallell, `npm run verify` grønn før commit, **aldri main-merge uten Anders'
ja**, skjermbilde-gate (390 px + 1280 px, lys + mørk) på hver skjerm-rad.

### 3.0 Gjennomføring 28.08 (10 steg — gjeldende rekkefølge)

| Steg | N-rad | Hva | Status 28.08 |
|---|---|---|---|
| 1 | docs | Levende plan tilbake + 26.08-beslutninger i `beslutninger.md` | **denne sesjonen** |
| 2 | N4 | `test_shots` + vitne. Gren `claude/n4-testshot-normalisering` finnes; tester mangler; **ikke merget**; DDL ikke kjørt | Neste kode |
| 3 | N6 | Kvitter Nordic League i `ak-golf-pipelines` (pipeline + cron finnes — **ikke bygg på nytt**) | Parallell med steg 2 |
| 4 | N7+N8 | Tegn WANG/TN-oversikt + testdag-føring i Train-lock. Anders må SE | Etter 2+3 |
| 5 | N9 | Bygg oversiktene på `/innsyn` | Etter 4 sett |
| 6 | N10 | Bygg testdag-føring | Etter 2 (tabell i prod) + 4 |
| 7 | N11 | Uttak (TN) + kartlegging (WANG) — underlag, aldri konklusjon | Etter 5 |
| 8 | N12 | DataGolf/analyse leser `dashboard.*` via N2. Attribusjon synlig. Ikke C10 | N2 inne |
| 9 | N13 | Talent ferdig + `/innsyn` Train-lock. «Mitt nivå» leser allerede `testNivaaer` | Etter 5 |
| 10 | N14 | Arkiver `akgolfsoftware/talenthq` | Etter 5–9 + N1 grønn ≥ 1 uke |

Steg 2 og 3 kan gå parallelt. Ingen skjermkode før steg 4 er sett.

### Status 28.08.2026

| # | Status | Landet | Verifisert |
|---|---|---|---|
| N1 | ✅ Ferdig — kjører mot prod | Eget repo `ak-golf-pipelines` | Ekte kjøring 26.08: dg_rounds +1260. Se `LEVERANSELOGG.md` |
| N2 | ✅ I main | PR #605 | Lesemodul `src/lib/dashboard-data/` — **ingen skjerm bruker den ennå** (N12) |
| N3 | ✅ I main | PR #605 | `src/lib/domain/pei/` |
| N5 | ✅ I main | PR #605 | TN i `KANONISKE_GRUPPER`; `beregnDekningsgrad` |
| N4 | Bygget, **ikke merget** | gren `claude/n4-testshot-normalisering` (`cfc624204`) | Tester ble tatt ut; DDL ikke kjørt mot prod |
| N6 | Pipeline finnes i `ak-golf-pipelines` (`nordic-league-sync.yml`) | — | **Kvitteres** i steg 3 — ikke ny bygg |
| N7–N14 | Ikke startet | — | T-bølgen kodet, så N7 kan starte etter steg 2+3 |

N2, N3 og N5 ble bygget som tre separate grener (hver med egen `npm run verify`), deretter
satt sammen i én integrasjonsgren og verifisert SAMMEN før merge — ingen konflikter mellom
dem. Kombinert verifisering: `npm test` 1699/1699 grønn, full `npm run verify` (533 ruter)
grønn, CI på PR #605 grønn (6m2s), Anders' «ja» gitt, squash-merget til main
26.08.2026 kl. 13:32 UTC. De tre feature-grenene og integrasjonsgrenen er slettet
(arbeidet lever videre i main).

**Hendelse under N3:** agenten mistet midlertidig en fremmed `git stash` fra en annen økt
(25.08, `golfbox.ts`/`golfbox-sync.ts` + ny `backfill-golfbox-sesonger.ts`) under
feilsøking av det kjente `npm ci`-i-worktree-gotchaet. Gjenfunnet og lagt tilbake som
`stash@{0}` i hovedrepoet samme dag — se `docs/feillogg.md` (26.08-oppføringen) for
rotårsak og gjenopprettingsmåte. Ingen data gikk tapt, men verdt å nevne til hvem det
måtte gjelde.

### Fase 0 — Haster, uavhengig av bølge T

| # | Jobb | Scope | Done | Avhenger av |
|---|---|---|---|---|
| **N1** ✅ | Sikre DataGolf-tilførselen | Flytt `pipelines/` + GitHub Actions-workflows + juridisk dok til nytt hjem per N-D4. Kopier secrets. **Verifiser at `datagolf-public-sync` skriver til `public.*` fra det nye hjemmet før talenthq røres.** Slett døde pipelines | Én full `public_db.py`-kjøring grønn fra nytt repo; `datagolf_sync_state` oppdatert; daglig cron kjører | N-D4 |

### Fase 1 — Fundament (parallelt med bølge T)

| # | Jobb | Scope | Done | Avhenger av |
|---|---|---|---|---|
| **N2** ✅ | Data-broen til `dashboard` | Read-only modul `src/lib/dashboard-data/` med `$queryRaw` + zod. IKKE `multiSchema`. Dekker `dg_rounds`, `dg_round_sg`, `tournament_results`, `dg_players` + de 8 materialiserte viewene | Modul + tester grønne; én skjerm leser ekte tall | — |
| **N3** ✅ | PEI + scorekort-motoren høstes | Etter N-D3. Høst `protocol-definitions.js` (11 protokoller), `scorecard-compute.js`, `sg-reference.js`, `test-reference-data.ts` → `src/lib/domain/pei/`. **Ta med `parity.test.ts`-mønsteret.** Regel kodet: PEI aldri i samme rad som Broadie-SG/DataGolf | Tester grønne; samme tall som talenthq på kjente input | N-D3 |
| **N4** ⏳ | `test_shots` + attestering | Kode på gren `claude/n4-testshot-normalisering`. Før merge: skriv tester, verify. Etter ja: kirurgisk DDL `scripts/n4-add-testshot-table.ts` mot prod. ALDRI `migrate`/`push`/`deploy` | Slag spørrbare per test; spredningskart mulig; tabell i prod | N3 |
| **N5** ✅ | Team Norway som organisasjon | Legg TN i `KANONISKE_GRUPPER`; koble `EksternLeserGruppe` + `DelingsSamtykke`; dekningsgrad («4 av 11 med profil») som ren funksjon; høst `selection_*`-modellen | TN-gruppe finnes; ekstern leser ser kun samtykkede spillere; uten samtykke = usynlig | — |
| **N6** ⏳ | Nordic League-pipelinen | **Finnes allerede** i `ak-golf-pipelines` (`pipelines/nordic_league/full_backfill.py` + `nordic-league-sync.yml` cron 04:00 UTC). Steg 3 = kvitter siste kjøring + rader med `source='nordic_league'`. Ikke bygg på nytt | Cron grønn; rader i `dashboard.tournaments` | N1 |

**Presisering til N5:** `selection_*`-modellen (uttak) ble bevisst IKKE høstet i denne
sesjonen — det er additiv DDL (nye tabeller), og hører hjemme i N11 sammen med resten av
uttaksfunksjonaliteten, ikke i en sesjon som skulle unngå skjemaendringer. N5 leverte
istedenfor: TN som kanonisk gruppe (`managedByAkGolf: false`, ny eksplisitt type-kolonne),
verifisert tilgang begge veier (med/uten samtykke) på ekstern-leser-stakken, og
`beregnDekningsgrad` som ren funksjon.

### Fase 2 — Design (etter bølge T)

| # | Jobb | Scope | Done | Avhenger av |
|---|---|---|---|---|
| **N7** | Fasit: organisasjonsflaten | Tegn i Train-lock (mørk scene `#000000`, lys variant): skall + Oversikt for WANG og TN. Arv per organisasjon: logo, skinne, handlingsfarge. Dekningsgrad-kortet obligatorisk på TN | `.dc.html` i `designsystem/train-lock/`; Anders har sett begge | N-D1, N-D2, T-bølgen |
| **N8** | Fasit: trenerens føringsskjerm | Det ekte gapet. Én trener fører mange spillere gjennom én protokoll. Tre arketyper (port / tall / stige) + PEI-varianten med mål-avstand, carry og side. Spillersiden finnes (TE-01…TE-13) — ikke tegn den om | `.dc.html` per arketype; Anders har sett dem | N7 |

### Fase 3 — Bygg

| # | Jobb | Scope | Done | Avhenger av |
|---|---|---|---|---|
| **N9** | Organisasjonsskall + Oversikt | Bygg per N7. Utvid `/innsyn` (eller ny rute per N-D1). Rail, org-arv, WANG- og TN-oversikt. `--tl-*`, aldri Paper | Begge oversikter live; gate: 390+1280, lys+mørk | N7, N5 |
| **N10** | Testdag og føring | Bygg per N8. Fører flere spillere gjennom protokoll; kilde låst per bolk; PEI fra N3; skriver til `test_shots` fra N4; attestering | Testdag føres ende-til-ende; verify grønn | N8, N4 |
| **N11** | Uttak (TN) + kartlegging (WANG) | `selection_criteria`/`selection_scores`/`wang_recruit_flags` tas i bruk. Karaktermatrise. **Uttak er alltid underlag — appen konkluderer aldri** (jf. `.claude/rules/wang-toppidrett.md`) | Uttaksliste + matrise live; ingen automatisk uttaksbeslutning | N9 |
| **N12** | Analyse + DataGolf inn i PlayerHQ | AnalyseTerminal, SpredningsAnalyse, KohortUtvikling, ResultatVsFelt, DataGolfProfil, TruthLayer på ekte `dg_*` via N2. Tre motorer aldri blandet. **Legg inn DataGolf-attribusjon.** Lukker D5 | Skjermene leser 630k runder; attribusjon synlig | N2, N1, D5 |
| **N13** | Talent-skjermene + `/innsyn` Train-lock | **Delvis:** `/portal/talent/mitt-niva` leser `testNivaaer`; huben redirecter. Gjenstår: L-fase-navn ut av `roadmap`; `/innsyn` ferdig til Train-lock; admin-talent parkert eller inn i org-flaten | `testNivaaer` synlig; ingen Paper-tokens på `/innsyn` | N2 |

### Fase 4 — Avvikling

| # | Jobb | Scope | Done | Avhenger av |
|---|---|---|---|---|
| **N14** | Arkiver talenthq | Verifiser at alt i N-D5-lista er portet **og at N1 har kjørt grønt i minst en uke**. Arkiver `akgolfsoftware/talenthq` på GitHub. Fjern Vercel-prosjektet. Skriv høstingslogg | Repoet arkivert; ingen kode der som ikke finnes i akgolf-hq eller pipeline-repoet | N1, N9–N13 |

**Rekkefølge nå:** steg 1 (denne) → N4 merge + N6-kvitter parallelt → N7/N8 tegning
(Anders ser) → N9–N13 bygg → N14 arkiv. T-bølgen blokkerer ikke lenger N7.

---

## 4. Det som ikke skal skje

- **Ikke arkiver talenthq før N1 har kjørt grønt minst én uke fra `ak-golf-pipelines`
  og N9–N13 er inne.** Da stopper DataGolf-tilførselen til produksjon.
- **Ikke bygg noe nytt i `ak-golf-talenthq`.** Repoet hadde en commit så sent som 26.08 —
  den strømmen må stoppe, ellers vokser gapet mens vi porter.
- **Ikke skriv Python-pipelines om til TypeScript.** 96 filer som virker, med egen CI.
- **Ikke skru på Prisma `multiSchema`** uten at noen har regnet på hva 188 `@@schema`-
  annotasjoner koster.
- **Ikke høst GolfBox, Olyo, Østlandstour, college eller SG-baselines.** Allerede dekket
  bedre i akgolf-hq (`golfbox-customers.ts`, `golfstat-client.ts`, `SgBaseline`).
- **Ikke gjeninnfør treningsregler.** Uttak og karaktermatrise er *underlag*, aldri
  konklusjon — invariant 1 og `.claude/rules/wang-toppidrett.md`.
- **Ikke dupliser testbatteriet.** To sannheter i to systemer utløste hele samlingen.
- **Ikke vis en organisasjon spillere som ikke har samtykket.** Dekningsgrad («4 av 11») er
  riktig svar — ikke å fylle inn resten.

---

## 5. Ærlighetsliste

- **Kjente datahull som følger med:** WAGR har 55 spillere men **0 events lastet**;
  GolfBox 2026 har **105 turneringer med 0 resultatrader**. Flytt pipelinene med åpne øyne —
  de er ikke «ferdige».
- `dashboard.player_org_memberships` og `uttak_sessions` er **tomme**. Modellene finnes, men
  er aldri tatt i bruk. Ikke anta at det ligger data bak dem.
- **Applikasjonslaget i talenthq nådde aldri stabil produksjon.** `ARBEIDSLOGG.md` 15.08
  dokumenterer at 4 av 6 registrerte spillere ikke kunne lagre én test, at
  `/manus-storage/*` var uautentisert og at `tests.shots.*` var fail-open. Datalaget og
  beregningslaget er derimot reelt og godt testet (441 tester + 26 pytest-filer i CI).
  **Høst datalaget og beregningene; ikke stol på applikasjonslaget.**
- Jeg har **ikke** verifisert at de høstede PEI-funksjonene gir samme tall som designets
  eksempler («4,26 % · 0,04»). Det er et done-kriterium i N3, ikke en påstand her.
- N-D5-lista (~23 skjermer) er låst 28.08. De 70 sidene i den gamle appen leses ikke
  én for én — det som ikke står i lista skal ikke høstes.
- **De to TN-logovariantene har ulike farger** (`#0C2A5C`/`#D50431` mot `#002868`/`#EF2B2D`).
  Hvilken som er offisiell er ikke avklart.
- Radtallene i §0.2 er lest direkte fra prod 26.08 og er ferske. Merk at talenthqs egen
  `docs/datagolf-status.md` (23.07) oppgir ~524 000 runder — differansen er en måneds synk,
  ikke en motsigelse.
- **Rettelse til min første designgjennomgang:** jeg kalte railen «feil» uten forbehold.
  Det var for hardt — se §1, avvik 3.
- **Oppdatering 26.08 kveld, del 2:** N2/N3/N5 ble deretter satt sammen i én
  integrasjonsgren, verifisert samlet (1699/1699 tester, full verify, CI grønn), og
  squash-merget til main som PR #605. Punktet over («aldri kjørt sammen») er dermed
  lukket — men verdt å huske SOM MØNSTER for N4/N6 og senere: verifiser alltid
  kombinasjonen, ikke bare hver del.
- N3-agenten rapporterte selv at et par av de 11 protokollene i `protocol-definitions.js`
  ble bevisst utelatt (kun 23 av 29 totalt, inkl. de 6 rene fysisk-testene som allerede
  dekkes av `test-scoring.ts`) — N3-DONE ble komprimert inn i `LEVERANSELOGG.md` 27.08.
  Ikke anta at høstingen er komplett før noen har sjekket protokoll-lista mot N-D5.
