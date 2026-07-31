DropdownMenu er den grupperte popover-menyen: seksjonsetiketter, separatorer, valg med hurtigtastnotat.

```jsx
<DropdownMenu dataOdId="opprett" trigger={<Button>Opprett</Button>} items={[
  { type: "label", text: "Økt" },
  { id: "okt", text: "Ny økt", note: "⌘N", onSelect: nyOkt },
  { id: "serie", text: "Ny serie", onSelect: nySerie },
  { type: "separator" },
  { type: "label", text: "Plan" },
  { id: "uke", text: "Ukeplan fra mal", onSelect: fraMal },
  { id: "periode", text: "Ny periode", disabled: true },
  { type: "separator" },
  { id: "slett", text: "Slett utkast", tone: "dn", onSelect: bekreftSlett }
]} />
```

## Fokusoppførselen ligger IKKE her

Fokusfelle, Escape, retur til utløseren og klikk-utenfor er implementert én gang i `components/overlays/overlay-focus.jsx` (`useOverlayLayer`, `useRovingKeys`) og er den delte oppførselen fokuskontrakten i `readme.md` beskriver. DropdownMenu konsumerer den.

**Skriv aldri en egen fokusfelle i en komponent.** ConfirmDialog, Modal, BottomSheet, CommandPalette, ContextMenu og FlyoutPanel skal bruke samme hook — tre av dem ligger i kalenderfamilien, og seks halvferdige fokusfeller er blant de dyreste feilene å rette i etterkant. Mangler kontrakten noe en ny komponent trenger, utvides hooken; den kopieres ikke.

Det hooken gir automatisk: `aria-haspopup="menu"` og `aria-expanded` på utløseren, `role="menu"`/`role="menuitem"`, fokus til første valg ved åpning, Tab-syklus innenfor menyen, piltaster + Home/End mellom valgene, Escape som lukker **øverste** lag (felles stack — nøstede overlegg lukkes ett om gangen), fokus tilbake til utløseren uansett lukkemåte med fallback til nærmeste stabile forelder hvis utløseren er slettet, og lukking ved klikk utenfor.

**DropdownMenu er bevisst `modal: false`.** En meny er ikke modal: innholdet bak skal fortsatt kunne leses av skjermleser, og siden skal kunne rulle. `modal: true` — som setter `inert` + `aria-hidden` på alt utenfor laget og låser rulling — er for ConfirmDialog, Modal og BottomSheet. Ikke slå den på her.

**Sletter et menyvalg elementet menyen ble åpnet fra**, håndteres fokus av hookens fallback. Du trenger ikke gjøre noe, men vit at målet blir nærmeste `panel-`/`list-`/`section`/`main`/`form` — legg `data-od-id` med riktig prefiks på den beholderen, ellers klatrer fallbacken høyere enn du vil.

## Regler

- `trigger` skal være **ett `<Button>`** — komponenten setter ARIA og `data-od-id` på det, og måler det via en `display:contents`-wrapper den selv eier. `Button` er `React.forwardRef`; skal en annen komponent brukes som utløser (Chip), må den også videresende ref, ellers finner hooken ikke fokusmålet og fokus faller til `<body>` ved lukking.
- **`align` er `auto` som standard og skal normalt stå urørt.** Menyen måler seg selv etter åpning og forankrer innover fra høyre når utløseren står nær kanten av nærmeste klippende forelder eller viewporten. Grunnen til at dette er automatikk og ikke en forfatterbeslutning: en utløser i `PageHeader actions` eller et panelhode *er* alltid nær høyre kant, og med manuell `align` blir det et valg noen må huske på hvert brukssted — glemmes det, klippes menyen. Eksplisitt `align="left"`/`"right"` finnes for de tilfellene der du vet bedre enn målingen, og overstyrer den (eksplisitt valg slår automatisk tilpasning).
- `defaultOpen` finnes for spesimenkort og dokumentasjon — et kort skal vise laget uten at noen må klikke. Bruk den ikke i produkt.
- Valg er `<button type="button">`, aldri `<a>`. Navigerer valget til en side, hører det i en nav-liste, ikke i en meny.
- `type: "label"` er seksjonsetiketten inne i menyen (mono versal, som SectionLabel men med menyens polstring). `type: "separator"` er en `<hr role="separator">`.
- `tone: "dn"` for destruktive valg — `--dn` tekst, ingen fylt farge. Sletting skal deretter bekreftes i en ConfirmDialog; menyen bekrefter ingenting selv.
- `disabled` gir `aria-disabled` og beholder valget i menyen. Skjul aldri et valg som brukeren forventer å finne — vis det utilgjengelig.
- `note` er mono og høyrejustert: hurtigtast eller antall, ikke forklarende tekst.
- Valgene har 32px høyde på mus og **44px gulv** under `pointer: coarse` (`max(var(--hit), var(--floor))`).
- Menyen lukkes ved valg. Skal noe forbli åpent (flervalg, filter), er det ikke en meny — det er en popover med Chip-er eller Checkbox-er.
