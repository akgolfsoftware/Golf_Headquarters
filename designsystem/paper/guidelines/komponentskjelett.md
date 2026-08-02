# Komponentskjelett — kopier dette før du skriver en ny komponent

Tre mønstre er blitt fastsatt *etter* at komponenter var bygget (container queries, `box-sizing`, `@layer`), og hver gang kostet det en retrofit. Med ~140 komponenter igjen skal etterlevelse være standardtilstanden, ikke noe som sjekkes etterpå. Kopier de fire blokkene under, bytt navn, slett det du ikke bruker.

**Aktør for alt i denne filen: forfatter** — med to unntak som er merket i teksten (høydemåling og `?selvtest`-utfall er verifikatørens). Se ROLLEFORDELING i `readme.md`: forfatteren skal ikke fremsette målepåstander, bare beregnede verdier merket som beregnede.

Filsett per komponent, i samme mappe:
```
components/<familie>/<Navn>.jsx        implementasjonen
components/<familie>/<Navn>.d.ts       props + hvorfor komponenten finnes
components/<familie>/<Navn>.prompt.md  reglene for bruk
components/<familie>/<navn>.card.html  spesimenkort (@dsCard)
```

## 1 · `<Navn>.jsx`

```jsx
import React from "react";
const css = `
@layer akhq-base, akhq-container, akhq-modifier;
@layer akhq-base{
/* Wrapper KUN hvis komponenten legger om på egen bredde — et element kan ikke query seg selv. */
.akhq-x-wrap{container-type:inline-size;display:grid;width:100%;min-width:0}
/* Alt som varierer, deklareres som variabel og brukes ÉN gang. */
.akhq-x{--pad:var(--s4);--gap:var(--s3);padding:var(--pad);gap:var(--gap);box-sizing:border-box;min-width:0;font-family:var(--ui);color:var(--fg)}
}
@layer akhq-container{
/* Automatisk tilpasning: container queries + pointer/motion. Endrer BARE variabler. */
@container (max-width:480px){.akhq-x{--pad:var(--s3)}}
@media(pointer:coarse){.akhq-x{--hit:44px}}
}
@layer akhq-modifier{
/* Eksplisitte forfattervalg. Vinner over container-laget uten spesifisitetstriks. */
.akhq-x--sm{--pad:var(--s2)}
}`;
if (typeof document !== "undefined" && !document.getElementById("akhq-css-x")) { const s = document.createElement("style"); s.id = "akhq-css-x"; s.textContent = css; document.head.appendChild(s); }
export function X({ state = "content", emptyText = "Ekte norsk tomtekst her.", density = "md", dataOdId = "x", children, ...rest }) {
  return (
    <div className="akhq-x-wrap">
      <div className={"akhq-x" + (density !== "md" ? " akhq-x--" + density : "")} data-od-id={dataOdId} {...rest}>
        {/* Datakomponent? Pakk innholdet i <Region state={state} empty={emptyText}> */}
        {children}
      </div>
    </div>
  );
}
```

Sjekkliste før filen lagres:
- **Navnekollisjonssjekk — slå opp mot `guidelines/klasseinventar.md` FØR du lagrer.** Sjekk HVERT klassenavn du planlegger, element-klasser også, ikke bare prefikset. Er navnet i bruk, velg et annet; løs aldri kollisjonen med høyere spesifisitet eller `!important`. Grunnen er alvorlig: **ulagrede regler slår lagrede uansett spesifisitet.** 174 av 302 klassenavn er i dag ulagrede, så en ny `@layer akhq-base`-regel med samme navn taper stille — den blir aldri anvendt, og feilen ser ut som en designfeil, ikke en kollisjon.

  **Inventaret genereres fra `_ds_bundle.js`, ikke fra hukommelsen.** Kjør skriptet som ligger som kodeblokk i `guidelines/klasseinventar.md` i `run_script`, som del av verifiseringssteget, etter hver kompilering. Bundelen er eneste kilde som inneholder hele navnerommet; en håndholdt liste speiler bare de filene man husket å åpne — første versjon dekket `viz.jsx` og steg 2–3, manglet navigasjonen fra steg 4, og derfor slapp `.akhq-tab` gjennom. **Skriptet skal ligge som kodeblokk, aldri som løs `.js`-fil** — se `guidelines/kompilerte-filtyper.md` for hvilke endelser kompilatoren konsumerer og hvor verktøyfiler hører.

  **Kryssfil-styling er samme felle — og den verste av de tre.** En regel i din `@layer akhq-base` som treffer en *annen* komponents element (`.min-wrapper>.akhq-btn`) taper mot den filens ulagrede CSS, selv med høyere spesifisitet — selektoren matcher, deklarasjonene anvendes ikke. En navnekollisjon gir en selektor som ikke finnes å feilsøke; denne gir en som matcher og likevel ikke virker, altså usynlig uten at man kjenner lagreglene fra før. Det skjedde med ConfirmDialogs destruktive knapp, som ble bit-identisk med «Avbryt». **Style aldri en annen komponents element fra din egen fil; legg varianten i den komponentens fil.**

  **REVIDERT 28.07.2026 — lagmigreringen er fullført, og de tre reglene over er derfor omskrevet.** Alt i biblioteket er nå lagret (0 ulagrede filer), så «ulagret CSS vinner over lagret» er ikke lenger et forhold som finnes. Hver regel er vurdert på nytt, og ingen står igjen med kaskadeargumentet som eneste begrunnelse:

  - **Unikt klasseprefiks — nedgradert fra bindende til anbefalt.** Ny begrunnelse: navnet skal si hvilken fil regelen bor i, så en uventet stil er gjenfinnbar. Ikke lenger et kaskadevern; en kollisjon mellom to lagrede regler er en vanlig, feilsøkbar spesifisitetskonflikt, ikke en stille utradering.
  - **Grep mot klasseinventaret — nedgradert til frivillig sjekk** ved generiske navn (`-row`, `-item`, `-title`). Generatoren beholdes som oversikt; ute av kortkravene i verifiseringssteget.
  - **Aldri style en annen komponents element fra egen fil — FORTSATT BINDENDE, ny begrunnelse.** Ikke lenger «regelen matcher men virker ikke» (det var kaskaden). Nå: **eierskap og gjenfinnbarhet.** Leter du etter hvorfor en knapp er rød, skal svaret ligge i `Button.jsx` — ikke i en tilfeldig konsument som tilfeldigvis også rendrer knapper. Legg varianten i komponentens egen fil og gi den et navn.

  **Lagmedlemskap er en maskinsjekk, ikke et sjekklistepunkt.** Kjør `node guidelines/lagsjekk.mjs` — den parser `@layer`-blokkene og sammenligner med alle selektorer deklarert i filen. Sjekk aldri dette ved å lete etter `@layer` i filen: den feilen ble gjort 28.07.2026 og lot `Avatar`, `StatusBadge` og `SectionLabel` bli meldt kodeferdig helt uten lag. «Filen inneholder `@layer`» og «filens regler ligger i `@layer`» er to forskjellige egenskaper, og bare den andre betyr noe.

  **Prefiks er ikke nok:** `.akhq-tabs` var ledig mens `.akhq-tab` var okkupert av `TabBar`, så fanene arvet bunnavigasjonens kolonnegeometri og mistet 2px-understreken. To stille feil funnet slik: `.akhq-empty` (EmptyState mot Region) og `.akhq-tab` (Tabs mot TabBar).
- **Tilgjengelighetsgulv skrives med `max()`, ikke som konkurrerende verdi:** `min-height:max(var(--hit),var(--floor))` med `--floor:44px` under `pointer: coarse`. Ellers kan en modifikator underskride 44px. Samme for kontrast og synlig fokusring.
- Ingen `vw`/`vh`/`vmin`/`vmax`/`svh`/`lvh`/`dvh` — bruk `cqi`/`cqb`/`cqmin`/`cqmax` og **regn om faktoren** (containeren er alltid smalere enn vinduet: `3vw` ≈ `4cqi` i hovedspalten).
- Ingen egenskap deklarert to steder. Varierer den, er den en variabel.
- Bærer komponenten data: `state` (`content|empty|loading|error`) + `emptyText` på norsk, via `Region`.
- `data-od-id` med rolleprefiks: `nav-` `kpi-` `cta-` `panel-`. Interaktivt element får `cta-`.
- Åpner komponenten et lag over innholdet: følg fokuskontrakten i `readme.md` — alle syv punktene.
- Farge: tone på ikon/etikett, brødtekst alltid `--fg`. Oransje er OneThingNows og focus'. Ingen ny hex.

## 2 · `<Navn>.d.ts`

```ts
/**
 * Én setning om hva komponenten er og hvor mange skjermer den dekker.
 * Hvilken håndrullet variant eller pensjonert komponent den erstatter.
 * Hva den IKKE er (nærmeste nabo, og hvorfor de er forskjellige).
 */
export interface XProps {
  /** Lukket union der det er mulig — ikke vilkårlige noder */
  variant?: "a" | "b";
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  /** data-od-id, rolleprefiks <nav|kpi|cta|panel>- */
  dataOdId?: string;
  children?: React.ReactNode;
}
```

## 3 · `<Navn>.prompt.md`

```md
Én linje om jobben. Deretter et kodeeksempel med ekte norsk innhold — aldri lorem, aldri «Item 1».

```jsx
<X variant="a" dataOdId="panel-x">Ekte tekst</X>
```

- Grensen mot nærmeste nabokomponent, i én kule. Uten den velger skjermene etter smak.
- Hva som er lukket og hvorfor (unioner, toner, ikoner) + at utvidelser skjer i biblioteket, ikke per skjerm.
- Container-terskel og hvorfor tallet er omregnet, ikke oversatt.
- Avvik fra referanseverdier, med begrunnelse — ellers blir de «rettet» tilbake senere.
- Bindende beslutninger som egen seksjon med overskrift, ikke som kule i en liste.
```

## 4 · `<navn>.card.html`

```html
<!-- @dsCard group="<Gruppe>" viewport="980x<MÅLT+10%>" name="<Navn>" subtitle="<hva kortet beviser>" -->
<!DOCTYPE html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="../../styles.css"><link rel="stylesheet" href="../../guidelines/card-support.css">
<!-- React 18.3.1 + react-dom + babel med integrity, som i alle andre kort -->
<script src="../../_ds_bundle.js"></script>
<style>.stack{display:grid;grid-template-columns:1fr;min-height:100vh}.stack>div{padding:var(--s5);background:var(--bg);color:var(--fg)}.cw{box-sizing:content-box;border:1px dashed var(--border);border-radius:var(--r);padding:var(--s4)}</style></head>
<body><div class="stack"><div id="light"></div><div data-theme="dark" id="dark"></div></div>
```

Kortkrav:
- **Stakket full bredde**, lys over mørk. Sidestilt `.two/.half` bare for smale spesimener (fargeprøver, typografi).
- **`.cw{box-sizing:content-box}`** — ellers er containeren 34 px smalere enn etiketten oppgir.
- Legger komponenten om: minst **to containerbredder**, hver med `SectionLabel` som oppgir bredden. Ta med en bredde rett over og rett under terskelen, så terskelen selv er synlig. 860 = AgencyOS hovedspalte, 740 = iPad landskap, 430 = PlayerHQ-kolonne.
- **Kontroller at «over terskelen»-saken faktisk ER over — forfatterens ansvar, ikke maskinsjekket.** Riggen asserterer bare at *riggens egen SPEC* har saker på begge sider (`window.__DEKNING`); den laster ingen kortfil og kan ikke se kortets `Width`-bredder. Regn derfor kjeden selv, hele veien: `Width` → panelpolstring → kolonnedeling → komponentens wrapper. Bakgrunn: EmptyState-kortet hadde fem saker som **alle** resolverte under 420 — 860-raden delte i `1fr 1fr`, så hver wrapper ble ~389px, samme side som PlayerHQ-kolonnen. Kortet så komplett ut og basistilstanden rendret aldri. Skal en rad vise basis, gi den **ett** element i full bredde.
- **Regn terskelen mot elementet som ER containeren, ikke mot spaltebredden — og mot hele intervallet av forfedre.** Forfedrenes bidrag er et intervall, ikke et tall: Panel trekker 38px ved `flush`, 34px ved `md`/`sm` i smal container, 2px ved `flush`+`bleed`, 0 uten Panel. Faller en konfigurasjon utenfor terskelen, skal det stå som bevisst utfall — ikke oppdages som overraskelse i en senere pulje.
- **Terskelen skal assereres, ikke dokumenteres.** Legg komponenten inn i `guidelines/terskelrigg.html` med én linje per konfigurasjon: `{ navn, bredde, gruppe, fyrer, render }`. Riggen rendrer hver sak i sin egen `content-box`-kolonne, måler containeren, leser den påvirkede egenskapen og feiler synlig når virkeligheten avviker. En tabell som stemmer i dag stemmer ikke etter neste polstringsendring; en assertion feiler når den slutter å stemme. Samme oppgradering som da rad-interaktivitetsregelen gikk fra prosa til konsollvarsel. Familie 3 har 25 container-drevne komponenter — de skal alle inn i riggen.
- **En assertion som ikke er sett feile, er ikke verifisert** — *aktør: verifikatør.* Riggen har én selvtest-modus per assertion-familie: `?selvtest` forfalsker en containerbredde, `?selvtest=dekning` fjerner alle ufyrte saker fra én komponent. Begge skal gi `__OK === false`. **Legger du til en ny assertion-familie, legger du til en selvtest-modus for den i samme endring — og verifikatøren skal ha SETT den bli rød.** Dekningsassertionen ble først skrevet uten modus, og deretter med en modus som var en no-op (den fjernet én ufyrt sak av to, så `over > 0 && under > 0` holdt fortsatt). En selvtest som ikke er sett feile, er selv en usett sjekk — samme feil, ett nivå opp. Første versjon av riggen viste dessuten grønt på alle 14 saker mens container-leddet var død kode (`NaN > 1` er alltid `false`). **Forfatterens del:** bygg modusen; verifikatøren kjører den og rapporterer at den faktisk ble rød.
- **Kravet gjelder enhver sjekk som porter et steg, ikke bare riggen.** En sjekk ingen har sett feile er en sjekk ingen vet virker — og alle disse gater Port A. Før en sjekk får avgjøre om et steg er ferdig, skal den ha en kjent feilende variant: grep-sjekken for utgåtte hexverdier må ha vært kjørt mot en fil som faktisk inneholder `#D1F843` · modus-verifiseringen mot en komponent som stille rendrer lyst i mørk modus · kontrast- og fokusring-sjekker likeså. Grensen: dette gjelder sjekker som porter et steg, ikke tilfeldige assertions underveis. **Aktørfordeling:** forfatteren bygger den feilende varianten inn i sjekken; verifikatøren kjører den og rapporterer at den faktisk ble rød.
- Alle tilstander som finnes: fylt, tom, laster, feil.
- **Høyden leses av `document.body.scrollHeight` etter reload** — *aktør: verifikatør.* Forfatteren regner (se under) og merker verdien som beregnet.

  **Men hovedagenten kan ikke måle selv** — `show_html` er sperret for selvinspeksjon og `eval_js_user_view` treffer ikke en nyskrevet fil. Derfor er «mål høyden» en regel som i praksis bare verifikatøren kan oppfylle, og fire kortrunder på rad har feilet på den. Så lenge det er tilfellet gjelder dette i stedet, ved forfatting:

  **Regn høyden fra innholdet og legg 40 % på.** Per modus: ~230px per `Width`-blokk med ett element, ~120px per ekstra element i blokken, ~90px per løs `SectionLabel`-seksjon, ~60px per Callout/Banner, ~56px per ListRow, pluss 2 × 40px sidepolstring. Gang med 2 for lys + mørk. Rund opp til nærmeste 200.

  **Et for høyt kort koster hvit luft nederst. Et for lavt kort klipper beviset kortet finnes for** — i Callout/Banner-runden forsvant 430px-raden i mørk modus, altså nettopp terskelen undertittelen lovet. Feil derfor alltid oppover. Når verifikatøren rapporterer målt `scrollHeight`, sett den verdien + 10 % og behold den.
- **Måling dekker tilstander, ikke bare moduser og bredder.** En før/etter-sammenligning i standardtilstand er en stikkprøve av `:not(:hover)`. Endrer du noe som påvirker spesifisitet eller kaskade, mål `:hover`, `:focus-visible`, `[disabled]`, `[aria-selected]`, `[open]` og datatilstandene også — det er der spesifisitet faktisk brukes. *Aktør: verifikatør.*
- Verifiser alltid etter reload — førstegangsvisning har servert utdatert `_ds_bundle.js` i hver runde under steg 7. *Aktør: verifikatør; forfatteren kan ikke reloade og skal ikke påstå å ha målt.*
- **Regenerer `guidelines/klasseinventar.md`** fra bundelen i samme steg (skriptet ligger som kodeblokk i den filen), så neste komponent slår opp mot noe som stemmer i dag — ikke mot en liste som var riktig i går.

## 5 · Til slutt

- Nevn komponenten i `readme.md` under Komponenter — kompilatoren flagger den ellers.
- Kjør `check_design_system` og rett det den rapporterer.

## Spesimenkort: les propnavnene fra kilden, aldri fra hukommelsen

**Tre runder på rad (28.07.2026) rev ett feil propnavn hele kortet.** `DotMatrix` fikk `filled/total` i stedet for `values`; `SegmentControl` fikk `[{value,label}]` i stedet for `["Uke","Måned"]`; `TabBar` fikk `active` per item i stedet for `current` på komponenten. Hver gang kastet React under første render, og fordi begge `createRoot`-kall rendrer samme tre, ble **alt** borte — inkludert det runden faktisk skulle bevise.

Kortet er et enkeltfeilpunkt: én ukjent prop tar ned hele verifiseringen, og feilen ser ut som «migreringen er ødelagt» selv når kildene er riktige.

**Regel: før et kort skrives, les signaturen og `.map()`-kallet for hver komponent kortet bruker.** Signaturen alene er ikke nok — den viser at `options` finnes, ikke at elementene er strenger. Det som må leses:

```
export function X({ … })      ← propnavn og standardverdier
items.map((it) => … it.felt)  ← FELTNAVN i listeelementene
key={it.id}                   ← hvilke felt som er påkrevd
```

Dette er billig: én `run_script` som grep'er signatur, map-kall og feltnavn for alle komponentene i kortet, kjørt før kortet skrives. Da er propkontrakten lest i stedet for gjettet, og runden går til å verifisere det den skulle.

**Kontrollerte felt trenger `onChange` eller `defaultValue`/`readOnly`.** `<Input value="0" />` uten handler gir React-advarsler i hver instans. På et spesimenkort er `defaultValue` riktig — kortet demonstrerer utseende, ikke tilstandsflyt.
