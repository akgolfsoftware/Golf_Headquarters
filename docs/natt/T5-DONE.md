# T5 — Workbench-designpass til Train-lock (audit + verifikasjon)

Session T5 fra `LAUNCH-PLAN-FULL-2026-08-25.md`. Speiler B8 (spiller), men rører kun
agency-/admin-flatene: `/admin/workbench/[playerId]` (uke/økt/drill/publish).

## Funn: skjermen var allerede Train-lock-portet

Oppdraget var å porte `/admin/workbench/[playerId]` til Train-lock. En full gjennomgang av
hele modulen viste at dette **allerede var gjort** i tre tidligere sesjoner, og til høy
standard:

- **D3 — Workbench uke (Mac) portet til Train-lock** (#589): la grunnmuren —
  `wb-tl-scope.ts` (`TL_SCOPE`), direkte `TL.*`-bruk i `WeekGrid.tsx` for geometri
  (`TL.radius.row`, `TL.skall.kilder/artefakt`, `TL.dock/hair/draftBorder/text`), og
  `WorkbenchUke.tsx` som setter `TL_SCOPE` på skjermens rot.
- **B5 — kilder, drag, serie** (#601): `SourcesPanel.tsx`, drag-drop (`wb-drag.ts`), serie-
  opprettelse i `CreateSessionModal.tsx` — bygget oppå samme mønster.
- **B6 — godta/avvis + ikke delta** (#604): godkjenningsfelter i `SessionInspector.tsx`
  (`needsPlayerApproval`, `hiddenByPlayer`) og status-badge i `WeekGrid.tsx`.

### Mekanismen (hvorfor `T.*` og `TL.*` begge forekommer uten å bryte regelen)

`src/lib/v2/tokens.ts` sin `T`-eksport er ikke en fargepalett i seg selv — hvert felt er en
`var(--v2-*)`/`var(--p-*)`-referanse. `wb-tl-scope.ts` (`TL_SCOPE`) skygger disse CSS-variablene
på skjermens rot-`<div>` i `page.tsx` (hele skjermen, rail inkludert) til de tilsvarende
`--tl-*`-variablene. Alle etterkommere som bruker `T.panel`, `T.fg`, `T.border` osv. — også
delte v2-primitiver (`Inspektorpanel`, `TimeGrid`, `BunnArk`, `Knapp`, shadcn `Dialog`/`Input`/
`Select`) — arver dermed Train-lock-fargene uten at hver fil trenger å skrive om til `TL.*`
direkte. Ny markup (geometri, radius, kolonnebredder) bruker `TL.*` direkte der `T` sine
hardkodede JS-tall (`T.rCard = 12`) ikke kan skygges via CSS. Dette er dokumentert som en bevisst,
kjent grense i `wb-tl-scope.ts` selv og i D3/D2-underlaget — ikke noe denne sesjonen introduserte.
Verifisert: ingen portal i `Dialog` (native, ikke Radix — `position: fixed` men fortsatt barn i
DOM-treet) eller `BunnArk`, så CSS-variabel-kaskaden brytes aldri av en dialog som portalerer ut
av det skyggede treet.

### Filer gjennomgått (alle bekreftet TL-kompatible via kaskaden over)

`WorkbenchUke.tsx` · `WeekGrid.tsx` · `SessionInspector.tsx` · `SourcesPanel.tsx` ·
`DrillListEditor.tsx` · `CreateSessionModal.tsx` · `PublishConfirmDialog.tsx` ·
`WorkbenchFeil.tsx` · `wb-visuelt.ts` (WARM → `--tl-warm`) · `app/admin/workbench/[playerId]/page.tsx`.

Ingen hardkodede hex-farger, ingen `className="dark"`, ingen gjenværende Paper-spesifikke
klasser (`golfdata-scope` osv.) funnet i modulen. Lys/mørk verifisert token-for-token: alle
`--tl-*`-variabler brukt i modulen (`--tl-fill`, `--tl-warm`, `--tl-text`, `--tl-dock`,
`--tl-hair`, `--tl-draft-border`, `--tl-artefakt`, `--tl-kilder`) er definert i begge blokker i
`src/styles/train-lock-tokens.css` (unntak: `--tl-artefakt`/`--tl-kilder` er layoutbredder,
definert én gang og delt mellom modus — riktig, de skal ikke variere med tema).

### Ett-hvit-CTA-regelen

Bekreftet: `Knapp` (standard, ikke `ghost`) og `Knapp enTing` peker begge til
`var(--tl-fill)`/`var(--tl-on-fill)` via `--v2-cta`/`--v2-handling`. Innenfor uke-skjermen er
«Publiser» (topplinje, `enTing`) den eneste fylte CTA-en synlig samtidig med resten av skjermen;
«+ Ny økt» er bevisst `ghost` (kommentar i `Topplinje` i `WorkbenchUke.tsx`). Modalenes egne
primærknapper («Opprett», «Publiser» i bekreftelsesdialogen, «Lagre» i drill-skjemaet) er hver
sin egen ramme (dialog), ikke i konkurranse med topplinjens CTA.

## Hva denne sesjonen faktisk gjorde

- Full auditt av alle 10 filene i `src/components/workbench/` + siden i
  `src/app/admin/workbench/[playerId]/` mot `designsystem/train-lock/DESIGN-SYSTEM.md`,
  `SCREEN-INDEX.md` og `HANDOFF.md` (A-01-familien, WB-01–03).
- Bekreftet `npx tsc --noEmit` grønn, `npx eslint src/components/workbench src/app/admin/workbench`
  grønn, og `npx tsx --test src/lib/domain/workbench/operations.test.ts` grønn (28/28).
- **Ingen kodeendringer var nødvendige** — skjermen var allerede i samsvar med Train-lock-fasiten.
- Rørte ikke `/admin/spillere/[id]/workbench` (gammel datamodell) — urørt, pensjoneres i C1
  som planlagt.

## Kjent, ikke-blokkerende gap

- **A-01d4 «Spiller-forhåndsvisning Mac»** (én av fire A-01d-rammer) er ikke bygget som egen
  visning i `PublishConfirmDialog.tsx` — dialogen har i dag en enkel liste over øktene som
  publiseres + et «i dag»-varsel når en økt publiseres samme dag, men ingen full
  spiller-perspektiv-forhåndsvisning. Dette er en presentasjons-utvidelse (ingen actions/domain-
  endring), men ble vurdert utenfor denne sesjonens omfang gitt at kjernefunksjonen (bekreft →
  publiser, med overlapp-VARSEL) allerede dekker invariant 3 (DRAFT usynlig for spiller) og
  skjermbilde-gatens krav. Flagges for egen liten oppfølgingsøkt om Anders vil ha frame 4.
- Pixel-for-pixel-diff mot de 10 nevnte fasit-filene (A-01, A-01b/c/d, A-12–A-18, WB-01–03) er
  IKKE gjort med skjermbilde-verktøy i denne sesjonen — worktreet mangler DB-tilgang
  (`.env.local` kan aldri kopieres inn, se gotchas.md), så en kjørende server med ekte data kan
  ikke skjermbildes herfra. Skjermbilde-gaten (CLAUDE.md/beslutninger.md) gjelder som normalt:
  Anders må se skjermen på Vercel-previewen (mobil 390px + desktop 1280px, lys + mørk) før merge.

## Verifikasjon

```
npx tsc --noEmit                                                    → 0 feil
npx eslint src/components/workbench src/app/admin/workbench         → 0 feil
npx tsx --test src/lib/domain/workbench/operations.test.ts          → 28 pass, 0 fail
```

`npm run verify` (full pipeline) kjørt etter `npm ci` i worktreet — se PR-sjekken for status.
