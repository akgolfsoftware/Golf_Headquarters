# 12 · Bevegelse, revidert

Fasit i kode: `tokens/bevegelse.css` og `tokens/samspill.css`.

Gjennomgang 01.09.2026. `bevegelse.css` sier hva bevegelsen skal være, men
sa ingenting om hvordan tilstandene faktisk implementeres — og der lå det tre
feil. Dette kapittelet er ikke en ny retning. Det er den gamle retningen gjort
riktig.

Prinsippet står: **en animasjon skal svare på «hvor kom dette fra» eller «hva
skjedde nå» — aldri på «se her».** Et system som påstår at det måler, kan ikke
oppføre seg som en reklame.

## Det som ble rettet

### 1 · Hover kan ikke settes med JavaScript

Komponentene brukte `onMouseEnter` / `onMouseLeave`. På en telefon utløses
`mouseenter` av et trykk, og tilstanden blir hengende til brukeren trykker et
annet sted. **Mobil 390 er merkets viktigste visning**, så det var feil sted å
ha logikken.

Hover ligger nå i `samspill.css`, bak:

```css
@media (hover: hover) and (pointer: fine) { … }
```

En telefon svarer nei på det spørsmålet. JavaScript kan ikke stille det.

### 2 · Trykket manglet svar

Merket bekreftet trykk med et fargeskift på hover — som altså ikke fantes på
mobil i det hele tatt. Der var det ingen bekreftelse på at grensesnittet hadde
hørt brukeren.

Alt som kan trykkes svarer nå **i det fingeren treffer, ikke når den slipper**:

```css
.ak-trykk:active:not(:disabled) { transform: scale(0.98) }
```

`0.98` er med vilje mindre enn de `0.97` som er vanlig. Merket er et instrument,
og et instrument gir etter litt når du trykker på det — det spretter ikke.
Lenkeknappen (`variant="tekst"`) krymper ikke: den oppfører seg som tekst, ikke
som flate.

### 3 · Snurra brøt løftet om redusert bevegelse

`bevegelse.css` setter alle tre farter til `0ms` under
`prefers-reduced-motion`. Snurra i lasteknappen var en `@keyframes`-rotasjon og
ble ikke berørt — den fortsatte i full fart hos nettopp de brukerne som hadde
bedt om å slippe.

Den pulser nå i stedet for å rotere. Brukeren trenger fortsatt å vite at noe
skjer; rotasjonen er den delen som gir ubehag.

Snurra var også definert på nytt inne i hver knapp som lastet, med en
`<style>`-tagg midt i markupen. Den ligger nå ett sted.

## Det som kom til

**Mobilmenyen og varselet kommer til syne** i stedet for å blinke inn — 220 ms,
`@starting-style`, 8 px forskyvning og opacity. Begge svarer på «hva skjedde
nå». Ingen av dem skalerer fra `scale(0)`: ingenting i den fysiske verden dukker
opp fra ingenting.

Menyen lukkes momentant. Det er med vilje — å avvise noe skal aldri koste tid.

## En uenighet i kilden, ikke rettet

`bevegelse.css` skriver:

> Aldri ease-in alene: det får grensesnittet til å føles tregt i starten.

Kurven filen selv oppgir er `cubic-bezier(0.2, 0, 0.2, 1)`. Det første
kontrollpunktet på `x = 0.2` **er** en ease-in-rampe: kurven bruker de første
20 % av tida på nesten ikke å flytte seg. Det er akkurat det kommentaren advarer
mot, i mildere form.

En kurve som leverer det kommentaren faktisk beskriver, ville vært
`cubic-bezier(0.23, 1, 0.32, 1)` — full fart fra første bilde, lang rolig
utgang.

**Verdien er ikke endret.** `bevegelse.css` er fasit, og en kurve som ligger
under alle tilstander i hele systemet byttes ikke uten at Anders har sagt ja.
Men uenigheten skal stå skrevet et sted, og dette er stedet.

## Det som ble vurdert og avvist

**Tallet i `Talleblokk` skal ikke telle oppover.** Det er den mest fristende
animasjonen i hele systemet, og den mest gale. Tallet er en måling brukeren
leser — ikke en påstand som skal presenteres. En teller gjør et måleresultat om
til en avsløring, og det er nøyaktig den reklamelogikken `bevegelse.css`
forbyr. Et tall som teller oppover er dessuten uleselig mens det gjør det.

**Seksjonene på markedssida skal ikke komme inn forskjøvet.** Forskyvning
(stagger) er dekor. Den ville kledd merket dårlig, og den forsinker innhold
brukeren allerede har rullet til.

**Navigasjonen skal ikke animere aktiv lenke.** Sideskift skjer titalls ganger
i en økt. Bevegelse der gjør grensesnittet tregere, ikke mer levende.

**Ingen fjærer (springs) noe sted.** De hører hjemme i dra-, sveip- og
kastebevegelser, og dette systemet har ingen. Får merket en dra-flate senere,
er fjær riktig verktøy — ikke før.

**Ingen skjelett-lasting, ingen overganger mellom sider, ingen toast.** Merket
har dem ikke, og de skal ikke oppfinnes her.

## Oppsummert

| Hva | Fart | Kurve |
|---|---|---|
| Hover, fokus, trykk | 120 ms | `--ak-kurve` |
| Panel åpner, innhold bytter, noe kommer til syne | 220 ms | `--ak-kurve` |
| Seksjon ved rull | 420 ms | `--ak-kurve` |
| Snurre | 700 ms, lineær, uendelig | — |

Alle tre fartene settes til `0ms` under `prefers-reduced-motion`. Fargeskift og
trykkbekreftelse blir da momentane — de forsvinner ikke. Redusert bevegelse
betyr mindre bevegelse, ikke mindre tilbakemelding.
