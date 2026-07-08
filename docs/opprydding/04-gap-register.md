# Gap-register — designsystem-mangler under oppryddingen

Løpende liste over komponenter/varianter som mangler i Claude Design-prosjektet og som
skjermene trenger. Claude Code APPENDER nye gap hit per bølge (regel: meld gap, ikke improviser).
Når alle bølger i Fase 4 er ferdige, blir denne lista ÉN samlet gap-fyll-prompt til Claude
Design — vi re-importerer, og lukker gapene i én siste pass. Dette erstatter «Claude
Design-runden» i kjøreboka: den flyttes fra før migreringen til ETTER, som gap-fyll.

Status: ÅPEN (venter) · I-DS (lagt i Claude Design) · LUKKET (portet + tatt i bruk).

## Reframing av de 5 første (min designvurdering)

Ikke fem nye komponenter — **to nye + tre utvidelser**. Speil før du finner opp.

| # | Gap | Brukt | Løsning (anbefalt) | Type | Status |
|---|---|---|---|---|---|
| 1 | Status-prikk | 5 steder (gml `pulse-dot`/`presence-dot`) | NY primitiv `StatusDot`: live/online/prioritet/idle. Bruk `--signal` (flipper forest↔lime automatisk per modus), `--destructive`, `--text-muted` → lime-invarianten løses av tokenene. Puls respekterer `prefers-reduced-motion`. | NY | ÅPEN |
| 2 | Aksefordelings-bar | fordeling FYS/TEK/SLAG/SPILL/TURN | NY primitiv: stablet horisontal bar, 5 segment i `--axis-*`, %-verdier i mono med enhet. Sjekk overlapp mot `TidsPyramide` først — dette er den kompakte 1-bar-varianten, ikke pyramiden. | NY | ÅPEN |
| 3 | Års-gantt for AK-perioder | `/portal/tren/aarsplan` | UTVID `Periodeplan`: la `Phase` godta fritt navngitte perioder (behold L-fase som variant). Gantt-visualen er allerede riktig — kun navnemodellen låser. IKKE ny komponent. | UTVID | ÅPEN |
| 4 | «År» i VisningsVelger | kalender-visningsbytte | UTVID `VisningsVelger`: legg `År` som gyldig `KalenderVisning`. Triviell. | UTVID | ÅPEN |
| 5 | Warn-variant på Tag | gul/oransje status | UTVID `Tag`: `warn`-variant via `--warning`-token (finnes i v14). Triviell. | UTVID | ÅPEN |

## Bølge 2 — /portal
Ingen NYE komponent-gap — alt skjermene trengte fantes i DS-prosjektet (PercentileBar,
NivaStige og Stepper er nå portet til golfdata/). Tre observasjoner til protokollen:

| # | Observasjon | Vurdering | Status |
|---|---|---|---|
| 6 | Plan-mappingen «JourneyMap→KategoriStige» passer ikke semantisk: JourneyMap er en 5-stegs reise-strip (Klubb→Tour), KategoriStige er A–K-tabellen med TidsPyramide-avhengighet og full kategoridata siden ikke har. Brukte DS `Stepper` (semantisk riktig, portet). KategoriStige hører til når ekte A–K-data kobles post-BETA. | AVVIK FRA PLAN, dokumentert | LUKKET |
| 7 | `Card.title`-typen i lokal port kolliderer med HTML-attributtet `title` (string) — ReactNode-titler avvises av TS. Bør fikses i porten (Omit<"title"> fra HTMLAttributes). | PORT-BUG (lokal, ikke DS) | ÅPEN |
| 8 | `src/lib/portal-hjem/hjem-data.ts` er død kode (null konsumenter) med gammel-athletic-typeimport — kandidat for sletting i Fase 5, blokkerer ellers slettingen av gamle `pyramid-progress`. | DØD KODE | ÅPEN |

## Bølge 3 — /admin
(Claude Code appender nye gap her)

## Bølge 4 — marketing + forelder
(Claude Code appender nye gap her)
