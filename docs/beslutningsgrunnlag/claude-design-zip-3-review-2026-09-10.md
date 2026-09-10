# Claude Design ZIP (3) — uavhengig kontroll

Kontrollert 10.09.2026 mot `Player HQ Train lock (2).zip`, appens fagregler og den versjonerte Excel-kontrollen. ZIP (3) er et arbeidsunderlag, ikke en automatisk godkjenning eller byggeordre.

**Konklusjon:** H2-03 v2 retter flere vesentlige feil fra forrige pakke. Den er fortsatt ikke klar til å porteres som komplett testregistrering. Retting av allerede registrerte verdier kan gi ugyldige fullførte resultater. Pakken er heller ikke en komplett designoverlevering for hele appen.

ZIP SHA-256: `b952d3350ba28659cbe7b2232b80141208161ce58adb0b73e2746aa996c11012`.

## Hva som faktisk er nytt

524 filer mot 495: 29 lagt til, ni endret, ingen fjernet. Tre av de nye filene er kilde/eksporter av samme **H2-03 v2**. De øvrige 26 er opplastet kontekst fra vår tidligere overleveringspakke under `uploads/`; de er ikke nye ferdigtegnede skjermer.

H2-02 har fått riktig tegnet bredde og måling av rammen. Den tidligere begrensningen klemte 1440-valget ned til forhåndsvisningens bredde. H2-03 v1 beholdes som utgått historikk. `HANDOFF.md` og `SCREEN-INDEX.md` er endret.

## Bekreftede forbedringer

- **Kildelesing:** tidligere feilpåstander om selvreferanser og manglende mål er trukket. Wedge-målene angis riktig i BJ5:BJ13; alle 27 PGA-mål finnes. Dette samsvarer med [vår Excel-kontroll](team-norway-excel-v3-kontroll.md).
- **8-ball blocked:** faktisk klikket. De første sju målene blir `10, 10, 10, 30, 30, 30, 20`, i riktig rekkefølge.
- **Fullføringskontroll:** koden validerer antall, manglende verdier og faste mål før vanlig fullføring. Kontroll av ufullstendige tester ligger nå også i logikken.
- **Lagringsspråk:** lokal lagring og simulert serverbekreftelse beskrives separat. Revisjonslagring er tydelig merket som et implementeringsbehov.
- **Ærlig status:** kartlagte, ikke bygde tester har ingen falsk knapp. Flere kontrollpunkter er merket «ikke prøvd» fremfor å bli meldt bestått uten bevis.

## Feil som må rettes før portering

| Prioritet | Funn og reproduksjon | Konsekvens og nødvendig retting |
|---|---|---|
| P1 | Velg Wedge Variation → start → fyll eksempel → fullfør → korriger → sett første carry til `-1`. Nettleseren lagrer `v=-1` med `status=fullfort`. Samme for `rest=-1` i 8-ball. | Ugyldig resultat behandles fortsatt som fullført. Bruk samme validering ved førstegangsregistrering, korrigering og revisjonslagring. `settRad()` kontrollerer bare nullverdier; `komplett()` mangler dessuten negativ carry. |
| P1 | Wedge-korrigeringen har ni carry-felt og V/H-knapper, men intet felt for størrelsen på sideavviket. | En feilregistrert sideavstand kan ikke rettes korrekt. Vis og valider både carry og side i korrigeringsdialogen. Tomt skal forbli manglende verdi. |
| P2 | Putt-korrigeringen har bare valgene 1, 2, 3 og 4; ingen tallfelt eller 4+-kontroll. | Førstegangsregistrering tillater fem slag eller mer, mens korrigering ikke gjør det. Begge steder må godta samme positive heltall. |
| P2 | Korrigeringsfeltene har gjentatte plassholdere, ingen knyttet etikett eller `aria-label`. Dialogen mangler dialogrolle, fokusflytting, fokusbegrensning og retur til åpneren. | Skjermleser og tastatur får utilstrekkelig kontekst. Gi forsøksnummer, mål og måleenhet i tilgjengelige navn, og implementer faktisk dialogatferd. |
| P2 | Ny v2 bruker samme `localStorage`-nøkkel som v1 og gjenoppretter hele JSON-tilstanden uten versjonsvalidering. | Gammel eller endret tilstand kan overtas. Legg til skjema-/protokollversjon, valider innhold ved gjenåpning og tilby trygg nullstilling/eksport ved avvik. |

De to negative verdi-scenarioene er **reprodusert med vanlige klikk og feltinntasting i Chromium**, med eksternt nettverk blokkert og syntetiske eksempler. Det var ingen JavaScript-feil i disse reisene. De øvrige funnene er kontrollert i DOM og kildekode; ingen skjermleser- eller fysisk enhetstest er påstått.

Relevante innganger i `H2-03 Testregistrering prototype v2.dc.html`: korrigeringsdialog rundt linje 408, `settRad` rundt 697, `komplett` rundt 714, `rettRader` rundt 930. Dette er linjer i vedlegget, ikke i appen.

## Format og brukervennlighet

Wedge-registreringen er åpnet på alle fire breddevalg i begge temaer. Innholdsbreddene er 320/390/834/1440 px; ytterbredden er to piksler større på grunn av kanten. Ingen intern horisontal overflyt ble målt i denne ene tilstanden. Desktop har to kolonner med 320/1120 px; iPad 270/564 px. Dette er ikke en test av samtlige skjermtilstander eller 200 % tekst.

Før en endelig designport anbefales to konkrete forbedringer: flytt celleadresser, filidentiteter og implementeringsforklaringer til kilde-/hjelpepanelet; behold testnavn, variant, mål og enhet i hovedflyten. På bred skjerm bør carry og side stå nær hverandre i et avgrenset registreringsområde, med tidligere forsøk ved siden av. Dagens svært brede felt og knapp gjør blikkflyten unødig lang. Dette er designforslag, ikke en ny låsing av utseendet.

## Fortsatt manglende overlevering

`handover/H1-DEKNINGSREGISTER.csv` er uendret: 478 rader, hvorav 193 venter på design, 127 arver mønster, 102 er tegnet, 50 er undersøkte videresendinger og seks er interne. Dagens repo har **479 sideruter**. Mønsterarv kan være riktig, men trenger en konkret kobling til komponent, variant, format og tilstand. Fil- og rutetelling er ikke det samme som antall nødvendige unike skjermdesign.

`SCREEN-INDEX.md` har to like oppføringer for H2-03 v2 og to for utgått v1. De eldre designverdiene, tomme leveransefiler og uavklarte versjonskoblinger fra [ZIP (2)-rapporten](claude-design-zip-2-review-2026-09-10.md) er ikke løst av denne differansen. Ikke velg eldre fonter eller farger automatisk på grunn av ordet «lock».

**Appkontrakt:** dagens TN-server avviser overskriving av avsluttede tester. Prototypens korrigering krever en egen, varig revisjon med hvem/tidspunkt/råverdier og tydelig virkning på historikk og talent. En lokal revisjonsteller er ikke denne funksjonen. Revidert eller ufullstendig resultat må aldri gi en ny standardscore som om det var en ny gjennomføring.

Anbefalt neste leveranse: rett funnene, fortsett H2-04 med øvrige beregnbare protokoller og fullfør den bestilte sammenhengende pakken for coach, booking, forelder og øvrige skjermfamilier. Bruk [den konkrete tilbakemeldingen](../design-system/claude-design-zip-3-tilbakemelding.md) sammen med den eksisterende komplette overleveringsprompten.
