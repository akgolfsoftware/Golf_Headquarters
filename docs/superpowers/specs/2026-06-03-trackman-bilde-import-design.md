# Design: TrackMan bilde-import (vision)

Status: **GODKJENT DESIGN — klar for implementeringsplan.** Opprettet 2026-06-03 via brainstorming.

## Mål
Legge til en tredje import-metode for TrackMan session-data: **last opp et bilde/screenshot
av TrackMan-skjermen**, der Claude vision leser bildet og ekstraherer shot-dataene. Spilleren
bekrefter/retter før lagring. Bygger på den eksisterende TrackMan-import-flyten (CSV + HTML).

## Kontekst (verifisert 2026-06-03)
- Dagens import: `csv-import-modal.tsx` + `html-import-modal.tsx` på `/portal/mal/trackman`,
  med actions `importTrackManCsv` / `importTrackManHtml` → `prisma.trackManSession.create({ rawJson })`.
- `ShotData`-shape (`src/lib/sg-hub/extract-shots.ts`): `shotNumber, clubSpeed, clubPath,
  faceAngle, faceToPath, smashFactor, ballSpeed, totalDistance, tempo?, backswingTime?, downswingTime?`.
- Anthropic SDK (`@anthropic-ai/sdk`) finnes; AI-agenter kaller allerede Claude. Vision
  (bilde-input) er IKKE brukt ennå — dette blir første bruk.
- `ANTHROPIC_API_KEY` er server-side (validert som anbefalt i `src/lib/env.ts`).

## Flyt — 4 steg
1. **Last opp** — ny bilde-import-modal (samme mønster som csv/html-modalene) tar imot ett
   bilde (PNG/JPG). Klient leser fil → base64.
2. **Vision-ekstraksjon** — server action `extractTrackManFromImage(base64, mimeType)` sender
   bildet til Claude vision med en strukturert prompt → returnerer `ShotData[]` + valgfri
   metadata (kølle, modus hvis lesbar).
3. **Bekreft-skjerm** — redigerbar tabell med de ekstraherte radene. Spilleren retter feil.
   Manglende/ulesbare felt vises som «—» (aldri gjettede tall).
4. **Lagre** — bekreftede data går gjennom SAMME lagrings-kjerne som CSV-importen →
   `TrackManSession`.

## Gjenbruk vs nytt
| Del | Status |
|---|---|
| `ShotData`-shape | Gjenbruk (`extract-shots.ts`) |
| `TrackManSession`-lagring | Gjenbruk (`importTrackManCsv`-mønster — del ut felles kjerne hvis nødvendig) |
| Import-modal-mønster | Gjenbruk (csv/html-modal som mal) |
| Vision-ekstraksjon (bilde → ShotData[]) | **NY**: `src/lib/trackman/vision-extract.ts` + server action |
| Bekreft/rett-tabell | **NY**: komponent i trackman-mappen |

## Arkitektur / filer
- `src/lib/trackman/vision-extract.ts` (NY) — `extractTrackManFromImage(base64, mimeType): Promise<ShotData[]>`.
  Kaller Claude vision via eksisterende AI-client. Strukturert prompt + zod-validering av JSON-svaret.
- `src/app/portal/mal/trackman/actions.ts` (ENDRE) — ny `importTrackManBilde`-action som:
  (a) kaller vision-extract, (b) returnerer ShotData[] til bekreft-skjermen (IKKE lagrer ennå).
  Lagring skjer via eksisterende `importTrackManCsv`-kjerne når spilleren bekrefter.
- `src/app/portal/mal/trackman/bilde-import-modal.tsx` (NY) — opplasting + bekreft-tabell (klient).
- `src/app/portal/mal/trackman/page.tsx` (ENDRE) — legg «Importer fra bilde» ved siden av CSV/HTML.

## Vision-kallet (detaljer)
- **Server action** — `ANTHROPIC_API_KEY` aldri eksponert til klient.
- Modell: Claude med vision (samme klient som øvrige agenter).
- Prompt: «Du ser et screenshot av TrackMan session-data. Ekstraher hver shot-rad som JSON med
  feltene: shotNumber, clubSpeed, ballSpeed, smashFactor, clubPath, faceAngle, faceToPath,
  totalDistance (+ tempo hvis synlig). Bruk null for felt du ikke kan lese sikkert. Ikke gjett.»
- Svaret valideres med zod `safeParse` (jf. CLAUDE.md-regel for JSON-blobs). Ugyldig → feil.
- **Bildet lagres ikke** — kun de ekstraherte tallene (personvern + enkelhet).

## Feilhåndtering (ærlig data)
- Ulesbart/feil bilde, vision-feil, eller ugyldig JSON → tydelig feilmelding; spilleren kan
  prøve igjen eller bytte til CSV/HTML.
- Lav konfidens / manglende felt → «—» i bekreft-tabellen, aldri gjettede tall.
- Ingenting lagres uten at spilleren har sett og bekreftet bekreft-skjermen.

## Tier / auth
- `requirePortalUser()` som dagens trackman-rute. Respekter tier-grense for TrackMan-import
  hvis en slik finnes i dagens flyt (sjekk ved implementering — ikke innfør ny gating).

## Testing
- Unit: `vision-extract` med mocket Claude-respons → forventet `ShotData[]` (inkl. null-felt).
- Unit: zod-validering avviser ugyldig JSON.
- Komponent: bekreft-tabell redigering + «—» for manglende felt.
- Lagrings-kjerne delt med CSV verifiseres (samme `TrackManSession`-resultat).

## Scope (YAGNI)
- KUN TrackMan-screenshots. IKKE generisk scorekort-OCR, IKKE golf-runde-foto (separat idé).
- IKKE bilde-lagring. IKKE batch (ett bilde om gangen i v1).
- Bygger på eksisterende TrackMan-import — ingen ny datamodell.
