# DESIGN-SYSTEM — Train-lock

Én fasit for alle flater: Player HQ · Workbench · AgencyOS · AgenticOS · Jarvis · Foreldreportal.
`HANDOFF.md` er historikken og IA-fasiten. **Denne filen er look-fasiten.** Ved konflikt vinner HANDOFF på struktur, DESIGN-SYSTEM på visuelle verdier.

Rekkefølge for en ny designsession:
1. Les denne filen.
2. Finn skjermen i `SCREEN-INDEX.md`, åpne nærmeste eksisterende fil.
3. Kopier mønsteret derfra. Ikke oppfinn nye mønstre når et finnes.

Skal skjermene porteres til kode: les `PORTING.md`.

---

## 1 · Tokens

### Mørk (default)

| Rolle | Verdi | Brukes til |
|---|---|---|
| scene | `#000000` | Sidebakgrunn, skjermbakgrunn |
| elev | `#161616` | Kort, ark, paneler |
| dock | `#1C1C1E` | Dock, rail, felt, sheet, sekundærpille-fyll |
| hair | `#FFFFFF14` | Kanter, delelinjer, inset-ring |
| dim | `#2C2C2E` | Tomme spor, prikk-av, sekundær knapp-flate |
| text | `#F5F5F5` | Primærtekst, ikoner |
| mute | `#8E8E93` | Sekundærtekst, caps-etiketter, inaktive ikoner |
| fill / on-fill | `#FFFFFF` / `#000000` | Primær CTA |
| target | `#0A84FF` | Fokus, lenke, aktiv, progresjon, mållinje |
| ok | `#30D158` | **Kun** Player «Godta» og reelle godkjent-tilstander |
| warn | `#FFD60A` | Varsel som ikke er feil |
| danger | `#FF453A` | **Kun** faktisk feil |
| warm | `#B85C3D` | Logo-prikk + fullført-hake/ring |
| shot | `#B08968` | Spredningsprikker |
| avatar | `#B08968` / tekst `#201409` | ØR-sirkelen, alle initialer |

### Lys (samme geometri, inverterte flater)

scene `#FFFFFF` · elev `#F2F2F2` · dock `#E9E9EB` · hair `#00000014` · dim `#DDDDDE` · text `#111111` · mute `#6E6E73` · fill `#000000` / on-fill `#FFFFFF` · danger `#FF3B30` · ok `#34C759` · avatar/warm/shot uendret.

Rammechrome i lys modus: bezel `#E9E9EB`, ytre bezel `#D3D3D6`, notch `#E5E5E7`, slagskygge `rgba(0,0,0,0.18)`, sidebakgrunn `#F7F7F8`.

### Forbudt

Gradient og glass (`backdrop-filter`, blur) — eneste unntak er `repeating-linear-gradient` som timeline-hairline i uke-rutenett. Emoji. Heatmap, regnbue, køllefarger, lime. Grønn på «fullført» (bruk warm). Rødt på negative tall (bruk `opacity: 0.45`). Farge på DRAFT/SKJULT-merker (caps mute). Ok-grønn i AgenticOS. Paper-tokens på Player. User-ikon (bruk ØR-avataren). Nye tokens.

---

## 2 · Geometri og spacing

| Ting | Verdi |
|---|---|
| Kort-radius | 20 (små innkort 12–14, rutenett-kort 5–8) |
| Pille / CTA / dock | 999 |
| Felt / input | 16 |
| Ark / sheet | 24 24 0 0 |
| Løft (gap-skala) | 8 · 12 · 16 · 20 |
| Seksjonsavstand | `margin-top: 22px` før caps-etikett, `14px` mellom kort, `10px` mellom rader i samme gruppe |
| Skjerm-padding mobil | `8px 20px` innhold, `96px` bunn når dock finnes |
| Skjerm-padding desktop | `22px 26px` innhold, rail 232, inspektør 300–380 |
| Trykkflate | min 44, CTA 48, mobil-dock 64h |
| Kortpadding | 16–18 mobil, 18–22 desktop |

Alltid `display: flex`/`grid` + `gap`. Aldri whitespace-avstand mellom UI-søsken.
Materiale er opaque. Sheet ligger over innhold; innhold scroller bak dock — ingen padding-kloss.

---

## 3 · Type

| Rolle | Verdi |
|---|---|
| Tittel | 34 / 700 / `-0.02em` |
| Kort-tittel | 26 / 700 (mobil 20–22) |
| CTA | 16 / 700 (sekundær 15 / 600) |
| Kropp | 15 / 600 |
| Meta | 13 / 400–600, mute |
| Caps-etikett | 11 / 600 / `0.08em` / uppercase / mute (9–10 på merker i rutenett) |
| Store tall | 56–104 / 700 |
| Mono-caption under ramme | 11, `'SF Mono', ui-monospace, Menlo, monospace`, mute |

Font: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif`.
`font-variant-numeric: tabular-nums` på **alle** tall. Aldri under 9px.
Norsk format: `1 000,00` · `+0,18` · `22.08.2026` · `09.00–13.00`.

---

## 4 · Motion

Kort inn 520ms `translateY(18px)` + opacity, stagger 70ms · ark inn 440ms fra bunn · press `scale(0.97)` 180ms · easing `cubic-bezier(0.32, 0.72, 0, 1)`. Kun `transform` og `opacity`.

---

## 5 · Komponenter — gjenbruk, ikke gjenskap

| Komponent | Anatomi | Fasit-fil |
|---|---|---|
| Nå-kort / Neste-kort | elev, radius 20, caps-etikett + tittel 22/700 + meta mute | `PH-01 I dag.dc.html` |
| Agenda-rad | elev radius 20: tid 15/700 (46 bred) \| hairline \| tittel + meta \| chevron. Muted = `opacity: 0.5` | `FO-03 Bookinger.dc.html` |
| Liste-rad | tittel 15/600 + meta 13 mute, `border-bottom: 1px solid hair`, høyre-tall tabular | `FO-05 Fakturaer.dc.html` |
| Bento | 2 kolonner, gap 12, caps-etikett + tall 34/700 | `FO-09 Ukerapport.dc.html` |
| Pyramide-snapshot | 5 stolper, `background: text` med opacity 1 → 0.28, aldri farge per nivå | `FO-02 Barn.dc.html` |
| Prikk-måned | grid 10 kolonner, gap 6, fylt = text, tom = dim. Ingen streak/teller | `FO-02` / `PH-01` |
| Toggle | 51×31, av = dim, på = text, knott = scene | `FO-06 Innstillinger.dc.html` |
| ØR-avatar | sirkel `#B08968`, initial `#201409`, 38–48px | `FO-02` |
| Uke-rutenett | timekolonne 48, `repeating-linear-gradient` hairline, kort `#1C1C1E` radius 5–8 | `WB-02 Uke komplett 3 skall.dc.html` |
| Publish-confirm | checkbox per økt + tellelinje + status-caps + hvit «Publiser alle · N» | `WB-03 Publish confirm 3 skall.dc.html` |
| DispersionMap | stilisert hull, siktlinje hvit 20 % stiplet 4–5, shot-prikker `#B08968`, 1σ-ellipse kun n ≥ 5 | `TM-08 Okt med hullkart.dc.html` |
| Godkjenn-kort (agent) | caps-undertype + tittel + diff-linje + hvit «Godkjenn» + hairline «Avvis» | `AO-12 Godkjenningspolicy A3 B1 C3.dc.html` |
| Rail / tabbar | fem destinasjoner, samme rekkefølge mobil og desktop | `AX-01 Skall rail og tabbar.dc.html` |
| Telefonramme | 390×844 eller 393×852, radius 54, notch 122×36, hjemmeindikator 140×5 | `FO-02` |

---

## 6 · Knappe-matrise

| Knapp | Farge | Hvor |
|---|---|---|
| Én primær per skjerm | `fill` / `on-fill` | Alltid — aldri to hvite i samme ramme |
| Sekundær | hairline-ring, mute tekst | Ved siden av primær |
| Tertiær | `dim`-flate, text | Pause, Avbryt, Angre |
| Godta | ok-grønn | **Kun** Workbench Player (WB-04) |
| Godta gruppeendring | hvit | WB-08 |
| Behold min versjon | hairline | WB-08 |
| Ikke delta / Delta likevel | dim | Player, origin GRUPPE |
| Publiser | hvit | Agency uke — skjermens eneste primær |
| Godkjenn start / Godkjenn | hvit | AgenticOS (aldri grønn) |
| Merge stengt | `#1C1C1E` + mute + caps STENGT | Jarvis når eval er rød |

Statusmerker er alltid caps mute: `UTKAST` · `SKJULT` · `LESEVISNING` · `VENTER START`. Feil er caps danger, aldri fylt flate.

---

## 7 · Copy

Norsk bokmål. «Økt», ikke «session». Vokabular: FYS / TEK / SLAG / SPILL / TURN.
Tom-tilstand er en **hel setning** med et menneskelig poeng — aldri «Ingen data»:
- «Ingen barn er koblet ennå.»
- «Ingen økt publisert i dag. Hvile er også trening.»
- «Ingen som venter. Research lander i Cockpit.»

Aldri fabrikkerte tall i en tom-tilstand. Proveniens er én linje: «Foreslått av Jarvis · godkjent av Anders · 24.08.2026».

---

## 8 · Personvern

Forelder ser kun eget barns fornavn og aggregerte tall — aldri andre spillere, aldri medisinsk/skadedetalj. Logg IDs, ikke navn. Agenten skriver aldri PUBLISHED eller gruppe-master direkte. DRAFT er usynlig for spiller. «Ikke delta» skjuler (`hiddenByPlayer`), sletter aldri.

---

## 9 · Filkonvensjon

- Navn: `PREFIKS-NN <norsk navn>.dc.html`, lys variant `PREFIKS-NNL <navn> lys.dc.html`.
- **ASCII i filnavn** — `Okt`, `Okonomi`, ikke `Økt`. Æ/ø/å og tankestrek bryter batch-verktøy.
- Én ramme = ett `<section>`/`<div>` med `data-screen-label="<ID> <kontekst>"` + mono-caption under.
- Alle stiler inline. Kun `@font-face`, `@keyframes` og body-reset i `<helmet><style>`.
- Prefikser: PH Player · WB Workbench · A AgencyOS · AO AgenticOS · AX skall · JV Jarvis · TM TrackMan · FO forelder · KA kalender · RU runde · S3 · BO booking · LO login · GP gameplan · EC økonomi · MAT materialer · GAP tilstander.

---

## 10 · Sjekkliste før levering

1. Scene er `#000000` (mørk) / `#FFFFFF` (lys) — ingen mellomtoner.
2. Én hvit primær per ramme.
3. Alle tall `tabular-nums`, norsk format.
4. Ingen gradient utenom rutenett-hairline, ingen blur, ingen emoji.
5. Ok-grønn kun der matrisen tillater det; warm på fullført.
6. Tom-tilstander er hele setninger uten tall.
7. `data-screen-label` på hver ramme, mono-caption under.
8. Rad oppdatert i `SCREEN-INDEX.md`.
