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

**Ikke hardkod noen av tallene.** Fasitens egen kommentar: «Belegg og kollisjon REGNES, aldri
skrives for hånd.»

**Levert 10.08.2026.** Regnestykket ligger i `src/lib/domain/kalender-belegg.ts` (rene funksjoner,
13 tester), nevneren hentes av `src/lib/admin-kalender/tilgjengelighet.ts`. Fire flis-er:
Belegg · Booket · Ledige timer · Kollisjoner, med «Hvorfor dette tallet» under.

**To ting i denne seksjonen var upresise, og er rettet i implementasjonen:**

1. *«Sperret tid ligger i `CoachAvailability`»* — nei. `CoachAvailability` er det motsatte:
   coachens **bookbare vindu**. Sperret tid ligger i `CalendarEvent` (ferie, møte, stengt anlegg)
   og i speilede Google-avtaler. Det er en fordel: fasitens nevner er «18 t minus sperret», mens
   appen kan bruke coachens faktiske vindu, som er et sannere tall. Finnes ingen vinduer, faller
   koden tilbake til fasitens grunnlag og **sier det** i «Hvorfor dette tallet» — en prosent uten
   oppgitt nevner er en påstand, ikke et tall.
2. *«Booket tid ligger i `Booking` + `TrainingSessionV2`»* — riktig, men begge manglet **sluttid**
   i loaderen. `KalOkt` hadde kun `startMin`, så varighet ble gjettet av `estimertVarighetMin`
   (gap til neste, ellers 60). Belegg regnet av den gjetningen ville vært oppdiktet. `sluttMin`
   er nå lagt til fra alle kilder (`Booking.endAt`, `GroupSchedule.endAt`,
   `TrainingSessionV2.endTime`, `CalendarEvent.endAt`, Google-speilet) — noe som samtidig gir
   riktige blokkhøyder i grid og riktige tidsspenn i agendaen.

`getAvailableSlots` ble vurdert og **ikke** brukt til «ledige timer»: den krever en `tjenesteId`,
gjør et Google-kall per coach, og filtrerer bort fortiden — kalenderen viser også tidligere uker.
Ledig kapasitet regnes i stedet som tilgjengelig minus booket, som er samme størrelse uten
rundturen.

**Avvik fra fasit, bevisst:** kollisjoner regnes **per coach**. Fasiten har én coach, så to
overlappende timer er alltid en kollisjon; appen er multi-coach, og to coacher kan jobbe samtidig.
Økter uten registrert coach (gruppeserier — `GroupSchedule` har ingen coach-kolonne) holdes
utenfor og telles opp i forbeholdet. Under-rapportering er den ærlige feilen her.

Nøkkeltallene er dessuten **uke-scopet**, ikke dag-scopet som fasiten — samme grunn som for
agendaen: skjermen laster en uke og har ingen valgt-dag-tilstand. Ukeprosenten regnes av summene,
ikke som snitt av dagsprosentene (en dag med 1 av 2 timer og en med 0 av 8 gir 10 %, ikke 25 %).

### 3. Agenda-visning mangler

Fasit har Dag / Uke / Måned / **Agenda**. Appen har de tre første. Agenda er en flat, kronologisk
liste — enklest av de fire å bygge, og den er den eneste som er brukbar på 390 px.

### 4. Det brede oransje «Ny økt»-båndet er generisk

Samme feil som ble rettet på Innboksen: clay skal ligge på **én konkret handling på én konkret
sak** — her «Flytt til 17:30–18:30» for den valgte kollisjonen. «Ny økt» faller til omriss.

### 5. Tidsaksen er for luftig

**Rettet 10.08.2026 — denne seksjonen sa opprinnelig «fasiten pakker 05:00–20:00». Det var feil.**
Fasiten er `T_START = 5*60, T_SLUTT = 23*60, SLOT = 30, SLOT_H = 22` — altså **05:00–23:00 i
30-minutters intervaller, 22 px per slot (44 px/time)**. Identisk i `agencyos-kalender.html` §546
og `workbench-desktop.html` §837, der linjen er merket «beslutning Anders 01.08.2026».

Appen viste 04:00–23:00 i 20-minutters intervaller à 56 px/time. Konstantene lå ikke i
`AgencyKalenderV2.tsx` som denne briefen først påsto, men i `src/lib/calendar/notion-grid.ts`,
som er delt kilde for kalenderen, Workbench, coach-workbench og `shared/calendar`.

**Levert:** aksen følger nå fasiten, og fordi kilden er delt fulgte Workbench med — som er riktig,
siden Workbench-fasiten har samme akse. Aksen merkes per slot (05:00, 05:30, …) med hele timer i
full tekstfarge og halvtimene dempet, per Papers `tegnAkse()`. Grid-kroppen krympet fra 1064 px
til 792 px.

**Én konsekvens å være klar over:** 04:00-raden forsvant. Den ble lagt inn 29.07 av
AgencyOS-kodeordren «for tidlige morgenøkter (WANG/GFGK før skole)». Paper vinner (invariant 2),
og Anders' beslutning er nyere. Økter som likevel starter før 05:00 klemmes til toppen av grid av
`timeGridBlockStyle` — de forsvinner ikke, men de får ikke egen rad. Er det et reelt problem for
WANG/GFGK, er det en fasit-endring å ta med Anders, ikke noe å lappe i koden.

---

## Rekkefølge som anbefales

Fire PR-er, minste risiko først:

1. ~~**Tidsakse + Agenda-visning**~~ — **levert 10.08.2026.**
2. ~~**Nøkkeltallene**~~ — **levert 10.08.2026.**
3. **Detaljkolonnen** — gjenbruk artefaktpanel-mønsteret, koblet til valgt økt.
4. **Clay-disiplin** — flytt oransje fra «Ny økt» til konfliktløsningen. Krever at 3 er på plass.

Steg 3 har nå det den trenger: `kollisjoner()` returnerer hvilke to økter som overlapper og i
hvilket tidsrom, som er nøyaktig underlaget «Kollisjon i din kalender — «\<tittel\>» overlapper»
og «Flytt til 17:30–18:30» skal bygges av. Selve forslaget (første ledige luke etter konflikten)
finnes ikke ennå.

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
mot fasit, mobil 390 først, lys + mørk, sendt i samtalen. Preview-miljøet virker igjen fra
10.08 kl. 11:24, så galleriet kan kjøres mot en preview-URL — forutsatt at du har
`SCREENTEST_PASSWORD` for testbrukerne.
