# CoachHQ — Godkjenning-detalj (modal)

**Trigger:** Klikk "Detaljer" på en godkjennings-rad.

## Kontekst
Anders vil se mer kontekst før han godkjenner — f.eks. hvorfor AI foreslår en bestemt drill, hva spilleren har skrevet, hvilken impact dette har på planen.

## Formål
- Full kontekst på ett kort
- Sammenlign foreslått vs nåværende
- Rediger inline før godkjenning

## Layout
Modal 720px bredde.

**Header:**
- Type-pille "AI-FORESLÅTT ØKT"
- Tittel "Putt-drill 5×6 fra 3m for Markus" Inter Tight 600 22px
- Tidstempel "Foreslått for 2t" mono
- X høyre

**Innhold (2 kolonner):**

### Venstre — Foreslått endring
- Detaljerte felter: dato, tid, varighet, drill-navn, suksesskriterier
- AI-begrunnelse: forest-light card med Sparkles-ikon "Markus mister 0.4 SG på putt fra 3m. Volum siste 4 uker er kun 8 økter — anbefalt 12-16."

### Høyre — Nåværende plan
- Hva som ligger i kalenderen nå
- "Konflikt med eksisterende økt 16:00" warning-rad

**Spiller-kontekst (under):**
Mini-card: Markus avatar + Hcp 4.2 + "Sist meldt: 'mest fokus på putt denne uken'"

**Rediger-felt:**
Anders kan justere foreslått forslag inline (drill, tid, varighet) før godkjenning.

**Footer:**
- "Avvis" destructive outline venstre
- "Avvis med kommentar" outline
- "Rediger og send tilbake" outline
- "Godkjenn slik" forest fill høyre

## Branding
Cream modal, hvite kolonner, lime AI-card, forest CTA.
