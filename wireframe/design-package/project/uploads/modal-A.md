# Mini-batch modal-A - Plan-modaler

**7 modaler i denne mini-batchen.** Felles moenster: Modaler som handler om
treningsplaner - opprette, redigere, dele, godkjenne og mal-/AI-generere.
Spenner over baade CoachHQ (coach lager) og PlayerHQ (spiller godkjenner).

**Generer alle 7 modaler i denne sesjonen.** Foelg anti-state-katalog-regel
fra `felles-instruks.md` - EEN produksjons-modal per HTML, ikke captioned
mini-mockups. Multi-step modaler leveres som SEPARATE HTML-filer per steg.

---

## Felles for plan-modaler

- **Modal-container:** Sentrert, max-width 560-880px (per modal), `rounded-xl` (12px), bakdrop `rgba(0,0,0,0.5)` blur(4px)
- **Header (sticky, 72-96px):** Italic Instrument Serif 20-28px tittel + sub + Lucide `X` 20px lukk
- **Footer (sticky, 72-96px):** Venstre sekundaer (Avbryt), hoeyre primary accent-pill (lime #D1F843)
- **Body:** Max 70vh scrollbar
- **Steg-indikator** (wizards): Prikker oppe under header, accent for aktiv, primary for fullfoert, muted for ufullfoert
- **Mobile <=640px:** Full-screen (`rounded-none`), footer-knapper sticky-bunn
- **Spiller-referanse:** Markus Roinaas Pedersen, HCP 12,4, Pro-tier
- **Coach-referanse:** Anders Kristiansen, NGF Trener IV
- **Plan-eksempel:** "Sommer-toppform 2026", periode "9. mai - 30. juni 2026", 8 uker, 32 oekter
- **Pyramide-farger:** FYS groenn `#16A34A`, TEK darker primary `#005840`, SLAG lime accent `#D1F843`, SPILL gold `#F4C430`, TURN graa `#5E5C57`

---

## Pakker i denne mini-batchen

---

## Pakke 1/7: NewPlanModal

# AK Golf Platform - Modal - NewPlanModal

## Identitet

- **Produkt:** CoachHQ
- **Trigger:** `+ Ny plan`-CTA paa `/admin/plans`
- **Type:** Multi-step wizard-modal (4 steg)
- **Bredde:** 720px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/new-plan.html`

## Spec

NewPlanModal lar Anders lage en ny treningsplan for Markus paa under 2 min.
Wizard: velg spiller + periode -> velg mal eller start blank -> tilpass
oevelser -> bekreft og send. Alternativ AI-generering tilbys i steg 2.

## Layout

- Steg-indikator (4 prikker) under header
- **Steg 1:** Spiller-autocomplete (Markus pre-foreslaatt), dato-fra/til, pyramide-fokus 5 slidere (summa 100%)
- **Steg 2:** 3 cards i grid: `Bruk mal ->` / `AI-generer ->` (accent stripe hoeyre) / `Start blank ->`
- **Steg 3:** Auto-foreslaatte oevelser-liste (12 stk), drag-handle + navn + kategori-pill + varighet + fjern-X. `+ Legg til oevelse`-link nederst.
- **Steg 4:** Sammendragskort (spiller, periode, antall oekter, pyramide-donut), sjekkbokser "Send til Markus" + "Notifiser foresatt", footer-tekst

## Footer

- Steg 1-3: `Avbryt` | `<- Tilbake` (disabled steg 1) + `Neste ->` (accent)
- Steg 4: `Avbryt` | `<- Tilbake` + `Send forslag ->` (accent)

## OEnsket output

1. Steg 1 lyst tema (Markus valgt, pyramide ved 100%)
2. Steg 2 lyst tema (3 cards, hover paa AI-generer)
3. Steg 3 lyst tema (12 oevelser, en under drag)
4. Steg 4 lyst tema (sammendrag + sjekkbokser)
5. Moerkt tema (steg 2)
6. Steg 2 AI-loading ("Genererer plan basert paa Markus' historikk ... ~15 sek")
7. Validation-state steg 1 (pyramide 95%, warning)
8. Mobile full-screen (steg 1)

## Anti-moenster

- IKKE state-katalog ("1-Steg1, 2-Steg2") side-om-side
- IKKE Lorem ipsum eller "Spiller X"
- IKKE Spiller-input som kun en text-field (skal vaere autocomplete med avatar)

---

## Pakke 2/7: EditPlanModal

# AK Golf Platform - Modal - EditPlanModal

## Identitet

- **Produkt:** CoachHQ
- **Trigger:** `Endre`-knapp paa plan-detalj eller kontekstmeny
- **Type:** Drawer-stil, hoeyrejustert
- **Bredde:** 640px drawer (full hoeyde fra hoeyre)
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/edit-plan.html`

## Spec

Hurtig-edit av plan-meta-data: navn, datoer, ansvarlig coach, tags. Stoerre
endringer (faser, pyramide, oekter) krever full plan-edit-skjerm.

## Layout

- Header (drawer-top): Lucide `Pencil` 20px + tittel `Endre plan` + lukk-X
- Body (stable form-fields):
  - Plan-navn (text, min 3 / max 80, default "Sommer-toppform 2026")
  - Coach (dropdown m/soek, default Anders K)
  - Spiller (read-only label: Markus Roinaas Pedersen + avatar)
  - Periode (dato-fra + dato-til, default 9. mai - 30. juni)
  - Status (Aktiv / Pause / Arkivert, segmentert kontroll)
  - Tags (chip-input, eksempel-tags: "Soerlandsaapent", "Turnerings-fokus")
  - "Notater (intern)" textarea (valgfri)
- Footer: `Avbryt` venstre + `Lagre endringer` (accent primary) hoeyre

## OEnsket output

1. Lyst tema default (alle felt fyllt)
2. Moerkt tema
3. Validation-state (plan-navn for kort, roed feilmelding under)
4. Loading-state ("Lagrer ...")
5. Mobile full-screen

## Anti-moenster

- IKKE wizard - dette er flat form, alle felt synlige samtidig
- IKKE oevelse-redigering (henvis til plan-builder)

---

## Pakke 3/7: PlanApprovalModal

# AK Golf Platform - Modal - PlanApprovalModal

## Identitet

- **Produkt:** PlayerHQ (spiller godkjenner)
- **Trigger:** Klikk paa "Anders foreslo en plan - Godkjenn ->" varsel
- **Type:** Single-step review-modal med 3 handlings-CTA
- **Bredde:** 800px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/plan-approval.html`

## Spec

Etter at Anders har sendt ny plan til Markus, faar Markus varsel og aapner
PlanApprovalModal for aa se planen og godta / be om endring / avslaa. Hele
planen vises i lett-fordoeyelig form med pyramide-donut, uke-oversikt og
milestones - ikke som raa tabell.

## Layout

- **Header (96px):** Coach-info-bar (Anders avatar 32px + "Anders K. har foreslaatt en plan til deg" + "for 14 minutter siden") + plan-tittel italic "Sommer-toppform 2026" + periode-pill "9. mai - 30. juni - 8 uker" + lukk-X
- **Seksjon 1 - Sammendrag:** 4 stat-kort paa rad ("8 uker", "32 oekter", "5 fokusomraader", "1 milestone - Soerlandsaapent") + pyramide-donut 120px + tall-legend
- **Seksjon 2 - Anders' melding:** Quote-card italic 18px: *"Hei Markus - denne planen bygger opp mot Soerlandsaapent. Tung TEK-fokus foerste 4 uker, deretter overgang til SLAG og spillforberedelse. Si fra hvis noe ikke passer."* + coach-avatar 24px nederst-hoeyre
- **Seksjon 3 - Uke-for-uke:** 8 collapsible uker, default uke 19 ekspandert. Header per uke: "Uke 19 (9.-15. mai) - 4 oekter - TEK-fokus"
- **Seksjon 4 - Hva endrer seg:** Inline-highlights: "+ 4 nye TEK-oekter", "- 2 SPILL-oekter (flyttet til uke 23)", "^ Total volum +12%"
- **Footer (96px) - 3 handlinger:** `Avbryt` link | `Be om endring ->` (sekundaer) + `Avslaa` (ghost destructive) + `Godta og start ->` (primary accent)

## OEnsket output

1. Lyst tema default (uke 19 ekspandert)
2. Lyst tema, alle 8 uker ekspandert
3. "Be om endring" mini-form synlig i footer
4. "Avslaa"-confirm-popover aapen
5. Godta success ("Planen er aktiv!" + accent-flash)
6. Loading initial (skeleton)
7. Moerkt tema
8. Mobile full-screen (knapper stablet)

## Anti-moenster

- IKKE bare oekt-liste eller raa tabell - skal vaere lett-fordoeyelig oversikt
- IKKE coach-knapper synlige (Anders er ikke her - dette er Markus' view)

---

## Pakke 4/7: PlanShareModal

# AK Golf Platform - Modal - PlanShareModal

## Identitet

- **Produkt:** CoachHQ (coach deler)
- **Trigger:** `Del`-knapp paa plan-detalj
- **Type:** Single-step modal med tabs
- **Bredde:** 560px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/plan-share.html`

## Spec

Del Sommer-toppform-plan med foresatte / annen coach / spiller selv via
lenke eller e-post. Lenken har permissions (read-only / kommentere / edit)
og evt. utloepsdato.

## Layout

- **Header:** Lucide `Share2` 20px + tittel "Del Sommer-toppform" + sub "Markus R Pedersen - 9. mai - 30. juni 2026" + lukk-X
- **Body - 3 seksjoner:**
  1. **Hvem skal motta?** Tabs: `Foresatte` (default) - `Annen coach` - `Spilleren selv` - `Ekstern (e-post)`
     - Foresatte-tab: liste over registrerte foresatte med avatar + sjekkboks per. Eksempel: "Mor (Anne Pedersen)" sjekket, "Far (Lars Pedersen)" usjekket
     - E-post-tab: textinput med e-postadresser, komma-separert
  2. **Tilgangsnivaa:** Radio-knapper: `Kun lese` (default), `Kommentere`, `Redigere`
  3. **Utloeper:** Toggle av/paa + dato-felt (default "30. juni 2026")
- **Delings-lenke:** Read-only tekstfelt med URL + `Kopier`-knapp (Lucide `Copy` ikon)
- **Footer:** `Avbryt` venstre + `Send invitasjon ->` (accent) hoeyre

## OEnsket output

1. Lyst tema default (Foresatte-tab, "Kun lese", utloep paa)
2. E-post-tab aktiv med 2 adresser fylt
3. Annen-coach-tab (autocomplete-soek aapen)
4. Lenke kopiert success (toast "Lenke kopiert")
5. Moerkt tema
6. Mobile full-screen

## Anti-moenster

- IKKE QR-kode eller WhatsApp/Slack-deling (skal vaere bare lenke + e-post)
- IKKE plan-innhold synlig her (det vises naar mottaker aapner lenken)

---

## Pakke 5/7: PlanActionDetailModal

# AK Golf Platform - Modal - PlanActionDetailModal

## Identitet

- **Produkt:** CoachHQ + PlayerHQ
- **Trigger:** `Detaljer ->` i Approvals-list / agent-strip / PlayerHQ treningsplan agent-card
- **Type:** Detalj-modal med 4 seksjoner
- **Bredde:** 720px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/plan-action-detail.html`

## Spec

Detaljvisning av EEN konkret agent-anbefaling med full begrunnelse. Brukes
naar coach trenger aa forstaa hvorfor agenten foreslaar noe foer de godkjenner.

## Layout

- **Header:** Severity-pill `Urgent` (destructive + pulse) / `Warning` / `Info` + tittel "Pauseuke anbefalt foer Soerlandsaapent" + spiller-mini (Markus avatar + "Markus R Pedersen - Kat A") + lukk-X
- **Body - 4 seksjoner:**
  1. **Kontekst:** *"Markus har trent 14 dager paa rad uten pause. Adherence 91%, men SG-trend flater ut siste 5 dager."* + liten data-tabell (Volum siste 4u / Pulsdata / SG-trend / Soevn)
  2. **Agentens analyse:** Tekstblokk + agent-badge "Deload-agent" + konfidens-bar "Konfidens: 87%"
  3. **Foreslaatt endring (diff):** Foer/etter-visning: "Uke 23: 4 TEK-oekter" -> "Uke 23: 0 oekter (PAUSE)"
  4. **Forventet effekt:** Bullet-liste: "Reduserer overtrening-risk", "Friskere TEK-fase uke 24", "Soerlandsaapent peak-form sannsynlig"
- **Footer:** `Avvis` (ghost destructive) + `Rediger ->` (sekundaer) + `Godkjenn ->` (primary accent)

## OEnsket output

1. Lyst tema default (Urgent severity, Markus)
2. Warning-severity (annen handling, f.eks. "Endre TEK-volum 40% -> 28%")
3. Info-severity (Periodisering-agent, "Ny fase klar")
4. Moerkt tema
5. Loading (agent-analyse skeleton)
6. Mobile full-screen

## Anti-moenster

- IKKE bare action-tittel uten begrunnelse (hele poenget er "hvorfor")
- IKKE skjul konfidens-score
- IKKE PlayerHQ skal vise "Avvis"-knapp som coach (PlayerHQ-variant har bare "Detaljer", uten action-knapper)

---

## Pakke 6/7: TemplateSelectorModal

# AK Golf Platform - Modal - TemplateSelectorModal

## Identitet

- **Produkt:** CoachHQ
- **Trigger:** `Bruk mal ->` i NewPlanModal steg 2 ELLER `Maler`-tab paa /admin/plans
- **Type:** Selector-modal med thumbnail-grid + soek/filter
- **Bredde:** 880px
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/template-selector.html`

## Spec

Velg en av 9 ferdig-bygde plan-maler som starting-point. Hver mal viser
tittel, varighet, fokus-pyramide og antall oekter. Coach kan filtrere etter
kategori eller varighet. Valg lukker modal og pre-fyller NewPlanModal steg 3.

## Layout

- **Header (88px):** Tittel italic "Velg plan-mal" + sub "9 maler tilgjengelige - Valg pre-fyller wizard" + lukk-X
- **Soek + filter-rad:** Soek-felt "Soek maler ..." + chip-rad: Kategori (Putte / Chip / Iron / Driver / Fullswing / Mental) - Varighet (4 / 6 / 8 / 12 uker) - Vanskelighet (Begynner / Middels / Avansert)
- **Body grid 3x3 (9 maler):** Hver mal-card 270x220px:
  - Pyramide-stripe paa toppen (4px hoeyde) - viser fokus-fordeling
  - Tittel (Inter Tight 14px semibold): f.eks. "Putting Foundation", "Driver Toppform", "Mental Game 4u"
  - Sub: varighet + antall oekter (JetBrains Mono 12px): "8 uker - 24 oekter"
  - Pyramide-donut mini 48px nederst-hoeyre
  - Footer-link: "Forhaandsvis ->"
- **Footer:** `Avbryt` venstre + `Bruk valgt mal ->` (accent, disabled til en mal valgt) hoeyre

## OEnsket output

1. Lyst tema default (alle 9 viste)
2. Filter aktivt: Kategori=Putte + Varighet=4u (viser 2 av 9)
3. En mal valgt (accent-border + sjekk-ikon paa cardet)
4. Empty filter (0 treff, "Ingen maler matcher - Tilbakestill ->")
5. Moerkt tema
6. Mobile (grid 1 kolonne, scroll)

## Anti-moenster

- IKKE lang vertikal liste - skal vaere visuell grid
- IKKE forhaandsvis-tab open ved default (det er separat aksjon)

---

## Pakke 7/7: AIPlanGeneratorModal

# AK Golf Platform - Modal - AIPlanGeneratorModal

## Identitet

- **Produkt:** CoachHQ
- **Trigger:** `AI-generer ->` i NewPlanModal steg 2 eller Plan-builder
- **Type:** Multi-step modal (3 steg + spinner-state)
- **Tier-gating:** Coach Pro+ (Free faar demo med dummy-output)
- **Bredde:** 720px med 4px lime accent-stripe paa toppen
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/ai-plan-generator.html`

## Spec

Anders gir naturlig-spraak-input ("Markus skal forberede seg til
Soerlandsaapent om 6 uker - fokus TEK og bunkerspill"), velger generator-modus
(konservativ / balansert / aggressiv), og ser forslaget inkrementelt. Etter
generering: `Godta og legg til plan` eller `Regenerer`.

## Layout

- **Header (72px):** Italic "AI-generert plan" + Lucide `Sparkles` (accent) + sub "Steg {n} av 3" + lukk-X
- **Steg-indikator:** 3 dots
- **Steg 1 - Brief:**
  - Stor textarea (8 rader, placeholder: *"Beskriv hva spilleren skal trene paa. Eksempel: Markus skal forberede seg til Soerlandsaapent om 6 uker, fokus TEK og bunkerspill, har lite tid i hverdagen ..."*)
  - Spiller-velger (Markus pre-foreslaatt)
  - Mode-segmentert kontroll: `Konservativ` (lavt volum, stabil progresjon) - `Balansert` (default) - `Aggressiv` (hoyt volum, raske endringer)
  - Footer: `Avbryt` + `Generer ->` (accent)
- **Steg 2 - Generering (spinner):**
  - Sentrert spinner med pulserende accent-ring
  - Tekst: "Genererer plan basert paa Markus' historikk ..." + sub "Estimert: ~15 sek"
  - Skeleton-preview av plan-cards under spinner (fades inn naar ferdig)
- **Steg 3 - Resultat:**
  - Plan-sammendrag: tittel (foreslaatt: "Soerlandsaapent Prep 6u"), periode, pyramide-donut, antall oekter
  - "Hva agenten gjorde": bullet-liste med 4 begrunnelser
  - Uke-skisse (collapsible, foerste uke aapen)
  - Footer: `<- Tilbake (regenerer)` venstre + `Avvis` (ghost) + `Godta og legg til plan ->` (accent) hoeyre

## OEnsket output

1. Steg 1 lyst tema (textarea med eksempel-tekst, balansert valgt)
2. Steg 2 spinner-state
3. Steg 3 lyst tema (resultat fullt synlig)
4. Steg 3 moerkt tema
5. Free-tier demo-state (banner: "Demo-modus - oppgrader for AI-generering")
6. Mobile full-screen (steg 1)

## Anti-moenster

- IKKE chat-ui (skal vaere strukturert form, ikke melding-thread)
- IKKE manuelle modus-bryter for hver pyramide-akse (det er manuell wizard - dette er natural-language input)
- IKKE skjul "Hva agenten gjorde" (transparens er kritisk)
