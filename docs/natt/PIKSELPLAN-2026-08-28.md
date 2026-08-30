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
| PX-3 | TM (12) + TE (13) | 25 | Analyse/TrackMan-familien + testbatteri/live-gate/innspill | `px/3-tm-te` |
| PX-4 | WB (10) + P (9) + RU (5) + LO (3) | 27 | Player-workbench, min uke/økt, live runde, gate-skjermene | `px/4-player-wb-runde` |
| PX-5 | FO (20) | 20 | Hele Forelder med lys+mørk toggle (T4-beslutningen 26.08) | `px/5-forelder` |
| PX-6 | AG (4) + AO (5) + JV (3) + S3 (3) + KA (3) + EC (2) + DG/FY/TU/GP/BO/ME-rest | ~28 | AgencyOS-resten: cockpit-varianter, AgenticOS, Jarvis, Spiller 360, kalender, økonomi, DataGolf, fys, turneringer, gameplan, booking, meg-detaljer | `samle/px6-agency` (sammenslåing av `claude/px6-agency-rest-fasit-iopubc` + `px/6-agency-rest`) — sitering levert, skjermbilder ikke tatt |
| PX-7 | GAP (3) + B1–B5 (9) + MAT (2) + Analyse | ~15 | Tilstander (tom/laster/feil per GAP-1/B1), lys-arkene B3/B4/B5, iPad/Mac-brekkene B2, materialer, Dynamic Type XL-rammen | `px/7-tilstander-brekk` |
| PX-6 | AG (4) + AO (5) + JV (3) + S3 (3) + KA (3) + EC (2) + DG/FY/TU/GP/BO/ME-rest | ~28 | AgencyOS-resten: cockpit-varianter, AgenticOS, Jarvis, Spiller 360, kalender, økonomi, DataGolf, fys, turneringer, gameplan, booking, meg-detaljer | `px/6-agency-rest` |
| PX-7 | GAP (3) + B1–B5 (9) + MAT (2) + Analyse | ~15 | Tilstander (tom/laster/feil per GAP-1/B1), lys-arkene B3/B4/B5, iPad/Mac-brekkene B2, materialer, Dynamic Type XL-rammen | `samle/px7-tilstander` (sammenslåing av `px/7-tilstander-brekk` + `claude/px7-tilstander-brekk-4cp4nu`) — **DELVIS.** GAP (alle 3) + B1 + MAT + B3/B4 levert og sitert. **B2 (5 filer, iPad/Mac-brekk) IKKE bygget** — spec ligger klar i `docs/natt/PX7-DONE.md`. GAP-2e (reauth-samtykkeark) vurdert som ny feature, ikke bygget. Skjermbilder ikke tatt. |

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

## 7 · PX-7-status (levert 29.08.2026, `px/7-tilstander-brekk`)

Sann baseline for denne branchen (fersk `origin/main`, målt FØR PX-3/PX-4/PX-6 er merget —
de kjørte parallelt i egne worktrees og er ikke synlige her ennå): **107/204 sitert**. Ved
slutt: **112/204**. (PX-3s egen rapport nevner 113/204 — det tallet ble målt i en annen,
delt utsjekk med PX-3s ikke-mergede commits allerede til stede, ikke mot ren `origin/main`.
Når PX-3–PX-6 er merget til `main`, forvent et samlet tall betydelig høyere enn både 107
og 113.)

**Levert og sitert (5 av 12 gjenstående GAP-/B-/MAT-filer i scope):**
- `B1 Tilstander laster feil.dc.html` — ny felles infrastruktur i
  `src/components/v2/feil-laste.tsx`: `V2Feil` fikk en `melding`-prop (fasit-spesifikk
  undertekst per flate, danger-etikett «Feil» lagt til over tittel), `V2Laster` fikk to
  nye skjelett-varianter (`"plan"` — dagstripe + to ukekort, `"meg"` — avatar+navn+kort).
  Kopi satt per rute: `/portal/error.tsx` («Fikk ikke lastet dagen din»),
  `/portal/analysere/error.tsx` («Fikk ikke hentet SG»), `/portal/meg/error.tsx`+`loading.tsx`
  («Fikk ikke lastet innstillingene» / meg-variant). `/portal/planlegge/loading.tsx` +
  `error.tsx` var HELT FRAVÆRENDE før denne økten — Plan-fanen falt tilbake på Hjem-
  skjelettet og generisk feiltekst; begge er nå egne filer med Plan-spesifikk kopi
  («Fikk ikke lastet uken»).
- `GAP-1 Tilstander.dc.html` — samme tom/laster/feil-mønster (Prøv igjen, danger kun på
  feilteksten) portet til KA-01 (`admin/kalender/error.tsx` — allerede hadde
  loading/error, kun kopi rettet), S3-01 (`admin/spillere/[id]/error.tsx`, kopi rettet),
  BO-01 (`portal/booking/error.tsx`, kopi rettet), og RU-01
  (`portal/(fullscreen)/runde/live/loading.tsx` + `error.tsx` — HELT FRAVÆRENDE før denne
  økten, ny egen chrome-fri skjelett/feil-fil siden ruten ikke har V2Shell). «Tom»-
  tilstandene (Tom uke / Ingen aktiv runde / Velg en spiller / Ingen ledige luker) er
  IKKE bygget — de krever faktisk tom-datasjekk per flate, ikke bare feilteksten; se gap
  under.
- `GAP-2 Tilstander drift.dc.html` — KUN Jarvis-kø-tom (2c/2f) portet: kopi i
  `AdminAgenticosKo.tsx` («Ingen som venter» / «Start en ny kjøring»). Runtimes-nede
  (2a/2b) og Integrasjoner-reauth (2d/2e) er IKKE bygget — se gap under.
- `GAP-00 Kart.dc.html` — ikke en skjerm (Paper→Train-ID-kart), sitert som referanse i
  `src/lib/v2/train-lock.ts`.
- `MAT-00 Materialer.dc.html` — ikke en skjerm (materiale-spesimen), sitert i
  `train-lock.ts` etter å ha verifisert at regelen den viser (Fullført = TL.warm + hake,
  aldri grønn) allerede er mekanisk håndhevet, jf. `OktArk.tsx`.
- `B3 Lys nøkkelskjermer.dc.html` + `B3 Lys resterende skjermer.dc.html` — IKKE bygget på
  nytt (jf. instruksjonen om å sjekke #636/C8 først): verifisert med grep at PH-01/04/10/17
  (`PortalChatHjem.tsx`, `OktArk.tsx`, `AnalyseHubTrainLock.tsx`, `MegV2.tsx`) og PH-05
  (`LiveActive.tsx`) konsekvent leser `TL.*`/`var(--tl-*)` uten hardkodet hex — mekanisk
  lys virker allerede, sitert med denne verifiseringen som begrunnelse.

**Ikke rukket / bevisst utelatt (7 filer), med grunn:**
- `B2 PH-01/04/05/10/17 … iPad Mac.dc.html` (5 filer) — genuint ikke bygget. Verifisert at
  PH-04 (`OktArk.tsx`) og PH-05 (`LiveActive.tsx`) har NULL responsive brekk (ren 390px-
  layout), PH-17 (`MegV2.tsx`) har kun én liten `md:`-justering, og selv PH-01/PH-10 (som
  HAR ekte desktop-lag — `ArtefaktPanel` ved ≥1121px, to-kolonne ved ≥834px) matcher ikke
  fasitens strukturelle krav: B2 tegner «iPad smal = TAB BAR ØVERST», mens `V2Shell` alltid
  viser venstre ikonrail fra 768px (`IkonRailNav`, `hidden md:flex`) — en helt annen
  navigasjonsform, ikke en spacing-justering. Å bygge om til fasitens topp-tab-variant er
  ny layout-arkitektur, ute av proporsjon for en tilstand/brekk-bølge.
- `B4 Lys iPad Mac.dc.html` — avledet gap fra B2: kan ikke være lys-riktig på et brekk som
  ikke finnes.
- `MAT-01 Mac Okt FYS hero.dc.html` — hero-foto på øktvisning (FYS-økt med bilde i header)
  finnes ikke noe sted i koden (`grep` null treff). Å bygge det er ny UI/mediehåndtering,
  ikke en tilstand eller et brekk — anti-scope.
- GAP-1s «tom»-tilstander (Tom uke/Ingen aktiv runde/Velg en spiller/Ingen ledige luker) og
  GAP-2s Runtimes-nede/Integrasjoner-reauth — feil-delen av begge filene er portet, men
  disse krever ekte tom-sjekk / live helse-/utløpsdata som ikke finnes ennå (Runtimes leser
  i dag en statisk `AGENTICOS_RUNTIMES`-liste, ingen faktisk ping; integrasjoner har ingen
  utløps-/reauth-modell). Bygge dem ville krevd ny datamodell/polling — anti-scope for
  denne bølgen.
- Resterende Analyse-filer (`TM-03/12/13/14`) — ikke åpnet. Tidsbudsjett gikk til
  GAP-1/B1-infrastrukturen (brukt på flest skjermer, prioritert øverst per oppdraget) og
  B2/MAT-01-verifiseringen (som avdekket at de IKKE kunne siteres raskt).

**Verifikasjon:** `tsc --noEmit`, `eslint --quiet src` (kun endrede filer + relevante),
`check-token-gap`, `check-action-auth`, `check-doc-lenker` — alle grønt. `npm test` —
1848/1848 grønt. `npm run build` / `check-critical-imports.mjs` kunne IKKE kjøres i denne
worktreen (ingen egen `node_modules` — Turbopack og esbuild-kallet i critical-imports
bruker literal cwd-relativ sti, ikke Nodes oppover-vandrende modulresolusjon; se
`docs/feillogg.md` 29.08.2026). CI (som kjører i hoved-repoet) dekker dette ved push.

**Skjermbilder: IKKE tatt.** Samme årsak som PX-3: ingen `.env.local`, ingen ekte
Supabase/DB-credentials, ingen `SCREENTEST_PASSWORD` i denne remote-økten.
Skjermbilde-gaten er derfor IKKE oppfylt. Nøyaktige manuelle sjekk-instruksjoner (hvordan
trigge hver tilstand) står i PR-beskrivelsen.

**Neste økt bør starte med:** GAP-1s tom-tilstander (krever kun UI, ingen ny data — rimelig
neste skritt), deretter B2/B4 som EGEN bølge (fasitens topp-tab iPad-variant er en reell
IA-endring, bør planlegges separat fra videre tilstand/brekk-arbeid), deretter TM-03/12/13/14.
