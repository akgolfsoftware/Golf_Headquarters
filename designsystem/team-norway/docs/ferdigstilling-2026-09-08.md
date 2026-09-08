# Beslutningslogg — ferdigstilling 08.09.2026

Denne filen fører hva som ble rettet i del A av ferdigstillingsordren, og hva som
**ikke** kunne rettes i prosjektet. Vurderingen `docs/vurdering-2026-09-02.md` er fasit;
punktnumrene under er dens.

## Rettet

**A1 · SKILL.md (F12).** Erstattet. Filen inneholder nå ingen designverdier, bare en
peker på `tokens/`, `components/` og `readme.md` som fasit i den rekkefølgen, pluss de
fem reglene som ikke kan uttrykkes som et token. De gamle påstandene — Jost + Public
Sans, «ingen skygger, ingen piller» — er borte. Systemet bruker Schibsted Grotesk,
IBM Plex Mono, tre skyggenivåer og `--radius-full`.

**A2 · Ni generelle maler (F14, F15).** I kalender, grupper, workbench, tester, samling,
arsplan, periodeplan, presentasjon og evaluering:

| Rettelse | Antall |
|---|---|
| `color:var(--ink-300)` → `--ink-400` | 8 steder |
| Rå px-fonter → `--text-*` | 569 steder |
| Rå `#fff` → `var(--white)` | 48 steder |
| `#A9C0DA` → `var(--text-on-dark-muted)` | 5 steder |
| Rå `font-weight` → `--weight-*` | 175 steder |
| Faneknapper 30px → 44px | 11 steder |

Kartleggingen som følger av dette: ytterpillene som omslutter fanene måtte fra 36px til
52px i fem maler, og ukerutenettet i Workbench fra 52px til 64px radhøyde — den nye
tekststørrelsen klippet 1-timers økter. Display-størrelser over 28px er beholdt som rå
px: `--text-display` er 48px, og en presentasjonstittel på 150px kan ikke uttrykkes i
skalaen uten å ødelegge malen. Det er et bevisst unntak, ikke et gjenstående avvik.

**A4 · Rå hex i komponentene (F4).** Tolv `#fff` og én `#A9C0DA` er borte fra Button,
Badge, ScaleRating, MetricTile, Hero, SectionHeader og Logo. `grep '#[0-9a-fA-F]{3,8}'`
i `components/` gir nå null treff. `rgba(255,255,255,…)` i Button-varianten `onDark` er
beholdt — det er gjennomsiktighet over ukjent flate, ikke en farge som finnes som token.

**A5 · Trykkmål (F3).** `Button` er løftet i alle tre størrelser, ikke bare `sm`:
sm 34→44px, md 42→48px, lg 52→56px. Hierarkiet består, og ingen størrelse er under
minste trykkmål. `hint-size`-verdiene i malene er placeholder under strømming og
påvirker ikke gjengivelsen.

**A6 · Fire manglende props (F6–F9).**

- `MetricTile.source` — kildelinjen er nå sin egen linje i mono, `--text-micro`.
  Den skal aldri smugles inn i `caption` igjen.
- `HeroMeta.source` — hvert nøkkeltall i heroen kan bære sin egen kilde.
- `Select.error` — samme kontrakt som `Input.error`: rød ramme, feilteksten erstatter
  hint.
- `DataTable.empty` og `.loading` — `loading` tegner skjelettrader i tabellens egen
  rytme, `empty` tar en streng eller en node. Skjermene skal ikke tegne tabellskjelett
  selv lenger.

Alle fire er ført i `.d.ts` samtidig, ellers ser kompilatoren og adherence-reglene noe
annet enn koden.

**A7 · Fire guideline-kort.** Ny gruppe **06 Praksis** i Design System-fanen (06, ikke 05 — `05 Komponenter` var allerede tatt):

| Kort | Fil | Innhold |
|---|---|---|
| Ikoner | `guidelines/15-icons.html` | Lucide, 20px, strek 1,75, `currentColor`. Åtte ikoner tegnet. Sier eksplisitt at TN-01 fortsatt bruker `‹ × ≡ ⌄` som ikoner, og hvorfor det ikke holder. |
| Kildelinjen | `guidelines/16-truthlayer.html` | Fire varianter av formatet, med førsteordet som kontrakt: `MÅLT` (sporbar protokoll), `TALT` (opptelling i systemet), `LAGT INN SELV` (menneske uten protokoll, alltid ravgult). |
| Tom · laster · feil | `guidelines/17-states.html` | Tre miniatyrer. Tom sier hvorfor, laster følger innholdets rytme, feil viser sist kjente verdi med dato. Grense = ravgul, feil = statusrød. |
| Organisasjonsskinn | `guidelines/18-org-skin.html` | Hva som følger organisasjonen (logo, skinnefarge, handlingsfarge) mot hva som følger Train-lock. Skinnet farger aldri om statuspaletten. |

**A8 · TN-00 og TN-01.**

- **TN-01** har fått tre nye mobilrammer: tom, laster og feil. Tomtilstanden er **«ingen grupper tildelt»** — ravgul, ikke rød, fordi den er en grense og ikke en feil, med bunnfanene deaktivert og to veier videre (be om tilgang, bytt organisasjon). Feiltilstanden viser sist kjente utsnitt med dato og sperrer publisering.
- **«Bytt»**-raden var allerede på `min-height:44px`; det som faktisk lå under, pillen **«Bytt organisasjon»** i Mac-toppen, er hevet fra `height:40px` til `min-height:44px`.
- **TN-00** har fått tom (ingenting krever handling), laster og feil (testdata kunne ikke leses — feltene står som «venter på data», ingen verdi hentes fra en eldre protokollversjon).
- **Kildelinjen** i TN-00 står nå som `MÅLT 14.03.2026 · TN-BATTERI Q1 V3 · AK` i mono, begge steder. Setningen om at protokollversjonen låses ved første bruk er skilt ut som egen linje — den er en regel, ikke en del av kilden.

**A9 · Eksempelmerking og étt kildeformat.** 86 navn og skolenavn er merket `— eksempel` i åtte skjermer (collegegruppen, dokumentdeling, fellestesting, gruppeposter, post-enkeltspiller, rangliste, skoler, uttak), pluss TN-00 og TN-01. Kildelinjene i TN-02, TN-08, TN-13, TN-14, TN-15 og systemkartet er skrevet om til `<FØRSTEORD> dd.mm.åååå · protokoll vN · initialer`.

**To bevisste unntak fra merkingen:**

- **TN-20 Trenerkatalog** — de ni navnene er lest ut av `uploads/team-norway-iup-2025.xlsx` fane «TN Coaches». De er data, ikke eksempler, og bærer kildelinje i stedet for merke. Å merke dem «eksempel» ville vært feil på den motsatte måten.
- **TN-21 Referansenivåer** — Woods, Allenby og Stricker er ekte tour-referanser fra samme regneark.

**Del C · TN-08 Skoler.** Aggregatvalget står, men skjermen sier nå hvorfor: spilleren samtykker til at **sin egen skole** følger utviklingen, og det samtykket følger ikke med til forbundet — NGF er en annen behandlingsansvarlig, og en navngitt skoleliste ville vært en ny utlevering til en ny part uten eget grunnlag. Navn-varianten er tegnet som en **låst tilstand**: navnekolonnen står som grå streker, samtykkekolonnen viser at null av ni har samtykket til NGF, og «Vis navn» er deaktivert med begrunnelsen at hjemmelen mangler — ikke at grensesnittet mangler noe. Kortet sier også at varianten, om den åpnes, fortsatt ikke er standard.

**Del C · TN-01 meny.** Collegegruppen (TN-15) og Månedsplan (TN-16) er lagt under **Daglig**; Trenere og tilgang (TN-18), Inviter spiller (TN-19) og Trenerkatalog (TN-20) under den nye sjette gruppen **Administrasjon**. Oppdatert i både Mac-menyen, mobilmenyen og `TnMerMobil`. Mobilfanene er ensrettet til Oversikt · Samling · Uttak · Poster · Mer i begge filer — `TnMerMobil` hadde Testing og Skoler der TN-01 hadde Samling og Poster.

**Tre nye skjermer.**

| Skjerm | Mappe | Beslutningen den løser |
|---|---|---|
| TN-17 | `templates/tn-turnering-manuell/` | Turneringen synken ikke fikk med seg. Tre lag skiller manuelle rader fra hentede: markørfargen, førsteordet i kildelinjen, og at «mot felt» står som **ikke mulig** i stedet for et tall. |
| TN-18 | `templates/tn-trenere-tilgang/` | Hvem når hva. Rollen bor på gruppen, ikke på brukeren — derfor heter kolonnen «grupper personen når», og panelet oppsummerer i **utøvere**, ikke i rollenavn. |
| TN-19 | `templates/tn-inviter-spiller/` | Hvordan en spiller kommer inn. Skjermen slutter der invitasjonen forlater flaten; registreringen er PlayerHQs. Statusen **ikke levert** er lagt til fordi en avvist e-post ellers står som sendt i ukevis. |

## Kunne ikke rettes her

**A3 · Adherence-regelen for rå px (F5).** `_adherence.oxlintrc.json` genereres av
kompilatoren fra `tokens/` og `components/` på hver tur. Regelen
`Literal[value=/\b\d+px\b/]` er ikke utledet fra noen kilde i prosjektet, og en
håndredigering blir overskrevet. Avgrensningen må gjøres i kompilatoren, ikke her.

Beslutningen er likevel tatt og gjelder for mennesker som leser advarslene:

> Regelen gjelder **typografi og rom** — `font-size`, `padding`, `margin`, `gap`,
> `border-radius`. **Rammemål er unntatt**: `width`, `height`, `min-height`, `top`,
> `right`, `bottom`, `left`, `flex-basis`. En DC-mal kan bare stiles inline, og
> `390px`/`1440px` er selve formatet — ikke et avvik fra skalaen.

Til regelen er avgrenset i kompilatoren, er «null advarsler i `templates/`» ikke et
oppnåelig suksesskriterium. Det er en verktøybegrensning, ikke en designfeil.

## Nummerering

Ferdigstillingsordren gir Collegegruppen TN-15 og Månedsplan TN-16. De numrene ble brukt
08.09 på Trenerkatalog og Referansenivåer, som ikke sto i batch 4-lista. Ordrens
nummerering vinner:

| Skjerm | Var | Er |
|---|---|---|
| Collegegruppen | — | TN-15 |
| Månedsplan | — | TN-16 |
| Legg til turnering manuelt | — | TN-17 |
| Trenere og tilgang | — | TN-18 |
| Inviter spiller | — | TN-19 |
| Trenerkatalog | TN-15 | TN-20 |
| Referansenivåer | TN-16 | TN-21 |

Nummereringen er gjennomført i `templates/tn-systemkart/`, `readme.md` og `TnMerMobil`.
