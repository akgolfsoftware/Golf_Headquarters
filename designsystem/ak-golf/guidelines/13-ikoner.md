# 13 · Ikoner

Fasit i kode: `components/merke/Ikon.jsx` og `assets/ikon/` (24 SVG-filer).
Lagt til 02.09.2026 — før det sa systemet «ikoner er Lucide» uten å ha ett
eneste ikon.

## Settet

24 ikoner, alle fra Lucide (ISC-lisens), satt opp etter merkets regler:

| Navn | Lucide | Brukes til |
|---|---|---|
| `meny` `lukk` | menu, x | mobilmeny |
| `pil-ned` `pil-hoyre` `pil-venstre` | chevron-* | akkordeon, paginering, liste |
| `videre` `ut` | arrow-right, arrow-up-right | lenke i tekst, ekstern side |
| `pluss` `minus` `hake` | plus, minus, check | legg til, fjern, fullført |
| `sok` `kalender` `klokke` `sted` | search, calendar, clock, map-pin | booking, øktinfo |
| `epost` `telefon` | mail, phone | kontakt |
| `last-ned` `ekstern` `dokument` | download, external-link, file-text | rapport, PDF |
| `info` `advarsel` | info, triangle-alert | varsel |
| `kryss` `maal` | crosshair, target | instrumentet, mål |
| `person` | user | konto |

## Reglene

- **24 × 24 viewBox, strek 2, `stroke-linecap: square`, `stroke-linejoin:
  miter`.** Lucide er rund som standard; merket er rolig, ikke rundt. Avviket
  er med vilje og gjelder alle 24.
- **Størrelse følger typeskalaen:** 16, 18, 20 eller 22 px. 8 px mellom ikon
  og tekst.
- **Ikonet arver tekstfargen.** Signalrødt ikon betyr «se her» — samme regel
  som for alt annet rødt.
- **Et ikon er aldri eneste bærer av mening.** Står det uten tekst, må det ha
  `merkelapp` (blir `aria-label`). Står det ved tekst, er det skjult for
  skjermleser — teksten holder.
- **Ingen emoji. Ingen illustrasjoner. Ingen egne tegninger.** Mangler et
  ikon: hent fra Lucide, sett square/miter, legg det til i `Ikon.jsx` OG som
  fil i `assets/ikon/`. Begge steder, alltid.

## Hvorfor bare 24

Et merke som sier «vi måler, vi synser ikke» trenger få ikoner. Hvert ikon
som legges til er en beslutning om at et ord ikke holdt. Trenger en flate mer
enn ett eller to ikoner, er det som regel teksten som skal rettes, ikke
settet som skal utvides.
