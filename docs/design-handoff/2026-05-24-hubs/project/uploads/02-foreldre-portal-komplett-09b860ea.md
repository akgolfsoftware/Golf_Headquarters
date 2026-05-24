# Prompt — ForeldrePortal komplett (5 skjermer)

> **Bruk:** Lim inn `00-design.md` FØRST i Claude Design (eller v3-bundlens design-system). Deretter lim inn alt etter linjen nedenfor.

---

Lag én komplett, standalone HTML-fil for **AK Golf ForeldrePortal — 5 skjermer i én side**. Desktop-skjerm 1600×variabel høyde. Single self-contained `.html` med inline `<style>`, Google Fonts via `<link>`, alle ikoner inline SVG (Lucide-stil stroke 1.75).

**Følg AK Golf design system STRENGT** (cream `#FAFAF7`, forest `#005840`, lime `#D1F843`, Inter Tight + Inter + JetBrains Mono + Instrument Serif italic, Lucide-ikoner, INGEN emojier, norsk bokmål).

## Hva siden er

ForeldrePortal er foreldrenes parallelle inngang til AK Golf-plattformen — ved siden av PlayerHQ (spilleren) og CoachHQ (coach). Tone Berg, mor til Markus Røinås Pedersen, er persona. Hun trenger:

1. **Hub** — rask oversikt over barna og hva som krever oppmerksomhet
2. **Godkjenninger** — kjøp og avtaler under 18 år som krever foreldre-OK
3. **Fakturaer** — betaling via Stripe, fakturahistorikk, nedlasting
4. **Samtykker** — GDPR, foto-bruk, deling med klubb (kontroll og revoker)
5. **Min spiller** — read-only innsyn i Markus' utvikling, plan, neste økt

**Tone i UI:** lavere informasjonstetthet enn coach- og spiller-flatene. Varmere, mer guidende. Mindre data per skjerm. Norsk bokmål med "du" og "ditt barn" / "Markus" — aldri tekniske coach-uttrykk uten oversettelse.

**Ruter:**
- `/foreldre` (hub)
- `/foreldre/godkjenninger`
- `/foreldre/fakturaer`
- `/foreldre/samtykker`
- `/foreldre/min-spiller/markus-roinas-pedersen`

**Persona:** Tone Berg — mor til Markus Røinås Pedersen (17 år, HCP +3,5, A1).

## Layout (alle 5 skjermer)

Alle skjermer rendres i samme HTML-fil under hverandre, hver med tydelig `<section>`-divider (mono uppercase label "SKJERM 1/5", "SKJERM 2/5" osv. — slik at Claude Design viser dem som distinkte sider).

### Foreldre-shell (felles for alle 5)

#### Chrome
- **Sidebar 220px** (forest bg) — egen foreldre-variant:
  - "AK GOLF / FORELDREPORTAL"
  - Tone-profil med foto (cream gradient + initialer "TB")
  - Nav-grupper, varmere ikonografi:
    - HJEM (Lucide Home) → /foreldre
    - GODKJENNINGER (Lucide Check) → badge "2"
    - FAKTURAER (Lucide FileText)
    - SAMTYKKER (Lucide Shield)
    - DINE BARN (Lucide Users) — expanded:
      - Markus Røinås Pedersen (aktiv)
  - Bunn: "Hjelp & støtte" + "Logg ut"
- **Topbar 56px**: ⌘K + breadcrumb dynamisk + role-toggle ("Forelder" aktiv, mulig switch til "Spiller" hvis hun også er medlem)

### Felles hero-mønster (80px)
- Eyebrow JetBrains Mono uppercase — varierer per skjerm
- Title Inter Tight 32px med Instrument Serif italic på nøkkelord
- 2–3 action-pills høyre

### Felles sticky footer (64px)
- **Venstre**: "Tone Berg · 1 barn · Sist innlogget i går 20:14" mono small
- **Senter**: kontekstuell mini-status (varierer per skjerm)
- **Høyre**: `Trenger hjelp?` (outline) + skjermspesifikk primary

---

# SKJERM 1/5 — `/foreldre` (Hub)

### Hero
- Eyebrow: `VELKOMMEN TILBAKE · 1 BARN AKTIV · 2 GODKJENNINGER VENTER`
- Title: `Hei ` + Instrument Serif italic `*Tone*` + ` — her er det viktigste i dag`
- Actions: `Se Markus' utvikling` (lime) · `Send melding til coach` (outline)

### Innhold

#### Varslings-strip (over barn-cards, lime accent, 80px)
> **2 godkjenninger venter** · Markus ønsker å delta i Sørlandsåpent 2026 (16. juni) og kjøpe nye sko fra Pro-shop (1 250 kr). Begge krever din OK.
>
> CTA: `Gå til godkjenninger` (lime, primary) · `Senere` (outline)

#### Barn-grid (cards, 1 stk siden Markus er eneste barn)

**Markus-card (stor, full bredde for nå — designet for å håndtere 2–4 barn ved utvidelse):**

- **Topp-strip 60px**: profilbilde 48px (cream gradient + "MRP") + navn Inter Tight 22px + sub mono `17 ÅR · HCP +3,5 · A1 · GFGK`
- **Status-pills horisontalt**: lime "AKTIV" · forest "PRO 300 KR/MND" · cream "2/4 CREDITS BRUKT" · cream "SAMTYKKER OK"
- **Mini-KPI-rad (4 cards):**
  1. **Neste økt** — `Tirsdag 09:00` mono · sub `Performance Studio · Anders` · CTA `Detaljer` outline
  2. **HCP** — stor `+3,5` mono · sub `Δ −1,2 siste 6 mnd` · mini-sparkline lime
  3. **Denne uka** — `4 / 5` mono · sub `1 økt gjenstår` · bar forest
  4. **Neste turnering** — `Sørlandsåpent` Inter Tight 14px · sub `om 21 dager · 16. juni` · pill "HOVEDMÅL" lime
- **Action-rad**:
  - `Se Markus' utvikling` (lime, primary) → /foreldre/min-spiller/[id]
  - `Send melding til Anders` (outline)
  - `Be om foreldre-samtale` (outline)

#### Hva-skjer-strip (under barn-card)
Tidslinje siste 7 dager + neste 7 dager:
- I går: Markus fullførte TEK iron-økt
- I dag: Ingen aktivitet planlagt
- I morgen: Coach Anders sender ukeplan
- Tirsdag 21: Privat-økt 09:00 Performance Studio
- Torsdag 23: SLAG-økt 16:00 Nærspillsområde
- Lørdag 25: Spillsimulering 10:00 9-hullsbanen
- Søndag 26: Foreldre-rapport sendes på epost

#### Coach-melding-card (cream bg, Anders-avatar)
> **Anders Kristiansen, 2 dager siden:**  
> "Markus leverer veldig solid denne uka. SG-trenden er positiv. Vi har lagt opp en plan mot Sørlandsåpent — jeg sender deg en kort oppsummering på e-post i morgen. Si fra hvis dere har spørsmål."

CTA: `Svar Anders` (lime) · `Be om samtale` (outline)

#### Bunn: Snarveier-grid (4 cards)
- `Godkjenninger venter (2)` — lime accent
- `Faktura forfaller om 11 dager` — cream
- `Samtykker — alle aktive` — forest
- `Min spiller — Markus` — outline

### Sticky footer (skjerm 1)
- Senter-tekst: "Markus' neste økt: Tirsdag 09:00 · Performance Studio"
- Høyre primary: `Godkjenninger (2)` (lime)

---

# SKJERM 2/5 — `/foreldre/godkjenninger`

### Hero
- Eyebrow: `GODKJENNINGER · 2 VENTER · 14 GODKJENT SIDEN JANUAR`
- Title: `Godkjenn ` + Instrument Serif italic `*Markus' aktiviteter*`
- Actions: `Vis historikk` (outline) · `Innstillinger for auto-godkjenning` (outline)

### Innhold

#### Forklaring-strip (cream bg, 60px, Lucide Info-ikon)
> Markus er 17 år og under 18. Enkelte kjøp og avtaler krever ditt samtykke som foreldre — turneringspåmelding, kjøp over 500 kr, og endringer i abonnement.

#### Venter-på-godkjenning-liste (2 cards)

**Card 1 — Turneringspåmelding:**
- Status-pill lime "VENTER"
- Type-ikon (Lucide Trophy)
- Tittel Inter Tight 18px: "Sørlandsåpent 2026 — påmelding"
- Sub mono: `16. juni 2026 · Mandalkrysset GK · Mandal · 36-hulls slagspill`
- Detalj-felt:
  - Startavgift: `1 850 kr`
  - Reise: 4t kjøretur, hotell anbefalt
  - Coach følger: Anders (1 dag)
  - Markus' notat: "Dette er hovedmål-turneringen min. Mandalkrysset GK passer min spillestil."
- Foreldre-kommentar (valgfri textarea)
- Action-rad:
  - `Godkjenn` (lime, primary) → åpner bekreftelses-modal
  - `Avslå` (destructive outline) → åpner avslå-modal med begrunnelse
  - `Spør Anders først` (outline) → sender melding-pre-fyllt

**Card 2 — Pro-shop-kjøp:**
- Status-pill lime "VENTER"
- Type-ikon (Lucide ShoppingBag)
- Tittel: "Nye golfsko — FootJoy Premiere"
- Sub mono: `Beløp: 1 250 kr · Pro-shop GFGK · Markus' valg`
- Detalj:
  - Begrunnelse fra Markus: "Skoene mine er slitt etter 18 mnd"
  - Coach-anbefaling: Anders har gitt grønt lys
  - Betalingsmetode: Faktura (legges til neste faktura)
- Action-rad:
  - `Godkjenn` (lime, primary)
  - `Avslå` (destructive outline)

#### Bekreftelses-modal (Godkjenn)
- Tittel "Bekreft godkjenning"
- Oppsummering: hva godkjennes + beløp + faktureres-når
- Checkbox "Send bekreftelse til Markus"
- Checkbox "Send kopi til Anders (coach)"
- CTA: `Godkjenn nå` (lime) · `Avbryt` (outline)

#### Avslå-modal
- Tittel "Avslå denne godkjenningen"
- Begrunnelse (textarea, påkrevd)
- Quick-templates: "For dyrt akkurat nå" · "Vil snakke med Markus først" · "Trenger info fra coach"
- Checkbox "Send beskjed til Markus"
- CTA: `Avslå` (destructive) · `Avbryt` (outline)

#### Godkjenningshistorikk (collapsed-section under venter-listen)
Tabell siste 12 godkjenninger:
| Dato | Type | Tittel | Beløp | Status |
|---|---|---|---|---|
| 14. mai 2026 | Booking | Privat-økt 14. mai | 750 kr | Godkjent |
| 5. mai 2026 | Turnering | Påske-cup GFGK | 250 kr | Godkjent |
| 28. april 2026 | Pro-shop | 3 dusin baller | 540 kr | Godkjent |
| 14. april 2026 | Samtykke | Foto-bruk fornyelse | — | Godkjent |
| 8. april 2026 | Booking | 4 økter april | 2 800 kr | Godkjent |
| … | … | … | … | … |

CTA bunn: `Eksporter historikk (PDF)` (outline)

#### Auto-godkjenning-innstillinger (collapsible)
- Slider: "Auto-godkjenn kjøp under X kr" (default 200 kr)
- Toggle: "Auto-godkjenn coach-anbefalte bookinger" (default av)
- Toggle: "Send sammendrag i stedet for hver godkjenning" (default av)

### Sticky footer (skjerm 2)
- Senter-tekst: "2 godkjenninger venter på deg"
- Høyre primary: `Godkjenn alle` (lime — krever bekreftelse-modal)

---

# SKJERM 3/5 — `/foreldre/fakturaer`

### Hero
- Eyebrow: `FAKTURAER · 1 AKTIV · 14 BETALT SIDEN JANUAR · NESTE FORFALL 1. JUNI`
- Title: `Fakturaer for ` + Instrument Serif italic `*Markus*`
- Actions: `Last ned alle som ZIP` (outline) · `Endre betalingsmetode` (outline)

### Innhold

#### Status-strip (60px, lime hvis ajour, destructive hvis forfalt)
- "Ajour. Neste faktura forfaller 1. juni 2026 — 3 200 kr." mono
- CTA-link: `Se neste faktura`

#### Betalingsmetode-card (200px)
- Tittel "Aktiv betalingsmetode"
- Visa-kort `**** **** **** 4242` (Stripe-koblet)
- Sub mono `Utløper 04/29 · Tone Berg`
- Action-rad: `Endre kort` (outline) · `Legg til ny metode` (outline)

#### Faktura-tabell (hovedseksjon)

Filter-rad (40px): Alle · Aktive · Betalt · Forfalt · Kreditnota

Tabell-kolonner:
| Fakturanr | Periode | Forfall | Beløp | Status | Handlinger |
|---|---|---|---|---|---|

Rader (eksempel-data):

1. **2026-006** · Juni 2026 (forhåndsfaktura) · 1. juni 2026 · `3 200 kr` · Pill cream "AKTIV" · `Se` `Betal` `Last ned`
2. **2026-005** · Mai 2026 · Betalt 1. mai · `3 200 kr` · Pill lime "BETALT" · `Se` `Last ned` `Kvittering`
3. **2026-004** · April 2026 · Betalt 1. april · `2 800 kr` · Pill lime "BETALT" · `Se` `Last ned`
4. **2026-003** · Mars 2026 · Betalt 1. mars · `3 200 kr` · Pill lime "BETALT" · `Se` `Last ned`
5. **2026-002** · Februar 2026 · Betalt 1. februar · `3 200 kr` · Pill lime "BETALT"
6. **2026-001** · Januar 2026 · Betalt 1. januar · `3 200 kr` · Pill lime "BETALT"
7. **2025-012** · Desember 2025 · Betalt 1. desember 2025 · `2 900 kr` · Pill lime "BETALT"
… (vis 7 rader, "Vis 8 til"-link)

Hver rad-klikk åpner faktura-drawer (fra høyre, 480px):

#### Faktura-drawer
- Faktura-PDF-preview (forenklet card-stil)
- Linje-spesifikasjoner:
  - Abonnement PRO mai 2026: `300 kr`
  - Privat-økt 7. mai (Anders, 1t): `750 kr`
  - Privat-økt 14. mai (Anders, 1,5t): `1 100 kr`
  - Gruppe-økt 21. mai: `450 kr`
  - Pro-shop: 3 dusin baller (14. mai): `540 kr`
  - Sum: `3 140 kr`
  - MVA inkl. (25%): `628 kr`
  - **Totalt:** `3 200 kr`
- Betalingshistorikk: "Betalt 1. mai 2026 via Visa **** 4242"
- Action-rad:
  - `Last ned PDF` (lime)
  - `Send på e-post` (outline)
  - `Send til regnskap` (outline)
  - `Spørsmål om denne fakturaen` (outline) → åpner melding-modal

#### Faktura-betal-modal (åpnes via "Betal"-knapp)
- Faktura-oppsummering
- Beløp-display stor mono "3 200 kr"
- Stripe-element-placeholder (kort-input UI)
- Velg betalingsmetode (radio): Visa **** 4242 / Ny metode
- Checkbox "Lagre som auto-betaling fra neste faktura"
- CTA: `Betal nå` (lime, primary) · `Avbryt` (outline)

#### Årsstatistikk (collapsed bunn)
- Brukt totalt 2026: `15 800 kr`
- Brukt totalt 2025: `34 200 kr`
- Snitt per måned: `3 160 kr`
- Mini-graf 12 mnd

### Sticky footer (skjerm 3)
- Senter-tekst: "Neste faktura: 1. juni 2026 · 3 200 kr"
- Høyre primary: `Betal neste faktura nå` (lime)

---

# SKJERM 4/5 — `/foreldre/samtykker`

### Hero
- Eyebrow: `SAMTYKKER · 6 AKTIVE · 0 AVVIST · SIST OPPDATERT 14. APRIL 2026`
- Title: `Dine ` + Instrument Serif italic `*samtykker*` + ` for Markus`
- Actions: `Eksporter samtykke-rapport (PDF)` (outline) · `Be om foreldre-samtale` (outline)

### Innhold

#### Forklaring-strip (cream bg, 80px, Lucide Shield-ikon)
> Som foreldre til en mindreårig spiller (Markus, 17 år) gir du samtykke for konkrete formål. Du kan revoker hvilket som helst samtykke når som helst — det får virkning umiddelbart. Vi lagrer logg over alle endringer i 5 år (GDPR-krav).

#### Samtykke-cards (liste, 6 stk)

Hver card (16px radius, hvit bg, border):

**Topp-rad 40px:**
- Status-pill (lime "AKTIV" / cream "VENTER" / destructive "REVOKERT")
- Tittel Inter Tight 16px

**Detalj:**
- Hvorfor (Inter 14px, 2–3 setninger)
- Hva dekker det (bullet-liste 3–5 punkter)
- Sist oppdatert mono small
- Gyldig til mono small (eller "uten utløp")

**Action-rad:**
- Checkbox (stor, tydelig) — aktiv/inaktiv toggle
- `Les fullstendig vilkår` (outline) → åpner drawer
- `Revoker samtykke` (destructive outline, kun hvis aktiv)

**De 6 samtykkene:**

1. **GDPR — behandling av personopplysninger** (lime AKTIV)
   - Hvorfor: For å levere tjenester, fakturere og kommunisere
   - Dekker: navn, e-post, telefon, fødselsdato, kontaktinfo
   - Sist oppdatert: 14. april 2026
   - Gyldig til: uten utløp (kan revoker)

2. **Foto- og videobruk** (lime AKTIV)
   - Hvorfor: Markedsføring, treningsinnhold og sosiale medier for AK Golf Academy
   - Dekker: bilder/video fra økter, klinikker og turneringer
   - Sist oppdatert: 14. april 2026
   - Gyldig til: 31. desember 2026 (årlig fornying)

3. **Deling med klubb (GFGK)** (lime AKTIV)
   - Hvorfor: Klubb og akademi samarbeider om utvikling og rapportering
   - Dekker: HCP, plan, deltakelse i klubb-turneringer
   - Sist oppdatert: 14. april 2026
   - Gyldig til: uten utløp

4. **Deling med NGF og turneringsarrangør** (lime AKTIV)
   - Hvorfor: NGF-merket spiller, krever rapportering
   - Dekker: HCP, runde-resultater, turneringsdeltakelse
   - Sist oppdatert: 14. april 2026
   - Gyldig til: så lenge NGF-merket aktivt

5. **Helsedata fra trener** (cream VENTER)
   - Hvorfor: Coach kan logge skader, sykdom, mental tilstand for tilpasset plan
   - Dekker: notater om skader, sykefravær, energi-nivå
   - Sist endret: 18. mai 2026 (forespurt av Anders)
   - Gyldig til: ikke aktivert ennå
   - Foreldre-action: `Godkjenn` (lime) · `Avslå` (destructive)

6. **Markedsføring fra AK Golf Group** (lime AKTIV, kan revokere)
   - Hvorfor: Nyhetsbrev, kampanjer, klinikk-tilbud
   - Dekker: e-post-utsendelser fra akgolf.no
   - Sist oppdatert: 14. april 2026
   - Gyldig til: uten utløp

#### Samtykke-historikk (collapsed bunn)
Tabell over alle endringer siste 24 mnd:
| Dato | Samtykke | Endring | Av |
|---|---|---|---|
| 14. april 2026 | GDPR | Fornyet | Tone Berg |
| 14. april 2026 | Foto-bruk | Fornyet | Tone Berg |
| 12. januar 2026 | Deling NGF | Aktivert | Tone Berg |
| 1. desember 2025 | Markedsføring | Aktivert | Tone Berg |
| … | … | … | … |

### Sticky footer (skjerm 4)
- Senter-tekst: "1 samtykke venter på godkjenning"
- Høyre primary: `Godkjenn helsedata-samtykke` (lime)

---

# SKJERM 5/5 — `/foreldre/min-spiller/markus-roinas-pedersen`

### Hero
- Eyebrow: `DIN SPILLER · MARKUS RØINÅS PEDERSEN · A1 · HCP +3,5 · GFGK`
- Title: `Markus' ` + Instrument Serif italic `*utvikling*`
- Sub mono small: `Read-only · oppdatert hver dag · siste oppdatering 20. mai kl 06:00`
- Actions: `Send melding til Anders` (lime) · `Be om foreldre-samtale` (outline) · `Eksporter rapport (PDF)` (outline)

### Innhold

#### Profil-strip (full bredde, 120px)
- Foto stort venstre 96px
- Senter: Navn + HCP + kategori + sub-info
- Pyramide-balanse-mini (5 disipliner, kompakt)
- Coach-mini-card høyre: "Anders Kristiansen — head coach siden 2023"

#### KPI-strip (samme 6 cards som CoachHQ, men foreldre-tone — forenklet beskrivelse)

1. **HCP-utvikling** — `+3,5` · "Δ −1,2 siste 6 mnd · god retning"
2. **Snitt-score** — `72,4` · "8 siste runder · 5 sub-par"
3. **Neste turnering** — `Sørlandsåpent` · "om 21 dager · 78% klar"
4. **Denne uka** — `4 / 5 økter` · "1 igjen torsdag"
5. **SG-trend** — `+0,42` · "leverer over snitt"
6. **Trivsel** (denne erstatter faktura-card for foreldre-visning) — `Høy` · "basert på coach-vurdering siste 4 uker"

#### Coach-melding-card (cream, Anders-avatar, full bredde)
> **Anders Kristiansen, oppdatert 18. mai 2026:**
>
> Markus leverer veldig solid utvikling denne perioden. SG-trenden er +0,42, som betyr at han over tid scorer 0,42 slag bedre per runde enn sin egen baseline. Iron-spillet er hans største styrke.
>
> Foran Sørlandsåpent fokuserer vi på bunker-spill (hans svakeste) og putting >4m. Vi har lagt opp 5 fokus-økter de neste 3 ukene.
>
> Trygt å si at han er på rett vei. Si fra om dere har spørsmål.

CTA: `Svar Anders` (lime) · `Be om samtale på telefon` (outline)

#### Plan-card (read-only)
- Tittel "Aktiv plan: Spesialisering vår 2026"
- Periode mono `1. mai – 30. juni 2026`
- Progress 68%
- Sub forenklet for foreldre: "Markus følger en 8-ukers plan mot Sørlandsåpent. Han har gjort 12 av 17 økter."
- 5 disipliner med mini-progress (samme som coach-visning, men uten edit-knapper)
- Read-only badge: "Du kan ikke endre planen. Snakk med Anders hvis du ønsker justeringer."

#### Neste 3 økter-liste
1. **Tirsdag 21. mai 09:00–10:00** · Performance Studio · Privat med Anders · TEK iron-progresjon
2. **Torsdag 23. mai 16:00–17:30** · Nærspillsområde · Privat med Anders · SLAG putting + chip
3. **Lørdag 25. mai 10:00–12:00** · 9-hullsbanen · Privat med Anders · SPILL course management

Sub: "Trenger Markus skyss? `Marker som familietrygt`" (outline)

#### SG-radar (forenklet visning, foreldre-tone)
- Samme radar-chart (lime fyll)
- Forklarings-tekst under: "Strokes Gained måler hvor mange slag Markus sparer per runde vs gjennomsnittlig amatør. Pluss-tall betyr han er bedre. Iron-spill (+0,28) er hans skarpeste våpen."

#### Hva nå?-strip
Cream bg, lime accent:
> Markus' neste hovedmål er Sørlandsåpent 16. juni. Han er 78% forberedt. Det betyr at av 15 planlagte fokus-økter har han fullført 12. De neste 3 ukene er kritiske — Anders har lagt opp 5 økter mot turneringen.

#### Coach-tilgjengelighet-card
- Foto Anders + navn + rolle
- "Anders svarer typisk innen 4 timer på hverdager"
- Telefon `+47 412 34 567` (klikkbar tel:)
- E-post `anders@akgolf.no`
- CTA: `Send melding` (lime) · `Be om samtale` (outline)

### Sticky footer (skjerm 5)
- Senter-tekst: "Markus' neste økt: Tirsdag 09:00 · Performance Studio"
- Høyre primary: `Send melding til Anders` (lime)

---

## Modaler (felles for alle 5 skjermer)

### Send melding (Anders)
- Mottaker: Anders Kristiansen (default), valgfri CC: Markus
- Emne (fritekst)
- Brødtekst (textarea med 4 quick-templates: "Spørsmål om plan" / "Bekymring" / "Skyss-koordinering" / "Generelt")
- Vedlegg
- CTA: `Send` (lime) · `Lagre utkast` (outline) · `Avbryt`

### Be om foreldre-samtale
- Type (radio): Telefon · Video · Fysisk møte GFGK
- Foretrukket tidspunkt (3 valg dato+klokkeslett)
- Hvorfor (textarea)
- CTA: `Send forespørsel` (lime) · `Avbryt`

### Bekreftelse på godkjenning (felles)
- Tittel
- Hva godkjennes
- Beløp (hvis økonomisk)
- Effekt
- Checkbox "Send bekreftelse til Markus"
- CTA: `Bekreft` (lime) · `Avbryt`

---

## Tilstander å vise

1. **Default**: Skjerm 1 (Hub) — alle 5 skjermer synlige under hverandre med tydelig "SKJERM X/5"-divider
2. **Modal åpen**: Godkjenningsbekreftelse-modal på skjerm 2 som primær demo
3. **Tomt barn-grid**: Empty state "Ingen barn registrert" + CTA "Be om kobling til ditt barn"
4. **Forfalt faktura**: Status-strip skifter til destructive med varsel
5. **Coach offline**: Coach-tilgjengelighet-card skifter til "Anders er offline til mandag"

---

## Branding (følger AK Golf design system)

- BG cream `#FAFAF7`
- Card hvit `#FFFFFF` med border `#E5E3DD`
- Primary forest `#005840`, accent lime `#D1F843`
- Discipline-pills bruker FYS/TEK/SLAG/SPILL/TURN-farger
- Inter Tight (titler), Inter (UI), JetBrains Mono (alle tall, beløp, HCP, dato, klokkeslett)
- Instrument Serif italic sparsomt — på navnene `Tone`, `Markus`, `samtykker`, `utvikling` i hero-titlene
- 16px radius cards, 12px buttons, 999px pills
- INGEN emojier, kun Lucide-ikoner stroke 1.75
- Norsk bokmål gjennomgående med varmere "du"-tone

## Foreldre-tone — språklige regler

- Bruk "du" og "ditt barn" / "Markus" — aldri "spilleren" eller "utøveren"
- Forklar tekniske begreper: SG = "Strokes Gained — slag spart per runde"
- Coach-uttrykk oversettes: "Spesialisering vår" → ok, men add sub "fokus mot Sørlandsåpent"
- Penger alltid med "kr" suffix og mellomrom som tusen-skille: `3 200 kr`
- Datoer i klartekst: "Tirsdag 21. mai 09:00"
- Aldri "destructive" eller "warning" som UI-tekst — bruk "Revoker" / "Avslå" / "Bekymring"

## Tekniske krav

- Single self-contained `.html`
- Inline `<style>` block
- Google Fonts via `<link>`
- All icons inline Lucide SVG (stroke 1.75)
- 5 distinkte `<section>`-blokker med tydelig divider mellom (mono uppercase "SKJERM X/5 — /foreldre/...")
- Stripe-element placeholder (visuelt, ikke faktisk integrasjon)
- ~2400–2800 linjer HTML totalt

## Constraints

- INGEN emojier
- ALL UI på norsk bokmål
- Diskipliner uppercase: FYS, TEK, SLAG, SPILL, TURN
- Tall norsk format: HCP `+3,5`, beløp `3 200 kr`, prosent `78%`
- Minus-tegn `−` ikke bindestrek `-` for negative tall
- Klokkeslett 24h: `09:00`, `16:30`
- Dato: `16. juni 2026`, `1. juni`
- "Forelder" / "Foreldre" — bruk konsistent

Output: én komplett HTML-fil. Begin `<!DOCTYPE html>`, end `</html>`. Ingen forklaring utenfor kode-blokken.
