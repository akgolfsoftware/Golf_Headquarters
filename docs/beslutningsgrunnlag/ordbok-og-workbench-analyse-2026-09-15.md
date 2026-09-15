# Ordbok, opprydding og Workbench — analyse og forslag

**15.09.2026.** Grunnlag for `docs/ordbok-master-trening.md` (utkast). Alt under er målt i
repoet samme dag: 3 kartlegginger (dokumenter, kode, Workbench), alle funn har sti og
linje i kartleggingsrapportene. Ingenting er slettet ennå — sletting venter på Anders.

## 1. Hovedfunn i én setning

Det finnes **sju dokumenter og fem kodefiler** som hver for seg påstår å være ordforrådet,
og de er uenige om antall treningsområder (16/17/19), puttebånd (5/6/7), enhet for putting
(fot/meter), spillerkategori (A–K/A–L/7 stk), periodenavn (3 varianter) og pressnivåer
(2 varianter). Én master løser dette bare hvis de andre forsvinner samtidig.

## 2. Hva som er utdatert og bør bort

### 2.1 Slett (ingen kode leser dem, innholdet er tatt inn i masteren eller er utgått)

| Fil | Hvorfor | Må gjøres samtidig |
|---|---|---|
| `docs/vokabular-planlegging-2026-08-18.md` | Supersedert 08.09. Sier fortsatt 17 områder, A–L, fem puttebånd | Rett `.claude/rules/beslutninger.md:977` som fortsatt peker på den som «fasit for ordforrådet» |
| `docs/ORDBOK-TRENINGSPLANLEGGING-2026-09-08.md` | Innhold tatt inn i masteren | Rett kommentaren i `src/lib/domain/ak-formel-v2.ts:5`, `docs/README.md:15`, to README i `docs/treningsplanlegger/` |
| `docs/FASIT-AK-GOLF-HQ.md` | Innhold tatt inn uendret i masteren | Rett `AGENTS.md:11`, `prisma/schema.prisma:269`, `docs/README.md:15` og 20+ dok-lenker (liste i kartleggingen) |
| `docs/design-guide-terminologi.md` | §1 og §3 er merket utgått i fila selv. §2 (tall) er tatt inn i masteren kap. 16 | Rett `docs/ordbok.json:7` og 6 lenker i konsept-ordboken |
| `docs/treningsplanlegger/wang-toppidrett/arshjul-2026-2027.html` | Duplikat av `.md`-fila, ingen leser den | — |
| `docs/treningsplanlegger/wang-toppidrett/README.md`, `docs/treningsplanlegger/gfgk-junior/README.md` | Ingen refererer dem. Innholdet (gruppenavn-mapping) hører hjemme i masteren kap. 7 | — |
| `src/lib/masterbrain/processed/rules/` (5 filer, 29 000 linjer) | MANIFEST.md:111–119 sier «Ikke les dem». Ingen kode leser dem | — |
| `src/lib/masterbrain/rag-corpus/morad/canon-l-fase-overrides.md` | L-faser med CS/M/PR og «høyeste prioritet» leses fortsatt av AI-coachen via `rag-select.ts:9`. Pensjonert modell | Fjern fra `rag-corpus/index.json` |
| `src/lib/masterbrain/rag-corpus/morad/canon-pyramide-ak-formel.md` | Prosentkrav per periode (FYS 20 / TEK 30 …) som ble opplåst 18.08 | Samme |

### 2.2 Krymp (kan ikke slettes uten kodeendring)

| Fil | Problem | Forslag |
|---|---|---|
| `docs/ordbok-ak-golf-konsept.md` (1112 linjer) | `scripts/ordbok-json.ts` leser den og feiler hvis et Prisma-enum ikke er nevnt. Del A §1–§16 er 60 % utgått, men §4 (16 områder) og §9 (prosentkrav per periode) er **ikke** merket utgått | Del A slettes. Del B (staving av vanlige appord) flyttes til `docs/skjermtekst/ak-golf-hq-sprak-og-ordbok.md`. Skriptet pekes på masteren |
| `docs/ordbok.json` | Generert 03.07.2026 (versjonsfelt), inneholder L-faser med CS-bånd som fasit. Leses av `TreningLoggV2.tsx:14` (kun kommentar) og en Caddie-test | Generer på nytt fra masteren. Kjør skriptet i `npm run verify` så den ikke blir gammel igjen |
| `src/lib/masterbrain/knowledge/concepts/canon-methodology.json` | CANON v3.5 med L-faser, ni CS-nivåer, invarianter. Lastes av `hent-kunnskap.ts:22` og AI-agentene | Merk seksjonene `l_faser`, `cs_levels`, `invariants` som `historisk: true`, eller ta dem ut. AI-coachen svarer i dag med regler som ikke finnes |
| `src/lib/taxonomy.ts` | 17 områder, sju puttebånd, 7-listen for kategorier, CS/M/PR-tabeller. Driver fortsatt deler av UI | Reduser til det masteren har. Alt annet flyttes til `ak-formel-v2.ts` |
| `src/components/workbench-hybrid/taxonomy.ts` | Putting i **meter**, egen områdeliste, fysType POWER | Slett hvis ingen skjerm bruker den (rapporten fant kun typer/tema), ellers rett |
| `src/lib/ai/skills/bompa-perioder.ts` | Seks periodenavn som ikke finnes andre steder (GRUNNTRENING, OPPBYGGING, OVERGANG, HVILE) | Bytt til masterens åtte |
| `src/app/admin/(legacy)/kalender/lib/periode-helpers.ts` | Lagrer EVALUERING som TURNERING og FERIE som GRUNN | Fjern broen; LPhase har feltene nå |

### 2.3 Behold, men merk historisk

`docs/arkiv/**` (allerede arkiv), `docs/treningsplanlegger/wang-toppidrett/{grunnlag-funn,oktmal,arshjul}.md`
(kode og designsystem leser dem — men de bærer v1-vokabular i «UTGÅTT»-varsler som bør
strammes til én linje som peker på masteren).

## 3. Motstridene masteren tar stilling til

| Tema | Kode i dag | Master | Krever |
|---|---|---|---|
| Treningsområder | 19 i v2, 17 i `taxonomy.ts`, 16 i hybrid | 19 | Rydde de to gamle listene |
| Putting | fot i v2, meter i hybrid, sju bånd på `Round.sgPutt*` | fot, seks bånd | Datamigrering av rundefelt (avklaring 3) |
| Kategori | A–K snittscore (11) og 7-liste HCP | A–K snittscore | Slette 7-listen |
| Periode | `LPhase` (7, uten EVALUERING) og `PeriodeType` (5, uten samlinger) | 8 | Legge EVALUERING i LPhase (avklaring 1), pensjonere PeriodeType |
| Press | ALENE/OBSERVERT/KONKURRANSE/TURNERING, FRI/KRAV/UTFORDRING/KONKURRANSE, PR1–PR5 | v2-navnene | Rette `ak-formel-visning.ts` |
| SG-navn | «Off the tee» / «Tee-slag» / «Utslag» | Utslag (avklaring 2) | Én label-fil |
| M0–M5 labels | tre ulike sett | Utgått | Fjerne når `TrainingSessionV2.miljo` ikke lenger er påkrevd |
| CS20–CS40 | finnes ikke i enum, men i transkripsjons-ordliste, test og canon-json | Utgått | Rydde tre filer |

## 4. Forslag til forbedring (utover opprydding)

1. **Én kildefil for vokabular i kode.** `src/lib/domain/ak-formel-v2.ts` er allerede
   riktig for områder og formel. Flytt perioder, press-labels, SG-labels, FYS-typer og
   kategori dit (eller til søsterfiler i `src/lib/domain/`) og la `taxonomy.ts` dø.
2. **Generer ordbok.json fra masteren, og masteren fra kode.** Et skript som leser
   Prisma-enumene og label-filene og skriver tabellene i kapittel 1–15 vil avdekke drift
   automatisk. Kjør i `npm run verify`. Da kan ikke dokument og kode skli fra hverandre igjen.
3. **Vakt mot utgåtte ord.** Et enkelt grep i verify som feiler på `L_KROPP|CS40|M0|PR1|
   INNSPILL_0_50|PUTT_10_15` i ny kode utenfor migreringsbroene.
4. **AI-laget må lese masteren, ikke CANON v3.5.** Caddie og agentene henter i dag
   prosentkrav og L-faser fra `canon-methodology.json` og RAG-korpuset. Etter opprydding
   svarer de fortsatt med regler Anders har avskaffet.
5. **Én språkfil for skjermord.** `docs/skjermtekst/ak-golf-hq-sprak-og-ordbok.md` (2 928
   linjer) er arbeidsutgaven for staving og knappeord. Masteren dekker fag og data. De to
   skal ikke overlappe: masteren eier koder og betydning, språkfilen eier tone, staving og
   skjermtekst.

## 5. Workbench — status for komplett planlegging

Kjernefunn: **Workbench finnes i to parallelle utgaver med hver sin database-tabell.**
Coachens økt lagres i `WorkbenchSession`, spillerens egen i `TrainingPlanSession`.
Forretningsregelen sier «Workbench er delt kjerne». Den er ikke det i dag.

| Nivå | Individ | Gruppe |
|---|---|---|
| Årsplan med perioder (redigerbar) | Finnes | Finnes (samme skjerm) + utrulling til spillere |
| Årsplan 12-mnd oversikt (WB-06) | Kun lese, kan ikke redigere | Mangler |
| Måned | Finnes (lese) | Kun skolekalender, egen datamodell |
| Uke | Finnes (coach og spiller) | Kun «bruk mal på alle». Ingen gruppeuke |
| Dag | Finnes | Mangler |
| Økt | Finnes: opprett, flytt, serie, mal, publiser, godkjenn | Bare tidspunkt og tittel. Ingen innhold |
| Gruppeøkt lagres hos hver spiller (bestemt 30.08) | — | Regel og felter finnes, men ingen skjerm skriver dem |
| Delt økt med ansvarlig trener per blokk (bestemt 30.08) | Mangler | Mangler. Verken modell, skjerm eller tegning |
| Øvelser i økt | Finnes | Arves kun via mal |
| Styrke med sett/reps/%1RM | Finnes, men utenfor Workbench (egen FYS-flate) | Mangler. Ingen coach-side |
| Tester planlegges og føres | Testblokk finnes, ikke koblet til protokoll | Mangler. Ingen testdag, ingen bulk-føring |
| Turnering | Finnes, med kollisjon mot periode | Kun lesevisning |
| Publisering og godkjenning | Finnes | Mangler (WB-08/09/10 er tegnet, ikke bygget) |

### 5.1 De tre største hullene

1. **To Workbench-stabler.** Må slås sammen til én økt-modell før noe annet, ellers bygges
   gruppeplanlegging på feil grunnmur.
2. **Gruppeøkt som planleggingsmodus.** Beslutningen fra 30.08 (gruppeøkt lagres i hver
   spillers plan) har regelverk og tester, men ingen skjerm. WB-09 «Gruppe og stall» er
   tegnet. Bygg den.
3. **Delt økt med ansvarlig trener per blokk.** Ingenting finnes. Trenger datamodell
   (delblokk under økt med `ansvarligCoachId`), tegning i Claude Design og skjerm.

### 5.2 Anbefalt rekkefølge

1. Master-ordboken godkjent (denne leveransen).
2. Slå sammen økt-modellene (teknisk, ingen ny skjerm).
3. Gruppeuke i Workbench: én gruppeøkt → kopi til hver spiller, publisering, «ikke delta»
   (WB-08, WB-09, WB-10 finnes som fasit).
4. Delt økt med blokker og ansvarlig trener (tegnes først).
5. Styrkeøkt og testdag inn i Workbench (coach kan planlegge sett/reps og bulk-føre test).
6. Årsplan-oversikt for gruppe (WB-06 for gruppe).

## 6. Claude Design — parallelt arbeid

Claude Design-tilkoblingen virket ikke i denne økten (krever `/design-login` i en
interaktiv terminal). Klar til å sendes når den er oppe:

- **Ordboken som referansefil** i Train-lock-prosjektet (`a5152cf9`): last opp
  `docs/ordbok-master-trening.md` som `referanse/ordbok-master.md`, så alle nye skjermer
  bruker samme ord.
- **Tegn tre skjermer som mangler fasit:** (a) gruppeuke i Workbench med gruppeøkt som
  kopieres til spillere, (b) delt økt med blokker og ansvarlig trener, (c) testdag med
  bulk-føring. Bruk regelen fra 30.08: Mac 1440 + mobil 390, lys og mørk, tom tilstand,
  ekte norsk tekst fra masteren.
- **Rett eksisterende tegninger** som bruker utgått vokabular (CS60, M3, L-BALL): P-05
  Agenda, TnBatch1, WANG øktmal-visninger.

## 7. Neste steg

1. Anders leser `docs/ordbok-master-trening.md`, retter og svarer på de ti avklaringene.
2. Claude gjør slettelisten i 2.1 og krympingen i 2.2 i én PR, med lenkeretting.
3. Claude kjører `/design-login` sammen med Anders og laster masteren inn i Claude Design.
4. Workbench-rekkefølgen i 5.2 registreres med `/beslutning` i MASTERPLAN.
