# Mini-batch modal-C - Booking

**4 modaler i denne mini-batchen.** Felles moenster: Booking-flyt fra start
til ferdig - velge tid/fasilitet, omplanlegge, se fasilitet, og bekrefte.
Spenner over PlayerHQ (spiller booker) og CoachHQ (coach omplanlegger).

**Generer alle 4 modaler i denne sesjonen.** Foelg anti-state-katalog-regel
fra `felles-instruks.md` - EEN produksjons-modal per HTML.

---

## Felles for booking-modaler

- **Modal-container:** Sentrert, max-width 560-720px, `rounded-xl`, bakdrop blur(4px)
- **Header (sticky, 72px):** Italic tittel + sub + lukk-X
- **Footer (sticky, 72px):** Avbryt venstre, primary CTA hoeyre (accent lime)
- **Spiller:** Markus Roinaas Pedersen (Pro-tier)
- **Coach:** Anders Kristiansen
- **Fasilitet-eksempler:** "Mulligan Studio 1" (1 600 kr/t), "Mulligan Studio 2", "GFGK Range" (gratis for medlemmer), "Bossum Sim-rom"
- **Tids-eksempler:** "I dag 14:00-15:00", "Torsdag 14. mai 16:30-17:30"
- **Tier-gating:** Free har max 2 bookinger/maaned, Pro er ubegrenset (vises i BookSession som info-banner)
- **Pris-format:** "1 600 kr" (mellomrom som tusenseparator)

---

## Pakker i denne mini-batchen

---

## Pakke 1/4: BookSessionModal (NY)

# AK Golf Platform - Modal - BookSessionModal

## Identitet

- **Produkt:** PlayerHQ
- **Trigger:** `Book oekt`-CTA i PlayerHQ hjem / kalender / fasilitet-detalj
- **Type:** Multi-step modal (3 steg)
- **Bredde:** 720px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/book-session.html`

## Spec

Markus velger fasilitet -> tid -> bekrefter. Free-tier har begrenset antall
bookinger/maaned (vises som info-banner i steg 1). Steg 2 viser ledige tider
fra valgt fasilitet i ukes-kalender.

## Layout

- **Header:** Italic "Book oekt" + sub "Steg {n} av 3" + lukk-X
- **Steg-indikator:** 3 prikker
- **Steg 1 - Velg fasilitet:**
  - Tier-banner (kun Free): info-blokk "Du har brukt 1 av 2 bookinger denne maaneden. Oppgrader til Pro for ubegrenset ->"
  - Liste over 4 fasiliteter som cards:
    - Avatar/ikon + navn ("Mulligan Studio 1")
    - Sub: "TrackMan 4 - 1 600 kr/t" eller "Gratis for GFGK-medlemmer"
    - Avstand-pill: "1,2 km" (nearest first)
    - Liten thumbnail-foto (placeholder graa)
  - Klikk -> velger fasilitet (accent-border + sjekk-ikon)
- **Steg 2 - Velg tid:**
  - Header med valgt fasilitet (compact: avatar + navn + endre-link)
  - Ukes-kalender (7 dager, scrollbar fremover): 30-min slots
  - Ledige slots: tomme/hvite, klikkbare -> hover viser accent
  - Bookede slots: dempet graa, ikke klikkbare
  - Pris-info nederst: "Valgt: Torsdag 14. mai 16:30-17:30 - 1 600 kr"
- **Steg 3 - Bekreft:**
  - Sammendragskort: fasilitet + tid + pris
  - Spilfreuninn-toggle: "Inviter spillpartner" (valgfri, m/ e-post input)
  - Notater-textarea: "Beskjed til coach/fasilitet (valgfri)"
  - Betaling-info: "Belastet kort: Visa ****4242 - Endre"
- **Footer:**
  - Steg 1-2: `Avbryt` + `Neste ->` (accent, disabled til valg gjort)
  - Steg 3: `Avbryt` + `<- Tilbake` + `Bekreft og betal ->` (accent)

## States / Output

1. Steg 1 lyst tema (Free-tier banner synlig, 4 fasiliteter)
2. Steg 1 Pro-tier (ingen banner)
3. Steg 2 lyst tema (ukes-kalender med valgt slot)
4. Steg 2 loading-availability (skeleton-slots)
5. Steg 3 lyst tema (sammendrag)
6. Moerkt tema (steg 2)
7. Tier-gated state (Free har naadd max 2/maaned - hard lock)
8. Mobile full-screen (steg 2 blir 1-dags-view)

## Anti-moenster

- IKKE state-katalog ("Steg 1, Steg 2, Steg 3" side-om-side)
- IKKE generisk dato-picker - skal vaere visuell ukes-kalender med slot-grid
- IKKE skjul prisen til siste steg - vis tydelig pr fasilitet og pr slot
- IKKE Pro-features synlige som disabled for Free (vis tier-banner med oppgrader-CTA i stedet)

---

## Pakke 2/4: RescheduleBookingModal (NY)

# AK Golf Platform - Modal - RescheduleBookingModal

## Identitet

- **Produkt:** PlayerHQ + CoachHQ
- **Trigger:** "Omplanlegg"-knapp paa eksisterende booking (i quick-popover paa kalender, eller booking-detalj)
- **Type:** Single-step modal med kalender + valgfri grunn
- **Bredde:** 640px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/reschedule-booking.html`

## Spec

Flytt eksisterende booking til ny tid uten aa kansellere + book paa nytt.
Valgfri begrunnelse sendes til motpart (coach hvis spiller flytter, eller
spiller hvis coach flytter).

## Layout

- **Header:** Italic "Flytt booking" + sub "Naavaerende: Torsdag 14. mai 16:30-17:30 - Mulligan Studio 1" + lukk-X
- **Body:**
  - **Foer-etter-visning:** 2 mini-cards side-om-side
    - Venstre: "Naa" - tid + fasilitet (dempet, strikethrough)
    - Hoeyre: "Ny tid" - tom inntil valg gjort (accent-border placeholder)
  - **Ukes-kalender:** Samme grid som BookSession steg 2, med valgt fasilitet laast (kan ikke endres her - bruk Avbryt + Book ny for det)
  - **Grunn (valgfri):** Textarea "Hvorfor flytter du? (valgfri - sendes til Anders)"
  - **Info-tekst:** "Anders faar varsel og kan godta/avvise. Bekreftelse innen 24t."
- **Footer:** `Avbryt` + `Bekreft flytting ->` (accent, disabled til ny tid valgt)

## Confirm-step

Etter klikk paa `Bekreft flytting ->`:
- Mini-confirm overlay: "Flytter fra Torsdag 14. mai 16:30 -> Fredag 15. mai 10:00. Bekreft?"
- `Tilbake` + `Send forespoersel ->` (accent)

## States / Output

1. Lyst tema default (ingen ny tid valgt - confirm-CTA disabled)
2. Lyst tema med ny tid valgt (foer/etter-visning komplett)
3. Confirm-step overlay
4. Loading ("Sender forespoersel ...")
5. Success-state (toast "Forespoersel sendt - Anders faar varsel")
6. Moerkt tema
7. Mobile full-screen

## Anti-moenster

- IKKE skjul den gamle tiden - foer/etter er kjerne-UX
- IKKE krav om grunn (skal vaere valgfri)
- IKKE direkte cancel-and-rebook (det er separat aksjon)

---

## Pakke 3/4: FacilityDetailModal

# AK Golf Platform - Modal - FacilityDetailModal

## Identitet

- **Produkt:** PlayerHQ
- **Trigger:** Klikk paa fasilitet i kart-pin / fasilitet-liste
- **Type:** Detalj-modal med tabs
- **Bredde:** 720px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/facility-detail.html`

## Spec

Markus ser detaljer om fasilitet foer han booker - foto, utstyr, aapningstider,
pris, anmeldelser. Action-CTA er `Book her ->` som aapner BookSessionModal
med fasilitet pre-valgt.

## Layout

- **Header:** Italic "Mulligan Studio 1" + sub "Fredrikstad sentrum - 1,2 km" + lukk-X
- **Hero-foto:** 640x240px placeholder graa-gradient med fasilitet-ikon
- **Tabs (4):** `Oversikt` (default) - `Utstyr` - `Tider` - `Anmeldelser`
- **Oversikt-tab:**
  - Pris-card: "1 600 kr/time - Inkluderer TrackMan-data og kaffe"
  - Beskrivelse (kort tekst, 3 setninger)
  - Stats-rad: "4,8/5 stjerner (32 anmeldelser)" + "127 oekter booket 2026"
  - Adresse-card med Lucide `MapPin` + adresse + "Vis paa kart ->" link
- **Utstyr-tab:**
  - Checklist (Lucide `Check`): "TrackMan 4", "Mevo+ kamera", "Auto-tee", "Putt-matte 4m", "Foundation-baller", "Skjerm 4K"
- **Tider-tab:**
  - Tabell aapningstider per ukedag
  - Ledige slots neste 7 dager (mini-kalender)
- **Anmeldelser-tab:**
  - 5 anmeldelser med stjerner + spiller-avatar + tekst
- **Footer:** `Lukk` venstre + `Book her ->` (primary accent) hoeyre

## States / Output

1. Lyst tema default (Oversikt-tab)
2. Lyst tema Utstyr-tab aktiv
3. Lyst tema Tider-tab aktiv
4. Moerkt tema
5. Loading (skeleton-hero + skeleton-content)
6. Mobile full-screen (tabs blir scrollbar horisontalt)

## Anti-moenster

- IKKE booking-form inni denne modalen (det er BookSessionModal)
- IKKE skjul prisen - skal vaere oeverst paa Oversikt
- IKKE Lorem ipsum-anmeldelser - bruk konkret tekst (eks: "Anders ga meg topp coaching her" - Henrik N.)

---

## Pakke 4/4: BookingConfirmationModal

# AK Golf Platform - Modal - BookingConfirmationModal

## Identitet

- **Produkt:** PlayerHQ
- **Trigger:** Etter at booking er bekreftet og betalt fra BookSessionModal steg 3
- **Type:** Success-modal med info + neste-steg
- **Bredde:** 560px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/booking-confirmation.html`

## Spec

Markus ser bekreftelse paa booking - tid, fasilitet, kvittering. Ogsaa
"Legg til i kalender"-knapper og forberedelses-info.

## Layout

- **Hero-seksjon:** Lucide `CheckCircle2` 64px accent + italic "Booking bekreftet" 28px
- **Booking-detalj-card:**
  - Stor pris-rad: "1 600 kr - belastet Visa ****4242"
  - Fasilitet (avatar + navn): "Mulligan Studio 1"
  - Tid: "Torsdag 14. mai 2026 - 16:30-17:30"
  - Adresse: "Storgata 12, Fredrikstad" + link "Vis paa kart ->"
  - Booking-ID (Geist Mono): "#BK-2026-0421"
- **Forberedelse-seksjon:**
  - "Slik kommer du i gang:"
  - Bullet-liste:
    - "Moet opp 5 min foer"
    - "Resepsjonen aapner doer til Studio 1"
    - "TrackMan startes automatisk naar du logger inn paa skjermen"
- **Add-to-calendar-rad:**
  - 3 knapper: `Google Calendar` (Lucide `Calendar`) - `Apple Calendar` - `Outlook`
- **Footer:** `Last ned kvittering` (sekundaer, Lucide `Download`) venstre + `Til mine bookinger ->` (primary accent) hoeyre

## States / Output

1. Lyst tema default (full confirmation)
2. Moerkt tema
3. Loading initial (sjelden - kommer rett etter success)
4. Kalender-knapp loading (Google laster)
5. Mobile full-screen

## Anti-moenster

- IKKE bare en toast - dette er separat modal med rik info
- IKKE skjul booking-ID (brukes ved support)
- IKKE upsell her (Pro / nye produkter hoerer hjemme andre steder)
- IKKE confetti her (forventet bekreftelse, ikke achievement)
