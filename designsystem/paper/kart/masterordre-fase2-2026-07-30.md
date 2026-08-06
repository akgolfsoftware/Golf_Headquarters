# MASTERORDRE — Fase 2: komplett designleveranse for AK Golf HQ

Skrevet 30.07.2026 fra Claude Code. Dette er arbeidsprompten for Claude Design.
Målet, i eiers ord: komplett designsystem, wireframes av alle skjermer for mobil
og desktop, og ferdig designede skjermer — slik at portering til kode
(`~/Developer/akgolf-hq`) kan starte umiddelbart etterpå, flate for flate.

**Kildehierarki (ved konflikt vinner den øverste):**
1. `readme.md` — systemreglene (Fase A). Ingen regel der oppheves av denne ordren.
2. `guidelines/handover-agencyos-2026-07-30.md` — AgencyOS-kontrakten: skall,
   nivåer, skjermregister S1–S15, komponentregister K1–K12, byggerekkefølge,
   leveransekrav. **Les den i sin helhet før noe annet.**
3. `kart/restanse-systemspor-2026-07-30.md` — **systemsporet**: de syv portene
   P1–P7, Bolk 0 (seks gulvpunkter), portmatrisen gammel kanon → Claude Paper
   (bølge P1–P9, ~73 netto nye komponenter), og innholdsforslagene for de ni
   utsatte seksjonene. Eiers beslutning 30.07: **hele den gamle kanonen portes**
   (alle 124, som anatomi — aldri stil), Bolk 0 først, og seksjonsforslagene i
   dens avsnitt 5 behandles nå.
4. `kart/arbeidsordre-komplett-system-2026-07-29.md` — skjermsporet: nevneren
   (223 skjermer), eiers beslutninger 29.07, fasene B1–B4 for hele plattformen.
5. `docs/designdekning-2026-07-29.md` i repoet — filsti-bevis per skjerm:
   hvilken V2-komponent i koden som er innholdsfasit for hver flate.

**To spor, to nevnere, rapporteres alltid sammen:** skjermsporet måles mot **223**
(2 levert, 0,9 % [målt 29.07]), systemsporet mot **151 komponenter** (63 levert,
42 % [anslag]). «Dekning x/223 · y/151» i hver fremdriftsrapport.

## Rekkefølgen (avhengighetsstyrt — ikke hopp over trinn)

### Trinn 0 — dekningsvurdering + Bolk 0 (blokkerende)
Handoverens avsnitt 9 først: svar på de fire målespørsmålene før noe bygges.
Deretter **hele Bolk 0 slik den står i restansens avsnitt 2** (seks punkter — den
lista er nyere og mer presis enn `ordre-gulvretting-v2.md` alene): gulvregel.md ·
SkipLink-unntaket avgjøres · Topbar-søkefeltet (20,9 px, klasseløst — nytt funn 30.07) ·
BottomSheet-fokusnoden · riggen med selvtest inn i portsjekkene · viewport-hybridene
i KpiCard/KpiStripe/ListRow/StatusBadge. I tillegg dokumentrettelsene fra
gulvrettingsordren (302/174 → 350/0, dobbeltlistene i readme, Input-avviklingen,
scrim-tokenet, Rail-fargene). Bolk 0 er lukket når riggen kjører grønt med selvtest
og gulvregel.md navngir hvert unntak.

### Trinn 1 — wireframes, ALLE skjermer, begge formater
Før hi-fi: ett wireframe-galleri per produkt, som `.card.html`-kort i `kart/wf/`
(uten `@dsCard` om de ikke skal kompileres — jf. `kompilerte-filtyper.md`).
Gråtoner + tokens, ingen pynt. Hvert kort viser **860 px OG 430 px** stakket.

Omfang og gruppering (fra arbeidsordren og handoveren):
- **AgencyOS:** S1–S13 + S15 (S14 marketing-editor er ute av runden) + spillerprofilens
  fem faner i begge innfatninger (panel + full flate) + Workbench tre soner.
- **PlayerHQ (113 ruter → ~12 maler):** Hjem/I dag (finnes) · Analyse (5 faner) ·
  TrackMan · Gjør/økt · Workbench/Planlegge · liste+detalj-malen ·
  meg/innstillinger-malen · fullskjerm-malen (live økt, runde, test, feiring) ·
  Gameplan/baneguide · kalender · booking · coach-hub.
- **Foreldreportal (11 ruter → 1–2 maler):** lese-først-mal + samtykke/økonomi-variant.
- **Auth (12 ruter → 1 mal):** kort-sentrert. (`CodeInput` fra bølge P2 er avhengighet.)
- Klubbflatene er UTE (egne prosjekter, eiers beslutning 1, 29.07).

Innholdsfasit per wireframe er V2-komponenten i repoet (filstier i
`docs/designdekning-2026-07-29.md` del 1–5) — design den virkelige jobben, ikke en
idealisert. **De ni utsatte seksjonene:** innholdsforslagene står i restansens
avsnitt 5 og er til behandling hos eier NÅ (beslutning 3, 30.07). Wirefram hver
seksjon etter forslaget, men merk seksjonens åpne beslutningsspørsmål i kartfila —
de ni spørsmålene (snooze-tilstand, timegrunnlag-runde, gebyrsynlighet,
selskapsfilter, varelager-plassering, publiseringsrolle, synlig sorteringsgrunn,
les/kjør-på-nytt, fullskjerm-exit) låses av eier før hi-fi, ikke før wireframe.

**Port for trinn 1:** eier godkjenner wireframe-galleriene per produkt før hi-fi.

### Trinn 2 — komponentene (systemsporets bølger, skjermdrevet rekkefølge)
Bølgerekkefølgen fra restansens avsnitt 4 gjelder: **P1 skall** (Composer, StatusBar,
CommandPalette, Popover/Tooltip/Drawer sammen — siste fokuskontrakt-konsumenter —
Divider, Skeleton, FAB) → **P2 skjema** (Select, Combobox, Radio, Slider, DatePicker,
CodeInput) → **P7 TrackMan** → **P4 kalender** → **P3 tabell** → **P5/P6/P8/P9**.
Handoverens K1–K4 (QueueCard/ProvenanceDisclosure, StatTile etter måling, SessionCard,
BudgetBar) flettes inn der skjermrekkefølgen krever dem — K1 før hi-fi av S2 Kø.
Portingsregelen (restansen 3.3) gjelder alt: anatomi portes, stil aldri.
Leveransekravene i handoverens avsnitt 8 gjelder hver eneste komponent — alle seks
artefakter, tilstandsmatrise, målt korthøyde, assertions sett feile først, P1–P6
sjekket; P7 krysses av verifikatør.

### Trinn 3 — hi-fi-skjermer i porteringsrekkefølge
Hver skjerm leveres som `.dc.html`-template i `templates/<navn>/` (samme format som
de to som finnes) + registrering i readme-indeksen. Rekkefølgen er valgt så koden
kan portere fortløpende, høyest verdi først:

1. **AgencyOS S2 Kø** (produktets hjerte) → 2. **S1 Hjem** (revider eksisterende
   dashboard-template mot nytt skall) → 3. **S3 Stall + spillerprofil** (fem faner,
   begge innfatninger) → 4. **S5 Workbench** → 5. **S4 Kalender** → 6. **S6 Alt**.
7. **PlayerHQ Analyse** (tar golfviz-familien i ekte bruk — første test av 9 ubrukte
   komponenter) → 8. **PlayerHQ TrackMan** → 9. **Gjør/økt + fullskjerm-malen** →
   10. **liste+detalj-malen** → 11. **meg/innstillinger-malen** → 12. **PlayerHQ
   Workbench**.
13. **Foreldreportal-malen** → 14. **Auth-malen**.
Deretter restene: Gameplan, kalender PHQ, S7–S13/S15 etter bølge P3–P5-komponentene.

**Port for trinn 3:** per skjerm — Port A-kravene (begge moduser × alle tilstander ×
to containerbredder), verifikatør-måling etter fersk bundle, craft-vurdering mot
referansen. En skjerm uten målt verifisering er ikke leverbar til portering.

## Rapportering
Etter hvert trinn: oppdater `kart/fremdrift-fase2.md` med «Dekning x/223 · y/151»,
hva som er klart for portering, og hva som venter på eier (de ni
seksjonsbeslutningene, wireframe-porter, P7-verifisering). Samme [målt]-disiplin
som revisjonen 29.07: ingen grønn påstand uten måling.

## Forventningsstyring (til eier, ærlig)
Med portene i denne ordren er «alle 223 skjermer hi-fi i morgen» ikke oppnåelig —
og skal ikke være målet. Målet for første leveranse er: trinn 0 (Bolk 0 lukket) +
wireframe-galleri for AgencyOS og PlayerHQ + de første 3–4 hi-fi-skjermene i
porteringsrekkefølgen. Det er nok til at koding kan starte på Kø/Hjem/Stall mens
resten designes fortløpende — lanseringsklar app bygges flate for flate, ikke i
ett sveip.
