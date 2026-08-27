# C5 — Runde-live-artefakt (Loop 9)

**Dato:** 27.08.2026 · **Gren:** `claude/c5-runde-live-umlo9q` · **Fasit:** RU-01–04,
`designsystem/train-lock/`.

## Hva som ble gjort

| Fil | Endring |
|---|---|
| `src/components/portal/runde-logg/runde-live-artefakt.tsx` | **NY.** RU-01 — kort over «I dag» (Train-lock, `TL.*`), vises kun når en runde-kladd finnes i localStorage (`draft.ts`). To tilstander: pågående hull (hull N/total, par, fullførte, SG så langt) og «klar for oppsummering». Én CTA («Fortsett»/«Fullfør») → `/portal/runde/live`. |
| `src/components/portal/v2/chat/PortalChatHjem.tsx` | Wired `RundeLiveArtefakt` inn på «I dag», rett under Workbench-artefaktet og over TrackMan-teaseren. Ingen nye server-props — kortet er rent klient/localStorage, som TrackMan-teaseren men uten fetch. |
| `src/components/portal/runde-logg/runde-recap.tsx` | **NY.** RU-02 — recap som HEL, frittstående Train-lock-skjerm (egen `TL.scene`), rendret som tidlig-return i `runde-live-klient.tsx` FØR det T-styrte skallet — unngår å blande T og TL i samme skjerm (gotchas.md). V8-hullgrid (front/back ni, over par = dimmet via `TL.opasitet.negativ`, under par = ring) + scorekort-utdrag (de 3 hullene med størst \|SG\|, per-hull SG regnet med `beregnSg(hullTilSgShots(h))` — samme motor, kalt ett hull av gangen). Én hvit CTA «Lagre runde» i fast dokk. Erstatter `oppsummering.tsx` (slettet, ingen andre konsumenter). |
| `src/components/portal/runde-logg/runde-live-klient.tsx` | `steg === "oppsummering"` er nå en tidlig-return til `RundeRecap` i stedet for en inline `<Oppsummering>` i det T-styrte skallet. Oppsett/føring-stegene er URØRT (fortsatt T-tokens — se avgrensning under). |
| `src/lib/runde-logg/estimer-fra-total.ts` (+ `.test.ts`) | **NY.** Fordeler total-slag (og ev. total-putt) over `parTemplate`s 18-hulls par-fordeling og bygger en gyldig syntetisk kjede med `syntetiserHurtigHull` — inngang til SAMME SG-motor som resten av runde-loggen (ingen ny SG-beregning, kun ny INPUT til eksisterende `beregnSg`/`rundeTilSgShots`). |
| `src/app/portal/(legacy)/mal/runder/logg/actions.ts` | `lagreLoggetRunde` tar nå valgfri `estimert` (default `false`). `sgSource` settes til `"estimert"` i stedet for `"beregnet"` når kjeden er syntetisert fra kun hullscore (etterregistrering «Hull for hull»), ikke ekte slag-for-slag. |
| `src/app/portal/mal/runder/ny/actions.ts` (`logRoundManual`) | «Bare totalen» (ingen `hullDetaljer`, ingen legacy `holeScores`, ingen håndtastet SG) produserer nå ET SG-estimat via `estimerHullFraTotal` + `sgSource: "estimert"`, i stedet for `sgTotal: null` som før. **Ingen `HoleScore`-rader skrives fra den syntetiske kjeden** — kun `Round.sg*`-feltene. Begrunnelse: PH-12 (urørt denne loopen) leser `holeScores` uten noen EST-merking å vise dem med; å skrive oppdiktede per-hull-rader ville lekket fabrikkert data inn i en skjerm jeg ikke har lov til å endre. |
| `src/components/portal/runde-logg/runde-etterregistrering-klient.tsx` | «Hull for hull»-lagringen sender nå `estimert: true`. «Bare totalen»-fanen har fått et nytt Putt-felt (valgfritt) og oppdatert disclaimer-tekst: *«Uten hull-for-hull blir SG et estimat, merket EST i Analyse.»* (RU-04 sin eksakte copy — erstatter den gamle «kan ikke regne SG per hull»-teksten, som ikke lenger stemmer). Fortsatt T-tokens (se avgrensning). |

## Bevisst avgrenset (innenfor anti-scope, dokumentert her)

- **Kun recap (RU-02) og «I dag»-kortet (RU-01) er Train-lock.** Selve stepper-skjermen
  (`/portal/runde/live`, steg `oppsett`/`foring`) og hele etterregistrerings-siden
  (`/portal/runde/logg`) er FORTSATT T-tokens (Paper) — full port av disse (~1500 linjer,
  inkl. `oppsett-steg.tsx`, `hull-foring.tsx`, `hull-oversikt.tsx`, `sg-panel.tsx`) er ikke
  gjort i denne loopen. Ingen skjerm blander T og TL (RundeRecap er en egen tidlig-return,
  aldri inni det T-styrte skallet).
- **RU-04 er fortsatt en full side, ikke et bunn-ark.** Fasiten viser etterregistrering
  som et ark over «I dag» med kun 4 felt (Dato/Bane/Slag/Putt). Eksisterende
  `/portal/runde/logg` er en egen full skjerm med både «Hull for hull» (18-cellers grid)
  og «Bare totalen» — jeg har IKKE bygget om navigasjonen til et ark. EST-merkingen og
  riktig copy er på plass i den eksisterende siden.
- **RU-03 (Mac, «Analyse én runde utvidet») er ikke bygget.** Egen fasit-caption sier
  eksplisitt «PH-12 urørt», så RU-03 ville vært en NY skjerm — men den hører hjemme i
  Analyse-domenet, ikke i «runde-live som artefakt»-omfanget denne loopen fikk. Ikke
  startet.
- **EST-merking gjelder KUN etterregistrering**, ikke live-føringens hurtigmodus
  (stepper). RU-01/RU-02s egne fasit-mocks har ingen EST-referanse — kun RU-04 (RU-04 sin
  tekst: «Uten hull-for-hull blir SG et estimat»). Live-stepperens `syntetiserHurtigHull`-
  bruk var allerede merket `sgSource: "beregnet"` før denne loopen og er UENDRET.
- **PH-12 er ikke rørt** — verken filen (kandidat: `src/app/portal/mal/runder/[id]/page.tsx`,
  ikke bekreftet 100 % siden `SCREEN-INDEX.md` selv flagger PH-12 som umappet) eller dens
  datakontrakt. Den nye «Bare totalen»-estimeringen skriver bevisst INGEN `HoleScore`-rader
  (se tabellen over), nettopp for ikke å lekke fabrikkert per-hull-data dit.
- **Ingen GPS/3D/DataGolf** i noen av de nye komponentene.
- **SG-motoren (`src/lib/domain/sg.ts`) er ikke endret.** Alt nytt er ny INPUT til
  eksisterende `beregnSg`/`beregnGranulaerSg`/`rundeTilSgShots` — ingen nye
  benchmark-tall, ingen ny beregningsmetode.

## Åpne spørsmål til Anders

1. Hvilken rute er PH-12 egentlig — `mal/runder/[id]` eller
   `statistikk/runder/[runId]/del`? Avklares før noen bygger RU-03.
2. Skal RU-04 bygges om til et ark over «I dag» (fasitens visning), eller er dagens
   fullskjerm-side godt nok for lanseringen?
3. Full Train-lock-port av `/portal/runde/live`-stepperen og `/portal/runde/logg` —
   egen loop (samme mønster som T3/T4/T6/T10/T11/T13 for AgencyOS)?

## Verifikasjon

- `npx tsc --noEmit` — 0 feil.
- `npx eslint --quiet` på alle endrede/nye filer — 0 feil/varsler.
- `node scripts/check-token-gap.mjs` — OK (ingen hex/Presis-farger i nye filer).
- `node scripts/check-action-auth.mjs` — OK.
- `node scripts/check-critical-imports.mjs` — OK.
- `node scripts/check-doc-lenker.mjs` — OK.
- `npm test` — 1707/1707 grønt (0 feil).
- `npm run build` — grønt (`next build` + `serwist build`, exit 0). Én forbigående
  `Can't reach database server`-logglinje under statisk sidegenerering (cloud-sandboxen
  har ingen ekte DB-tilkobling) rørte ikke sluttresultatet — bygget fullførte og
  service worker-en ble skrevet (513 URL-er precachet).
