# 4 · Farge

Fasit i kode: `designsystem/ak-golf/tokens/farge.css`.

## Grunnen

Merket står på **krem `#FAF9F5`**, ikke hvitt. Kremen er varm nok til at foto av
gress og hud ser riktig ut på den, og den skiller AK Golf fra alle
programvaremerker som står på rent hvitt.

Merkets mørke er **blekk `#141413`**, ikke svart. Samme varme som kremen.
Ren `#000000` hører til Train-lock og produktskjermene — ikke til merket.

| Rolle | Verdi | Merknad |
|---|---|---|
| Flate, lys | `#FAF9F5` | Standard |
| Flate, senket | `#F0EEE6` | Seksjon som skal skille seg |
| Kort på krem | `#FFFFFF` | |
| Tekst | `#141413` | |
| Underordnet tekst | `#5E5D59` | 6,4:1 på krem |
| Etikett | `#B0AEA5` | **Aldri brødtekst** |
| Kant | `#E8E6DC` | |

## Identitetsfargene

Hver virksomhet har tre verdier, ikke én: en **flatefarge**, en **tekstfarge**
som er mørk nok til å leses på krem, og en **lys** som leses på blekk.

| Variant | Flate | Tekst på krem | Lys på blekk |
|---|---|---|---|
| Academy | `#D97757` | `#A9512F` · 5,10:1 | `#E08B69` · 7,08:1 |
| Junior | `#5B8450` | `#4F7343` · 5,16:1 | `#8FB37F` · 7,83:1 |
| HQ | `#3F7CB3` | `#356B9C` · 5,34:1 | `#7FB0DA` · 8,01:1 |
| Organisasjon | `#4E6A7E` | `#42596B` · 6,94:1 | `#93AEC0` · 7,95:1 |
| Products | `#9C7A33` | `#8A6A2A` · 4,77:1 | `#C9A755` · 8,03:1 |

Alle tall er **målt 31.08.2026**, ikke anslått, med WCAG-formelen mot krem
`#FAF9F5` og blekk `#141413`. Regnestykket ligger i historikken til denne PR-en.

## Én rettelse mot dagens kode

`--mk-accent-fg: #B85C3D` er i drift på markedssidene som clay-tekstfarge. Målt
gir den **4,30:1** på krem — under kravet på 4,5 for tekst under 24 px. Den er i
bruk på nettopp små caps-etiketter, der den ikke holder.

`--ak-clay-tekst: #A9512F` gir 5,10:1 og er visuelt nesten ikke til å skille fra
den. **Nytt materiell bruker `#A9512F`.** Å bytte den i produksjonskoden er en
egen liten jobb, ikke en del av merkevareleveransen.

## Status er ikke identitet

Grønn, gul og rød brukes til å si om noe er i orden — aldri som merkefarge:

| Rolle | Verdi |
|---|---|
| I orden | `#2E7D51` |
| Følg med | `#9A6B10` |
| Feil | `#B3261E` |

Statusgrønn `#2E7D51` er med vilje kjøligere og mørkere enn Junior `#5B8450`,
så «godkjent» aldri kan forveksles med «juniorprogrammet».

## Aldri

- Aldri en farge som ikke står i `farge.css`.
- Aldri to identitetsfarger i samme flate. Én variant om gangen.
- Aldri gradienter over merkefarger. Merket er flatt.
- Aldri clay på grønn, eller identitetsfarge på identitetsfarge.
- Aldri farge som eneste bærer av informasjon — sett alltid et ord eller en form ved siden av.
