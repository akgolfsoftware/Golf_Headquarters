# WANG og Team Norway oppgradering 12. oktober 2026

Arbeidsgrunnlag: main a1aa2b183, arbeidsgren codex/hq-complete-upgrade. Precision eksport 34, 3.1.0-l, D-47. Dette er kode- og kildeavstemming; visuell godkjenning, samlet bygg og publisering håndteres av hovedagenten.

## Implementert

WANGs coachside bruker hentWangGruppe og den reelle gruppekalenderen. Produksjonsreisen bruker ikke lenger WangIdag/WangTrening/WangElever/WangAdmin-demoene eller den gamle hardkodede coach-arsplanen. Den gamle visArsplan-lenken åpner den faktiske gruppeårsplanen. Historiske demokomponenter er beholdt som historikk/testgrunnlag, og produksjonsregisteret viser 18 aktive innganger.

WANG har I dag, År/Periode/Måned/Uke/Dag, skole/kompetansemål, samlinger/program, publiserte gruppeøkter, individuelle oppgaver, faktisk treningsmengde, spilleroversikt og aktuell delingsstatus. Skoletrinn hentes bare ved eksplisitt innlogget rosteroppslag. Publisering og aksept av samlingsprogram gjenbruker eksisterende SamlingsprogramKontroll og handlinger.

Delt WANG-profil har skrivebeskyttet planhierarki, teknisk plan, Stats for trening/test/runde og lenker til eksisterende IUP-samtale og turneringshistorikk. Samtlige personlige oppslag ligger i medWangElevData/medNavngittProfil-transaksjonen. Den eksisterende samtykketeksten NAVNGITT_KOMPLETT_PROFIL omfatter dette innholdet; ingen rettigheter ble utvidet. Automatisk vurdering av Stats ble først avvist og deretter godkjent etter konkret kontroll av denne samtykketeksten og ressurslåsen.

WANGs coachinnboks publiserer eksisterende gruppeposter. /team-wang/meldinger viser samme innhold med WANG-merkevaren for aktivt medlem eller godkjent foresatt. Private vedlegg bruker eksisterende private nedlastingsrute. Postkvittering forsøkes først når innlegget faktisk er synlig. Manglende gruppetilgang skilles fra tom innboks.

Team Norway har nasjonal WANG-testoversikt per skole → spiller/test. Planlagt, Fullført og Mangler kommer fra reelle tildelinger/testdagplasser. Fullført krever et koblet resultat for samme spiller og test. Null tildelinger gir ukjent leveringsgrad. Forfall gjelder slutten av Oslo-dagen; aktive testdager regnes ikke som manglende mens føringen pågår. Notater, helse og individuelle planer hentes ikke via testsamtykket.

Team Norways gruppe-Dag henter bare den valgte datoen. Måned godtar også YYYY-MM. Individuelle oppgaver/gruppebelastning og utviklingssamtale har egne ruter; samtalen bruker eksisterende evalueringsgrunnlag og godkjenningsforslag. Oppsett og delingsoversikt viser faktisk gruppekontekst og navngitte profiler, og leder til eksisterende tilgangsadministrasjon.

Månedsplanen fra felles Workbench er koblet til WANG Måned, TN gruppe-Workbench Måned og TN Månedsplan med owner.kind=group og korrekt groupId. Ingen separat månedsmodell er opprettet her.

## Felles organisasjonsoppgaver

org-gruppeoppgaver.ts leser bare organisasjonens egne publiserte Workbench-originaler og aktive spillerkopier. Ny handling tilpasser tittel, mål og hovedakse på en urørt kopi. Dato/tid er ikke inndata. Den kontrollerer gruppe, medlemskap, originalens tidsvindu, versjon, øktstatus og fravær av registrering, med samme gruppe-/øktlås som publisering. Senere publisering overskriver ikke tilpassede kopier. Revisjonssporet inneholder ID-er, ingen fritekst/navn. Utenfor gruppetid brukes eksisterende spillerforslag.

Gruppebelastning viser faktisk registrerte minutter og reps. Planlagt varighet erstatter aldri manglende registrering. Faktisk null beholdes.

Gruppepostporten i tn-post.ts godtar WANG/TN gjennom orgGruppeWhere, men krever aktivt medlemskap i akkurat mottakergruppen. Personlig TN-postdeling er uendret. Filtype-/størrelses-/origin-/nedlastingskontroll er bevart. Ingen ekte poster, invitasjoner, betalinger eller produksjonsdata er opprettet av denne agenten.

## Merkevare

Begge organisasjonslayoutene bruker pa-root og data-org. D-47-farger, ord-fonter og geometri brukes gjennom innholdet. WANG: Montserrat/Quattrocento Sans, kort 4 og kontroller 8. TN: Jost/Lato, kort 0, kontroller 2, dialog 4. Data følger IBM Plex Mono. TN-rød er D40E3A; eldre D70232 er erstattet i det aktive tokenlaget. Lys organisasjonsflate beholdes. Statusfargene følger Precision. WANG har faktisk hvit logo fra eksporten. DataGolf-lenken er fjernet fra TNs normale organisasjonsmeny.

## 18 WANG innganger

| ID | Faktisk rute og mønster |
| --- | --- |
| WG-01 | /team-wang/coach?omraade=idag · faktisk dag/gruppeøkter |
| WG-02 | /team-wang/coach?omraade=elever · roster, trinn, navngitt profil- og testsamtykke |
| WG-03 | /team-wang/coach/spiller/[elevId] · delt profil/plan/teknikk/Stats |
| WG-04 | /team-wang/coach?omraade=trening · hele planhierarkiet |
| WG-06 | /team-wang/coach/tester · eksisterende samtykkede resultater |
| WG-07 | omraade=konkurranse + /coach/turneringer/[elevId] |
| WG-08 | omraade=meldinger og /team-wang/meldinger · samme gruppeposter/vedlegg |
| WG-09 | omraade=meldinger · eksisterende TrenerforslagSkjema |
| WG-10 | omraade=admin · sportssjef + eksisterende gruppe-/rolleadministrasjon |
| WG-11 | omraade=elever · aktuell, selvstendig profil-/testdeling |
| WG-12 | omraade=trening&fane=skole og fane=periode · faktiske skolehendelser/kompetansemål |
| WG-14 | fane=samlinger · faktiske datoer, program/reisetekst og samlingsaksept |
| WG-15 | fane=oppgaver · publiserte gruppekopier, individuelle oppgavemål |
| WG-16 | fane=belastning · registrert tid/reps, ingen antatt helseverdi |
| WG-17 | /coach/iup/[elevId] · eksisterende IUP-samtale/versjonert spillerforslag |
| WG-WB | /coach/spiller/[elevId]?fane=plan · skrivebeskyttet planhierarki |
| WG-TP-01 | /coach/spiller/[elevId]?fane=teknisk-plan · faktiske P-posisjoner/oppgaver |
| WG-04-OKT | fane=dag · publisert gruppeøkt i detalj med faktiske øvelser/oppgaver |

## 22 Team Norway innganger

| ID | Faktisk rute og mønster |
| --- | --- |
| TNG-01 | /team-norway · eksisterende Oversikt med felles D-47-skall |
| TNG-02 | /team-norway/spillere · eksisterende, aktuelle navngitte profiler |
| TNG-03 | /team-norway/spiller/[spillerId]/oversikt + spillerfaner |
| TNG-04 | /team-norway/samlinger/[id] · eksisterende samlingsprogram/aksept |
| TNG-05 | /fellestesting og /wang-resultater · testdager/nasjonal levering |
| TNG-06 | /turneringer/[id] og /turneringer · faktisk katalog |
| TNG-07 | /rangliste og /referansenivaer · eksisterende kildevisninger |
| TNG-08 | /analyse · kompatible faktiske testmålinger |
| TNG-09 | /uttak · eksisterende kriterier/vurderinger |
| TNG-10 | /workbench?spiller=[id] · eksisterende godkjenningsforslag |
| TNG-11 | /[groupId] og /spiller/[id] · eksisterende gruppe-/personlige poster |
| TNG-12 | /tilgang og /apparatet · eksisterende roller/invitasjoner |
| TNG-13 | /oppsett · gruppekontekst, faste rettigheter og eksisterende adminveier |
| TNG-WB | /workbench?spiller=[id] · navngitt personlig innsyn/godkjenningsforslag |
| TNG-14 | /lisens-okonomi · eksisterende faktiske lisensstatus per spiller/år |
| TNG-15 | /deling · aktuelle navngitte profiler og separat WANG-testdeling |
| TNG-16 | /college · eksisterende faktisk collegeoppfølging |
| TNG-17 | /manedsplan og /workbench?visning=maned · felles MonthPlan |
| TNG-18 | /oppgaver · individuelle oppgaver i publisert gruppetid/samling |
| TNG-19 | /belastning · faktiske gruppekopier/logg |
| TNG-20 | /spiller/[spillerId]/samtale · reelt evalueringsgrunnlag + avtalt godkjenningsforslag |
| TNG-TP-01 | /spiller/[id]/teknisk-plan/[planId] · eksisterende teknisk plan, D-47 |

Dette kobler inngangene til kode. Det er ikke en påstand om at alle varianter er visuelt godkjent eller produksjonsprøvd.

## Kontroller og konkret gjenstående

76 målrettede tester passerte etter siste funksjonsbatch: WANG rolle-/gruppe-/delingsporter, roster opt-in, datagruppe-mismatch, individuelle oppgavers tidsgrenser/versjon/start, gruppeposter, testsamtykke/trekking/under 16, samlingspublisering/aksept og private filer og eksisterende posthandlinger/påminnelser. 16 eksisterende komponenttester passerte. Målrettet lint var grønt. Full tsc/verify/bygg er overlatt til root, og ingen commit/push er gjort.

Visuell rigg: tests/visual/precision/skjermer/ORG.tsx: wang, wang_uke, wang_tom, tn, tn_tom. Bare syntetiske data; felles org-/MonthPlan-actions må stubbes som øvrige rigg-actions ved Vite-kjøring. Orgfontene må lastes av riggen eller kontrolleres på den faktiske Next-ruten.

Root må ferdigstille:

- Samlet typekontroll, bygg, tilgangsreview, faktisk nettleserprøve og visuell vurdering av samme leveranse.
- Nye ruter må inngå i de genererte rute-/prosjektregistrene. Eksportens konseptadresser er mappet til canonical-rutene over; alle alternative eksportadresser er ikke opprettet som omdirigeringer.
- Felles MonthPlan-lagringen/produksjonsskjemaet eies av root/player_coach_complete.
- Fysisk telefon, sollys, VoiceOver og faktisk zoom er ikke prøvd av denne agenten.
- TNG-utviklingssamtalen lagrer avtalt tiltak i eksisterende godkjenningsforslag; den har ingen separat frittstående samtale-/evalueringsmodell. Strukturert reiseøkonomi/overnatting inngår ikke; faktisk samlingsbeskrivelse vises. Kull som egen årgang finnes ikke i WANG-projeksjonen; faktisk skoletrinn vises.
- WANGs åpne årsplan/fellesside er bevart og får D-47-tokens. Den eldre årsplanens statiske faginnhold er ikke byttet ut med den private coachens plan.
- Innholdsikoner i eldre TN-komponenter bruker fortsatt enkelte Lucide-importer. De må sammenlignes med det lukkede 20-ikonsettet i den visuelle gjennomgangen; menyens unntak gjelder fortsatt.

Nye private ruter og kode endrer ikke tilgangsregler, samtykker, helsefelt eller eksisterende produksjonsdata.
