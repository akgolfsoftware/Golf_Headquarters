# Overføringskontrakt til WANG Golf UI prototype og Team Norway App delivery (02.10.2026)

Selvstendig: mottakerprosjektene har ikke tilgang til filer i Precision. Bruk egen designprofil (TN: Jost/Lato, mono-tall, marineblått, #D70232; WANG: eget system). Samme data, regler og tilstander. Ingen ekte deling, invitasjon eller betaling.

## Felles regler
- Én spiller, én IUP. Trenere leser samme lagrede svar og revisjon; personlig plan endres bare via forslag spilleren godtar (én gang; avvis = ingen endring; utdatert basis = konflikt).
- Innsyn (04.10.2026): automatisk når spilleren har PlayerHQ-profil og ligger i en WANG- eller Team Norway-gruppe. Ender medlemskapet, skjules IUP og innsyn med en gang. Full profil eller bare tester. WANG→TN testdeling gjelder uten TN-medlemskap. Annen skole: bare felles testdag. Helse kun ved uttrykkelig omfang.
- Tall: null = — (ukjent), 0 = målt null, fremtid = kommer. Brutto score. Putting i fot, ellers meter. PEI vises i prosent (0,05 = 5 %). Halve poeng bevares (12,5). Ufullstendig test er utkast, ikke resultat. Retting gir ny revisjon med årsak.
- IUP 2027: Ung 34, Junior 43, Amatør 47, Profesjonell 38 (1–5, sju kategorier). Sesongevaluering 3 fritekst + 10 (1–4) + tidsfordeling 100/100 % + minst tre tiltak. Utviklingssjekk 2025 er også 1–5, med 34/41/41/38 spørsmål; sesongevaluering 1–4 i begge år. 2025-svar beholdes med kildeår og sammenlignes ikke spørsmål for spørsmål med 2027.

## Skjerm → tilstand → handling → data
| ID | Skjerm | Tilstander | Handling | Data |
|---|---|---|---|---|
| TR-01 | I dag | ingen oppgaver, oppgaver | åpne oppgave | evaluering, forslag, testdag, synk |
| TR-02 | Spillerliste | full, bare tester, venter foresatt, trukket, annen skole, ingen | filtrer skole/gruppe, åpne | Player, Consent |
| TR-03/04 | Profil + IUP i arbeidsbokens rekkefølge (IUP-01–18) | full / testprofil / ingen | åpne del | IUP-svar (versjon, revisjon) |
| TR-05 | Utviklingssjekk og sesongevaluering (les) | utkast, levert, historikk | — (spilleren svarer) | IUP-svar |
| TR-06 | Målmatrise (37 rader, Q1–Q4 okt–sep) | —, auto/egen | foreslå mål | Mål |
| TR-07/19 | Forslag | sendt, konflikt, godkjent, avvist, trukket | send, trekk, oppdater | Planforslag |
| TR-09 | Samling | utkast, publisert, ny versjon | publiser, endre, avlys, oppmøte | Samlingsprogram, invitasjon per spiller |
| TR-10/12/13 | Testmatrise + detalj | ikke levert, revisjon | rett med årsak | Resultat (rådata, revisjon) |
| TR-11 | Felles testdag | planlagt, publisert, venter/pågår/levert | velg skoler/grupper, tildel, stasjonsføring | Testdag, stasjon, tildeling (dedup) |
| TR-15/16/23 | Konkurranse og pipeline | koblet / ikke koblet, samme navn, DNS/WD/CUT, kø | bruk kildekorreksjon | Konkurranseresultat (kilde-ID, revisjon) |
| TR-17 | DataGolf | se DG-kontrakt (datagolf-komplett/overlevering.md, gjengitt: DG-01–17 med normal/tom/delvis/feil/ingen tilgang/forsinkelse) | analyse → forslag | DataGolf-måling |
| PH-01/13–15/18/26/27 | Spillerens I dag, Målsetning, Stats, Meg | som over | svar, lever, godta/avvis | samme |

## WANG-særfunksjoner som skal legges til i WANG-prosjektet
Seks hovedinnganger (I dag, Trening, Tester, Konkurranse, Meldinger, Elever) + Administrasjon for sportssjef; skoler/kull/trinn, morgenøkter og oppmøte, kompetansemål, avgrenset tverrskole-innsyn kun via testdag.
## Team Norway-særfunksjoner
Landslagsgrupper, samlinger, nasjonal WANG-testoversikt med leveringsgrad (også elever uten TN-medlemskap), landslagsklasse ved siden av AK-kategori, «bare testinnsyn» som fullverdig profilvariant.
