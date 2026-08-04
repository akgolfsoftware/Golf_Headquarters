# Overlevering til Grok Build — Fase 2 designport (2026-08-04)

Anders bytter fra Claude Code til Grok Build (VS Code) fordi Claude-sesjonen går tom for
token. Dette dokumentet er skrevet FOR Grok Build — les det FØR du gjør noe som helst i dette
repoet. Det oppsummerer alt som er relevant fra Claude-sesjonen; du har ingen annen kontekst.

## 0. Hent riktig kode først

Alt arbeid herfra ligger på branchen **`claude/fase-2-designporten-47c216`**, allerede pushet
til `origin`. Sjekk den ut FØR du starter — den inneholder både ferdig PR-A-kode og dette
dokumentet:

```bash
git fetch origin
git checkout claude/fase-2-designporten-47c216
```

Siste commit på branchen: `97b2b5fa` — "port(design) steg 7 PR-A: PlayerHQ Hjem ombygd mot
Paper-fasit". Denne er IKKE merget til main, og det skal den ikke bli før Anders har sett
skjermbilder og sagt eksplisitt ja (se §3).

## 1. Hva dette prosjektet er

AK Golf HQ (`Golf_Headquarters` på GitHub) — Next.js 16-app med to hovedprodukter: PlayerHQ
(`/portal`, spillerappen) og AgencyOS (`/admin`, coach-appen). Les
**`CLAUDE.md`** (rotnivå) og **`docs/platform/AGENT-BRIEF.md`** for stack/arkitektur/regler
— dette dokumentet dupliserer IKKE det, det er kun en status-brief for den pågående
designporten.

## 2. Hva "designporten" er og hvor vi er nå

Hele appen porteres skjerm for skjerm til et nytt designsystem ("Claude Paper"). Fase 1
(steg 1–6: hente ned tokens, rydde mørk-tema, fjerne hardkodede farger) er FERDIG og merget.

**Fase 2 = steg 7: porte selve skjermene, én PR per skjerm, med skjermbilde-gate.** Låst
rekkefølge (godkjent av Anders 2026-08-04):

1. **PlayerHQ Hjem (PR-A)** — KODE FERDIG på branchen over. **Blokkert på skjermbilde
   (se §4) — ikke åpne PR før det er løst.**
2. Planlegge (PR-B) — ikke startet
3. Analysere (PR-C) — ikke startet
4. Meg (PR-D) — ikke startet
5. De 8 Gjennomføre/live-skjermene (ingen fasit finnes — bruk mønsterdokumentet, se §5)
6. AgencyOS-konsollen (`/admin/agencyos`)
7. De 9 øvrige fasit-skjermene (én PR hver)
8. AgencyOS-bølgene (~111 skjermer uten fasit, gruppert Stall → Planlegge/Gjennomføre →
   Oversikt/Innsikt → Admin/Meg)

## 3. Prosessen per skjerm — IKKE valgfri (Anders' faste regel, 2026-08-04)

For HVER skjerm, i denne rekkefølgen:

1. Bygg 1:1 mot fasit-HTML-en i `designsystem/paper/fase1/*.html` (eller mønsterdokumentet
   hvis ingen fasit finnes).
2. `npm run verify && npm test` — begge grønne.
3. **Fire skjermbilder** — 390px mobil lys, 390px mobil mørk, 1280px desktop lys, 1280px
   desktop mørk — av den KJØRENDE appen (Vercel-preview, innlogget testbruker med ekte data,
   ikke fasit-HTML-en) — sendt DIREKTE i chatten til Anders (synlig fra iPhone, ikke bare en
   GitHub-lenke), sammen med fasitens tilsvarende skjermbilde side om side.
4. Skriv «Venter på ditt ja» og STOPP.
5. Først etter Anders' eksplisitte «ja»: åpne PR + oppdater `docs/MASTER-SKJERMPLAN.md`-raden
   (alle 6 haker) i SAMME commit.
6. **Aldri merge til main uten Anders' eksplisitte «ja» i tillegg** — skjermbilde-godkjenning
   og merge-godkjenning er to separate «ja».

Full åtte-punkts ferdig-definisjon (hva "ferdig" betyr per skjerm — bl.a. alle fire
fasit-tilstander Suksess/Tom/Laster/Feil, «Én ting nå»-monopolet tellbart, copy fra
`docs/skjermtekst/`): `docs/port/plan-designport-alle-skjermer.md` §Ferdig-definisjon.

Testbruker: **Øyvind Rohjan** (spiller), innlogging `screentest@akgolf.test`.

## 4. BLOKKER akkurat nå — løs denne FØRST

PR-A (Hjem) er kode-ferdig og pushet, men jeg (Claude) kunne ikke ta de påkrevde
skjermbildene fordi innlogging med `screentest@akgolf.test` feiler — testet med rene,
verifiserte feltverdier (ikke tastefeil) mot BÅDE preview og produksjon
(`https://akgolf-hq.vercel.app/auth/login`), samme resultat: «Feil e-post eller passord.»

Sannsynlig årsak: passordet i `.env.local` (`SCREENTEST_PASSWORD`) stemmer ikke med det som
faktisk er satt på kontoen i Supabase Auth — kan ha blitt rotert i Supabase uten at filen ble
oppdatert (skjedde én gang før, 2026-07-13).

**Løs én av disse før du forsøker skjermbilder på PR-A:**
- Anders nullstiller passordet for `screentest@akgolf.test` i Supabase-dashbordet og
  oppdaterer `.env.local`, ELLER
- Kjør `npx tsx scripts/seed-screentest.ts` (oppretter/oppdaterer brukeren med verdien som
  faktisk står i `.env.local` nå — trenger `SCREENTEST_PASSWORD` satt i miljøet).

Preview-URL for PR-A (branch `claude/fase-2-designporten-47c216`, kan ha rullet videre —
sjekk `vercel ls` eller Vercel-dashbordet for nyeste):
`https://akgolf-hq-git-claude-fase-c88666-akgolfgroup-netizens-projects.vercel.app`

## 5. Nøkkelfiler — les disse, ikke gjett

- `docs/port/plan-designport-alle-skjermer.md` — hele planen: avviksliste (§Avviksliste),
  ferdig-definisjon, revidert steg 7-plan PR-A–F, Fase 1-godkjenningen fra Anders.
- `docs/port/monsterdokument-paper.md` — ENESTE designkilde for skjermer uten egen fasit-HTML
  (steg 5+ i rekkefølgen over). Dekker den ikke noe → stopp og spør Anders, gjett ikke.
- `designsystem/paper/fase1/*.html` — fasit-HTML-ene. `KONTRAKT.md` i samme mappe er
  byggekontrakten (tokens, aksentmonopol, trykkflater, tilstander — nådeløse regler).
- `.claude/rules/beslutninger.md` — låste beslutninger, bl.a. at Claude Paper 1:1 (ikke bare
  tokens) er fasit, og skjermbilde-gaten som FAST REGEL.
- `.claude/rules/gotchas.md` — kjente feller. Les FØR du koder.
- `docs/skjermtekst/` — ekte norsk UI-tekst per skjerm. Kopier derfra, dikt ikke opp tekst.

**Om zip-filen fra Claude Design:** hvis den inneholder flere/nyere filer enn det som
allerede ligger i `designsystem/paper/fase1/` i repoet, avklar med Anders om de skal erstatte
mappen (steg 1 i planen — "Hent Paper ned i repoet") FØR du bygger noe mot dem, slik at
`fase1/` forblir den ene fasit-kilden alle skjermer måles mot.

## 6. Hva som faktisk er bygget i PR-A (Hjem) — så du ikke bygger det på nytt

Tetter avviksliste A1 (`plan-designport-alle-skjermer.md`): fast artefaktkolonne 360px på
desktop (≥1121px, blir bunnark under det — se `use-er-kompakt.ts`), «Én ting nå»-systeminnlegg
for kommende økt (`NowBlock` i `PortalChatHjem.tsx`), ærlig tomtilstand når uken ikke er
publisert, header-kontekst (kategori/SG total/dato — dato beregnet SERVER-side i `page.tsx`
for å unngå SSR/hydrerings-avvik, se `korte-dato-klokke.ts`), og en NY fangst-knapp i
topplinjen.

**Fangst er en ny, ekte funksjon** (Anders' eksplisitte valg denne økten: "bygg fullt nå", se
`FangstModal.tsx` + `src/lib/portal/fangst-hjem-action.ts`): rå stemme-/tekstobservasjon
(gjenbruker `MicButton`, samme Web Speech-mønster som resten av appen — IKKE
`SessionRecording`, det er coachens EGNE lydopptak av økter, en annen ting) som varsler
tildelt coach via `varsleAgentFunn` (in-app Notification + push, uten Telegram — rutine, ikke
eskalering). Ingen AI-analyse av selve fangsten — "dine ord, uendret" — derfor er det
BEVISST ingen auto-utledede etiketter/chips (fasitens `.chip`-rad), det ville vært påtatt data.

Filer: `src/app/portal/page.tsx`, `src/components/portal/v2/chat/{PortalChatHjem,
ArtefaktPanel,FangstModal}.tsx`, `src/components/portal/v2/chat/use-er-kompakt.ts`,
`src/lib/portal/{fangst-hjem-action,korte-dato-klokke}.ts`.

Verifisert grønt denne økten (med dummy DB-env, se §7): `tsc --noEmit`, `eslint --quiet src`,
`npm test` (903/903), `npm run build` (inkl. serwist).

## 7. Tekniske fallgruver fra denne økten

- **Worktree mangler `.env.local`** (gitignored, worktrees deler ikke ugitte filer).
  `prisma generate`/`npm run build` trenger `DIRECT_URL`/`DATABASE_URL` for å LASTE
  `prisma.config.ts`, men kobler seg ikke faktisk til databasen for dette. Bruk CI sitt
  dummy-mønster (se `.github/workflows/ci.yml`), KUN som shell-eksportert env for kommandoen —
  aldri i en fil:
  ```bash
  export DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?pgbouncer=true"
  export DIRECT_URL="postgresql://dummy:dummy@localhost:5432/dummy"
  ```
  Rør ALDRI `.env*`-filer selv — verken les eller skriv. Ekte secrets, aldri gjennom en agent.
- **Ny worktree/checkout uten `node_modules`**: kjør `npm ci` (med samme dummy-env over,
  siden `postinstall` kjører `prisma generate`).
- **`useEffect` + `setState(new Date())` for "nå"-tekst** trigger lint-feil
  (`react-hooks/set-state-in-effect`) OG gir SSR/hydrerings-avvik. Beregn "nå" i en
  server-komponent (se `korte-dato-klokke.ts` + hvordan `page.tsx` kaller den) og send som
  prop — ikke klient-side `useState<Date|null>`.
- **Denne worktreen hadde stale/reverterte `.claude/rules/beslutninger.md` og `gotchas.md`**
  ved sesjonsstart (samme kjente feilmønster som tidligere økter, se auto-memory
  `annen-okts-worktree-kan-forsvinne`). Fikset med `git restore` + `git merge origin/main
  --ff-only`. Sjekk at branchen din faktisk har nyeste main-innhold i disse filene før du
  stoler på dem.
- **Vercel deployer preview på HVER branch-push**, ikke bare på åpne PR-er — du trenger ikke
  åpne en PR for å få en preview-URL å ta skjermbilder mot.

## 8. Hva Grok Build skal gjøre nå

1. Les dette dokumentet + filene i §5.
2. Løs blokkeren i §4 (be Anders om input hvis du ikke kan nå Supabase selv).
3. Ta de fire skjermbildene for PR-A, send dem til Anders, vent på «ja» (§3).
4. Etter «ja» på PR-A: åpne PR, oppdater MASTER-SKJERMPLAN, vent på Anders' merge-«ja».
5. Fortsett til PR-B (Planlegge) — samme prosess, §3.
