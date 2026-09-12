---
name: design-system
description: Lag, vurder og videreutvikle AK Golf HQs produktdesignsystem for PlayerHQ, AgencyOS og AgenticOS. Bruk ved designverdier, komponenter, tema/modus, Claude Design-systemarbeid og design-til-kode-overlevering.
metadata:
  version: "1"
  reviewed: "2026-09-11"
---

# AK Golf HQ Design System

Bruk `ak-hq-design` som samlet arbeidsmåte og les [Atletisk intelligens](../ak-hq-design/references/atletisk-intelligens.md). Anders starter blankt i Claude Design. Eksisterende Train-lock-, Paper-, v2- og merkevareverdier er ikke produktets nye designfasit.

## Målet

Skap ett system som kan løse:

- sportslig, oppslukende PlayerHQ;
- rolig og presis AgencyOS;
- AgenticOS som en integrert og transparent del av AgencyOS;
- mørk fokusmodus i Live, fordypning og aktivt AI-arbeid når oppgaven krever det.

Dette er modi i samme produktfamilie. De skal dele grammatikk, komponentlogikk, statusbetydning og tilgjengelighetsnivå.

## Design System v0.1

Utvikle systemet sammen med reelle pilotskjermer. Første bevis er AgencyOS Hjem, PlayerHQ-reisen I dag → økt → Live → oppsummering og én Analyse-skjerm. Et komponentbrett uten disse brukseksemplene er ikke nok.

Dokumenter designverdier i tre nivåer:

1. **Grunnverdier:** rå farger, typografi, avstand, størrelser, rutenett, radius, kanter, dybde, ikonografi og bevegelse.
2. **Betydning:** bakgrunn, flate, tekst, nedtonet tekst, kant, valgt, hovedhandling, informasjon, varsel, feil, suksess, egne data, mål og referanse.
3. **Komponent:** verdier og tilstander for den konkrete komponenten peker til betydningslaget.

Ikke hardkod rå verdier i komponentkontraktene når en betydningsbasert verdi finnes. Samme betydning skal fungere i operativ lys modus og mørk fokusmodus med kontrollert kontrast.

## Komponentkontrakt

For hver faktisk nødvendig komponent dokumenteres:

- navn, oppgave og hvor den brukes;
- anatomi og påkrevde data;
- varianter og formattilpasning;
- normal, hover, trykket, valgt, fokus, deaktivert og lasting;
- tom, feil, offline, lesetilgang, lagrer, lagret og avbrutt/fullført når relevant;
- tastatur, skjermleser, lange norske tekster og store tekststørrelser;
- bruk / ikke bruk med minst ett ekte eksempel fra en pilotskjerm.

Bygg ikke hypotetiske komponenter bare for å gjøre biblioteket stort. Del mønstre på tvers av PlayerHQ og AgencyOS, men tillat oppgavebegrunnet forskjell i tetthet, foto og fokusmodus.

## Visuelle grenser

- Meningsbærende sportsfoto og stor typografi kan gi energi i utvalgte spillerøyeblikk.
- Foto skal ikke redusere lesbarheten til tid, data eller handlinger.
- AgencyOS skal ikke bli et rutenett av like SaaS-kort.
- AgenticOS skal ikke få neon, robotgrafikk eller glød som erstatning for status og forklaring.
- Mørk modus brukes ikke overalt bare fordi referansebildene viser mørke mobilskjermer.
- Konseptbilder viser smak, ikke bevist brukervennlighet; prøv flytene med realistiske data og tilstander.

## Status og overlevering

Skill mellom `utforskes`, `v0.1`, `valgt for utprøving`, `valgt for bygging`, `implementert` og `kontrollert i app`. Når Anders velger en Claude Design-versjon, registrer versjon/dato, skjermer, modi, ressurser og åpne avvik. Først da kartlegges systemet til repoets delte komponenter og CSS-designverdier.

Ikke endre database, tilgang, betaling eller produktregler som følge av et visuelt systemvalg.
