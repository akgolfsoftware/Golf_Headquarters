# Prompt — Coach-meldinger flyt (PlayerHQ komplett)

> **Bruk:** Lim inn `00-design.md` FØRST i Claude Design (eller v3-bundlens design-system). Deretter lim inn alt etter linjen nedenfor.

---

Lag én komplett, standalone HTML-fil for **AK Golf PlayerHQ — Coach-meldinger** (3 skjermer i samme dokument). Desktop-skjerm 1600×variabel høyde. Single self-contained `.html` med inline `<style>`, Google Fonts via `<link>`, alle ikoner inline SVG (Lucide-stil stroke 1.75).

**Følg AK Golf design system STRENGT** (cream `#FAFAF7`, forest `#005840`, lime `#D1F843`, Inter Tight + Inter + JetBrains Mono + Instrument Serif italic, Lucide-ikoner stroke 1.75, INGEN emojier, norsk bokmål).

## Hva skjermen er

Meldings-flyt mellom spiller (Markus) og coach (Anders) — der varm, direkte coach-tone møter rik vedleggsstøtte (videoer, drill-lenker, PDF-er, øvelses-referanser). 3 skjermer:

1. **`/portal/coach/melding`** — Tråd-oversikt (liste over alle samtaler)
2. **`/portal/coach/melding/[id]`** — Samtale-detalj (chat-vindu)
3. **`/portal/coach/melding/ny`** — Ny melding-skjema

**Persona:** Markus Røinås Pedersen — HCP +3,5, kategori A1, hjemmebane GFGK.

**Coach-tone:** "Anders sier:", "Hei Markus,", varmt og direkte, alltid på norsk bokmål.

## Layout (felles chrome)

### Chrome
- **Sidebar 220px** (forest bg): "AK GOLF / PLAYERHQ · PRO" + Markus-profil + nav-grupper (HJEM / TRENING / **COACH [aktiv]** / INNSIKT)
- **Topbar 56px**: ⌘K + breadcrumb "Coach / Meldinger" + role-toggle (Spiller/Forelder)

### Hero (80px, dynamisk per skjerm)
Title Inter Tight 32px med Instrument Serif italic på ett ord:
- Tråd-oversikt: `Mine ` + italic `*samtaler*` + ` — coach og akademiet`
- Samtale-detalj: `Samtale med ` + italic `*Anders*` + ` — coach`
- Ny melding: `Ny ` + italic `*melding*` + ` — til coach eller akademi`

### Tab-bar (44px)
Segmented: `OVERSIKT` · `SAMTALE` · `NY MELDING`

---

## SKJERM 1: `/portal/coach/melding` — Tråd-oversikt

### Eyebrow + actions
- Eyebrow: `MELDINGER · 4 SAMTALER AKTIVE · 2 ULESTE · SIST OPPDATERT FOR 14 MIN SIDEN`
- Actions:
  1. `+ Ny melding` (lime, primary)
  2. `Marker alle som lest` (forest)
  3. `Filtre` (outline)
  4. `Arkiv` (outline)

### Filter-bar (50px)
4 grupper:
1. **Status**: Alle · Uleste · Aktive · Arkiverte (segmented)
2. **Coach**: Alle · Anders · Erik · Maja · Foreldre-koordinator
3. **Type**: Alle · Personlig · Gruppe · System-melding
4. **Periode**: Siste uke · Måned · Alle

### Layout: To-kolonne
- Venstre 40%: tråd-liste
- Høyre 60%: hint-panel som viser "Velg en samtale for å lese" eller forhåndsvisning ved hover

### Tråd-liste (venstre)

Hver tråd-rad (80px høy, klikkbar — åpner tab "SAMTALE"):

**Layout per rad:**
- **Venstre 48px**: Avatar (portrett 40px sirkel) med uleste-prikk lime hvis ny
- **Senter (resterende bredde minus høyre 100px)**:
  - Topp: navn Inter Tight 14px + rolle-pill mono small (eks. `HEAD COACH`)
  - Snippet siste melding: Inter 12px, 1 linje truncated (`Hei Markus, her er feedback fra økten i går...`)
  - Sub-rad: type-pill liten + vedlegg-ikon hvis vedlegg
- **Høyre 100px**:
  - Tidsstempel mono `i dag 14:32` / `i går 09:14` / `18. mai`
  - Ulest-badge lime tall hvis uleste (`2`)

**Hover-effekt:** lime venstre-border 4px + svak skygge

### Eksempel-tråder (5-6)

1. **Anders Kristiansen — `HEAD COACH`** · "Hei Markus, fantastisk runde i dag — 68 (−3) på GFGK er solid forberedelse til Sørlandsåpent. Lar oss snakke om..." · vedlegg: PDF-runde-analyse · 2 uleste · `i dag 14:32`
2. **Anders Kristiansen — `HEAD COACH`** · "Sett opp ny økt mandag 10:00 i Performance Studio. Vi tar putting fra 2,5m..." · `i går 18:40`
3. **Erik Solli — `PUTTING-COACH`** · "Hei Markus, jeg har sett putting-rapporten din. Anbefaler stroke-justering — se video..." · vedlegg: video 2 min · 1 ulest · `i går 09:14`
4. **Maja Hagen — `JUNIOR-COACH`** · "Hei alle, husk samling lørdag 25. mai på GFGK kl 10:00. Vi tar..." · gruppe-melding 8 mottakere · `17. mai`
5. **AK Golf System — `AUTOMATISERT`** · "Faktura for mai er sendt. 4 800 kr. Forfall 25. mai 2026." · `15. mai`
6. **Anders Kristiansen — `HEAD COACH`** · "Bra resultat fra Vår-cup! T4 er sterkt. La oss jobbe med konsistens neste uke..." · arkivert · `12. mai`

### Høyre panel: Hint/forhåndsvisning

Default state: stor cream-illustrasjon (Lucide MessageSquare 96px) + tekst Inter Tight 18px `Velg en samtale for å lese` + sub `Eller start en ny melding`.

Hover-state (når bruker hover på en tråd): viser de 3 siste meldingene i tråden som forhåndsvisning, med lime CTA `Åpne samtale →`.

### Stat-strip bunn (60px)
- Venstre: `4 aktive samtaler · 2 uleste · siste aktivitet for 14 min siden` mono
- Senter: `Coach Anders responstid snitt: 2 timer · siste 7 dager`
- Høyre: `+ Ny melding` (lime, primary)

---

## SKJERM 2: `/portal/coach/melding/[id]` — Samtale-detalj (chat-vindu)

### Eyebrow + actions
- Eyebrow: `SAMTALE · ANDERS KRISTIANSEN · HEAD COACH · 47 MELDINGER · STARTET 12. APR 2026`
- Actions:
  1. `Be om møte` (lime, primary)
  2. `Søk i samtale` (forest)
  3. `Vedlegg-bibliotek` (outline)
  4. `Arkiver samtale` (outline)

### Layout
- Venstre 65%: chat-vindu (full høyde)
- Høyre 35%: kontekst-panel (sticky)

### Chat-vindu (venstre)

**Topp-bar (60px):**
- Avatar 40px (Anders) + navn Inter Tight 18px + rolle-pill `HEAD COACH`
- Sub mono: `Sist sett i dag 14:32 · responderer vanligvis innen 2 timer`
- Høyre: 3-prikker meny (rapporter, blokker, lukk)

**Meldings-strøm (scrollbar, full høyde minus topp + input):**

**Dato-skiller:**
Horisontal linje med dato-pill i senter mono `I DAG · 20. MAI 2026`, `I GÅR`, `MANDAG 18. MAI 2026`

**Meldings-bobler:**

Coach-meldinger (venstre, forest-mørk bg, hvit tekst):
- Maks bredde 70%
- Border-radius 16px
- Padding 12px 16px
- Avatar 24px under boblen til venstre med tid mono `14:32`
- Status-ikon (✓✓ lest / ✓ levert) mono small

Spiller-meldinger (høyre, lime bg, forest tekst):
- Maks bredde 70%
- Border-radius 16px med skarpere høyre-hjørne (BR-radius 4px)
- Padding 12px 16px
- Tid mono `14:35` under boblen til høyre

**Vedlegg i bobler:**
- **PDF-vedlegg**: card med PDF-ikon (Lucide FileText) + filnavn `runde-analyse-gfgk-20-mai.pdf` + filstørrelse mono `1,2 MB` + last ned-knapp
- **Video-vedlegg**: thumbnail 240×135 med play-knapp overlay + lengde mono `2:14`
- **Drill-lenke**: card med Lucide ExternalLink + tittel `Putting drill — 1,5m konsistens` + ikon for disiplin
- **Runde-referanse**: card med score mono `68 (−3)` + sub `GFGK · 20. mai · Performance Studio` + lime-border venstre
- **Mål-referanse**: card med checkmark + mål-tekst `Putting 1,5m > 92%` + status mono `OPPNÅDD`

### Eksempel-meldings-strøm (vis ca 12-15 meldinger)

**18. mai 2026 — Mandag:**

- **Anders (09:14)**: "Hei Markus, så på Vår-cup-resultatet ditt — T4 er kjempebra! Det viktigste jeg så: putting-konsistensen er stabil. La oss bygge videre på det denne uka."

- **Anders (09:15)**: "[VEDLEGG: PDF] Her er rapport fra Vår-cup."

- **Markus (10:42)**: "Tusen takk! Ja, putting føltes bra. Sliter litt med 7-jern fortsatt — drar venstre i pressede situasjoner."

- **Anders (11:08)**: "Det er stress-respons. Vi tar D-Plane-gjennomgang i Performance Studio i morgen. Booket 10:00."

- **Anders (11:09)**: "[VEDLEGG: VIDEO 2:14] Se denne fra Tiger på samme situasjon."

**I går — 19. mai:**

- **Markus (18:40)**: "Anders — så videoen, klar for i morgen. Skal jeg gjøre noe forberedelse?"

- **Anders (18:55)**: "Bra spørsmål. Varm opp med 10 min putting + 7-jern halv-swing. Vi kjører D-Plane teori først 15 min, så øvelse."

- **Anders (18:56)**: "[DRILL-LENKE] Halv-swing 7-jern progresjon"

**I dag — 20. mai 2026:**

- **Markus (07:14)**: "På vei nå. Ha en god dag!"

- **Anders (07:18)**: "Sees!"

- **Anders (14:32)**: "Hei Markus, fantastisk runde i dag — 68 (−3) på GFGK er solid forberedelse til Sørlandsåpent. La oss snakke om hvordan vi pakker forberedelses-uka. Foreslår: mandag putting, onsdag 7-jern presisjon, fredag spillsimulering på hull 4/5."

- **Anders (14:32)**: "[RUNDE-REFERANSE] 68 (−3) · GFGK · 20. mai"

- **Anders (14:33)**: "[MÅL-REFERANSE] Putting 1,5m > 92% · OPPNÅDD"

- (Markus' input venter — ikke svart ennå)

### Input-bar (sticky bunn, 80px)

- **Venstre**: 
  - Vedlegg-knapp (Lucide Paperclip) — åpner vedlegg-velger
  - Emoji-knapp ER FJERNET (vi bruker ikke emoji)
  - Mic-knapp (Lucide Mic) — voice-melding
- **Senter**: 
  - Tekstfelt (placeholder `Skriv melding til Anders...`)
  - Auto-expand multi-line
- **Høyre**: 
  - AI-foreslå svar-knapp (lime + Sparkles) — viser 3 forslag i popover
  - Send-knapp (lime, Lucide Send 20px)

### AI-foreslå svar (popover, åpnes ved klikk på Sparkles)

Lime-pastell popover med 3 svar-forslag basert på siste melding fra Anders:

1. `Høres bra ut, gleder meg til mandag! 🟢` (vi bruker IKKE emoji, men forslag uten emoji)
2. `Takk Anders! Kan vi også legge inn litt FYS-trening tirsdag?`
3. `Perfekt plan. Tror jeg trenger ekstra fokus på 7-jern på fredag.`

Hver forslag-rad: klikkbar, kopierer til tekstfelt. Lime hover-state.

### Høyre kontekst-panel (35%)

Sticky, scrollbar når innholdet overgår skjermen.

**Anders sin profil (160px):**
- Portrett 80px sirkel
- Navn Inter Tight 18px: `Anders Kristiansen`
- Rolle mono: `HEAD COACH · AK GOLF ACADEMY`
- Hjemmebane mono: `GFGK · Fredrikstad`
- Stat-strip: `47 meldinger · siden 12. apr 2026`
- CTA: `Be om møte` (outline) · `Se profil` (outline)

**Felles kontekst (240px):**
- **Din kategori**: A1 (lime pill)
- **HCP-trend**: +3,5 → +3,5 → +3,5 siste 3 målinger (stabil)
- **Neste hovedmål**: Sørlandsåpent 16. juni (om 21 dager)
- **Pyramide-balanse**: mini-bar 5 disipliner med prosent

**Tilknyttede økter (200px):**
Liste av siste 5 økter med Anders:
- 20. mai 10:00 · D-Plane + 7-jern · Performance Studio · 60 min · `FULLFØRT`
- 18. mai 16:00 · Putting 1,5m · Performance Studio · 45 min · `FULLFØRT`
- 15. mai 09:00 · Spillsimulering · Hull 4/5 · 90 min · `FULLFØRT`
- 12. mai 14:00 · TEK iron · Performance Studio · 60 min · `FULLFØRT`
- 21. mai 10:00 · Putting 2,5m · Performance Studio · 45 min · `KOMMER`

**Tilknyttede mål (200px):**
- Putting 1,5m > 92% · `OPPNÅDD 12. apr`
- 7-jern smash > 1,36 · 80% progress
- D-Plane forståelse > 85% · 30% progress

**Vedlegg-bibliotek (140px):**
Mini-grid 3×2 av siste 6 vedlegg i samtalen:
- PDF runde-analyse · 1,2 MB
- Video Tiger D-Plane · 2:14
- Drill-lenke halvswing · forest
- PDF Sørlandsåpent-pakke · 2,8 MB
- Video putting-stroke · 1:32
- Drill-lenke putting 1,5m · forest

CTA: `Se alle 18 vedlegg →` (outline)

---

## SKJERM 3: `/portal/coach/melding/ny` — Ny melding

### Eyebrow + actions
- Eyebrow: `NY MELDING · VELG MOTTAKER OG EMNE`
- Actions:
  1. `Lagre utkast` (outline)
  2. `Forhåndsvis` (outline)
  3. `Avbryt` (outline)

### Layout
- Venstre 65%: skjema
- Høyre 35%: forhåndsvisning (sticky)

### Skjema (venstre)

**Steg 1: Mottaker (card 200px):**
- Label Inter Tight 14px: `Til`
- Avatar-grid med 6 valgmuligheter:
  - **Anders Kristiansen** — Head coach (default valgt, lime border)
  - **Erik Solli** — Putting-coach
  - **Maja Hagen** — Junior-coach
  - **Tone Berg** — Daglig leder GFGK
  - **Foreldre-koordinator** — for foreldre-spørsmål
  - **AK Golf Support** — fakturaer, kontrakter

Hver avatar-card 100×100px med portrett 48px + navn + rolle-pill.

**Steg 2: Emne + type (card 140px):**

To kolonner:
- **Emne** — fritekst input (Inter 14px, placeholder `Hvilket tema?`)
- **Type** — radio:
  - **Generell** (default)
  - **Booking-relatert**
  - **Resultat / score-feedback**
  - **Plan-justering**
  - **Praktisk / utstyr**
  - **Foreldre-relatert**

**Steg 3: Melding (card variable høyde, min 280px):**

- Tekst-editor (rik tekst light):
  - Placeholder: `Hei Anders, ...`
  - Verktøy-bar (40px topp): Bold · Italic · Liste · Sitat · Link · Vedlegg
  - Auto-save indikator mono small `Auto-lagret for 12 s siden`
- Tegn-teller mono small bunn: `342 / 5000`

**Steg 4: Vedlegg (card 160px):**

Drop-zone (cream bg, stiplet border):
- Lucide Upload-ikon 36px
- Tekst Inter 14px: `Dra og slipp filer her, eller klikk for å velge`
- Sub mono: `Maks 25 MB per fil · PDF, video, bilde, lyd`

Under drop-zone: hurtigvalg-knapper for ofte brukte:
- `Legg ved siste runde` (knytter score-data)
- `Legg ved øvelse fra bibliotek` (åpner drill-velger)
- `Legg ved mål-referanse` (multiselect av aktive mål)
- `Ta nytt bilde / video` (åpner kamera)

**Steg 5: Tilknytting (card 140px):**

Velg hva meldingen er relatert til (valgfri):
- **Tilknyttet økt** — dropdown av nylige økter
- **Tilknyttet turnering** — dropdown av kommende turneringer
- **Tilknyttet mål** — multiselect av aktive mål
- **Tilknyttet test-resultat** — dropdown av siste 5 test-målinger

**Steg 6: Send-innstillinger (card 100px):**
- **Prioritet**: Normal / Haster (radio)
- **Be om svar innen**: dropdown (`Ingen frist` default · `I dag` · `I morgen` · `Innen 3 dager`)
- **Send kopi til foreldre**: checkbox

### Action-rad bunn (sticky, 64px):
- **Avbryt** (outline)
- **Lagre utkast** (outline)
- **Forhåndsvis** (forest)
- **Send melding** (lime, primary, Lucide Send)

### Høyre forhåndsvisning (35%, sticky)

Live preview av meldingen slik den vil se ut for Anders:

**Header (60px):**
- Avatar Markus 32px + navn `Markus Røinås Pedersen` + tag `A1 SPILLER`
- Tidsstempel mono `nå`

**Meldings-boble (variable):**
- Vises som spillerens lime-boble i Anders' chat-vindu
- Med vedlegg-kort under hvis vedlagt
- Med tilknytning-referanse hvis valgt

**Kontekst-strip (60px under):**
- `Tilknyttet økt: 20. mai 10:00 D-Plane`
- `Tilknyttet mål: 7-jern smash > 1,36`
- `Prioritet: Normal`

**AI-foreslå forbedring-knapp (lime + Sparkles):**
`La AI gjennomgå meldingen` — åpner popover med:
- Tone-vurdering (`Varm og tydelig — bra!`)
- Forslag til forbedring (eks. `Vurder å spesifisere når du ønsker svar`)
- Grammatikk-sjekk

---

## Modal: Be om møte (åpnes fra samtale-skjerm)

### Felt
1. **Møte-type** — radio:
   - Personlig på Performance Studio
   - Personlig på Putting Green
   - Personlig på Driving Range
   - Video-møte (Zoom)
   - Foreldre-møte (Markus + foreldre + Anders)
2. **Foretrukket dato** — datovelger (default i morgen)
3. **Foretrukket tid** — dropdown av ledige slots fra Anders' kalender
4. **Varighet** — radio: 30 min / 45 min / 60 min / 90 min
5. **Agenda** — fritekst (`Hva ønsker du å snakke om?`)
6. **Tilknyttede tema** — multiselect: forberedelse Sørlandsåpent · plan-justering · resultat-gjennomgang · annet

### CTA
- **Send forespørsel** (lime, primary)
- **Foreslå alternative tider** (forest)
- **Avbryt** (outline)

Etter sending:
- Anders får notifikasjon med kalender-integrasjon
- Markus ser status `FORESPØRSEL SENDT` til Anders bekrefter
- Auto-melding i tråden: `Møte-forespørsel sendt — 21. mai 14:00, 45 min, agenda: Sørlandsåpent-forberedelse`

---

## Modal: Vedlegg-bibliotek

Åpnes fra "Vedlegg-bibliotek"-knapp.

### Layout
- Filter-tabs øverst: `ALLE · PDF · VIDEO · DRILL · BILDE · LYD`
- Søk-felt
- Grid 4 kolonner med vedlegg-cards

### Eksempel-vedlegg (12 vis, "Vis 24 til")

Hver card 240×180:
- Thumbnail (PDF-ikon for PDF, video-thumbnail med play, etc.)
- Filnavn Inter 12px truncated
- Dato mono small
- Størrelse mono small
- Klikk: åpner vedlegg-detalj

CTA-rad bunn: `Lukk` (outline) · `Last ned alle valgte` (forest) · `Send til samtale` (lime)

---

## Sticky footer (64px)

- **Venstre**: Pyramide-balanse-bar (5 disipliner som mini-strip med prosent)
- **Senter**: Kontekst-status:
  - Tråd-oversikt: `4 samtaler aktive · 2 uleste · 18 vedlegg · responstid Anders 2t`
  - Samtale-detalj: `47 meldinger med Anders · siden 12. apr · neste økt 21. mai 10:00`
  - Ny melding: `Utkast auto-lagret · 342 tegn · 0 vedlegg`
- **Høyre**:
  - `Spør Coach Anders` (outline + Sparkles) — åpner ny melding pre-utfylt til Anders
  - Kontekst-CTA (lime): `+ Ny melding` / `Send` / `Be om møte`

---

## Tilstander å vise

1. **Default tråd-oversikt**: 6 tråder, ingen valgt, høyre panel viser hint
2. **Tråd hovered**: forhåndsvisning av 3 siste meldinger i høyre panel
3. **Samtale åpen**: chat-vindu med 12+ meldinger, vedlegg synlige
4. **AI-foreslå svar åpen**: popover med 3 forslag synlig
5. **Ny melding-skjema utfylt**: med vedlegg + tilknytning + live preview
6. **Be om møte-modal åpen**

---

## Branding (følger AK Golf design system)

- BG cream `#FAFAF7`
- Card hvit `#FFFFFF` med border `#E5E3DD`
- Primary forest `#005840`, accent lime `#D1F843`
- Coach-meldinger: forest-mørk bg + hvit tekst (eller forest #163027 i lyst tema)
- Spiller-meldinger: lime bg + forest tekst
- Discipline-pills bruker FYS/TEK/SLAG/SPILL/TURN-farger der relevant
- Inter Tight (titler), Inter (UI og meldings-tekst), JetBrains Mono (tid, dato, tall)
- Instrument Serif italic sparsomt — ett ord per hero
- 16px radius cards, 12px input, 16px meldings-bobler, 999px pills
- INGEN emojier, kun Lucide-ikoner stroke 1.75
- Norsk bokmål gjennomgående

## Tekniske krav

- Single self-contained `.html`
- Inline `<style>` block
- Google Fonts via `<link>`
- All icons inline Lucide SVG (stroke 1.75)
- Auto-scroll til siste melding i chat-vindu
- Sticky input-bar bunn i chat
- Vedlegg-cards med ulike layouts (PDF / video / drill / referanse)
- Tab-bar mellom 3 skjermer
- ~2000-2600 linjer HTML

## Constraints

- INGEN emojier (heller ikke i AI-foreslå svar)
- ALL UI på norsk bokmål
- Diskipliner uppercase: FYS, TEK, SLAG, SPILL, TURN
- Kategorier uppercase: A1, A2, B1, B2, B3
- Tall norsk format: `+3,5`, `−1,2`, `1,2 MB`, `4 800 kr`
- Minus-tegn `−` (U+2212), ikke bindestrek `-`
- Klokkeslett 24h: `09:14`, `14:32`, `18:40`
- Dato: `20. mai 2026`, `18. mai`, `i dag`, `i går`
- Tidsstempel relativt: `for 14 min siden`, `for 2 t siden`, `i går 18:40`, `mandag 18. mai`
- Coach-tone: "Hei Markus,", varm og direkte
- Vedlegg-størrelse: `1,2 MB`, `25 MB`, `2:14` (video-lengde)

Output: én komplett HTML-fil. Begin `<!DOCTYPE html>`, end `</html>`. Ingen forklaring utenfor kode-blokken.
