# Er Claude Paper-prosjektet komplett? — kontroll 03.08.2026

> ⚠ **Frosset underlag (jf. `docs/port/README.md`) — tallene under er fra 03.08.2026 og er
> utdaterte.** Designprosjektet har nå 33 fasitskjermer, ikke 25/27 (se
> `docs/port/fasit-liste-paper.md`, oppdatert 05.08.2026). `kart/mangler-2026-08-01.md`, som
> denne kontrollen siterer som avgjørende, er selv utdatert — alt den listet som manglende
> (Innstillinger, AgenticOS, Innlogging, Foreldreportal, Booking, Økonomi, Live-session,
> AK-stigen) er siden bygget i `fase1/`. Bruk `fasit-liste-paper.md` for gjeldende tall, ikke
> denne fila.

**Endrer ingen kode.** Kontroll av designprosjektet `605a48cc` mot repoets speil og mot
prosjektets egne statusdokumenter.

---

## Svaret: nei, og prosjektet sier det selv

Designprosjektet fører sitt eget regnskap i `kart/`. To dokumenter der er avgjørende og
finnes **ikke** i repoets speil:

- `kart/status-til-komplett-2026-07-31.md`
- `kart/mangler-2026-08-01.md`

Deres egne tall, sitert:

| Spor | Ferdig | Gjenstår | Totalt |
|---|---:|---:|---:|
| Komponenter | 74 (49 %) | **77** | 151 |
| Hi-fi-skjermmaler | 5 (2,2 %) | **~30 maler** for 218 ruter | ~35 maler / 223 ruter |
| Wireframes | alle | 0 (venter kun på review) | — |

Designprosjektet definerer selv «komplett» som: full filtrippel per komponent, spesimenkort
i begge moduser × alle tilstander × to containerbredder, `@layer`-migrert, målt gulv,
assertions sett feile først, portene P1–P6 grønne og P7 godkjent av en annen enn forfatteren.
Det er en streng standard, og den er verdt å holde.

**Deres eget estimat:** «flere døgns autonomt arbeid, ikke én natt».

---

## Det som ER lukket siden mangellisten ble skrevet

`kart/mangler-2026-08-01.md` listet sju flater som manglet helt. Alle sju finnes nå:

| Manglet 01.08 | Status 03.08 |
|---|---|
| AgencyOS · Innstillinger | `fase1/agencyos-innstillinger.html` |
| AgenticOS | `fase1/agencyos-agenticos.html` |
| Innlogging | `fase1/innlogging.html` |
| Foreldreportal | `fase1/foreldreportal.html` |
| Booking | `fase1/booking.html` + `fase1/playerhq-booking.html` |
| Turneringsplanlegger | `fase1/workbench-turnering.html` |
| Økonomi | `fase1/agencyos-okonomi.html` |

I tillegg er to flater fra «ikke i bølge 1»-lista tegnet etterpå: AK-stigen og Live-økt.

**Bølge 1 er altså lukket.** Det som gjenstår er bølge 2 og utover: de 77 komponentene og
de ~30 malene.

---

## Speilet i repoet er utdatert på tre punkter

Speilet (`designsystem/paper/`, 362 filer) ble tatt 02.08. Målt mot kilden i dag:

| Mangler i speilet | Antall | Verdi |
|---|---:|---|
| `fase1/agencyos-ak-stigen.html` | 1 | Ekte fasit for AK-stigen (junior) |
| `fase1/agencyos-live-session.html` | 1 | Ekte fasit for Live-økt |
| `kart/` — designprosjektets egne statusdokumenter | 36 | **Regnskapet over hva som mangler.** Uten disse kan ingen i repoet svare på spørsmålet dette dokumentet stiller |
| `templates/` — 7 Claude Design-maler | ~28 | Overlapper `fase1/` |

Speilet har 25 fasitskjermer; kilden har 27.

---

## Konflikt som må avgjøres: to planer sier motsatt ting om tokens

Designprosjektet skrev sin egen portplan 02.08 (`kart/portplan-design-til-app-2026-08-02.md`).
Den er skrevet uten å ha sett repoet, og den er uenig med vår plan på to punkter.

### 1. Tokens: side om side eller erstatte?

Designprosjektet skriver:

> «Finnes det et konkurrerende system fra før, må det avgjøres nå om det skal erstattes eller
> leve side om side. **Side om side er den dyre løsningen** — to token-systemer betyr at hver
> komponent kan style seg fra to steder, og feilklassen vokser med hver skjerm.»

Vår fase 1 §5 anbefalte det motsatte (vei b: nytt sett ved siden av, gradvis migrering), og
steg 4 er allerede bygget slik — `--p-*` lever ved siden av `--v2-*`.

**Hvem har rett:** begge, om ulike ting. Designprosjektets advarsel gjelder en varig
tilstand med to systemer. Vår løsning er en overgang med en eksplisitt avviklingsbetingelse
(steg 10 sletter det gamle). Risikoen er reell hvis steg 10 aldri kjøres — og det er nøyaktig
sånn det gamle systemet oppsto. **Anbefaling: behold vei b, men flytt steg 10 fra «til slutt»
til en dato.** En avviklingsbetingelse uten frist er ikke en betingelse.

Steg 5-kontrollen (`docs/port/steg5-kontroll.md`) gjør dette billigere enn ventet: fargene
kan flyttes i én operasjon fordi alle 708 skjermfiler leser samme 71 variabler.

### 2. Rekkefølge: data eller volum?

Vår plan porterer PlayerHQ først (bølge 1), fordi det er størst volum og vises i piloten.
Designprosjektet sorterer etter om dataene finnes, målt i Supabase 02.08:

- **Grønn** (data finnes): Innlogging (28 brukere) · Booking (10 tjenestetyper, 13
  tilgjengelighetsrader) · Workbench Turneringer (447 turneringer) · Økonomi (11 betalinger)
- **Gul** (tabellen finnes, er tom): PlayerHQ Meg og Booking (`subscriptions` = 0 rader) ·
  Foreldreportal (`parent_relations` = 0) · Spillere (seks av sju er «Spiller B»–«G», demo)
- **Rød** (modellen finnes ikke): AgenticOS (`AiModel`, `RoutingRule`, `AiPrompt`, `AiCost`
  finnes ikke) · Innstillinger (konsern og selskaper finnes bare i Notion)

Deres begrunnelse er god og bør veie tungt: *«En skjerm portet mot en tom tabell er ikke
ferdig — den er en ny demo, i et dyrere format, som ser ferdig ut for alle som ser den.»*

**Anbefaling: bytt til deres rekkefølge.** Vår bølge 1–3 sorterer etter hvor mange skjermer
det er, ikke etter hvilke som faktisk kan bli ferdige. Det er feil kriterium.

---

## Hva som ikke er kontrollert

- **Ingen visuell gjennomgang av de 27 fasitskjermene.** Dette er en opptelling av hva som
  finnes, ikke en vurdering av kvaliteten på det som er tegnet.
- **Supabase-tallene er designprosjektets, målt 02.08.** De er ikke etterprøvd her —
  Supabase MCP krever pålogging som ikke finnes i denne økten.
- **De 77 gjenstående komponentene er ikke vurdert enkeltvis** mot hva appen faktisk
  trenger. Noen av dem kan vise seg unødvendige når `v2`-familiene er kartlagt
  (`docs/port/steg5-kontroll.md`).
