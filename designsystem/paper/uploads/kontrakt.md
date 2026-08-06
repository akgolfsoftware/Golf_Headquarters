# Omskrivingskontrakt — AK Golf HQ → Claude Paper

Gjelder hver eneste skjerm. Referert i hvert steg. Fastsatt 28.07.2026, utvidet samme dag med modus- og flatekrav.

## Før noe skrives

- Les brand-guidelines SKILL.md (Anthropic-palett og typografi).
- Les tokens/akhq-tokens.css (v2 — med logo-tokens og --r-pill).
- Les logo/ak-golf-logo-bruk.md.
- Les kart/harmonisering.md og kart/inspirasjon-analyse.md.
- Les kart/beslutninger.md.
- ak-designekspert-skillen er utgått til ny versjon er lansert — bruk kun dokumentene over.

## Tokens

- `:root` og `html[data-theme="dark"]` kopieres VERBATIM fra akhq-tokens.css v2, inkludert logo-tokens og `.rail`/`.on-accent-surface`-overstyringene.
- Mangler skjermen et token: ikke oppfinn det lokalt. Stopp, foreslå tillegget til baseline, vent på svar.
- Null hardkodede hex- eller px-verdier under token-laget.

## Moduser og flater — hver skjerm leverer ALT dette

- **Lys OG mørk modus**, likeverdige, med tema-toggle og localStorage per surface (`akhq-theme-agencyos` / `akhq-theme-playerhq`). Mørk er ikke invertert lys — den følger dark-blokken i tokens-filen.
- **Tre bruddpunkter:** desktop (basis), iPad (≤1100 px), mobil (≤640 px). AgencyOS: rail 64 px → 56 px på mobil, grid kollapser til én kolonne. PlayerHQ: mobil er basis (430 px-kolonne), skalerer opp til iPad/desktop med maksbredde og sentrert kolonne.
- **`@media (pointer: coarse)`:** alle interaktive mål minst 44 px.
- Body-størrelse: AgencyOS 13,5 px · PlayerHQ 14 px.
- Logo: `tokenized`-varianten inline (arver tema automatisk).

## Bevares uendret

- All JavaScript.
- Alle data-od-id-attributter (og nye legges til der de mangler — beslutning 4).
- Alle aria-attributter og roller.
- Skjermens innhold og informasjonsarkitektur.

## Utgått — fjernes aktivt ved omskriving

- Hele det gamle AK-fargesystemet: `#005840` (forest), `#D1F843` (lime), Presis Ink-tokens (--mut, --panel, --lime, --forest, --warn, --down, --signal m.fl.). Mapping i harmonisering.md pkt. 2.
- Gamle logofiler (liste i logo/ak-golf-logo-bruk.md) — erstattes av tokenized-logoen.
- Familjen Grotesk / Inter / JetBrains Mono og Newsreader — kun Poppins/Lora/IBM Plex Mono.

## Fargedisiplin

- Oransje #D97757: kun primær handling («Én ting nå») og focus. Aldri dekor. Unntak: logoprikken (se logo-bruk).
- `--mid` brukes aldri til tekst i lys modus.
- `--up-raw` og `--info-raw` kun til fyll og grafikk, aldri tekst.
- Ingen rød. Negativ og attention bruker `--dn`.

## Tilstander — rendres, ikke antydes

- Interaktive: default, hover, focus-visible, active, disabled.
- Dataregioner: fylt, tom, laster.
- Tomme tilstander har ekte norsk tekst, aldri «Ingen data».
- prefers-reduced-motion-blokk i hver fil (ligger i tokens v2).

## Data

- Tall i `--mono` med tabulære sifre.
- Hver metrikk viser enhet og tidsvindu som synlig tekst.
- Deltaer viser retning og sammenligningsgrunnlag: «+2 vs i går».

## Språk

- All UI-tekst på norsk bokmål med æ ø å.
- Klassenavn, filnavn, token-navn på engelsk kebab-case.

## Leveranse

- Skriv til ut/ med samme filnavn som originalen. Rør aldri kilden (Desktop-mappen/inn/).

## Prosess

- Steg 2 i puljer på fire skjermer. Beslutninger utenfor kontrakten → kart/beslutninger.md.
- Steg 3: verifisering av alle ut/-filer → kart/avvik.md. Kun rapport.
- Steg 4: manglende skjermer, én om gangen, godkjenning før bygging.
