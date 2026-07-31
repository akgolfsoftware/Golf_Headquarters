# Gulvregelen — 44 px treffmål

Skrevet 30.07.2026 (Bolk 0.1). Samler regelen som til nå har levd spredt i
`readme.md` og tre kortfiler. **Denne fila er kanon for gulvet.** Ved konflikt med
en kommentar i en `.jsx` vinner denne.

## 1 · Regelen

Ved grov peker (`pointer: coarse`) skal hvert treffmål være **minst 44 px høyt og
bredt**, målt på **elementet som mottar klikket** — ikke på containeren rundt.

Mekanismen er alltid den samme, og aldri `height: 44px` direkte:

```css
.akhq-x{--h:36px;--floor:0px;height:max(var(--h),var(--floor))}
@layer akhq-container{
  @media(pointer:coarse){.akhq-x{--floor:44px}}
  [data-coarse-test] .akhq-x{--floor:44px}   /* stand-in for riggen */
}
```

Tre grunner til at gulvet er en variabel og ikke en verdi:
1. En modifikator i et senere lag ville ellers vunnet og nullet gulvet stille.
2. `max()` lar den visuelle høyden være mindre enn gulvet der det er riktig.
3. Riggen kan lese `--floor` og se om regelen i det hele tatt nådde elementet.

**`[data-coarse-test]`-stand-inen er obligatorisk.** `pointer: coarse` kan ikke
simuleres i en vanlig nettleser. Uten stand-inen måler riggen base-verdien 0 og
melder falskt brudd — det skjedde for Tabs, ThemeToggle, DropdownMenu og
QuickLinkBar i revisjonen 29.07. Stand-inen skal ligge i **samme lag og med samme
vekt** som media-spørringen, ellers måler den noe annet enn produksjon.

## 2 · Når det synlige er mindre enn gulvet: `::after`-sonen

Er elementet visuelt mindre enn 44 px av gode grunner (en 20-minutters økt i en
tidsakse er 20 px fordi 1 px = 1 minutt), utvides **treffsonen** med `::after` —
den synlige boksen endres aldri:

```css
.akhq-y::after{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);height:max(100%,var(--floor));width:100%}
```

Elementet må ha `position: relative`. Referanseimplementasjon:
`components/calendar/TimeGrid.jsx` — `.akhq-tg-ev` er 20,0 px synlig med en
43,99 px `::after` [målt 29.07 og 30.07]. Andre konsument: `BottomSheet` sitt
dragehåndtak (4 px synlig strek, 44 px sone) [30.07].

**Valget mellom å heve boksen og å utvide sonen:** hev boksen når høyden er
vilkårlig (en knapp), utvid sonen når høyden bærer betydning (tid, en strek, en
markør på en akse). `Button --sm` ble hevet 40 → 44 den 29.07 nettopp fordi
32/40 px var vilkårlig — konsistens med `md` veide tyngre enn å bevare visuellet.

## 3 · `--floor: 0` — når det er lovlig

`--floor: 0px` som **base-verdi** er ikke bare lovlig, det er påkrevd: det er
verdien for fin peker, og media-spørringen hever den.

`--floor: 0px` som **endelig verdi ved grov peker** er lovlig kun på elementer som
ikke mottar klikk — `cursor: default`, ingen `onClick`, ingen tabindex.
Eksempel: `.akhq-chip--static` er en etikett, ikke en knapp.

**Forbudt:** `--floor: 0` som stille mekanisme for å slippe unna gulvet på noe
interaktivt. Det er den feilklassen revisjonen 29.07 fant fire ganger.

## 4 · Unntakslisten — navngitt, med begrunnelse

Et unntak finnes ikke før det står her med navn. Lista er kort med vilje.

| # | Element | Målt | Begrunnelse |
|---|---|---|---|
| U1 | `.akhq-skip` (SkipLink) | **38,9 px** [målt 30.07] | Elementet er `position:absolute; left:-9999px` og blir synlig **kun ved tastaturfokus**. En grov peker kan aldri treffe det — gulvet beskytter ingen. Å heve det til 44 px dytter sidens toppinnhold i det ene øyeblikket brukeren skal orientere seg. Avgjort som unntak, ikke akseptert stilltiende (Bolk 0.2). |
| U2 | Lenker i løpende prosa | varierer | En setning kan ikke ha 44 px linjehøyde. Gjelder `<a>` inne i `<p>`/prosablokker — **ikke** navigasjonslenker, som er treffmål og følger regelen (`.akhq-crumb-a`, `.akhq-qlink-a` er hevet til 44). |

Alt annet under 44 px er et brudd, ikke et unntak.

## 5 · Aktør per punkt

| Punkt | Hvem |
|---|---|
| Skrive `--h`/`--floor`/`max()` i komponenten | komponentforfatter |
| Legge stand-in `[data-coarse-test]` i `akhq-container` | komponentforfatter, samme commit |
| Rendre komponenten i `kart/revisjon-gulv-rigg.html` | komponentforfatter, før lagring |
| Måle og skrive `[målt]`-tallet i `.card.html` eller kartfil | komponentforfatter |
| Legge nytt unntak i tabellen i avsnitt 4 | **kun eier** — et unntak er en produktbeslutning |
| Craft/squint-test (P7) | verifikatør med rendret side |

## 6 · Riggen er en del av regelen

`kart/revisjon-gulv-rigg.html` er måleapparatet. Den refererte en slettet komponent
og viste **tom side i stillhet** — hele apparatet var dødt mens det så levende ut
[funn 30.07]. Derfor:

- Riggen har **selvtest**: `ok` er `false` med mindre den har målt minst 20
  komponenter, funnet minst ett element med `--floor > 0` (regelen nådde frem),
  og sett den innebygde **fasit-negative** kontrollen måle under 44 px.
- Fasit-negativen er en `.rigg-fasitnegativ`-knapp som eksplisitt nuller gulvet.
  Måler den 44, lyver riggen, og `ok` blir `false`.
- Kaster en komponent under render, står feilen i `feil`-objektet og `ok` er `false`
  — den skal aldri kunne avmontere hele roten uoppdaget.

Kjør `window.__mal()` og les `ok` før du melder noe grønt.
