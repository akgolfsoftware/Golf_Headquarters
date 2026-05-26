# Redesign: CoachHQ Coach-agent Chat

**Last opp før prompten:** `wireframe/screen-deck/coachhq/coach-agent-chat.html`

---

## ANTI-MØNSTER

Forrige levering var 6 captioned mini-mockups. **ÉN fullbleed produksjons-skjerm.**

---

## MÅL

AI-chat-flate hvor Anders (coach) snakker med agent-systemet for å få innsikt om en spesifikk spiller. Klassisk chat-UI tilpasset CoachHQ-stil. Tilgjengelig fra 360-profil eller separat verktøy-side.

**Canvas: 1440×900.** CoachHQ-shell med to-lags sidebar.

---

## LAYOUT (eksakte mål)

### Sidebar (256px)

CoachHQ to-lags. "Spillere → Markus R → AI-chat" aktivt.

### Topp-bar i chat-pane (72px, bg hvit, border-bottom 1px `#E5E3DD`)

- **Venstre:**
  - Avatar 40×40 (Markus, primary-green bg, "MR")
  - Navn: "AI om Markus" Inter 16px medium
  - Sub: "Kontekst: 30d data, 4 økter, 2 runder" Inter 12px muted
- **Høyre:**
  - "Eksporter chat →" ghost-knapp
  - "Ny chat"-ikon-knapp

### Chat-area (resterende plass minus footer)

Sentrert med max-bredde 720px. Generøs padding (24px på sidene).

**Meldinger** (4-5 stk, vekslende user/agent):

1. **Coach (Anders):**
   - Avatar 32×32 høyre side, lime-bg "AK"
   - Bobble: rgba(0,88,64,0.06) bg, padding 12px 16px, radius 16px 16px 4px 16px
   - Tekst: "Hvorfor har Markus mistet 3 cm i drive-lengde siste 30d?"
   - Tidsstempel: "14:28"

2. **Agent (System):**
   - Avatar 32×32 venstre side, dark bg, sparkle-ikon
   - Bobble: hvit bg, border 1px `#E5E3DD`, padding 16px 20px, radius 16px 16px 16px 4px
   - Tekst (med tabell-innslag):
     - "Tre sannsynlige årsaker basert på TrackMan + helse-data:"
     - Liste: "1. Søvn-snitt fra 7,8t → 6,9t (-12 %). 2. Krop-rotasjon-data viser 4° mindre vridning. 3. 5 av 8 siste økter manglet warm-up."
     - "Anbefaling: Sett opp 20min mobilitet-økt før neste range-økt."
   - Tidsstempel: "14:28 · 2s tenketid"
   - "Kilder"-pill nederst (rgba(0,0,0,0.05) bg) som åpner panel ved klikk

3. **Coach:** "Når sist hadde han 100% warm-up?"
4. **Agent:** "12. april — 24 dager siden. Etter den datoen droppet warm-up-ratio fra 100% → 62%."
5. **Coach (i ferd med å skrive):** Vises som tom bobble med skrive-indikator (3 dots)

### Footer / Input-area (88px, bg hvit)

- Tekst-input full bredde minus padding
- Placeholder: "Spør om Markus..."
- Send-knapp ikon høyre (lime, lucide `Send`)
- Under input: 3 mini-chips med "Forslag:" som klikkes for ferdig-prompter
  - "Vis siste 5 økter"
  - "Sammenlign med peers"
  - "Forklar HCP-trend"

---

## DEFAULT-STATE

- **Spiller-kontekst:** Markus Roinaas Pedersen, 30 dager data
- **4 ferdige meldinger + 1 skrive-indikator**
- **3 forslags-chips synlig**
- **Tid:** 14:28 (siste melding)

---

## STATES SOM SEPARATE FILER

- `08-coach-agent-chat-default.html` — DENNE (aktiv samtale)
- `08-coach-agent-chat-empty.html` — Ny chat, ingen meldinger, sentrert prompt-sjeker
- `08-coach-agent-chat-loading.html` — Agent tenker (med animert prikke-indikator)
- `08-coach-agent-chat-kilder.html` — Side-panel åpent med kilder for siste agent-svar
- `08-coach-agent-chat-error.html` — Error-state ("Agent ikke tilgjengelig")

---

## KONSEPTUELT VIKTIG

Dette er IKKE en generisk chat-bot. Det er en spiller-spesifikk AI som har kontekst på Markus' data. Sidebar/header må vise dette tydelig — det er ALDRI "AK Golf AI", det er "AI om Markus".

---

## ANTI-MØNSTER-LISTE

❌ Captioned mini-states
❌ Generic "ChatGPT-look" — dette er CoachHQ-stil med design-tokens
❌ Manglende kontekst-header (det er AI om en SPESIFIKK spiller)
❌ Bouncy meldings-animasjoner (vår motion er ease-out, ikke spring)

---

## OUTPUT

Ett HTML-dokument 1440×900+. Lim design-link tilbake.
