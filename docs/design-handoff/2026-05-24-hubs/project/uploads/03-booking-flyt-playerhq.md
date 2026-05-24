# Prompt — PlayerHQ Booking-flyt (wizard + bekreftet)

> **Bruk:** Lim inn `00-design.md` FØRST i Claude Design (eller v3-bundlens design-system). Deretter lim inn alt etter linjen nedenfor.

---

Lag én komplett, standalone HTML-fil for **AK Golf PlayerHQ — Booking-flyt (2 skjermer)**. Desktop-skjerm 1600×variabel høyde. Single self-contained `.html` med inline `<style>`, Google Fonts via `<link>`, alle ikoner inline SVG (Lucide-stil stroke 1.75).

**Følg AK Golf design system STRENGT** (cream `#FAFAF7`, forest `#005840`, lime `#D1F843`, Inter Tight + Inter + JetBrains Mono + Instrument Serif italic, Lucide-ikoner, INGEN emojier, norsk bokmål).

## Hva siden er

Booking-flyt i PlayerHQ — Markus skal booke sin neste økt. To skjermer:

1. **Wizard** — 4 steg fra valg av tjeneste til bekreftelse
2. **Bekreftet** — kvittering + neste steg

Hver skjerm rendres i samme HTML-fil under hverandre med tydelig "SKJERM X/2"-divider.

**Ruter:**
- `/portal/booking/ny`
- `/portal/booking/bekreftet`

**Persona:** Markus Røinås Pedersen — HCP +3,5, A1, GFGK, PRO-abonnement, 2 av 4 coaching-credits brukt denne måneden.

## Layout (felles for begge skjermer)

Følger PlayerHQ-mønsteret: Linear sidebar + topbar + hero + innhold + sticky footer.

### Chrome
- **Sidebar 220px** (forest bg): "AK GOLF / PLAYERHQ · PRO" + Markus-profil + nav-grupper (HJEM / TRENING / BOOKING [aktiv, expanded: Ny booking · Mine bookinger · Historikk] / INNSIKT)
- **Topbar 56px**: ⌘K + breadcrumb "Booking / Ny booking" + role-toggle (Spiller/Forelder)

---

# SKJERM 1/2 — `/portal/booking/ny` (Wizard 4 steg)

### Hero (komprimert 80px)
- Eyebrow JetBrains Mono uppercase: `BOOKING · NY ØKT · STEG 1 AV 4 · 2 AV 4 CREDITS BRUKT DENNE MÅNEDEN`
- Title Inter Tight 32px: `Book ` + Instrument Serif italic `*ny økt*`
- Actions: `Avbryt` (outline) · `Lagre som utkast` (outline)

### Progress-bar (40px, sticky under hero)

Horisontal stepper med 4 noder:
1. **Tjeneste** (aktiv lime, ring + check når fullført)
2. **Coach** (forest)
3. **Fasilitet** (forest)
4. **Dato + tid** (forest)
5. **Bekreft** (cream outline)

Forbindelses-linjer (forest, lime når gått forbi). Klikkbart bakover til tidligere steg.

### Credits-strip (60px, lime accent, under progress)
> Du har **2 av 4 coaching-credits** brukt denne måneden (Performance-pakke). Denne bookingen koster `1 credit` (privat-økt 1 time). Du har `2 credits` igjen til 31. mai.
>
> Sub-link: `Hvordan credits fungerer` (outline) · `Oppgrader til Pro (4 credits)` (outline)

### Wizard-innhold (full bredde, 720px max centered)

---

#### STEG 1: TJENESTE (default aktiv)

**Tittel Inter Tight 24px:** "Hva slags økt vil du booke?"
**Sub mono:** "Velg tjeneste-type. Du kan endre dette senere."

**3 store cards horisontalt (1:1:1):**

**Card 1 — Privat-økt (default valgt, lime border):**
- Ikon Lucide UserCheck (32px forest)
- Tittel "Privat-økt"
- Sub Inter 14px: "1-til-1 med valgt coach"
- Detalj-liste:
  - Varighet: 60 eller 90 min
  - Coster: 1 credit (60 min) eller 1,5 credits (90 min)
  - Default fasilitet: Performance Studio
  - Inkludert: TrackMan-data + coach-notater
- Bunn-pill lime "MEST BRUKT"

**Card 2 — Gruppe-økt:**
- Ikon Lucide Users (32px)
- Tittel "Gruppe-økt"
- Sub: "2–6 spillere, samme nivå"
- Detalj:
  - Varighet: 90 min
  - Koster: 0,5 credits
  - Default fasilitet: Driving Range / Nærspillsområde
  - Inkludert: felles tema, mindre individuell tid
- Bunn-pill cream "RIMELIGERE"

**Card 3 — Klinikk / Drop-in:**
- Ikon Lucide GraduationCap (32px)
- Tittel "Klinikk"
- Sub: "Tema-økt, opptil 10 spillere"
- Detalj:
  - Varighet: 120 min
  - Koster: 350 kr flat (ikke credits)
  - Default fasilitet: varierer
  - Inkludert: spesifikt tema (putting / bunker / mental)
- Bunn-pill outline "TEMA"

Hver card er klikkbar. Hover gir subtil skygge + lime venstre-border.

**Action-rad bunn (sticky innenfor wizard):**
- `Forrige` (outline, disabled på steg 1)
- `Neste — velg coach` (lime, primary, disabled inntil valg)

---

#### STEG 2: COACH (alternativ visning under steg 1)

**Tittel:** "Hvem vil du trene med?"
**Sub mono:** "Coachene er sortert etter din historikk og tilgjengelighet."

**3 coach-cards horisontalt:**

**Card 1 — Anders Kristiansen (default valgt, lime border, "DIN HOVED-COACH"-pill):**
- Foto sirkel 80px (cream gradient + "AK")
- Navn Inter Tight 18px
- Rolle mono small: "Head Coach AK Golf Academy"
- Spesialitet-pills: TEK, SLAG, SPILL
- Mini-rating: "4,9 / 5 · 38 spillere"
- Sub Inter 13px: "Markus' faste coach siden 2023. Spesialist på elite-utvikling og turnerings-forberedelse."
- Neste ledige: mono `Tirsdag 21. mai 09:00`
- Pris-info: "Inkludert i ditt PRO-abonnement"
- Bunn-pill lime "HOVED-COACH"

**Card 2 — Erik Solli:**
- Foto sirkel 80px (cream gradient + "ES")
- Navn "Erik Solli"
- Rolle: "Putting-spesialist"
- Spesialitet-pills: SLAG (putting)
- Mini-rating: "4,8 / 5 · 12 spillere"
- Sub: "Putting-fokusert coach. Anbefales for SG-PUTT under 0."
- Neste ledige: `Onsdag 22. mai 14:00`
- Pris-info: "Inkludert (krever Anders' godkjenning)"

**Card 3 — Maja Hagen:**
- Foto sirkel 80px (cream + "MH")
- Navn "Maja Hagen"
- Rolle: "Junior-coach"
- Spesialitet-pills: FYS, TEK, TURN
- Mini-rating: "4,7 / 5 · 22 spillere"
- Sub: "Junior-coach for klinikker og gruppe-økter. Spesialitet på mental rutine."
- Neste ledige: `Torsdag 23. mai 17:00`
- Pris-info: "Inkludert"

**Action-rad bunn:**
- `← Tilbake til tjeneste` (outline)
- `Neste — velg fasilitet` (lime, primary)

---

#### STEG 3: FASILITET

**Tittel:** "Hvor vil du trene?"
**Sub mono:** "Vis Anders' default-fasilitet. Du kan velge annet hvis tilgjengelig."

**Layout:** 2 kolonner (60/40)

**Venstre 60%: Anlegg-kart (mini-versjon av GFGK)**

SVG-basert top-down kart 400×500px med stilisert GFGK-anlegget:
- Greener lime, fairways forest, range rektangulær, bygninger cream
- 7 klikkbare hotspots (sirkel 28px + nummer):
  1. Performance Studio (default valgt, lime ring + pulse)
  2. Driving Range 1. etg
  3. Driving Range 2. etg
  4. Putting Green
  5. Nærspillsområde
  6. 9-hullsbanen
  7. Hull 4/5

Hotspot-status:
- Lime fyll = "Tilgjengelig din ønskede tid"
- Forest fyll = "Tilgjengelig på annet tidspunkt"
- Cream + border = "Ikke tilgjengelig"

Hover på hotspot → tooltip med fasilitet-navn + status

**Høyre 40%: Fasilitet-detalj-card**

For valgt fasilitet (default Performance Studio):

- Foto-placeholder (cream gradient 200×120px med "PS"-initialer)
- Navn Inter Tight 18px "Performance Studio"
- Sub mono `INNENDØRS · 1–2 SPILLERE · TRACKMAN 4`
- Beskrivelse Inter 13px: "Anders' default-fasilitet. TrackMan 4 launch monitor, video-analyse, klima-kontrollert. Best for tek-arbeid."
- Mini-utstyrs-liste (med Lucide-ikoner):
  - TrackMan 4 launch monitor
  - 2-kamera-system
  - Putting-matte med break
  - Klima 18°C konstant
- Sub-pill cream "ANDERS' DEFAULT"
- Tilgjengelighet mono small: `Ledig 09:00, 10:30, 14:00 tirsdag`

Under detail-card:
- Alternative fasiliteter-liste (kompakt, 3 stk):
  - Driving Range 1. etg — "Bedre for distansetrening"
  - Putting Green — "Best for SLAG-fokus"
  - Nærspillsområde — "Around-green-trening"

**Action-rad bunn:**
- `← Tilbake til coach` (outline)
- `Neste — velg dato og tid` (lime, primary)

---

#### STEG 4: DATO + TID

**Tittel:** "Når passer det?"
**Sub mono:** "Vises Anders' typiske coach-dager: tirsdag, torsdag, lørdag."

**Layout:** 2 kolonner (50/50)

**Venstre 50%: Kalender**

Mini-måned-kalender (uke som 7 kolonner × ~5 rader for mai 2026):
- Header mono: "MAI 2026" + navigasjons-piler (← →)
- Ukedager-row: MAN TIR ONS TOR FRE LØR SØN
- Dato-celler 40×40px:
  - Today (20. mai) markert lime ring
  - Anders' typiske dager (tir/tor/lør) lime accent-prikk under tall
  - Ledige dager forest tekst
  - Helt fullbookede dager cream + strikethrough
  - Valgt dato (default 21. mai = tirsdag) lime fyll + forest tekst
- Hover på dato: tooltip "3 ledige slots"
- Sub-strip under kalender: "Kun viser Anders' coach-dager. `Vis alle dager` (link)"

**Høyre 50%: Tilgjengelige slots**

For valgt dato (21. mai 2026, tirsdag):
- Header mono: "TIRSDAG 21. MAI 2026 · PERFORMANCE STUDIO · ANDERS"
- Slot-grid (2 kolonner):
  - `08:00 – 09:00` outline
  - `09:00 – 10:00` lime (default valgt) — pill "ANBEFALT TID"
  - `10:30 – 11:30` outline
  - `14:00 – 15:00` outline
  - `15:30 – 16:30` outline
  - `17:00 – 18:00` cream "OPPTATT" disabled
- Varighet-toggle (segmented control):
  - **60 min** (default valgt, lime) — 1 credit
  - **90 min** — 1,5 credits

**Action-rad bunn:**
- `← Tilbake til fasilitet` (outline)
- `Neste — bekreft` (lime, primary)

---

#### STEG 5: BEKREFT

**Tittel:** "Bekreft din booking"
**Sub mono:** "Sjekk detaljene og bekreft. Du kan endre frem til 24 timer før økten."

**Layout:** 1 stor card (640px bred, centered)

**Oppsummerings-card:**

Header lime bg 60px:
- "Tirsdag 21. mai 2026" Inter Tight 22px
- Mono: `09:00–10:00 · 60 MIN · 1 CREDIT`

Body (8 rader, hver med ikon + label + verdi + edit-link):

1. Lucide UserCheck — Coach: `Anders Kristiansen` · `Endre`
2. Lucide Briefcase — Tjeneste: `Privat-økt 60 min` · `Endre`
3. Lucide MapPin — Fasilitet: `Performance Studio · GFGK` · `Endre`
4. Lucide Calendar — Dato: `Tirsdag 21. mai 2026` · `Endre`
5. Lucide Clock — Tid: `09:00 – 10:00` · `Endre`
6. Lucide Coins — Kostnad: `1 credit (2 av 4 brukt, 1 igjen etter)` · sub-link "Hvordan credits fungerer"
7. Lucide CreditCard — Betalingsmetode: `Inkludert i PRO-abonnement (300 kr/mnd)`
8. Lucide Sparkles — Fokus-tema (valgfri textarea): "Hva vil du jobbe med?" placeholder. Forslag-pills: TEK iron-progresjon · SLAG putting <2,5m · SPILL hull 4/5 scenario

Under oppsummering — 3 checkboxes:

- [x] **Send forberedelse fra Anders i forkant** (default på)
  - Sub: "Anders sender deg 1-2 video-klipp og 2-3 fokus-punkter dagen før økten."
- [ ] **Be om foreldre-godkjenning** (default av)
  - Sub: "Sender bekreftelse til Tone Berg. Krever ikke godkjenning siden økten er inkludert i abonnement."
- [x] **Legg til i min Google Kalender** (default på)
  - Sub: "Sender invitt til markus@..."

**Action-rad bunn (større CTA):**
- `← Tilbake` (outline)
- `Bekreft booking` (lime, primary, stor 56px)

**Avbryt-link (under CTA, liten outline)**: `Avbryt og forkast utkast`

---

### Sticky footer (alle steg, skjerm 1)

- **Venstre**: Pyramide-balanse mini — "Din ukentlige fordeling: FYS 15% · TEK 30% · SLAG 25% · SPILL 20% · TURN 10%"
- **Senter**: Live-oppsummering som oppdaterer per steg: "Privat-økt · Anders · Performance Studio · Tirsdag 09:00 · 1 credit"
- **Høyre**: 2 buttons:
  - `Spør Anders først` (outline + Sparkles)
  - `Bekreft booking` (lime, primary — kun aktiv på steg 5)

---

# SKJERM 2/2 — `/portal/booking/bekreftet` (Bekreftelse)

### Hero (komprimert 80px)
- Eyebrow JetBrains Mono uppercase: `BOOKING BEKREFTET · BOOKINGNUMMER #2026-1147 · OPPRETTET 20. MAI 12:34`
- Title Inter Tight 32px: `Bookingen er ` + Instrument Serif italic `*bekreftet*`
- Actions: `Til mine bookinger` (lime) · `Book ny økt` (outline)

### Bekreftelse-card (full bredde, 720px max, centered)

**Topp-bånd (lime bg, 100px):**
- Stor Lucide CheckCircle (48px, forest)
- Tittel Inter Tight 26px "Vi sees tirsdag 21. mai kl 09:00"
- Sub mono: `BOOKINGNUMMER #2026-1147 · PERFORMANCE STUDIO`

**Body (hvit bg, 24px padding):**

**Detaljer-rad (8 rader, ikon + label + verdi):**
1. Coach: `Anders Kristiansen`
2. Tjeneste: `Privat-økt 60 min`
3. Fasilitet: `Performance Studio · GFGK`
4. Dato: `Tirsdag 21. mai 2026`
5. Tid: `09:00 – 10:00`
6. Fokus: `TEK iron-progresjon — 5-PW konsistens innenfor 8m`
7. Kostnad: `1 credit (3 av 4 brukt etter denne)`
8. Betalingsmetode: `Inkludert i PRO-abonnement`

**Skille-linje**

**"Hva skjer nå?"-strip (cream bg, 60px, Lucide Info-ikon):**

> 3 ting du kan forvente:
> 1. **I morgen (20. mai)**: Anders sender deg forberedelse på e-post + i appen — 1-2 video-klipp og 3 fokus-punkter
> 2. **Tirsdag 09:00**: Møt opp på Performance Studio. Anders er der 5 min før.
> 3. **Etter økten**: SG-data + Anders' notater oppdateres i din profil innen 24 timer

**Action-grid (4 cards):**

1. **Legg til i kalender** (lime, primary)
   - Lucide Calendar-ikon
   - Sub: "Google Calendar / Apple Calendar / Outlook"
   - Buttons: `Google` `Apple` `Outlook` `.ics-fil`

2. **Be om forberedelse nå**
   - Lucide Sparkles-ikon
   - Sub: "Send melding til Anders om hva du vil fokusere på"
   - CTA: `Send melding til Anders` (outline)

3. **Del med foreldre**
   - Lucide Share-ikon
   - Sub: "Send bekreftelse til Tone Berg (mor)"
   - CTA: `Send til Tone` (outline)

4. **Avbestill**
   - Lucide X-ikon (destructive)
   - Sub: "Avbestill kostnadsfritt frem til mandag 20:00 (12 timer før)"
   - CTA: `Avbestill booking` (destructive outline)

### Coaching-credits-strip (60px, under bekreftelse-card)

> Du har nå brukt `3 av 4 coaching-credits` denne måneden (Performance-pakke). Credits fornyes 1. juni.
>
> Mini progress-bar (lime fill 75%) + sub-link: `Hvordan fungerer credits?` (outline) · `Oppgrader til Pro (4 credits)` (outline)

### Anbefalt-strip (under credits)

**Tittel mono uppercase:** `ANBEFALT ETTER DENNE ØKTEN`

3 anbefalings-cards:

1. **Book oppfølgings-økt (torsdag)**
   - "Anders anbefaler en SLAG-økt to dager etter for å sikre overføring fra Studio til bane."
   - Sub mono: "Torsdag 23. mai 16:00 · Nærspillsområde"
   - CTA: `Book torsdag` (lime)

2. **Fyll inn forberedelses-form**
   - "Anders trenger 3 svar fra deg før tirsdag — tar 2 minutter."
   - CTA: `Fyll inn nå` (outline)

3. **Se din SG-trend**
   - "Sjekk hvor du står før økten. SG-Total er +0,42 (positiv trend)."
   - CTA: `Vis SG-detaljer` (outline)

### Sticky footer (skjerm 2)

- **Venstre**: "Markus Røinås Pedersen · 3 av 4 credits brukt"
- **Senter**: "Neste hovedmål: Sørlandsåpent · om 21 dager · 78% forberedt"
- **Høyre**: 
  - `Til mine bookinger` (outline)
  - `Book ny økt` (lime, primary)

---

## Modaler (felles for booking-flyten)

### Avbestillings-modal
- Tittel "Avbestille bookingen?"
- Detalj-oppsummering
- Avbestillings-regel display:
  - Mer enn 24t før: gratis (credit tilbakeføres)
  - Mindre enn 24t: credit forbrukes
  - Mindre enn 12t: full kostnad
- Sub mono live: "Nå: 21 timer før — credit tilbakeføres"
- Begrunnelse-textarea (valgfri)
- CTA: `Bekreft avbestilling` (destructive) · `Behold booking` (lime)

### Endre-booking-modal
- Velg hva som skal endres (radio): Dato/tid · Coach · Fasilitet · Tjeneste
- Åpner tilbakebevegelse til relevant wizard-steg

### Forberedelse-melding-modal
- Mottaker: Anders Kristiansen (lock)
- Tema-pills: "Hva vil jeg jobbe med" · "Hva strugler jeg med" · "Forrige økt-oppfølging" · "Annet"
- Brødtekst (textarea)
- Vedlegg (video / bilde / scorekort)
- CTA: `Send` (lime) · `Lagre utkast` (outline) · `Avbryt`

### Foreldre-godkjenning-modal (når booking krever foreldre-OK — f.eks. dyrere klinikker)
- Tittel "Sender til Tone Berg for godkjenning"
- Hva sendes til foreldre
- Estimert svartid: "Tone svarer typisk innen 2 timer"
- CTA: `Send til foreldre` (lime) · `Avbryt`

---

## Tilstander å vise

1. **Default**: Skjerm 1 (wizard) viser STEG 5 (bekreft) som primær demo — med tidligere steg over hverandre slik at hele flyten er synlig
2. **Skjerm 2**: bekreftet-skjerm rett under, klart adskilt
3. **Steg 1-4 alternativ visning**: Vis under hverandre slik at Claude Design renderer hele flyten
4. **Credits oppbrukt**: Erstattes med "Du har 0 credits igjen — denne økten faktureres 750 kr"
5. **Konflikt med Anders' kalender**: Live varsel "Anders er ikke ledig tirsdag 09:00 — neste ledige onsdag 14:00"

---

## Branding (følger AK Golf design system)

- BG cream `#FAFAF7`
- Card hvit `#FFFFFF` med border `#E5E3DD`
- Primary forest `#005840`, accent lime `#D1F843`
- Discipline-pills bruker FYS/TEK/SLAG/SPILL/TURN-farger
- Inter Tight (titler), Inter (UI), JetBrains Mono (alle tall, klokkeslett, dato, credits, bookingnummer)
- Instrument Serif italic sparsomt — `*ny økt*` (skjerm 1) og `*bekreftet*` (skjerm 2)
- 16px radius cards, 12px buttons, 999px pills
- INGEN emojier, kun Lucide-ikoner stroke 1.75
- Norsk bokmål gjennomgående

## Tekniske krav

- Single self-contained `.html`
- Inline `<style>` block
- Google Fonts via `<link>`
- All icons inline Lucide SVG (stroke 1.75)
- Interaktive wizard-steg (CSS-only kan vise alle samtidig under hverandre, eller minimal JS for toggle)
- SVG anleggs-mini-kart med 7 klikkbare hotspots
- ~2000–2400 linjer HTML totalt

## Constraints

- INGEN emojier
- ALL UI på norsk bokmål
- Diskipliner uppercase: FYS, TEK, SLAG, SPILL, TURN
- Tall norsk format: HCP `+3,5`, beløp `750 kr`, credits `1 credit`, `2 av 4 credits`
- Minus-tegn `−` ikke bindestrek `-` for negative tall
- Klokkeslett 24h: `09:00`, `10:30`, `14:00`
- Dato: `21. mai 2026`, ukedag-navn: `Tirsdag`, `Torsdag`, `Lørdag`
- Bookingnummer-format: `#2026-1147` (mono)
- Credits modell synlig konsekvent: "X av 4 credits brukt" — aldri "credits" uten kontekst

Output: én komplett HTML-fil. Begin `<!DOCTYPE html>`, end `</html>`. Ingen forklaring utenfor kode-blokken.
