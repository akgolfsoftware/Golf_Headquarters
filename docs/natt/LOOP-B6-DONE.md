# LOOP-B6 — Godta/avvis + «ikke delta» (DONE)

Session B6 fra `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` (kalt «Loop 3T» i den
opprinnelige natt-planen). Gren `claude/wb-b6-godkjenning`, worktree
`agent-aef2476e9ff0546aa`, fra `origin/main` (HEAD ved start: `8b6e44c5`,
T1 AX-01-skall). Scope: `resolvePlayerApproval` ekte (ikke stub),
`hiddenByPlayer` additiv DDL + filter, UI spiller (Godta/Avvis) og
agency-visning (status/markering), aldri `#30D158` utenom selve
Godta-handlingen.

## Domain (pure) — `src/lib/domain/workbench/`

- **`types.ts`** — nytt felt `hiddenByPlayer?: boolean` på `WorkbenchSession`.
  Skjuler økten for spilleren, sletter aldri (samme mekanikk som «Ikke delta»
  i Train-lock-fasiten `WB-10 Ikke delta.dc.html`).
- **`schemas.ts`** — `PlayerApprovalDecisionSchema` (`ACCEPTED`/`REJECTED`),
  `ResolvePlayerApprovalInputSchema`.
- **`operations.ts`** — `resolvePlayerApproval(session, decision, now)`: ren
  funksjon. `ACCEPTED` rydder kun `needsPlayerApproval`/`approvalStatus`.
  `REJECTED` setter i tillegg `hiddenByPlayer: true`. Innhold, eierskap,
  dato/tid er alltid urørt.
- **`operations.test.ts`** — 3 nye tester (ACCEPTED rydder flagg og lar
  resten stå; REJECTED skjuler uten å slette; REJECTED på en allerede skjult
  økt er idempotent). `npx tsx --test` → **28/28** i denne filen.

## Additiv DDL — kjørt mot prod (via Supabase MCP, ikke tsx-skriptet)

`scripts/add-workbench-hidden-by-player-2026-08-26.ts` er skrevet etter
samme mønster som B5 (`add-workbench-series-template-2026-08-26.ts`) —
idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`:

- `hiddenByPlayer boolean NOT NULL DEFAULT false`
- Indeks `(playerId, hiddenByPlayer)`

**Avvik fra B5-mønsteret, dokumentert:** i DENNE worktreen finnes ingen
`.env.local` (verken fil eller symlink) — `npx tsx scripts/add-...ts` feilet
derfor med `database "anderskristiansen" does not exist` (dotenv lastet 0
variabler, adapteren falt tilbake på lokal Postgres). Gotcha-regelen sier
eksplisitt at `.env*` ALDRI skal kopieres inn i en worktree for å omgå dette.
I stedet ble den identiske SQL-en kjørt via **Supabase MCP**
(`mcp__supabase__apply_migration`, prosjektet allerede autorisert i denne
økten) — verifisert FØR kjøring at samme prosjekt har B5s `seriesId`/
`isTemplate`-kolonner (bekrefter riktig prod-DB), og ETTER kjøring med
`information_schema.columns` at `hiddenByPlayer` (`boolean`, default
`false`) faktisk finnes. tsx-skriptet i `scripts/` er beholdt som
**record** for fremtidige kjøringer i en økt som HAR `.env.local` — det er
ikke det som faktisk kjørte denne gangen.

## Server action — `src/lib/workbench/wb-actions.ts`

- **`resolvePlayerApproval(input)`** (erstatter tom-stub fra Loop 1): zod ved
  grensen → `hentMedTilgang` (finnes + generell tilgang) → **IDOR-vern
  utover det**: `treff.viewer.id !== treff.row.playerId` avvises — en coach
  med tilgang til spilleren skal ikke kunne godkjenne på spillerens vegne,
  kun spilleren selv. Avviser også hvis økten ikke faktisk venter
  (`needsPlayerApproval` false). Kaller domenefunksjonen, skriver
  `approvalStatus`/`needsPlayerApproval`/`hiddenByPlayer`, returnerer via
  `lagreOgHent` (samme revalidate-mønster som resten av filen).
- **`loadPlayerDay`** — Prisma-where fikk `hiddenByPlayer: false` (spilleren
  ser aldri en skjult økt i «I dag»); `PlayerDaySession` fikk
  `origin`/`needsPlayerApproval`/`approvalStatus` slik at UI kan skille
  «venter på deg» fra resten. «Neste økt»-beregningen hopper nå over
  pending-godkjenning-økter (kan ikke startes før spilleren har svart).
- **`loadWeek`** — filtrerer `hiddenByPlayer: false` KUN når den innloggede
  er spilleren selv (`viewer.id === playerId`). Coach/admin ser fortsatt
  skjulte økter i Agency-uka, markert (se WeekGrid under) — gruppens/
  coachens plan er uendret av at spilleren skjuler sin kopi.

## Mapping — `src/lib/workbench/wb-map.ts`

`mapSession` leser `row.hiddenByPlayer` inn i domenetypen.

## UI spiller — «I dag» (`PortalChatHjem.tsx`, WB-10-mønster)

Ny `GodkjenningKort`-komponent: warm prikk + «Forslag fra coach»/«Forslag fra
gruppe» (avhengig av `origin`), tittel/tid/varighet, kort forklaring («skjuler
hos deg, sletter ikke»), to knapper — **Godta** (eneste sted `TL.ok`/
`#30D158` forekommer i hele denne flyten, per invariant 2) og **Avvis**
(nøytral ghost-knapp, ALDRI rød/varm). Kaller `resolvePlayerApproval` direkte
(server action fra klientkomponent), viser lastetilstand per knapp, toast på
resultat, `router.refresh()` ved suksess, optimistisk lokal skjuling
(`besvart`-sett) i mellomtiden. `WorkbenchIDagArtefakt` er restrukturert til
å skille `venterGodkjenning` fra resten av dagens økter — godkjenningskort
vises ALLTID øverst, uavhengig av om resten av dagen er tom/pågår/publisert.

## UI agency

- **`SessionInspector.tsx`** — nye lesevisning-linjer i «Om økten»:
  godkjenningsstatus (venter/godtatt/avvist) når satt, og «Skjult hos
  spilleren» når `hiddenByPlayer`. Ren visning — coach handler ikke her,
  kun spilleren svarer.
- **`WeekGrid.tsx`** (`OktKort`) — økter med `hiddenByPlayer` vises med
  `opacity: 0.45` og caps-merkelapp «SKJULT» i stedet for vanlig status
  (WB-10c-mønsteret: gruppen ser Filip som skjult, økten selv er uendret).
  Økter som venter på spillerens svar får merkelappen «VENTER» i stedet for
  status, ingen hake før spilleren har godtatt.
- Nye labels i `src/lib/domain/workbench/labels.ts` (norsk, samlet ett sted,
  ingen hardkodede strenger i domain/komponenter).

## Ikke dekket / bevisste avgrensninger

1. **Ingen trigger-side.** Ingenting i denne leveransen SETTER
   `needsPlayerApproval: true` automatisk — verken en coach som redigerer en
   allerede publisert individ-økt (`integration/player-hq.md` §5), eller
   gruppe-propagasjon med lokal konflikt (§4, «Godta gruppeendring/Behold min
   versjon»). Det krever å instrumentere flere eksisterende mutasjons-actions
   (move/addDrill/updateSeriesSession m.fl.) og full GROUP-materialisering —
   uttrykkelig anti-scope for denne raden («full GROUP-materialisering»,
   `CLAUDE.md`-tabellen). `resolvePlayerApproval` og UI-en virker fullt ut
   når flagget er satt (manuelt/av en fremtidig trigger), men ingen ekte
   flyt produserer flagget ennå — demoer krever fixture-data.
2. Ingen egen "Delta likevel"-handling (WB-10b) for å angre en skjuling —
   `hiddenByPlayer` kan i dag kun settes via `REJECTED`, ikke nullstilles
   igjen fra UI. Domenefeltet og server-writen støtter det trivielt
   (samme mønster som `setSessionTemplate`), men ingen knapp kaller det i
   denne runden — utenfor den eksplisitte oppgavelisten.
3. Ingen egen `/admin`-samleside for pending godkjenninger på tvers av
   spillere (A-09 i fasiten er faktisk et Caddie AI-utkast-skjermbilde, ikke
   en spiller-godkjenningsflate — se vurdering under). Statusen vises der
   coach uansett ser økten (inspektør + ukekort).

## Vurdering av design-fasitene (A-09/WB-10)

`A-09 Mac Filip Godkjenn.dc.html` viser faktisk en **Caddie AI-utkast**-
godkjenning (agent-generert ukeplan, banner med «Godkjenn uke 34»/«Avvis»,
proveniens agent/data/kilde) — et annet system enn spiller-godkjenning av en
coach/gruppe-økt. `WB-10 Ikke delta.dc.html` er derimot presis treff:
`hiddenByPlayer`-mekanikken, tre skjermtilstander (agenda, økt-ark, etter
skjul) og Agency GROUP-inspector-visningen («Filip · SKJULT») er alle 1:1
kilden for hva som er bygget her. UI-en over porter ATFERD og HIERARKI fra
WB-10 (aldri HTML 1:1, jf. `CLAUDE.md` §Design/skjerm), tilpasset til at
denne leveransen bruker COACH-origin («Forslag fra coach»), ikke bare
GROUP-origin som WB-10s eksempel.

## Verifikasjon

| Gate | Resultat |
|---|---|
| `npx tsx --test src/lib/domain/workbench/operations.test.ts` | 28/28 |
| `npx tsc --noEmit` | grønt, 0 feil |
| `npx eslint --quiet` (berørte filer) | grønt |
| `npm test` | **1649/1649**, 189 suiter, 0 feil |
| `npm run verify` (full pipeline) | **IKKE fullført i denne worktreen** — se under |

**`npm run verify`/`npm run build` kunne ikke fullføres i denne worktreen —
miljøbegrensning, ikke en feil i denne leveransen.** Worktreen mangler en
egen `node_modules`-mappe (bekreftet: `ls node_modules` → «No such file or
directory»). `tsc`/`eslint`/`prisma`/`npm test` fungerer likevel fordi
Node sin modul-oppløsning går via forfedre-mapper og finner hovedrepoets
`node_modules` — men to steg i `verify` bruker en EKSPLISITT sti
(`path.join(process.cwd(), "node_modules", ...)`) i stedet for
`require`/`import`, og feiler derfor uansett ansestor-oppløsning:
`check-critical-imports.mjs` (kaller esbuild-binæren direkte) og
`next build`/Turbopack (`next/package.json` ikke oppløselig fra
prosjektmappen). Samme klasse feil som er dokumentert i
`.claude/rules/gotchas.md` («Aldri kopier .env* inn i en worktree» +
«worktree-build-krever-npm-ci»: løsningen der er `npm ci` i worktreen, som
ikke ble kjørt her — stor, tidkrevende operasjon utenfor denne oppgavens
scope). CI (`ci.yml`, egne secrets, egen `npm ci`) kjører full `verify` på
PR-en og er derfor den reelle build-gaten for denne leveransen, akkurat som
notert som presedens i `docs/feillogg.md`/tidligere B-rader for tilsvarende
miljøbegrensninger.

## Ikke verifisert visuelt — krever Anders' skjermbilde-gate

**Ingen skjermbilder er tatt av denne leveransen.** Denne økten har ikke
kjørende dev-server/browser-tilgang mot en innlogget testbruker (samme
begrunnelse som B5 og tidligere B-rader: Claude skriver aldri Anders'
passord, og en fungerende preview krever ekte innlogging). Følgende er derfor
IKKE bekreftet mot faktisk rendret skjerm, kun mot kode + typer:

- `GodkjenningKort` i «I dag» (spiller) — mobil 390px + desktop, lys + mørk.
- Status-/skjult-markering i `SessionInspector` og `WeekGrid` (agency) —
  mobil + desktop, lys + mørk.

Preview-lenken fra PR-en er veien til faktisk å se flyten — skjermbilde-gaten
(`CLAUDE.md`/`beslutninger.md`, 04.08.2026) krever at Anders har SETT
skjermen før merge; ingenting over erstatter det kravet.
