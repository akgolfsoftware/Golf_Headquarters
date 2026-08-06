# Måling og falsifisering mot bundelen — 31.07.2026 (ettermiddag)

Lukker restpunkt 2 i `kart/status-til-komplett-2026-07-31.md`: «falsifisering av de
tre nye kortenes assertioner mot bundelen — første oppgave neste tur.»

Metode: hvert kort lastet i headless Chromium mot den serverte bundelen. Forfalskningen
injiseres som CSS FØR assertionene kjører — ingen kortfil ble midlertidig ødelagt og
rullet tilbake. To ulike predikater forfalsket per kort, slik at det ikke er samme
målevei som testes to ganger.

**Dekning uendret av denne runden: 8/223 skjermer · 85/151 komponenter.**

## Resultat

| Kort | Forfalsket | Utfall |
|---|---|---|
| `popover-tooltip-drawer` | lukkeknappen klemt til 20 px · tooltip gjort klikkbar | **1 rød hver, 6 uberørte grønne**. Basislinje 7/7 grønn |
| `workbench` | formelen tvunget synlig i 132 px-kolonnen · over-taket-fyllet tvunget til ren rød | **1 rød hver, 13 uberørte grønne**. Basislinje 14/14 grønn etter rettelse under |
| `forms-p2` | gulvet klemt til 20 px · feilrammen tvunget til ren rød | **1 rød hver, 15 uberørte grønne**. Basislinje 16/17 — se åpent punkt |

Predikatene måler altså det de påstår.

## Funn 1 — `Combobox` rendret uten egen CSS (ekte defekt, rettet i kilden)

`Checkbox` og `Combobox` delte **både klasseprefikset `.akhq-cb` og style-tag-id-en
`akhq-css-cb`**. Guarden `!document.getElementById("akhq-css-cb")` gjorde at den som
lastet sist aldri fikk injisert CSS-en sin. Målt før rettelse: comboboksfeltet var
**16 px høyt med `--floor: 0`** og arvet checkboxens regler — der kontrakten og
`Combobox.prompt.md` sier 36 px synlig og 44 px ved grov peker.

Dette er den stille feilklassen: ingen advarsel, ingen rød assertion i den opprinnelige
kjøringen, bare feil størrelse. Kortets egen gulvassertion var eneste sted den kunne
fanges — og den ble aldri kjørt mot bundelen før nå.

**Rettet:** `Combobox` bruker nå prefikset `akhq-cmb` og id-en `akhq-css-cmb`.
Kortets selektorer er oppdatert deretter.

**Åpent:** `_ds_bundle.js` regenereres av kompilatoren, ikke av en filskriving. Til
den er bygget på nytt står `forms-p2` med «combobox-felt ikke funnet» — forventet,
og løses ved neste kompilering. Skal verifiseres målt før kortet meldes 17/17.

**Regel som følger av funnet:** én style-tag-id og étt klasseprefiks per komponent.
To komponenter som deler id gjør at den enes CSS forsvinner uten spor. Hører i sveipet
sammen med udefinerte `var()`-referanser ([natt 9]) — begge feiler stille.

## Funn 2 — tre assertioner kunne aldri bli grønne (kortfeil, rettet)

Kortene rendrer **to spesimen** (lys + mørk). Tellende assertioner brukte
`document.querySelectorAll` og talte derfor begge:

| Assertion | Talte | Kontrakten sier |
|---|---|---|
| `forms-p2` «seks ruter, first har one-time-code» | 12 | 6 |
| `forms-p2` «nøyaktig én tabbbar dag» | 2 | 1 |
| `workbench` «to brudd, hvert med Overstyr» | 4 | 2 |

Rettet ved å skope til lys-halvdelen (`LYS.querySelectorAll`). Begge kort er nå
grønne på disse.

**Konsekvens for tidligere rapporter:** morgenrapportens «16 assertioner» på
`forms-p2` og «13 assertioner» på `workbench` var aldri helgrønne i en fersk render.
Dette er nøyaktig det restpunkt 2 fantes for å fange, og det fanget det.

**Regel:** en tellende assertion skopes alltid til étt spesimen. Et kort med to
moduser dobler alt som telles.

## Status etter denne runden

- `workbench`: **14/14 grønn**, begge forfalskninger slår ut [målt]
- `popover-tooltip-drawer`: **7/7 grønn**, begge forfalskninger slår ut [målt]
- `forms-p2`: **16/17**, siste venter på at bundelen kompileres med det nye prefikset
- P7 craft-porten er fortsatt utestående for alt — den kan ikke lukkes herfra
