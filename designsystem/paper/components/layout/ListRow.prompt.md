ListRow er én rad i én liste. Den rendres som `<li>` og **må** ligge i en `ListGroup` — gjør den ikke det, advarer komponenten i konsollen ved montering: uten gruppen finnes ingen container, container-spørringene treffer aldri, og raden rendrer bredt i en smal spalte. Samme feilmodus som flush-buggen — usynlig på desktop, feil i hver PlayerHQ-kolonne. Derfor håndhevet i kode, ikke bare dokumentert.

```jsx
<ListGroup label="Trenger øye">
  <ListRow leading="avatar" avatar={{name:"Emma Berg"}} title="Emma Berg"
    meta="Wedge 40–70 m · avvik siste tre runder"
    trailing="value" value="▲ +1,4" href="#emma" dataOdId="stall-emma" />
  <ListRow leading="status" status="done" title="Testprotokoll · Jonas" meta="Godkjent 08:14" />
</ListGroup>
```

## Bindende: raden ELLER halen er interaktiv — aldri begge

`<button>` inne i `<a>` er ugyldig HTML og ødelegger tastaturnavigasjon: tabben treffer to mål i samme rad, og skjermleseren annonserer raden som lenke med en knapp inni. Derfor er dette to radtyper:

- **Navigasjonsrad** — `href` eller `onClick` på raden. Halen må være passiv: `chevron`, `value`, `badge` eller `none`.
- **Kontrollrad** — `trailing="toggle"` eller `"action"`. Raden er en `<div>` uten `href`/`onClick`; kontrollen er eneste tab-stopp.

Sendes begge, logger komponenten en advarsel og dropper radens interaktivitet. AgencyOS-innstillingene har chevron-rader og toggle-rader om hverandre i samme liste — det er to typer i én gruppe, ikke én rad med to props. Ikke løs det med `onClick` på tittelen heller.

## Leading og trailing er lukkede unioner

- `leading`: `avatar` | `status` | `icon` | `none`. Alle er 36px, så rutenettet `36px minmax(0,1fr) auto` holder på tvers av rader i samme gruppe. `status` er statussirkelen som tidligere lå i StatusCircleRow — den komponenten er pensjonert inn hit.
- `trailing`: `chevron` | `value` | `badge` | `toggle` | `action` | `none`. Ingen vilkårlige noder — over 30 skjermer er det nettopp den friheten som får rader til å drifte. Trengs en hale som ikke finnes i unionen, utvides unionen her, i biblioteket.
- Kombinasjonen `leading="avatar"` + `titleBadge` (kategori) + `trailing="value"` (måltall) er stall-radens mønster. Bruk den, ikke en ny variant.
- Avataren settes automatisk `decorative` — navnet står som synlig tekst i tittelen.
- `trailing="action"` gir én ghost-knapp i `sm`. To handlinger i en rad finnes ikke; er det to, hører de i en DropdownMenu eller på en detaljside.
- **Container-terskelen er 420px, ikke 380 og ikke 430.** Spørringen måles mot `.akhq-lgroup`, ikke mot spalten. Forfedrenes bidrag er et **intervall, ikke et tall** — regnet fra Panels faktiske CSS, i en 430px kolonne:

  | Panel-konfigurasjon | Trekk fra | Gruppebredde | Under 420? |
  |---|---|---|---|
  | `md` (container ≤480 → `--pad-x:16`) | 2 + 32 | 396 | ja, fyrer |
  | `sm` (`--pad-x:16`) | 2 + 32 | 396 | ja, fyrer |
  | `flush` (body beholder `0 18px`) | 2 + 36 | 392 | ja, fyrer |
  | `flush` + `bleed` (body-polstring 0) | 2 | 428 | **nei** |
  | ingen Panel (gruppen direkte i spalten) | 0 | 430 | nei |

  Merk at `flush` ikke er innrykksløst: `--pad-x` blir 0 på panelet, men `.akhq-panel--flush .akhq-panel-body` legger tilbake `0 18px` — det er `bleed` som fjerner det siste.

  **Tabellen over er assertert, ikke bare regnet:** alle sju konfigurasjonene ligger i `guidelines/terskelrigg.html` og feiler synlig hvis en polstringsendring flytter en av dem over terskelen.

  **`flush` + `bleed` og naken gruppe faller bevisst utenfor.** Da har radene den fulle spaltebredden og trenger ikke den strammere polstringen; tilpasningen finnes for rader som allerede er klemt av et panel. Dette er et dokumentert utfall, ikke en glipp — ikke «rett» terskelen til 430 for å fange dem.

  Med 380 fyrte tilpasningen aldri i noen panel-konfigurasjon i 430px-kolonnen. Samme feilklasse som `3vw → 4cqi`, ett nivå dypere: terskelen var satt mot kolonnebredden, mens spørringen måler gruppen inne i panelet. Regn alltid terskelen mot elementet som faktisk *er* containeren — og mot hele intervallet av forfedre den kan ha.
- **Touch-gulvet er uunngåelig:** `min-height: max(var(--row-min), var(--floor))`, der `--floor` er 44px under `pointer: coarse`. En modifikator kan gjøre raden høyere, aldri lavere enn 44px.
