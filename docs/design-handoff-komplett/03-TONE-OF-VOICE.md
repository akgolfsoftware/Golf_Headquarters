# 03 — Tone of Voice

Hvordan plattformen "snakker" til brukerne. Norsk bokmål gjennomgående.

---

## Grunnregler

### Språk
- **Norsk bokmål** med æ, ø, å (ikke ae, oe, aa)
- **Du-form** (aldri "brukeren", "spilleren", "klienten")
- **Aktiv stemme** ("Logg din runde", ikke "Logging av runde")

### Form
- **Maks 8 ord** på CTA-knapper
- **Ingen utropstegn** ("Bra jobba!" → "Bra jobba.")
- **Ingen "Hei og velkommen!"-tekst**
- **Datoer:** norsk format ("23. mai 2026", ikke "2026-05-23")
- **Tall:** JetBrains Mono med tabular-nums
- **Tid:** 24-timers ("14:00", ikke "2 PM")

### Personlighet
- **Klok coach**, ikke entusiastisk assistent
- **Quiet confidence** — sikker, ikke høyrøstet
- **Editorial luxury** — som å lese Kinfolk
- **Aldri kjepphøy** — vi er ikke "the next big thing"

---

## Faste termer (glossary)

### Roller

| ✅ Bruk | ❌ Aldri |
|---|---|
| Spiller | Elev, klient, atlet |
| Coach | Trener (men "hovedcoach" er OK) |
| Hovedcoach | Hoved-coach |
| Forelder/foreldre | Foresatte (formelt), foreldrene |
| Admin | Systembruker, superuser |

### Diskipliner (5-akse pyramide, ALLTID uppercase)

| Term | Bruk |
|---|---|
| **FYS** | Fysisk fundament |
| **TEK** | Teknikk · golfsving |
| **SLAG** | Slagspesifikk trening |
| **SPILL** | Banespill · scoring |
| **TURN** | Turnering · konkurranse |

**Format:** `FYS · TEK · SLAG · SPILL · TURN` (dot-separator)

### Periodisering (Bompa-modellen)

| Term | Beskrivelse |
|---|---|
| Grunntrening | Høyt volum, lav intensitet |
| Oppbygging | Stabilt volum, økende intensitet |
| Spesialisering | Lav volum, høy intensitet |
| Konkurranse | Vedlikehold + tournament-prep |
| Overgang | Lett aktivitet etter sesong |
| Hvile | Aktiv hvile, ikke trening |

### Strokes Gained

| Term | Beskrivelse |
|---|---|
| Strokes Gained (SG) | Slag spart vs benchmark |
| SG-OTT | Off the tee (drive) |
| SG-APP | Approach (inn til green) |
| SG-ARG | Around the green (chip, pitch, bunker) |
| SG-PUTT | Putting |

### Statistikk

| ✅ Bruk | ❌ Aldri |
|---|---|
| HCP | Handicap (formelt OK, men HCP i UI) |
| Snittscore | Average score |
| GIR % | "Hit greens" |
| Drv carry | Driver-lengde |
| Bird/runde | "Birdies per round" |

### Tjenester & abonnement

| Tier | Pris | Credits | Beskrivelse |
|---|---|---|---|
| **GRATIS** | 0 kr | 0 | Begrenset tilgang |
| **PRO** | 300 kr/mnd | 4 | Performance — full coaching |

**Note:** ELITE-tier finnes i kode (enum) men ikke i UI. Kun GRATIS + PRO.

### Anlegg & lokasjon

| ✅ Bruk | ❌ Aldri |
|---|---|
| Anlegg | Facility, lokasjon, venue |
| Lokasjon | Klubb-paraply (men "klubb" er OK i kontekst) |
| Driving range | Range, driving |
| Putting green | Putting område |
| Bane | Course |

### Booking & økt

| ✅ Bruk | ❌ Aldri |
|---|---|
| Økt | Session, trening |
| Booking | Reservasjon (men engelsk-norsk hybrid OK) |
| Live-økt | Under utførelse |
| Brief | Pre-økt-introduksjon |
| Summary | Post-økt-sammendrag |

---

## CTA-mønstre

### Primær handling (start noe)
- "Logg din runde"
- "Start økt"
- "Ny booking"
- "Generer plan"

### Sekundær handling (utforsk)
- "Se alle tester"
- "Bla i drill-bibliotek"
- "Vis full historikk"

### Bekreftelse
- "Lagre"
- "Bekreft"
- "Send"

### Annullering
- "Avbryt"
- "Tilbake"
- "Lukk"

### Destruktiv
- "Slett"
- "Avlys"
- "Fjern"

**Aldri:** "OK", "Ja", "Nei", "Submit", "Cancel", "Done", "Click here"

---

## Empty states

**Format:** Ikon (Lucide, 40px) + tittel + beskrivelse + CTA

**Eksempler:**

```
[Calendar-ikon]
Ingen økter i dag
Du har en rolig dag. Logg en runde eller start en drill-økt.
[+ Ny økt]
```

```
[Flag-ikon]
Ingen runder loggført
Logg din første runde for å se SG-data og fremgang.
[Logg din første runde]
```

```
[Users-ikon]
Ingen treningskompiser ennå
Inviter en venn og tren sammen mot felles mål.
[+ Inviter kompis]
```

**Aldri:**
- "Sorry, nothing to show!"
- "Coming soon..."
- "Tomt 😢"

---

## Feilmeldinger

**Format:** Saklig, ikke unnskyldende, med løsning

**Eksempler:**

```
✅ E-post mangler. Skriv din e-post for å logge inn.
❌ Oops! Du må fylle ut e-post!
```

```
✅ Passord for kort. Bruk minst 8 tegn.
❌ Sorry, passordet er ugyldig
```

```
✅ Kunne ikke koble til server. Sjekk internett og prøv igjen.
❌ Error 500: Internal server error
```

---

## Suksess-feedback

**Format:** Kort, direkte, ingen overdreven feiring

**Eksempler:**

```
✅ "Lagret."
✅ "Sendt til Anders."
✅ "Runde loggført."
```

**Aldri:**
- "Bra jobba! Du klarte det!"
- "🎉 Suksess!"
- "Yes! Now you're on fire 🔥"

---

## Loading-tekst

**Format:** Verb-form, ikke "Loading..."

```
✅ "Henter dine runder ..."
✅ "Lagrer ..."
✅ "Genererer plan ..."
```

**Aldri:**
- "Loading"
- "Just a sec"
- "Please wait"

---

## Helper-tekst (skjema-felt)

**Format:** Forklarende, ikke instruerende

```
✅ Telefon: "Brukes for SMS-varslinger og påminnelser"
❌ Telefon: "Skriv ditt telefonnummer her"
```

```
✅ HCP: "Ditt offisielle WHS-handicap (oppdateres etter hver runde)"
❌ HCP: "Tast inn ditt handicap"
```

---

## Norsk-engelsk hybrid (akseptert)

Disse engelske ord brukes på norsk uten oversettelse:
- Booking
- Drill
- Workbench
- Workspace
- Caddie (engelsk, ikke "kaddi")
- Tier (GRATIS/PRO)

Resten oversettes:
- Session → Økt
- Calendar → Kalender
- Settings → Innstillinger
- Notifications → Varslinger
- Profile → Profil
- Statistics → Statistikk

---

## Forbudte ord/uttrykk

- "Bruker" som subjekt → "du"
- "Trener" om en person → "coach"
- "Trening" om en økt → "økt"
- "Session" → "økt"
- "Click here" / "Trykk her" → bruk konkret CTA
- "Loading..." → "Henter ..."
- "OK" → "Bekreft" eller "Lagre"
- "Submit" → "Send"
- "Cancel" → "Avbryt"

---

## Eksempler på god vs dårlig tekst

### Hero på Workbench

**Dårlig:**
> "Velkommen tilbake! 👋 La oss få deg i form for neste turnering! Du har 5 runder å logge!"

**Bra:**
> "Hei, Øyvind."
> A1 · HCP -2.1 · 21 dager til Sørlandsåpent

### AI-Innsikt

**Dårlig:**
> "Bra jobba så langt! 🌟 Caddie-tipset: Du burde kanskje vurdere mer putting?"

**Bra:**
> "OBSERVASJON · Din SG-PUTT er -1.4 siste 5 runder. Foreslår gate-drill i morgen 08:00."

### Empty state

**Dårlig:**
> "Ingen runder ennå. Logg din første nå, du klarer det! 💪"

**Bra:**
> "Ingen runder loggført. Start med å registrere din siste runde for å se SG-data."

### Error

**Dårlig:**
> "Oops! Noe gikk galt 😞 Prøv igjen senere."

**Bra:**
> "Kunne ikke lagre. Sjekk internett-tilkobling og prøv igjen."
