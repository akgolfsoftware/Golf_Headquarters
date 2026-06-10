# Meg-assistent — skjerm-prompts til Claude Design

> **VIKTIG — én skjerm om gangen.** Generer KUN én skjerm per kjøring.
> Lim inn «Felles kontekst»-blokken først, deretter ÉN av de 7 skjerm-promptene.
> Vent til skjermen er ferdig før du går videre til neste. Ikke be om flere
> skjermer i samme prompt — da blander designet seg sammen.

Disse skjermene hører til **«Meg»** — Anders' private assistent inne i AgencyOS
(admin-delen av AK Golf HQ). Mørkt tema, single-tenant (kun Anders).

---

## Felles kontekst (lim inn FØRST, hver gang)

```
Du designer en skjerm til "Meg" — Anders' private assistent inne i AgencyOS
(admin-delen av AK Golf HQ). Følg AK Golf HQ-designsystemet nøyaktig:

- Tema: AgencyOS er ALLTID mørkt. Mørk skogsbunn-bakgrunn, kort litt lysere
  enn bakgrunnen. Aksentfarge lime #D1F843, primær skoggrønn #005840, lys
  cream tekst, dempet grå sekundærtekst. Ingen tema-toggle.
- Fonter: Inter til UI/brødtekst, Inter Tight til store overskrifter/hero
  (gjerne kursiv på editorial titler), JetBrains Mono til alle TALL, eyebrows
  og etiketter (uppercase, tett bokstavavstand).
- Ikoner: kun Lucide, tynn strek (1,5px), currentColor. ALDRI emoji.
- Komponenter: gjenbruk det branded biblioteket — hero, card, featured-card,
  kpi, eyebrow, badge (varianter ok/warn/urgent/lime/primary/neutral), button,
  action-list, queue-item, avatar, pulse-dot, kalendere (heatmap/streak).
- Tetthet: dette er data-tette dashboards (Bloomberg-tetthet) — kompakte rader,
  12-14px spacing der det trengs, tabulære tall i mono.
- Språk: all tekst på norsk bokmål med æ, ø, å.
- Single-tenant: dette er KUN for Anders Kristiansen. Bruk hans navn der det er
  naturlig.
Lever skjermen for desktop-bredde (~1280px), mørkt tema.
```

---

## Skjerm 1 — Hjem (dagens brief)

```
Skjerm: "Meg — Hjem". Assistentens forside / dagens brief.

Topp: en hero-rad med liten rund avatar (Anders), en hilsen i Inter Tight
("God morgen, Anders") og dato + sted som eyebrow i mono. Til høyre en
pulse-dot + tekst "Assistent aktiv".

Under hero: en KPI-stripe med 4 tall i JetBrains Mono — Søvn i natt (t),
Hvile-HRV, Treningsøkter denne uka, Humør (1-5). Hvert tall med liten
trendpil opp/ned.

Hovedinnhold i to kolonner:
- Venstre (bred): kort "Dagens brief" — en kort, punktvis oppsummering
  skrevet som assistenten snakker (3-5 punkter): viktigste fra AgencyOS,
  dagens kalender-høydepunkter, e-poster som trenger svar, Notion-oppgaver
  som forfaller. Hvert punkt med et lite Lucide-ikon.
- Høyre (smal): kort "Ventende handlinger" som en action-list — 2-3 rader
  der assistenten foreslår noe (f.eks. "Send svar til Markus?", "Lag oppgave:
  ring GFGK"), hver med badge "venter" og en liten BEKREFT/Avvis-knapp.

Nederst: en tidslinje-teaser "Siste logg" — 3 kompakte rader fra dagens
logg (søvn, idé, oppgave) med tidsstempel i mono og kategori-badge.

Realistiske plassholderverdier. Mørkt tema.
```

---

## Skjerm 2 — Logg (tidslinje)

```
Skjerm: "Meg — Logg". Kronologisk historikk over alt Anders har logget inn
via Telegram (tale/tekst).

Topp: enkel header med tittel "Logg" (Inter Tight) + et søkefelt og en rad
med filter-chips: Alle · Søvn · Trening · Humør · Idé · Oppgave · Person.
Aktiv chip i lime.

Hovedinnhold: en vertikal tidslinje gruppert per dag (dato-overskrift i mono).
Hver logg-rad er kompakt: tidsstempel (mono) til venstre, et kategori-ikon
(Lucide) + kategori-badge, og selve teksten ("sov dårlig, 5 timer", "idé:
sponsortilbud til GFGK", "humør 4/5"). Rader er tette (Bloomberg-tetthet),
vekslende subtil bakgrunn for lesbarhet.

Høyre side (smal kolonne): et lite oppsummeringskort — "Denne uka": antall
logger per kategori som en liten liste med tall i mono.

Vis ca. 12 rader fordelt på 3 dager. Mørkt tema.
```

---

## Skjerm 3 — Trender (helse, trening, humør)

```
Skjerm: "Meg — Trender". Grafer over tid for Anders' egne data.

Topp: header "Trender" + en periodevelger (chips: 7 dager · 30 dager · 90 dager).

Innhold som et rutenett av kort, hvert med en graf (bruk Recharts-stil,
lime/grønn linjer mot mørk bakgrunn, tall i mono):
- Søvn (timer per natt, søylediagram) + snitt-tall stort i mono øverst.
- Hvile-HRV (linje) med trend.
- Treningsbelastning per uke (søyler), kilde-tag Garmin.
- Humør (1-5, linje eller prikker).
- En heatmap-kalender (streak-stil) for "dager logget" siste 90 dager.

Hvert kort har en liten eyebrow-tittel i mono, stort nøkkeltall, og grafen
under. Mørkt tema, rolig og lesbart — ikke overfylt.

Realistiske plassholderdata. Merk øverst at FYS/helse-formler ennå ikke er
låst (liten dempet note), så tallene er eksempler.
```

---

## Skjerm 4 — Ventende handlinger (bekreftelser)

```
Skjerm: "Meg — Ventende handlinger". Liste over handlinger assistenten har
foreslått og som venter på Anders' BEKREFT/Avvis.

Topp: header "Ventende handlinger" + tellebadge (f.eks. "3 venter").

Innhold: en liste av kort (queue-item-stil), ett per ventende handling. Hvert
kort viser:
- Et type-ikon + type-etikett i mono (E-POST · NOTION · DISK).
- En lesbar oppsummering ("Send svar til Markus Berg om treningstider").
- En sammenleggbar forhåndsvisning av selve innholdet (utkast-tekst for
  e-post, oppgavetittel+forfallsdato for Notion).
- Tidsstempel "foreslått for 12 min siden" og "utløper om 48 min" i mono.
- To tydelige knapper: "BEKREFT" (lime, primær) og "Avvis" (dempet).

Tom-tilstand lenger ned som eksempel: et rolig kort "Ingenting venter —
assistenten spør her før den sender noe."

3 ventende kort med ulik type. Mørkt tema.
```

---

## Skjerm 5 — Dispatch (innboks som trenger svar)

```
Skjerm: "Meg — Dispatch". E-post-triage: assistenten har lest Gmail og
plukket ut det som trenger svar, med ferdige utkast.

Topp: header "Dispatch" + status "Lest 14 e-poster · 3 trenger svar".

To-panels layout:
- Venstre (liste): kompakte e-post-rader (Bloomberg-tetthet) — avsender,
  emne, kort utdrag, tidsstempel i mono, og en prioritets-badge
  (urgent/warn/neutral). Valgt rad uthevet.
- Høyre (detalj): den valgte tråden øverst (avsender, emne, kort sammendrag
  assistenten har laget), og under: et "Foreslått svar"-kort med utkast-
  teksten i et redigerbart tekstfelt, pluss knapper "BEKREFT og send" (lime)
  og "Forkast utkast".

Øverst i detaljpanelet en liten linje: "Assistenten foreslår dette svaret —
ingenting sendes før du trykker BEKREFT."

Realistiske norske e-post-eksempler (golf/coaching-kontekst). Mørkt tema.
```

---

## Skjerm 6 — Minne & Kunnskap (semantisk søk)

```
Skjerm: "Meg — Minne". Lar Anders søke i alt assistenten "vet": egne logger +
indeksert kunnskap fra ak-brain og ak-second-brain.

Topp: et stort søkefelt i midten ("Spør om hva som helst…") med en søke-knapp,
og under noen forslags-chips ("Mac O'Grady putting", "sponsoravtale GFGK",
"min søvntrend").

Under søk: resultater som kort, hvert med:
- Kilde-badge (Logg · ak-brain · second-brain · Notion) i mono.
- Et kort utdrag med søketreffet uthevet.
- Sti/tittel på kilden, og en relevans-indikator (liten prikk-skala).

Høyre kolonne: et "Kunnskapsstatus"-kort — antall indekserte dokumenter,
sist oppdatert (mono-tidsstempel), og en liten liste over vaultene som er
indeksert. Vis en rolig "sist synk feilet"-varsel-rad som eksempel-tilstand
(siden indekseringen krever oppsett).

4-5 resultatkort med variert kilde. Mørkt tema.
```

---

## Skjerm 7 — Oppsett & tilkoblinger (onboarding)

```
Skjerm: "Meg — Oppsett". Onboarding/innstillinger for å koble assistenten til
kildene sine.

Topp: header "Oppsett" + en kort velkomstlinje.

Innhold: en liste av tilkoblings-kort, hvert med ikon, navn, status-badge
(Tilkoblet=ok / Mangler=warn / Feil=urgent) og en handlingsknapp:
- Telegram (kanalen du snakker inn på) — "Tilkoblet"
- Google (Gmail, Kalender, Disk) — "Re-godkjenn"
- Notion (prosjekter + oppgaver) — "Tilkoblet"
- Claude-konto (hjernen bak assistenten) — "Tilkoblet"
- Helsedata (Apple Watch via Health Auto Export + Garmin) — "Mangler"
- Egen Meg-database (Supabase) — "Mangler"
- Embeddings (kunnskaps-søk) — "Mangler"

Under: et kort "Kom i gang" med 3 nummererte steg i ren tekst (opprett
Telegram-bot, koble Google, slå på indeksering), og en plass til en innebygd
intro-video (NotebookLM) — vis som et video-plassholder-kort.

Rolig, oversiktlig, ikke teknisk i tonen. Mørkt tema.
```

---

# ADHD-skjermer

> Disse 5 er valgt for hvordan en ADHD-hjerne fungerer — igangsetting,
> tidsfølelse, arbeidsminne og overganger. Samme regel: én skjerm om gangen,
> fellesblokk først.

## Skjerm 8 — Én ting nå

```
Skjerm: "Meg — Én ting nå". Den viktigste ADHD-skjermen: viser KUN den ene
neste handlingen, ingenting annet. Mot igangsettings-lammelse.

Layout: nesten tom skjerm, mye luft, rolig. Midt på skjermen ett stort kort:
- Liten eyebrow i mono øverst: "GJØR DETTE NÅ".
- Selve handlingen i stor Inter Tight ("Ring GFGK om vårsesongen").
- Én linje kontekst under i dempet tekst ("Du lovet dette på fredag · tar
  ~10 min").
- To store knapper: "Ferdig" (lime, primær) og "Ikke nå" (dempet, hopper til
  neste).

Helt nederst, lite og dempet (ikke i fokus): "3 andre venter" — men IKKE en
liste. Bare tallet, så det ikke stjeler oppmerksomhet.

Ingen meny, ingen sidebar, ingen distraksjoner. Rolig mørkt tema. Følelsen
skal være lettelse, ikke press.
```

---

## Skjerm 9 — Tidsfølelse

```
Skjerm: "Meg — Tidsfølelse". Mot tidsblindhet. Gjør tid synlig og konkret.

Topp: stor klokke i JetBrains Mono (nåværende tid) + dato som eyebrow.

Hovedkort i midten: "Neste avtale" — hva det er, klokkeslett, og en stor
nedtelling i mono ("om 40 min") med en visuell ring/bar som tømmes.

Under: "Akkurat nå jobber du med" — den aktive oppgaven + en medgått-teller
("du har vært på dette i 25 min") med en mild fargeendring hvis det drar ut.

Nederst: en horisontal tidslinje for dagen (timeblokker) som viser hvor du er
nå (markør) og hva som kommer — avtaler som blokker, ledig tid som åpne felt.

Tall i mono, rolig mørkt tema, store og lett-lesbare tidsindikatorer.
```

---

## Skjerm 10 — Hjernedump

```
Skjerm: "Meg — Hjernedump". Ett sted å tømme alt som spinner i hodet, så det
ikke må holdes i arbeidsminnet.

Topp: kort tittel "Tøm hodet" (Inter Tight) + en beroligende undertekst
("Skriv eller snakk inn alt — assistenten sorterer det etterpå").

Midt på: ett stort, innbydende tekstfelt som fyller mesteparten av skjermen,
med en stor mikrofon-knapp (Lucide) for tale-inn. Plassholder: "Bare dump alt
her…". En tydelig "Lagre alt"-knapp i lime.

Under feltet: "Sist dumpet" — 3-4 kompakte rader fra forrige dump som
assistenten allerede har sortert, hver med en kategori-badge (Oppgave · Idé ·
Bekymring · Person) — så du SER at det blir tatt vare på.

Rolig, lite friksjon, mørkt tema. Skal føles som å puste ut.
```

---

## Skjerm 11 — Innsjekk

```
Skjerm: "Meg — Innsjekk". Mild ytre struktur: assistenten sjekker inn med
jevne mellomrom så du ikke driver bort fra det du holder på med.

Layout: et samtale-/chat-aktig kort midt på skjermen. Assistentens melding
øverst: "Hva jobber du med nå?" med tidsstempel i mono. Under: hurtigsvar-
knapper ("Fortsatt på [oppgave]", "Byttet til noe annet", "Tok en pause").

Under samtalen: et lite "Dagens innsjekk"-kort — en tidslinje av dagens
innsjekkinger (klokkeslett i mono + hva du svarte), så du ser mønsteret ditt:
når du var på sporet og når du drev bort.

Innstilling synlig nederst: hvor ofte assistenten skal sjekke inn (chips:
hver 30 min · hver time · av). Vennlig tone, aldri masete. Mørkt tema.
```

---

## Skjerm 12 — Pakk sammen

```
Skjerm: "Meg — Pakk sammen". Hjelper med overganger og å stoppe hyperfokus før
det spiser kvelden.

Utløses som et rolig fullskjerm-kort på et fast tidspunkt: stor tekst "Det er
18:00 — på tide å runde av" (Inter Tight).

Innhold: en kort, vennlig sjekkliste for å avslutte dagen (3-4 punkter):
- "Hva fullførte du i dag?" (assistenten viser 2-3 ting du krysset av).
- "Hva flytter vi til i morgen?" — de uferdige tingene, klare til å dyttes
  til morgendagen med ett trykk.
- "Noe du lovet noen?" — rask sjekk mot løfter-lista.

Avslutning: en stor knapp "Pakk sammen for i dag" (lime) som lukker dagen og
sier noe rolig ("Bra jobba. Vi tar resten i morgen.").

Varm, avsluttende følelse — ikke en ny oppgaveliste. Mørkt tema.
```

---

# Kilde-skjermer (tilkoblede tjenester)

> Skjermer der assistenten viser data fra de tilkoblede tjenestene dine.
> Alt som SENDER, OPPRETTER eller ENDRER noe må alltid bekreftes med BEKREFT
> før det skjer. Samme regel: én skjerm om gangen, fellesblokk først.

## Skjerm 13 — Notion: Prosjekter & oppgaver

```
Skjerm: "Meg — Notion". Viser Anders' Notion-databaser for prosjekter og
oppgaver, samlet i assistenten.

Topp: header "Notion" + to faner: "Oppgaver" og "Prosjekter".

Fane "Oppgaver": en kompakt tabell (Bloomberg-tetthet) — oppgavetittel,
prosjekt-tag, forfallsdato (mono), status-badge (Å gjøre / I gang / Ferdig).
Forfalte oppgaver markert i urgent-rød. Øverst en "Ny oppgave"-knapp som
åpner et lite skjema — men med tydelig "BEKREFT for å opprette i Notion"
(ingenting lagres før bekreftet).

Fane "Prosjekter": kort i rutenett, ett per prosjekt — navn, kort beskrivelse,
fremdrift (liten bar + % i mono), antall åpne oppgaver, og sist oppdatert.

Høyre kolonne (smal): "Forfaller snart" — 3-4 oppgaver med nærmeste frist,
som en action-list. Realistiske golf/coaching-eksempler. Mørkt tema.
```

---

## Skjerm 14 — Gmail (innboks)

```
Skjerm: "Meg — Gmail". Full innboks-oversikt (Dispatch-skjermen er kun de som
trenger svar; denne er hele bildet).

Topp: header "Gmail" + søkefelt + filter-chips (Alle · Ulest · Trenger svar ·
Flagget).

Innhold: en e-post-liste (kompakte rader) — avsender, emne, utdrag,
tidsstempel i mono, og badges (ulest-prikk i lime, "trenger svar"-badge).
Tråder gruppert. Valgt rad uthevet.

Til høyre: detalj-panel for valgt tråd — avsender, emne, og assistentens korte
sammendrag øverst ("Markus spør om treningstider neste uke"), så meldings-
teksten. Handlingsknapper: "Lag svar-utkast" (assistenten skriver), "Arkiver",
"Flagg". Send-knappen er alltid bak BEKREFT.

Note øverst i detaljen: "Assistenten sender aldri uten din BEKREFT." Mørkt tema.
```

---

## Skjerm 15 — Google Kalender

```
Skjerm: "Meg — Kalender". Anders' Google-kalender i assistenten.

Topp: header "Kalender" + visningsvelger (chips: Dag · Uke · Måned) + dato-
navigasjon (forrige/neste, "I dag").

Hovedinnhold (ukevisning som standard): et ukerutenett med timeblokker,
avtaler som fargede blokker (coaching=grønn, møte=lime-kant, privat=dempet),
klokkeslett i mono. Nåværende tid markert med en tydelig linje.

Venstre/høyre smal kolonne: "Neste opp" — de 3 nærmeste avtalene som kort med
nedtelling i mono ("om 40 min"), sted, og deltakere.

Nederst en liten linje: "Be assistenten finne ledig tid" — et felt der man kan
spørre ("når har jeg 2 timer ledig denne uka?"). Ny avtale opprettes kun etter
BEKREFT. Realistiske eksempler. Mørkt tema.
```

---

## Skjerm 16 — Google Disk

```
Skjerm: "Meg — Disk". Søk og bla i Google Disk-filene dine via assistenten.

Topp: header "Disk" + et stort søkefelt ("Finn en fil…") + filter-chips etter
type (Alle · Dokument · Regneark · PDF · Bilde · Mappe).

Innhold: en fil-liste (rader, Bloomberg-tetthet) — fil-ikon etter type
(Lucide), filnavn, mappe/sti, eier, sist endret (mono), størrelse. Klikk på en
fil åpner et detalj-panel til høyre: forhåndsvisning/sammendrag som assistenten
har laget ("Q2-budsjett — viktigste tall: …"), og knapper "Åpne i Disk",
"Oppsummer", "Lagre notat hit".

Eget kort øverst: "Nylig brukt" — 4-5 filer du jobbet med sist, som hurtig-
kort. Å lagre/endre en fil krever alltid BEKREFT. Mørkt tema.
```

---

## Skjerm 17 — Claude-konto

```
Skjerm: "Meg — Claude". Statusen for "hjernen" som driver assistenten. Ikke-
teknisk i tonen — forklart i hverdagsspråk.

Topp: header "Claude-konto" + en pulse-dot + "Tilkoblet".

Innhold som kort:
- "Aktive modeller": to rader — en rask modell til enkle ting (rute/sortere)
  og en smart modell til resonnement (skrive svar, planlegge). Hver med navn
  og en kort forklaring på hva den brukes til.
- "Forbruk denne måneden": et stort tall i mono (anslått kostnad i kr) + en
  liten graf over daglig bruk, og antall meldinger/handlinger behandlet.
- "Hva assistenten kan gjøre": en kort liste over evnene (lese e-post, lage
  utkast, søke i minne, opprette Notion-oppgaver) med på/av-status.

Nederst: et rolig statuskort — "Alt fungerer som det skal" eller en varsel-rad
hvis nøkkel mangler/forbruk er høyt. Ingen sjargong. Mørkt tema.
```
