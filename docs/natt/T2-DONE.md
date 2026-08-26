# T2 — Cockpit i Train-lock — DONE (26.08.2026)

`/admin/agencyos` (Cockpit) portet til Train-lock. Fasit: `AG-01 Cockpit.dc.html`
(+lys), `AG-02 Cockpit Mac.dc.html`, `AG-14 Cockpit tom.dc.html`,
`AG-15 Cockpit feil.dc.html`. Gren `feat/t2-cockpit-tl`, worktree
`t2-cockpit-tl`. Ikke merget — venter på Anders' «ja» (skjermbilde-gaten, se
under).

## Hva ble bygget

| Fil | Hva |
|---|---|
| `src/lib/agencyos/cockpit-view.ts` | Ren view-modell (ingen Prisma): mapper `CockpitData` + `AiDispatchData` til de tre kortene fasiten viser — `liveNow`, `queue`, `next`. Testbar uten DB. |
| `src/lib/agencyos/cockpit-view.test.ts` | 5 tester (node:test) — tom-tilstand, min-igjen/fremdrift-regning, filtrering av ekte vs. forslags-dispatch-rader, dimming av kø-kort 2+, «neste økt» uavhengig av aktiv økt. |
| `src/components/admin/cockpit/TrainLockCockpit.tsx` | Ny presentasjonskomponent — header («Academy»/«I dag») + Nå-kort + Kø + «{navn} i dag»-kort. Kun `TL`-tokens. `useOnline()`-hook driver AG-15 feil-tilstanden fra `navigator.onLine` (ingen ny data-motor). |
| `src/app/admin/agencyos/page.tsx` | Bytter `KonsollChat` ut med `AgencyCockpitTrainLock`. Fjernet unødvendige kall (`getStallOkterData`, spiller-/gruppe-veksler-queries) — de fôret UI-elementer AG-01 ikke har. |
| `src/app/admin/agencyos/loading.tsx` | Rettet stale kommentar (viste til slettet CockpitV2/KonsollChat-layout). Selve skjelettet (`V2Laster variant="cockpit"`) er urørt — ingen dc.html-fasit for en laster-tilstand ble levert. |

## Design-beslutninger (avvik fra PIXEL, begrunnet)

1. **Composer/Caddie-chat fjernet fra Cockpit.** AG-01 har verken felt eller
   tråd — kun Nå/Kø/neste-økt. `useCaddieChat`-hooken og API-ruta er urørt,
   men har etter denne porten INGEN inngang fra AgencyOS. Flagg til Anders:
   skal Caddie-chatten få et nytt hjem (Jarvis-sporet?), eller er den
   bevisst pauset til videre beskjed?
2. **Kø-kort har ÉN handling («Åpne»), ikke Merge+Åpne.** Fasitens to-knapp-
   mønster (K3) er skrevet for Jarvis' faktiske merge-flyt. Cockpitens kø er
   AI-dispatch-rader (godkjenninger, forespørsler, feilede kjøringer) — ingen
   av dem har en distinkt «merge»-handling atskilt fra å åpne dem. Ett
   ærlig dim-pille-«Åpne» i stedet for en falsk andre knapp (Enkelhet-
   regelen i beslutninger.md).
3. **Kø filtrerer bort byggAiDispatch sine alltid-fyll-til-4-forslagsrader**
   (`agent-team-start`, `agenter-status`, `workbench-plan`) — de er forslag,
   ikke en kø som kan bli tom, og AG-14 krever «Kø · 0» når ingenting
   faktisk venter. `byggAiDispatch` selv er urørt.
4. **Spiller-/gruppe-veksleren (`SpillerVeksler`, vist av `V2Shell` når
   `vekslerData` er gitt) er fjernet fra denne ruta** — AG-01 har ingen slik
   kontroll rett under headeren, og den ville brutt kort-rekkefølgen. Data-
   kallene den trengte (spiller-/gruppeliste) er fjernet fra `page.tsx`.
5. **«⋯»/Mer-knappen i mobil-header er IKKE bygget.** Den henger sammen med
   nav-konseptet (Mer-ark), som er T1/AX-01s domene under omlegging — bygget
   inn i Cockpit-innholdet ville gjettet på en IA som ikke er avklart ennå.
6. **Laster-tilstand er IKKE Train-lock-porteret.** Ingen dc.html-fasit for
   en Cockpit-laster ble levert i denne runden (kun tom/feil/fylt). Det
   generiske `V2Laster variant="cockpit"`-skjelettet (delt av flere ruter)
   står urørt.

## Verifikasjon

| Gate | Resultat |
|---|---|
| `npx tsc --noEmit` | grønn |
| `eslint --quiet src` (målrettet + full via verify) | grønn |
| `npm run verify` (prisma validate/generate · tsc · eslint · action-auth · token-gap · critical-imports · build) | grønn — `prisma:error`-støy under statisk generering er dummy-DB-tilkoblingsfeil på urelaterte ruter (kjent worktree-begrensning, se gotchas §«Aldri kopier .env.local»), ikke noe min endring forårsaket |
| `npm test` | 1617/1617 |
| `npx tsx --test src/lib/agencyos/cockpit-view.test.ts` | 5/5 |

**Skjermbilde-gaten er IKKE utført i denne økten.** Samme blokkering som
tidligere natt-økter (se `LOOP-2S-DONE.md`): innlogging som
`coachtest@akgolf.test` for å ta skjermbilder av en kjørende, autentisert
side er blokkert av harnessets egen klassifiserer på passord-utfylling — ikke
bare av regelen om at Claude aldri skriver passord. Cockpiten er derfor
typesjekket og bygget, ikke visuelt bekreftet av meg. **Anders må se
390 px + 1280 px, lys og mørk, på Vercel-previewen til denne PR-en før
merge** (skjermbilde-gaten i `.claude/rules/beslutninger.md`).

## Ikke i scope (bevisst)

- `/admin/brief` og `/admin/queue` — porteres ikke (beslutningslisten §5T).
- Innboks-/Stall-innhold vises ikke på Cockpit lenger (kun tellinger via
  AI-dispatch) — de hører til T3 (`/admin/innboks`) og T4 (`/admin/spillere`).
- Skallfiler (`src/components/v2/shell.tsx`, rail/dock) — T1 (AX-01) eier
  disse og er urørt.
