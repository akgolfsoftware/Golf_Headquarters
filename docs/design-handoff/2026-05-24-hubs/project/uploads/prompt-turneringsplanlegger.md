# Prompt — PlayerHQ Turneringsplanlegger (komplett)

> **Bruk:** Lim inn `00-design.md` FØRST i Claude Design (eller v3-bundlens design-system). Deretter lim inn alt etter linjen nedenfor.

---

Lag én komplett, standalone HTML-fil for **AK Golf PlayerHQ — Turneringsplanlegger**. Desktop-skjerm 1600×variabel høyde. Single self-contained `.html` med inline `<style>`, Google Fonts via `<link>`, alle ikoner inline SVG (Lucide-stil stroke 1.75).

**Følg AK Golf design system STRENGT** (cream `#FAFAF7`, forest `#005840`, lime `#D1F843`, Inter Tight + Inter + JetBrains Mono + Instrument Serif italic, Lucide-ikoner, INGEN emojier, norsk bokmål).

## Hva skjermen er

Turneringsplanleggeren er én av PlayerHQ's 7 MVP-funksjoner. Den lar spilleren:

1. **Se sesongens turneringer** på tidslinje + tabell
2. **Markere hovedmål** (lime-stjerne) — typisk 2–4 turneringer per sesong
3. **Prioritere** turneringer som MAJOR / NORMAL / LOCAL
4. **Se forberedelses-status** for hver turnering (hva er trent, hva gjenstår)
5. **RSVP og resultat-historikk** for fullførte turneringer
6. **Knytte turneringer til årsplanens konkurranseperiode**
7. **Countdown** til neste hovedmål-turnering

**Rute:** `/portal/tren/turneringer`

**Persona:** Markus Røinås Pedersen — HCP +3,5, kategori A1, hjemmebane GFGK.

## Layout

Følger TPK05 Spiller Workbench Pro-mønster: Linear sidebar + topbar + komprimert hero + Gantt-strip + hovedinnhold + sticky footer.

### Chrome
- **Sidebar 220px** (forest bg): "AK GOLF / PLAYERHQ · PRO" + Markus-profil + nav-grupper (HJEM / TRENING [Turneringer aktiv] / INNSIKT)
- **Topbar 56px**: ⌘K + breadcrumb "Trening / Turneringer" + role-toggle (Spiller/Forelder)

### Hero (80px)
- Eyebrow JetBrains Mono uppercase: `SESONG 2026 · 14 TURNERINGER · 3 HOVEDMÅL · NESTE OM 21 DAGER`
- Title Inter Tight 32px: `Mine ` + Instrument Serif italic `*turneringer*` + ` — sesong, prioritet, forberedelse`
- 4 actions rounded-pill høyre:
  1. `+ Legg til turnering` (lime, primary)
  2. `Importer fra GolfBox` (forest)
  3. `Filtre` (outline)
  4. `Eksporter sesong` (outline)

### Årsplan-Gantt strip (120px) — SYNLIG HELE TIDEN
Horizontal tidslinje jan→des 2026 med:
- Periode-blokker (Mac O'Grady-faser): GRUNNTRENING (lys grønn) · OPPBYGGING (medium) · SPESIALISERING (forest) · KONKURRANSE (lime) · OVERGANG (cream) · HVILE (muted)
- Turneringer som vertikale markører på sin dato:
  - **Lime stjerne (24px)** for HOVEDMÅL (Sørlandsåpent, NM Slag, Klubbmesterskapet)
  - **Forest sirkel (16px)** for NORMAL prioritet
  - **Cream sirkel + border (12px)** for LOCAL prioritet
- Hover på markør: tooltip med navn + dato + status
- Klikk: hopper til den turneringen i tabellen under
- Today-pin (vertikal lime linje) på dagens dato

---

## Hovedinnhold

To paneler side om side:

### Venstre panel: Turneringsliste (60% bredde)

#### Filter-bar (50px)
4 grupper:
1. **Status**: Alle · Kommende · Pågående · Fullført (segmented control)
2. **Prioritet**: Alle · Hovedmål · MAJOR · NORMAL · LOCAL (pills)
3. **Periode**: Alle · Vår · Sommer · Høst (pills)
4. **Sortering**: Etter dato (default) · Etter prioritet · Etter avstand

#### Turnerings-cards (én per turnering)

Hver card (16px border-radius, hvit bg, border):

**Topp-rad** (32px):
- Venstre: Prioritets-badge (lime "HOVEDMÅL" + stjerne / forest "MAJOR" / cream "NORMAL" / outline "LOCAL")
- Senter: Status-badge (kommende: cream + forest tekst / pågående: lime puls / fullført: muted)
- Høyre: Countdown mono "om 21 dager" / "i dag" / "5 dager siden" / dato-spenn

**Hovedrad** (~80px):
- **Venstre 80px**: Dato-blokk (mono stor "16. juni" + mono mindre "2026")
- **Senter**: Turnerings-info
  - Tittel Inter Tight 18px: "Sørlandsåpent 2026"
  - Sub mono small: "Mandalkrysset GK · Mandal · 36-hulls · slagspill"
  - Discipline-pills (de jeg trener mest mot): TEK · SLAG · SPILL · TURN
- **Høyre 200px**: Forberedelses-bar
  - Label "Forberedelse" mono 11px
  - Progress-bar (gradient lime→forest) 78%
  - Sub "12 av 15 mål-økter fullført"

**Bunn-rad** (40px, kun ved expand eller for hovedmål):
- **Resultat-mål** (hvis satt): "Top 10 · sub-72 snitt" mono
- **Forrige resultat** (hvis spilt før): "2025: T12 · -3 / +1 / +0"
- **Action-rad**: 
  - `Detaljer` (outline)
  - `Forberedelse` (outline)
  - `Endre prioritet` (outline)
  - `Registrer resultat` (forest, kun fullført)

**Hover-effekt:** subtil skygge + lime venstre-border (4px)

#### Eksempel-data (sesong 2026)

**HOVEDMÅL (lime stjerne) — 3 turneringer:**
1. **16. juni 2026** — Sørlandsåpent 2026 (Mandalkrysset GK) — 78% forberedt — mål: Top 10
2. **22. juli 2026** — NM Slag 2026 (Bærum GK) — 45% forberedt — mål: Top 20
3. **28. august 2026** — Klubbmesterskapet GFGK 2026 — 22% forberedt — mål: Vinne

**MAJOR (forest) — 4 turneringer:**
4. **3. juni 2026** — Srixon Tour stop 2 (Borre GK) — kvalifisering for NM
5. **11. juli 2026** — Nordic Junior Tour (Sverige) — internasjonal benchmark
6. **15. august 2026** — Srixon Tour stop 5 (Oslo GK)
7. **5. september 2026** — Srixon Tour final (Miklagard GK)

**NORMAL (cream) — 5 turneringer:**
8. 14. mai — Vår-cup GFGK
9. 28. mai — Onsoy GK Open
10. 18. juni — Bossum Open
11. 2. juli — Sommerturnering Asker GK
12. 12. september — Høst-cup GFGK

**LOCAL (outline) — 2 turneringer:**
13. 21. mai — Tirsdagsturnering GFGK
14. 4. juni — Tirsdagsturnering GFGK

**FULLFØRT (muted) — vis 2 historiske øverst med "Vis 8 til":**
- 18. april 2026 — Påske-cup GFGK — T4 · -2 / -1
- 5. april 2026 — Sesong-åpning GFGK — T8 · +1 / E

### Høyre panel: Detalj/Forberedelse (40% bredde, sticky)

Når en turnering er valgt fra venstre liste:

#### Header (60px)
- Tilbake-knapp (Lucide ChevronLeft)
- Tittel Inter Tight 20px: "Sørlandsåpent 2026"
- Prioritet-badge

#### Countdown-card (lime accent, 120px)
- Stort mono-tall: "21" + "DAGER" label
- Sub Inter Tight: "Mandag 16. juni · Mandalkrysset GK"
- Mini-strip: "Reisetid 4t · Bane: par 71 · 6 423m"
- CTA: "Åpne baneguide" (outline)

#### Forberedelses-status (gjeldende plan)
Tittel: "Forberedelse" + progress 78%

Liste med 5 sub-mål (fra årsplanens konkurranseperiode):
1. **TEK** Iron-progresjon (5-PW konsistens) — 4 av 5 økter — lime checkmark
2. **SLAG** Putting <2,5m — 3 av 4 økter — lime checkmark
3. **SPILL** Course management Mandalkrysset — 2 av 3 økter — forest progresjon
4. **TURN** Mental rutine (warm-up + tee-routine) — 1 av 2 økter — forest progresjon
5. **FYS** Utholdenhet 36-hulls dag — 2 av 3 økter — forest progresjon

Hver rad er klikkbar — åpner relatert økt eller plan-detalj.

#### Resultatmål (kun for hovedmål-turneringer)
- "Top 10" stor display
- Sub: "Sub-72 snitt over 2 runder"
- Sannsynlighet basert på form: "65% sannsynlig" + mini-graf

#### Historikk (kun hvis spilt før)
Tabell med 3 forrige forsøk:
| År | Plassering | R1 | R2 | Sum | SG-Total |
|---|---|---|---|---|---|
| 2025 | T12 | -3 | +1 | -2 | +0,8 |
| 2024 | T18 | E | -2 | -2 | +0,3 |
| 2023 | T28 | +2 | +1 | +3 | -0,4 |

#### Bane-info (collapsible)
- Par 71 · 6 423m
- Greens: A1 bent, fast (Stimp 11+)
- Vind: vanligvis sør-sørøst 4-6 m/s
- Notater fra coach: "Holdene 4, 11 og 17 er nøkkelhullene"

#### Action-rad bunn
- `Be om forberedelse-plan` (forest, primary)
- `Avbestill` (destructive outline)
- `Endre prioritet` (outline)
- `Del med foreldre` (outline)

---

## Modal: + Legg til turnering

Åpnes fra "+ Legg til turnering" hero-knapp.

### Felt
1. **Turnering** — søk fra katalog (NGF, Srixon Tour, lokale) eller manuell oppretting
2. **Navn** (auto-fylt hvis fra katalog, ellers fritekst)
3. **Klubb/Bane** — søk i klubb-database
4. **Dato** — startdato + sluttdato (single eller fra-til)
5. **Format** — Slagspill / Matchspill / Stableford / Foursomes / Fourball (radio)
6. **Antall hull** — 18 / 36 / 54 / 72 (pills)
7. **Prioritet** — HOVEDMÅL / MAJOR / NORMAL / LOCAL (radio med beskrivelse)
8. **Resultatmål** (valgfri) — fritekst "Top 10" + "sub-72 snitt"
9. **Forberedelses-mål** — multiselect (FYS / TEK / SLAG / SPILL / TURN)
10. **Notat til coach** — fritekst

### Validering
- Kollisjon med eksisterende turnering samme dato → varsel
- Hovedmål >4 per sesong → varsel "Du har allerede 4 hovedmål — vurder å nedprioritere én"

### CTA
- **Legg til** (lime, primary)
- **Legg til + lag forberedelse-plan** (lime + Sparkles-ikon) — kobler til AI-plan
- **Avbryt** (outline)

---

## Modal: Endre prioritet

Enkel modal med 4 radio-buttons:
- **HOVEDMÅL** (lime stjerne) — "Topp-prestasjon, full forberedelse, anbefalt 2-4 per sesong"
- **MAJOR** (forest) — "Viktig turnering, dedikert forberedelse"
- **NORMAL** (cream) — "Normal turnering, generell forberedelse"
- **LOCAL** (outline) — "Lokal trening, lett deltakelse"

Når HOVEDMÅL velges og det er flere enn 4:
- Vis varsel
- Foreslå hvilken eksisterende hovedmål som bør nedgraderes

---

## Modal: Registrer resultat

For fullførte turneringer (åpnes fra "Registrer resultat"-knapp).

### Felt
1. **Plassering** — number input "T12"
2. **Antall deltakere** — number "67"
3. **Score per runde** — array av runde-rader:
   - Runde 1: 68 (-3 til par)
   - Runde 2: 72 (+1 til par)
4. **Totalsum** — auto-beregnet
5. **SG-data** — opp-koblings-link: "Importer fra GolfBox" eller "Skann scorekort"
6. **Notater** — fritekst (hva gikk bra, hva trenger mer trening)
7. **Coach-feedback ber om** — checkbox

### CTA
- **Lagre resultat** (lime, primary)
- **Lagre + send til coach** (lime + Send-ikon)
- **Avbryt** (outline)

Etter lagring:
- Resultat vises i historikk-tabell
- Auto-oppdatering av HCP-prognose
- Auto-oppdatering av SG-trend (hvis SG-data lagt inn)
- AI-coach-strip vises: "Basert på resultatet anbefaler jeg: fokus på putting kommende uke"

---

## Sticky footer (64px)

- **Venstre**: Pyramide-balanse-bar (5 disipliner FYS/TEK/SLAG/SPILL/TURN) med mini-prosent — "din kommende økt-fordeling: FYS 15% · TEK 30% · SLAG 25% · SPILL 20% · TURN 10%"
- **Senter**: Mini-status: "Neste hovedmål: Sørlandsåpent · 21 dager · 78% forberedt"
- **Høyre**: 
  - `Spør Coach Anders` (outline + Sparkles)
  - `+ Legg til turnering` (lime, primary)

---

## Tilstander å vise

1. **Default**: Liste med 14 turneringer, ingen valgt, høyre panel viser oversikt
2. **Turnering valgt**: Høyre panel viser detalj/forberedelse
3. **Modal åpen**: Legg-til-modal eller endre-prioritet-modal
4. **Tom sesong**: Empty state: "Ingen turneringer planlagt ennå" + lime CTA "Importer fra GolfBox"
5. **Konflikt**: Toast "To turneringer samme uke — vurder prioritering"

---

## AI-coach-strip (60px, under hero)

Lime-pastell pastel-stripe med Lucide Sparkles-ikon:

> **Anders sier:** Sørlandsåpent er 21 dager unna — du er 78% forberedt. Anbefaler 2 ekstra økter denne uka: én på putting <2,5m og én på course management. Skal jeg legge dem inn i planen?
> 
> CTA-knapper: `Ja, legg til` (lime) · `Vis forslagene først` (outline) · `Senere` (outline)

---

## Branding (følger AK Golf design system)

- BG cream `#FAFAF7`
- Card hvit `#FFFFFF` med border `#E5E3DD`
- Primary forest `#005840`, accent lime `#D1F843`
- Discipline-pills bruker FYS/TEK/SLAG/SPILL/TURN-farger
- Inter Tight (titler), Inter (UI), JetBrains Mono (alle tall, dato, klokkeslett, score)
- Instrument Serif italic sparsomt — `Instrument Serif italic på "turneringer"` i hero
- 16px radius cards, 12px buttons, 999px pills
- INGEN emojier, kun Lucide-ikoner stroke 1.75
- Norsk bokmål gjennomgående

## Tekniske krav

- Single self-contained `.html`
- Inline `<style>` block
- Google Fonts via `<link>`
- All icons inline Lucide SVG (stroke 1.75)
- Interaktivt Gantt-strip med klikkbare turnering-markører
- ~1800–2200 linjer HTML

## Constraints

- INGEN emojier
- ALL UI på norsk bokmål
- Diskipliner uppercase: FYS, TEK, SLAG, SPILL, TURN
- Tall norsk format: `+3,5`, `T12`, `−3` (minus-tegn ikke bindestrek)
- Klokkeslett 24h: `09:00`
- Dato: `16. juni 2026`
- Score relativt til par: `−3`, `E`, `+1`, ikke "under par" eller "over par" som tekst

Output: én komplett HTML-fil. Begin `<!DOCTYPE html>`, end `</html>`. Ingen forklaring utenfor kode-blokken.
