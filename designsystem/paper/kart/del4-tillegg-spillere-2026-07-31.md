# Del 4 — Spillere: tillegg 31.07.2026

Erstatter og utvider avsnitt 4.2 i `kart/skjermfasit-agencyos-2026-07-30.md`. Resten av
Del 4 (4.3 Spillerprofilen) står uendret. Skrevet med `ak-designekspert`-rammeverket:
jobb → flyt → hierarki → komposisjon → craft, i den rekkefølgen.

## De tre vanskeligste beslutningene i dette tillegget

**1 · Behovssortering fra 29.07 forblir default — de nye visningene er alternativer,
ikke erstatning.** Eier ba om «Mest aktive i appen» og «Sist sjekket av meg» som
velgbar standardvisning. Det gis, men **anbefalingen er å beholde Behov som
fabrikkinnstilling** og legge de nye til som lagrede visninger ved siden av.
Begrunnelse: Behov er den ene visningen som direkte løser fangstproblemet — den
sier hvem som trenger deg, ikke hvem som har vært mest aktiv. «Mest aktive i appen»
er et nyttig blikk (hvem er engasjert), men som standard ville det belønnet
spillere som allerede klarer seg selv og skjule dem som stilner. Løsningen er å la
eier bytte forsiden med to trykk, ikke å konkurrere om hvilken som vinner.

**2 · «Sist sjekket av meg» er en ny metrikk som må defineres presist, ellers lyver den.**
Den kan ikke bety «siste økt» (det finnes allerede) eller «siste melding» (det er
Kø sin jobb). Definisjon: **tidspunktet coachen sist åpnet spillerens Tråd-fane.**
Ikke profilen generelt — å åpne Analyse-fanen for å sjekke SG-tall er ikke det samme
som å ha sjekket spilleren. Tråden er stedet observasjonen bor, så det er stedet
som teller. Konsekvens for datamodellen: hver `Tråd`-visning må logge et
`sist_apnet`-tidsstempel per coach × spiller, atskilt fra all annen aktivitet.

**3 · Gruppetyper er ikke ett mønster — tre kort trengs, ikke ett generisk.**
WANG er en kontrakt med et tallkrav (32 økter/måned). Junior Academy er et
stigeprogram (Mini → Elite) uten kontraktstall. En ad hoc-treningsgruppe eier setter
opp selv for en åtteukersblokk har verken kontrakt eller stige — bare et start- og
sluttdatum og en øvelsesserie. Et generisk `GroupCard` som prøver å vise alle tre
blir enten tomt for to av tre typer, eller stapfullt av felter ingen bruker.
**Anbefaling: én komponent, tre visningsmodi (`kind="kontrakt" | "program" | "adhoc"`),
ikke tre komponenter.** Skjelettet er likt (navn, medlemmer, ansvarlig, periode);
det som varierer er ett målepanel nederst i kortet.

---

## 4.2 Spillere — full anatomi

### 4.2.0 Åpningsvalg: to faner, ikke to flater

`Tabs` øverst under `PageHeader`: **Alle spillere** · **Alle grupper**.
Faneskille, ikke egne rail-punkter — de svarer på beslektede spørsmål («hvem» og
«hvem sammen») og skal ikke koste en navigasjonsbeslutning å bytte mellom.

`PageHeader`: kicker «Spillere» · h1 med levende teller («38 spillere · 4 grupper») ·
høyrejustert `SearchField`.

### 4.2.1 Alle spillere

**Visningsvelger** (`DropdownMenu`, ikke `SegmentControl` — fem valg er for mange
for et segmentkontroll som skal holde seg under 44 px × 5 på mobil):

| Visning | Sortering | Når den er riktig |
|---|---|---|
| **Behov** *(standard)* | sammensatt behovssignal, høyest først | daglig arbeid, morgenrutinen |
| **Sist sjekket av meg** | lengst siden `sist_apnet` på Tråden, eldst først | ukentlig gjennomgang, «hvem har jeg glemt» |
| **Mest aktive i appen** | antall PlayerHQ-økter logget siste 14 dager, høyest først | motivasjon, hvem responderer på systemet |
| **Neste økt** | tidspunkt for neste bookede time, nærmest først | planlegging av uka |
| **Alfabetisk** | etternavn | slå opp en kjent spiller raskt |

Valgt visning huskes per enhet (`localStorage`, samme mønster som tema), ikke per
økt. Visningsnavnet står som mono-etikett ved siden av telleren: `SIST SJEKKET AV MEG`.

**Filterrad** (`FilterPills`, flervalg, under visningsvelgeren):
Kategori A–K · Modus (Elite / Vanlig / Junior) · Selskap (Academy / Junior Academy /
WANG / Mulligan) · Status (Aktiv / Pause / Avsluttet). Pills kombinerer med OG internt
i samme gruppe er OR — «Kategori A eller B» og «Elite» samtidig gir A-eller-B-elite.
Aktive filtre vises som fjernbare chips over listen, ikke bare nedtonet i menyen —
en modusvisning er ikke troverdig hvis eier har glemt at han filtrerte.

**Raden — komponentspørsmål som må avgjøres før bygging:**

Hver spillerrad trenger fire dataelementer samtidig i halen: kategori-`StatusBadge`,
SG-delta i mono, den valgte visningens metrikk (dager siden sjekk / antall økter /
tid til neste), og en `chevron`. **`ListRow` sin `trailing`-kontrakt tillater i dag
kun ett navngitt element** (`chevron` | `value` | `badge` | `toggle` | `action`) —
lest direkte fra `components/layout/ListRow.jsx` 31.07.2026. Fire samtidige verdier
er ikke en visuell finjustering av eksisterende props, det er en ny halekomposisjon.

**Anbefaling, i prioritert rekkefølge:**
1. Utvid `ListRow` med `trailing="compound"` og en `trailingItems`-array (badge, value,
   chevron i valgfri kombinasjon), dokumentert i `.prompt.md` og `.d.ts`. Dette er
   riktig fordi mønsteret vil trengs igjen — Kø-raden og Kalender-agendaraden har
   samme behov.
2. Er utvidelsen for stor for denne leveransen: bygg `SpillerRad` som egen
   komposisjon i `templates/`, som bruker `ListRow` internt for selve raden
   (`leading="avatar"`, `trailing="chevron"`) og legger badge + verdi som egne
   `span`-er foran chevronen. Dette er en **midlertidig løsning**, ikke en
   presedens — den skal erstattes når `trailing="compound"` finnes.

Ikke smugle fire verdier inn via `trailing="value"` med en sammensatt JSX-streng.
Det bryter `--mono`/tabulær-semantikken til `value`-slotten og gjør komponenten
utestbar (skjermleseren får én uleselig blokk i stedet for tre navngitte data).

**Radens fire felter, i rekkefølge:**
`Avatar` 36 px → navn + kategori i `akhq-lrow-meta` → **behovsbegrunnelse som
brødtekst** (den samme regelen fra 30.07 gjelder fortsatt: sorteringen skal alltid
ha en synlig grunn) → kategori-`StatusBadge` → visningens metrikk i mono →
`chevron`. Bytter eier visning fra Behov til Sist sjekket, bytter begrunnelsesteksten
med — den følger visningen, ikke raden.

Gruppert med `ListGroup` under de samme tre `SectionHeader`-seksjonene fra 30.07-ordren
(**Trenger deg nå** · **Følger planen** · **Hviler / sesongslutt**) **kun når visning
= Behov**. De andre fire visningene er én flat, sortert liste uten seksjoner — å
late som om «Mest aktive i appen» har de samme tre gruppene ville vært falsk struktur.

**Tomtilstand:** «Ingen spillere matcher filtrene dine» + knapp for å nullstille
filtre. Aldri «Ingen data» — filteret er nesten alltid årsaken, ikke fravær av spillere.

### 4.2.2 Alle grupper

**Filterrad:** Type (Kontrakt / Program / Ad hoc) · Selskap · Aktiv/avsluttet.

`CardGrid`, to kolonner desktop, én kolonne under 720 px (container query, ikke viewport
— et gruppepanel kan havne i en smalere spalte samme regel som resten av systemet).

**`GroupCard`, tre kind-varianter, delt skjelett:**

Topp, likt i alle tre: gruppenavn (16/600) · type-`StatusBadge` («Kontrakt» /
«Program» / «Ad hoc», fargeløs `kind="tag"`) · medlemsantall · ansvarlig coach
(`Avatar` + navn — Anders, Markus eller Espen).

Målepanel, **ulikt per kind**:

- **`kind="kontrakt"`** *(WANG, og framtidige B2B-avtaler)*: kontraktskrav som
  `ProgressBar` — «38 av 32 økter denne måneden» med `--up` når over krav,
  `--dn` når under. Fornyelsesdato. Lenke til sportsplan-dokumentet.
- **`kind="program"`** *(Junior Academy)*: fordeling på AK-stigen som
  `DotMatrix` eller enkel stolpe — antall spillere per nivå (Mini → Knøtt → Basis
  → Utvikling → Elite). Ingen kontraktstall, fordi det ikke finnes noe å måtte mot.
- **`kind="adhoc"`** *(treningsblokker eier selv setter opp)*: start–slutt-dato som
  `ProgressBar` mot kalenderen (uke 6 av 8), og øvelsesserien den er bygget på.
  Utløper stille når sluttdatoen passerer — ingen varsling, ingen fornyelse.
  Dette skiller den fra kontraktsgruppen, som skal eskalere i Kø når den nærmer seg
  fornyelse.

Bunn, likt i alle tre: `ListGroup`-forhåndsvisning av tre første medlemmer +
«+8 til» · én handling («Åpne gruppe» → medlemsliste + gruppemelding).

**Tomtilstand for typen «Ad hoc»:** «Du har ingen aktive treningsblokker. En blokk
er en tidsavgrenset øvelsesserie for flere spillere samtidig» + `Ny treningsblokk`.
De to andre typene skapes ikke fra denne skjermen — WANG-kontrakten og
Junior Academy-programmet er forretningsobjekter, ikke noe som opprettes i farten.

### 4.2.3 Grensen mot Del 5 (Kø)

Kontraktsgruppens forfallslogikk (WANG under 32 økter, nærmer seg månedsslutt)
er samme regelmotor som allerede genererer kø-raden «WANG-fakturaen er 12 dager på
overtid» i 30.07-prototypen. **Én regelmotor, to visninger** — Kø viser det som haster
nå, Alle grupper viser tilstanden uansett hastegrad. Bygges de som to separate
sjekker, vil de garantert komme ut av synk første gang regelen endres ett sted.

---

## Kritikk-pass, kjørt mot prototypen `uploads/agencyos-spillere-prototype.html`

Kjørt før levering, per `ak-designekspert`-rammeverket. Dette er ikke en påstand om
at skjermen er verifisert — det er forfatterens egen sjekk. Port A-krav 2 (craft mot
referanse) er fortsatt verifikatørens alene og gjenstår.

- **Squint-test:** hierarkiet holder — tittel, visningsvelger, filterrad, rader.
  Behovsbegrunnelsen på hver rad er det andre øyet finner etter navnet, som tiltenkt.
- **5-sekunder:** «hvem trenger meg» besvares uten å lese en eneste rad i detalj —
  seksjonsoverskriften alene bærer svaret.
- **Tilstander:** hover og focus-visible er dekket på rader, piller og faner.
  **Ikke dekket i prototypen, må inn i komponenten:** eksplisitt laster-tilstand
  (skjelett-rader) og aktiv/trykt-tilstand utover hover. Flagges, ikke gjettet.
- **To modus:** lys/mørk fungerer, samme tokenmønster som resten av systemet.
  `--up`/`--dn` brukt riktig på SG-delta og fremdriftslinje, aldri rødt.
- **Tommel (44 px):** **funnet og rettet i denne runden** — `pointer: coarse` manglet
  på filterpiller og visningsvelger (var 38 px). Lagt til som container-lag-regel.
  Chip-fjernknappen (16 px) er hevet til 22 px under coarse, men bør vurderes mot
  `--floor`-assertionen på lik linje med `gulvregel.md` når den skrives.
- **Språk:** norsk bokmål gjennomgående, komma-desimal på SG, mono på alle tall,
  ekte tekst i tomtilstander. «38 av 32 krav» har tidsvinduet i linjen over
  («Økter denne måneden»), ikke i selve tallet — konsistent med resten av systemet.
- **Ikke demonstrert, kun bygget i CSS:** `--dn`-varianten av `ProgressBar` for en
  kontraktsgruppe under kravet. Prototypen har bare én kontraktsgruppe (WANG, over
  kravet), så under-kravet-tilstanden er ikke vist. Ingen fiktiv andre kontrakt er
  lagt til for å vise den — det ville brutt regelen mot oppdiktet data som ser ekte ut.

## Åpne beslutninger lagt til Del 11

8. **`trailing="compound"` på `ListRow`** — utvid komponenten, eller bygg
   midlertidig `SpillerRad`? Avgjør før Spillere-flaten bygges, den blokkerer
   raden i begge visningsfanene.
9. **Kan en ad hoc-gruppe forfremmes til program?** Ikke besvart. Relevant hvis en
   treningsblokk eier setter opp gjentas nok ganger til å bli et fast tilbud.
