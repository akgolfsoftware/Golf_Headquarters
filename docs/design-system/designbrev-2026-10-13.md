# Designbrev — AK Golf HQ (13.10.2026)

Status: **utkast, venter på Anders' ja.** Når det er godkjent, er dette brevet målestokken for
alt skjermarbeid i Precision Athletics (`7d7c2994`) og skjermregisteret (`3b49e40a`). En skjerm
er ikke ferdig fordi tekniske kontroller består. Den er ferdig når den følger dette brevet og
Anders har sagt ja (port 7).

Grunnlag: gjennomgang av sju nøkkelskjermer i skjermregisteret (Precision 3.1.0-l) 13.10.2026.
Bilder: [designgjennomgangen](https://claude.ai/artifact/BaUc3ovdpWpJBWyQuaPRx4).

## Hva Anders sa

- «AK Golf ser veldig kjedelig ut.»
- «Stats-visningen er dårlig.»
- «Workbench har ikke fulle funksjoner.»
- Mer av: **sterkere farger** og **golfbilder og foto**.
- Referanser: **Whoop / Oura**, **Strava**, **TrackMan / Arccos**, **Apple Fitness**.

## Retning

1. **Farge bærer innholdet.** Aksefargene FYS · TEK · SLAG · SPILL · TURN brukes med full styrke:
   fylte øktkort, fylte grafer, tydelige merker. Bleke flater og tynne streker som eneste
   fargebærer er for svakt. Farge betyr fortsatt akse. Status (grønt/rødt) og rust er signal.
2. **Golf skal synes.** Ekte bilder fra bane og trening i toppfeltet på I dag, Stats og
   Spiller 360. Bilder får aldri tekst rett oppå. Tekst står i eget felt ved siden av eller under.
3. **Store tall først.** Hver skjerm har ett hovedtall som leses på ett sekund: dagens økt,
   snittscore, SG totalt, timer denne uka. Stort, i IBM Plex Mono. Som Whoop/Oura og Apple Fitness.
4. **Mindre småtekst.** Grå mono-tekst med store bokstaver (metadata) brukes sparsomt, høyst én
   linje per kort. I dag er den på nesten alle kort og gjør skjermene grå.
5. **Energi som Strava, presisjon som TrackMan.** PlayerHQ skal gi lyst til å trene. AgencyOS kan
   være roligere, men cockpit skal vise hvem som trenger coachen med farge, ikke bare tekst.

## Stats (PH-16)

Fire like deler, som vedtatt 28.09: **Snittscore · Strokes Gained · Trening · Tester.**
Dagens design viser bare Strokes Gained.

- Hver del har ett stort hovedtall, trend (pil og endring) og én tydelig graf.
- Grafer med fylt flate i aksefarge. Fire nesten flate stiplede linjer er ikke godt nok.
- SG viser sterkest og svakest område med farge og søyler, ikke bare tall.
- Reglene for nok data, estimat-merking og sammenligning (Broadie, PGA Tour) gjelder uendret.

## Workbench (PH-11 / AG-11)

Disse funksjonene skal finnes, både i designet og i appen:

- **Årsplan og perioder:** veilederen «Opprett årsplan» (fire utgangspunkt, tidsrom, navn),
  periodeskjema, og at coachen kan legge inn, endre og slette perioder (vedtak 28.09).
- **Månedsplan:** fokus, målsetninger, timer per akse fordelt på ukene, tester og turneringer,
  notat og evaluering (vedtak 28.09).
- **Dra og slipp med Gjenta:** ekte dra og slipp, også på mobil (17.09), og «Gjenta» ved slipp.
- **Øvelsesbank og egne øvelser:** pyramiden velges først og styrer banken; coach kan lage egne
  øvelser (28.09).

## Uendret

Grafitt primærknapp med hvit tekst, rust bare som signal (høyst én per flate), IBM Plex Sans og
Mono, lyst tema som standard, aldri sidelengs rulling, ordboka i `docs/treningsplanlegging.md`,
tomme, lastende og feilende tilstander på hver skjerm.

## Må avgjøres av Anders før brevet gjelder

1. **Fylte øktkort.** Vedtaket 26.09 (§FARGE BETYR AKSE) sier at øktkort er nøytrale med
   aksefarget stripe på venstre kant, og at fremdriftsstreker er grafitt. Punkt 1 over overstyrer
   dette. Ja eller nei?
2. **Bilder.** Precision har ingen bildebank med ekte golfbilder. Hvem leverer bildene: egne
   bilder fra AK Golf, eller lisensierte bilder?

## Arbeidsrekkefølge etter godkjenning

1. **I dag (PH-01)** tegnes på nytt etter brevet, mobil og PC, til Anders sier ja. Den blir mal.
2. Stats (PH-16) med fire deler.
3. Workbench med de fire funksjonene.
4. Cockpit (AG-01) og Spiller 360 (AG-08).
5. WANG og Team Norway til slutt.

Claude Design kan brukes til 14.12.2026 (tjenesten flyttes til Artifacts). Designkilden må være
flyttet ut før da.
