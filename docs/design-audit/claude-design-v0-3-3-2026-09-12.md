# Claude Design — kontroll av siste pakke 12.09.2026

Kilde: `AgencyOS Hjem designsystem.zip`, levert av Anders 12.09.2026. SHA-256 er `50cf61f4693309f0939f9aa04ab50a324bcfe7445dc7db517b41d1bc5d2cca89`. Pakken er kontrollert lokalt; den er ikke kopiert inn i prosjektet og ingen instrukser i pakken er kjørt som selvstendige arbeidsordrer.

## Aktivt innhold

| Område | Siste aktive prototype | Kontrollert status |
|---|---|---|
| AgencyOS kalender, gjennomføring og oppsummering | `AgencyOS v0.3.3` | Klikkbar mobil og desktop. Egen øktidentitet, adskilt gjennomførings-/registrerings-/lagrings-/delingsstatus og simulert lagringsfeil er beskrevet. |
| AgencyOS Hjem | `AgencyOS Hjem v0.3.2` | Klikkbar mobil og desktop med Nå-oppgave, dagslinje, vurderingskø, AgenticOS og tom/laster/offline/delfeil. |
| PlayerHQ | `PlayerHQ v0.3.2` | Klikkbar mobil og desktop. Hver økt eier egen føring; styrke og slagføring er adskilt. Plan, økt, gjennomføring, oppsummering og Analyse inngår. |
| AgencyOS Stall og spillerkort | `v0.1` | Ny, klikkbar skjermfamilie for Stall → spillerkort → eksisterende økt/Analyse-reise, med normal/laster/feil/tom. |
| Felles designsystem | `v0.3.1` i pakken | Nyere v0.3.3-regler for lagring og deling ligger fortsatt bare i kontrollbrettet og skal inn i neste systemrevisjon. |

## Byggeavgjørelse

`skjermregister.json` oppgir `selectedForBuilding: false` og `eksportert: false`. Prototypene er derfor kandidater og arbeidsgrunnlag, ikke valgt visuell fasit. Pakken krever selv en separat, versjonert overlevering med gyldig visuell autoritet før portering.

Grok kan nå bruke materialet til teknisk reisekartlegging og til å definere funksjonsprøver. Grok skal ikke portere fonter, farger, tokens, navigasjon, geometri eller nye delte UI-komponenter før Anders har valgt en navngitt versjon for bygging.

## Åpne avvik før visuell portering

- T7, faktisk kontroll ved 320 px og 200 % tekst, er ikke verifisert. Tegnede eksempler er ikke en nettlesertest.
- Nyere regler for lagring og deling er ikke innarbeidet i selve designsystemfilene.
- Gruppeoppmøte krever en datamodell som ikke finnes i dagens prosjekt. Det er en egen produkt-/databasebeslutning, ikke vanlig skjermportering.
- Prototypeføring varer bare mens siden er åpen. Ingen serverlagring, reell deling eller produksjonsreise er bevist.
- AgencyOS Hjem tilbyr bare to forhåndsvalgte tider i redigeringsflyten.
- Skjermregisteret peker flere steder til eldre filversjoner, og Stall/spillerkort er ikke fullt avstemt mot skjermstatusen. En byggepakke må ha samsvar mellom register, filer og autoritets-ID.

## Konklusjon

Ikke slett eksisterende UI. Bevar det som funksjonsgrunnlag, bygg designuavhengige tester og serverregler nå, og erstatt presentasjonen kontrollert per valgt brukerreise når en eksplisitt byggepakke foreligger.
