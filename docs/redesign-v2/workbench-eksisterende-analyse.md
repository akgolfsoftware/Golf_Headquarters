# Workbench — analyse av eksisterende prototype (agencyos)

Kilde: Claude Design-prosjektet `ui_kits/agencyos/workbench-*`. Grunnlag for forenklet v2 (`ui_kits/v2/wb.jsx`).
Mål: raskere, enklere treningsplanlegging uten å miste funksjon.

## 1. Funksjonsinventar

- **Zoom-nivåer:** Årsplan → Måned → Uke → Økt (4 pills). I tillegg 3 skjulte nivåer gjemt i «Verktøy»-menyen: Fysisk, Utviklingsplan, Tester. Uke er standard.
- **Årsplan/periode-inspektør:** 7 perioder (Base…Overgang) med pyramide-budsjett (sum 100), fase-mål, turneringer.
- **Måned:** 6×7 rutenett, uke-nr drill-down, område-fargede økt-pills (ekte uke 25), last-tetthet for andre uker, turnering-diamant, P-milepæl-chips, `+`-knapp per dag.
- **Uke (kjernen):** 3-kolonne — venstre `Palette` (coach), midt `TimeGrid` (dra-og-slipp), høyre `BalanseRail`.
- **Økt-zoom:** drill-tidslinje (tid · drill · intensitet/CS) + AK-formel/CANON-`Inspector` til høyre. Dupliser/Lagre/Gjenta/Fjern-knapper.
- **AK-formel (6 akser):** pyramidArea (FYS/TEK/SLAG/SPILL/TURN), lFase (læringstrinn L_KROPP→L_AUTO), miljo (M0–M5 situasjon), csNivaa (køllehastighet CS50–100), pressureLevel (PR1–5), pPosisjoner (P1–P10, multi). FYS-økter bytter CS mot treningstype.
- **Plan-livssyklus:** DRAFT → PENDING_PLAYER → ACTIVE/REJECTED. Coach `Publiser` (dialog), spiller `Godkjenn/Avvis`.
- **CANON-invarianter (9):** hard/myk regler (TEK-min, pyramide-maks, CS-tak, volum-uke, hviledag…). Aldri sperre — «varsle og veiled». Overstyres med begrunnelse som logges.
- **Plan-kvalitet:** live-score 0–100 (regnes på nytt UNDER dra), teller sterke/myke avvik + beholdt. `Gjennomføring`-tall (done %) er «andre-tallet».
- **Composer:** `SessionComposer` (ny/dupliser/gjenta) modal — tittel, dag, tid, varighet, akse, CS/fys-type, sted, øvelser, gjenta-regler, TrackMan-drill-forslag. Lagre som standardøkt.
- **Bibliotek:** `LibraryGallery` — søkbart, faner Maler/Standardøkter/Driller + akse-filter (~38 enheter). `MalDetalj` viser mini-uke + effekt på pyramide/volum FØR mal brukes.
- **DnD-soner:** dra økt mellom dager (live re-scoring), slipp drill fra palett → composer. `Flyttet`-strip med ANGRE (undo).
- **Tester:** TESTBIBLIOTEK (PEI/CS/Bane/Fysisk) + TESTPLAN på tidsakse, attestering.
- **Fysisk (FYS):** eget program, 5 treningstyper (Styrke/Bevegelighet/Kondisjon/Mobilitet/Aktivering).
- **Utviklingsplan:** P-milepæler (P3–P8) knyttet til uke/akse/status.
- **AI (tre innganger):** rail-`AiPlanner` (ghost-økter «Bygg uke mot NM»), `DiffOverlay` (bytt-forslag med effekt), `ColdStart` (forhåndsutfylt AI-utkast).
- **Verktøyvelger:** dropdown-«command palette» — interne zoom + 1:1 plattform-moduler (Drill-bibliotek, Turneringer, Kalender, Plans-kanban).
- **BalanseRail (persistent):** Neste viktig, valgt økt, ACWR-graf (28d), SG-elv + 4 sub-akser, pyramide m/mål-strek, ukevolum-segment, AI-medplanlegger, plan-mål m/progresjon, spiller-forespørsler, datakilde-synk.
- **Rolledeling:** coach = full redigering; spiller = les + be om endring/godkjenn. `role`-prop styrer alt.

## 2. Sterkt (behold/viderefør)

- Zoom-lerretet År→Måned→Uke→Økt er den riktige mentale modellen — behold.
- Live plan-kvalitet som reagerer MENS man drar er verdifullt og sjeldent.
- «Anbefaling, aldri sperre»-prinsippet + overstyring-med-begrunnelse.
- `MalDetalj`: se effekt på pyramide/volum før mal legges inn — utmerket, unngår overraskelser.
- Dra-fra-palett + Flyttet-strip med ANGRE = direktemanipulasjon.
- ColdStart som forhåndsutfylt AI-utkast (ikke tomt lerret).
- Gjenta-økt med full frekvens/slutt-regel.

## 3. Hva gjør planlegging TREG / KOMPLEKS

- **Topp-båndet er overlesset:** 8+ cellede kolonner (hero, rolle, spiller, zoom, verktøy, plan-kvalitet, gjennomføring, KPI, handlinger, DEMO-celle) — høy kognitiv last.
- **Zoom splittet i to steder:** 4 pills + 3 skjulte nivåer i Verktøy-menyen. Uforutsigbart.
- **Tre parallelle AI-innganger** (rail-ghost, DiffOverlay, ColdStart) = tre mentale modeller for «la AI hjelpe».
- **Full økt = tung modal:** SessionComposer har mange AK-formel-felt; å spesifisere en økt krever åpne slot/bibliotek → modal → fylle → lagre (flere klikk).
- **Redundans:** «Ny økt», palett-drop, bibliotek, dupliser, gjenta og mal er 6 veier til «legg inn økt» — overlappende.
- **BalanseRail er svært lang** (9 seksjoner) — mye scrolling, konkurrerer om oppmerksomhet under selve planleggingen.
- **DEMO-stillas** (pageState + scenario-select) blandet inn i produksjons-chrome.

## 4. Ti forenklingsgrep (prioritert)

1. **Rydd topp-båndet til én linje:** spiller + zoom + plan-kvalitet-tall + primær-CTA. Flytt KPI/gjennomføring inn i rail. Fjern DEMO-celle fra produksjon.
2. **Samle AI til ÉN inngang:** «Foreslå uke»-knapp som gir redigerbart utkast (ghost) inline — dropp DiffOverlay/ColdStart som separate modeller.
3. **Inline økt-redigering fremfor modal:** klikk økt → rediger AK-formel-chips direkte i Inspector (som v2 gjør), ikke full-modal for hver endring.
4. **Én «Legg til»-handling:** ett søkbart palett-panel (standardøkter/driller/maler/fysisk) som er kilde for både dra-inn OG klikk-inn — fjern de 6 parallelle veiene.
5. **Smart-defaults ved ny økt:** arv akse/CS/sted fra periode-mål + forrige økt, så ny økt er 1 klikk unna ferdig.
6. **«Gjenta forrige uke» / bulk-mal-drop:** ett trykk kopierer forrige uke som utgangspunkt — raskeste vei til en full uke.
7. **Hurtigtaster:** N=ny økt, D=dupliser, R=gjenta, ⌘K=palett/søk, piltaster mellom økter (finnes ikke i dag).
8. **Kollaps rail til sammendrag:** vis ACWR/pyramide/volum som 3 kompakte tall som ekspanderer på klikk — behold dybden, skjul til bruk.
9. **Behold live-scoring + ANGRE**, men vis avvik som ÉN `InnsiktChip` med handling (som v2), ikke lang BruddListe.
10. **Mal-drop beholder MalDetalj-forhåndsvisning** — det er raskt nok og forhindrer feil; ikke fjern det i forenklingen.

## 5. Kobling til v2 (`ui_kits/v2/wb.jsx`)

v2 har allerede: zoom-pills (År/Måned/Uke/Dag), rolle coach|spiller, venstre `Palett` (std/fys/maler/tek-faner), høyre `Inspector` (valgt økt + AK-formel-chips + Plan-kvalitet 87 + Publiser-CTA), DnD visualisert (slipp-sone lyser, brikke tiltet under drag), `MaalStripe`/`ZoomBrodsmule`, mobil-variant, egentrening-i-gruppeøkt, serie-ikon, `Hjelp`-tooltips, AI som én `InnsiktChip`. Dette treffer grep 1, 2, 3, 8, 9 — god retning.

Mangler i v2 i dag (må hentes inn fra prototypen for å ikke miste funksjon):
- **Økt-nivå/drill-tidslinje:** v2 stopper på Dag; ingen full økt-editor med drill-rekkefølge.
- **Composer-flyt:** ingen ny/dupliser/gjenta-skjema; paletten er statisk (grep 4/5/6/7 mangler — søk, smart-defaults, gjenta forrige uke, hurtigtaster).
- **Bibliotek-søk + MalDetalj:** palett-fanene er hardkodede lister uten søk/filter/effekt-forhåndsvisning (grep 10).
- **CANON-dybde:** kun ett anbefalings-chip; mangler overstyring-med-begrunnelse og publiser-dialog med logg.
- **Rail-datadybde:** ACWR/SG/pyramide-mål/volum/forespørsler/synk finnes i prototypen, ikke i v2-Inspector (grep 8 — ta inn som kollapsede tall).
- **ANGRE-strip** ved flytting (grep 9-støtte).

Neste steg: port drill-tidslinje + ett samlet søkbart palett + smart-defaults + hurtigtaster inn i v2, og løft rail-tallene inn som kompakt sammendrag.
