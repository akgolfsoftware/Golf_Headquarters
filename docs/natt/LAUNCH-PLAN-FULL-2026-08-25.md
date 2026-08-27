# LAUNCH-PLAN-FULL — 2026-08-25

> **OPPDATERING 27.08.2026 (dokument-opprydding + statusoppdatering, Anders' ja):**
> Docs-oppryddingen (R1-tabellen i Del 1) er utført — se `docs/OPPRYDDING-PLAN-2026-08-27.md`
> og [`#614`](https://github.com/akgolfsoftware/Golf_Headquarters/pull/614). Del 1-tabellen
> under er historikk. **Ny, kortfattet status og neste steg: § 8 nederst i dette dokumentet
> — les den FØR resten av filen**, som fortsatt inneholder verdifull detalj (funksjonsmatrise,
> ruteinventar §5T) men er stedvis 25.–26.08-datert og ikke lenger ferskvare alene.

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
> ~~**Neste:** D2 → P-T → B4 → B3.~~ Alle fire UTFØRT 25.08 (D2 #586, P-T i §5T, B4 #582, B3 #584).
> Font-beslutningen (Poppins i `--tl-*`) inn 26.08 (#597). Gjeldende rekkefølge: **§0.2 under.**

### 0.2 Kjøreplan fra 26.08 (skrevet av statussjekk-økt, verifisert mot kode/PR-er)

Regler uendret (Del 5): build = Sonnet 5, ny økt per rad, maks 2–3 parallelle økter,
worktree ved parallell, skjermbilde-gate per skjerm, aldri main-merge uten Anders' ja.

| Etappe | Økter | Hvorfor denne rekkefølgen |
|---|---|---|
| 1 (nå, parallell) | **T1 PÅGÅR 26.08** (egen økt i worktree `t1-agency-skall-tl`, draft-PR #596 — gjenstår `--tl-rail-mac` 64→232, skjermbilder, gate) · **B7** (TM/DispersionMap — lukker siste smoke-steg) KLAR · ~~**B5** (kilder/drag/serie) KLAR~~ **B5 FERDIG BYGGET 26.08 — PR #601, venter på Anders' merge-ja** (verify+test grønn, DDL kjørt mot prod) | Skallet arves av alle T-skjermer; B7/B5 er disjunkte filområder — tre økter samtidig er taket (forbruksregel) |
| 2 | **B6** (godta/avvis + hiddenByPlayer-DDL, etter B5 — deler wb-actions; **B5 er kodemessig ferdig i PR #601, men ikke merget** — start B6 fra en gren som inkluderer #601, ikke fra `release`/`main` alene) → **B8** (Train-lock-pass Player, etter B6 — deler portal-flatene). Parallelt: **T2** (Cockpit) når T1 er inne | Funksjon ferdig før designpass på samme filer |
| 3 | **T3 · T4 · T13** (2–3 parallelle worktrees), deretter **T10 · T11**. **T5** når B5+B6 er inne, **T6** etter T5 | Portene med fasit og frie avhengigheter først |
| 4 | Bølge 2: **C2 + C3** først (låser opp T8/T7), så **C4 + C5** (låser opp C8 lys-pass), **C6 + C7** (låser opp T12), **C1 · C9** fritt, **C10** etter D5 | Rekkefølge etter hva som låser opp mest |
| 5 | Full smoke inkl. TM-steget → **P2** (Fable 5, plan: merge-rekkefølge + lanseringssjekk Del 3) | Del 3-kriteriene lukkes samlet |

**Anders' beslutningskø** (blokkerer merkede rader — resten ruller uten svar):
1. **§5T-samletabellen:** 14 pensjoneringskandidater + 38 klasse B-hull + prinsipp-OK for 24 klasse A (→ T4/T6/T9-scope) — kryss av i `docs/natt/D-LYS-OG-5T-BESLUTNING.md`. Eneste gjenstående blokkerende punkt.

> **LØST 26.08 (Anders, statussjekk-økt):** alle seks øvrige punktene under er avgjort — se `docs/AAPNE-SPORSMAAL.md` T4–T8 for detaljene.
> - **T-S5 lys-varianter:** mekanisk avledet lys fra `--tl-*`-tokensettet er godkjent der ingen tegnet lys-fasit finnes (kun 9 av 39 T-skjermer har tegnet lys) — skjermbilde-gaten er ikke lenger blokkert av manglende tegninger.
> - **Forelder-omfang (utvidet, presisert samme dag):** hele forelder-appen (9 seksjoner) skal ha BÅDE lys og mørk modus, Train-lock-portet som resten av produktet — ikke bare ett kort, som en tidligere versjon av dette dokumentet feilaktig antok. Egen porte-session, ikke planlagt ennå.
> - **D5 DataGolf/stats-plassering:** DG-01-spillerkortet (T4/T11) bygges som planlagt. Full `/stats/*`-migrasjon **utsatt til etter lansering** — kosmetisk fullstendighet, ikke en smoke-blokker. C10 er dermed ikke lenger avhengig av D5.
> - **D6 plan-treningsplanlegging-til-kode:** dokumentet er **supersedert** av natt-sporet — merket i dokumentet, ikke aktiv byggevei. Fase 0-innholdet (øvelsesbank-listen) beholdes som råmateriale til T6.
> - **T-S2 Kø/Jarvis-eierskap:** Caddie-trioen (`agencyos/caddie` + `aktivitet` + `dashbord`) foldes inn i Jarvis-tabben (JV-01–03) — ingen sjette rail-destinasjon.
> - **RLS-variant:** var allerede avgjort og verifisert i prod 25.08 (commit `b3c5af21`, full policy-variant aktiv) — linjen her var stale dokumentasjon, ikke en reell åpen beslutning.

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

> **UTFØRT 27.08.2026:** Anders sa «utfør opprydding» — se `docs/OPPRYDDING-PLAN-2026-08-27.md`
> for den faktiske gjennomføringen. Filreferansene i tabellen under er nå historikk (mange av
> filene er slettet/arkivert som anbefalt); ikke bruk dem som levende stier.

**Ingen fil slettes/endres før Anders sier «utfør opprydding».** Radene er sortert etter risiko.

### 1a. Presedens-konflikter (farligst — kan få en agent til å bygge feil ting)

| Path | Problem | Anbefaling | Risiko om urørt | Eier-session |
|---|---|---|---|---|
| `docs/ak-master.md` | Erklærer seg MASTER, og rot-CLAUDE.md sier «ak-master.md > denne filen». Filen er fra 06.08 — 18 dager før Train-lock-beslutningen. Sier fortsatt «implementere design fra Claude Paper» som prosjektmål | OPPDATER (Train-lock-unntak + ny presedenssetning) | HØY — presedensregelen gjør en stale fil formelt overordnet gjeldende instruks | R1 |
| `GYLDIGHET.md` (slettet 27.08) | Rangerer `designsystem/paper/` som #1-fasit for ALT; motsagt av natt-KOMPLETT-PLAN («Paper er historikk, ikke ny fasit» for Player/Workbench). Bryter sin egen «slett ved erstatning»-regel | OPPDATER (eksplisitt unntak: Player HQ + nye WB-flater → docs/natt/Train-lock) | HØY | R1 |
| `docs/MASTERPLAN-GJENSTAAENDE.md` | Erklærer seg «den ENE planen», kjenner ikke natt-sporet (0 treff på «natt») | OPPDATER (banner: «Workbench/Player-sporet styres av docs/natt/ + denne LAUNCH-PLAN») | HØY — to dokumenter påstår å være den ene planen | R1 |
| `docs/STATUS-NÅ.md` | Obligatorisk lesing #4 i CLAUDE.md, sist oppdatert 17.08 — mangler alt fra 24.–25.08 | OPPDATER | MIDDELS-HØY | R1 |
| `.claude/rules/beslutninger.md` §Design-fasit | «Paper vinner alltid» uten Train-lock-unntaket fra 24.08 | OPPDATER (kryssreferanse til CLAUDE.md invariant 2 + docs/natt) | MIDDELS-HØY | R1 |
| `rutefasit.md` (nå `docs/arkiv/paper-port/rutefasit.md`) + `fasit-liste-paper.md` | Paper-rutefasit dekker også Player-/Workbench-ruter uten unntaksmerke | OPPDATER (merk radene «unntatt — se docs/natt») | MIDDELS | R1 |
| `PIXEL-PERFECT-PLAN-COMPLETE.md` (slettet 27.08) | Pixel-perfekt mot Paper uten Player/WB-unntak | OPPDATER (unntaksavsnitt) | MIDDELS | R1 |
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
| `CLAUDE-CODE-PROMPT.md` (slettet 27.08) | Duplikat av LOOP-1-PROMPT med utdaterte modellnavn | ARKIVER | LAV | R1 |
| `LOOP-1-PROMPT.md` (slettet 27.08, se LEVERANSELOGG.md) | Ferdig brukt, ingen markering | OPPDATER («FERDIG 25.08 — se LOOP-1-DONE.md» øverst) | LAV | R1 |
| `LOOP-2-DONE.md` (slettet 27.08, se LEVERANSELOGG.md) | Flagger RLS som uløst — RLS-kode finnes nå på egen gren | OPPDATER (etter Session S1) | MIDDELS (dobbeltarbeid) | S1 |
| `docs/natt/workbench/README.md:42` + `ACCESS-AND-GROUPS.md:170` | Død referanse til `HANDOFF.md` (finnes ikke i repoet) | OPPDATER | LAV | R1 |
| `docs/natt/README.md` | Peker på feil kodegren (natt-a1-a4) | OPPDATER (etter B2: pek på release-grenen) | LAV | B2 |

### 1c. Historikk-filer

| Path | Problem | Anbefaling | Risiko | Eier |
|---|---|---|---|---|
| `siste-24-timer-2026-08-19.md` (allerede slettet) | Éngangslogg, inviterer selv til sletting, ingen refererer den | SLETT | LAV | R1 |
| `masterplan-lansering-2026-08-12.md` (arkivert i `docs/arkiv/paper-port/arkiv-gammelt/`) | Foreldet snapshot, duplikat av MASTERPLAN | ARKIVER | LAV-MIDDELS | R1 |
| `portstatus-paper.md` (slettet 27.08) | Avledede talltabeller, 8 dager gamle | ARKIVER | LAV | R1 |
| `SIKKERHETSRAPPORT-2026-08-11.md` (slettet 27.08) | Éngangs øyeblikksrapport | ARKIVER | LAV | R1 |
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
| A-02c / A-04 / A-04b / A-07 / A-11 / WB-07 (kilder, drag, serie) | Agency | **DONE på PR #601** (loadSources ekte innhold, native HTML5-drag kilder→uke, serie m/ endre-policy) | MANGLER FASIT (ingen tegnet skjerm — egen minimal design, se LOOP-B5-DONE.md) | Merge → deretter B6/T5/T6 |
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
- Beslutninger (Anders, blokkerer merket arbeid): **D1 LØST 25.08** — Train-lock for ALLE skjermer i PlayerHQ og AgencyOS (koden som bruker Paper er nå avvik som skal portes, bølge T); **D2 LØST 25.08 (PR #586)** — tokensettet er i kode (`src/styles/train-lock-tokens.css` + `src/lib/v2/train-lock.ts`); se `docs/natt/D2-TOKENS-DONE.md` for kilder og ti åpne spørsmål, der **nr. 1 (mørk default) er besvart 25.08 — /portal og /admin er snudd til mørk**; **D3 LØST 25.08** — zip committet som `designsystem/train-lock/` (dekker også Agency); **D4 LØST 25.08** — presedenssetningen rettet i CLAUDE.md/ak-master (design: Train-lock + docs/natt vinner alltid); **D5** PORTPLAN §A1.1 (DataGolf-plassering); **D6** skjebnen til plan-treningsplanlegging-til-kode (supersedert eller egen fase).

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
| B5 | ~~Loop 2T — kilder, drag, serie~~ **DONE 26.08 — PR #601** (worktree `wang-toppidrett-arsplan-d88725`, gren `claude/wb-b5-kilder-serie-c90b5c`, fra `origin/main` — ikke `release`) | Sonnet 5 | Build | gren fra release | loadSources ekte innhold (øvelsesbank/maler/forrige uke); drag fra kilder→uke (native HTML5 DnD, ikke dnd-kit); serie (gjenta + endre-policy) inkl. additiv DDL via kirurgisk db execute-script — `scripts/add-workbench-series-template-2026-08-26.ts`, KJØRT mot prod (ikke bare skrevet). Detalj: `docs/natt/LEVERANSELOGG.md` | Verify grønn; serie-økter opprettes/endres per policy; DONE-fil — **alle oppfylt** | B3 (samme filer) | Nei mot B3; Ja mot B4/B7 | Explore, validator |
| B6 | Loop 3T — godta/avvis + ikke delta | Sonnet 5 | Build | gren fra release | resolvePlayerApproval ekte; UI spiller (godta/avvis) + agency-visning (A-09/WB-10); hiddenByPlayer additiv DDL + filter; aldri #30D158 utenom Godta | Flyt klikkbar begge sider; DRAFT-invariant intakt; verify grønn; DONE-fil | B4 | Ja mot B5/B7 | Explore |
| B7 | Loop 4 — DispersionMap/TM | Sonnet 5 | Build | worktree, gren fra release | TM-08: 1σ-ellipse + én caddie-setning + prikk→slag-ark (TM-11); tom-tilstand TM-10; vurder gjenbruk av `src/lib/gameplan/dispersion.ts` (verifiser matematikken først); PH-01c-kort gated på data | Smoke-målet i CLAUDE.md klikkbart; verify grønn; DONE-fil | B2 (+D3 for pixel) | Ja, med B3/B4 | Explore, validator |
| B8 | Train-lock design-pass Player | Sonnet 5 | Build (port, ikke redesign) | gren fra release | Bruk `--tl-*`/`TL` (D2 ferdig; mørk default avklart 25.08); port PH-01e/PH-04/05/06 + /tren/wb-flater til scene #000000; skjermbilde-gate 390px+1280px lys/mørk | Anders har SETT skjermbilder; ingen nye token-familier utenom vedtatt sett; DONE-fil | D3, B4 (D2 løst) | Nei (rører B4-filer) | — |
| P-T | Plan bølge T: Train-lock-port av hele AgencyOS | Fable 5 | Plan mode | — | Inventarier alle AgencyOS-skjermer mot Train-lock-fasiten, del i sesjoner (én per hub/mal), oppdater denne planen med T-rader | **UTFØRT 25.08** — T1–T13 under + §5T (komplett ruteinventar: 149 ruter = 34 redirect + 115 skjermer) | Ingen (D1+D2+D3 løst 25.08) | — | Explore |
| T1 | Skall: Agency-rail + dock (5 tabber, «Under Meg») | Sonnet 5 | Build (port, ikke redesign) | worktree fra main | **ULÅST 25.08 kveld (T-S1 endelig avgjort: `AX-01` vinner, ikke AG-00 — se §5T.4).** Én endring i `src/components/v2/shell.tsx`/`V2Shell`: **fem destinasjoner, identisk rekkefølge på Mac og iPhone, aldri en sjette:** Stall · Workbench · Kø · Jarvis · Meg. Mac-rail **232 px** (ikke 64 px), `background #1C1C1E`, `border-right 1px solid #FFFFFF14`, rad 40px/radius 10px, aktiv = tekst `#F5F5F5` på flate `#2C2C2E`, inaktiv `#8E8E93` uten flate; under en divider: uppercase-label «Under Meg» + rader Konsoll · Økonomi · Kalender (34px, mute, ingen ikon); nederst «Åpne AgenticOS». iPhone-dock `#1C1C1E`, hairline topp, 88px, 5 like kolonner (ikon 20px + caps-tekst 10px), aktiv i `#F5F5F5`, Kø-badge `#FF453A`. **Ingen «Mer-ark» lenger** — Meg viser samme Konsoll/Økonomi/Kalender-rader. Fasit: `AX-01 Skall rail og tabbar.dc.html` (11 431 byte, komplett) + `docs/natt/D2-UNDERLAG-2026-08-25.md` §5.6. `AG-00 LOCK.dc.html`/`AG-05 Mer-ark.dc.html` (7 destinasjoner, 64px, Mer-ark) er UTDATERT — ikke bruk. Tokens: `--tl-*`/`TL`. Cockpit/Innboks/Innsikt/Oppsett er IKKE lenger egne tabber — href-mapping for de 5 + plassering av tidligere tab-innhold avgjøres av byggeren, begrunnes i DONE-fila | AX-01-strukturen portet i V2Shell, alle /admin-flater arver; gate: Anders har SETT 390px+1280px i lys OG mørk; verify grønn; DONE-fil | main | Ja (rører kun skallfiler, ikke innholdsskjermer) | Explore |
| T2 | Cockpit | Sonnet 5 | Build (port) | worktree fra main | Port `/admin/agencyos` til `AG-01 Cockpit.dc.html` (+`AG-01 Cockpit lys`), `AG-02 Cockpit Mac` (desktop full bredde), `AG-14 Cockpit tom`, `AG-15 Cockpit feil` (danger KUN her). Én hvit primær = «Åpne tavle». `/admin/brief` og `/admin/queue` portes IKKE — de står på beslutningslisten §5T (innfletting vs. egen fasit) | Cockpit i TL med tom/feil-tilstander; gate: sett 390+1280, lys+mørk; verify grønn; DONE-fil | main (bølge 1 inne, §0); T1 anbefalt først, ikke krav | Ja med T3/T4/T13 (disjunkte filer, maks 2–3 samtidig) | Explore |
| T3 | Innboks + godkjenninger | Sonnet 5 | Build (port) | worktree fra main | `/admin/innboks` → `AG-03 Innboks.dc.html` (Merge hvit primær, meldinger-tom-tilstand); `/admin/varsler` flettes inn som filter i samme flate (duplikat i dag); `/admin/godkjenninger` + `/admin/(legacy)/godkjenninger/[id]` → `AG-10 Godkjenning Merge.dc.html` + `AG-10b … 3 skall` (detalj blir inspektørpanel 380, ikke egen rute). `/admin/innboks-epost` og `(legacy)/foresporsler`: beslutningslisten §5T | Innboks + godkjenninger i TL, master–detalj per A2-beslutningen; gate: sett 390+1280, lys+mørk; verify grønn; DONE-fil | main | Ja med T2/T4/T13 | Explore |
| T4 | Stall + Spiller 360 + fys | Sonnet 5 | Build (port) | worktree fra main | `/admin/spillere` → `AG-04 Stall.dc.html` + `AG-16 iPad Stall split` + `B5 Lys Agency`; `/admin/spillere/[id]` (+ `(legacy)/spillere/[id]/profil` konsolideres til ÉN profil) → `AG-08 Spiller-ark` + `S3-01 Agency Spiller 360 Mac` (+`S3-01L` lys, `S3-02` iPad); `…/fremgang` flettes inn i 360; `…/analyse` → `S3-01` + `Analyse Gapping` + `DG-01 DataGolf spiller`; fys-raden → `FY-01 Fys stall.dc.html` (ACWR mute, aldri rød). Uten fasit (portes etter stall-mønsteret, se §5T): `ny`, `rediger`, `turnering-kobling`, `tester`. Pensjoneringskandidater (§5T): `plan`, `plan/[planId]`, `tildel-test`. PII: legacy-profil har art. 9-skadedata — flyttes, aldri dupliseres | Stall + 360 i TL, én profilvisning igjen; gate: sett 390+1280, lys+mørk; verify grønn; DONE-fil | main | Ja med T2/T3/T13 | Explore |
| T5 | Workbench-designpass Agency (speiler B8) | Sonnet 5 | Build (port) | worktree fra main | Port `/admin/workbench/[playerId]` (uke/økt/drill/publish — bygget i Paper-tokens i B-sporet) til TL: `A-01 Mac Uke Pro.dc.html` (+`A-01b/c`), `A-01d Publish confirm`, `A-12 iPad Uke`, `A-13 iPhone Agenda`, `A-14 iPhone Okt-ark Filip`, `A-16`/`A-17` (lys), `A-18 Mac Tom uke`, `WB-01`–`WB-03`. Gamle `/admin/spillere/[id]/workbench` (gammel datamodell, måned/år) pensjoneres når C1 har levert måned/år på ny modell — beslutning i §5T | WB-flatene på `--tl-*`/`TL`, scene #000000, én hvit primær = Publiser; gate: sett 390+1280, lys+mørk; verify grønn; DONE-fil | B5+B6 (funksjonen ferdig først) | Nei mot B5/B6 (samme filer); Ja mot T2–T4 | Explore |
| T6 | Plan-flatene → Plan-hub + Workbench-kilder | Sonnet 5 | Build (port + konsolidering) | worktree fra main | `/admin/planlegge` + `/admin/plans` → `AG-06 Plan-hub.dc.html` (hub: se og velg, én hvit primær «Åpne uke i Workbench»); `plan-templates`-familien (4 ruter) → `A-07 Mac Standard.dc.html`; drill-bibliotek (`(legacy)/drills` + `[id]`) → `A-04 Kilder Ovelsesbank.dc.html` (+`A-04b`) og `A-03 Ny okt modal` + `A-03b/c Ny drill`; `gjennomfore/okter/[id]` → `A-14 iPhone Okt-ark`. Pensjoneringskandidater (Anders, §5T): `plans/[planId]`, `okter`, `gjennomfore`, `drills/forslag`, `teknisk-plan`, `drills/ny`, `drills/[id]/rediger` (overlapp Loop 2S-editor). Tester-tildeling → Workbench TEST-blokker (§5T) | Plan-hub i TL; ingen dobbel planleggingsvei uten beslutning; gate: sett 390+1280, lys+mørk; verify grønn; DONE-fil | T5 + Anders' pensjoneringsliste §5T | Nei mot T5 | Explore |
| T7 | Kalender + booking-lag | Sonnet 5 | Build (port + konsolidering) | worktree fra main | `/admin/kalender` + `(legacy)/kalender/maned` samles til ÉN kalender: `KA-01 Agency Kalender uke Mac.dc.html` (+`KA-01L` lys), `KA-02 … maned`, `KA-03 … agenda iPhone`, `AG-11 Kalender dag`, `KA-05 … Kollisjon rom`. Booking (`bookinger` + `[id]` + `ny`, `(legacy)/availability`) inn som lag/ark i kalenderen per HANDOFF-MAL (Kalender eier rom/booking). `agencyos/uka` pensjoneres → KA-01 (beslutning §5T). Google-synk røres IKKE (C3-regelen) | Én kalender i TL med lag; gate: sett 390+1280, lys+mørk; verify grønn; DONE-fil | C3 (lag-visningen bygges der først) | Nei mot C3 | Explore |
| T8 | Grupper | Sonnet 5 | Build (port) | worktree fra main | `/admin/grupper/[id]/workbench` → `WB-08 Gruppeendring og venter.dc.html` + `WB-09 Gruppe og stall.dc.html`; `grupper/[id]/arsplan` → `A-06 Mac Arsplan.dc.html` + `WB-06 Arsplan 3 skall`; `A-10 Mac Stall dag` for gruppedag. Uten fasit (§5T): `grupper`, `grupper/[id]` (medlemsadmin), `timeplan`, `arsplan/skoledata`, `agencyos/ak-stigen` — portes etter mønster, IA bekreftes av Anders. NB: gruppe-workbench bruker `lPhase` (utgått vokabular) — rett etiketter i porten | Gruppe-flatene i TL; gate: sett 390+1280, lys+mørk; verify grønn; DONE-fil | C2 (stall→WB på ny modell) | Ja mot T9/T10 | Explore |
| T9 | Live + TrackMan Agency | Sonnet 5 | Build (port) | worktree fra main | `/admin/agencyos/live` + `[sessionId]` → `AG-09 Live-tavle.dc.html` + `AG-09b … full` (artefakt, aldri fane; 3 kort side om side Mac, stack telefon); `/admin/trackman` + `[sessionId]` → `TM-06 Agency TrackMan.dc.html` + `TM-10 Tom og agency-preview` (kilde-tag, «simulator som bookbar ressurs: nei»). Pensjoneringskandidater (§5T): `(legacy)/live/[sessionId]/` `active` · `brief` · `summary` (bruker utgåtte M0–M5-labels). `recording` (PII-tung): beslutningslisten | Live-tavle + Agency-TM i TL; gate: sett 390+1280, lys+mørk; verify grønn; DONE-fil | B7 (TM-motor); live-delen kun main | Ja mot T8/T10 | Explore |
| T10 | Turneringer | Sonnet 5 | Build (port) | worktree fra main | `/admin/tournaments` → `TU-01 Turneringer.dc.html`; `/admin/tournaments/[id]` → `TU-02 Onsoy Open.dc.html`. NB TL-IA: turneringer bor under Analyse (HANDOFF §GAP-1). Verktøyene `dubletter`, `ny`, `turnering-kart`: uten fasit (§5T — `ny` berører beslutningen 04.08 om turneringsplanlegging i Workbench) | Turneringsflatene i TL; gate: sett 390+1280, lys+mørk; verify grønn; DONE-fil | main | Ja mot T8/T9 | Explore |
| T11 | Innsikt-hub | Sonnet 5 | Build (port) | worktree fra main | `/admin/analyse` → `AG-07 Innsikt-hub.dc.html` + `AG-12 Innsikt stall.dc.html` (push-rader til Spiller 360/DataGolf/TrackMan/Fys/Tester/Økonomi — motorene blandes ALDRI i samme tall); `(legacy)/lag-snitt` flettes inn i AG-12. Uten fasit (§5T): `analysere/compliance`, `reports`, `runder`, `talent/*` (4 ruter), `(legacy)/stats/moderering` | Innsikt-hub i TL med motor-skille; gate: sett 390+1280, lys+mørk; verify grønn; DONE-fil | main; DG/EC-pushrader forutsetter C10 | Ja mot T2–T4 | Explore |
| T12 | AgenticOS + Jarvis + Caddie | Sonnet 5 | Build (port) | worktree fra main | `/admin/agenticos` + `/admin/agents/[agentId]` → `AO-00 LOCK Run Skills Tilstander.dc.html`, `AO-01 Cockpit ko godkjenning`, `AO-02 Runtimes og Ollama`, `AO-12`-policyen (A3/B1/C3 — warm hake, ALDRI #30D158 i AgenticOS); `/admin/handlingssenter` → `AO-05 Projects og Tasks.dc.html`; Jarvis-merge-flatene fra C6 → `JV-01`–`JV-03`. Caddie-trioen (`agencyos/caddie` + `aktivitet` + `dashbord`): uten fasit, beslutning §5T (Jarvis-destinasjonen i rail-forslaget vs. JV=merge-kø). `(legacy)/workspace/tildelt-meg` pensjoneringskandidat | AgenticOS-flatene i TL per AO-policy; gate: sett 390+1280, lys+mørk; verify grønn; DONE-fil | C6 + C7 (motor + queue først) | Nei mot C6/C7 | Explore |
| T13 | Oppsett + Meg | Sonnet 5 | Build (port) | worktree fra main | `/admin/settings` → `AG-13 Oppsett.dc.html` + `AG-18 Oppsett-hub.dc.html` (fem rader: Akademi, Varsler, Tilgang og roller, Klubb og steder, Konto — ingen hvit primær, «kjedelig er riktig»); `/admin/team` inn som rad (duplikat med settings?tab=team løses); `/admin/profile` → Meg-mønsteret i `AG-05 Mer-ark.dc.html`. Detaljsider uten egen fasit portes ETTER hub-mønsteret (ikke pixel — listet i §5T): settings/api·calendar·periode-navn·security·tilgang, klubb/innstillinger, `(legacy)/anlegg` (overlapp klubb — konsolider), team/ekstern·inviter, integrasjoner, email-templates ×2, gdpr, audit-log, feillogg, hjelp, `(legacy)/services` | Oppsett-hub + detaljer i TL; gate: sett 390+1280 (hub + minst 3 representative detaljsider), lys+mørk; verify grønn; DONE-fil | main | Ja med T2/T3/T4 | Explore |
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

### 5T. T-bølgen — komplett ruteinventar og beslutningsunderlag (P-T, utført 25.08)

Skrevet av P-T (Fable 5, read-only, denne worktree). Grunnlag: alle 149 `page.tsx` under
`src/app/admin/` kartlagt mot de 177 `.dc.html`-filene i `designsystem/train-lock/`
(9 parallelle leseagenter + egen verifisering; A-/WB-numre rettet mot faktisk filliste).
Målt: **0 admin-filer leser `--tl-*`/`TL` i dag; 66 filer leser Paper-tokens (`T.*`).**
Railen i `V2Shell` er fortsatt fase2-varianten med «Plan» — heller ikke
«Workbench»-omdøpingen (D2-UNDERLAG §5.3) er implementert.

**Regnskapet: 149 ruter = 34 UTGÅR/REDIRECT (i kode) + 115 skjermruter.**
Av de 115: **39 HAR FASIT** (fil navngitt i T-radene over), **14 pensjoneringskandidater**
(IA-en gir jobben til en annen flate — Anders beslutter), **62 uten fasit** (24 i klasse A +
38 i klasse B under). Hver skjermrute er tildelt én T-rad (eller C10) over — ingen rute er utelatt.

#### 5T.1 UTGÅR/REDIRECT — allerede redirect i kode (34, ingen port nødvendig)

`/admin` → agencyos · `oppfolging` → queue · `finance` → agencyos/okonomi · `approvals`(+`[id]`)
→ godkjenninger · `talent` + `talent/kohort|ressurser|region|wagr-benchmark` → talent/radar ·
`organisasjon` → settings · `messages` → innboks · `calendar`(+`maned`) → kalender · `uka` →
agencyos/uka · `agents` + `agent-team` → agenticos · `workspace/oppgaver` → handlingssenter ·
`agencyos/spillere` → spillere · `plans/templates`(+`ny`, `[id]/rediger`, `[id]/effectiveness`)
→ plan-templates · `(legacy)`: `analysere` → analyse, `stall` → spillere, `agenter` → agenticos,
`kapasitet` → bookinger, `coach-workbench` → planlegge, `okonomi` → agencyos/okonomi,
`plans/new` → planlegge, `kalender/uke` → dynamisk, `tester/tildel` → tester,
`plan-templates/[id]/effectiveness` → plan-templates, `caddie` → agencyos/caddie/dashbord
(`permanentRedirect`). Redirect-målene må oppdateres i takt med T6/T7-pensjoneringene.

#### 5T.2 Pensjoneringskandidater (14) — IA-en gir jobben til en annen flate, Anders beslutter

| Rute | Går inn i | Begrunnelse (IA/HANDOFF-MAL) | T-rad |
|---|---|---|---|
| `agencyos/uka` | KA-01-kalenderen | Booking-uke eies av Kalender; duplikat. NB rå `getDay()`-datomatte (gotcha) | T7 |
| `(legacy)/foresporsler` | Innboks (AG-03) / Kalender | Booking-saker dekkes der | T3 |
| `spillere/[id]/plan` + `plan/[planId]` | Workbench | Planlegging eies av Workbench; TechnicalPlan har ingen TL-fasit | T4→T6 |
| `(legacy)/spillere/[id]/tildel-test` | Workbench TEST-blokker | Test-planlegging eies av Workbench; duplikat av tester/tildel | T4→T6 |
| `plans/[planId]` | Workbench | 494 linjer på gammel plan-modell | T6 |
| `okter` | A-01 uke / A-10 stall dag | Ukeoversikt tvers av spillere dekkes av Workbench | T6 |
| `gjennomfore` | AG-11 / KA-03 | Gjennomføring eies av Kalender | T6/T7 |
| `(legacy)/drills/forslag` | AO-01-køen | AI-forslag samles i AgenticOS-køen (beslutning 04.08) | T6→T12 |
| `bookinger` (listeflaten) | KA-lag i kalenderen | Kalender eier booking-laget | T7 |
| `(legacy)/live/[sessionId]/active` | AG-09-flaten | Duplikat av agencyos/live; utgåtte M0–M5-labels | T9 |
| `(legacy)/live/[sessionId]/brief` | A-14 økt-ark | Økt-forberedelse eies av Workbench | T9 |
| `(legacy)/workspace/tildelt-meg` | Kø/cockpit «Én ting nå» | Godkjennings-kø samles | T12 |
| `spillere/[id]/workbench` | Ny Workbench (etter C1) | Gammel datamodell; måned/år kommer på ny modell i C1 | T5 |

#### 5T.3 T-bølge — ruter uten fasit

**Klasse A — detaljnivå under en hub som HAR fasit (24). Portes etter hub-mønsteret
(AG-13/AG-18 «kjedelig er riktig», KA-underark, stall-mønsteret) — trenger Anders' OK på
prinsippet, ikke egen fasitfil per skjerm:**
settings/api · settings/calendar · settings/periode-navn · settings/security ·
settings/tilgang · klubb/innstillinger · `(legacy)`/anlegg (overlapp klubb — konsolider) ·
team/ekstern · team/inviter · integrasjoner · email-templates (+`[id]/rediger`) · gdpr ·
audit-log · feillogg · hjelp · `(legacy)`/services (alle T13) — kalender/hendelse/`[id]` ·
kalender/hendelse/ny · bookinger/`[id]` · bookinger/ny · `(legacy)`/availability (T7, som
ark i KA-kalenderen) — spillere/ny · `(legacy)`/spillere/`[id]`/rediger (T4, stall-mønsteret).

**Klasse B — ekte hull (38): ingen fasitfil dekker jobben. Trenger Anders-beslutning
(tegn fasit · flett inn i navngitt flate · pensjoner):**

| Klynge | Ruter | Anbefaling |
|---|---|---|
| Cockpit-nære | `brief`, `queue` | Flett brief inn i AG-01-cockpiten; avklar hvem som eier «Kø»-jobben (se T-S2) |
| E-post | `innboks-epost` | Egen fasit trengs (AG-03 er saksinnboks, ikke e-postklient). Kunde-PII |
| Spiller-verktøy | `spillere/[id]/tester`, `spillere/[id]/turnering-kobling` | Tester-resultat → flett i S3-360; turnering-kobling er datavask-verktøy — behold uportert eller minimal TL |
| Plan | `teknisk-plan`, `drills/ny`, `drills/[id]/rediger` | Avklar mot AG-06/Loop 2S-drill-editoren |
| Tester (tvers av spillere) | `tester`, `tester/foreslatte`, `(legacy)/tester/benchmarks`, `(legacy)/tester/tildel/[spillerId]` | Tildeling → Workbench TEST-blokker (T6); resultat/benchmarks → Innsikt (T11). Bekreft |
| Grupper | `grupper`, `grupper/[id]`, `grupper/[id]/timeplan`, `grupper/[id]/arsplan/skoledata`, `agencyos/ak-stigen` | Medlems-/skoleadmin er ikke tegnet; portes etter mønster i T8 med Anders' OK. ak-stigen: PII-nær (juniorer) |
| Live/opptak | `(legacy)/live/[sessionId]/summary`, `recording` | Summary følger legacy-live-utfasingen; recording er PII-tung (lydopptak) — beslutning før port |
| Turneringsverktøy | `tournaments/dubletter`, `tournaments/ny`, `turnering-kart` | Verktøy — minimal TL. `ny`: husk beslutningen 04.08 (turneringsplanlegging → Workbench) |
| Innsikt-hull | `analysere/compliance`, `reports`, `runder`, `(legacy)/stats/moderering` | Kandidater som push-rader under AG-07; reports overlapper EC-01 (C10) |
| Talent | `talent/radar`, `talent/discovery`, `talent/sammenligning`, `talent/wagr-import` | Ingen TL-fasit for talent-admin. discovery sender navn/HCP til klient (PII-lett). Avklar omfang |
| Caddie | `agencyos/caddie`, `…/aktivitet`, `…/dashbord` | JV-fasiten er merge-kø, ikke chat. Avklar mot Jarvis-destinasjonen (T-S2) |
| Interne verktøy | `marketing`, `videoer`, `workspace`, `workspace/notion`, `workspace/prosjekter` | Utenfor coach-kjernen. Beslutning: TL etter mønster, eller lever uportert bak Meg |

Dekket av C-rader (ingen egen T-rad): `agencyos/okonomi` → **C10** (EC-01).

#### 5T.4 T-bølge — åpne spørsmål (stoppet på, ikke valgt stille)

- **T-S1 · RAIL-KONFLIKTEN — ENDELIG AVGJORT 25.08 kveld (Anders, i økt): `AX-01` vinner,
  ikke AG-00.** Dette OVERSTYRER notatet som sto her tidligere samme kveld (som hadde
  forkastet AX-01 som «ugyldig, avkuttet fil, 2 809 byte»). Det notatet var selv basert på
  utdatert informasjon: `Player HQ Train lock (6).zip` (levert 25.08, FØR T-S1 første gang
  ble skrevet) erstattet den avkuttede `AX-01` med en komplett fil (11 431 byte) — se
  `docs/natt/D2-UNDERLAG-2026-08-25.md` §5.6, som er fasit for denne beslutningen.
  **Gjeldende skall: fem destinasjoner — Stall · Workbench · Kø · Jarvis · Meg — identisk
  rekkefølge på mobil og Mac, aldri en sjette. Konsoll, Økonomi og Kalender er rader under
  Meg, ikke faner. Mac-rail 232 px med tekst** (ikke 64 px kun-ikon). Både `AG-00 LOCK`
  (5 på mobil + eget Mer-ark) og de 20+ A-/AG-skjermene (7 destinasjoner, 64 px) er nå
  UTDATERT — ikke bruk noen av dem som skall-kilde. `beslutninger.md` §A1 trenger samme
  rettelse (sto med AG-00 som vinner fra den mellomliggende 18:36-beslutningen — rettes i
  samme økt som denne). **T1 er ulåst** med korrekt spec (raden over oppdatert 25.08 kveld).
- **T-S2 · Caddie-trioens plassering — FORTSATT ÅPEN, men ikke blokkerende for T1.**
  Notatet «bortfalt» over var feil (skrevet ut fra premisset at AX-01 tapte — AX-01 vant).
  Siden Jarvis nå er en av de fem faste tabbene, må Caddie-trioens forhold til
  Jarvis-destinasjonen fortsatt avklares — se klasse B-tabellen (T12). Dette er en T12-sak,
  ikke noe T1 (ren skall-porting) trenger svar på.
- **T-S3 · RYDDET 25.08:** de ukommitterte, delvis stale regelfil-endringene i P-T-worktreet
  (reverserte mørk default + D2/D3-status, bar den forkastede AX-01-blokken) er forkastet
  med `git checkout` — backup av diffen ligger i scratchpad. `beslutninger.md`/`gotchas.md`
  er nå identiske med main pluss den nye A1-bekreftelsen.
- **T-S4 · §0 vs. P-T-oppdraget:** oppdragsteksten kalte S1/B2 blokkert; planens §0 (med
  smoke-bevis) sier utført og i main. §0 er lagt til grunn — T-radene avhenger av main,
  ikke av release-grenen. Hvis §0 er feil, må T-avhengighetene revurderes.
- **T-S5 · Lys-varianter:** `B5 Lys Agency` dekker bare AG-02/03/04/16, og kun A-16/A-17/
  P-09/KA-01L finnes ellers. Skjermbilde-gaten krever lys+mørk per skjerm — for skjermer
  uten tegnet lys-variant avledes lys mekanisk av tokensettet (`--tl-*` lys-verdiene).
  Bekreft at det er akseptabelt, ellers må lys-skjermer bestilles.
- **T-S6 · Fasit-tellingen:** kontekstpåstanden «AG-* (21), A-* (26), WB-* (11), AO-* (5)»
  stemmer med målt filliste (177 `.dc.html` totalt — verifisert). README sier «180
  skjermfiler» — differansen er støttefiler (HANDOFF/README/SYNC-STATUS/js), ikke manglende
  skjermer. Ingen fasitfil planen forutsetter mangler, med unntak av AX-01 (ugyldig, T-S1).
- **Uendret/ikke min beslutning:** Forelder-omfang (T4 i AAPNE-SPORSMAAL), D5 (DataGolf-
  plassering), D6 — som før.

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

---

## 8. Status og gjenstående vei til lansering (oppdatert 27.08.2026)

Denne seksjonen er den ferske sannheten. Del 0–7 over er detaljgrunnlaget den bygger på —
konsulter dem for fil:linje-nivå, men **stol på denne seksjonen for hva som faktisk gjenstår.**
Løpende snapshot: `docs/STATUS-NÅ.md` (oppdateres oftere enn denne filen).

> **27.08 kveld:** samlet plan for ALT gjenstående (inkl. P-bølgen for Player-porten,
> forelder-helporten, web-QA og cutover-verifisering) er nå
> **`docs/LANSERINGSPLAN-KOMPLETT-2026-08-27.md`** — den vinner på rekkefølge/omfang;
> denne filen er detaljgrunnlag for T-/C-radene. §8.3-tabellen under er delvis bak:
> T9, C2, C3, C4, C5, T6 (#620) og T13-detaljer (#619) er alle MERGET 27.08.

### 8.1 Levert siden 25.08 (verifisert mot `main`)

**Bølge 1 (økt-pakken) er FERDIG og prod-testet:** Loop 1/2/2S/3S, B2–B8 alle i `main`.
RLS kjørt og verifisert aktiv i prod. Bølge N (data-bro, PEI-motor, Team Norway) også inne.

**Train-lock-porten, etappe 1–2 komplett:** T1 (skall), T2 (cockpit), T3 (innboks +
godkjenninger), T4 (stall + spiller 360), T13 (oppsett + meg) — alle merget. T5
(coach-Workbench) viste seg allerede portet via D3/B5/B6 — ingen kodeendring trengtes,
se `docs/natt/LEVERANSELOGG.md`.

**Etappe 3 i gang (27.08 ettermiddag):** **T10** Turneringer (#617), **T11** Innsikt-hub
(#616) og **T4-restsidene** spillere/ny + rediger (#618) er merget. **Åpne PR-er:**
#619 (T13-detaljsider) og #620 (T6 Plan-hub) — venter på skjermbilde-gate + Anders' ja.

**Målt skjermdekning** (`docs/natt/SKJERM-STATUS-2026-08-26.md`, remåling:
`node scripts/maal-trainlock-status.mjs`): av 240 skjerm-ruter er et lite antall reelt
Train-lock etter T1–T5/T13/B8 — resten venter på etappe 3–4 under. Forventet, ikke et avvik.

### 8.2 §5T-beslutningskøen — LØST 27.08.2026

Alle punktene i `docs/natt/D-LYS-OG-5T-BESLUTNING.md` er avgjort av Anders (§ 0 i det
dokumentet har full detalj). Kort versjon:

- Klasse A (24 detaljsider) portes etter hub-mønster. Bulk-tabellen (14 pensjonering +
  ~13 klasse B «M»-rader) er godkjent som den står.
- `tournaments/ny` og de 4 talent-adminsidene var allerede avgjort tidligere (04.08 / 26.08)
  — ingen ny beslutning trengtes, bare rettet i tabellen.
- Caddie (chat) legges ned til fordel for Jarvis' godkjenningskø.
- Tre PII-tunge flater (innboks-e-post, AK-stigen, opptak) planlegges portet nå, med
  PII-vurdering bygget inn i den enkelte T-økten.
- `reports` flettes inn i økonomiflaten (EC-01). T13-restsidene portes nå, ikke utsatt.

**Ingenting blokkerer lenger T6/T9 eller resten av T-bølgen.** Neste plan-/bygge-økt for
hver T-rad henter presist omfang fra D-LYS-OG-5T-BESLUTNING.md § 0.

### 8.3 Neste kodesteg (rekkefølge, fri for §5T-blokken)

| Rekkefølge | Rad | Status/hvorfor nå | Avhenger av |
|---|---|---|---|
| ✓ | **T10** — Turneringer | **MERGET 27.08 (#617)** | — |
| ✓ | **T11** — Innsikt-hub | **MERGET 27.08 (#616)** | — |
| ✓ | **T4-rest** — spillere/ny + rediger | **MERGET 27.08 (#618)** | — |
| PR | **T6** — Plan-hub + Workbench-kilder | **I PR #620** — venter skjermbilde-gate + Anders' ja | — |
| PR | **T13-detaljer** — Oppsett-detaljsider | **I PR #619** — venter skjermbilde-gate + Anders' ja | — |
| 1 | **T9** — Live + TrackMan Agency | Fri: B7 er levert, live-delen kun main | main |
| 1 | **C2** — Stall→Workbench + **C3** — Kalender-lag | Bølge 2 starter nå (T10/T11/T6 unna, jf. regelen under); C2 låser opp T8, C3 låser opp T7 | M1 (levert) |
| 1 | **C4** — Tester-live + **C5** — Runde-live | Parallellbare med C2/C3 (disjunkte filer); låser opp C8 lys-pass | M1 (levert) |
| 2 | **T8** — Grupper | Etter C2 er merget | C2 |
| 2 | **T7** — Kalender + booking-lag | Etter C3 er merget | C3 |
| 3 | **C6 + C7** — Jarvis-merge + AgenticOS-queue | Låser opp T12 | M1 (levert) |
| 3 | **T12** — AgenticOS + Jarvis + Caddie | | C6+C7 |
| 4 | **C1 · C9 · C10 · C8** | Måned/år, foreldre, DataGolf+økonomi, lys-pass (C8 sist — rører manges filer) | C8: C4+C5 |
| 5 | **Full smoke** → merge-sjekk mot Del 3-kriteriene | | Alt over |

Regelen fra 27.08 står: T10/T11/T6 er unna (merget/PR), så bølge 2 (C-radene) kjøres nå
**parallelt** med gjenstående T-rader som ikke venter på en C-rad. Ikke la T-bølgen stå
helt stille til hele bølge 2 er ferdig.

### 8.4 P0 — det som blokkerer ekte/betalende brukere (statussjekket 27.08.2026, hos Anders)

Disse er **ikke kodearbeid** — Claude kan ikke utføre dem, kun forberede underlag.

| Punkt | Status 27.08.2026 |
|---|---|
| Resend DKIM for `send.akgolf.no` | Fortsatt åpen |
| `akgolf.no` → Vercel (DNS) | Fortsatt åpen |
| Live Stripe-nøkler + webhook-verifisering | Fortsatt åpen (testmodus komplett, sjekkliste: `docs/platform/stripe-cutover-sjekkliste.md`) |
| Google Calendar re-kobling | **UTFØRT** |
| Aktiverings-e-post til ekte spilleradresser | Fortsatt åpen — ekte adresser er ikke lagt inn ennå (dry-run 13.08 viste 14 «ok» mot syntetiske adresser) |
| Rotér `SCREENTEST_PASSWORD` | Fortsatt åpen (kompromittert siden hendelsen 03.08) |

**Betaling starter automatisk 1. september 2026** (`BETALING_STARTER` i
`src/lib/feature-flags.ts` — `gratisForAlle()` slår av samtidig). Fem av seks P0-punkter er
fortsatt åpne — verifiser at de er lukket i god tid før den datoen, ikke bare cutover-flagget.

### 8.5 Definisjon av «klar til å presentere for ekte brukere»

Alle punktene i Del 3 over holder fortsatt. I tillegg, konkret for dagens tilstand:
1. T-bølgen (T6–T13, komplett omfang per D-LYS-OG-5T-BESLUTNING § 0) levert og
   skjermbilde-godkjent av Anders.
2. ~~§5T-beslutningskøen besvart~~ — **LØST 27.08.2026**, se § 8.2.
3. Bølge 2 (C1–C10) levert — spesielt C8 (lys-pass) og C10 (DataGolf+økonomi), som er
   synlige for sluttbruker fra dag én.
4. P0-listen i §8.4 lukket av Anders.
5. Full smoke (CLAUDE.md-målsmoken) klikket av et menneske på release-kandidaten.
