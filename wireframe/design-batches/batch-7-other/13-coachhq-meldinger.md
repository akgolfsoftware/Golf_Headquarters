# AK Golf Platform — CoachHQ — Meldinger

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/meldinger`
- **Arketype:** G — Other (chat-interface, 2-kolonne)
- **Tier-gating:** Pro+ for foreldre-gruppe-tråder
- **HTML-referanse:** `wireframe/screen-deck/coachhq/meldinger.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `NewMessageModal`, `MessageTemplateModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Meldinger er Anders' direkte-kommunikasjon med spillere og foreldre — i-app-meldinger som speiles til e-post (mottaker velger preferanse). Forskjellig fra Notes (coaching-feedback i plan-detalj) og e-post-templates (settings). Dette er sanntid-tråder.

## Layout — UNIKT for denne skjermen

Klassisk 2-kolonne chat-layout:

### Venstre: Tråd-liste (320px)

- Søk: "Søk mottaker eller melding"
- Filter-chips: `Uleste (3)` `Spillere` `Foreldre` `Grupper`
- Liste over tråder, hver:
  - Avatar (32px) + navn
  - Siste melding (1 linje, muted)
  - Tidsstempel (Mono, høyre): `14:32` (i dag) eller `gårdag` eller `12. mai`
  - Ulest-prikk (accent) hvis ulest
  - Mute-ikon (gjennomstreket bjelle) hvis muted
- CTA bunn: `+ Ny melding` → `NewMessageModal`

### Høyre: Aktiv tråd

#### Header
- Avatar + navn + status-prikk (online/offline) + "Online for 5 min siden"
- Aksjons-rad høyre: `Mute`, `Søk i tråd`, `Vis profil →`

#### Meldings-vindu
- Vertikal scroll, nyeste nederst
- Meldinger gruppert per dag med dato-sticky
- Coach-meldinger høyre (primary-bakgrunn, hvit tekst)
- Spiller-meldinger venstre (muted-bakgrunn, foreground-tekst)
- Avatar kun på første melding i en sekvens
- Hver melding: tekst + tidsstempel + read-receipt (`Sett 14:32`)
- Vedlegg: bildet rendret inline, dokument som card med ikon + filnavn + last ned

#### Komponer-bar (sticky bunn)
- Tekstfelt (auto-grow opp til 5 linjer)
- Vedlegg-knapp (paperclip)
- Mal-knapp (åpner `MessageTemplateModal`)
- Send-knapp (primary, lime accent)
- Hurtigvalg-pills over tekstfeltet: `Bra jobba!`, `Husk pyramide-fokus`, `Sjekk plan-detalj →`

## KPI-strip — IKKE for denne (rolig chat-side)

## Klikkbare elementer

| Element | States |
|---|---|
| Tråd-listerad | default, hover (bg-shift), active (accent-bg + border-left), ulest (bold + prikk) |
| Søk-tråd | default, focus, with-text |
| Filter-chip | default, hover, selected (count-badge) |
| Mute-aksjon | default, hover, klikk → toast "Tråd mutet" |
| Komponer-tekstfelt | default, focus, with-text, auto-grow |
| Send-knapp | disabled (tom), default, hover, loading (spinner), success (fade-out + ny melding) |
| Hurtigvalg-pill | default, hover, klikk → fyll inn tekst |
| Mal-knapp | default, hover, klikk → `MessageTemplateModal` |

## Empty / loading / error

- **Empty (ingen tråder):** "Ingen meldinger ennå. Send din første →"
- **Empty (ingen tråd valgt):** Sentrert ikon `MessageSquare` + "Velg en tråd til venstre"
- **Loading meldinger:** Skeleton-bobler
- **Send-error:** Inline rød tekst + retry-link, melding markert med rødt utropstegn

## Ønsket output fra Claude Design

1. Lyst tema, tråd-liste med 8 tråder + aktiv tråd med 12 meldinger
2. Mørkt tema, samme
3. Komponer-bar med tekst og vedlegg
4. Empty (ingen tråd valgt)
5. Hurtigvalg-pills synlige
6. Mobil ≤640px — kun tråd-liste eller kun aktiv tråd (back-arrow), full bredde

## Ikke-mål

- Ikke designe `NewMessageModal`, `MessageTemplateModal` (egen batch)
- Ikke designe gruppe-chat-administrasjon (egen sub-flow)
- Ikke designe e-post-fallback-flyten

## Når du er ferdig

Lim design-link tilbake til Claude Code.
