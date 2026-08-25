# LAUNCH-PLAN-FULL — 2026-08-25

Komplett lanseringsplan for AK Golf HQ (AgencyOS + PlayerHQ). Skrevet av plan-session
(Fable 5, Ultracode, read-only) 25.08.2026 på gren `claude/workbench-launch-plan-7503ff`.
Grunnlag: 9 parallelle kartleggingsagenter (docs, kode, UI, sikkerhet, bølge 2, fasit)
+ egen git-verifisering. Alle påstander under er merket VERIFISERT eller ANTAKELSE.

**Scope er komplett lansering** (jf. north star): alle avtalte skjermer og funksjoner,
design-portert der fasit finnes, trygt i prod, testet manuelt på kritiske flyter.
Tid styres med rekkefølge og bølger — ingenting er strøket.

> **OPPDATERING 25.08 (kveld, Anders i økt):**
> 1. **R1 er UTFØRT** (gren `chore/docs-rydding-natt`): alle radene i Del 1 er gjennomført —
>    Paper-styringsdokumentene supersedert-merket, natt-spec arkivert, prompter/DONE-filer
>    oppdatert, skills/hook rettet, siste-24-timer slettet, tre port-dokumenter arkivert.
> 2. **NY DESIGNBESLUTNING — D1 og D4 er LØST:** Train-lock er designfasit for **ALLE skjermer
>    i PlayerHQ OG AgencyOS** (hele produktet). Paper er historikk. Skrevet inn i CLAUDE.md
>    invariant 2, `.claude/rules/beslutninger.md` (øverste beslutning) og presedens-linjen i
>    CLAUDE.md/ak-master. Konsekvens for planen: B8 dekker Player-flatene; **hele AgencyOS
>    skal også portes til Train-lock** — det er en egen bølge T som IKKE kan sesjonsdeles før
>    D2 (tokens) og D3 (fasit-zip, inkl. ev. Agency-varianter) er levert. Ny plan-session P-T
>    (Fable 5, Plan mode) lager T-bølgens session-tabell når fasiten er committet.
> 3. Gjenstående Anders-beslutninger: **D2, D5, D6** + forelder-portalens designomfang (T4
>    i AAPNE-SPORSMAAL).
> 4. **D3 LØST 25.08 (senere samme dag):** «Player HQ Train lock (5).zip» er committet som
>    **`designsystem/train-lock/`** — 180 skjermfiler som dekker HELE scopet (A/AG/AO/PH/P/WB/
>    TM/TE/KA/RU/JV/S3/LO/ME/BO/TU/GP/FY/FO/EC/DG + lys-varianter + HANDOFF.md-kontrakten).
>    Dermed er 2a-premisset under opphevet, design-kolonnen kan måles mot ekte fasit, og
>    **P-T (plan for bølge T) kan kjøres nå** — eneste gjenstående designforutsetning er D2
>    (tokens i kode, utledes fra `TRAIN LOCK.dc.html` + HANDOFF). Zipens `uploads/` er bevisst
>    holdt utenfor det offentlige repoet (NGF/TN-materiale) — se `designsystem/train-lock/SYNC-STATUS.md`.

---

## 0. Git-tilstand

> **BØLGE 1 ER FERDIG OG MENNESKE-TESTET — 25.08.2026.**
>
> | Steg | Status |
> |---|---|
> | S1 — RLS mot prod | KJØRT (apply-script mot `DIRECT_URL`, ikke `prisma migrate`) |
> | B2 — release-gren | UTFØRT. `release/workbench-b1` satt sammen, verifisert, og lagt inn i `main` |
> | Loop 1 + 2 + 2S + 3S | ALT i `main`. Kom inn i to omganger: PR **#580** (Loop 1/2/3S, utilsiktet — se merknad) og PR **#583** (Loop 2S drill-editor + RLS-apply-script) |
> | Prod-deploy | `main` @ `c353e554` live på `akgolf-hq.vercel.app` (verifisert i byggelogg) |
> | Smoke (Anders, manuelt i prod) | **GRØNN.** Coach: opprett → UTKAST → flytt → Publiser. Spiller: ser kun publisert, ikke DRAFT → Start → Fullfør. Drill: coach legger til øvelse → spiller ser den |
>
> **Anti-scope-sperren mot bølge 2 er dermed løftet** — C1–C10 kan sesjonsdeles.
>
> **Merknad (avvik verdt å huske):** PR #580 het `docs:` men inneholdt 4 091 linjer
> Workbench-kode, fordi `chore/docs-rydding-natt` var forgrenet oppå Workbench-arbeidet
> i stedet for ren `main`. Koden gikk i hovedversjonen uten at Anders ble spurt.
> Ufarlig i praksis (nye ruter, bak innlogging, ingen menylenker, verify grønn), men
> **lærdom: forgren docs-opprydding fra `origin/main`, aldri fra en feature-gren** —
> og les alltid fil-lista i en PR, ikke bare tittelen.
>
> **Vedlikeholdsmodus:** slått AV 25.08 i alle tre miljøer (`VEDLIKEHOLD=0` i Vercel), slik at
> skjermer kan sjekkes uten manuelle steg. `akgolf.no` peker uansett ikke hit — domenet
> håndteres av prosjektet `akgolf-redirect`. Arbeidsadresse: `https://akgolf-hq.vercel.app`.
>
> **Neste:** D2 (tokens i kode fra Train-lock-fasiten) → P-T (plan for bølge T) → B4 (ekte «I dag») → B3 (mobil-inspector).

### 0.1 Historisk git-tilstand (VERIFISERT 25.08 før merge — beholdt som spor)

Dette er fasit for hvor koden faktisk ligger. Én kartleggingsagent plasserte feilaktig
Loop 2S- og RLS-committene på arbeidsgrenen — git-sjekk under er gjort direkte og gjelder.

| Gren / PR | Innhold | Forhold til arbeidsgrenen (HEAD) |
|---|---|---|
| `claude/workbench-launch-plan-7503ff` (denne worktree) | Loop 1 + Loop 2 + tom-uke-fix + Loop 3S | = HEAD |
| `claude/agency-workbench-uke-ui-c4d2a4` | Samme innhold | Identisk med HEAD (0/0) |
| PR **#577** `claude/sessioninspector-drill-ui-125d70` | **Loop 2S** (drill-editor i SessionInspector + DrillListEditor + LOOP-2S-DONE.md) | Forgrenet FØR 3S. 2 commits HEAD mangler. Fil-overlapp mot 3S: kun `src/lib/domain/workbench/labels.ts` |
| `claude/workbench-rls-policies-8b054b` | **RLS-migrasjon** for workbench_* (240 linjer SQL: ENABLE + policies + coach-SQL-funksjon) + apply-script + RLS-WORKBENCH-DONE.md | = HEAD + 1 commit (49fa667b). **IKKE kjørt mot prod** |
| PR **#575** `docs/natt-plan-2026-08-25` | natt-docs + Loop 1 | Tre-innhold IDENTISK med det HEAD alt har (verifisert `git diff --quiet`) → lukkes som superseded når arbeidsgrenen merges |
| `origin/main` | +2 commits HEAD mangler: WANG årsplan (#578), turnerings-dedupe-fix (#576) | Må inn i release-grenen |
| `claude/natt-a1-a4-2026-08-24`, `claude/workbench-actions-check-8399ef` | Delmengder av HEAD (peker på Loop 1-committen) | Stale — slettes etter merge |

Konsekvens: **ingen «release-gren» finnes ennå.** Den må settes sammen av
HEAD + PR #577 + RLS-grenen + main (Session B2 i Del 5). Konfliktflaten er liten
(labels.ts + ev. DONE-filer).

Merk også: `docs/natt/README.md` sier «Gren for kode: `claude/natt-a1-a4-2026-08-24`» —
det stemmer ikke lenger; arbeidet skjedde på `agency-workbench-uke-ui-c4d2a4`-linjen.

---

## 1. Del 1 — Søppel, konflikter, gamle regler

**Ingen fil slettes/endres før Anders sier «utfør opprydding».** Radene er sortert etter risiko.

### 1a. Presedens-konflikter (farligst — kan få en agent til å bygge feil ting)

| Path | Problem | Anbefaling | Risiko om urørt | Eier-session |
|---|---|---|---|---|
| `docs/ak-master.md` | Erklærer seg MASTER, og rot-CLAUDE.md sier «ak-master.md > denne filen». Filen er fra 06.08 — 18 dager før Train-lock-beslutningen. Sier fortsatt «implementere design fra Claude Paper» som prosjektmål | OPPDATER (Train-lock-unntak + ny presedenssetning) | HØY — presedensregelen gjør en stale fil formelt overordnet gjeldende instruks | R1 |
| `docs/port/GYLDIGHET.md` | Rangerer `designsystem/paper/` som #1-fasit for ALT; motsagt av natt-KOMPLETT-PLAN («Paper er historikk, ikke ny fasit» for Player/Workbench). Bryter sin egen «slett ved erstatning»-regel | OPPDATER (eksplisitt unntak: Player HQ + nye WB-flater → docs/natt/Train-lock) | HØY | R1 |
| `docs/MASTERPLAN-GJENSTAAENDE.md` | Erklærer seg «den ENE planen», kjenner ikke natt-sporet (0 treff på «natt») | OPPDATER (banner: «Workbench/Player-sporet styres av docs/natt/ + denne LAUNCH-PLAN») | HØY — to dokumenter påstår å være den ene planen | R1 |
| `docs/STATUS-NÅ.md` | Obligatorisk lesing #4 i CLAUDE.md, sist oppdatert 17.08 — mangler alt fra 24.–25.08 | OPPDATER | MIDDELS-HØY | R1 |
| `.claude/rules/beslutninger.md` §Design-fasit | «Paper vinner alltid» uten Train-lock-unntaket fra 24.08 | OPPDATER (kryssreferanse til CLAUDE.md invariant 2 + docs/natt) | MIDDELS-HØY | R1 |
| `docs/port/rutefasit.md` + `fasit-liste-paper.md` | Paper-rutefasit dekker også Player-/Workbench-ruter uten unntaksmerke | OPPDATER (merk radene «unntatt — se docs/natt») | MIDDELS | R1 |
| `docs/port/PIXEL-PERFECT-PLAN-COMPLETE.md` | Pixel-perfekt mot Paper uten Player/WB-unntak | OPPDATER (unntaksavsnitt) | MIDDELS | R1 |
| `docs/plan-treningsplanlegging-til-kode-2026-08-20.md` | Parallell build-plan for samme domenefamilie (TrainingSessionV2) uten kryssreferanse til natt-loopene | OPPDATER (avklar: superseded av natt-sporet ELLER egen fase etter lansering — Anders avgjør) | MIDDELS — dobbel domenemodell-endring mulig | R1 + Anders |
| `.claude/skills/mobbin-inspo/SKILL.md`, `.claude/skills/agencyos-arkitektur/SKILL.md` | Peker ukvalifisert på Paper som fasit; agencyos-skillen mangler «nye WB-flater = Train-lock/WB»-nyansen | OPPDATER | MIDDELS | R1 |
| Globale skills (utenfor repo): `ak-designekspert`, `akgolf-claude-paper`, `playerhq-arkitektur` | Katalogtekstene peker på Paper for PlayerHQ (ANTAKELSE — innhold ikke lest av repo-agent) | Anders rydder i egen global-skill-økt (ARKIVER/OPPDATER) | HØY hvis de trigges i en Player-økt | Anders |
| `.claude/hooks/kvalitet.mjs` (typografi-vakt) | Injiserer Paper-skala som fasit ved HVER .tsx-endring, også på Train-lock-flater | OPPDATER (ekskluder `src/components/workbench/`, `src/components/portal/workbench/`, `src/app/portal/(fullscreen)/tren/wb/` eller nevn begge skalaer) | LAV-MIDDELS (støy, ikke blokkering) | R1 |
| `docs/natt/KOMPLETT-PLAN.md` (linje ~178) | Nevner «prisma migrate deploy» — den veien er BLOKKERT i dette repoet (gotchas §Schema-endringer) | OPPDATER (referer kirurgisk db execute-mønster) | MIDDELS for en natt-økt som følger den bokstavelig | R1 |
| `.claude/rules/admin-tripletex.md` | Sier «ingen Tripletex-integrasjon finnes» — FEIL: `src/lib/tripletex/` + to agenter m/tester finnes | OPPDATER | LAV-MIDDELS | R1 |

### 1b. Drift mellom spec og kode (docs/natt/workbench/)

| Path | Problem | Anbefaling | Risiko om urørt | Eier-session |
|---|---|---|---|---|
| `docs/natt/workbench/domain/*` + `ui/labels.ts` | Frossen kopi som har DRIFTET: src-labels.ts fikk 6 nye strenger i Loop 3S som spec-kopien mangler. Koden i `src/lib/domain/workbench/` er nå eneste sannhet | ARKIVER (flytt til `docs/natt/workbench/arkiv/` + banner «koden er fasit») | MIDDELS — re-innliming av spec kan overskrive nyere kode | R1 |
| `docs/natt/workbench/ui/state-machine.ts` | Aldri portert; UI bruker component-state, ikke reducer | ARKIVER | LAV (villeder om arkitektur) | R1 |
| `docs/natt/workbench/store/actions.ts` | Kontrakt-skisse med utdaterte signaturer (mangler WbResultat-mønsteret) | OPPDATER (kort: «se wb-actions.ts for gjeldende mønster») | LAV-MIDDELS | R1 |
| `docs/natt/workbench/CLAUDE-CODE-PROMPT.md` | Duplikat av LOOP-1-PROMPT med utdaterte modellnavn | ARKIVER | LAV | R1 |
| `docs/natt/LOOP-1-PROMPT.md` | Ferdig brukt, ingen markering | OPPDATER («FERDIG 25.08 — se LOOP-1-DONE.md» øverst) | LAV | R1 |
| `docs/natt/LOOP-2-DONE.md` | Flagger RLS som uløst — RLS-kode finnes nå på egen gren | OPPDATER (etter Session S1) | MIDDELS (dobbeltarbeid) | S1 |
| `docs/natt/workbench/README.md:42` + `ACCESS-AND-GROUPS.md:170` | Død referanse til `HANDOFF.md` (finnes ikke i repoet) | OPPDATER | LAV | R1 |
| `docs/natt/README.md` | Peker på feil kodegren (natt-a1-a4) | OPPDATER (etter B2: pek på release-grenen) | LAV | B2 |

### 1c. Historikk-filer

| Path | Problem | Anbefaling | Risiko | Eier |
|---|---|---|---|---|
| `docs/siste-24-timer-2026-08-19.md` | Éngangslogg, inviterer selv til sletting, ingen refererer den | SLETT | LAV | R1 |
| `docs/port/masterplan-lansering-2026-08-12.md` | Foreldet snapshot, duplikat av MASTERPLAN | ARKIVER | LAV-MIDDELS | R1 |
| `docs/port/portstatus-paper.md` | Avledede talltabeller, 8 dager gamle | ARKIVER | LAV | R1 |
| `docs/port/SIKKERHETSRAPPORT-2026-08-11.md` | Éngangs øyeblikksrapport | ARKIVER | LAV | R1 |
| `docs/AAPNE-SPORSMAAL.md` | Register ikke ført a jour siden 17.08 | OPPDATER | LAV-MIDDELS | R1 |
| Grener `claude/natt-a1-a4-2026-08-24`, `claude/workbench-actions-check-8399ef` + PR #575 | Delmengder / identisk innhold | Slett grener / lukk #575 ETTER at release-grenen er merget | LAV | B2 |

Beholdes uendret (verifisert gyldige): `docs/vokabular-planlegging-2026-08-18.md` (vokabular-fasit),
`docs/FASIT-AK-GOLF-HQ.md` (bør lenkes fra CLAUDE.md-leselisten), `OVERNIGHT-CODING-LOOP-BOLGE2.md`
sin gate (virker som tiltenkt).

---

## 2. Del 2 — Komplett inventory

### 2a. KRITISK premiss for hele design-kolonnen (VERIFISERT)

> **OPPHEVET 25.08 (kveld):** fasiten er nå committet i `designsystem/train-lock/` (180
> skjermer + HANDOFF.md) — se oppdateringsblokken øverst. Avsnittet under beholdes som
> tidsbilde fra da planen ble skrevet.

**Ingen av skjerm-ID-ene (A-xx, WB-xx, PH-xx, P-xx, TM-xx, MAT-xx) har fasit-filer i repoet.**
De finnes kun som ID-er i natt-planenes tabeller. Kilden — «Player HQ Train lock.zip» —
er aldri committet (`find *.zip` = 0 treff, `find *train*lock*` = 0 treff). Train-lock-TOKENS
er heller ikke definert i kode (0 treff på «train-lock» i src/; UTVIKLINGSPLAN-LANSERING
lister «Konsistent Train-lock tokens overalt» som ugjort). «B2-varianter» i oppdraget finnes
ikke som ID-familie — eneste B2-treff er PP-B2-sweepen i den gamle Paper-porten.

Konsekvens: design-status under er målt mot (a) CLAUDE.md-invariantenes tekst (scene #000000,
warm hake, #30D158-regel) og (b) natt-planens beskrivelser — ikke mot pixel-fasit.
**Design-port-sessions er blokkert til Anders committer zip-en (anbefalt: `designsystem/train-lock/`)
eller bekrefter frihåndsport fra beskrivelsene.** Dette er lanseringens største design-blokker.

### 2b. Funksjonsmatrise — workbench-domenet (VERIFISERT mot kode, fil:linje hos agentene)

| Funksjon | Status | Kommentar |
|---|---|---|
| createSession | DONE | domain + action (zod) + UI + test |
| moveSession | DONE | via inspektørfelter; ingen drag (bevisst). Gap: newStartMinute/duration ikke zod-validert ved grensen |
| publish / unpublish | DONE | enkelt + hel uke m/ PublishConfirmDialog (A-01d) |
| addDrill / reorderDrills / removeDrill | PARTIAL på HEAD | backend + tester DONE; UI-forbruker ligger på **PR #577 (Loop 2S)** — DONE etter B2-integrasjon |
| deleteSession | DONE | kun action-lag (ingen pure-funksjon — akseptert avvik) |
| start / complete / skip | DONE | Loop 3S. Gap: skip håndhever ikke kreverPublisert i action (ikke utnyttbart fra UI) |
| loadWeek / loadSession | DONE / PARTIAL | loadSession får UI-forbruker via #577-inspector |
| loadSources | STUB (bevisst) | returnerer alltid tom — Loop 2T |
| loadPlayerDay | DONE | DRAFT-filter dobbelt håndhevet (domain + action), smoke-verifisert |
| Serie/gjentakelse + endre-policy | NOT STARTED | ingen felt i schema — Loop 2T (krever additiv DDL) |
| Player approval (godta/avvis) | NOT STARTED | typet stub i wb-actions; felt finnes i schema — Loop 3T |
| hiddenByPlayer | NOT STARTED | **feltet finnes IKKE i schema** — Loop 3T krever additiv DDL |
| VEGG/overlap-policy | PARTIAL | validateWeek() (VARSEL, aldri sperre — riktig iht. invariant 1) finnes men er IKKE koblet til noen action/UI |
| DRAFT-gate | DONE | app-lag dobbelt; DB-lag kommer med RLS (S1) |

Tverrgående (VERIFISERT): IDOR dekket i alle actions (kreverTilgangTilSpiller →
requirePortalUser + harCoachTilgangTilSpiller); WbResultat-mønsteret konsekvent i alle
eksporterte actions; zod DELVIS (create/addDrill fulle skjema, øvrige kun dato/TS-typer);
PII-logging ren (kun ID-er).

### 2c. Skjermmatrise — økt-pakken + A1–A4 (Del A + B i scope)

Funksjon: mot kode. Design: mot invariant-tekst + beskrivelser (fasit-zip mangler, jf. 2a).

| ID | Flate | Funksjon | Design | Gap / neste session |
|---|---|---|---|---|
| WB-01/02/03 (uke-shell, grid, ny økt) | Agency | DONE | DELVIS¹ | ¹Bygget i Paper/v2-tokens; CLAUDE.md inv. 2 sier *nye* WB-flater følger Train-lock/WB → BESLUTNING D1. Mangler loading.tsx/error.tsx på ruten → B3 |
| A-01d publish confirm | Agency | DONE | DELVIS¹ | i-dag-advarsel hardkodet utenfor labels → B3 |
| WB-04 / A-02/A-02b / A-03b / MAT-01 (inspector + drill-editor) | Agency | DONE på PR #577 | DELVIS¹ | Integreres i B2; mobil: inspector `hidden lg:block` → coach kan ikke redigere enkeltøkt på mobil → B3 |
| A-02c / A-04 / A-04b / A-07 / A-11 / WB-07 (kilder, drag, serie) | Agency | NOT STARTED (kilder-panel er skall) | MANGLER FASIT | Loop 2T → B5 |
| A-09 / WB-10 / A-14 (godta/avvis, ikke delta, live agency-side) | Agency | NOT STARTED (stub) | MANGLER FASIT | Loop 3T → B6 (krever hiddenByPlayer-DDL) |
| A-18 tom uke | Agency | DONE | MATCH mot beskrivelse | — |
| PH-01e «I dag» fire tilstander | Player | PARTIAL | FEIL² | Ekte «I dag» (PortalChatHjem) kaller ALDRI loadPlayerDay — /portal/tren/wb er midlertidig parallell-liste med 3 av 4 tilstander (mangler hvile + pågår-hero). Loop 3 → B4. ²Scene = Paper-tokens, ikke #000000 |
| PH-01c TrackMan-kort under Nå | Player | NOT STARTED | MANGLER FASIT | B7 (etter Loop 4-motor) |
| PH-04 / P-02 økt-ark | Player | DONE (isolert) | FEIL² | Nås kun via midlertidig rute; scene ikke Train-lock → B4 + B8 |
| PH-05 start-artefakt | Player | PARTIAL | FEIL² | IN_PROGRESS er CTA-bytte, ikke egen artefakt-tilstand → B4 |
| PH-06 ferdig-artefakt | Player | DONE | DELVIS | Warm hake #B85C3D korrekt, ingen #30D158-brudd; scene-avvik → B8 |
| P-06 / P-07 | Player | UKJENT | MANGLER FASIT | Kun nevnt i «økt er atomet»-listen; avklares når zip foreligger |
| TM-07/08/08f/10/11 (DispersionMap, KPI, findings, slag-ark) | Player | NOT STARTED | MANGLER FASIT | Loop 4 → B7. Eldre motor `src/lib/gameplan/dispersion.ts` finnes — gjenbruk IKKE verifisert |
| A-17 lys-variant | begge | NOT STARTED | MANGLER FASIT | Bølge 2 lys-pass → C8 |

### 2d. Bølge 2-moduler (Del C i scope — SKAL inn i planen)

| Modul | Status i repo | Nøkkelfunn | Session |
|---|---|---|---|
| Måned/år (WB-05/06, A-05/06) | NOT STARTED | 0 treff i workbench-koden | C1 |
| Stall (WB-09, A-10, AG-04) | PARTIAL | StallV2 (683 linjer, gammel modell) finnes — Loop 6 = koble «Åpne uke i Workbench», ikke nybygg | C2 |
| Kalender uten Google (KA-01–05, AG-11) | PARTIAL | Full Google-synk-infrastruktur finnes (7 filer) men Loop 7 er en NY lag-visning UTEN Google — egen flate på workbench-domenet | C3 |
| Tester-live (TE-04/05/06) | PARTIAL | Gjennomfør-flyt + TalentHQ-sync BYGGET (16.08); gjenstår: gate-artefakt over I dag (avhenger av Loop 3) + talent-skjermene leser ikke testNivaaer | C4 |
| Runde-live (RU-01–04) | PARTIAL | Full gammel live-flyt i `(fullscreen)/live/`; Loop 9 = artefakt på ny modell, PH-12 urørt | C5 |
| Jarvis-merge (JV-01/02/03) | NOT STARTED | OBS navnekollisjon: `src/lib/jarvis/` er Anders' personlige assistent (kalendervakt/dagen) — IKKE treningsplan-merge-motoren. Ikke bygg på feil «Jarvis» | C6 |
| AgenticOS (AO-00/01/02/05/12) | PARTIAL | `/admin/agenticos` bygget (18.08); gjenstår cockpit-queue/approval-policy A3/B1/C3 + H1/H4-hull | C7 |
| Lys-pass (8 nøkkelskjermer) | PARTIAL | Tema-mekanisme (`data-v2-tema`) er kanonisk og arves; runtime-verifisering mangler. Avhenger av at flatene finnes (Loop 8/9) | C8 |
| Foreldre (FO-01) | PARTIAL | Bred forelder-app finnes (9 seksjoner); Loop 13 = smalt read-only «neste økt»-kort på workbench-domenet uten DRAFT | C9 |
| DataGolf (DG-01) | PARTIAL | `/portal/analysere/datagolf` ekte; resten av `/stats/*`-flytting BLOKKERT av PORTPLAN §A1.1-beslutning (Anders) | C10 |
| Økonomi (EC-01) | PARTIAL | Tripletex-klient + lønn/månedsavslutning-agenter finnes (rules-fila er stale); gjenstår EC-visning m/ FORFALT som eneste danger | C10 |
| Google two-way-synk kalender | FINNES (gammelt spor) | Eksplisitt utenfor bølge 2-scope; planlegges som D-fase etter lansering hvis ønsket | — |

### 2e. Tverrgående krav (Del D i scope)

| Krav | Status | Gap |
|---|---|---|
| Auth/IDOR | DONE for workbench (verifisert alle actions) | — |
| RLS workbench_* | KODE KLAR på egen gren, IKKE kjørt mot prod | S1 |
| Feiltilstander (4 tilstander + sonner, norsk) | DELVIS | admin-ruten mangler loading/error.tsx; PH-01e mangler hvile/pågår; copy delvis hardkodet utenfor labels | B3/B4 |
| Tokens Player=Train-lock | **DELVIS** | Tokensettet er i kode (D2 løst 25.08, `--tl-*`); Player-wb-flater bruker fortsatt Paper-tokens til B8 har portert dem | B8 |
| Vokabular (etiketter, ikke lås) | DONE | vokabular-planlegging er fasit; ingen treningsregler gjeninnført | — |
| Secrets | DONE | .env-mønsteret fulgt; beskytt-hook aktiv | — |
| Main-merge kun etter menneske-ja | DONE (regel) | Ingenting av natt-arbeidet er merget ennå | — |

---

## 3. Del 3 — Definisjon av lanseringsklar

Alle punkter må være sanne. PARTIAL tillates kun med eksplisitt midlertidig løsning + navngitt session som lukker gapet.

1. **Scope-dekning:** Hver rad i matrisene 2b–2d er DONE, eller PARTIAL med «midlertidig løsning + lukke-session» skrevet inn i denne filen.
2. **Design:** Hver skjerm er MATCH mot Train-lock-fasit (Player) / vedtatt Agency-norm (D1), eller godkjent DELVIS av Anders med begrunnelse. Forutsetter at fasit-zip er committet eller frihåndsport er vedtatt (D3).
3. **RLS:** Aktiv på `workbench_sessions` + `workbench_drills` i prod, med smoke-bevis på at server actions fortsatt virker (create→publish→loadPlayerDay grønn ETTER aktivering) og PostgREST-test som viser deny (anon-nøkkel får ikke lese).
4. **DRAFT-gate:** Dobbel app-håndheving (finnes) + DB-lag (RLS) + regresjonstest.
5. **Kritiske manuelle flyter klikket av et menneske** (ikke bare tsc/test — ingen av loopene er klikk-testet av menneske per 25.08): coach oppretter→publiserer; spiller ser økten i ekte «I dag» (etter Loop 3), ser aldri DRAFT; start→fullfør med warm hake; godta/avvis (etter 3T); TM-detalj (etter Loop 4).
6. **Verify/CI grønn på release-grenen** (`npm run verify && npm test`), inkl. domain-testene.
7. **PR-strategi dokumentert og fulgt:** én release-gren mot main, squash-merge etter Anders' «ja», stale grener slettet, PR #575/#577 lukket/merget inn.
8. **Docs-konsistens:** Rad-tabellen i Del 1 utført (etter «utfør opprydding»), slik at ingen konkurrerende «masterplan» eller Paper-presedens kan lede en agent feil under sluttspurten.

---

## 4. Del 4 — Bølger og avhengigheter

**Bølge R (rydding)** → **Bølge S (sikkerhet)** → **Bølge B (bølge 1 komplett: økt-pakken + I dag + TM)** → **Bølge C (bølge 2-modulene)** → **Bølge D (design-port/lys + beslutningsavhengige)**.

Avhengighetsgraf (tekst):

- R1 (docs-rydding) har ingen kodeavhengigheter — kjøres først, alene.
- S1 (RLS) avhenger kun av eksisterende RLS-gren — kan kjøres parallelt med R1 (disjunkte filer).
- B2 (git-integrasjon: HEAD + #577 + RLS-gren + main → release-gren) avhenger av S1-beslutningen (policy-variant vs deny-by-default) men ikke av R1.
- B3 (feiltilstander/mobil/labels på Agency) og B4 (Loop 3: ekte «I dag» + fire tilstander) avhenger av B2. B3 ⊥ B4 (disjunkte filområder: components/workbench+admin-rute vs portal) → **parallell OK med hver sin worktree**.
- B5 (Loop 2T kilder/drag/serie — krever additiv DDL for serie) avhenger av B2 og bør vente på B3 (samme Agency-filer).
- B6 (Loop 3T godta/avvis + hiddenByPlayer — krever additiv DDL) avhenger av B2+B4 (rører wb-actions + portal-UI).
- B7 (Loop 4 TM/DispersionMap) avhenger av B2; ellers uavhengig av B3–B6 → parallell OK.
- B8 (Train-lock design-pass på Player-flatene) BLOKKERT av D3 (fasit-zip) + D1; kjøres etter B4.
- C1–C10 gates av natt-planens egen regel: bølge 1-smoke dokumentert grønn (LOOP-4-DONE + menneskelig klikk). Innbyrdes: C4 og C9 avhenger av B4 (I dag/artefakt-lag); C2 av B2; C8 av C4+C5 (flatene må finnes); C10 delvis blokkert av Anders-beslutning (PORTPLAN §A1.1). C1, C3, C5, C6, C7 er innbyrdes parallelle (disjunkte filområder) — maks 2–3 samtidig per forbruksreglene.
- Beslutninger (Anders, blokkerer merket arbeid): **D1 LØST 25.08** — Train-lock for ALLE skjermer i PlayerHQ og AgencyOS (koden som bruker Paper er nå avvik som skal portes, bølge T); **D2 LØST 25.08 (PR #586)** — tokensettet er i kode (`src/styles/train-lock-tokens.css` + `src/lib/v2/train-lock.ts`); se `docs/natt/D2-TOKENS-DONE.md` for kilder og ti åpne spørsmål, der **nr. 1 (mørk som default på /portal og /admin) fortsatt trenger Anders' svar** før B8; **D3 LØST 25.08** — zip committet som `designsystem/train-lock/` (dekker også Agency); **D4 LØST 25.08** — presedenssetningen rettet i CLAUDE.md/ak-master (design: Train-lock + docs/natt vinner alltid); **D5** PORTPLAN §A1.1 (DataGolf-plassering); **D6** skjebnen til plan-treningsplanlegging-til-kode (supersedert eller egen fase).

Parallellisering med worktree er trygg kun ved disjunkte filområder — merk gotcha «Annen økts worktree kan forsvinne» og «Delt utsjekk: parallell økt kaprer gren»: én gren per session, aldri delt utsjekk.

---

## 5. Del 5 — Session-plan (én rad = én Claude Code-session)

Regler (gjelder alle rader): build = Sonnet 5, ny session, smal prompt, 1 primærscope; plan/audit/tradeoffs = Fable 5 + Plan mode; hver build leverer `docs/natt/LOOP-<navn>-DONE.md` + `npm run verify` grønn før commit; sub-agenter kun Explore/validator (read-only); **ingen main-merge uten Anders' ja**; parallell kun uten fildeling og med egen worktree.

| # | Navn | Modell | Modus | Worktree/gren | Eksakt scope | Done-kriterium | Avhenger av | Parallell OK? | Sub-agenter |
|---|---|---|---|---|---|---|---|---|---|
| R1 | docs-opprydding | Sonnet 5 | Build (kun docs) | ny gren `chore/docs-rydding-natt` | Utfør radene i Del 1 som Anders har godkjent — banner/arkiv/slett/oppdater. INGEN kodefiler | Alle godkjente rader utført; grep viser ingen ukvalifisert «Paper vinner» for Player/WB; DONE-fil | Anders: «utfør opprydding» | Ja (med S1) | Explore |
| S1 | RLS aktiv i prod | Sonnet 5 | Build | eksisterende `claude/workbench-rls-policies-8b054b` | Review eksisterende migrasjon. ANBEFALING: kjør deny-by-default (ENABLE uten policies — repo-presedens ×4; policy-SQL-en dupliserer wb-actions-logikk som vil drifte; behold policy-fila som dokumentert opsjon). Verifiser før/etter med PostgREST-curl (anon-nøkkel) + kjør smoke-workbench-scriptet ETTER aktivering. Rollback dokumentert (DISABLE) | relrowsecurity=true begge tabeller i prod; smoke grønn etter; PostgREST-deny bevist; LOOP-2-DONE + RLS-DONE oppdatert | Anders: «ja» til prod-kjøring | Ja (med R1) | validator |
| B2 | Release-gren settes sammen | Sonnet 5 | Build (git-kirurgi, ingen ny feature) | ny gren `release/workbench-b1` fra HEAD | Merge inn PR #577 (2S) + S1-grenen + origin/main. Løs labels.ts-konflikt. Lukk #575 som superseded (kommentar). `npm run verify && npm test` | Verify+test grønn; alle 4 kilder inne; DONE-fil med konfliktlogg | S1 | Nei (alle senere avhenger) | validator |
| B3 | Agency-herding | Sonnet 5 | Build | worktree, gren fra release | loading.tsx+error.tsx på /admin/workbench/[playerId]; mobil-inspector (ark/sheet under lg); flytt hardkodet copy → labels.ts; koble validateWeek()-VARSEL til publish-flyt (advarsel, aldri sperre); zod på move/reorder-input | Verify grønn; mobil-coach kan redigere enkeltøkt; VARSEL vises ved overlapp; DONE-fil | B2 | Ja, med B4/B7 | Explore |
| B4 | Loop 3 — ekte «I dag» | Sonnet 5 | Build | worktree, gren fra release | PortalChatHjem/portal-hjem leser loadPlayerDay; PH-01e fire tilstander (publisert/hvile/pågår/feil); PH-05 pågår-artefakt; lenk økt-ark fra I dag; midlertidig /tren/wb-liste beholdes som fallback til klikk-test | DRAFT usynlig i ekte I dag; fire tilstander klikkbare; verify grønn; DONE-fil | B2 | Ja, med B3/B7 | Explore |
| B5 | Loop 2T — kilder, drag, serie | Sonnet 5 | Build | gren fra release | loadSources ekte innhold (øvelsesbank/maler/forrige uke); drag fra kilder→uke; serie (gjenta + endre-policy) inkl. additiv DDL via kirurgisk db execute-script (ALDRI migrate/push/deploy — gotchas) | Verify grønn; serie-økter opprettes/endres per policy; DONE-fil | B3 (samme filer) | Nei mot B3; Ja mot B4/B7 | Explore, validator |
| B6 | Loop 3T — godta/avvis + ikke delta | Sonnet 5 | Build | gren fra release | resolvePlayerApproval ekte; UI spiller (godta/avvis) + agency-visning (A-09/WB-10); hiddenByPlayer additiv DDL + filter; aldri #30D158 utenom Godta | Flyt klikkbar begge sider; DRAFT-invariant intakt; verify grønn; DONE-fil | B4 | Ja mot B5/B7 | Explore |
| B7 | Loop 4 — DispersionMap/TM | Sonnet 5 | Build | worktree, gren fra release | TM-08: 1σ-ellipse + én caddie-setning + prikk→slag-ark (TM-11); tom-tilstand TM-10; vurder gjenbruk av `src/lib/gameplan/dispersion.ts` (verifiser matematikken først); PH-01c-kort gated på data | Smoke-målet i CLAUDE.md klikkbart; verify grønn; DONE-fil | B2 (+D3 for pixel) | Ja, med B3/B4 | Explore, validator |
| B8 | Train-lock design-pass Player | Sonnet 5 | Build (port, ikke redesign) | gren fra release | Bruk `--tl-*`/`TL` (D2 ferdig); avklar først åpent spørsmål 1 i D2-TOKENS-DONE (mørk default) med Anders; port PH-01e/PH-04/05/06 + /tren/wb-flater til scene #000000; skjermbilde-gate 390px+1280px lys/mørk | Anders har SETT skjermbilder; ingen nye token-familier utenom vedtatt sett; DONE-fil | D3, B4 (D2 løst) | Nei (rører B4-filer) | — |
| P-T | Plan bølge T: Train-lock-port av hele AgencyOS | Fable 5 | Plan mode | — | Inventarier alle AgencyOS-skjermer mot Train-lock-fasiten, del i sesjoner (én per hub/mal), oppdater denne planen med T-rader | T-bølge-tabell skrevet inn her | Ingen (D1+D2+D3 løst 25.08) | — | Explore |
| G1 | Menneskelig smoke bølge 1 | — (Anders + evt. hjelpe-session) | Manuell | preview av release-gren | CLAUDE.md-målsmoken ende-til-ende + LOOP-4-DONE skrives | Alle steg grønne, dokumentert i LOOP-4-DONE | B3–B8 | — | — |
| M1 | Merge release → main | Sonnet 5 | Build (git) | release-gren | PR mot main, oppsummering + preview-lenke; squash etter Anders' ja; slett stale grener; lukk #575 | main inneholder bølge 1; grener ryddet | G1 + Anders' ja | Nei | — |
| C1 | Måned/år | Sonnet 5 | Build | worktree fra main | Loop 5 per BOLGE2-doc (klikk dag→uke, ingen redigering i årscelle) | DONE-fil + verify | M1 | Ja | Explore |
| C2 | Stall→Workbench | Sonnet 5 | Build | worktree fra main | Loop 6: spillere som kolonner, UTKAST per celle, «Åpne uke»; gjenbruk StallV2-data der mulig; ingen GROUP-propagate | DONE-fil + verify | M1 | Ja | Explore |
| C3 | Kalender-lag (uten Google) | Sonnet 5 | Build | worktree fra main | Loop 7: lag-visning (økter/skole/TURN/test/booking) på wb-domenet; KA-04 player-ark; KA-05 rom-varsel. IKKE røre google-calendar-*-filene | DONE-fil + verify | M1 | Ja | Explore |
| C4 | Tester-live-artefakt | Sonnet 5 | Build | worktree fra main | Loop 8: gate-artefakt over I dag (10 prikker, PEI); talent-skjermer leser testNivaaer | DONE-fil + verify | M1 (bruker B4-flaten) | Ja | Explore |
| C5 | Runde-live-artefakt | Sonnet 5 | Build | worktree fra main | Loop 9: artefakt, recap V8-hull, SG=EST ved etterregistrering, PH-12 urørt | DONE-fil + verify | M1 | Ja | Explore |
| C6 | Jarvis-merge-motor | Sonnet 5 | Build | worktree fra main | Loop 10: eval-gate (ACWR 0,8–1,3, kollisjon, motorikk, drills), Jarvis merger aldri selv. IKKE `src/lib/jarvis/` (feil Jarvis) | DONE-fil + verify + testdata Filip/Jonas | M1 | Ja | Explore, validator |
| C7 | AgenticOS cockpit-queue | Sonnet 5 | Build | worktree fra main | Loop 11: queue + approval-policy A3/B1/C3; agent skriver aldri Workbench direkte; lukk H1/H4 | DONE-fil + verify | M1 | Ja | Explore |
| C8 | Lys-pass | Sonnet 5 | Build | gren fra main | Loop 12: 8 nøkkelskjermer i lys (#FFFFFF-scene), via data-v2-tema — ingen ny mekanisme; skjermbilde-gate | Anders har sett lys+mørk; DONE-fil | C4+C5 (flatene må finnes) | Nei (rører manges filer) | — |
| C9 | Foreldre FO-01 | Sonnet 5 | Build | worktree fra main | Loop 13: read-only «neste økt»-kort på wb-domenet, aldri DRAFT, fornavn-GDPR | DONE-fil + verify | M1 (B4-mønster) | Ja | Explore |
| C10 | DataGolf + økonomi | Sonnet 5 | Build | worktree fra main | Loop 14: DG-visning (aldri bland Broadie/DataGolf/PEI) + EC-01 (FORFALT eneste danger, Tripletex-lesing) | DONE-fil + verify | M1 + D5 for /stats-flytting | Ja | Explore |
| P2 | Plan-session bølge 2-merge + lansering | Fable 5 | Plan mode | — | Les alle C-DONE-filer, oppdater denne planen, sett merge-rekkefølge C→main og lanseringssjekk (Del 3) | Oppdatert LAUNCH-PLAN + merge-plan | C1–C10 | — | Explore |

Første build etter opprydding er **S1 (RLS)** — som påkrevd; ingenting blokkerer farligere.
(R1 og S1 kan starte samtidig i dag.)

---

## 6. Del 6 — Ferdige maler

### A) Fable 5 plan-session (kort)

```
<role>Staff engineer / release lead, AK Golf HQ. Norsk bokmål. Plan mode — ingen kode.</role>
<inn>Les: docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md (denne), relevante LOOP-*-DONE.md, git log på release-grenen.</inn>
<jobb>[NAVNGITT BESLUTNING/TRADEOFF]. Verifiser mot kode før påstand. Lever: anbefaling + oppdatert rad i session-tabellen.</jobb>
<stopp>Ingen feature-kode. Ingen merge. Maks 30 linjer i chat + ev. doc-oppdatering.</stopp>
```

### B) Sonnet 5 build-session

```
<oppdrag>
Mappe: ~/Developer/akgolf-hq (worktree: [OPPRETT NY / navn])
Gren: [gren] (fra [release/workbench-b1 | main])
Scope: [eksakt — én primærjobb, jf. rad [#] i docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md]
Anti-scope: [nabolisten fra raden + «ingen refaktor av urørt kode, ingen nye tokens, ingen main-merge»]
Kontrakt: WbResultat-mønsteret i src/lib/workbench/wb-actions.ts · labels i src/lib/domain/workbench/labels.ts ·
  DDL kun via kirurgisk db execute-script (ALDRI migrate dev/db push/migrate deploy — .claude/rules/gotchas.md) ·
  DRAFT aldri synlig for spiller · norsk copy · Lucide, aldri emoji.
Done: [kriterium fra raden]
Verify: npm run verify && npm test (+ npx tsx --test src/lib/domain/workbench/operations.test.ts ved domain-endring)
Lever: docs/natt/LOOP-[NAVN]-DONE.md (hva gjort, hva IKKE, feil underveis) · commit på gren · push · PR-utkast · STOPP før merge.
Feiler noe: skriv DONE-fila med hva som feilet — ikke fiks i det stille utenfor scope.
</oppdrag>
```

---

## 7. Antakelser og usikkerheter (ærlighetsliste)

1. WB-nummer↔komponent-mapping (WB-01 vs 02 vs 03) er ANTAKELSE fra loop-tabellene — fasit-zip finnes ikke i repoet å måle mot. WB-00/WB-08 er ikke nevnt i noen natt-doc.
2. GRANT-tilstanden for anon-rollen på workbench_* i prod er IKKE målt (read-only kartlegging) — S1 steg 1 måler før/etter.
3. Lys-modus-oppførsel for wb-flatene er ikke runtime-verifisert (arv via data-v2-tema antatt).
4. Gjenbrukbarhet av `src/lib/gameplan/dispersion.ts` i Loop 4 er uverifisert — B7 verifiserer matematikken før valg.
5. Globale skills' innhold (ak-designekspert m.fl.) er vurdert på katalogtekst, ikke lest — Anders' globale ryddeøkt bekrefter.
6. «B2-varianter» finnes ikke som skjerm-ID-familie i repoet — antatt misforståelse i oppdraget (PP-B2 er noe annet).
