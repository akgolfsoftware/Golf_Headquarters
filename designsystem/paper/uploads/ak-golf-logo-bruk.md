# AK Golf — logobruk i Claude Paper-systemet

Gjelder AK Golf HQ og alle skjermer bygget på `akhq-tokens.css`.

Det gamle AK-fargesystemet (`#005840` mørk grønn, `#D1F843` lime) er
utgått. Logoen kjører nå i Anthropic-paletten.

## Fargeroller

| Rolle | Hex | Brukes til |
|---|---|---|
| Wordmark, lys flate | `#141413` | Bokstavene |
| Wordmark, mørk flate | `#FAF9F5` | Bokstavene |
| Prikk, lys flate | `#B85C3D` | Prikken — `--accent-fg` |
| Prikk, mørk flate | `#D97757` | Prikken — `--accent` |

Prikken er det eneste stedet aksentfargen brukes utenfor primær handling
og focus. Begrunnelse: prikken er omtrent 6 % av logobredden, sitter i
navigasjonsskinnen, og er ikke et interaktivt element. Den konkurrerer
ikke med en CTA om «hva skal jeg gjøre nå».

Rå `#D97757` måler 2,96:1 mot `--bg` og 2,69:1 mot `--soft` — begge under
3:1. På lyse flater brukes derfor `--accent-fg` `#B85C3D`.

## Variantvalg

| Bakgrunn | Fil | Wordmark | Prikk |
|---|---|---|---|
| `--bg` `#FAF9F5` · `--surface` `#FFFFFF` · `--soft` `#F0EEE6` | `on-paper` | `#141413` | `#B85C3D` |
| `--rail` / dark mode `#141413` · `#1D1C1A` | `on-ink` | `#FAF9F5` | `#D97757` |
| Aksentflate `#D97757` | `on-accent` | `#141413` | `#141413` |
| Ettfargetrykk, gravering — lys | `mono-ink` | `#141413` | `#141413` |
| Ettfargetrykk — mørk | `mono-paper` | `#FAF9F5` | `#FAF9F5` |
| Innebygd i HTML, arver tema | `tokenized` | `var(--logo-mark)` | `var(--logo-dot)` |

## Målt kontrast

| Kombinasjon | Ratio | Status |
|---|---|---|
| Ink på `#FAF9F5` | 17,50:1 | AA |
| Ink på `#F0EEE6` | 15,87:1 | AA |
| Paper på `#141413` | 17,50:1 | AA |
| Paper på `#1D1C1A` | 16,16:1 | AA |
| Ink på aksent `#D97757` | 5,90:1 | AA |
| Prikk `#B85C3D` på `#FAF9F5` | 4,30:1 | Grafikk |
| Prikk `#B85C3D` på `#FFFFFF` | 4,53:1 | Grafikk |
| Prikk `#B85C3D` på `#F0EEE6` | 3,90:1 | Grafikk |
| Prikk `#D97757` på `#141413` | 5,90:1 | Grafikk |
| Prikk `#D97757` på `#1D1C1A` | 5,45:1 | Grafikk |
| **Prikk `#D97757` på `#FAF9F5`** | **2,96:1** | **Feiler — bruk `#B85C3D`** |
| **Prikk `#D97757` på `#F0EEE6`** | **2,69:1** | **Feiler — bruk `#B85C3D`** |
| **Paper på aksent `#D97757`** | **2,96:1** | **Feiler — bruk ink** |

## Regler

1. **Rå `#D97757` er en mørk-flate-farge for prikken.** På lyse flater
   brukes `#B85C3D`. `tokenized`-varianten håndterer dette automatisk.

2. **Paper-wordmark på aksentflate er forbudt.** 2,96:1. På `#D97757`
   kjører logoen ink.

3. **Aksentflate er sjelden.** `#D97757` som heldekkende bakgrunn brukes
   kun i marketing og innlogging — aldri i applikasjonsflater, der
   aksenten er reservert for primær handling og focus.

4. **Logoen får aldri grønn eller blå.** `--up` og `--info` er
   datasemantikk. En grønn logo leses som en positiv verdi.

5. **Clear space:** minst prikkens diameter på alle fire sider. Ved
   logohøyde 32–48 px tilsvarer det `--s4`.

6. **Minstestørrelse:** 24 px på skjerm, 8 mm i trykk. Under det
   forsvinner prikken — bruk mono.

7. **Aldri:** gradient, skygge, outline, rotasjon, strekk, endret
   avstand mellom bokstaver og prikk, eller plassering på foto uten
   heldekkende bakgrunnsflate.

## Tokens

Ligger i `tokens/akhq-tokens.css` (v2): `--logo-mark` / `--logo-dot` i
`:root` og `html[data-theme="dark"]`, pluss `.rail`- og
`.on-accent-surface`-overstyringene.

## Utgåtte filer

Følgende erstattes og skal slettes fra alle prosjekter:

- `ak-golf-logo-primary-on-light.svg`
- `ak-golf-logo-primary-on-dark.svg`
- `ak-golf-logo-primary-mono.svg`
- `ak-golf-logo-white-on-green.svg`
- `ak-golf-logo-white-on-dark.svg`
- `ak-golf-logo-white-mono.svg`
- `ak-golf-logo-black-mono.svg`

`white-on-dark` og `white-on-green` var identiske filer — samme md5,
to ulike bruksområder. Eksportfeil i kilden.

Full spesifikasjon med visuelle eksempler: `~/Downloads/AKGolfLogo/ak-golf-logo-spec.html`.
