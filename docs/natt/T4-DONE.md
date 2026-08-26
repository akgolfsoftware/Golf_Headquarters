# T4 — Stall + Spiller 360 + fys til Train-lock

Status: DELVIS. Se «Ikke gjort» før du stoler på noe herfra som ferdig.
Gren: `claude/t4-stall-spiller360-tl`.

## Gjort

### 1. Stall (`/admin/spillere`) — full Train-lock-port

Ny komponent `src/components/admin/v2/TrainLockStall.tsx` erstatter `StallV2`
(Paper `T.*`-tokens) på `/admin/spillere`-ruten. Kun `TL.*` (`src/lib/v2/train-lock.ts`)
brukes — ingen `T.*` i denne skjermen.

Fasit: `AG-04 Stall.dc.html` (mobil-liste), `AG-16 iPad Stall split.dc.html`
(desktop/iPad 380px-skinne + detaljpanel), `B5 Lys Agency.dc.html` (lys —
løst mekanisk via TL-tokenenes CSS-variabler, ingen egne literal-farger i
komponenten, så lys/mørk virker uten separat kode-gren).

Bevart uendret (kun visningslag byttet, all forretningslogikk fra `StallV2`
er med): søk, program-filter (Alle/Academy/WANG/GFGK/Stille-over-7-dager),
sortering «trenger deg» øverst → alvorlighetsgrad → navn, de tre Paper-bolkene
(«Trenger deg nå» / «Følger planen» / «Hviler»), «venter på innlogging»-seksjon,
KPI-tall, mobil bunn-ark vs. desktop-splitt.

Dokumenterte avvik fra fasiten (se kommentar øverst i filen):
- Fasitens rader er flate; koden beholder Paper-fasitens tre bolker med
  forklaringstekst — det er eksisterende forretningslogikk, ikke ny.
- Status vises som caps mute-tekst, aldri fargeprikk (matcher AG-04s egen
  mono-caption «flagg som caps, ikke fargeprikk»).
- Negativ SG: samme tekstfarge + `opacity: 0.45`, aldri rødt (DESIGN-SYSTEM §1).
- Detaljpanelet (desktop) bruker eksisterende data (SG-trend, akse-etterlevelse)
  i stedet for fasitens uke-prikk-kalender og SG-per-kategori-søylediagram —
  de krever nye datafelt (ukentlig oppmøte, SG brutt ned på uke) appen ikke
  har i dag. Strukturen (avatar+navn, status, CTA) er portet.
- `min-width: 0` er satt på alle grid/flex-beholdere med `Rad`/nowrap-tekst
  (gotchas.md-regelen — StallV2 var eksplisitt nevnt som «latent bombe»).

`/admin/spillere/page.tsx`: fjernet `?profil=`-artefaktpanelet (`SpillerProfilPanel`,
Paper `--p-*`-tokens) fra denne ruten — «Se profil» lenker nå til full
`/admin/spillere/[id]` (Spiller 360, se under) i stedet for et sidepanel i
et annet designsystem på samme skjerm.

`/admin/agencyos/spillere` er allerede en ren redirect til `/admin/spillere` —
urørt.

### 2. Spiller 360 — strukturell konsolidering + PII flyttet

`/admin/spillere/[id]/page.tsx` er nå ÉN side som henter data for alt tre
tidligere URL-er viste, med de to gamle URL-ene som redirects hit:

- `/admin/(legacy)/spillere/[id]/profil` → `/admin/spillere/[id]`
  (`src/app/admin/(legacy)/spillere/[id]/profil/page.tsx` er nå kun en
  `redirect()`). All PII denne siden viste — personalia, forelder-kontakt,
  artikkel 9-skade-/permisjonsdata (samtykke-gated via `innsynsNivaaFra`),
  spiller-DNA, mål, coach-vurdering — hentes av den konsoliderte siden med
  SAMME Prisma-spørring, samme `coachScopedPlayerWhere`-tilgangsport og samme
  samtykke-masking som før. Ingen duplisert datahenting, ingen bredere
  eksponering enn før konsolideringen.
- `/admin/spillere/[id]/fremgang` → `/admin/spillere/[id]`
  (`src/app/admin/spillere/[id]/fremgang/page.tsx` er nå kun en `redirect()`).
  SG-fremgang, treningsvolum og korrelasjon hentes med samme aggregering
  (8-ukers ISO-ukesnitt) på den konsoliderte siden.
- `actions.ts` under den gamle `(legacy)/…/profil/`-mappen er IKKE flyttet —
  den er en `"use server"`-fil (`inviterForelderForSpiller`) importert av
  `AdminInviteParentButtonV2.tsx` uavhengig av hvilken rute som bruker den.
  Fungerer identisk uansett hvor page.tsx i samme mappe peker.
- `/admin/spillere/[id]/analyse` er IKKE flettet inn — forblir egen rute per
  oppgavebeskrivelsen (egen fasit S3-01-mønsteret + Analyse Gapping + DG-01).

## Ikke gjort (viktig — les før noen sier «Spiller 360 er Train-lock»)

**Spiller 360s visningslag er IKKE portet til Train-lock i denne økten.**
De tre eksisterende komponentene som nå rendres sammen på
`/admin/spillere/[id]` — `SpillerProfilFull`, `AdminSpillerProfilSideV2`,
`AdminSpillerFremgangV2` — bruker fortsatt Paper-tokens (`--p-*`/`T.*`), akkurat
som før konsolideringen. Kun URL-en og datahentingen er ny; ingen ny visuell
kode er lagt til rundt dem.

Grunn: CLAUDE.md invariant 2 forbyr å blande `T.*`/`--p-*` og `TL.*` i SAMME
skjerm. Å bygge AG-08/S3-01/S3-02 pixel-riktig for alle tre komponentene
(DNA-radar, mål-kort, permisjons-/skadetabell, SG-fremgangsgrafer med
trendlinjer, korrelasjonskort) er et selvstendig, betydelig arbeid som ikke
fikk plass i denne økten. Å gjøre det halvveis ville brutt invariant 2 (delvis
TL, delvis Paper på samme skjerm) — derfor er valget å levere konsolideringen
(strukturen + PII-flyttingen, som er det sikkerhetskritiske) rent, og la hele
visningslaget stå som det var, fremfor å late som en pixel-port er gjort.

**Følgende er IKKE startet i det hele tatt:**
- Fys-raden i stallen (`FY-01 Fys stall.dc.html`, ACWR mute/aldri rød) — det
  finnes ingen ACWR-/fys-belastningsdata i dagens `StallenData`-loader eller
  `StallV2Player`-kontrakt. Å legge inn en fys-rad krever enten en ny
  datakilde/felt eller en beslutning om hvor ACWR skal beregnes fra — ikke
  noe jeg har grunnlag for å gjette meg til i denne økten.
- `/admin/spillere/[id]/analyse` → `S3-01`-mønsteret + `Analyse Gapping.dc.html`
  + `DG-01 DataGolf spiller.dc.html`. Ruten er urørt (fortsatt sin gamle
  Paper-basert `AdminSpillerAnalyseV2`).
- Ingen fasit-skjermer: `spillere/ny`, `(legacy)/spillere/[id]/rediger`,
  `spillere/[id]/turnering-kobling`, `spillere/[id]/tester`. Oppgaven ba om
  «stall-mønsteret, ingen pixel-fasit» for disse — ikke rukket.
- `spillere/[id]/plan`, `plan/[planId]`, `(legacy)/spillere/[id]/tildel-test`,
  `spillere/[id]/workbench` — bevisst IKKE rørt, per oppgavebeskrivelsen
  (pensjoneringskandidater / T5-sak).

## Verifikasjon kjørt i worktreen

Med dummy `DIRECT_URL`/`DATABASE_URL` (ingen ekte DB-tilkobling i worktreen,
kjent begrensning — se `.claude/rules/gotchas.md`):

- `npx tsc --noEmit` → grønt.
- `npx eslint` på alle endrede/nye filer → grønt (0 varsler).
- `node scripts/check-token-gap.mjs` → grønt («ingen Presis-farger, ingen hex»).
- `node scripts/check-action-auth.mjs` → grønt.
- `node scripts/check-critical-imports.mjs` → grønt.
- `npm run build` → grønt (exit 0). `prisma:error`-linjer i loggen er
  forventet støy fra dummy-DB-en under prerendering, ikke byggfeil — bygget
  listet alle rutene inkl. `/admin/spillere/[id]` og de to nye redirect-rutene
  som `ƒ` (dynamisk), som forventet.

**Ikke kjørt / ikke mulig i worktreen:** ekte DB-avhengig verifisering
(innlogget røyktest, Playwright mot ekte data). CI + Vercel-preview må dekke
dette, som i tidligere økter med samme begrensning.

**Skjermbilde-gaten er IKKE tilfredsstilt.** Anders har ikke sett skjermen —
ingen skjermbilder av `/admin/spillere` (mobil 390 + desktop 1280, lys +
mørk) er tatt i denne økten. Dette MÅ skje før merge, per
`.claude/rules/beslutninger.md` (Skjermbilde-gate, 04.08.2026).

## Anbefalt neste steg

1. Anders ser `/admin/spillere` i preview (mobil+desktop, lys+mørk) —
   skjermbilde-gaten.
2. Egen økt: port `SpillerProfilFull` + `AdminSpillerProfilSideV2` +
   `AdminSpillerFremgangV2` til TL-tokens (AG-08/S3-01/S3-02), nå som
   strukturen (én URL, PII samlet) allerede står.
3. Egen avklaring med Anders: hvor kommer ACWR/fys-belastningstall fra, før
   FY-01-raden kan bygges i stallen.
4. `spillere/ny`, legacy `rediger`, `turnering-kobling`, `tester`: TL-tokens
   etter stall-mønsteret (ingen pixel-fasit nødvendig).
