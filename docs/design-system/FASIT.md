# Designsystem-fasit — AK Golf HQ v2

> **Låst 2026-07-20 · oppdatert 2026-07-23 (tema-fasit + B-pakke).** Ved konflikt vinner denne fila + `tokens/v2/tokens.css` i Claude Design
> + `src/lib/v2/tokens.ts` / `--v2-*` i `globals.css`. Tema-detalj: [`TEMA-LYS-MORK.md`](./TEMA-LYS-MORK.md). Aldri gjett farger eller navn.

**Claude Design:** https://claude.ai/design/p/bb9b2b1d-ce2b-4757-be37-ee2096ba9d0d  
**Visuell retning:** C «Presis» (valgt 9. juli 2026)  
**Opplevelses-retning PlayerHQ:** **B-pakken** (valgt 2026-07-21–22) — se §3b

**Utviklingsplan (GO 2026-07-22):**  
`docs/design-system/plattform-design-2026-07-21/UTVIKLINGSPLAN-DESIGN.md`

---

## 1. Produkter og tema

| Produkt | Rute | Tema | Bryter? |
|---|---|---|---|
| **PlayerHQ** | `/portal` | **Alltid lys** (B28) | Nei |
| **AgencyOS** | `/admin` | Lys/mørk, **standard mørk** | Ja (cookie `ak-v2-tema`) |
| **Forelder** | `/forelder` | Lys | Nei |
| **Marketing** | `akgolf.no` | Begge (hero kan være mørk) | N/A |
| **Auth** | `/auth` | Lys | Nei |

- Cookie/attributt: `ak-v2-tema` + `html[data-v2-tema="light"]` — se [`TEMA-LYS-MORK.md`](./TEMA-LYS-MORK.md).
- «Mørk-først» = v2 CSS `:root` er mørk — **ikke** at PlayerHQ er mørk.
- PlayerHQ tvinges lys i `V2Shell` selv om coach har mørk preferanse fra AgencyOS.

**Navn (låst):** AgencyOS (aldri «CoachHQ»). PlayerHQ. Presisjonsstrategi (aldri «DECADE» i UI).

---

## 2. Tokens (ene kilde)

| Kilde | Bruk |
|---|---|
| Claude Design `tokens/v2/tokens.css` | Design-fasit |
| Prod `src/app/globals.css` `--v2-*` | Runtime (ENESTE CSS-kilde i prod) |
| Prod `src/lib/v2/tokens.ts` (`T`) | TS/React inline |

> **Rydding 2026-07-24:** gammel `src/styles/v2/tokens.css` (uimportert kopi med utdaterte
> verdier, bl.a. `#0D0E0D`-canvas) er SLETTET. Runtime-fasit er `--v2-*` i `globals.css` —
> aldri gjenopprett en parallell tokens-CSS i prod.

**Merkevare (hue, aldri endre uten beslutning):**
- Forest `#005840`
- Lime `#D1F843` (mørk: CTA/valgt; **lys: remappes til forest** — aldri lime-på-lys)
- On-lime: mørk `#0D0E0D` · lys `#FFFFFF`

**Mørk canvas:** `#131513` (`--v2-bg`) — ikke gammel `#0A1F18` / `#0A0B0A`.  
**Lys canvas:** `#F2F1EA` cream. PWA-manifestet (splash/chrome) speiler LYS canvas
(start_url er `/portal` = alltid lys, B28).

**Typografi:** Familjen Grotesk (display) · Inter (UI) · JetBrains Mono (tall).  
**Ikoner:** Lucide 1.5px — aldri emoji.  
**Grid:** 8pt **på layout-nivå** (seksjons-gap, kort-gap = `T.gap` 16, sidemarger).
Komponent-INTERIØR følger mockup-pikslene fra Claude Design 1:1 (der finnes 6/9/11.5-verdier)
— mockupen er fasit, ESLint-gaten håndhever 8pt kun for Tailwind-klasser.
Kort-radius 20px. Piller 9999px.

**Kontrast (målt 2026-07-24, WCAG AA):** alle tekst-tokens (`fg`/`fg2`/`mut`) og
signal-/aksefarger holder ≥ 4,5:1 som normal tekst på alle fire flater (bg/panel/panel2/panel3)
i BÅDE mørk og lys skala. Lys `up`/`down`/`warn`/`ax-spill` ble AA-kalibrert 2026-07-24
(`#1a7745` / `#b4461c` / `#8a6109` / `#5a7200`). Nye farger må måles før de tas inn.

---

## 3. Enkelhet og færrest trykk (LÅST — Anders 2026-07-21)

> **Kraftig under panseret · enkelt i ansiktet.**  
> Alle funksjoner beholdes. Appen skal likevel være super enkel å bruke.

### Hard regel

1. **Behold funksjoner** — redesign/kode kaster ikke muligheter; vi skjuler og prioriterer.
2. **Minst mulig trykk** — færrest steg fra åpnet app til «det jeg skal gjøre nå».
3. **Super enkelt** — en smart person uten teknisk bakgrunn forstår skjermen på første lesning.
4. **Vanskelig = feil design** — da er UI/flyt feil, ikke brukeren. Fiks hierarki/flyt, ikke legg til mer forklaringstekst alene.

### Skjerm-test (må bestå før «ferdig»)

| Test | Krav |
|---|---|
| **5 sekunder** | Brukeren ser *hva som er viktig* og *hva som er neste steg* |
| **Én hovedhandling** | Én primær CTA (lime/forest) — resten er sekundært |
| **Trykk-tall** | Primærjobben på skjermen: så få trykk som mulig (mål: 1–2 fra hub) |
| **Første lag rent** | Dybde/ekspert-valg kommer *etter* primærhandling — ikke alt synlig samtidig |
| **Klarspråk** | Ordbok: nærspill ikke ARG, osv. HjelpTips på tall/fagord |
| **Tom tilstand** | Alltid ærlig tom + *én* vei videre |

### Spilleren vs coach

- **PlayerHQ / Forelder:** enklest mulig. «Hva nå?» først. Faglig dybde bak faner/detalj.
- **AgencyOS:** mer makt og oversikt tillatt — men fortsatt *tilstand på 5 s*, detalj på 30 s. Ikke dump hele systemet på én flate.

### Forbudt i navn av «enklere»

- Fjerne funksjoner uten eksplisitt GO fra Anders
- Flere knapper som «løsning» på kompleksitet
- Sjargong uten «?»
- Blindveier (tom skjerm uten neste steg)

---

## 3b. Opplevelse B-pakken (LÅST — Anders 2026-07-21–22)

> **Oversikt før handling.** Tall og status synlig. Én grønn hovedknapp.  
> Ikke «bare start» (A). Ikke lang coach-tekst først (C).  
> Detaljer: `plattform-design-2026-07-21/RETNING-B-PAKKE.md`

### Dommerskjermer (må matche B)

| Skjerm | Retning | Kort |
|---|---|---|
| **Hjem** | Form + plan | Form-tall + dagens plan + Start |
| **Plan** | Uke + status | Volum/gjort/fokus + økt + Bekreft/Start |
| **Analyse** | Form + nedbrytning | Total SG + fire områder (svakest uthevet) + Planlegg |

### Felles følelse (hele PlayerHQ arver)

1. **Oversikt før handling** — form/status synlig, ikke tom flate med bare én knapp.
2. **Én grønn hovedknapp** per skjerm — resten er sekundært (lenker, ghost).
3. **5 sekunder** — standpunkt + neste steg er opplagt.
4. **Klarspråk** — nærspill, innspill, tee-slag (ikke ARG i spiller-UI). HjelpTips på fagord.
5. **Bro:** Analyse → Planlegg → Plan/Workbench → Start (Hjem).

### AgencyOS

Samme idé (oversikt + én hovedhandling + 5s-test), men **mørk standard** og mer makt/detalj tillatt.

### Forbudt som hovedretning

- **A** (ekstrem minimal / bare vedtak) som default for PlayerHQ
- **C** (lang fortelling/coach først) som hovedlayout  
  (Kort coach-melding *inne i* B er OK senere)

### Byggeklosser (steg 2)

| Kloss | Bruk | Kode (v2) |
|---|---|---|
| Primær CTA | Én grønn handling | `CTAPill` |
| Form-kort | SG + trend + status | `TallHero` + `Trend` + `StatusPill` i `Kort` |
| Plan/økt-kort | Dagens eller valgt økt | `Kort` + `AkseChip` + `Rad` |
| SG-områder | Fire rader, svakest tykkest | `FordelingRad` / `SgKategorier` |
| Uke-status | Planlagt / gjort / % | `KpiFlis` + `ProgresjonsBar` / uke-stripe |
| Tom / laster / feil | Alltid vei videre | `TomTilstand`, laste-skjelett, feil-komponenter |

Nye sider skal **komponere disse**, ikke finne opp ny hierarki-stil.

---

## 4. Visuelle regler (kort)

1. **Én lime-jobb per skjerm** (CTA / valgt fane / aktiv pin) — ikke tre steder.
2. **Data opp/ned** = `--v2-up` / `--v2-down` — aldri lime for delta.
3. **Elevation:** mørk = lysere panel; lys = myk skygge. Ikke borders som elevation i mørk.
4. **Tall:** mono, enhet alltid, «—» for manglende, norsk komma.
5. **Anbefalinger, aldri sperrer** — klarspråk i spillerflater.
6. **HjelpTips («?»)** på alle tall/faguttrykk i v2-skjermer.
7. **Wireframe først** i 390 / 834 / 1280 (+ 1680 AgencyOS) før hi-fi.

---

## 4b. Motion-katalog (LÅST kilde: `src/styles/v2/motion.css`)

**Ett bevegelsesspråk:** `cubic-bezier(0.2, 0, 0, 1)` · 180 ms interaksjon · 200 ms
inn-animasjon · 600 ms count-up (JS). ALT honorerer `prefers-reduced-motion`.

All v2-interaksjons-CSS bor STATISK i `src/styles/v2/motion.css` (importert via
`globals.css`) — aldri runtime-injisert `<style>` i komponentfiler (fjernet 2026-07-24;
ga FOUC og spredte kanon over 8 filer). Nye klasser legges i katalogen, aldri ad-hoc.

| Klasse | Jobb |
|---|---|
| `.v2-press` | Trykk-skala 0.98 på knapper/kort |
| `.v2-focus` | Fokusring (bg + 55 % lime) på `:focus-visible` |
| `.v2-row-h` / `.v2-kort-h` | Hover: rad-bakgrunn / kort-løft −2px |
| `.v2-drag-lift` / `.v2-drag-settle` | Workbench dra-løft + landing |
| `.v2-fade-in` / `.v2-sheet-in` / `.v2-backdrop-in` | Inn-animasjon for innhold / ark+popup / backdrop |
| `.v2-skel` | Skeleton-puls (V2Laster) |
| `.v2-blink` | «Skriver»-prikker (samtale/Caddie) |
| `mic-wave/-pulse/-spin` | Taleknapp |
| `.v2-nps-grid/-knapp` | Responsiv NPS-skala (media query) |
| `.v2-tekstlenke` | Stille lenke med hover-understrek |
| `.v2-md` | Markdown-innhold (Caddie) |

**Overlay-kontrakt (delt `BunnArk`):** inn-animasjon fra katalogen + backdrop-fade,
fokus flyttes inn og gjenopprettes ved lukking, Tab holdes innenfor (fokus-felle),
body-scroll låses, Escape lukker. Nye ark/dialoger skal BRUKE `BunnArk` — aldri egen overlay.
Eldre pulse-animasjoner (`patterns.css`: itinPulse, nowPulse, liveBarDot m.fl.) er
overgangs-vokabular for eldre flater — nye skjermer bruker katalogen over.

---

## 5. Komponentbibliotek (Claude Design)

~**124** navngitte komponenter i `components/` (13 familier):

| Familie | Rolle |
|---|---|
| core | Button, Card, Tag, Icon, ThemeToggle… |
| forms | Input, Select, DatePicker… |
| overlays | Modal, Sheet, Drawer, Toast… |
| structure | Avatar, EmptyState, Skeleton… |
| data | KpiTile, DataTable, charts… |
| domain | AnbefalingsKort, SpillerKort, BookingKort… |
| golfdata | SG/analyse (overgang — nye flater bruker v2) |
| trackman | DispersionPlot, TrajectoryPlot… |
| calendar | DayStrip, UkeKalender, Periodeplan… |
| nav | BottomNav, NavRail, SpillerGruppeVeksler… |
| feedback | AiTipCard, HjelpPopover, ValidationChip… |
| kategori | KategoriStige, TidsPyramide… |
| marketing | FeaturedCard… |

**Ferdig komponent =** default + hover + focus + disabled + loading + empty + error  
(+ drag-over der relevant) × lys + mørk der begge brukes × `.d.ts` + `.prompt.md` + demo.

**Gap-regel:** mangler mønster → ny komponent i systemet først, aldri ad-hoc i én skjerm.

---

## 6. Skjerm-familier (for PlayerHQ + AgencyOS)

| Familie | Eksempel | Mobil | Desktop |
|---|---|---|---|
| Shell | layout + nav | Bunn-nav 5 | Ikon-rail |
| Hub | hjem / cockpit | 1 hero-tall | Grid KPI |
| Liste | stall / runder | Kortliste | Tabell |
| Detalj | spiller 360 | Stack | Split |
| Wizard | ny plan / booking | Full steg | Steg + preview |
| Live | økt / tapper | Fullskjerm | Fullskjerm |
| Analyse | SG-hub / faner | Faner stack | Faner + sidepanel |
| Kalender | uke / måned | Dag + stripe | Uke/måned grid |

---

## 7. Rekkefølge (låst — GO 2026-07-22)

1. ~~Designsystem + B-pakke i fasit~~ (steg 1)  
2. Felles B-klosser i kode (steg 2)  
3. Dommerskjermer Hjem / Plan / Analyse = 100 % B (steg 3)  
4. PlayerHQ resten via 8 familier (steg 4)  
5. Forelder (steg 5)  
6. AgencyOS (steg 6)  
7. Auth / marketing / system (steg 7)  
8. Konsistens-pass + fasit-oppdatering (steg 8)  

Full plan: `plattform-design-2026-07-21/UTVIKLINGSPLAN-DESIGN.md`  

Aldri: VibeUI/ekstern stil som kilde. Unntak bare etter ny 3-veis-test med Anders.

---

## 8. Skills (etter oppdatering 2026-07-20)

| Skill | Bruk |
|---|---|
| `akgolf-design-system` | Tokens, lovlige farger/navn, review mot fasit |
| `ak-designekspert` | Tenking, wireframe, kritikk, golf-analyse-UI |
| `ak-golf-hq-design` | **Ikke bruk** — utdatert (CoachHQ/Inter Tight) |

---

## 9. Status / gap (2026-07-22)

**Solid:** tokens mørk+lys, ~124 komponenter, inventar 361 sider, B-pakke låst på 3 dommerskjermer.

**Ferdig:**
- [x] FASIT tokens + Presis
- [x] B-pakke valgt (Hjem / Plan / Analyse)
- [x] B skrevet inn i denne filen (§3b) — steg 1
- [x] Design-boards + 3-retnings-tester i `plattform-design-2026-07-21/`
- [x] Inventar 361 med familie + hi-fi-ref

**Pågår (GO 2026-07-22):**
- [x] Steg 2: B-klosser verifisert (`B-KLOSSER.md`)
- [x] Steg 3: Hjem / Plan / Analyse B i app
- [ ] Steg 4–8: se utviklingsplan

**Systemløft 2026-07-24 (GO Anders — «ingenting låst, gjør det optimalt»):**
- [x] Én token-kilde: død `src/styles/v2/tokens.css` slettet; PWA-manifest rettet til lys canvas
- [x] Motion-katalog statisk i `src/styles/v2/motion.css` (§4b) — 8 runtime-injeksjoner fjernet
- [x] `BunnArk`: inn-animasjon + backdrop-fade + fokus-felle + scroll-lås (overlay-kontrakten)
- [x] Lys skala AA-kalibrert (`up`/`down`/`warn`/`ax-spill`) — kontrast målt på alle flater
- [x] Zoom-sperre fjernet (WCAG 1.4.4) i rot-viewport
- [x] Ordbok-pass spiller-UI: Tee-slag/Innspill/Nærspill (TreningLogg, statistikk, hull-analyse)
- Full auditrapport: `DESIGN-KVALITETSAUDIT-2026-07-24.md` (funn D1–D10)

**Ikke i scope denne uken:** full kodeport av alle 361 sider.
