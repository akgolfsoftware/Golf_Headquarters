> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

> ⚠️ UTGÅTT (12.08.2026) — styrer ikke skjermbygging. Se docs/port/GYLDIGHET.md.

# PP-1 PlayerHQ kjerne — status

**Oppdatert:** 09.08.2026 overnight  

| ID | Fasit | Status | Merknad |
|---|---|---|---|
| PP-1.1 | playerhq-chat-m/d | **READY_SIGN** | loop ink, mic 60 clay, composer canvas |
| PP-1.2 | playerhq-plan | **READY_SIGN** | slug, dokk gradient, clay 56 |
| PP-1.3 | playerhq-analyse | **READY_SIGN** | slug, topp 17px, NesteFokus enTing |
| PP-1.4 | playerhq-meg | **READY_SIGN** | slug, lydsamtykke 56 clay |
| PP-1.5 | playerhq-booking | **READY_SIGN** | slug, Book 56 clay |
| PP-1.6 | innlogging | **READY_SIGN** | slug, primary T.cta flat cream |
| PP-1.7 | booking.html | **READY_SIGN** | marketing slug + clay CTA |

**Batch A: KODE COMPLETE** — venter Anders D12 + Mac push.

## Sign-off-bevis 10.08.2026

Alle sju er fotografert mot fasit (mobil 390 + desktop 1280 + mørk) i
[`SIGNOFF-GALLERI-2026-08-10.md`](SIGNOFF-GALLERI-2026-08-10.md).

**READY_SIGN holder ikke stikk for noen av dem.** Galleriet viser 4–5 reelle avvik per skjerm —
manglende ukeoppsummering på Plan, manglende «Hvor du havner» på innlogging, åtte ekstra seksjoner
på Analyse. Statusen over beskriver at tokens og slugs er på plass, ikke at formen er lik fasiten.

| ID | Anbefaling etter galleri | Merknad |
|---|---|---|
| PP-1.1 | FIKS FØRST | skrivefelt for lite, send/mikrofon i motsatt rekkefølge |
| PP-1.2 | FIKS FØRST | hele ukeoppsummeringen mangler |
| PP-1.3 | FIKS FØRST | 11 seksjoner mot fasitens 3 — venter beslutning |
| PP-1.4 | FIKS FØRST, så godkjenn | «Én ting nå» mangler clay-flate; 4 felter i «Om deg» |
| PP-1.5 | FIKS FØRST | feil bunn-fane **rettet 10.08**; «Én ting nå» mangler |
| PP-1.6 | FIKS FØRST | venter beslutning om oransje knapp |
| PP-1.7 | **BLOCKED** | Acuity-videresending (#384) — Anders' lanseringsbeslutning |

## Restfiks 10.08.2026 (etter galleriet)

Avvikene galleriet fant på 1.1, 1.2, 1.4 og 1.5 er bygget. Ingen av dem er signert —
**nytt galleri må kjøres før kryss**, siden bevisbildene er fra før endringen.

| ID | Bygget | Igjen |
|---|---|---|
| PP-1.1 | Skrivefeltet er to linjer høyt, `/` og `@` er trykkflater under feltet, mikrofon står før send, «ENTER SENDER · SHIFT+ENTER NY LINJE» under | Toppen er fortsatt et kort (fasit: flate), tema-bryter mangler, tom tilstand har fem veier — Anders må velge den ene |
| PP-1.2 | Hele ukeoppsummeringen (Periode/Økter/Planlagt tid/Gjennomført + framdriftsstripe + «X av Y økter · Z %» + «Hvorfor dette tallet»), eierskapsnotisen, tre-bokstavs dagvelger, «Book coachingtime» | «Sjekkpunkt»-raden — se åpent punkt under |
| PP-1.4 | «Én ting nå» har lys clay-flate + clay-strek langs venstre kant (Paper `.varselblokk`) | Tema-bryter. **Punkt 2 og 3 var ikke designfeil** — se korreksjon under |
| PP-1.5 | «Én ting nå» med første ledige luke fra availability-engine, klokkeslettet i knappen («Ta man 12:00»), saldoen regnet; generisk «Book time» falt til omriss så clay-monopolet holder | Abonnementskortet (pris/inkludert/brukt) |

### Korreksjon til galleriet: PP-1.4 punkt 2 og 3

Galleriet førte opp «Om deg mangler fire felter» og «Coach og program-kortet mangler helt»
som designavvik. Det stemmer ikke. `MegV2.tsx` har allerede Født, Skole, År med golf,
Snittscore forrige sesong, Ambisjon og Treningssted, og et eget «Coach og program»-kort —
alle betinget av at feltet faktisk er fylt ut. Testbrukeren `screentest@akgolf.test` har dem
tomme, og kortene skjuler seg derfor selv. Dette er **tomme testdata, ikke manglende design**,
og krever seeding av testbrukeren framfor kode.

### Åpent punkt: «Sjekkpunkt»-raden på Plan

Fasiten har «Sjekkpunkt · 14.08 · innspill» som femte rad i ukeoppsummeringen. Det finnes
ingen datokilde for den i databasen — `sjekkpunkt` er et fritekstfelt på `PlanAction`, ikke en
datert hendelse. Raden er derfor utelatt framfor å vise en oppdiktet dato. Skal den bygges,
må Anders si hva et sjekkpunkt er som data.
