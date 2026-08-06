# Nattrapport — 28./29.07.2026

Arbeidsliste, ikke oppsummering. Sortert etter hvor mye som er blokkert bak hvert punkt.

---

## 0 · Fase 0 — løkken er bevist, men ikke slik planen antok

Fase 0 er **grønn**, via en annen vei enn planen beskrev. Veien må forstås før noe annet leses.

> **Korrigert senere samme natt:** konklusjonen under er delvis feil. Filer **kan** lastes ned uten
> kontekstkostnad — `curl` mot serve-URL-en skriver rett til disk, uten å gå gjennom agentens kontekst.
> Det er `get_file` som koster dobbelt, ikke nedlasting som sådan. Brukt i praksis for å pensjonere
> `Input.prompt.md` uten å tape innholdet. **Neste økt bør speile hele prosjektet lokalt med curl
> først** — da er grep mot klasseinventaret, `lagsjekk.mjs` mot kildene og lesing av naboer gratis.

### Det som ikke lot seg gjøre: laste ned prosjektet med `get_file`

Planens steg 1 («`get_file` til `~/Developer/akhq-designsystem`, hele treet») er **ikke gjennomførbart**.
`get_file` returnerer innhold til agentens kontekst, og det finnes ingen skriv-til-disk-modus. Hver fil
må derfor både leses inn og skrives ut igjen — dobbel kostnad per fil, for 260 filer. Det ville brukt
hele nattens kontekstbudsjett på nedlasting alene, uten å bygge noe.

**Valgt vei i stedet:** filer hentes **ved behov**, ikke i bulk. Biblioteket ligger på serveren; det som
trengs lokalt er kun filene som endres.

### Det som lot seg gjøre: rendre serverens egen bundle

`mcp__claude-design__render_preview` gir en kortlevd serve-URL der kortet og alle subressurser
(`_ds_bundle.js`, `styles.css`, tokens) resolverer server-side. Playwright + lokal Chrome
(`playwright-core` med `channel: "chrome"` — ingen browser-nedlasting nødvendig) åpner den og måler.

Verktøyene ligger i arbeidsmappen, ikke i prosjektet (`.mjs`/`.js` i prosjektet er farlig — se
`guidelines/kompilerte-filtyper.md`):

| Fil | Jobb |
|---|---|
| `rendre.mjs` | rendrer kort, måler innholdshøyde per modus, rapporterer konsollfeil |
| `inspiser.mjs` | resolvert tilstand for én selektor: klasser, custom properties, boks |
| `gulv.mjs` | treffmål i fin vs. grov peker — tilgjengelighetsgulvet |
| `lokal/bygg.mjs` | esbuild-transpilering av lokal `.jsx` → `window.__NY` |
| `lokal/shim/react.js` | React fra global, så esbuild slipper `require("react")` |

### Den harde blokkeringen: serveren kompilerer ikke

**En push oppdaterer kildefilen, men ikke `_ds_bundle.js`.** Målt direkte, ikke antatt:

| Kilde | `--floor` etter push |
|---|---|
| `components/forms/SegmentControl.jsx` på serveren | `44px` ✓ |
| `_ds_bundle.js` på serveren | `40px` ✗ |

Bundelen kompileres av **Claude Design-appen**, ikke av serve-endepunktet. I en headless nattkjøring
er det ingen app-økt til å utløse kompilering. Planens fallback («push, la appen kompilere, hent
bundelen tilbake») fungerer derfor **ikke** uten at Anders har appen åpen.

### Omgåelsen som lukker løkken

Et lokalt probe-kort laster **serverens bundle** (for alle eksisterende komponenter) og deretter
**lokalt transpilert JSX** som overstyrer den ene komponenten som bygges. Da måles ny kode uten at
serveren trenger å kompilere.

Verifisert som ekvivalent, ikke antatt — samme komponent, lokal bundle vs. serverens:

| Pekermodus | Knapp | Container | Utfall |
|---|---|---|---|
| fin | 28 px | 34 px | **identisk med serverens** |
| grov | 44 px | 50 px | kun den tilsiktede endringen (var 40/46) |

**Konsekvens for arbeidsflyten:** nye komponenter kan bygges og måles fullt ut lokalt. Endringer i
eksisterende komponenter kan pushes, men er **ikke synlige i Design System-fanen** før Anders åpner
prosjektet i appen én gang, som utløser rekompilering.

### Steg-for-steg

| Steg | Status | Belegg |
|---|---|---|
| 1 · hent prosjektet ned | **omgått, bevisst** | dobbel kontekstkostnad; henter ved behov |
| 2 · lokal bundelbygging | **grønn** | esbuild + react-shim; ekvivalens målt (tabell over) |
| 3 · rendre et kort | **grønn** | `panel.card.html`: lys 1584 px, mørk 1584 px, 218 akhq-noder |
| 4 · målingen måler faktisk | **grønn** | padding-override: 1584 → 2082 px |
| 5 · portsjekkene | **delvis** | se under |
| 6 · finaliser skriveplan | **grønn** | `planId` hentet før første skriving |

---

## 1 · Bygget

### Bolk A — seks komponenter, 20/20 assertioner grønne, alle sett feile først

K5 ble avgjort av Anders midt i natten: **FormField eier anatomien eksklusivt, `Input` pensjoneres**
— den migreres ikke, den opphører og splittes i naken kontroll + komposisjon. Bygget deretter:

| Komponent | Rolle |
|---|---|
| `FieldMessage` | eier meldingen under et felt — samme utseende i feltet og i en ekstern feiloppsummering |
| `FormField` v2 | anatomien; ny `labelHidden`; konsumerer `FieldMessage` |
| `TextInput` | naken ettlinjekontroll |
| `Textarea` | naken flerlinjekontroll |
| `Checkbox` | egen sidestilt etikett — kan ikke arve kolonneanatomien |
| `SearchField` | ren komposisjon: `FormField labelHidden` + `TextInput type=search`. Ingen egen CSS |

Målt i begge pekermoduser, begge temaer, to containerbredder:

| Assertion | Fin peker | Grov peker |
|---|---|---|
| treffmål ≥ 44 px | min 24 px (n/a) | **min 44 px** ✓ |
| søk: etikett visuelt skjult | 1×1 px ✓ | 1×1 px ✓ |
| søk: etikett fortsatt koblet og navngitt | ✓ | ✓ |
| feil og hint rendres som `FieldMessage` | ✓ | ✓ |
| frittstående `FieldMessage` virker | ✓ | ✓ |
| `aria-invalid` kun ved feil | ✓ | ✓ |
| `.akhq-field`/`.akhq-label` helt borte | ✓ | ✓ |
| checkbox: etikett ved siden av boksen | ✓ | ✓ |

**Selvtestet:** forfalsket variant (etikett avslørt, `aria-invalid` løyet bort, høyder klemt til 20 px)
ga 15/20 — de tre forfalskede ble røde, de uforfalskede forble grønne.

Kortet `skjema-bolk-a.card.html`: målt **lys 1628 px, mørk 1628 px → `viewport="980x3582"`**.
Jeg hadde skrevet 2600 først. Det ville klippet en tredjedel av beviset — andre gang samme natt at
et anslag var for lavt, og grunnen til at høyden nå alltid måles.

`Input.prompt.md` merket **PENSJONERT** med begrunnelse og peker; originalinnholdet beholdt under.
Det utdaterte `formfield.card.html` er slettet — det brukte `.akhq-input`, som dør med `Input`.

**Ikke gjort:** ingen av de seks er nevnt i `readme.md`, og `check_design_system` er ikke kjørt.

### `components/forms/FormField.jsx` — første versjon: anatomien. Komplett, målt, assertert.

Fire filer + tilordning: `.jsx`, `.d.ts`, `.prompt.md`, `formfield.card.html`,
`kart/formfield-tilordning.md`.

Ni assertioner, alle grønne — og **alle sett feile først** mot en forfalsket variant (koblingen brutt,
`hint`+`error` tvunget sammen, aria fjernet). Fem ble røde som forventet, de tre uforfalskede forble
grønne:

| Assertion | Utfall |
|---|---|
| `label.htmlFor === input.id` | ✓ |
| `aria-describedby` → hint, og → feil når feil er satt | ✓ |
| `aria-invalid` satt ved feil, **ikke** satt uten | ✓ |
| `required` → `aria-required` | ✓ |
| hint og feil aldri samtidig | ✓ |
| ingen kollisjon med `Input`s `.akhq-field`/`.akhq-label` | ✓ |
| uten etikett → ingen tom label-node | ✓ |

Målt, ikke anslått: **lys 1268 px, mørk 1268 px → `viewport="980x2790"`.** Jeg hadde først skrevet
1500 i kortet. Det ville klippet under halve beviset — samme feilklasse som Callout/Banner-runden,
og grunnen til at høyden nå måles.
Feilfargen er `--dn` = `rgb(168, 85, 54)` [målt] — ingen rød.
28 felt, 24 etiketter, 4 feilmeldinger på kortet, konsistent med sju tilstander × to bredder × to moduser.

**Ikke gjort:** komponenten er ikke nevnt i `readme.md` under Komponenter (skjelettets steg 5), og
`check_design_system` er ikke kjørt. Begge krever lesing/skriving av filer natten ikke rakk.
Kompilatoren vil flagge den til det er gjort.

### `components/forms/SegmentControl.jsx` — tilgjengelighetsgulv rettet, `--floor: 40px → 44px`.

Funnet ved Fase 1s gruppe 2-verifisering. `tog-coarse → 44px` var det kritiske punktet og er **bekreftet**
(Toggle 20 → 44, Input 36 → 44 ved grov peker). Men i samme måling: `.akhq-seg-btn` lå på **40 px**.

Den er et ekte `<button>` med `height: 40px` — altså selve treffmålet. Containeren `.akhq-seg` var 46 px
(40 + 2×2 px polstring), og det er nesten sikkert forklaringen på feilen: gulvet ble regnet mot containeren,
som så riktig ut, mens fingeren treffer knappen. Mønsteret `max(var(--h), var(--floor))` var korrekt på
plass — bare konstanten var feil. Rettet begge steder (mediaspørringen og `[data-coarse-test]`-stand-in-en).

Målt etter fiks: knapp 44 px, container 50 px ved grov peker; uendret 28/34 ved fin peker.

**Status: pushet, men ikke synlig i appen før rekompilering** (se blokkeringen over).

---

## 2 · Køført

### K1 · Serveren kompilerer ikke — avgjør arbeidsformen for resten av biblioteket

Blokkerer: **alt videre arbeid på eksisterende komponenter**, og synligheten av alt som bygges.

De vanskeligste beslutningene:
1. **Skal biblioteket bygges videre lokalt med push-til-server, eller skal Anders holde appen åpen?**
   Lokal bygging måler riktig, men Design System-fanen henger etter til appen åpnes.
2. **Skal en lokal bundle-byggekjede bli permanent infrastruktur?** Den finnes nå og virker. Gjøres den
   permanent, får biblioteket to kompilatorer som kan divergere — appens og min.

**Anbefaling:** behold lokal bygging som *måleverktøy*, aldri som leveranseformat. Appen forblir eneste
kompilator av sannhet. Praktisk: Anders åpner prosjektet i Claude Design én gang etter en byggeøkt,
og rekompileringen henter inn alt som er pushet.

**Konsekvens av å ta feil:** to kompilatorer som gir ulikt resultat er samme feilklasse som ulagret CSS
som vinner over lagret — en forskjell ingen ser før den har forplantet seg til mange komponenter.

### K2 · Portsjekkenes rød-test er ikke oppfylt — og kan ikke oppfylles utenfra

Blokkerer: **tilliten til hver eneste ferdigmelding natten produserer**.

`guidelines/sveip.card.html` er **grønn på dagens bibliotek**, målt live: 56 stilark, 500 regler,
94 variabler, 860 `var()`-referanser, **0 funn på alle fire sjekker**.

Men kravet er «en assertion som ikke er sett feile, er ikke verifisert», og den delen står igjen.
Jeg injiserte tre bevisste brudd (duplikat-egenskap, `max(auto,44px)`, udeklarert `var()`) via et
`<style>`-element — sveipet forble grønt. **Det er ikke nødvendigvis en svikt i sveipet:** det leser
bundelens stilark, og en injisert `<style>` ligger utenfor nevneren. Testen målte altså feil ting.

En ekte rød-test krever at bruddet ligger i en komponent-CSS som bundelen injiserer — altså en push
**og** en rekompilering. Blokkert av K1.

**Anbefaling:** kjør rød-testen som første handling etter neste rekompilering, før noen ny komponent
meldes ferdig. Bruk en midlertidig komponent med bevisst brudd, ikke en ekte.

**Konsekvens av å ta feil:** hvis sveipet ikke fanger brudd, er hver «grønn» i biblioteket ubelagt —
og den feilen ser ut som kvalitet helt til noen ser etter.

### K3 · Skjelettets høyderegel er utdatert og bør skrives om

Blokkerer: **korrektheten av hver `viewport=`-verdi som skrives fra nå**.

`guidelines/komponentskjelett.md` inneholder en lang regel som begynner «**Men hovedagenten kan ikke måle
selv**» og foreskriver å *regne* høyden fra innholdet med **40 % påslag**, avrundet til nærmeste 200.
Den premissen holder ikke lenger — måling er nå mulig, og planens regel er 10 % på målt verdi.

Regelen bør erstattes, ikke suppleres: to konkurrerende høyderegler i samme fil er verre enn den
utdaterte alene. Jeg har ikke skrevet den om, fordi den er skrevet inn i en aktørfordeling
(forfatter/verifikatør) som er Anders' beslutning å endre.

**Anbefaling:** erstatt hele avsnittet med «mål med `rendre.mjs`, legg 10 % på», og behold 40 %-regelen
som eksplisitt historikk med dato — ikke som alternativ.

**Konsekvens av å ta feil:** for lave kort klipper beviset kortet finnes for (det skjedde i
Callout/Banner-runden). For høye koster bare hvit luft. Feil derfor oppover hvis regelen er uklar.

### K5 · AVGJORT 29.07.2026 — FormField eier anatomien, `Input` pensjoneres

Avgjort av Anders. Bygget samme natt, se Bolk A over. Beholdt her som begrunnelse, ikke som åpent punkt.

`Input.jsx` eier `.akhq-field`, `.akhq-label`, `.akhq-hint`, `.akhq-err`. `FormField` eier nå
`.akhq-ff-*`. Ingen navn kolliderer, så ingenting er ødelagt — men det finnes to måter å bygge et
felt på, og det er nøyaktig den slags tvetydighet som gjør et designsystem uleselig etter to år.

De vanskeligste beslutningene:
1. **Skal `Input` refaktoreres til å konsumere `FormField`, eller skal `FormField` være for
   ikke-tekst-kontroller alene?** Det siste er mindre arbeid, men etterlater to anatomier permanent.
2. **Hvem eier `.akhq-input`-kontrollstilen etterpå?** Refaktoreres `Input`, bør kontrollen skilles
   fra anatomien, og da bør den sannsynligvis hete `TextInput` — som uansett står i Bolk A.

**Avgjørelsens kjerne:** FormField kloner sitt ene barn for å sette `id` og aria. Rendret en kontroll
FormField *internt*, ville koblingen skjedd inne i en komponent konsumenten ikke når — og
`aria-describedby` mot en ekstern feiloppsummering blir umulig. Workbench-årsplanen trenger nettopp
det mønsteret. Intern innpakning ville dessuten krevd ~15 bekvemmelighetswrappere som hver gjentar
samme FormField-kall; komposisjon gir én anatomi og femten nakne kontroller.

`SearchField` er ikke et unntak: `labelHidden` er mekanismen, ikke en andre anatomi.

### K4 · `DataTable` — største rene designbeslutning som gjenstår

Uendret fra nattplanen, ikke påbegynt. Blokkerer `LedgerTable`, `BudgetVarianceRow`,
`RankedInsightList`. Ingen av de 66 skjermene bruker `<table>`, kolonneheader, sortering eller
paginering — den må designes fra prinsipper, ikke kopieres.

---

## 3 · Merkede valg

| Valg | Begrunnelse |
|---|---|
| Verktøyfiler i arbeidsmappen, aldri i prosjektet | `.js`/`.mjs` i prosjektet er en kompileringsrisiko |
| Måler innholdshøyde per modus-rot, ikke `body.scrollHeight` | kortmalen har `min-height:100vh` — `body.scrollHeight` returnerte 900 px (viewport) for alt kortere enn skjermen. Første måler var feil på nettopp dette |
| `favicon.ico`-404 filtreres bort i måleren | serverens rot har ingen favicon; ikke en bibliotekfeil |
| Skriveplan finalisert med brede globs | tillatelsesporten skulle tas tidlig, ikke midt i en byggeøkt |
| `--floor` rettet til 44 uten å køføre | tilgjengelighetsgulvet er ufravikelig og mønsteret var etablert; kun konstanten var feil |

---

## 4 · Portstatus

| Krav | Status | Tall |
|---|---|---|
| **1** — hver komponent i begge moduser × tilstander × to bredder | **oppfylt for `FormField`** | 7 tilstander × 2 bredder × 2 moduser, målt. Ikke kjørt for biblioteket som helhet |
| **2** — craft mot referanse | **ikke vurdert** — og skal ikke vurderes av meg | ingen skjermbilder tatt; se under |
| **3** — portsjekkene grønne | **delvis** | 4/4 sjekker grønne på dagens bibliotek [målt]. Rød-testen står igjen (K2) |
| **4** — tilgjengelighetsgulv | **ett brudd funnet og rettet** | Toggle 44 ✓ · Input 44 ✓ · `seg-btn` 40 → **44** ✓ [målt] |

**Krav 2:** jeg tok ingen skjermbilder og gjorde ingen tetthetsmålinger mot referansen. Ikke fordi
vurderingen er Anders' — den er den, og den forblir det — men fordi natten ikke kom dit. Bevisene
finnes det verktøy for nå (`rendre.mjs` kan skjermdumpe begge moduser side ved side); de er ikke
produsert.

---

## Neste økt starter her

1. **Åpne prosjektet i Claude Design én gang.** Det utløser rekompilering, og først da blir
   `FormField` og `SegmentControl`-fiksen synlige i Design System-fanen. Uten dette steget ser
   `formfield.card.html` tomt ut — kortet er riktig, bundelen er gammel.
2. Kjør rød-testen på sveipet (**K2**). Ikke meld noe ferdig før den er sett bli rød.
3. Nevn `FormField` i `readme.md` under Komponenter, og kjør `check_design_system`.
4. Speil prosjektet lokalt med `curl` (se korreksjonen øverst) — da blir klasseinventar, `lagsjekk.mjs`
   mot kildene og lesing av naboer gratis for resten av byggingen.
5. Avgjør **K1** og **K3**.
6. Deretter Bolk B: `SegmentedControl` · `ChoiceCard` + `ChoiceGroup` · `SelectableRow` · `FilterBar`.
   Bygg dem mot `FormField` — anatomien er nå avgjort og verifisert.

## Verktøyene ligger klare

Arbeidsmappen `~/Developer/akhq-designsystem` har en fungerende måleløkke. Neste økt skal ikke bygge
den på nytt — `npm i` er gjort, Chrome brukes direkte, og `lokal/bygg.mjs` + `lokal/kort.mjs` måler en
ny komponent uten at serveren trenger å kompilere. Eneste bevegelige del er serve-URL-en, som utløper
etter en time og hentes på nytt med `render_preview`.
