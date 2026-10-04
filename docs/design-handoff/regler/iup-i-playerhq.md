# IUP i PlayerHQ · uten dobbeltfunksjoner (04.10.2026)

Gjelder bare spillere med PlayerHQ-profil i en WANG Toppidrett- eller Team Norway-gruppe. Andre spillere ser ingen IUP-elementer. Ender medlemskapet, skjules alt merket «IUP» med en gang.

Regel: finnes funksjonen i PlayerHQ, brukes den. IUP legger bare til det som mangler.

## Gjenbrukes uendret
| IUP-del | PlayerHQ-skjerm |
|---|---|
| Profil, mitt team, helse (IUP-01–03) | PH-24 Meg |
| Periodisering, uke, økter (IUP-07–09) | PH-10 Plan · PH-11 Workbench |
| Gjennomføring og dagbok (IUP-10/16) | PH-04–PH-07 |
| Teknisk plan, fysisk program (IUP-13–15) | PH-TP-01 · PH-06 |
| Tester og scorekort (IUP-12/17/18) | PH-14 · PH-15 · PH-16 › Tester (ett batteri) |
| Felles testdag | PH-01 agenda → PH-15 |
| Konkurranse (IUP-08) | PH-16 › Snittscore (turneringsresultater) |
| Forslag fra WANG/TN | PH-21 Innboks (merket avsender, Godta · Avvis) |
| Samlinger | PH-10 Plan (treningssamling B7) + invitasjon i PH-21 |

## Utvides (samme skjerm, IUP-tillegg)
| Skjerm | Tillegg |
|---|---|
| PH-01 I dag | Kort «Utviklingssjekk» (hver fjerde uke) og «Sesongevaluering» (uke 42). Allerede i skjermlisten, runde 31 |
| PH-11 Workbench › Målsetninger | IUP-måltall 2026/27 per kvartal (37 rader), auto/egen, årsresultat først med fire kvartaler |
| PH-27 Deling | Innsyn fra gruppe vises som automatisk: «WANG Oslo ser profilen din fordi du er i gruppen». Ingen Gi/Trekk for gruppeinnsyn. AK-coach, foresatt og AU-06 som før |

## Nye skjermer (komplett design)
| ID | Skjerm | Innhold |
|---|---|---|
| PH-IUP-01 | Utviklingssjekk | Nivå (Ung 34 · Junior 43 · Amatør 47 · Profesjonell 38), sju kategorier, skala 1–5. Ett spørsmål eller én kategori om gangen, autolagring, lever, levert. Sammenligning mot forrige runde per kategori. 2025-historikk vises for seg, ikke sammenlignet |
| PH-IUP-02 | Sesongevaluering | 3 fritekst + 10 spørsmål (1–4) + tidsfordeling 100/100 % + minst tre tiltak. Tiltak kan bli prosessmål i Målsetninger |

Tilstander for begge: ny, utkast, lagringsfeil i kø, levert, ny runde. Begge nås bare fra kortene i PH-01 og fra Målsetninger, ingen egen fane.

## Utgår (arkivert 04.10 i arkiv/, se arkiv/IUP-ARKIV.md)
- `ui_kits/iup-komplett/` spillerdel (eget skall, fanen Målsetning, egen deling): erstattes av over.
- `ui_kits/iup-komplett/deling-navngitt/`: slås inn i PH-27.
- `ui_kits/iup-excel/`: arkiveres.
- Trenerdel TR-01–24: AK → AG-08 Spiller 360 › IUP. WANG/TN → overlevering/overforing-wang-tn.md.
