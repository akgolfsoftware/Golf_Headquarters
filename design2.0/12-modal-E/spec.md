# Mini-batch modal-E - Social / Tier / Other

**7 modaler i denne mini-batchen.** Felles moenster: Modaler som dekker
sosiale features (challenges, leaderboard, varsler), tier-oppgradering, og
video-opplasting. 4 av 7 er NYE (DrillChallenge, ChallengeDetail,
NotificationCenter, VideoUpload).

**Generer alle 7 modaler i denne sesjonen.** Foelg anti-state-katalog-regel
fra `felles-instruks.md` - EEN produksjons-modal per HTML.

---

## Felles for modal-E

- **Modal-container:** Sentrert, max-width 560-880px (per modal), `rounded-xl`, bakdrop blur(4px)
- **Header:** Italic tittel + sub + lukk-X
- **Footer:** Avbryt venstre, primary CTA hoeyre (accent lime)
- **Spiller:** Markus Roinaas Pedersen, HCP 12,4, Pro-tier
- **Coach:** Anders Kristiansen
- **Andre spillere (referanse):** Henrik Nilsen, Anna Karlsen, Mads Roenning, Lise Sandberg, Joachim Tangen, Emma Solberg
- **Drill-eksempler:** "10 putts fra 3m", "Bunker-up&down", "150m approach-konsistens"
- **Pris-format:** "300 kr/mnd" (Pro), "3 000 kr/aar" (Pro-aar)
- **Tier-gating:** Free vs Pro - Pro koster 300 kr/mnd

---

## Pakker i denne mini-batchen

---

## Pakke 1/7: DrillChallengeModal (NY)

# AK Golf Platform - Modal - DrillChallengeModal

## Identitet

- **Produkt:** PlayerHQ
- **Trigger:** "+ Ny challenge"-CTA paa challenges-list / "Utfordre venner"-knapp paa drill-detalj
- **Type:** 2-step wizard (lag eller bli med)
- **Bredde:** 640px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/drill-challenge.html`

## Spec

Markus lager en drill-challenge eller blir med paa en eksisterende. Velger
drill, varighet, deltakere og bestemmer scoring-format.

## Layout

- **Header:** Italic "Drill-challenge" + sub "Steg {n} av 2" + lukk-X
- **Steg-indikator:** 2 prikker
- **Steg 1 - Modus + drill:**
  - Toggle oeverst: `Lag ny challenge` (default) | `Bli med paa eksisterende`
  - **Lag ny-modus:**
    - Drill-velger: dropdown med 12 forhaandsdefinerte drills
      - "10 putts fra 3m" (default) - "Bunker-up&down" - "150m approach-konsistens" - "Driver-corridor" - osv
    - Varighet-radio: `1 uke` (default) - `2 uker` - `4 uker` - `Engangs`
    - Scoring-radio: `Beste forsoek` - `Snitt av 3` - `Antall fullfoerte`
  - **Bli med-modus:**
    - Liste over 3 aapne challenges fra venner:
      - "Henrik N: 10 putts 3m - Slutter om 3 dager"
      - "Anna K: Bunker-up&down - Slutter om 1 uke"
      - Klikk velger -> ekspanderer detaljer
- **Steg 2 - Deltakere + send:**
  - Spiller-multi-select med avatar-chips
  - Foreslaatte: Henrik N, Anna K, Mads R, Lise S (basert paa siste runder sammen)
  - Custom: legg til via e-post
  - Toggle: "Apen for alle i klubben" (default av)
  - Tekstboks: "Personlig melding (valgfri)"
- **Footer:**
  - Steg 1: `Avbryt` + `Neste ->` (accent)
  - Steg 2: `Avbryt` + `<- Tilbake` + `Send invitasjon (4 venner) ->` (accent)

## OEnsket output

1. Steg 1 lyst tema (Lag-ny modus, "10 putts" valgt)
2. Steg 1 Bli-med-modus (3 aapne challenges)
3. Steg 2 lyst tema (4 venner valgt)
4. Loading send ("Sender invitasjoner ...")
5. Success (toast "4 invitasjoner sendt")
6. Moerkt tema
7. Mobile full-screen

## Anti-moenster

- IKKE bare ett valg paa Steg 1 - gi flere drill-varianter
- IKKE krav om personlig melding
- IKKE skjul deltaker-foreslag (foreslag fra siste runder er kjerne-verdi)

---

## Pakke 2/7: ChallengeDetailModal (NY)

# AK Golf Platform - Modal - ChallengeDetailModal

## Identitet

- **Produkt:** PlayerHQ
- **Trigger:** Klikk paa challenge-card i feed / "Vis detaljer" paa invitasjon
- **Type:** Detalj-modal med leaderboard
- **Bredde:** 720px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/challenge-detail.html`

## Spec

Markus aapner en aktiv challenge for aa se sin status, gjenvaerende tid, og
hvor han er rangert mot de andre.

## Layout

- **Header:** Italic "10 putts fra 3m" + sub "Challenge - 5 deltakere - 3 dager igjen" + lukk-X
- **Hero-rad:** 3 stats-cards
  - "Din score: 7/10" (current rank #3)
  - "Beste: 9/10 (Henrik N)" (gold)
  - "Gjenvaerende: 3d 14t" (countdown, JetBrains Mono)
- **Drill-beskrivelse-card:**
  - Lucide ikon + tittel
  - "Stand 3m fra hull. 10 putts. Tell antall innholdt."
  - Mini-bilde/SVG av putt-formasjon
- **Leaderboard (5 deltakere):**
  - Rang | Avatar | Spiller | Score | Sist-spilt
  - 1. Henrik N - 9/10 - i gaar
  - 2. Anna K - 8/10 - for 2 dager siden
  - 3. Markus R Pedersen (HIGHLIGHTED med accent-bg-strip) - 7/10 - i dag
  - 4. Mads R - 6/10 - for 3 dager siden
  - 5. Lise S - ikke spilt ennaa
- **Footer:** `Detaljer` (sekundaer) venstre + `Spill igjen ->` (primary accent - aapner submit-form) hoeyre

## OEnsket output

1. Lyst tema default (Markus paa #3)
2. Markus paa #1 (lim oever leaderboard, "Du leder!")
3. Challenge ferdig (countdown 0, "Avsluttet - Henrik N vant")
4. Markus ikke spilt ennaa (rad "Spill foerste forsoek ->" istedenfor score)
5. Moerkt tema
6. Mobile full-screen

## Anti-moenster

- IKKE skjul gjenvaerende tid - top-of-mind
- IKKE bare tabell - vis drill-beskrivelse rik
- IKKE bortkommen ranking-fargekoding - din rad MAA highlightes

---

## Pakke 3/7: LeaderboardModal

# AK Golf Platform - Modal - LeaderboardModal

## Identitet

- **Produkt:** PlayerHQ
- **Trigger:** "Vis full leaderboard"-CTA paa hjem-card / mal-leaderboard skjerm
- **Type:** Detalj-modal med filter
- **Bredde:** 720px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/leaderboard.html`

## Spec

Vis full klubb-leaderboard (HCP-trend, score-snitt, oekter-loggfoert) med
filter. Markus' rad highlightet.

## Layout

- **Header:** Italic "Klubb-leaderboard" + sub "GFGK - 32 aktive spillere" + lukk-X
- **Filter-rad:** Chip-rad: `HCP-trend` (default) - `Score-snitt` - `Oekter loggfoert` - `Forbedring siste 30d`
- **Tidsperiode-dropdown:** "Siste 30 dager" (default) / 90d / Aaret / Alltid
- **Leaderboard-tabell (10-20 rader):**
  - Rang - Avatar - Spiller - HCP - Endring - Trend (mini-spark-line)
  - Markus' rad highlightet (accent-bg-strip + bold)
  - Top 3 har gull/soelv/bronse-pill paa rang-tallet
- **Pagination eller "Last mer v"** nederst hvis flere enn 20
- **Footer:** `Lukk` venstre + `Del leaderboard ->` (sekundaer) hoeyre

## OEnsket output

1. Lyst tema default (Markus paa #7 av 32)
2. Markus paa Top 3 (med soelv-pill)
3. Free-tier lock (full lock-overlay - leaderboard er Pro-only)
4. Empty (ingen data: "Spiller minst 1 runde for aa havne paa listen")
5. Moerkt tema
6. Mobile full-screen

## Anti-moenster

- IKKE skjul Markus' rad - alltid synlig (auto-scroll til hans rad)
- IKKE bare HCP - tilbyr 4 sorteringsmetrikker
- IKKE bortkommen tier-lock for Free

---

## Pakke 4/7: MessageDetailModal

# AK Golf Platform - Modal - MessageDetailModal

## Identitet

- **Produkt:** PlayerHQ + CoachHQ
- **Trigger:** Klikk paa melding i meldingsliste / varsel
- **Type:** Detalj-modal med thread
- **Bredde:** 720px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/message-detail.html`

## Spec

Vis full melding/thread mellom spiller og coach. Mulighet for aa svare
inline + se vedlegg. Brukes for asynkron kommunikasjon.

## Layout

- **Header:** Avatar (Anders) + italic "Anders Kristiansen" + sub "Hovedcoach - Sist aktiv i dag 14:32" + lukk-X
- **Thread (scrollbar, max 60vh):**
  - Meldinger som bobler (innkomne = card-bg venstre, sendte = accent-bg-light hoeyre)
  - Eksempel-thread:
    - Anders (i gaar): *"Hei Markus - jeg saa runden din paa Borre. Hva var vinden paa hull 12?"*
    - Markus (i gaar): *"Kraftig fra venstre, ca 8 m/s. Slo punch-shot men gikk for hoyt."*
    - Anders (i dag 14:32): *"OK, da gir det mening. La oss jobbe med vind-tilpasning paa neste oekt. Boker 16:30 i morgen?"*
  - Avatar 24px ved hver melding + tid (Geist Mono 11px)
  - Vedlegg: bilde-thumbnails eller fil-cards inline
- **Sammensette-omraade (sticky bunn):**
  - Textarea (auto-vekst, max 6 linjer)
  - Vedlegg-knapp (Lucide `Paperclip`) + bilde-knapp (Lucide `Image`)
  - Send-knapp hoeyre (Lucide `Send`, primary accent)

## OEnsket output

1. Lyst tema default (thread med 3 meldinger)
2. Lyst tema med vedlegg (bilde-thumbnail i en melding)
3. Skriver svar (textarea fokusert, "Du skriver ..." pulserer hos Anders)
4. Sender (loading-state paa send-knapp)
5. Empty thread (ingen meldinger ennaa - "Send foerste melding")
6. Moerkt tema
7. Mobile full-screen

## Anti-moenster

- IKKE skjul thread-historikk
- IKKE Lorem ipsum-meldinger - bruk konkret golf-coaching-prat
- IKKE bare en melding av gangen - thread-format er kjerne

---

## Pakke 5/7: NotificationCenterModal (NY)

# AK Golf Platform - Modal - NotificationCenterModal

## Identitet

- **Produkt:** PlayerHQ + CoachHQ
- **Trigger:** Klikk paa bjelle-ikon i toppmeny
- **Type:** Drawer-stil (hoeyrejustert) med filter
- **Bredde:** 480px drawer (full hoeyde fra hoeyre)
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/notification-center.html`

## Spec

Inbox med alle varsler - achievements, plan-endringer, agent-anbefalinger,
melding-svar, booking-bekreftelser. Filter alle/uleste, mark-all-read,
klikk for detalj.

## Layout

- **Header (drawer-top):** Lucide `Bell` + "Varsler" + count-pill (Geist Mono "12 nye") + `Mark alle som lest` (sekundaer link) + lukk-X
- **Filter-tabs:** `Alle (32)` (default) - `Uleste (12)` - `Achievements (3)` - `Plan (5)` - `Meldinger (8)`
- **Varsel-liste (scrollbar):**
  - Hver rad: ikon (per type) + tittel + sub + tid + ulest-prikk (lime)
  - Eksempler:
    - Lucide `Award` (accent) - "Ny badge: 30-dagers streak!" - "i dag 14:32" - ulest
    - Lucide `Sparkles` (accent) - "Anders foreslo en plan: Sommer-toppform" - "i gaar 16:08" - ulest
    - Lucide `MessageSquare` - "Anders svarte paa meldingen din" - "for 2 dager siden"
    - Lucide `Calendar` - "Booking bekreftet: Mulligan Studio 1 - torsdag 16:30" - "for 3 dager siden"
    - Lucide `TrendingUp` - "Ny innsikt fra runden paa Borre" - "for 5 dager siden"
  - Gruppert etter tid: "I dag" - "I gaar" - "Tidligere"
- **Footer (sticky):** Link "Innstillinger for varsler ->"

## OEnsket output

1. Lyst tema default (32 varsler, blanding av lest/ulest)
2. Filter `Uleste` aktiv (kun 12 ulest)
3. Empty (ingen varsler - "Du er a-jour. Bra jobba!")
4. Loading skeleton
5. Moerkt tema
6. Mobile (drawer blir full-screen)

## Anti-moenster

- IKKE skjul ulest-indikator
- IKKE blande inn marketing (kun system-varsler)
- IKKE Lorem ipsum - bruk konkrete varsel-tekster

---

## Pakke 6/7: PaymentModal

# AK Golf Platform - Modal - PaymentModal

## Identitet

- **Produkt:** PlayerHQ
- **Trigger:** "Oppgrader til Pro ->"-CTA paa tier-gated content / settings
- **Type:** Betalings-modal med 2 steg (velg plan + betalingsinfo)
- **Bredde:** 640px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/payment.html`

## Spec

Markus oppgraderer fra Free til Pro - velger maaned eller aar, fyller inn
kortinfo, bekrefter.

## Layout

- **Header:** Italic "Oppgrader til Pro" + sub "Steg {n} av 2" + lukk-X
- **Steg-indikator:** 2 prikker
- **Steg 1 - Velg plan:**
  - 2 store cards side-om-side:
    - **Maaned:** "300 kr/mnd" - "Faktureres maanedlig" - "Kanseller naar som helst"
    - **Aar (anbefalt):** "3 000 kr/aar" - "Spar 600 kr/aar" - "16% rabatt" (lime accent-stripe paa hoeyre side)
  - Fordels-liste under: 6 punkter
    - "Ubegrenset bookinger"
    - "Full leaderboard-tilgang"
    - "AI-genererte oekter"
    - "TrackMan-historikk og trender"
    - "Coach-anbefalinger"
    - "Avansert statistikk"
- **Steg 2 - Betalingsinfo:**
  - Kort-info (Stripe-look):
    - Kortnummer (text-input, format 1234 5678 9012 3456)
    - Utloep (MM/AA) + CVC (3-siffer) side-om-side
    - Postnummer
  - Toggle: "Lagre kort for fremtidige kjoep" (default paa)
  - Sammendrag-card hoeyre:
    - "Pro - aar: 3 000 kr"
    - "MVA inkludert"
    - "Total i dag: 3 000 kr"
    - "Neste belastning: 11. mai 2027"
- **Footer:**
  - Steg 1: `Avbryt` + `Velg plan ->` (accent, disabled til valg)
  - Steg 2: `Avbryt` + `<- Tilbake` + `Bekreft betaling (3 000 kr) ->` (accent)

## OEnsket output

1. Steg 1 lyst tema (Aar anbefalt-stripe)
2. Steg 1 Maaned valgt
3. Steg 2 lyst tema (kort-info delvis fyllt)
4. Loading "Behandler betaling ..."
5. Success ("Velkommen til Pro!" + accent-flash + Lucide `CheckCircle2` 64px)
6. Error (kort-feil - "Kortet ble avvist - sjekk info")
7. Moerkt tema
8. Mobile full-screen

## Anti-moenster

- IKKE skjul totalsum
- IKKE feature-list som er for lang (max 6)
- IKKE Lorem-ipsum vilkaar-tekst (bruk klart sprak)

---

## Pakke 7/7: VideoUploadModal (NY)

# AK Golf Platform - Modal - VideoUploadModal

## Identitet

- **Produkt:** PlayerHQ
- **Trigger:** "Last opp swing-video"-CTA paa coach-detalj / treningsdetalj / hjem
- **Type:** Single-modal med drag-drop + form
- **Bredde:** 640px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/video-upload.html`

## Spec

Markus laster opp swing-video til Anders for analyse. Drag-drop, kølle-tag,
varighet-trim, valgfri kommentar, submit.

## Layout

- **Header:** Lucide `Video` + italic "Last opp swing-video" + sub "Anders gjennomgaar innen 24t" + lukk-X
- **Body:**
  - **Drag-drop-zone (240px hoyde):**
    - Tom: dashed accent-border + Lucide `UploadCloud` 48px + "Slipp video her, eller klikk for aa velge"
    - Med fil: video-preview (16:9) + filnavn + filstoerrelse + "Erstatt"-link
    - Maks: 500 MB / 60 sek
  - **Trim-slider (synlig naar video opplastet):**
    - Range-slider med video-thumbnails som bakgrunn
    - 2 handles: start + slutt (default 0 - 8 sek)
    - "Trim: 0:03 - 0:11 (8 sekunder)"
  - **Kølle-tag (radio-knapper i grid):**
    - `Driver` - `3-wood` - `5-wood` - `4-iron` - `5-iron` - `6-iron` - `7-iron` - `8-iron` - `9-iron` - `PW` - `GW` - `SW` - `LW` - `Putter`
  - **Vinkel (radio):** `Face-on` (default) - `Down-the-line` - `Topp` - `Annet`
  - **Notater (valgfri textarea):**
    - "Hva vil du Anders skal se etter? (valgfri)"
    - 0/280 tegn-teller
- **Footer:** `Avbryt` venstre + `Last opp og send til Anders ->` (primary accent, disabled til video + kølle valgt) hoeyre

## OEnsket output

1. Lyst tema default (tom drag-zone)
2. Med video opplastet (preview synlig)
3. Trim aktiv (slider med 2 handles)
4. Med koelle valgt (Driver highlighted) + notater fyllt
5. Loading "Laster opp ... 67%" (progress-bar)
6. Success ("Sendt til Anders - du faar svar innen 24t")
7. Error ("Filen er for stor - max 500 MB")
8. Moerkt tema
9. Mobile full-screen

## Anti-moenster

- IKKE skjul filstoerrelse-grense
- IKKE krav om notater
- IKKE 100% verbose validering - "Sjekk at video er under 500 MB" er nok
- IKKE Lorem-koeller - bruk eksakte golf-koeller
