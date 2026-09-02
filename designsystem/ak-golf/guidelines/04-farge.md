# 4 · Farge

Fasit i kode: `designsystem/ak-golf/tokens/farge.css`.

## Rommet

Merket hører hjemme i et **verksted**, ikke i et klubbhus. Valgt av Anders
01.09.2026, og det følger av hva Academy faktisk står for: langsiktig
utvikling, oppfølging, og trening som er optimal og spesifikk — **uavhengig av
hvilket nivå spilleren er på.**

Den siste setningen er grunnen til at paletten ser ut som den gjør. De fleste
golfmerker signaliserer eksklusivitet: dyp grønn, gull, marmor, seriffer. Det
sier «her må du være god nok» før noen har lest et ord. AK Golf sier det
motsatte, og da kan ikke fargene motsi teksten.

**Ingenting i denne paletten er premium, og det er meningen.** Et godt verktøy
er ikke pyntet. Det er nøyaktig.

## Grunnen

**Varm betonggrå `#E8E4DC`.** Ikke hvitt, ikke krem, ikke grønt. Den ser ut som
en arbeidsflate.

| Rolle | Verdi | Kontrast |
|---|---|---|
| Grunn | `#E8E4DC` | — |
| Grunn, senket | `#DDD8CE` | — |
| Ark og kort | `#FFFFFF` | — |
| Tekst | `#1F1D1A` | 13,3:1 på grunn · 16,8:1 på ark |
| Dempet tekst | `#57534B` | 6,0:1 |
| Svak | `#8B857A` | 2,9:1 — **aldri brødtekst**, kun etiketter og kanter |
| Linje | `#D2CCC0` | — |
| Linje, hard | `#B8B1A3` | — |

## Signalet

**`#B83217` er merkets ene aksent.** Rødt betyr «se her»: en måling, et tall,
en handling.

Aldri dekor. Aldri en stemning. Aldri fem røde ting på samme flate. Rødt i et
verksted er en markering — det er nøyaktig den betydningen merket trenger, og
den ryker hvis fargen brukes til pynt.

| Rolle | Verdi | Kontrast |
|---|---|---|
| Signal, tekst | `#B83217` | 4,7:1 på grunn |
| Signal, fyll | `#C4361B` | for hele flater |
| Tekst på fyllet | `#FFFFFF` | 6,0:1 |

## Fagfargen

**`#2C6E63`**, dyp grønnblå. Andrestemme, sjelden brukt: for det som hører til
**metoden** framfor til **målingen** — pyramiden, periodene, langsiktige linjer
i et diagram. 4,7:1 på grunn.

## Varianttonene

Dempede arbeidstoner, ikke fem glade farger. I et verksted er ikke verktøyene
fargekodet etter merke — de er merket for å skilles fra hverandre. Det er alt
disse gjør.

| Variant | Verdi | Kontrast |
|---|---|---|
| Junior Academy | `#4A6B33` | 4,8:1 |
| AK Golf Academy | *låner signalet* | 4,7:1 |
| AK Golf HQ | `#2B5F87` | 5,4:1 |
| Organisasjon | `#4A4F58` | 6,5:1 |
| Skarpnord Products | `#7A5A22` | 5,0:1 |

**Rødt er opptatt av signalet.** Academy låner den fordi Academy *er* kjernen —
men ingen annen variant får noe som ligner. Ser du rødt et sted, skal det bety
«se her», ikke «dette er Junior».

## Verkstedet om kvelden

Den mørke varianten er varm mørk grå `#22201C` — ikke sort, ikke premium. Samme
temperatur som betongen, bare skrudd ned. **Lys er standard**; mørk er
varianten, ikke utgangspunktet.

Alle verdier og kontrasttall står i `tokens/farge.css`.

## Status er aldri identitet

I orden `#2E6B45` · følg med `#8A6410` · feil `#A62B1C`.

Feilrød `#A62B1C` er med vilje mørkere og mindre mettet enn signalet `#B83217`,
så «noe er galt» ikke kan forveksles med «se her».

## Aldri

- Aldri en farge som ikke står i `farge.css`.
- Aldri rødt som dekor. Rødt betyr noe.
- Aldri to varianttoner i samme visning.
- Aldri gradienter. Verkstedet er flatt.
- Aldri farge som eneste bærer av informasjon.
