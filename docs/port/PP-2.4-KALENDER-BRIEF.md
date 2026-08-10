# PP-2.4 Kalender — brief for ombygging

**Skrevet 10.08.2026** som overlevering til en frisk økt, etter samme mønster som
[`PP-2.1-KONSOLL-BRIEF.md`](./PP-2.1-KONSOLL-BRIEF.md). Kalenderen er den siste «Stor»-jobben i
PP-2, og bør ikke gjøres som en delvis justering — halve jobben er verre enn ingen.

**Fasit:** `designsystem/paper/fase1/agencyos-kalender.html` og `agencyos-kalender-mobil.html`.
Kilden er Claude Design `605a48cc`; speilet kan henge etter, sjekk mot `claude-design`-MCP hvis
noe ser rart ut.

**Bevis på dagens tilstand:** `screenshots/paper/signoff/PP-2.4-d1280.png` og
[`SIGNOFF-GALLERI-2026-08-10.md`](./SIGNOFF-GALLERI-2026-08-10.md) §PP-2.4.

**Komponent:** `src/components/admin/v2/AgencyKalenderV2.tsx` (~950 linjer), rute `/admin/kalender`.

---

## Problemet i én setning

Appen viser **hva som skjer**. Fasiten svarer på **om du har for lite eller for mye å gjøre, og
hva du skal gjøre med konflikten**.

---

## De fem avvikene, i den rekkefølgen de bør tas

### 1. Detaljkolonnen mangler helt (største jobben)

Fasiten har en høyrekolonne som viser den **valgte** avtalen: Tid · Varighet · Sted · Type ·
Selskap · Innhold. Under den varsles kollisjon i klartekst — «Kollisjon i din kalender —
«\<tittel\>» overlapper» — og det tilbys **én** løsning: «Flytt til 17:30–18:30». Den knappen er
skjermens clay-flate.

Dette er samme mønster som Konsollen og Innboksen nå har (`ArtefaktPanel` i PlayerHQ,
`KonsollArtefakt` i AgencyOS). **Gjenbruk mønsteret — ikke oppfinn et tredje.**

### 2. Nøkkeltallene svarer på feil spørsmål

| Fasit | App i dag |
|---|---|
| Belegg 35 % · Booket 6 t · Ledige timer 2 · Kollisjoner 1 | Økter uke 1 · Serier 1 · Live nå 0 |

Fasitens formel står i `agencyos-kalender.html` §`function belegg(dag)`:

> Belegg = booket coachingtid delt på **tilgjengelig** tid, per dag. Sperret tid er ikke
> tilgjengelig og teller ikke i nevneren. Holdte luker teller som booket. Ledige timer teller
> ikke — de er en mulighet, ikke en avtale.

**Datakilder som finnes:** `getAvailableSlots` / `beregnSlotVindu`
(`src/lib/portal-booking/slot-vindu.ts`) gir ledige luker. Booket tid ligger i `Booking` +
`TrainingSessionV2`. Sperret tid ligger i `CoachAvailability`. Kollisjoner kan regnes av
overlappende tidsrom i samme dag — fasiten regner dem, den skriver dem aldri.

**Ikke hardkod noen av tallene.** Fasitens egen kommentar: «Belegg og kollisjon REGNES, aldri
skrives for hånd.»

### 3. Agenda-visning mangler

Fasit har Dag / Uke / Måned / **Agenda**. Appen har de tre første. Agenda er en flat, kronologisk
liste — enklest av de fire å bygge, og den er den eneste som er brukbar på 390 px.

### 4. Det brede oransje «Ny økt»-båndet er generisk

Samme feil som ble rettet på Innboksen: clay skal ligge på **én konkret handling på én konkret
sak** — her «Flytt til 17:30–18:30» for den valgte kollisjonen. «Ny økt» faller til omriss.

### 5. Tidsaksen er for luftig

Appen viser 04:00–22:00 med mye tomrom; fasiten pakker 05:00–20:00 tettere og får hele dagen på
én skjerm. Konstantene ligger i `AgencyKalenderV2.tsx` (se `timeGridBlockStyle` og `startMin`-
matten rundt linje 460–550).

---

## Rekkefølge som anbefales

Fire PR-er, minste risiko først:

1. **Tidsakse + Agenda-visning** — rent visuelt, ingen nye spørringer.
2. **Nøkkeltallene** — nytt datalag for belegg/ledige/kollisjoner.
3. **Detaljkolonnen** — gjenbruk artefaktpanel-mønsteret, koblet til valgt økt.
4. **Clay-disiplin** — flytt oransje fra «Ny økt» til konfliktløsningen. Krever at 3 er på plass.

## Fallgruver

- **Oslo-tid.** All dato/klokke-matte via `src/lib/uke-helpers.ts`; `Intl.DateTimeFormat` MÅ ha
  `timeZone: "Europe/Oslo"`. Vercel kjører UTC. Se `.claude/rules/gotchas.md`.
- **`min-width: 0`.** Legger du inn en `grid-cols-[…]` for detaljkolonnen: beholderen MÅ ha
  `minWidth: 0`, ellers gjentar du innboks-feilen fra 10.08 (listen ble 1681 px i et 1280 px
  vindu). Gotcha-en er dokumentert øverst i `gotchas.md`.
- **Tom testdata.** `coachtest@akgolf.test` har 1 spiller og ingen bookinger, så kalenderen er
  nesten tom i skjermbildene. Vurder å seede før du fotograferer — ellers vurderes designet på
  feil grunnlag.
- **Coach-filteret** som ble bygget natt til 10.08 vises ikke før det finnes bookinger med
  registrert coach.

## Ferdig-definisjonen

De 12 D-kriteriene i `PIXEL-PERFECT-PLAN-COMPLETE.md` §0. Merk D12: skjermbilder side om side
mot fasit, mobil 390 først, lys + mørk, sendt i samtalen. **Per 10.08 kan de ikke lages mot en
Vercel-preview** — Preview mangler `DATABASE_URL`. Avklar det før du planlegger sign-off.
