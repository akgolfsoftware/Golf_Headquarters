# B8 — Train-lock design-pass Player (økt-ark + I dag-workbench)

Status: DELVIS (kjerneflatene portet, men mindre enn full fasit-1:1). Se
«Ikke gjort» før du stoler på noe herfra som ferdig.
Gren: `claude/b8-train-lock-design-c673fb`. PR: [#612](https://github.com/akgolfsoftware/Golf_Headquarters/pull/612).

## Gjort

### 1. Økt-arket — PH-04/05/06 (`src/components/portal/workbench/OktArk.tsx`)

Fullstendig port fra Paper (`T.*`, `Kort`/`Rad`/`CTAPill`/`StatusPill` fra
`@/components/v2`) til Train-lock (`TL.*` fra `@/lib/v2/train-lock`, scene
`#000000`). Alle fire statustilstander spilleren kan se:

- **PUBLISHED** (≈ PH-04) — caps eyebrow, tittel, elevert kort (notater +
  drill-liste med nummererte sirkler), hvit primær-pille «Start økt», tekst-
  knapp «Hopp over».
- **IN_PROGRESS** (≈ PH-05) — samme struktur, primær-pille «Fullfør økt».
  **Ikke portet:** PH-05-fasitens ball-for-ball live-logging (stor timer,
  «Logg ballen» Treff/Kant/Bom, «Logg med Caddie»-mikrofon) — det er ny
  funksjonalitet appen ikke har datamodell for i dag (ingen per-ball-logging
  på `WorkbenchSession`), ikke en design-port av eksisterende data. Ute av
  scope per B8s egen beskrivelse («port, ikke redesign»).
- **COMPLETED** (≈ PH-06) — warm `#B85C3D` + hake, «Økt fullført».
  **Ikke portet:** PH-06-fasitens recap-kort (SG innspill, «I vindu»-tall,
  AI-generert oppsummeringstekst) — samme begrunnelse, ingen datakilde i dag.
- **SKIPPED** — nøytral kort-tilstand (fantes ikke i fasit-settet, beholdt
  eksisterende UX, kun token-bytte).

Fjernet en feilplassert warm hake i header-eyebrowen: original kode viste
haken for `harHake(status)` (PUBLISHED/IN_PROGRESS/COMPLETED — "synlig for
spiller", en coach-visnings-konvensjon fra `wb-visuelt.ts`), som i praksis
viste en fullført-hake på en økt spilleren ikke hadde startet ennå. Det
brøt både layouten (ikonet wrappet til egen linje over eyebrow-teksten) og
CLAUDE.md invariant 2 («Fullført = warm + hake. Ellers aldri»). Nå vises
hake kun når `status === "COMPLETED"`.

### 2. Wb-siderutene (`src/app/portal/(fullscreen)/tren/wb/`)

- `page.tsx` (dagens økter, liste) og `[sessionId]/page.tsx` (wrapper rundt
  `OktArk` + feil-/ikke-funnet-tilstander): samme token-bytte, `TL.scene`
  som sidebakgrunn i stedet for `T.bg`.
- `error.tsx`/`loading.tsx` (begge nivåer) er **ikke** rørt — de bruker
  `V2Feil`, en delt Paper-komponent brukt av error-boundaries i hele appen.
  Å redesigne den er en egen, mye bredere jobb (alle ruter som bruker
  `V2Feil`), ikke en del av B8s fire navngitte skjermer.

### 3. PH-01e — «I dag»-workbench-artefaktet (`WorkbenchIDagArtefakt` i
`src/components/portal/v2/chat/PortalChatHjem.tsx`)

Dette var den klareste CLAUDE.md-invariant-2-bryteren før denne PR-en: filen
importerte BÅDE `T` og `TL`, og `GodkjenningKort` (godkjenn/avvis-kortet) var
allerede portet til TL mens wrapperen rundt (`WorkbenchIDagArtefakt` selv)
fortsatt brukte `T.*` og delte `Kort`/`Rad`-komponenter — to designspråk i
samme skjerm. Nå er hele artefaktet TL:

- **Feil/offline** (≈ PH-01e4) — caps «Ingen forbindelse» i `TL.danger`,
  feilteksten fra `loadPlayerDay`.
- **Hvile** (≈ PH-01e2) — nøytralt kort med `WB_UI.playerNoSessions`-teksten.
  Fasitens «Start egen økt»/«Åpne plan»-knapper og oppmøte-kalenderen er
  **ikke** bygget — de krever ny funksjonalitet (spiller-initiert økt,
  månedsoppmøte-visning) appen ikke har.
- **Pågår** (≈ PH-01e3) — live-prikk + `TL.warm` caps «PÅGÅR», tittel, meta,
  hvit primær-pille «Fortsett» som lenker til økt-arket. Fasitens store
  live-tall/telling/progressbar er samme scope-avgrensning som over.
- **Publisert-listen** (default) — egne TL-rader (byttet ut delte
  `Kort`/`Rad`-primitiver som fortsatt er Paper) med tid, tittel,
  pyramide-område, varighet, og hake for synlige statuser.

Fjernet nå-ubrukt import av `Kort`/`Rad` (`@/components/v2/core`).

## Ikke gjort / bevisst utenfor scope

- **Ball-for-ball live-logging og SG-/recap-data** (PH-05/PH-06s rikeste
  innhold) — ny funksjonalitet, ikke portering. Se punkt 1.
- **«Start egen økt» / oppmøtekalender** i hvile-tilstanden (PH-01e2) —
  samme grunn.
- **iPad/Mac-variantene** (`PH-01e5`, `PH-01e6`, `B2 PH-04/05 iPad Mac`,
  `B4 Lys iPad Mac`) — ikke separat testet. Layouten er responsiv (samme
  460px maks-bredde-mønster som resten av porten) og skalerer ned pent på
  1280px i skjermbilde-gaten, men ingen dedikert iPad-splitt er bygget.
- **`error.tsx`/`loading.tsx`** for wb-rutene — delt `V2Feil`, egen jobb.
- Full pixel-for-pixel-matching mot fasit-HTML-ene (statusbar, dynamic
  island, hjemme-indikator-elementer) — CLAUDE.md sier eksplisitt «port
  oppførsel, hierarki, copy … Port HTML 1:1: nei».

## Skjermbilde-gate

Seedet tre midlertidige `WorkbenchSession`-rader for `screentest@akgolf.test`
(PUBLISHED/IN_PROGRESS/COMPLETED, id-prefiks `b8shot…`, hver med 3 drills) via
et engangs-skript kjørt og deretter slettet fra `scripts/` (dataene ligger
fortsatt i databasen, samme mønster som `seed-b6-godkjenning.ts`).

Verifisert i kjørende dev-server, innlogget som spiller:

- **390px, mørk** — PUBLISHED, IN_PROGRESS, COMPLETED økt-ark: alle riktige
  (caps-eyebrow, tittel, drill-liste, primær-pille, warm hake kun på
  COMPLETED).
- **1280px, mørk** — PUBLISHED økt-ark: layout holder seg innenfor
  460px-kolonnen, skalerer ned pent, ingen strekking.
- **1280px, lys** — PUBLISHED økt-ark: scene/kort/CTA snur riktig (hvit
  scene, mørk tekst, svart primær-CTA).
- **«I dag» (`/portal`), 1280px, lys og mørk** — PH-01e «pågår»-tilstanden
  (live-prikk, caps PÅGÅR, «Fortsett»-pille): riktig i begge temaer.

Skjermbilder delt i samtalen (ikke lagret som filer i repoet).

## Verifikasjon

```
npm run verify
```
Grønt: `prisma validate` + `prisma generate` + `tsc --noEmit` + `eslint` +
`check-action-auth` + `check-token-gap` + `check-critical-imports` + full
`next build` (520 statiske/dynamiske ruter, service worker generert).

Merk: worktreen manglet `node_modules` ved oppstart (ikke en kodefeil —
`npm ci` løste det, jf. `worktree-build-krever-npm-ci` i gotchas.md).

## Neste

- Anders må SE skjermbildene (skjermbilde-gate, CLAUDE.md) før merge —
  PR [#612](https://github.com/akgolfsoftware/Golf_Headquarters/pull/612)
  venter på eksplisitt «ja» (invariant 7).
- Hvis ball-for-ball-logging / SG-recap skal bygges: egen sesjon, krever
  datamodell-utvidelse (per-ball-resultat på `WorkbenchSession`/`WorkbenchDrill`),
  ikke en design-oppgave.
- iPad/Mac-variantene av PH-01e/PH-04/PH-05 kan porte i samme mønster som
  T4 (Stall) gjorde for AgencyOS, hvis Anders vil ha dem dekket separat.
