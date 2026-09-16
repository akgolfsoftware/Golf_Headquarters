# Slik bygger du med AK Golf HQ-komponentene

Dette er appens ekte React-komponenter (PlayerHQ og AgencyOS), kompilert fra `src/components/ui` og
`src/components/v2`. Bruk dem som de er; ikke lag egne knapper, kort eller rader når det finnes en her.
Norsk bokmål i all skjermtekst. Demo-navn: spiller Øyvind Rohjan, coach Anders Kristiansen.

## Innpakning og tema

- Ingen provider trengs. Alt er stylet med CSS-variabler fra `styles.css` (som importerer
  `fonts/fonts.css` og `_ds_bundle.css`).
- Lyst tema er standard. Mørkt tema slås på med attributtet `data-v2-tema="dark"` på `<html>`
  (ikke på et indre element) — alle `--tl-*`- og `--v2-*`-variabler bytter verdi da. Produktflatene
  `/portal` og `/admin` er mørke som standard i appen; forelder- og innloggingsflater er lyse.
- Fonter er med i pakken: `--font-poppins` (tekst, via `--tl-font-sans`) og `--font-ibm-plex-mono`
  (målte tall, via `--tl-font-mono`). Ikke last andre fonter.
- Overlegg (`Dialog`, `Sheet`, `Modal`, `Ark`, `Skuff`, `Toast`, `Banner`, `KommandoPalett`) bruker
  `position: fixed`; i en forhåndsvisning med begrenset høyde må de stå i en beholder med
  `position: relative` og eksplisitt høyde.

## Styling-idiomet: tokens først, Tailwind-klasser som finnes

Komponentene bruker to lag som betyr det samme:

| Behov | Bruk | Betydning |
|---|---|---|
| Bakgrunn skjerm / kort / dokk | `var(--tl-scene)` `var(--tl-elev)` `var(--tl-dock)` | hvit → lys grå → grå (snus i mørkt) |
| Tekst / dempet tekst | `var(--tl-text)` `var(--tl-mute)` | primær, sekundær |
| Skillelinje | `var(--tl-hair)` | 8 % svart |
| Én primærhandling per skjerm | `var(--tl-fill)` med tekst `var(--tl-on-fill)` | fylt knapp |
| Status | `var(--tl-ok)` `var(--tl-warn)` `var(--tl-danger)` | grønn, gul, rød — aldri som ren tekst på lys bunn (kontrastregel 03.09.2026) |
| Radius | `var(--tl-r-card)` 20 px, `var(--tl-r-field)` 16 px, `var(--tl-r-pill)` 999 px | kort, felt, pille |
| Fremgang/«nå» | `var(--tl-warm)` | brukes som grafikk, ikke brødtekst |
| Aksefarger (pyramiden) | `var(--v2-ax-fys)` `var(--v2-ax-tek)` `var(--v2-ax-slag)` `var(--v2-ax-spill)` `var(--v2-ax-turn)` | FYS · TEK · SLAG · SPILL · TURN |
| Opp/ned | `var(--v2-up)` `var(--v2-down)` | peker på `--tl-ok`/`--tl-danger` |

Tailwind-klasser: pakken inneholder bare utility-klassene appen selv bruker (kompilert med Tailwind v4).
Trygge familier som finnes: `bg-primary`, `bg-accent`, `bg-card`, `bg-background`, `bg-muted`,
`text-foreground`, `text-primary-foreground`, `text-accent-foreground`, `text-muted-foreground`,
`border-border`, `rounded-md`, `rounded-2xl`, `rounded-full`, `font-display`, `font-mono`, `shadow-xl`,
`flex`, `grid`, `gap-3`, `px-6`, `py-4`. En klasse som ikke finnes her, gir ingen stil — bruk da
inline `style` med variablene over i stedet for å gjette klassenavn.

## Hvor sannheten bor

- Variabler og alle klasser: `styles.css` → `_ds_bundle.css` (les den før du styler noe nytt).
- Hver komponent: `components/<gruppe>/<Navn>/<Navn>.prompt.md` (props og eksempler) og
  `<Navn>.d.ts` (kontrakten). Gruppene: `primitiver`, `molekyler`, `dialoger`, `kjerne`, `datavis`,
  `spesialviz`, `domene`, `skjema`, `overlegg`, `struktur`, `kalender`, `inspektor`, `samtale`,
  `fysisk`, `utviklingsplan`, `tilbakemelding`, `workbench`, `tilstander`, `skall`, `ikoner`.
- Fagord og tall: `guidelines/ordbok-master-trening.md` er eneste ordkilde (perioder GRUNN · SPESIAL ·
  TURNERING · EVALUERING · TESTUKE · FERIE · TRENINGSSAMLING · HELDAGSSAMLING; motorikk UTEN_BALL ·
  LAV_HAST · AUTO; press ALENE · OBSERVERT · KONKURRANSE · TURNERING). Retningen «Atletisk intelligens»
  står i `guidelines/atletisk-intelligens.md`.
- TrackMan-parametere skrives på engelsk med stor forbokstav: Attack Angle, Carry, Club Speed,
  Smash Factor. Et tall vises alltid med enhet, dato og kilde; tom verdi er tankestrek, aldri 0.
- Ikoner: `Icon` tar `name` fra appens liste (lucide-navn i kebab-case), f.eks. `calendar`, `check`,
  `chevron-right`, `clock`, `dumbbell`, `flag`, `plus`, `search`, `target`, `trending-up`,
  `trending-down`, `trophy`, `user`, `users`, `x`. Ukjent navn gir tomt ikon.

## Ett eksempel (bygget fra en verifisert forhåndsvisning)

```jsx
const { Kort, Rad, TallHero, Button, Icon } = window.AkGolfHQ;

function UkeKort() {
  return (
    <div style={{ background: "var(--tl-scene)", padding: 16, fontFamily: "var(--tl-font-sans)" }}>
      <Kort eyebrow="Denne uka" action={<Button variant="secondary" size="sm">Åpne uke</Button>}>
        <TallHero label="Økter" value={4} unit="av 6" sub="To gjenstår: onsdag og lørdag" />
        <Rad leading={<Icon name="dumbbell" />} title="Styrke" sub="Onsdag 17:00 · 45 min" meta="WANG" naa />
        <Rad leading={<Icon name="target" />} title="Wedge 80–120 m" sub="Torsdag 16:00 · 40 min" last />
      </Kort>
    </div>
  );
}
```
