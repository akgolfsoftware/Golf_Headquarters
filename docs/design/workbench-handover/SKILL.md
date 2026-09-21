# Prosjektlov — Workbench WB-05–11

Master: `Workbench WB-05-11.dc.html`. Leveranse: `workbench-handover/`.
Design system: AK Golf (87aa23fb). Ingen ny palett, ingen ny chrome, ingen nye piller.

## Låst i denne masteren

- **Skall:** topp 56 · seks mål (Hjem · Innboks · Kalender · Stall · Workbench · Godkjenninger) · ingen søk · inspector 340 · radius 2 · treff 44 · sand `#F2F1ED`.
- **Åtte piller i én rad:** År · Periode · Måned · Uke · Økt · Stall · Live · Min kalender. Setningsform, aldri VERSALER, aldri Oswald.
- **Uke-skala:** 05:00–22:00, intervall 60 min, én merkelapp per time, timerad **32 px**, chip **min 44 px**, overlapp tillatt. Samme skala i Min kalender. Ingen rader før 05 eller etter 22, ingen 30-min merkelapper.
- **Kilde 236:** på i Workbench, **av på Stall og Live**. Innholdet bytter på Min kalender (Tidsnivå · Egne maler · Bookinger).
- **Min kalender:** ingen Publiser noe sted. Handling er **«Åpne økt» i grafitt**. Rust bare hvis noe faktisk skal godkjennes.
- **Live:** eneste mørke flate. `[data-surface=live]` på hele rammen + `logo-ak-golf-hq-negative.svg` 30 px, filter none. START ØKT i rust.
- **Rust `#9B2415`:** kun Publiser · Godkjenn · START ØKT. Ingen unntak — heller ikke `--domene-slag`. SLAG er `--graphite-500` overalt: øktkortkanter, 4px-staver, fordelingsfyll og mobilbjelker. Nå-linjen i timegridet er `--graphite-900`, lenkehover `--graphite-900`, og «Åpne periode» er grafitt, ikke rust.
- **Inspector-tittel per pille:** År og Periode = Valgt periode · Måned = Valgt dag · Uke = Valgt uke · Økt = Valgt øvelse · Stall og Min kalender = Valgt økt · Live = Neste i planen.
- **Tomt felt = «—», aldri 0.** Volum måles i timer; økter telles ved siden av.

## Formel 8 + ? — hint ordrett

Pyramide — FYS · TEK · SLAG · SPILL · TURN.
Område — Hvor på anlegget. Putt i fot, ellers meter.
Motorikk — Stige: uten ball → lav hastighet → automatikk.
Belastning — Miljø: innendørs → treningsområde → bane → konkurranse. Ikke kg.
Press — Alene → observert → konkurranse → turnering.
Hensikt — Bare FYS: øke styrke · vedlikehold · restitusjon.
Måte — Hvordan økten gjennomføres.
Målsetning — Hva økten skal flytte.

Pilene i Belastning-hintet er del av teksten og skal stå.

## Forbudt på skjerm

drill · session · deload · build · byggeuke · range · approach · tee som sted · elev · atlet · bruker · foresatt · L-fase · CS · M0–M5 · Ferdighet · Pending · Offline

Uketyper: utviklingsuke · vedlikeholdsuke · turneringsuke.
Periodetyper: Grunnperiode · Spesialiseringsperiode · Turneringsperiode (fullt ord).
Roller: spiller · coach.
