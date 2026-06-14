# Booking — produkt-brief

> **Rute:** `/booking` (offentlig) + speilet i `/portal/booking` (innlogget) · **Enhet:** mobil-først · **Tema:** lyst.
> **Status i dag:** nesten ikke designet (kun ett showcase-kort) — dette er den største design-mangelen før lansering. Bygg fra `01-DESIGNSYSTEM.md`.
> **Merk:** Acuity (akgolfgroup.as.me) er midlertidig booking-vei til denne flyten lanseres. Design den innebygde flyten lanseringsklar.

## Kjerne-flyt (≤ få trinn, tydelig fremdrift)
**Velg tjeneste → Velg coach → Velg anlegg/fasilitet → Velg tid → Bekreft → Kvittering.** Vis en tydelig stegindikator. Gjest kan booke uten konto (e-post), innlogget spiller får forhåndsutfylt + credit-trekk.

## Regler som styrer designet
- **Lokasjon vs Fasilitet:** Lokasjon (f.eks. GFGK) er påkrevd; Fasilitet (f.eks. Performance Studio, Simulator Bay) er valgfri (drop-in kan være uten). Vis lokasjon først, fasilitet som forfining.
- **Betaling:** Stripe (engang) ELLER credit-trekk fra coaching-pakke (Performance 2 / Performance Pro 4 per mnd) for innloggede. Vis tydelig hva som trekkes (kr eller «1 av N credits»).
- **Dobbeltbooking-sperre:** opptatte slots vises som utilgjengelige (ikke valgbare). Aldri tillat samme slot to ganger.

## Skjermer

### 1. Velg tjeneste — `/booking`
Liste/kort over tjenestetyper (1:1-coaching, gruppe, TrackMan-time, drop-in). Hvert kort: navn, varighet, pris/credit, kort beskrivelse. Komponenter: AthleticCard, StatusPill, AthleticButton. Stegindikator (1/5).

### 2. Velg coach
Coach-kort (foto, navn, spesialitet). Filtrer på tjeneste. Komponenter: AthleticCard, AthleticAvatar, FilterPillBar.

### 3. Velg anlegg/fasilitet
Lokasjon (påkrevd) → fasilitet (valgfri). Vis kart/bilde av anlegget der relevant. Komponenter: AthleticCard, PartnerCard, DataTable (åpningstider).

### 4. Velg tid
Kalender + ledige slots (`SessionScheduler`/`DayCal`/`MonthGrid`). Opptatte slots grået ut. Vis coachens reelle tilgjengelighet. Tomt: EmptyState «ingen ledige tider denne uka → neste uke».

### 5. Bekreft
Oppsummering (tjeneste, coach, anlegg, tid, pris/credit). Gjest: e-post + navn. Innlogget: forhåndsutfylt. Primær-CTA «Bekreft og betal» / «Bekreft (1 credit)». Komponenter: AthleticCard, AthleticButton, StatusPill. Stripe-betaling inline der det kreves.

### 6. Kvittering
Bekreftelse + kalenderfil + «legg til i kalender» + neste steg (se i PlayerHQ). Komponenter: FeaturedCard (forest-gradient), ActionList. Sender bekreftelses-e-post.

## Tilstander
Hvert steg: laster (skeleton) · ingen alternativer (EmptyState m/ vei videre) · feil (betaling avvist → tydelig retry). Avbryt/tilbake bevarer valg.

## Design-direksjon (Booking)
Rolig, tillitsbyggende, mobil-først. Få felt per skjerm. Tydelig fremdrift og pris/credit-transparens. Foto av coach/anlegg skaper tillit. Lime kun på den aktive primær-CTA-en.
