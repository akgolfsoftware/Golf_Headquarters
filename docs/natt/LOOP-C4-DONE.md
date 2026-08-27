# C4 — Tester-live-artefakt — DONE (27.08.2026)

Gren: `claude/c4-tester-live-23skz4`. Loop 8 i `docs/natt/OVERNIGHT-CODING-LOOP-BOLGE2.md`,
rad C4 i `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md`.

## Levert

- **Ny ren domenemodul `src/lib/domain/tester-live.ts`** — gjenkjenner gate-
  protokoller (scoringMode `hit-rate` + checkbox-feltet `ok`) og PEI-
  protokoller med et till-mål-felt (scoringMode `pei` + `till_hull_m`/
  `resultatM` + en målavstand-felt) fra `TestDefinition.protocol`. Ren
  logikk for live-tilstand (gate-teller/neste-indeks/ferdig-sjekk, PEI-
  beregning og -formatering) — 13 node:test-tester.
- **`TE-04 Live Gate` + `TE-05 Gate ferdig`** (`gate-live-artefakt.tsx`):
  10-prikk-tapper (antall slag fra protokollen, ikke hardkodet 10 — dekker
  også Driver Gate 6/Wedge Gate 9 osv.), Gjennom/Bom, V|H-knapper når
  protokollen har et `miss_side`-select (kun Putt Gate i dag). Ferdig-
  skjermen viser «N OK av M» + delta mot forrige forsøk, varm ring + hake
  (`TL.warm` — ALDRI grønn, invariant 2), «Til Anders»-note, én hvit
  «Lukk». Ren `TL.*`.
- **`TE-06 Live Innspill`** (`pei-live-artefakt.tsx`): «til mål»-stepper per
  slag, snitt-PEI vist ALLTID som to tall (`4,26 % · 0,04`, aldri ett
  brøktall), «siste slag · till mål»-liste. Se avvik nr. 1 under for hvor
  dette avviker fra fasit-skjermbildet.
- **Wiret inn i eksisterende `(fullscreen)/tren/tester/[testId]/gjennomfor`**
  (ingen ny rute — den var allerede artefakt uten dock): protokollen
  avgjør om Gate-/PEI-artefaktet eller den eksisterende generiske
  `ScorekortKlient` rendres. Alle andre protokolltyper (Driver Basic,
  Wedge Variation, FYS-tester, …) er urørt.
- **PEI-scoringsmotoren utvidet** (`test-scoring.ts`, `peiForSlag` +
  `pei_average`/`pei_total`-grenen i `scoreTest`): gjenkjenner nå NGF-
  batteriets egne feltnavn (`till_hull_m`, `carry_m`, `side_m`) i tillegg
  til Team Norway-navnene (`resultatM`, `carry`, `carrySide`), og faller
  tilbake til slagets EGET `shot_distance_m`/`malAvstandM` som målavstand
  når protokollens eget `target` ikke er et tall (Inspill Basic sitt
  target er tekst, «PEI 100-150m < 0.06, …», ikke ett protokoll-tall).
  **Dette var en reell, forhåndseksisterende feil** — uten fiksen scoret
  Inspill Basic alltid 0 (se `peiForSlag`, feltnavnene fantes ikke i
  motoren). Rettelsen er additiv (nye feltnavn i eksisterende
  oppslagslister) — ingen andre protokoller endrer oppførsel.
  Ny node:test-test dekker den nye grenen.
- **`Verdi`/`StegVerdi` utvidet med `"V" | "H"`** (test-scoring.ts,
  session-data.ts, gjennomfor/actions.ts sin `VerdiSchema`) for å kunne
  lagre miss-retning — dette fantes ikke i det hele tatt før (protocol.ts
  filtrerer bort `select`-felter, og verdi-skjemaet tillot ikke strenger).
- **Nytt kort på «I dag»** (`TesterLiveKort` i `PortalChatHjem.tsx`,
  IO-laget `src/lib/portal-tester/tester-live-kort.ts`): viser en
  pågående gate-/PEI-test-live-økt («Pågår · Putt Gate · 4 av 10») rett
  under Workbench-artefaktet, lenker inn i artefaktet og gjenopptar der
  spilleren slapp (samme T5-gjenopptaksmekanisme som eksisterende
  scorekort). Ren `TL.*` — samme presedens som `GodkjenningKort` (Loop
  3T/B6): ett nytt kort i en ellers `T.*`-fil, ikke blandet i samme
  komponent.
- **`/portal/talent/mitt-niva` leser nå `TalentTracking.testNivaaer`**
  (T4-synken, skrevet siden 16.08, aldri lest av noen skjerm før dette).
  Ny seksjon «Testresultater · CANON» — siste score, benchmark-nivå og
  trend per pyramideområde, validert med `testNivaaerSchema` (zod). De
  fem manuelle coach-aksene (radar) er urørt.

## Dokumenterte avvik fra fasiten

1. **TE-06 har ingen faste avstandsgrupper («145/160 m»-rader).** Den
   virkelige `inspill_basic`-protokollen (`prisma/scripts/
   seed-ngf-test-protocols.ts`) har verken forhåndsdefinerte
   avstandsgrupper eller et protokoll-tall for målavstand — spilleren
   fører BÅDE `shot_distance_m` og `till_hull_m` selv. Artefaktet har
   derfor en liten, egen «Målavstand»-stepper (default fra protokollens
   target-tekst, alltid justerbar) i stedet for fasitens forhåndssatte
   rader. Kjernefunksjonen (till-mål-stepper + snitt-PEI som to tall) er
   1:1 med fasiten.
2. **Ingen egen TE-05-lik ferdig-skjerm for PEI-artefaktet.** Fasiten
   tegner kun en ferdig-skjerm for Gate (TE-05). PEI-artefaktet
   fullfører rett til den eksisterende `?lagret=1`-kvitteringen på
   testsiden (samme mønster som `ScorekortKlient` alltid har brukt).
3. **Caption-linjen er generisk, ikke hardkodet per protokoll.** Fasiten
   viser protokoll-spesifikk flavor-tekst («PUTT GATE · 6 CM PORT · 40
   CM · SONE 50 CM»). Artefaktet bygger caption fra `test.name`
   (`TEST · {NAVN}`) slik at Gate-artefaktet fungerer generisk for alle
   gate-protokoller (Driver/Wedge/Nærspill Gate, VISA Express), ikke bare
   Putt Gate — ingen protokolldetaljer er hardkodet per test.
4. **«Mål N OK»-linjen i TE-04 er avledet, ikke fabrikert.** Tallet
   parses fra protokollens egen target-tekst (`≥ 8 / 10` → `8`).
   Protokoller uten et tolkbart tall i target skjuler linjen (aldri
   gjettet).

## Ikke i scope (anti-scope holdt)

- Runde-live (C5, egen loop) — ikke rørt.
- Workbench-testbatteri-arket (T6-sporet) — ikke rørt.
- `loadPlayerDay`-invarianten (DRAFT usynlig for spiller) — ikke rørt,
  ingen endringer i `wb-actions.ts`.
- Resten av TN-batteriet (FYS-tester, Wedge Variation, 8-ball Variation,
  Driver Basic uten till-mål-felt osv.) bruker fortsatt uendret
  `ScorekortKlient` — kun de to fasit-navngitte korttypene (Gate, PEI
  med till-mål) fikk et nytt artefakt.

## Verifikasjon

- `npx tsc --noEmit` — grønn, 0 feil.
- `npx eslint --quiet` på alle endrede/nye filer — grønn.
- `npm test` — 1716/1716 grønn (13 nye tester i `tester-live.test.ts`,
  1 ny i `test-scoring.test.ts`).
- `npm run verify` (prisma validate/generate mot dummy `DIRECT_URL`/
  `DATABASE_URL` i skallet, tsc, eslint, check-action-auth,
  check-token-gap, check-critical-imports, check-doc-lenker, `npm run
  build`) — grønn. Ventede `prisma:error`-linjer under statisk
  sidegenerering (ingen ekte DB i denne cloud-økten, jf. gotcha «Aldri
  kopier .env* inn i en worktree») — bygget fullførte likevel (alle
  ruter, inkl. `/portal/tren/tester/[testId]/gjennomfor`, listet i
  build-output; service worker skrevet).
- **Skjermbilde-gate ikke kjørt i denne økten** — cloud-sessionen har
  ingen kjørende dev-server mot ekte data. Skjermbilder tas via
  Vercel PR-preview (390px + 1280px, lys + mørk) etter at PR-en er
  opprettet — se PR-beskrivelsen for lenke. Anders må se skjermbildene
  før merge (CLAUDE.md §Skjermarbeid).

## Neste steg (ikke denne jobben)

- C8 (lys-pass) er nå ulåst for denne flaten sin del — TE-04/05/06 er
  bygget med `TL.*` som allerede bytter lys/mørk mekanisk via
  `data-v2-tema`, ingen egen jobb nødvendig for akkurat disse skjermene.
- Egen jobb om ønsket: faste avstandsgrupper for Inspill Basic krever
  enten en protokoll-endring (legg til eksplisitte avstander per slag i
  `seed-ngf-test-protocols.ts`) eller en UI-beslutning om hvordan
  gruppene skal vises uten den dataen — ikke løst her (se avvik 1).
- Flere talent-skjermer (`min-plan`, `roadmap`, `sammenligning`) leser
  fortsatt ikke `testNivaaer` — kun `mitt-niva` (huben) gjør det nå.
