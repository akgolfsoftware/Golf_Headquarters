# MANIFEST — les denne først

Dette er kart over Masterbrain. Er du en AI-agent som skal hente fagkunnskap
herfra: **les denne fila før du leser noe annet.** Den sier hva som er fasit,
hva som bare er råmateriale, og hva appen faktisk kjører på.

**Sist oppdatert:** 2026-07-31 · **Repo:** `akgolfsoftware/masterbrain`

---

## Periodenavn skrives ulikt i CANON og i databasen — bruk oversettelsestabellen

CANON (`knowledge/concepts/canon-methodology.json` → `periods`) bruker
GRUNN / SPES / TURN. Prisma-enumene i akgolf-hq bruker andre stavemåter for
samme begrep (`LPhase`: GRUNN/SPESIAL/TURNERING, `PeriodeType`:
GRUNN/SPESIALISERING/TURNERING). Dette er et kjent, dokumentert mønster —
appen speiler CANON manuelt i TypeScript og synker aldri automatisk (se
`src/lib/workbench/canon-period-adjustment.ts`). En agent som skriver et
periodenavn til databasen skal **aldri bruke CANON-strengen rått** — slå opp
i oversettelsestabellen i
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
| `sg-principles.json` | SG-prinsipper, 5 APP-bånd, **`sg_to_morad_faults`** |
| `upgame-dimensions.json` | UpGame konkurranseintelligens |
| `mikroperiodisering-og-tidsdimensjon.json` | 4-ukers mikrosyklus, øktantall, volumfordeling, fasilitets-/sesongregler — se merknad under |

`sg_to_morad_faults` i `sg-principles.json` er **eneste gyldige kopi** av
SG→feil-koblingen. Finnes den andre steder, er de utdaterte.

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

## RAG-tekster — `rag-corpus/`

Fritekst agentene henter inn ved søk. Utfyller fasiten, **erstatter den ikke**.
Ved motstrid gjelder `knowledge/`.

| Mappe | Filer | Innhold |
|---|---|---|
| `sg-trackman/` | 49 | SG-matematikk, TrackMan, D-plane, benchmarks |
| `sg-baselines/` | 15 | SG-baselineverdier |
| `treningsvolum/` | 15 | Evidensbasert volum og LTAD |
| `morad/` | 15 | Svingfeil, P-posisjoner, ordbok, SG→feil |
| `live/` | 5 | Tone og formuleringer i live-økt |

`index.json` er indeksen (chunk_id, tags, topics, relevance, word_count).

**Kjent avvik:** 99 tekstfiler på disk, 96 i indeksen. Disse tre er ikke indeksert
og blir derfor ikke funnet ved søk: `sg-trackman-021.md`, `sg-trackman-040.md`,
`treningsvolum-004.md`.

---

## Råmateriale — les kun ved behov, aldri som fasit

| Mappe | Hva det er |
|---|---|
| `raw/` | Originale kildefiler. **Skal aldri endres.** |
| `.firecrawl/` | Parsede kildedokumenter — input til rag-corpus |
| `research/` | 26 rapporter og dypdykk, dels PDF |
| `processed/` | Bearbeidet data. Se advarsel under |
| `plans/` | Arbeidsplaner og UAT-notater — ikke fagkunnskap |
| `specs/` | Tekniske spesifikasjoner — ikke fagkunnskap |
| `archive/` | Historikk. **Aldri fagkunnskap.** |

### Advarsel om `processed/rules/`

Denne mappa inneholder **utdaterte kopier** av MORAD-filene:
`morad-checkpoints.json`, `morad-fault-drill-mapping.json`,
`sg-to-morad-faults.json`, `morad-ordbok-v2.json`.

De er ikke oppdatert med sammenslåingen 31. juli og speiler ikke fasiten.
Historisk brukt som mellomlager for kopiering inn i appen. **Ikke les dem.**
Fasiten er `knowledge/`.

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
| Manuell kopi | `processed/rules/` | `src/lib/domain/rules/` | **Nei** |
| Embedding | `rag-corpus/` | `knowledge_chunks` i Supabase (pgvector) | **Nei** — eget seed-skript |

Sync-skriptet er `scripts/sync-masterbrain.ts` i akgolf-hq. Sti overstyres med
`MASTERBRAIN_PATH`, ellers antas søsken-mappa `../masterbrain`.

**Konsekvens å være klar over:** `src/lib/domain/rules/` i appen er en manuell
kopi som ikke synkes. Den kan drifte fra fasiten. Etter endringer her må
rag-corpus også embeddes på nytt for at agentene skal se dem.

Appen speiler i tillegg enkelte CANON-regler manuelt i TypeScript
(f.eks. `src/lib/workbench/canon-period-adjustment.ts`). Endres `knowledge/`,
må speilene oppdateres for hånd.

---

## Kjente hull — si ifra, ikke dikt

Dette mangler bevisst. En agent som treffer et av disse skal si at kunnskapen
ikke finnes ennå.

| # | Hull | Konsekvens |
|---|---|---|
| 1 | **Drill-banken er tom** | Ingen drill kan foreskrives. Beskriv hva som bør trenes, ikke hvilken drill |
| 2 | **Putting har ingen kunnskapskilde** | `sg_to_morad_faults.putt` er tom. Det er *korrekt* — MORAD er et posisjonssystem for fullsving og dekker ikke putting. Men putting er ~40 % av slagene og mangler sitt eget rammeverk |
| 3 | **Tidsdimensjon — delvis fylt** | `knowledge/concepts/mikroperiodisering-og-tidsdimensjon.json`. Øktantall, volumfordeling og fasilitetsregler er fasit |
| 4 | **Mikroperiodisering — delvis fylt** | Samme fil: 4-ukers build/peak/deload/test-syklus er fasit. Ingen dag-for-dag fordeling innad i uken finnes ennå |
| 5 | **Turneringsforberedelse er 35 ord** | Ingen nedtelling, ingen taper, ingen etterrestitusjon |
| 6 | **`RECOVERY_ADD` / `DELOAD` er stubs** | Belastning kan ikke handles på |
| 7 | **Ingen livskontekst** | Skole, reise og norsk vinter finnes ikke i modellen |
| 8 | **Ingen banestrategi** | Planen kan trene sving, men ikke score |
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

1. `akgolf-hq/src/lib/domain/rules/morad-ordbok-v2.json` — den levende appfila.
   Ikke rørt, venter på beslutning.
2. `ak-second-brain/wiki/sources/2026-05-18-morad-ordbok-v2.md` — hevder de er to
   ulike personer. Samme pipeline-feil kjørt om igjen, uten belegg.

Hull 1–8 er Fase 2 i planen. Se `~/.claude/plans/legg-til-i-planen-cheerful-nova.md`.

---

## Endringslogg

| Dato | Hva |
|---|---|
| 2026-07-31 | To konkurrerende MORAD-versjoner slått sammen til én fasit. Drill-banken tømt. SG→feil merket som hypotese. `from-akgolf-hq-2026-07-27/` arkivert. Denne fila opprettet |
| 2026-07-27 | MORAD eksportert fra akgolf-hq til `from-akgolf-hq-2026-07-27/` |
| 2026-07-19 | rag-corpus embeddet til `knowledge_chunks`, SG-baselines seedet |
| 2026-07-10 | Mappestruktur ryddet |
