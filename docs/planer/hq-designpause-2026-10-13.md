# Designarbeid satt på vent · 13. oktober 2026

Anders har stoppet alt videre designarbeid i Claude Design-prosjektene Precision og AK Golf HQ skjermregister og alle skjermporteringer i appen. Ingen nye pakkeversjoner 3.1.0-m eller senere, ingen nye skjerm-PR-er. Vent på Anders sitt designbrev før arbeidet fortsetter. Tekniske målinger er ikke det visuelle målet.

## Sikret arbeid

Den påbegynte rettingsbatchen var ferdig før stoppbeskjeden. Den nye dokumenteringsagenten er avbrutt; den startes ikke igjen. Samlet fullkontroll var klargjort, men ikke startet, og startes ikke etter stoppbeskjeden. Arbeidet lagres som uferdig arbeidsversjon. Tidligere avgrensede tester/rettingsdommer er ikke en ny visuell godkjenning. Ingen produksjonsendring, deploy eller ny PR utføres.

Aktiv arbeidsgren: `codex/hq-complete-upgrade`. Tidligere opplastet steg: `59423acab`. Den påbegynte samordningen med `c87f7f76d` hadde ingen uløste konflikter ved stopp og bevarer WANG-testprofilene. Lagring sikrer denne tilstanden uten innlegging i hovedversjonen. Vanlig lagringshook beholdes; ingen ny full design-/målekjøring startes. Vercels automatiske publisering er slått av for akkurat denne arbeidsgrenen i vercel.json, så opplasting er arkivering og ikke en ny nettversjon. Andre grenregler endres ikke. Kilde: [Vercel Git-konfigurasjon](https://vercel.com/docs/project-configuration/git-configuration#gitdeploymentenabled).

Hjelpegrener fra denne oppgaven: `codex/hq-coach-completion-20261013` og `codex/hq-org-completion-20261013`, begge på `9b45145c4`. Arbeidet deres er tatt inn i den aktive arbeidskopien; ingen separat PR er opprettet for dem. Midlertidige hjelpearbeidskopier er ikke lenger til stede; grenene bevares. Eksisterende stash fra andre oppgaver røres ikke.

## Åpne PR-er i repoet ved stopp

Denne oppgaven har ingen PR på `codex/hq-complete-upgrade`. Listen under er eksisterende åpne PR-er i repoet, ikke påstand om at alle er opprettet av denne chatten. Ingen av dem lukkes, endres eller legges inn i hovedversjonen som del av stoppbeskjeden.

- [#1215 · fix(precision): sikre lagringsknapper og tastaturvalg for perioder](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1215) — `codex/precision-kontroller-2026-10-11` · utkast
- [#1213 · Vaktskript: API-ruter sjekkes og bare innlogget godtas ikke (TA-12)](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1213) — `claude/fase2-1h-vaktskript-2026-10-09`
- [#1211 · fix(personvern): under 16 — fødselsdato kreves, sju-dagersfrist, deling og opptak sperret (D-63)](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1211) — `claude/fase2-1e-under-16-2026-10-09`
- [#1207 · Data Golf bare for coach og admin (PR 2 fra kodegjennomgangen)](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1207) — `claude/fase2-2-datagolf-coach-2026-10-09` · utkast
- [#1146 · feat: port twenty PlayerHQ screens to Precision](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1146) — `grok/ph-neste-tjue` · utkast
- [#1144 · feat: port settings, feedback, contact and session request receipt](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1144) — `grok/ph-neste-fem-5` · utkast
- [#1143 · feat: port gameplan, TrackMan, language and booking detail](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1143) — `grok/ph-neste-fem-4` · utkast
- [#1142 · feat: port booking, help, requested session and gatherings](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1142) — `grok/ph-neste-fem-3` · utkast
- [#1083 · feat: isolate AK Golf SG runtime and gate legacy benchmarks](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1083) — `codex/ak-sg-runtime-2026-10-02` · utkast
- [#1060 · Pakke 1: fireukerssjekk, forslag og samtale (WANG og Team Norway)](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1060) — `claude/pakke-1-felles-kjerne` · utkast
- [#1052 · AgencyOS AG-07-NY: Ny spiller (skjema) i Precision Athletics](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1052) — `claude/agencyos-ag07-ny-spiller-0930` · utkast
- [#1045 · AgencyOS AG-05-TILG: Gammel tilgjengelighetsside i Precision Athletics](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1045) — `claude/agencyos-ag05-tilgjengelighet-0930`
- [#1041 · [PARKERT] AgencyOS AG-11-MND: Workbench måned i Precision Athletics (månedsskjema ikke bygget)](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1041) — `claude/agencyos-ag11-maned-0930` · utkast
- [#1031 · AgencyOS AG-11-AR: Workbench årsplan og periode (spiller og gruppe), opprett-veileder, periodeskjema i Precision Athletics](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1031) — `claude/agencyos-ag11-arsplan-periode-0930` · utkast
- [#1027 · AgencyOS AG-16b: Gruppas årsplan, skoledata og AK-stigen (4 trinn, Knøtt ved siden av) i Precision Athletics](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1027) — `claude/agencyos-ag16-arsplan-skoledata-akstigen-0930` · utkast
- [#1025 · BK-02: Velg tid og betal i Precision Athletics](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1025) — `claude/ph-bk-02-velg-tid-2026-09-30` · utkast
- [#1024 · AgencyOS AG-A03: Gruppeanalyse (Stall › Grupper › Stats): stall og etterlevelse i Precision Athletics](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1024) — `claude/agencyos-aga03-gruppeanalyse-0930` · utkast
- [#1023 · AgencyOS AG-15: Tester: normer/benchmarks og tildel test til spiller i Precision Athletics](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1023) — `claude/agencyos-ag15-tester-normer-tildel-0930` · utkast
- [#1018 · [PARKERT] AgencyOS AG-16a: Gruppedetalj (medlemmer) og faste tider i Precision Athletics](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1018) — `claude/agencyos-ag16-gruppedetalj-timeplan-0930` · utkast
- [#1010 · AgencyOS: Kalender og booking — de parkerte punktene i Precision Athletics](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1010) — `claude/a4-parkert` · utkast
- [#1004 · WANG og Team Norway: skjermene portert til kode](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1004) — `claude/port-wang-tn-2026-09-29` · utkast
- [#931 · docs: standard årsplan Junior 16 år (fagutkast, under avklaring)](https://github.com/akgolfsoftware/Golf_Headquarters/pull/931) — `claude/arsplan-junior-16` · utkast
