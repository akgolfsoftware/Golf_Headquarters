# MANIFEST — les denne først

Dette er kart over Masterbrain. Er du en AI-agent som skal hente fagkunnskap
herfra: **les denne fila før du leser noe annet.** Den sier hva som er fasit,
hva som bare er råmateriale, og hva appen faktisk kjører på.

**Sist oppdatert:** 2026-09-26 · **Repo:** `akgolfsoftware/masterbrain`

> **Viktig midlertidig status:** De tre låste v2-avklaringene er migrert til
> maskin-fasit 2026-09-26: **A = verdensklasse → K = nybegynner** målt på
> brutto score, **GRUNN / SPESIALISERING / TURNERING / EVALUERING**, og
> **AK-formel v2 sine 19 områdekoder** med putting i **fot (ft)**. En agent som bruker L-faser,
> M-, PR- eller CS-skalaen herfra skal fortsatt vite at de skalaene er under
> revisjon.

---

## Periodenavn kan ha historiske aliaser — bruk oversettelsestabellen

CANON (`knowledge/concepts/canon-methodology.json` → `periods`) bruker nå v2-navnene
GRUNN / SPESIALISERING / TURNERING / EVALUERING. Eldre materiale og app-speil kan
fortsatt inneholde kortformene SPES og TURN, eller Prisma-stavemåter som
`LPhase`: GRUNN/SPESIAL/TURNERING. Dette er et kjent, dokumentert mønster — appen
speiler CANON manuelt i TypeScript og synker aldri automatisk (se
`src/lib/workbench/canon-period-adjustment.ts`). En agent som skriver et
periodenavn videre skal normalisere via oversettelsestabellen i
`knowledge/concepts/mikroperiodisering-og-tidsdimensjon.json` →
`periodenavn_oversettelsestabell` først.

## De fire reglene

1. **Fasiten er `knowledge/`.** Ingen andre mapper er fasit.
2. **Finner du samme kunnskap to steder, gjelder `knowledge/`.** Resten er kopier,
   råmateriale eller historikk — også når de ser nyere ut.
3. **Finn aldri på golfmetodikk.** Mangler kunnskapen, si at den mangler. Se
   «Kjente hull» nederst.
4. **`archive/` skal aldri leses som kunnskap.** Den finnes for sporbarhet.

---

## Fasit — `knowledge/`

Maskinlesbar. Dette er det eneste stedet en agent skal hente fagkunnskap fra.

### `knowledge/entities/`

| Fil | Innhold | Status |
|---|---|---|
| `positions.json` v2.0.0 | MORAD P1.0–P10.0, 289 målefelt, toleranser, poengskala, fase-indeks | Komplett |
| `faults.json` v2.0.0 | 10 svingfeil med deteksjon, korreksjon, symptomer | Komplett |
| `drills.json` v2.0.0 | **Tom.** Skjema for ny drill + liste over fjernede navn | **Under oppbygging** |
| `ordbok.json` v2.1.0 | MORAD fagspråk — 75 begreper, 347 sitater fra Mac O'Grady | 75 av 1 081 destillert |

### `knowledge/concepts/`

| Fil | Innhold |
|---|---|
| `canon-methodology.json` | CANON v3.5 — kategori A–K, pyramide, L-faser, 13 invarianter |
| `ltad-framework.json` | LTAD/ATK aldersmodell, volumtak, AK-stigen |
| `sg-principles.json` | SG-prinsipper, 5 APP-bånd, **`sg_to_morad_faults`** og **`app_band_faults`** |
| `upgame-dimensions.json` | UpGame konkurranseintelligens |
| `mikroperiodisering-og-tidsdimensjon.json` | 4-ukers mikrosyklus, øktantall, volumfordeling, fasilitets-/sesongregler — se merknad under |
| `treningsomrader-ak-formel-v2.json` | AK Golf HQ sin AK-formel v2 for driller, øvelser og tester: 19 områdekoder, putting i ft, golfslag i m, FYS/BANE uten avstandsenhet |

`sg_to_morad_faults` og `app_band_faults` i `sg-principles.json` er **eneste
gyldige maskin-fasit** for SG→feil-koblingen. Finnes samme kobling andre steder,
er det forklarende RAG-tekst eller utdatert kopi.

### Viktig om SG→feil

Koblingen er **hypotese, ikke diagnose**. Et SG-tall alene identifiserer ikke en
svingfeil. Før noen anbefaling gis må den bekreftes med:

- videoanalyse av svingen
- kontroll av hvor spilleren faktisk sikter
- gjennomgang av taktiske køllevalg

Rekkefølgen i listene er **ikke en rangering** — kandidatene er likestilte inntil
bekreftelse foreligger. Agenten skal skrive «SG peker mot X — må bekreftes med
video, sikte og køllevalg», aldri «feilen er X».

Besluttet av Anders Kristiansen, 31. juli 2026.

---

## Øvelsesbank — `ovelsesbank/`

Kanonisk hjem for alle drills. AK Golf HQ skal hente drills **herfra** (retningen
ble snudd 2026-08-03 — seed-filene i appen fases ut som kilde).

| Mappe | Status |
|---|---|
| `ovelsesbank/kandidater/` | 895 drills importert fra akgolf-hq. **IKKE fasit** — mangler AK-formel v2 og Anders' godkjenning |
| `ovelsesbank/til-godkjenning/` | Arbeidsbatcher med foreslått AK-formel v2. **IKKE fasit** |
| `ovelsesbank/godkjent/` | Fasit for Anders-godkjente driller, øvelser og tester. Første to puttingbatcher har 16 godkjente elementer |

Bindende regler: ingen drill, øvelse eller test uten AK-formel v2-koder fra
`knowledge/concepts/treningsomrader-ak-formel-v2.json`, fasilitetsprofil med
`longestShotM`, og Anders-godkjenning. Kun Anders godkjenner, all endring
synces til akgolf-hq. Full flyt (inntak → formel → godkjenning → sync) og planen
for hvordan agenter finner nye øvelser: `ovelsesbank/plan-inntak-og-godkjenning.md`.
Validering: `python3 scripts/validate-ovelsesbank.py`.

---

## RAG-tekster — `rag-corpus/`

Fritekst agentene henter inn ved søk. Utfyller fasiten, **erstatter den ikke**.
Ved motstrid gjelder `knowledge/`.

| Mappe | Filer | Innhold |
|---|---|---|
| `sg-trackman/` | 47 | SG-matematikk, TrackMan, D-plane, benchmarks |
| `sg-baselines/` | 15 | SG-baselineverdier |
| `treningsvolum/` | 14 | Evidensbasert volum og LTAD |
| `morad/` | 15 | Svingfeil, P-posisjoner, ordbok, SG→feil |
| `live/` | 5 | Tone og formuleringer i live-økt |

`index.json` er indeksen (chunk_id, tags, topics, relevance, word_count). Antall
tekstfiler på disk skal matche indeksen.

---

## Råmateriale — les kun ved behov, aldri som fasit

Omstrukturert 2026-08-03: `raw/`, `.firecrawl/` og `processed/` finnes ikke lenger
som toppmapper — alt kildemateriale er samlet i `sources/`.

| Mappe | Hva det er |
|---|---|
| `sources/` | Alt kildemateriale: `firecrawl/` (input til rag-corpus), `rapporter/` (fag-rapporter med figurer), `morad-ekstrakt/` (1,6 MB rå MORAD-ekstrakt), `sg-ekstrakt/`, `raw-2026-06-13/`. **Skal aldri endres, aldri leses som fasit.** Se `sources/README.md` |
| `research/` | Forretnings-, marked- og agent-analyser — ikke fagkunnskap |
| `plans/` | Aktive arbeidsplaner — ikke fagkunnskap. Ferdigkjørte planer ligger i `archive/planer-utfort-2026/` |
| `specs/` | Tekniske spesifikasjoner — ikke fagkunnskap |
| `archive/` | Historikk. **Aldri fagkunnskap.** |
| `FASIT-metodikk-og-vokabular-2026-08-19.md` (rot) | Menneskelig vokabular fra 19.08.2026. **Ikke maskin-fasit** — venter på Anders' bekreftelse. Ved motstrid mot `knowledge/` gjelder `knowledge/` inntil Anders sier noe annet. |

---

## Trenings- og evalueringsdata — `training-data/`

| Fil | Innhold |
|---|---|
| `examples/coaching-recommendations.jsonl` | 55 resonnementseksempler (input → resonnement → output) |
| `examples/live-coach-dialog.jsonl` | 20 live-dialogeksempler |
| `eval/holdout-15.jsonl` | 15 holdout-caser, ingen overlapp med treningseksemplene |
| `eval/RUBRIC.md` | Scoringsrubrikk, 5 dimensjoner × 5 poeng, terskel 20/25 |

**Merk:** rubrikkens dimensjon `drill_exists` forutsetter en drill-bank. Så lenge
drill-banken er tom, gir den nødvendigvis 0. Maksimal oppnåelig score er dermed
20/25 til banken er bygget. Rubrikken er ikke endret.

### Kjøre evalueringen

```bash
python3 scripts/eval-holdout.py
```

Scorer alle 15 caser mot rubrikken og skriver `training-data/eval/siste-kjoring.json`.
Den kjører **ingen språkmodell** — den måler om fasiten inneholder det som trengs
for å svare. Grønt betyr «kunnskapen finnes og er entydig», ikke «agenten svarte
riktig».

Siste kjøring (2026-07-31): **20/25 på alle 15**, ingen blokkerende brudd.
Uten drill-dimensjonen 20/20. Tre caser (ho-003, ho-004, ho-010) etterspør en
navngitt drill og kan ikke besvares før banken er bygget.

---

## Hva appen faktisk leser

AK Golf HQ (`akgolf-hq`) henter fra Masterbrain på tre måter:

| Vei | Kilde her | Havner i appen som | Synkes automatisk |
|---|---|---|---|
| Sync-skript | `knowledge/` | `src/lib/masterbrain/knowledge/` | Ja — `npm run sync:masterbrain` |
| Embedding | `rag-corpus/` | `knowledge_chunks` i Supabase (pgvector) | **Nei** — eget seed-skript |
| Drills (kommer) | `ovelsesbank/godkjent/` | erstatter `prisma/seed-data/` | Bygges — egen oppgave i akgolf-hq |

Sync-skriptet er `scripts/sync-masterbrain.ts` i akgolf-hq. Sti overstyres med
`MASTERBRAIN_PATH`, ellers antas søsken-mappa `../masterbrain`.

**Kjente etterslep i appen (per 2026-08-03):** sync-skriptet refererer gamle
`processed/rules/`-stier som nå er `sources/morad-ekstrakt/`, og `src/lib/domain/rules/`
i appen er en gammel manuell kopi som kan drifte fra fasiten. Begge rettes i
akgolf-hq-repoet. Fast regel: **enhver endring i Masterbrain skal oppdateres til
akgolf-hq i samme arbeidsøkt** — og etter endringer i rag-corpus må embedding
kjøres på nytt for at agentene skal se dem.

Appen speiler i tillegg enkelte CANON-regler manuelt i TypeScript
(f.eks. `src/lib/workbench/canon-period-adjustment.ts`). Endres `knowledge/`,
må speilene oppdateres for hånd.

---

## Kjente hull — si ifra, ikke dikt

Dette mangler bevisst. En agent som treffer et av disse skal si at kunnskapen
ikke finnes ennå.

| # | Hull | Konsekvens |
|---|---|---|
| 1 | **Drill-fasiten er i gang — men banken er fortsatt svært liten** | `ovelsesbank/godkjent/putting.json` har 8 Anders-godkjente korte puttingdriller. `ovelsesbank/kandidater/` har fortsatt 895 importerte kandidater som ikke er fasit. Agenter kan kun foreslå godkjente elementer fra `godkjent/`, aldri kandidater eller fritekst |
| 2 | **Putting har ingen kunnskapskilde i `knowledge/`** | `sg_to_morad_faults.putt` er tom. Kilde ligger i `sources/putting/` (Mac 1–300 ft). Ikke destillert til fasit ennå |
| 3 | **Tidsdimensjon — delvis fylt** | `knowledge/concepts/mikroperiodisering-og-tidsdimensjon.json`. Øktantall, volumfordeling og fasilitetsregler er fasit |
| 4 | **Mikroperiodisering — delvis fylt** | Samme fil: 4-ukers build/peak/deload/test-syklus er fasit. Ingen dag-for-dag fordeling innad i uken finnes ennå |
| 5 | **Turneringsforberedelse er 35 ord** | Ingen nedtelling, ingen taper, ingen etterrestitusjon |
| 6 | **`RECOVERY_ADD` / `DELOAD` er stubs** | Belastning kan ikke handles på |
| 7 | **Livskontekst delvis** | LIFE-kodene ligger i `sources/life/`. Skole, reise og norsk vinter mangler fortsatt |
| 8 | **Banestrategi som kilde, ikke fasit** | DECADE m.m. ligger i `sources/strategi/`. Ikke destillert til `knowledge/` |
| 9 | **Ordboka er 7 % destillert** | `knowledge/entities/ordbok.json`: 75 av 1 081 kildesegmenter. Råtranskripsjonene ligger i `~/Developer/ak-second-brain/raw/morad-transcripts-v2` (2 074 filer) |

### Ordbok-utvidelse — status 31. juli 2026

Forsøkte å hente flere begreper fra kildematerialet (`ak-second-brain/raw/morad-extracted-concepts-v2/mac_quotes.json`,
2 174 råsitater). Funn:

- **`morad-extractor.py`-skriptet i ak-second-brain ble aldri kjørt** —
  output-mappa (`raw/morad-extracted/`) er tom. Ingen renset teknisk-only-korpus finnes.
- Søk mot ~50 kjente MORAD/biomekanikk-termer ga nesten ingen nye treff. De
  fleste var enten allerede dekket (som sitater inni andre begreper) eller for
  tynne/tvetydige talespråk-fragmenter til å stole på uten å dikte mening inn.
- Ett solid funn lagt til: `impact position` (4 rene sitater om Nicklaus).
  Merket `status: "UTKAST — venter på Anders' korrigering"` i fila.

**Konklusjon:** de 74 opprinnelige begrepene tok allerede det tydeligste
stoffet. Å hente ut resten av de ~1 000 gjenstående kildesegmentene krever at
noen faktisk leser de 75 transkripsjonsfilene i
`ak-second-brain/raw/morad-2026-05-18/transcripts/` (6,9 MB) — ikke søk etter
kjente ord. Det er en egen, større oppgave. Anders har bedt om å parkere den
og gå videre i Fase 2-køen.

### Rettet attribusjonsfeil — ikke bekreftet av Anders ennå

Ordboka tilskrev innholdet **«Mac Malaska»**. Det er en annen, reell golfinstruktør
(Mike Malaska) uten tilstedeværelse i materialet. Innholdet er Mac O'Gradys.

Rettet 31. juli 2026 med grunnlag i Anders' egen ingest-rapport
(`ak-second-brain/wiki/syntheses/2026-05-12-morad-ingest-rapport.md`, punkt 2), som
konkluderte at dette var en pipeline-feil og anbefalte retting — en anbefaling som
aldri ble utført.

**Fortsatt feil to steder:**

1. Appens kopi av ordboka — flyttet 2026-08-02 til
   `akgolf-hq/docs/arkiv/2026-08-02-masterbrain-rydding/morad-ordbok-v2.json`
   (lå tidligere i `src/lib/domain/rules/`). Ikke rettet, venter på beslutning.
2. `ak-second-brain/wiki/sources/2026-05-18-morad-ordbok-v2.md` — hevder de er to
   ulike personer. Samme pipeline-feil kjørt om igjen, uten belegg.

Hull 1–8 er Fase 2 i planen. Se `~/.claude/plans/legg-til-i-planen-cheerful-nova.md`.

---

## Endringslogg

| Dato | Hva |
|---|---|
| 2026-09-26 | Første batch kjørt: 8 korte puttingdriller flyttet fra `ovelsesbank/til-godkjenning/` til `ovelsesbank/godkjent/putting.json` etter Anders-kommando. Validator grønn med 8 godkjente elementer. |
| 2026-09-26 | Andre batch kjørt: 8 nye korte puttingdriller lagt i `ovelsesbank/godkjent/putting-batch-002.json`. Validator grønn med 16 godkjente elementer. |
| 2026-09-26 | Øvelsesbank-vakt lagt inn: `scripts/validate-ovelsesbank.py`, schema for godkjente elementer, CI-kjøring på `ovelsesbank/**`, og første ikke-godkjente puttingbatch i `ovelsesbank/til-godkjenning/putting-batch-001.json`. Vakt og batch krever nå hele AK Golf HQ-parameterpakken: pyramide, område, motorikk/dimensjon, belastning, press, måleutstyr, treningstype, miljø, fasilitetskrav og `longestShotM` for facility-matching. |
| 2026-09-26 | `knowledge/concepts/treningsomrader-ak-formel-v2.json` opprettet som maskin-fasit for AK Golf HQ sin AK-formel v2. Dette erstatter tidligere omtale av “17 treningsområder”: historisk navn, men gjeldende app-fasit har 19 områdekoder. Eval-vakt sjekker eksakt kodeliste, putting i ft, golfslag i m og FYS/BANE uten avstandsenhet. |
| 2026-09-26 | CANON-perioder migrert til v2-navnene GRUNN / SPESIALISERING / TURNERING / EVALUERING. Gamle SPES/TURN er nå bare historiske aliaser i `mikroperiodisering-og-tidsdimensjon.json`, og eval-vakt stopper regresjon. |
| 2026-09-26 | Kategoriskalaen i `knowledge/concepts/canon-methodology.json`, treningseksempler og holdout-caser migrert til AK-formel v2: A = verdensklasse, K = nybegynner, målt på brutto score. Eval-vakt lagt inn for å hindre at skalaen snus tilbake. |
| 2026-09-26 | APP-bånd→MORAD-hypoteser flyttet til strukturert fasit i `knowledge/concepts/sg-principles.json` (`app_band_faults`), og `scripts/eval-holdout.py` leser nå fasit derfra i stedet for RAG-tekst. Tre uindekserte redirect-filer i `rag-corpus/` fjernet, slik at disk og `index.json` begge har 96 chunks. |
| 2026-09-08 | TrackMan/SG/stats-rapportene fra Academy (7. juli) kopiert til `sources/rapporter/strokes-gained/fra-academy-2026-07-07/`. |
| 2026-09-08 | `REDIGER-HER.md` i rot — Anders' arbeidsdokument for ordbok, språk, driller og tester. Speil i Drive `akgolf-hq/kunnskap/rediger-her.md`. |
| 2026-09-08 | Kilder inn: putting, strategi (DECADE), LIFE, IUP-tester, FYS-øvelsesbank (132, godkjent 20.08). Ligger i `sources/`, ikke i `knowledge/`. |
| 2026-09-08 | `sources/rapporter/` sortert etter fag: strokes-gained, ltad-og-volum, fysisk, mental, sportsvitenskap, plattform. |
| 2026-09-08 | Ryddet OneDrive-dumpet `Kunnskap ` (198 MB, 8 zip, WANG/OLT/Team Norway/GFGK). Innholdet er pakket ut, duplikater slått sammen og flyttet dit det hører hjemme: WANG → `claude-cowork/wang-toppidrett/kunnskap/`, Team Norway → `region-satsing/kunnskap/team-norway/`, GFGK-samleside → `gfgk/kunnskap/team-gfgk-samleside/`. Golf-relevant som ble igjen: `sources/rapporter/mentaltrening-i-golf.pdf` + `golf-styrke-25.xlsx`. Kladden `KLADD-metodikk-…` arkivert; `FASIT-metodikk-og-vokabular-2026-08-19.md` ligger i roten og venter på Anders' bekreftelse. Én zip (139 MB OneDrive_1) er avkuttet og ligger i wang `innkommende/`. Repoet gikk fra 228 MB til 31 MB. |
| 2026-08-03 | Stor omstrukturering: `ovelsesbank/` opprettet med 895 drill-kandidater fra akgolf-hq (retning snudd — appen skal hente drills herfra). Alt kildemateriale samlet i `sources/` (`raw/`, `.firecrawl/`, `processed/` fjernet som toppmapper). Duplikater og støy slettet, ferdigkjørte planer arkivert, kebab-case-navn. v2-avklaringer låst av Anders (A=verdensklasse, områdesystem med putting i ft, periodisering + Evaluering) |
| 2026-08-02 | CI-regresjonsvakt: `.github/workflows/eval-holdout.yml` kjører `scripts/eval-holdout.py` på endringer i `knowledge/`, `rag-corpus/`, `training-data/` |
| 2026-07-31 | To konkurrerende MORAD-versjoner slått sammen til én fasit. Drill-banken tømt. SG→feil merket som hypotese. `from-akgolf-hq-2026-07-27/` arkivert. Denne fila opprettet |
| 2026-07-27 | MORAD eksportert fra akgolf-hq til `from-akgolf-hq-2026-07-27/` |
| 2026-07-19 | rag-corpus embeddet til `knowledge_chunks`, SG-baselines seedet |
| 2026-07-10 | Mappestruktur ryddet |
