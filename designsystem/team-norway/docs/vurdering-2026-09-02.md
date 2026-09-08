# Vurdering av designsystemet — 02.09.2026

Fasit: `readme.md`, `tokens/`, komponentkoden. `SKILL.md` er eldre generasjon og skal erstattes (se F12). Alle tall her er målt i navngitt fil; kontrast er WCAG-forhold mot flaten teksten står på. Systemkartet: `templates/tn-systemkart/TnSystemkart.dc.html`.

> **Etterskrift 07.09.2026.** TN-13 Turneringsoversikt (`templates/tn-turneringer/`) og TN-14 Samlingspunkt (`templates/tn-samlingspunkt/`) er tegnet, og TN-01 har fått femte menygruppe Kommunikasjon, Turneringer flyttet til Data og Samlingspunkt under Daglig. Behovslistens punkt 4 og 6 er dermed dekket — begge med merket antakelse, ikke som avklart. Radene under er ikke omskrevet: de står som målingen 02.09.

## a. Sammendrag

Systemet er helt: 14 komponenter, 15 kort, 13 TN-skjermer med Mac 1440 og 390, 11 av 13 med tom/laster/feil. Beslutningene fra 30.–31.08 holdes overalt i TN-skjermene — ingen merkevarerød som status, ingen «karakterer», ingen mørkt tema. To ting blokkerer «produksjonsklar»: adherence-regelen for rå px kan ikke gi null i inline-stilte maler slik den står, og fire generelle maler bruker `--ink-300` som tekst (1,75:1). Behovslistens punkt 4 (turneringer) og 6 (samlingspunkt) mangler som TN-skjermer. Ikoner, TruthLayer-kildelinje og tom/laster/feil er praksis i skjermene, men ikke dokumentert som guideline.

## b. Systemnivå

| Fil | Funn | Mål | Alvorlighet |
|---|---|---|---|
| F1 `tokens/colors.css` | `--text-tertiary` (= `--ink-400` #647280) på `--surface-sunken` (= `--ink-100` #EDF1F4). Brukes i laster-skjeletter og ark-bakgrunn. | 4,3:1 (hvit 4,9:1, `--ink-50` 4,6:1) | SVAKHET |
| F2 `tokens/colors.css` | `--status-green` #0E8A43 og `--status-amber` #B87503 er brikkefarger, men står uten regel om at kun `*-text`-variantene får bære tekst. | grønn 4,4:1 · ravgul 3,6:1 på hvit | SVAKHET |
| F3 `components/core/Button.jsx:4` | `size="sm"` er 34px høy. Brukes på 390 i Samling-malen (`hint-size="110px,34px"`). | 34px < 44px | SVAKHET |
| F4 `components/core/Button.jsx:6–10`, `Badge.jsx:17,20`, `ScaleRating.jsx:26`, `MetricTile.jsx:14`, `Hero.jsx:17,18,23`, `SectionHeader.jsx:11`, `Logo.jsx:16` | Rå `#fff` 11 steder og `#A9C0DA` (ikke et token; `--text-on-dark-muted` er #8FA3B8). Systemets egne komponenter feiler systemets egen hex-regel. | 12 rå hex | SVAKHET |
| F5 `_adherence.oxlintrc.json` | Regelen `Literal[value=/\b\d+px\b/]` flagger hver inline `style`. DC-maler kan kun stiles inline (rammemål 390px/1440px, gap, padding). Null advarsler i `templates/` er umulig uten å avgrense regelen. | 23 maler, alle treffer | BLOKKERER (for suksesskriteriet) |
| F6 `components/data/MetricTile.d.ts` | Ingen `source`-prop. Kildelinjen må smugles inn i `caption`, som også brukes til annet («Siste 20 runder»). | 0 av 7 props bærer kilde | SVAKHET (TruthLayer) |
| F7 `components/brand/Hero.d.ts` | `meta: {label, value}` viser tall om utøvere («Utøvere 24») uten plass til kilde. | 0 kildefelt | SVAKHET (TruthLayer) |
| F8 `components/core/Select.d.ts` | Mangler `error` (Input har det). Skjema kan ikke vise feil på nedtrekk. | 1 manglende tilstand | SVAKHET |
| F9 `components/data/DataTable.d.ts` | Ingen tom- eller laster-tilstand; alle TN-skjermer må tegne tabellskjelett selv. | 2 manglende tilstander | SVAKHET |
| F10 `styles.css:13` + alle `templates/tn-*` | Fokusring er definert, men ingen TN-mal har `tabindex`; alle `role="button"`-div er ufokuserbare. Tastatur kan ikke nå primærhandlingene. | 0 treff på `tabindex` i `templates/tn-*` | SVAKHET |
| F11 `guidelines/` | Ingen kort for ikoner (Lucide), TruthLayer-kildelinje, tom/laster/feil-mønster eller org-skinn. TN-skall bruker tegnene ‹ × som ikoner (`TnSkall.dc.html:112,187`). | 15 kort, 4 mangler | SVAKHET |
| F12 `SKILL.md` | Jost + Public Sans, «ingen skygger, ingen piller» — motsier `tokens/typography.css` og `effects.css`. To fasiter. | 2 fonter utenfor systemet | BLOKKERER |
| F13 `readme.md` | «anbefaling som må bekreftes» om Train-lock — bekreftet 31.08.2026. Rettet i denne leveransen. | — | POLERING |
| F14 `templates/kalender/Kalender.dc.html:190`, `grupper/Grupper.dc.html:61,72`, `workbench/Workbench.dc.html:108,119`, `tester/Tester.dc.html:39,113` | `--ink-300` (#B9C4CE) som tekst i 8,5–9,5px. Bryter ink-400-regelen. | 1,75:1 på hvit | BLOKKERER |
| F15 `templates/{kalender,grupper,workbench,samling,arsplan,periodeplan,tester,presentasjon,evaluering}` | Rå px-fonter (8,5–13,5px, `font-weight:600/800`) og rå `#fff` / `#A9C0DA` i stedet for `--text-*`, `--weight-*`, `--white`. Faneknapper 30px høye. | 9 maler · 30px < 44px | SVAKHET |
| F16 `templates/tester/Tester.dc.html:10,141` | «20 protokoller i fem grupper» — et tredje tall ved siden av 16 (talenthq) og 11 (grunnlag-funn). | 3 ulike tall | SVAKHET |

## c. Per skjerm

Alle 13 er lyse, bruker Schibsted Grotesk / IBM Plex Mono via tokens, ingen rå hex i TN-malene (grep `#[0-9a-fA-F]{6}` = 0 treff i `templates/tn-*/*.dc.html`). Alle bruker `--red-600` kun på logo, skinne og «denne utøveren». F10 (fokus) og F21 (eksempelmerking) gjelder alle 13 og gjentas ikke per rad.

| Skjerm | Det den gjør riktig | Funn | Alvorlighet |
|---|---|---|---|
| TN-00 `tn-workdesk/TnBatch1.dc.html` | IA fra Train-lock beholdt; spiller-ark med kildelinje; tilbakeknapp 44px (l.112). | Kun suksess på 390 (HJEM / SPILLERLISTE / SPILLER-ARK), ingen tom/laster/feil. Kildelinje l.132 og l.315 «Målt 14.03.2026 · testdag Bærum · Anders K.» mangler protokoll/versjon. | SVAKHET ×2 |
| TN-01 `tn-skall/TnSkall.dc.html` | Logo på hvit plate; rød skinne 8×20 (l.139) er eneste rødt utenfor logo; «Avgrenset tilgang · 2 av 6 grupper» i `--status-amber-text` 5,6:1. | Ingen tom/laster/feil (f.eks. «ingen grupper tildelt»). l.207 «Bytt» er `role="button"` uten høyde (<44px). l.274 «Turneringer» ligger under Uttak; bestillingen sier Data. Mobilfanene l.342 (Oversikt · Testing · Uttak · Skoler · Mer) har ingen vei til TN-09–12. | SVAKHET ×3 |
| TN-02 `tn-oversikt/TnOversikt.dc.html` | Dekningsgrad først (CoverageCard, kildelinje «Talt 25.08.2026»); tom-tilstand forklarer samtykke uten å se ut som feil (l.238–239); feil viser sist kjente tall. | Forutsetter hull: «kommende samlinger» med hvem som er tatt ut — ingen uttaksmodell per samling. | ANTAKELSE (hull) |
| TN-03 `tn-fellestesting/TnFellestesting.dc.html` | Fire arketyper, PEI merket «LAVERE ER BEDRE» (l.199, l.806); tom/laster/feil («INGEN DEKNING») på 390; protokoll med eier og versjon i kø-toppen. | Forutsetter hull: køen bygger på coach-eierskap; en spiller med kun samtykke-tilgang ser ikke det samme. | ANTAKELSE (hull) |
| TN-04 `tn-protokollbibliotek/…` | Eier · versjon · brukes av · batteri per rad; spriket 16/11 er synlig i batterikolonnen. | Ingen målte avvik. | — |
| TN-05 `tn-protokolldetalj/…` | Eier har «Ny versjon», mottaker har ingen handling — synlig i layout; attestering venter/attestert/avvist; tom «v5 har ingen målinger» (l.234). | l.48 `--ink-300` som skilletegn «/» — dekorativt, ikke tekst. | POLERING |
| TN-06 `tn-uttak/TnUttak.dc.html` | Kriteriene ordrett; ingen totalscore; hver vurdering har kilde med dato (l.304–330); «Åpne underlag» per rad. | l.303–330 eksempelnavn og -skoler uten «eksempel»-merking (gjelder alle 13). | SVAKHET |
| TN-07 `tn-rangliste/TnRangliste.dc.html` | Kildelinje per tall; rødt = «denne utøveren»; feil-tilstand «kilden mangler på to tall» (l.233) er riktig TruthLayer-feil. | Ingen målte avvik. | — |
| TN-08 `tn-skoler/TnSkoler.dc.html` | Aggregat, ingen navn; tom = «skole uten tilgang åpnet» (l.156). | Forutsetter hull: ingen `PlayerProgram`-verdi for TN — «TN-utøvere per skole» kan ikke telles i dag. | ANTAKELSE (hull) |
| TN-09 `tn-gruppeposter/…` | Oppslagstavle, ikke samtale; vedlegg; lesekvittering; tom/laster/feil. | Ingen målte avvik. | — |
| TN-10 `tn-post-enkeltspiller/…` | Foresatt i mottakerlinjen; feil «foresatt mangler, posting sperret» (l.336) håndhever regelen strukturelt; Teams-feil (l.374). | Ingen målte avvik. | — |
| TN-11 `tn-dokumentdeling/…` | Kvitteringsbrøk, «mangler» øverst; tom/laster/feil. | Ingen målte avvik. | — |
| TN-12 `tn-samtykke/TnSamtykke.dc.html` | To brytere per organisasjon; «hva som ikke deles» eksplisitt; tom/laster/feil. | Ingen målte avvik. | — |

## d. Gap mot behovslisten

| # | Behov | Status | Skjermer |
|---|---|---|---|
| 1 | Testing: føring, protokollbibliotek, resultater med versjon og eier | **FINNES** | TN-03, TN-04, TN-05 |
| 2 | Deling: samtykke, dokumenter med lesekvittering, poster | **FINNES** | TN-12, TN-11, TN-09, TN-10 |
| 3 | Golfstatistikk | **TRAIN-LOCK-SKINN** — skinnemekanismen er tegnet (TN-01: logo på hvit plate + rød skinne l.139, handlingsfarge navy), men ikke dokumentert som guideline-kort (F11). Ingen Analyse-/DataGolf-skjerm tegnes her. | TN-01 |
| 4 | Turneringer, historikk og kommende | **MANGLER** som egen skjerm. Finnes kun som rader i TN-06, TN-07, TN-00 spiller-ark. **ANTAKELSE:** TN-13 Turneringsoversikt tegnes i Claw under Data, filtrert på TN-spillere, kilde GolfBox. Anders bekrefter. | — |
| 5 | Spillerne: liste og spiller-ark | **FINNES** (med gap på tilstander, se TN-00) | TN-00 |
| 6 | Samlingspunkt: samlinger med hvem som er tatt ut | **MANGLER** som TN-skjerm. `templates/samling/` er en generell mal uten uttak; TN-02 viser bare rader. Forutsetter to hull: samling↔økt-kobling og uttaksmodell per samling. | — |

~~Mangler helt: **TN-13 Turneringsoversikt**, **TN-14 Samlingspunkt**.~~ Tegnet 07.09.2026. TN-13 er merket ANTAKELSE (bor i Claw under Data — spørsmål 1), TN-14 er merket ANTAKELSE (uttaksmodell per samling og samling↔økt-kobling mangler i datamodellen — spørsmål 3).

## e. Spørsmål Anders må svare på

1. **Turneringsoversikten** — TN-egen skjerm i Claw, eller delt rute i Train-lock (`/admin/turneringer` står i den delte lista)? *Anbefaling:* Claw, under **Data**, filtrert på TN-spillere; menyraden «Turneringer» flyttes fra Uttak til Data i TN-01.
2. **Adherence-regelen for rå px** — avgrenses til typografi og rom (`font-size`, `padding`, `margin`, `gap`, `border-radius`) og unntar rammemål? *Anbefaling:* ja; ellers kan ingen inline-stilt mal nå null.
3. **Samlingspunkt (TN-14)** — tegnes nå med merket forutsetning om uttaksmodell, eller venter på datamodellen? *Anbefaling:* tegn nå, merk hullet i designnotatet — det er skjermen piloten «én samling» trenger.
4. **Kommunikasjon i menyen** — femte gruppe i skallet (Daglig · Uttak · Skoler · Data · Kommunikasjon), eller under Daglig? *Anbefaling:* femte gruppe; bekreft mot `CoachShell.tsx`.
5. **Lucide som ikonsett** — bekreftes for `/team-norway/*`? *Anbefaling:* ja, 20px, strek 1,75, kun der tekst ikke rekker; aldri emoji.

## f. Prioritert rekkefølge for batch 4

| # | Hva | Hvorfor først | Filer |
|---|---|---|---|
| 1 | Avgrens px-regelen; rydd rå hex/px i komponentene (`#fff` → `var(--white)`, px → `--text-*`/`--space-*` der token finnes) | Uten dette kan ingen skjerm måles til null advarsler | `_adherence.oxlintrc.json` (via kompilator), `components/**/*.jsx` |
| 2 | `Button sm` ≥ 44px på berøring; `tabindex` + fokusring på alle trykkbare i TN-malene | Trykkmål og tastatur er suksesskriterier | `components/core/Button.jsx`, `templates/tn-*` |
| 3 | Fire guideline-kort: Ikoner (Lucide), TruthLayer-kildelinje, Tom/laster/feil, Org-skinn | Skjermene praktiserer det; systemet må eie det | `guidelines/15-icons.html`, `16-truthlayer.html`, `17-states.html`, `18-org-skin.html` |
| 4 | `MetricTile.source`, `Hero.meta[].source`, `Select.error`, `DataTable.empty/loading` | Fjerner TruthLayer- og tilstandshull i komponentlaget | `components/data/MetricTile.*`, `brand/Hero.*`, `core/Select.*`, `data/DataTable.*` |
| 5 | TN-01: tom/laster/feil, Kommunikasjon-gruppe, Turneringer under Data. TN-00: tom/laster/feil, kildelinje med protokoll/versjon | Skallet bestemmer om de andre skjermene kan nås | `templates/tn-skall/`, `templates/tn-workdesk/` |
| 6 | **TN-13 Turneringsoversikt** — historikk (brutto, til-par mot felt, GolfBox + dato) og kommende (dato, sted, tour, påmeldte, GolfBox-lenke) | Behov 4, eneste behov uten skjerm som ikke venter på datamodell | `templates/tn-turneringer/TnTurneringer.dc.html`, `docs/designnotat-tn-13.md` |
| 7 | **TN-14 Samlingspunkt** — samlinger med uttatte, merket hull | Behov 6; piloten krever bevis på én samling | `templates/tn-samlingspunkt/`, `docs/designnotat-tn-14.md` |
| 8 | «Eksempel»-merking på alle navn og tall; kildelinje-format «Målt dd.mm.åååå · protokoll vN · initialer» på alle 13 | Regelen om eksempeldata og TruthLayer må være lik overalt | `templates/tn-*/*.dc.html` |
| 9 | Generelle maler: `--ink-300`-tekst → `--ink-400`+, rå px/hex → tokens, faner ≥ 44px | F14 er BLOKKERER, F15 er ni maler | `templates/{kalender,grupper,workbench,tester,samling,arsplan,periodeplan,presentasjon,evaluering}` |
| 10 | Erstatt `SKILL.md` med readme + tokens som eneste fasit; oppdater readme og systemkart | Fjerner den siste doble fasiten | `SKILL.md`, `readme.md`, `templates/tn-systemkart/` |

## Uavklart — avgjøres ikke her

16 vs. 11 (vs. 20) testprotokoller · periodegrensene (GRUNN slutt uke 10/11, SPES start 11/12/14) · ekte vektorlogo fra NGF.
