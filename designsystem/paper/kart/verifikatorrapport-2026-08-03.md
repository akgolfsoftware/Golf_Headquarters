# Verifikatørrapport 03.08.2026 — bølge P4–P9 rendret og målt

**Aktør:** verifikatør (Claude Code, med rendret side via nettleser). Forfatterens leveranse
fra natten 03.08 er nå sett kjøre — dette dokumentet er grunnlaget for Anders' P7-beslutning.
**Dekning: 27/223 skjermer · 137/151 komponenter.** Ingenting i denne rapporten endrer tellingen
— den lukker (deler av) P7-porten for komponentene som alt er talt.

## Kompileringen (utført 03.08, ny bundel)

- `_ds_bundle.js` rekompilert via `check_design_system`: **604 967 byte**. Manifest og
  adherence-config fulgte med. Resultat: **145 eksporterte komponenter · 101 kort (22 grupper)
  · 132 tokens · 8 templates**. 0 foreldreløse `.d.ts`, 0 duplikatnavn, 0 kort som laster rå `.jsx`.
- `guidelines/klasseinventar.md` regenerert fra bundelen med det kanoniske skriptet:
  **1148 klassenavn, 0 ulagrede** (531 nye siden 533-målingen 31.07 — P3 + P4–P9).
  Sidelisten `klasseinventar-tillegg-2026-08-03.md` er slettet; inventaret er igjen én liste.
- 9 tokens (`--ease`, `--dur`, `--dur-slow`, `--z-*`) fikk `/* @kind other */`-merke i
  `tokens/akhq-tokens.css` under kompileringsrunden — kun kommentarer, ingen verdier endret
  (verifisert mot filen). Readme fikk en generert komponentindeks (alle 145 navn per mappe).

## Metode

Alle 51 nye spesimenkort + `golfviz/range.card.html` ble rendret ETTER kompilering, i ferskt
miljø (fetch med no-store, srcdoc-iframe i kortets deklarerte bredde). Én miljøfelle måtte
løses først: **`requestAnimationFrame` fryses i skjulte faner**, så kortenes assertion-kjede
(rAF → setTimeout 90 ms) kjørte aldri i bakgrunnsfane. Runneren stubber derfor rAF med
`setTimeout(cb, 16)` før lasting — assertions kjører da uansett fanestatus. Stubben endrer ikke
hva som måles (getComputedStyle/geometri leses etter layout uansett).
Riggen ligger i `guidelines/verifikator-runner-2026-08-03.html` (uten `@dsCard` — ikke kompilert).

## Resultat: 43 av 51 kort helgrønne

Alle 51 kort rendret innhold i begge moduser, og alle 51 kjørte assertions (312 stk. totalt).
8 kort har røde assertions — listet under som funn til P7-vurdering.

### Røde funn (venter på beslutning: komponentfeil eller assertion-feil)

| Kort | Rød assertion | Verifikatørens vurdering |
|---|---|---|
| calendar/daystrip | «i dag har synlig prikk» · «dagknapp 43×21 px ved grov peker» | trolig komponentfeil — berøringsgulvet (44 px) underskrides |
| calendar/maanedkalender | «dagcelle 31,1 px ved grov peker» | trolig komponentfeil — gulvregelen |
| calendar/visningsvelger | «knapp 20,9 px ved grov peker» | trolig komponentfeil — gulvregelen |
| datavis/heatmap | «to maks-intensitetsceller (turneringene)» | uavklart — kan være testdata i kortet |
| golfdata/diagnosekort | «prosaen er begrenset til 52ch — ch skal IKKE konverteres til cqi» | trolig komponentfeil (readme-regelen om ch-enheter) |
| golfdata/launchwindowkort | «340 px → tallkolonnen skjult (terskel 380)» | terskelen fyrer ikke — komponent eller feil terskeltall |
| golfdata/scorekort | «eagle- og dobbelmerket finnes» | uavklart — merke eller testdata mangler |
| trackman/kollestatkort | «øvrige rader har hårlinje» | uavklart |

Merk mønsteret: tre av fire kalender-funn er samme feilklasse (berøringsgulv ved grov peker).
Gulvet er bindende (readme «Berøringsgulvet…»), så disse bør rettes i komponentene, ikke i testene.

### Sett-feile-kravet — oppfylt for alle seks familiegrupper

- **calendar, datavis, golfdata, trackman:** sett feile *naturlig* (de røde funnene over).
- **domene:** LiveStatus sabotert (prikken tvunget oransje + animasjon fjernet) → «prikken er
  aldri oransje» og «live pulserer» ble røde; grønne igjen uten sabotasje.
- **P9-strøfilene (video m.fl.):** PositionMarker sabotert (aktiv markør tvunget oransje) →
  «aktiv er blekk, aldri oransje» rød; grønn igjen uten sabotasje.

Assertions er altså beviselig i stand til å feile i alle grupper — ingen vakuumgrønne kort.

## Høyder: målt, og viewport strammet til målt + 10 %

Alle 51 kort er målt (scrollHeight i deklarert bredde) og `@dsCard`-høyden satt til målt + 10 %
(rundet opp til nærmeste 10). Frasen «Høyde beregnet, ikke målt» er erstattet med «Høyde målt
03.08 (+10 %)» i alle 51. Maskinelt etterkontrollert: 51/51 filer har riktig ny høyde og frase.
Manifestet er rekompilert etterpå.

Viktigste korreksjon: **22 av 51 kort var deklarert for LAVE** (målt innhold høyere enn
viewport — innholdet ble klippet i Design System-fanen). Verst: diagnosekort 1400 → 2600,
nestefokuskort 1400 → 2460, tigerfivekort 1400 → 2430, scorekort 1600 → 2360. Forfatterens
beregnede høyder undervurderte systematisk golfdata-familien.

## Avvik mot forfatterrapporten

1. **DispersionMap-utvidelsen (baseline + hit-rate) har ikke noe spesimen.** Koden finnes i
   `DispersionMap.jsx` (baseline ×12, hitRate ×13 forekomster), men `golfviz/range.card.html`
   er det gamle Range-lab-kortet: ingen assertions, ingen baseline/hit-rate-visning. P7 for
   utvidelsen kan ikke lukkes uten spesimen — restanse til forfatterrolle.
2. **readme.md har en eldre tekstkorrupsjon** i avsnittet «Hvilke filtyper kompilatoren
   konsumerer» («…skript og rigger., sammen med `StatusCircleRow`, …») — et setningsfragment
   fra en tidligere redigering. Også avsnittet «Verifisering krever bekreftet render…» har et
   innskutt avsnitt midt i en setning («…skal derfor **ikke** fremse | …tte målepåstander»).
   Flagget her; ikke rettet (regeldokument — eier bør se).

## Venter på Anders (P7 + beslutninger)

1. **P7-godkjenning** av de 43 helgrønne kortene — craft-vurdering (squint, tetthet, referanse)
   krever eier/menneske; alt teknisk (render, assertions, høyder, terskler i kortene) er nå målt.
2. **De 8 røde funnene** — avgjør fix-retning (komponent vs. assertion) per rad i tabellen over.
3. **LFaseBadge:** Bølge 1 fjernet L-faser; ordren 03.08 bestilte badgen. Skal den brukes på flater?
4. **K2 kort-chrome:** golfdata-kortene er chromeless (Panel eier flaten) — står til noe annet sies.
5. **AK-formel v1-eksempler** i eldre kort (workbench.card.html m.fl.) — migreres til v2?
6. **DispersionMap-spesimen** (punkt 1 over) — bestilles som liten forfatterjobb.
