# CoachHQ — Ny gruppe-modal

**Trigger:** "Ny gruppe" på `/admin/grupper`.

## Kontekst
Anders oppretter en ny gruppe — f.eks. ny WANG-årgang.

## Formål
- Definere gruppe (navn, team, tid)
- Velge elever
- Opprette tilbakevendende økt-tidspunkt

## Layout
Modal 640px bredde.

**Header:**
- "Ny gruppe" Inter Tight 600 22px
- X høyre

**Form-felter (vertikal):**
- Gruppenavn (tekst)
- Team-velger: AK Academy / WANG / Begge (chips)
- Beskrivelse (tekstområde, valgfri)
- Fast tid (dropdown ukedag + tid input)
- Lokasjon (dropdown over anlegg)
- Maks antall elever (number, default 8)

**Elev-velger:**
Søkefelt + multi-select chip-liste over alle aktive elever i valgt team. Valgte elever vises som lime pills under.

**Gruppe-mål (valgfri):**
Tekstområde "Felles mål for gruppen"

**Footer:**
- Outline "Avbryt"
- Filled forest "Opprett gruppe"

## Bekreftelse
Toast "Gruppe opprettet · 8 elever lagt til" → redirect til gruppe-detalj.

## Branding
Cream modal-bg, hvit innhold, forest CTA, lime selected-chips.
