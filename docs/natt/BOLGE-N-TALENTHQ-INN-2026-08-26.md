# Bølge N — TalentHQ inn i AK Golf HQ

Skrevet 26.08.2026. Grunnlag: Anders' beslutning 26.08 (sju punkter), full kartlegging av begge
repoer, direkte oppslag mot prod-databasen, og designgjennomgang av Claude Design-prosjektet
«Design review og konsolidering» (`823cd155-2b82-4b2e-b93f-179ce0758b25`, zip mottatt 26.08).

**Plassering i lanseringssporet:** egen bølge **etter bølge T**, per beslutning 7.
**Unntak:** N1 haster og må kjøres uavhengig av T — se §0.1.

---

## 0. Utgangspunktet — hva som faktisk er sant

Seks funn som endrer omfanget vesentlig i forhold til hva beslutningsnotatet antok.

### 0.1 KRITISK: én Python-fil er i dag eneste vei DataGolf-data når akgolf-hq

`pipelines/datagolf/writers/public_db.py` i talenthq skriver **rett inn i akgolf-hq sitt
Prisma-skjema**: `public.public_players`, `public.tournaments`, `public.public_player_entries`,
`public.public_player_rounds`, `public.datagolf_sync_state`.

Det forklarer schema-kommentaren ved `DatagolfSyncState` («Skrives ikke av denne appen i dag»).

**Arkiveres talenthq før denne er flyttet, stopper DataGolf-tilførselen til produksjon.**
Dette er den enkeltoppgaven som haster mest, og den er uavhengig av all design og alle
skjermer. Den skal ikke vente på bølge T.

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

### N-D2 · Team Norway-rød mot danger-rød

**A.** TN-rød kun på logo og skinne; status bruker nøytral tekst/caps.
**B.** Egen `--tn-signal`-token, og danger vises aldri på TN-flaten.

**Anbefaling: A.** I Train-lock betyr rødt feil. To røde med ulik betydning på samme skjerm er
den tvetydigheten invariant 8 forbyr.

### N-D3 · PEI-formelen *(blokkerer N3 — må avklares før høsting)*

Hvilken gjelder: `(Rand − fraHull) / Rand × 100` (høyere bedre), eller `resultat / lengde`
(lavere bedre)?

**Anbefaling: den andre** — den matcher akgolf-hq, designprosjektets tallformat og
Team Norway-Excel-arket. Men dette er Anders' fagdomene, ikke mitt å avgjøre.

### N-D4 · Hvor skal Python-pipelines bo?

**A.** Eget repo `ak-golf-pipelines` — GitHub Actions-workflowene flyttes med, secrets kopieres.
**B.** Mappe i akgolf-hq (Python side om side med Next.js, aldri deployet).

**Anbefaling: A.** Holder Next.js-repoet rent, og workflowene kan flyttes nesten uendret.
`.venv` og `__pycache__` skal ikke med (98 MB), og de døde pipelinene (`olyo`,
`ostlands_tour`, `legacy_scrapers`, `global_junior_golf`) slettes i flyttingen.

### N-D5 · Hvor mye av de 70 skjermene skal med?

Kartleggingen viser at mindre skal med enn antatt. **Allerede dekket bedre i akgolf-hq —
skal ikke høstes:** auth/innlogging, brukere, organisasjoner, samtykke, WANG-flatene,
GolfBox-, Olyo-, Østlandstour- og college-scraping, SG-baselines, designsystemet
(92 `.jsx` mot annet token-sett), Paper-importen.

Forslag til det som **skal** med:

- **Team Norway (7):** Hjem, Uttak, Fellestesting, Fellestestdag, Samling, Skoler, TnBeslutning
- **Testføring (6):** Hurtigforing, Bolkforing, ProtokollScorekort, TestProtokoll,
  TestdagOppsummering, TestdagSpillerDetalj
- **Analyse (4):** AnalyseTerminal, SpredningsAnalyse, KohortUtvikling, ResultatVsFelt
- **DataGolf (3):** DataGolfTerminal, DataGolfProfil, TruthLayer
- **WANG (3, kun der HQ mangler noe):** Karaktermatrise, Kartlegging, Rekruttering —
  sjekkes konkret mot `src/app/team-wang/` først

= **ca. 23 skjermer.** Krever Anders' gjennomgang før N13.

---

## 3. Sesjonsplan

Samme regler som `LAUNCH-PLAN-FULL-2026-08-25.md` Del 5: build = Sonnet 5, én økt per rad,
ny chat, egen worktree ved parallell, maks 2–3 samtidige, `npm run verify` grønn før commit,
`docs/natt/N<x>-DONE.md` per rad, **aldri main-merge uten Anders' ja**, skjermbilde-gate
(390 px + 1280 px, lys + mørk) på hver skjerm-rad.

### Fase 0 — Haster, uavhengig av bølge T

| # | Jobb | Scope | Done | Avhenger av |
|---|---|---|---|---|
| **N1** | Sikre DataGolf-tilførselen | Flytt `pipelines/` + GitHub Actions-workflows + juridisk dok til nytt hjem per N-D4. Kopier secrets. **Verifiser at `datagolf-public-sync` skriver til `public.*` fra det nye hjemmet før talenthq røres.** Slett døde pipelines | Én full `public_db.py`-kjøring grønn fra nytt repo; `datagolf_sync_state` oppdatert; daglig cron kjører | N-D4 |

### Fase 1 — Fundament (parallelt med bølge T)

| # | Jobb | Scope | Done | Avhenger av |
|---|---|---|---|---|
| **N2** | Data-broen til `dashboard` | Read-only modul `src/lib/dashboard-data/` med `$queryRaw` + zod. IKKE `multiSchema`. Dekker `dg_rounds`, `dg_round_sg`, `tournament_results`, `dg_players` + de 8 materialiserte viewene | Modul + tester grønne; én skjerm leser ekte tall | — |
| **N3** | PEI + scorekort-motoren høstes | Etter N-D3. Høst `protocol-definitions.js` (11 protokoller), `scorecard-compute.js`, `sg-reference.js`, `test-reference-data.ts` → `src/lib/domain/pei/`. **Ta med `parity.test.ts`-mønsteret.** Regel kodet: PEI aldri i samme rad som Broadie-SG/DataGolf | Tester grønne; samme tall som talenthq på kjente input | N-D3 |
| **N4** | `test_shots` + attestering | Normaliser slag-lagring: egen tabell (additiv DDL via kirurgisk `db execute` — ALDRI `migrate`/`push`/`deploy`, jf. gotchas) med `pei`, `sg`, `x`, `y`. Legg til vitne-felter på `TestResult`. Migrer eksisterende `details Json?` | Slag spørrbare per test; spredningskart mulig; verify grønn | N3 |
| **N5** | Team Norway som organisasjon | Legg TN i `KANONISKE_GRUPPER`; koble `EksternLeserGruppe` + `DelingsSamtykke`; dekningsgrad («4 av 11 med profil») som ren funksjon; høst `selection_*`-modellen | TN-gruppe finnes; ekstern leser ser kun samtykkede spillere; uten samtykke = usynlig | — |
| **N6** | Nordic League-pipelinen | Det eneste turneringssporet akgolf-hq mangler helt. Kjøres fra det nye pipeline-repoet | Nordic League-turneringer i `dashboard.tournaments`; cron grønn | N1 |

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
| **N13** | Talent-skjermene leser `testNivaaer` | Lukk det målte hullet: syncen skriver, ingen skjerm leser. Fjern L-fase-navn fra `roadmap`. Port `/innsyn` fra Paper til Train-lock | `testNivaaer` synlig; ingen Paper-tokens på `/innsyn` | N2 |

### Fase 4 — Avvikling

| # | Jobb | Scope | Done | Avhenger av |
|---|---|---|---|---|
| **N14** | Arkiver talenthq | Verifiser at alt i N-D5-lista er portet **og at N1 har kjørt grønt i minst en uke**. Arkiver `akgolfsoftware/talenthq` på GitHub. Fjern Vercel-prosjektet. Skriv høstingslogg | Repoet arkivert; ingen kode der som ikke finnes i akgolf-hq eller pipeline-repoet | N1, N9–N13 |

**Rekkefølge:** **N1 først og alene** (haster). Deretter N2 · N3 · N5 parallelt (disjunkte
filer, ingen skjermer). N4 etter N3, N6 etter N1. Fase 2 venter på bølge T. N14 sist.

---

## 4. Det som ikke skal skje

- **Ikke arkiver talenthq før N1 er verifisert grønn.** Da stopper DataGolf-tilførselen til
  produksjon.
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
- Jeg har **ikke** lest alle 70 sidene. N-D5-lista bygger på filnavn, agentkartlegging og
  designprosjektets egen skjermkartlegging. Må gjennomgås av Anders før N14.
- **De to TN-logovariantene har ulike farger** (`#0C2A5C`/`#D50431` mot `#002868`/`#EF2B2D`).
  Hvilken som er offisiell er ikke avklart.
- Radtallene i §0.2 er lest direkte fra prod 26.08 og er ferske. Merk at talenthqs egen
  `docs/datagolf-status.md` (23.07) oppgir ~524 000 runder — differansen er en måneds synk,
  ikke en motsigelse.
- **Rettelse til min første designgjennomgang:** jeg kalte railen «feil» uten forbehold.
  Det var for hardt — se §1, avvik 3.
