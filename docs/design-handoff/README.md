# Handoff: AK Golf HQ · portering av skjermer (Claude Code, 04.10.2026)

## Overview
Pakken samler alt Claude Code trenger for å portere skjermene i porteringskøen fra designprosjektet «AK Golf Precision Athletics» til appen **akgolfsoftware/Golf_Headquarters** (`main`). Hovedinnholdet er:
- **IUP i PlayerHQ** (bare for spillere i WANG- eller Team Norway-gruppe)
- **regi per spiller** i AgencyOS
- **opprydding** av utgåtte skjermer

Rekkefølgen står i `regler/claude-code.md`. Les den først.

Flater:
- **PlayerHQ (`/portal`)** er for spilleren og har fanene I dag · Plan · Stats · Meg.
- **AgencyOS (`/admin`)** er for AK Golf (trenere, head coach) og har Cockpit · Innboks · Stall · Kalender · Workbench · Mer.
- **WANG Toppidrett og Team Norway** bygges i egne prosjekter. De ser bare profiler fra sine grupper. Kontrakten er `regler/overforing-wang-tn.md`.

## About the Design Files
Filene i `design/` er **designreferanser laget i HTML/React-prototyper**. De viser tiltenkt utseende og oppførsel, men er ikke produksjonskode som skal kopieres. Oppgaven er å **gjenskape dem i appens eksisterende miljø**: Next.js App Router, Tailwind v4, shadcn/ui og Precision-komponentene i `src/components/precision/`, med datalag i `src/lib/`. Gjenbruk det som finnes, og lag ikke en ny komponent der det allerede finnes en.

Prototypene bruker globale navnerom (`window.PHQ`, `window.AGQ`, `window.IUP27` og flere). Det er bare et prototypegrep. I appen hentes data fra API og database med stabile ID-er og revisjoner, se `regler/spesifikasjon-workbench-og-datakontrakt.md` › Datakontrakt.

## Fidelity
**High-fidelity.** Endelige farger, typografi, avstander, tekst og tilstander. Gjenskap pikselnøyaktig med appens komponenter. **Bare PH-01 er visuelt godkjent av Anders.** Alt annet er kandidat til Anders har sett det i appen.

## Faste regler
- **Språk:** `regler/treningsplanlegging-master.md` er fasit for all synlig tekst. Bruk teksten fra prototypene ordrett. Uavklart begrep → spør, ikke finn på.
- **Farger:** primærhandling er grafitt `#141413` med hvit tekst, én per flate. Rust `#9B2415` brukes bare som signal (feil, destruktiv handling, «mangler»).
- **Tilstander:** hver skjerm har Data, Tom, Laster og Feil. Feil har kode og «Prøv igjen». Manglende verdi vises som «—», og 0 betyr målt null.
- **Bredder:** 390 px mobil (bunnlinje), 768/1024 og 1280+ (NavRail fra 1024). Treffflate minst 44 px. Natt-tema der skjermlisten krever det.
- **Data:** bare syntetiske data i tester og demo.
- **Ferdig betyr bevist i appkoden** med Playwright: lagring, tilgang, feil, alle tilstander, 390 og desktop.

## Tilgangsregel for IUP (ny 04.10.2026)
- IUP vises **bare** når spilleren har PlayerHQ-profil **og** er medlem i en WANG Toppidrett- eller Team Norway-gruppe.
- Gruppen får **innsyn automatisk**, uten at spilleren deler noe. Spilleren kan ikke trekke dette innsynet.
- Ender medlemskapet, skjules IUP og innsynet **med en gang**.
- Andre spillere ser ingen IUP-elementer. Det gjelder også kortene i I dag og raden i Målsetninger.
- Den gamle regelen om at medlemskap alene ikke gir innsyn, gjelder ikke lenger.

## Screens / Views

### PH-IUP-01 Fireukerssjekk · `/portal/iup/fireukerssjekk`
- **Fil:** `design/playerhq/PH-IUP.jsx` (`FT`)
- **Inngang:** kortet «Fireukerssjekk» i PH-01 (`design/playerhq/PH-27.jsx` › `Fireuker`). Ingen fane og ingen egen meny.
- **Formål:** spilleren vurderer prosessmålene og svarer på utviklingssjekken IUP 2027 hver fjerde uke.
- **Layout:**
  - Fra 1000 px: to kolonner, `280px | 1fr`. Til venstre en stegliste, til høyre innholdskort.
  - Under 1000 px: én kolonne med «STEG X AV 9 · OMRÅDE · N AV M SVAR» og en fremdriftsstripe på 4 px.
  - Sidebredde maks 1200, mellomrom 12.
- **Steg:**
  1. Prosessmål (Ja · Delvis · Nei per mål).
  2. Sju områder fra kilden: Sosial, Mentalt, Fysisk, Strategisk, Teknisk, Golfutvikling, Neste trinn.
  3. Lever.
- **Spørsmål:**
  - Teksten hentes **eksakt** fra `kilde/iup-2027-kilde-2026-10-01.json` (`utviklingssjekk[niva].sporsmal`). Tekst må ikke rettes, fordi ny tekst betyr ny versjon.
  - Antall per nivå: Ung 34 · Junior 43 · Amatør 47 · Profesjonell 38.
  - Nivå: Ung for født 2011–2013 (8.–10. klasse 2026/27), ellers Junior. Gjeldende AK-vedtak styrer.
- **Skala:**
  - Fem like knapper, 44 px høye, maks 72 px brede hver. Radius 6.
  - Valgt knapp: bakgrunn `--primary` med `--text-on-primary`. Ellers `--surface-card` med kant `--border-hairline`.
  - Tall i `600 15px IBM Plex Mono`.
  - Under knappene: «3 · MODERAT · FORRIGE 4» (meta).
  - Hjelpelinje i kortet: «1 IKKE I DET HELE TATT OPPFYLT · 3 MODERAT · 5 HELT OPPFYLT».
- **Lagring:**
  - Hvert svar lagres med en gang. Statuslinjen viser «LAGRES MENS DU SVARER», «LAGRER …» og «LAGRET hh:mm».
  - Ved feil vises en varsellinje: «Ikke lagret. Svarene ligger i kø på denne enheten og sendes når du prøver igjen.» med knappen [Prøv igjen].
- **Lever:**
  - Oversikt over antall svar og snitt per område.
  - Mangler noe, vises «SVAR PÅ ALT FØR DU LEVERER · …» i rust.
  - Valgfritt fritekstfelt: «Noe trenerne bør vite? (valgfritt)».
  - Knapper: [Lever fireukerssjekken] (lg) og [Fortsett senere] (ghost).
  - Kvittering (toast): «Fireukerssjekken er levert · ANDERS, WANG OG TEAM NORWAY SER SVARENE».
- **Levert:**
  - Tabellen Område | Nå | Forrige | Endring (±0,0, `−` for minus) mot forrige runde.
  - Prosessmålene med svar, og historikk.
  - Svarene fra 2025 vises for seg med teksten «Eget spørsmålssett. Sammenlignes ikke med 2027.»
- **Varianter:** -UNG, -KO (første lagring feiler), -LEVERT.

### PH-IUP-02 Sesongevaluering · `/portal/iup/sesongevaluering`
- **Fil:** `PH-IUP.jsx` (`SE`)
- **Inngang:** sesongkortet i PH-01 i uke 42 (`PH-IUP.jsx` › `Sesongkort`, varianten PH-01-SESONG).
- **Layout:** én kolonne, maks 880.
- **Kort i rekkefølge:**
  1. **Sesongen din:** tre fritekstspørsmål fra `sesongevaluering` med `svartype: "fritekst"`.
  2. **Påstander:** ti påstander med skala 1–4, `svartype: "skala-1-4"`.
  3. **Tidsfordeling:** tabellen Område | Faktisk | Ønsket for Fysisk · Teknisk · Golfslag · Spill · Turnering.
     - Tallfelt 72 px, høyrejustert, bare sifre.
     - Sum-raden står over en kant `--border-ink` og blir rust når summen ikke er 100 %.
     - Faktisk forhåndsfylles fra øktloggen og kan rettes.
  4. **Forbedringspunkter:** minst tre, hvert med en «Prosessmål»-velger som er på som standard. [Legg til punkt]; [x] fjerner et punkt når det er flere enn tre.
  5. **Lever.**
- **Validering:** alle tre fritekster, alle ti påstander, begge fordelingene på 100 % og minst tre punkter. Mangler vises som «MANGLER · …».
- **Etter levering:**
  - Punkter merket prosessmål opprettes som prosessmål i Målsetninger.
  - Kvittering (toast): «N PROSESSMÅL LAGT I MÅLSETNINGER».
- **Variant:** -LEVERT.

### PH-11-MAL-IUP IUP-måltall · `/portal/planlegge/workbench?vis=malsetninger&iup=1`
- **Fil:** `PH-IUP.jsx` (`ML`)
- **Inngang:** raden «IUP-måltall 2026/27» øverst i Workbench › Målsetninger (`design/shared/WB3.jsx`, `iupRow`).
  - Raden vises også uten årsplan, fordi måltallene ikke hører til en plan.
  - Den vises bare for spiller, ikke i trenervisningen.
- **Innhold:** 37 måltall i ni grupper: Ranking, Score, Strokes Gained, Putting, PEI, Slaglengde og retning, Spillstatistikk, Aktivitet, Treningstid. Hentes fra `data-iup2027.js` › `maltall`.
- **Desktop (fra 900 px):** rutenett `1fr repeat(4,56px) 64px 128px` med kolonnene MÅLTALL | K1 | K2 | K3 | K4 | ÅR | MÅL 2026/27.
- **Mobil:** kortrad med navn og [Sett mål], og under den et rutenett med fem kolonner K1–K4 og ÅR.
- **Regler:**
  - ÅR vises bare når alle fire kvartaler er målt, ellers «—».
  - Kilden står som «AUTO · KILDE» eller «EGEN · KILDE».
  - [Sett mål] åpner et tallfelt. Enter lagrer, Esc avbryter, og tomt felt fjerner målet. Kvittering i toast.
- **Filter:** Alle · Med mål · Uten mål, med antall.

### PH-01 I dag (godkjent, bare atferd endres)
- Kortet «Fireukerssjekk» ser ut som før.
- Knappen åpner PH-IUP-01. Teksten skifter mellom «Start sjekken», «Fortsett sjekken» (når et utkast finnes) og «Se svarene» (når sjekken er levert).
- Varianten PH-01-SESONG legger til sesongkortet i uke 42.
- PH-01-AK (uten WANG/TN) viser ingen av kortene.

### PH-27 Meg › Deling
- **Filer:** `PH-27.jsx`, `data-iup.js` › `share`.
- WANG og Team Norway har `auto: true, group: "…"`.
- Statusmerket viser «Gruppe» (info).
- Meta-linjen: «AUTOMATISK · <GRUPPE> · SIDEN dd.mm.åååå».
- Utvidet rad: «<Org> ser profilen din fordi du er i gruppen <gruppe>. Tilgangen følger gruppen. Går du ut av gruppen, forsvinner tilgangen og IUP med en gang.»
- **Ingen [Trekk tilgang]** for gruppeinnsyn. Delingslenke og forespørsler for andre gjelder som før.

### AG-08 Spiller 360 › IUP · `/admin/spillere/[id]?fane=iup`
- **Fil:** `design/agencyos/AG-08-IUP.jsx`
- Tolv seksjoner i rekkefølgen fra Team Norways IUP-ark.
- Seksjon 9 (utviklingssjekk) viser snitt per område «3,8 / 5» og spørsmålet med lavest svar. Linjene «IUP 2027 · versjon · LEVERT dato» og 2025-raden vises for seg.
- Seksjon 3 har en ekstra rad «IUP-måltall 2026/27 · N AV 37 MED MÅL».
- AG-08-IUP-AK: «Gjelder ikke».

### AG-07 Stall og AG-08 spillerkort · regi per spiller
- **Filer:** `AG-stall.jsx` (`Regi`, filter), `AG-360.jsx`, `data-stall.js` (`regi`).
- **Regi:** Privat · GFGK · WANG · Team Norway. En spiller kan ha flere.
- **I radene:**
  - Merkene står under «KATEGORI X · GRUPPE».
  - De bruker DS-komponenten `Tag`, eller som reserve meta-tekst med kant `--border-hairline` og radius 4.
- **I Hele stallen:** en filterrad «REGI» under stall-matrisen med valgene Alle · Privat · GFGK · WANG · Team Norway og antall. Gir filteret ingen treff: «Ingen spillere med dette filteret.»
- **I spillerkortet i AG-08:**
  - Regi-merkene, og under dem en av to linjer:
    - «IUP AKTIV · WANG OG TEAM NORWAY SER PROFILEN AUTOMATISK (GRUPPE)»
    - «IUP VISES IKKE · IKKE I WANG- ELLER TEAM NORWAY-GRUPPE»
  - Regi utledes av gruppemedlemskap (AG-16), Privat av avtale og GFGK av klubbgruppe.

## Interactions & Behavior
- **Navigasjon:** tilbakelinjen går til forrige skjerm, ellers til `parent`:
  - PH-IUP-01 og -02 → PH-01
  - PH-11-MAL-IUP → PH-11
- **Ulagrede endringer:** dialog med Lagre · Forkast · Fortsett.
- **Kvitteringer (toast):** tittel pluss meta i versaler, vises i 2,6 s.
- **Animasjon:** ingen, utover komponentenes egne (`--dur-*`, `--ease-*` i tokens). `prefers-reduced-motion` slår av alt.
- **Tekststørrelse:** `html{-webkit-text-size-adjust:100%}` er obligatorisk, ellers forstørrer WebKit tett tekst.

## State Management
- **Fireukerssjekk:**
  - Utkast har formen `{ ans: {sporsmalId: 1–5}, pm: {i: "Ja"|"Delvis"|"Nei"}, note, levert }`, lagret per spiller, runde og nivå på serveren.
  - Svar knyttes til `versjon` (`iup-2027-kilde-2026-10-01`). Gamle svar omregnes ikke.
- **Sesongevaluering:** fritekst og skala per ID, `faktisk` og `ønsket` per akse (heltall %), og tiltak `[tekst, prosessmål]`.
- **Måltall:** per måltall-ID og sesong: `q[4]`, `mal`, `type` (auto/egen) og `kilde`.
- **Gruppemedlemskap → IUP-tilgang:** kontrolleres på serveren for både visning og lesing (PlayerHQ og WANG/TN-lesere).
- **Køen ved lagringsfeil:** lagres lokalt og sendes ved «Prøv igjen», uten duplikater.

## Design Tokens
Alle variabler for lyst og natt-tema står i `tokens.css`. Viktigst:

**Farger:**
- Grafitt: 900 `#141413` · 800 `#2A2926` · 700 `#3A3935` · 600 `#46443F` · 500 `#686560`
- Sand: 100 `#FAF8F3` · 150 `#F1EEE8` · 200 `#E6E3DD` · 300 `#DDD9D1` · 400 `#C9C4BA`
- Rust: 600 `#9B2415` · 700 `#7D1C10` · 100 `#FBEBEA`
- Flater: `--surface-page` sand-200 · `--surface-flat` sand-100 · `--surface-card` hvit · `--surface-sunken` sand-150
- Tekst: `--text-primary` grafitt-900 · `--text-secondary` 600 · `--text-muted` 500
- Kanter: `--border-hairline` sand-300 · `--border-ink` grafitt-900
- Akser: FYS `#788C5D` · TEK `#B8852A` · SLAG `#2563EB` · SPILL `#C46686` · TURN (se tokens)

**Typografi:**
- Skrift: IBM Plex Sans, og IBM Plex Mono for tall og meta.
- Skala: `--type-title-l 600 28/1.15` · `--type-title-m 600 21/1.25` · `--type-body 400 14/1.5` · `--type-label 500 13` · `--type-kicker 600 11` · `--type-meta 400 11 mono, sperring .04em, versaler` · `--type-num 500 15 mono, tabulære tall`.

**Avstand, radius og skygge:**
- Avstand: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80.
- Radius: 8 (kort) · 12 (modal) · 4 (indre) · 999 (pille).
- Skygge: `--shadow-card none`. Pop og modal: se tokens.

## Assets
- Logoer: `assets/logo-ak-golf-hq.svg` og `assets/ak-golf-logo-ink.svg` i designprosjektet. Appen har egne kopier.
- Ikoner: Lucide (navnene står i prototypene, for eksempel `clipboard-check`, `cloud-off`, `users`).
- Ingen bilder.

## Files
Kodefilene i `design/` har endelsen `.txt` (for eksempel `PH-IUP.jsx.txt`) så designsystemet ikke kompilerer kopiene. Innholdet er identisk med kildene i `ui_kits/`.

| Fil | Innhold |
|---|---|
| `regler/claude-code.md` | Porteringskø 1–12, arbeidsmåte, faste regler |
| `regler/skjermliste.md` | Alle skjerm-ID-er, ruter og «Må vise» (IA 28.09 og IUP-radene 04.10) |
| `regler/spesifikasjon-workbench-og-datakontrakt.md` | Workbench, navigasjon, datakontrakt, kvalitetskrav (tidligere codex.md) |
| `regler/iup-i-playerhq.md` | Hvilken IUP-del som bruker hvilken PlayerHQ-skjerm (ingen dobbeltfunksjoner) |
| `regler/overforing-wang-tn.md` | Kontrakt for WANG- og Team Norway-prosjektene |
| `regler/treningsplanlegging-master.md` | Språkfasit |
| `design/playerhq/PH-IUP.jsx` | PH-IUP-01, PH-IUP-02, PH-11-MAL-IUP, sesongkort |
| `design/playerhq/PH-27.jsx` | Deling og kortet Fireukerssjekk |
| `design/playerhq/PH-01.jsx` | I dag med variantene -UNG, -SESONG, -AK |
| `design/playerhq/parts.jsx` | Skall, Page, Gate (tilstander), formatering (`dec`, `sg`, `hm`) |
| `design/shared/WB3.jsx` | Workbench, raden `iupRow` i Målsetninger |
| `design/shared/data-iup2027.js` | IUP 2027 generert fra kilden, syntetiske svar, 37 måltall |
| `design/shared/data-iup.js` | Deling (`share`) og fireukerssjekk-meta (`check`) |
| `design/agencyos/AG-08-IUP.jsx`, `AG-360.jsx` | Spiller 360 › IUP og spillerkort med regi |
| `design/agencyos/AG-stall.jsx`, `data-stall.js` | Stall med regi-merker og -filter |
| `kilde/iup-2027-kilde-2026-10-01.json` | Personfri spørsmålskilde (162 + 13). Kildefeilene er listet i `.md` og skal ikke rettes |
| `tokens.css` | Alle tokens, lyst og natt |

**Live prototyper i designprosjektet:**
- PlayerHQ: `ui_kits/playerhq/screen.html?id=<ID>&state=data|tom|laster|feil&theme=lyst|natt`
- AgencyOS: `ui_kits/agencyos/screen.html?id=<ID>`

## Åpent (ikke gjett)
- Hva som skjer med perioder, budsjetter og mål utenfor årsplanen når sluttdatoen forkortes (se spesifikasjonen).
- Kildefeil i IUP-teksten («gjennomfär», «øvelser/øvelser», ett engelsk spørsmål) venter på svar fra Anders.
