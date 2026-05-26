# CoachHQ — Rediger spiller-modal

**Trigger:** "Rediger" på spiller-profil eller stall-liste.

## Kontekst
Anders redigerer Markus' profil: kontakt, team, status, abonnement, foreldre, helse-flagg.

## Formål
- Endre kjernedata uten å forlate flyt
- Tabber for kategorisering
- Validering før lagring

## Layout
Modal 720px bredde, høyde 80vh maks, scroll internt.

**Header:**
- "Rediger Markus Røinås Pedersen" Inter Tight 600 22px
- "Sist oppdatert 12. mai" muted mono
- Lucide X høyre

**Tabs venstre kolonne (sidemeny):**
- Kontakt (default)
- Team & status
- Abonnement
- Foreldre/foresatte
- Helse & flagg
- Tilganger

### Kontakt-tab
Input-grid 2 kolonner:
- Fornavn / Etternavn
- E-post / Telefon
- Fødselsdato (date input)
- Adresse (street, postnr, by)
- NIF-id (mono input)

### Team & status-tab
- Team dropdown: AK Academy | WANG | Begge
- Status: Aktiv | Pause | Avsluttet (radio)
- Coach-tilknytning: dropdown over coacher
- Junior-flagg: toggle

### Abonnement-tab
- Tier: GRATIS | PRO (300/mnd)
- Start-dato
- Credits: Performance 2/mnd · Pro 4/mnd
- "Pause faktura" toggle

**Footer (sticky):**
- "Slett spiller" destructive link venstre (åpner confirm)
- Outline "Avbryt" + Filled forest "Lagre endringer" høyre

## Branding
Cream modal, hvit panel, forest CTA. Form-inputs cream bg med forest focus-ring.
