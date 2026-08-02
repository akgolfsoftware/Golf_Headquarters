Ukens tidsgrid — kalenderen i AgencyOS og lerretet Workbench planlegger på.

```jsx
<TimeGrid
  days={[{label:"man",date:"27"},{label:"tir",date:"28"},{label:"ons",date:"29",today:true}]}
  events={[
    {id:"a",day:2,start:"14:00",end:"15:00",title:"Øyvind · teknikk driver"},
    {id:"b",day:2,start:"15:20",end:"15:40",title:"Kort samtale · Mina"},
    {id:"c",day:1,start:"09:00",end:"11:00",title:"Ledig for booking",kind:"free"},
    {id:"d",day:2,start:"08:15",end:"14:00",title:"Skole",kind:"bg"}
  ]}
  now="13:20" dataOdId="panel-uke" />
```

- **Grensen mot `ListGroup`:** en liste svarer «hva skjer i dag», griden svarer «hvor er hullene og hva kolliderer». Trenger skjermen ikke å vise overlapp eller tomrom, er den en liste.
- **Lukket sett med hendelsestyper:** `default`, `free`, `bg`. Nye typer legges i biblioteket, ikke som klasse på skjermen. `bg` er `pointer-events:none` og ligger under alt — skole, booking og kollisjonsvarsler tegnes der.
- **Container-terskel 560px** (omregnet, ikke oversatt: i Panel med `md`-polstring tilsvarer det ~594px spaltebredde). Under den krymper timemargen 52 → 40px og kolonneminimum 112 → 96px; griden scroller horisontalt i sin egen ramme i stedet for å presse dokumentet.
- Avvik fra referansen `agencyos-hq.html`: den er flytspesifikasjon for oppførsel, ikke stil. Ingen klasser derfra er portet.

## Bindende: 1 px = 1 minutt

Døgnvinduet er 04:00–23:00 = 1140px lerret. `top = startMinutt − 240`, `height = varighet`. Kontrakten er hele poenget: to økter som overlapper i tid *ser* overlappende ut uten at noen regner. Strekk derfor aldri en hendelsesboks for å nå et treffmål — da lyver høyden om varigheten.

## Bindende: treffsonen er usynlig, ikke en større boks

En 20-min-økt er 20px høy. Ved `pointer: coarse` gir `.akhq-tg-ev::after` en sentrert, gjennomsiktig sone på `max(100%, 44px)`. Boksen beholder sin sanne høyde; bare treffet vokser. `--floor` settes i container-laget, aldri på boksens `height`.

## Bindende: rasteret er gradient, ikke DOM

Time- og 20-min-linjer tegnes som to `repeating-linear-gradient` på `.akhq-tg-col`, med ulik alfa (20-min svakest). 7 kolonner × 57 linjer ville vært 399 noder uten jobb.

## Ikke i komponenten

Drag, resize, tastaturflytting og snapping (20 min) er konsumentens ansvar. `TimeGrid` skal kunne rendres statisk og måles uten en eneste hendelseslytter — `onEventClick` er eneste krok.
