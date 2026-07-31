# SessionCard

Øktkortet. Ukelerretet i Workbench, kalenderen, profilens Plan-fane.

## Anatomi (fast rekkefølge)
tid · pyramideområde · merker · tittel · AK-formel · bunnlinje.

Rekkefølgen er ikke forhandlingsbar mellom flater: en coach som skanner sju
kolonner leser samme sted hver gang.

## Ett treffmål, ikke fem
Kortet er én `<button>` som åpner økt-editoren. Hengelås, rrule-merke og
deltakertelling er *informasjon*, ikke handlinger. Alternativet — små
ikonknapper inne i kortet — ville gitt fire treffmål under 44 px i en kolonne
som er 130 px bred. Alt som skal gjøres med økta, gjøres i editoren.

Skjermleseren får merkene som tekst i en visuelt skjult linje, fordi «🔒» og
«↻» ikke leses meningsfullt.

## Hva som ryker først når det blir trangt
Container queries, ikke viewport: under 150 px faller **formelen** bort, under
110 px også områdemerket. Tittelen står alltid. Formelen er presisering;
tittelen er hva økta *er*.

## Farge
Venstrekanten bærer pyramideområdet og er den eneste fargede flaten. TURN
bruker `--up` fordi turnering er sesongens toppunkt, ikke fordi den er «bra» —
og FYS `--info`. Ingen oransje: et øktkort er aldri skjermens ene viktigste
handling.

Låst anker er `--soft` bakgrunn, utkast er stiplet ramme. Begge er
tilstandsforskjeller man kan se i gråtoner.

## Målt
Kortet er sitt eget treffmål; høyden overstiger 44 px i alle varianter
[måles i `workbench.card.html`].
