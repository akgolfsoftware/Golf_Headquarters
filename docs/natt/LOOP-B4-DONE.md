# LOOP-B4 — Ekte «I dag» leser Workbench-data (DONE)

Session B4 fra `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` §5. Gren
`feat/wb-b4-ekte-i-dag`, fra `release/workbench-b1` (`83283118`). Loop 3
(«I dag ← `loadPlayerDay`») + PH-01e (fire tilstander) + PH-05
(pågår-artefakt).

## Hva som ble bygget

| Fil | Hva |
|---|---|
| `src/lib/workbench/wb-actions.ts` | Trukket ut navngitte typer `PlayerDaySession`/`PlayerDayResult` fra `loadPlayerDay`s inline returtype — gjør typen gjenbrukbar som type-only import i klientkomponenter uten å endre kjøretidsatferd |
| `src/app/portal/page.tsx` | Henter nå `loadPlayerDay({ playerId: user.id, date: iDag })` ved siden av (ikke i stedet for) `getGjennomforeData` — samme Oslo-ISO-mønster (`en-CA`-formatter) som `(fullscreen)/tren/wb/page.tsx`. Sender resultatet videre som ny prop `workbenchDay` til `PortalChatHjem` |
| `src/components/portal/v2/chat/PortalChatHjem.tsx` | Ny komponent `WorkbenchIDagArtefakt` — fire tilstander drevet av `workbenchDay` (se under). Rendres alltid øverst i tråd-kolonnen, uavhengig av chat-historikk/`heltTom`-tilstanden fra den gamle modellen |

## De fire tilstandene (PH-01e)

`WorkbenchIDagArtefakt` i `PortalChatHjem.tsx`:

1. **Feil** (`workbenchDay.ok === false`) — `SamtaleFeil` (gjenbrukt, samme komponent som chat-feil) med serverens feilmelding. `data-od-id="wb-idag-feil"`.
2. **Hvile** (`sessions.length === 0`) — rolig, dashed-border-kort med `WB_UI.playerNoSessions` («Ingen planlagte økter i dag»). Ingen feil-styling. `data-od-id="wb-idag-hvile"`.
3. **Pågår** (finnes en økt med `status === "IN_PROGRESS"`) — PH-05: fremhevet artefakt med `STATUS_CAPS.IN_PROGRESS`, økttittel, starttid + varighet + antall øvelser, og en ink-CTA «Åpne økt-arket» som lenker til `/portal/tren/wb/[id]` (Loop 3S-arket). `data-od-id="wb-idag-pagar"` / `"wb-idag-pagar-lenke"`.
4. **Publisert** (én eller flere økter, ingen `IN_PROGRESS`) — `Kort`/`Rad`-liste (samme mønster som `(fullscreen)/tren/wb/page.tsx`), hver rad lenker til sitt eget økt-ark. Warm hake på synlige statuser via `harHake`. `data-od-id="wb-idag-publisert"`.

Alle fire bruker eksisterende Paper-tokens (`T` fra `@/lib/v2/tokens`) — ingen `#000000`-scene
(det er B8s Train-lock-jobb, eksplisitt anti-scope her).

## DRAFT-invariant

Ingen ny filtrering lagt til i UI. `loadPlayerDay` (uendret i denne PR-en bortsett fra den
navngitte returtypen) filtrerer fortsatt på `SPILLER_SYNLIGE_STATUSER = [PUBLISHED,
IN_PROGRESS, COMPLETED]` server-side (`src/lib/workbench/wb-map.ts`). `PortalChatHjem` leser
kun det ferdigfiltrerte resultatet — ingen egen statuslogikk som kunne lekke DRAFT.

## `getGjennomforeData` — beholdt uendret

Grep bekrefter at `EnTingNaBanner`, `DagensOktInnhold` (i `ArtefaktPanel`), `LoopNav`
(FØR/UNDER/ETTER) og `TomTilstand` fortsatt leser `gjennomfore` (den gamle
`TrainingPlanSession`/`TrainingSessionV2`-modellen) akkurat som før — ingenting av dette er
fjernet eller endret. `WorkbenchIDagArtefakt` er lagt til ved siden av, ikke i stedet for.
Konsekvens: på en dag med både gamle plan-økter og nye Workbench-økter vises begge — det er en
bevisst, midlertidig overlapp (samme mønster som Loop 3S sin `/portal/tren/wb`-liste ved siden
av gjennomfore-fanen), ikke en feil.

## `/portal/tren/wb` — beholdt som fallback

`src/app/portal/(fullscreen)/tren/wb/page.tsx` og `[sessionId]/page.tsx` er urørt. Fortsatt en
gyldig, klikk-testbar vei til samme data uavhengig av `PortalChatHjem`.

## Verifikasjon

| Gate | Resultat |
|---|---|
| `npm run verify` (prisma validate/generate · tsc · eslint · action-auth · token-gap · critical-imports · build) | **grønn**, EXIT 0 |
| `npm test` | **1605/1605**, 179 suiter, 0 feil |

Full output: `/tmp/verify.log`, `/tmp/test.log` (lokal maskin, ikke committet).

**Manuell klikk-test er IKKE utført.** Samme begrunnelse som `LOOP-3S-DONE.md`: krever
innlogging som spiller i en kjørende app, og Claude skriver aldri Anders' passord
(skjermbilde-gaten). `SCREENTEST_PASSWORD` kan ligge i `.env.local`, men den filen er
utilgjengelig for agenten (`beskytt.mjs` nivå 1 — blokkert selv for lesing/grep). Flyten
spiller → «I dag» → (hvile/publisert/pågår/feil) → økt-ark er derfor typesjekket, testet og
bygget, ikke klikket. Anders bør se skjermbilder av alle fire tilstander før denne merges inn
i `release/workbench-b1` — se skjermbilde-gaten i `.claude/rules/beslutninger.md`.

## Avvik fra oppdraget

Ingen kjente avvik. Alle fem punktene i «Konkret oppgave» er implementert:
1. `loadPlayerDay` koblet inn i `page.tsx`, sendt som `workbenchDay`.
2. Fire tilstander bygget i `PortalChatHjem`.
3. PH-05 pågår-artefakt bygget (egen fremhevet blokk, ikke bare CTA-bytte).
4. Alle Workbench-økter i «I dag» lenker til `/portal/tren/wb/[sessionId]`.
5. `/portal/tren/wb` (listen + `[sessionId]`-underruten) urørt.

## Ikke gjort (bevisst, anti-scope)

- Ingen endring i `prisma/schema.prisma`, ingen migrasjon.
- Ingen Train-lock-design (scene `#000000`) — B8.
- Ingen endring i `src/components/workbench/**` eller `src/app/admin/workbench/**` (B3s
  filområde — kun `src/lib/domain/workbench/labels.ts`-mønsteret nevnt i oppdraget er delt,
  og denne sesjonen la ingen nye linjer der siden eksisterende `UI`-nøkler dekket behovet).
- Ingen ny håndhevingslogikk for DRAFT/status — kun lest fra `loadPlayerDay`s eksisterende filter.

## Neste

- B8 (Train-lock design-pass Player) porter PH-01e/PH-05 + `/tren/wb`-flatene til scene
  `#000000` — avhenger av denne PR-en.
- B6 (Loop 3T — godta/avvis) bygger videre på samme `workbenchDay`-datakilde.
- Vurder om `EnTingNaBanner`/gjennomfore-baserte visninger skal fases ut når all trening er
  migrert til Workbench-modellen — ikke del av dette oppdraget, kun observert overlapp.
