# AK Golf Platform — Auth — Onboarding (welcome-flyt)

## Identitet

- **Produkt:** Auth → leder inn i CoachHQ eller PlayerHQ
- **URL:** `/onboarding`
- **Arketype:** D — Wizard / Form (4-step welcome-flyt)
- **Tier-gating:** Free er default. Pro-pitch i siste steg, men kan hoppes over.
- **HTML-referanse:** `wireframe/screen-deck/auth/onboarding.html`
- **Audit:** `wireframe/audit/auth-onboarding.md`
- **Tilhørende skjermer:** Signup (pakke 2)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. Onboarding er den varmeste flyten — italic Instrument Serif tittel per steg, asymmetrisk layout, generøs spacing (p-12 og p-16). Maks 3 lime per steg.

## Spec — hva skjermen er for

Onboarding starter rett etter Signup (pakke 2) og samler resten av profilinformasjonen i 4 steg. For Markus' foreldre: kobler dem til Markus. For Markus selv (hvis han signer up): kobler til en coach. For Anders (coach): setter opp klubb-tilknytning. Wizard tilpasser steg basert på rollen valgt i Signup.

## Layout — UNIKT for denne skjermen

Full-skjerm wizard, **ingen sidebar** (auth-modus). Topp-strip 80px med liten "AK Golf"-logo venstre + "Hopp over →" høyre (kun på valgfrie steg).

### Steg-indikator

4 dots sentrert under topp-strip: ● — ● — ○ — ○ (accent for fullført, primary for aktiv, muted for ufullført). Ingen tekst — minimalistisk.

### Steg 1 — Hei og velkommen

Sentrert content, max-width 640px:
- Stort italic Instrument Serif (56px): *"Hei, Markus."* (interpolert med fornavn)
- Geist 20px: "La oss få deg klar på 2 minutter."
- 3 punkter (Lucide-ikon + tekst):
  - `Target` — "Sett mål for sesongen"
  - `Calendar` — "Få tilpasset treningsplan"
  - `LineChart` — "Se progresjon i sanntid"
- CTA: `Kom i gang →` (primary, accent-pill, stor 56px)

### Steg 2 — Velg kategori (Spiller-flyt) ELLER Klubb (Coach-flyt)

**For spillere (Markus-flyt):**
- Tittel italic: *"Hva spiller du for?"*
- Subtittel: "Vi tilpasser plattformen etter målet ditt"
- Grid 2×2 med kategori-kort:
  - **Konkurranse** — "Jeg jobber mot turneringer og handicap"
  - **Skolegolf** — "Jeg går på WANG eller annen idrettsskole"
  - **Hobby** — "Jeg vil bli bedre, men uten konkurransepress"
  - **Junior** — "Jeg er under 18 — foresatte må godkjenne"

**For coaches (Anders-flyt):**
- Tittel: *"Hvor coacher du?"*
- Søke-felt: "Søk etter klubb (eller registrer ny)"
- Resultater: liste m/ klubb-logo + navn + "Velg →"
- Link: "Klubben er ikke i listen — [Registrer ny klubb →]"

### Steg 3 — Mål (Spiller) ELLER Spesialiteter (Coach)

**Spiller:**
- Tittel: *"Hva er målet ditt?"*
- Subtittel: "Velg én — vi bruker dette til å foreslå riktige planer"
- 4 mål-kort (radio):
  - "Senke handicap med X slag"
  - "Bli klar for en spesifikk turnering"
  - "Forbedre ett område (TEK / SLAG / SPILL)"
  - "Holde formen ved like"

Tilleggs-felt: handicap-slider (current → target), dato-velger (frist).

**Coach:**
- Tittel: *"Hva spesialiserer du deg på?"*
- Multi-select chips: TEK / SLAG / SPILL / FYS / TURN / Junior / Senior / Damer / Herrer / Pro
- Tekstboks: "Beskriv coaching-filosofien din (valgfritt, vises på din profil)"

### Steg 4 — Velg plan (Tier-pitch)

- Tittel italic: *"Klar for å starte."*
- 3 tier-kort side om side (Free / Pro / Elite):
  - **Free:** "Kom i gang", basis-features, CTA `Velg Free`
  - **Pro:** "Mest populær" — accent-badge, full feature-liste, prismerking (149 kr/mnd), CTA `Velg Pro` (accent)
  - **Elite:** "Full pakke" — alle features + 1:1 med pro-coach, prismerking (399 kr/mnd), CTA `Velg Elite`
- Footer-link: "Hopp over — start med Free →" (alltid synlig)
- Etter valg av Pro/Elite → leder til PaymentModal (pakke 17). Etter Free / hopp over → redirect til portal-hjem.

## Klikkbare elementer

| Element | States |
|---|---|
| Steg-indikator-prikk | static, klikkbar tilbake |
| "Hopp over →"-link | default, hover, focus (kun på valgfrie steg) |
| Kom-i-gang-CTA (steg 1) | default, hover (subtil scale 1.02), active, focus |
| Kategori-kort (steg 2) | default, hover (lift + accent ring), valgt (accent border + checkmark hjørne) |
| Klubb-søkefelt | default, focus, with-text, results dropdown |
| Klubb-result-rad | default, hover, klikk → velger |
| Mål-kort (steg 3) | radio: uvalgt, valgt (accent ring) |
| HCP-slider | default, dragging, fokus |
| Dato-velger | default, open kalender |
| Multi-select chip | uvalgt, hover, valgt (accent bg) |
| Tier-kort (steg 4) | default, hover (lift), valgt (accent border), Pro har "Mest populær"-badge |
| `Velg X`-CTA per tier | default, hover, focus, loading |
| `← Tilbake` / `Neste →` | standard wizard-nav |

## Empty / loading / error / success-states

- **Steg 1:** Ingen state — bare CTA
- **Steg 2 spiller:** Krav å velge én kategori for å gå videre
- **Steg 2 coach klubb-søk loading:** Spinner i søkefelt
- **Steg 2 coach ingen treff:** "Klubben er ikke i listen — [Registrer ny →]"
- **Steg 3 validering:** Krav å velge mål (spiller) eller minst 1 spesialitet (coach)
- **Steg 4 valg → loading:** CTA spinner ("Setter opp …")
- **Submit final success:** Confetti + "Velkommen, Markus!" + CTA `Til hjem →`

## Mobile (≤640px)

Full-skjerm. Tier-kort (steg 4) stables vertikalt. Kategori-grid (steg 2) blir 1×4. Topp-strip krymper til 56px, "Hopp over →" blir bare ikon (`SkipForward`).

## Ønsket output fra Claude Design

1. Steg 1 lyst tema (Hei, Markus + 3 punkter)
2. Steg 2 spiller-flyt lyst tema (4 kategori-kort)
3. Steg 2 coach-flyt lyst tema (klubb-søk + 3 resultater)
4. Steg 3 spiller-flyt lyst tema (mål-kort + HCP-slider)
5. Steg 4 lyst tema (3 tier-kort, Pro fremhevet)
6. Final success (Velkommen, Markus + confetti)
7. Mørkt tema (steg 4)
8. Mobil ≤640px (steg 2 spiller, kort stablet)

## Ikke-mål

- Ikke designe PaymentModal som åpnes etter Pro/Elite-valg (pakke 17)
- Ikke designe foreldre-godkjenningsflyt for junior (egen pakke)
- Ikke designe ny-klubb-registrering i detalj (egen mini-flyt)
- Ikke designe portalen-hjem som kommer etter (PlayerHQ Hjem / CoachHQ Hub — egen batch)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
