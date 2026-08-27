# T4 — Spillerskjema-port til Train-lock (27.08.2026)

## Omfang

Porter `/admin/spillere/ny` (opprett spiller, 4-stegs veiviser) og
`/admin/(legacy)/spillere/[id]/rediger` (rediger spiller) til Train-lock,
etter samme prinsipp som stall-porten (`TrainLockStall.tsx`).

## Viktig avvik fra oppdraget — verifisert før koding

Oppdraget ba om å "gjenbruke AdminSpillerRedigerV2.tsx-mønsteret der det
passer" og viste til at "spiller-360 allerede er portet i T4". Research
(før koding) avdekket at dette ikke stemmer:

- `AdminSpillerRedigerV2.tsx` bruker fortsatt **Paper `T.*`-tokens**
  (`@/components/v2`), ikke Train-lock. Den er selv et avvik som skulle
  porteres — ikke mønsteret å kopiere.
- `SpillerProfilPanel.tsx` (spiller-360) bruker enda eldre `var(--p-*)`
  CSS-variabler direkte, heller ikke Train-lock. Ikke rørt i denne
  leveransen — utenfor oppgitt omfang (kun `ny` + `rediger`).
- Det eneste ferdige Train-lock-eksempelet på en admin-flate er
  `TrainLockStall.tsx` (T4, 26.08.2026) — det er mønsteret som faktisk er
  fulgt: rene `TL`-tokens fra `src/lib/v2/train-lock.ts`, egne lokale
  delkomponenter, ingen `@/components/v2`-primitiver.
- Ingen egen fasit tegnet for "ny spiller"-veiviseren eller
  "rediger spiller"-skjemaet i `designsystem/train-lock/SCREEN-INDEX.md`.
  Nærmeste analoger er `AG-08 Spiller-ark` og `S3-01 Spiller 360`. Portet
  mekanisk fra TL-tokensettet (dock-bakgrunn, `radius.field`, én hvit
  primær-CTA) — samme presedens som lys-avledningen i
  `beslutninger.md` §A4/§T-S5 (mekanisk avledning godkjent der ingen
  tegnet fasit finnes). **Avklares med Anders om egen fasit ønskes senere.**

## Filer

Nye (Train-lock, rene `TL.*`-tokens):
- `src/components/admin/v2/TrainLockSpillerNy.tsx` — erstatter
  `AdminNySpillerV2.tsx` på ruten. 4-stegs flyt uendret (Identitet →
  Golf-profil → Tier og foreldre → Velkomst), samme validering, samme
  server action `createSpiller`.
- `src/components/admin/v2/TrainLockSpillerRediger.tsx` — erstatter
  `AdminSpillerRedigerV2.tsx`. 2-kol skjema, sticky lagre-bar topp/bunn
  (med `ToppbarHoyde`-mekanismen, jf. gotchas.md), endrings-historikk
  høyre. Samme server action `lagreSpiller`.
- `src/components/admin/v2/TrainLockValgtCoachSelect.tsx` — TL-port av
  `AdminValgtCoachSelectV2.tsx`.
- `src/components/admin/v2/TrainLockSlettSpillerKnapp.tsx` — TL-port av
  `AdminSlettSpillerKnappV2.tsx`. `TL.danger` brukt for destruktiv
  handling (nærmeste semantiske token for en irreversibel slett-dialog).

Endret:
- `src/app/admin/spillere/ny/page.tsx` — importerer `TrainLockSpillerNy`
  i stedet for `AdminNySpillerV2`. `TilbakeLenke` (Paper-primitiv) fjernet
  — tilbake-lenken bygges nå inline i komponenten med TL-tokens.
- `src/app/admin/(legacy)/spillere/[id]/rediger/page.tsx` — importerer
  `TrainLockSpillerRediger` i stedet for `AdminSpillerRedigerV2`.

Urørt (bevisst — utenfor omfang, ikke slettet):
- `AdminNySpillerV2.tsx`, `AdminSpillerRedigerV2.tsx`,
  `AdminValgtCoachSelectV2.tsx`, `AdminSlettSpillerKnappV2.tsx` — ingen
  gjenværende importer til dem etter denne endringen (verifisert med
  grep), men stående som historikk/referanse inntil Anders bekrefter at
  de kan slettes.

## Verifikasjon

- `npx tsc --noEmit`: grønt (0 feil i endrede/nye filer — kjørt etter
  `prisma generate` siden worktreen manglet generert klient, jf.
  gotchas.md).
- `npx eslint` på alle nye/endrede filer: grønt, 0 advarsler.
- Skjermbilde-gate kjørt lokalt (dev-server, testcoach-innlogging
  `coachtest@akgolf.test`, samme konto som e2e-suiten bruker):
  - Ny spiller: mobil 390px mørk (alle 4 steg gjennomtestet med ekte
    inndata, inkl. under-18-varsel og validering), desktop 1280px mørk,
    lys modus (steg 4).
  - Rediger spiller: desktop 1280px mørk og lys, mobil 390px mørk,
    slett-dialog (TL.scrim + TL.danger) testet i lys modus.
  - Ingen visuelle regresjoner, ingen konsollfeil (kun forventet 404 fra
    en ekstern ressurs, urelatert til denne porten).

**Gjenstår før merge (skjermbilde-gaten, CLAUDE.md):** Anders må selv se
skjermene (mobil + desktop, lys + mørk) før PR merges. Skjermbildene fra
denne verifiseringen er ikke lagret som filer — kun sett i økten. Be om
en ny visning i PR-preview om Anders vil se dem direkte.

## Ikke gjort (bevisst, anti-scope)

- Ingen refaktor av urørt kode.
- Ingen nye design-tokens.
- Ingen endring av spiller-360 (`SpillerProfilPanel.tsx`) — egen, uportet
  flate, ikke del av dette oppdragets omfang.
- Ingen sletting av de gamle Paper-komponentene — de har ingen
  gjenværende referanser, men slettes ikke uten eksplisitt "ja".
