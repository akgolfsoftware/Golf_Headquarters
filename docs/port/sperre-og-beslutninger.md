# Sperre-opprydding — Claude Paper → kode

**Skrevet:** 2026-08-04 · **Status:** LÅST (opprydding etter sperre-audit)  
**Erstatter:** ad-hoc tolkning av «pilot vs Paper» og uklare C-kommandoer.

Denne fila er den **operative låsen** for det som tidligere sperret designporten.
Produktregler ligger fortsatt i `docs/platform/BUSINESS-RULES.md`.
Prosess/design-beslutninger i `.claude/rules/beslutninger.md` peker hit for detalj.

---

## 1. Én design-sannhet (låst)

| Lag | Sannhet | Ikke |
|---|---|---|
| **Visuell + IA fasit** | `designsystem/paper/fase1/*.html` | Gamle v2-mockups, «Presis»-skjermer |
| **Tokens kilde** | `designsystem/paper/tokens/akhq-tokens.css` | Oppfinnelse av tredje token-fil |
| **Runtime-alias i app** | `src/styles/paper-tokens.css` (`--p-*` speil av akhq) | Egen fargepalett ved siden av |
| **Chrome (rail/shell)** | `src/components/v2/shell.tsx` inntil Paper-shell portes per flate | Ny parallell shell «ved siden av» |
| **Paper JSX-komponenter** | Referanse i `designsystem/paper/components/*` | Påkrevd import i app (ingen barrel ennå) |

**Pilot-unntaket er OPPHEVET for designport-arbeid.**  
`CLAUDE.md` / `START-HER.md` skal ikke tolkes som «bare v2 + oransje».  
Når du porter en skjerm: **Paper 1:1** (layout, IA, «Én ting nå», tokens) — se  
`docs/port/plan-designport-alle-skjermer.md` §Ferdig-definisjon.

**Inventar-filen «Analyse - mockup mot kodebase.html» FINNES IKKE.**  
Bruk i stedet: `docs/port/fasit-liste-paper.md` + fase1-HTML.

**Adherence-lint (`_adherence.oxlintrc.json`) FINNES IKKE.**  
Gate = menneskelig skjermbilde-godkjenning (beslutninger.md), ikke oxlint.

---

## 2. Konsoll-kommandoer — P0 vs KOMMER

Fasit hadde **ulike** slash-sett desktop vs mobil. Låst felles sett:

### P0 — kan bygges på eksisterende data (nå)

| Kommando | Hensikt | Backend i dag |
|---|---|---|
| `/plan` | Lag/åpne treningsplan | Workbench + plan-modeller |
| `/spiller` | Åpne spiller | `/admin/spillere` |
| `/kalender` | Kalender/bookinger | AgencyOS kalender |
| `/godkjenn` | Godkjenningskø | AgenticOS / godkjenninger |
| `/fangst` | Rå observasjon | Fangst-flyt (finnes delvis) |
| `/analyser` | Analyseløp | Analyse-ruter |
| `/sg` | SG-status (read) | Eksisterende SG-data |
| `/booking` | Booking-flate | Booking-moduler |
| `/traad` | **Deep-link** til teknisk plan | Se §3 — ikke egen writer |

### KOMMER — ikke implementer uten modellbeslutning + egen epic

| Kommando | Mangler i Prisma / plattform |
|---|---|
| `/faktura` | Ingen `Invoice`/`Faktura`-modell (kun Stripe `Payment.stripeInvoiceId`) |
| Timeliste / ansatt-timer | Ingen `TimeEntry` / `Employee` |
| Politiattest + utløp | Ingen modell |
| Økonomi per selskap (resultat/budsjett) | Ingen regnskapsmodell; `weeklySessionBudget` = treningsvolum |
| Varelager | Ingen modell |
| `ak-brain` som øvelseskilde i konsoll | Eksternt kunnskapsrom, ikke in-repo API |
| Strukturert LIFE som DB-enum | `LIFE_KODER` finnes i `src/lib/taxonomy.ts`; Prisma har bare `LPhase` |

**Kodeordens sperre står:**  
`designsystem/paper/guidelines/kodeordre-agencyos.md` — ikke bygg backend-tunge  
konsoll-kommandoer før datamodell er besluttet.

I fasit-HTML skal KOMMER-kommandoer merkes `(kommer)` slik at agenter ikke «finner opp» API.

---

## 3. Eierskap: teknisk plan / P-posisjoner / `/traad`

| Rolle | Eier | Adresse |
|---|---|---|
| **Writer (kanon)** | PlayerHQ plan-workbench | `/portal/planlegge/workbench?tab=tek` (redirect fra `/portal/tren/teknisk-plan`) |
| **Coach-writer (samme data)** | AgencyOS admin teknisk plan | `AdminTekniskPlanV2` / admin teknisk-plan-rute |
| **Data** | Prisma `TechnicalPlan` + `TechnicalPlanPosition` + `PositionTask` | én modell, to UI |
| **Konsoll `/traad`** | **Read / deep-link only** | Åpner kanonisk teknisk plan for valgt spiller — ingen tredje writer |

`/traad` i konsoll = navigasjon, ikke ny tråd-motor.

---

## 4. GroupSchedule ↔ SessionParticipant

Begge modellene finnes, men **har ikke FK til hverandre**.

- `GroupSchedule` = gruppetimeplan / busy-kilde  
- `SessionParticipant` → `TrainingSessionV2` + `User`  

**Oppmøte-per-gruppetime er ikke «gratis» via schema.**  
Ikke anta kobling i konsoll/cockpit uten egen modellbeslutning.

---

## 5. Hva agenter skal gjøre / ikke gjøre

**Gjør**
- Port skjerm mot `designsystem/paper/fase1/<fasit>.html` 1:1.
- Bruk tokens via `--p-*` / Paper-kontrakt; oransje (`--handling` / clay) = **én** primær CTA.
- Marker manglende backend som ærlig tom tilstand eller `(kommer)` — ikke fake data som om API finnes.
- Skjermbilde-gate før merge (mobil 390 + desktop 1280, lys+mørk).

**Ikke**
- Bygg `/faktura`, timeliste, politiattest, varelager «for å matche mockup» uten epic.
- Innfør Presis-farger (`#005840`, `#D1F843`) eller ny token-fil.
- Lag tredje teknisk-plan-writer bak `/traad`.
- Si at `_adherence.oxlintrc` håndhever design — den finnes ikke.

---

## 6. Rekkefølge videre (uendret portplan)

1. Fullfør PlayerHQ steg 7 (PR-A Hjem → … → PR-F) mot fasit.  
2. AgencyOS cockpit/konsoll: **P0-kommandoer + Paper-skall** først.  
3. Datamodell-epic (faktura/timeliste/…) som eget spor — deretter KOMMER-kommandoer.

Levende plan: `docs/port/plan-designport-alle-skjermer.md`.
