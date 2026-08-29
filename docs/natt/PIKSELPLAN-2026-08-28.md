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
| PX-4 | WB (10) + P (9) + RU (5) + LO (3) | 27 → **7 sitert** (RU-01, RU-01L, RU-02, RU-04, WB-00, WB-04, P-05) · 20 dokumentert gap | Player-workbench, min uke/økt, live runde, gate-skjermene — se §PX-4-status under og `docs/natt/LEVERANSELOGG.md` PX-4-raden. | `px/4-player-wb-runde` |
| PX-5 | FO (20) | 20 | Hele Forelder med lys+mørk toggle (T4-beslutningen 26.08) | `px/5-forelder` |
| PX-6 | AG (4) + AO (5) + JV (3) + S3 (3) + KA (3) + EC (2) + DG/FY/TU/GP/BO/ME-rest | ~28 | AgencyOS-resten: cockpit-varianter, AgenticOS, Jarvis, Spiller 360, kalender, økonomi, DataGolf, fys, turneringer, gameplan, booking, meg-detaljer | `px/6-agency-rest` |
| PX-7 | GAP (3) + B1–B5 (9) + MAT (2) + Analyse | ~15 | Tilstander (tom/laster/feil per GAP-1/B1), lys-arkene B3/B4/B5, iPad/Mac-brekkene B2, materialer, Dynamic Type XL-rammen | `px/7-tilstander-brekk` |

**Kapasitet:** en bølge på 20–27 filer er én lang økt (mange filer er varianter
av samme skjerm). Total: 7 økter + gate-runder.

**PX-4-status (29.08.2026, to økter på samme gren):** 7 av 27 filer sitert.
Første økt (session `01HgK1xK8dnpK3zerUE8atac`): RU-02 pikseljustert +
sitert, WB-00 sitert (komponentreferanse allerede dekket av A-familien i
`WeekGrid.tsx`). Andre økt (session `01GY627oNRMY9nvcMYVPa7AN`, bygger videre
på samme gren): RU-01/RU-01L (live-runde-kortet justert til fasitens
geometri — 72/700 stort tall, sirkulære 52px −/+, pille-CTA — UTEN å røre
datamodellen; FW/GIR/2-putt-hurtigpillene er fortsatt ikke wiret, se gap
under), RU-04 (allerede pikselnær — kun sitering), WB-04 (godkjenningskort i
«I dag»: tittel/pyramide-chip/coach-notat), P-05 (`DagNivaa` i
`WorkbenchV2.tsx`: rad-geometri — 44px tidskolonne, hairline mellom rader).

20 filer IKKE portet — reelle blokkere avdekket av BEGGE øktene, ikke
kapasitetsmangel:
1. **RU-01/RU-01L sin datamodell-del** (score+FW/GIR/2-putt-hurtigpiller):
   koden har kun slag-for-slag-kjeden som SG-motor i live-stepperen
   (`syntetiserHurtigHull` sporer ikke lie/putt per hull) — å wire disse
   pillene til ekte tilstand er domenearbeid, utenfor en pikselbølge.
   Geometrien rundt (tall/knapper/CTA) ER portet, se over.
2. **LO-01/LO-01L** («Gate», 4-flate produktvelger) finnes ikke i koden
   (rollebasert auto-redirect i stedet) — ny IA/funksjonalitet. **LO-02**
   («Innlogging») er tegnet MØRK, men `.claude/rules/beslutninger.md` §A4
   (16.08, FAST REGEL) låser `/auth` til LYS — uavklart om Train-lock
   overstyrer denne spesifikke låsen. Begge trenger Anders' avgjørelse.
3. **WB-01/02/03/05/06/07/09** er utelukkende Agency-/coach-rammer (Mac/iPad/
   coach-iPhone) i filer som ellers deler navn med denne bølgen — ingen
   spiller-perspektiv-ramme i noen av dem. Hører til Agency-workbench-scope
   (PX-2), ikke «Player-workbench».
4. **WB-08** (gruppe-versjon-konflikt, «Godta gruppeendring»/«Behold min
   versjon») og **WB-10** (inline «Ikke delta» på en allerede-publisert
   gruppeøkt i agendaen) krever domene som ikke finnes ennå: hhv.
   sesjon-versjonering/diff, og en ny server action for å sette
   `hiddenByPlayer` utenfor godkjenningsflyten. Anti-scope (ny funksjon).
5. **P-01/02/03/04/08/09 Mac** rendres av `WorkbenchV2.tsx` — 3300 linjer,
   delt coach/spiller, allerede TL-token-portert (281 `TL.*`-treff) men
   aldri pikseldiffet mot fasiten. Worktreen har kun dummy DB (se
   gotchas.md), ingen skjermbilde-verifikasjon mulig — for stort/risikabelt
   å endre blindt i én økt. Fant én reell kandidat (P-01 sier «ingen
   Publiser» for spiller, koden viser knappen fortsatt) — notert i begge
   økter, ikke rettet (kan være tilsiktet selvbetjening, en business-logic-
   avgjørelse, ikke en pikseljustering).
6. **RU-03** («Runde Mac») er fasitens egen bunntekst: «PH-12 urørt» — dette
   ER desktop-visningen av PH-12 (Analyse én runde), PH-familiens scope
   (PX-1), ikke RU. `RundeDetaljV2.tsx` (PH-12) mangler for øvrig fasitens
   380px «Runden mot snittet»-panel — notert som PH-gap, ikke rørt her.

Se `docs/feillogg.md` (2026-08-29-linjene) for full begrunnelse per punkt.

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
