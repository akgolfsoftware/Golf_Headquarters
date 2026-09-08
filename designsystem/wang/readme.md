# designsystem/wang — WANG Toppidrett Fredrikstad, golf

Dette prosjektet er **fasit for /team-wang-flaten** i AK Golf HQ: golfgruppas fellesside for
elever og foreldre, trenerens årsplan og IUP-samtalen. Merkevaren er WANG Designmanual 2021,
allerede tokenisert i `src/styles/wang-tokens.css` i repoet.

## Hva prosjektet er fasit for

| Fil | Gjelder |
|---|---|
| `fasit/arsplan-2026-27/WANG Arsplan 2026-27.dc.html` | **Gjeldende fasit** (levert 25.08.2026). Fellessiden med fire faner: Trening · Skole · Kalender · Foreldre. Mobil 390 og desktop 1280. Redigeres ikke uten ny leveranse fra Anders. |
| `fasit/arsplan-2026-27/design-tokens/` | Token-kopien som fulgte fasitpakken |
| `fasit/SYNC-STATUS.md` | Hvilken fasit som gjelder, og hva som er erstattet |
| `tokens/wang-tokens.css` | Speil av `src/styles/wang-tokens.css`. **Utdatert per 02.09.2026** — mangler seks tokens og ett keyframe. |

Designsystemet flaten bygger på er Claude Design-prosjektet
`be77fcdb-7e1e-4341-aa67-23f21370ad8a` («WANG Toppidrett – Software»): 44 komponenter,
seks token-filer, 17 guideline-kort, `uploads/wang-designmanual-2021.pdf` og ekte
vektorlogoer. Golfskjermene bruker fire av komponentene: `EventChip`, `IconChip`, `Tabs`
og `CalendarView`.

## Hva som er historikk

- `skjermer/`, `komponenter/`, `grunnlag/` — speil av `3935e216` (10.08.2026). Prosjektet
  finnes ikke lenger.
- `fasit/wang-redesign-2026.dc.html` — speil av `6061a53c` (15.08.2026). Prosjektet finnes
  ikke lenger. Dette er det den nåværende koden i `/team-wang/coach` og IUP faktisk er
  bygget etter.
- De ~60 malene i `be77fcdb` (`elev-*`, `trener-*`, `admin-*`, `eier-*`) tilhører den gamle
  multi-idrett-plattformen. Referanse, ikke fasit.

Ved konflikt vinner alltid 25.08-fasiten øverst.

## Vurdering og systemkart (02.09.2026)

- **[Vurdering med skjermregnskap, gap-liste og prioritert batch 1](docs/vurdering-wang-2026-09-02.md)**
  — `docs/vurdering-wang-2026-09-02.md`. 25 funn, hvert med navngitt fil og målt størrelse.
- **[Systemkart — hele flaten på ett sted](templates/wang-systemkart/WangSystemkart.dc.html)**
  — `templates/wang-systemkart/WangSystemkart.dc.html`. Tokens, de fire brukte komponentene,
  alle eksisterende skjermer i to bredder, og de manglende skjermene som tomme rammer.

## Låste rammer

Kun golf. Tre roller: elev · foresatt · trener. Norsk bokmål, du-form. Aldri emoji —
ikonsettet er Lucide. Én lys palett, ingen mørk modus på /team-wang. Mobil 390 først.
Elevene er mindreårige: fellessiden er navnefri, roster og elev-ark finnes kun innlogget.
Vurdering, aldri karakterer. «Sammen lykkes vi.»


## Batch 1 — de tegnede skjermene (02.09.2026)

De ni skjermene fra behovslista er tegnet som forslag i `skjermer-batch1/`. Mobil 390 først,
minst to tilstander hver, delt stilark `skjermer-batch1/skjerm.css` som leser rot-`styles.css`.
Hver fil oppgir rute, datamodell-hull og hvorfor skjermen ser ut som den gjør. Fasitfila
`fasit/arsplan-2026-27/WANG Arsplan 2026-27.dc.html` er urørt.

| Fil | Rute | Behov |
| --- | --- | --- |
| `b1-testdag-foring.html` | `/team-wang/coach/test/[dagId]` | 1 · testing |
| `b2-protokoller.html` | `/team-wang/protokoll` | 1 · testing |
| `b3-resultater-elev.html` | `/team-wang/elev/[id]/tester` | 1 · testing |
| `b4-ukessammendrag.html` | `/team-wang/coach/ukessammendrag` | 2 · deling |
| `b5-dokumenter.html` | `/team-wang/dokumenter` | 2 · deling |
| `b6-statistikk-skinn.html` | `/team-wang/statistikk` | 3 · Train-lock-skinn |
| `b7-turneringer.html` | `/team-wang/turneringer` | 4 · turneringer |
| `b8-elev-ark.html` | `/team-wang/elev/[id]` | 5 · elevene |
| `b9-samlinger.html` | `/team-wang/samlinger` | 6 · samlinger |

Systemkartet (`templates/wang-systemkart/WangSystemkart.dc.html`, rad 6) lenker til hver av dem.


## Batch 2 — de resterende skjermene (07.09.2026)

Med batch 2 finnes hver interne skjerm flaten trenger som tegnet forslag. Samme regler som
batch 1: mobil 390 først, minst to tilstander hver, delt stilark
`skjermer-batch1/skjerm.css`, og datamodell-hullet navngitt i hver fil.

**[Skjermkart — alle 23 skjermer på ett sted](skjermkart.html)** — `skjermkart.html`.
Fasit, batch 1 og batch 2 med rute, behovsnummer og status, samt hva som med vilje
ikke er tegnet.

| Fil | Rute | Hva den løser |
| --- | --- | --- |
| `c1-elevliste.html` | `/team-wang/elever` | 5 · roster med egen rute, flervalg til testdag og uttak |
| `c2-samling-uttak.html` | `/team-wang/samling/[id]` | 6 · uttak med kriterium før navn, elevens visning |
| `c3-okt-detalj.html` | `?fane=kalender&okt=[id]` | Urutet `okt-detalj.tsx` får mål for dagkortets `→` |
| `c4-turnering-detalj.html` | `/team-wang/turnering/[id]` | 4 · gjennomført, kommende, resultat ikke importert |
| `c5-iup-kildelinje.html` | `/team-wang/coach/iup/[elevId]` | 1 · TruthLayer der ekte elevtall faktisk vises |
| `c6-trenerflate.html` | `/team-wang/coach` | B4 tegnet som valg: lesevisning mot redirect |
| `c7-logg-inn.html` | `/team-wang/logg-inn` | Fjerner «Elevens navn»-feltet; hvem ser hva per rolle |
| `c8-systemtilstander.html` | alle ruter | Batch 1 punkt 10 · laster, delvis feil, uten nett, 403 |
| `c9-skole-390.html` | `?fane=skole` | Batch 1 punkt 6 · timeplan uten horisontal scroll |

Kildekoblingen mellom skjerm og repo-fil ligger i `github.md` (`## Screen map`).
