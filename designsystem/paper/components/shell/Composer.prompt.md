# Composer

Skallets festede spørrefelt. Bor **under** flaten, aldri inne i den.

## Hvorfor

AgencyOS er samtale som standardflate: rundt 35 funksjoner starter som et spørsmål. Komponisten følger deg på alle flater slik at du kan spørre om en spiller mens du står i Workbench — derfor er den en del av skallet, ikke av skjermen.

## Bruk

```jsx
<Composer
  context={[{ id: "emma", label: "Emma S.", active: true }, { id: "u31", label: "uke 31" }]}
  onContextToggle={toggle}
  onSubmit={(t) => spør(t)} />
```

## Regler

- **Desktop: alle flater. Mobil: kun Hjem.** Tommelen er der, oppmerksomheten er ikke — og en komponist på en 430 px Workbench spiser arbeidsflaten.
- **Den skal ikke ta plass fra flaten.** Feltet starter på 36 px, vokser med innholdet og stopper på 120 px (fem linjer). Taket eies av CSS, ikke av JS-en som måler.
- **⏎ sender, ⇧⏎ gir ny linje.** Hinten sier det, og skjules under 420 px container der den ville brukket boksen.
- **Send-knappen er `variant="primary"` — blekk.** Komponisten er aldri skjermens oransje jobb; den er alltid tilgjengelig, og det som er alltid tilgjengelig er ikke det viktigste akkurat nå.
- **Kontekstchips er hva spørsmålet gjelder**, ikke filtre. De toggles med `aria-pressed` og blir blekkfylte når de er på.

## Tilstander

default · hover (boksen) · focus-within (2 px `--focus` på boksen, ikke på textarea) · disabled · tomt felt (send-knappen er `disabled` — et tomt spørsmål er ikke et spørsmål) · chips av/på.

Gulv: `.akhq-comp-in` og `.akhq-comp-ctx` løftes til 44 px ved grov peker, med `[data-coarse-test]`-stand-in.
