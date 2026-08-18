# Åpne spørsmål — natt 06.–07.08.2026

> Levende fil (oppdatert 18.08.2026) — `docs/AAPNE-SPORSMAAL.md` (17.07) er den gamle,
> nå redusert til en peker hit. Nedenfor: rute-konsolideringsspørsmålene fra natt 06.–07.08
> (uendret), pluss de gjenstående ÅPEN-punktene flettet inn fra den gamle fila som fortsatt
> ikke er avklart.

## Flettet inn fra docs/AAPNE-SPORSMAAL.md (fortsatt ÅPEN 18.08.2026)

### A4 · Fase 2: anbefalingsmotor for periode-fordeling
**Spørsmål:** når bygges anbefalingsmotoren som foreslår TEK/pyramide-fordeling ut fra SG/tester/L-fase?
**Status:** Fase 1 bygget og i drift (`PeriodeFordeling`-modell + `/admin/settings/periode-fordeling`).
Fase 2 venter på at nok data er samlet — ingen dato satt.

### D8 · Banekart i hull-analysen — ekte geometri
**Spørsmål:** hvor kommer tee/green/fairway-koordinatene per hull per bane fra —
manuell inntasting i AgencyOS, import fra GolfBox/ekstern, eller generering?
**Status:** BESLUTTET at ekte geometri skal bygges (Anders 2026-07-17), men BLOKKERT på
datakilde-valget over. Egen prosjektbølge. Shot-map (`CourseMap`) er allerede klar til å
bruke geometrien når `CourseDefinition.geojson` finnes.

## /portal/mal/bygger vs /portal/ai/mal-bygger
**Spørsmål:** Skal disse slås til én AI-målbygger?
**Hvorfor det blokkerer:** To skjermer med samme jobb — porte begge er bortkastet.
**Mitt forslag:** Behold `/portal/ai/mal-bygger`, redirect den andre.

## /portal/drills vs /portal/coach/ovelser
**Spørsmål:** Én øvelsesbank eller to roller (spiller vs coach-visning)?
**Hvorfor det blokkerer:** Samme data, to flater.
**Mitt forslag:** Én bank med rollebasert visning.

## /portal/coach/melding/* vs /portal/coach/sporsmal/*
**Spørsmål:** To meldingssystemer eller historisk skille?
**Hvorfor det blokkerer:** Dobbel port + forvirring i navigasjon.
**Mitt forslag:** Én trådmodell; sporsmal som alias/redirect.

## /portal/utviklingsplan vs /portal/talent/min-plan + roadmap
**Spørsmål:** Utviklingsplan = talent-min-plan?
**Hvorfor det blokkerer:** Tre flater om «min plan».
**Mitt forslag:** Talent-hub eier planen; utviklingsplan redirecter.

## /turneringer vs /stats/turneringer
**Spørsmål:** Marketing vs DataGolf — hvilken er sannhet?
**Hvorfor det blokkerer:** Hele `/stats/*` venter DataGolf-avklaring.

## /admin/klubb/innstillinger vs /admin/settings
**Spørsmål:** Samme innstillinger to steder?
**Mitt forslag:** settings er kanon; klubb redirecter.

## /admin/turnering-kart vs /admin/tournaments
**Spørsmål:** Kart = egen flate eller fane?
**Mitt forslag:** fane under tournaments.

## /admin/agencyos/uka vs /admin/kalender
**Spørsmål:** Uke-plan vs kalender — konsolider?
**Mitt forslag:** kalender er kanon; uka som zoom/filter.

## /admin/teknisk-plan vs /admin/plans
**Spørsmål:** Teknisk plan egen produktflate?
**Mitt forslag:** under plans med filter type=teknisk.

## 8 AgencyOS-kø-flater (§4c)
**Spørsmål:** Hvilken én hub for «noe venter på deg»?
(innboks, innboks-epost, varsler, queue, handlingssenter, godkjenninger, workspace/tildelt-meg, foresporsler)
**Hvorfor det blokkerer:** IA-beslutning — ikke portingsjobb.
**Mitt forslag:** «Kø» i rail peker til én hub med faner.

## Testprotokoller 20 vs 21 vs 25
**Spørsmål:** Hvilket antall er fasit i produktet?
**Blokkerer:** testbatteri-tekst/UI.

## DataGolf-plassering i PlayerHQ
**Spørsmål:** Hvor i nav/analyse skal DataGolf inn?
**Blokkerer:** hele `/stats/*`-porten.

## Skjema: validering/lagre-rad i Paper
**Spørsmål:** Mønster for feltfeil + lagre-rad (§8 udekket)?
**Blokkerer:** nye skjema-skjermer uten gjetting.
