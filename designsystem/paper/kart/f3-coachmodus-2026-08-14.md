# F3 · Coach-modusene — levert 14.08.2026

Fasit: **`fase1/workbench-stall.html`** (åpnes også fra `workbench-desktop.html` → «Coach»).
Bygget på F1/F2-motoren i `workbench-desktop.html`: samme tidsakse (05:00–23:00, 30 min,
`SLOT_H = 22`), samme snap (⇧ = 5 min), samme blokk-klasser, samme angre-stack.
Ingen nye farger, ingen nye radier — F3 legger bare til nye **kolonnetyper**.

## Hva som er tegnet

| Punkt i masterplanen | Slik det er løst |
|---|---|
| Stall-kolonner | Modus **Stall**: 2–6 spillere + coachens egen kolonne på én valgt dag. Dagstripe velger dagen; kolonnene er personer. Maks seks fordi kolonne nr. sju ikke kan lese en økt. |
| Gruppe-uka | Modus **Gruppe**: gruppas uke i sju dagskolonner, skole som dimmet bakteppe, coachens bookinger som opptatt tid. Gruppeøkt viser deltakerliste, og de som kolliderer er merket i lista før du bekrefter. |
| Planlegge FOR en spiller | Modus **Spiller**: full redigering av valgt spillers uke. Coach-merknaden står **før** redigering, ikke etter, og hver endring skriver «coach» + varselstatus i Logg-fanen — samme logg spilleren leser i PlayerHQ. |
| Mal-dra fra bibliotek | Ukemalene har ekte nyttelast (dag/tid/varighet/område). Slipp på uka legger dem inn som **utkast** (stiplet, «ikke bekreftet») med Bekreft/Forkast — aldri direkte i planen. Blokkeres i stall-modus: en ukemal hører til en uke, ikke til en dag. |
| RSVP-blokker | Forespørsler ligger som tentative blokker i coachens kolonne. Godta → bekreftet booking (låst) + kvittering. Avslå → dialog med påkrevd begrunnelse, svaret logges. Forespørsler teller **ikke** som opptatt tid før de er godtatt. |
| Tidsforslag | `finnLedig(varighet, innenDag)` søker rasteret og returnerer slots der alle valgte spillere er ledige, coachen er innenfor arbeidsuka (08–18 man–fre) og anlegget har kapasitet (2 simer). Svaret tegnes **i lerretet**, ikke bare i en liste; ett klikk gjør slottet til gruppeøkt for alle. |

Søket flytter visningen til svaret: i stall- og min-modus (én dag, personer som
kolonner) settes dagen til første treff, og dagstripa teller treff per dag — ellers
ville KPI-en si «6 tidsrom funnet» mens lerretet sto uendret.

Konflikter regnes (aldri skrives): overlapp per person per dag, pluss skolekollisjon som
**varsel** — skole er bakteppe, ikke sperre. Konfliktfanen har «Vis i lerretet» og en
konkret utvei («flytt 60 min senere»), ikke bare en påstand om at noe er galt.

Én ting nå er prioritert og eksklusiv: forespørsler → konflikter → ubekreftet ukemal →
publiser. Aldri to samtidig.

## Beslutninger tatt i denne turen

1. **Kolonnene er personer i stall-modus, dager ellers.** Det er hele forskjellen mellom
   modusene; motoren under er én. Sideveis piltast bytter derfor person i stall-modus og
   dag i de andre — gesten følger kolonnen, ikke tastaturet.
2. **Å slippe en økt i en annen spillers kolonne flytter økta til den spilleren.** Det er
   reell coach-makt, og derfor logges den med «begge varslet». Gruppeøkter kan ikke flyttes
   mellom personer — de eies av gruppa og redigeres i Gruppe-modus.
3. **Tilgjengelighet og anleggskapasitet er lag (skravur), ikke blokker.** De sier hva tiden
   *er*, ikke hva som står i den. Tilgjengelighetslaget kan slås av i toppbaren.
4. **Varighet:** strekking på stall-lerretet skriver differansen til siste drill i økta —
   samme regel som `workbench-desktop`. Drill-redigering skjer fortsatt i økt-inspektøren.
5. **Angre ruller tilbake loggen, ikke bare planen.** Loggen er det spilleren leser i
   PlayerHQ — en angret endring som står igjen der påstår et varsel som aldri ble sendt.
   Snapshotet omfatter derfor plan, logg, mal-utkast og publiseringsstatus.

## Åpne punkter (ikke gjettet, ikke oppfunnet)

- **Skoletid for GFGK finnes ikke i datamodellen** (masterplanens punkt 3). Sara Bø har
  derfor ingen skoleblokk, kolonnen hennes sier «skoletid mangler», og tidsforslag som
  omfatter henne merkes «skoletid?». Ingen skoletid er diktet opp.
- **Anleggskapasitet utebane er ustrukturert** (punkt 4). Helgeforslag merkes
  «kapasitet ukjent» i stedet for å utelates eller påstås ledige. Simkapasiteten (2) er
  eneste harde kapasitetsregel.
- **Gjentakelse** (`recurrenceRule`) er F2-restanse og er ikke tegnet her.
- **Godkjenningsflyt for tidsbytte** (spilleren *godtar* en flyttet gruppeøkt) er varslet i
  loggen, men selve godkjenningen hører i køen — ikke duplisert på denne flaten.
- **Turneringsdager til 04:00** (punkt 6) er fortsatt ubesvart; aksen står 05:00–23:00.

## Mobil

`fase1/workbench-stall-mobil.html` (430 px) er en egen tegning, ikke skalert desktop.
Fem kolonner à 118 px krever 652 px — det finnes ikke. Mobilens stall er derfor
**spillerrader med dagen som tidsstripe** (06:00–22:00, tetthet + konfliktmarkering), og
all redigering skjer i ark med 44–48 px treffmål: dagsark per spiller, øktark (dag, start,
varighet, flytt-til-spiller), finn-tid-ark, konfliktark, RSVP-ark med påkrevd begrunnelse,
mer-ark (ukemaler, lag, logg). Ingen dra-og-slipp med tommel på en 26 px stripe — det
ville produsere feilflyttinger. Angre ligger i toasten, ikke på ⌘Z.

## Neste

F4 er kode, ikke design (composer-til-ghost, periodiserings-ghost søndag, peaking,
faktisk-mot-planlagt). Designet av F3 er nå komplett for både desktop og mobil.
