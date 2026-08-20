# PROSESS — arbeidsregler inne i Claude Design

> **Gjelder ikke kodeporten.** Ingenting i dette dokumentet skal leses som en produktspesifikasjon. Det beskriver hvordan vi skriver, måler og verifiserer designsystemet i Claude Design. Skal du portere en skjerm til kode, les `PORT-README.md` og `DESIGN-FASIT.md` — ikke denne.

## Målings- og verifiseringsregler
- **Verifisering krever bekreftet render etter reload — VERIFIKATØRENS regel (bindende, 28.07.2026, rolleavklart s.d.):** ingen måling, ingen tabellverdi og ingen «verifisert»-påstand uten at siden er lest på nytt etter en fersk hent av `_ds_bundle.js`. Førstegangsvisning har servert utdatert bundle i hver runde under steg 7 — en måling mot gammel bundle er ikke svakere bevis, den er verdiløs.

  **Aktør: verifikatøren, alene.** Forfatteren kan ikke reloade preview (`show_html` er sperret for selvinspeksjon, `eval_js_user_view` treffer ikke en nyskrevet fil), og skal derfor **ikke** fremsette målepåstander i det hele tatt — verken om høyde, containerbredde, kontrast eller rendret utfall. Forfatterens del av regelen er: oppgi beregnede verdier som beregnede, og be verifikatøren måle. Se ROLLEFORDELING nedenfor.

  **Sett høyden åpenbart romslig og få den strammet inn med et målt tall.** Forfatteren kan ikke måle en nyskrevet side, så et tall som *sikter* på riktig høyde er en gjetning uansett hvor nær den treffer — fire runder 28.07.2026 gikk på nettopp det. Et for høyt kort har blank flate nederst; et for lavt klipper innhold, og det som klippes er typisk det sist tilføyde, altså poenget med rundens endring. Overslag først, presisjon fra verifikatørens måling.

**Endres innholdet i samme operasjon som høyden rettes, er den forrige målingen per definisjon utdatert.** Feilen ble gjort tre ganger 28.07.2026: høyden ble satt fra en måling tatt før avsnittene som utløste rettelsen ble lagt til, så kortet ble for lavt i motsatt retning og nettopp den nye teksten falt utenfor. Rett **enten** høyden **eller** innholdet i én operasjon — aldri begge — eller be om ny måling etter den siste innholdsendringen.
- **Spesimenkort for komponenter som legger om (bindende, 28.07.2026):** kortet skal vise minst **to containerbredder**, stakket under hverandre, hver i egen wrapper med eksplisitt bredde og mono-etikett som oppgir bredden — én bred (~860 px, AgencyOS hovedspalte) og én smal (430 px, PlayerHQs kolonnebredde). Aldri sidestilte halvdeler: 430 px er en ekte bredde, men en komponent som legger om kan ikke verifiseres i én bredde alene. **Port A-krav 1 lyder dermed:** begge moduser × alle tilstander × minst to containerbredder, for enhver komponent som legger om. Gjelder nå PageHeader; vil gjelde ListRow, KpiStripe, DataTable og hele kalenderfamilien. **Restanse:** KpiCard, KpiStripe, ListRow og StatusBadge har interne viewport-media som skal over til container query — gjøres sammen med template-omskrivingen sist i steg 7, ikke som egen runde. De er blader: hybriden rammer bare dem selv til de rettes. **Panel var ikke på den listen og ble rettet umiddelbart (28.07.2026)** — den er avhengigheten under alt annet, så en viewport-hybrid der arves av hver komponent som bruker den.

  **Nevneren er komponenter, ikke kort.** Port A-krav 1 gjelder komponentene i dekningsmatrisen. Kort under gruppen **Prosess** dokumenterer regler, målinger og planer — de viser ingen komponenter, og er derfor **ikke omfattet** av kravet om begge moduser. Unntaket skrives her fordi regelen var formulert for «hver komponent» uten å si hva et prosesskort skulle gjøre, og fravær av mørk modus på et slikt kort da leses som restanse i stedet for som bevisst grense.
- **`var(--x, verdi)`-fallbacks er lagarkitekturen — de skal ALDRI «ryddes bort» (bindende, 28.07.2026).** `padding: 0 var(--pad-x, 14px)` ser ut som defensiv koding, men er hvordan lagmønsteret leverer basisverdien: **base-laget setter verdien via fallbacken, modifikatorer overstyrer ved å deklarere variabelen.** Fjerner en senere opprydding «unødvendige» fallbacks, slettes alle basisverdier på én gang — og **ingen av de tre stille-død-sveipene fanger det**: referansen er fortsatt deklarert i modifikator-laget, den har bare ingen verdi i base-tilfellet. Mønsteret gjelder `--pad-x`, `--h`, `--flow`, `--cols`, `--pad`, `--just`, `--fam`, `--fs`, `--bgc` og resten av variabelplumbingen. Ser du en fallback som virker overflødig: den er der med hensikt.
- **En støyende sjekk beskytter ingenting (bindende, 28.07.2026).** `finnUdeklarerte()` flagget først 45 gyldige tokens fordi deklarasjonsmengden ble lest fra `styles.css` alene — som er 111 tegn og bare inneholder to `@import`. **45 falske positiver er verre enn ingen sjekk:** larmen får ekte funn til å bli oversett, mens sjekken ser ut som den beskytter. Samme feilklasse som Port A-krav 1 før dekningsmatrisen — **feil nevner**. Enhver sveip-sjekk skal derfor selvtestes mot en kjent ren mengde før den tas i bruk, ikke bare mot en kjent feilende.
- **Mål den resolverte tilstanden, ikke kilden (bindende, 28.07.2026).** Tre feil i samme sveip hadde samme årsak: de målte en **mellomrepresentasjon** — kildetekst (`styles.css` alene ga 0 tokens), regelobjekter (`CSSImportRule.cssText` er bare importlinjen), arklister (`document.styleSheets` manglet arket ennå, `cssRules` kastet mens det lastet) — i stedet for det som avgjør oppførselen. `getComputedStyle(document.documentElement)` er riktig svar av presis den grunnen: den leser hva nettleseren faktisk kom frem til, uavhengig av arkstatus, og kan ikke kaste. Gjelder alle sjekker: spør nettleseren om utfallet, ikke kilden om intensjonen.
- **Et måleinstrument må kunne skille sin egen svikt fra det den måler (bindende, 28.07.2026).** Tre varianter av samme feil i én økt: måleriggen som meldte grønt uten å ha målt noe, gulv-assertionen som ikke *kunne* bli grønn fordi den flagget base-standarden, og det røde kortet som pekte på Chip mens feilen låg i en ustale bundle. En sjekk som ikke kan bli rød beviser ingenting; en som ikke kan bli grønn er like verdiløs; en som ikke kan si «jeg virker ikke» sender feilsøkingen til feil komponent. Krav til enhver sjekk som porter et steg: (1) en kjent feilende variant, (2) et oppnåelig grønt utfall, (3) en selvtest som skiller instrumentsvikt fra funn — og `ok` skal være **false** når instrumentet ikke målte noe.
- **Innstramming av korthøyde skjer bare i en tur der ingenting annet endres (bindende, 28.07.2026).** Seks forekomster viste at «rett enten høyden eller innholdet» ikke holder som husket regel — den krever årvåkenhet midt i en annen oppgave, og feiler derfor systematisk. Mekanisk i stedet: legges det til innhold, står `viewport` **urørt** til neste tur. Kontrollspørsmålet er da svarbart før turslutt uten å huske noe: «endret jeg mer enn høyden?» Er svaret ja, er høydetallet fra forrige måling per definisjon utdatert.
- **Berøringsgulvet kan bare nulles der elementet er ikke-interaktivt (bindende, 28.07.2026).** `--floor: 0` er legitimt på `Chip --static` fordi den er `cursor: default` — en etikett, ikke et treffmål. WCAG 2.5.5/2.5.8 gjelder treffmål, ikke alle bokser. Men nullingen er koblet til betingelsen som **assertion**, ikke merknad: ethvert element med `--floor: 0` må mangle href, aktiverende rolle, `tabindex ≥ 0`, `cursor: pointer` og interaktiv tag (`guidelines/gruppe1-tilstander.card.html`, `window.__floorAssert`). Uten assertionen er `--floor: 0` en fri variabel neste person griper for å få tettere rader, og underskridelse av touch-minimumet blir arkitektonisk mulig — samme resonnement som gulvet selv.
- **Utløsere må videresende ref (bindende, 28.07.2026).** Enhver komponent som kan være utløser for et overlay — `Button`, `Chip`, senere `ListRow`-haler — skal være `React.forwardRef` og sende ref til sitt DOM-element. Uten det får `useOverlayLayer` ingen node å returnere fokus til, og fokus faller til `<body>` ved lukking: kontraktens punkt 5 og 10 svikter stille, med bare en React-advarsel i konsollen. `Button` ble konvertert av nettopp den grunnen.

## ROLLEFORDELING FOR REGLER
Bindende 28.07.2026. **Hver regel skal si hvem som kan utføre den.** En regel tildelt en aktør som ikke kan utføre den, feiler hver gang og ser ut som slurv — vi hadde to slike (reload-kravet og høydemålingen), og begge produserte gjentatte «feil» som i realiteten var umulige krav.

To aktører:

- **Forfatter** — skriver komponenter, kort og dokumentasjon. Kan lese filer, regne, resonnere om kode, kjøre `check_design_system`. **Kan ikke:** se rendret output, måle piksler, reloade preview, vurdere optisk tetthet, sammenligne mot referanse visuelt.
- **Verifikatør** — kjører etter hver leveranse med tilgang til rendret side, DOM, `getComputedStyle`, `scrollHeight` og skjermbilde. **Kan ikke:** endre kildekode.

Klassifisering av dagens regler:

| Regel | Aktør | Merknad |
|---|---|---|
| Token-, farge-, type- og språkregler | forfatter | kildekode-lesbart |
| Lagmønster, container queries, enhetsvalg, gulv med `max()` | forfatter | kodebeslutninger |
| Fokuskontrakt (markup + handlere) | forfatter | at kontrakten *virker* med tastatur: verifikatør |
| Terskelberegning i `.prompt.md`-tabell | forfatter | oppgis som **beregnet** |
| Terskelen *fyrer* som spec sier | verifikatør | `terskelrigg.html` + `?selvtest` |
| `@dsCard`-høyde | forfatter regner + 40 %, verifikatør måler | se `komponentskjelett.md` |
| Reload før måling | verifikatør | forfatter kan ikke reloade |
| Kontrast, modus-paritet, klipping | verifikatør | krever render |
| **Port A-krav 2 — craft mot referanse** | **verifikatør, alene** | se nedenfor |

**Port A-krav 2 er verifikatørens alene.** Squint-test, optisk tetthet, rytme og sammenligning mot referanse-HTML krever at noen ser rendret output side om side. Forfatteren kan ikke det, og skal **aldri** melde kravet oppfylt — heller ikke som «ser riktig ut» eller «følger referansen». Forfatteren leverer med begrunnede verdier; kravet krysses av av verifikatøren mot rendret utfall, eller av eier. Meldes Port A grønn på forfatterens ord, er den grønn på en påstand ingen kunne belegge.

**Ved ny regel:** skriv aktøren i samme setning. Kan ingen av de to utføre den, er den ikke en regel — den er et ønske, og hører i `kart/` som åpent punkt.

## KASKADELAG OG MODIFIKATORER
Bindende 28.07.2026. Lagrekkefølgen er deklarert én gang, i `styles.css`:

```css
@layer akhq-base, akhq-container, akhq-modifier;
```

Hver komponents CSS gjentar setningen defensivt (samme navn, ingen effekt hvis rekkefølgen alt er satt) og legger reglene i riktig lag:

- **akhq-base** — normaltilstanden. Egenskaper som varierer, deklareres som custom properties og *brukes én gang*: `.akhq-panel{--pad-x:18px;padding:var(--pad-t) var(--pad-x) var(--pad-b)}`.
- **akhq-container** — `@container`-regler, og annen automatisk tilpasning til omgivelsene (`pointer: coarse`, `prefers-reduced-motion`). De endrer **bare variabler**, aldri egenskapen selv.
- **akhq-modifier** — `--sm`, `--flush`, `--bleed`, tone- og tetthetsvarianter. Vinner over container-laget uansett kilderekkefølge, uten spesifisitetstriks.

**Prinsippet bak lagrekkefølgen (bindende, generelt):** *et eksplisitt forfattervalg slår en automatisk tilpasning.* Har noen skrevet `density="sm"` eller `flush`, er det en beslutning — containerbredden skal ikke overstyre den. Automatikk fyller ut det ingen har bestemt; den overprøver ikke det noen har bestemt. Gjelder alt fremover: ListRow (`density`), KpiStripe (kolonner), og hele kalenderfamilien, der samme spørsmål kommer for hver visning og hver granularitet.

**Unntaket: tilgjengelighetsgulv slår begge.** Touch-minimum (44px), kontrastminimum og synlig fokusring er ikke tilpasninger og ikke valg — de er gulv, og de skal ikke kunne underskrides av en modifikator. Ligger 44px-målet som en vanlig verdi i container-laget, kan modifikatorlaget vinne over det, og underskridelse blir arkitektonisk mulig. Skriv gulvet inn i egenskapen med `max()`, ikke som en konkurrerende verdi:

```css
/* base */    .akhq-lrow{--row-min:56px;--floor:0px;min-height:max(var(--row-min),var(--floor))}
/* container */ @media(pointer:coarse){.akhq-lrow{--row-min:60px;--floor:44px}}
```

Da holder gulvet uansett modifikator, og større eksplisitte verdier virker fortsatt. Samme grep for kontrast og fokusring: gulvet skal være uunngåelig, ikke bare dokumentert.

**Skjelett:** nye komponenter kopieres fra `guidelines/komponentskjelett.md` — lagdeklarasjon, container-wrapper, variabelmønsteret, tilstandsstubber, `.d.ts`- og `.prompt.md`-mal og kortkravene ligger ferdig der. Reglene skal være standardtilstanden, ikke noe som sjekkes i etterkant.

Bakgrunn: container-regel mot modifikator på samme egenskap er en reell feilklasse, ikke en teoretisk. Panel hadde den — container-regelen slo av `flush` under 480px og ga 32px dobbelt innrykk, men **bare i PlayerHQs smale spalte**, så uten to-bredders-kravet i Port A ville den gått rett i hvert PlayerHQ-panel. Samme kollisjon ligger latent i ListRow (`density`), KpiStripe (kolonner) og PageHeader (`gap`).

`:not(.modifikator)` er **ikke** løsningen: den fikser instansen, ikke klassen, og vokser til uleselige kjeder ved tredje modifikator. Kalenderfamilien får flest modifikatorer av alle — den skal arve lagene, ikke kjedene.

**Bivirkning å kjenne: lagrede regler taper mot ALLE ulagrede regler, uansett spesifisitet.** Denne feilklassen rammet tidligere de eldre komponentene (datafamilien, overlays, actions, forms), som var ulagret. `EmptyState` traff dette: `.akhq-empty` fantes i `viz.jsx`, og komponentens polstring kom aldri til anvendelse. Derfor er navnekollisjonssjekken i `guidelines/komponentskjelett.md` et oppslag i `guidelines/klasseinventar.md` — **generert fra `_ds_bundle.js`**, ikke skrevet for hånd. Det gjelder hvert enkelt klassenavn, elementklasser inkludert: `.akhq-tabs` var ledig mens `.akhq-tab` var okkupert av `TabBar`, og Tabs mistet understreken sin stille. Inventaret regenereres i verifiseringssteget, så det aldri er eldre enn siste kompilering. **Status 29.07.2026 (før dagens rettinger): 350 klassenavn, 0 ulagrede** — lagmigreringen er fullført. Dagens rettinger fjerner 6 klassenavn (`Input` slettet: `.akhq-field`, `.akhq-label`, `.akhq-input`, `.akhq-input--error`, `.akhq-hint`, `.akhq-err`) og legger til 1 (`.akhq-crumb-a` på Breadcrumbs) — **beregnet** netto 345/0, ikke målt på nytt i denne turen (bundelen kompileres ved turslutt). Kjør skriptet i `guidelines/klasseinventar.md` på nytt neste tur for å bekrefte.

**Feiing utført 28.07.2026:** alle tio komponenter bygget i steg 7 (Panel, Avatar, StatusBadge, SectionLabel, ListRow, ListGroup, PageHeader, Callout, Banner, EmptyState) er grepet mot de 46 ulagrede klassenavnene i de eldre filene. Resultat: **ingen kollisjoner** utover `.akhq-empty`, som er rettet til `.akhq-estate`.

**Rekkefølge for halen av Fase A (korrigert 28.07.2026):** ConfirmDialog → **lagmigrering** → template-omskriving → **Port A-krav 2** → Familie 2.

**Port A-krav 2 (craft-måling mot referanse-HTML) er et eget steg etter template-omskrivingen.** Den kan ikke akkumuleres fra komponentrapportene — ingen av dem inneholder craft-godkjenning — og den er **verifikatørens alene**, siden squint-test og tetthetsvurdering krever at noen ser rendret output. Den er aldri utført av noen som kunne se den: re-målingen etter feil-fil-korreksjonen ble gjort av forfatteren, så kravet er **uoppfylt**, ikke oppfylt-og-korrigert. Plasseringen er ikke vilkårlig: etter omskrivingen er biblioteket komplett og lagdelt, og templatene er bygget av ekte komponenter — det er første tidspunkt en sammenligning mot referanse-HTML måler systemet og ikke et halvferdig utvalg. Porten kan ikke meldes grønn før dette steget er kjørt av verifikatør.

**Migrering av de ulagrede filene — egen leveranse, ikke et sveip.** 174 av 302 klassenavn er ulagrede: lagarkitekturen styrer ti komponenter av rundt førtifem, så kaskademodellen over er i mindretall i sitt eget bibliotek. Planen, omfanget og verifiseringskravene ligger i **`kart/lagmigrering.md`**. Kjøres **etter Familie 1, før Familie 2** — hver skjemakomponent bygget før migreringen arver en kaskade der halve biblioteket kan overkjøre den. `KpiCard`, `KpiStripe` og `StatusBadge` sine viewport-hybrider følger med i samme leveranse.

**Hvilke filtyper kompilatoren konsumerer** står i `guidelines/kompilerte-filtyper.md` — kartlagt, ikke gjettet, etter at en løs `.js` i `guidelines/` knakk hele bundelen. Kort: `.jsx`/`.d.ts`/`.css`-importkjeden/`@dsCard`-`.html` leses; `.md` og `.html` uten `@dsCard` gjør det ikke, og er derfor stedet for skript og rigger., sammen med `StatusCircleRow`, `Chip`, `Button`, `SegmentControl`, `Toggle`, `Modal`, `Toast`, `GoalProgress`, `PercentileGauge`. Først da er feilklassen borte. Uten dato ville den ligget åpen gjennom hele Familie 2 og 3.

## Skjerm- og malbeslutninger
**Skjermregel (28.07.2026):** en komponent kommer på en eksempelskjerm fordi jobben på skjermen krever den — aldri for å vise fram biblioteket. PersonalBest, scoretrend og SG-nedbrytning er derfor ute av «I dag» (PB er et øyeblikk, ikke en status: den hører hjemme ved øktavslutning, ukeslutt eller i Min golf; trend og SG hører til Analyse-fanen). Statuschips uten handling er ute av AgencyOS-dashboardet. Nye skjermer bygges etter samme test: hva er jobben, hva kreves for å gjøre den, resten ut.

Steg 5-beslutninger: eksempelskjermene er Design Components (`.dc.html`), ikke `ui_kits/`-mapper — det er formatet konsumerende prosjekter kan kopiere og redigere direkte. Tema settes på `document.documentElement` og lagres per flate (`akhq-theme-agencyos` / `akhq-theme-playerhq`); Topbar er kontrollert (theme som prop). Alle stiler er inline på token-nivå; den eneste `<style>`-blokken i hver mal er body-reset, lenkefarger og de tre bruddpunktene (`[data-rsp]`, `pointer: coarse`), som ikke kan uttrykkes inline. Tweaks per mal: `dataState` (fylt/laster/tom/feil for alle dataregioner), én layout-bryter, `initialTheme`.
