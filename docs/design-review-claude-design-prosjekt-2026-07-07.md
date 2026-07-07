# Komplett review — Claude Design-prosjektet «AK Golf HQ Design System»

**Dato:** 2026-07-07 (kveld) · **Kilde:** live-prosjektet på claude.ai/design (bb9b2b1d) via DesignSync ·
**Metode:** styringslag (CLAUDE.md, beslutningslogg B01–B24, DEKNINGSKART), token-laget (colors/data-viz),
prosjektets egen kode-audit (skjerm-plan-audit-2026-07-07), PlayerHQ-kitet (shell/home/template/premium-referanse),
kryssjekket mot repo-kanon (BUSINESS-RULES, ordbok, MasterBrain CANON v3.5, design-revisjonene 6.–7. juli) og
WCAG-kontrast verifisert med utregning — ikke antatt.

## Overordnet dom

Dette er et **uvanlig modent design-systemprosjekt**: firelags fargesystem med definerte jobber per lag,
deuteranopi-testet aksepalett, selvhostede variable fonter, tilstandsgalleri med 12 komponentfamilier i begge
temaer, maskinlesbar handover (token-generator + adherence-lint), bundle-hygiene-regler og en søkbar
beslutningslogg (B01–B24) med invariant/husregel-skille. Terminologi-arbeidet (tolags-språk, Nærspill,
Situasjon-kanon, fot for putting) er gjennomført og dokumentert med migreringsspor.

**Men:** tre kanon-konflikter mot produksjonsrepoet må avgjøres av Anders før v14 låses, én
tilgjengelighets-påstand i tokens er matematisk feil, og prosjektets egen audit er utdatert på to punkter
repoet allerede har fikset.

---

## P0 — må avgjøres/rettes før v14-eksporten

### 1. Priskonflikt: 299 vs 300 kr/mnd — to motstridende «Anders-beslutninger»
- Design-prosjektet (CLAUDE.md + B09, 2.–3. juli): **«GRATIS · PRO 299 kr/mnd · 2690 kr/år. Ordbokens ‘300’ var stale»** — utrullet i alle demoer.
- Repoet (docs/platform/BUSINESS-RULES.md, Anders-beslutning 2026-06-22, re-bekreftet i design-revisjon 2026-07-06): **«300 kr/mnd er den låste, riktige prisen — det er design-handoverens 299 som er feil og ikke skal kopieres inn i appen.»**
- Begge sider hevder den andre er stale. **Kun Anders kan avgjøre.** Taperen migrerer (design: alle demo-strenger + structure.card-FAQ; repo: BUSINESS-RULES + abonnement-copy).

### 2. `--text-faint` — påstanden «over AA» er matematisk feil
- tokens/colors.css sier: *«bekreftet 7. jul 2026, ~4,85:1 mot --surface — over AA»* for mørk `--text-faint` (graphite-500 `#6B6C64`).
- **Utregnet:** 3,35:1 mot `--surface #171817` · 3,71:1 mot bg `#0A0B0A` · 3,12:1 mot `#1E1F1D`. Lys (`sand-500 #8E908C`): 2,85:1 på sand-100, 3,22:1 på hvit. **Alle under 4,5:1.**
- «KUN dekorativ tekst»-regelen er på plass (bra — samme regel som repo-hotfixen), men verdien brukes i kit på småetiketter folk faktisk leser. Repoet justerte 7. juli til `#8A8C86` (mørk, 4,87:1) / `#686A66` (lys, 4,83:1) — design bør adoptere samme eller bedre, og rette den falske kommentaren.

### 3. CS-nivåer: B07 «CS50–CS100» vs MasterBrain CANON v3.5 «CS20–CS100»
- B07 (invariant, Anders 3. juli): seks nivåer CS50–100, «CS20/30/40 finnes ikke i UI». Demo-data migrert.
- Repo-fasit: CANON v3.5 + docs/ordbok-ak-golf-konsept.md opererer med CS20–100, og L-fase-båndene er definert derfra (L_KROPP = CS20–40, L_ARM = CS20–50). `scripts/ordbok-json.ts` **validerer mot canon** og eksporterer disse båndene.
- Hvis B07 står (og det ser ut som en ekte Anders-beslutning): **CANON v3.5 + repo-ordboken + L-fase-CS-båndene må oppdateres** — ellers validerer repoet mot én fasit mens designet bygger mot en annen. Hvis B07 IKKE står: design-demoene må migreres tilbake. Avklar én gang, synk begge veier.

---

## P1 — synk-oppgaver og begrepsfeil

### 4. Periodiseringsmodellen kolliderer med Prisma
Design bruker makro-fasene **Base · Forberedelse · Spesialisering · Taper · Peak · Overgang** (CLAUDE.md + `--phase-*`-tokens). Prisma/repo har `PeriodeType` = **GRUNN / SPESIALISERING / TURNERING / EVALUERING / FERIE** (+ `LPhase` GRUNN/SPESIAL/TURNERING). Ingen mapping er definert noe sted. I tillegg kaller data-viz.css rampen *«L-fase sekvensiell rampe»* — begrepsfeil etter prosjektets EGEN regel (L-fase/Læringstrinn ≠ periodisering; «fase» er reservert periodisering). Trengs: én omforent fasemodell + mapping-tabell, og rett kommentaren.

### 5. `--axis-spill-text` mørk: designets nye verdi er BEDRE enn repo-hotfixen — adopter den
Design har landet `#F0E6A8` (varm blek gull, hue dreid bort fra markøren). **Verifisert: 14,07:1 mot surface, 15,57:1 mot bg** — utmerket, og løser forvekslingsproblemet mot lime-fillen mer elegant enn repoets midlertidige `#DFF982`. → v14-synk: repoets `golfdata-tokens.css` adopterer `#F0E6A8` og hotfix-kommentaren lukkes.

### 6. Prosjektets audit er stale på ting repoet allerede har fikset
`guidelines/skjerm-plan-audit-2026-07-07.md` lister defekt A (talent DNA/pyramide-mislabeling) og B (hardkodet Inter Tight i /admin/queue) som åpne + spør «skal jeg fikse i GitHub?». **Begge ble fikset i repoet 7. juli (commit 964ae8ce)**, og Fase 3 fjernet deretter ALL Inter Tight fra appen (layout laster tre fonter). Auditen bør stemples oppdatert så Code/design ikke gjenåpner. Auditens åpne arkitekturspørsmål («er hånd-rullet Tailwind akseptert andre kanon for driftsskjermer?») **er også besvart**: JA — Anders' beslutning 2026-07-07 (design-revisjon-agencyos-utvidet: golfdata-adopsjon 0 % i driftsklyngene er AKSEPTERT).

### 7. Situasjon-verdiene (M0–M5) divergerer i klarspråk
Design (B10): Innendørs · Range · **Range med mål** · Bane trening · **Bane test** · Turnering. Repo-taksonomi: Innendørs/Statisk · Range tomt · **Range normalt/Simulator** · Bane treningsrunde · **Bane simulert match** · Turnering. Én tabell må vinne og skrives inn i ordboken begge steder.

### 8. To designbeslutninger står bevisst åpne — de blokkerer v14-lås
(a) **Mørk bakgrunnsvariant A «dyp» (#0A0B0A) vs B «løftet» (#141513)** — venter på Anders' fysiske sollys-test (`[data-bg-variant="lifted"]`). (b) **Lys-temperatur** varm kritt vs kjølig grå (`guidelines/lys-temperatur-ab.html`). Dette er de to tingene bare du kan lukke — resten er mekanikk.

### 9. TrackMan-fasen er delvis blokkert på manglende opplasting
skills/TRACKMANPLAN-arbeidet noterer at «andre handover-zips med komplette Agency-skjermer» aldri ble lastet opp (uploads/ har kun workbench-a/v2). Hvis de finnes, last dem opp; hvis ikke, avblokker planen eksplisitt.

---

## P2 — kvalitet og dekning

### 10. Dekning (fra DEKNINGSKART): 29 ✅ + 2 🟡 av 387 ekte skjermer
P0 er lukket (eneste ekte P0-produktrute bygget; resten var dev-verktøy). ◆-kategorien («dekket via system, bygges just-in-time av Code») er en fornuftig kontrakt — men den forutsetter at templates + komponentkatalog faktisk holder; PlayerHQ-oppgraderingsprompten (sendt tidligere i kveld: hierarki, full-bredde topbar, konsistens) bør lande FØR flere skjermer stemples ◆ mot dagens mal.

### 11. Rydd v13-eksportens zip-QA-funn før v14 eksporteres
Repoets nye `scripts/design-zip-qa.ts` (porten all fremtidig handover må gjennom) fant 15 brudd i v13-eksporten. De som stammer fra kanonisk lag og består i live-prosjektet: engelsk **«session»** i prompt-/demofiler (AgendaRow.prompt, MaanedKalender.prompt, UkeKalender.prompt, calendar.card.html, DeltakerListe.prompt «Live Session», Progress.prompt «4/12 sessions done») og **✓-tegnet** i guidelines/fargesystem-spec.html (U+2713 ligger i forbudt emoji-område). Meta-omtale av forbudte ord i CLAUDE/PORTING passerer ikke porten i dag — enten omformuleres de, eller så whitelister vi regel-dokumenter i scriptet (min anbefaling: sistnevnte, sier du fra så gjør jeg det).

### 12. Styrker som skal bevares (ikke røres i v14)
Firelags fargesystem med én jobb per farge · deuteranopi-testet aksepalett (ΔE 23,6/20,2) · lime-utvidelsen med `--signal-fill`-kontrakten · selvhostede fonter med lisenser · tilstandsgalleriet (12 familier, begge temaer) · handover/token-generator + adherence-lint · bundle-hygiene-regelen · eksporthygiene (uploads/ui_kits aldri med) · beslutningsloggen B01–B24 · Familjen Grotesk-migreringen (23 shell-filer) som nå matcher repoets Fase 3.

---

## Anbefalt rekkefølge

1. **Anders avgjør:** pris (299/300) · CS-gulv (CS50 vs CS20) · Situasjon-klarspråk (én tabell) · sollys-test A/B · lys-temperatur A/B.
2. **Design-prosjektet retter:** --text-faint-verdier + falsk kommentar · «L-fase»-kommentaren på phase-rampen · session/✓-funnene · stempler auditen oppdatert (defekt A+B fikset i repo, arkitekturspørsmålet besvart JA).
3. **Repo (fase C / v14-synk):** adopterer `#F0E6A8` · synker ordbok/CANON etter beslutningene i punkt 1 · kjører design-zip-qa grønn mot v14-eksporten · pilot-paret Cockpit + PlayerHQ Hjem.
