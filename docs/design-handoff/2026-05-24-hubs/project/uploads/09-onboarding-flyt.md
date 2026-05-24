# Prompt — Onboarding-flyt (spiller + forelder)

> **Bruk:** Lim inn `00-design.md` FØRST i Claude Design (eller v3-bundlens design-system). Deretter lim inn alt etter linjen nedenfor.

---

Lag én komplett, standalone HTML-fil for **AK Golf — Onboarding-flyt (2 skjermer i én fil)**. Desktop-skjerm 1600×variabel høyde. Single self-contained `.html` med inline `<style>`, Google Fonts via `<link>`, alle ikoner inline SVG (Lucide-stil stroke 1.75).

**Følg AK Golf design system STRENGT** (cream `#FAFAF7`, forest `#005840`, lime `#D1F843`, Inter Tight + Inter + JetBrains Mono + Instrument Serif italic, Lucide-ikoner, INGEN emojier, norsk bokmål).

## Hva skjermen er

Onboarding-flyten er første kontakt mellom AK Golf og en ny bruker. Den må føles varm, tillitvekkende og profesjonell — som en personlig velkomst fra Coach Anders, ikke et generisk skjema. Designet skal vise AK Golf-merkevarens kjerne: kvalitet, omtanke, langsiktig utvikling.

To skjermer i samme fil:

| # | Rute | Navn | Persona |
|---|---|---|---|
| 1 | `/onboarding` | Spiller-onboarding (7 steg) | Markus Røinås Pedersen |
| 2 | `/onboarding/forelder` | Forelder-onboarding (4 steg) | Tone Berg (Markus' mor) |

**Personas:**
- Markus Røinås Pedersen — HCP +3,5, kategori A1, hjemmebane GFGK, 17 år gammel
- Tone Berg — Markus' mor, ny i AK Golf-systemet, har akkurat fått invitasjon
- Anders Kristiansen — Head coach AK Golf Academy, default coach

**Tone-of-voice:** varm, direkte, personlig. AK Golf snakker ikke som et nettsted — det snakker som en coach. Ingen "Velkommen til vår plattform!" — heller "Hei Markus, vi gleder oss til å jobbe sammen."

## Layout (felles)

Onboarding bryter med standard chrome — **ingen sidebar**, ingen topbar med ⌘K. Dette er en dedikert fokus-flyt.

### Header (72px, sticky topp)
- Venstre: AK Golf-logo-mark (forest sirkel med lime "AK" mono) + tekst "AK GOLF ACADEMY" mono uppercase
- Senter: **Progress-stepper** (horisontal, viser alle steg som prikker + navn under aktiv)
- Høyre: 
  - "Lagre og fortsett senere" (outline, liten) — lagrer progresjon
  - Lucide X (lukke) — krever bekreftelse "Sikker på at du vil avbryte?"

### Body (full bredde, sentrert max 720px)
Hvert steg er en seksjon med:
- **Illustrasjon-strip** (320px høyde): SVG-illustrasjon relatert til steget (golfere, baner, utstyr — stilisert forest/lime/cream)
- **Tittel** Inter Tight 36px: én italic-frase per steg
- **Beskrivelse** Inter 16px: 1-2 setninger, varm tone
- **Skjema-felt** (formelle inputs, store, luftige)
- **CTA-rad** nederst: "Tilbake" (outline) + "Neste" (lime primary stor)

### Footer (48px, sticky bunn)
- Venstre: `Steg N av M` mono uppercase
- Senter: tom (eller mini-progressbar gradient lime→forest)
- Høyre: "Trenger du hjelp? Snakk med Anders" (link med Lucide MessageCircle)

### Skjerm-separator
Stor forest-stripe 40px med mono uppercase: `SKJERM 1 / 2 · /onboarding · SPILLER-ONBOARDING`

---

## SKJERM 1 — `/onboarding` — Spiller-onboarding (7 steg)

Markus får invitasjon fra Anders via SMS/e-post med en magic link. Han lander på `/onboarding`.

### Progress-stepper øverst (header)
7 prikker, hver med kort label under aktiv:
1. Velkommen
2. Om deg
3. Golf-erfaring
4. GolfBox
5. TrackMan
6. Coach + abonnement
7. Ferdig

Aktiv prikk lime, ferdige prikker forest, kommende prikker cream + border.

### STEG 1 — Velkommen (no skjema, kun innhold)

**Illustrasjon**: Stilisert SVG av en golfer i swing-positur på en lime-green bakgrunn med forest-silhuett av et tre. Subtil bevegelse-linjer.

**Tittel**: `Hei Markus — vi ` + Instrument Serif italic `*gleder oss*` + ` til å jobbe med deg.`

**Beskrivelse** (3 paragrafer):
> Coach Anders har invitert deg inn i AK Golf Academy. De neste 5 minuttene tar vi en kort gjennomgang for å sette opp profilen din, koble til verktøyene dine, og vise deg hvordan AK Golf fungerer.
>
> Du kan når som helst gå tilbake, lagre og fortsette senere. Ingenting er låst før du selv bekrefter siste steg.
>
> La oss begynne.

**Inspirasjons-strip** (under beskrivelsen, lime accent card):
> "Vi tenker langsiktig. Du blir bedre ved å gjøre de små tingene riktig — hver dag, i 3 år, i 5 år. Vi bygger karriere, ikke quick fixes."
> — Anders Kristiansen, Head Coach AK Golf Academy

**CTA**: kun "La oss starte" (lime stor, 48px høy, full bredde 320px sentrert)

### STEG 2 — Om deg (grunninfo)

**Illustrasjon**: SVG-ID-kort-stilisert med profilbilde-placeholder + linjer for navn/info, forest tema.

**Tittel**: `La oss bli ` + Instrument Serif italic `*kjent*`.

**Beskrivelse**: "Litt grunninfo så Anders kan tilpasse opplegget ditt. Du kan endre alt senere."

**Felt** (2-col grid):
- **Fullt navn** (input stor): "Markus Røinås Pedersen" (auto-fylt fra invitasjon)
- **Fødselsdato** (datovelger): "12.03.2008" — auto-utregner alder "17 år"
- **Kjønn** (radio): Mann / Kvinne / Vil ikke oppgi
- **E-post** (input): "markus.pedersen@gmail.com" (auto-fylt)
- **Telefon** (input med +47-prefiks): "476 12 345"
- **Hjemmeadresse** (input): "Bossekop 14, 1610 Fredrikstad"
- **Profilbilde** (upload-felt med dropzone, 240×240 sirkel-preview): "Last opp eller dra hit"
- **Mor/far/foresatt** (input, hvis under 18): "Tone Berg" + "tone.berg@gmail.com" (vi sender invitasjon til foreldreportal etter onboarding)

**Validering live**: rød hint under felt ved feil, lime checkmark ved gyldig

**CTA**: "Tilbake" (outline) + "Neste — Golf-erfaring" (lime)

### STEG 3 — Golf-erfaring

**Illustrasjon**: SVG av golfbag med klubber i stilisert forest-cream-stil, dybde med skygge.

**Tittel**: `Fortell om ` + Instrument Serif italic `*spillet ditt*`.

**Beskrivelse**: "Dette hjelper Anders med å skreddersy treningsplanen din fra dag én."

**Felt**:
- **Handicap** (input mono stor, viser i sanntid): "+3,5" — auto-detekterer + eller −
- **Hjemmebane / klubb** (søkbar dropdown med 200+ norske klubber): "Gamle Fredrikstad GK"
- **Antall år du har spilt** (slider med mono-tall): "0-25+ år" — Markus: 11 år
- **Kategori** (radio med beskrivelser):
  - **A1** (HCP +5 til 4,4) — "Elite/proff-nivå" (Markus' valg, lime highlight)
  - **A2** (HCP 4,5 til 11,4) — "Amatør, høyt nivå"
  - **B1** (HCP 11,5 til 18,4) — "Klubbnivå, høyere"
  - **B2** (HCP 18,5 til 36) — "Klubbnivå"
  - **C** (HCP 36+) — "Nybegynner"
- **Spiller du turneringer?** (radio): Ja, regelmessig / Ja, av og til / Nei, ikke nå
- **Mål for sesongen** (multiselect pills, velg inntil 3):
  - "Senke HCP" · "Vinne klubbmesterskap" · "Spille NM" · "Komme inn på college (USA)" · "Konsistent under par" · "Bedre putting" · "Bedre iron-spill" · "Mental robusthet" · "Bli proff"
- **Hvor mange økter per uke ønsker du?** (number-stepper): 3 · 4 · 5 · 6 · 7 · 8+ økter

**CTA**: "Tilbake" + "Neste — Koble til GolfBox" (lime)

### STEG 4 — Koble GolfBox

**Illustrasjon**: SVG av et stilisert dashboard med graf og baner-ikoner, lime accents.

**Tittel**: `Koble til ` + Instrument Serif italic `*GolfBox*`.

**Beskrivelse**: "Når du kobler til GolfBox-kontoen din, henter vi automatisk inn HCP-historikken og runde-data dine. Du slipper å fylle inn manuelt — og Anders får et komplett bilde fra dag én."

**Connect-card** (stor cream card med GolfBox-logo-placeholder):
- Lucide Link2-ikon stor sentralt
- Tittel: "GolfBox"
- Beskrivelse: "Vi henter HCP, runder spilt siste 24 mnd, og turneringshistorikk."
- CTA-knapp: "Koble til GolfBox" (lime stor) — åpner OAuth-popup
- Status-tekst: "Krever GolfBox-konto. Vi lagrer aldri passordet ditt."

**Hopp over-link** (subtil, under): "Hopp over — jeg kobler til senere"

**Trust-mikrokopi** (mono small, under): "Vi følger GDPR og lagrer kun det vi trenger for å hjelpe deg utvikle deg som spiller."

**CTA**: "Tilbake" + "Neste — TrackMan" (lime, deaktivert til kobling fullført eller hopp-over klikket)

### STEG 5 — Koble TrackMan

**Illustrasjon**: SVG av TrackMan-radar-stilisert med ball-flight-spor (lime kurve) og data-punkter.

**Tittel**: `Koble til ` + Instrument Serif italic `*TrackMan*`.

**Beskrivelse**: "Hvis du har en TrackMan-konto (egen, fra klubb, eller fra Performance Studio), kobler vi den slik at swing-data og ball-flight-info automatisk synkes til profilen din."

**Connect-card** (samme stil som GolfBox):
- TrackMan-logo-placeholder
- Lucide Radio-ikon
- CTA: "Koble til TrackMan" (lime)
- "Hopp over — jeg har ikke TrackMan-konto"

**Alternativ**: Sub-card under: "Bruker du Performance Studio på GFGK? Da er TrackMan automatisk koblet på via klubb-abonnementet."

**CTA**: "Tilbake" + "Neste — Coach + abonnement" (lime)

### STEG 6 — Coach + abonnement

**Illustrasjon**: SVG av to silhuetter (coach + spiller) i samtale på en green, lime golfball mellom dem.

**Tittel**: `Din ` + Instrument Serif italic `*coach*` + ` og ditt opplegg`.

**Beskrivelse**: "Velg coach og abonnement. Du kan endre dette når som helst."

**Coach-velger** (kort-grid 2-col):
- **Anders Kristiansen** (default valgt, lime border)
  - Avatar 80px sirkel
  - "Head Coach AK Golf Academy"
  - "+38 aktive spillere · 18 års erfaring · Mac O'Grady-skolen"
  - "Default coach for nye spillere"
  - Lime "VALGT"-badge
- **Erik Solli**
  - Avatar
  - "Putting-spesialist"
  - "Anbefales for kort-spill-fokus"
- **Maja Hagen**
  - Avatar
  - "Junior- og utviklings-coach"
  - "Anbefales for nybegynnere"

**Abonnement-velger** (under coach, 2-col):
- **GRATIS** (outline card)
  - "0 kr/mnd"
  - Inkluderer: PlayerHQ-profil · 1 økt-logg per uke · Turneringskalender · HCP-tracking
  - "Ingen booking · Ingen drill-bibliotek · Ingen AI-coach"
- **PRO** (lime border, "ANBEFALT" lime badge)
  - "300 kr/mnd" mono stor
  - Inkluderer: Alt i GRATIS + Booking · 142-drills bibliotek · AI-coach Anders · Bane-strategier · Sammenligning · Foreldre-portal
  - "Avsluttes når som helst"

(ELITE-tier vises IKKE — fjernet fra UI per 2-tier-modellen)

**Betalingsinfo** (kun hvis PRO valgt):
- "Vi sender faktura månedlig til markus.pedersen@gmail.com"
- Hvis under 18: "Faktura sendes til Tone Berg (foresatt) for godkjenning"
- Stripe-betalingsmetoder-velger: Kort / Vipps / Faktura (forelder)

**CTA**: "Tilbake" + "Neste — Foreldre-godkjenning" (lime) — siden Markus er 17

### STEG 7 — Foreldre-godkjenning + ferdig

**Illustrasjon**: SVG av familie-silhuetter ved en green — én voksen, én ungdom — varm forest-cream tone.

**Tittel**: `Nesten ` + Instrument Serif italic `*ferdig*` + ` — siste sjekk.`

**Beskrivelse**: "Siden du er 17, sender vi en kort melding til Tone Berg (mor) som bekrefter at hun godkjenner abonnementet og at du blir spiller hos AK Golf Academy. Hun får sin egen invitasjon til foreldre-portalen rett etter."

**Sammendrag-card** (cream stor):
- "Du har valgt:"
- "Coach: Anders Kristiansen"
- "Abonnement: PRO — 300 kr/mnd"
- "Faktura: Tone Berg (tone.berg@gmail.com)"
- "Hjemmebane: Gamle Fredrikstad GK"
- "Kategori: A1 (HCP +3,5)"
- "Mål: Vinne klubbmesterskap · Spille NM · Bedre iron-spill"
- "Frekvens: 5 økter/uke"

**Foreldre-melding-preview** (forest card med Lucide Mail):
> "Tone Berg, Markus har registrert seg som spiller hos AK Golf Academy med PRO-abonnement (300 kr/mnd). Godkjenn her: [LINK]. — Coach Anders Kristiansen"

**Avtale-checkbox** (med tydelig lime-border):
- ☑ "Jeg har lest og godtar AK Golf Academy sine vilkår, personvernerklæring og treningsfilosofi."
- ☑ "Jeg samtykker til at Anders, mine foreldre og jeg deler relevant trenings- og helsedata."

**Suksess-melding** (vises etter klikk "Fullfør"):
- Stor lime checkmark sentralt (Lucide CheckCircle 80px)
- Inter Tight 40px: "Velkommen til AK Golf, Markus."
- Sub: "Tone er varslet. Du får tilgang så snart hun bekrefter — vanligvis innen 1 time."
- CTA: "Gå til PlayerHQ" (lime stor) · "Last ned mobil-appen" (outline)

**CTA siste steg**: "Tilbake" + "Fullfør registrering" (lime, deaktivert til begge checkbox er huket)

---

## SKJERM 2 — `/onboarding/forelder` — Forelder-onboarding (4 steg)

Tone Berg får e-post med invitasjon fra Anders. Klikker magic link. Lander på `/onboarding/forelder`.

### Progress-stepper øverst (header)
4 prikker:
1. Velkommen
2. Om Markus
3. Godkjenn vilkår
4. Betaling

### STEG 1 — Velkommen (Tone)

**Illustrasjon**: SVG av en hånd som rekker en golfball til en ungdom — varm forest-cream tone, lime ball.

**Tittel**: `Hei Tone — ` + Instrument Serif italic `*velkommen inn*` + `.`

**Beskrivelse** (3 paragrafer):
> Anders Kristiansen og Markus har akkurat satt opp Markus' profil hos AK Golf Academy. Som mor er du en sentral del av hans utvikling, og vi vil at du skal være tett på — uten å være i veien.
>
> De neste 3 minuttene tar vi en kort gjennomgang. Du får din egen foreldre-portal med innsyn i Markus' planer, runder, fakturaer og fremgang. Du kan også sende meldinger til Anders direkte hvis du lurer på noe.
>
> La oss begynne.

**Inspirasjons-strip** (cream accent):
> "Foreldre er den viktigste støttespilleren en ung utøver har. Vi gjør alt vi kan for at du skal føle deg trygg på hva vi gjør — og hvorfor."
> — Anders Kristiansen, Head Coach AK Golf Academy

**CTA**: "La oss begynne" (lime stor)

### STEG 2 — Om Markus (bekreft barnets info)

**Illustrasjon**: SVG-ID-kort-stilisert med Markus' profilbilde-placeholder + linjer.

**Tittel**: `Bekreft ` + Instrument Serif italic `*Markus' info*`.

**Beskrivelse**: "Markus har fylt inn dette selv. Sjekk at det stemmer — endre om noe er feil."

**Felt** (read-only med edit-knapp):
- **Fullt navn**: "Markus Røinås Pedersen" + Lucide Edit2
- **Fødselsdato**: "12. mars 2008" (17 år)
- **Klubb**: "Gamle Fredrikstad GK"
- **HCP**: "+3,5" mono stor
- **Kategori**: "A1"

**Din info** (inputs Tone fyller selv):
- **Ditt navn** (input): "Tone Berg"
- **Telefon** (med +47): "478 22 567"
- **E-post**: "tone.berg@gmail.com" (auto-fylt)
- **Relasjon til Markus** (radio): Mor / Far / Foresatt / Annet
- **Andre voksne med innsyn** (valgfri, kan legge til far): "Legg til ny voksen" (link med Lucide Plus)

**Mikrokopi-strip** (mono small, lime accent):
> "Du kan invitere far/annen foresatt senere fra foreldre-portalen. Begge får samme tilgangsnivå."

**CTA**: "Tilbake" + "Neste — Godkjenn vilkår" (lime)

### STEG 3 — Godkjenn vilkår

**Illustrasjon**: SVG av en signatur-linje med en penn over (forest tema).

**Tittel**: `Vilkår og ` + Instrument Serif italic `*samtykke*`.

**Beskrivelse**: "Som foresatt for en mindreårig spiller må du godkjenne våre vilkår, personvernerklæringen, og avtalen om trenings-data."

**Avtale-cards** (3 stk, expandable):

1. **Treningsavtale** (cream card med Lucide FileText)
   - Tittel: "AK Golf Academy Treningsavtale"
   - Sub: "Beskriver hva Markus får tilgang til, frekvens, og forventninger fra begge sider."
   - "Les hele avtalen" (link)
   - ☑ Checkbox: "Jeg godkjenner treningsavtalen"

2. **Personvern + data** (cream card med Lucide Shield)
   - Tittel: "Personvernerklæring og datadeling"
   - Sub: "Hvilke data vi samler om Markus, hvordan vi bruker dem, og dine rettigheter."
   - "Les hele erklæringen" (link)
   - ☑ Checkbox: "Jeg samtykker til datadeling mellom Markus, coach og foresatte"

3. **Betalings- og avbestillings-vilkår** (cream card med Lucide CreditCard)
   - Tittel: "Betaling og oppsigelse"
   - Sub: "Faktura månedlig. Avsluttes når som helst med 30 dagers oppsigelse."
   - "Les vilkårene" (link)
   - ☑ Checkbox: "Jeg godkjenner betalingsvilkårene"

**Sikkerhetsstripe** (lime accent, bunn):
> "Anders Kristiansen og AK Golf Academy er forsikret, registrert som golftrener av NGF, og har politiattest. Alle våre rutiner følger Norges Idrettsforbund sine retningslinjer for arbeid med mindreårige."

**CTA**: "Tilbake" + "Neste — Betaling" (lime, deaktivert til alle tre er huket)

### STEG 4 — Betaling

**Illustrasjon**: SVG av en stilisert faktura/kvittering med lime aksent.

**Tittel**: `Sett opp ` + Instrument Serif italic `*betaling*`.

**Beskrivelse**: "Markus har valgt PRO-abonnement, 300 kr/mnd. Du faktureres månedlig fra dato Markus er aktivert. Avsluttes når som helst."

**Sammendrag-card** (forest card stor):
- "Markus Røinås Pedersen"
- "AK Golf Academy PRO"
- "300 kr/mnd" mono Inter Tight 32px
- "Første faktura: 20. mai 2026"
- "Neste faktura: 20. juni 2026"

**Betalingsmetode-velger** (kort-grid 3-col):
- **Vipps** (cream card med Vipps-logo-placeholder) — "Anbefalt" lime-badge
- **Kort** (cream card med Lucide CreditCard)
- **Faktura på e-post** (cream card med Lucide Mail) — "30 dagers betalingsfrist"

**Stripe-felt** (vises hvis kort valgt):
- Kortnummer (input mono)
- Utløpsdato + CVC (2-col)
- Postnummer
- Auto-lagre (default på)
- Liten "Sikret med Stripe" mikrokopi mono

**Suksess-skjerm** (etter "Fullfør"):
- Lime checkmark stor (Lucide CheckCircle 80px sentralt)
- Inter Tight 40px: `Takk, Tone. Vi gleder oss til å jobbe sammen.`
- Sub: "Markus er aktivert. Du har nå tilgang til foreldre-portalen — vi har sendt deg en lenke på e-post."
- CTA: "Gå til foreldre-portalen" (lime stor) · "Hopp til Markus' profil" (outline)

**Kontakt-strip** (bunn):
> "Spørsmål? Anders nås direkte på akgolfgroup@gmail.com eller +47 905 12 345. Vi svarer som regel innen 4 timer på hverdager."

---

## Felles modaler

### Modal: Lagre og fortsett senere
Åpnes ved klikk på "Lagre og fortsett senere"-knapp.
- Tittel: "Vi husker hvor du var."
- Beskrivelse: "Vi sender deg en lenke til e-posten din slik at du kan fortsette der du slapp — uansett enhet."
- Input: E-post (auto-fylt)
- CTA: "Send lenke" (lime) · "Avbryt" (outline)
- Etter send: "Sjekk e-posten din. Lenken er gyldig i 7 dager."

### Modal: Avbryt onboarding
Åpnes ved klikk på X (lukke).
- Tittel: "Er du sikker?"
- Beskrivelse: "Du mister fremgangen din. Vi anbefaler heller å bruke 'Lagre og fortsett senere' så du kan komme tilbake."
- CTA: "Ja, avbryt" (destructive outline) · "Lagre og fortsett senere" (lime) · "Tilbake til onboarding" (outline)

### Modal: Kontakt Anders
Åpnes ved klikk på "Snakk med Anders"-link i footer.
- Tittel: "Send melding til Anders"
- Pre-fylt: "Hei Anders, jeg er midt i onboarding og lurer på..."
- Tekstfelt (4 rader)
- CTA: "Send melding" (lime) · "Avbryt" (outline)
- Garanti-mikrokopi: "Anders svarer som regel innen 4 timer på hverdager."

---

## Tilstander å vise

For demo-formål: rendere alle 7 spiller-steg + alle 4 forelder-steg som **kortere kompakte rader** under hverandre (ikke faktisk overgang mellom steg — vis alle som synlige sections med "Steg N"-label så designer ser hele flyten). Hvert steg ca 600-800px høyt.

Mellom hvert steg: mono-stripe `STEG N AV M · ETIKETT` som visuell separator.

På siste steg per skjerm: vis suksess-skjermen (lime checkmark + tittel) som siste section.

---

## Branding (følger AK Golf design system)

- BG cream `#FAFAF7` (alle steg)
- Card hvit `#FFFFFF` med border `#E5E3DD` (input cards)
- Cream `#F1EEE5` (inspirasjons-strips, sammendrag-cards)
- Lime accent på CTA, valgt-state, suksess-skjermer
- Forest tone for primær tekst, knapper og ikoner
- Inter Tight stor på titler (36px), normal på sub-titler (20px)
- Inter på body-tekst (16px), regular weight
- JetBrains Mono på tall (HCP, dato, faktura-beløp), labels og stepper
- Instrument Serif italic én gang per steg — som varm aksent på sentralt ord
- 16px radius cards, 12px buttons, 8px inputs
- Store CTA-knapper (48px høye, lime primary)
- INGEN emojier, kun Lucide-ikoner stroke 1.75
- Norsk bokmål gjennomgående

## SVG-illustrasjoner

Hver steg har en relevant illustrasjon i stilisert flat design (forest/lime/cream-palett). Disse er enkle SVG-er (200-400 linjer hver), ikke fotorealisme. Tenk Linear/Stripe-stil illustrasjon.

Eksempler:
- Steg 1 (spiller): Golfer i swing, lime green bakgrunn, forest tre-silhuett
- Steg 2 (spiller): ID-kort med profilbilde-placeholder
- Steg 3 (spiller): Golfbag med klubber
- Steg 4 (spiller): Dashboard med graf og baner
- Steg 5 (spiller): TrackMan-radar med ball-flight
- Steg 6 (spiller): To silhuetter (coach + spiller) på green
- Steg 7 (spiller): Familie-silhuetter
- Steg 1 (forelder): Hånd som rekker golfball til ungdom
- Steg 2 (forelder): ID-kort
- Steg 3 (forelder): Signatur-linje med penn
- Steg 4 (forelder): Stilisert faktura/kvittering

## Tekniske krav

- Single self-contained `.html` med BEGGE skjermer i samme fil
- Inline `<style>` block
- Google Fonts via `<link>`
- All icons inline Lucide SVG (stroke 1.75)
- 11 illustrasjoner total (7 spiller + 4 forelder) som inline SVG
- Progress-stepper er sticky topp
- Steg-separator-stripe mellom hvert steg
- Sticky footer per skjerm
- ~2200–2800 linjer HTML

## Constraints

- INGEN emojier
- ALL UI på norsk bokmål
- Diskipliner uppercase: FYS, TEK, SLAG, SPILL, TURN
- HCP-format: `+3,5`, `−2,0`, `12,4` (komma som desimal, − som minus)
- Tall norsk format: `300 kr/mnd`, `+47 905 12 345`
- Klokkeslett 24h: `12:00`
- Dato: `12. mars 2008`, `20. mai 2026`
- Inter Tight 36px på titler — gi flyten luft og kvalitet
- AVOID generic SaaS-stil — dette skal føles personlig, ikke transactional
- Tone-of-voice: varm, direkte, "vi gleder oss", "vi tenker langsiktig" — ikke "Velkommen til vår plattform"

Output: én komplett HTML-fil med begge skjermer (spiller + forelder) i samme dokument, alle steg synlige som sections. Begin `<!DOCTYPE html>`, end `</html>`. Ingen forklaring utenfor kode-blokken.
