# Turneringsresultater og verifisert spilleridentitet — 02.10.2026

## Endring

HQ koblet tidligere en ny eller eksisterende PlayerHQ-konto automatisk til en PublicPlayer når normaliserte navn ga nøyaktig én kandidat. Navn alene beviser ikke at profilene gjelder samme person, særlig i juniorgolf. Koblingen kunne derfor føre en annen spillers turneringsresultater inn på feil konto.

Koblingsjobben teller nå entydige navnekandidater som trenger identitetskontroll, men endrer aldri User.publicPlayerId ut fra navn. Kontoer med en eksisterende publicPlayerId fortsetter å få turneringsresultater speilet automatisk. Denne rettingen beviser ikke hvordan eldre koblinger ble etablert; de er ikke revidert. Uten en kobling returnerer profiloppdateringen statusen needsVerifiedLink og leser ikke kandidatens turneringsresultater.

## Verifisering

- Målrettede syntetiske prøver dekker navnelikhet med én kandidat, duplikate navn, konto uten verifisert kobling og fortsatt speiling for en eksisterende kobling.
- Nattens synkrapport viser antall navn som må kontrolleres uten å inkludere navn eller andre personopplysninger.
- Ingen produksjonsdata ble lest eller skrevet, og ingen pipeline ble kjørt.
- Målrettede prøver: 9 bestått. Full lokal npm run verify bestod med Node 24.21.0 og utvidet TypeScript-minne; bygg av 348 sider og Service Worker bestod. Diffkontroll og npm run prosjekt:sjekk bestod.

## Gjenstående for automatisk kobling

User.publicPlayerId er fortsatt HQs kanoniske turneringskobling. Kodegjennomgang 02.10 på `main` `30ee79fac` viser at adminhandlingen setter koblingen under rolle-/spilleradgang og skriver en auditpost med aktør og valgte profil-ID-er, men den ber ikke om eller lagrer hvilket identitetsbevis aktøren brukte. Auditposten dokumenterer handlingen, ikke identitetsriktigheten. Ingen produksjonskoblinger eller logger ble lest. Det finnes fortsatt ikke en spillerstyrt brukerreise som kobler konto til GolfBox/turneringsprofilen. Nye, ukoblede kontoer kan derfor ikke få automatisk resultatimport fra navnelikhet. Eldre koblingers opphav må revideres før de omtales som verifiserte. Neste implementering trenger et dokumentert bevisgrunnlag og en verifiserbar spillerstyrt kobling til unik profil, med trekk/korriger-historikk og prøver mot to personer med samme navn før automatisk speiling aktiveres.

Hovedplanens mål om automatisk oppdatering er dermed delvis oppfylt: automatisk speiling virker for profiler med eksisterende User.publicPlayerId; trygg identitetskobling for nye kontoer og revisjon av gamle koblinger gjenstår.
