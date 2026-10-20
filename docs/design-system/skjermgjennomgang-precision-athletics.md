# Skjermgjennomgang — Precision Athletics

Kontrollert i nettleseren 30.09.2026. Katalogen er under konsolidering. Den brukes til foreløpig vurdering; endelig godkjenning krever at fullføringen er kontrollert og referanseversjonen er registrert. [Leveringsstatus](claude-design-konsolidering-2026-09-30.md) skiller opprinnelige feil, rapporterte rettinger og egen kontroll.

## Start med én skjerm

[Åpne PlayerHQ-katalogen](https://claude.ai/design/p/7d7c2994-cf63-4c5f-9bdc-fdaf67655a70?file=ui_kits%2Fplayerhq%2Findex.html). Velg **PH-01 · I dag** i «Skjerm». Den var åpnet på 390 px, Lyst og Data ved kontrollen.

Katalogens faktiske kontroller: Skjerm; bredde 390/768/1024/1280; Lyst/Natt; Data/Tom/Laster/Feil. Velg først 390, deretter 1280. Natt vurderes på de avtalte Live-/uteflatene. Kommenter utseende, innhold og hva som skal skje ved trykk hver for seg.

Skriv i denne chatten eksempelvis: «PH-01, 390 px, lyst: flytt dagsform over øktene» eller «PH-01: godkjent for denne versjonen». Codex registrerer den konkrete vurderingen og følger opp endringer. Et generelt «ser bra ut» skal ikke automatisk godkjenne alle tilstander og bredder. Anders har godkjent PH-01 i den viste mobiltilstanden med dialogen «Endring i dagens plan» åpen; se [godkjenningsregisteret](skjermgodkjenninger.md). Andre visninger registreres separat.

## Gjennomgangen utført av Codex

[Kontrollrapporten](../design-audit/precision-gjennomgang-2026-09-30.md) beskriver de konkrete avvikene, prøvde reisene og testgrensene. PH-12, Live → oppsummering og Oppsett ble deretter rapportert rettet av Claude Design. Teknisk fokus bevares som historikk når verdien ikke er gyldig. Disse endringene og den samlede leveransen skal kontrolleres mot ny eksport før de registreres som endelig byggegrunnlag. Codex' kontroll registreres som kontroll, ikke som Anders' godkjenning.

## Rekkefølge

1. Spiller: PH-01 I dag → PH-10 Plan → PH-03 Øktark → PH-04/05/06 Live → PH-07 Etter økt → PH-16 Stats → PH-24 Meg.
2. Coach: Cockpit → Stall/Spiller 360 → Stats → teknisk plan/oppgave/før–etter → Workbench → publisering → spillerens visning.
3. Booking, konto, forelder, tester og runderegistrering gjennomgås deretter som egne reiser, inkludert relevante mellomsteg.

Skjermer merket «utgår» skal ikke godkjennes som egne nye appskjermer. Behovet vurderes i den samlede inngangen som erstatter dem. Teknisk plan må få de manglende funksjonene før endelig godkjenning.

## Workbench fra tom plan

Denne nye reisen er bestilt og fortsatt under kontroll. [Workbench-kontrakten](workbench-fra-tom-plan.md) beskriver skjermene og handlingene; [WB2-kontrollen](../design-audit/workbench-wb2-teknisk-kontroll-2026-09-30.json) dokumenterer avvik i mellomversjonen. Den endelige gjennomgangen skal bruke samme fryste eksport som knappkartet.

1. Åpne Workbench og velg **Opprett årsplan → Tom plan**. Kontroller eget navn, sesong fra/til og at planen faktisk er tom etter lagring. Planvelger, sidefelt og overskrift må vise samme plan.
2. Legg inn perioder med type, datoer og valgfritt teknisk fokus. Legg inn **antall økter** for FYS, TEK, SLAG, SPILL og TURN; vurder tid separat. Tomt felt betyr ikke satt, mens valgt 0 betyr null økter. Som coach oppretter du først en eiertilknyttet teknisk plan dersom den mangler, og legger inn første oppgave. Som spiller bruker du «Be coach om teknisk plan». Fra TEK-budsjettet velger du deretter riktig teknisk plan, angir planlagte teknikkøkter per uke dersom kilden mangler tallet, og bekrefter overføringen. Oppgaver og repetisjoner skal ikke bli omregnet til økter.
3. Åpne måned og en av månedens uker. Kontroller kildeperiode og månedsbudsjett, som angis per uke. Månedens sum og uker uten budsjett vises separat. Ved overlapp velges grunnlaget synlig. Endre ukebudsjettet og prøv å bruke arvet budsjett igjen; kalenderøkter skal være bevart. Prøv også redigering av årsplanrammen, periodefjerning med bekreftelse/angre og mål med samme ID på de ulike nivåene.
4. Opprett økt på en valgt dato og tid. Velg dominerende pyramide, navn og varighet. Legg inn øvelser fra bank, mal eller egen øvelsesbygger, og kontroller at hver økt telles én gang.
5. Sett inn en teknisk oppgave fra riktig plan og revisjon. Åpne innhold og før/etter-medier; tilbake skal føre til samme økt og øvelse. En revisjonsoppdatering skal bare endre valgt instans.
6. Sett inn fysisk program med valgte programøkter og konkrete forekomster. Kontroller dato, tid og programrevisjon, og at programkilden er bevart.
7. Legg inn turnering fra kalender eller manuelt. Velg faktiske runder og datoer, deretter forberedelse og reise. Bekreft hvilke runder som skal legges som konkrete TURN-økter med tid og varighet. Deltakelse eller runde uten kalenderinnsetting skal ikke lage en ekstra TURN-økt.
8. Prøv gjentakelse, kopi til annen uke, flytting, sletting og angre. Kontroller hva som endres i én forekomst og hele serien, og hva som skjer ved overlapp eller ulagrede endringer.
9. Som coach: velg innholdet som skal publiseres, kontroller mottaker og revisjon, og åpne spillerens publiserte visning. Andre utkast skal være skjult. Endring i utkast skal ikke endre den publiserte versjonen før ny publisering.

Gjenta samme oppgaver på mobil390 og desktop, og vurder åpne skjemaer samt tomt, lasting og feil. Kommenter gjerne «Workbench, steg4, mobil: …». Codex registrerer skjerm/overlegg, bredde og eksport for hver vurdering; nye kandidatflater er ikke automatisk godkjent av PH-01-godkjenningen.

## Når du godkjenner

Registrer skjerm-ID, referansefiler/eksport, versjon, dato, bredder, temaer, tilstander, brukerens kommentar og kjente avvik etter [skjermkontrakten](../../.claude/skills/ak-hq-design/assets/skjermkontrakt.yaml). Knytt den valgte designversjonen til [kodeoverleveringen](grok-build-overlevering.md) for Codex; senere rettinger får ny versjon. Knappmålene kan også leses av Grok Build.

Dette godkjenner designet. Etter bygging prøves handlinger, lagring, tilgang og publisering i appen, og faktisk app sammenlignes med den samme referansen. Klikkbar design med eksempeldata er ikke bevis på ferdig app.

[Oppryddingsstatus og kildeanalyse](../design-audit/precision-training-motor-2026-09-30.md). [Bestillingen til Claude Design og dens leveringsstatus](claude-design-konsolidering-2026-09-30.md).

## Ny variant etter konsistensretting

Claude Design har endret kontrastverdiene i de felles designverdiene. PH-01 med disse verdiene er en ny variant; den tidligere godkjenningen gjelder fortsatt det bevarte bildet og flyttes ikke automatisk. Gjennomgangsreiser og knappmål skal knyttes til samme eksportversjon når fullføringen er kontrollert.
