# Drill-bibliotek-utvidelse 2026-05-21

**Branch:** `feature/drill-bibliotek-utvidelse-2026-05-21`
**Status:** Klar for review + merge

## Sammendrag

| Fokus | Nye drills | Sub-kategorier dekket |
|---|---:|---|
| PUTTING | 131 | short-range/medium-range/lag-putt, stroke-mekanikk, MTQ, AimPoint, distance-control, pre-shot-routine, wet/fast |
| NÆRSPILL (AROUND_GREEN) | 124 | chip (43), pitch (36), bunker (31), lob, bump-and-run, from-rough, scenario, tucked-pin, wet, lies |
| WEDGER (TILNAERMING) | 155 | distance-control, trajectory (low/med/high), spin-control, partial-swing, 50/75/100-yard, wedge-fitting, vokey-grind |
| APPROACH (TILNAERMING) | 125 | kort-jern, mellom-jern, lang-jern (elite-tung), hybrid, fairway-wood, ball-flight-law, MORAD DISC 4/6/7 |
| DRIVER (TEE_TOTAL) | 114 | shot-shape (draw/fade), scenario (wind/trouble-tee/dog-leg/elevated), MORAD-momentum, pressure-tee-shot, swing-path |
| **TOTAL NYE** | **649** | |

**Bibliotek-vekst:** 138 → 787 drills (≈5,7x).

## Kilder

Hoveddel mined fra:
- `~/Developer/ak-second-brain/wiki/concepts/morad-drill-bibliotek.md`
- `~/Developer/ak-second-brain/wiki/sources/2026-05-11-morad-kb-drills.md`
- `~/Developer/ak-second-brain/wiki/sources/2026-05-18-morad-kb-drills.md`
- `~/Developer/ak-second-brain/wiki/sources/short-game-wet-conditions.md`
- `~/Developer/ak-second-brain/wiki/sources/putting-1-300ft-metodikk.md`
- `~/Developer/ak-second-brain/wiki/sources/2026-01-29-morad-fault-drill-mapping.md`
- `~/Developer/ak-second-brain/wiki/sources/2026-01-29-morad-knowledge-base-v1.md`
- `~/Developer/ak-second-brain/wiki/concepts/ak-golf-treningsfilosofi.md`

Supplert med etablert offentlig metodikk:
- Phil Kenyon (putting)
- Brad Faxon (putting-feel)
- AimPoint Express (green-reading)
- Dave Pelz (Short Game Bible)
- Seve Ballesteros (Natural Golf)
- Bob Vokey (wedge-fitting)
- Mac O'Grady DISC 1-7 (MORAD swing-system)
- Hogan, Bobby Jones (reference-swings)
- DECADE Golf (course-management)

## Fordeling i database (alle 787 drills)

### Per disiplin
- TEK: 275
- SLAG: 372
- SPILL: 44
- TURN: 34
- FYS: 25

### Per skillArea
- PUTTING: 141
- AROUND_GREEN: 106
- TEE_TOTAL: 157
- TILNAERMING: 297
- SPILL: 26
- (null/legacy): 23

### Per NGF-kategori (minKategori)
- A: 1 · C: 17 · D: 8 · E: 42 · F: 80
- G: 227 (default-nivå)
- H: 80 · I: 39 · J: 59 · K: 32 · L: 179

**Bredde:** Drills dekker hele spekteret fra junior-nybegynner (L, HCP 54) til elite-profesjonell (A, OWGR Top 150).

## Filer

| Fil | Type | Innhold |
|---|---|---|
| `prisma/seed-data/drills-expansion/putting.json` | NY | 131 putting-drills |
| `prisma/seed-data/drills-expansion/naerspill.json` | NY | 124 short-game-drills |
| `prisma/seed-data/drills-expansion/wedger.json` | NY | 155 wedge-drills |
| `prisma/seed-data/drills-expansion/approach.json` | NY | 125 approach-drills |
| `prisma/seed-data/drills-expansion/driver.json` | NY | 114 driver-drills |
| `prisma/seed-drills-expansion.ts` | NY | Idempotent seed-script |
| `docs/drill-expansion-2026-05-21.md` | NY | Dette dokumentet |

Ingen schema-endringer — bruker eksisterende `tags[]`-felt for sub-kategorisering.

## Verifikasjon

- [x] JSON-parse-test alle 5 filer
- [x] 0 duplikater på tvers av expansion-filer
- [x] 0 duplikater mot eksisterende 138 drills i drills-raw.json
- [x] Idempotent seed-script (upsert basert på navn)
- [x] 787 drills i Supabase-databasen etter seeding
- [ ] Manuell review via `/admin/drills` (gjøres av Anders før merge)
- [ ] AI-mal-bygger test med ny bredde (gjøres av Anders før merge)
- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npm run build` — fullfører

## Neste steg

1. Anders går gjennom `/admin/drills` lokalt og spot-sjekker tilfeldige drills per fokus-område
2. Anders tester AI-mal-bygger på `/portal/mal/bygger` med spillerprofil A-D for å verifisere at nye elite-drills brukes
3. Når Anders gir grønt lys: merge `feature/drill-bibliotek-utvidelse-2026-05-21` til main → Vercel deployer

## Kjente begrensninger

- `videoUrl: null` for alle nye drills. Video-mapping er Fase B (egen jobb).
- 23 legacy-drills uten `skillArea` (fra første mining-runde) — kan oppdateres manuelt om ønskelig.
- MORAD-merkede drills (`morad: true`) har sporbar `kilde`-referanse til DISC, men ikke video-timecode ennå.
