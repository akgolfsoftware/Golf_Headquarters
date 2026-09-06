# PROTOTYPE-PLAN — kopi fra Claude Design-prosjektet «Player HQ Train lock» (zip 05.09.2026)

> Referanse, ikke fasit. Prototypen (`proto/` i prosjektet) er IKKE synket inn i repoet: coach-menyen der (Cockpit · Innboks · Stall · Kalender · Workbench) strider mot AX-01 (Anders 25.08.2026) og koden, Plan-fanen bygger på utgått P-05, og fonten er SF Pro. Avgjøres i designport-beslutning 7 (`docs/superpowers/plans/2026-09-05-komplett-designport.md` §6). Kilde: Drive `claude-cowork/akgolf-hq/innkommende/2026-09-05-player-hq-train-lock.zip`.

# PROTOTYPE-PLAN — klikkbar prototype av hele AK Golf HQ

Mål: én fil per skall der du kan klikke deg gjennom alle skjermer. Tre skall: **iPhone 393**, **iPad 1180×820** (skinne 250) / 834 (tab bar), **Mac 1440×900** (rail). Samme dataverden (Øyvind, Anders, uke 34, 22.08.2026) på alle skall.

## 0. Prinsipp

Dagens ~200 filer er **rammebrett**: hver fil tegner én eller flere enheter med bezel, statusrad og etikett. En prototype trenger det motsatte — ett skall som står stille, og **skjerminnhold** som byttes ut inni. Vi rører ikke rammebrettene (de er fasit). Vi henter innholdet ut av dem.

Tre lag:

1. **Skall** (`PROTO iPhone.dc.html`, `PROTO iPad.dc.html`, `PROTO Mac.dc.html`) — bezel, statusrad, dock/skinne/rail, composer, artefakt-panel, ark-scrim. Én hash-ruter (`#/player/idag`, `#/agency/cockpit`, `#/foreldre/barn`). Rolle-bytte (Spiller · Coach · Forelder) via LO-01 Gate.
2. **Skjermer** (`proto/screens/PH-01.dc.html` osv.) — innholdet fra dagens filer uten bezel, uten dock. Én fil per skjerm-ID, med tre breakpoint-varianter inni når de finnes (`data-bp="393|834|1440"`). Skallet monterer riktig variant med `<dc-import>`.
3. **Navigasjonsgraf** (`proto/nav.js`) — hvilke trykkflater som går hvor. Alle trykkflater får `data-go="PH-04"` (push), `data-sheet="PH-09"` (ark/panel), `data-back`, `data-tab="plan"`. Skallet lytter globalt — ingen logikk inne i skjermene.

Ark, modal og artefakt-panel er **skall-nivå**: på iPhone kommer PH-04 som ark 440 ms fra bunn, på Mac som panel 380 til høyre. Samme skjerm-fil, forskjellig presentasjon — det er allerede slik HANDOFF beskriver det.

Tilstander (tom · laster · feil · lys) blir **ikke egne ruter** — de ligger som `?state=tom` på samme rute og nås fra et lite proto-panel (Tweaks): rolle, tema, datatilstand, Dynamic Type XL.

## 1. Rutekart — hva som finnes hvor

Kolonnen «kilde» er filen innholdet hentes fra. **Mangler** = må tegnes nytt for det skallet (arver nærmeste eksisterende).

### Spiller (Player HQ)

| Rute | iPhone | iPad | Mac | Presentasjon |
|---|---|---|---|---|
| Gate / innlogging | LO-01, LO-02 | LO-01 (sentrert 390) | LO-01 (sentrert) | fullskjerm |
| Onboarding a/b/c | PH-19 | PH-19 (sentrert) | PH-19 (sentrert) | fullskjerm |
| **I dag** | PH-01 (+01b, 01c, 01e) | B2 PH-01 | B2 PH-01 | fane |
| Økt-ark | PH-04 | B2 PH-04 | B2 PH-04 | ark / panel |
| Live | PH-05 → PH-06 | B2 PH-05 | B2 PH-05 | artefakt fullskjerm |
| Booking-ark | PH-09 → BO-01 → BO-03 | mangler (ark 560) | mangler (panel 380) | ark / panel |
| Varsel-ark | PH-20 | mangler | mangler | ark / panel |
| I dag i tiden | KA-04 | mangler | mangler | ark |
| Live runde | RU-01 → RU-02, RU-04 | mangler | RU-03 | artefakt |
| **Plan** | P-05 → P-06, P-07 | A-12-mønster (P-01 i 1180) | P-01, P-02, P-03, P-04, P-08 | fane |
| Player godkjenning | WB-04 iPhone | WB-04 iPad | WB-04 Mac | ark / inline |
| Gruppeendring / ikke delta | WB-08, WB-10 | WB-08, WB-10 | WB-10c | ark |
| **Analyse** | PH-10 → 11, 12, 13, 14, 15, 16 | B2 PH-10 | B2 PH-10 | fane |
| Min kurve | PH-21a | mangler (1280 tilpasses) | PH-21b | push |
| Gapping | Analyse Gapping, TE-09 | mangler | mangler | push |
| TrackMan | TM-01 → TM-02/11 → TM-08f, TM-12, TM-13, TM-14 | TM-01b, TM-11c, TM-08c | TM-01c, TM-11d, TM-12a, TM-13a, TM-14a | push |
| TrackMan analyse-hub | TM-04a, TM-09a | TM-04b | TM-04c | push |
| DataGolf | DG-01a/02a | DG-01 spiller iPad | DG-01b/02b | push |
| Tester | TE-01 → TE-03, TE-04 → TE-05, TE-06, TE-08, TE-10, TE-12 | TE-13 | TE-02, TE-07 | push / artefakt |
| Turneringer | TU-01 → TU-02 | mangler | mangler | push |
| Gameplan | GP-01 → GP-02 | mangler | mangler | push |
| **Meg** | PH-17 → PH-18, ME-01–04 | B2 PH-17 | B2 PH-17 | fane |
| Mine bookinger | BO-02 | mangler | mangler | push |

### Coach (Agency OS)

| Rute | iPhone | iPad | Mac | Presentasjon |
|---|---|---|---|---|
| **Cockpit** | AG-01 (+14, 15) | mangler (AG-16-skinne) | AG-02 | fane |
| Live-tavle | AG-09b1 | AG-09b2 | AG-09b3 | artefakt |
| Notifikasjonssenter | AG-19c/d/e | mangler | AG-19f | ark / push |
| **Innboks** | AG-03 → AG-10b1 | AG-10b2 | AG-10b3 | fane |
| Jarvis-kø | JV-01a → JV-02a → JV-03a | JV-01b/02b/03b | JV-01c/02c/03c | push |
| **Stall** | AG-04 → AG-08 → S3-03b | AG-16 → S3-02 | S3-03a, S3-01 | fane |
| Fys stall | FY-01a | FY-01b | FY-01c | push |
| Agency TrackMan | TM-06a, TM-10d | TM-06b | TM-06c | push |
| **Kalender** | KA-03 → AG-11 | mangler | KA-01 → KA-02, KA-05 | fane |
| **Workbench** | WB-02 iPhone → A-14, WB-03, WB-05, WB-06, WB-07 | WB-02 iPad → WB-03, WB-05, WB-06 | WB-02 Mac → A-02/02b, A-03/03b/03c, A-02c, A-04/04b, WB-03, WB-05, WB-06, WB-07, WB-09, A-01d, A-10, A-18 | fane |
| Mer-ark → Plan-hub | AG-05 → AG-06a | AG-06b | AG-06c | ark → push |
| Innsikt-hub | AG-07a → AG-12, A-19a/b/c | AG-07b | AG-07c → A-19d | push |
| Økonomi | EC-01, EC-02a | EC-02b | EC-01 Mac, EC-02c | push |
| Oppsett-hub | AG-18a → AG-13 | AG-18b | AG-18c | push |
| AgenticOS | AO-01 393, AO-12g, AO-13c/d | AO-13b | AO-01/03/08, AO-02, AO-05–07, AO-12a–f, AO-13a | push |
| Drift-tilstander | GAP-2b–e | mangler | GAP-2a | state |

### Forelder (Foreldreportal)

| Rute | iPhone | iPad / Mac |
|---|---|---|
| FO-01 → FO-02…FO-10 | alle finnes (mørk + lys) | **mangler alt** — forslag: én sentrert 560-kolonne med tab bar øverst (iPad-smal-mønsteret), ikke ny design |

### Telling

- Skjerm-ID-er totalt: ~120 unike ruter.
- iPhone: ~112 finnes · ~8 mangler.
- iPad: ~55 finnes · ~65 mangler (flest i Player-push-nivåer og Foreldre).
- Mac: ~80 finnes · ~40 mangler.

Det som mangler er nesten alltid **push-nivå under en fane** (Gapping, Turneringer, Booking). Regel for å tette hull uten å tegne 100 nye skjermer: på iPad splittes fanen liste | detalj (HANDOFF: «Plan/Analyse/Meg = split inni rommet»), så et iPhone-push-innhold kan monteres i detalj-kolonnen 560 uten ny layout. På Mac lander det samme i innholdskolonnen 640–880. Nye tegninger trengs bare der Mac har egen IA (Workbench, Kalender, Spiller 360) — og de finnes allerede.

## 2. Navigasjonsgraf (kjernen)

Spiller: Gate → Onboarding → **I dag** ⇄ Plan ⇄ Analyse ⇄ Meg (dock). I dag → Økt-ark → Live → Live ferdig → tilbake til I dag (tilstand «økt fullført»). I dag → Booking-ark → luker → bekreftet. Analyse → hvert push-nivå → tilbake. Meg → ME-01–04, samtykke.

Coach: Gate → **Cockpit** ⇄ Innboks ⇄ Stall ⇄ Kalender ⇄ Workbench (dock 5 / rail 7). Cockpit → tavle · kø-kort → Merge (AG-10b) → kvittering. Stall → spiller-ark → profil → «Åpne uke i Workbench» (krysslenke). Workbench → økt → ny drill → Publiser → confirm → publisert (tilstand som spilleren ser på I dag når du bytter rolle — det er demoens poeng).

Forelder: FO-01 → barn-fane → hver rad.

Tre krysslenker som binder appen sammen: Publiser (coach) → I dag (spiller) · Merge (coach) → Plan (spiller) · Godta (spiller) → Innboks (coach).

## 3. Teknisk oppskrift (kort)

- **Ekstraksjon** kjøres som ett skript per batch: finn `[data-screen-label]`, ta innholdsblokken (alt mellom statusrad og dock), skriv til `proto/screens/<ID>.dc.html` med `data-bp`. Filer med æ/ø/å i navn (PH-04, PH-12, TM-02, B2 PH-04, B3 nøkkel, EC-01) tas manuelt.
- **Fargegrammatikk** rulles ut på det som ekstraheres (TM-serien har fortsatt hvite dataserier → sand). Ingen nye tokens.
- **Skall** bruker dock/skinne/rail fra TRAIN LOCK / AG-00 / AX-01 som fasit. Motion-tokens fra DESIGN-SYSTEM §4 (ark 440 ms, kort-stagger 520/70, press 220/110).
- **Ruter** i localStorage + hash, så refresh og deling av lenke lander på samme skjerm.
- **Proto-panel** (Tweaks): rolle · tema mørk/lys · datatilstand · Dynamic Type XL · vis rutenavn.
- **Hull** som ikke skal tegnes nå vises som ærlig skjerm: tittel + caps «IKKE TEGNET · kommer i batch N» — aldri blank.

## 4. Batcher (rekkefølge = demoverdi)

| # | Innhold | Nye tegninger | Resultat |
|---|---|---|---|
| 1 | Skall ×3 + ruter + Gate + Spiller fire faner (I dag, Plan, Analyse, Meg) + Økt-ark + Live | 0 | Klikkbar spillerkjerne på tre skall |
| 2 | Spiller push-nivåer: Analyse-tre (runder, TrackMan, tester, DataGolf, Min kurve), Meg-barn, booking | ~15 iPad, ~8 Mac (detalj-kolonne) | Spiller komplett |
| 3 | Coach fem faner + Mer-ark + huber + Merge-flyt + Live-tavle | ~4 iPad (Cockpit, Kalender, Innboks) | Coach-kjerne |
| 4 | Workbench full (uke/måned/år, økt, drill, kilder, publish) + krysslenker til spiller | 0 | Demo-sløyfen coach → spiller virker |
| 5 | Jarvis, AgenticOS, Økonomi, Fys, Spiller 360, drift-tilstander | ~6 iPad | Coach komplett |
| 6 | Foreldreportal på tre skall + lys tema globalt + tilstander (tom/laster/feil) | 10 iPad/Mac (samme 560-kolonne) | Hele appen |
| 7 | Motion-pass (ark, stagger, press på alt), Dynamic Type XL, feiing av døde trykkflater | 0 | Ferdig |

Hver batch avsluttes med oppdatert `SCREEN-INDEX.md` (ny seksjon PROTO) og en linje i `HANDOFF.md`.

## 5. Beslutninger (eier, 02.09.2026)

1. Roller: alle tre.
2. iPad: 1180 skinne og 834 tab bar — ett skall, tweak `orientation`.
3. Lys modus fra start — CSS-variabler på rammen, tweak `theme`.
4. Hull på iPad/Mac: egen tegning per skjerm. Inntil tegnet vises «Ikke tegnet i prototypen ennå» + ID.
5. Navigasjon + tilstandsendring.

## 6. Status

- **Batch 1 levert:** `proto/Proto Index` · `Proto iPhone` · `Proto iPad` · `Proto Mac` + skjermer LO-01, PH-19, PH-01, PH-04, PH-05, PH-06, PLAN, PH-10, PH-17, TODO. Live-tapper teller, økt-fullført forplanter seg til I dag og Analyse.
- **Batch 2 levert:** Analyse-tre, Meg-barn, booking, varsel-ark — 18 skjermer, generisk montering i skallene.
- **Batch 3 levert:** coach-kjernen — 5 faner, Mer-ark, huber, Merge-flyt, live-tavle, økonomi. Rolledrevet navigasjon. Krysslenkene coach ⇄ spiller virker.
- **Batch 4 levert:** Workbench i dybden (måned, årsplan, økt-editor, øvelsesbank, grupper) + Jarvis-kø og utkast + coach-varsler. Skjermregister i `proto/registry.js`.
- Batch 5 neste (Foreldreportal, AgenticOS, Fys, drift-tilstander).
