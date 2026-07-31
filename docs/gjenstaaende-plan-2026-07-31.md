# Gjenstående — plan per 31.07.2026

Samlet restanse på tvers av begge spor. Skrevet etter tre økter samme dag: designdekningsrevisjon
(formiddag), bølge P3 i Claude Design (ettermiddag) og FØR/UNDER/ETTER-spesifikasjonen (kveld).

**Dekning i designsystemet: 8/223 skjermer · 90/151 komponenter.** Skjermdekning betyr *designet
i Claude Design*, ikke kodet i appen — 0 av 223 er portet til Next.js.

**P7 (craft) er ikke lukket for noe.** Kan kun lukkes av Anders eller en verifikatør mot rendret
side.

---

## Rekkefølgen i én setning

Designsystem-konflikten avgjøres → schema-runden kjøres → Fase 0 (DKIM først) → spor A og B
bygges parallelt. Designsystem-sporet går videre i eget løp, avhengig av beslutning 1.

---

## 1 · Beslutninger som venter på Anders

### 1.1 Designsystem-konflikten — viktigst, blokkerer begge spor

De to sporene sier motsatt ting:

| Spor | Anbefaling |
|---|---|
| Claude Design (`605a48cc`) | Bygger Claude Paper for fullt — 90/151 komponenter ferdig |
| `docs/for-under-etter-spec.md` | IKKE migrer appen til Paper nå. Lån kun oransje-monopolet som ett nytt token `--handling` (#D97757), behold Inter/Familjen Grotesk/JetBrains Mono |

Begrunnelsen i spesifikasjonen: lime er i dag merkevare + signal + status + CTA samtidig, så
regel 1 er ikke håndhevbar. Ett token med monopol på skjermens ene primærhandling løser det uten
en full migrering før piloten.

**Anbefaling: behold begge, men skill dem i tid.** Paper fortsetter som designspor — 90
komponenter er reell verdi som ikke forsvinner. Appen migreres først etter at piloten er
evaluert. Da vinner piloten på tid uten at designarbeidet kastes. Konflikten handler egentlig om
*når*, ikke om *hvilket*.

### 1.2 Schema-runden krever ja

Fire additive endringer i ÉN kirurgisk `prisma db execute` mot `DIRECT_URL`:

- `LydSamtykke` — ny tabell. Hard gate for all lydfangst. Ordlyden lagres som kopi, aldri som
  peker til en tekst som kan endres i ettertid.
- `PlanAction.sjekkpunkt` + `PlanAction.fangstId`
- `TradApning`
- `Group.kind` — uten den har GroupCards tre varianter ingen datakilde

SQL-en er skrevet og ligger klar: `prisma/sql/2026-07-31-schema-runde-sloyfe.sql` på gren
`feature/schema-runde-sloyfe` (commit `f7dda42f`, pushet). **Ikke kjørt mot noen database.**
Alt er additivt og idempotent, så risikoen er lav.

`prisma migrate dev` og `prisma db push` er begge blokkert i dette repoet — se
`.claude/rules/gotchas.md` §Schema-endringer.

### 1.3 Utestående design-beslutninger

- **Wireframe-review** i `kart/wf/` — har ventet siden 30.07.
- **De ni [natt]-beslutningene** og **K2**.
- **`TabSet` (K8):** stryk fra restansen, eller si hva den skal gjøre som `Tabs` + `TabPanel`
  ikke gjør. Stryking senker nevneren fra 151 til 150. Bakgrunn: `Tabs` har allerede roving
  tabindex, `count` per fane og en dokumentert grense mot `SegmentControl` — å bygge TabSet ville
  vært et parallelt system.
- **`ListGroup` styler `.akhq-lrow-item`, som `ListRow` rendrer.** «Style aldri en annen
  komponents element fra egen fil» er bindende, men readme sier også «gruppen eier
  skillelinjene». De to står mot hverandre. Ingen feil oppstår i dag — begge filer er lagret —
  men spenningen bør avgjøres, ellers løses den av den neste som leser bare den ene regelen.

---

## 2 · Kritisk sti før pilot

### 2.1 Personvernerklæringen

Lydopptak av mindreårige er ikke dekket i dag. Med GFGK-juniorer og WANG-elever i piloten kan
dette ikke utsettes til etter pilotstart. Henger sammen med `LydSamtykke` fra schema-runden.

### 2.2 Fase 0-infrastruktur — egen økt

DKIM, Stripe, Google Calendar, push-varsler, og de 31 spillerne uten innlogging.

**Rekkefølgen er en ekte avhengighet, ikke en preferanse:** DKIM blokkerer samtykke, som
blokkerer fangst. Uten e-post som kommer frem, kommer ikke samtykkene inn; uten samtykke kan
ikke lydopptak starte.

---

## 3 · Spor A — FØR/UNDER/ETTER-sløyfen (har klokke)

Spesifikasjon: `docs/for-under-etter-spec.md`, merget til main i #212. Verifisert mot faktisk
kodebase (451 sider, 615 komponenter, 165 modeller), ikke mot briefens antakelser.

- **`CoachingTask` skal IKKE bygges.** `PlanAction` finnes allerede med suggestion, status,
  provenance og riktig indeks. `/admin/queue` har alt en tom «Løst»-kolonne som venter på
  nettopp dette.
- **Fangst mister data i dag.** `recording-controls.tsx` laster opp lydbiter med rå `fetch` —
  ingen kø, ingen lokal lagring. Mistet dekning på rangen = mistet økt. IndexedDB-kø er
  spesifisert.
- **`GOLF_PROMPT` i `transcribe.ts` har null AK/MORAD-terminologi** — kun engelske generiske
  golftermer. Whisper har aldri hatt sjanse på P6, CS60, L-BALL. Strengendring, stor effekt.
- **Hard server-gating på `LydSamtykke`** — eneste bevisste unntak fra invariant 1
  («anbefalinger sperrer aldri»). Samtykke er ikke en anbefaling.

## 4 · Spor B — Spillere-flaten (parallelt)

Anders besluttet 31.07 at Spillere går parallelt med sløyfen, ikke etter. **Ved kollisjon vinner
piloten.**

- Krever `Group.kind` fra schema-runden.
- **`VisningsVelger` finnes allerede**, men er låst til kalendertyper. Den skal generaliseres,
  ikke bygges på nytt.

---

## 5 · Designsystem-sporet videre

Avhenger av beslutning 1.1.

### 5.1 Først: kompiler bundelen

**Må gjøres inne i Claude Design-appen** — `check_design_system` finnes ikke fra Claude Code.
Verifisert 31.07: en filskriving regenererer ikke `_ds_bundle.js` (etag uendret). Til dette er
gjort rendrer de fem nye P3-komponentene ingenting i Claude Design.

Etter kompilering, mål på nytt mot fersk bundel:

| Kort | Forvent |
|---|---|
| `components/forms/forms-p2.card.html` | 17/17 |
| `components/data/datatable.card.html` | 14/14 |
| `components/layout/struktur-p3.card.html` | 23/23 |

Avviker noe: rapporter tallet, ikke forventningen.

### 5.2 Deretter: registrer de fem nye komponentene

1. `readme.md` under **Komponenter** — `DataTable` i `components/data/`, og `FilterPills` +
   `Pagination` + `Stepper` + `KanbanKolonne` i `components/layout/`.
2. Regenerer `guidelines/klasseinventar.md` fra fersk bundel.
3. Legg de fem container-tersklene inn i `guidelines/terskelrigg.html` — `akhq-dt` 560 px,
   `akhq-fpill` 420, `akhq-pag` 380, `akhq-step` 520, `akhq-kan` 320. De er i dag **dokumentert,
   ikke assertert**.

### 5.3 Så: 61 komponenter og 215 skjermer

Neste ublokkerte leveranse er **hi-fi 10 — liste+detalj-malen**. Den dekker ~30 PlayerHQ-ruter
og er første skjerm som kan bruke `DataTable`.

**Om portering til kode:** de tre tallene er ikke det samme.

| | Status |
|---|---|
| Komponenter i designsystemet | 90 av 151 |
| Skjermer designet i Claude Design | 8 av 223 |
| Skjermer kodet inn i appen | 0 av 223 — ikke påbegynt |

Porteringen kan gjøres av en annen modell (Kimi, Grok) når 30–50 skjermer er ferdig designet —
hver komponent har `.jsx`, `.d.ts` og `.prompt.md` med bindende regler, altså en presis oppskrift
og ikke et bilde noen må tolke. Det som ikke bør settes bort er selve designsystemet, der jobben
like mye er å skrive presise regler og falsifiserbare målinger.

---

## 6 · Urørt med hensikt

`TimeGrid` (referanseimplementasjonen), de 47 foreldreløse komponentene, og
`BarnProgresjonKort` / `DeltakerListe` / `FokusSpillerBlokk` — de tre siste er uavklart hos eier.
