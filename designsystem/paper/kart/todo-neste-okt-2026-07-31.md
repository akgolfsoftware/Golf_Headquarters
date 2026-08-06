# TODO — neste økt (skrevet 31.07.2026, kveld)

**Dekning ved skriving: 8/223 · 90/151.** P7 (craft) er utestående for alt under og kan kun
lukkes av eier. Ingenting her er craft-vurdert.

---

## 0 · BLOKKER — må gjøres først, alt annet henger på den

- [ ] **Kompiler `_ds_bundle.js`.**
      Verifisert to økter på rad: `check_design_system` finnes **ikke** som verktøy i Claude
      Code-økta. Bundelen regenereres kun av appens egen selvsjekk, utløst fra Claude
      Design-flaten. Dette må altså gjøres derfra — det er ikke noe en agent kan omgå.

      Slik vet du at det faktisk skjedde (ikke stol på magefølelsen):
      - etag på `_ds_bundle.js` skal IKKE lenger være `1785476653578834`
      - `akhq-dt`, `akhq-fpill`, `akhq-pag`, `akhq-step`, `akhq-kan` skal gå fra 0 til > 0 treff
      - `akhq-css-cmb` skal gå fra 0 til 1 treff, `akhq-css-cb` fra 4 til 2

## 1 · Mål de tre kortene på nytt — først da er tallene bekreftet

Alle tre er hittil kun målt mot **kilden** gjennom en injeksjonsrigg, aldri mot kompilatet.
Rapporter det målte tallet, aldri det forventede.

- [ ] `components/forms/forms-p2.card.html` — forventet 17/17 (står 16/17 i prosjektet nå)
- [ ] `components/data/datatable.card.html` — forventet 14/14 (rendrer tomt nå)
- [ ] `components/layout/struktur-p3.card.html` — forventet 23/23 (rendrer tomt nå)

## 2 · Rydd opp i det som venter på kompileringen

- [ ] **Kjør `guidelines/terskelrigg.html` og bekreft at ventelista er tom.**
      Riggen har fått de fem nye tersklene (`akhq-dt` 560 · `akhq-fpill` 420 · `akhq-pag` 380 ·
      `akhq-step` 520 · `akhq-kan` 320). De står på VENTELISTE og gjør `__OK = false` så lenge
      komponentene mangler i bundelen. Etter kompilering skal ventelista tømme seg selv og
      riggen gå fra 23 til **38 assertions**, alle grønne, dekning ok på 11 komponenter.
      Ingen endring i fila skal være nødvendig. Kjør også `?selvtest` og `?selvtest=dekning` —
      begge skal gi `__OK === false`.

- [ ] **Regenerer `guidelines/klasseinventar.md`.**
      Den har nå to lister: 533 målte navn fra bundelen + 55 navn lest fra kilden for de fem
      nye. Etter kompilering skal skriptet gi **588 navn, 0 ulagrede**, og de to listene slås
      sammen til én målt liste. Slett da hele seksjonen «Ikke i kompilatet — bølge P3».

## 3 · Bygg hi-fi 10 — liste+detalj-malen

- [ ] Ikke påbegynt. Var betinget av at DataTable finnes i bundelen; den gjør den ikke, så en
      mal bygget nå ville rendret tomt og løftet dekningen 8→9 på en blank skjerm.
      Dekker ~30 PlayerHQ-ruter og er første skjerm som kan bruke DataTable.
      **Start denne først når punkt 0–2 er grønne.**

---

## Venter på eier — ikke agentens beslutning

- [ ] **`TabSet` (K8): pensjoner navnet, eller gi det et eget mandat.**
      `components/navigation/Tabs.jsx` + `TabPanel` gjør allerede jobben (role="tablist",
      roving tabindex, count per fane, dokumentert grense mot SegmentControl). Enten strykes
      TabSet fra restansen — og nevneren 151 går ned med én — eller så må det stå skriftlig hva
      TabSet skal gjøre som Tabs ikke gjør.

- [ ] **`ListGroup` styler `.akhq-lrow-item`, som `ListRow` rendrer.**
      «Style aldri en annen komponents element fra egen fil» er bindende, men readme sier også
      at «gruppen eier skillelinjene». De to reglene står mot hverandre. Ingen stille feil i dag
      (begge filer er lagret), men spenningen bør avgjøres — ellers løses den av den neste som
      leser bare den ene regelen.

---

## Rør ikke

`kart/wf/` · TimeGrid · de 47 foreldreløse komponentene · de ni **[natt]**-beslutningene · K2 ·
`BarnProgresjonKort` · `DeltakerListe` · `FokusSpillerBlokk`.

---

## Lærdom fra 31.07 som er verdt å ta med

- **`max(auto, 0px)` er ugyldig CSS.** `max()` tar ikke `auto` — hele deklarasjonen droppes, og
  gulvet forsvinner uten en eneste advarsel. Gulvmønsteret krever en **lengde** i begge ledd.
- **Ettakset overflow-forfalskning er en no-op.** Er én akse `visible` og den andre ikke, regner
  CSS `visible` om til `auto`. En forfalskning må sette **begge** akser.
- **Computed `display` på et flex-element blokkifiseres.** Kilden sier `inline-flex` på
  `.akhq-pag-b`, men computed verdi er `flex`. En terskel-assertion lest ut av CSS-en alene var
  rød mot ekte kode. Mål verdien, ikke les den.
- **En forfalskningstest som ikke er sett gjøre noe, har ikke testet noe.** Første
  forfalskning av P3-tersklene manglet `decodeURIComponent` og injiserte søppel-CSS —
  alt så uendret grønt ut, som om assertionene holdt.
- **Sveipsjekker har lett for å få feil nevner.** Tell alltid hvor mange filer sjekken faktisk
  så på, mot hvor mange som finnes.
