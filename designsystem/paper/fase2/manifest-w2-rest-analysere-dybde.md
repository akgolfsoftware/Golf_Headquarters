# W2-rest — manifest: Runder / Gameplan / DataGolf / TrackMan-dybde

**Kilde/plan fulgt:** `docs/port/CLAUDE-DESIGN-PROMPT-RESTERENDE-SKJERMER.md` (BATCH W2, punkt 2–4).
**Ikke rørt:** `fase1/` og de 12 eksisterende `fase2/playerhq/`-filene (W1 + hull-analyse).

## Konsolideringsforslag (steg 1)

| Rute i dag | Forslag | Begrunnelse |
|---|---|---|
| `/portal/mal/runder`, `/portal/mal/runder/[id]`, `/portal/mal/runder/ny` | Tegn liste + detalj (2 filer). `ny` (hurtig score-skjema) **ikke tegnet denne runden** — §8-skjemamønster er uavklart i monsterdokumentet (validering/lagre-rad), egen mini-batch når det er løst | Unngår å gjette et udekket mønster |
| `/portal/gameplan`, `/portal/gameplan/[baneId]`, `/portal/gameplan/[baneId]/hull/[nr]` | Tegn liste + banekart (2 filer). Hull-detalj-siden (enkelthull, slag-plotting) **ikke tegnet** — egen, mer interaktiv flate, ikke en variant av banekartet | Banekartet dekker navigasjonen dit; selve slag-plotting er en editor, ikke en visning |
| `/portal/datagolf` | Tegn (1 fil) | Adskilt fra det blokkerte `/stats/*`-området (`AAPNE-SPORSMAL.md`: DataGolf-plassering i nav er uavklart, men selve `/portal/datagolf`-visningen er en egen, allerede plassert rute) |
| `/portal/mal/trackman`, `/portal/mal/trackman/[id]` | Tegn liste + detalj (2 filer). Stabilitets-seksjonen i detaljen er markert i koden som «ikke portet» (fortsatt Tailwind) — vist forenklet som per-kølle-rader, ikke full stabilitetsgraf | Holder tegningen på det som faktisk er Paper-mønster i dag |
| Hjem-rest (varsler/venner/utfordringer/fysisk) | **Utsatt til neste W2-batch** | Tempo denne runden var 6–10; disse 7 dekket kjernedybden i Analysere |

## Filer

| Fil | Ekte rute | Mal | Tilstander | Én ting nå | Merknad |
|---|---|---|---|---|---|
| `fase2/playerhq/playerhq-runder-liste.html` | `/portal/mal/runder` | §9/§11 liste + KPI-stripe | Suksess · Tom | Ingen — «Start live-føring» er ink (nyttehandling, ikke kontekstuell anbefaling) | Beste runde markert med `--up`-fylt scoreboks + stjerne, ikke lime (Presis-farge forbudt) |
| `fase2/playerhq/playerhq-runde-detalj.html` | `/portal/mal/runder/[id]` | §12 detaljside | Suksess · Tom | Ingen | Tom = hurtig-registrert runde (kun brutto score, ingen SG/scorekort) — reelt kodepath, ikke oppdiktet |
| `fase2/playerhq/playerhq-gameplan-liste.html` | `/portal/gameplan` | §9/§11 liste + KPI-stripe | Suksess · Tom | Ingen | — |
| `fase2/playerhq/playerhq-gameplan-banekart.html` | `/portal/gameplan/[baneId]` | §12 detaljside | Suksess · Tom | Ingen | Banekart er stripet plassholder (Mapbox-integrasjon, ikke tegnet i HTML) |
| `fase2/playerhq/playerhq-datagolf.html` | `/portal/datagolf` | §12 detaljside, hero+kategori | Suksess · Tom | Ingen | Divergerende SG-stolper mot 0-linje, `--up`/`--dn` — aldri lime |
| `fase2/playerhq/playerhq-trackman-liste.html` | `/portal/mal/trackman` | §9/§11 liste | Suksess · Tom | Ingen — «Importer» er ink | Tom har eksport-instruks (CSV/HTML) verbatim fra kildekoden |
| `fase2/playerhq/playerhq-trackman-detalj.html` | `/portal/mal/trackman/[id]` | §12 detaljside | Suksess · Tom | Ingen | Spredningsplot forenklet scatter (ikke fasit-`DispersionMap`); stabilitetsseksjon uportet, se over |

## Avhengigheter og avvik mot planene

- **DataGolf er markert blokkert i `docs/COMPLETE-REMAINING-PLAN.md` §2.4 (D-W2-5: «[ANDERS] PR-F plassering først»).**
  Wireframen tegner *visningen*; hvor DataGolf hører hjemme i nav/Analyse er ikke avgjort. Ikke kod før PR-F er lukket.
- **Tilstandskrav:** fulgt design-prompten av 08.08 («minst Suksess + Tom»). `HVA-TRENGER-VI-FOR-EKSAKT-SKJERM.md`
  krever fire (suksess/tom/laster/feil) — avviket er bevisst, ikke en forglemmelse. Laster/feil kan legges til på
  alle åtte i én tur hvis firekravet skal gjelde.
- **Primærhandling per flate (den som eier `T.handling` i kode):** Runder → «Start live-føring» · Runde-detalj → ingen ·
  Gameplan → «Start live-føring» (kun tom) · Banekart → ingen · DataGolf → «Start live-føring» (kun tom) ·
  TrackMan-liste → «Importer økt» · TrackMan-detalj → ingen. Ingen av dem er en kontekstuell «Én ting nå» (clay).
- **Gjenstår i W2:** D-W2-6 Talent-undersider · D-W2-7 Hjem-rest (konsolideringsliste først).

## Kvalitetskrav — sjekket per fil

Kun Paper-tokens · maks ingen clay-CTA (ingen av disse 7 har en kontekstuell «Én ting nå») ·
tom-tilstand er en reell datamangel, ikke lorem · `data-od-id` på alle knapper/lenker/rader ·
safe-area på mobil · samme 4-fane PlayerHQ-nav · 430px telefonramme, fyller skjerm under 641px.
