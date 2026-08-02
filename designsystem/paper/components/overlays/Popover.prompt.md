# Popover

Ikke-modalt lag med innhold, forankret til utløseren. Brukes til «Hvorfor?»-
forklaringer utenfor køen, små filtervalg og bekreftelser som ikke fortjener en
modal.

## Når den IKKE skal brukes
- Ren tekst uten handlinger → `Tooltip`.
- En liste av valg → `DropdownMenu`.
- Noe som må besvares før arbeidet fortsetter → `ConfirmDialog`/`Modal`.
- Et dokument du leser eller godkjenner → `Panel` (desktop) / `BottomSheet`
  (mobil). Nivåregelen: en artefakt krymper ikke inn i et lag.

## Kontrakt
- Fokus: `useOverlayLayer` fra `overlay-focus.jsx`. Ingen egen fokusfelle.
  Med tittel går fokus til laget (`initialFocus: "layer"`), uten tittel til
  første fokuserbare node — ellers hopper leseren over overskriften.
- `aria-modal="false"`: laget er en dialog, men bakgrunnen forblir levende.
  Trenger du inert, er valget feil komponent.
- Escape og klikk utenfor gjelder kun øverste lag (delt stack i hooken).
- Lukkeknappen er 28 px synlig med 44 px `::after`-sone ved grov peker
  (gulvregel.md avsnitt 2). Den synlige boksen endres aldri.
- Oransje har ingen jobb her. Handlinger i `footer` er blekk/ghost.

## Anatomi
Mono-etikett (valgfri) · tittel · lukkeknapp · innhold · handlingsrad.
Laget er `container-type: inline-size`, så innhold kan legge om etter lagets
bredde og ikke vinduets.

## Målt
Lukkeknapp 28,0 px synlig / 44,0 px sone ved grov peker [målt 31.07].
