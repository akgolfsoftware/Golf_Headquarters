# Claude Design MCP — operasjonsprosedyre for komponenter og skjermer

Hvordan designarbeid faktisk LEVERES i det levende Claude Design-prosjektet
(«AK Golf HQ Design System», via DesignSync/MCP). Dette er kontrakten mellom
designer-rollen og designsystemet — les før du lager eller bestiller noe der.

## Kanon og struktur

- **Målbildet er v2-generasjonen:** `ui_kits/v2/**` + `tokens/v2/**`. Retning C er valgt
  (Notion/Linear/Bloomberg-tetthet, mørk-først). v13/golfdata er overgangs-lag — nye
  leveranser går ALLTID i v2-strukturen.
- **Rekkefølgen er ufravikelig: design → system → prod.** En skjerm implementeres først
  når mockupen er godkjent av Anders. Aldri «fikse design i prod».
- **Sjekk før du tegner nytt:** ~97 komponenter finnes. Let i kit-et (`readme.md`,
  `check_design_system`) før du foreslår en ny komponent. Duplikat = systemgjeld.

## Komponent-leveranse (definisjonen av «ferdig komponent»)

En komponent i v2-kitet er komplett når den har:
1. **Alle tilstander:** default, hover, focus, active, disabled, loading, empty, error
   (+ drag-over der relevant). Mangler én: skisse, ikke komponent.
2. **Begge moduser** (mørk + lys) på identisk premium-nivå, kun via semantiske tokens —
   aldri rå hex i komponentdefinisjonen.
3. **Responsive varianter** der komponenten endrer form mellom bredder (jf.
   wireframing-flater.md — f.eks. tabell→kortliste, popover→bottom-sheet).
4. **Bruksdefinisjon** (prompt.md-tradisjonen): når brukes den, når brukes den IKKE,
   hvilke data den forventer (ekte datamodell-felter), og enhets-/retningsregler for tall.

## Skjerm-mockup-leveranse

- **Lerretet bruker device-rammer:** 390 px (mobil) og 1280 px (desktop) er dagens faste
  rammer; **834 px (iPad) skal leveres i tillegg** for alle coach- og forelder-flater
  (jf. wireframing-flater.md — iPad er ikke valgfri lenger).
- **Wireframe før hi-fi** i samme fil/side: gråtone-sonene øverst, hi-fi under. Godkjenning
  av wireframen er en egen port før hi-fi-arbeid.
- **HjelpTips-regelen (LÅST):** hver mockup markerer «?»-punkter på alle tall og faguttrykk
  (SG, ACWR, CS-nivå, L-fase, TrackMan-tall …). En skjerm uten «?»-markeringer er ufullstendig.
- **Skjermtekst hentes fra `docs/skjermtekst/`** — aldri diktet opp. Norsk bokmål, ordboken
  gjelder («nærspill», aldri «kort spill»).
- **Tomme tilstander tegnes eksplisitt** — ny bruker/0 data er førsteinntrykket for hver
  eneste tester; tom-tilstanden ER skjermen inntil data finnes.

## Prompt-oppskriften (når du bestiller design fra Claude Design)

Strukturér ALLTID design-prompter slik — rekkefølgen speiler beslutningshierarkiet:

1. **Jobben** — én setning: hva skal brukeren oppnå på 5 sekunder. Ett hovedtall/fokuspunkt.
2. **De 2–3 vanskeligste beslutningene** med anbefaling per punkt (aldri åpen opsjonsliste).
3. **Ekte datamodell** — faktiske felter/tabeller, aldri fiktive. Merk hva som IKKE finnes
   ennå (design ærlig degradering, aldri falske tall).
4. **Komposisjon** — soner i prioritert rekkefølge, med komponentnavn fra kitet der de finnes.
5. **Tilstander** — tom/laster/feil/delvis, eksplisitt beskrevet.
6. **Moduser + bredder** — begge moduser, alle tre bredder (390/834/1280+), med
   reflow-strategien nevnt (hva skjer med tabellen/spliten på mobil).
7. **Avvis-lista** — de relevante anti-mønstrene (dashboard-grøt, lime på lys flate osv.).
8. **Gap-instruks** — «mangler et mønster i systemet: flagg det som komponent-behov,
   ikke improviser».

## Gap-flyten

Gap oppdaget under skjermdesign → meldes som funn til Anders → designes som NY komponent
i v2-kitet (med full tilstands-/modus-/breddedekning) → skjermen komponeres deretter.
Aldri ad-hoc UI rett i en skjerm-mockup, og aldri i prod-kode.
