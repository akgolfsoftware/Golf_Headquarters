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

**Data** — `MetricTile`, `StatBar`, `ScaleRating`, `DataTable`

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

Dette er en **anbefaling som må bekreftes** — N7 er i dag formulert som om Train-lock skal tegne hele organisasjonsflaten, inkludert TNs egne skjermer. Enten justeres N7, eller dette systemet reduseres til et fargeskinn.

## Åpne punkter

- **Ikoner** — systemet har ingen ennå. Legges til når behovet er konkret, ikke på forskudd. Merk at talenthq bruker Lucide, så et TN-sett bør harmonere med det.
- **Foto** — Team Norway-uttrykket hviler tungt på utøverfoto. Heroene er bygget for å ta bilde bak mørkfiltret; be om billedbank.
- **Ekte vektorlogo** fra NGF. Dagens PNG er beskåret fra en JPEG med kompresjonsartefakter.
- **Dekningsgrad-kortet** («4 av 11 med profil») er obligatorisk på TN-oversikten per N7. Ikke bygget som komponent ennå.
- **Periodegrensene er uavklarte i kildene:** GRUNN slutter uke 10 eller 11, SPES starter uke 11, 12 eller 14. Årsplanen bruker uke 11 / uke 12 i påvente av avklaring — fem punkter venter på svar i `grunnlag-funn.md` §5.
- NGF har ingen offentlig designmanual. Kontaktpunktet for grafisk profil står under *Grafisk utforming / visuell profil* på golfforbundet.no/om/kontakt/administrasjon.

## Struktur

- `styles.css` — eneste fil konsumenter trenger å linke
- `tokens/` — colors, typography, spacing, effects
- `fonts/fonts.css` — Google Fonts
- `components/` — core, data, brand
- `guidelines/` — foundation-kort
- `templates/` — startpunkter
- `assets/logo/` — offisiell logo
