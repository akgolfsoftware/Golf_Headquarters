# Fullføring av Workbench og Excel-erstatning — 02.10.2026

Anders har bestilt gjennomføring av alle 82 oppgaver i 17 pakker. [Arbeidsregisteret](workbench-fullforing-2026-10-02.json) bevarer hele omfanget og skiller planlagt arbeid fra faktisk kodebevis. Ingen oppgave lukkes bare fordi en designprototype viser en knapp.

Denne arbeidskopien eier R06/R07 og avstemmer leveranser fra de aktive IUP/WANG/TN-, testbatteri-, statistikk- og pipelineøktene. Den skal ikke lage parallelle identitets-, tilgangs- eller testmotorer. Fersk PR- og kildekontroll gjelder før hver pakke.

## Valgt design

Precision Athletics, prosjekt 7d7c2994-cf63-4c5f-9bdc-fdaf67655a70. Anders har valgt kombinasjonen Sesongkart, Ukeverksted, Trenerbord og Analyse. Eksporten 02.10.2026 har SHA256 `9ded841b0f8696697534eb13dae882b3783d351014dae3a92e6e2bba4f042f07`. Den relevante kilden er `ui_kits/workbench-samlet/`, med overlevering datert 02.10. Designkilden er en prototype med syntetiske data; appens funksjon, lagring og visuelle godkjenning må kontrolleres separat.

## Pågående kode

1. Felles treningssummering: planlagt, faktisk registrert, ukjent, uttrykkelig legacyanslag og framtid holdes atskilt. Ingen planlagt tid som faktisk tid.
2. Delt dato- og visningskontekst: valgt uke, år, måned, periode og spiller følger navigasjonen. Gyldige datoer, ISO-ukeår og Oslo-grenser kontrolleres.
3. Ukeplan: lagring av prioritet, fokus, øktbudsjett og oppholdssted; fire nyere uketyper uten å skrive om historiske enumverdier.
4. Deretter portering av de fire valgte visningene og hele gjennomføringsreisen mot den eksisterende motoren.

## Kvalitetskrav og avgrensninger

Før commit: relevante funksjonstester, `npm run verify` og diffkontroll. Før merge: fersk GitHub CI. Reelle brukerreiser prøves med syntetiske kontoer i et separat lokalt miljø med tilgangsvaktene på. Mobil 390 og desktop sammenlignes med valgt design; Anders' visuelle vurdering føres separat.

Ingen ekte invitasjoner eller e-post sendes i kontrollen. Ingen DataGolf-data aktiveres for kunder uten dokumentert rett. Manglende faglige testregler oppfinnes ikke. Additive produksjonstrinn følger den stående bestillingen; produksjonsbevis føres etter faktisk utførelse.

## Kontrollerte delresultater 02.10 kl. 03:48

Kontekst- og integrasjonstestene kjører de faktiske hookene og hendelsene: ISO-årsskifte, uke 40→41, spillerbytte, null/utelatt, bevart utkast ved feil og lukking først etter bekreftet lagring. Separat lokal database og Auth med syntetiske kontoer bestod 10 prøver. To nettleserreiser på 390 og 1440 px bestod med innlogging, lagring, SQL-kontroll og gjenåpning. Appbilder og valgt referanse er bevart utenfor Git. Anders' visuelle godkjenning av den samlede nye appen gjenstår.

Kontoeksport inkluderer eierens ukeplaner. Anonymisering vasker ukenotat, oppholdssted og alle frie fokusfelt; gyldige strukturerte budsjetter bevares. IUP- og WeekPlan-endringer er samordnet uten å fjerne noen av dem. 36 målrettede personvernprøver bestod etter samordningen. Andre dokumenterte Workbench-unntak er fortsatt åpne. Full `npm run verify` bestod på Node 24 med 8 GB minnegrense: 4 039 funksjonstester, 36 komponentprøver og produksjonsbygg/Serwist. Registrerte 0 minutter gir også 0 belastningspoeng. CI og produksjonskontroll er egne, gjenstående steg.

Produksjonens eksisterende `week_plans` er kontrollert i kanonisk Golf_Headquarters (`dcnxoztjtdqoidaekxry`): RLS er aktiv, ny JSONB-kolonne finnes ikke ennå. Ingen produksjonsendring er utført. Lokal QA bruker et eget miljø og syntetiske kontoer.

Parallelle kildeleverser: PR 1077, 1078 og 1080 er merget. 1078 gir validering av de 13 kildebaserte sesongevalueringsspørsmålene; 1080 gir eieravgrenset besvarelseslagring med revisjoner. Spillerskjema og trenerlesing er egne, uferdige leveranser. Designprototypens omtale av 2025-skala som 1–8 er feil: kildekatalogen bruker originalskala 1–5. Gamle svar eller kildeår skal ikke omregnes.
