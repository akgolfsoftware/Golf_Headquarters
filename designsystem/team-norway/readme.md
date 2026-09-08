# Team Norway Golf — designsystem

Designsystem for Norges Golfforbunds toppidrettssatsing. Bygget fra bunnen av rundt logoens to farger, med Team Norway-uttrykket som referanse for mørke flater og grafisk temperament.

Systemet arver **ingen** visuelle valg fra tidligere PowerPoint-, Word- eller Excel-materiale. Det materialet er behandlet som **innhold og terminologi** — språket er bevart, formen er ny.

## Retning

| Beslutning | Valg |
|---|---|
| Typografi | Tett, nøytral grotesk |
| Standardflate | Lys — mørk brukes kun til hero, seksjonsskille og presentasjon |
| Temperament | Myke kort med dybde, sjenerøs luft, store flater kuttet på skrå |
| Palett | Merkevare (navy + rødt) + full funksjonell statuspalett |

## Logo

Logoen er **ukrenkelig**. Den rendres alltid fra fil (`assets/logo/team-norway-golf.png`) via `Logo`-komponenten — aldri gjenskapt i markup, aldri farget om, strukket, rotert, invertert eller satt i annen skrift.

Det finnes **ingen negativ versjon**. På mørk flate settes merket på en hvit plate, ikke inverteres.

De to strekene er en del av merket, ikke et selvstendig grafisk element — de brukes ikke alene som aksent. Der systemet trenger en aksent uten merket, brukes en flate eller strek i navy eller rødt.

Minste høyde 24px. Fri sone tilsvarer høyden på den røde streken. `assets/logo/team-norway-golf-original.jpg` er originalfilen slik den ble levert; PNG-en er samme merke med beskåret tomrom.

## Bevegelse

Bevegelse er en lov i systemet, ikke pynt på slutten.

**Skal det animere i det hele tatt?** Noe som gjentas hundre ganger om dagen — tastatursnarveier, faneskift, kommandopalett — skal være momentant. Animasjon der gjør flaten treg. Animer det som skjer av og til: ark, paneler, tilstandsskifter, feedback.

**Kurvene er sterkere enn CSS-standardene**, som er for slappe til å kjennes bevisste:

| Token | Kurve | Bruk |
|---|---|---|
| `--ease-out` | `.23,1,.32,1` | Inn- og utgang. Starter raskt. |
| `--ease-in-out` | `.77,0,.175,1` | Flytting på skjermen. |
| `--ease-sheet` | `.32,.72,0,1` | Ark og skuffer. |

**Aldri `ease-in` på grensesnitt.** Den utsetter bevegelsen akkurat i øyeblikket brukeren ser etter svar, og får 200 ms til å føles som 400.

Varigheter: 120 ms trykk · 160 ms hover · 200 ms kort og felt · 280 ms panel · 420 ms ark. Alt brukeren kan trykke på holder seg under 300 ms.

**Trykk svarer på pointer-down.** Alt trykkbart krymper til `scale(.97)`. Ventes det på klikk, føles flaten død.

**Hover finnes ikke på berøring.** Alle hover-tilstander ligger bak `(hover:hover) and (pointer:fine)`.

**Gestdrevne flater bruker fjærer, ikke varigheter** — de kan gripes og snus midt i bevegelsen, og arver fingerens fart. Kritisk dempet som standard (`--spring-ui`); sprett kun når gesten selv bar fart (`--spring-momentum`).

Systemet respekterer `prefers-reduced-motion`, `prefers-reduced-transparency` og `prefers-contrast`. Redusert bevegelse fjerner ikke svaret — skalering byttes mot opasitet.

## Farge

Merkevarefargene er **målt fra logofilen**, ikke gjenfortalt: navy `#012B5D` fra venstre strek, rødt `#D70232` fra høyre.

### Hvorfor ikke de andre verdiene

Det sirkulerer fire ulike TN-røde i AK Golf HQ-økosystemet. Tre er forkastet:

| Verdi | Kilde | Vurdering |
|---|---|---|
| **`#D70232`** | Målt fra `assets/logo/team-norway-golf-original.jpg` | **Kanonisk.** Eneste verdi med sporbar opprinnelse i selve merket. |
| `#D50431` | `.claude/rules/beslutninger.md` N-D2 | Ingen oppgitt kilde. Nær målingen, men 2 % unna. Bør rettes i N-D2. |
| `#BA0C2F` | `talenthq/client/public/logos/team-norway-primary.svg` | Dette er **Pantone 200** — det norske flaggets røde, ikke logoens. Sammen med `#00205B` (Pantone 281) er paret hentet ordrett fra flaggspesifikasjonen. |
| `#EF2B2D` | `talenthq/client/public/ds-logos/*.svg` | Dette er **«Old Glory Red»** — det amerikanske flagget. Sammen med `#002868` er paret hentet ordrett derfra. Åpenbart en plassholder. |

Begge SVG-ene i talenthq er dessuten håndtegnede tilnærminger med feil strekproporsjoner og generisk skrift — de er ikke logoen, og de er ikke enige med hverandre. Navy følger samme logikk: `#012B5D` er målt, `#00205B` og `#002868` er flaggverdier.

**Handling:** N-D2 i `beslutninger.md` og begge SVG-ene i talenthq bør rettes til `#012B5D` / `#D70232`, og logoen bør leveres som ekte vektor fra NGF. Til da er PNG-en fra brukerens originalfil fasit.

**Fast regel:** merkevarerød er identitet — stripe, logo, aksentknapp, «denne utøveren» i data. Status bruker en egen, varmere rød (`#C2352B`) sammen med grønn og ravgul, slik at et rødt UI-element aldri kan feiltolkes som en advarsel.

Mørk flate er ikke et tema. Den er en rolle: hero, seksjonsskille, presentasjon. Skjema og tabell er alltid lyse.

**Nøytralskalaen har en grense:** `--ink-400` (`#647280`) er den lyseste gråtonen som får bære tekst — 4,93:1 på hvit og 4,63:1 på `--ink-50`. `--ink-300` og lysere er kanter, linjer og rutenett, aldri tekst. Dette gjelder også 9–11px etiketter; små tall og statuskoder er ofte det viktigste på skjermen.

## Typografi

- **Schibsted Grotesk** — overskrift, brødtekst, kontroller. Norsk opphav, tett, nøytral. Negativ sperring på alt over 21px.
- **IBM Plex Mono** — score, ranking, differanser, datoer og eyebrows. Alt som måles settes i mono med tabulære tall.

Begge er fritt lisensiert. Ingen substitusjonsgjeld — dette er systemets egne skrifter, ikke erstatninger for noe.

## Form

Radius 6→28px, myke lagskygger, 4px-basert romskala. Systemets ene bevegelse er **diagonalen**: store flater av navy eller rødt kuttet nedover mot høyre. Den brukes på hero og seksjonsskiller, aldri på kort eller kontroller.

## Komponenter

**Kjerne** — `Button`, `Badge`, `Card`, `Input`, `Select`

**Data** — `MetricTile`, `StatBar`, `ScaleRating`, `DataTable`, `CoverageCard`

**Merkevare** — `Logo`, `Hero`, `SectionHeader`, `PyramidDiagram`

## Maler

- `templates/utover-dashboard/` — utøverdashboard med hero, nøkkeltall, pyramide og statustabell
- `templates/evaluering/` — digitalt egenevalueringsskjema, de fire trinnene i utviklingsprosessen
- `templates/presentasjon/` — mørkt slidedekk, 1920×1080
- `templates/arsplan/` — sesongen som svømmebaner: periodisering, turneringer, samlinger, tester, merkepunkter, volum og ACWR
- `templates/periodeplan/` — én periode i månedsrutenett: ukebelastning, økter per dag, fordeling og holdepunkter
- `templates/samling/` — treningssamling time for time: fellesøkter satt av treneren, egentid spilleren fyller selv, med trener-/spillerblikk
- `templates/workbench/` — coach-modus: kilderail, ukerutenett med økter og utkast, publisering
- `templates/grupper/` — gruppeuke som materialiseres til hver spiller, med medlemsliste og opprinnelse
- `templates/tester/` — testbatteri: liste per område, resultat, trend, forsøk og neste økt
- `templates/kalender/` — uke med minikalender, lag, heldagsrad, nålinje og detaljpanel

**Team Norways egen flate** — alle i lys Claw-form, Mac 1440 + mobil 390 med tom, laster og feil:

- `templates/tn-workdesk/` — TN-00: pulje 1 (hjem, spillerliste, spiller-ark) omtegnet fra Train-lock mørk
- `templates/tn-skall/` — TN-01: organisasjonsskallet, menyen i Daglig · Uttak · Skoler · Kommunikasjon · Data · Administrasjon
- `templates/tn-oversikt/` — TN-02: landingsflaten `/team-norway`, dekningsgraden først
- `templates/tn-fellestesting/` — TN-03: føringsskjermen, protokoll → gruppe → kø → oppsummering
- `templates/tn-protokollbibliotek/` — TN-04: delte protokoller med eier, versjon og batteri
- `templates/tn-protokolldetalj/` — TN-05: versjonshistorikk, låsedato og attestering
- `templates/tn-uttak/` — TN-06: vurderingsmatrisen, alltid underlag
- `templates/tn-rangliste/` — TN-07: rangering på målte størrelser med kildelinje
- `templates/tn-skoler/` — TN-08: toppidrettsgymnasene, aggregat på skolenivå
- `templates/tn-gruppeposter/` — TN-09: poster til gruppen med vedlegg og lesekvittering
- `templates/tn-post-enkeltspiller/` — TN-10: 1:1-poster, sporbare og synlige for foresatt, med Teams-møte
- `templates/tn-dokumentdeling/` — TN-11: filliste med kvitteringsbrøk og «mangler» øverst
- `templates/tn-samtykke/` — TN-12: foreldrevisning, hva som deles og hva som ikke deles
- `templates/tn-turneringer/` — TN-13: kommende med påmeldte og GolfBox-lenke, historikk med runder, til par og mot felt. Rader uten maskinlesbar kilde sier «venter på data», aldri et tall
- `templates/tn-samlingspunkt/` — TN-14: samlingen som ett punkt — uttatte med bekreftet/venter/meldt av, program time for time, spillerblikk på mobil
- `templates/tn-collegegruppen/` — TN-15: seks spillere over fire studieår, med NCAA-kollisjonen mot norsk sesong dokumentert i skjermen
- `templates/tn-manedsplan/` — TN-16: måned, uke, fokus og avvik — avvik målt mot publisert plan, aldri vurdert
- `templates/tn-turnering-manuell/` — TN-17: turneringen synken ikke fikk med seg. Raden merkes «lagt inn selv» i ravgult, kildelinjen starter aldri med MÅLT, og «mot felt» står som ikke mulig fordi feltsnitt ikke finnes
- `templates/tn-trenere-tilgang/` — TN-18: legg til trener, rolle per gruppe (trener eller hjelpetrener), aktiv fra og til. Rollen settes **alltid per gruppe**, aldri på brukeren, og skjermen viser hvilke grupper personen faktisk når
- `templates/tn-inviter-spiller/` — TN-19: e-post eller SMS, én gruppe, navngitt avsender, utløpsdato, status sendt · åpnet · fullført · utløpt. Registreringen skjer i PlayerHQ og tegnes ikke her
- `templates/tn-trenerkatalog/` — TN-20: ni roller fra IUP-arkets «TN Coaches» med trykkbar kontakt. Katalogen gir ingen tilgang — det gjør TN-18
- `templates/tn-referansenivaer/` — TN-21: median PEI per bånd, treff green/fringe og forventet slag per underlag, fra IUP-arkets «Statistics»
- `templates/tn-systemkart/` — **Systemkart**: tokens, alle 14 komponenter i alle tilstander, de 21 TN-skjermene gruppert etter menyens seks grupper med rute og status (FERDIG / GAP / ANTAKELSE), og de 10 generelle malene på ett sted

Status per 02.09.2026 står i `docs/vurdering-2026-09-02.md` — gap-liste mot Team Norways behov, spørsmål til Anders og prioritert rekkefølge for batch 4.

**Handover til kode:** `handover/` inneholder pakken som gjør skjermene klare for portering til AK Golf HQ — eksportmanifest, `PORTING.md` med tokenbro og tom/laster/feil, skjermregister for alle 21, datamodell-hullene gruppert etter modell, tilgangsmatrisen og de åpne beslutningene. Start med `handover/LES-MEG.md`.

**07.09.2026:** behovslisten har nå skjerm på alle seks punkter. TN-13 og TN-14 er tegnet, og menyen i TN-01 er rettet etter repoet: **Kommunikasjon** er skilt ut som egen femte gruppe (repoets TN-ruter setter allerede den overskriften over Gruppeposter og Dokumenter), **Turneringer** flyttet fra Uttak til Data, og **Samlingspunkt** lagt under Daglig.

**08.09.2026 — ferdigstilling.** Systemet har nå 21 TN-skjermer. Tre nye er tegnet: TN-17 Legg til turnering manuelt, TN-18 Trenere og tilgang og TN-19 Inviter spiller. TN-01 har fått en sjette menygruppe **Administrasjon**, og Collegegruppen (TN-15) og Månedsplan (TN-16) er lagt under Daglig. TN-00 og TN-01 har fått tom, laster og feil — TN-01s tomtilstand er «ingen grupper tildelt», som er en grense og derfor ravgul, ikke rød. Kildelinjen er ensrettet til «Målt dd.mm.åååå · protokoll vN · initialer» i alle skjermene, med `TALT` for opptellinger og `LAGT INN SELV` for manuelle rader. Fire nye foundation-kort dekker ikoner, kildelinjen, tilstander og organisasjonsskinnet. Nummereringen er lagt om: Trenerkatalog og Referansenivåer er flyttet fra TN-15/16 til **TN-20/21**. Mobilfanene går Oversikt · Samling · Uttak · Poster · Mer i både TN-01 og TnMerMobil.

Gjenstår: adherence-regelen for rå px må avgrenses i kompilatoren, ikke her — se `docs/ferdigstilling-2026-09-08.md`. Mobilfanene går nå Oversikt · Samling · Uttak · Poster · Mer, slik at TN-09–12 har en vei.

De fire siste er bygget etter informasjonsarkitekturen i Player HQ / AgencyOS-prototypen, men i dette systemets form: lys flate, myke kort, pilleknapper, Schibsted Grotesk og navy/rødt. Kategorifarger på økter følger datarampen; rødt er reservert for turnering og «nå»-linjen.

## Terminologi

Språket er hentet fra golfforbundet.no og skal brukes ordrett. Se kortet **Offisiell terminologi**.

Utviklingsprosessen: Målbilde → Planer → Gjennomføring → Evaluering.
De fem TN-prosessene: Strategisk, Teknisk, Fysisk, Mentalt, Sosialt.
Periodiseringspyramiden (kanoniske kortformer): **FYS → TEK → SLAG → SPILL → TURN**.
Periodisering: **GRUNN** uke 44–11 · **SPES** uke 12–16 · **TURN** uke 17–42 · test/eval uke 43.
Uttakskriterier: Resultater, Prestasjoner, Prosess/adferd.
Forkortelser: TNG, IUP, RR, OWGR, WAGR.

Tre navneregler fra AK Golf HQ som gjelder her:

- Kvartalstesten heter **«TN-batteri Q3»** — aldri «PEI Q3 · X av 8 stasjoner».
- Coach-vurderingen heter **«vurdering»**, aldri «karakterer». Skolens karakterer holdes utenfor.
- Uttak er **alltid underlag**. Systemet konkluderer aldri.

## Forholdet til Train-lock

AK Golf HQ har **Train-lock** som designfasit for PlayerHQ, AgencyOS og Forelder. Bølge N (N7) sier at organisasjonsflaten skal tegnes i Train-lock. Dette systemet er ikke en konkurrent til det.

**Arbeidsdelingen:** Train-lock eier plattformens flater. Dette systemet eier **Team Norways egen organisasjonsflate** — den N-D1 slår fast skal være egne skjermer, aldri under AgencyOS. Det er nettopp den arven N-D2 beskriver: logo, skinne og handlingsfarge følger organisasjonen.

Praktisk betyr det:

- Deler en skjerm bor i PlayerHQ eller AgencyOS (`/cockpit`, `/testbatteri`, `/analyse`, DataGolf-terminalen), er Train-lock fasit. Dette systemet bidrar bare med logo og skinnefarge.
- Bor skjermen under `/team-norway/*`, er dette systemet fasit.
- Ingen skjerm har to fasiter.

**Bekreftet av Anders 31.08.2026.** Claw eier `/team-norway/*`; Train-lock eier PlayerHQ, AgencyOS og Forelder. Analyse (AnalyseTerminal, SpredningsAnalyse, KohortUtvikling, ResultatVsFelt) og DataGolf (DataGolfProfil, TruthLayer) er Train-lock med TN-skinn og tegnes aldri her — Claw bidrar kun med logo og skinnefarge i organisasjonsskallet. Beslutningen om lys+mørk på alle skjermer gjelder PlayerHQ/AgencyOS/Forelder, ikke `/team-norway/*`.

## Åpne punkter

- **Ikoner** — Lucide, 20px, strek 1,75 er nå systemets valg og står som kort **Ikoner** i `guidelines/15-icons.html`. Aldri emoji. TN-01 bruker fortsatt tegnene `‹`, `×`, `≡` og `⌄` der ikonene skal stå; de erstattes ved neste tur på skallet.
- **Adherence-regelen for rå px** kan ikke avgrenses her — `_adherence.oxlintrc.json` genereres av kompilatoren. Beslutningen (regelen gjelder typografi og rom, ikke rammemål) står i `docs/ferdigstilling-2026-09-08.md`.
- **Foto** — Team Norway-uttrykket hviler tungt på utøverfoto. Heroene er bygget for å ta bilde bak mørkfiltret; be om billedbank.
- **Ekte vektorlogo** fra NGF. Dagens PNG er beskåret fra en JPEG med kompresjonsartefakter.
- **Periodegrensene er uavklarte i kildene:** GRUNN slutter uke 10 eller 11, SPES starter uke 11, 12 eller 14. Årsplanen bruker uke 11 / uke 12 i påvente av avklaring — fem punkter venter på svar i `grunnlag-funn.md` §5.
- NGF har ingen offentlig designmanual. Kontaktpunktet for grafisk profil står under *Grafisk utforming / visuell profil* på golfforbundet.no/om/kontakt/administrasjon.

## Struktur

- `styles.css` — eneste fil konsumenter trenger å linke
- `tokens/` — colors, typography, spacing, effects
- `fonts/fonts.css` — Google Fonts
- `components/` — core, data, brand
- `guidelines/` — foundation-kort (merkevare, farge, typografi, rom & form, praksis)
- `templates/` — startpunkter
- `assets/logo/` — offisiell logo
