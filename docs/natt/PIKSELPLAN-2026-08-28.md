# PIKSELPLAN — alle skjermer til komplett Train-lock-fasit

**Opprettet:** 2026-08-28 kveld. **Mål:** hver skjerm i PlayerHQ og AgencyOS er
pikselnær sin `.dc.html`-fil i `designsystem/train-lock/` — ikke bare riktige
tokens (det er levert, se STATUS-NÅ 28.08), men riktig layout, geometri,
typografi og tilstander, i lys OG mørk, på fasitens breakpoints.

**Baseline (målt 28.08 med `node scripts/maal-fasit-dekning.mjs`):**
204 fasitfiler · **39 sitert fra kode** (bygget mot fasit) · **165 udekket**.
Dekningsmålet er 204/204 minus bevisste unntak (se §5).

---

## 1 · Metode per skjerm (ufravikelig, fra PORTING.md)

1. **Les `.dc.html`-filen** — aldri skjermbilde eller hukommelse. Kopier tallene.
2. Finn skjermen i `SCREEN-INDEX.md` (rammer + breakpoints), sjekk `HANDOFF.md`
   ved strukturtvil (HANDOFF vinner struktur, DESIGN-SYSTEM visuelle verdier).
3. Gjenbruk primitivene (`Kort`, `Caps`, `ListRow`-mønstre, `BunnArk`,
   `v2-press`/`v2-focus`, motion-katalogen) — aldri ny parallell primitiv.
4. Skriv **`Fasit: designsystem/train-lock/<fil>.dc.html`** i filens
   toppkommentar — det er dette dekningsscriptet måler. Ingen kommentar = ikke
   levert.
5. Verifiser: `npm run verify` + `npm test` grønt, deretter **skjermbilde
   390 px + fasitens desktop-BP, lys + mørk**, sendt i samtalen (gaten).
6. Én gren per bølge fra `main`, PR, **Anders ser skjermbildene før merge.**

**Anti-scope per skjerm:** ingen nye features, ingen datamodell-endringer,
ingen nye tokens. Avvik fasit↔funksjonalitet → noter i PR-en, ikke løs på
sparket.

## 2 · Bølgene (én Claude-session per bølge, ny chat, Sonnet som standard)

Rekkefølge = smoke-stien først, deretter bruksfrekvens. Antall = udekkede
fasitfiler 28.08 (mange delvis bygget — sessionen verifiserer/justerer og
siterer, den bygger ikke blindt nytt).

| Bølge | Familie(r) | Filer | Innhold | Gren |
|---|---|---|---|---|
| PX-0 | baseline | — | Gå gjennom DONE-docs (T2–T13, B-bølgen): skjermer som ER pikselbygget men mangler sitering får `Fasit:`-kommentar etter visuell kontroll. Gir sann baseline. | `px/0-baseline` |
| PX-1 | PH (22) | 22 | PlayerHQ-kjernen: I dag-varianter, Plan, Økt-ark, Live/Live ferdig, Booking-ark, Analyse-innganger, Meg, samtykke, onboarding 19a–c, varsel-ark | `px/1-ph` |
| PX-2 | A (24) | 24 | Agency Workbench Mac/iPad/iPhone: uke, økt, ny-økt/drill-modaler, kilder, måned, årsplan, stall-dag, drag, publish-confirm, lys-varianter | `px/2-agency-wb` |
| PX-3 | TM (12) + TE (13) | 25 | Analyse/TrackMan-familien + testbatteri/live-gate/innspill | **DELVIS** (`claude/project-status-screens-smffo7`, PR #656 draft — se §7) |
| PX-4 | WB (10) + P (9) + RU (5) + LO (3) | 27 | Player-workbench, min uke/økt, live runde, gate-skjermene | `px/4-player-wb-runde` |
| PX-5 | FO (20) | 20 | Hele Forelder med lys+mørk toggle (T4-beslutningen 26.08) | `px/5-forelder` |
| PX-6 | AG (4) + AO (5) + JV (3) + S3 (3) + KA (3) + EC (2) + DG/FY/TU/GP/BO/ME-rest | ~28 | AgencyOS-resten: cockpit-varianter, AgenticOS, Jarvis, Spiller 360, kalender, økonomi, DataGolf, fys, turneringer, gameplan, booking, meg-detaljer | `px/6-agency-rest` |
| PX-7 | GAP (3) + B1–B5 (9) + MAT (2) + Analyse | ~15 | Tilstander (tom/laster/feil per GAP-1/B1), lys-arkene B3/B4/B5, iPad/Mac-brekkene B2, materialer, Dynamic Type XL-rammen | `px/7-tilstander-brekk` |

**Kapasitet:** en bølge på 20–27 filer er én lang økt (mange filer er varianter
av samme skjerm). Total: 7 økter + gate-runder.

## 3 · Gater og fremdrift

- **Fremdriftstall:** `node scripts/maal-fasit-dekning.mjs` — kjøres i slutten
  av hver bølge; tallet inn i PR-beskrivelsen og STATUS-NÅ.
- **Skjermbilde-gaten** (FAST REGEL 04.08): Anders SER hver bølges skjermer
  (390 + desktop, lys + mørk) i samtalen før merge. Tokenport ≠ ferdig.
- **Motion:** bevegelsesfasiten er systemomfattende siden #646 — bølgene skal
  IKKE legge egne transitions; bruk katalogklassene.
- **Ingen bølge starter før forrige er merget** (unngår fil-kollisjon; A-bølgen
  og WB/P deler workbench-filer).

## 4 · Session-prompt-mal (lim inn i ny chat)

> Mappe: `~/Developer/akgolf-hq` (hovedmappe, IKKE worktree med mindre parallell
> økt pågår). Gren: `px/<n>-<navn>` fra fersk `origin/main`.
> Les `docs/natt/PIKSELPLAN-2026-08-28.md` §1 (metoden) og kjør bølge PX-<n>:
> familiene <…>. For hver fasitfil: les den, sammenlign med koden på ruten
> (SCREEN-INDEX → rute via `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` §0.2),
> juster til pikselnær, siter fasiten i toppkommentaren. Verify + test grønt.
> Avslutt med `node scripts/maal-fasit-dekning.mjs`, skjermbilder (390 +
> desktop, lys + mørk) i samtalen, PR — IKKE merge før Anders har sett bildene.

## 5 · Bevisste unntak (regnes ikke som mangler)

- `TRAIN LOCK.dc.html` / `TRAIN VIZ.dc.html` — lås-/referanseark, ikke skjermer.
- `AX-01`-skallet — levert i `V2Shell` (T1), sitering legges i PX-0.
- Marketing og `/auth` — egne fasiter (ak-golf-website · PP-A/A4 lys), utenfor
  denne planen.
- Skjermer i kode uten tegnet fasit (admin-restflater fra AD-1): mekanisk
  avledet Train-lock er godkjent metode (D-LYS-beslutningen 26.08) — de står
  utenfor 204-tellingen, men skal ikke regressere.

## 6 · Risiko

- **Delte komponenter** (Kort/Rad/WeekGrid) justert i én bølge kan flytte
  piksler i andre — kjør stikkprøve på 2–3 tidligere godkjente skjermer per
  bølge.
- **Fasit-drift:** ny zip fra Anders under planen → `SYNC-STATUS.md` først,
  berørte bølger re-åpnes.
- **Måle-scriptet teller sitering, ikke sannhet** — gaten (Anders' øyne) er
  fortsatt eneste bevis på pikselnærhet.

## 7 · PX-3-status (PX-3 + PX-3-rest, 29.08.2026, `claude/project-status-screens-smffo7`)

Dekning: 105/204 (før PX-3) → 113/204 (PX-3) → **115/204 (PX-3-rest)**.

### PX-3-rest (denne runden, TM-resten + hele TE-familien)

**Levert og sitert (3 filer):**
- `TE-01 Tester hub iPhone.dc.html` + `TE-01L Tester hub lys.dc.html` — hub-en
  (`/portal/tren/tester`) bygget om fra pyramide-akse-hero+filtrert-liste
  (PH-15-mønsteret) til fasitens FLATE liste, gruppert GOLFSLAG/TEKNIKK
  (ny `src/lib/portal-tester/hub-gruppe.ts` — navnebasert gruppe-oppslag for
  de 15 fasit-navngitte protokollene, siden verken pyramidArea eller
  scoring-kind alene skiller gruppene riktig; ugrupperte tester havner i en
  synlig «Andre»-bøtte, aldri skjult). Forfall-/planlagt-caps er ekte
  `TestAssignment.dueDate`, ikke fabrikkert. «Én ting nå»-heroen fra forrige
  hub er fjernet (fasiten har ingen — HANDOFF: «Live = artefakt over I dag
  uten dock»). PEI vises med ett tall (prosent), ikke fasitens to
  («4,26 % · 0,04») — det andre tallet er en spredning som ikke finnes i
  `scoreTest()`-aggregatet i dag, fabrikkeres ikke.
- `TE-03 TN Putt Gate detalj.dc.html` — dekker alle 5 «type A»-protokollene
  (Driver/Wedge/Putt/Nærspill Gate + VISA Express deler denne ruten, ikke
  bare Putt Gate): giant hero-tall («N OK av M · mål K», K fra ekte
  `gateMaalFraProtokoll`-protokolltekst) + «Siste forsøk»-rutenett lest fra
  siste `TestResult.details.perSlag` (ekte OK/BOM + V|H fra live-gate-
  artefakten). Fant og fikset en reell skjema-drift underveis:
  `ScoringDetailsSchema.perSlag.verdier` tillot ikke miss_side «V»/«H» som
  `scoreTest()` faktisk skriver — se `docs/feillogg.md` 29.08. «Tren mot
  neste» og fast bunn-CTA er IKKE bygget (se gap-notat under).

**Ikke rukket / vurdert IKKE porterbart (14 av 17 gjenstående filer):**
- **`TM-03 Ingest-tilstander.dc.html`, `TM-12 Okt teknikk og slag.dc.html`,
  `TM-13 Progresjon maalvindu.dc.html`, `TM-14 Bag mapping og DECADE.dc.html`**
  — alle fire krever funksjonalitet som ikke finnes i datamodellen (live
  coach-satte målvinduer per TrackMan-parameter, ukentlig
  spredningsaggregering med bruddpunkt-deteksjon, DECADE-kjegle/bag-mapping,
  asynkron PDF/foto-OCR-busy-tilstand). Ingen kan bygges uten ny
  datamodell/forretningslogikk — anti-scope. Full begrunnelse per fil:
  `docs/feillogg.md` 29.08 (PX-3-rest).
- **`TE-00 Test-specimen.dc.html` + `TE-00L` (lys)** — lest og brukt som
  vokabular-kilde for portene over (korttype A/B/C/D, tap-knapper,
  hub-rad-med-forfall, fullført-badge), men selve spesimen-filene har ingen
  tilsvarende rute i koden å sitere `Fasit:` fra (de er komponent-referanse,
  ikke en skjerm) — derfor ikke i 115-tallet, men innholdet er reelt brukt.
- **`TE-02 Tester hub Mac.dc.html` + `TE-13 Tester hub iPad.dc.html`** — samme
  GOLFSLAG/TEKNIKK-liste som TE-01 er nå riktig strukturert og vises på alle
  bredder via samme rute, MEN fasitens 380px master–detalj-inspektørpanel
  (liste + levende detalj-forhåndsvisning side ved side) er IKKE bygget —
  det ville krevd å duplisere detaljsidens data-henting inline i hub-siden.
  Rad-klikk navigerer til `/portal/tren/tester/[testId]` som før. Ikke
  sitert `Fasit:` (kun delvis strukturelt sant).
- **`TE-07 Wedge Variation Mac.dc.html`** (type B — matrise mål-lengde ×
  till-mål) og **`TE-10 GS-18 resultat.dc.html`** (type D — per-hull-liste)
  krever egne visualiseringskomponenter (rutenett-matrise / hull-for-hull-
  liste) som ikke finnes — ikke bygget denne runden, tidsbudsjett.
- **`TE-08 Driver Basic.dc.html`** — fasiten viser Driver Basic som PEI-score
  («56/700 → 3,91 % · 0,04»), men den seedede protokollen scorer den faktisk
  med `carry_average` — å vise PEI-formatert tekst på carry-data ville være
  feil informasjon, og å endre scoring-kind er en forretningsregel-endring
  (anti-scope, krever Anders' ja). Ikke portet.
- **`TE-09 Gapping-stige.dc.html`** — «V7 gapping» er en egen stige-
  visualisering (kølle-for-kølle avstandstrapp) uten eksisterende rute eller
  komponent å bygge på. Ikke portet.
- **`TE-12 Egen test.dc.html`** — dagens `/portal/tren/tester/ny/egen`
  (`NyTestEgenV2.tsx`, 854 linjer) er en flerstegs Paper-veiviser med
  kategori-valg og `T.*`-tokens (forbudt i ny skjermkode). Fasiten er ETT
  enkelt skjema (Tittel/N/Mål/Enhet/Intervall, MANGLER-caps, Lagre disabled
  til utfylt). En riktig port er en full omskriving av filen, ikke en
  pikseljustering — for stor jobb for gjenstående tid denne runden.

**Skjermbilder: fortsatt IKKE tatt** — samme grunn som PX-3 (ingen
`.env.local`/Supabase-credentials i denne remote-økten). Se PX-3s notat
over; uendret.

### PX-3 (forrige runde — original tekst bevart)

Dekning ved start av økta: 105/204 sitert. Ved slutt: **113/204**.

**Levert og sitert (8 av 25 TM/TE-filer):**
- `TM-00 Komponenter.dc.html` — KPI-stripe 2×2/4-kolonne.
- `TM-02 TrackMan økt.dc.html` — «Funn»-lista (Klynge/Spredning/Smash/Face mot
  path/Mot forrige, sistnevnte en ny les-side-aggregering mot forrige økt med
  samme kølle). Bakgrunnen på TM-02 (blankt rutenett) er IKKE fulgt — se
  under.
- `TM-05 Tom og faa slag.dc.html` — `generateCaddieSentence` fikk en
  forsiktigere lavt-n-variant (1–7 slag), «Spredning»-raden viser riktig
  «For få slag»-setning.
- `TM-07 Hullkart komponenter.dc.html` — ny `HoleMap.tsx` (rough/fairway/
  green/bunker, tee/approach-variant, «full» 240×170 og «mini» 240×120).
- `TM-08 Okt med hullkart.dc.html` — hullkartet satt inn i
  `DispersionMap`/`TrackManSessionDetail`. Responsiv 3-pane/split-layout
  (TM-08c iPad, TM-08d Mac) er IKKE bygget — se gap under.
- `TM-08f Slag-ark fra prikk.dc.html` — `ShotSheet` fikk stort avviks-tall,
  hullkart-mini og Forrige/Neste.
- `TM-09 Mini-kart og runde.dc.html` — kun a/b/f («Analyse mini»). c/d/e
  («Hull-detalj» i runde) er IKKE bygget — se gap under.
- Fikset (ikke ny sitering, men reell feilretting): TE-04/TE-04L «Live Gate»
  brukte `TL.hair` (8 %) der fasiten ber om 24 % — rettet til `TL.draftBorder`
  (samme verdier, ingen ny token).

**Ikke rukket (17 av 25 filer), med grunn:**
- `TM-03 Ingest-tilstander.dc.html`, `TM-12 Okt teknikk og slag.dc.html`,
  `TM-13 Progresjon maalvindu.dc.html`, `TM-14 Bag mapping og DECADE.dc.html`
  — ikke åpnet, tidsbudsjett.
- **TE-hele familien (12 filer: TE-00/00L/01/01L/02/03/07/08/09/10/12/13)** —
  TE-01/01L/02/13 (Tester hub) krever en STØRRE restrukturering: dagens
  `/portal/tren/tester` (siterer PH-15) har «Én ting nå»-hero + filtrert
  liste (kun tester MED resultat); TE-01 er en helt annen IA — flat liste av
  ALLE ~15 protokoller gruppert GOLFSLAG/TEKNIKK, ingen hero, forfall/planlagt
  som caps-tag. TE-01s egen fottekst sier eksplisitt «Hub = PH-15-jobben»,
  så dette er en bevisst revisjon, ikke en duplikat-fasit — men jobben er for
  stor til å ta som sidespor i denne økta. TE-00/00L er komponent-spesimen
  (4 korttyper × mange faktiske protokoll-skjermer, TE-07/08/09/10/12) som
  krever cross-sjekk mot skjermer som ikke finnes som egne ruter ennå.
  TE-03 (TN Putt Gate detalj) ikke åpnet.

**Kjente fasit↔funksjonalitet-gap (notert i kode-kommentarer, ikke løst):**
1. **TM-02/TM-05 vs TM-07/08/08f/09 — to generasjoner av samme skjerm.**
   TM-02/TM-05 tegner spredningskartet på et blankt rutenett; TM-07/08/08f/09
   (høyere nummer, senere i fasit-rekken) legger til det dekorative
   hullkartet. TM-07s egen tekst («aldri blankt koordinatsystem») og TM-08fs
   HANDOFF-kommentar bekrefter at hullkartet er gjeldende retning — vi har
   fulgt DEN, ikke TM-02/05s eldre bakgrunn. Se `docs/feillogg.md` 29.08.
2. **PDF/foto-ingest finnes ikke.** TM-00 TmIngestDrop, TM-03, TM-05b, TM-08f
   m.fl. viser «CSV, PDF eller foto» + «Ta bilde av kortet» som ingest-vei —
   appen har kun CSV/HTML-parsing (`src/lib/trackman/parse-*.ts`), ingen
   PDF- eller foto-OCR. Ikke bygget her (ny funksjonalitet, anti-scope).
3. **TM-08/TM-09 «Hull-detalj» krever per-hull skudd-posisjoner** (tee →
   innspill → putt langs en bane-polylinje) som verken `Round`/`Hole` eller
   `TrackManShot` har i dag (praksis-data, ikke runde-data). Ikke bygget.
4. **TM-08c/d responsiv restruktur** (iPad kart|sidebar-split, Mac 3-pane
   med økt-liste-rail) — `TrackManSessionDetail` forblir én sentrert kolonne
   på alle bredder. Innhold/data er rettet, layoutet er ikke restrukturert.

**Skjermbilder: IKKE tatt.** Denne remote-økten hadde ingen `.env.local`,
ingen reelle Supabase/DB-credentials og ingen tilgang til
`SCREENTEST_PASSWORD` — `scripts/app-shot.mjs` krever ekte innlogging mot
Supabase Auth, som ikke kan omgås lokalt. `npm run verify` (typecheck, lint,
token-gap, `npm test`, full `next build`) er grønt for alt som er levert —
det er den eneste verifikasjonen denne økten kunne gjøre. Skjermbilde-gaten
(fast regel) er derfor IKKE oppfylt for PR-en; neste økt med ekte
credentials (eller Anders selv mot PR-previewen) må ta 390px + 1440px,
lys+mørk, før merge.

**Neste økt (PX-3-rest, levert — se over) startet med:** TE-hub-restruktureringen
(TE-01/01L) og TE-03 (Gate-familien). **Gjenstår for en FREMTIDIG runde,
kun etter nye avklaringer fra Anders (ikke ren pikselport lenger):**
- TM-03/12/13/14 — krever ny funksjonalitet/datamodell (målvindu-live,
  progresjon-aggregering, DECADE/bag-mapping, PDF/foto-ingest).
- TE-02/TE-13 — master–detalj-inspektørpanelet (380px liste + levende
  detalj-forhåndsvisning) er en egen, avgrenset UI-jobb oppå TE-01-listen
  som allerede er bygget.
- TE-07 (matrise-visualisering) og TE-10 (per-hull-liste) — nye
  komponenter, ingen eksisterende å bygge på.
- TE-08 — venter på Anders' avklaring: er Driver Basic faktisk `carry_average`
  eller skal den re-scores som PEI (fasiten forutsetter PEI)? Ikke en
  pikselport-beslutning.
- TE-09 (gapping-stige) — ny visualisering.
- TE-12 (egen test) — full omskriving av `NyTestEgenV2.tsx` (854 linjer,
  `T.*`→`TL.*` + strukturell forenkling til fasitens ett-skjema-skjerm).
